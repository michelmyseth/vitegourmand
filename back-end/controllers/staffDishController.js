// Dishes managed by employees (KAN-58)
const dishRepository = require('../repositories/dishRepository');

async function list(req, res) {
  res.json(await dishRepository.findAll());
}

module.exports = { list };
