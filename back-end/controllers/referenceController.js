// Controllers only read the request and send the response; the work is done
// by the services / repositories.
const referenceRepository = require('../repositories/referenceRepository');

async function listThemes(req, res) {
  res.json(await referenceRepository.findThemes());
}

async function listDiets(req, res) {
  res.json(await referenceRepository.findDiets());
}

async function listAllergens(req, res) {
  res.json(await referenceRepository.findAllergens());
}

async function listOpeningHours(req, res) {
  res.json(await referenceRepository.findOpeningHours());
}

module.exports = { listThemes, listDiets, listAllergens, listOpeningHours };
