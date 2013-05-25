
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("visionmedia-minstache/index.js", Function("exports, require, module",
"\n/**\n * Expose `render()`.`\n */\n\nexports = module.exports = render;\n\n/**\n * Expose `compile()`.\n */\n\nexports.compile = compile;\n\n/**\n * Render the given mustache `str` with `obj`.\n *\n * @param {String} str\n * @param {Object} obj\n * @return {String}\n * @api public\n */\n\nfunction render(str, obj) {\n  obj = obj || {};\n  var fn = compile(str);\n  return fn(obj);\n}\n\n/**\n * Compile the given `str` to a `Function`.\n *\n * @param {String} str\n * @return {Function}\n * @api public\n */\n\nfunction compile(str) {\n  var js = [];\n  var toks = parse(str);\n  var tok;\n\n  for (var i = 0; i < toks.length; ++i) {\n    tok = toks[i];\n    if (i % 2 == 0) {\n      js.push('\"' + tok.replace(/\"/g, '\\\\\"') + '\"');\n    } else {\n      switch (tok[0]) {\n        case '/':\n          tok = tok.slice(1);\n          js.push(') + ');\n          break;\n        case '^':\n          tok = tok.slice(1);\n          assertProperty(tok);\n          js.push(' + section(obj, \"' + tok + '\", true, ');\n          break;\n        case '#':\n          tok = tok.slice(1);\n          assertProperty(tok);\n          js.push(' + section(obj, \"' + tok + '\", false, ');\n          break;\n        default:\n          assertProperty(tok);\n          js.push(' + escape(obj.' + tok + ') + ');\n      }\n    }\n  }\n\n  js = '\\n'\n    + indent(escape.toString()) + ';\\n\\n'\n    + indent(section.toString()) + ';\\n\\n'\n    + '  return ' + js.join('').replace(/\\n/g, '\\\\n');\n\n  return new Function('obj', js);\n}\n\n/**\n * Assert that `prop` is a valid property.\n *\n * @param {String} prop\n * @api private\n */\n\nfunction assertProperty(prop) {\n  if (!prop.match(/^[\\w.]+$/)) throw new Error('invalid property \"' + prop + '\"');\n}\n\n/**\n * Parse `str`.\n *\n * @param {String} str\n * @return {Array}\n * @api private\n */\n\nfunction parse(str) {\n  return str.split(/\\{\\{|\\}\\}/);\n}\n\n/**\n * Indent `str`.\n *\n * @param {String} str\n * @return {String}\n * @api private\n */\n\nfunction indent(str) {\n  return str.replace(/^/gm, '  ');\n}\n\n/**\n * Section handler.\n *\n * @param {Object} context obj\n * @param {String} prop\n * @param {String} str\n * @param {Boolean} negate\n * @api private\n */\n\nfunction section(obj, prop, negate, str) {\n  var val = obj[prop];\n  if ('function' == typeof val) return val.call(obj, str);\n  if (negate) val = !val;\n  if (val) return str;\n  return '';\n}\n\n/**\n * Escape the given `html`.\n *\n * @param {String} html\n * @return {String}\n * @api private\n */\n\nfunction escape(html) {\n  return String(html)\n    .replace(/&/g, '&amp;')\n    .replace(/\"/g, '&quot;')\n    .replace(/</g, '&lt;')\n    .replace(/>/g, '&gt;');\n}//@ sourceURL=visionmedia-minstache/index.js"
));
require.register("component-stack/index.js", Function("exports, require, module",
"\n/**\n * Expose `stack()`.\n */\n\nmodule.exports = stack;\n\n/**\n * Return the stack.\n *\n * @return {Array}\n * @api public\n */\n\nfunction stack() {\n  var orig = Error.prepareStackTrace;\n  Error.prepareStackTrace = function(_, stack){ return stack; };\n  var err = new Error;\n  Error.captureStackTrace(err, arguments.callee);\n  var stack = err.stack;\n  Error.prepareStackTrace = orig;\n  return stack;\n}//@ sourceURL=component-stack/index.js"
));
require.register("component-assert/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar stack = require('stack');\n\n/**\n * Load contents of `script`.\n *\n * @param {String} script\n * @return {String}\n * @api private\n */\n\nfunction getScript(script) {\n  var xhr = new XMLHttpRequest;\n  xhr.open('GET', script, false);\n  xhr.send(null);\n  return xhr.responseText;\n}\n\n/**\n * Assert `expr` with optional failure `msg`.\n *\n * @param {Mixed} expr\n * @param {String} [msg]\n * @api public\n */\n\nmodule.exports = function(expr, msg){\n  if (expr) return;\n  if (!msg) {\n    if (Error.captureStackTrace) {\n      var callsite = stack()[1];\n      var fn = callsite.fun.toString();\n      var file = callsite.getFileName();\n      var line = callsite.getLineNumber() - 1;\n      var col = callsite.getColumnNumber() - 1;\n      var src = getScript(file);\n      line = src.split('\\n')[line].slice(col);\n      expr = line.match(/assert\\((.*)\\)/)[1].trim();\n      msg = expr;\n    } else {\n      msg = 'assertion failed';\n    }\n  }\n\n  throw new Error(msg);\n};//@ sourceURL=component-assert/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"\n/**\n * toString ref.\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Return the type of `val`.\n *\n * @param {Mixed} val\n * @return {String}\n * @api public\n */\n\nmodule.exports = function(val){\n  switch (toString.call(val)) {\n    case '[object Function]': return 'function';\n    case '[object Date]': return 'date';\n    case '[object RegExp]': return 'regexp';\n    case '[object Arguments]': return 'arguments';\n    case '[object Array]': return 'array';\n    case '[object String]': return 'string';\n  }\n\n  if (val === null) return 'null';\n  if (val === undefined) return 'undefined';\n  if (val && val.nodeType === 1) return 'element';\n  if (val === Object(val)) return 'object';\n\n  return typeof val;\n};\n//@ sourceURL=component-type/index.js"
));
require.register("hn-button-snippet/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar minstache = require('minstache')\n  , button = minstache.compile(require('./button'))\n  , script = minstache.compile(require('./script'));\n\n\n/**\n * Module exports.\n */\n\nmodule.exports = snippet;\n\n\n/**\n * The full snippet, button and script.\n */\n\nfunction snippet (options) {\n  options || (options = {});\n  return button(options) + '\\n' + script(options);\n}\n\n\n/**\n * Attach the single templates so they can do one at time. Pass in a default\n * empty object so that people don't have to do that themselves.\n */\n\nsnippet.button = function (options) { return button(options || {}); };\nsnippet.script = function (options) { return script(options || {}); };//@ sourceURL=hn-button-snippet/index.js"
));
require.register("hn-button-snippet/button.js", Function("exports, require, module",
"module.exports = '<a href=\"https://news.ycombinator.com/submit\" class=\"hn-button\"{{#title}} data-title=\"{{title}}\"{{/title}}{{#url}} data-url=\"{{url}}\"{{/url}}{{#count}} data-count=\"{{count}}\"{{/count}}{{#style}} data-style=\"{{style}}\"{{/style}}>Vote on HN</a>';//@ sourceURL=hn-button-snippet/button.js"
));
require.register("hn-button-snippet/script.js", Function("exports, require, module",
"module.exports = '<script type=\"text/javascript\">var HN=[];HN.factory=function(e){return function(){HN.push([e].concat(Array.prototype.slice.call(arguments,0)))};},HN.on=HN.factory(\"on\"),HN.once=HN.factory(\"once\"),HN.off=HN.factory(\"off\"),HN.emit=HN.factory(\"emit\"),HN.load=function(){var e=\"hn-button.js\";if(document.getElementById(e))return;var t=document.createElement(\"script\");t.id=e,t.src=\"//hn-button.herokuapp.com/hn-button.js\";var n=document.getElementsByTagName(\"script\")[0];n.parentNode.insertBefore(t,n)},HN.load();</script>';//@ sourceURL=hn-button-snippet/script.js"
));
require.alias("visionmedia-minstache/index.js", "hn-button-snippet/deps/minstache/index.js");

require.alias("component-assert/index.js", "hn-button-snippet/deps/assert/index.js");
require.alias("component-stack/index.js", "component-assert/deps/stack/index.js");

require.alias("component-type/index.js", "hn-button-snippet/deps/type/index.js");

