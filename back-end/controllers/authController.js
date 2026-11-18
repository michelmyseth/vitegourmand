const authService = require('../services/authService');
const { setAuthCookie, clearAuthCookie, revokeToken } = require('../services/tokenService');
const { COOKIE_NAME } = require('../config/auth');

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

async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body);
  res.json({ message: 'Si un compte existe avec cet email, un lien de réinitialisation vient de vous être envoyé.' });
}

async function resetPassword(req, res) {
  await authService.resetPassword(req.body);
  res.json({ message: 'Votre mot de passe a été modifié.' });
}

async function logout(req, res) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) await revokeToken(token);
  clearAuthCookie(res);
  res.json({ message: 'Vous êtes déconnecté.' });
}

/** Current user (null for a visitor) */
function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, forgotPassword, resetPassword, logout, me };
