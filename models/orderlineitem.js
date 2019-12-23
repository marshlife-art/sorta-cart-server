'use strict'
module.exports = (sequelize, DataTypes) => {
  const OrderLineItem = sequelize.define(
    'OrderLineItem',
    {
      quantity: DataTypes.INTEGER,
      total: DataTypes.DECIMAL(10, 2),
      kind: DataTypes.STRING,
      vendor: DataTypes.STRING,
      data: DataTypes.JSONB
    },
    {}
  )
  OrderLineItem.associate = function(models) {
    OrderLineItem.belongsTo(models.Order)
    OrderLineItem.belongsTo(models.WholesaleOrder)
  }
  return OrderLineItem
}
