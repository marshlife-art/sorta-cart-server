'use strict'
const bcrypt = require('bcrypt')
const models = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          email: 'member@marshcoop.org',
          password: bcrypt.hashSync('zomgzomg', 10),
          role: 'member'
        },
        {
          email: 'another@marshcoop.org',
          password: bcrypt.hashSync('zomgzomg', 10),
          role: 'member'
        }
      ],
      {}
    )
    // queryInterface.sequelize.query('SELECT id from Users;')
    const member = await models.User.findOne({
      where: { email: 'member@marshcoop.org' }
    })
    const another = await models.User.findOne({
      where: { email: 'another@marshcoop.org' }
    })

    return await queryInterface.bulkInsert(
      'Members',
      [
        {
          UserId: member.id,
          name: 'member',
          registration_email: 'member@marshcoop.org',
          phone: '1234567890',
          address: '123 Test St. St. Louis, MO 66666',
          discount: 0.1,
          discount_type: '10%',
          fees_paid: 100,
          store_credit: 66.66,
          shares: 1,
          member_type: 'worker owner'
        },
        {
          UserId: another.id,
          name: 'another member',
          registration_email: 'another@marshcoop.org',
          phone: '1231231234',
          address: '4321 A St. St. Louis, MO 66666',
          discount: 0.0,
          fees_paid: 0,
          store_credit: 0,
          shares: 1,
          member_type: 'consumer-owner'
        }
      ],
      { include: [models.User] }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Members', null, {})
  }
}
