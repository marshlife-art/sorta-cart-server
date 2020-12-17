const router = require('express').Router()

const {
  createOrder,
  updateOrder,
  validateLineItems,
  getMyOrders,
  getStoreCredit,
  getStoreCreditForMember,
  getStoreCreditReport,
  getMemberOrders,
  getMyOrder
} = require('../services/order')
const { createPayment } = require('../services/square_payments')
const { sendOrderConfirmationEmail } = require('../mailers/order_mailer')

module.exports = function (passport) {
  router.post(
    '/store/checkout',
    passport.authenticate('jwt', { session: false }),
    async function (req, res) {
      const { order, nonce } = req.body

      if (!order || !order.name || !order.email || !order.total || !nonce) {
        res.status(500)
        res.send({ error: 'missing required order fields' })
        return
      }

      let paymentResponse = undefined
      try {
        paymentResponse = await createPayment(
          nonce,
          order.total * 100,
          `Order Payment ${order.name} ${order.email}`
        )
        // console.log('[store/checkout] order paymentResponse:', paymentResponse)
      } catch (e) {
        res.status(500)
        res.send({ error: 'payment error' })
        console.warn(
          '[store/checkout] onoz! caught error in createPayment error:',
          e.response.text,
          JSON.stringify(e)
        )
        return
      }

      createOrder({
        ...order,
        payment_status: 'paid',
        OrderLineItems: [
          ...order.OrderLineItems,
          {
            quantity: 1,
            total: -order.total,
            description: 'SQUARE CARD PAYMENT',
            kind: 'payment',
            data: paymentResponse
          }
        ]
      })
        .then((order) => {
          sendOrderConfirmationEmail(order).catch(console.warn)
          return order
        })
        .then((order) => res.json({ success: true, msg: 'ok', order: order }))
        .catch((err) =>
          res
            .status(500)
            .json({ error: true, msg: `unable to create order err: ${err}` })
        )
    }
  )

  router.post(
    '/store/freecheckout',
    passport.authenticate('jwt', { session: false }),
    async function (req, res) {
      const { order } = req.body

      if (
        !order ||
        !order.name ||
        !order.email ||
        !order.OrderLineItems ||
        order.OrderLineItems.length === 0
      ) {
        res.status(500)
        res.send({ error: 'missing required order fields' })
        return
      }

      createOrder({
        ...order,
        payment_status: parseInt(order.total) === 0 ? 'paid' : 'balance_due'
      })
        .then((order) => {
          sendOrderConfirmationEmail(order).catch(console.warn)
          return order
        })
        .then((order) => res.json({ success: true, msg: 'ok', order: order }))
        .catch((err) =>
          res
            .status(500)
            .json({ error: true, msg: `unable to create order err: ${err}` })
        )
    }
  )

  router.post(
    '/store/payment',
    passport.authenticate('jwt', { session: false }),
    async function (req, res) {
      const { order, amount, description, nonce } = req.body

      if (
        !order ||
        !order.name ||
        !order.email ||
        !amount ||
        !description ||
        !nonce
      ) {
        res.status(500)
        res.send({ error: 'missing required order fields' })
        return
      }

      let paymentResponse = undefined
      try {
        paymentResponse = await createPayment(
          nonce,
          amount,
          `Order #${order.id} Payment ${order.name} ${order.email}`
        )
        // console.log('[store/payment] order paymentResponse:', paymentResponse)
      } catch (e) {
        res.status(500)
        res.send({ error: 'payment error' })
        console.warn(
          '[store/checkout] onoz! caught error in createPayment error:',
          e.response.text,
          JSON.stringify(e)
        )
        return
      }

      updateOrder({
        ...order,
        payment_status: 'paid',
        OrderLineItems: [
          ...order.OrderLineItems,
          {
            quantity: 1,
            total: -parseFloat(Math.abs(parseFloat(amount) / 100).toFixed(2)),
            description: 'SQUARE CARD PAYMENT',
            kind: 'payment',
            data: paymentResponse
          }
        ]
      })
        .then((order) => {
          sendOrderConfirmationEmail(order).catch(console.warn)
          return order
        })
        .then((order) => res.json({ success: true, msg: 'ok', order: order }))
        .catch((err) =>
          res
            .status(500)
            .json({ error: true, msg: `unable to create order err: ${err}` })
        )
    }
  )

  router.post(
    '/store/validate_line_items',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      validateLineItems(req.body)
        .then((response) => res.json(response))
        .catch((err) =>
          res
            .status(500)
            .json({ error: true, msg: `unable to validate order err: ${err}` })
        )
    }
  )

  router.post(
    '/myorders',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      getMyOrders(req.user.id)
        .then((orders) => res.json({ orders: orders || [] }))
        .catch((err) =>
          res
            .status(500)
            .json({ error: true, msg: `onoz! unable to get my orders` })
        )
    }
  )

  router.post(
    '/getorder',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      getMyOrder(req.user.id, req.body.OrderId)
        .then((order) => res.json({ order }))
        .catch((err) =>
          res
            .status(500)
            .json({ error: true, msg: `onoz! unable to get order` })
        )
    }
  )

  router.get(
    '/store_credit',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      getStoreCredit(req.user.id)
        .then((store_credit) => res.json({ store_credit: store_credit || 0.0 }))
        .catch((err) => res.json({ store_credit: 0.0 }))
    }
  )

  router.post(
    '/admin/store_credit',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      getStoreCreditForMember(req.body.MemberId)
        .then((store_credit) => res.json({ store_credit: store_credit || 0.0 }))
        .catch((err) => res.json({ store_credit: 0.0 }))
    }
  )

  router.get(
    '/admin/store_credit_report',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      getStoreCreditReport()
        .then((result) => res.json(result))
        .catch((err) => res.json({ data: [], page: 0, totalCount: 0 }))
    }
  )

  router.post(
    '/admin/member_orders',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      getMemberOrders(req.body.MemberId)
        .then((result) => res.json(result))
        .catch((err) => res.json({ data: [], page: 0, totalCount: 0 }))
    }
  )

  return router
}
