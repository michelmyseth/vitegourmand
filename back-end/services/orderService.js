// Orders: creation (KAN-51), customer edits (KAN-53), employee workflow (KAN-61, KAN-62)
const { withTransaction } = require('../config/db');
const orderRepository = require('../repositories/orderRepository');
const menuRepository = require('../repositories/menuRepository');
const { computeOrderPrice } = require('../utils/pricing');
const { deliveryFor } = require('./geoService');
const statsService = require('./statsService');
const { mails } = require('./mailService');
const reviewRepository = require('../repositories/reviewRepository');
const { validator } = require('../utils/validate');
const { badRequest, conflict, notFound } = require('../utils/httpError');

/** Tomorrow, 'YYYY-MM-DD' (Paris time): earliest possible event date */
function tomorrow() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(d);
}

/** Reads and checks the event fields of an order form (everything except the menu) */
function readEventFields(body) {
  const v = validator(body);
  const fields = {
    people: v.int('people', { min: 1, max: 1000, message: 'Nombre de personnes invalide.' }),
    address: v.required('address', "L'adresse de l'événement est obligatoire.", 255),
    postcode: v.postcode('postcode'),
    city: v.required('city', 'La ville est obligatoire.', 100),
    date: v.date('date', 'Date invalide.'),
    time: v.time('time', 'Heure invalide.'),
    place: v.optional('place', 300),
  };
  if (!v.errors.date && fields.date < tomorrow()) v.error('date', 'Choisissez une date à partir de demain.');
  return { v, fields };
}

/** Distance and prices, always computed by the server */
async function quote(menu, fields) {
  const delivery = await deliveryFor(fields);
  return {
    deliveryKm: delivery.km,
    // Official city / postcode returned by the address service
    city: delivery.city || fields.city,
    postcode: delivery.postcode || fields.postcode,
    ...computeOrderPrice(menu, fields.people, delivery),
  };
}

async function createOrder(user, body) {
  const { v, fields } = readEventFields(body);
  const menuId = v.int('menuId', { min: 1, message: 'Choisissez un menu.' });
  v.throwIfErrors();

  // Geocoding is slow: done before the transaction, then the stock is checked under lock
  const preMenu = await menuRepository.findById(menuId);
  if (!preMenu) throw badRequest("Ce menu n'existe pas.", { menuId: "Ce menu n'existe pas." });
  const delivery = await deliveryFor(fields);

  const order = await withTransaction(async (client) => {
    // FOR UPDATE: two orders on the last menu in stock cannot both succeed
    const menu = await menuRepository.findForOrder(menuId, client);
    if (!menu || !menu.isActive) throw badRequest("Ce menu n'est plus disponible.", { menuId: "Ce menu n'est plus disponible." });
    if (menu.stock <= 0) throw conflict("Ce menu n'est plus disponible (stock épuisé).", { menuId: 'Stock épuisé.' });
    if (fields.people < menu.minPeople) {
      throw badRequest('Nombre de personnes insuffisant.', {
        people: `Le nombre de personnes doit être d'au moins ${menu.minPeople}.`,
      });
    }

    const prices = computeOrderPrice(menu, fields.people, delivery);
    const id = await orderRepository.create({
      ...fields,
      ...prices,
      city: delivery.city || fields.city,
      postcode: delivery.postcode || fields.postcode,
      deliveryKm: delivery.km,
      orderNumber: await orderRepository.nextOrderNumber(client),
      userId: user.id,
      menuId,
      equipmentLoan: false,
    }, client);

    await menuRepository.changeStock(menuId, -1, client);
    await orderRepository.addHistory(id, 'pending', { changedBy: user.id }, client);
    return orderRepository.findById(id, {}, client);
  });

  // After the commit: statistics and email never cancel the order
  statsService.recordOrder(order);
  mails.orderConfirmation(user, order);
  return order;
}

// ---------------------------------------------------------------
// Customer area (KAN-52, KAN-54)
// ---------------------------------------------------------------

const listMyOrders = (user) => orderRepository.findByUser(user.id);

/** An order of the customer, with its status history. 404 for someone else's order. */
async function getMyOrder(user, orderId) {
  const order = await orderRepository.findById(orderId);
  if (!order || order.userId !== user.id) throw notFound('Commande introuvable.');
  order.history = await orderRepository.findHistory(orderId);
  order.review = order.reviewId ? await reviewRepository.findByOrder(orderId) : null;
  return order;
}

// ---------------------------------------------------------------
// Edit / cancel (KAN-53 for the customer, KAN-62 for the employees)
// ---------------------------------------------------------------

/**
 * Changes the event of an order (everything except the menu) and recomputes the price.
 * `check(order)` throws if the actor may not edit this order.
 * `log` = { contactMethod, reason } written in the history (employees).
 */
async function editOrder(orderId, body, actor, check, log = null) {
  const { v, fields } = readEventFields(body);
  v.throwIfErrors();

  const current = await orderRepository.findById(orderId);
  check(current);
  const menu = await menuRepository.findForOrderReadOnly(current.menuId);
  if (fields.people < menu.minPeople) {
    throw badRequest('Nombre de personnes insuffisant.', {
      people: `Le nombre de personnes doit être d'au moins ${menu.minPeople}.`,
    });
  }
  const prices = await quote(menu, fields);

  const order = await withTransaction(async (client) => {
    const locked = await orderRepository.findById(orderId, { forUpdate: true }, client);
    check(locked); // the status may have changed meanwhile
    await orderRepository.updateEvent(orderId, { ...fields, ...prices }, client);
    if (log) {
      await orderRepository.addHistory(orderId, locked.status, {
        changedBy: actor.id, contactMethod: log.contactMethod, reason: `Modification : ${log.reason}`,
      }, client);
    }
    return orderRepository.findById(orderId, {}, client);
  });

  if (order.totalPrice !== current.totalPrice && order.status !== 'cancelled') {
    statsService.changeOrderTotal(order, current.totalPrice);
  }
  return order;
}

/** Cancels an order: the menu goes back in stock and leaves the statistics */
async function cancelOrder(orderId, actor, check, log = {}) {
  const order = await withTransaction(async (client) => {
    const locked = await orderRepository.findById(orderId, { forUpdate: true }, client);
    check(locked);
    await orderRepository.updateStatus(orderId, 'cancelled', client);
    await menuRepository.changeStock(locked.menuId, 1, client);
    await orderRepository.addHistory(orderId, 'cancelled', {
      changedBy: actor.id, contactMethod: log.contactMethod || null, reason: log.reason || null,
    }, client);
    return orderRepository.findById(orderId, {}, client);
  });
  statsService.cancelOrder(order);
  return order;
}

/** The customer may only edit / cancel their own order while it is not accepted */
function customerCheck(user) {
  return (order) => {
    if (!order || order.userId !== user.id) throw notFound('Commande introuvable.');
    if (order.status === 'cancelled') throw conflict('Cette commande est déjà annulée.');
    if (order.status !== 'pending') {
      throw conflict('Cette commande a déjà été acceptée : elle ne peut plus être modifiée ni annulée. Contactez-nous.');
    }
  };
}

const editMyOrder = (user, orderId, body) => editOrder(orderId, body, user, customerCheck(user));
const cancelMyOrder = (user, orderId) => cancelOrder(orderId, user, customerCheck(user));

module.exports = {
  createOrder, listMyOrders, getMyOrder, editMyOrder, cancelMyOrder,
  editOrder, cancelOrder, readEventFields, quote, tomorrow,
};
