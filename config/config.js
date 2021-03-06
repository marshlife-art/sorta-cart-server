require('dotenv').config()

module.exports = {
  development: {
    username: process.env.PG_DATABASE_USER,
    password: process.env.PG_DATABASE_PASSWORD,
    database: process.env.PG_DATABASE_NAME,
    host: process.env.PG_DATABASE_HOST || '127.0.0.1',
    port: process.env.PG_DATABASE_PORT || 5432,
    // ssl: true,
    // dialectOptions: {
    //   ssl: {
    //     require: true
    //   },
    //   searchPath: process.env.PG_DATABASE_NAME
    // },
    // pool: {
    //   max: 20,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 10000
    // },
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
    dialectOptions: {
      ssl: {
        require: true,
        ca: [process.env.PG_CA_CERT]
      },
      searchPath: process.env.PG_DATABASE_NAME
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}
