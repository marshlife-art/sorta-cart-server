'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Products', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        unf: {
          type: Sequelize.STRING
        },
        upc_code: {
          type: Sequelize.STRING
        },
        category: {
          type: Sequelize.STRING
        },
        sub_category: {
          type: Sequelize.STRING
        },
        name: {
          type: Sequelize.STRING
        },
        description: {
          type: Sequelize.STRING
        },
        pk: {
          type: Sequelize.INTEGER
        },
        size: {
          type: Sequelize.STRING
        },
        unit_type: {
          type: Sequelize.STRING
          //Sequelize.ENUM('CS', 'EA', 'LB')
        },
        ws_price: {
          type: Sequelize.DECIMAL(10, 2)
        },
        u_price: {
          type: Sequelize.DECIMAL(10, 2)
        },
        ws_price_cost: {
          type: Sequelize.DECIMAL(10, 2)
        },
        u_price_cost: {
          type: Sequelize.DECIMAL(10, 2)
        },
        codes: {
          type: Sequelize.STRING
        },
        vendor: {
          type: Sequelize.STRING
        },
        import_tag: {
          type: Sequelize.STRING
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
      .then(() => queryInterface.addIndex('Products', ['category']))
      .then(() => queryInterface.addIndex('Products', ['sub_category']))
      .then(() => queryInterface.addIndex('Products', ['ws_price']))
      .then(() => queryInterface.addIndex('Products', ['u_price']))
      .then(() => queryInterface.addIndex('Products', ['import_tag']))
      .then(() => queryInterface.addIndex('Products', ['unf']))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Products')
  }
}
