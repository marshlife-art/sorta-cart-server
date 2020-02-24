const assert = require('assert')
const {
  getUsers,
  getUser,
  getUserByEmail,
  createUser,
  destroyUser,
  isEmailAvailable
} = require('../../services/user')
const { createFakeUsers } = require('../fixtures/users')

describe('services', function() {
  describe('user', function() {
    before(async function() {
      return createFakeUsers()
    })

    it('should filter users by role', async function() {
      const admins = await getUsers({
        filters: [
          {
            column: {
              field: 'role'
            },
            // note: NOT an array
            value: 'admin'
          }
        ]
      })
      assert.equal(admins.count, 1)
      assert.equal(admins.rows.length, 1)
    })

    it('should filter with search query', async function() {
      const admins = await getUsers({
        search: 'admin'
      })
      assert.equal(admins.count, 1)
      assert.equal(admins.rows.length, 1)
    })

    it('should filter users by email', async function() {
      const some_member = await getUsers({
        filters: [
          {
            column: {
              field: 'email'
            },
            // note: NOT an array
            value: 'a@mem.ber'
          }
        ]
      })
      assert.equal(some_member.count, 1)
      assert.equal(some_member.rows.length, 1)
    })

    it('should filter users by multiple colz', async function() {
      const some_member = await getUsers({
        filters: [
          {
            column: {
              field: 'email'
            },
            // note: NOT an array
            value: 'a@mem.ber'
          },
          {
            column: {
              field: 'role'
            },
            // note: IS an array
            value: ['member']
          }
        ]
      })
      assert.equal(some_member.count, 1)
      assert.equal(some_member.rows.length, 1)
    })

    it('should get a user by id', async function() {
      const user = await getUser({ id: 1 })
      assert.equal(user.id, 1)
    })

    it('get user by email', async function() {
      const user = await getUserByEmail('admin@marshcoop.org')
      assert.equal(user.email, 'admin@marshcoop.org')
    })

    it('should handle case insensitive email', async function() {
      const user = await getUserByEmail('GUEST@marshcoop.org')
      assert.equal(user.email, 'guest@marshcoop.org')
    })

    it('should be able to confirm is email is available', async function() {
      const available = await isEmailAvailable('guest@marshcoop.org')
      assert.equal(available, false)
    })

    it('should be able to confirm is email is available. regardless of case', async function() {
      const available = await isEmailAvailable('GUEST@marshcoop.org')
      assert.equal(available, false)
    })
  })

  it('should create a user with email', async function() {
    const email = 'imma.just@sign.up'
    const user = await createUser({ email })
    assert.equal(user.email, email)
  })

  it('should destroy users', async function() {
    const users = await getUsers({})
    const user_count = users.count
    destroyUser({ id: users.rows[0].id })
    const usersAfterDestroy = await getUsers({})
    assert.equal(usersAfterDestroy.count, user_count - 1)
  })
})
