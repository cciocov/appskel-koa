/**
 *
 * User model.
 *
 */
'use strict';

var randomstring = require('randomstring');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    token: {
      type: DataTypes.CHAR(32),
      allowNull: false,
      defaultValue: function() {
        return randomstring.generate(32);
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    //tableName: '',

    classMethods: {
      associate: function(models) {
      }
    }
  });
};
