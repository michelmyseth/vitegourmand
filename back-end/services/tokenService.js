// Creates the session JWT and puts it in / removes it from the httpOnly cookie
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, TOKEN_TTL_SECONDS, COOKIE_NAME, cookieOptions } = require('../config/auth');

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

module.exports = { signToken, setAuthCookie, clearAuthCookie };
