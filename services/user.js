const findParamsFor = require('../util/findParamsFor')
const models = require('../models')

const User = models.User
const Op = models.Sequelize.Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const createUser = async ({ email }) => {
  return await User.create({ email })
}

const getUser = async obj => {
  return await User.findOne({
    where: obj
  })
}

const getUsers = async query => {
  let findParams = findParamsFor(query)

  const q = query.search || ''
  if (q) {
    findParams.where[Op.or] = [
      { name: { [iLike]: `%${q}%` } },
      { email: { [iLike]: `%${q}%` } }
    ]
  }

  return await User.findAndCountAll(findParams)
}

const destroyUser = async ({ id }) => {
  return await User.destroy({ where: { id: id } })
}

module.exports = { createUser, getUser, getUsers, destroyUser }
