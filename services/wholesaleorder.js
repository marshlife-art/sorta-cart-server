const findParamsFor = require('../util/findParamsFor')
const models = require('../models')

const WholesaleOrder = models.WholesaleOrder
const Order = models.Order
const OrderLineItem = models.OrderLineItem
const Op = models.Sequelize.Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const getWholesaleOrders = async status => {
  status = status || 'new'
  findParams = {
    where: { status },
    attributes: ['id', 'vendor', 'createdAt', 'status']
  }

  return await WholesaleOrder.findAndCountAll(findParams)
}

const getLineItems = async query => {
  let findParams = findParamsFor(query)

  const q = query.search || ''
  if (q) {
    findParams.where[Op.or] = [{ vendor: { [iLike]: `%${q}%` } }]
  }

  findParams.where['WholesaleOrderId'] = {
    [Op.eq]: null
  }
  findParams.where['kind'] = {
    [Op.eq]: 'product'
  }

  return await OrderLineItem.findAndCountAll(findParams)
}

const getWholesaleOrder = async id => {
  return await WholesaleOrder.findOne({
    where: { id },
    include: [OrderLineItem]
  })
}

const createWholesaleOrder = async wholesaleorder => {
  delete wholesaleorder.id
  delete wholesaleorder.createdAt
  delete wholesaleorder.updatedAt
  return await WholesaleOrder.create(wholesaleorder, {
    include: [OrderLineItem]
  })
}

const upsertWholesaleOrder = async wholesaleorder => {
  delete wholesaleorder.createdAt
  delete wholesaleorder.updatedAt
  return await WholesaleOrder.upsert(wholesaleorder, {
    include: [OrderLineItem],
    returning: true
  })
}

module.exports = {
  getWholesaleOrders,
  getLineItems,
  getWholesaleOrder,
  createWholesaleOrder,
  upsertWholesaleOrder
}
