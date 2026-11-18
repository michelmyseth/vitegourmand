// All API routes, mounted under /api in app.js
const express = require('express');
const referenceRoutes = require('./reference');
const authRoutes = require('./auth');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/', referenceRoutes);

module.exports = router;
