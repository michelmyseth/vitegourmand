require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');
const { connectMongo } = require('./config/mongo');

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  await pool.query('SELECT 1');
  console.log('PostgreSQL connected');
  await connectMongo();

  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Unable to start the API:', err.message);
  process.exit(1);
});
