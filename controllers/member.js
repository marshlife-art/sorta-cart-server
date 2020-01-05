const router = require('express').Router()

const {
  createMember,
  upsertMember,
  getMembers,
  destroyMember,
  getMember
} = require('../services/member')

module.exports = function(passport) {
  router.post(
    '/members',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      getMembers(req.body).then(result =>
        res.json({
          data: result.rows,
          page: req.body && req.body.page ? req.body.page : 0,
          totalCount: result.count
        })
      )
    }
  )

  router.post(
    '/member/create',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      const { member } = req.body
      createMember(member)
        .then(member => res.json({ member, msg: 'member created!' }))
        .catch(err => {
          console.warn('o noz, caught error creating member err:', err)
          return res.json({ error: true, msg: 'error creating member!' })
        })
    }
  )

  router.post(
    '/member/update',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      const { member } = req.body
      upsertMember(member)
        .then(member => res.json({ member, msg: 'member updated!' }))
        .catch(err => res.json({ error: true, msg: err }))
    }
  )

  router.delete(
    '/member',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      const { id } = req.body
      destroyMember(id)
        .then(() => res.json({ msg: 'member destroyed!' }))
        .catch(err =>
          res.status(500).json({
            error: true,
            msg: `o noz! unable to destroy member ${err}`
          })
        )
    }
  )

  router.get(
    '/member/me',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      getMember({ UserId: req.user.id })
        .then(member => res.json({ member }))
        .catch(err => res.json({ error: true, msg: err }))
    }
  )

  return router
}
