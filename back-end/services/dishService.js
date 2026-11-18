// Dishes and allergens managed by employees (KAN-58).
// A dish can belong to several menus (menu_dish table).
const dishRepository = require('../repositories/dishRepository');
const { withTransaction } = require('../config/db');
const { validator } = require('../utils/validate');
const { notFound, conflict, badRequest } = require('../utils/httpError');

function readDish(body) {
  const v = validator(body);
  const dish = {
    name: v.required('name', 'Le nom est obligatoire.', 150),
    course: v.oneOf('course', ['starter', 'main', 'dessert'], 'Choisissez entrée, plat ou dessert.'),
    description: v.optional('description', 1000),
  };
  const ids = Array.isArray(body.allergenIds) ? body.allergenIds.map(Number) : [];
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) v.error('allergenIds', 'Allergène invalide.');
  dish.allergenIds = [...new Set(ids)];
  v.throwIfErrors();
  return dish;
}

async function saveDish(id, body) {
  const dish = readDish(body);
  if (await dishRepository.nameExists(dish.name, id)) {
    throw conflict('Un plat porte déjà ce nom.', { name: 'Un plat porte déjà ce nom.' });
  }
  const dishId = await withTransaction(async (client) => {
    let savedId = id;
    if (id) {
      if (!(await dishRepository.update(id, dish, client))) throw notFound('Plat introuvable.');
    } else {
      savedId = await dishRepository.create(dish, client);
    }
    await dishRepository.setAllergens(savedId, dish.allergenIds, client);
    return savedId;
  });
  return dishRepository.findById(dishId);
}

/** Refused while the dish is part of a menu */
async function deleteDish(id) {
  const menus = await dishRepository.menusUsing(id);
  if (menus.length) {
    throw badRequest(`Ce plat est utilisé dans : ${menus.join(', ')}. Retirez-le d'abord de ces menus.`);
  }
  if (!(await dishRepository.remove(id))) throw notFound('Plat introuvable.');
}

module.exports = { listDishes: dishRepository.findAll, saveDish, deleteDish };
