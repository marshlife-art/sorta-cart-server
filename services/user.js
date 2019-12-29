const findParamsFor = require('../util/findParamsFor')
const models = require('../models')
const { sendRegistrationEmail } = require('../mailers/user_mailer')

const User = models.User
const Op = models.Sequelize.Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const createUser = async ({ email, role }) => {
  const user = await User.create({ email, role })
  await sendRegistrationEmail(user.email, user.reg_key)
  return user
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
      // { name: { [iLike]: `%${q}%` } },
      { email: { [iLike]: `%${q}%` } }
    ]
  }

  return await User.findAndCountAll(findParams)
}

const destroyUser = async ({ id }) => {
  return await User.destroy({ where: { id: id } })
}

const registerUser = async (reg_key, password) => {
  return await User.findOne({ where: { reg_key } }).then(user => {
    user.password = password
    user.reg_key = null
    user.email_confirmed = true
    user.active = true
    return user.save()
  })
}

module.exports = { createUser, getUser, getUsers, destroyUser, registerUser }
