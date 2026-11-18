const userService = require('../services/userService');

async function updateMe(req, res) {
  res.json({ user: await userService.updateMyProfile(req.user, req.body) });
}

module.exports = { updateMe };
