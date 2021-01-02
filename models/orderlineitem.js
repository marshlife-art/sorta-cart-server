'use strict'
module.exports = (sequelize, DataTypes) => {
  const OrderLineItem = sequelize.define(
    'OrderLineItem',
    {
      price: DataTypes.DECIMAL(10, 2),
      quantity: DataTypes.INTEGER,
      total: DataTypes.DECIMAL(10, 2),
      kind: DataTypes.STRING,
      description: DataTypes.STRING,
      vendor: DataTypes.STRING,
      selected_unit: DataTypes.STRING,
      status: DataTypes.STRING,
      data: DataTypes.JSONB
    },
    {}
  )
  OrderLineItem.associate = function (models) {
    OrderLineItem.belongsTo(models.Order)
    OrderLineItem.belongsTo(models.WholesaleOrder)
  }
  return OrderLineItem
}
