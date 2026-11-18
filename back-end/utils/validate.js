// Small server-side validation helpers. Each check adds a message to `errors`
// (one per field); call v.throwIfErrors() to send them back as a 400.
const { badRequest } = require('./httpError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// French mobile phone: 06/07 or +33 6/7
const PHONE_RE = /^(?:\+33\s?|0)[67](?:[\s.-]?\d{2}){4}$/;
const POSTCODE_RE = /^\d{5}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
// Min 10 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

const PASSWORD_RULE =
  'Le mot de passe doit contenir au moins 10 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.';

function validator(body = {}) {
  const errors = {};
  const str = (key) => (typeof body[key] === 'string' ? body[key].trim() : '');

  const v = {
    errors,
    str,
    required(key, message, max = 255) {
      const value = str(key);
      if (!value) errors[key] = message;
      else if (value.length > max) errors[key] = `${max} caractères maximum.`;
      return value;
    },
    optional(key, max = 1000) {
      const value = str(key);
      if (value.length > max) errors[key] = `${max} caractères maximum.`;
      return value;
    },
    email(key = 'email') {
      const value = str(key).toLowerCase();
      if (!EMAIL_RE.test(value) || value.length > 255) errors[key] = 'Adresse email invalide.';
      return value;
    },
    phone(key = 'phone') {
      const value = str(key);
      if (!PHONE_RE.test(value)) errors[key] = 'Numéro de portable invalide (ex. 06 12 34 56 78).';
      return value.replace(/[\s.-]/g, '');
    },
    postcode(key = 'postcode') {
      const value = str(key);
      if (!POSTCODE_RE.test(value)) errors[key] = 'Code postal invalide (5 chiffres).';
      return value;
    },
    password(key = 'password') {
      const value = typeof body[key] === 'string' ? body[key] : '';
      if (!PASSWORD_RE.test(value) || value.length > 72) errors[key] = PASSWORD_RULE;
      return value;
    },
    int(key, { min = -Infinity, max = Infinity, message } = {}) {
      const value = Number(body[key]);
      if (!Number.isInteger(value) || value < min || value > max) {
        errors[key] = message || `Nombre entier attendu (entre ${min} et ${max}).`;
      }
      return value;
    },
    number(key, { min = -Infinity, max = Infinity, message } = {}) {
      const value = Number(body[key]);
      if (body[key] === '' || body[key] === null || !Number.isFinite(value) || value < min || value > max) {
        errors[key] = message || 'Nombre invalide.';
      }
      return value;
    },
    date(key, message = 'Date invalide.') {
      const value = str(key);
      if (!DATE_RE.test(value) || Number.isNaN(Date.parse(value))) errors[key] = message;
      return value;
    },
    time(key, message = 'Heure invalide.') {
      const value = str(key);
      if (!TIME_RE.test(value)) errors[key] = message;
      return value.slice(0, 5);
    },
    oneOf(key, values, message = 'Valeur invalide.') {
      const value = str(key);
      if (!values.includes(value)) errors[key] = message;
      return value;
    },
    error(key, message) {
      errors[key] = message;
    },
    throwIfErrors(message = 'Certains champs sont invalides.') {
      if (Object.keys(errors).length) throw badRequest(message, errors);
    },
  };
  return v;
}

/** Positive integer id from a route parameter, or 404-like 400 error */
function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw badRequest('Identifiant invalide');
  return id;
}

module.exports = { validator, parseId, PASSWORD_RE, PASSWORD_RULE, EMAIL_RE };
