'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Orders', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        UserId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        status: {
          type: Sequelize.STRING
        },
        payment_status: {
          type: Sequelize.STRING
        },
        shipment_status: {
          type: Sequelize.STRING
        },
        total: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0
        },
        subtotal: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false
        },
        phone: {
          type: Sequelize.STRING
        },
        address: {
          type: Sequelize.STRING
        },
        notes: {
          type: Sequelize.TEXT
        },
        email_sent: {
          type: Sequelize.BOOLEAN
        },
        item_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        history: {
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
      .then(() => queryInterface.addIndex('Orders', ['email']))
      .then(() => queryInterface.addIndex('Orders', ['name']))
      .then(() => queryInterface.addIndex('Orders', ['status']))
      .then(() => queryInterface.addIndex('Orders', ['payment_status']))
      .then(() => queryInterface.addIndex('Orders', ['shipment_status']))
      .then(() => queryInterface.addIndex('Orders', ['UserId']))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Orders')
  }
}
