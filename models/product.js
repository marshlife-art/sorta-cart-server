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
      codes: DataTypes.STRING,
      import_tag: DataTypes.STRING,
      vendor: DataTypes.STRING
    },
    {}
  )
  // Product.associate = function(models) {
  //   // associations can be defined here
  // }
  return Product
}
