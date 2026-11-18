// Administrator features: employee accounts (KAN-64, KAN-65) and statistics (KAN-67, KAN-68)
const userRepository = require('../repositories/userRepository');
const statsService = require('./statsService');
const { hashPassword } = require('./authService');
const { mails } = require('./mailService');
const { validator } = require('../utils/validate');
const { conflict, notFound, badRequest } = require('../utils/httpError');

const listEmployees = () => userRepository.findEmployees();

/**
 * Creates an EMPLOYEE account (the role is fixed here: creating an administrator
 * is impossible, and the database trigger would refuse it anyway).
 * The email sent to the employee does NOT contain the password.
 */
async function createEmployee(body) {
  const v = validator(body);
  const email = v.email('email');
  const password = v.password('password');
  const lastName = v.required('lastName', 'Le nom est obligatoire.', 100);
  const firstName = v.required('firstName', 'Le prénom est obligatoire.', 100);
  v.throwIfErrors();

  if (await userRepository.emailExists(email)) {
    throw conflict('Un compte existe déjà avec cet email.', { email: 'Un compte existe déjà avec cet email.' });
  }

  const id = await userRepository.create({
    email, lastName, firstName,
    passwordHash: await hashPassword(password),
    // Contact details of the company: employees do not order
    phone: '0556000000', address: '10 quai des Chartrons', postcode: '33000', city: 'Bordeaux',
  }, 'employee');

  const employee = await userRepository.findById(id);
  mails.employeeCreated(employee);
  return employee;
}

/** Disable / enable an employee account (KAN-65): kept in the database, login refused */
async function setEmployeeActive(id, body) {
  if (typeof body?.isActive !== 'boolean') throw badRequest('Valeur attendue : isActive true ou false.');
  const user = await userRepository.findById(id);
  if (!user || user.role !== 'employee') throw notFound('Employé introuvable.');
  await userRepository.setActive(id, body.isActive);
  return userRepository.findById(id);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Orders and revenue per menu, from MongoDB (KAN-67, KAN-68) */
function stats(q = {}) {
  const from = typeof q.from === 'string' && q.from ? q.from : undefined;
  const to = typeof q.to === 'string' && q.to ? q.to : undefined;
  if ((from && !DATE_RE.test(from)) || (to && !DATE_RE.test(to))) throw badRequest('Dates invalides (AAAA-MM-JJ).');
  if (from && to && from > to) throw badRequest('La date de début doit être avant la date de fin.');
  let menuId;
  if (q.menuId) {
    menuId = Number(q.menuId);
    if (!Number.isInteger(menuId) || menuId <= 0) throw badRequest('Menu invalide.');
  }
  return statsService.menuStats({ menuId, from, to });
}

module.exports = { listEmployees, createEmployee, setEmployeeActive, stats };
