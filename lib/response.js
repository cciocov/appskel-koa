/**
 *
 * Respond to client requests in a standardized manner.
 *
 */
'use strict';

var HTTP_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_ACCEPTABLE: 406
};

module.exports = function(app) {
  /**
   * Generic function to send a response to a client.
   */
  app.context.reply = function (data, code, message) {
    var body = data || {};
    if (message) {
      body = {
        data: data || {},
        message: message
      };
    }

    this.status = HTTP_CODES[code || 'SUCCESS'] || 520;
    this.body = body;
  };
};
