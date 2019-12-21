const assert = require('assert')
const { getOrders } = require('../../services/order')
const { createFakerOrders } = require('../fixtures/orders')

const FAKE_ORDER_COUNT = 10

describe('services', function() {
  describe('order', function() {
    before(async function() {
      return createFakerOrders(true, FAKE_ORDER_COUNT)
    })

    it('should get orders without params', async function() {
      const orders = await getOrders({})
      assert.equal(orders.count, FAKE_ORDER_COUNT)
      assert.equal(orders.rows.length, FAKE_ORDER_COUNT)
    })

    it('should accept a search query', async function() {
      const orders = await getOrders({
        search: '6@fake.email'
      })
      assert.equal(orders.count, 1)
      assert.equal(orders.rows.length, 1)
    })
  })
})
