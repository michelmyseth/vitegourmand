// Data access for menus, their images and their dishes (parameterized SQL only)
const { query } = require('../config/db');

const MENU_FIELDS = `
  m.menu_id AS id, m.title, m.description, m.min_people AS "minPeople", m.min_price AS price,
  m.conditions, m.stock, m.is_active AS "isActive",
  m.theme_id AS "themeId", t.label AS theme, m.diet_id AS "dietId", d.label AS diet`;

const MENU_FROM = `
  FROM menu m
  JOIN theme t USING (theme_id)
  JOIN diet d USING (diet_id)`;

/**
 * Menus matching the filters. Each filter adds a "$n" placeholder: the values
 * are never written into the SQL text.
 */
async function findAll({ maxPrice, minPrice, themeId, dietId, minPeople, includeInactive = false } = {}) {
  const where = [];
  const params = [];
  const add = (sql, value) => {
    params.push(value);
    where.push(sql.replace('?', `$${params.length}`));
  };

  if (!includeInactive) where.push('m.is_active');
  if (maxPrice !== undefined) add('m.min_price <= ?', maxPrice);
  if (minPrice !== undefined) add('m.min_price >= ?', minPrice);
  if (themeId !== undefined) add('m.theme_id = ?', themeId);
  if (dietId !== undefined) add('m.diet_id = ?', dietId);
  if (minPeople !== undefined) add('m.min_people >= ?', minPeople);

  const { rows } = await query(
    `SELECT ${MENU_FIELDS},
            (SELECT url FROM menu_image i WHERE i.menu_id = m.menu_id ORDER BY position LIMIT 1) AS image
     ${MENU_FROM}
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY m.min_price, m.title`,
    params,
  );
  return rows;
}

/** Menu with its images and dishes (grouped by course, with allergens) */
async function findById(id, { includeInactive = false, forUpdate = false } = {}, db) {
  const { rows } = await query(
    `SELECT ${MENU_FIELDS} ${MENU_FROM}
     WHERE m.menu_id = $1 ${includeInactive ? '' : 'AND m.is_active'}
     ${forUpdate ? 'FOR UPDATE OF m' : ''}`,
    [id],
    db,
  );
  const menu = rows[0];
  if (!menu) return null;

  const [images, dishes] = await Promise.all([
    query(
      `SELECT image_id AS id, url, alt_text AS alt, position FROM menu_image
       WHERE menu_id = $1 ORDER BY position`,
      [id],
      db,
    ),
    query(
      `SELECT di.dish_id AS id, di.name, di.course, di.description,
              coalesce(array_agg(a.label ORDER BY a.label) FILTER (WHERE a.label IS NOT NULL), '{}') AS allergens
       FROM menu_dish md
       JOIN dish di USING (dish_id)
       LEFT JOIN dish_allergen da USING (dish_id)
       LEFT JOIN allergen a USING (allergen_id)
       WHERE md.menu_id = $1
       GROUP BY di.dish_id
       ORDER BY di.name`,
      [id],
      db,
    ),
  ]);

  menu.images = images.rows;
  menu.dishes = {
    starters: dishes.rows.filter((d) => d.course === 'starter'),
    mains: dishes.rows.filter((d) => d.course === 'main'),
    desserts: dishes.rows.filter((d) => d.course === 'dessert'),
  };
  return menu;
}

/** Locks the menu row (concurrent orders wait) and returns what an order needs */
async function findForOrder(id, db) {
  const { rows } = await query(
    `SELECT menu_id AS id, title, min_people AS "minPeople", min_price AS price, stock,
            is_active AS "isActive", theme_id AS "themeId"
     FROM menu WHERE menu_id = $1 FOR UPDATE`,
    [id],
    db,
  );
  return rows[0] || null;
}

/** Same as findForOrder, without lock */
async function findForOrderReadOnly(id, db) {
  const { rows } = await query(
    `SELECT menu_id AS id, title, min_people AS "minPeople", min_price AS price, stock, is_active AS "isActive"
     FROM menu WHERE menu_id = $1`,
    [id],
    db,
  );
  return rows[0] || null;
}

async function changeStock(id, delta, db) {
  await query('UPDATE menu SET stock = stock + $2, updated_at = now() WHERE menu_id = $1', [id, delta], db);
}

// ---------------------------------------------------------------
// Employee management (KAN-57)
// ---------------------------------------------------------------

async function titleExists(title, exceptId = null) {
  const { rows } = await query('SELECT 1 FROM menu WHERE lower(title) = lower($1) AND menu_id IS DISTINCT FROM $2', [
    title,
    exceptId,
  ]);
  return rows.length > 0;
}

async function create(m, db) {
  const { rows } = await query(
    `INSERT INTO menu (title, description, theme_id, diet_id, min_people, min_price, conditions, stock, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING menu_id AS id`,
    [m.title, m.description, m.themeId, m.dietId, m.minPeople, m.price, m.conditions, m.stock, m.isActive],
    db,
  );
  return rows[0].id;
}

async function update(id, m, db) {
  const { rowCount } = await query(
    `UPDATE menu SET title = $2, description = $3, theme_id = $4, diet_id = $5, min_people = $6,
       min_price = $7, conditions = $8, stock = $9, is_active = $10, updated_at = now()
     WHERE menu_id = $1`,
    [id, m.title, m.description, m.themeId, m.dietId, m.minPeople, m.price, m.conditions, m.stock, m.isActive],
    db,
  );
  return rowCount > 0;
}

/** Replaces the dishes of a menu */
async function setDishes(id, dishIds, db) {
  await query('DELETE FROM menu_dish WHERE menu_id = $1', [id], db);
  if (dishIds.length) {
    await query('INSERT INTO menu_dish (menu_id, dish_id) SELECT $1, unnest($2::int[])', [id, dishIds], db);
  }
}

async function hasOrders(id) {
  const { rows } = await query('SELECT 1 FROM customer_order WHERE menu_id = $1 LIMIT 1', [id]);
  return rows.length > 0;
}

async function remove(id) {
  await query('DELETE FROM menu WHERE menu_id = $1', [id]);
}

async function deactivate(id) {
  await query('UPDATE menu SET is_active = FALSE, updated_at = now() WHERE menu_id = $1', [id]);
}

async function addImage(menuId, url, alt) {
  const { rows } = await query(
    `INSERT INTO menu_image (menu_id, url, alt_text, position)
     SELECT $1, $2, $3, coalesce(max(position), 0) + 1 FROM menu_image WHERE menu_id = $1
     RETURNING image_id AS id, url, alt_text AS alt, position`,
    [menuId, url, alt],
  );
  return rows[0];
}

async function removeImage(menuId, imageId) {
  const { rows } = await query('DELETE FROM menu_image WHERE menu_id = $1 AND image_id = $2 RETURNING url', [
    menuId,
    imageId,
  ]);
  return rows[0] || null;
}

async function imageUrls(menuId) {
  const { rows } = await query('SELECT url FROM menu_image WHERE menu_id = $1', [menuId]);
  return rows.map((r) => r.url);
}

module.exports = {
  findAll,
  findById,
  findForOrder,
  findForOrderReadOnly,
  changeStock,
  titleExists,
  create,
  update,
  setDishes,
  hasOrders,
  remove,
  deactivate,
  addImage,
  removeImage,
  imageUrls,
  MENU_FIELDS,
  MENU_FROM,
};
