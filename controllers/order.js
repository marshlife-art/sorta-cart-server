const router = require('express').Router()

const { getOrders, getOrder, createOrder } = require('../services/order')

module.exports = function(passport) {
  router.post(
    '/orders',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      getOrders(req.body).then(result =>
        res.json({
          data: result.rows,
          page: req.body && req.body.page ? req.body.page : 0,
          totalCount: result.count
        })
      )
    }
  )

  router.get(
    '/order/edit/:id',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      const id = req.params.id
      getOrder(id)
        .then(order => res.json(order))
        .catch(err =>
          res.status(500).json({ error: true, msg: 'unable to get order' })
        )
    }
  )

  router.post(
    '/order/create',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      console.log('/order/create req.body:', JSON.stringify(req.body))

      createOrder(req.body)
        .then(order => res.json({ success: true, msg: 'ok', order: order }))
        .catch(err =>
          res
            .status(500)
            .json({ error: true, msg: `unable to create order err: ${err}` })
        )
    }
  )

  return router
}
