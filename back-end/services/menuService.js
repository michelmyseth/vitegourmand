const menuRepository = require('../repositories/menuRepository');
const { withTransaction } = require('../config/db');
const { deleteUploadedFile } = require('../config/upload');
const statsService = require('./statsService');
const { validator } = require('../utils/validate');
const { badRequest, notFound, conflict } = require('../utils/httpError');

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

// ---------------------------------------------------------------
// Employee management (KAN-57)
// ---------------------------------------------------------------

/** All menus, inactive ones included */
const listAllMenus = () => menuRepository.findAll({ includeInactive: true });

function readMenu(body) {
  const v = validator(body);
  const menu = {
    title: v.required('title', 'Le titre est obligatoire.', 100),
    description: v.required('description', 'La description est obligatoire.', 2000),
    themeId: v.int('themeId', { min: 1, message: 'Choisissez un thème.' }),
    dietId: v.int('dietId', { min: 1, message: 'Choisissez un régime.' }),
    minPeople: v.int('minPeople', { min: 1, max: 500, message: 'Nombre minimum de personnes invalide.' }),
    price: v.number('price', { min: 0.01, max: 100000, message: 'Prix invalide.' }),
    conditions: v.optional('conditions', 2000),
    stock: v.int('stock', { min: 0, max: 100000, message: 'Stock invalide (0 ou plus).' }),
    isActive: body.isActive !== false,
  };
  menu.price = Math.round(menu.price * 100) / 100;

  const ids = Array.isArray(body.dishIds) ? body.dishIds.map(Number) : [];
  if (!ids.length || ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    v.error('dishIds', 'Choisissez au moins un plat.');
  }
  menu.dishIds = [...new Set(ids)];
  v.throwIfErrors();
  return menu;
}

async function saveMenu(id, body) {
  const menu = readMenu(body);
  if (await menuRepository.titleExists(menu.title, id)) {
    throw conflict('Un menu porte déjà ce titre.', { title: 'Un menu porte déjà ce titre.' });
  }

  const menuId = await withTransaction(async (client) => {
    let savedId = id;
    if (id) {
      if (!(await menuRepository.update(id, menu, client))) throw notFound('Ce menu est introuvable.');
    } else {
      savedId = await menuRepository.create(menu, client);
    }
    await menuRepository.setDishes(savedId, menu.dishIds, client);
    return savedId;
  });

  if (id) statsService.renameMenu(id, menu.title);
  return menuRepository.findById(menuId, { includeInactive: true });
}

/**
 * A menu that was already ordered is only deactivated (orders keep their menu);
 * otherwise it is deleted with its images.
 */
async function deleteMenu(id) {
  const menu = await menuRepository.findById(id, { includeInactive: true });
  if (!menu) throw notFound('Ce menu est introuvable.');
  if (await menuRepository.hasOrders(id)) {
    await menuRepository.deactivate(id);
    return { deleted: false, deactivated: true };
  }
  const urls = await menuRepository.imageUrls(id);
  await menuRepository.remove(id);
  urls.forEach(deleteUploadedFile);
  return { deleted: true, deactivated: false };
}

async function addImage(menuId, file) {
  if (!file) throw badRequest('Choisissez une image.');
  const menu = await menuRepository.findById(menuId, { includeInactive: true });
  if (!menu) {
    deleteUploadedFile(`/uploads/menus/${file.filename}`);
    throw notFound('Ce menu est introuvable.');
  }
  return menuRepository.addImage(menuId, `/uploads/menus/${file.filename}`, `${menu.title} — photo`);
}

async function removeImage(menuId, imageId) {
  const removed = await menuRepository.removeImage(menuId, imageId);
  if (!removed) throw notFound('Image introuvable.');
  deleteUploadedFile(removed.url);
}

module.exports = { listMenus, getMenu, listAllMenus, saveMenu, deleteMenu, addImage, removeImage };
