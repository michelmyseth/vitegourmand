// Orders seen by employees: list with filters (KAN-60), status workflow (KAN-61),
// edit / cancel after contacting the customer (KAN-62)
const orderRepository = require('../repositories/orderRepository');
const reviewRepository = require('../repositories/reviewRepository');
const { withTransaction } = require('../config/db');
const orderService = require('./orderService');
const { validator } = require('../utils/validate');
const { mails } = require('./mailService');
const { badRequest, notFound, conflict } = require('../utils/httpError');

const STATUSES = [
  'pending', 'accepted', 'preparing', 'delivering', 'delivered',
  'awaiting_equipment_return', 'completed', 'cancelled',
];

// Allowed changes of status (KAN-61). Cancelling is done separately (KAN-62).
const NEXT_STATUSES = {
  pending: ['accepted'],
  accepted: ['preparing'],
  preparing: ['delivering'],
  delivering: ['delivered'],
  delivered: ['awaiting_equipment_return', 'completed'],
  awaiting_equipment_return: ['completed'],
  completed: [],
  cancelled: [],
};

const LABELS = {
  pending: 'En attente', accepted: 'Acceptée', preparing: 'En préparation', delivering: 'En cours de livraison',
  delivered: 'Livrée', awaiting_equipment_return: 'En attente du retour de matériel', completed: 'Terminée',
  cancelled: 'Annulée',
};

const withNext = (order) => ({ ...order, nextStatuses: NEXT_STATUSES[order.status] });

function listOrders(q = {}) {
  const status = typeof q.status === 'string' && q.status ? q.status : undefined;
  if (status && !STATUSES.includes(status)) throw badRequest('Statut inconnu');
  const customer = typeof q.customer === 'string' ? q.customer.trim().slice(0, 100) : '';
  return orderRepository.findAllForStaff({ status, customer: customer || undefined });
}

async function getOrder(id) {
  const order = await orderRepository.findById(id);
  if (!order) throw notFound('Commande introuvable.');
  order.history = await orderRepository.findHistory(id);
  order.review = order.reviewId ? await reviewRepository.findByOrder(id) : null;
  return withNext(order);
}

/** Changes the status; each change is written in the history with date/time and employee */
async function changeStatus(actor, id, body) {
  const status = typeof body.status === 'string' ? body.status : '';
  if (!STATUSES.includes(status)) throw badRequest('Statut inconnu');

  const order = await withTransaction(async (client) => {
    const current = await orderRepository.findById(id, { forUpdate: true }, client);
    if (!current) throw notFound('Commande introuvable.');
    if (!NEXT_STATUSES[current.status].includes(status)) {
      throw conflict(`Impossible de passer du statut « ${LABELS[current.status]} » à « ${LABELS[status]} ».`);
    }

    await orderRepository.updateStatus(id, status, client);
    if (status === 'awaiting_equipment_return') await orderRepository.setEquipment(id, { loan: true }, client);
    if (current.status === 'awaiting_equipment_return' && status === 'completed') {
      await orderRepository.setEquipment(id, { returned: true }, client);
    }
    await orderRepository.addHistory(id, status, { changedBy: actor.id }, client);
    return orderRepository.findById(id, {}, client);
  });

  // Emails to the customer (KAN-71)
  if (status === 'awaiting_equipment_return') mails.equipmentReturn(order);
  if (status === 'completed') mails.orderCompleted(order);
  return getOrder(order.id);
}

// ---------------------------------------------------------------
// KAN-62: before editing or cancelling, the employee must have contacted the
// customer and enter the contact method (phone / email) and the reason
// ---------------------------------------------------------------

const EDITABLE = ['pending', 'accepted', 'preparing'];

function readContact(body) {
  const v = validator(body);
  const log = {
    contactMethod: v.oneOf('contactMethod', ['phone', 'email'], 'Indiquez comment le client a été contacté.'),
    reason: v.required('reason', 'Le motif est obligatoire.', 500),
  };
  return { v, log };
}

function staffCheck(order) {
  if (!order) throw notFound('Commande introuvable.');
  if (!EDITABLE.includes(order.status)) {
    throw conflict(`Une commande « ${LABELS[order.status]} » ne peut plus être modifiée ni annulée.`);
  }
}

async function editOrder(actor, id, body) {
  const { v, log } = readContact(body);
  v.throwIfErrors();
  await orderService.editOrder(id, body, actor, staffCheck, log);
  return getOrder(id);
}

async function cancelOrder(actor, id, body) {
  const { v, log } = readContact(body);
  v.throwIfErrors();
  await orderService.cancelOrder(id, actor, staffCheck, log);
  return getOrder(id);
}

module.exports = { STATUSES, NEXT_STATUSES, listOrders, getOrder, changeStatus, editOrder, cancelOrder };
