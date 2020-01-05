const findParamsFor = require('../util/findParamsFor')
const models = require('../models')

const Order = models.Order
const OrderLineItem = models.OrderLineItem
const User = models.User
const Member = models.Member
const Product = models.Product
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
  order.OrderLineItems.map(oli => delete oli.id)
  return await Order.create(order, { include: [OrderLineItem] })
}

const updateOrder = async order => {
  delete order.createdAt
  delete order.updatedAt

  if (!order || !order.id || order.id === 'new') {
    throw new Error('no such order id exist to update!')
  }

  const o = await Order.findOne({
    where: { id: order.id },
    include: [OrderLineItem]
  })

  // to avoid orphaned order line items from collecting in the db
  // first destroy all the line items for this order `o`, then re-created
  // with all the line items being submitted `order`.
  const line_items = o.OrderLineItems.map(oli => oli.id)

  if (line_items && line_items.length) {
    await OrderLineItem.destroy({
      where: {
        id: { [Op.or]: line_items }
      }
    })
  }

  await o.update(order)

  await o.setOrderLineItems([])

  order.OrderLineItems.forEach(async li => {
    const newoli = await OrderLineItem.create(li)
    await o.addOrderLineItem(newoli)
  })

  return o
}

const getOrdersByIds = async orderIds => {
  return await Order.findAll({
    where: {
      id: {
        [Op.or]: orderIds
      }
    },
    include: [OrderLineItem, User, Member]
  })
}

const validateLineItems = async lineItems => {
  // console.log('validateLineItems lineItems:', lineItems)
  // #TOOOOOODOOOOOO :/

  return new Promise(resolve => {
    // let invalidLineItems = []
    // lineItems.forEach(async li => {
    //   if (
    //     li.kind !== 'product' ||
    //     li.kind !== 'tax' ||
    //     li.kind !== 'adjustment'
    //   ) {
    //     invalidLineItems.push(li)
    //     return
    //   }
    //   if (li.kind === 'product') {
    //     if (li.price <= 0 || li.total <= 0 || li.quantity <= 0) {
    //       invalidLineItems.push(li)
    //       return
    //     }
    //     if (!li.data || !li.data.product || !li.data.product.id) {
    //       invalidLineItems.push(li)
    //       return
    //     }
    //     const product = await Product.findOne({
    //       where: { id: li.data.product.id }
    //     })
    //     if (!product && (product.unf || product.upc_code)) {
    //       const maybeItWasRecreated = await Product.findOne({
    //         where: {
    //           [Op.or]: [{ unf: product.unf }, { upc_code: product.upc_code }]
    //         }
    //       })
    //       if (!maybeItWasRecreated) {
    //         invalidLineItems.push(li)
    //         return
    //       }
    //       if (
    //         maybeItWasRecreated.ws_price !== li.data.product.ws_price ||
    //         maybeItWasRecreated.u_price !== li.data.product.u_price
    //       ) {
    //         invalidLineItems.push(li)
    //         return
    //       }
    //     }
    //     if (
    //       product.ws_price !== li.data.product.ws_price ||
    //       product.u_price !== li.data.product.u_price
    //     ) {
    //       invalidLineItems.push(li)
    //       return
    //     }
    //   }
    // })

    resolve({
      error: false,
      invalidLineItems: []
    })
  })
}

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  getOrdersByIds,
  validateLineItems
}
