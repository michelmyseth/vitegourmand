const staffOrderService = require('../services/staffOrderService');
const { parseId } = require('../utils/validate');

async function list(req, res) {
  res.json(await staffOrderService.listOrders(req.query));
}

async function detail(req, res) {
  res.json(await staffOrderService.getOrder(parseId(req.params.id)));
}

module.exports = { list, detail };
