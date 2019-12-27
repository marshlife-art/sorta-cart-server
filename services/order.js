const findParamsFor = require('../util/findParamsFor')
const models = require('../models')

const Order = models.Order
const OrderLineItem = models.OrderLineItem
const User = models.User
const Member = models.Member
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

  findParams.include = [OrderLineItem, User, Member]

  findParams.distinct = true

  return await Order.findAndCountAll(findParams)
}

const getOrder = async id => {
  return await Order.findOne({
    where: { id },
    include: [OrderLineItem, User, Member]
  })
}

const createOrder = async order => {
  delete order.id
  delete order.createdAt
  delete order.updatedAt
  return await Order.create(order, { include: [OrderLineItem] })
}

const updateOrder = async order => {
  delete order.createdAt
  delete order.updatedAt

  if (!order || !order.id || order.id === 'new') {
    throw new Error('no such order id exist to update!')
  }

  return await Order.findOne(
    { where: { id: order.id } },
    { include: [OrderLineItem] }
  ).then(async o => {
    await o.update(order)
    order.OrderLineItems.forEach(async li => {
      if (li.id) {
        await OrderLineItem.findOne({ where: { id: li.id } }).then(oli =>
          oli.update(li)
        )
      } else {
        const newoli = await OrderLineItem.create(li)
        await o.addOrderLineItem(newoli)
      }
    })
    return o
  })
}

module.exports = { getOrders, getOrder, createOrder, updateOrder }
