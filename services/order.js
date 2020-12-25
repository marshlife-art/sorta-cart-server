const findParamsFor = require('../util/findParamsFor')
const models = require('../models')
const { sendOrderConfirmationEmail } = require('../mailers/order_mailer')

const Order = models.Order
const OrderLineItem = models.OrderLineItem
const User = models.User
const Member = models.Member
const Product = models.Product
const Op = models.Sequelize.Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const getOrders = async (query) => {
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

const getOrder = async (id) => {
  return await Order.findOne({
    where: { id },
    include: [OrderLineItem, User, Member]
  })
}

const createOrder = async (order) => {
  delete order.id
  delete order.createdAt
  delete order.updatedAt
  order.OrderLineItems.map((oli) => delete oli.id)

  return await Order.create(order, { include: [OrderLineItem] })
}

const updateOrder = async (order) => {
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
  const line_items = o.OrderLineItems.map((oli) => oli.id)

  if (line_items && line_items.length) {
    await OrderLineItem.destroy({
      where: {
        id: { [Op.or]: line_items }
      }
    })
  }

  await o.update(order)

  await o.setOrderLineItems([])

  order.OrderLineItems.forEach(async (li) => {
    const newoli = await OrderLineItem.create(li)
    await o.addOrderLineItem(newoli)
  })

  return o
}

const getOrdersByIds = async (orderIds) => {
  return await Order.findAll({
    where: {
      id: {
        [Op.or]: orderIds
      }
    },
    include: [OrderLineItem, User, Member]
  })
}

const getMyOrders = async (UserId) => {
  const MemberId = await Member.findOne({
    where: {
      UserId
    }
  }).then((member) => (member && member.id) || undefined)

  const where =
    MemberId !== undefined
      ? {
          [Op.or]: [{ UserId }, { MemberId }]
        }
      : { UserId }

  return await Order.findAll({
    where,
    include: [OrderLineItem, User, Member]
  })
}

const getMyOrder = async (UserId, OrderId) => {
  if (!UserId || !OrderId) {
    throw new Error('no such user or order!')
  }

  const MemberId = await Member.findOne({
    where: {
      UserId
    }
  }).then((member) => (member && member.id) || undefined)

  const where =
    MemberId !== undefined
      ? {
          [Op.or]: [{ UserId }, { MemberId }],
          [Op.and]: { id: OrderId }
        }
      : { [Op.and]: { id: OrderId, UserId } }

  return await Order.findOne({
    where,
    include: [OrderLineItem, User, Member]
  })
}

const validateLineItems = async (lineItems) => {
  // console.log('validateLineItems lineItems:', lineItems)
  // #TOOOOOODOOOOOO :/

  return new Promise((resolve) => {
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

const resendOrderConfirmationEmail = async (orderId) => {
  return await getOrder(orderId).then((order) =>
    sendOrderConfirmationEmail(order)
  )
}

const getStoreCreditForMember = async (MemberId) => {
  if (MemberId === undefined) {
    return 0
  }

  const orderIds = await Order.findAll({
    attributes: ['id'],
    where: {
      MemberId
    },
    raw: true
  }).then((orders) => orders.map((order) => order.id))

  // note: the map reduce used for these two sums are a bit superflous, in that findAll
  // returns a collection but 'sum' will return a collection of one e.g. [{total: 6.66}]
  const credits = await OrderLineItem.findAll({
    where: {
      OrderId: orderIds,
      kind: 'credit'
    },
    attributes: [
      [models.Sequelize.fn('sum', models.Sequelize.col('total')), 'total']
    ],
    raw: true
  }).then((orders) =>
    orders
      .map(({ total }) => (total ? parseFloat(total) : 0))
      .reduce((sum, i) => sum + i, 0)
  )

  const adjustments = await OrderLineItem.findAll({
    where: {
      OrderId: orderIds,
      kind: 'adjustment',
      description: { [iLike]: '%store credit%' }
    },
    attributes: [
      [models.Sequelize.fn('sum', models.Sequelize.col('total')), 'total']
    ],
    raw: true
  }).then((orders) =>
    orders
      .map(({ total }) => (total ? parseFloat(total) : 0))
      .reduce((sum, i) => sum + i, 0)
  )

  return parseFloat((credits + Math.abs(adjustments)).toFixed(2))
}

const getStoreCredit = async (UserId) => {
  if (UserId === undefined) {
    return 0
  }

  const MemberId = await Member.findOne({
    where: {
      UserId
    },
    attributes: ['id'],
    raw: true
  }).then((member) => (member && member.id) || undefined)

  if (!MemberId) {
    return 0
  }

  return getStoreCreditForMember(MemberId)
}

const getStoreCreditLineItemsForMember = async (MemberId) => {
  if (MemberId === undefined) {
    return 0
  }

  const orderIds = await Order.findAll({
    attributes: ['id'],
    where: {
      MemberId
    },
    attributes: ['id'],
    raw: true
  }).then((orders) => orders.map((order) => order.id))

  // note: the map reduce used for these two sums are a bit superflous, in that findAll
  // returns a collection but 'sum' will return a collection of one e.g. [{total: 6.66}]
  const credits_sum = await OrderLineItem.findAll({
    where: {
      OrderId: orderIds,
      kind: 'credit'
    },
    attributes: [
      [models.Sequelize.fn('sum', models.Sequelize.col('total')), 'total']
      // 'price',
      // 'description',
      // 'OrderId'
    ],
    raw: true
  }).then((orders) =>
    orders
      .map(({ total }) => (total ? parseFloat(total) : 0))
      .reduce((sum, i) => sum + i, 0)
  )

  const adjustments_sum = await OrderLineItem.findAll({
    where: {
      OrderId: orderIds,
      kind: 'adjustment',
      description: { [iLike]: '%store credit%' }
    },
    attributes: [
      [models.Sequelize.fn('sum', models.Sequelize.col('total')), 'total']
      // 'price',
      // 'description',
      // 'OrderId'
    ],
    raw: true
  }).then((orders) =>
    orders
      .map(({ total }) => (total ? parseFloat(total) : 0))
      .reduce((sum, i) => sum + i, 0)
  )

  const credits = await OrderLineItem.findAll({
    where: {
      OrderId: orderIds,
      kind: 'credit'
    },
    raw: true
  })

  const adjustments = await OrderLineItem.findAll({
    where: {
      OrderId: orderIds,
      kind: 'adjustment',
      description: { [iLike]: '%store credit%' }
    },
    raw: true
  })

  return { credits_sum, adjustments_sum, credits, adjustments }
}

const getStoreCreditReport = async () => {
  const members = await Member.findAll({
    raw: true
  })

  const rows = await Promise.all(
    members.map(async (member) => {
      const {
        credits_sum,
        adjustments_sum,
        credits,
        adjustments
      } = await getStoreCreditLineItemsForMember(member.id)

      const store_credit = parseFloat(
        (credits_sum + Math.abs(adjustments_sum)).toFixed(2)
      )

      return adjustments.length || credits.length
        ? {
            ...member,
            credits,
            credits_sum,
            adjustments,
            adjustments_sum,
            store_credit
          }
        : undefined
    })
  )

  return rows
    .filter((o) => o)
    .sort(function (a, b) {
      return a.store_credit - b.store_credit
    })
}

const getMemberOrders = async (MemberId) => {
  return await Order.findAll({
    where: { MemberId },
    attributes: ['id', 'createdAt', 'item_count', 'total'],
    raw: true
  })
}

const getRecentOrders = async () => {
  return await models.sequelize.query(
    `SELECT * FROM "Orders" WHERE "createdAt" BETWEEN
  NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER-14 
  AND NOW() ORDER BY "createdAt" DESC;`,
    {
      model: Order,
      mapToModel: true
    }
  )
}

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  getOrdersByIds,
  validateLineItems,
  getMyOrders,
  getMyOrder,
  resendOrderConfirmationEmail,
  getStoreCredit,
  getStoreCreditForMember,
  getStoreCreditReport,
  getMemberOrders,
  getRecentOrders
}
