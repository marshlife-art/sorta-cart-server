'use strict'
module.exports = (sequelize, DataTypes) => {
  const WholesaleOrder = sequelize.define(
    'WholesaleOrder',
    {
      vendor: DataTypes.STRING,
      notes: DataTypes.STRING,
      status: DataTypes.STRING,
      payment_status: DataTypes.STRING,
      shipment_status: DataTypes.STRING
    },
    {}
  )
  WholesaleOrder.associate = function(models) {
    WholesaleOrder.hasMany(models.OrderLineItem)
  }
  return WholesaleOrder
}
