'use strict'

const loadProductsCSV = require('../util/loadProductsCSV')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return loadProductsCSV('seeders/products.csv')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Products', null, {})
  }
}
