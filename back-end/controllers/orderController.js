const orderService = require('../services/orderService');

async function create(req, res) {
  res.status(201).json(await orderService.createOrder(req.user, req.body));
}

module.exports = { create };
