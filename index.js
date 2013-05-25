
/**
 * Module dependencies.
 */

var minstache = require('minstache')
  , button = minstache.compile(require('./button'))
  , script = minstache.compile(require('./script'));


/**
 * Module exports.
 */

module.exports = snippet;


/**
 * The full snippet, button and script.
 */

function snippet (options) {
  options || (options = {});
  return button(options) + '\n' + script(options);
}


/**
 * Attach the single templates so they can do one at time. Pass in a default
 * empty object so that people don't have to do that themselves.
 */

snippet.button = function (options) { return button(options || {}); };
snippet.script = function (options) { return script(options || {}); };