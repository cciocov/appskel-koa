/**
 *
 * Configuration loader.
 *
 */
'use strict';

var _ = require('lodash');

// read all configuration:
var cfg = module.exports = require('require-all')(__dirname);

// apply environment specific settings:
var env = process.env.NODE_ENV || 'development';
_.merge(cfg, cfg.env[env] || {}, cfg.env.local || {});

// delete any unneeded keys:
delete cfg.env;
delete cfg.index;
