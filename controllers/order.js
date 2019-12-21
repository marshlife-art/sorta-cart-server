const router = require('express').Router()

const { getOrders } = require('../services/order')

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

  return router
}
