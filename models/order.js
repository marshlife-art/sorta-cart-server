'use strict'
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      status: DataTypes.STRING,
      payment_status: DataTypes.STRING,
      shipment_status: DataTypes.STRING,
      total: DataTypes.DECIMAL(10, 2),
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      notes: DataTypes.STRING,
      line_items: DataTypes.JSONB,
      history: DataTypes.JSONB
    },
    {}
  )
  Order.associate = function(models) {
    // associations can be defined here
  }
  return Order
}
