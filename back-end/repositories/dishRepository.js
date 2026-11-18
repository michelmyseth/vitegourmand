// Dishes and their allergens (parameterized SQL only)
const { query } = require('../config/db');

const DISH_SELECT = `
  SELECT d.dish_id AS id, d.name, d.course, d.description,
         coalesce(array_agg(DISTINCT a.allergen_id) FILTER (WHERE a.allergen_id IS NOT NULL), '{}') AS "allergenIds",
         coalesce(array_agg(DISTINCT a.label) FILTER (WHERE a.label IS NOT NULL), '{}') AS allergens,
         count(DISTINCT md.menu_id)::int AS "menuCount"
  FROM dish d
  LEFT JOIN dish_allergen da USING (dish_id)
  LEFT JOIN allergen a USING (allergen_id)
  LEFT JOIN menu_dish md USING (dish_id)`;

async function findAll() {
  const { rows } = await query(
    `${DISH_SELECT} GROUP BY d.dish_id
     ORDER BY CASE d.course WHEN 'starter' THEN 1 WHEN 'main' THEN 2 ELSE 3 END, d.name`,
  );
  return rows;
}

async function findById(id, db) {
  const { rows } = await query(`${DISH_SELECT} WHERE d.dish_id = $1 GROUP BY d.dish_id`, [id], db);
  return rows[0] || null;
}

async function nameExists(name, exceptId = null) {
  const { rows } = await query('SELECT 1 FROM dish WHERE lower(name) = lower($1) AND dish_id IS DISTINCT FROM $2', [
    name,
    exceptId,
  ]);
  return rows.length > 0;
}

async function create(d, db) {
  const { rows } = await query(
    'INSERT INTO dish (name, course, description) VALUES ($1, $2, $3) RETURNING dish_id AS id',
    [d.name, d.course, d.description],
    db,
  );
  return rows[0].id;
}

async function update(id, d, db) {
  const { rowCount } = await query(
    'UPDATE dish SET name = $2, course = $3, description = $4 WHERE dish_id = $1',
    [id, d.name, d.course, d.description],
    db,
  );
  return rowCount > 0;
}

async function setAllergens(id, allergenIds, db) {
  await query('DELETE FROM dish_allergen WHERE dish_id = $1', [id], db);
  if (allergenIds.length) {
    await query('INSERT INTO dish_allergen (dish_id, allergen_id) SELECT $1, unnest($2::int[])', [id, allergenIds], db);
  }
}

/** Titles of the menus that use the dish */
async function menusUsing(id) {
  const { rows } = await query(
    'SELECT m.title FROM menu_dish md JOIN menu m USING (menu_id) WHERE md.dish_id = $1 ORDER BY m.title',
    [id],
  );
  return rows.map((r) => r.title);
}

async function remove(id) {
  const { rowCount } = await query('DELETE FROM dish WHERE dish_id = $1', [id]);
  return rowCount > 0;
}

module.exports = { DISH_SELECT, findAll, findById, nameExists, create, update, setAllergens, menusUsing, remove };
