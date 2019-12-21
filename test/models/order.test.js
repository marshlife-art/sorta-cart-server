const assert = require('assert')
const models = require('../../models')

const { ORDER, createOrder } = require('../fixtures/orders')

describe('models', function() {
  describe('Order', function() {
    let order
    before(async function() {
      order = await createOrder(true)
    })

    it('should create orders', async function() {
      assert.equal(order.status, ORDER.status)
      assert.equal(order.OrderLineItems.length, 2)
    })

    it('should delete orders', async function() {
      await order.destroy()
      const order_count = await models.Order.count()
      assert.equal(order_count, 0)
    })

    it('should clean up order line item associations', async function() {
      const li_count = await models.OrderLineItem.count()
      assert.equal(li_count, 0)
    })
  })
})
