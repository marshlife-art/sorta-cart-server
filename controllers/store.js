const router = require('express').Router()

const { createOrder, validateLineItems } = require('../services/order')

module.exports = function(passport) {
  router.post('/store/checkout', function(req, res) {
    createOrder(req.body)
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

  return router
}
