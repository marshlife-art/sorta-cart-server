const router = require('express').Router()
const jwt = require('jsonwebtoken')

const { getUser, registerUser } = require('../services/user')

module.exports = function(passport) {
  router.post('/register', function(req, res, next) {
    const { regKey, password } = req.body
    if (!regKey) {
      res.json({ error: true, msg: 'no registration key' })
    } else {
      registerUser(regKey, password)
        .then(user => {
          // from now on we'll identify the user by the id and the id is the
          // only personalized value that goes the jwt token
          let payload = { id: user.id }
          let token = jwt.sign(payload, process.env.JWT_SECRET)
          res.json({
            msg: 'ok',
            user: {
              email: user.email,
              role: user.role,
              token: token
            }
          })
        })
        .catch(err => res.json({ error: true, msg: err }))
    }
  })

  router.post('/login', async function(req, res, next) {
    const { email, password } = req.body
    if (email && password) {
      let user = await getUser({ email: email })
      if (!user) {
        res.status(401).json({ message: 'No such user found' })
      }
      if (user.validPassword(password)) {
        // from now on we'll identify the user by the id and the id is the
        // only personalized value that goes the jwt token
        let payload = { id: user.id }
        let token = jwt.sign(payload, process.env.JWT_SECRET)
        res.json({
          msg: 'ok',
          user: {
            email: user.email,
            role: user.role,
            token: token
          }
        })
      } else {
        res.status(401).json({ msg: 'Password is incorrect' })
      }
    }
  })

  router.get(
    '/check_session',
    passport.authenticate('jwt', { session: false }),
    async function(req, res) {
      const reqUser = await req.user
      if (reqUser && reqUser.dataValues && reqUser.dataValues.id) {
        const user = reqUser.dataValues
        res.json({
          msg: 'ok',
          user: { id: user.id, email: user.email, role: user.role }
        })
      } else {
        res.status(401).json({ msg: 'unknown user' })
      }
    }
  )

  return router
}
