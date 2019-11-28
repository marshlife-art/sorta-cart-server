'use strict'
const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      data: DataTypes.JSONB,
      email_confirmed: DataTypes.BOOLEAN,
      auth_key: DataTypes.STRING,
      password: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      roles: DataTypes.ENUM('admin', 'member', 'guest')
    },
    {
      hooks: {
        beforeCreate: user => {
          if (user.password) {
            user.password = bcrypt.hashSync(user.password, 10)
          }
        },
        beforeUpdate: user => {
          if (user.password && user.changed('password')) {
            user.password = bcrypt.hashSync(user.password, 10)
          }
        }
      }
    }
  )

  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
  }

  // User.associate = function(models) {
  //   // associations can be defined here
  // }
  return User
}
