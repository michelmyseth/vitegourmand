// Test databases: never the development ones (the tests reset them).
// Loaded by Jest before each test file (setupFiles) and by globalSetup.js.
function useTestDatabases() {
  process.env.PG_DB = process.env.PG_TEST_DB || 'vitegourmand_test';
  process.env.MONGO_URI = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vitegourmand').replace(
    /\/[^/?]*(\?|$)/,
    '/vitegourmand_test$1',
  );
  process.env.JWT_SECRET = 'test-secret-at-least-16-chars';
  process.env.NODE_ENV = 'test';

  if (!/^[a-z0-9_]+_test$/.test(process.env.PG_DB)) {
    throw new Error(`Refusing to run the tests on "${process.env.PG_DB}": the name must end with _test`);
  }
}

useTestDatabases();

module.exports = { useTestDatabases };
