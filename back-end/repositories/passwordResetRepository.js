// Password reset tokens: only the SHA-256 hash of the token is stored
const { query } = require('../config/db');

async function create(userId, tokenHash, expiresAt) {
  await query('INSERT INTO password_reset_token (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [
    userId,
    tokenHash,
    expiresAt,
  ]);
}

/** Valid token = not used and not expired. Locked until the end of the transaction. */
async function findValid(tokenHash, db) {
  const { rows } = await query(
    `SELECT token_id AS id, user_id AS "userId" FROM password_reset_token
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
     FOR UPDATE`,
    [tokenHash],
    db,
  );
  return rows[0] || null;
}

/** Marks every pending token of the user as used (the link only works once) */
async function useAllForUser(userId, db) {
  await query('UPDATE password_reset_token SET used_at = now() WHERE user_id = $1 AND used_at IS NULL', [userId], db);
}

module.exports = { create, findValid, useAllForUser };
