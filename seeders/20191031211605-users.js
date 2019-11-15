'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
    */

    return queryInterface.bulkInsert(
      'Users',
      [
        {
          name: 'admin',
          email: 'admin@marshcoop.org',
          password: 'zomgzomg',
          roles: ['admin']
        },
        {
          name: 'member',
          email: 'member@marshcoop.org',
          password: 'zomgzomg',
          roles: ['member']
        },
        {
          name: 'guest',
          email: 'guest@marshcoop.org',
          password: 'zomgzomg',
          roles: ['guest']
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
