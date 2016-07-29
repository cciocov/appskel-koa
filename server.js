/**
 *
 * Application server.
 *
 */
'use strict';

var cluster = require('cluster'),
    debug = require('debug')('app:server');

if (cluster.isMaster) {
  // master process - read command line options
  var program = require('commander'),
      co = require('co'),
      packageJSON = require('./package.json');

  program
    .version(packageJSON.version)
    .option('-p, --prod', 'run in production environment')
    .option('-m, --minified', 'use minified assets (implied in production)')
    .option('-c, --concurrent [n]', 'start n instances', parseInt)
    .option('-A, --addr <bind address>', 'address to bind the server (default: 127.0.0.1)')
    .option('-P, --port <port>', 'server port (default: 3000)')
    .option('-d, --debug', 'enable debugging')
    .parse(process.argv);

  // environment variables (to pass to the worker process):
  var env = {};

  if (program.prod) {
    env.NODE_ENV = 'production';
  }

  if (program.minified) {
    env.MINIFIED = 1;
  }

  if (program.addr) {
    env.ADDR = program.addr;
  }

  if (program.port) {
    env.PORT = program.port;
  }

  if (program.debug) {
    env.DEBUG = 'app:*';
  }

  // determine number of application instances to start:
  var n = 1;
  if (program.concurrent === true || !isNaN(program.concurrent)) {
    var cpus = require('os').cpus().length;
    n = (program.concurrent === true ? cpus - 1 : program.concurrent);

    // sanity check:
    n = Math.max(1, Math.min(cpus, n));
  }

  co(function *() {
    debug('starting workers...');
    for (var i = 0; i < n; i++) {
      cluster.fork(env);
    }
  
    // restart workers in case they crash:
    cluster.on('exit', function(worker) {
      var pid = worker.process.pid;
      debug('worker [%d] died, starting new worker...', pid);
      cluster.fork(env);
    });
  });
}
else {
  // worker process
  startApp();
}

/**
 * Start an application instance.
 */
function startApp() {
  var app = require('./lib/app'),
      cfg = require('./config/server'),
      pid = process.pid,
      addr = process.env.ADDR || cfg.addr || '127.0.0.1',
      port = process.env.PORT || cfg.port || 3000;

  app.listen(port, addr, function() {
    debug('worker [%s] now listening on %s:%s', pid, addr, port);
  });
}
