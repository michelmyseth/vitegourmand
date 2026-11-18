// Creates the session JWT and puts it in / removes it from the httpOnly cookie
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, TOKEN_TTL_SECONDS, COOKIE_NAME, cookieOptions } = require('../config/auth');
const RevokedToken = require('../models/RevokedToken');

function signToken(user) {
  // jti = unique token id, used to revoke this token on logout
  return jwt.sign({ role: user.role }, JWT_SECRET, {
    subject: String(user.id),
    jwtid: crypto.randomUUID(),
    expiresIn: TOKEN_TTL_SECONDS,
  });
}

function setAuthCookie(res, user) {
  res.cookie(COOKIE_NAME, signToken(user), { ...cookieOptions, maxAge: TOKEN_TTL_SECONDS * 1000 });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

/** Server-side logout: the token can no longer be used, even if it was copied */
async function revokeToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return; // invalid or expired: nothing to revoke
  }
  await RevokedToken.updateOne(
    { jti: payload.jti },
    { $setOnInsert: { jti: payload.jti, expiresAt: new Date(payload.exp * 1000) } },
    { upsert: true }
  );
}

async function isTokenRevoked(jti) {
  if (!jti) return true;
  return (await RevokedToken.exists({ jti })) !== null;
}

module.exports = { signToken, setAuthCookie, clearAuthCookie, revokeToken, isTokenRevoked };
