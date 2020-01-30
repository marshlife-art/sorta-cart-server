require('dotenv').config()

module.exports = {
  development: {
    username: process.env.PG_DATABASE_USER,
    password: process.env.PG_DATABASE_PASSWORD,
    database: process.env.PG_DATABASE_NAME,
    host: process.env.PG_DATABASE_HOST,
    dialect: 'postgres'
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:'
  },
  production: {
    username: process.env.PG_DATABASE_USER,
    password: process.env.PG_DATABASE_PASSWORD,
    database: process.env.PG_DATABASE_NAME,
    host: process.env.PG_DATABASE_HOST,
    port: process.env.PG_DATABASE_PORT,
    dialect: 'postgres',
    logging: false,
    ssl: true,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}
