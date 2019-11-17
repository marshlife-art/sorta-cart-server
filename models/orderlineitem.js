'use strict'
module.exports = (sequelize, DataTypes) => {
  const OrderLineItem = sequelize.define(
    'OrderLineItem',
    {
      quantity: DataTypes.INTEGER,
      total: DataTypes.DECIMAL(10, 2),
      kind: DataTypes.STRING,
      data: DataTypes.JSONB
    },
    {}
  )
  OrderLineItem.associate = function(models) {
    // associations can be defined here
    OrderLineItem.belongsTo(models.Order)
  }
  return OrderLineItem
}
