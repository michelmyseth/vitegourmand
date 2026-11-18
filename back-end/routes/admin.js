// Administrator only. The admin also uses every /api/staff route (KAN-66).
const express = require('express');
const admin = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);

// Employee accounts (KAN-64, KAN-65). No route can create an administrator.
router.get('/employees', admin.listEmployees);
router.post('/employees', admin.createEmployee);
router.put('/employees/:id/active', admin.setEmployeeActive); // { isActive: false } disables the account

module.exports = router;
