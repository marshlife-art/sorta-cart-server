'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Members', {
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
        registration_email: {
          type: Sequelize.STRING
        },
        name: {
          type: Sequelize.STRING
        },
        phone: {
          type: Sequelize.STRING
        },
        address: {
          type: Sequelize.STRING
        },
        discount: {
          type: Sequelize.DECIMAL
        },
        discount_type: {
          type: Sequelize.STRING
        },
        fees_paid: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0
        },
        store_credit: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0
        },
        shares: {
          type: Sequelize.DECIMAL,
          defaultValue: 0
        },
        member_type: {
          type: Sequelize.STRING
        },
        data: {
          type: Sequelize.JSONB,
          defaultValue: {}
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
      .then(() =>
        queryInterface.addColumn('Orders', 'MemberId', {
          type: Sequelize.INTEGER,
          references: {
            model: 'Members',
            key: 'id'
          }
        })
      )
      .then(() => queryInterface.addIndex('Orders', ['MemberId']))
      .then(() => queryInterface.addIndex('Members', ['UserId']))
      .then(() => queryInterface.addIndex('Members', ['registration_email']))
      .then(() => queryInterface.addIndex('Members', ['name']))
      .then(() => queryInterface.addIndex('Members', ['phone']))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface
      .removeColumn('Orders', 'MemberId')
      .then(() => queryInterface.removeIndex('Orders', ['MemberId']))
      .then(() => queryInterface.dropTable('Members'))
  }
}
