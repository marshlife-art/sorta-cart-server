const router = require('express').Router()

const {
  getWholesaleOrders,
  getWholesaleOrder,
  createWholesaleOrder,
  upsertWholesaleOrder,
  getLineItems,
  addLineItems,
  destroyWholesaleOrder,
  removeLineItems
} = require('../services/wholesaleorder')

module.exports = function(passport) {
  router.post(
    '/wholesaleorders',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      getWholesaleOrders(req.body).then(result =>
        res.json({
          data: result.rows,
          page: req.body && req.body.page ? req.body.page : 0,
          totalCount: result.count
        })
      )
    }
  )

  router.post(
    '/wholesaleorders/lineitems',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      getLineItems(req.body).then(result =>
        res.json({
          data: result.rows,
          page: req.body && req.body.page ? req.body.page : 0,
          totalCount: result.count
        })
      )
    }
  )

  router.get(
    '/wholesaleorder/:id',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      const id = req.params.id
      getWholesaleOrder(id)
        .then(order => res.json(order))
        .catch(err =>
          res.status(500).json({ error: true, msg: 'unable to get order' })
        )
    }
  )

  router.post(
    '/wholesaleorder/create',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      createWholesaleOrder(req.body)
        .then(order =>
          res.json({
            success: true,
            msg: 'Wholesale Order created!',
            order: order
          })
        )
        .catch(err =>
          res.status(500).json({
            error: true,
            msg: `unable to create wholesale order err: ${err}`
          })
        )
    }
  )

  router.post(
    '/wholesaleorder/upsert',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      upsertWholesaleOrder(req.body)
        .then(order =>
          res.json({
            success: true,
            msg: 'Wholesale Order saved!',
            order: order
          })
        )
        .catch(err =>
          res.status(500).json({
            error: true,
            msg: `unable to update wholesale order err: ${err}`
          })
        )
    }
  )

  router.post(
    '/wholesaleorder/addlineitems',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      addLineItems(req.body)
        .then(order =>
          res.json({
            success: true,
            msg: 'line items added!',
            order: order
          })
        )
        .catch(err =>
          res.status(500).json({
            error: true,
            msg: `unable to update line items err: ${err}`
          })
        )
    }
  )

  router.delete(
    '/wholesaleorder',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      destroyWholesaleOrder(req.body)
        .then(() => res.json({ msg: 'wholesale order destroyed!' }))
        .catch(err =>
          res.status(500).json({
            error: true,
            msg: `o noz! unable to destroy wholesale order ${err}`
          })
        )
    }
  )

  router.delete(
    '/wholesaleorder/removelineitem',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      removeLineItems(req.body)
        .then(() => res.json({ msg: 'line item removed!' }))
        .catch(err =>
          res.status(500).json({
            error: true,
            msg: `o noz! unable to remove line items ${err}`
          })
        )
    }
  )

  return router
}
