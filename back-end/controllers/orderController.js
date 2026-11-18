const orderService = require('../services/orderService');
const reviewService = require('../services/reviewService');
const { parseId } = require('../utils/validate');

async function create(req, res) {
  res.status(201).json(await orderService.createOrder(req.user, req.body));
}

async function listMine(req, res) {
  res.json(await orderService.listMyOrders(req.user));
}

async function getMine(req, res) {
  res.json(await orderService.getMyOrder(req.user, parseId(req.params.id)));
}

async function editMine(req, res) {
  res.json(await orderService.editMyOrder(req.user, parseId(req.params.id), req.body));
}

async function cancelMine(req, res) {
  res.json(await orderService.cancelMyOrder(req.user, parseId(req.params.id)));
}

async function reviewMine(req, res) {
  res.status(201).json(await reviewService.createReview(req.user, parseId(req.params.id), req.body));
}

module.exports = { create, listMine, getMine, editMine, cancelMine, reviewMine };
