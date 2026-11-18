// Data access for the reference tables (parameterized SQL only)
const { query } = require('../config/db');

async function findThemes() {
  const { rows } = await query('SELECT theme_id AS id, label FROM theme ORDER BY label');
  return rows;
}

async function findDiets() {
  const { rows } = await query('SELECT diet_id AS id, label FROM diet ORDER BY label');
  return rows;
}

async function findAllergens() {
  const { rows } = await query('SELECT allergen_id AS id, label FROM allergen ORDER BY label');
  return rows;
}

async function findOpeningHours() {
  const { rows } = await query(
    `SELECT day_of_week AS "dayOfWeek",
            to_char(open_time, 'HH24:MI') AS "openTime",
            to_char(close_time, 'HH24:MI') AS "closeTime",
            is_closed AS "isClosed"
     FROM opening_hours
     ORDER BY day_of_week`
  );
  return rows;
}

async function updateOpeningHours(days, db) {
  for (const d of days) {
    await query(
      `UPDATE opening_hours SET open_time = $2, close_time = $3, is_closed = $4 WHERE day_of_week = $1`,
      [d.dayOfWeek, d.isClosed ? null : d.openTime, d.isClosed ? null : d.closeTime, d.isClosed],
      db
    );
  }
}

module.exports = { findThemes, findDiets, findAllergens, findOpeningHours, updateOpeningHours };
