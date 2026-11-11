const { Sequelize } = require('sequelize');

// Charger les variables depuis .env
const sequelize = new Sequelize(
  process.env.PG_DB || 'vitegourmand', 
  process.env.PG_USER || 'vitegourmand', 
  process.env.PG_PASSWORD || 'password', 
  {
    host: process.env.PG_HOST || '127.0.0.1',
    dialect: 'postgres',
    port: process.env.PG_PORT || 5432,
    logging: false, // désactive les logs SQL
  }
);

module.exports = sequelize;
