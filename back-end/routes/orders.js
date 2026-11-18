// Orders of the logged-in customer
const express = require('express');
const orders = require('../controllers/orderController');
const { requireAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(requireAuth, requireRole('user'));

router.get('/', orders.listMine);
router.post('/', orders.create);
router.get('/:id', orders.getMine);
router.put('/:id', orders.editMine); // only while 'pending'
router.post('/:id/cancel', orders.cancelMine); // only while 'pending'

module.exports = router;
