const openingHoursService = require('../services/openingHoursService');

async function update(req, res) {
  res.json(await openingHoursService.updateOpeningHours(req.body));
}

module.exports = { update };
