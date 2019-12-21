const assert = require('assert')
const {
  getUsers,
  getUser,
  createUser,
  destroyUser
} = require('../../services/user')
const { createFakeUsers } = require('../fixtures/users')

describe('services', function() {
  describe('user', function() {
    before(async function() {
      return createFakeUsers()
    })

    // #TODO: rework roles/role column...
    // it('should filter users by role', async function() {
    //   const admins = await getUsers({
    //     filters: [
    //       {
    //         column: {
    //           field: 'roles'
    //         },
    //         // note: NOT an array
    //         value: 'admin'
    //       }
    //     ]
    //   })
    //   assert.equal(admins.count, 1)
    //   assert.equal(admins.rows.length, 1)
    // })

    it('should filter with search query', async function() {
      const admins = await getUsers({
        search: 'admin'
      })
      assert.equal(admins.count, 1)
      assert.equal(admins.rows.length, 1)
    })

    it('should filter users by name', async function() {
      const some_member = await getUsers({
        filters: [
          {
            column: {
              field: 'name'
            },
            // note: NOT an array
            value: 'some member'
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