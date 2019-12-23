const router = require('express').Router()

module.exports = function(passport) {
  router.use('/', require('./session')(passport))
  router.use('/', require('./page')(passport))
  router.use('/', require('./user')(passport))
  router.use('/', require('./product')(passport))
  router.use('/', require('./order')(passport))
  router.use('/', require('./wholesaleorder')(passport))

  return router
}
