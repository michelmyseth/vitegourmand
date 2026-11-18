const authService = require('../services/authService');
const { setAuthCookie } = require('../services/tokenService');

async function register(req, res) {
  const user = await authService.register(req.body);
  setAuthCookie(res, user); // logged in right after sign-up
  res.status(201).json({ user });
}

async function login(req, res) {
  const user = await authService.login(req.body);
  setAuthCookie(res, user);
  res.json({ user });
}

/** Current user (null for a visitor) */
function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, me };
