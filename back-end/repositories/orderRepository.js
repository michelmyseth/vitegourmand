// Data access for orders and their status history (parameterized SQL only)
const { query } = require('../config/db');

const ORDER_FIELDS = `
  o.order_id AS id, o.order_number AS "orderNumber", o.user_id AS "userId", o.menu_id AS "menuId",
  m.title AS "menuTitle", m.min_people AS "menuMinPeople", o.people,
  o.event_address AS address, o.event_postcode AS postcode, o.event_city AS city,
  o.event_date AS date, to_char(o.event_time, 'HH24:MI') AS time, o.place_details AS place,
  o.delivery_km AS "deliveryKm", o.menu_price AS "menuPrice", o.discount,
  o.delivery_price AS "deliveryPrice", o.total_price AS "totalPrice", o.status,
  o.equipment_loan AS "equipmentLoan", o.equipment_returned AS "equipmentReturned",
  o.created_at AS "createdAt", o.updated_at AS "updatedAt",
  (SELECT r.review_id FROM review r WHERE r.order_id = o.order_id) AS "reviewId"`;

const CUSTOMER_FIELDS = `
  u.last_name AS "customerLastName", u.first_name AS "customerFirstName",
  u.email AS "customerEmail", u.phone AS "customerPhone"`;

const ORDER_FROM = `
  FROM customer_order o
  JOIN menu m USING (menu_id)
  JOIN app_user u ON u.user_id = o.user_id`;

/** Next number of the year, e.g. VG-2026-0008. The advisory lock avoids duplicates. */
async function nextOrderNumber(db) {
  await query("SELECT pg_advisory_xact_lock(hashtext('customer_order.order_number'))", [], db);
  const year = new Date().getFullYear();
  const { rows } = await query(
    `SELECT coalesce(max(substring(order_number FROM 9)::int), 0) + 1 AS n
     FROM customer_order WHERE order_number LIKE $1`,
    [`VG-${year}-%`],
    db
  );
  return `VG-${year}-${String(rows[0].n).padStart(4, '0')}`;
}

async function create(o, db) {
  const { rows } = await query(
    `INSERT INTO customer_order (
       order_number, user_id, menu_id, people, event_address, event_postcode, event_city,
       event_date, event_time, place_details, delivery_km,
       menu_price, discount, delivery_price, total_price, equipment_loan)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING order_id AS id`,
    [o.orderNumber, o.userId, o.menuId, o.people, o.address, o.postcode, o.city,
      o.date, o.time, o.place, o.deliveryKm,
      o.menuPrice, o.discount, o.deliveryPrice, o.totalPrice, o.equipmentLoan],
    db
  );
  return rows[0].id;
}

async function addHistory(orderId, status, { changedBy = null, contactMethod = null, reason = null } = {}, db) {
  await query(
    `INSERT INTO order_status_history (order_id, status, changed_by, contact_method, reason)
     VALUES ($1, $2, $3, $4, $5)`,
    [orderId, status, changedBy, contactMethod, reason],
    db
  );
}

async function findById(id, { forUpdate = false } = {}, db) {
  const { rows } = await query(
    `SELECT ${ORDER_FIELDS}, ${CUSTOMER_FIELDS} ${ORDER_FROM}
     WHERE o.order_id = $1 ${forUpdate ? 'FOR UPDATE OF o' : ''}`,
    [id],
    db
  );
  return rows[0] || null;
}

async function findHistory(orderId, db) {
  const { rows } = await query(
    `SELECT h.status, h.changed_at AS "changedAt", h.contact_method AS "contactMethod", h.reason,
            CASE WHEN e.user_id IS NOT NULL THEN e.first_name || ' ' || e.last_name END AS "changedBy"
     FROM order_status_history h
     LEFT JOIN app_user e ON e.user_id = h.changed_by
     WHERE h.order_id = $1
     ORDER BY h.changed_at, h.history_id`,
    [orderId],
    db
  );
  return rows;
}

async function findByUser(userId) {
  const { rows } = await query(
    `SELECT ${ORDER_FIELDS} ${ORDER_FROM} WHERE o.user_id = $1 ORDER BY o.created_at DESC`,
    [userId]
  );
  return rows;
}

async function updateEvent(id, o, db) {
  await query(
    `UPDATE customer_order SET
       people = $2, event_address = $3, event_postcode = $4, event_city = $5,
       event_date = $6, event_time = $7, place_details = $8, delivery_km = $9,
       menu_price = $10, discount = $11, delivery_price = $12, total_price = $13, updated_at = now()
     WHERE order_id = $1`,
    [id, o.people, o.address, o.postcode, o.city, o.date, o.time, o.place, o.deliveryKm,
      o.menuPrice, o.discount, o.deliveryPrice, o.totalPrice],
    db
  );
}

async function updateStatus(id, status, db) {
  await query('UPDATE customer_order SET status = $2, updated_at = now() WHERE order_id = $1', [id, status], db);
}

module.exports = {
  updateEvent, updateStatus,
  ORDER_FIELDS, CUSTOMER_FIELDS, ORDER_FROM, nextOrderNumber, create, addHistory, findById, findHistory, findByUser,
};
