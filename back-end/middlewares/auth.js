// Authentication and role-based access control.
//   router.get('/x', requireAuth, handler)                        -> any logged-in user
//   router.get('/x', requireAuth, requireRole('admin'), handler)  -> admins only
const jwt = require('jsonwebtoken');
const { JWT_SECRET, COOKIE_NAME } = require('../config/auth');
const userRepository = require('../repositories/userRepository');
const { unauthorized, forbidden } = require('../utils/httpError');

const { isTokenRevoked } = require('../services/tokenService');

/** Decodes the cookie token and loads the user. Returns null if absent / invalid. */
async function readUser(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
  if (await isTokenRevoked(payload.jti)) return null;

  // Read the user from the database on every request: a disabled account
  // or a role change takes effect immediately, not when the token expires
  const user = await userRepository.findById(payload.sub);
  if (!user || !user.isActive) return null;

  req.token = payload;
  return user;
}

async function requireAuth(req, res, next) {
  const user = await readUser(req);
  if (!user) throw unauthorized();
  req.user = user;
  next();
}

/** Sets req.user when a valid token is present, without refusing visitors */
async function optionalAuth(req, res, next) {
  req.user = await readUser(req);
  next();
}

/** Must be used after requireAuth */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };
}

// Shortcuts. The administrator inherits every employee feature (KAN-66).
const requireEmployee = requireRole('employee', 'admin');
const requireAdmin = requireRole('admin');

module.exports = { requireAuth, optionalAuth, requireRole, requireEmployee, requireAdmin };
