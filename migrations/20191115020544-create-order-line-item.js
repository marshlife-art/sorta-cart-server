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
        WholesaleOrderId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'WholesaleOrders',
            key: 'id'
          }
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
        vendor: {
          type: Sequelize.STRING
        },
        selected_unit: {
          type: Sequelize.STRING
        },
        data: {
          type: Sequelize.JSONB
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      })
      .then(() => queryInterface.addIndex('OrderLineItems', ['OrderId']))
      .then(() => queryInterface.addIndex('OrderLineItems', ['kind']))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('OrderLineItems')
  }
}
