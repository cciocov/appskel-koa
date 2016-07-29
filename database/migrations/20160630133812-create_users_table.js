'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.resolve()
      .then(function() {
        return queryInterface.createTable('users', {
          id: {
            type: Sequelize.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
          },
          token: {
            type: Sequelize.CHAR(32),
            allowNull: false,
            unique: true
          },
          email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
          },
          firstName: {
            type: Sequelize.STRING,
            allowNull: false
          },
          lastName: {
            type: Sequelize.STRING,
            allowNull: false
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        });
      });
  },

  down: function (queryInterface, Sequelize) {
    return Promise.resolve()
      .then(function() {
        return queryInterface.dropTable('users');
      });
  }
};
