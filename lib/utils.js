/**
 *
 * Support functions.
 *
 */
'use strict';

/**
 * Transform from "camelCaseXYZ" to "camel-case-xyz".
 */
module.exports.uncamelize = function(camel, sep) {
  if (!sep) {
    sep = '-';
  }

  return (
    camel
      .replace(/([a-z])([A-Z])/g, '$1' + sep + '$2')
      .replace(/([A-Z])([a-z])/g, sep + '$1$2')
      .toLowerCase()
  );
};
