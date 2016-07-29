/**
 *
 * Set application routes (defined in config/routes.js).
 *
 */
'use strict';

var koaCompose = require('koa-compose'),
    koaRouter = require('koa-router'),
    _ = require('lodash'),
    config = require('../config'),
    utils = require('./utils'),
    debug = require('debug')('app:router'),
    mwCache = {};

// load all controllers:
var controllers = require('require-all')(__dirname + '/controllers');

module.exports = function(app) {
  var routes = [];

  // add all implicit rules, based on existing controllers:
  (function addRoute(obj, prefix) {
    // add routes defined in controller:
    var seenActions = [];
    if (obj._routes) {
      _.each(obj._routes, function(route) {
        // replace ~ with the actual (standard) URL to this controller/action:
        route = route.replace('~', '/' + prefix.replace('.', '/'));

        route = route.trim().split(/\s+/);

        // make sure we don't add any implicit rules (below) for this action:
        seenActions.push(route[route.length - 1]);

        // add full path to this controller action:
        route[route.length - 1] = prefix + '.' + route[route.length - 1];

        routes.push(route.join(' '));
      });
    }

    // add implicit routes for all controller methods for which we didn't have
    // a route defined above:
    for (var key in obj) {
      if (_.isFunction(obj[key]) && _.indexOf(seenActions, key) == -1) {
        var handler = prefix + '.' + key,
            path = prefix.split('.');

        if (key != 'index') {
          path.push(utils.uncamelize(key));
        }

        var route = [
          'all', '/' + path.join('/').toLowerCase(), handler
        ].join(' ');

        routes.push(route);
      }
      else {
        if (!key.match(/^_/) && _.isPlainObject(obj[key])) {
          addRoute(obj[key], prefix + (prefix ? '.' : '') + key);
        }
      }
    }
  })(controllers, '');

  // add routes defined in configuration:
  var routes = routes.concat(config.routes);

  // create a router:
  var router = new koaRouter();

  // add all routes to the router:
  _.each(routes, function(route) {
    route = route.trim().split(/\s+/);
    var verb = route.length == 3 ? route[0].toLowerCase() : 'all',
        path = route.length == 3 ? route[1] : route[0],
        handler = route[route.length - 1];

    // compose middleware for this route's handler:
    var mw = compose(handler, app);

    if (mw) {
      debug(verb.toUpperCase(), path, '->', handler);
      router[verb](path, mw);
    }
  });

  return router;
};

/**
 * Compose middleware for a route's handler.
 */
function compose(handler, app) {
  var mw = [];

  if (handler.match(/^view:/)) {
    // handler is a simple view:

    mw.push(function *() {
      yield this.render(handler.substr(5));
    });
  }
  else {
    // handler is a controller/action:

    // break handler into controller and action:
    var matches = handler.match(/^(.*)\.(.*)$/);

    var controllerName = matches[1],
        actionName = matches[2],
        controller = _.at(controllers, controllerName)[0],
        action = controller[actionName],
        _config = controller._config || {},
        _config = _.extend({}, _config['*'], _config[actionName]);

    _.each(config.middleware, function(_mw) {
      switch (_mw) {
        case '$handlerInfo':
          mw.push(function *handlerInfo(next) {
            _.extend(this.state, {
              controllerName: controllerName,
              actionName: actionName
            });

            // expose handler configuration:
            this._config = _config;

            yield next;
          });
        break;

        case '$handlerMiddleware':
          if (_.isArray(_config.middleware) && _config.middleware.length) {
            mw = mw.concat(load(_config.middleware));
          }
        break;

        case '$handler':
          mw.push(action);
        break;

        default:
          mw = mw.concat(load(_mw));
      }
    });
  }

  return koaCompose(mw);


  // load one or more middleware modules:
  function load(mw) {
    if (!_.isArray(mw)) {
      mw = [mw];
    }

    return _.map(mw, function(mw) {
      return mwCache[mw] || (mwCache[mw] = require('./middleware/' + mw)(app));
    });
  }
}
