// Rebuilds the MongoDB statistics from the orders stored in PostgreSQL.
// Usage: npm run stats:rebuild
require('dotenv').config();
const { pool } = require('../config/db');
const { connectMongo, mongoose } = require('../config/mongo');
const { rebuildFromSql } = require('../services/statsService');

(async () => {
  await connectMongo();
  const count = await rebuildFromSql();
  console.log(`menu_stats rebuilt: ${count} menus`);
  await Promise.all([pool.end(), mongoose.disconnect()]);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
