const findParamsFor = require('../util/findParamsFor')
const models = require('../models')

const Order = models.Order
const OrderLineItem = models.OrderLineItem
const Op = models.Sequelize.Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const getOrders = async query => {
  let findParams = findParamsFor(query)

  const q = query.search || ''
  if (q) {
    findParams.where[Op.or] = [
      { name: { [iLike]: `%${q}%` } },
      { email: { [iLike]: `%${q}%` } },
      { phone: { [iLike]: `%${q}%` } },
      { address: { [iLike]: `%${q}%` } },
      { notes: { [iLike]: `%${q}%` } }
    ]
  }

  findParams.include = [
    {
      model: OrderLineItem
      // where: { state: Sequelize.col('order.state') }
    }
  ]

  findParams.distinct = true

  return await Order.findAndCountAll(findParams)
}

const getOrder = async id => {
  return await Order.findOne({
    where: { id },
    include: [
      {
        model: OrderLineItem
      }
    ]
  })
}

const createOrder = async order => {
  delete order.id
  delete order.createdAt
  delete order.updatedAt
  return await Order.create(order, { include: [models.OrderLineItem] })
}

module.exports = { getOrders, getOrder, createOrder }
