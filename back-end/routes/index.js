// All API routes, mounted under /api in app.js
const express = require('express');
const referenceRoutes = require('./reference');
const authRoutes = require('./auth');
const menuRoutes = require('./menus');
const orderRoutes = require('./orders');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/menus', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/', referenceRoutes);

module.exports = router;
