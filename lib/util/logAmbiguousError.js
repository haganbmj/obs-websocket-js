/**
 * Disambiguates an "error" and formats it nicely for `debug` output.
 * Particularly useful when dealing with error response objects from obs-websocket,
 * which are not actual Error-type errors, but simply Objects.
 * @param debug - A `debug` instance.
 * @param prefix - A string to print in front of the formatted error.
 * @param error - An error of ambiguous type that you wish to log to `debug`. Can be an Error, Object, or String.
 */
module.exports = function (debug, prefix, error) {
  if (error && error.stack) {
    debug(`${prefix}\n%O`, error.stack);
  } else if (typeof error === 'object') {
    debug(`${prefix}\n%O`, error);
  } else {
    debug(`${prefix} %s`, error);
  }
};
