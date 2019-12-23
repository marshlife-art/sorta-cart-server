'use strict'
const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      email: DataTypes.STRING,
      role: DataTypes.STRING,
      name: DataTypes.STRING,
      password: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      email_confirmed: DataTypes.BOOLEAN,
      auth_key: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      data: DataTypes.JSONB
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

  User.associate = function(models) {
    User.hasMany(models.Order)
  }
  return User
}
