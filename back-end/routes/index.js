// All API routes, mounted under /api in app.js
const express = require('express');
const referenceRoutes = require('./reference');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/', referenceRoutes);

module.exports = router;
