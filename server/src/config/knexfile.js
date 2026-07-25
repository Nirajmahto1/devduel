const path = require('path');

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'devduel',
      user: process.env.DB_USER || 'devduel_user',
      password: process.env.DB_PASSWORD || 'devduel_secret',
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: path.resolve(__dirname, '../../migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.resolve(__dirname, '../../seeds'),
    },
  },

  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'devduel_test',
      user: process.env.DB_USER || 'devduel_user',
      password: process.env.DB_PASSWORD || 'devduel_secret',
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: path.resolve(__dirname, '../../migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.resolve(__dirname, '../../seeds'),
    },
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 20 },
    migrations: {
      directory: path.resolve(__dirname, '../../migrations'),
      tableName: 'knex_migrations',
    },
  },
};
