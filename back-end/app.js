// Express application: global middlewares, API routes, error handling.
// server.js starts it; keeping them apart makes the app easy to test.
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(cors({
  origin: (process.env.FRONT_URL || 'http://localhost:8080').split(','),
  credentials: true, // the JWT is sent in an httpOnly cookie
}));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
