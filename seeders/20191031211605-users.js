'use strict'
const bcrypt = require('bcrypt')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          email: 'admin@marshcoop.org',
          password: bcrypt.hashSync('zomgzomg', 10),
          role: 'admin'
        },
        {
          email: 'guest@some.where',
          password: bcrypt.hashSync('zomgzomg', 10),
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
