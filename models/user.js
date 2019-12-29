'use strict'
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      email: DataTypes.STRING,
      role: DataTypes.STRING,
      password: DataTypes.STRING,
      email_confirmed: DataTypes.BOOLEAN,
      auth_key: DataTypes.STRING,
      reg_key: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      data: DataTypes.JSONB
    },
    {
      hooks: {
        beforeCreate: user => {
          if (user.password) {
            user.password = bcrypt.hashSync(user.password, 10)
          }
          user.generateRegKey()
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

  User.prototype.generateRegKey = function() {
    const reg_key = crypto.randomBytes(32).toString('hex')
    this.setDataValue('reg_key', reg_key)
    return reg_key
  }

  User.associate = function(models) {
    User.hasMany(models.Order)
    User.hasOne(models.Member)
  }
  return User
}
