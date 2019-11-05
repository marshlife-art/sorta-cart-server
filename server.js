require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const passport = require('passport')
const passportJWT = require('passport-jwt')

const jwtOptions = {
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}
const strategy = new passportJWT.Strategy(jwtOptions, function(
  jwt_payload,
  next
) {
  console.log('payload received', jwt_payload)
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
  origin: 'http://localhost:3001',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204, i guess.
}
app.use(cors(corsOptions))

app.use(passport.initialize())

// parse application/json
app.use(bodyParser.json())
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

const models = require('./models')

const Op = models.Sequelize.Op

const User = models.User

// some helper functionz
const createUser = async ({ name, password }) => {
  return await User.create({ name, password })
}

const getAllUsers = async () => {
  return await User.findAll()
}

const getUser = async obj => {
  return await User.findOne({
    where: obj
  })
}

// USER ROUTES

app.get('/', function(req, res) {
  res.json({ message: 'Express is up!' })
})

app.get('/users', function(req, res) {
  getAllUsers().then(users => res.json(users))
})

app.post('/register', function(req, res, next) {
  const { name, password } = req.body
  createUser({ name, password }).then(user =>
    res.json({ user, msg: 'account created successfully' })
  )
})

app.post('/login', async function(req, res, next) {
  const { name, password } = req.body
  if (name && password) {
    let user = await getUser({ name: name })
    if (!user) {
      res.status(401).json({ message: 'No such user found' })
    }
    if (user.password === password) {
      // from now on we'll identify the user by the id and the id is the
      // only personalized value that goes the jwt token
      let payload = { id: user.id }
      let token = jwt.sign(payload, jwtOptions.secretOrKey)
      res.json({ msg: 'ok', token: token })
    } else {
      res.status(401).json({ msg: 'Password is incorrect' })
    }
  }
})

app.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    res.json('Success! You can now see this without a token.')
  }
)

const Product = models.Product

const getProducts = async (limit, page, orderBy, orderDirection, q) => {
  let findParams = {
    offset: page * limit,
    limit: limit
  }
  if (orderBy) {
    findParams.order = [[orderBy, orderDirection]]
  }
  if (q) {
    // category sub_category name description
    findParams.where = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { sub_category: { [Op.iLike]: `%${q}%` } },
        { category: { [Op.iLike]: `%${q}%` } }
      ]
    }
  }
  console.log('findParams:', findParams)
  return await Product.findAndCountAll(findParams)
}

app.get('/products', function(req, res) {
  const limit = req.query.limit || 10
  const page = req.query.page || 0
  const orderBy = req.query.orderBy
  const orderDirection = req.query.orderDirection
  const q = req.query.q || ''

  getProducts(limit, page, orderBy, orderDirection, q).then(result =>
    res.json({
      data: result.rows,
      page: parseInt(page),
      totalCount: result.count
    })
  )
})

app.get('/categories', function(req, res) {
  return Product.aggregate('category', 'DISTINCT', { plain: false }).then(
    result =>
      res.json(
        result
          .map(r => r['DISTINCT'])
          .reduce((acc, cur) => {
            acc[cur] = cur
            return acc
          }, {})
      )
  )
})

app.get('/sub_categories', function(req, res) {
  return Product.aggregate('sub_category', 'DISTINCT', { plain: false }).then(
    result =>
      res.json(
        result
          .map(r => r['DISTINCT'])
          .reduce((acc, cur) => {
            acc[cur] = cur
            return acc
          }, {})
      )
  )
})

app.post('/products', function(req, res) {
  console.log('/products req.body:', JSON.stringify(req.body))

  getProducts(100, 0).then(result =>
    res.json({
      data: result.rows,
      page: 0,
      totalCount: result.count
    })
  )
})

app.listen(3000, function() {
  console.log('Express is running on port 3000')
})
