const router = require('express').Router()

const {
  getPage,
  getAllPages,
  upsertPage,
  destroyPage,
  getLatestPage
} = require('../services/page')

module.exports = function (passport) {
  router.get('/page/latest', function (req, res) {
    getLatestPage()
      .then((page) => {
        res.json(page)
      })
      .catch((err) => res.status(404).json({ error: true, msg: 'not found' }))
  })

  router.get('/page', function (req, res) {
    getPage(req.query.id)
      .then((page) => {
        res.json(page)
      })
      .catch((err) => res.status(404).json({ error: true, msg: 'not found' }))
  })

  router.get(
    '/pages',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      getAllPages()
        .then((page) => {
          res.json(page)
        })
        .catch((err) => res.status(404).json({ error: true, msg: 'not found' }))
    }
  )

  router.post(
    '/page',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      const { id, slug, content } = req.body
      upsertPage({ id, slug, content })
        .then((page) =>
          res.json({ page, msg: 'announcement saved successfully' })
        )
        .catch((err) =>
          res
            .status(500)
            .json({ error: true, msg: 'unable to save announcement!' })
        )
    }
  )

  router.delete(
    '/page',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      const { id } = req.body
      destroyPage({ id })
        .then((page) => res.json({ page, msg: 'announcement destroyed!' }))
        .catch((err) =>
          res.status(500).json({
            error: true,
            msg: `o noz! unable to destroy announcement ${err}`
          })
        )
    }
  )

  return router
}
