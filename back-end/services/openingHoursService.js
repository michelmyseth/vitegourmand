// Opening hours, Monday (1) to Sunday (7), edited by employees (KAN-59)
const referenceRepository = require('../repositories/referenceRepository');
const { withTransaction } = require('../config/db');
const { badRequest } = require('../utils/httpError');

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

async function updateOpeningHours(body) {
  if (!Array.isArray(body) || body.length !== 7) throw badRequest('Les 7 jours de la semaine sont attendus.');

  const errors = {};
  const days = body.map((d) => ({
    dayOfWeek: Number(d?.dayOfWeek),
    isClosed: d?.isClosed === true,
    openTime: d?.openTime,
    closeTime: d?.closeTime,
  }));
  const seen = new Set(days.map((d) => d.dayOfWeek));
  if (seen.size !== 7 || ![1, 2, 3, 4, 5, 6, 7].every((n) => seen.has(n))) {
    throw badRequest('Les jours doivent aller de 1 (lundi) à 7 (dimanche).');
  }
  for (const d of days) {
    if (d.isClosed) continue;
    if (!TIME_RE.test(d.openTime || '') || !TIME_RE.test(d.closeTime || '')) {
      errors[d.dayOfWeek] = 'Heures invalides.';
    } else if (d.openTime >= d.closeTime) {
      errors[d.dayOfWeek] = "L'heure de fermeture doit être après l'heure d'ouverture.";
    }
  }
  if (Object.keys(errors).length) throw badRequest('Certains horaires sont invalides.', errors);

  await withTransaction((client) => referenceRepository.updateOpeningHours(days, client));
  return referenceRepository.findOpeningHours();
}

module.exports = { updateOpeningHours };
