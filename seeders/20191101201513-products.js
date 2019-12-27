'use strict'

const loadProductsCSV = require('../util/loadProductsCSV')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const products = await loadProductsCSV(
      'seeders/products.csv',
      'unfi-test',
      'unfi',
      0.1
    )
    return queryInterface.bulkInsert('Products', products)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Products', null, {})
  }
}
