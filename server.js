require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const passport = require('passport')
const passportJWT = require('passport-jwt')

const { getUser } = require('./services/user')

const jwtOptions = {
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}
const strategy = new passportJWT.Strategy(jwtOptions, function(
  jwt_payload,
  next
) {
  let user = getUser({ id: jwt_payload.id })
  if (user) {
    next(null, user)
  } else {
    next(null, false)
  }
})
passport.use(strategy)

const app = express()

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204, i guess.
}
app.use(cors(corsOptions))

app.use(passport.initialize())

// parse application/json
app.use(bodyParser.json())
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// init all the controllerz/routez:
app.use('/', require('./controllers')(passport))

const port = process.env.PORT || 3000
app.listen(port, function() {
  console.log(`sorta-cart-server is running on port ${port}`)
})
