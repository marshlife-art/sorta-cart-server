const models = require('../../models')

const GUEST = {
  name: 'guest',
  email: 'guest@marshcoop.org',
  password: 'zomgzomg',
  roles: ['guest']
}
const MEMBER = {
  name: 'some member',
  email: 'a@mem.ber',
  password: 'immamember',
  roles: ['member']
}
const ADMIN = {
  name: 'admin',
  email: 'admin@marshcoop.org',
  password: 'zomgzomg',
  roles: ['admin']
}

async function createUser(user) {
  user = user || GUEST

  return await models.User.create(user)
}

module.exports = { GUEST, MEMBER, ADMIN, createUser }
