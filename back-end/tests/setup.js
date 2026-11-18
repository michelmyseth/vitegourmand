// Before each test file: MongoDB connected (statistics, revoked tokens),
// emails (console stub) silenced. After: connections closed so Jest can exit.
const { connectMongo, mongoose } = require('../config/mongo');
const { pool } = require('../config/db');

beforeAll(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  await connectMongo();
});

afterAll(async () => {
  await mongoose.disconnect();
  await pool.end();
});
