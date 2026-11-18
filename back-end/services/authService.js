// Sign-up, login, password reset
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { validator } = require('../utils/validate');
const { conflict, unauthorized, forbidden } = require('../utils/httpError');
const { mails } = require('./mailService');

const BCRYPT_COST = 10;

const hashPassword = (password) => bcrypt.hash(password, BCRYPT_COST);

/** Common checks of the personal information fields (sign-up and profile) */
function readProfileFields(v) {
  return {
    lastName: v.required('lastName', 'Le nom est obligatoire.', 100),
    firstName: v.required('firstName', 'Le prénom est obligatoire.', 100),
    phone: v.phone('phone'),
    email: v.email('email'),
    address: v.required('address', "L'adresse est obligatoire.", 255),
    postcode: v.postcode('postcode'),
    city: v.required('city', 'La ville est obligatoire.', 100),
  };
}

async function register(body) {
  const v = validator(body);
  const fields = readProfileFields(v);
  const password = v.password('password');
  if (body.gdprConsent !== true) {
    v.error('gdprConsent', 'Vous devez accepter la politique de confidentialité.');
  }
  v.throwIfErrors();

  if (await userRepository.emailExists(fields.email)) {
    throw conflict('Un compte existe déjà avec cet email.', { email: 'Un compte existe déjà avec cet email.' });
  }

  // The role is always 'user': it is never read from the request
  const id = await userRepository.create(
    { ...fields, passwordHash: await hashPassword(password), gdprConsentAt: new Date() },
    'user'
  );
  const user = await userRepository.findById(id);
  mails.welcome(user);
  return user;
}

// Compared when the email is unknown, so the answer takes the same time
// whether the account exists or not (no account enumeration)
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_COST);
const LOGIN_ERROR = 'Email ou mot de passe incorrect.';

async function login(body) {
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const user = email ? await userRepository.findByEmailWithHash(email) : null;
  const valid = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  // Same generic message for an unknown email and a wrong password
  if (!user || !valid) throw unauthorized(LOGIN_ERROR);
  if (!user.isActive) throw forbidden("Ce compte a été désactivé. Contactez l'administrateur.");

  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

module.exports = { register, login, readProfileFields, hashPassword };
