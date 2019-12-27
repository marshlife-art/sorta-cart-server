const router = require('express').Router()

const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder
} = require('../services/order')

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
      createOrder(req.body)
        .then(order => res.json({ success: true, msg: 'ok', order: order }))
        .catch(err =>
          res
            .status(500)
            .json({ error: true, msg: `unable to create order err: ${err}` })
        )
    }
  )

  router.post(
    '/order/update',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      updateOrder(req.body)
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
