const router = require('express').Router()

const {
  getProducts,
  getCategories,
  getSubCategories
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

  return router
}
