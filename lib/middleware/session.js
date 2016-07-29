var koaSession = require('koa-session');

module.exports = function(app) {
  return koaSession(app);
};
