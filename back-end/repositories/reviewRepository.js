// Customer reviews (parameterized SQL only)
const { query } = require('../config/db');

const REVIEW_FIELDS = `
  r.review_id AS id, r.order_id AS "orderId", r.rating, r.comment, r.status,
  r.created_at AS "createdAt", r.moderated_at AS "moderatedAt"`;

async function create({ orderId, userId, rating, comment }) {
  const { rows } = await query(
    `INSERT INTO review (order_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)
     RETURNING review_id AS id, order_id AS "orderId", rating, comment, status, created_at AS "createdAt"`,
    [orderId, userId, rating, comment]
  );
  return rows[0];
}

async function findByOrder(orderId) {
  const { rows } = await query(`SELECT ${REVIEW_FIELDS} FROM review r WHERE r.order_id = $1`, [orderId]);
  return rows[0] || null;
}

module.exports = { REVIEW_FIELDS, create, findByOrder };
