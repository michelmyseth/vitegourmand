const express = require('express');
const auth = require('../controllers/authController');
const { optionalAuth } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.get('/me', optionalAuth, auth.me);

module.exports = router;
