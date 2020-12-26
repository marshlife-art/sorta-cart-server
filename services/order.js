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
  // console.log('> > > validateLineItems > > > lineItems:', lineItems)
  console.log(
    '> > > validateLineItems > > > lineItems.length:',
    lineItems.length
  )
  // jesus-fuck if/else! should probz look into assertion lib (like joi?)

  let invalidLineItems = []
  for (const li of lineItems) {
    // only check product kind
    if (li.kind !== 'product') {
      continue
    }

    // bad price, total, or quantity.
    if (li.price < 0 || li.total < 0 || li.quantity < 0) {
      console.log(
        '> > > validateLineItems > > >: price, total, or quantity less than zero.'
      )
      li.invalid = 'price, total, or quantity less than zero.'
      li.quantity = 0
      li.total = 0
      invalidLineItems.push(li)
      continue
    }

    console.log('> > > validateLineItems > > >  looking up:', li.description)
    // no product data ref
    if (
      !li.data ||
      !li.data.product ||
      !(li.data.product.unf || li.data.product.upc_code)
    ) {
      console.log('> > > validateLineItems > > > no product data ref')
      li.invalid = 'product no longer available.'
      li.quantity = 0
      li.total = 0
      invalidLineItems.push(li)
      continue
    }

    const product = await Product.findOne({
      where: {
        // id: li.data.product.id
        [Op.and]: [
          { unf: li.data.product.unf },
          { upc_code: li.data.product.upc_code }
        ]
      }
    })
    if (!product) {
      li.invalid = 'product no longer exists.'
      li.quantity = 0
      li.total = 0
      invalidLineItems.push(li)
      console.log('> > > validateLineItems > > > product no longer exists.')
      continue
    }

    if (
      product.ws_price !== li.data.product.ws_price ||
      product.u_price !== li.data.product.u_price
    ) {
      console.log(
        '! ! ! ! ! ! ! ! ! ! ! ! !> > > validateLineItems > > > prices no longer match. gonna update cart!!!!!!!'
      )
      li.invalid = undefined
      const liPrice =
        li.selected_unit === 'CS' ? product.ws_price : product.u_price
      li.price = parseFloat(liPrice)
      li.total = +(liPrice * li.quantity).toFixed(2)
      invalidLineItems.push(li)
      continue
    }

    if (
      !isNaN(parseInt(li.quantity)) &&
      parseInt(li.quantity) > product.count_on_hand
    ) {
      if (product.no_backorder === true) {
        console.log(
          '> > > validateLineItems > > > not enought count_on_hand and no_backorder, adjusting line item qty.'
        )
        li.invalid = undefined
        li.quantity = Math.abs(product.count_on_hand)
        li.total = +(li.quantity * parseFloat(li.price)).toFixed(2)
        // overwrite the product to db changes (like cont_on_hand and no_backorder) since item was added to cart.
        li.data.product = product
        invalidLineItems.push(li)
        continue
      } else {
        console.log(
          '> > > validateLineItems > > > not enought count_on_hand, will need to back order'
        )
        continue
      }
    }

    const liPrice =
      li.selected_unit === 'CS' ? product.ws_price : product.u_price
    if (
      li.price != liPrice ||
      li.total != (liPrice * li.quantity).toFixed(2)
      // note: not using super-strict comparison !== here :/
    ) {
      console.log(
        '! ! ! ! ! ! ! ! ! ! ! ! !> > > validateLineItems > > > li total is wrong. gonna update cart!!!!!!!'
      )
      li.invalid = undefined
      li.price = parseFloat(liPrice)
      li.total = +parseFloat(liPrice * li.quantity).toFixed(2)
      invalidLineItems.push(li)
      continue
    }
  }

  console.log(
    'invalidLineItems.length:',
    invalidLineItems.length,
    ' error:',
    invalidLineItems.length > 0
  )
  return {
    error: invalidLineItems.length > 0,
    invalidLineItems
  }
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

  return +(credits + Math.abs(adjustments)).toFixed(2)
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

      const store_credit = +(credits_sum + Math.abs(adjustments_sum)).toFixed(2)

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
