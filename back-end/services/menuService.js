const menuRepository = require('../repositories/menuRepository');
const { badRequest, notFound } = require('../utils/httpError');

/** Optional positive number from the query string (undefined when empty) */
function optionalNumber(value, name, { integer = false } = {}) {
  if (value === undefined || value === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || (integer && !Number.isInteger(n))) {
    throw badRequest(`Filtre « ${name} » invalide`);
  }
  return n;
}

/** Public list with the dynamic filters of the menus page (KAN-44) */
function listMenus(q = {}) {
  return menuRepository.findAll({
    maxPrice: optionalNumber(q.maxPrice, 'prix maximum'),
    minPrice: optionalNumber(q.minPrice, 'prix minimum'),
    themeId: optionalNumber(q.theme, 'thème', { integer: true }),
    dietId: optionalNumber(q.diet, 'régime', { integer: true }),
    minPeople: optionalNumber(q.minPeople, 'nombre de personnes', { integer: true }),
  });
}

async function getMenu(id, options) {
  const menu = await menuRepository.findById(id, options);
  if (!menu) throw notFound('Ce menu est introuvable.');
  return menu;
}

module.exports = { listMenus, getMenu };
