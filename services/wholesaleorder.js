const findParamsFor = require('../util/findParamsFor')
const models = require('../models')
const { getOrder } = require('../services/order')

const WholesaleOrder = models.WholesaleOrder
// const Order = models.Order
const OrderLineItem = models.OrderLineItem
const Op = models.Sequelize.Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const TAX_RATE = 0.06391

const getWholesaleOrders = async (query) => {
  const status = query.status || ['new', 'needs_review', 'pending']

  const limit = query.pageSize || 50
  const orderBy = (query.orderBy && query.orderBy.field) || 'id'
  const orderDirection = query.orderDirection || 'DESC'
  let findParams = {
    limit: limit,
    where: { status }
  }
  if (orderBy) {
    findParams.order = [[orderBy, orderDirection]]
  }

  return await WholesaleOrder.findAndCountAll(findParams)
}

const getLineItems = async (query) => {
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

  findParams.where['status'] = {
    [Op.ne]: 'on_hand'
  }
  return await OrderLineItem.findAndCountAll(findParams)
}

const getWholesaleOrder = async (id) => {
  return await WholesaleOrder.findOne({
    where: { id },
    include: [OrderLineItem]
  })
}

const createWholesaleOrder = async (wholesaleorder) => {
  delete wholesaleorder.id
  delete wholesaleorder.createdAt
  delete wholesaleorder.updatedAt
  return await WholesaleOrder.create(wholesaleorder, {
    include: [OrderLineItem]
  })
}

const upsertWholesaleOrder = async (wholesaleorder) => {
  delete wholesaleorder.createdAt
  delete wholesaleorder.updatedAt
  return await WholesaleOrder.upsert(wholesaleorder, {
    include: [OrderLineItem],
    returning: true
  })
}

const addLineItems = async ({ id, selectedLineItems }) => {
  let WholesaleOrderId = id
  if (id === 'new') {
    WholesaleOrderId = await WholesaleOrder.create({
      vendor: 'New WholesaleOrder',
      status: 'new'
    }).then((order) => order.id)
  }

  return await OrderLineItem.update(
    { WholesaleOrderId },
    { where: { id: { [Op.in]: selectedLineItems } } }
  )
}

const destroyWholesaleOrder = async ({ id }) => {
  await OrderLineItem.update(
    { WholesaleOrderId: null },
    { where: { WholesaleOrderId: id } }
  )
  return await WholesaleOrder.destroy({ where: { id } })
}

const removeLineItems = async ({ ids }) => {
  return await OrderLineItem.update(
    { WholesaleOrderId: null },
    { where: { id: { [Op.in]: ids } } }
  )
}

const createOrderCredits = async (items) => {
  if (!items || items.length === 0) {
    throw new Error('invalid request!')
  }

  return await Promise.all(
    items.map(async (item) => {
      if (item.OrderId && item.total && item.description) {
        const absPrice = Math.abs(parseFloat(`${item.total}`))
        const price = -absPrice
        const total = -(absPrice + absPrice * TAX_RATE)

        const order = await getOrder(item.OrderId)
        const alreadyHasCredit =
          order &&
          order.OrderLineItems &&
          order.OrderLineItems.filter(
            (li) => li.kind === 'credit' && li.total === total
          ).length > 0

        if (order && !alreadyHasCredit) {
          const newoli = await OrderLineItem.create({
            quantity: 1,
            price: parseFloat(price.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            description: `STORE CREDIT (${item.description})`,
            kind: 'credit'
          })
          await order.addOrderLineItem(newoli)
        }
      }
    })
  )
}

module.exports = {
  getWholesaleOrders,
  getLineItems,
  getWholesaleOrder,
  createWholesaleOrder,
  upsertWholesaleOrder,
  addLineItems,
  destroyWholesaleOrder,
  removeLineItems,
  createOrderCredits
}
