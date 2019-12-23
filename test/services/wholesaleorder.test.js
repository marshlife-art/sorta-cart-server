const assert = require('assert')
const {
  getWholesaleOrders,
  getWholesaleOrder,
  createWholesaleOrder
} = require('../../services/wholesaleorder')
const {
  WHOLESALE_ORDER,
  createWholesaleOrderFixture
} = require('../fixtures/wholesaleorders')

describe('services', function() {
  describe('wholesale orders', function() {
    before(async function() {
      return createWholesaleOrderFixture(true)
    })

    it('should get wholesale orders with status param', async function() {
      const wholesaleorders = await getWholesaleOrders('new')
      assert.equal(wholesaleorders.count, 1)
      assert.equal(wholesaleorders.rows.length, 1)
    })

    it('should get wholesale order', async function() {
      const wholesaleorder = await getWholesaleOrder(1)
      assert.equal(wholesaleorder.notes, 'testing wholesale order')
    })

    it('should be able to create wholesale orders', async function() {
      let wholesaleorder = WHOLESALE_ORDER
      wholesaleorder.vendor = 'SOME VENDOR'
      const newWholesaleOrder = await createWholesaleOrder(wholesaleorder)
      // const wholesaleorders = await getWholesaleOrder(newWholesaleOrder.id)
      assert.equal(newWholesaleOrder.vendor, wholesaleorder.vendor)
    })
  })
})
