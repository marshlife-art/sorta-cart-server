'use strict'
module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define(
    'Page',
    {
      href: DataTypes.STRING,
      content: DataTypes.TEXT
    },
    {}
  )
  Page.associate = function(models) {
    // associations can be defined here
  }
  return Page
}
