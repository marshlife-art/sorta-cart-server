'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        email: {
          allowNull: false,
          type: Sequelize.STRING
        },
        role: {
          type: Sequelize.STRING
        },
        email_confirmed: {
          type: Sequelize.BOOLEAN
        },
        auth_key: {
          type: Sequelize.STRING
        },
        password: {
          type: Sequelize.STRING
        },
        active: {
          type: Sequelize.BOOLEAN
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
        queryInterface.addIndex('Users', ['email'], {
          unique: true
        })
      )
      .then(() => queryInterface.addIndex('Users', ['role']))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  }
}
