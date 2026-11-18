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

/** Approved reviews for the home page: first name + initial only (data minimization) */
async function findApproved(limit = 20) {
  const { rows } = await query(
    `SELECT r.review_id AS id, r.rating, r.comment, r.created_at AS "createdAt",
            u.first_name || ' ' || left(u.last_name, 1) || '.' AS author, m.title AS "menuTitle"
     FROM review r
     JOIN app_user u ON u.user_id = r.user_id
     JOIN customer_order o ON o.order_id = r.order_id
     JOIN menu m ON m.menu_id = o.menu_id
     WHERE r.status = 'approved'
     ORDER BY r.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

/** Employee list, optionally filtered by status */
async function findForModeration(status) {
  const { rows } = await query(
    `SELECT ${REVIEW_FIELDS}, o.order_number AS "orderNumber", m.title AS "menuTitle",
            u.first_name || ' ' || u.last_name AS author,
            CASE WHEN e.user_id IS NOT NULL THEN e.first_name || ' ' || e.last_name END AS "moderatedBy"
     FROM review r
     JOIN app_user u ON u.user_id = r.user_id
     JOIN customer_order o ON o.order_id = r.order_id
     JOIN menu m ON m.menu_id = o.menu_id
     LEFT JOIN app_user e ON e.user_id = r.moderated_by
     WHERE $1::varchar IS NULL OR r.status = $1
     ORDER BY (r.status = 'pending') DESC, r.created_at DESC`,
    [status || null]
  );
  return rows;
}

async function moderate(id, status, moderatorId) {
  const { rows } = await query(
    `UPDATE review SET status = $2, moderated_by = $3, moderated_at = now()
     WHERE review_id = $1 RETURNING review_id AS id, status`,
    [id, status, moderatorId]
  );
  return rows[0] || null;
}

module.exports = { REVIEW_FIELDS, create, findByOrder, findApproved, findForModeration, moderate };
