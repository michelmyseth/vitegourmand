// PostgreSQL connection pool.
// Every query goes through query() with $1, $2... placeholders: values are sent
// separately from the SQL text (prepared statements), so no SQL injection.
const { Pool, types } = require('pg');

// NUMERIC columns (prices) come back as strings by default: return numbers instead
types.setTypeParser(types.builtins.NUMERIC, (value) => Number(value));
// DATE columns: keep the 'YYYY-MM-DD' string (no timezone shift)
types.setTypeParser(types.builtins.DATE, (value) => value);

const pool = new Pool({
  host: process.env.PG_HOST || '127.0.0.1',
  port: Number(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER || 'vitegourmand',
  password: process.env.PG_PASSWORD || 'vitegourmand',
  database: process.env.PG_DB || 'vitegourmand',
  max: 10,
});

pool.on('error', (err) => console.error('PostgreSQL pool error:', err.message));

/** Run one parameterized query. `db` can be the pool or a transaction client. */
function query(text, params = [], db = pool) {
  return db.query(text, params);
}

/**
 * Run `fn(client)` inside a transaction: COMMIT if it resolves, ROLLBACK if it throws.
 * Pass `client` to the repositories so that all their queries use the same transaction.
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
