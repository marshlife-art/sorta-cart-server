const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { createPayment } = require('../services/square_payments')

const {
  getUser,
  getUserByEmail,
  confirmUser,
  registerMember,
  isEmailAvailable
} = require('../services/user')
const { createMember } = require('../services/member')
const { sendPasswordResetEmail } = require('../mailers/user_mailer')

module.exports = function (passport) {
  router.post('/forgotpassword', async function (req, res) {
    const { email } = req.body
    const user = await getUserByEmail(email)
    if (user) {
      if (!user.reg_key) {
        user.generateRegKey()
        user.save()
      }
      try {
        await sendPasswordResetEmail(email, user.reg_key)
        res.send({ msg: 'ok' })
      } catch (e) {
        res.send({ error: 'unable to send reset email!' })
      }
      return
    }

    res.status(500)
    res.send({ error: 'unknown user' })
    return
  })

  router.post('/resetpassword', async function (req, res) {
    const { regKey, password } = req.body

    if (regKey && regKey.length && password) {
      const user = await getUser({ reg_key: regKey })
      try {
        user.password = password
        user.reg_key = null
        const auth_key = user.generateAuthKey()
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
      } catch (e) {
        res.send({ error: 'unable to reset password!' })
      }
      return
    }

    res.status(500)
    res.send({ error: 'unknown user' })
    return
  })

  router.post('/register/check', async function (req, res) {
    const { email } = req.body
    res.send({ valid: await isEmailAvailable(email) })
  })

  router.post('/register', async function (req, res) {
    try {
      const { user, member, nonce } = req.body
      if (
        !user ||
        !user.email ||
        !user.password ||
        !member ||
        !member.name ||
        !member.phone ||
        !member.fees_paid ||
        !nonce
      ) {
        res.status(500)
        res.send({ error: 'missing required fields.' })
        return
      }

      try {
        const paymentResponse = await createPayment(
          nonce,
          member.fees_paid * 100,
          `Member Registration ${member.name} ${user.email}`
        )
        // console.log('[session] register paymentResponse:', paymentResponse)
      } catch (e) {
        res.status(500)
        res.send({ error: 'payment error' })
        console.warn('onoz! caught error in createPayment error:', error)
        return
      }

      const newUser = await registerMember(user.email, user.password)

      await createMember({
        ...member,
        UserId: newUser.id,
        registration_email: newUser.email,
        shares: 1
      })

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

  router.post('/confirm', function (req, res, next) {
    const { regKey } = req.body
    if (!regKey) {
      res.json({ error: true, msg: 'no registration key' })
    } else {
      confirmUser(regKey)
        .then((user) => {
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
        .catch((err) => res.json({ error: true, msg: err }))
    }
  })

  router.post('/login', async function (req, res, next) {
    const { email, password } = req.body
    if (email && password) {
      const user = await getUserByEmail(email)
      if (user && user.validPassword(password)) {
        // so JWK cookie auth magic, here.
        // stash an auth_key in the token to strengthen the user lookup in the JWTStrategy fn
        // remember fetch() needs {credentials: true} for this /login request to preserve the cookie
        const auth_key = user.auth_key ? user.auth_key : user.generateAuthKey()
        const payload = { id: user.id, auth_key }
        const token = jwt.sign(payload, process.env.JWT_SECRET)
        res.cookie('token', token, {
          httpOnly: true,
          secure: true, // process.env.NODE_ENV === 'production'
          sameSite: 'strict'
        })

        res.json({
          msg: 'ok',
          user: {
            id: user.id,
            email: user.email,
            role: user.role
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
    async function (req, res) {
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
    async function (req, res) {
      const user = req.user
      if (user && user.id) {
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
