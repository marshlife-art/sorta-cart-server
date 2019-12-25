const models = require('../../models')

const GUEST = {
  email: 'guest@marshcoop.org',
  password: 'zomgzomg',
  role: 'guest'
}
const MEMBER = {
  email: 'a@mem.ber',
  password: 'immamember',
  role: 'member'
}
const ADMIN = {
  email: 'admin@marshcoop.org',
  password: 'zomgzomg',
  role: 'admin'
}

async function createUser(user) {
  user = user || GUEST

  return await models.User.create(user)
}

async function createFakeUsers() {
  await models.User.sync({ force: true, match: /_test$/, logging: false })
  await models.User.create(GUEST)
  await models.User.create(MEMBER)
  await models.User.create(ADMIN)
}
module.exports = { GUEST, MEMBER, ADMIN, createUser, createFakeUsers }
