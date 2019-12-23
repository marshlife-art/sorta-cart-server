'use strict'
const models = require('../models')

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
      example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */

    return queryInterface.bulkInsert(
      'Users',
      [
        {
          name: 'admin',
          email: 'admin@marshcoop.org',
          password: 'zomgzomg',
          role: 'admin'
        },
        {
          name: 'member',
          email: 'member@marshcoop.org',
          password: 'zomgzomg',
          phone: '1234567890',
          address: '123 Test St. St. Louis, MO 66666',
          role: 'member'
        },
        {
          name: 'guest',
          email: 'guest@some.where',
          password: 'zomgzomg',
          phone: '9876543210',
          address: '9876 Guest Dr. Nowhere, ND 00000',
          role: 'guest'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
