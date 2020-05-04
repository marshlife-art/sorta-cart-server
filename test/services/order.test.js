const assert = require('assert')
const {
  getOrders,
  getOrder,
  createOrder,
  getStoreCredit
} = require('../../services/order')
const { createFakerOrders, ORDER } = require('../fixtures/orders')

const FAKE_ORDER_COUNT = 10

describe('services', function () {
  describe('order', function () {
    before(async function () {
      return createFakerOrders(true, FAKE_ORDER_COUNT)
    })

    it('should get orders without params', async function () {
      const orders = await getOrders({})
      assert.equal(orders.count, FAKE_ORDER_COUNT)
      assert.equal(orders.rows.length, FAKE_ORDER_COUNT)
    })

    it('should accept a search query', async function () {
      const orders = await getOrders({
        search: '6@fake.email'
      })
      assert.equal(orders.count, 1)
      assert.equal(orders.rows.length, 1)
    })

    it('should be able to find one order', async function () {
      const orders = await getOrders({ pageSize: 1 })
      assert.equal(orders.rows.length, 1)

      const order = await getOrder(orders.rows[0].id)
      assert.equal(order.id, orders.rows[0].id)
    })

    it('should be able to create orders', async function () {
      let order = ORDER
      order.name = 'UPSERT ORDER'
      await createOrder(order)
      const orders = await getOrders({
        search: order.name
      })
      assert.equal(orders.count, 1)
      assert.equal(orders.rows.length, 1)
    })

    it('should getStoreCredit', async function () {
      const orders = await getStoreCredit(1)
      console.log('getStoreCredit orders:', orders)
      assert.equal(orders, false)
    })
  })
})
