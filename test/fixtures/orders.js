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

function fakeOrder(i) {
  return {
    status: 'new',
    name: `${i}fake name`,
    email: `${i}@fake.email`,
    phone: `${i}000000000`,
    notes: `${i}fake notes`,
    total: `${i}`
  }
}

async function syncOrders() {
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
}

async function createOrder(sync, order) {
  order = order || ORDER

  if (sync) {
    await syncOrders()
  }

  return await models.Order.create(order, {
    include: [models.OrderLineItem]
  })
}

async function createFakerOrders(sync, howMany) {
  howMany = howMany || 1
  if (sync) {
    await syncOrders()
  }

  for (let i = 0; i < howMany; i++) {
    createOrder(false, fakeOrder(i))
  }
}

module.exports = { ORDER, createOrder, createFakerOrders }