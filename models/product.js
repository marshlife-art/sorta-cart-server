'use strict'
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      unf: DataTypes.STRING,
      upc_code: DataTypes.STRING,
      category: DataTypes.STRING,
      sub_category: DataTypes.STRING,
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      pk: DataTypes.INTEGER,
      size: DataTypes.STRING,
      unit_type: DataTypes.STRING,
      ws_price: DataTypes.DECIMAL(10, 2),
      u_price: DataTypes.DECIMAL(10, 2),
      ws_price_cost: DataTypes.DECIMAL(10, 2),
      u_price_cost: DataTypes.DECIMAL(10, 2),
      codes: DataTypes.STRING,
      import_tag: DataTypes.STRING,
      vendor: DataTypes.STRING,
      count_on_hand: DataTypes.INTEGER,
      no_backorder: DataTypes.BOOLEAN
    },
    {}
  )
  Product.prototype.addCountOnHand = function (on_hand_change) {
    // try to make sure two values are integers
    if (isNaN(parseInt(on_hand_change))) {
      console.warn(
        'Product.addCountOnHand() on_hand_change is NaN returning early!'
      )
      return
    }
    const initialCount = isNaN(parseInt(this.count_on_hand))
      ? 0
      : parseInt(this.count_on_hand)

    this.setDataValue('count_on_hand', initialCount + parseInt(on_hand_change))
    this.save()
  }

  return Product
}
