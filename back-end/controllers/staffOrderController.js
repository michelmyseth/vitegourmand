const staffOrderService = require('../services/staffOrderService');
const { parseId } = require('../utils/validate');

async function list(req, res) {
  res.json(await staffOrderService.listOrders(req.query));
}

async function detail(req, res) {
  res.json(await staffOrderService.getOrder(parseId(req.params.id)));
}

async function changeStatus(req, res) {
  res.json(await staffOrderService.changeStatus(req.user, parseId(req.params.id), req.body));
}

module.exports = { list, detail, changeStatus };
