const assert = require('assert')

const models = require('../../models')
const { GUEST, MEMBER, ADMIN, createUser } = require('../fixtures/users')

describe('models', function() {
  describe('User', function() {
    // .sync to clear the Users table rows before each test run
    before(async function() {
      await models.User.sync({ force: true, match: /_test$/, logging: false })
    })

    it('should create users', async function() {
      const user = await createUser(GUEST)

      assert.equal(user.name, GUEST.name)
      assert.equal(user.email, GUEST.email)
      assert.equal(user.roles, GUEST.roles)
    })

    it('should hash password', async function() {
      const member = await createUser(MEMBER)

      assert.notEqual(member.password, MEMBER.password)
      assert.ok(member.validPassword(MEMBER.password))
    })

    it('should re-hash password when changed', async function() {
      await createUser(ADMIN)
      const admin = await models.User.findOne({ where: { email: ADMIN.email } })
      const old_pass = admin.password
      admin.password = 'somenewpassword'
      await admin.save()

      assert.notEqual(old_pass, admin.password)
      assert.notEqual(admin.password, 'somenewpassword')
    })
  })
})
