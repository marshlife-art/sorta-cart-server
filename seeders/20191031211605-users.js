'use strict'
const models = require('../models')

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
    */

    return models.User.create({
      name: 'admin',
      email: 'admin@marshcoop.org',
      password: 'zomgzomg',
      roles: ['admin']
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
