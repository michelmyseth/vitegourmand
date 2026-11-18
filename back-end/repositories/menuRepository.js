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
    params
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
    db
  );
  const menu = rows[0];
  if (!menu) return null;

  const [images, dishes] = await Promise.all([
    query(
      `SELECT image_id AS id, url, alt_text AS alt, position FROM menu_image
       WHERE menu_id = $1 ORDER BY position`,
      [id],
      db
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
      db
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

module.exports = { findAll, findById, MENU_FIELDS, MENU_FROM };
