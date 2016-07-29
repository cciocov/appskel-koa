/**
 *
 * Configure views.
 *
 */
'use strict';

var views = require('co-views'),
    _ = require('lodash'),
    rootdir = require('path').resolve(__dirname, '..'),
    config = require('../config');

module.exports = function(app) {
  var viewsDir = rootdir + '/views',
      minified = (app.env != 'development' || process.env.MINIFIED == 1);

  // use compiled views unless we're in development mode:
  if (minified) {
    viewsDir += '/.min';
  }

  var render = views(viewsDir, config.views);

  /**
   * Render a view.
   */
  app.context.render = function *(view, data) {
    data = _.defaults(data || {}, this.state, {
      //pretty: !minified,
      _: _
    });
    this.body = yield render(view, data);
  };

  /**
   * Render the "default" view for a controller and action.
   */
  app.context.view = function *(data, customView) {
    var view = [
      'controllers',
      this.state.controllerName.replace(/\./g, '/'),
      customView || this.state.actionName
    ].join('/');

    yield this.render(view, data);
  };
};
