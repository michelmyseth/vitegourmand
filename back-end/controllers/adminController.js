const adminService = require('../services/adminService');
const { parseId } = require('../utils/validate');

async function listEmployees(req, res) {
  res.json(await adminService.listEmployees());
}

async function createEmployee(req, res) {
  res.status(201).json(await adminService.createEmployee(req.body));
}

async function setEmployeeActive(req, res) {
  res.json(await adminService.setEmployeeActive(parseId(req.params.id), req.body));
}

async function stats(req, res) {
  res.json(await adminService.stats(req.query));
}

module.exports = { listEmployees, createEmployee, setEmployeeActive, stats };
