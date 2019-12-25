'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          email: 'admin@marshcoop.org',
          password: 'zomgzomg',
          role: 'admin'
        },
        {
          email: 'guest@some.where',
          password: 'zomgzomg',
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
