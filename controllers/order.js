const router = require('express').Router()

const { getOrders, getOrder } = require('../services/order')

module.exports = function(passport) {
  router.post(
    '/orders',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      // console.log('/products req.body:', JSON.stringify(req.body))

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

  return router
}
