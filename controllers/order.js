const router = require('express').Router()

const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  getOrdersByIds,
  resendOrderConfirmationEmail,
  getRecentOrders
} = require('../services/order')

module.exports = function (passport) {
  router.post(
    '/orders',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      getOrders(req.body).then((result) =>
        res.json({
          data: result.rows,
          page: req.body && req.body.page ? req.body.page : 0,
          totalCount: result.count
        })
      )
    }
  )

  router.get(
    '/orders/recent',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      getRecentOrders().then((result) =>
        res.json({
          data: result,
          page: 0,
          totalCount: result.length
        })
      )
    }
  )

  router.get(
    '/order/edit/:id',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      const id = req.params.id
      getOrder(id)
        .then((order) => res.json(order))
        .catch((err) =>
          res.status(500).json({ error: true, msg: 'unable to get order' })
        )
    }
  )

  router.post(
    '/order/create',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      createOrder(req.body)
        .then((order) => res.json({ success: true, msg: 'ok', order: order }))
        .catch((err) =>
          res
            .status(500)
            .json({ error: true, msg: `unable to create order err: ${err}` })
        )
    }
  )

  router.post(
    '/order/update',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      updateOrder(req.body)
        .then((order) => res.json({ success: true, msg: 'ok', order: order }))
        .catch((err) =>
          res
            .status(500)
            .json({ error: true, msg: `unable to update order err: ${err}` })
        )
    }
  )

  router.post(
    '/orders/print',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      const { orderIds } = req.body
      getOrdersByIds(orderIds)
        .then((orders) => {
          return orders.map((order) => {
            const line_items = order.OrderLineItems || []

            const onHandProducts = line_items.filter(
              (li) => li.kind === 'product' && li.status === 'on_hand'
            )
            const backorderProducts = line_items.filter(
              (li) => li.kind === 'product' && li.status !== 'on_hand'
            )

            return {
              ...order.toJSON(),
              onHandProducts,
              backorderProducts
            }
          })
        })
        .then((orders) =>
          res.render('orders', {
            orders
          })
        )
        .catch((err) =>
          res.status(500).send({ error: `unable to print orders err: ${err}` })
        )
    }
  )

  router.post(
    '/orders/resend_email',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      resendOrderConfirmationEmail(req.body.orderId)
        .then((result) => {
          res.json({ success: true, msg: 'ok' })
        })
        .catch((err) => {
          console.warn('unable to resend order confirmation email! err:', err)
          return res
            .status(500)
            .send({ error: 'unable to resend order confirmation email!' })
        })
    }
  )

  return router
}
