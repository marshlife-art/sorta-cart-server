const models = require('../../models')
const { MEMBER, createUser } = require('../fixtures/users')

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

const ORDER_WITH_CREDIT_ADJUSTMENT = {
  status: 'new',
  name: 'order with credit adjustment',
  email: 'line@it.emz',
  phone: '1234567890',
  notes: 'is test',
  total: 65.66,
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
    },
    {
      quantity: 1,
      total: -1.0,
      kind: 'adjustment',
      description: 'STORE CREDIT -1.00'
    }
  ]
}

function fakeOrder(i) {
  return {
    status: 'new',
    UserId: 1,
    name: `${i}fake name`,
    email: `${i}@fake.email`,
    phone: `${i}000000000`,
    notes: `${i} fake notes`,
    total: 66.66,
    OrderLineItems: [
      {
        quantity: 10,
        total: 60.0,
        kind: 'product'
      },
      {
        quantity: 1,
        total: 1.0,
        kind: 'another product'
      },
      {
        quantity: 1,
        total: 6.66,
        kind: 'tax'
      },
      {
        quantity: 1,
        total: -1.0,
        kind: i % 5 === 0 ? 'credit' : i === 'adjustment',
        description:
          i % 5 === 0
            ? 'STORE CREDIT (another product)'
            : i === 'pre-tax discount'
      }
    ]
  }
}

async function syncOrders() {
  await models.Order.sync({ force: true, match: /_test$/, logging: false })
  await models.Member.sync({
    force: true,
    match: /_test$/,
    logging: false
  })
  await models.User.sync({
    force: true,
    match: /_test$/,
    logging: false
  })
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
    await createUser(MEMBER)
  }

  return await models.Order.create(order, {
    include: [models.OrderLineItem]
  })
}

async function createFakerOrders(sync, howMany) {
  howMany = howMany || 1
  if (sync) {
    await syncOrders()
    await createUser(MEMBER)
  }

  for (let i = 0; i < howMany; i++) {
    createOrder(false, fakeOrder(i))
  }
}

module.exports = {
  ORDER,
  ORDER_WITH_CREDIT_ADJUSTMENT,
  createOrder,
  createFakerOrders
}
