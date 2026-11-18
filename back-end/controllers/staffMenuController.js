// Menus managed by employees and the administrator (KAN-57)
const menuService = require('../services/menuService');
const { parseId } = require('../utils/validate');

async function list(req, res) {
  res.json(await menuService.listAllMenus());
}

async function detail(req, res) {
  res.json(await menuService.getMenu(parseId(req.params.id), { includeInactive: true }));
}

async function create(req, res) {
  res.status(201).json(await menuService.saveMenu(null, req.body));
}

async function update(req, res) {
  res.json(await menuService.saveMenu(parseId(req.params.id), req.body));
}

async function remove(req, res) {
  res.json(await menuService.deleteMenu(parseId(req.params.id)));
}

async function addImage(req, res) {
  res.status(201).json(await menuService.addImage(parseId(req.params.id), req.file));
}

async function removeImage(req, res) {
  await menuService.removeImage(parseId(req.params.id), parseId(req.params.imageId));
  res.status(204).end();
}

module.exports = { list, detail, create, update, remove, addImage, removeImage };
