'use strict'
module.exports = (sequelize, DataTypes) => {
  const WholesaleOrder = sequelize.define(
    'WholesaleOrder',
    {
      quantity: DataTypes.INTEGER,
      unique_item_count: DataTypes.INTEGER,
      total: DataTypes.DECIMAL(10, 2),
      data: DataTypes.JSONB
    },
    {}
  )
  WholesaleOrder.associate = function(models) {
    // associations can be defined here
    WholesaleOrder.hasMany(models.Order)
  }
  return WholesaleOrder
}
