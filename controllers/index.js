const router = require('express').Router()

module.exports = function(passport) {
  router.use('/', require('./session')(passport))
  router.use('/', require('./page')(passport))
  router.use('/', require('./user')(passport))
  router.use('/', require('./product')(passport))
  router.use('/', require('./order')(passport))
  router.use('/', require('./wholesaleorder')(passport))

  router.get('/', function(req, res) {
    res.json({ MARSH: 'COOP' })
  })

  return router
}
