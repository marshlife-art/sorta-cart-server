const assert = require('assert')
const models = require('../../models')

const ORDER = {
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
}

describe('models', function() {
  describe('Order', function() {
    let order
    before(async function() {
      await models.Order.sync({ force: true, match: /_test$/, logging: false })
      await models.WholesaleOrder.sync({
        force: true,
        match: /_test$/,
        logging: false
      })
      await models.OrderLineItem.sync({
        force: true,
        match: /_test$/,
        logging: false
      })
      order = await models.Order.create(ORDER, {
        include: [models.OrderLineItem]
      })
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
      console.log('li_count:', li_count)
      assert.equal(li_count, 0)
    })
  })
})
