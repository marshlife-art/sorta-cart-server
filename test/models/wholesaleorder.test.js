const assert = require('assert')
const models = require('../../models')

// const { ORDER, createOrder } = require('../fixtures/orders')
const {
  WHOLESALE_ORDER,
  createWholesaleOrderFixture
} = require('../fixtures/wholesaleorders')

describe('models', function() {
  describe('WholesaleOrder', function() {
    let wholesaleOrder
    before(async function() {
      wholesaleOrder = await createWholesaleOrderFixture(true)
    })

    it('should create wholesale orders', async function() {
      assert.equal(wholesaleOrder.vendor, WHOLESALE_ORDER.vendor)
      assert.equal(wholesaleOrder.notes, WHOLESALE_ORDER.notes)
    })
  })
})
