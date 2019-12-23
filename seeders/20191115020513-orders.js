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
        payment_status: 'balance_due',
        shipment_status: 'backorder',
        name: 'fooz line itemz',
        email: 'line@it.emz',
        phone: '1234567890',
        address: '666 Devel Dr. NY, NY 16666',
        notes: 'is test',
        total: 66.66,
        UserId: 1,
        OrderLineItems: [
          {
            quantity: 9,
            description: 'some product',
            total: 50.0,
            kind: 'product',
            vendor: 'test'
          },
          {
            quantity: 1,
            description: 'some other product',
            total: 10.0,
            kind: 'product',
            vendor: 'test'
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
