const router = require('express').Router()

const {
  createOrder,
  validateLineItems,
  getMyOrders
} = require('../services/order')
const { createPayment } = require('../services/square_payments')
const { sendOrderConfirmationEmail } = require('../mailers/order_mailer')

module.exports = function(passport) {
  router.post('/store/checkout', async function(req, res) {
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
      console.log('[store/checkout] order paymentResponse:', paymentResponse)
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
      .then(order => {
        sendOrderConfirmationEmail(order).catch(console.warn)
        return order
      })
      .then(order => res.json({ success: true, msg: 'ok', order: order }))
      .catch(err =>
        res
          .status(500)
          .json({ error: true, msg: `unable to create order err: ${err}` })
      )
  })

  router.post('/store/validate_line_items', function(req, res) {
    validateLineItems(req.body)
      .then(response => res.json(response))
      .catch(err =>
        res
          .status(500)
          .json({ error: true, msg: `unable to validate order err: ${err}` })
      )
  })

  router.post(
    '/myorders',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      console.log('req.user.id:', req.user.id)

      getMyOrders(req.user.id)
        .then(orders => res.json({ orders: orders || [] }))
        .catch(err =>
          res
            .status(500)
            .json({ error: true, msg: `onoz! unable to get my orders` })
        )
    }
  )

  return router
}
