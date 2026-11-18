// Personal information of the logged-in user (KAN-55)
const userRepository = require('../repositories/userRepository');
const { readProfileFields } = require('./authService');
const { validator } = require('../utils/validate');
const { conflict } = require('../utils/httpError');

async function updateMyProfile(user, body) {
  const v = validator(body);
  const fields = readProfileFields(v);
  v.throwIfErrors();

  if (await userRepository.emailExists(fields.email, user.id)) {
    throw conflict('Cet email est déjà utilisé par un autre compte.', { email: 'Cet email est déjà utilisé.' });
  }
  await userRepository.updateProfile(user.id, fields);
  return userRepository.findById(user.id);
}

module.exports = { updateMyProfile };
