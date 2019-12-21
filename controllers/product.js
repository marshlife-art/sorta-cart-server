const router = require('express').Router()

const {
  getProducts,
  getCategories,
  getSubCategories,
  destroyProducts
} = require('../services/product')

module.exports = function(passport) {
  router.post('/products', function(req, res) {
    getProducts(req.body).then(result =>
      res.json({
        data: result.rows,
        page: req.body && req.body.page ? req.body.page : 0,
        totalCount: result.count
      })
    )
  })

  router.get('/categories', function(req, res) {
    return getCategories().then(result =>
      res.json(
        result
          .map(r => r['DISTINCT'])
          .reduce((acc, cur) => {
            acc[cur] = cur
            return acc
          }, {})
      )
    )
  })

  router.get('/sub_categories', function(req, res) {
    return getSubCategories().then(result =>
      res.json(
        result
          .map(r => r['DISTINCT'])
          .reduce((acc, cur) => {
            acc[cur] = cur
            return acc
          }, {})
      )
    )
  })

  router.post(
    '/products/destroy',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      const { ids } = req.body
      return destroyProducts(ids)
        .then(() => res.json({ msg: 'products destroyed!' }))
        .catch(err =>
          res.status(500).json({
            error: true,
            msg: `o noz! unable to destroy products ${err}`
          })
        )
    }
  )

  return router
}
