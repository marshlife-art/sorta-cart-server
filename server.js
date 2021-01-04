require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const bodyParser = require('body-parser')
const passport = require('passport')
const JWTStrategy = require('passport-jwt').Strategy
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars')
const {
  allowInsecurePrototypeAccess
} = require('@handlebars/allow-prototype-access')

const { getUser } = require('./services/user')

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: (req) => {
        return req.cookies.token
      },
      secretOrKey: process.env.JWT_SECRET
    },
    async (jwtPayload, done) => {
      if (Date.now() > jwtPayload.expires) {
        return done('jwt expired')
      }

      if (jwtPayload.auth_key) {
        const user = await getUser({ auth_key: jwtPayload.auth_key })
        if (user) {
          return done(null, user)
        } else {
          return done(null, false)
        }
      }

      return done(null, jwtPayload)
    }
  )
)

const app = express()

const corsOptions = {
  origin: [
    'https://admin.marshcoop.org',
    'https://marshcoop.org',
    'https://www.marshcoop.org'
  ],
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204, i guess.
}

if (process.env.NODE_ENV === 'development') {
  console.log('using dev cors originz')
  corsOptions.origin = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://admin.marsh.dev',
    'https://marsh.dev',
    'https://www.marsh.dev'
  ]
}
app.use(cors(corsOptions))
app.options('*', cors())

app.use(cookieParser())

app.use(passport.initialize())

// parse application/json
app.use(bodyParser.json({ limit: '10mb' }))
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
  },
  handlebars: allowInsecurePrototypeAccess(Handlebars)
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
const isRunning = () => {
  console.log(`sorta-cart-server is running on port ${port}`)
}

app.listen(port, isRunning)
