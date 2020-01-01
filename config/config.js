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
    dialect: 'postgres',
    logging: false
  }
}
