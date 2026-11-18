// Dishes managed by employees (KAN-58)
const dishService = require('../services/dishService');
const { parseId } = require('../utils/validate');

async function list(req, res) {
  res.json(await dishService.listDishes());
}

async function create(req, res) {
  res.status(201).json(await dishService.saveDish(null, req.body));
}

async function update(req, res) {
  res.json(await dishService.saveDish(parseId(req.params.id), req.body));
}

async function remove(req, res) {
  await dishService.deleteDish(parseId(req.params.id));
  res.status(204).end();
}

module.exports = { list, create, update, remove };
