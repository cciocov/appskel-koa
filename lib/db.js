/**
 *
 * Setup database connection and models, using Sequelize.
 *
 */
'use strict';

var fs = require('fs'),
    Sequelize = require('sequelize'),
    cfg = require('../config').database;

var sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
  host: cfg.host,
  dialect: cfg.dialect || 'mysql',
  dialectOptions: cfg.dialectOptions || {},
  pool: {
    idle: cfg.poolIdle || 0,
    min: cfg.poolMin || 0,
    max: cfg.poolMax || 10
  },

  // globals for all models:
  define: {
    classMethods: {

      // parse a Sequelize error object and transform it into something the
      // frontend can consume:
      parseError: function(err) {
        var error = {}, field, message;

        //error.__raw = err;

        for (var i = 0; i < err.errors.length; i++) {
          field = err.errors[i].path;
          message = null;

          //if (!error[field]) {
          //  error[field] = [];
          //}

          switch (err.errors[i].type) {
            case 'unique violation':
              message = this.attributes[field].uniqueMsg;
            break;
          }

          //error[field].push(message || err.errors[i].message);
          error[field] = message || err.errors[i].message;
        }

        return error;
      }
    }
  }
});

var models = module.exports = {};

fs
  .readdirSync(__dirname + '/models')
  .filter(function(file) {
    return file.match(/.+\.js$/);
  })
  .forEach(function(file) {
    var model = sequelize.import(__dirname + '/models/' + file);
    models[model.name] = model;
  });

// setup model associations:
Object.keys(models).forEach(function(modelName) {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;
