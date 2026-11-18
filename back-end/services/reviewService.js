// Reviews: written by customers (KAN-56), moderated by employees (KAN-63)
const reviewRepository = require('../repositories/reviewRepository');
const orderRepository = require('../repositories/orderRepository');
const { validator } = require('../utils/validate');
const { notFound, conflict } = require('../utils/httpError');

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

module.exports = { createReview };
