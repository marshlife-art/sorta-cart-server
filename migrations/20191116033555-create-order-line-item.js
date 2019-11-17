'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('OrderLineItems', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        OrderId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Orders',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        quantity: {
          type: Sequelize.INTEGER
        },
        total: {
          type: Sequelize.DECIMAL(10, 2)
        },
        kind: {
          type: Sequelize.STRING
        },
        data: {
          type: Sequelize.JSONB
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
      .then(() => queryInterface.addIndex('OrderLineItems', ['OrderId']))
      .then(() => queryInterface.addIndex('OrderLineItems', ['kind']))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('OrderLineItems')
  }
}
