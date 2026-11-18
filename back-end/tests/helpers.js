// Shared test helpers
const request = require('supertest');
const app = require('../app');

// Demo accounts of database/seed.sql
const ACCOUNTS = {
  admin: { email: 'jose@vitegourmand.fr', password: 'Admin#Jose2026!' },
  employee: { email: 'julie.employe@vitegourmand.fr', password: 'Employe#2026!' },
  user: { email: 'marie.dupont@example.com', password: 'Client#2026!' },
  otherUser: { email: 'thomas.martin@example.com', password: 'Client#2026!' },
};

/** Supertest agent that keeps the auth cookie, logged in with a demo account */
async function loginAs(role) {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send(ACCOUNTS[role]);
  if (res.status !== 200) throw new Error(`Login ${role} failed: ${res.status} ${JSON.stringify(res.body)}`);
  return agent;
}

/** 'YYYY-MM-DD', `days` from today */
function inDays(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

module.exports = { app, request, ACCOUNTS, loginAs, inDays };
