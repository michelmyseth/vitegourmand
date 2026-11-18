// All API routes, mounted under /api in app.js
const express = require('express');
const referenceRoutes = require('./reference');
const authRoutes = require('./auth');
const menuRoutes = require('./menus');
const orderRoutes = require('./orders');
const userRoutes = require('./users');
const staffRoutes = require('./staff');
const adminRoutes = require('./admin');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/menus', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/staff', staffRoutes);
router.use('/admin', adminRoutes);
router.use('/', referenceRoutes);

module.exports = router;
