// Reviews: written by customers (KAN-56), moderated by employees (KAN-63)
const reviewRepository = require('../repositories/reviewRepository');
const orderRepository = require('../repositories/orderRepository');
const { validator } = require('../utils/validate');
const { notFound, conflict, badRequest } = require('../utils/httpError');

/** Only on a completed order of the customer, and only once */
async function createReview(user, orderId, body) {
  const v = validator(body);
  const rating = v.int('rating', { min: 1, max: 5, message: 'Choisissez une note de 1 à 5.' });
  const comment = v.required('comment', 'Le commentaire est obligatoire.', 1000);
  v.throwIfErrors();

  const order = await orderRepository.findById(orderId);
  if (!order || order.userId !== user.id) throw notFound('Commande introuvable.');
  if (order.status !== 'completed') throw conflict('Vous pourrez donner votre avis une fois la commande terminée.');
  if (order.reviewId) throw conflict('Vous avez déjà donné votre avis sur cette commande.');

  // The UNIQUE constraint on review.order_id also protects against a double submit
  return reviewRepository.create({ orderId, userId: user.id, rating, comment });
}

const listApproved = () => reviewRepository.findApproved();

function listForModeration(q = {}) {
  const status = typeof q.status === 'string' && q.status ? q.status : null;
  if (status && !['pending', 'approved', 'rejected'].includes(status)) throw badRequest('Statut inconnu');
  return reviewRepository.findForModeration(status);
}

/** Approve or reject (KAN-63): only approved reviews are shown on the home page */
async function moderate(actor, id, body) {
  const status = body?.status;
  if (!['approved', 'rejected'].includes(status)) throw badRequest('Choisissez de valider ou de refuser l’avis.');
  const review = await reviewRepository.moderate(id, status, actor.id);
  if (!review) throw notFound('Avis introuvable.');
  return review;
}

module.exports = { createReview, listApproved, listForModeration, moderate };
