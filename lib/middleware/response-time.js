var koaResponseTime = require('koa-response-time');

module.exports = function(app) {
  return koaResponseTime();
};
