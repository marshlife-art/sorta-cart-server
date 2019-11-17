const assert = require('assert')
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

describe('models', function() {
  describe('User', function() {
    // .sync to clear the Users table rows before each test run
    beforeEach(async function() {
      await models.User.sync({ force: true, match: /_test$/, logging: false })
    })

    it('should create users', async function() {
      const user = await models.User.create(GUEST)

      assert.equal(user.name, GUEST.name)
      assert.equal(user.email, GUEST.email)
      assert.equal(user.roles, GUEST.roles)
    })

    it('should hash password', async function() {
      const member = await models.User.create(MEMBER)

      assert.notEqual(member.password, MEMBER.password)
      assert.ok(member.validPassword(MEMBER.password))
    })

    it('should re-hash password when changed', async function() {
      await models.User.create(ADMIN)
      const admin = await models.User.findOne({ where: { email: ADMIN.email } })
      const old_pass = admin.password
      admin.password = 'somenewpassword'
      await admin.save()

      assert.notEqual(old_pass, admin.password)
      assert.notEqual(admin.password, 'somenewpassword')
    })
  })
})
