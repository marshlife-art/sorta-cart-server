'use strict'
const models = require('../models')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return models.WholesaleOrder.create(
      {
        vendor: 'unfi',
        notes: 'just a test wholesale order, here!',
        status: 'new'
      },
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('WholesaleOrders', null, {})
  }
}
