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
  origin: '*',
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
const createUser = async ({ email }) => {
  return await User.create({ email })
}

// const getAllUsers = async () => {
//   return await User.findAll()
// }

const getUser = async obj => {
  return await User.findOne({
    where: obj
  })
}

// USER ROUTES

// app.get('/', function(req, res) {
//   res.json({ message: 'Express is up!' })
// })

// app.get('/users', function(req, res) {
//   getAllUsers().then(users => res.json(users))
// })

app.post('/register', function(req, res, next) {
  const { email } = req.body
  if (!email) {
    res.json({ error: true, msg: 'no email!' })
  } else {
    createUser({ email })
      .then(user =>
        // #TODO: email user a registration link...
        res.json({ user, msg: 'account created successfully' })
      )
      .catch(err => res.json({ error: true, msg: err }))
  }
})

app.post('/login', async function(req, res, next) {
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
      let token = jwt.sign(payload, jwtOptions.secretOrKey)
      res.json({
        msg: 'ok',
        user: {
          name: user.name,
          email: user.email,
          roles: user.roles,
          token: token
        }
      })
    } else {
      res.status(401).json({ msg: 'Password is incorrect' })
    }
  }
})

app.get(
  '/check_session',
  passport.authenticate('jwt', { session: false }),
  async function(req, res) {
    const reqUser = await req.user
    const user = reqUser.dataValues
    res.json({
      msg: 'ok',
      user: { name: user.name, email: user.email, roles: user.roles }
    })
  }
)

app.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    res.json('Success! You can now see this without a token.')
  }
)

const Page = models.Page

const getPage = async slug => {
  return await Page.findOne({ where: { slug: slug } })
}

const getAllPages = async slug => {
  return await Page.findAndCountAll({ limit: 100, order: [['id', 'ASC']] })
}

app.get('/page', function(req, res) {
  getPage(req.query.slug)
    .then(page => {
      res.json(page)
    })
    .catch(err => res.status(404).json({ error: true, msg: 'not found' }))
})

app.get('/pages', function(req, res) {
  getAllPages()
    .then(page => {
      res.json(page)
    })
    .catch(err => res.status(404).json({ error: true, msg: 'not found' }))
})

const upsertPage = async ({ id, slug, content }) => {
  return await Page.upsert({ id, slug, content })
}

app.post('/page', function(req, res) {
  const { id, slug, content } = req.body
  upsertPage({ id, slug, content })
    .then(page => res.json({ page, msg: 'page saved successfully' }))
    .catch(err =>
      res.status(500).json({ error: true, msg: 'unable to save page' })
    )
})

const destroyPage = async ({ id }) => {
  return await Page.destroy({ where: { id: id } })
}

app.delete('/page', function(req, res) {
  const { id } = req.body
  destroyPage({ id })
    .then(page => res.json({ page, msg: 'page destroyed!' }))
    .catch(err =>
      res
        .status(500)
        .json({ error: true, msg: `o noz! unable to destroy page ${err}` })
    )
})

const findParamsFor = query => {
  console.log('findParamsFor query:', query)
  const limit = query.pageSize || 50
  const page = query.page || 0
  const orderBy = query.orderBy && query.orderBy.field
  const orderDirection = query.orderDirection

  let findParams = {
    offset: page * limit,
    limit: limit,
    where: {}
  }
  if (orderBy) {
    findParams.order = [[orderBy, orderDirection]]
  }

  if (query.filters && query.filters.length) {
    // map all filters into a buncha WHEREz
    // ...this is pretty gnarly ¯\_(ツ)_/¯
    query.filters.forEach(filter => {
      if (filter.column.field && filter.value && filter.value.length) {
        if (filter.column.field === 'codes') {
          let codeFilters = filter.value.map(val => ({
            codes: { [Op.iLike]: `%${val}%` }
          }))
          if (findParams.where[Op.or] && findParams.where[Op.or].length) {
            findParams.where[Op.or].push(codeFilters)
          } else {
            findParams.where[Op.or] = codeFilters
          }
        } else if (
          filter.column.field === 'category' ||
          filter.column.field === 'sub_category'
        ) {
          let catFilters = filter.value.map(val => ({
            [filter.column.field]: val
          }))
          if (findParams.where[Op.or] && findParams.where[Op.or].length) {
            findParams.where[Op.or].push(catFilters)
          } else {
            findParams.where[Op.or] = catFilters
          }
        } else if (Array.isArray(filter.value)) {
          let filters = filter.value.map(val => ({
            [filter.column.field]: val
          }))
          if (findParams.where[Op.and] && findParams.where[Op.and].length) {
            findParams.where[Op.and].push(filters)
          } else {
            findParams.where[Op.and] = filters
          }
        } else {
          findParams.where[filter.column.field] =
            filter.column.field === 'roles' ? `{${filter.value}}` : filter.value
        }
      }
    })
  }

  console.log(
    'findParamsFor gonna return findParams:',
    JSON.stringify(findParams)
  )
  return findParams
}

const getUsers = async query => {
  let findParams = findParamsFor(query)

  const q = query.search || ''
  if (q) {
    findParams.where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { email: { [Op.iLike]: `%${q}%` } }
    ]
  }

  return await User.findAndCountAll(findParams)
}

app.post('/users', passport.authenticate('jwt', { session: false }), function(
  req,
  res
) {
  // console.log('/products req.body:', JSON.stringify(req.body))

  getUsers(req.body).then(result =>
    res.json({
      data: result.rows,
      page: req.body && req.body.page ? req.body.page : 0,
      totalCount: result.count
    })
  )
})

const Product = models.Product

const getProducts = async query => {
  let findParams = findParamsFor(query)

  const q = query.search || ''
  if (q) {
    // category sub_category name description
    findParams.where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { description: { [Op.iLike]: `%${q}%` } },
      { sub_category: { [Op.iLike]: `%${q}%` } },
      { category: { [Op.iLike]: `%${q}%` } }
    ]
  }

  return await Product.findAndCountAll(findParams)
}

app.post('/products', function(req, res) {
  // console.log('/products req.body:', JSON.stringify(req.body))

  getProducts(req.body).then(result =>
    res.json({
      data: result.rows,
      page: req.body && req.body.page ? req.body.page : 0,
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

app.listen(3000, function() {
  console.log('Express is running on port 3000')
})
