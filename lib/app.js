/**
 *
 * Application main module.
 *
 */
'use strict';

var config = require('../config'),
    koa = require('koa'),
    koaMount = require('koa-mount'),
    koaStatic = require('koa-static'),
    path = require('path'),
    router = require('./router'),
    views = require('./views'),
response = require('./response');

var app = module.exports = koa();

// keys used to sign cookies (and session data):
app.keys = config.security.keys;

// views support:
views(app);

// uniform responses to clients:
response(app);

// serve static files first:
var rootdir = path.resolve(__dirname, '..');
app.use(koaStatic(rootdir + '/webroot'));
if (app.env == 'development') {
  // in development provide access to raw/unminified javascript and css files:
  app.use(koaMount('/client', koaStatic(rootdir + '/client')));
}

// routing:
app.use(router(app).routes());
