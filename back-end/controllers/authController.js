const authService = require('../services/authService');
const { setAuthCookie } = require('../services/tokenService');

async function register(req, res) {
  const user = await authService.register(req.body);
  setAuthCookie(res, user); // logged in right after sign-up
  res.status(201).json({ user });
}

/** Current user (null for a visitor) */
function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, me };
