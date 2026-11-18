// Orders seen by employees: list with filters (KAN-60), status workflow (KAN-61),
// edit / cancel after contacting the customer (KAN-62)
const orderRepository = require('../repositories/orderRepository');
const reviewRepository = require('../repositories/reviewRepository');
const { badRequest, notFound } = require('../utils/httpError');

const STATUSES = [
  'pending', 'accepted', 'preparing', 'delivering', 'delivered',
  'awaiting_equipment_return', 'completed', 'cancelled',
];

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
  return order;
}

module.exports = { STATUSES, listOrders, getOrder };
