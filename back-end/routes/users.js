const express = require('express');
const users = require('../controllers/userController');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.put('/me', requireAuth, users.updateMe);

module.exports = router;
