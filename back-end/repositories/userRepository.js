// Data access for app_user (parameterized SQL only)
const { query } = require('../config/db');

// Public fields of a user (never the password hash)
const USER_FIELDS = `
  u.user_id AS id, r.label AS role, u.email, u.last_name AS "lastName", u.first_name AS "firstName",
  u.phone, u.address, u.postcode, u.city, u.is_active AS "isActive", u.created_at AS "createdAt"`;

async function findById(id, db) {
  const { rows } = await query(
    `SELECT ${USER_FIELDS} FROM app_user u JOIN role r USING (role_id) WHERE u.user_id = $1`,
    [id],
    db
  );
  return rows[0] || null;
}

/** With the password hash: only used to check a password */
async function findByEmailWithHash(email) {
  const { rows } = await query(
    `SELECT ${USER_FIELDS}, u.password_hash AS "passwordHash"
     FROM app_user u JOIN role r USING (role_id) WHERE lower(u.email) = lower($1)`,
    [email]
  );
  return rows[0] || null;
}

async function findHashById(id) {
  const { rows } = await query('SELECT password_hash AS "passwordHash" FROM app_user WHERE user_id = $1', [id]);
  return rows[0]?.passwordHash || null;
}

async function emailExists(email, exceptId = null) {
  const { rows } = await query(
    'SELECT 1 FROM app_user WHERE lower(email) = lower($1) AND user_id IS DISTINCT FROM $2',
    [email, exceptId]
  );
  return rows.length > 0;
}

/** role must be 'user' or 'employee': admins are only created by the SQL script */
async function create(user, role, db) {
  const { rows } = await query(
    `INSERT INTO app_user (role_id, email, password_hash, last_name, first_name, phone, address, postcode, city, gdpr_consent_at)
     SELECT role_id, $2, $3, $4, $5, $6, $7, $8, $9, $10 FROM role WHERE label = $1 AND label <> 'admin'
     RETURNING user_id AS id`,
    [role, user.email, user.passwordHash, user.lastName, user.firstName, user.phone,
      user.address, user.postcode, user.city, user.gdprConsentAt || null],
    db
  );
  return rows[0].id;
}

async function updatePassword(id, passwordHash, db) {
  await query('UPDATE app_user SET password_hash = $2, updated_at = now() WHERE user_id = $1', [id, passwordHash], db);
}

async function updateProfile(id, u) {
  await query(
    `UPDATE app_user SET last_name = $2, first_name = $3, phone = $4, email = $5,
       address = $6, postcode = $7, city = $8, updated_at = now()
     WHERE user_id = $1`,
    [id, u.lastName, u.firstName, u.phone, u.email, u.address, u.postcode, u.city]
  );
}

module.exports = { updateProfile, findById, findByEmailWithHash, findHashById, emailExists, create, updatePassword };
