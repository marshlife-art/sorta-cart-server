'use strict'
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      status: DataTypes.STRING,
      payment_status: DataTypes.STRING,
      shipment_status: DataTypes.STRING,
      total: DataTypes.DECIMAL(10, 2),
      subtotal: DataTypes.DECIMAL(10, 2),
      item_count: DataTypes.INTEGER,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      notes: DataTypes.TEXT,
      email_sent: DataTypes.BOOLEAN,
      history: DataTypes.JSONB
    },
    {}
  )
  Order.associate = function(models) {
    Order.belongsTo(models.User)
    Order.belongsTo(models.Member)
    Order.hasMany(models.OrderLineItem, { onDelete: 'cascade', hooks: true })
  }
  return Order
}
