'use strict'
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
    {}
  )
  User.associate = function(models) {
    // associations can be defined here
  }
  return User
}
