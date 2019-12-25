'use strict'
module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define(
    'Member',
    {
      registration_email: DataTypes.STRING,
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      discount: DataTypes.DECIMAL,
      discount_type: DataTypes.STRING,
      fees_paid: DataTypes.DECIMAL(10, 2),
      store_credit: DataTypes.DECIMAL(10, 2),
      shares: DataTypes.DECIMAL,
      member_type: DataTypes.STRING,
      data: DataTypes.JSONB
    },
    {}
  )
  Member.associate = function(models) {
    // member will carry the UserId column
    Member.belongsTo(models.User)
  }
  return Member
}
