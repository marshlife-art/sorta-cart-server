'use strict'
const models = require('../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
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

    const admin = await models.User.findOne({
      where: { role: 'admin' }
    })

    const member = await models.Member.findOne({
      include: [models.User]
    })

    const products = await models.Product.findAll({
      limit: 2
    })

    return models.Order.create(
      {
        UserId: admin.id,
        MemberId: member.id,
        status: 'new',
        payment_status: 'balance_due',
        shipment_status: 'backorder',
        name: member.name,
        email: member.User.email,
        phone: member.phone,
        address: member.address,
        notes:
          'is test. with some really really long notes here. just so many notes. just goes on and on and on and on. there is a lot to take note about in this order, so let me tell you all about all the thingz that are nothing at all and really not important this is just filler text blah blah blah yadda yadda yadda. what is the character count anyway, hopefully this does not make the order recepit format all wonky. well okay, that is all for now...',
        subtotal: 2 * products[0].ws_price + 6 * products[1].u_price,
        total:
          2 * products[0].ws_price + 6 * products[1].u_price + -66.66 + 6.66,
        OrderLineItems: [
          {
            price: products[0].ws_price,
            quantity: 2,
            description: `${products[0].name} ${products[0].description}`,
            selected_unit: 'CS',
            total: 2 * products[0].ws_price,
            kind: 'product',
            vendor: 'unfi',
            data: { product: products[0] }
          },
          {
            price: products[1].u_price,
            quantity: 6,
            description: `${products[1].name} ${products[1].description}`,
            selected_unit: 'EA',
            total: 6 * products[1].u_price,
            kind: 'product',
            vendor: 'unfi',
            data: { product: products[1] }
          },
          {
            quantity: 1,
            total: -66.66,
            description: 'store credit',
            kind: 'adjustment'
          },
          {
            quantity: 1,
            total: 6.66,
            kind: 'tax'
          }
        ]
      },
      { include: [models.OrderLineItem, models.User, models.Member] }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Orders', null, {})
  }
}
