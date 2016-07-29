module.exports = function(app) {
  return (function *auth(next) {
    yield next;
  });
};
