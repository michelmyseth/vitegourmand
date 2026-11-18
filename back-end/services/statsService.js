// MongoDB statistics: orders and revenue per menu (KAN-30).
// Cancelled orders are not counted. Called by the order service after each
// change; a statistics error never cancels an order (it is only logged).
const MenuStat = require('../models/MenuStat');
const { query } = require('../config/db');

const round2 = (n) => Math.round(n * 100) / 100;

/** Day of an order in the company's time zone, 'YYYY-MM-DD' */
function orderDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date(date));
}

/** Adds (or removes, with negative values) orders and revenue to a menu and a day */
async function apply({ menuId, menuTitle, date, orders, revenue }) {
  const day = orderDay(date);
  await MenuStat.updateOne(
    { menuId },
    { $set: { menuTitle }, $inc: { ordersCount: orders, revenue } },
    { upsert: true }
  );
  const res = await MenuStat.updateOne(
    { menuId, 'byDay.date': day },
    { $inc: { 'byDay.$.orders': orders, 'byDay.$.revenue': revenue } }
  );
  if (res.matchedCount === 0) {
    await MenuStat.updateOne({ menuId }, { $push: { byDay: { date: day, orders, revenue } } });
  }
}

function safely(promise) {
  return promise.catch((err) => console.error('MongoDB statistics not updated:', err.message));
}

/** New order */
const recordOrder = (order) =>
  safely(apply({ menuId: order.menuId, menuTitle: order.menuTitle, date: order.createdAt, orders: 1, revenue: order.totalPrice }));

/** Order cancelled: it no longer counts */
const cancelOrder = (order) =>
  safely(apply({ menuId: order.menuId, menuTitle: order.menuTitle, date: order.createdAt, orders: -1, revenue: -order.totalPrice }));

/** Order edited: only the price difference changes the revenue */
const changeOrderTotal = (order, oldTotal) =>
  safely(apply({ menuId: order.menuId, menuTitle: order.menuTitle, date: order.createdAt, orders: 0, revenue: round2(order.totalPrice - oldTotal) }));

/** Menu renamed: keep the title of the statistics up to date */
const renameMenu = (menuId, menuTitle) => safely(MenuStat.updateOne({ menuId }, { $set: { menuTitle } }));

/**
 * Rebuilds the whole collection from PostgreSQL (used at start-up when the
 * collection is empty, e.g. after loading seed.sql, and by `npm run stats:rebuild`).
 */
async function rebuildFromSql() {
  const { rows } = await query(
    `SELECT m.menu_id AS "menuId", m.title AS "menuTitle",
            to_char(o.created_at AT TIME ZONE 'Europe/Paris', 'YYYY-MM-DD') AS date,
            count(*)::int AS orders, sum(o.total_price) AS revenue
     FROM customer_order o JOIN menu m USING (menu_id)
     WHERE o.status <> 'cancelled'
     GROUP BY m.menu_id, m.title, date
     ORDER BY date`
  );

  const docs = new Map();
  for (const r of rows) {
    if (!docs.has(r.menuId)) {
      docs.set(r.menuId, { menuId: r.menuId, menuTitle: r.menuTitle, ordersCount: 0, revenue: 0, byDay: [] });
    }
    const doc = docs.get(r.menuId);
    doc.ordersCount += r.orders;
    doc.revenue = round2(doc.revenue + r.revenue);
    doc.byDay.push({ date: r.date, orders: r.orders, revenue: round2(r.revenue) });
  }

  await MenuStat.deleteMany({});
  if (docs.size) await MenuStat.insertMany([...docs.values()]);
  return docs.size;
}

async function rebuildIfEmpty() {
  if ((await MenuStat.estimatedDocumentCount()) === 0) {
    const count = await rebuildFromSql();
    console.log(`MongoDB statistics built from PostgreSQL (${count} menus)`);
  }
}

/**
 * Orders and revenue per menu, optionally filtered by menu and period
 * (dates 'YYYY-MM-DD', inclusive). Used by the admin dashboard (KAN-67, KAN-68).
 */
async function menuStats({ menuId, from, to } = {}) {
  const dayMatch = {};
  if (from) dayMatch.$gte = from;
  if (to) dayMatch.$lte = to;

  const pipeline = [];
  if (menuId) pipeline.push({ $match: { menuId } });
  pipeline.push({ $unwind: '$byDay' });
  if (from || to) pipeline.push({ $match: { 'byDay.date': dayMatch } });
  pipeline.push(
    {
      $group: {
        _id: '$menuId',
        menuTitle: { $first: '$menuTitle' },
        orders: { $sum: '$byDay.orders' },
        revenue: { $sum: '$byDay.revenue' },
      },
    },
    { $sort: { revenue: -1 } }
  );

  const rows = await MenuStat.aggregate(pipeline);
  return rows
    .map((r) => ({ menuId: r._id, menuTitle: r.menuTitle, orders: r.orders, revenue: round2(r.revenue) }))
    .filter((r) => r.orders !== 0 || r.revenue !== 0);
}

module.exports = { recordOrder, cancelOrder, changeOrderTotal, renameMenu, rebuildFromSql, rebuildIfEmpty, menuStats, orderDay };
