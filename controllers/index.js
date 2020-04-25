const router = require('express').Router()
const APP_VERSION = `v${
  process.env.npm_package_version || require('../package.json').version
}`

module.exports = function (passport) {
  router.use('/', require('./session')(passport))
  router.use('/', require('./page')(passport))
  router.use('/', require('./user')(passport))
  router.use('/', require('./member')(passport))
  router.use('/', require('./product')(passport))
  router.use('/', require('./order')(passport))
  router.use('/', require('./wholesaleorder')(passport))
  router.use('/', require('./store')(passport))

  router.get('/', function (req, res) {
    res.json({ MARSH: 'COOP', APP_VERSION, 'MADE WITH': '♥ in NYC' })
  })

  return router
}
