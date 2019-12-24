'use strict'

const loadProductsCSV = require('../util/loadProductsCSV')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const products = await loadProductsCSV('seeders/products.csv')
    return queryInterface.bulkInsert('Products', products)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Products', null, {})
  }
}
