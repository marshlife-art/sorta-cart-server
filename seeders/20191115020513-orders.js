'use strict'
const models = require('../models')

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */

    // return queryInterface.bulkInsert(
    //   'Orders',
    //   [
    //     {
    //       name: 'test member',
    //       email: 'test@mem.ber',
    //       phone: '1234567890',
    //       notes: 'is test',
    //       total: 66.66
    //     }
    //   ],
    //   {}
    // )

    return models.Order.create(
      {
        status: 'new',
        name: 'fooz line itemz',
        email: 'line@it.emz',
        phone: '1234567890',
        notes: 'is test',
        total: 66.66,
        OrderLineItems: [
          {
            quantity: 10,
            total: 60.0,
            kind: 'product'
          },
          {
            quantity: 1,
            total: 6.66,
            kind: 'tax'
          }
        ]
      },
      { include: [models.OrderLineItem] }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Orders', null, {})
  }
}
