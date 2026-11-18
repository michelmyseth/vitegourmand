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
     ORDER BY CASE d.course WHEN 'starter' THEN 1 WHEN 'main' THEN 2 ELSE 3 END, d.name`
  );
  return rows;
}

async function findById(id, db) {
  const { rows } = await query(`${DISH_SELECT} WHERE d.dish_id = $1 GROUP BY d.dish_id`, [id], db);
  return rows[0] || null;
}

module.exports = { DISH_SELECT, findAll, findById };
