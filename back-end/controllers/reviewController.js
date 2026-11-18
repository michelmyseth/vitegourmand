const reviewService = require('../services/reviewService');
const { parseId } = require('../utils/validate');

/** Public: approved reviews (home page) */
async function listApproved(req, res) {
  res.json(await reviewService.listApproved());
}

/** Employees (KAN-63) */
async function listForModeration(req, res) {
  res.json(await reviewService.listForModeration(req.query));
}

async function moderate(req, res) {
  res.json(await reviewService.moderate(req.user, parseId(req.params.id), req.body));
}

module.exports = { listApproved, listForModeration, moderate };
