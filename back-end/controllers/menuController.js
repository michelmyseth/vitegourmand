const menuService = require('../services/menuService');
const { parseId } = require('../utils/validate');

async function list(req, res) {
  res.json(await menuService.listMenus(req.query));
}

async function detail(req, res) {
  res.json(await menuService.getMenu(parseId(req.params.id)));
}

module.exports = { list, detail };
