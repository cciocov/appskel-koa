/**
 *
 * Home Controller
 *
 */
'use strict';

/**
 * Controller configuration.
 */
module.exports._config = {
  '*': {
    public: true
  }
};


/**
 * Index Action
 */
module.exports.index = function *() {
  yield this.view();
};
