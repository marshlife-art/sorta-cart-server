const router = require('express').Router()
const jwt = require('jsonwebtoken')

const {
  getUser,
  confirmUser,
  registerMember,
  isEmailAvailable
} = require('../services/user')
const { createMember } = require('../services/member')

module.exports = function(passport) {
  router.post('/register/check', async function(req, res) {
    const { email } = req.body
    res.send({ valid: await isEmailAvailable(email) })
  })

  router.post('/register', async function(req, res) {
    try {
      const { user, member } = req.body
      if (
        !user ||
        !user.email ||
        !user.password ||
        !member ||
        !member.name ||
        !member.phone
      ) {
        res.status(500)
        res.send({ error: 'missing required fields.' })
        return
      }

      // #TODO: validate payment.

      const newUser = await registerMember(user.email, user.password)
      member.UserId = newUser.id
      member.registration_email = newUser.email
      await createMember(member)

      const auth_key = newUser.auth_key
        ? newUser.auth_key
        : newUser.generateAuthKey()
      const payload = { id: newUser.id, auth_key }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      res.json({
        msg: 'ok',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          token: token
        }
      })
    } catch (e) {
      console.warn('[session] /register caught error:', e)
      res.status(500)
      res.send({ error: true })
    }
  })

  router.post('/confirm', function(req, res, next) {
    const { regKey } = req.body
    if (!regKey) {
      res.json({ error: true, msg: 'no registration key' })
    } else {
      confirmUser(regKey)
        .then(user => {
          // go ahead a auth user
          const auth_key = user.auth_key
            ? user.auth_key
            : user.generateAuthKey()
          const payload = { id: user.id, auth_key }
          const token = jwt.sign(payload, process.env.JWT_SECRET)
          res.json({
            msg: 'ok',
            user: {
              id: user.id,
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
      const user = await getUser({ email: email })
      if (user && user.validPassword(password)) {
        const auth_key = user.auth_key ? user.auth_key : user.generateAuthKey()
        const payload = { id: user.id, auth_key }
        const token = jwt.sign(payload, process.env.JWT_SECRET)
        res.json({
          msg: 'ok',
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            token: token
          }
        })
      } else {
        res.status(401).json({ message: 'Invalid user or password.' })
      }
    } else {
      res.status(401).json({ message: 'Invalid user or password.' })
    }
  })

  router.delete(
    '/logout',
    passport.authenticate('jwt', { session: false }),
    async function(req, res) {
      const reqUser = await req.user
      if (reqUser && reqUser.dataValues && reqUser.dataValues.auth_key) {
        const user = await getUser({ auth_key: reqUser.dataValues.auth_key })
        user.logout()
      }

      res.json({
        msg: 'ok',
        user: null
      })
    }
  )

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
