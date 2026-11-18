// Runs once before all the tests: (re)creates the test databases from
// database/schema.sql and database/seed.sql, so every run starts from the seed.
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const mongoose = require('mongoose');
require('./testEnv');

const connection = (database) => ({
  host: process.env.PG_HOST || '127.0.0.1',
  port: Number(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER || 'vitegourmand',
  password: process.env.PG_PASSWORD || 'vitegourmand',
  database,
});

async function run(database, sql) {
  const client = new Client(connection(database));
  await client.connect();
  try {
    return await client.query(sql);
  } finally {
    await client.end();
  }
}

module.exports = async function globalSetup() {
  const db = process.env.PG_DB;
  const exists = await run('postgres', `SELECT 1 FROM pg_database WHERE datname = '${db}'`);
  if (!exists.rowCount) await run('postgres', `CREATE DATABASE ${db}`);

  const sqlDir = path.join(__dirname, '..', 'database');
  await run(db, fs.readFileSync(path.join(sqlDir, 'schema.sql'), 'utf8'));
  await run(db, fs.readFileSync(path.join(sqlDir, 'seed.sql'), 'utf8'));

  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
};
