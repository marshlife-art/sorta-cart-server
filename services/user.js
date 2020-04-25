const findParamsFor = require('../util/findParamsFor')
const models = require('../models')
const {
  sendConfirmationEmail,
  sendAdminRegistrationEmail
} = require('../mailers/user_mailer')

const User = models.User
const Op = models.Sequelize.Op
// using sqlite in test env so no iLike :/
const iLike = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike

const createUser = async ({ email, role }) => {
  const user = await User.create({ email, role })
  try {
    await sendAdminRegistrationEmail(user.email, user.reg_key)
  } catch (err) {
    console.warn('onoz! sendAdminRegistrationEmail caught error:', err)
  }
  return user
}

const getUser = async (obj) => {
  return await User.findOne({
    where: obj
  })
}

const getUserByEmail = async (email) => {
  return await User.findOne({
    where: models.Sequelize.where(
      models.Sequelize.fn('lower', models.Sequelize.col('email')),
      models.Sequelize.fn('lower', email)
    )
  })
}

const getUsers = async (query) => {
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

const confirmUser = async (reg_key) => {
  return await User.findOne({ where: { reg_key } }).then((user) => {
    user.reg_key = null
    user.email_confirmed = true
    user.active = true
    return user.save()
  })
}

const createNewMemberUser = async (email) => {
  return await User.create({ email, role: 'member' })
}

const registerMember = async (email, password) => {
  const newUser = await User.create({ email, password, role: 'member' })
  try {
    await sendConfirmationEmail(newUser.email, newUser.reg_key)
  } catch (err) {
    console.warn('onoz! cound not sendConfirmationEmail! caught error:', err)
  }
  return newUser
}

const isEmailAvailable = async (email) => {
  return User.count({
    where: models.Sequelize.where(
      models.Sequelize.fn('lower', models.Sequelize.col('email')),
      models.Sequelize.fn('lower', email)
    )
  }).then((count) => count === 0)
}

module.exports = {
  createUser,
  getUser,
  getUserByEmail,
  getUsers,
  destroyUser,
  registerMember,
  confirmUser,
  isEmailAvailable,
  createNewMemberUser
}
