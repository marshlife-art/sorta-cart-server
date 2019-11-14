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
        name: {
          type: Sequelize.STRING
        },
        email: {
          allowNull: false,
          type: Sequelize.STRING
        },
        email_confirmed: {
          type: Sequelize.BOOLEAN
        },
        confirmation_key: {
          type: Sequelize.STRING
        },
        password: {
          type: Sequelize.STRING
        },
        active: {
          type: Sequelize.BOOLEAN
        },
        roles: {
          type: Sequelize.ENUM('admin', 'member', 'guest')
        },
        data: {
          type: Sequelize.JSONB,
          defaultValue: {}
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
      .then(() =>
        queryInterface.addIndex('Users', ['email'], {
          indicesType: 'UNIQUE'
        })
      )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  }
}
