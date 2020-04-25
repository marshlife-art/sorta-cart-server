require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const passport = require('passport')
const passportJWT = require('passport-jwt')
const exphbs = require('express-handlebars')

const { getUser } = require('./services/user')

const jwtOptions = {
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}
const strategy = new passportJWT.Strategy(jwtOptions, async function (
  jwt_payload,
  next
) {
  if (jwt_payload.auth_key) {
    const user = await getUser({ auth_key: jwt_payload.auth_key })
    if (user) {
      next(null, user)
    } else {
      next(null, false)
    }
  } else {
    next(null, false)
  }
})
passport.use(strategy)

const app = express()

const corsOptions = {
  origin: [
    'https://admin.marshcoop.org',
    'https://marshcoop.org',
    'https://www.marshcoop.org'
  ],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204, i guess.
}
app.use(cors(corsOptions))
app.options('*', cors())

app.use(passport.initialize())

// parse application/json
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// handlebarz
const hbs = exphbs.create({
  helpers: {
    each_when: function (list, k, v, opts) {
      let i,
        result = ''
      for (i = 0; i < list.length; ++i)
        if (list[i][k] == v) result = result + opts.fn(list[i])
      return result
    }
  }
})
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

// init all the controllerz/routez:
app.use('/', require('./controllers')(passport))

// since this is the last route def, if nothing matched before it, it's a 404
app.use(function (req, res) {
  res.status(404)
  res.send({ error: 'not found' })
})

const port = process.env.PORT || 3000
app.listen(port, function () {
  console.log(`sorta-cart-server is running on port ${port}`)
})
