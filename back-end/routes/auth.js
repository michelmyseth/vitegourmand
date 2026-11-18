const express = require('express');
const auth = require('../controllers/authController');
const { optionalAuth } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', auth.register);
router.get('/me', optionalAuth, auth.me);

module.exports = router;
