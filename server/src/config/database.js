const knex = require('knex');
const knexConfig = require('./knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

async function connectDatabase() {
  try {
    await db.raw('SELECT 1');
    return db;
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

module.exports = { db, connectDatabase };
