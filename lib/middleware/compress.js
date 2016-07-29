var koaCompress = require('koa-compress');

module.exports = function(app) {
  return koaCompress();
};
