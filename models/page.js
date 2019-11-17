'use strict'
module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define(
    'Page',
    {
      slug: DataTypes.STRING,
      content: DataTypes.TEXT
    },
    {}
  )
  // Page.associate = function(models) {
  //   // associations can be defined here
  // }
  return Page
}
