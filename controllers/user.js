const router = require('express').Router()

const { getUser, getUsers, destroyUser } = require('../services/user')

module.exports = function(passport) {
  router.post(
    '/users',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      getUsers(req.body).then(result =>
        res.json({
          data: result.rows,
          page: req.body && req.body.page ? req.body.page : 0,
          totalCount: result.count
        })
      )
    }
  )

  router.post(
    '/user/role',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      const { id, role } = req.body
      getUser({ id: id })
        .then(user => {
          user.roles = [role]
          return user.save()
        })
        .then(user =>
          // #TODO: email user a registration link...
          res.json({ user, msg: 'role set successfully' })
        )
        .catch(err => res.json({ error: true, msg: err }))
    }
  )

  router.delete(
    '/user',
    passport.authenticate('jwt', { session: false }),
    function(req, res) {
      const { id } = req.body
      destroyUser({ id })
        .then(() => res.json({ msg: 'user destroyed!' }))
        .catch(err =>
          res
            .status(500)
            .json({ error: true, msg: `o noz! unable to destroy user ${err}` })
        )
    }
  )

  return router
}
