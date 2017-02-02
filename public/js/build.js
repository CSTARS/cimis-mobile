(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CIMIS = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/component-emitter/index.js":[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/grunt-browserify/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/grunt-browserify/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_Symbol.js":[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_root.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_baseGetTag.js":[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_Symbol.js","./_getRawTag":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_getRawTag.js","./_objectToString":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_objectToString.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_freeGlobal.js":[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_getPrototype.js":[function(require,module,exports){
var overArg = require('./_overArg');

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;

},{"./_overArg":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_overArg.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_getRawTag.js":[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_Symbol.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_objectToString.js":[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_overArg.js":[function(require,module,exports){
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_root.js":[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_freeGlobal.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/isObjectLike.js":[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/isPlainObject.js":[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    getPrototype = require('./_getPrototype'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;

},{"./_baseGetTag":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_baseGetTag.js","./_getPrototype":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/_getPrototype.js","./isObjectLike":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/isObjectLike.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/polymer-redux/polymer-redux.js":[function(require,module,exports){
(function(root, factory) {
    /* istanbul ignore next */
    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root['PolymerRedux'] = factory();
    }
})(this, function() {
    var warning = 'Polymer Redux: <%s>.%s has "notify" enabled, two-way bindings goes against Redux\'s paradigm';

    /**
     * Returns property bindings found on a given Element/Behavior.
     *
     * @private
     * @param {HTMLElement|Object} obj Element or Behavior.
     * @param {HTMLElement} element Polymer element.
     * @param {Object} store Redux store.
     * @return {Array}
     */
    function getStatePathProperties(obj, element, store) {
        var props = [];

        if (obj.properties != null) {
            Object.keys(obj.properties).forEach(function(name) {
                var prop = obj.properties[name];
                if (prop.hasOwnProperty('statePath')) {
                    // notify flag, warn against two-way bindings
                    if (prop.notify && !prop.readOnly) {
                        console.warn(warning, element.is, name);
                    }
                    props.push({
                        name: name,
                        // Empty statePath return state
                        path: prop.statePath || store.getState,
                        readOnly: prop.readOnly,
                        type: prop.type
                    });
                }
            });
        }

        return props;
    }

    /**
     * Factory function for creating a listener for a give Polymer element. The
     * returning listener should be passed to `store.subscribe`.
     *
     * @private
     * @param {HTMLElement} element Polymer element.
     * @return {Function} Redux subcribe listener.
     */
    function createListener(element, store) {
        var props = getStatePathProperties(element, element, store);

        // behavior property bindings
        if (Array.isArray(element.behaviors)) {
            element.behaviors.forEach(function(behavior) {
                var extras = getStatePathProperties(behavior, element, store);
                if (extras.length) {
                    Array.prototype.push.apply(props, extras);
                }
            });

            // de-dupe behavior props
            var names = props.map(function(prop) {
                return prop.name; // grab the prop names
            });
            props = props.filter(function(prop, i) {
                return names.indexOf(prop.name) === i; // indices must match
            });
        }

        // redux listener
        return function() {
            var state = store.getState();
            props.forEach(function(property) {
                var propName = property.name;
                var splices = [];
                var value, previous;

                // statePath, a path or function.
                var path = property.path;
                if (typeof path == 'function') {
                    value = path.call(element, state);
                } else {
                    value = Polymer.Base.get(path, state);
                }

                // prevent unnecesary polymer notifications
                previous = element.get(property.name);
                if (value === previous) {
                    return;
                }

                // type of array, work out splices before setting the value
                if (property.type === Array) {
                    value = value || /* istanbul ignore next */ [];
                    previous = previous || /* istanbul ignore next */ [];

                    // check the value type
                    if (!Array.isArray(value)) {
                        throw new TypeError(
                            '<'+ element.is +'>.'+ propName +' type is Array but given: ' + (typeof value)
                        );
                    }

                    splices = Polymer.ArraySplice.calculateSplices(value, previous);
                }

                // set
                if (property.readOnly) {
                    element.notifyPath(propName, value);
                } else {
                    element.set(propName, value);
                }

                // notify element of splices
                if (splices.length) {
                    element.notifySplices(propName, splices);
                }
            });
            element.fire('state-changed', state);
        }
    }

    /**
     * Binds an given Polymer element to a Redux store.
     *
     * @private
     * @param {HTMLElement} element Polymer element.
     * @param {Object} store Redux store.
     */
    function bindReduxListener(element, store) {
        var listener;

        if (element._reduxUnsubscribe) return;

        listener = createListener(element, store);
        listener(); // start bindings

        element._reduxUnsubscribe = store.subscribe(listener);
    }

    /**
     * Unbinds a Polymer element from a Redux store.
     *
     * @private
     * @param {HTMLElement} element
     */
    function unbindReduxListener(element) {
        if (typeof element._reduxUnsubscribe === 'function') {
            element._reduxUnsubscribe();
            delete element._reduxUnsubscribe;
        }
    }

    /**
     * Builds list of action creators from a given element and it's inherited
     * behaviors setting the list onto the element.
     *
     * @private
     * @param {HTMLElement} element Polymer element instance.
     */
    function compileActionCreators(element) {
        var actions = {};
        var behaviors = element.behaviors;

        if (element._reduxActions) return;

        // add behavior actions first, in reverse order so we keep priority
        if (Array.isArray(behaviors)) {
            for (var i = behaviors.length - 1; i >= 0; i--) {
                Object.assign(actions, behaviors[i].actions);
            }
        }

        // element actions have priority
        element._reduxActions = Object.assign(actions, element.actions);
    }

    /**
     * Dispatches a Redux action via a Polymer element. This gives the element
     * a polymorphic dispatch function. See the readme for the various ways to
     * dispatch.
     *
     * @private
     * @param {HTMLElement} element Polymer element.
     * @param {Object} store Redux store.
     * @param {Arguments} args The arguments passed to `element.dispatch`.
     * @return {Object} The computed Redux action.
     */
    function dispatchReduxAction(element, store, args) {
        var action = args[0];
        var actions = element._reduxActions;

        args = castArgumentsToArray(args);

        // action name
        if (actions && typeof action === 'string') {
            if (typeof actions[action] !== 'function') {
                throw new TypeError('Polymer Redux: <' + element.is + '> has no action "' + action + '"');
            }
            action = actions[action].apply(element, args.slice(1));
        }

        // !!! DEPRECIATED !!!
        // This will be removed as of 1.0.

        // action creator
        if (typeof action === 'function' && action.length === 0) {
            return store.dispatch(action());
        }

        // ---

        // middleware, make sure we pass the polymer-redux dispatch
        // so we have access to the elements action creators
        if (typeof action === 'function') {
            return store.dispatch(function() {
                var argv = castArgumentsToArray(arguments);
                // replace redux dispatch
                argv.splice(0, 1, function() {
                    return dispatchReduxAction(element, store, arguments);
                });
                return action.apply(element, argv);
            });
        }

        // action
        return store.dispatch(action);
    }

    /**
     * Turns arguments into an Array.
     *
     * @param {Arguments} args
     * @return {Array}
     */
    function castArgumentsToArray(args) {
        return Array.prototype.slice.call(args, 0);
    }

    /**
     * Creates PolymerRedux behaviors from a given Redux store.
     *
     * @param {Object} store Redux store.
     * @return {PolymerRedux}
     */
    return function(store) {
        var PolymerRedux;

        // check for store
        if (!store) {
            throw new TypeError('missing redux store');
        }

        /**
         * `PolymerRedux` binds a given Redux store's state to implementing Elements.
         *
         * Full documentation available, https://github.com/tur-nr/polymer-redux.
         *
         * @polymerBehavior PolymerRedux
         * @demo demo/index.html
         */
        return PolymerRedux = {
            /**
             * Fired when the Redux store state changes.
             * @event state-changed
             * @param {*} state
             */

            ready: function() {
                bindReduxListener(this, store);
                compileActionCreators(this);
            },

            attached: function() {
                bindReduxListener(this, store);
                compileActionCreators(this);
            },

            detached: function() {
                unbindReduxListener(this);
            },

            /**
             * Dispatches an action to the Redux store.
             *
             * @param {String|Object|Function} action
             * @return {Object} The action that was dispatched.
             */
            dispatch: function(action /*, [...args] */) {
                return dispatchReduxAction(this, store, arguments);
            },

            /**
             * Gets the current state in the Redux store.
             * @return {*}
             */
            getState: function() {
                return store.getState();
            },
        };
    };
});

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Point.js":[function(require,module,exports){
var mgrs = require('mgrs');

function Point(x, y, z) {
  if (!(this instanceof Point)) {
    return new Point(x, y, z);
  }
  if (Array.isArray(x)) {
    this.x = x[0];
    this.y = x[1];
    this.z = x[2] || 0.0;
  }else if(typeof x === 'object'){
    this.x = x.x;
    this.y = x.y;
    this.z = x.z || 0.0;
  } else if (typeof x === 'string' && typeof y === 'undefined') {
    var coords = x.split(',');
    this.x = parseFloat(coords[0], 10);
    this.y = parseFloat(coords[1], 10);
    this.z = parseFloat(coords[2], 10) || 0.0;
  }
  else {
    this.x = x;
    this.y = y;
    this.z = z || 0.0;
  }
  console.warn('proj4.Point will be removed in version 3, use proj4.toPoint');
}

Point.fromMGRS = function(mgrsStr) {
  return new Point(mgrs.toPoint(mgrsStr));
};
Point.prototype.toMGRS = function(accuracy) {
  return mgrs.forward([this.x, this.y], accuracy);
};
module.exports = Point;
},{"mgrs":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/node_modules/mgrs/mgrs.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Proj.js":[function(require,module,exports){
var parseCode = require("./parseCode");
var extend = require('./extend');
var projections = require('./projections');
var deriveConstants = require('./deriveConstants');

function Projection(srsCode,callback) {
  if (!(this instanceof Projection)) {
    return new Projection(srsCode);
  }
  callback = callback || function(error){
    if(error){
      throw error;
    }
  };
  var json = parseCode(srsCode);
  if(typeof json !== 'object'){
    callback(srsCode);
    return;
  }
  var modifiedJSON = deriveConstants(json);
  var ourProj = Projection.projections.get(modifiedJSON.projName);
  if(ourProj){
    extend(this, modifiedJSON);
    extend(this, ourProj);
    this.init();
    callback(null, this);
  }else{
    callback(srsCode);
  }
}
Projection.projections = projections;
Projection.projections.start();
module.exports = Projection;

},{"./deriveConstants":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/deriveConstants.js","./extend":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/extend.js","./parseCode":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/parseCode.js","./projections":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/adjust_axis.js":[function(require,module,exports){
module.exports = function(crs, denorm, point) {
  var xin = point.x,
    yin = point.y,
    zin = point.z || 0.0;
  var v, t, i;
  for (i = 0; i < 3; i++) {
    if (denorm && i === 2 && point.z === undefined) {
      continue;
    }
    if (i === 0) {
      v = xin;
      t = 'x';
    }
    else if (i === 1) {
      v = yin;
      t = 'y';
    }
    else {
      v = zin;
      t = 'z';
    }
    switch (crs.axis[i]) {
    case 'e':
      point[t] = v;
      break;
    case 'w':
      point[t] = -v;
      break;
    case 'n':
      point[t] = v;
      break;
    case 's':
      point[t] = -v;
      break;
    case 'u':
      if (point[t] !== undefined) {
        point.z = v;
      }
      break;
    case 'd':
      if (point[t] !== undefined) {
        point.z = -v;
      }
      break;
    default:
      //console.log("ERROR: unknow axis ("+crs.axis[i]+") - check definition of "+crs.projName);
      return null;
    }
  }
  return point;
};

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;
var sign = require('./sign');

module.exports = function(x) {
  return (Math.abs(x) < HALF_PI) ? x : (x - (sign(x) * Math.PI));
};
},{"./sign":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js":[function(require,module,exports){
var TWO_PI = Math.PI * 2;
// SPI is slightly greater than Math.PI, so values that exceed the -180..180
// degree range by a tiny amount don't get wrapped. This prevents points that
// have drifted from their original location along the 180th meridian (due to
// floating point error) from changing their sign.
var SPI = 3.14159265359;
var sign = require('./sign');

module.exports = function(x) {
  return (Math.abs(x) <= SPI) ? x : (x - (sign(x) * TWO_PI));
};
},{"./sign":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js":[function(require,module,exports){
module.exports = function(x) {
  if (Math.abs(x) > 1) {
    x = (x > 1) ? 1 : -1;
  }
  return Math.asin(x);
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js":[function(require,module,exports){
module.exports = function(x) {
  return (1 - 0.25 * x * (1 + x / 16 * (3 + 1.25 * x)));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js":[function(require,module,exports){
module.exports = function(x) {
  return (0.375 * x * (1 + 0.25 * x * (1 + 0.46875 * x)));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js":[function(require,module,exports){
module.exports = function(x) {
  return (0.05859375 * x * x * (1 + 0.75 * x));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js":[function(require,module,exports){
module.exports = function(x) {
  return (x * x * x * (35 / 3072));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/gN.js":[function(require,module,exports){
module.exports = function(a, e, sinphi) {
  var temp = e * sinphi;
  return a / Math.sqrt(1 - temp * temp);
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/imlfn.js":[function(require,module,exports){
module.exports = function(ml, e0, e1, e2, e3) {
  var phi;
  var dphi;

  phi = ml / e0;
  for (var i = 0; i < 15; i++) {
    dphi = (ml - (e0 * phi - e1 * Math.sin(2 * phi) + e2 * Math.sin(4 * phi) - e3 * Math.sin(6 * phi))) / (e0 - 2 * e1 * Math.cos(2 * phi) + 4 * e2 * Math.cos(4 * phi) - 6 * e3 * Math.cos(6 * phi));
    phi += dphi;
    if (Math.abs(dphi) <= 0.0000000001) {
      return phi;
    }
  }

  //..reportError("IMLFN-CONV:Latitude failed to converge after 15 iterations");
  return NaN;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/iqsfnz.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;

module.exports = function(eccent, q) {
  var temp = 1 - (1 - eccent * eccent) / (2 * eccent) * Math.log((1 - eccent) / (1 + eccent));
  if (Math.abs(Math.abs(q) - temp) < 1.0E-6) {
    if (q < 0) {
      return (-1 * HALF_PI);
    }
    else {
      return HALF_PI;
    }
  }
  //var phi = 0.5* q/(1-eccent*eccent);
  var phi = Math.asin(0.5 * q);
  var dphi;
  var sin_phi;
  var cos_phi;
  var con;
  for (var i = 0; i < 30; i++) {
    sin_phi = Math.sin(phi);
    cos_phi = Math.cos(phi);
    con = eccent * sin_phi;
    dphi = Math.pow(1 - con * con, 2) / (2 * cos_phi) * (q / (1 - eccent * eccent) - sin_phi / (1 - con * con) + 0.5 / eccent * Math.log((1 - con) / (1 + con)));
    phi += dphi;
    if (Math.abs(dphi) <= 0.0000000001) {
      return phi;
    }
  }

  //console.log("IQSFN-CONV:Latitude failed to converge after 30 iterations");
  return NaN;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js":[function(require,module,exports){
module.exports = function(e0, e1, e2, e3, phi) {
  return (e0 * phi - e1 * Math.sin(2 * phi) + e2 * Math.sin(4 * phi) - e3 * Math.sin(6 * phi));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js":[function(require,module,exports){
module.exports = function(eccent, sinphi, cosphi) {
  var con = eccent * sinphi;
  return cosphi / (Math.sqrt(1 - con * con));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/phi2z.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;
module.exports = function(eccent, ts) {
  var eccnth = 0.5 * eccent;
  var con, dphi;
  var phi = HALF_PI - 2 * Math.atan(ts);
  for (var i = 0; i <= 15; i++) {
    con = eccent * Math.sin(phi);
    dphi = HALF_PI - 2 * Math.atan(ts * (Math.pow(((1 - con) / (1 + con)), eccnth))) - phi;
    phi += dphi;
    if (Math.abs(dphi) <= 0.0000000001) {
      return phi;
    }
  }
  //console.log("phi2z has NoConvergence");
  return -9999;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_enfn.js":[function(require,module,exports){
var C00 = 1;
var C02 = 0.25;
var C04 = 0.046875;
var C06 = 0.01953125;
var C08 = 0.01068115234375;
var C22 = 0.75;
var C44 = 0.46875;
var C46 = 0.01302083333333333333;
var C48 = 0.00712076822916666666;
var C66 = 0.36458333333333333333;
var C68 = 0.00569661458333333333;
var C88 = 0.3076171875;

module.exports = function(es) {
  var en = [];
  en[0] = C00 - es * (C02 + es * (C04 + es * (C06 + es * C08)));
  en[1] = es * (C22 - es * (C04 + es * (C06 + es * C08)));
  var t = es * es;
  en[2] = t * (C44 - es * (C46 + es * C48));
  t *= es;
  en[3] = t * (C66 - es * C68);
  en[4] = t * es * C88;
  return en;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_inv_mlfn.js":[function(require,module,exports){
var pj_mlfn = require("./pj_mlfn");
var EPSLN = 1.0e-10;
var MAX_ITER = 20;
module.exports = function(arg, es, en) {
  var k = 1 / (1 - es);
  var phi = arg;
  for (var i = MAX_ITER; i; --i) { /* rarely goes over 2 iterations */
    var s = Math.sin(phi);
    var t = 1 - es * s * s;
    //t = this.pj_mlfn(phi, s, Math.cos(phi), en) - arg;
    //phi -= t * (t * Math.sqrt(t)) * k;
    t = (pj_mlfn(phi, s, Math.cos(phi), en) - arg) * (t * Math.sqrt(t)) * k;
    phi -= t;
    if (Math.abs(t) < EPSLN) {
      return phi;
    }
  }
  //..reportError("cass:pj_inv_mlfn: Convergence error");
  return phi;
};
},{"./pj_mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_mlfn.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_mlfn.js":[function(require,module,exports){
module.exports = function(phi, sphi, cphi, en) {
  cphi *= sphi;
  sphi *= sphi;
  return (en[0] * phi - cphi * (en[1] + sphi * (en[2] + sphi * (en[3] + sphi * en[4]))));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/qsfnz.js":[function(require,module,exports){
module.exports = function(eccent, sinphi) {
  var con;
  if (eccent > 1.0e-7) {
    con = eccent * sinphi;
    return ((1 - eccent * eccent) * (sinphi / (1 - con * con) - (0.5 / eccent) * Math.log((1 - con) / (1 + con))));
  }
  else {
    return (2 * sinphi);
  }
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js":[function(require,module,exports){
module.exports = function(x) {
  return x<0 ? -1 : 1;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/srat.js":[function(require,module,exports){
module.exports = function(esinp, exp) {
  return (Math.pow((1 - esinp) / (1 + esinp), exp));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/toPoint.js":[function(require,module,exports){
module.exports = function (array){
  var out = {
    x: array[0],
    y: array[1]
  };
  if (array.length>2) {
    out.z = array[2];
  }
  if (array.length>3) {
    out.m = array[3];
  }
  return out;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/tsfnz.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;

module.exports = function(eccent, phi, sinphi) {
  var con = eccent * sinphi;
  var com = 0.5 * eccent;
  con = Math.pow(((1 - con) / (1 + con)), com);
  return (Math.tan(0.5 * (HALF_PI - phi)) / con);
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/Datum.js":[function(require,module,exports){
exports.wgs84 = {
  towgs84: "0,0,0",
  ellipse: "WGS84",
  datumName: "WGS84"
};
exports.ch1903 = {
  towgs84: "674.374,15.056,405.346",
  ellipse: "bessel",
  datumName: "swiss"
};
exports.ggrs87 = {
  towgs84: "-199.87,74.79,246.62",
  ellipse: "GRS80",
  datumName: "Greek_Geodetic_Reference_System_1987"
};
exports.nad83 = {
  towgs84: "0,0,0",
  ellipse: "GRS80",
  datumName: "North_American_Datum_1983"
};
exports.nad27 = {
  nadgrids: "@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",
  ellipse: "clrk66",
  datumName: "North_American_Datum_1927"
};
exports.potsdam = {
  towgs84: "606.0,23.0,413.0",
  ellipse: "bessel",
  datumName: "Potsdam Rauenberg 1950 DHDN"
};
exports.carthage = {
  towgs84: "-263.0,6.0,431.0",
  ellipse: "clark80",
  datumName: "Carthage 1934 Tunisia"
};
exports.hermannskogel = {
  towgs84: "653.0,-212.0,449.0",
  ellipse: "bessel",
  datumName: "Hermannskogel"
};
exports.ire65 = {
  towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",
  ellipse: "mod_airy",
  datumName: "Ireland 1965"
};
exports.rassadiran = {
  towgs84: "-133.63,-157.5,-158.62",
  ellipse: "intl",
  datumName: "Rassadiran"
};
exports.nzgd49 = {
  towgs84: "59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",
  ellipse: "intl",
  datumName: "New Zealand Geodetic Datum 1949"
};
exports.osgb36 = {
  towgs84: "446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",
  ellipse: "airy",
  datumName: "Airy 1830"
};
exports.s_jtsk = {
  towgs84: "589,76,480",
  ellipse: 'bessel',
  datumName: 'S-JTSK (Ferro)'
};
exports.beduaram = {
  towgs84: '-106,-87,188',
  ellipse: 'clrk80',
  datumName: 'Beduaram'
};
exports.gunung_segara = {
  towgs84: '-403,684,41',
  ellipse: 'bessel',
  datumName: 'Gunung Segara Jakarta'
};
exports.rnb72 = {
  towgs84: "106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1",
  ellipse: "intl",
  datumName: "Reseau National Belge 1972"
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/Ellipsoid.js":[function(require,module,exports){
exports.MERIT = {
  a: 6378137.0,
  rf: 298.257,
  ellipseName: "MERIT 1983"
};
exports.SGS85 = {
  a: 6378136.0,
  rf: 298.257,
  ellipseName: "Soviet Geodetic System 85"
};
exports.GRS80 = {
  a: 6378137.0,
  rf: 298.257222101,
  ellipseName: "GRS 1980(IUGG, 1980)"
};
exports.IAU76 = {
  a: 6378140.0,
  rf: 298.257,
  ellipseName: "IAU 1976"
};
exports.airy = {
  a: 6377563.396,
  b: 6356256.910,
  ellipseName: "Airy 1830"
};
exports.APL4 = {
  a: 6378137,
  rf: 298.25,
  ellipseName: "Appl. Physics. 1965"
};
exports.NWL9D = {
  a: 6378145.0,
  rf: 298.25,
  ellipseName: "Naval Weapons Lab., 1965"
};
exports.mod_airy = {
  a: 6377340.189,
  b: 6356034.446,
  ellipseName: "Modified Airy"
};
exports.andrae = {
  a: 6377104.43,
  rf: 300.0,
  ellipseName: "Andrae 1876 (Den., Iclnd.)"
};
exports.aust_SA = {
  a: 6378160.0,
  rf: 298.25,
  ellipseName: "Australian Natl & S. Amer. 1969"
};
exports.GRS67 = {
  a: 6378160.0,
  rf: 298.2471674270,
  ellipseName: "GRS 67(IUGG 1967)"
};
exports.bessel = {
  a: 6377397.155,
  rf: 299.1528128,
  ellipseName: "Bessel 1841"
};
exports.bess_nam = {
  a: 6377483.865,
  rf: 299.1528128,
  ellipseName: "Bessel 1841 (Namibia)"
};
exports.clrk66 = {
  a: 6378206.4,
  b: 6356583.8,
  ellipseName: "Clarke 1866"
};
exports.clrk80 = {
  a: 6378249.145,
  rf: 293.4663,
  ellipseName: "Clarke 1880 mod."
};
exports.clrk58 = {
  a: 6378293.645208759,
  rf: 294.2606763692654,
  ellipseName: "Clarke 1858"
};
exports.CPM = {
  a: 6375738.7,
  rf: 334.29,
  ellipseName: "Comm. des Poids et Mesures 1799"
};
exports.delmbr = {
  a: 6376428.0,
  rf: 311.5,
  ellipseName: "Delambre 1810 (Belgium)"
};
exports.engelis = {
  a: 6378136.05,
  rf: 298.2566,
  ellipseName: "Engelis 1985"
};
exports.evrst30 = {
  a: 6377276.345,
  rf: 300.8017,
  ellipseName: "Everest 1830"
};
exports.evrst48 = {
  a: 6377304.063,
  rf: 300.8017,
  ellipseName: "Everest 1948"
};
exports.evrst56 = {
  a: 6377301.243,
  rf: 300.8017,
  ellipseName: "Everest 1956"
};
exports.evrst69 = {
  a: 6377295.664,
  rf: 300.8017,
  ellipseName: "Everest 1969"
};
exports.evrstSS = {
  a: 6377298.556,
  rf: 300.8017,
  ellipseName: "Everest (Sabah & Sarawak)"
};
exports.fschr60 = {
  a: 6378166.0,
  rf: 298.3,
  ellipseName: "Fischer (Mercury Datum) 1960"
};
exports.fschr60m = {
  a: 6378155.0,
  rf: 298.3,
  ellipseName: "Fischer 1960"
};
exports.fschr68 = {
  a: 6378150.0,
  rf: 298.3,
  ellipseName: "Fischer 1968"
};
exports.helmert = {
  a: 6378200.0,
  rf: 298.3,
  ellipseName: "Helmert 1906"
};
exports.hough = {
  a: 6378270.0,
  rf: 297.0,
  ellipseName: "Hough"
};
exports.intl = {
  a: 6378388.0,
  rf: 297.0,
  ellipseName: "International 1909 (Hayford)"
};
exports.kaula = {
  a: 6378163.0,
  rf: 298.24,
  ellipseName: "Kaula 1961"
};
exports.lerch = {
  a: 6378139.0,
  rf: 298.257,
  ellipseName: "Lerch 1979"
};
exports.mprts = {
  a: 6397300.0,
  rf: 191.0,
  ellipseName: "Maupertius 1738"
};
exports.new_intl = {
  a: 6378157.5,
  b: 6356772.2,
  ellipseName: "New International 1967"
};
exports.plessis = {
  a: 6376523.0,
  rf: 6355863.0,
  ellipseName: "Plessis 1817 (France)"
};
exports.krass = {
  a: 6378245.0,
  rf: 298.3,
  ellipseName: "Krassovsky, 1942"
};
exports.SEasia = {
  a: 6378155.0,
  b: 6356773.3205,
  ellipseName: "Southeast Asia"
};
exports.walbeck = {
  a: 6376896.0,
  b: 6355834.8467,
  ellipseName: "Walbeck"
};
exports.WGS60 = {
  a: 6378165.0,
  rf: 298.3,
  ellipseName: "WGS 60"
};
exports.WGS66 = {
  a: 6378145.0,
  rf: 298.25,
  ellipseName: "WGS 66"
};
exports.WGS7 = {
  a: 6378135.0,
  rf: 298.26,
  ellipseName: "WGS 72"
};
exports.WGS84 = {
  a: 6378137.0,
  rf: 298.257223563,
  ellipseName: "WGS 84"
};
exports.sphere = {
  a: 6370997.0,
  b: 6370997.0,
  ellipseName: "Normal Sphere (r=6370997)"
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/PrimeMeridian.js":[function(require,module,exports){
exports.greenwich = 0.0; //"0dE",
exports.lisbon = -9.131906111111; //"9d07'54.862\"W",
exports.paris = 2.337229166667; //"2d20'14.025\"E",
exports.bogota = -74.080916666667; //"74d04'51.3\"W",
exports.madrid = -3.687938888889; //"3d41'16.58\"W",
exports.rome = 12.452333333333; //"12d27'8.4\"E",
exports.bern = 7.439583333333; //"7d26'22.5\"E",
exports.jakarta = 106.807719444444; //"106d48'27.79\"E",
exports.ferro = -17.666666666667; //"17d40'W",
exports.brussels = 4.367975; //"4d22'4.71\"E",
exports.stockholm = 18.058277777778; //"18d3'29.8\"E",
exports.athens = 23.7163375; //"23d42'58.815\"E",
exports.oslo = 10.722916666667; //"10d43'22.5\"E"
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/units.js":[function(require,module,exports){
exports.ft = {to_meter: 0.3048};
exports['us-ft'] = {to_meter: 1200 / 3937};

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/core.js":[function(require,module,exports){
var proj = require('./Proj');
var transform = require('./transform');
var wgs84 = proj('WGS84');

function transformer(from, to, coords) {
  var transformedArray;
  if (Array.isArray(coords)) {
    transformedArray = transform(from, to, coords);
    if (coords.length === 3) {
      return [transformedArray.x, transformedArray.y, transformedArray.z];
    }
    else {
      return [transformedArray.x, transformedArray.y];
    }
  }
  else {
    return transform(from, to, coords);
  }
}

function checkProj(item) {
  if (item instanceof proj) {
    return item;
  }
  if (item.oProj) {
    return item.oProj;
  }
  return proj(item);
}
function proj4(fromProj, toProj, coord) {
  fromProj = checkProj(fromProj);
  var single = false;
  var obj;
  if (typeof toProj === 'undefined') {
    toProj = fromProj;
    fromProj = wgs84;
    single = true;
  }
  else if (typeof toProj.x !== 'undefined' || Array.isArray(toProj)) {
    coord = toProj;
    toProj = fromProj;
    fromProj = wgs84;
    single = true;
  }
  toProj = checkProj(toProj);
  if (coord) {
    return transformer(fromProj, toProj, coord);
  }
  else {
    obj = {
      forward: function(coords) {
        return transformer(fromProj, toProj, coords);
      },
      inverse: function(coords) {
        return transformer(toProj, fromProj, coords);
      }
    };
    if (single) {
      obj.oProj = toProj;
    }
    return obj;
  }
}
module.exports = proj4;
},{"./Proj":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Proj.js","./transform":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/transform.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/datum.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;
var PJD_3PARAM = 1;
var PJD_7PARAM = 2;
var PJD_GRIDSHIFT = 3;
var PJD_WGS84 = 4; // WGS84 or equivalent
var PJD_NODATUM = 5; // WGS84 or equivalent
var SEC_TO_RAD = 4.84813681109535993589914102357e-6;
var AD_C = 1.0026000;
var COS_67P5 = 0.38268343236508977;
var datum = function(proj) {
  if (!(this instanceof datum)) {
    return new datum(proj);
  }
  this.datum_type = PJD_WGS84; //default setting
  if (!proj) {
    return;
  }
  if (proj.datumCode && proj.datumCode === 'none') {
    this.datum_type = PJD_NODATUM;
  }
  if (proj.datum_params) {
    for (var i = 0; i < proj.datum_params.length; i++) {
      proj.datum_params[i] = parseFloat(proj.datum_params[i]);
    }
    if (proj.datum_params[0] !== 0 || proj.datum_params[1] !== 0 || proj.datum_params[2] !== 0) {
      this.datum_type = PJD_3PARAM;
    }
    if (proj.datum_params.length > 3) {
      if (proj.datum_params[3] !== 0 || proj.datum_params[4] !== 0 || proj.datum_params[5] !== 0 || proj.datum_params[6] !== 0) {
        this.datum_type = PJD_7PARAM;
        proj.datum_params[3] *= SEC_TO_RAD;
        proj.datum_params[4] *= SEC_TO_RAD;
        proj.datum_params[5] *= SEC_TO_RAD;
        proj.datum_params[6] = (proj.datum_params[6] / 1000000.0) + 1.0;
      }
    }
  }
  // DGR 2011-03-21 : nadgrids support
  this.datum_type = proj.grids ? PJD_GRIDSHIFT : this.datum_type;

  this.a = proj.a; //datum object also uses these values
  this.b = proj.b;
  this.es = proj.es;
  this.ep2 = proj.ep2;
  this.datum_params = proj.datum_params;
  if (this.datum_type === PJD_GRIDSHIFT) {
    this.grids = proj.grids;
  }
};
datum.prototype = {


  /****************************************************************/
  // cs_compare_datums()
  //   Returns TRUE if the two datums match, otherwise FALSE.
  compare_datums: function(dest) {
    if (this.datum_type !== dest.datum_type) {
      return false; // false, datums are not equal
    }
    else if (this.a !== dest.a || Math.abs(this.es - dest.es) > 0.000000000050) {
      // the tolerence for es is to ensure that GRS80 and WGS84
      // are considered identical
      return false;
    }
    else if (this.datum_type === PJD_3PARAM) {
      return (this.datum_params[0] === dest.datum_params[0] && this.datum_params[1] === dest.datum_params[1] && this.datum_params[2] === dest.datum_params[2]);
    }
    else if (this.datum_type === PJD_7PARAM) {
      return (this.datum_params[0] === dest.datum_params[0] && this.datum_params[1] === dest.datum_params[1] && this.datum_params[2] === dest.datum_params[2] && this.datum_params[3] === dest.datum_params[3] && this.datum_params[4] === dest.datum_params[4] && this.datum_params[5] === dest.datum_params[5] && this.datum_params[6] === dest.datum_params[6]);
    }
    else if (this.datum_type === PJD_GRIDSHIFT || dest.datum_type === PJD_GRIDSHIFT) {
      //alert("ERROR: Grid shift transformations are not implemented.");
      //return false
      //DGR 2012-07-29 lazy ...
      return this.nadgrids === dest.nadgrids;
    }
    else {
      return true; // datums are equal
    }
  }, // cs_compare_datums()

  /*
   * The function Convert_Geodetic_To_Geocentric converts geodetic coordinates
   * (latitude, longitude, and height) to geocentric coordinates (X, Y, Z),
   * according to the current ellipsoid parameters.
   *
   *    Latitude  : Geodetic latitude in radians                     (input)
   *    Longitude : Geodetic longitude in radians                    (input)
   *    Height    : Geodetic height, in meters                       (input)
   *    X         : Calculated Geocentric X coordinate, in meters    (output)
   *    Y         : Calculated Geocentric Y coordinate, in meters    (output)
   *    Z         : Calculated Geocentric Z coordinate, in meters    (output)
   *
   */
  geodetic_to_geocentric: function(p) {
    var Longitude = p.x;
    var Latitude = p.y;
    var Height = p.z ? p.z : 0; //Z value not always supplied
    var X; // output
    var Y;
    var Z;

    var Error_Code = 0; //  GEOCENT_NO_ERROR;
    var Rn; /*  Earth radius at location  */
    var Sin_Lat; /*  Math.sin(Latitude)  */
    var Sin2_Lat; /*  Square of Math.sin(Latitude)  */
    var Cos_Lat; /*  Math.cos(Latitude)  */

    /*
     ** Don't blow up if Latitude is just a little out of the value
     ** range as it may just be a rounding issue.  Also removed longitude
     ** test, it should be wrapped by Math.cos() and Math.sin().  NFW for PROJ.4, Sep/2001.
     */
    if (Latitude < -HALF_PI && Latitude > -1.001 * HALF_PI) {
      Latitude = -HALF_PI;
    }
    else if (Latitude > HALF_PI && Latitude < 1.001 * HALF_PI) {
      Latitude = HALF_PI;
    }
    else if ((Latitude < -HALF_PI) || (Latitude > HALF_PI)) {
      /* Latitude out of range */
      //..reportError('geocent:lat out of range:' + Latitude);
      return null;
    }

    if (Longitude > Math.PI) {
      Longitude -= (2 * Math.PI);
    }
    Sin_Lat = Math.sin(Latitude);
    Cos_Lat = Math.cos(Latitude);
    Sin2_Lat = Sin_Lat * Sin_Lat;
    Rn = this.a / (Math.sqrt(1.0e0 - this.es * Sin2_Lat));
    X = (Rn + Height) * Cos_Lat * Math.cos(Longitude);
    Y = (Rn + Height) * Cos_Lat * Math.sin(Longitude);
    Z = ((Rn * (1 - this.es)) + Height) * Sin_Lat;

    p.x = X;
    p.y = Y;
    p.z = Z;
    return Error_Code;
  }, // cs_geodetic_to_geocentric()


  geocentric_to_geodetic: function(p) {
    /* local defintions and variables */
    /* end-criterium of loop, accuracy of sin(Latitude) */
    var genau = 1e-12;
    var genau2 = (genau * genau);
    var maxiter = 30;

    var P; /* distance between semi-minor axis and location */
    var RR; /* distance between center and location */
    var CT; /* sin of geocentric latitude */
    var ST; /* cos of geocentric latitude */
    var RX;
    var RK;
    var RN; /* Earth radius at location */
    var CPHI0; /* cos of start or old geodetic latitude in iterations */
    var SPHI0; /* sin of start or old geodetic latitude in iterations */
    var CPHI; /* cos of searched geodetic latitude */
    var SPHI; /* sin of searched geodetic latitude */
    var SDPHI; /* end-criterium: addition-theorem of sin(Latitude(iter)-Latitude(iter-1)) */
    var At_Pole; /* indicates location is in polar region */
    var iter; /* # of continous iteration, max. 30 is always enough (s.a.) */

    var X = p.x;
    var Y = p.y;
    var Z = p.z ? p.z : 0.0; //Z value not always supplied
    var Longitude;
    var Latitude;
    var Height;

    At_Pole = false;
    P = Math.sqrt(X * X + Y * Y);
    RR = Math.sqrt(X * X + Y * Y + Z * Z);

    /*      special cases for latitude and longitude */
    if (P / this.a < genau) {

      /*  special case, if P=0. (X=0., Y=0.) */
      At_Pole = true;
      Longitude = 0.0;

      /*  if (X,Y,Z)=(0.,0.,0.) then Height becomes semi-minor axis
       *  of ellipsoid (=center of mass), Latitude becomes PI/2 */
      if (RR / this.a < genau) {
        Latitude = HALF_PI;
        Height = -this.b;
        return;
      }
    }
    else {
      /*  ellipsoidal (geodetic) longitude
       *  interval: -PI < Longitude <= +PI */
      Longitude = Math.atan2(Y, X);
    }

    /* --------------------------------------------------------------
     * Following iterative algorithm was developped by
     * "Institut for Erdmessung", University of Hannover, July 1988.
     * Internet: www.ife.uni-hannover.de
     * Iterative computation of CPHI,SPHI and Height.
     * Iteration of CPHI and SPHI to 10**-12 radian resp.
     * 2*10**-7 arcsec.
     * --------------------------------------------------------------
     */
    CT = Z / RR;
    ST = P / RR;
    RX = 1.0 / Math.sqrt(1.0 - this.es * (2.0 - this.es) * ST * ST);
    CPHI0 = ST * (1.0 - this.es) * RX;
    SPHI0 = CT * RX;
    iter = 0;

    /* loop to find sin(Latitude) resp. Latitude
     * until |sin(Latitude(iter)-Latitude(iter-1))| < genau */
    do {
      iter++;
      RN = this.a / Math.sqrt(1.0 - this.es * SPHI0 * SPHI0);

      /*  ellipsoidal (geodetic) height */
      Height = P * CPHI0 + Z * SPHI0 - RN * (1.0 - this.es * SPHI0 * SPHI0);

      RK = this.es * RN / (RN + Height);
      RX = 1.0 / Math.sqrt(1.0 - RK * (2.0 - RK) * ST * ST);
      CPHI = ST * (1.0 - RK) * RX;
      SPHI = CT * RX;
      SDPHI = SPHI * CPHI0 - CPHI * SPHI0;
      CPHI0 = CPHI;
      SPHI0 = SPHI;
    }
    while (SDPHI * SDPHI > genau2 && iter < maxiter);

    /*      ellipsoidal (geodetic) latitude */
    Latitude = Math.atan(SPHI / Math.abs(CPHI));

    p.x = Longitude;
    p.y = Latitude;
    p.z = Height;
    return p;
  }, // cs_geocentric_to_geodetic()

  /** Convert_Geocentric_To_Geodetic
   * The method used here is derived from 'An Improved Algorithm for
   * Geocentric to Geodetic Coordinate Conversion', by Ralph Toms, Feb 1996
   */
  geocentric_to_geodetic_noniter: function(p) {
    var X = p.x;
    var Y = p.y;
    var Z = p.z ? p.z : 0; //Z value not always supplied
    var Longitude;
    var Latitude;
    var Height;

    var W; /* distance from Z axis */
    var W2; /* square of distance from Z axis */
    var T0; /* initial estimate of vertical component */
    var T1; /* corrected estimate of vertical component */
    var S0; /* initial estimate of horizontal component */
    var S1; /* corrected estimate of horizontal component */
    var Sin_B0; /* Math.sin(B0), B0 is estimate of Bowring aux variable */
    var Sin3_B0; /* cube of Math.sin(B0) */
    var Cos_B0; /* Math.cos(B0) */
    var Sin_p1; /* Math.sin(phi1), phi1 is estimated latitude */
    var Cos_p1; /* Math.cos(phi1) */
    var Rn; /* Earth radius at location */
    var Sum; /* numerator of Math.cos(phi1) */
    var At_Pole; /* indicates location is in polar region */

    X = parseFloat(X); // cast from string to float
    Y = parseFloat(Y);
    Z = parseFloat(Z);

    At_Pole = false;
    if (X !== 0.0) {
      Longitude = Math.atan2(Y, X);
    }
    else {
      if (Y > 0) {
        Longitude = HALF_PI;
      }
      else if (Y < 0) {
        Longitude = -HALF_PI;
      }
      else {
        At_Pole = true;
        Longitude = 0.0;
        if (Z > 0.0) { /* north pole */
          Latitude = HALF_PI;
        }
        else if (Z < 0.0) { /* south pole */
          Latitude = -HALF_PI;
        }
        else { /* center of earth */
          Latitude = HALF_PI;
          Height = -this.b;
          return;
        }
      }
    }
    W2 = X * X + Y * Y;
    W = Math.sqrt(W2);
    T0 = Z * AD_C;
    S0 = Math.sqrt(T0 * T0 + W2);
    Sin_B0 = T0 / S0;
    Cos_B0 = W / S0;
    Sin3_B0 = Sin_B0 * Sin_B0 * Sin_B0;
    T1 = Z + this.b * this.ep2 * Sin3_B0;
    Sum = W - this.a * this.es * Cos_B0 * Cos_B0 * Cos_B0;
    S1 = Math.sqrt(T1 * T1 + Sum * Sum);
    Sin_p1 = T1 / S1;
    Cos_p1 = Sum / S1;
    Rn = this.a / Math.sqrt(1.0 - this.es * Sin_p1 * Sin_p1);
    if (Cos_p1 >= COS_67P5) {
      Height = W / Cos_p1 - Rn;
    }
    else if (Cos_p1 <= -COS_67P5) {
      Height = W / -Cos_p1 - Rn;
    }
    else {
      Height = Z / Sin_p1 + Rn * (this.es - 1.0);
    }
    if (At_Pole === false) {
      Latitude = Math.atan(Sin_p1 / Cos_p1);
    }

    p.x = Longitude;
    p.y = Latitude;
    p.z = Height;
    return p;
  }, // geocentric_to_geodetic_noniter()

  /****************************************************************/
  // pj_geocentic_to_wgs84( p )
  //  p = point to transform in geocentric coordinates (x,y,z)
  geocentric_to_wgs84: function(p) {

    if (this.datum_type === PJD_3PARAM) {
      // if( x[io] === HUGE_VAL )
      //    continue;
      p.x += this.datum_params[0];
      p.y += this.datum_params[1];
      p.z += this.datum_params[2];

    }
    else if (this.datum_type === PJD_7PARAM) {
      var Dx_BF = this.datum_params[0];
      var Dy_BF = this.datum_params[1];
      var Dz_BF = this.datum_params[2];
      var Rx_BF = this.datum_params[3];
      var Ry_BF = this.datum_params[4];
      var Rz_BF = this.datum_params[5];
      var M_BF = this.datum_params[6];
      // if( x[io] === HUGE_VAL )
      //    continue;
      var x_out = M_BF * (p.x - Rz_BF * p.y + Ry_BF * p.z) + Dx_BF;
      var y_out = M_BF * (Rz_BF * p.x + p.y - Rx_BF * p.z) + Dy_BF;
      var z_out = M_BF * (-Ry_BF * p.x + Rx_BF * p.y + p.z) + Dz_BF;
      p.x = x_out;
      p.y = y_out;
      p.z = z_out;
    }
  }, // cs_geocentric_to_wgs84

  /****************************************************************/
  // pj_geocentic_from_wgs84()
  //  coordinate system definition,
  //  point to transform in geocentric coordinates (x,y,z)
  geocentric_from_wgs84: function(p) {

    if (this.datum_type === PJD_3PARAM) {
      //if( x[io] === HUGE_VAL )
      //    continue;
      p.x -= this.datum_params[0];
      p.y -= this.datum_params[1];
      p.z -= this.datum_params[2];

    }
    else if (this.datum_type === PJD_7PARAM) {
      var Dx_BF = this.datum_params[0];
      var Dy_BF = this.datum_params[1];
      var Dz_BF = this.datum_params[2];
      var Rx_BF = this.datum_params[3];
      var Ry_BF = this.datum_params[4];
      var Rz_BF = this.datum_params[5];
      var M_BF = this.datum_params[6];
      var x_tmp = (p.x - Dx_BF) / M_BF;
      var y_tmp = (p.y - Dy_BF) / M_BF;
      var z_tmp = (p.z - Dz_BF) / M_BF;
      //if( x[io] === HUGE_VAL )
      //    continue;

      p.x = x_tmp + Rz_BF * y_tmp - Ry_BF * z_tmp;
      p.y = -Rz_BF * x_tmp + y_tmp + Rx_BF * z_tmp;
      p.z = Ry_BF * x_tmp - Rx_BF * y_tmp + z_tmp;
    } //cs_geocentric_from_wgs84()
  }
};

/** point object, nothing fancy, just allows values to be
    passed back and forth by reference rather than by value.
    Other point classes may be used as long as they have
    x and y properties, which will get modified in the transform method.
*/
module.exports = datum;

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/datum_transform.js":[function(require,module,exports){
var PJD_3PARAM = 1;
var PJD_7PARAM = 2;
var PJD_GRIDSHIFT = 3;
var PJD_NODATUM = 5; // WGS84 or equivalent
var SRS_WGS84_SEMIMAJOR = 6378137; // only used in grid shift transforms
var SRS_WGS84_ESQUARED = 0.006694379990141316; //DGR: 2012-07-29
module.exports = function(source, dest, point) {
  var wp, i, l;

  function checkParams(fallback) {
    return (fallback === PJD_3PARAM || fallback === PJD_7PARAM);
  }
  // Short cut if the datums are identical.
  if (source.compare_datums(dest)) {
    return point; // in this case, zero is sucess,
    // whereas cs_compare_datums returns 1 to indicate TRUE
    // confusing, should fix this
  }

  // Explicitly skip datum transform by setting 'datum=none' as parameter for either source or dest
  if (source.datum_type === PJD_NODATUM || dest.datum_type === PJD_NODATUM) {
    return point;
  }

  //DGR: 2012-07-29 : add nadgrids support (begin)
  var src_a = source.a;
  var src_es = source.es;

  var dst_a = dest.a;
  var dst_es = dest.es;

  var fallback = source.datum_type;
  // If this datum requires grid shifts, then apply it to geodetic coordinates.
  if (fallback === PJD_GRIDSHIFT) {
    if (this.apply_gridshift(source, 0, point) === 0) {
      source.a = SRS_WGS84_SEMIMAJOR;
      source.es = SRS_WGS84_ESQUARED;
    }
    else {
      // try 3 or 7 params transformation or nothing ?
      if (!source.datum_params) {
        source.a = src_a;
        source.es = source.es;
        return point;
      }
      wp = 1;
      for (i = 0, l = source.datum_params.length; i < l; i++) {
        wp *= source.datum_params[i];
      }
      if (wp === 0) {
        source.a = src_a;
        source.es = source.es;
        return point;
      }
      if (source.datum_params.length > 3) {
        fallback = PJD_7PARAM;
      }
      else {
        fallback = PJD_3PARAM;
      }
    }
  }
  if (dest.datum_type === PJD_GRIDSHIFT) {
    dest.a = SRS_WGS84_SEMIMAJOR;
    dest.es = SRS_WGS84_ESQUARED;
  }
  // Do we need to go through geocentric coordinates?
  if (source.es !== dest.es || source.a !== dest.a || checkParams(fallback) || checkParams(dest.datum_type)) {
    //DGR: 2012-07-29 : add nadgrids support (end)
    // Convert to geocentric coordinates.
    source.geodetic_to_geocentric(point);
    // CHECK_RETURN;
    // Convert between datums
    if (checkParams(source.datum_type)) {
      source.geocentric_to_wgs84(point);
      // CHECK_RETURN;
    }
    if (checkParams(dest.datum_type)) {
      dest.geocentric_from_wgs84(point);
      // CHECK_RETURN;
    }
    // Convert back to geodetic coordinates
    dest.geocentric_to_geodetic(point);
    // CHECK_RETURN;
  }
  // Apply grid shift to destination if required
  if (dest.datum_type === PJD_GRIDSHIFT) {
    this.apply_gridshift(dest, 1, point);
    // CHECK_RETURN;
  }

  source.a = src_a;
  source.es = src_es;
  dest.a = dst_a;
  dest.es = dst_es;

  return point;
};


},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/defs.js":[function(require,module,exports){
var globals = require('./global');
var parseProj = require('./projString');
var wkt = require('./wkt');

function defs(name) {
  /*global console*/
  var that = this;
  if (arguments.length === 2) {
    var def = arguments[1];
    if (typeof def === 'string') {
      if (def.charAt(0) === '+') {
        defs[name] = parseProj(arguments[1]);
      }
      else {
        defs[name] = wkt(arguments[1]);
      }
    } else {
      defs[name] = def;
    }
  }
  else if (arguments.length === 1) {
    if (Array.isArray(name)) {
      return name.map(function(v) {
        if (Array.isArray(v)) {
          defs.apply(that, v);
        }
        else {
          defs(v);
        }
      });
    }
    else if (typeof name === 'string') {
      if (name in defs) {
        return defs[name];
      }
    }
    else if ('EPSG' in name) {
      defs['EPSG:' + name.EPSG] = name;
    }
    else if ('ESRI' in name) {
      defs['ESRI:' + name.ESRI] = name;
    }
    else if ('IAU2000' in name) {
      defs['IAU2000:' + name.IAU2000] = name;
    }
    else {
      console.log(name);
    }
    return;
  }


}
globals(defs);
module.exports = defs;

},{"./global":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/global.js","./projString":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projString.js","./wkt":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/wkt.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/deriveConstants.js":[function(require,module,exports){
var Datum = require('./constants/Datum');
var Ellipsoid = require('./constants/Ellipsoid');
var extend = require('./extend');
var datum = require('./datum');
var EPSLN = 1.0e-10;
// ellipoid pj_set_ell.c
var SIXTH = 0.1666666666666666667;
/* 1/6 */
var RA4 = 0.04722222222222222222;
/* 17/360 */
var RA6 = 0.02215608465608465608;
module.exports = function(json) {
  // DGR 2011-03-20 : nagrids -> nadgrids
  if (json.datumCode && json.datumCode !== 'none') {
    var datumDef = Datum[json.datumCode];
    if (datumDef) {
      json.datum_params = datumDef.towgs84 ? datumDef.towgs84.split(',') : null;
      json.ellps = datumDef.ellipse;
      json.datumName = datumDef.datumName ? datumDef.datumName : json.datumCode;
    }
  }
  if (!json.a) { // do we have an ellipsoid?
    var ellipse = Ellipsoid[json.ellps] ? Ellipsoid[json.ellps] : Ellipsoid.WGS84;
    extend(json, ellipse);
  }
  if (json.rf && !json.b) {
    json.b = (1.0 - 1.0 / json.rf) * json.a;
  }
  if (json.rf === 0 || Math.abs(json.a - json.b) < EPSLN) {
    json.sphere = true;
    json.b = json.a;
  }
  json.a2 = json.a * json.a; // used in geocentric
  json.b2 = json.b * json.b; // used in geocentric
  json.es = (json.a2 - json.b2) / json.a2; // e ^ 2
  json.e = Math.sqrt(json.es); // eccentricity
  if (json.R_A) {
    json.a *= 1 - json.es * (SIXTH + json.es * (RA4 + json.es * RA6));
    json.a2 = json.a * json.a;
    json.b2 = json.b * json.b;
    json.es = 0;
  }
  json.ep2 = (json.a2 - json.b2) / json.b2; // used in geocentric
  if (!json.k0) {
    json.k0 = 1.0; //default value
  }
  //DGR 2010-11-12: axis
  if (!json.axis) {
    json.axis = "enu";
  }

  if (!json.datum) {
    json.datum = datum(json);
  }
  return json;
};

},{"./constants/Datum":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/Datum.js","./constants/Ellipsoid":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/Ellipsoid.js","./datum":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/datum.js","./extend":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/extend.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/extend.js":[function(require,module,exports){
module.exports = function(destination, source) {
  destination = destination || {};
  var value, property;
  if (!source) {
    return destination;
  }
  for (property in source) {
    value = source[property];
    if (value !== undefined) {
      destination[property] = value;
    }
  }
  return destination;
};

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/global.js":[function(require,module,exports){
module.exports = function(defs) {
  defs('EPSG:4326', "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees");
  defs('EPSG:4269', "+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees");
  defs('EPSG:3857', "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");

  defs.WGS84 = defs['EPSG:4326'];
  defs['EPSG:3785'] = defs['EPSG:3857']; // maintain backward compat, official code is 3857
  defs.GOOGLE = defs['EPSG:3857'];
  defs['EPSG:900913'] = defs['EPSG:3857'];
  defs['EPSG:102113'] = defs['EPSG:3857'];
};

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/includedProjections.js":[function(require,module,exports){
var projs = [
  require('./projections/tmerc'),
  require('./projections/utm'),
  require('./projections/sterea'),
  require('./projections/stere'),
  require('./projections/somerc'),
  require('./projections/omerc'),
  require('./projections/lcc'),
  require('./projections/krovak'),
  require('./projections/cass'),
  require('./projections/laea'),
  require('./projections/aea'),
  require('./projections/gnom'),
  require('./projections/cea'),
  require('./projections/eqc'),
  require('./projections/poly'),
  require('./projections/nzmg'),
  require('./projections/mill'),
  require('./projections/sinu'),
  require('./projections/moll'),
  require('./projections/eqdc'),
  require('./projections/vandg'),
  require('./projections/aeqd')
];
module.exports = function(proj4){
  projs.forEach(function(proj){
    proj4.Proj.projections.add(proj);
  });
};
},{"./projections/aea":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/aea.js","./projections/aeqd":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/aeqd.js","./projections/cass":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/cass.js","./projections/cea":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/cea.js","./projections/eqc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/eqc.js","./projections/eqdc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/eqdc.js","./projections/gnom":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/gnom.js","./projections/krovak":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/krovak.js","./projections/laea":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/laea.js","./projections/lcc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/lcc.js","./projections/mill":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/mill.js","./projections/moll":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/moll.js","./projections/nzmg":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/nzmg.js","./projections/omerc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/omerc.js","./projections/poly":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/poly.js","./projections/sinu":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/sinu.js","./projections/somerc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/somerc.js","./projections/stere":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/stere.js","./projections/sterea":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/sterea.js","./projections/tmerc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/tmerc.js","./projections/utm":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/utm.js","./projections/vandg":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/vandg.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/index.js":[function(require,module,exports){
var proj4 = require('./core');
proj4.defaultDatum = 'WGS84'; //default datum
proj4.Proj = require('./Proj');
proj4.WGS84 = new proj4.Proj('WGS84');
proj4.Point = require('./Point');
proj4.toPoint = require("./common/toPoint");
proj4.defs = require('./defs');
proj4.transform = require('./transform');
proj4.mgrs = require('mgrs');
proj4.version = require('../package.json').version;
require('./includedProjections')(proj4);
module.exports = proj4;
},{"../package.json":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/package.json","./Point":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Point.js","./Proj":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Proj.js","./common/toPoint":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/toPoint.js","./core":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/core.js","./defs":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/defs.js","./includedProjections":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/includedProjections.js","./transform":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/transform.js","mgrs":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/node_modules/mgrs/mgrs.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/parseCode.js":[function(require,module,exports){
var defs = require('./defs');
var wkt = require('./wkt');
var projStr = require('./projString');
function testObj(code){
  return typeof code === 'string';
}
function testDef(code){
  return code in defs;
}
function testWKT(code){
  var codeWords = ['GEOGCS','GEOCCS','PROJCS','LOCAL_CS'];
  return codeWords.reduce(function(a,b){
    return a+1+code.indexOf(b);
  },0);
}
function testProj(code){
  return code[0] === '+';
}
function parse(code){
  if (testObj(code)) {
    //check to see if this is a WKT string
    if (testDef(code)) {
      return defs[code];
    }
    else if (testWKT(code)) {
      return wkt(code);
    }
    else if (testProj(code)) {
      return projStr(code);
    }
  }else{
    return code;
  }
}

module.exports = parse;
},{"./defs":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/defs.js","./projString":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projString.js","./wkt":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/wkt.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projString.js":[function(require,module,exports){
var D2R = 0.01745329251994329577;
var PrimeMeridian = require('./constants/PrimeMeridian');
var units = require('./constants/units');

module.exports = function(defData) {
  var self = {};
  var paramObj = {};
  defData.split("+").map(function(v) {
    return v.trim();
  }).filter(function(a) {
    return a;
  }).forEach(function(a) {
    var split = a.split("=");
    split.push(true);
    paramObj[split[0].toLowerCase()] = split[1];
  });
  var paramName, paramVal, paramOutname;
  var params = {
    proj: 'projName',
    datum: 'datumCode',
    rf: function(v) {
      self.rf = parseFloat(v);
    },
    lat_0: function(v) {
      self.lat0 = v * D2R;
    },
    lat_1: function(v) {
      self.lat1 = v * D2R;
    },
    lat_2: function(v) {
      self.lat2 = v * D2R;
    },
    lat_ts: function(v) {
      self.lat_ts = v * D2R;
    },
    lon_0: function(v) {
      self.long0 = v * D2R;
    },
    lon_1: function(v) {
      self.long1 = v * D2R;
    },
    lon_2: function(v) {
      self.long2 = v * D2R;
    },
    alpha: function(v) {
      self.alpha = parseFloat(v) * D2R;
    },
    lonc: function(v) {
      self.longc = v * D2R;
    },
    x_0: function(v) {
      self.x0 = parseFloat(v);
    },
    y_0: function(v) {
      self.y0 = parseFloat(v);
    },
    k_0: function(v) {
      self.k0 = parseFloat(v);
    },
    k: function(v) {
      self.k0 = parseFloat(v);
    },
    a: function(v) {
      self.a = parseFloat(v);
    },
    b: function(v) {
      self.b = parseFloat(v);
    },
    r_a: function() {
      self.R_A = true;
    },
    zone: function(v) {
      self.zone = parseInt(v, 10);
    },
    south: function() {
      self.utmSouth = true;
    },
    towgs84: function(v) {
      self.datum_params = v.split(",").map(function(a) {
        return parseFloat(a);
      });
    },
    to_meter: function(v) {
      self.to_meter = parseFloat(v);
    },
    units: function(v) {
      self.units = v;
      if (units[v]) {
        self.to_meter = units[v].to_meter;
      }
    },
    from_greenwich: function(v) {
      self.from_greenwich = v * D2R;
    },
    pm: function(v) {
      self.from_greenwich = (PrimeMeridian[v] ? PrimeMeridian[v] : parseFloat(v)) * D2R;
    },
    nadgrids: function(v) {
      if (v === '@null') {
        self.datumCode = 'none';
      }
      else {
        self.nadgrids = v;
      }
    },
    axis: function(v) {
      var legalAxis = "ewnsud";
      if (v.length === 3 && legalAxis.indexOf(v.substr(0, 1)) !== -1 && legalAxis.indexOf(v.substr(1, 1)) !== -1 && legalAxis.indexOf(v.substr(2, 1)) !== -1) {
        self.axis = v;
      }
    }
  };
  for (paramName in paramObj) {
    paramVal = paramObj[paramName];
    if (paramName in params) {
      paramOutname = params[paramName];
      if (typeof paramOutname === 'function') {
        paramOutname(paramVal);
      }
      else {
        self[paramOutname] = paramVal;
      }
    }
    else {
      self[paramName] = paramVal;
    }
  }
  if(typeof self.datumCode === 'string' && self.datumCode !== "WGS84"){
    self.datumCode = self.datumCode.toLowerCase();
  }
  return self;
};

},{"./constants/PrimeMeridian":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/PrimeMeridian.js","./constants/units":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/units.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections.js":[function(require,module,exports){
var projs = [
  require('./projections/merc'),
  require('./projections/longlat')
];
var names = {};
var projStore = [];

function add(proj, i) {
  var len = projStore.length;
  if (!proj.names) {
    console.log(i);
    return true;
  }
  projStore[len] = proj;
  proj.names.forEach(function(n) {
    names[n.toLowerCase()] = len;
  });
  return this;
}

exports.add = add;

exports.get = function(name) {
  if (!name) {
    return false;
  }
  var n = name.toLowerCase();
  if (typeof names[n] !== 'undefined' && projStore[names[n]]) {
    return projStore[names[n]];
  }
};
exports.start = function() {
  projs.forEach(add);
};

},{"./projections/longlat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/longlat.js","./projections/merc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/merc.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/aea.js":[function(require,module,exports){
var EPSLN = 1.0e-10;
var msfnz = require('../common/msfnz');
var qsfnz = require('../common/qsfnz');
var adjust_lon = require('../common/adjust_lon');
var asinz = require('../common/asinz');
exports.init = function() {

  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2);
  this.e3 = Math.sqrt(this.es);

  this.sin_po = Math.sin(this.lat1);
  this.cos_po = Math.cos(this.lat1);
  this.t1 = this.sin_po;
  this.con = this.sin_po;
  this.ms1 = msfnz(this.e3, this.sin_po, this.cos_po);
  this.qs1 = qsfnz(this.e3, this.sin_po, this.cos_po);

  this.sin_po = Math.sin(this.lat2);
  this.cos_po = Math.cos(this.lat2);
  this.t2 = this.sin_po;
  this.ms2 = msfnz(this.e3, this.sin_po, this.cos_po);
  this.qs2 = qsfnz(this.e3, this.sin_po, this.cos_po);

  this.sin_po = Math.sin(this.lat0);
  this.cos_po = Math.cos(this.lat0);
  this.t3 = this.sin_po;
  this.qs0 = qsfnz(this.e3, this.sin_po, this.cos_po);

  if (Math.abs(this.lat1 - this.lat2) > EPSLN) {
    this.ns0 = (this.ms1 * this.ms1 - this.ms2 * this.ms2) / (this.qs2 - this.qs1);
  }
  else {
    this.ns0 = this.con;
  }
  this.c = this.ms1 * this.ms1 + this.ns0 * this.qs1;
  this.rh = this.a * Math.sqrt(this.c - this.ns0 * this.qs0) / this.ns0;
};

/* Albers Conical Equal Area forward equations--mapping lat,long to x,y
  -------------------------------------------------------------------*/
exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  this.sin_phi = Math.sin(lat);
  this.cos_phi = Math.cos(lat);

  var qs = qsfnz(this.e3, this.sin_phi, this.cos_phi);
  var rh1 = this.a * Math.sqrt(this.c - this.ns0 * qs) / this.ns0;
  var theta = this.ns0 * adjust_lon(lon - this.long0);
  var x = rh1 * Math.sin(theta) + this.x0;
  var y = this.rh - rh1 * Math.cos(theta) + this.y0;

  p.x = x;
  p.y = y;
  return p;
};


exports.inverse = function(p) {
  var rh1, qs, con, theta, lon, lat;

  p.x -= this.x0;
  p.y = this.rh - p.y + this.y0;
  if (this.ns0 >= 0) {
    rh1 = Math.sqrt(p.x * p.x + p.y * p.y);
    con = 1;
  }
  else {
    rh1 = -Math.sqrt(p.x * p.x + p.y * p.y);
    con = -1;
  }
  theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2(con * p.x, con * p.y);
  }
  con = rh1 * this.ns0 / this.a;
  if (this.sphere) {
    lat = Math.asin((this.c - con * con) / (2 * this.ns0));
  }
  else {
    qs = (this.c - con * con) / this.ns0;
    lat = this.phi1z(this.e3, qs);
  }

  lon = adjust_lon(theta / this.ns0 + this.long0);
  p.x = lon;
  p.y = lat;
  return p;
};

/* Function to compute phi1, the latitude for the inverse of the
   Albers Conical Equal-Area projection.
-------------------------------------------*/
exports.phi1z = function(eccent, qs) {
  var sinphi, cosphi, con, com, dphi;
  var phi = asinz(0.5 * qs);
  if (eccent < EPSLN) {
    return phi;
  }

  var eccnts = eccent * eccent;
  for (var i = 1; i <= 25; i++) {
    sinphi = Math.sin(phi);
    cosphi = Math.cos(phi);
    con = eccent * sinphi;
    com = 1 - con * con;
    dphi = 0.5 * com * com / cosphi * (qs / (1 - eccnts) - sinphi / com + 0.5 / eccent * Math.log((1 - con) / (1 + con)));
    phi = phi + dphi;
    if (Math.abs(dphi) <= 1e-7) {
      return phi;
    }
  }
  return null;
};
exports.names = ["Albers_Conic_Equal_Area", "Albers", "aea"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js","../common/qsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/qsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/aeqd.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var mlfn = require('../common/mlfn');
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var gN = require('../common/gN');
var asinz = require('../common/asinz');
var imlfn = require('../common/imlfn');
exports.init = function() {
  this.sin_p12 = Math.sin(this.lat0);
  this.cos_p12 = Math.cos(this.lat0);
};

exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var sinphi = Math.sin(p.y);
  var cosphi = Math.cos(p.y);
  var dlon = adjust_lon(lon - this.long0);
  var e0, e1, e2, e3, Mlp, Ml, tanphi, Nl1, Nl, psi, Az, G, H, GH, Hs, c, kp, cos_c, s, s2, s3, s4, s5;
  if (this.sphere) {
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      //North Pole case
      p.x = this.x0 + this.a * (HALF_PI - lat) * Math.sin(dlon);
      p.y = this.y0 - this.a * (HALF_PI - lat) * Math.cos(dlon);
      return p;
    }
    else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      //South Pole case
      p.x = this.x0 + this.a * (HALF_PI + lat) * Math.sin(dlon);
      p.y = this.y0 + this.a * (HALF_PI + lat) * Math.cos(dlon);
      return p;
    }
    else {
      //default case
      cos_c = this.sin_p12 * sinphi + this.cos_p12 * cosphi * Math.cos(dlon);
      c = Math.acos(cos_c);
      kp = c / Math.sin(c);
      p.x = this.x0 + this.a * kp * cosphi * Math.sin(dlon);
      p.y = this.y0 + this.a * kp * (this.cos_p12 * sinphi - this.sin_p12 * cosphi * Math.cos(dlon));
      return p;
    }
  }
  else {
    e0 = e0fn(this.es);
    e1 = e1fn(this.es);
    e2 = e2fn(this.es);
    e3 = e3fn(this.es);
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      //North Pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      Ml = this.a * mlfn(e0, e1, e2, e3, lat);
      p.x = this.x0 + (Mlp - Ml) * Math.sin(dlon);
      p.y = this.y0 - (Mlp - Ml) * Math.cos(dlon);
      return p;
    }
    else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      //South Pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      Ml = this.a * mlfn(e0, e1, e2, e3, lat);
      p.x = this.x0 + (Mlp + Ml) * Math.sin(dlon);
      p.y = this.y0 + (Mlp + Ml) * Math.cos(dlon);
      return p;
    }
    else {
      //Default case
      tanphi = sinphi / cosphi;
      Nl1 = gN(this.a, this.e, this.sin_p12);
      Nl = gN(this.a, this.e, sinphi);
      psi = Math.atan((1 - this.es) * tanphi + this.es * Nl1 * this.sin_p12 / (Nl * cosphi));
      Az = Math.atan2(Math.sin(dlon), this.cos_p12 * Math.tan(psi) - this.sin_p12 * Math.cos(dlon));
      if (Az === 0) {
        s = Math.asin(this.cos_p12 * Math.sin(psi) - this.sin_p12 * Math.cos(psi));
      }
      else if (Math.abs(Math.abs(Az) - Math.PI) <= EPSLN) {
        s = -Math.asin(this.cos_p12 * Math.sin(psi) - this.sin_p12 * Math.cos(psi));
      }
      else {
        s = Math.asin(Math.sin(dlon) * Math.cos(psi) / Math.sin(Az));
      }
      G = this.e * this.sin_p12 / Math.sqrt(1 - this.es);
      H = this.e * this.cos_p12 * Math.cos(Az) / Math.sqrt(1 - this.es);
      GH = G * H;
      Hs = H * H;
      s2 = s * s;
      s3 = s2 * s;
      s4 = s3 * s;
      s5 = s4 * s;
      c = Nl1 * s * (1 - s2 * Hs * (1 - Hs) / 6 + s3 / 8 * GH * (1 - 2 * Hs) + s4 / 120 * (Hs * (4 - 7 * Hs) - 3 * G * G * (1 - 7 * Hs)) - s5 / 48 * GH);
      p.x = this.x0 + c * Math.sin(Az);
      p.y = this.y0 + c * Math.cos(Az);
      return p;
    }
  }


};

exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var rh, z, sinz, cosz, lon, lat, con, e0, e1, e2, e3, Mlp, M, N1, psi, Az, cosAz, tmp, A, B, D, Ee, F;
  if (this.sphere) {
    rh = Math.sqrt(p.x * p.x + p.y * p.y);
    if (rh > (2 * HALF_PI * this.a)) {
      return;
    }
    z = rh / this.a;

    sinz = Math.sin(z);
    cosz = Math.cos(z);

    lon = this.long0;
    if (Math.abs(rh) <= EPSLN) {
      lat = this.lat0;
    }
    else {
      lat = asinz(cosz * this.sin_p12 + (p.y * sinz * this.cos_p12) / rh);
      con = Math.abs(this.lat0) - HALF_PI;
      if (Math.abs(con) <= EPSLN) {
        if (this.lat0 >= 0) {
          lon = adjust_lon(this.long0 + Math.atan2(p.x, - p.y));
        }
        else {
          lon = adjust_lon(this.long0 - Math.atan2(-p.x, p.y));
        }
      }
      else {
        /*con = cosz - this.sin_p12 * Math.sin(lat);
        if ((Math.abs(con) < EPSLN) && (Math.abs(p.x) < EPSLN)) {
          //no-op, just keep the lon value as is
        } else {
          var temp = Math.atan2((p.x * sinz * this.cos_p12), (con * rh));
          lon = adjust_lon(this.long0 + Math.atan2((p.x * sinz * this.cos_p12), (con * rh)));
        }*/
        lon = adjust_lon(this.long0 + Math.atan2(p.x * sinz, rh * this.cos_p12 * cosz - p.y * this.sin_p12 * sinz));
      }
    }

    p.x = lon;
    p.y = lat;
    return p;
  }
  else {
    e0 = e0fn(this.es);
    e1 = e1fn(this.es);
    e2 = e2fn(this.es);
    e3 = e3fn(this.es);
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      //North pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      rh = Math.sqrt(p.x * p.x + p.y * p.y);
      M = Mlp - rh;
      lat = imlfn(M / this.a, e0, e1, e2, e3);
      lon = adjust_lon(this.long0 + Math.atan2(p.x, - 1 * p.y));
      p.x = lon;
      p.y = lat;
      return p;
    }
    else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      //South pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      rh = Math.sqrt(p.x * p.x + p.y * p.y);
      M = rh - Mlp;

      lat = imlfn(M / this.a, e0, e1, e2, e3);
      lon = adjust_lon(this.long0 + Math.atan2(p.x, p.y));
      p.x = lon;
      p.y = lat;
      return p;
    }
    else {
      //default case
      rh = Math.sqrt(p.x * p.x + p.y * p.y);
      Az = Math.atan2(p.x, p.y);
      N1 = gN(this.a, this.e, this.sin_p12);
      cosAz = Math.cos(Az);
      tmp = this.e * this.cos_p12 * cosAz;
      A = -tmp * tmp / (1 - this.es);
      B = 3 * this.es * (1 - A) * this.sin_p12 * this.cos_p12 * cosAz / (1 - this.es);
      D = rh / N1;
      Ee = D - A * (1 + A) * Math.pow(D, 3) / 6 - B * (1 + 3 * A) * Math.pow(D, 4) / 24;
      F = 1 - A * Ee * Ee / 2 - D * Ee * Ee * Ee / 6;
      psi = Math.asin(this.sin_p12 * Math.cos(Ee) + this.cos_p12 * Math.sin(Ee) * cosAz);
      lon = adjust_lon(this.long0 + Math.asin(Math.sin(Az) * Math.sin(Ee) / Math.cos(psi)));
      lat = Math.atan((1 - this.es * F * this.sin_p12 / Math.sin(psi)) * Math.tan(psi) / (1 - this.es));
      p.x = lon;
      p.y = lat;
      return p;
    }
  }

};
exports.names = ["Azimuthal_Equidistant", "aeqd"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js","../common/e0fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js","../common/e1fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js","../common/e2fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js","../common/e3fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js","../common/gN":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/gN.js","../common/imlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/imlfn.js","../common/mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/cass.js":[function(require,module,exports){
var mlfn = require('../common/mlfn');
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var gN = require('../common/gN');
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var imlfn = require('../common/imlfn');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
exports.init = function() {
  if (!this.sphere) {
    this.e0 = e0fn(this.es);
    this.e1 = e1fn(this.es);
    this.e2 = e2fn(this.es);
    this.e3 = e3fn(this.es);
    this.ml0 = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
  }
};



/* Cassini forward equations--mapping lat,long to x,y
  -----------------------------------------------------------------------*/
exports.forward = function(p) {

  /* Forward equations
      -----------------*/
  var x, y;
  var lam = p.x;
  var phi = p.y;
  lam = adjust_lon(lam - this.long0);

  if (this.sphere) {
    x = this.a * Math.asin(Math.cos(phi) * Math.sin(lam));
    y = this.a * (Math.atan2(Math.tan(phi), Math.cos(lam)) - this.lat0);
  }
  else {
    //ellipsoid
    var sinphi = Math.sin(phi);
    var cosphi = Math.cos(phi);
    var nl = gN(this.a, this.e, sinphi);
    var tl = Math.tan(phi) * Math.tan(phi);
    var al = lam * Math.cos(phi);
    var asq = al * al;
    var cl = this.es * cosphi * cosphi / (1 - this.es);
    var ml = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, phi);

    x = nl * al * (1 - asq * tl * (1 / 6 - (8 - tl + 8 * cl) * asq / 120));
    y = ml - this.ml0 + nl * sinphi / cosphi * asq * (0.5 + (5 - tl + 6 * cl) * asq / 24);


  }

  p.x = x + this.x0;
  p.y = y + this.y0;
  return p;
};

/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var x = p.x / this.a;
  var y = p.y / this.a;
  var phi, lam;

  if (this.sphere) {
    var dd = y + this.lat0;
    phi = Math.asin(Math.sin(dd) * Math.cos(x));
    lam = Math.atan2(Math.tan(x), Math.cos(dd));
  }
  else {
    /* ellipsoid */
    var ml1 = this.ml0 / this.a + y;
    var phi1 = imlfn(ml1, this.e0, this.e1, this.e2, this.e3);
    if (Math.abs(Math.abs(phi1) - HALF_PI) <= EPSLN) {
      p.x = this.long0;
      p.y = HALF_PI;
      if (y < 0) {
        p.y *= -1;
      }
      return p;
    }
    var nl1 = gN(this.a, this.e, Math.sin(phi1));

    var rl1 = nl1 * nl1 * nl1 / this.a / this.a * (1 - this.es);
    var tl1 = Math.pow(Math.tan(phi1), 2);
    var dl = x * this.a / nl1;
    var dsq = dl * dl;
    phi = phi1 - nl1 * Math.tan(phi1) / rl1 * dl * dl * (0.5 - (1 + 3 * tl1) * dl * dl / 24);
    lam = dl * (1 - dsq * (tl1 / 3 + (1 + 3 * tl1) * tl1 * dsq / 15)) / Math.cos(phi1);

  }

  p.x = adjust_lon(lam + this.long0);
  p.y = adjust_lat(phi);
  return p;

};
exports.names = ["Cassini", "Cassini_Soldner", "cass"];
},{"../common/adjust_lat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js","../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/e0fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js","../common/e1fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js","../common/e2fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js","../common/e3fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js","../common/gN":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/gN.js","../common/imlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/imlfn.js","../common/mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/cea.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var qsfnz = require('../common/qsfnz');
var msfnz = require('../common/msfnz');
var iqsfnz = require('../common/iqsfnz');
/*
  reference:  
    "Cartographic Projection Procedures for the UNIX Environment-
    A User's Manual" by Gerald I. Evenden,
    USGS Open File Report 90-284and Release 4 Interim Reports (2003)
*/
exports.init = function() {
  //no-op
  if (!this.sphere) {
    this.k0 = msfnz(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts));
  }
};


/* Cylindrical Equal Area forward equations--mapping lat,long to x,y
    ------------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var x, y;
  /* Forward equations
      -----------------*/
  var dlon = adjust_lon(lon - this.long0);
  if (this.sphere) {
    x = this.x0 + this.a * dlon * Math.cos(this.lat_ts);
    y = this.y0 + this.a * Math.sin(lat) / Math.cos(this.lat_ts);
  }
  else {
    var qs = qsfnz(this.e, Math.sin(lat));
    x = this.x0 + this.a * this.k0 * dlon;
    y = this.y0 + this.a * qs * 0.5 / this.k0;
  }

  p.x = x;
  p.y = y;
  return p;
};

/* Cylindrical Equal Area inverse equations--mapping x,y to lat/long
    ------------------------------------------------------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var lon, lat;

  if (this.sphere) {
    lon = adjust_lon(this.long0 + (p.x / this.a) / Math.cos(this.lat_ts));
    lat = Math.asin((p.y / this.a) * Math.cos(this.lat_ts));
  }
  else {
    lat = iqsfnz(this.e, 2 * p.y * this.k0 / this.a);
    lon = adjust_lon(this.long0 + p.x / (this.a * this.k0));
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["cea"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/iqsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/iqsfnz.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js","../common/qsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/qsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/eqc.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
exports.init = function() {

  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  this.lat0 = this.lat0 || 0;
  this.long0 = this.long0 || 0;
  this.lat_ts = this.lat_ts || 0;
  this.title = this.title || "Equidistant Cylindrical (Plate Carre)";

  this.rc = Math.cos(this.lat_ts);
};


// forward equations--mapping lat,long to x,y
// -----------------------------------------------------------------
exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  var dlon = adjust_lon(lon - this.long0);
  var dlat = adjust_lat(lat - this.lat0);
  p.x = this.x0 + (this.a * dlon * this.rc);
  p.y = this.y0 + (this.a * dlat);
  return p;
};

// inverse equations--mapping x,y to lat/long
// -----------------------------------------------------------------
exports.inverse = function(p) {

  var x = p.x;
  var y = p.y;

  p.x = adjust_lon(this.long0 + ((x - this.x0) / (this.a * this.rc)));
  p.y = adjust_lat(this.lat0 + ((y - this.y0) / (this.a)));
  return p;
};
exports.names = ["Equirectangular", "Equidistant_Cylindrical", "eqc"];

},{"../common/adjust_lat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js","../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/eqdc.js":[function(require,module,exports){
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var msfnz = require('../common/msfnz');
var mlfn = require('../common/mlfn');
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var imlfn = require('../common/imlfn');
var EPSLN = 1.0e-10;
exports.init = function() {

  /* Place parameters in static storage for common use
      -------------------------------------------------*/
  // Standard Parallels cannot be equal and on opposite sides of the equator
  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }
  this.lat2 = this.lat2 || this.lat1;
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2);
  this.e = Math.sqrt(this.es);
  this.e0 = e0fn(this.es);
  this.e1 = e1fn(this.es);
  this.e2 = e2fn(this.es);
  this.e3 = e3fn(this.es);

  this.sinphi = Math.sin(this.lat1);
  this.cosphi = Math.cos(this.lat1);

  this.ms1 = msfnz(this.e, this.sinphi, this.cosphi);
  this.ml1 = mlfn(this.e0, this.e1, this.e2, this.e3, this.lat1);

  if (Math.abs(this.lat1 - this.lat2) < EPSLN) {
    this.ns = this.sinphi;
  }
  else {
    this.sinphi = Math.sin(this.lat2);
    this.cosphi = Math.cos(this.lat2);
    this.ms2 = msfnz(this.e, this.sinphi, this.cosphi);
    this.ml2 = mlfn(this.e0, this.e1, this.e2, this.e3, this.lat2);
    this.ns = (this.ms1 - this.ms2) / (this.ml2 - this.ml1);
  }
  this.g = this.ml1 + this.ms1 / this.ns;
  this.ml0 = mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
  this.rh = this.a * (this.g - this.ml0);
};


/* Equidistant Conic forward equations--mapping lat,long to x,y
  -----------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var rh1;

  /* Forward equations
      -----------------*/
  if (this.sphere) {
    rh1 = this.a * (this.g - lat);
  }
  else {
    var ml = mlfn(this.e0, this.e1, this.e2, this.e3, lat);
    rh1 = this.a * (this.g - ml);
  }
  var theta = this.ns * adjust_lon(lon - this.long0);
  var x = this.x0 + rh1 * Math.sin(theta);
  var y = this.y0 + this.rh - rh1 * Math.cos(theta);
  p.x = x;
  p.y = y;
  return p;
};

/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y = this.rh - p.y + this.y0;
  var con, rh1, lat, lon;
  if (this.ns >= 0) {
    rh1 = Math.sqrt(p.x * p.x + p.y * p.y);
    con = 1;
  }
  else {
    rh1 = -Math.sqrt(p.x * p.x + p.y * p.y);
    con = -1;
  }
  var theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2(con * p.x, con * p.y);
  }

  if (this.sphere) {
    lon = adjust_lon(this.long0 + theta / this.ns);
    lat = adjust_lat(this.g - rh1 / this.a);
    p.x = lon;
    p.y = lat;
    return p;
  }
  else {
    var ml = this.g - rh1 / this.a;
    lat = imlfn(ml, this.e0, this.e1, this.e2, this.e3);
    lon = adjust_lon(this.long0 + theta / this.ns);
    p.x = lon;
    p.y = lat;
    return p;
  }

};
exports.names = ["Equidistant_Conic", "eqdc"];

},{"../common/adjust_lat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js","../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/e0fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js","../common/e1fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js","../common/e2fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js","../common/e3fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js","../common/imlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/imlfn.js","../common/mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/gauss.js":[function(require,module,exports){
var FORTPI = Math.PI/4;
var srat = require('../common/srat');
var HALF_PI = Math.PI/2;
var MAX_ITER = 20;
exports.init = function() {
  var sphi = Math.sin(this.lat0);
  var cphi = Math.cos(this.lat0);
  cphi *= cphi;
  this.rc = Math.sqrt(1 - this.es) / (1 - this.es * sphi * sphi);
  this.C = Math.sqrt(1 + this.es * cphi * cphi / (1 - this.es));
  this.phic0 = Math.asin(sphi / this.C);
  this.ratexp = 0.5 * this.C * this.e;
  this.K = Math.tan(0.5 * this.phic0 + FORTPI) / (Math.pow(Math.tan(0.5 * this.lat0 + FORTPI), this.C) * srat(this.e * sphi, this.ratexp));
};

exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;

  p.y = 2 * Math.atan(this.K * Math.pow(Math.tan(0.5 * lat + FORTPI), this.C) * srat(this.e * Math.sin(lat), this.ratexp)) - HALF_PI;
  p.x = this.C * lon;
  return p;
};

exports.inverse = function(p) {
  var DEL_TOL = 1e-14;
  var lon = p.x / this.C;
  var lat = p.y;
  var num = Math.pow(Math.tan(0.5 * lat + FORTPI) / this.K, 1 / this.C);
  for (var i = MAX_ITER; i > 0; --i) {
    lat = 2 * Math.atan(num * srat(this.e * Math.sin(p.y), - 0.5 * this.e)) - HALF_PI;
    if (Math.abs(lat - p.y) < DEL_TOL) {
      break;
    }
    p.y = lat;
  }
  /* convergence failed */
  if (!i) {
    return null;
  }
  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["gauss"];

},{"../common/srat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/srat.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/gnom.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var EPSLN = 1.0e-10;
var asinz = require('../common/asinz');

/*
  reference:
    Wolfram Mathworld "Gnomonic Projection"
    http://mathworld.wolfram.com/GnomonicProjection.html
    Accessed: 12th November 2009
  */
exports.init = function() {

  /* Place parameters in static storage for common use
      -------------------------------------------------*/
  this.sin_p14 = Math.sin(this.lat0);
  this.cos_p14 = Math.cos(this.lat0);
  // Approximation for projecting points to the horizon (infinity)
  this.infinity_dist = 1000 * this.a;
  this.rc = 1;
};


/* Gnomonic forward equations--mapping lat,long to x,y
    ---------------------------------------------------*/
exports.forward = function(p) {
  var sinphi, cosphi; /* sin and cos value        */
  var dlon; /* delta longitude value      */
  var coslon; /* cos of longitude        */
  var ksp; /* scale factor          */
  var g;
  var x, y;
  var lon = p.x;
  var lat = p.y;
  /* Forward equations
      -----------------*/
  dlon = adjust_lon(lon - this.long0);

  sinphi = Math.sin(lat);
  cosphi = Math.cos(lat);

  coslon = Math.cos(dlon);
  g = this.sin_p14 * sinphi + this.cos_p14 * cosphi * coslon;
  ksp = 1;
  if ((g > 0) || (Math.abs(g) <= EPSLN)) {
    x = this.x0 + this.a * ksp * cosphi * Math.sin(dlon) / g;
    y = this.y0 + this.a * ksp * (this.cos_p14 * sinphi - this.sin_p14 * cosphi * coslon) / g;
  }
  else {

    // Point is in the opposing hemisphere and is unprojectable
    // We still need to return a reasonable point, so we project 
    // to infinity, on a bearing 
    // equivalent to the northern hemisphere equivalent
    // This is a reasonable approximation for short shapes and lines that 
    // straddle the horizon.

    x = this.x0 + this.infinity_dist * cosphi * Math.sin(dlon);
    y = this.y0 + this.infinity_dist * (this.cos_p14 * sinphi - this.sin_p14 * cosphi * coslon);

  }
  p.x = x;
  p.y = y;
  return p;
};


exports.inverse = function(p) {
  var rh; /* Rho */
  var sinc, cosc;
  var c;
  var lon, lat;

  /* Inverse equations
      -----------------*/
  p.x = (p.x - this.x0) / this.a;
  p.y = (p.y - this.y0) / this.a;

  p.x /= this.k0;
  p.y /= this.k0;

  if ((rh = Math.sqrt(p.x * p.x + p.y * p.y))) {
    c = Math.atan2(rh, this.rc);
    sinc = Math.sin(c);
    cosc = Math.cos(c);

    lat = asinz(cosc * this.sin_p14 + (p.y * sinc * this.cos_p14) / rh);
    lon = Math.atan2(p.x * sinc, rh * this.cos_p14 * cosc - p.y * this.sin_p14 * sinc);
    lon = adjust_lon(this.long0 + lon);
  }
  else {
    lat = this.phic0;
    lon = 0;
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["gnom"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/krovak.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
exports.init = function() {
  this.a = 6377397.155;
  this.es = 0.006674372230614;
  this.e = Math.sqrt(this.es);
  if (!this.lat0) {
    this.lat0 = 0.863937979737193;
  }
  if (!this.long0) {
    this.long0 = 0.7417649320975901 - 0.308341501185665;
  }
  /* if scale not set default to 0.9999 */
  if (!this.k0) {
    this.k0 = 0.9999;
  }
  this.s45 = 0.785398163397448; /* 45 */
  this.s90 = 2 * this.s45;
  this.fi0 = this.lat0;
  this.e2 = this.es;
  this.e = Math.sqrt(this.e2);
  this.alfa = Math.sqrt(1 + (this.e2 * Math.pow(Math.cos(this.fi0), 4)) / (1 - this.e2));
  this.uq = 1.04216856380474;
  this.u0 = Math.asin(Math.sin(this.fi0) / this.alfa);
  this.g = Math.pow((1 + this.e * Math.sin(this.fi0)) / (1 - this.e * Math.sin(this.fi0)), this.alfa * this.e / 2);
  this.k = Math.tan(this.u0 / 2 + this.s45) / Math.pow(Math.tan(this.fi0 / 2 + this.s45), this.alfa) * this.g;
  this.k1 = this.k0;
  this.n0 = this.a * Math.sqrt(1 - this.e2) / (1 - this.e2 * Math.pow(Math.sin(this.fi0), 2));
  this.s0 = 1.37008346281555;
  this.n = Math.sin(this.s0);
  this.ro0 = this.k1 * this.n0 / Math.tan(this.s0);
  this.ad = this.s90 - this.uq;
};

/* ellipsoid */
/* calculate xy from lat/lon */
/* Constants, identical to inverse transform function */
exports.forward = function(p) {
  var gfi, u, deltav, s, d, eps, ro;
  var lon = p.x;
  var lat = p.y;
  var delta_lon = adjust_lon(lon - this.long0);
  /* Transformation */
  gfi = Math.pow(((1 + this.e * Math.sin(lat)) / (1 - this.e * Math.sin(lat))), (this.alfa * this.e / 2));
  u = 2 * (Math.atan(this.k * Math.pow(Math.tan(lat / 2 + this.s45), this.alfa) / gfi) - this.s45);
  deltav = -delta_lon * this.alfa;
  s = Math.asin(Math.cos(this.ad) * Math.sin(u) + Math.sin(this.ad) * Math.cos(u) * Math.cos(deltav));
  d = Math.asin(Math.cos(u) * Math.sin(deltav) / Math.cos(s));
  eps = this.n * d;
  ro = this.ro0 * Math.pow(Math.tan(this.s0 / 2 + this.s45), this.n) / Math.pow(Math.tan(s / 2 + this.s45), this.n);
  p.y = ro * Math.cos(eps) / 1;
  p.x = ro * Math.sin(eps) / 1;

  if (!this.czech) {
    p.y *= -1;
    p.x *= -1;
  }
  return (p);
};

/* calculate lat/lon from xy */
exports.inverse = function(p) {
  var u, deltav, s, d, eps, ro, fi1;
  var ok;

  /* Transformation */
  /* revert y, x*/
  var tmp = p.x;
  p.x = p.y;
  p.y = tmp;
  if (!this.czech) {
    p.y *= -1;
    p.x *= -1;
  }
  ro = Math.sqrt(p.x * p.x + p.y * p.y);
  eps = Math.atan2(p.y, p.x);
  d = eps / Math.sin(this.s0);
  s = 2 * (Math.atan(Math.pow(this.ro0 / ro, 1 / this.n) * Math.tan(this.s0 / 2 + this.s45)) - this.s45);
  u = Math.asin(Math.cos(this.ad) * Math.sin(s) - Math.sin(this.ad) * Math.cos(s) * Math.cos(d));
  deltav = Math.asin(Math.cos(s) * Math.sin(d) / Math.cos(u));
  p.x = this.long0 - deltav / this.alfa;
  fi1 = u;
  ok = 0;
  var iter = 0;
  do {
    p.y = 2 * (Math.atan(Math.pow(this.k, - 1 / this.alfa) * Math.pow(Math.tan(u / 2 + this.s45), 1 / this.alfa) * Math.pow((1 + this.e * Math.sin(fi1)) / (1 - this.e * Math.sin(fi1)), this.e / 2)) - this.s45);
    if (Math.abs(fi1 - p.y) < 0.0000000001) {
      ok = 1;
    }
    fi1 = p.y;
    iter += 1;
  } while (ok === 0 && iter < 15);
  if (iter >= 15) {
    return null;
  }

  return (p);
};
exports.names = ["Krovak", "krovak"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/laea.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;
var FORTPI = Math.PI/4;
var EPSLN = 1.0e-10;
var qsfnz = require('../common/qsfnz');
var adjust_lon = require('../common/adjust_lon');
/*
  reference
    "New Equal-Area Map Projections for Noncircular Regions", John P. Snyder,
    The American Cartographer, Vol 15, No. 4, October 1988, pp. 341-355.
  */

exports.S_POLE = 1;
exports.N_POLE = 2;
exports.EQUIT = 3;
exports.OBLIQ = 4;


/* Initialize the Lambert Azimuthal Equal Area projection
  ------------------------------------------------------*/
exports.init = function() {
  var t = Math.abs(this.lat0);
  if (Math.abs(t - HALF_PI) < EPSLN) {
    this.mode = this.lat0 < 0 ? this.S_POLE : this.N_POLE;
  }
  else if (Math.abs(t) < EPSLN) {
    this.mode = this.EQUIT;
  }
  else {
    this.mode = this.OBLIQ;
  }
  if (this.es > 0) {
    var sinphi;

    this.qp = qsfnz(this.e, 1);
    this.mmf = 0.5 / (1 - this.es);
    this.apa = this.authset(this.es);
    switch (this.mode) {
    case this.N_POLE:
      this.dd = 1;
      break;
    case this.S_POLE:
      this.dd = 1;
      break;
    case this.EQUIT:
      this.rq = Math.sqrt(0.5 * this.qp);
      this.dd = 1 / this.rq;
      this.xmf = 1;
      this.ymf = 0.5 * this.qp;
      break;
    case this.OBLIQ:
      this.rq = Math.sqrt(0.5 * this.qp);
      sinphi = Math.sin(this.lat0);
      this.sinb1 = qsfnz(this.e, sinphi) / this.qp;
      this.cosb1 = Math.sqrt(1 - this.sinb1 * this.sinb1);
      this.dd = Math.cos(this.lat0) / (Math.sqrt(1 - this.es * sinphi * sinphi) * this.rq * this.cosb1);
      this.ymf = (this.xmf = this.rq) / this.dd;
      this.xmf *= this.dd;
      break;
    }
  }
  else {
    if (this.mode === this.OBLIQ) {
      this.sinph0 = Math.sin(this.lat0);
      this.cosph0 = Math.cos(this.lat0);
    }
  }
};

/* Lambert Azimuthal Equal Area forward equations--mapping lat,long to x,y
  -----------------------------------------------------------------------*/
exports.forward = function(p) {

  /* Forward equations
      -----------------*/
  var x, y, coslam, sinlam, sinphi, q, sinb, cosb, b, cosphi;
  var lam = p.x;
  var phi = p.y;

  lam = adjust_lon(lam - this.long0);

  if (this.sphere) {
    sinphi = Math.sin(phi);
    cosphi = Math.cos(phi);
    coslam = Math.cos(lam);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      y = (this.mode === this.EQUIT) ? 1 + cosphi * coslam : 1 + this.sinph0 * sinphi + this.cosph0 * cosphi * coslam;
      if (y <= EPSLN) {
        return null;
      }
      y = Math.sqrt(2 / y);
      x = y * cosphi * Math.sin(lam);
      y *= (this.mode === this.EQUIT) ? sinphi : this.cosph0 * sinphi - this.sinph0 * cosphi * coslam;
    }
    else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE) {
        coslam = -coslam;
      }
      if (Math.abs(phi + this.phi0) < EPSLN) {
        return null;
      }
      y = FORTPI - phi * 0.5;
      y = 2 * ((this.mode === this.S_POLE) ? Math.cos(y) : Math.sin(y));
      x = y * Math.sin(lam);
      y *= coslam;
    }
  }
  else {
    sinb = 0;
    cosb = 0;
    b = 0;
    coslam = Math.cos(lam);
    sinlam = Math.sin(lam);
    sinphi = Math.sin(phi);
    q = qsfnz(this.e, sinphi);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      sinb = q / this.qp;
      cosb = Math.sqrt(1 - sinb * sinb);
    }
    switch (this.mode) {
    case this.OBLIQ:
      b = 1 + this.sinb1 * sinb + this.cosb1 * cosb * coslam;
      break;
    case this.EQUIT:
      b = 1 + cosb * coslam;
      break;
    case this.N_POLE:
      b = HALF_PI + phi;
      q = this.qp - q;
      break;
    case this.S_POLE:
      b = phi - HALF_PI;
      q = this.qp + q;
      break;
    }
    if (Math.abs(b) < EPSLN) {
      return null;
    }
    switch (this.mode) {
    case this.OBLIQ:
    case this.EQUIT:
      b = Math.sqrt(2 / b);
      if (this.mode === this.OBLIQ) {
        y = this.ymf * b * (this.cosb1 * sinb - this.sinb1 * cosb * coslam);
      }
      else {
        y = (b = Math.sqrt(2 / (1 + cosb * coslam))) * sinb * this.ymf;
      }
      x = this.xmf * b * cosb * sinlam;
      break;
    case this.N_POLE:
    case this.S_POLE:
      if (q >= 0) {
        x = (b = Math.sqrt(q)) * sinlam;
        y = coslam * ((this.mode === this.S_POLE) ? b : -b);
      }
      else {
        x = y = 0;
      }
      break;
    }
  }

  p.x = this.a * x + this.x0;
  p.y = this.a * y + this.y0;
  return p;
};

/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var x = p.x / this.a;
  var y = p.y / this.a;
  var lam, phi, cCe, sCe, q, rho, ab;

  if (this.sphere) {
    var cosz = 0,
      rh, sinz = 0;

    rh = Math.sqrt(x * x + y * y);
    phi = rh * 0.5;
    if (phi > 1) {
      return null;
    }
    phi = 2 * Math.asin(phi);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      sinz = Math.sin(phi);
      cosz = Math.cos(phi);
    }
    switch (this.mode) {
    case this.EQUIT:
      phi = (Math.abs(rh) <= EPSLN) ? 0 : Math.asin(y * sinz / rh);
      x *= sinz;
      y = cosz * rh;
      break;
    case this.OBLIQ:
      phi = (Math.abs(rh) <= EPSLN) ? this.phi0 : Math.asin(cosz * this.sinph0 + y * sinz * this.cosph0 / rh);
      x *= sinz * this.cosph0;
      y = (cosz - Math.sin(phi) * this.sinph0) * rh;
      break;
    case this.N_POLE:
      y = -y;
      phi = HALF_PI - phi;
      break;
    case this.S_POLE:
      phi -= HALF_PI;
      break;
    }
    lam = (y === 0 && (this.mode === this.EQUIT || this.mode === this.OBLIQ)) ? 0 : Math.atan2(x, y);
  }
  else {
    ab = 0;
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      x /= this.dd;
      y *= this.dd;
      rho = Math.sqrt(x * x + y * y);
      if (rho < EPSLN) {
        p.x = 0;
        p.y = this.phi0;
        return p;
      }
      sCe = 2 * Math.asin(0.5 * rho / this.rq);
      cCe = Math.cos(sCe);
      x *= (sCe = Math.sin(sCe));
      if (this.mode === this.OBLIQ) {
        ab = cCe * this.sinb1 + y * sCe * this.cosb1 / rho;
        q = this.qp * ab;
        y = rho * this.cosb1 * cCe - y * this.sinb1 * sCe;
      }
      else {
        ab = y * sCe / rho;
        q = this.qp * ab;
        y = rho * cCe;
      }
    }
    else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE) {
        y = -y;
      }
      q = (x * x + y * y);
      if (!q) {
        p.x = 0;
        p.y = this.phi0;
        return p;
      }
      ab = 1 - q / this.qp;
      if (this.mode === this.S_POLE) {
        ab = -ab;
      }
    }
    lam = Math.atan2(x, y);
    phi = this.authlat(Math.asin(ab), this.apa);
  }


  p.x = adjust_lon(this.long0 + lam);
  p.y = phi;
  return p;
};

/* determine latitude from authalic latitude */
exports.P00 = 0.33333333333333333333;
exports.P01 = 0.17222222222222222222;
exports.P02 = 0.10257936507936507936;
exports.P10 = 0.06388888888888888888;
exports.P11 = 0.06640211640211640211;
exports.P20 = 0.01641501294219154443;

exports.authset = function(es) {
  var t;
  var APA = [];
  APA[0] = es * this.P00;
  t = es * es;
  APA[0] += t * this.P01;
  APA[1] = t * this.P10;
  t *= es;
  APA[0] += t * this.P02;
  APA[1] += t * this.P11;
  APA[2] = t * this.P20;
  return APA;
};

exports.authlat = function(beta, APA) {
  var t = beta + beta;
  return (beta + APA[0] * Math.sin(t) + APA[1] * Math.sin(t + t) + APA[2] * Math.sin(t + t + t));
};
exports.names = ["Lambert Azimuthal Equal Area", "Lambert_Azimuthal_Equal_Area", "laea"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/qsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/qsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/lcc.js":[function(require,module,exports){
var EPSLN = 1.0e-10;
var msfnz = require('../common/msfnz');
var tsfnz = require('../common/tsfnz');
var HALF_PI = Math.PI/2;
var sign = require('../common/sign');
var adjust_lon = require('../common/adjust_lon');
var phi2z = require('../common/phi2z');
exports.init = function() {

  // array of:  r_maj,r_min,lat1,lat2,c_lon,c_lat,false_east,false_north
  //double c_lat;                   /* center latitude                      */
  //double c_lon;                   /* center longitude                     */
  //double lat1;                    /* first standard parallel              */
  //double lat2;                    /* second standard parallel             */
  //double r_maj;                   /* major axis                           */
  //double r_min;                   /* minor axis                           */
  //double false_east;              /* x offset in meters                   */
  //double false_north;             /* y offset in meters                   */

  if (!this.lat2) {
    this.lat2 = this.lat1;
  } //if lat2 is not defined
  if (!this.k0) {
    this.k0 = 1;
  }
  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  // Standard Parallels cannot be equal and on opposite sides of the equator
  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }

  var temp = this.b / this.a;
  this.e = Math.sqrt(1 - temp * temp);

  var sin1 = Math.sin(this.lat1);
  var cos1 = Math.cos(this.lat1);
  var ms1 = msfnz(this.e, sin1, cos1);
  var ts1 = tsfnz(this.e, this.lat1, sin1);

  var sin2 = Math.sin(this.lat2);
  var cos2 = Math.cos(this.lat2);
  var ms2 = msfnz(this.e, sin2, cos2);
  var ts2 = tsfnz(this.e, this.lat2, sin2);

  var ts0 = tsfnz(this.e, this.lat0, Math.sin(this.lat0));

  if (Math.abs(this.lat1 - this.lat2) > EPSLN) {
    this.ns = Math.log(ms1 / ms2) / Math.log(ts1 / ts2);
  }
  else {
    this.ns = sin1;
  }
  if (isNaN(this.ns)) {
    this.ns = sin1;
  }
  this.f0 = ms1 / (this.ns * Math.pow(ts1, this.ns));
  this.rh = this.a * this.f0 * Math.pow(ts0, this.ns);
  if (!this.title) {
    this.title = "Lambert Conformal Conic";
  }
};


// Lambert Conformal conic forward equations--mapping lat,long to x,y
// -----------------------------------------------------------------
exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  // singular cases :
  if (Math.abs(2 * Math.abs(lat) - Math.PI) <= EPSLN) {
    lat = sign(lat) * (HALF_PI - 2 * EPSLN);
  }

  var con = Math.abs(Math.abs(lat) - HALF_PI);
  var ts, rh1;
  if (con > EPSLN) {
    ts = tsfnz(this.e, lat, Math.sin(lat));
    rh1 = this.a * this.f0 * Math.pow(ts, this.ns);
  }
  else {
    con = lat * this.ns;
    if (con <= 0) {
      return null;
    }
    rh1 = 0;
  }
  var theta = this.ns * adjust_lon(lon - this.long0);
  p.x = this.k0 * (rh1 * Math.sin(theta)) + this.x0;
  p.y = this.k0 * (this.rh - rh1 * Math.cos(theta)) + this.y0;

  return p;
};

// Lambert Conformal Conic inverse equations--mapping x,y to lat/long
// -----------------------------------------------------------------
exports.inverse = function(p) {

  var rh1, con, ts;
  var lat, lon;
  var x = (p.x - this.x0) / this.k0;
  var y = (this.rh - (p.y - this.y0) / this.k0);
  if (this.ns > 0) {
    rh1 = Math.sqrt(x * x + y * y);
    con = 1;
  }
  else {
    rh1 = -Math.sqrt(x * x + y * y);
    con = -1;
  }
  var theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2((con * x), (con * y));
  }
  if ((rh1 !== 0) || (this.ns > 0)) {
    con = 1 / this.ns;
    ts = Math.pow((rh1 / (this.a * this.f0)), con);
    lat = phi2z(this.e, ts);
    if (lat === -9999) {
      return null;
    }
  }
  else {
    lat = -HALF_PI;
  }
  lon = adjust_lon(theta / this.ns + this.long0);

  p.x = lon;
  p.y = lat;
  return p;
};

exports.names = ["Lambert Tangential Conformal Conic Projection", "Lambert_Conformal_Conic", "Lambert_Conformal_Conic_2SP", "lcc"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js","../common/phi2z":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/phi2z.js","../common/sign":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js","../common/tsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/tsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/longlat.js":[function(require,module,exports){
exports.init = function() {
  //no-op for longlat
};

function identity(pt) {
  return pt;
}
exports.forward = identity;
exports.inverse = identity;
exports.names = ["longlat", "identity"];

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/merc.js":[function(require,module,exports){
var msfnz = require('../common/msfnz');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var R2D = 57.29577951308232088;
var adjust_lon = require('../common/adjust_lon');
var FORTPI = Math.PI/4;
var tsfnz = require('../common/tsfnz');
var phi2z = require('../common/phi2z');
exports.init = function() {
  var con = this.b / this.a;
  this.es = 1 - con * con;
  if(!('x0' in this)){
    this.x0 = 0;
  }
  if(!('y0' in this)){
    this.y0 = 0;
  }
  this.e = Math.sqrt(this.es);
  if (this.lat_ts) {
    if (this.sphere) {
      this.k0 = Math.cos(this.lat_ts);
    }
    else {
      this.k0 = msfnz(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts));
    }
  }
  else {
    if (!this.k0) {
      if (this.k) {
        this.k0 = this.k;
      }
      else {
        this.k0 = 1;
      }
    }
  }
};

/* Mercator forward equations--mapping lat,long to x,y
  --------------------------------------------------*/

exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  // convert to radians
  if (lat * R2D > 90 && lat * R2D < -90 && lon * R2D > 180 && lon * R2D < -180) {
    return null;
  }

  var x, y;
  if (Math.abs(Math.abs(lat) - HALF_PI) <= EPSLN) {
    return null;
  }
  else {
    if (this.sphere) {
      x = this.x0 + this.a * this.k0 * adjust_lon(lon - this.long0);
      y = this.y0 + this.a * this.k0 * Math.log(Math.tan(FORTPI + 0.5 * lat));
    }
    else {
      var sinphi = Math.sin(lat);
      var ts = tsfnz(this.e, lat, sinphi);
      x = this.x0 + this.a * this.k0 * adjust_lon(lon - this.long0);
      y = this.y0 - this.a * this.k0 * Math.log(ts);
    }
    p.x = x;
    p.y = y;
    return p;
  }
};


/* Mercator inverse equations--mapping x,y to lat/long
  --------------------------------------------------*/
exports.inverse = function(p) {

  var x = p.x - this.x0;
  var y = p.y - this.y0;
  var lon, lat;

  if (this.sphere) {
    lat = HALF_PI - 2 * Math.atan(Math.exp(-y / (this.a * this.k0)));
  }
  else {
    var ts = Math.exp(-y / (this.a * this.k0));
    lat = phi2z(this.e, ts);
    if (lat === -9999) {
      return null;
    }
  }
  lon = adjust_lon(this.long0 + x / (this.a * this.k0));

  p.x = lon;
  p.y = lat;
  return p;
};

exports.names = ["Mercator", "Popular Visualisation Pseudo Mercator", "Mercator_1SP", "Mercator_Auxiliary_Sphere", "merc"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js","../common/phi2z":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/phi2z.js","../common/tsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/tsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/mill.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
/*
  reference
    "New Equal-Area Map Projections for Noncircular Regions", John P. Snyder,
    The American Cartographer, Vol 15, No. 4, October 1988, pp. 341-355.
  */


/* Initialize the Miller Cylindrical projection
  -------------------------------------------*/
exports.init = function() {
  //no-op
};


/* Miller Cylindrical forward equations--mapping lat,long to x,y
    ------------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  /* Forward equations
      -----------------*/
  var dlon = adjust_lon(lon - this.long0);
  var x = this.x0 + this.a * dlon;
  var y = this.y0 + this.a * Math.log(Math.tan((Math.PI / 4) + (lat / 2.5))) * 1.25;

  p.x = x;
  p.y = y;
  return p;
};

/* Miller Cylindrical inverse equations--mapping x,y to lat/long
    ------------------------------------------------------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;

  var lon = adjust_lon(this.long0 + p.x / this.a);
  var lat = 2.5 * (Math.atan(Math.exp(0.8 * p.y / this.a)) - Math.PI / 4);

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Miller_Cylindrical", "mill"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/moll.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var EPSLN = 1.0e-10;
exports.init = function() {};

/* Mollweide forward equations--mapping lat,long to x,y
    ----------------------------------------------------*/
exports.forward = function(p) {

  /* Forward equations
      -----------------*/
  var lon = p.x;
  var lat = p.y;

  var delta_lon = adjust_lon(lon - this.long0);
  var theta = lat;
  var con = Math.PI * Math.sin(lat);

  /* Iterate using the Newton-Raphson method to find theta
      -----------------------------------------------------*/
  for (var i = 0; true; i++) {
    var delta_theta = -(theta + Math.sin(theta) - con) / (1 + Math.cos(theta));
    theta += delta_theta;
    if (Math.abs(delta_theta) < EPSLN) {
      break;
    }
  }
  theta /= 2;

  /* If the latitude is 90 deg, force the x coordinate to be "0 + false easting"
       this is done here because of precision problems with "cos(theta)"
       --------------------------------------------------------------------------*/
  if (Math.PI / 2 - Math.abs(lat) < EPSLN) {
    delta_lon = 0;
  }
  var x = 0.900316316158 * this.a * delta_lon * Math.cos(theta) + this.x0;
  var y = 1.4142135623731 * this.a * Math.sin(theta) + this.y0;

  p.x = x;
  p.y = y;
  return p;
};

exports.inverse = function(p) {
  var theta;
  var arg;

  /* Inverse equations
      -----------------*/
  p.x -= this.x0;
  p.y -= this.y0;
  arg = p.y / (1.4142135623731 * this.a);

  /* Because of division by zero problems, 'arg' can not be 1.  Therefore
       a number very close to one is used instead.
       -------------------------------------------------------------------*/
  if (Math.abs(arg) > 0.999999999999) {
    arg = 0.999999999999;
  }
  theta = Math.asin(arg);
  var lon = adjust_lon(this.long0 + (p.x / (0.900316316158 * this.a * Math.cos(theta))));
  if (lon < (-Math.PI)) {
    lon = -Math.PI;
  }
  if (lon > Math.PI) {
    lon = Math.PI;
  }
  arg = (2 * theta + Math.sin(2 * theta)) / Math.PI;
  if (Math.abs(arg) > 1) {
    arg = 1;
  }
  var lat = Math.asin(arg);

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Mollweide", "moll"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/nzmg.js":[function(require,module,exports){
var SEC_TO_RAD = 4.84813681109535993589914102357e-6;
/*
  reference
    Department of Land and Survey Technical Circular 1973/32
      http://www.linz.govt.nz/docs/miscellaneous/nz-map-definition.pdf
    OSG Technical Report 4.1
      http://www.linz.govt.nz/docs/miscellaneous/nzmg.pdf
  */

/**
 * iterations: Number of iterations to refine inverse transform.
 *     0 -> km accuracy
 *     1 -> m accuracy -- suitable for most mapping applications
 *     2 -> mm accuracy
 */
exports.iterations = 1;

exports.init = function() {
  this.A = [];
  this.A[1] = 0.6399175073;
  this.A[2] = -0.1358797613;
  this.A[3] = 0.063294409;
  this.A[4] = -0.02526853;
  this.A[5] = 0.0117879;
  this.A[6] = -0.0055161;
  this.A[7] = 0.0026906;
  this.A[8] = -0.001333;
  this.A[9] = 0.00067;
  this.A[10] = -0.00034;

  this.B_re = [];
  this.B_im = [];
  this.B_re[1] = 0.7557853228;
  this.B_im[1] = 0;
  this.B_re[2] = 0.249204646;
  this.B_im[2] = 0.003371507;
  this.B_re[3] = -0.001541739;
  this.B_im[3] = 0.041058560;
  this.B_re[4] = -0.10162907;
  this.B_im[4] = 0.01727609;
  this.B_re[5] = -0.26623489;
  this.B_im[5] = -0.36249218;
  this.B_re[6] = -0.6870983;
  this.B_im[6] = -1.1651967;

  this.C_re = [];
  this.C_im = [];
  this.C_re[1] = 1.3231270439;
  this.C_im[1] = 0;
  this.C_re[2] = -0.577245789;
  this.C_im[2] = -0.007809598;
  this.C_re[3] = 0.508307513;
  this.C_im[3] = -0.112208952;
  this.C_re[4] = -0.15094762;
  this.C_im[4] = 0.18200602;
  this.C_re[5] = 1.01418179;
  this.C_im[5] = 1.64497696;
  this.C_re[6] = 1.9660549;
  this.C_im[6] = 2.5127645;

  this.D = [];
  this.D[1] = 1.5627014243;
  this.D[2] = 0.5185406398;
  this.D[3] = -0.03333098;
  this.D[4] = -0.1052906;
  this.D[5] = -0.0368594;
  this.D[6] = 0.007317;
  this.D[7] = 0.01220;
  this.D[8] = 0.00394;
  this.D[9] = -0.0013;
};

/**
    New Zealand Map Grid Forward  - long/lat to x/y
    long/lat in radians
  */
exports.forward = function(p) {
  var n;
  var lon = p.x;
  var lat = p.y;

  var delta_lat = lat - this.lat0;
  var delta_lon = lon - this.long0;

  // 1. Calculate d_phi and d_psi    ...                          // and d_lambda
  // For this algorithm, delta_latitude is in seconds of arc x 10-5, so we need to scale to those units. Longitude is radians.
  var d_phi = delta_lat / SEC_TO_RAD * 1E-5;
  var d_lambda = delta_lon;
  var d_phi_n = 1; // d_phi^0

  var d_psi = 0;
  for (n = 1; n <= 10; n++) {
    d_phi_n = d_phi_n * d_phi;
    d_psi = d_psi + this.A[n] * d_phi_n;
  }

  // 2. Calculate theta
  var th_re = d_psi;
  var th_im = d_lambda;

  // 3. Calculate z
  var th_n_re = 1;
  var th_n_im = 0; // theta^0
  var th_n_re1;
  var th_n_im1;

  var z_re = 0;
  var z_im = 0;
  for (n = 1; n <= 6; n++) {
    th_n_re1 = th_n_re * th_re - th_n_im * th_im;
    th_n_im1 = th_n_im * th_re + th_n_re * th_im;
    th_n_re = th_n_re1;
    th_n_im = th_n_im1;
    z_re = z_re + this.B_re[n] * th_n_re - this.B_im[n] * th_n_im;
    z_im = z_im + this.B_im[n] * th_n_re + this.B_re[n] * th_n_im;
  }

  // 4. Calculate easting and northing
  p.x = (z_im * this.a) + this.x0;
  p.y = (z_re * this.a) + this.y0;

  return p;
};


/**
    New Zealand Map Grid Inverse  -  x/y to long/lat
  */
exports.inverse = function(p) {
  var n;
  var x = p.x;
  var y = p.y;

  var delta_x = x - this.x0;
  var delta_y = y - this.y0;

  // 1. Calculate z
  var z_re = delta_y / this.a;
  var z_im = delta_x / this.a;

  // 2a. Calculate theta - first approximation gives km accuracy
  var z_n_re = 1;
  var z_n_im = 0; // z^0
  var z_n_re1;
  var z_n_im1;

  var th_re = 0;
  var th_im = 0;
  for (n = 1; n <= 6; n++) {
    z_n_re1 = z_n_re * z_re - z_n_im * z_im;
    z_n_im1 = z_n_im * z_re + z_n_re * z_im;
    z_n_re = z_n_re1;
    z_n_im = z_n_im1;
    th_re = th_re + this.C_re[n] * z_n_re - this.C_im[n] * z_n_im;
    th_im = th_im + this.C_im[n] * z_n_re + this.C_re[n] * z_n_im;
  }

  // 2b. Iterate to refine the accuracy of the calculation
  //        0 iterations gives km accuracy
  //        1 iteration gives m accuracy -- good enough for most mapping applications
  //        2 iterations bives mm accuracy
  for (var i = 0; i < this.iterations; i++) {
    var th_n_re = th_re;
    var th_n_im = th_im;
    var th_n_re1;
    var th_n_im1;

    var num_re = z_re;
    var num_im = z_im;
    for (n = 2; n <= 6; n++) {
      th_n_re1 = th_n_re * th_re - th_n_im * th_im;
      th_n_im1 = th_n_im * th_re + th_n_re * th_im;
      th_n_re = th_n_re1;
      th_n_im = th_n_im1;
      num_re = num_re + (n - 1) * (this.B_re[n] * th_n_re - this.B_im[n] * th_n_im);
      num_im = num_im + (n - 1) * (this.B_im[n] * th_n_re + this.B_re[n] * th_n_im);
    }

    th_n_re = 1;
    th_n_im = 0;
    var den_re = this.B_re[1];
    var den_im = this.B_im[1];
    for (n = 2; n <= 6; n++) {
      th_n_re1 = th_n_re * th_re - th_n_im * th_im;
      th_n_im1 = th_n_im * th_re + th_n_re * th_im;
      th_n_re = th_n_re1;
      th_n_im = th_n_im1;
      den_re = den_re + n * (this.B_re[n] * th_n_re - this.B_im[n] * th_n_im);
      den_im = den_im + n * (this.B_im[n] * th_n_re + this.B_re[n] * th_n_im);
    }

    // Complex division
    var den2 = den_re * den_re + den_im * den_im;
    th_re = (num_re * den_re + num_im * den_im) / den2;
    th_im = (num_im * den_re - num_re * den_im) / den2;
  }

  // 3. Calculate d_phi              ...                                    // and d_lambda
  var d_psi = th_re;
  var d_lambda = th_im;
  var d_psi_n = 1; // d_psi^0

  var d_phi = 0;
  for (n = 1; n <= 9; n++) {
    d_psi_n = d_psi_n * d_psi;
    d_phi = d_phi + this.D[n] * d_psi_n;
  }

  // 4. Calculate latitude and longitude
  // d_phi is calcuated in second of arc * 10^-5, so we need to scale back to radians. d_lambda is in radians.
  var lat = this.lat0 + (d_phi * SEC_TO_RAD * 1E5);
  var lon = this.long0 + d_lambda;

  p.x = lon;
  p.y = lat;

  return p;
};
exports.names = ["New_Zealand_Map_Grid", "nzmg"];
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/omerc.js":[function(require,module,exports){
var tsfnz = require('../common/tsfnz');
var adjust_lon = require('../common/adjust_lon');
var phi2z = require('../common/phi2z');
var HALF_PI = Math.PI/2;
var FORTPI = Math.PI/4;
var EPSLN = 1.0e-10;

/* Initialize the Oblique Mercator  projection
    ------------------------------------------*/
exports.init = function() {
  this.no_off = this.no_off || false;
  this.no_rot = this.no_rot || false;

  if (isNaN(this.k0)) {
    this.k0 = 1;
  }
  var sinlat = Math.sin(this.lat0);
  var coslat = Math.cos(this.lat0);
  var con = this.e * sinlat;

  this.bl = Math.sqrt(1 + this.es / (1 - this.es) * Math.pow(coslat, 4));
  this.al = this.a * this.bl * this.k0 * Math.sqrt(1 - this.es) / (1 - con * con);
  var t0 = tsfnz(this.e, this.lat0, sinlat);
  var dl = this.bl / coslat * Math.sqrt((1 - this.es) / (1 - con * con));
  if (dl * dl < 1) {
    dl = 1;
  }
  var fl;
  var gl;
  if (!isNaN(this.longc)) {
    //Central point and azimuth method

    if (this.lat0 >= 0) {
      fl = dl + Math.sqrt(dl * dl - 1);
    }
    else {
      fl = dl - Math.sqrt(dl * dl - 1);
    }
    this.el = fl * Math.pow(t0, this.bl);
    gl = 0.5 * (fl - 1 / fl);
    this.gamma0 = Math.asin(Math.sin(this.alpha) / dl);
    this.long0 = this.longc - Math.asin(gl * Math.tan(this.gamma0)) / this.bl;

  }
  else {
    //2 points method
    var t1 = tsfnz(this.e, this.lat1, Math.sin(this.lat1));
    var t2 = tsfnz(this.e, this.lat2, Math.sin(this.lat2));
    if (this.lat0 >= 0) {
      this.el = (dl + Math.sqrt(dl * dl - 1)) * Math.pow(t0, this.bl);
    }
    else {
      this.el = (dl - Math.sqrt(dl * dl - 1)) * Math.pow(t0, this.bl);
    }
    var hl = Math.pow(t1, this.bl);
    var ll = Math.pow(t2, this.bl);
    fl = this.el / hl;
    gl = 0.5 * (fl - 1 / fl);
    var jl = (this.el * this.el - ll * hl) / (this.el * this.el + ll * hl);
    var pl = (ll - hl) / (ll + hl);
    var dlon12 = adjust_lon(this.long1 - this.long2);
    this.long0 = 0.5 * (this.long1 + this.long2) - Math.atan(jl * Math.tan(0.5 * this.bl * (dlon12)) / pl) / this.bl;
    this.long0 = adjust_lon(this.long0);
    var dlon10 = adjust_lon(this.long1 - this.long0);
    this.gamma0 = Math.atan(Math.sin(this.bl * (dlon10)) / gl);
    this.alpha = Math.asin(dl * Math.sin(this.gamma0));
  }

  if (this.no_off) {
    this.uc = 0;
  }
  else {
    if (this.lat0 >= 0) {
      this.uc = this.al / this.bl * Math.atan2(Math.sqrt(dl * dl - 1), Math.cos(this.alpha));
    }
    else {
      this.uc = -1 * this.al / this.bl * Math.atan2(Math.sqrt(dl * dl - 1), Math.cos(this.alpha));
    }
  }

};


/* Oblique Mercator forward equations--mapping lat,long to x,y
    ----------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var dlon = adjust_lon(lon - this.long0);
  var us, vs;
  var con;
  if (Math.abs(Math.abs(lat) - HALF_PI) <= EPSLN) {
    if (lat > 0) {
      con = -1;
    }
    else {
      con = 1;
    }
    vs = this.al / this.bl * Math.log(Math.tan(FORTPI + con * this.gamma0 * 0.5));
    us = -1 * con * HALF_PI * this.al / this.bl;
  }
  else {
    var t = tsfnz(this.e, lat, Math.sin(lat));
    var ql = this.el / Math.pow(t, this.bl);
    var sl = 0.5 * (ql - 1 / ql);
    var tl = 0.5 * (ql + 1 / ql);
    var vl = Math.sin(this.bl * (dlon));
    var ul = (sl * Math.sin(this.gamma0) - vl * Math.cos(this.gamma0)) / tl;
    if (Math.abs(Math.abs(ul) - 1) <= EPSLN) {
      vs = Number.POSITIVE_INFINITY;
    }
    else {
      vs = 0.5 * this.al * Math.log((1 - ul) / (1 + ul)) / this.bl;
    }
    if (Math.abs(Math.cos(this.bl * (dlon))) <= EPSLN) {
      us = this.al * this.bl * (dlon);
    }
    else {
      us = this.al * Math.atan2(sl * Math.cos(this.gamma0) + vl * Math.sin(this.gamma0), Math.cos(this.bl * dlon)) / this.bl;
    }
  }

  if (this.no_rot) {
    p.x = this.x0 + us;
    p.y = this.y0 + vs;
  }
  else {

    us -= this.uc;
    p.x = this.x0 + vs * Math.cos(this.alpha) + us * Math.sin(this.alpha);
    p.y = this.y0 + us * Math.cos(this.alpha) - vs * Math.sin(this.alpha);
  }
  return p;
};

exports.inverse = function(p) {
  var us, vs;
  if (this.no_rot) {
    vs = p.y - this.y0;
    us = p.x - this.x0;
  }
  else {
    vs = (p.x - this.x0) * Math.cos(this.alpha) - (p.y - this.y0) * Math.sin(this.alpha);
    us = (p.y - this.y0) * Math.cos(this.alpha) + (p.x - this.x0) * Math.sin(this.alpha);
    us += this.uc;
  }
  var qp = Math.exp(-1 * this.bl * vs / this.al);
  var sp = 0.5 * (qp - 1 / qp);
  var tp = 0.5 * (qp + 1 / qp);
  var vp = Math.sin(this.bl * us / this.al);
  var up = (vp * Math.cos(this.gamma0) + sp * Math.sin(this.gamma0)) / tp;
  var ts = Math.pow(this.el / Math.sqrt((1 + up) / (1 - up)), 1 / this.bl);
  if (Math.abs(up - 1) < EPSLN) {
    p.x = this.long0;
    p.y = HALF_PI;
  }
  else if (Math.abs(up + 1) < EPSLN) {
    p.x = this.long0;
    p.y = -1 * HALF_PI;
  }
  else {
    p.y = phi2z(this.e, ts);
    p.x = adjust_lon(this.long0 - Math.atan2(sp * Math.cos(this.gamma0) - vp * Math.sin(this.gamma0), Math.cos(this.bl * us / this.al)) / this.bl);
  }
  return p;
};

exports.names = ["Hotine_Oblique_Mercator", "Hotine Oblique Mercator", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin", "Hotine_Oblique_Mercator_Azimuth_Center", "omerc"];
},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/phi2z":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/phi2z.js","../common/tsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/tsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/poly.js":[function(require,module,exports){
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var mlfn = require('../common/mlfn');
var EPSLN = 1.0e-10;
var gN = require('../common/gN');
var MAX_ITER = 20;
exports.init = function() {
  /* Place parameters in static storage for common use
      -------------------------------------------------*/
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2); // devait etre dans tmerc.js mais n y est pas donc je commente sinon retour de valeurs nulles
  this.e = Math.sqrt(this.es);
  this.e0 = e0fn(this.es);
  this.e1 = e1fn(this.es);
  this.e2 = e2fn(this.es);
  this.e3 = e3fn(this.es);
  this.ml0 = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0); //si que des zeros le calcul ne se fait pas
};


/* Polyconic forward equations--mapping lat,long to x,y
    ---------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var x, y, el;
  var dlon = adjust_lon(lon - this.long0);
  el = dlon * Math.sin(lat);
  if (this.sphere) {
    if (Math.abs(lat) <= EPSLN) {
      x = this.a * dlon;
      y = -1 * this.a * this.lat0;
    }
    else {
      x = this.a * Math.sin(el) / Math.tan(lat);
      y = this.a * (adjust_lat(lat - this.lat0) + (1 - Math.cos(el)) / Math.tan(lat));
    }
  }
  else {
    if (Math.abs(lat) <= EPSLN) {
      x = this.a * dlon;
      y = -1 * this.ml0;
    }
    else {
      var nl = gN(this.a, this.e, Math.sin(lat)) / Math.tan(lat);
      x = nl * Math.sin(el);
      y = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, lat) - this.ml0 + nl * (1 - Math.cos(el));
    }

  }
  p.x = x + this.x0;
  p.y = y + this.y0;
  return p;
};


/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  var lon, lat, x, y, i;
  var al, bl;
  var phi, dphi;
  x = p.x - this.x0;
  y = p.y - this.y0;

  if (this.sphere) {
    if (Math.abs(y + this.a * this.lat0) <= EPSLN) {
      lon = adjust_lon(x / this.a + this.long0);
      lat = 0;
    }
    else {
      al = this.lat0 + y / this.a;
      bl = x * x / this.a / this.a + al * al;
      phi = al;
      var tanphi;
      for (i = MAX_ITER; i; --i) {
        tanphi = Math.tan(phi);
        dphi = -1 * (al * (phi * tanphi + 1) - phi - 0.5 * (phi * phi + bl) * tanphi) / ((phi - al) / tanphi - 1);
        phi += dphi;
        if (Math.abs(dphi) <= EPSLN) {
          lat = phi;
          break;
        }
      }
      lon = adjust_lon(this.long0 + (Math.asin(x * Math.tan(phi) / this.a)) / Math.sin(lat));
    }
  }
  else {
    if (Math.abs(y + this.ml0) <= EPSLN) {
      lat = 0;
      lon = adjust_lon(this.long0 + x / this.a);
    }
    else {

      al = (this.ml0 + y) / this.a;
      bl = x * x / this.a / this.a + al * al;
      phi = al;
      var cl, mln, mlnp, ma;
      var con;
      for (i = MAX_ITER; i; --i) {
        con = this.e * Math.sin(phi);
        cl = Math.sqrt(1 - con * con) * Math.tan(phi);
        mln = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, phi);
        mlnp = this.e0 - 2 * this.e1 * Math.cos(2 * phi) + 4 * this.e2 * Math.cos(4 * phi) - 6 * this.e3 * Math.cos(6 * phi);
        ma = mln / this.a;
        dphi = (al * (cl * ma + 1) - ma - 0.5 * cl * (ma * ma + bl)) / (this.es * Math.sin(2 * phi) * (ma * ma + bl - 2 * al * ma) / (4 * cl) + (al - ma) * (cl * mlnp - 2 / Math.sin(2 * phi)) - mlnp);
        phi -= dphi;
        if (Math.abs(dphi) <= EPSLN) {
          lat = phi;
          break;
        }
      }

      //lat=phi4z(this.e,this.e0,this.e1,this.e2,this.e3,al,bl,0,0);
      cl = Math.sqrt(1 - this.es * Math.pow(Math.sin(lat), 2)) * Math.tan(lat);
      lon = adjust_lon(this.long0 + Math.asin(x * cl / this.a) / Math.sin(lat));
    }
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Polyconic", "poly"];
},{"../common/adjust_lat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js","../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/e0fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js","../common/e1fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js","../common/e2fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js","../common/e3fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js","../common/gN":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/gN.js","../common/mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/sinu.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var pj_enfn = require('../common/pj_enfn');
var MAX_ITER = 20;
var pj_mlfn = require('../common/pj_mlfn');
var pj_inv_mlfn = require('../common/pj_inv_mlfn');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var asinz = require('../common/asinz');
exports.init = function() {
  /* Place parameters in static storage for common use
    -------------------------------------------------*/


  if (!this.sphere) {
    this.en = pj_enfn(this.es);
  }
  else {
    this.n = 1;
    this.m = 0;
    this.es = 0;
    this.C_y = Math.sqrt((this.m + 1) / this.n);
    this.C_x = this.C_y / (this.m + 1);
  }

};

/* Sinusoidal forward equations--mapping lat,long to x,y
  -----------------------------------------------------*/
exports.forward = function(p) {
  var x, y;
  var lon = p.x;
  var lat = p.y;
  /* Forward equations
    -----------------*/
  lon = adjust_lon(lon - this.long0);

  if (this.sphere) {
    if (!this.m) {
      lat = this.n !== 1 ? Math.asin(this.n * Math.sin(lat)) : lat;
    }
    else {
      var k = this.n * Math.sin(lat);
      for (var i = MAX_ITER; i; --i) {
        var V = (this.m * lat + Math.sin(lat) - k) / (this.m + Math.cos(lat));
        lat -= V;
        if (Math.abs(V) < EPSLN) {
          break;
        }
      }
    }
    x = this.a * this.C_x * lon * (this.m + Math.cos(lat));
    y = this.a * this.C_y * lat;

  }
  else {

    var s = Math.sin(lat);
    var c = Math.cos(lat);
    y = this.a * pj_mlfn(lat, s, c, this.en);
    x = this.a * lon * c / Math.sqrt(1 - this.es * s * s);
  }

  p.x = x;
  p.y = y;
  return p;
};

exports.inverse = function(p) {
  var lat, temp, lon, s;

  p.x -= this.x0;
  lon = p.x / this.a;
  p.y -= this.y0;
  lat = p.y / this.a;

  if (this.sphere) {
    lat /= this.C_y;
    lon = lon / (this.C_x * (this.m + Math.cos(lat)));
    if (this.m) {
      lat = asinz((this.m * lat + Math.sin(lat)) / this.n);
    }
    else if (this.n !== 1) {
      lat = asinz(Math.sin(lat) / this.n);
    }
    lon = adjust_lon(lon + this.long0);
    lat = adjust_lat(lat);
  }
  else {
    lat = pj_inv_mlfn(p.y / this.a, this.es, this.en);
    s = Math.abs(lat);
    if (s < HALF_PI) {
      s = Math.sin(lat);
      temp = this.long0 + p.x * Math.sqrt(1 - this.es * s * s) / (this.a * Math.cos(lat));
      //temp = this.long0 + p.x / (this.a * Math.cos(lat));
      lon = adjust_lon(temp);
    }
    else if ((s - EPSLN) < HALF_PI) {
      lon = this.long0;
    }
  }
  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Sinusoidal", "sinu"];
},{"../common/adjust_lat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js","../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js","../common/pj_enfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_enfn.js","../common/pj_inv_mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_inv_mlfn.js","../common/pj_mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_mlfn.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/somerc.js":[function(require,module,exports){
/*
  references:
    Formules et constantes pour le Calcul pour la
    projection cylindrique conforme à axe oblique et pour la transformation entre
    des systèmes de référence.
    http://www.swisstopo.admin.ch/internet/swisstopo/fr/home/topics/survey/sys/refsys/switzerland.parsysrelated1.31216.downloadList.77004.DownloadFile.tmp/swissprojectionfr.pdf
  */
exports.init = function() {
  var phy0 = this.lat0;
  this.lambda0 = this.long0;
  var sinPhy0 = Math.sin(phy0);
  var semiMajorAxis = this.a;
  var invF = this.rf;
  var flattening = 1 / invF;
  var e2 = 2 * flattening - Math.pow(flattening, 2);
  var e = this.e = Math.sqrt(e2);
  this.R = this.k0 * semiMajorAxis * Math.sqrt(1 - e2) / (1 - e2 * Math.pow(sinPhy0, 2));
  this.alpha = Math.sqrt(1 + e2 / (1 - e2) * Math.pow(Math.cos(phy0), 4));
  this.b0 = Math.asin(sinPhy0 / this.alpha);
  var k1 = Math.log(Math.tan(Math.PI / 4 + this.b0 / 2));
  var k2 = Math.log(Math.tan(Math.PI / 4 + phy0 / 2));
  var k3 = Math.log((1 + e * sinPhy0) / (1 - e * sinPhy0));
  this.K = k1 - this.alpha * k2 + this.alpha * e / 2 * k3;
};


exports.forward = function(p) {
  var Sa1 = Math.log(Math.tan(Math.PI / 4 - p.y / 2));
  var Sa2 = this.e / 2 * Math.log((1 + this.e * Math.sin(p.y)) / (1 - this.e * Math.sin(p.y)));
  var S = -this.alpha * (Sa1 + Sa2) + this.K;

  // spheric latitude
  var b = 2 * (Math.atan(Math.exp(S)) - Math.PI / 4);

  // spheric longitude
  var I = this.alpha * (p.x - this.lambda0);

  // psoeudo equatorial rotation
  var rotI = Math.atan(Math.sin(I) / (Math.sin(this.b0) * Math.tan(b) + Math.cos(this.b0) * Math.cos(I)));

  var rotB = Math.asin(Math.cos(this.b0) * Math.sin(b) - Math.sin(this.b0) * Math.cos(b) * Math.cos(I));

  p.y = this.R / 2 * Math.log((1 + Math.sin(rotB)) / (1 - Math.sin(rotB))) + this.y0;
  p.x = this.R * rotI + this.x0;
  return p;
};

exports.inverse = function(p) {
  var Y = p.x - this.x0;
  var X = p.y - this.y0;

  var rotI = Y / this.R;
  var rotB = 2 * (Math.atan(Math.exp(X / this.R)) - Math.PI / 4);

  var b = Math.asin(Math.cos(this.b0) * Math.sin(rotB) + Math.sin(this.b0) * Math.cos(rotB) * Math.cos(rotI));
  var I = Math.atan(Math.sin(rotI) / (Math.cos(this.b0) * Math.cos(rotI) - Math.sin(this.b0) * Math.tan(rotB)));

  var lambda = this.lambda0 + I / this.alpha;

  var S = 0;
  var phy = b;
  var prevPhy = -1000;
  var iteration = 0;
  while (Math.abs(phy - prevPhy) > 0.0000001) {
    if (++iteration > 20) {
      //...reportError("omercFwdInfinity");
      return;
    }
    //S = Math.log(Math.tan(Math.PI / 4 + phy / 2));
    S = 1 / this.alpha * (Math.log(Math.tan(Math.PI / 4 + b / 2)) - this.K) + this.e * Math.log(Math.tan(Math.PI / 4 + Math.asin(this.e * Math.sin(phy)) / 2));
    prevPhy = phy;
    phy = 2 * Math.atan(Math.exp(S)) - Math.PI / 2;
  }

  p.x = lambda;
  p.y = phy;
  return p;
};

exports.names = ["somerc"];

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/stere.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var sign = require('../common/sign');
var msfnz = require('../common/msfnz');
var tsfnz = require('../common/tsfnz');
var phi2z = require('../common/phi2z');
var adjust_lon = require('../common/adjust_lon');
exports.ssfn_ = function(phit, sinphi, eccen) {
  sinphi *= eccen;
  return (Math.tan(0.5 * (HALF_PI + phit)) * Math.pow((1 - sinphi) / (1 + sinphi), 0.5 * eccen));
};

exports.init = function() {
  this.coslat0 = Math.cos(this.lat0);
  this.sinlat0 = Math.sin(this.lat0);
  if (this.sphere) {
    if (this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= EPSLN) {
      this.k0 = 0.5 * (1 + sign(this.lat0) * Math.sin(this.lat_ts));
    }
  }
  else {
    if (Math.abs(this.coslat0) <= EPSLN) {
      if (this.lat0 > 0) {
        //North pole
        //trace('stere:north pole');
        this.con = 1;
      }
      else {
        //South pole
        //trace('stere:south pole');
        this.con = -1;
      }
    }
    this.cons = Math.sqrt(Math.pow(1 + this.e, 1 + this.e) * Math.pow(1 - this.e, 1 - this.e));
    if (this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= EPSLN) {
      this.k0 = 0.5 * this.cons * msfnz(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) / tsfnz(this.e, this.con * this.lat_ts, this.con * Math.sin(this.lat_ts));
    }
    this.ms1 = msfnz(this.e, this.sinlat0, this.coslat0);
    this.X0 = 2 * Math.atan(this.ssfn_(this.lat0, this.sinlat0, this.e)) - HALF_PI;
    this.cosX0 = Math.cos(this.X0);
    this.sinX0 = Math.sin(this.X0);
  }
};

// Stereographic forward equations--mapping lat,long to x,y
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var sinlat = Math.sin(lat);
  var coslat = Math.cos(lat);
  var A, X, sinX, cosX, ts, rh;
  var dlon = adjust_lon(lon - this.long0);

  if (Math.abs(Math.abs(lon - this.long0) - Math.PI) <= EPSLN && Math.abs(lat + this.lat0) <= EPSLN) {
    //case of the origine point
    //trace('stere:this is the origin point');
    p.x = NaN;
    p.y = NaN;
    return p;
  }
  if (this.sphere) {
    //trace('stere:sphere case');
    A = 2 * this.k0 / (1 + this.sinlat0 * sinlat + this.coslat0 * coslat * Math.cos(dlon));
    p.x = this.a * A * coslat * Math.sin(dlon) + this.x0;
    p.y = this.a * A * (this.coslat0 * sinlat - this.sinlat0 * coslat * Math.cos(dlon)) + this.y0;
    return p;
  }
  else {
    X = 2 * Math.atan(this.ssfn_(lat, sinlat, this.e)) - HALF_PI;
    cosX = Math.cos(X);
    sinX = Math.sin(X);
    if (Math.abs(this.coslat0) <= EPSLN) {
      ts = tsfnz(this.e, lat * this.con, this.con * sinlat);
      rh = 2 * this.a * this.k0 * ts / this.cons;
      p.x = this.x0 + rh * Math.sin(lon - this.long0);
      p.y = this.y0 - this.con * rh * Math.cos(lon - this.long0);
      //trace(p.toString());
      return p;
    }
    else if (Math.abs(this.sinlat0) < EPSLN) {
      //Eq
      //trace('stere:equateur');
      A = 2 * this.a * this.k0 / (1 + cosX * Math.cos(dlon));
      p.y = A * sinX;
    }
    else {
      //other case
      //trace('stere:normal case');
      A = 2 * this.a * this.k0 * this.ms1 / (this.cosX0 * (1 + this.sinX0 * sinX + this.cosX0 * cosX * Math.cos(dlon)));
      p.y = A * (this.cosX0 * sinX - this.sinX0 * cosX * Math.cos(dlon)) + this.y0;
    }
    p.x = A * cosX * Math.sin(dlon) + this.x0;
  }
  //trace(p.toString());
  return p;
};


//* Stereographic inverse equations--mapping x,y to lat/long
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var lon, lat, ts, ce, Chi;
  var rh = Math.sqrt(p.x * p.x + p.y * p.y);
  if (this.sphere) {
    var c = 2 * Math.atan(rh / (0.5 * this.a * this.k0));
    lon = this.long0;
    lat = this.lat0;
    if (rh <= EPSLN) {
      p.x = lon;
      p.y = lat;
      return p;
    }
    lat = Math.asin(Math.cos(c) * this.sinlat0 + p.y * Math.sin(c) * this.coslat0 / rh);
    if (Math.abs(this.coslat0) < EPSLN) {
      if (this.lat0 > 0) {
        lon = adjust_lon(this.long0 + Math.atan2(p.x, - 1 * p.y));
      }
      else {
        lon = adjust_lon(this.long0 + Math.atan2(p.x, p.y));
      }
    }
    else {
      lon = adjust_lon(this.long0 + Math.atan2(p.x * Math.sin(c), rh * this.coslat0 * Math.cos(c) - p.y * this.sinlat0 * Math.sin(c)));
    }
    p.x = lon;
    p.y = lat;
    return p;
  }
  else {
    if (Math.abs(this.coslat0) <= EPSLN) {
      if (rh <= EPSLN) {
        lat = this.lat0;
        lon = this.long0;
        p.x = lon;
        p.y = lat;
        //trace(p.toString());
        return p;
      }
      p.x *= this.con;
      p.y *= this.con;
      ts = rh * this.cons / (2 * this.a * this.k0);
      lat = this.con * phi2z(this.e, ts);
      lon = this.con * adjust_lon(this.con * this.long0 + Math.atan2(p.x, - 1 * p.y));
    }
    else {
      ce = 2 * Math.atan(rh * this.cosX0 / (2 * this.a * this.k0 * this.ms1));
      lon = this.long0;
      if (rh <= EPSLN) {
        Chi = this.X0;
      }
      else {
        Chi = Math.asin(Math.cos(ce) * this.sinX0 + p.y * Math.sin(ce) * this.cosX0 / rh);
        lon = adjust_lon(this.long0 + Math.atan2(p.x * Math.sin(ce), rh * this.cosX0 * Math.cos(ce) - p.y * this.sinX0 * Math.sin(ce)));
      }
      lat = -1 * phi2z(this.e, Math.tan(0.5 * (HALF_PI + Chi)));
    }
  }
  p.x = lon;
  p.y = lat;

  //trace(p.toString());
  return p;

};
exports.names = ["stere", "Stereographic_South_Pole", "Polar Stereographic (variant B)"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js","../common/phi2z":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/phi2z.js","../common/sign":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js","../common/tsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/tsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/sterea.js":[function(require,module,exports){
var gauss = require('./gauss');
var adjust_lon = require('../common/adjust_lon');
exports.init = function() {
  gauss.init.apply(this);
  if (!this.rc) {
    return;
  }
  this.sinc0 = Math.sin(this.phic0);
  this.cosc0 = Math.cos(this.phic0);
  this.R2 = 2 * this.rc;
  if (!this.title) {
    this.title = "Oblique Stereographic Alternative";
  }
};

exports.forward = function(p) {
  var sinc, cosc, cosl, k;
  p.x = adjust_lon(p.x - this.long0);
  gauss.forward.apply(this, [p]);
  sinc = Math.sin(p.y);
  cosc = Math.cos(p.y);
  cosl = Math.cos(p.x);
  k = this.k0 * this.R2 / (1 + this.sinc0 * sinc + this.cosc0 * cosc * cosl);
  p.x = k * cosc * Math.sin(p.x);
  p.y = k * (this.cosc0 * sinc - this.sinc0 * cosc * cosl);
  p.x = this.a * p.x + this.x0;
  p.y = this.a * p.y + this.y0;
  return p;
};

exports.inverse = function(p) {
  var sinc, cosc, lon, lat, rho;
  p.x = (p.x - this.x0) / this.a;
  p.y = (p.y - this.y0) / this.a;

  p.x /= this.k0;
  p.y /= this.k0;
  if ((rho = Math.sqrt(p.x * p.x + p.y * p.y))) {
    var c = 2 * Math.atan2(rho, this.R2);
    sinc = Math.sin(c);
    cosc = Math.cos(c);
    lat = Math.asin(cosc * this.sinc0 + p.y * sinc * this.cosc0 / rho);
    lon = Math.atan2(p.x * sinc, rho * this.cosc0 * cosc - p.y * this.sinc0 * sinc);
  }
  else {
    lat = this.phic0;
    lon = 0;
  }

  p.x = lon;
  p.y = lat;
  gauss.inverse.apply(this, [p]);
  p.x = adjust_lon(p.x + this.long0);
  return p;
};

exports.names = ["Stereographic_North_Pole", "Oblique_Stereographic", "Polar_Stereographic", "sterea","Oblique Stereographic Alternative"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","./gauss":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/gauss.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/tmerc.js":[function(require,module,exports){
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var mlfn = require('../common/mlfn');
var adjust_lon = require('../common/adjust_lon');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var sign = require('../common/sign');
var asinz = require('../common/asinz');

exports.init = function() {
  this.e0 = e0fn(this.es);
  this.e1 = e1fn(this.es);
  this.e2 = e2fn(this.es);
  this.e3 = e3fn(this.es);
  this.ml0 = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
};

/**
    Transverse Mercator Forward  - long/lat to x/y
    long/lat in radians
  */
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;

  var delta_lon = adjust_lon(lon - this.long0);
  var con;
  var x, y;
  var sin_phi = Math.sin(lat);
  var cos_phi = Math.cos(lat);

  if (this.sphere) {
    var b = cos_phi * Math.sin(delta_lon);
    if ((Math.abs(Math.abs(b) - 1)) < 0.0000000001) {
      return (93);
    }
    else {
      x = 0.5 * this.a * this.k0 * Math.log((1 + b) / (1 - b));
      con = Math.acos(cos_phi * Math.cos(delta_lon) / Math.sqrt(1 - b * b));
      if (lat < 0) {
        con = -con;
      }
      y = this.a * this.k0 * (con - this.lat0);
    }
  }
  else {
    var al = cos_phi * delta_lon;
    var als = Math.pow(al, 2);
    var c = this.ep2 * Math.pow(cos_phi, 2);
    var tq = Math.tan(lat);
    var t = Math.pow(tq, 2);
    con = 1 - this.es * Math.pow(sin_phi, 2);
    var n = this.a / Math.sqrt(con);
    var ml = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, lat);

    x = this.k0 * n * al * (1 + als / 6 * (1 - t + c + als / 20 * (5 - 18 * t + Math.pow(t, 2) + 72 * c - 58 * this.ep2))) + this.x0;
    y = this.k0 * (ml - this.ml0 + n * tq * (als * (0.5 + als / 24 * (5 - t + 9 * c + 4 * Math.pow(c, 2) + als / 30 * (61 - 58 * t + Math.pow(t, 2) + 600 * c - 330 * this.ep2))))) + this.y0;

  }
  p.x = x;
  p.y = y;
  return p;
};

/**
    Transverse Mercator Inverse  -  x/y to long/lat
  */
exports.inverse = function(p) {
  var con, phi;
  var delta_phi;
  var i;
  var max_iter = 6;
  var lat, lon;

  if (this.sphere) {
    var f = Math.exp(p.x / (this.a * this.k0));
    var g = 0.5 * (f - 1 / f);
    var temp = this.lat0 + p.y / (this.a * this.k0);
    var h = Math.cos(temp);
    con = Math.sqrt((1 - h * h) / (1 + g * g));
    lat = asinz(con);
    if (temp < 0) {
      lat = -lat;
    }
    if ((g === 0) && (h === 0)) {
      lon = this.long0;
    }
    else {
      lon = adjust_lon(Math.atan2(g, h) + this.long0);
    }
  }
  else { // ellipsoidal form
    var x = p.x - this.x0;
    var y = p.y - this.y0;

    con = (this.ml0 + y / this.k0) / this.a;
    phi = con;
    for (i = 0; true; i++) {
      delta_phi = ((con + this.e1 * Math.sin(2 * phi) - this.e2 * Math.sin(4 * phi) + this.e3 * Math.sin(6 * phi)) / this.e0) - phi;
      phi += delta_phi;
      if (Math.abs(delta_phi) <= EPSLN) {
        break;
      }
      if (i >= max_iter) {
        return (95);
      }
    } // for()
    if (Math.abs(phi) < HALF_PI) {
      var sin_phi = Math.sin(phi);
      var cos_phi = Math.cos(phi);
      var tan_phi = Math.tan(phi);
      var c = this.ep2 * Math.pow(cos_phi, 2);
      var cs = Math.pow(c, 2);
      var t = Math.pow(tan_phi, 2);
      var ts = Math.pow(t, 2);
      con = 1 - this.es * Math.pow(sin_phi, 2);
      var n = this.a / Math.sqrt(con);
      var r = n * (1 - this.es) / con;
      var d = x / (n * this.k0);
      var ds = Math.pow(d, 2);
      lat = phi - (n * tan_phi * ds / r) * (0.5 - ds / 24 * (5 + 3 * t + 10 * c - 4 * cs - 9 * this.ep2 - ds / 30 * (61 + 90 * t + 298 * c + 45 * ts - 252 * this.ep2 - 3 * cs)));
      lon = adjust_lon(this.long0 + (d * (1 - ds / 6 * (1 + 2 * t + c - ds / 20 * (5 - 2 * c + 28 * t - 3 * cs + 8 * this.ep2 + 24 * ts))) / cos_phi));
    }
    else {
      lat = HALF_PI * sign(y);
      lon = this.long0;
    }
  }
  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Transverse_Mercator", "Transverse Mercator", "tmerc"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js","../common/e0fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js","../common/e1fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js","../common/e2fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js","../common/e3fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js","../common/mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js","../common/sign":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/utm.js":[function(require,module,exports){
var D2R = 0.01745329251994329577;
var tmerc = require('./tmerc');
exports.dependsOn = 'tmerc';
exports.init = function() {
  if (!this.zone) {
    return;
  }
  this.lat0 = 0;
  this.long0 = ((6 * Math.abs(this.zone)) - 183) * D2R;
  this.x0 = 500000;
  this.y0 = this.utmSouth ? 10000000 : 0;
  this.k0 = 0.9996;

  tmerc.init.apply(this);
  this.forward = tmerc.forward;
  this.inverse = tmerc.inverse;
};
exports.names = ["Universal Transverse Mercator System", "utm"];

},{"./tmerc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/tmerc.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/vandg.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var asinz = require('../common/asinz');
/* Initialize the Van Der Grinten projection
  ----------------------------------------*/
exports.init = function() {
  //this.R = 6370997; //Radius of earth
  this.R = this.a;
};

exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  /* Forward equations
    -----------------*/
  var dlon = adjust_lon(lon - this.long0);
  var x, y;

  if (Math.abs(lat) <= EPSLN) {
    x = this.x0 + this.R * dlon;
    y = this.y0;
  }
  var theta = asinz(2 * Math.abs(lat / Math.PI));
  if ((Math.abs(dlon) <= EPSLN) || (Math.abs(Math.abs(lat) - HALF_PI) <= EPSLN)) {
    x = this.x0;
    if (lat >= 0) {
      y = this.y0 + Math.PI * this.R * Math.tan(0.5 * theta);
    }
    else {
      y = this.y0 + Math.PI * this.R * -Math.tan(0.5 * theta);
    }
    //  return(OK);
  }
  var al = 0.5 * Math.abs((Math.PI / dlon) - (dlon / Math.PI));
  var asq = al * al;
  var sinth = Math.sin(theta);
  var costh = Math.cos(theta);

  var g = costh / (sinth + costh - 1);
  var gsq = g * g;
  var m = g * (2 / sinth - 1);
  var msq = m * m;
  var con = Math.PI * this.R * (al * (g - msq) + Math.sqrt(asq * (g - msq) * (g - msq) - (msq + asq) * (gsq - msq))) / (msq + asq);
  if (dlon < 0) {
    con = -con;
  }
  x = this.x0 + con;
  //con = Math.abs(con / (Math.PI * this.R));
  var q = asq + g;
  con = Math.PI * this.R * (m * q - al * Math.sqrt((msq + asq) * (asq + 1) - q * q)) / (msq + asq);
  if (lat >= 0) {
    //y = this.y0 + Math.PI * this.R * Math.sqrt(1 - con * con - 2 * al * con);
    y = this.y0 + con;
  }
  else {
    //y = this.y0 - Math.PI * this.R * Math.sqrt(1 - con * con - 2 * al * con);
    y = this.y0 - con;
  }
  p.x = x;
  p.y = y;
  return p;
};

/* Van Der Grinten inverse equations--mapping x,y to lat/long
  ---------------------------------------------------------*/
exports.inverse = function(p) {
  var lon, lat;
  var xx, yy, xys, c1, c2, c3;
  var a1;
  var m1;
  var con;
  var th1;
  var d;

  /* inverse equations
    -----------------*/
  p.x -= this.x0;
  p.y -= this.y0;
  con = Math.PI * this.R;
  xx = p.x / con;
  yy = p.y / con;
  xys = xx * xx + yy * yy;
  c1 = -Math.abs(yy) * (1 + xys);
  c2 = c1 - 2 * yy * yy + xx * xx;
  c3 = -2 * c1 + 1 + 2 * yy * yy + xys * xys;
  d = yy * yy / c3 + (2 * c2 * c2 * c2 / c3 / c3 / c3 - 9 * c1 * c2 / c3 / c3) / 27;
  a1 = (c1 - c2 * c2 / 3 / c3) / c3;
  m1 = 2 * Math.sqrt(-a1 / 3);
  con = ((3 * d) / a1) / m1;
  if (Math.abs(con) > 1) {
    if (con >= 0) {
      con = 1;
    }
    else {
      con = -1;
    }
  }
  th1 = Math.acos(con) / 3;
  if (p.y >= 0) {
    lat = (-m1 * Math.cos(th1 + Math.PI / 3) - c2 / 3 / c3) * Math.PI;
  }
  else {
    lat = -(-m1 * Math.cos(th1 + Math.PI / 3) - c2 / 3 / c3) * Math.PI;
  }

  if (Math.abs(xx) < EPSLN) {
    lon = this.long0;
  }
  else {
    lon = adjust_lon(this.long0 + Math.PI * (xys - 1 + Math.sqrt(1 + 2 * (xx * xx - yy * yy) + xys * xys)) / 2 / xx);
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Van_der_Grinten_I", "VanDerGrinten", "vandg"];
},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/transform.js":[function(require,module,exports){
var D2R = 0.01745329251994329577;
var R2D = 57.29577951308232088;
var PJD_3PARAM = 1;
var PJD_7PARAM = 2;
var datum_transform = require('./datum_transform');
var adjust_axis = require('./adjust_axis');
var proj = require('./Proj');
var toPoint = require('./common/toPoint');
module.exports = function transform(source, dest, point) {
  var wgs84;
  if (Array.isArray(point)) {
    point = toPoint(point);
  }
  function checkNotWGS(source, dest) {
    return ((source.datum.datum_type === PJD_3PARAM || source.datum.datum_type === PJD_7PARAM) && dest.datumCode !== "WGS84");
  }

  // Workaround for datum shifts towgs84, if either source or destination projection is not wgs84
  if (source.datum && dest.datum && (checkNotWGS(source, dest) || checkNotWGS(dest, source))) {
    wgs84 = new proj('WGS84');
    transform(source, wgs84, point);
    source = wgs84;
  }
  // DGR, 2010/11/12
  if (source.axis !== "enu") {
    adjust_axis(source, false, point);
  }
  // Transform source points to long/lat, if they aren't already.
  if (source.projName === "longlat") {
    point.x *= D2R; // convert degrees to radians
    point.y *= D2R;
  }
  else {
    if (source.to_meter) {
      point.x *= source.to_meter;
      point.y *= source.to_meter;
    }
    source.inverse(point); // Convert Cartesian to longlat
  }
  // Adjust for the prime meridian if necessary
  if (source.from_greenwich) {
    point.x += source.from_greenwich;
  }

  // Convert datums if needed, and if possible.
  point = datum_transform(source.datum, dest.datum, point);

  // Adjust for the prime meridian if necessary
  if (dest.from_greenwich) {
    point.x -= dest.from_greenwich;
  }

  if (dest.projName === "longlat") {
    // convert radians to decimal degrees
    point.x *= R2D;
    point.y *= R2D;
  }
  else { // else project
    dest.forward(point);
    if (dest.to_meter) {
      point.x /= dest.to_meter;
      point.y /= dest.to_meter;
    }
  }

  // DGR, 2010/11/12
  if (dest.axis !== "enu") {
    adjust_axis(dest, true, point);
  }

  return point;
};
},{"./Proj":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Proj.js","./adjust_axis":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/adjust_axis.js","./common/toPoint":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/toPoint.js","./datum_transform":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/datum_transform.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/wkt.js":[function(require,module,exports){
var D2R = 0.01745329251994329577;
var extend = require('./extend');

function mapit(obj, key, v) {
  obj[key] = v.map(function(aa) {
    var o = {};
    sExpr(aa, o);
    return o;
  }).reduce(function(a, b) {
    return extend(a, b);
  }, {});
}

function sExpr(v, obj) {
  var key;
  if (!Array.isArray(v)) {
    obj[v] = true;
    return;
  }
  else {
    key = v.shift();
    if (key === 'PARAMETER') {
      key = v.shift();
    }
    if (v.length === 1) {
      if (Array.isArray(v[0])) {
        obj[key] = {};
        sExpr(v[0], obj[key]);
      }
      else {
        obj[key] = v[0];
      }
    }
    else if (!v.length) {
      obj[key] = true;
    }
    else if (key === 'TOWGS84') {
      obj[key] = v;
    }
    else {
      obj[key] = {};
      if (['UNIT', 'PRIMEM', 'VERT_DATUM'].indexOf(key) > -1) {
        obj[key] = {
          name: v[0].toLowerCase(),
          convert: v[1]
        };
        if (v.length === 3) {
          obj[key].auth = v[2];
        }
      }
      else if (key === 'SPHEROID') {
        obj[key] = {
          name: v[0],
          a: v[1],
          rf: v[2]
        };
        if (v.length === 4) {
          obj[key].auth = v[3];
        }
      }
      else if (['GEOGCS', 'GEOCCS', 'DATUM', 'VERT_CS', 'COMPD_CS', 'LOCAL_CS', 'FITTED_CS', 'LOCAL_DATUM'].indexOf(key) > -1) {
        v[0] = ['name', v[0]];
        mapit(obj, key, v);
      }
      else if (v.every(function(aa) {
        return Array.isArray(aa);
      })) {
        mapit(obj, key, v);
      }
      else {
        sExpr(v, obj[key]);
      }
    }
  }
}

function rename(obj, params) {
  var outName = params[0];
  var inName = params[1];
  if (!(outName in obj) && (inName in obj)) {
    obj[outName] = obj[inName];
    if (params.length === 3) {
      obj[outName] = params[2](obj[outName]);
    }
  }
}

function d2r(input) {
  return input * D2R;
}

function cleanWKT(wkt) {
  if (wkt.type === 'GEOGCS') {
    wkt.projName = 'longlat';
  }
  else if (wkt.type === 'LOCAL_CS') {
    wkt.projName = 'identity';
    wkt.local = true;
  }
  else {
    if (typeof wkt.PROJECTION === "object") {
      wkt.projName = Object.keys(wkt.PROJECTION)[0];
    }
    else {
      wkt.projName = wkt.PROJECTION;
    }
  }
  if (wkt.UNIT) {
    wkt.units = wkt.UNIT.name.toLowerCase();
    if (wkt.units === 'metre') {
      wkt.units = 'meter';
    }
    if (wkt.UNIT.convert) {
      wkt.to_meter = parseFloat(wkt.UNIT.convert, 10);
    }
  }

  if (wkt.GEOGCS) {
    //if(wkt.GEOGCS.PRIMEM&&wkt.GEOGCS.PRIMEM.convert){
    //  wkt.from_greenwich=wkt.GEOGCS.PRIMEM.convert*D2R;
    //}
    if (wkt.GEOGCS.DATUM) {
      wkt.datumCode = wkt.GEOGCS.DATUM.name.toLowerCase();
    }
    else {
      wkt.datumCode = wkt.GEOGCS.name.toLowerCase();
    }
    if (wkt.datumCode.slice(0, 2) === 'd_') {
      wkt.datumCode = wkt.datumCode.slice(2);
    }
    if (wkt.datumCode === 'new_zealand_geodetic_datum_1949' || wkt.datumCode === 'new_zealand_1949') {
      wkt.datumCode = 'nzgd49';
    }
    if (wkt.datumCode === "wgs_1984") {
      if (wkt.PROJECTION === 'Mercator_Auxiliary_Sphere') {
        wkt.sphere = true;
      }
      wkt.datumCode = 'wgs84';
    }
    if (wkt.datumCode.slice(-6) === '_ferro') {
      wkt.datumCode = wkt.datumCode.slice(0, - 6);
    }
    if (wkt.datumCode.slice(-8) === '_jakarta') {
      wkt.datumCode = wkt.datumCode.slice(0, - 8);
    }
    if (~wkt.datumCode.indexOf('belge')) {
      wkt.datumCode = "rnb72";
    }
    if (wkt.GEOGCS.DATUM && wkt.GEOGCS.DATUM.SPHEROID) {
      wkt.ellps = wkt.GEOGCS.DATUM.SPHEROID.name.replace('_19', '').replace(/[Cc]larke\_18/, 'clrk');
      if (wkt.ellps.toLowerCase().slice(0, 13) === "international") {
        wkt.ellps = 'intl';
      }

      wkt.a = wkt.GEOGCS.DATUM.SPHEROID.a;
      wkt.rf = parseFloat(wkt.GEOGCS.DATUM.SPHEROID.rf, 10);
    }
    if (~wkt.datumCode.indexOf('osgb_1936')) {
      wkt.datumCode = "osgb36";
    }
  }
  if (wkt.b && !isFinite(wkt.b)) {
    wkt.b = wkt.a;
  }

  function toMeter(input) {
    var ratio = wkt.to_meter || 1;
    return parseFloat(input, 10) * ratio;
  }
  var renamer = function(a) {
    return rename(wkt, a);
  };
  var list = [
    ['standard_parallel_1', 'Standard_Parallel_1'],
    ['standard_parallel_2', 'Standard_Parallel_2'],
    ['false_easting', 'False_Easting'],
    ['false_northing', 'False_Northing'],
    ['central_meridian', 'Central_Meridian'],
    ['latitude_of_origin', 'Latitude_Of_Origin'],
    ['latitude_of_origin', 'Central_Parallel'],
    ['scale_factor', 'Scale_Factor'],
    ['k0', 'scale_factor'],
    ['latitude_of_center', 'Latitude_of_center'],
    ['lat0', 'latitude_of_center', d2r],
    ['longitude_of_center', 'Longitude_Of_Center'],
    ['longc', 'longitude_of_center', d2r],
    ['x0', 'false_easting', toMeter],
    ['y0', 'false_northing', toMeter],
    ['long0', 'central_meridian', d2r],
    ['lat0', 'latitude_of_origin', d2r],
    ['lat0', 'standard_parallel_1', d2r],
    ['lat1', 'standard_parallel_1', d2r],
    ['lat2', 'standard_parallel_2', d2r],
    ['alpha', 'azimuth', d2r],
    ['srsCode', 'name']
  ];
  list.forEach(renamer);
  if (!wkt.long0 && wkt.longc && (wkt.projName === 'Albers_Conic_Equal_Area' || wkt.projName === "Lambert_Azimuthal_Equal_Area")) {
    wkt.long0 = wkt.longc;
  }
  if (!wkt.lat_ts && wkt.lat1 && (wkt.projName === 'Stereographic_South_Pole' || wkt.projName === 'Polar Stereographic (variant B)')) {
    wkt.lat0 = d2r(wkt.lat1 > 0 ? 90 : -90);
    wkt.lat_ts = wkt.lat1;
  }
}
module.exports = function(wkt, self) {
  var lisp = JSON.parse(("," + wkt).replace(/\s*\,\s*([A-Z_0-9]+?)(\[)/g, ',["$1",').slice(1).replace(/\s*\,\s*([A-Z_0-9]+?)\]/g, ',"$1"]').replace(/,\["VERTCS".+/,''));
  var type = lisp.shift();
  var name = lisp.shift();
  lisp.unshift(['name', name]);
  lisp.unshift(['type', type]);
  lisp.unshift('output');
  var obj = {};
  sExpr(lisp, obj);
  cleanWKT(obj.output);
  return extend(self, obj.output);
};

},{"./extend":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/extend.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/node_modules/mgrs/mgrs.js":[function(require,module,exports){



/**
 * UTM zones are grouped, and assigned to one of a group of 6
 * sets.
 *
 * {int} @private
 */
var NUM_100K_SETS = 6;

/**
 * The column letters (for easting) of the lower left value, per
 * set.
 *
 * {string} @private
 */
var SET_ORIGIN_COLUMN_LETTERS = 'AJSAJS';

/**
 * The row letters (for northing) of the lower left value, per
 * set.
 *
 * {string} @private
 */
var SET_ORIGIN_ROW_LETTERS = 'AFAFAF';

var A = 65; // A
var I = 73; // I
var O = 79; // O
var V = 86; // V
var Z = 90; // Z

/**
 * Conversion of lat/lon to MGRS.
 *
 * @param {object} ll Object literal with lat and lon properties on a
 *     WGS84 ellipsoid.
 * @param {int} accuracy Accuracy in digits (5 for 1 m, 4 for 10 m, 3 for
 *      100 m, 2 for 1000 m or 1 for 10000 m). Optional, default is 5.
 * @return {string} the MGRS string for the given location and accuracy.
 */
exports.forward = function(ll, accuracy) {
  accuracy = accuracy || 5; // default accuracy 1m
  return encode(LLtoUTM({
    lat: ll[1],
    lon: ll[0]
  }), accuracy);
};

/**
 * Conversion of MGRS to lat/lon.
 *
 * @param {string} mgrs MGRS string.
 * @return {array} An array with left (longitude), bottom (latitude), right
 *     (longitude) and top (latitude) values in WGS84, representing the
 *     bounding box for the provided MGRS reference.
 */
exports.inverse = function(mgrs) {
  var bbox = UTMtoLL(decode(mgrs.toUpperCase()));
  if (bbox.lat && bbox.lon) {
    return [bbox.lon, bbox.lat, bbox.lon, bbox.lat];
  }
  return [bbox.left, bbox.bottom, bbox.right, bbox.top];
};

exports.toPoint = function(mgrs) {
  var bbox = UTMtoLL(decode(mgrs.toUpperCase()));
  if (bbox.lat && bbox.lon) {
    return [bbox.lon, bbox.lat];
  }
  return [(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2];
};
/**
 * Conversion from degrees to radians.
 *
 * @private
 * @param {number} deg the angle in degrees.
 * @return {number} the angle in radians.
 */
function degToRad(deg) {
  return (deg * (Math.PI / 180.0));
}

/**
 * Conversion from radians to degrees.
 *
 * @private
 * @param {number} rad the angle in radians.
 * @return {number} the angle in degrees.
 */
function radToDeg(rad) {
  return (180.0 * (rad / Math.PI));
}

/**
 * Converts a set of Longitude and Latitude co-ordinates to UTM
 * using the WGS84 ellipsoid.
 *
 * @private
 * @param {object} ll Object literal with lat and lon properties
 *     representing the WGS84 coordinate to be converted.
 * @return {object} Object literal containing the UTM value with easting,
 *     northing, zoneNumber and zoneLetter properties, and an optional
 *     accuracy property in digits. Returns null if the conversion failed.
 */
function LLtoUTM(ll) {
  var Lat = ll.lat;
  var Long = ll.lon;
  var a = 6378137.0; //ellip.radius;
  var eccSquared = 0.00669438; //ellip.eccsq;
  var k0 = 0.9996;
  var LongOrigin;
  var eccPrimeSquared;
  var N, T, C, A, M;
  var LatRad = degToRad(Lat);
  var LongRad = degToRad(Long);
  var LongOriginRad;
  var ZoneNumber;
  // (int)
  ZoneNumber = Math.floor((Long + 180) / 6) + 1;

  //Make sure the longitude 180.00 is in Zone 60
  if (Long === 180) {
    ZoneNumber = 60;
  }

  // Special zone for Norway
  if (Lat >= 56.0 && Lat < 64.0 && Long >= 3.0 && Long < 12.0) {
    ZoneNumber = 32;
  }

  // Special zones for Svalbard
  if (Lat >= 72.0 && Lat < 84.0) {
    if (Long >= 0.0 && Long < 9.0) {
      ZoneNumber = 31;
    }
    else if (Long >= 9.0 && Long < 21.0) {
      ZoneNumber = 33;
    }
    else if (Long >= 21.0 && Long < 33.0) {
      ZoneNumber = 35;
    }
    else if (Long >= 33.0 && Long < 42.0) {
      ZoneNumber = 37;
    }
  }

  LongOrigin = (ZoneNumber - 1) * 6 - 180 + 3; //+3 puts origin
  // in middle of
  // zone
  LongOriginRad = degToRad(LongOrigin);

  eccPrimeSquared = (eccSquared) / (1 - eccSquared);

  N = a / Math.sqrt(1 - eccSquared * Math.sin(LatRad) * Math.sin(LatRad));
  T = Math.tan(LatRad) * Math.tan(LatRad);
  C = eccPrimeSquared * Math.cos(LatRad) * Math.cos(LatRad);
  A = Math.cos(LatRad) * (LongRad - LongOriginRad);

  M = a * ((1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256) * LatRad - (3 * eccSquared / 8 + 3 * eccSquared * eccSquared / 32 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(2 * LatRad) + (15 * eccSquared * eccSquared / 256 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(4 * LatRad) - (35 * eccSquared * eccSquared * eccSquared / 3072) * Math.sin(6 * LatRad));

  var UTMEasting = (k0 * N * (A + (1 - T + C) * A * A * A / 6.0 + (5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) * A * A * A * A * A / 120.0) + 500000.0);

  var UTMNorthing = (k0 * (M + N * Math.tan(LatRad) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24.0 + (61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSquared) * A * A * A * A * A * A / 720.0)));
  if (Lat < 0.0) {
    UTMNorthing += 10000000.0; //10000000 meter offset for
    // southern hemisphere
  }

  return {
    northing: Math.round(UTMNorthing),
    easting: Math.round(UTMEasting),
    zoneNumber: ZoneNumber,
    zoneLetter: getLetterDesignator(Lat)
  };
}

/**
 * Converts UTM coords to lat/long, using the WGS84 ellipsoid. This is a convenience
 * class where the Zone can be specified as a single string eg."60N" which
 * is then broken down into the ZoneNumber and ZoneLetter.
 *
 * @private
 * @param {object} utm An object literal with northing, easting, zoneNumber
 *     and zoneLetter properties. If an optional accuracy property is
 *     provided (in meters), a bounding box will be returned instead of
 *     latitude and longitude.
 * @return {object} An object literal containing either lat and lon values
 *     (if no accuracy was provided), or top, right, bottom and left values
 *     for the bounding box calculated according to the provided accuracy.
 *     Returns null if the conversion failed.
 */
function UTMtoLL(utm) {

  var UTMNorthing = utm.northing;
  var UTMEasting = utm.easting;
  var zoneLetter = utm.zoneLetter;
  var zoneNumber = utm.zoneNumber;
  // check the ZoneNummber is valid
  if (zoneNumber < 0 || zoneNumber > 60) {
    return null;
  }

  var k0 = 0.9996;
  var a = 6378137.0; //ellip.radius;
  var eccSquared = 0.00669438; //ellip.eccsq;
  var eccPrimeSquared;
  var e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  var N1, T1, C1, R1, D, M;
  var LongOrigin;
  var mu, phi1Rad;

  // remove 500,000 meter offset for longitude
  var x = UTMEasting - 500000.0;
  var y = UTMNorthing;

  // We must know somehow if we are in the Northern or Southern
  // hemisphere, this is the only time we use the letter So even
  // if the Zone letter isn't exactly correct it should indicate
  // the hemisphere correctly
  if (zoneLetter < 'N') {
    y -= 10000000.0; // remove 10,000,000 meter offset used
    // for southern hemisphere
  }

  // There are 60 zones with zone 1 being at West -180 to -174
  LongOrigin = (zoneNumber - 1) * 6 - 180 + 3; // +3 puts origin
  // in middle of
  // zone

  eccPrimeSquared = (eccSquared) / (1 - eccSquared);

  M = y / k0;
  mu = M / (a * (1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256));

  phi1Rad = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);
  // double phi1 = ProjMath.radToDeg(phi1Rad);

  N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  R1 = a * (1 - eccSquared) / Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  D = x / (N1 * k0);

  var lat = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) * D * D * D * D / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * eccPrimeSquared - 3 * C1 * C1) * D * D * D * D * D * D / 720);
  lat = radToDeg(lat);

  var lon = (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * eccPrimeSquared + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1Rad);
  lon = LongOrigin + radToDeg(lon);

  var result;
  if (utm.accuracy) {
    var topRight = UTMtoLL({
      northing: utm.northing + utm.accuracy,
      easting: utm.easting + utm.accuracy,
      zoneLetter: utm.zoneLetter,
      zoneNumber: utm.zoneNumber
    });
    result = {
      top: topRight.lat,
      right: topRight.lon,
      bottom: lat,
      left: lon
    };
  }
  else {
    result = {
      lat: lat,
      lon: lon
    };
  }
  return result;
}

/**
 * Calculates the MGRS letter designator for the given latitude.
 *
 * @private
 * @param {number} lat The latitude in WGS84 to get the letter designator
 *     for.
 * @return {char} The letter designator.
 */
function getLetterDesignator(lat) {
  //This is here as an error flag to show that the Latitude is
  //outside MGRS limits
  var LetterDesignator = 'Z';

  if ((84 >= lat) && (lat >= 72)) {
    LetterDesignator = 'X';
  }
  else if ((72 > lat) && (lat >= 64)) {
    LetterDesignator = 'W';
  }
  else if ((64 > lat) && (lat >= 56)) {
    LetterDesignator = 'V';
  }
  else if ((56 > lat) && (lat >= 48)) {
    LetterDesignator = 'U';
  }
  else if ((48 > lat) && (lat >= 40)) {
    LetterDesignator = 'T';
  }
  else if ((40 > lat) && (lat >= 32)) {
    LetterDesignator = 'S';
  }
  else if ((32 > lat) && (lat >= 24)) {
    LetterDesignator = 'R';
  }
  else if ((24 > lat) && (lat >= 16)) {
    LetterDesignator = 'Q';
  }
  else if ((16 > lat) && (lat >= 8)) {
    LetterDesignator = 'P';
  }
  else if ((8 > lat) && (lat >= 0)) {
    LetterDesignator = 'N';
  }
  else if ((0 > lat) && (lat >= -8)) {
    LetterDesignator = 'M';
  }
  else if ((-8 > lat) && (lat >= -16)) {
    LetterDesignator = 'L';
  }
  else if ((-16 > lat) && (lat >= -24)) {
    LetterDesignator = 'K';
  }
  else if ((-24 > lat) && (lat >= -32)) {
    LetterDesignator = 'J';
  }
  else if ((-32 > lat) && (lat >= -40)) {
    LetterDesignator = 'H';
  }
  else if ((-40 > lat) && (lat >= -48)) {
    LetterDesignator = 'G';
  }
  else if ((-48 > lat) && (lat >= -56)) {
    LetterDesignator = 'F';
  }
  else if ((-56 > lat) && (lat >= -64)) {
    LetterDesignator = 'E';
  }
  else if ((-64 > lat) && (lat >= -72)) {
    LetterDesignator = 'D';
  }
  else if ((-72 > lat) && (lat >= -80)) {
    LetterDesignator = 'C';
  }
  return LetterDesignator;
}

/**
 * Encodes a UTM location as MGRS string.
 *
 * @private
 * @param {object} utm An object literal with easting, northing,
 *     zoneLetter, zoneNumber
 * @param {number} accuracy Accuracy in digits (1-5).
 * @return {string} MGRS string for the given UTM location.
 */
function encode(utm, accuracy) {
  // prepend with leading zeroes
  var seasting = "00000" + utm.easting,
    snorthing = "00000" + utm.northing;

  return utm.zoneNumber + utm.zoneLetter + get100kID(utm.easting, utm.northing, utm.zoneNumber) + seasting.substr(seasting.length - 5, accuracy) + snorthing.substr(snorthing.length - 5, accuracy);
}

/**
 * Get the two letter 100k designator for a given UTM easting,
 * northing and zone number value.
 *
 * @private
 * @param {number} easting
 * @param {number} northing
 * @param {number} zoneNumber
 * @return the two letter 100k designator for the given UTM location.
 */
function get100kID(easting, northing, zoneNumber) {
  var setParm = get100kSetForZone(zoneNumber);
  var setColumn = Math.floor(easting / 100000);
  var setRow = Math.floor(northing / 100000) % 20;
  return getLetter100kID(setColumn, setRow, setParm);
}

/**
 * Given a UTM zone number, figure out the MGRS 100K set it is in.
 *
 * @private
 * @param {number} i An UTM zone number.
 * @return {number} the 100k set the UTM zone is in.
 */
function get100kSetForZone(i) {
  var setParm = i % NUM_100K_SETS;
  if (setParm === 0) {
    setParm = NUM_100K_SETS;
  }

  return setParm;
}

/**
 * Get the two-letter MGRS 100k designator given information
 * translated from the UTM northing, easting and zone number.
 *
 * @private
 * @param {number} column the column index as it relates to the MGRS
 *        100k set spreadsheet, created from the UTM easting.
 *        Values are 1-8.
 * @param {number} row the row index as it relates to the MGRS 100k set
 *        spreadsheet, created from the UTM northing value. Values
 *        are from 0-19.
 * @param {number} parm the set block, as it relates to the MGRS 100k set
 *        spreadsheet, created from the UTM zone. Values are from
 *        1-60.
 * @return two letter MGRS 100k code.
 */
function getLetter100kID(column, row, parm) {
  // colOrigin and rowOrigin are the letters at the origin of the set
  var index = parm - 1;
  var colOrigin = SET_ORIGIN_COLUMN_LETTERS.charCodeAt(index);
  var rowOrigin = SET_ORIGIN_ROW_LETTERS.charCodeAt(index);

  // colInt and rowInt are the letters to build to return
  var colInt = colOrigin + column - 1;
  var rowInt = rowOrigin + row;
  var rollover = false;

  if (colInt > Z) {
    colInt = colInt - Z + A - 1;
    rollover = true;
  }

  if (colInt === I || (colOrigin < I && colInt > I) || ((colInt > I || colOrigin < I) && rollover)) {
    colInt++;
  }

  if (colInt === O || (colOrigin < O && colInt > O) || ((colInt > O || colOrigin < O) && rollover)) {
    colInt++;

    if (colInt === I) {
      colInt++;
    }
  }

  if (colInt > Z) {
    colInt = colInt - Z + A - 1;
  }

  if (rowInt > V) {
    rowInt = rowInt - V + A - 1;
    rollover = true;
  }
  else {
    rollover = false;
  }

  if (((rowInt === I) || ((rowOrigin < I) && (rowInt > I))) || (((rowInt > I) || (rowOrigin < I)) && rollover)) {
    rowInt++;
  }

  if (((rowInt === O) || ((rowOrigin < O) && (rowInt > O))) || (((rowInt > O) || (rowOrigin < O)) && rollover)) {
    rowInt++;

    if (rowInt === I) {
      rowInt++;
    }
  }

  if (rowInt > V) {
    rowInt = rowInt - V + A - 1;
  }

  var twoLetter = String.fromCharCode(colInt) + String.fromCharCode(rowInt);
  return twoLetter;
}

/**
 * Decode the UTM parameters from a MGRS string.
 *
 * @private
 * @param {string} mgrsString an UPPERCASE coordinate string is expected.
 * @return {object} An object literal with easting, northing, zoneLetter,
 *     zoneNumber and accuracy (in meters) properties.
 */
function decode(mgrsString) {

  if (mgrsString && mgrsString.length === 0) {
    throw ("MGRSPoint coverting from nothing");
  }

  var length = mgrsString.length;

  var hunK = null;
  var sb = "";
  var testChar;
  var i = 0;

  // get Zone number
  while (!(/[A-Z]/).test(testChar = mgrsString.charAt(i))) {
    if (i >= 2) {
      throw ("MGRSPoint bad conversion from: " + mgrsString);
    }
    sb += testChar;
    i++;
  }

  var zoneNumber = parseInt(sb, 10);

  if (i === 0 || i + 3 > length) {
    // A good MGRS string has to be 4-5 digits long,
    // ##AAA/#AAA at least.
    throw ("MGRSPoint bad conversion from: " + mgrsString);
  }

  var zoneLetter = mgrsString.charAt(i++);

  // Should we check the zone letter here? Why not.
  if (zoneLetter <= 'A' || zoneLetter === 'B' || zoneLetter === 'Y' || zoneLetter >= 'Z' || zoneLetter === 'I' || zoneLetter === 'O') {
    throw ("MGRSPoint zone letter " + zoneLetter + " not handled: " + mgrsString);
  }

  hunK = mgrsString.substring(i, i += 2);

  var set = get100kSetForZone(zoneNumber);

  var east100k = getEastingFromChar(hunK.charAt(0), set);
  var north100k = getNorthingFromChar(hunK.charAt(1), set);

  // We have a bug where the northing may be 2000000 too low.
  // How
  // do we know when to roll over?

  while (north100k < getMinNorthing(zoneLetter)) {
    north100k += 2000000;
  }

  // calculate the char index for easting/northing separator
  var remainder = length - i;

  if (remainder % 2 !== 0) {
    throw ("MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters" + mgrsString);
  }

  var sep = remainder / 2;

  var sepEasting = 0.0;
  var sepNorthing = 0.0;
  var accuracyBonus, sepEastingString, sepNorthingString, easting, northing;
  if (sep > 0) {
    accuracyBonus = 100000.0 / Math.pow(10, sep);
    sepEastingString = mgrsString.substring(i, i + sep);
    sepEasting = parseFloat(sepEastingString) * accuracyBonus;
    sepNorthingString = mgrsString.substring(i + sep);
    sepNorthing = parseFloat(sepNorthingString) * accuracyBonus;
  }

  easting = sepEasting + east100k;
  northing = sepNorthing + north100k;

  return {
    easting: easting,
    northing: northing,
    zoneLetter: zoneLetter,
    zoneNumber: zoneNumber,
    accuracy: accuracyBonus
  };
}

/**
 * Given the first letter from a two-letter MGRS 100k zone, and given the
 * MGRS table set for the zone number, figure out the easting value that
 * should be added to the other, secondary easting value.
 *
 * @private
 * @param {char} e The first letter from a two-letter MGRS 100´k zone.
 * @param {number} set The MGRS table set for the zone number.
 * @return {number} The easting value for the given letter and set.
 */
function getEastingFromChar(e, set) {
  // colOrigin is the letter at the origin of the set for the
  // column
  var curCol = SET_ORIGIN_COLUMN_LETTERS.charCodeAt(set - 1);
  var eastingValue = 100000.0;
  var rewindMarker = false;

  while (curCol !== e.charCodeAt(0)) {
    curCol++;
    if (curCol === I) {
      curCol++;
    }
    if (curCol === O) {
      curCol++;
    }
    if (curCol > Z) {
      if (rewindMarker) {
        throw ("Bad character: " + e);
      }
      curCol = A;
      rewindMarker = true;
    }
    eastingValue += 100000.0;
  }

  return eastingValue;
}

/**
 * Given the second letter from a two-letter MGRS 100k zone, and given the
 * MGRS table set for the zone number, figure out the northing value that
 * should be added to the other, secondary northing value. You have to
 * remember that Northings are determined from the equator, and the vertical
 * cycle of letters mean a 2000000 additional northing meters. This happens
 * approx. every 18 degrees of latitude. This method does *NOT* count any
 * additional northings. You have to figure out how many 2000000 meters need
 * to be added for the zone letter of the MGRS coordinate.
 *
 * @private
 * @param {char} n Second letter of the MGRS 100k zone
 * @param {number} set The MGRS table set number, which is dependent on the
 *     UTM zone number.
 * @return {number} The northing value for the given letter and set.
 */
function getNorthingFromChar(n, set) {

  if (n > 'V') {
    throw ("MGRSPoint given invalid Northing " + n);
  }

  // rowOrigin is the letter at the origin of the set for the
  // column
  var curRow = SET_ORIGIN_ROW_LETTERS.charCodeAt(set - 1);
  var northingValue = 0.0;
  var rewindMarker = false;

  while (curRow !== n.charCodeAt(0)) {
    curRow++;
    if (curRow === I) {
      curRow++;
    }
    if (curRow === O) {
      curRow++;
    }
    // fixing a bug making whole application hang in this loop
    // when 'n' is a wrong character
    if (curRow > V) {
      if (rewindMarker) { // making sure that this loop ends
        throw ("Bad character: " + n);
      }
      curRow = A;
      rewindMarker = true;
    }
    northingValue += 100000.0;
  }

  return northingValue;
}

/**
 * The function getMinNorthing returns the minimum northing value of a MGRS
 * zone.
 *
 * Ported from Geotrans' c Lattitude_Band_Value structure table.
 *
 * @private
 * @param {char} zoneLetter The MGRS zone to get the min northing for.
 * @return {number}
 */
function getMinNorthing(zoneLetter) {
  var northing;
  switch (zoneLetter) {
  case 'C':
    northing = 1100000.0;
    break;
  case 'D':
    northing = 2000000.0;
    break;
  case 'E':
    northing = 2800000.0;
    break;
  case 'F':
    northing = 3700000.0;
    break;
  case 'G':
    northing = 4600000.0;
    break;
  case 'H':
    northing = 5500000.0;
    break;
  case 'J':
    northing = 6400000.0;
    break;
  case 'K':
    northing = 7300000.0;
    break;
  case 'L':
    northing = 8200000.0;
    break;
  case 'M':
    northing = 9100000.0;
    break;
  case 'N':
    northing = 0.0;
    break;
  case 'P':
    northing = 800000.0;
    break;
  case 'Q':
    northing = 1700000.0;
    break;
  case 'R':
    northing = 2600000.0;
    break;
  case 'S':
    northing = 3500000.0;
    break;
  case 'T':
    northing = 4400000.0;
    break;
  case 'U':
    northing = 5300000.0;
    break;
  case 'V':
    northing = 6200000.0;
    break;
  case 'W':
    northing = 7000000.0;
    break;
  case 'X':
    northing = 7900000.0;
    break;
  default:
    northing = -1.0;
  }
  if (northing >= 0.0) {
    return northing;
  }
  else {
    throw ("Invalid zone letter: " + zoneLetter);
  }

}

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/package.json":[function(require,module,exports){
module.exports={
  "name": "proj4",
  "version": "2.3.10",
  "description": "Proj4js is a JavaScript library to transform point coordinates from one coordinate system to another, including datum transformations.",
  "main": "lib/index.js",
  "directories": {
    "test": "test",
    "doc": "docs"
  },
  "scripts": {
    "test": "./node_modules/istanbul/lib/cli.js test ./node_modules/mocha/bin/_mocha test/test.js"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/proj4js/proj4js.git"
  },
  "author": "",
  "license": "MIT",
  "jam": {
    "main": "dist/proj4.js",
    "include": [
      "dist/proj4.js",
      "README.md",
      "AUTHORS",
      "LICENSE.md"
    ]
  },
  "devDependencies": {
    "grunt-cli": "~0.1.13",
    "grunt": "~0.4.2",
    "grunt-contrib-connect": "~0.6.0",
    "grunt-contrib-jshint": "~0.8.0",
    "chai": "~1.8.1",
    "mocha": "~1.17.1",
    "grunt-mocha-phantomjs": "~0.4.0",
    "browserify": "~3.24.5",
    "grunt-browserify": "~1.3.0",
    "grunt-contrib-uglify": "~0.3.2",
    "curl": "git://github.com/cujojs/curl.git",
    "istanbul": "~0.2.4",
    "tin": "~0.4.0"
  },
  "dependencies": {
    "mgrs": "~0.0.2"
  },
  "contributors": [
    {
      "name": "Mike Adair",
      "email": "madair@dmsolutions.ca"
    },
    {
      "name": "Richard Greenwood",
      "email": "rich@greenwoodmap.com"
    },
    {
      "name": "Calvin Metcalf",
      "email": "calvin.metcalf@gmail.com"
    },
    {
      "name": "Richard Marsden",
      "url": "http://www.winwaed.com"
    },
    {
      "name": "T. Mittan"
    },
    {
      "name": "D. Steinwand"
    },
    {
      "name": "S. Nelson"
    }
  ],
  "gitHead": "ac03d1439491dc313da80985193f702ca471b3d0",
  "bugs": {
    "url": "https://github.com/proj4js/proj4js/issues"
  },
  "homepage": "https://github.com/proj4js/proj4js#readme",
  "_id": "proj4@2.3.10",
  "_shasum": "f6e66bdcca332c25a5e3d8ef265cfc9d7b60fd0c",
  "_from": "proj4@*",
  "_npmVersion": "2.11.2",
  "_nodeVersion": "0.12.5",
  "_npmUser": {
    "name": "ahocevar",
    "email": "andreas.hocevar@gmail.com"
  },
  "maintainers": [
    {
      "name": "cwmma",
      "email": "calvin.metcalf@gmail.com"
    },
    {
      "name": "ahocevar",
      "email": "andreas.hocevar@gmail.com"
    }
  ],
  "dist": {
    "shasum": "f6e66bdcca332c25a5e3d8ef265cfc9d7b60fd0c",
    "tarball": "http://registry.npmjs.org/proj4/-/proj4-2.3.10.tgz"
  },
  "_resolved": "https://registry.npmjs.org/proj4/-/proj4-2.3.10.tgz"
}

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux-observers/lib/constants.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var SKIP = exports.SKIP = 'skipInitialCall';
var EQUALS = exports.EQUALS = 'equals';
var OBSERVER = exports.OBSERVER = '__OBSERVER__';
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux-observers/lib/helpers.js":[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('./constants');

exports.default = {
  isStore: isStore, isObserverArray: isObserverArray, isPrimitive: isPrimitive, hasKey: hasKey
};

var storeKeys = ['dispatch', 'getState', 'subscribe'];
function isStore(val) {
  if (!val) {
    return false;
  }
  return storeKeys.every(function (key) {
    return has.call(val, key);
  });
}

function isObserverArray(val) {
  if (!Array.isArray(val)) {
    return false;
  }
  return val.every(isObserver);
}

function isObserver(val) {
  return typeof val === 'function' && val[_constants.OBSERVER];
}

var primitives = ['string', 'number', 'boolean'];
function isPrimitive(val) {
  return primitives.some(function (p) {
    return (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === p;
  });
}

var has = Object.prototype.hasOwnProperty;
function hasKey(obj, key) {
  return has.call(obj, key);
}
},{"./constants":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux-observers/lib/constants.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux-observers/lib/index.js":[function(require,module,exports){
'use strict';

var _defaults;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observe = observe;
exports.observer = observer;
exports.shallowEquals = shallowEquals;

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Default options.
var defaults = (_defaults = {}, _defineProperty(_defaults, _constants.SKIP, true), _defineProperty(_defaults, _constants.EQUALS, shallowEquals), _defaults);

function observe(store, observers) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  if (!_helpers2.default.isStore(store)) {
    throw new Error('observers: invalid `store` argument; ' + 'expected a Redux store object.');
  }

  if (!_helpers2.default.isObserverArray(observers)) {
    throw new Error('observers: invalid `observers` argument; ' + 'expected an array of observer() functions.');
  }

  // Create globally-applicable options for the given observer set.
  var globals = [_constants.SKIP, _constants.EQUALS].reduce(function (globals, key) {
    globals[key] = _helpers2.default.hasKey(options, key) ? options[key] : defaults[key];
    return globals;
  }, {});

  var dispatch = store.dispatch;
  var getState = store.getState;
  var subscribe = store.subscribe;

  var apply = function apply(state) {
    observers.forEach(function (fn) {
      fn(state, dispatch, globals);
    });
  };
  var listen = function listen() {
    apply(getState());
  };

  var unsubscribe = subscribe(listen);
  listen();
  return unsubscribe;
}

function observer(mapper, dispatcher) {
  var locals = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  mapper = mapper || defaultMapper;
  if (typeof dispatcher !== 'function') {
    throw new Error('observers: a `dispatcher` function must be provided.');
  }

  var initialized = false;
  var current = undefined;
  var observer = function observer(state, dispatch, globals) {
    var previous = current;
    current = mapper(state);

    // This branch is run only once, before the Redux reducers
    // return their initial state.
    if (!initialized) {
      initialized = true;
      var skip = _helpers2.default.hasKey(locals, _constants.SKIP) ? !!locals[_constants.SKIP] : globals[_constants.SKIP];
      if (skip) {
        return;
      }
    }

    var equals = locals[_constants.EQUALS] || globals[_constants.EQUALS];
    if (!equals(current, previous)) {
      dispatcher(dispatch, current, previous);
    }
  };

  observer[_constants.OBSERVER] = true;

  return observer;
}

var defaultMapper = function defaultMapper(state) {
  return state;
};

// Adapted from https://github.com/rackt/react-redux/blob/master/src/utils/shallowEqual.js
function shallowEquals(a, b) {
  if (a === b) {
    return true;
  }

  // Guard against undefined values.
  //
  // Note: even though Redux expects reducers to never return `undefined`,
  // internally-mapped state slices (via `mapper`) may be set to `undefined`.
  if (a === undefined || b === undefined) {
    return false;
  }

  if (_helpers2.default.isPrimitive(a) || _helpers2.default.isPrimitive(b)) {
    return a === b;
  }

  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (var i = 0; i < bKeys.length; i++) {
    var key = bKeys[i];
    if (!_helpers2.default.hasKey(a, key) || a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}
},{"./constants":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux-observers/lib/constants.js","./helpers":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux-observers/lib/helpers.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/applyMiddleware.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = applyMiddleware;

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = _compose2['default'].apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}
},{"./compose":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/compose.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/bindActionCreators.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = bindActionCreators;
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/combineReducers.js":[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports['default'] = combineReducers;

var _createStore = require('./createStore');

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!(0, _isPlainObject2['default'])(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });

  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        (0, _warning2['default'])('No reducer provided for key "' + key + '"');
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  if (process.env.NODE_ENV !== 'production') {
    var unexpectedKeyCache = {};
  }

  var sanityError;
  try {
    assertReducerSanity(finalReducers);
  } catch (e) {
    sanityError = e;
  }

  return function combination() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    if (sanityError) {
      throw sanityError;
    }

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
      if (warningMessage) {
        (0, _warning2['default'])(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i];
      var reducer = finalReducers[key];
      var previousStateForKey = state[key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
}).call(this,require('_process'))

},{"./createStore":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/createStore.js","./utils/warning":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/utils/warning.js","_process":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/grunt-browserify/node_modules/browserify/node_modules/process/browser.js","lodash/isPlainObject":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/isPlainObject.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/compose.js":[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = compose;
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  var last = funcs[funcs.length - 1];
  var rest = funcs.slice(0, -1);
  return function () {
    return rest.reduceRight(function (composed, f) {
      return f(composed);
    }, last.apply(undefined, arguments));
  };
}
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/createStore.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.ActionTypes = undefined;
exports['default'] = createStore;

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _symbolObservable = require('symbol-observable');

var _symbolObservable2 = _interopRequireDefault(_symbolObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = exports.ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!(0, _isPlainObject2['default'])(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/zenparsing/es-observable
   */
  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return { unsubscribe: unsubscribe };
      }
    }, _ref[_symbolObservable2['default']] = function () {
      return this;
    }, _ref;
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[_symbolObservable2['default']] = observable, _ref2;
}
},{"lodash/isPlainObject":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/lodash/isPlainObject.js","symbol-observable":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/symbol-observable/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/index.js":[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

var _createStore = require('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _combineReducers = require('./combineReducers');

var _combineReducers2 = _interopRequireDefault(_combineReducers);

var _bindActionCreators = require('./bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _applyMiddleware = require('./applyMiddleware');

var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2['default'])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createStore = _createStore2['default'];
exports.combineReducers = _combineReducers2['default'];
exports.bindActionCreators = _bindActionCreators2['default'];
exports.applyMiddleware = _applyMiddleware2['default'];
exports.compose = _compose2['default'];
}).call(this,require('_process'))

},{"./applyMiddleware":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/applyMiddleware.js","./bindActionCreators":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/bindActionCreators.js","./combineReducers":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/combineReducers.js","./compose":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/compose.js","./createStore":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/createStore.js","./utils/warning":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/utils/warning.js","_process":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/grunt-browserify/node_modules/browserify/node_modules/process/browser.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/utils/warning.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports['default'] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/client.js":[function(require,module,exports){
/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  console.warn("Using browser-only version of superagent in non-browser environment");
  root = this;
}

var Emitter = require('emitter');
var RequestBase = require('./request-base');
var isObject = require('./is-object');
var isFunction = require('./is-function');
var ResponseBase = require('./response-base');

/**
 * Noop.
 */

function noop(){};

/**
 * Expose `request`.
 */

var request = exports = module.exports = function(method, url) {
  // callback
  if ('function' == typeof url) {
    return new exports.Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
}

exports.Request = Request;

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  throw Error("Browser-only verison of superagent could not find XHR");
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pushEncodedKeyValuePair(pairs, key, obj[key]);
  }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (val != null) {
    if (Array.isArray(val)) {
      val.forEach(function(v) {
        pushEncodedKeyValuePair(pairs, key, v);
      });
    } else if (isObject(val)) {
      for(var subkey in val) {
        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
      }
    } else {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(val));
    }
  } else if (val === null) {
    pairs.push(encodeURIComponent(key));
  }
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var pair;
  var pos;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');
    if (pos == -1) {
      obj[decodeURIComponent(pair)] = '';
    } else {
      obj[decodeURIComponent(pair.slice(0, pos))] =
        decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status;
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
      status = 204;
  }
  this._setStatusProperties(status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this._setHeaderProperties(this.header);

  if (null === this.text && req._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method != 'HEAD'
      ? this._parseBody(this.text ? this.text : this.xhr.response)
      : null;
  }
}

ResponseBase(Response.prototype);

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function(str){
  var parse = request.parse[this.type];
  if(this.req._parser) {
    return this.req._parser(this, str);
  }
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      if (self.xhr) {
        // ie9 doesn't have 'response' property
        err.rawResponse = typeof self.xhr.responseType == 'undefined' ? self.xhr.responseText : self.xhr.response;
        // issue #876: return the http status code if the response parsing fails
        err.status = self.xhr.status ? self.xhr.status : null;
        err.statusCode = err.status; // backwards-compat only
      } else {
        err.rawResponse = null;
        err.status = null;
      }

      return self.callback(err);
    }

    self.emit('response', res);

    var new_err;
    try {
      if (!self._isResponseOK(res)) {
        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
        new_err.original = err;
        new_err.response = res;
        new_err.status = res.status;
      }
    } catch(e) {
      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
    }

    // #1000 don't catch errors from the callback to avoid double calling it
    if (new_err) {
      self.callback(new_err, res);
    } else {
      self.callback(null, res);
    }
  });
}

/**
 * Mixin `Emitter` and `RequestBase`.
 */

Emitter(Request.prototype);
RequestBase(Request.prototype);

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (!options) {
    options = {
      type: 'function' === typeof btoa ? 'basic' : 'auto',
    }
  }

  switch (options.type) {
    case 'basic':
      this.set('Authorization', 'Basic ' + btoa(user + ':' + pass));
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
  }
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, options){
  if (this._data) {
    throw Error("superagent can't mix .send() and .attach()");
  }

  this._getFormData().append(field, file, options || file.name);
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();

  if (err) {
    this.emit('error', err);
  }

  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

// This only warns, because the request is still likely to work
Request.prototype.buffer = Request.prototype.ca = Request.prototype.agent = function(){
  console.warn("This is not supported in browser version of superagent");
  return this;
};

// This throws, because it can't send/receive data as expected
Request.prototype.pipe = Request.prototype.write = function(){
  throw Error("Streaming is not supported in browser version of superagent");
};

/**
 * Compose querystring to append to req.url
 *
 * @api private
 */

Request.prototype._appendQueryString = function(){
  var query = this._query.join('&');
  if (query) {
    this.url += (this.url.indexOf('?') >= 0 ? '&' : '?') + query;
  }

  if (this._sort) {
    var index = this.url.indexOf('?');
    if (index >= 0) {
      var queryArr = this.url.substring(index + 1).split('&');
      if (isFunction(this._sort)) {
        queryArr.sort(this._sort);
      } else {
        queryArr.sort();
      }
      this.url = this.url.substring(0, index) + '?' + queryArr.join('&');
    }
  }
};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
Request.prototype._isHost = function _isHost(obj) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return obj && 'object' === typeof obj && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
}

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var data = this._formData || this._data;

  if (this._endCalled) {
    console.warn("Warning: .end() was called twice. This is not supported in superagent");
  }
  this._endCalled = true;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    var readyState = xhr.readyState;
    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }
    if (4 != readyState) {
      return;
    }

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = direction;
    self.emit('progress', e);
  }
  if (this.hasListeners('progress')) {
    try {
      xhr.onprogress = handleProgress.bind(null, 'download');
      if (xhr.upload) {
        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
      }
    } catch(e) {
      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  // querystring
  this._appendQueryString();

  this._setTimeouts();

  // initiate request
  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if (!this._formData && 'GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) {
      serialize = request.serialize['application/json'];
    }
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.options = function(url, data, fn){
  var req = request('OPTIONS', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-function":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/is-function.js","./is-object":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/is-object.js","./request-base":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/request-base.js","./response-base":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/response-base.js","emitter":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/component-emitter/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/is-function.js":[function(require,module,exports){
/**
 * Check if `fn` is a function.
 *
 * @param {Function} fn
 * @return {Boolean}
 * @api private
 */
var isObject = require('./is-object');

function isFunction(fn) {
  var tag = isObject(fn) ? Object.prototype.toString.call(fn) : '';
  return tag === '[object Function]';
}

module.exports = isFunction;

},{"./is-object":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/is-object.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/is-object.js":[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null !== obj && 'object' === typeof obj;
}

module.exports = isObject;

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/request-base.js":[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Expose `RequestBase`.
 */

module.exports = RequestBase;

/**
 * Initialize a new `RequestBase`.
 *
 * @api public
 */

function RequestBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in RequestBase.prototype) {
    obj[key] = RequestBase.prototype[key];
  }
  return obj;
}

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.clearTimeout = function _clearTimeout(){
  this._timeout = 0;
  this._responseTimeout = 0;
  clearTimeout(this._timer);
  clearTimeout(this._responseTimeoutTimer);
  return this;
};

/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Set format of binary response body.
 * In browser valid formats are 'blob' and 'arraybuffer',
 * which return Blob and ArrayBuffer, respectively.
 *
 * In Node all values result in Buffer.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.serialize = function serialize(fn){
  this._serializer = fn;
  return this;
};

/**
 * Set timeouts.
 *
 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
 *
 * Value of 0 or false means no timeout.
 *
 * @param {Number|Object} ms or {response, read, deadline}
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.timeout = function timeout(options){
  if (!options || 'object' !== typeof options) {
    this._timeout = options;
    this._responseTimeout = 0;
    return this;
  }

  if ('undefined' !== typeof options.deadline) {
    this._timeout = options.deadline;
  }
  if ('undefined' !== typeof options.response) {
    this._responseTimeout = options.response;
  }
  return this;
};

/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */

RequestBase.prototype.then = function then(resolve, reject) {
  if (!this._fullfilledPromise) {
    var self = this;
    if (this._endCalled) {
      console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises");
    }
    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
      self.end(function(err, res){
        if (err) innerReject(err); else innerResolve(res);
      });
    });
  }
  return this._fullfilledPromise.then(resolve, reject);
}

RequestBase.prototype.catch = function(cb) {
  return this.then(undefined, cb);
};

/**
 * Allow for extension
 */

RequestBase.prototype.use = function use(fn) {
  fn(this);
  return this;
}

RequestBase.prototype.ok = function(cb) {
  if ('function' !== typeof cb) throw Error("Callback required");
  this._okCallback = cb;
  return this;
};

RequestBase.prototype._isResponseOK = function(res) {
  if (!res) {
    return false;
  }

  if (this._okCallback) {
    return this._okCallback(res);
  }

  return res.status >= 200 && res.status < 300;
};


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

RequestBase.prototype.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

RequestBase.prototype.getHeader = RequestBase.prototype.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
RequestBase.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
RequestBase.prototype.field = function(name, val) {

  // name should be either a string or an object.
  if (null === name ||  undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (this._data) {
    console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject(name)) {
    for (var key in name) {
      this.field(key, name[key]);
    }
    return this;
  }

  if (Array.isArray(val)) {
    for (var i in val) {
      this.field(name, val[i]);
    }
    return this;
  }

  // val should be defined now
  if (null === val || undefined === val) {
    throw new Error('.field(name, val) val can not be empty');
  }
  if ('boolean' === typeof val) {
    val = '' + val;
  }
  this._getFormData().append(name, val);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */
RequestBase.prototype.abort = function(){
  if (this._aborted) {
    return this;
  }
  this._aborted = true;
  this.xhr && this.xhr.abort(); // browser
  this.req && this.req.abort(); // node
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

RequestBase.prototype.withCredentials = function(){
  // This is browser-only functionality. Node side is no-op.
  this._withCredentials = true;
  return this;
};

/**
 * Set the max redirects to `n`. Does noting in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.redirects = function(n){
  this._maxRedirects = n;
  return this;
};

/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */

RequestBase.prototype.toJSON = function(){
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
};


/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.send = function(data){
  var isObj = isObject(data);
  var type = this._header['content-type'];

  if (this._formData) {
    console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObj && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw Error("Can't merge these send calls");
  }

  // merge
  if (isObj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObj || this._isHost(data)) {
    return this;
  }

  // default to json
  if (!type) this.type('json');
  return this;
};


/**
 * Sort `querystring` by the sort function
 *
 *
 * Examples:
 *
 *       // default order
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery()
 *         .end(callback)
 *
 *       // customized sort function
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery(function(a, b){
 *           return a.length - b.length;
 *         })
 *         .end(callback)
 *
 *
 * @param {Function} sort
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.sortQuery = function(sort) {
  // _sort default to true but otherwise can be a function or boolean
  this._sort = typeof sort === 'undefined' ? true : sort;
  return this;
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

RequestBase.prototype._timeoutError = function(reason, timeout){
  if (this._aborted) {
    return;
  }
  var err = new Error(reason + timeout + 'ms exceeded');
  err.timeout = timeout;
  err.code = 'ECONNABORTED';
  this.timedout = true;
  this.abort();
  this.callback(err);
};

RequestBase.prototype._setTimeouts = function() {
  var self = this;

  // deadline
  if (this._timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self._timeoutError('Timeout of ', self._timeout);
    }, this._timeout);
  }
  // response timeout
  if (this._responseTimeout && !this._responseTimeoutTimer) {
    this._responseTimeoutTimer = setTimeout(function(){
      self._timeoutError('Response timeout of ', self._responseTimeout);
    }, this._responseTimeout);
  }
}

},{"./is-object":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/is-object.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/response-base.js":[function(require,module,exports){

/**
 * Module dependencies.
 */

var utils = require('./utils');

/**
 * Expose `ResponseBase`.
 */

module.exports = ResponseBase;

/**
 * Initialize a new `ResponseBase`.
 *
 * @api public
 */

function ResponseBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in ResponseBase.prototype) {
    obj[key] = ResponseBase.prototype[key];
  }
  return obj;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

ResponseBase.prototype.get = function(field){
    return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

ResponseBase.prototype._setHeaderProperties = function(header){
    // TODO: moar!
    // TODO: make this a util

    // content-type
    var ct = header['content-type'] || '';
    this.type = utils.type(ct);

    // params
    var params = utils.params(ct);
    for (var key in params) this[key] = params[key];

    this.links = {};

    // links
    try {
        if (header.link) {
            this.links = utils.parseLinks(header.link);
        }
    } catch (err) {
        // ignore
    }
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

ResponseBase.prototype._setStatusProperties = function(status){
    var type = status / 100 | 0;

    // status / class
    this.status = this.statusCode = status;
    this.statusType = type;

    // basics
    this.info = 1 == type;
    this.ok = 2 == type;
    this.redirect = 3 == type;
    this.clientError = 4 == type;
    this.serverError = 5 == type;
    this.error = (4 == type || 5 == type)
        ? this.toError()
        : false;

    // sugar
    this.accepted = 202 == status;
    this.noContent = 204 == status;
    this.badRequest = 400 == status;
    this.unauthorized = 401 == status;
    this.notAcceptable = 406 == status;
    this.forbidden = 403 == status;
    this.notFound = 404 == status;
};

},{"./utils":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/utils.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/utils.js":[function(require,module,exports){

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.type = function(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.params = function(str){
  return str.split(/ *; */).reduce(function(obj, str){
    var parts = str.split(/ *= */);
    var key = parts.shift();
    var val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.parseLinks = function(str){
  return str.split(/ *, */).reduce(function(obj, str){
    var parts = str.split(/ *; */);
    var url = parts[0].slice(1, -1);
    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
    obj[rel] = url;
    return obj;
  }, {});
};

/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */

exports.cleanHeader = function(header, shouldStripCookie){
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header['host'];
  if (shouldStripCookie) {
    delete header['cookie'];
  }
  return header;
};

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/symbol-observable/index.js":[function(require,module,exports){
module.exports = require('./lib/index');

},{"./lib/index":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/symbol-observable/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/symbol-observable/lib/index.js":[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ponyfill = require('./ponyfill');

var _ponyfill2 = _interopRequireDefault(_ponyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var root; /* global window */


if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill2['default'])(root);
exports['default'] = result;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./ponyfill":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/symbol-observable/lib/ponyfill.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/symbol-observable/lib/ponyfill.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports['default'] = symbolObservablePonyfill;
function symbolObservablePonyfill(root) {
	var result;
	var _Symbol = root.Symbol;

	if (typeof _Symbol === 'function') {
		if (_Symbol.observable) {
			result = _Symbol.observable;
		} else {
			result = _Symbol('observable');
			_Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/cimis-grid/index.js":[function(require,module,exports){
'use strict';

var proj4 = require('proj4');

// match layers for easier checking
var ncols = 510,
    nrows = 560,
    xllcorner = -410000,
    yllcorner = -660000,
    cellsize = 2000;

var proj_gmaps = 'EPSG:4326';
var proj_cimis = 'EPSG:3310';

proj4.defs('EPSG:3310','+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');


function bounds() {
  var bottomLeft = proj4(proj_cimis, proj_gmaps, [xllcorner, yllcorner]);
  var topRight = proj4(proj_cimis, proj_gmaps,[xllcorner+ncols*cellsize, yllcorner+nrows*cellsize]);
  var bounds = [bottomLeft, topRight];
  return bounds;
}

function gridToBounds(row, col) {
  var bottomLeft = proj4(proj_cimis, proj_gmaps, [xllcorner + (col*cellsize), yllcorner + ((nrows - row)*cellsize)]);
  var topRight = proj4(proj_cimis, proj_gmaps, [xllcorner + ((col+1) * cellsize), yllcorner + ((nrows -(row+1)) * cellsize)]);
  var bounds = [bottomLeft, topRight];

  return bounds;
}

function llToGrid(lng, lat) {
  if( typeof lng === 'object' ) {
    lat = lng.lat();
    lng = lng.lng();
  }

  var result = proj4(proj_gmaps, proj_cimis, [lng, lat]);

  // Assuming this is the input to the grid....
  // Cols are X. Rows are Y and counted from the top down
  result = {
    row : nrows - Math.floor((result[1] - yllcorner) / cellsize),
    col : Math.floor((result[0] - xllcorner) / cellsize),
  };

  var y = yllcorner + ((nrows-result.row) * cellsize);
  var x = xllcorner + (result.col * cellsize) ;

  result.topRight = proj4(proj_cimis, proj_gmaps,[x+cellsize, y+cellsize]);
  result.bottomLeft = proj4(proj_cimis, proj_gmaps,[x, y]);

  return result;
}


module.exports = {
  llToGrid : llToGrid,
  xllcorner : xllcorner,
  yllcorner : yllcorner,
  cellsize : cellsize,
  bounds : bounds,
  gridToBounds : gridToBounds
};

},{"proj4":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/appState/events.js":[function(require,module,exports){
var eventBus = require('../../eventBus');

module.exports = function(controller) {
  eventBus.on('set-app-state', (e) => {
    var resp = controller.set(e.state);
    if( e.handler ) e.handler(resp);
  });

  eventBus.on('set-app-map-state', (e) => {
    var resp = controller.setMapState(e.state);
    if( e.handler ) e.handler(resp);
  });
}
},{"../../eventBus":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eventBus.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/appState/index.js":[function(require,module,exports){
var actions = require('../../redux/actions/appState');
var store = require('../../redux/store');

function AppStateController() {

  this.set = function(state) {
    store.dispatch(
      actions.setAppState(state)
    );

    return store.getState().appState;
  }

  this.setMapState = function(state) {
    store.dispatch(
      actions.setMapState(state)
    );

    return store.getState().appState;
  }
}

var controller = new AppStateController();
require('./events')(controller);

module.exports = controller;
},{"../../redux/actions/appState":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/appState.js","../../redux/store":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js","./events":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/appState/events.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/cimis/events.js":[function(require,module,exports){
var eventBus = require('../../eventBus');

module.exports = function(controller) {
  eventBus.on('get-cimis-grid-data', (e) => {
    var resp = controller.get(e.id);
    if( e.handler ) e.handler(resp);
  });

  eventBus.on('get-cimis-grid-dates', (e) => {
    var resp = controller.loadDates();
    if( e && e.handler ) e.handler(resp);
  });

  eventBus.on('select-cimis-grid', (e) => {
    var resp = controller.select(e.id);
    if( e.handler ) e.handler(resp);
  });
}
},{"../../eventBus":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eventBus.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/cimis/index.js":[function(require,module,exports){
var actions = require('../../redux/actions/collections/cimis');
var store = require('../../redux/store');

function CimisGridController() {

  this.loadDates = function() {
    store.dispatch(
      actions.loadDates()
    );

    return store.getState().collections.cimis.dates;
  }

  this.get = function(id) {
    store.dispatch(
      actions.loadData(id)
    );

    return store.getState().collections.cimis.byId[id];
  }

  this.select = function(id) {
    store.dispatch(
      actions.select(id)
    );

    return this.get(id);
  }
}

var controller = new CimisGridController();
require('./events')(controller);

module.exports = controller;
},{"../../redux/actions/collections/cimis":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/cimis.js","../../redux/store":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js","./events":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/cimis/events.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/dau/events.js":[function(require,module,exports){
var eventBus = require('../../eventBus');

module.exports = function(controller) {
  eventBus.on('get-dau-data', (e) => {
    var resp = controller.get(e.id);
    if( e.handler ) e.handler(resp);
  });

  eventBus.on('get-dau-geometry', (e) => {
    var resp = controller.loadGeometry();
    if( e && e.handler ) e.handler(resp);
  });

  eventBus.on('select-dau', (e) => {
    var resp = controller.select(e.id);
    if( e.handler ) e.handler(resp);
  });
}
},{"../../eventBus":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eventBus.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/dau/index.js":[function(require,module,exports){
var actions = require('../../redux/actions/collections/dau');
var store = require('../../redux/store');

function DauController() {

  this.loadGeometry = function() {
    store.dispatch(
      actions.loadGeometry()
    );

    return store.getState().collections.dau.geometry;
  }

  this.get = function(id) {
    store.dispatch(
      actions.loadData(id)
    );

    return store.getState().collections.dau.byId[id];
  }

  this.select = function(id) {
    store.dispatch(
      actions.selectZone(id)
    );

    return this.get(id);
  }
}

var controller = new DauController();
require('./events')(controller);

module.exports = controller;
},{"../../redux/actions/collections/dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/dau.js","../../redux/store":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js","./events":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/dau/events.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/etoZones/events.js":[function(require,module,exports){
var eventBus = require('../../eventBus');

module.exports = function(controller) {
  eventBus.on('get-eto-zone-data', (e) => {
    var resp = controller.get(e.id);
    if( e.handler ) e.handler(resp);
  });

  eventBus.on('get-eto-zone-geometry', (e) => {
    var resp = controller.loadGeometry();
    if( e && e.handler ) e.handler(resp);
  });

  eventBus.on('select-eto-zone', (e) => {
    var resp = controller.select(e.id);
    if( e.handler ) e.handler(resp);
  });
}
},{"../../eventBus":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eventBus.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/etoZones/index.js":[function(require,module,exports){
var actions = require('../../redux/actions/collections/etoZones');
var store = require('../../redux/store');

function EtoZonesController() {

  this.loadGeometry = function() {
    store.dispatch(
      actions.loadGeometry()
    );

    return store.getState().collections.etoZones.geometry;
  }

  this.get = function(id) {
    store.dispatch(
      actions.loadData(id)
    );

    return store.getState().collections.etoZones.byId[id];
  }

  this.select = function(id) {
    store.dispatch(
      actions.selectZone(id)
    );

    return this.get(id);
  }
}

var controller = new EtoZonesController();
require('./events')(controller);

module.exports = controller;
},{"../../redux/actions/collections/etoZones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/etoZones.js","../../redux/store":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js","./events":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/etoZones/events.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/index.js":[function(require,module,exports){
module.exports = {
  cimis : require('./cimis'),
  dau : require('./dau'),
  etoZones : require('./etoZones'),
  appState : require('./appState')
}
},{"./appState":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/appState/index.js","./cimis":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/cimis/index.js","./dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/dau/index.js","./etoZones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/etoZones/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/definitions.json":[function(require,module,exports){
module.exports={
  "ETo" : {
    "label" : "Reference Evapotranspiration",
    "units" : "mm"
  },
  "Tdew" : {
    "label" : "Dewpoint Temperature",
    "units" : "C"
  },
  "Tx" : {
    "label" : "Max Temperature",
    "units" : "C"
  },
  "Tn" : {
    "label" : "Min Temperature",
    "units" : "C"
  },
  "K" : {
    "label" : "Clear Sky Factor",
    "units" : ""
  },
  "Rnl" : {
    "label" : "Longwave Radiation",
    "units" : "MW/h"
  },
  "Rso" : {
    "label" : "Shortwave Radiation",
    "units" : "MW/h"
  },
  "U2" : {
    "label" : "Wind Speed",
    "units" : "m/s"
  }
}

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eto-zones/index.js":[function(require,module,exports){
var store = require('../redux/store');
var styles = require('./style');

function mergeZoneMap(geojson) {
  geojson.features.forEach(function(feature, index){
    var zoneData = getZoneByAvgDelta(feature.properties.zone);
    if( !zoneData ) return;
    for( var key in zoneData.data ) {
      feature.properties[key] = zoneData.data[key];
    }
  });

  for( var i = 0; i < styles.length; i++ ) {
    for( var j = 0; j < geojson.features.length; j++ ) {
      if( styles[i].zone === geojson.features[j].properties.zone ) {
        styles[i] = geojson.features[j];
        break;
      }
    }
  }
}

function getZoneByAvgDelta(id) {
  for( var i = 0; i < styles.length; i++ ) {
    if( styles[i].avg.toFixed(1)+'_'+styles[i].delta.toFixed(1) === id ) {
      return {
        data : styles[i],
        index : i
      }
    }
  }
  return null;
}

function getZone(id) {
  /** HACK for cyclical dependency */
  var geometry = require('../redux/store').getState().collections.etoZones.geometry;
  if( geometry.state !== 'loaded' ) return {};

  var zones = geometry.data.features;
  id = parseInt(id);
  for( var i = 0; i < zones.length; i++ ) {
    if( zones[i].properties.zone === id ) {
      return zones[i];
    }
  }

  return {};
}

module.exports = {
  getZone : getZone,
  mergeZoneMap : mergeZoneMap
}
},{"../redux/store":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js","./style":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eto-zones/style.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eto-zones/style.js":[function(require,module,exports){
module.exports = [
  {
    zone  : 13,
    avg   : 2.2,
    delta : 0.5,
    color : '#002673'
  },
  {
    zone  : 3,
    avg   : 2.7,
    delta : 1.3,
    color : '#5290fa'
  },
  {
    zone  : 12,
    avg   : 3.0,
    delta : 1.7,
    color : '#7fb6f5'
  },
  {
    zone  : 4,
    avg   : 3.0,
    delta : 2.5,
    color : '#bef0ff'
  },
  {
    zone  : 6,
    avg   : 3.2,
    delta : 2.0,
    color : '#267300'
  },
  {
    zone  : 8,
    avg   : 3.4,
    delta : 2.6,
    color : '#38a800'
  },
  {
    zone  : 16,
    avg   : 3.7,
    delta : 2.2,
    color : '#98e600'
  },
  {
    zone  : 1,
    avg   : 3.8,
    delta : 2.8,
    color : '#a8a800'
  },
  {
    zone  : 7,
    avg   : 4.0,
    delta : 3.1,
    color : '#668000'
  },
  {
    zone  : 15,
    avg   : 4.6,
    delta : 3.1,
    color : '#734c00'
  },
  {
    zone  : 5,
    avg   : 5.0,
    delta : 3.1,
    color : '#895a44'
  },
  {
    zone  : 9,
    avg   : 5.0,
    delta : 3.5,
    color : '#a83800'
  },
  {
    zone  : 11,
    avg   : 5.3,
    delta : 3.3,
    color : '#e64c00'
  },
  {
    zone  : 14,
    avg   : 5.5,
    delta : 3.8,
    color : '#ffa200'
  },
  {
    zone  : 2,
    avg   : 6.0,
    delta : 4.0,
    color : '#ffd000'
  },
  {
    zone  : 10,
    avg   : 6.6,
    delta : 4.3,
    color : '#ffff00'
  }
];
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eventBus.js":[function(require,module,exports){
var Events = require('events').EventEmitter;
module.exports = new Events();
},{"events":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/grunt-browserify/node_modules/browserify/node_modules/events/events.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/fft.js":[function(require,module,exports){
var statewide = function() {
    return [3.80000344759448,3.37241570426343,2.98848553693941,2.70012106485601,2.38930214273498,2.03123198503821,1.76906058726106,1.6015210993811,1.45574468970531,1.28634681025683,1.13471224048035,1.14812877579674,1.14311733458844,1.17049720519879,1.33208044752798,1.49104802998844,1.57203662992406,1.71610941360572,1.96386135170138,2.08797742516025,2.19466357341965,2.50227013114089,3.03964604446435,3.34164195622777,3.59620271945776,3.62968113958865,3.96244810759992,4.20505219846233,4.46889790832936,4.87798903673321,5.33488244099353,5.58047907309925,5.78570062523704,5.73216902228751,6.07729247941205,6.41383094817757,6.70444079913044,6.8928676026226,6.93039971173247,6.92795756321174,6.87515329242875,6.81027639687444,6.676686649322,6.50350448806176,6.3447307476927,6.21433526882241,6.03554667658608,5.77904124803468,5.43198856149357,4.97467484951981,4.63246474069876,4.27677450058678];
};

var cum_et = function (E,D,d) {
    var ang=2*Math.PI*(d/365);
    var d1=ang-2*Math.PI*(D[1])/365;
    var d2=ang-2*Math.PI*(D[2]-D[1])/365;
    var et= (E[0]*d - (365/2*Math.PI)) * (E[1]*Math.sin(d1) + E[2]*Math.sin(d1));
    return et;
};

var et = function (E,D,d) {
    var d1=2*Math.PI*(d-D[1])/365;
    var d2=(2*2*Math.PI/365)*((d-D[1])-D[2]);
    var et=E[0]+E[1]*Math.cos(d1)+E[2]*Math.cos(d2);
    return et;
};

var ifft = function (E,D,N) {
    var n;
    var et=[];
    for (n=0;n<N;n++) {
	et[n]=this.et(E,D,365*(n/N));
    }
    return et;
};

var fft = function(et) {
    var N=et.length;
    var i,n;
    var re=[];
    var im=[];
    var E=[],D=[];
    var ang, etc, ets;

    for (i=0;i<3;i++) {
    	re[i]=0;
	im[i]=0;
	for (n=0;n<N;n++) {
	    ang=2*Math.PI*n/N;
	    re[i]+=et[n]*Math.cos(-i*ang);
	    im[i]+=et[n]*Math.sin(-ang*i);
	}
	switch(i) {
	case 0:
	    D[i]=0;
	    E[i]=Math.sqrt(Math.pow(re[i],2)+
		       Math.pow(im[i],2))/N;
	    break;
	case 1:
	    D[i]=(365 - 365/(2*Math.PI)*Math.atan2(im[i],re[i])) % 365;
	    E[i]=2*Math.sqrt(Math.pow(re[i],2)+
			   Math.pow(im[i],2))/N;
	    break;
	default:
	    D[i]=((365.0/(2*Math.PI*i))*(-Math.atan2(im[i],re[i]))-D[i-1]) % (365.0/i);
	    E[i]=2*Math.sqrt(Math.pow(re[i],2)+
			     Math.pow(im[i],2))/N;
	    // Center on max
	    D[i]=(D[i]<-365.0/4)?D[i]+(365.0/2):D[i];
	    // Then center again, but on either high or low
	    E[i]=(D[i] < -365.0/8)?-E[i]:(D[i] < 365.0/8)?E[i]:-E[i];
	    D[i]=(D[i] < -365.0/8)?D[i]+(365.0/4):(D[i] < 365.0/8)?D[i]:D[i]-(365.0/4)
	}
    }
    return({e:E,d:D,re:re,im:im});
};
    
module.exports = {
    statewide:statewide,
    fft:fft,
    et:et,
    cum_et:cum_et,
    ifft:ifft
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/index.js":[function(require,module,exports){


module.exports = {
  redux : require('./redux'),
  services : require('./services'),
  fft : require('./fft'),
  etoZoneUtils : require('./eto-zones'),
  grid : require('./cimis-grid'),
  utils : require('./utils'),
  definitions : require('./definitions.json'),
  eventBus : require('./eventBus'),
  controllers : require('./controllers')
};

},{"./cimis-grid":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/cimis-grid/index.js","./controllers":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/controllers/index.js","./definitions.json":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/definitions.json","./eto-zones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eto-zones/index.js","./eventBus":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eventBus.js","./fft":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/fft.js","./redux":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/index.js","./services":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/index.js","./utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/utils/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/appState.js":[function(require,module,exports){
/**
 * STATE ENUMs
 */
var ACTIONS = {
  SET_SECTION : 'SET_SECTION',
  SET_STATE : 'SET_STATE',
  SET_MAP_STATE : 'SET_MAP_STATE'
}

var MAP_STATES = {
  cimisGrid : 'cimisGrid',
  etoZones : 'etoZones',
  dauZones : 'dauZones',
  cimisStations : 'cimisStations'
}

var APP_SECTIONS = {
  map : 'map',
  data : 'data',
  about : 'about',
  install : 'install',
  survey : 'survey'
}


/**
 * Action Functions
 */
function setAppState(state) {
  return {
    type : ACTIONS.SET_STATE,
    state : state
  }
}

function setAppSection(section) {
  return {
    type : ACTIONS.SET_SECTION,
    section : section
  }
}


function setMapState(state) {
  return {
    type : ACTIONS.SET_MAP_STATE,
    state : state
  }
}

module.exports = {
  ACTIONS : ACTIONS,
  MAP_STATES : MAP_STATES,
  APP_SECTIONS : APP_SECTIONS,
  setAppState : setAppState,
  setAppSection : setAppSection,
  setMapState : setMapState,
}
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/cimis.js":[function(require,module,exports){
var services = require('../../../services/cimis');

/**
 * STATE ENUMs
 */
var ACTIONS = {
  LOAD_CIMIS_REQUEST: 'LOAD_CIMIS_REQUEST', 
  LOAD_CIMIS_SUCCESS: 'LOAD_CIMIS_SUCCESS', 
  LOAD_CIMIS_FAILURE: 'LOAD_CIMIS_FAILURE',

  LOAD_CIMIS_DATES_REQUEST: 'LOAD_CIMIS_DATES_REQUEST', 
  LOAD_CIMIS_DATES_SUCCESS: 'LOAD_CIMIS_DATES_SUCCESS', 
  LOAD_CIMIS_DATES_FAILURE: 'LOAD_CIMIS_DATES_FAILURE',
  
  SELECT_CIMIS_GRID_LOCATION : 'SELECT_CIMIS_GRID_LOCATION'
}

/**
 * Action Functions
 */
function loadDates() {
  return {
    types: [ACTIONS.LOAD_CIMIS_DATES_REQUEST, ACTIONS.LOAD_CIMIS_DATES_SUCCESS, ACTIONS.LOAD_CIMIS_DATES_FAILURE],
    shouldCallAPI: (state) => {
      return state.collections.cimis.dates.state !== 'loaded'
    },
    callAPI: (callback) => { 
      services.loadDates(callback) ;
    },
    payload: {}
  }
}

function select(id) {
  return {
    type : ACTIONS.SELECT_CIMIS_GRID_LOCATION,
    id : id
  }
}

function loadData(gridId) {
  return {
    types: [ACTIONS.LOAD_CIMIS_REQUEST, ACTIONS.LOAD_CIMIS_SUCCESS, ACTIONS.LOAD_CIMIS_FAILURE],
    shouldCallAPI: (state) => !state.collections.cimis.byId[gridId],
    callAPI: (callback) => { 
      services.loadData(gridId, callback);
    },
    payload: { 
      id : gridId
    }
  }
}


module.exports = {
  ACTIONS : ACTIONS,
  loadDates: loadDates,
  loadData: loadData,
  select : select
}
},{"../../../services/cimis":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/cimis.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/dau.js":[function(require,module,exports){
var services = require('../../../services/dau');

/**
 * STATE ENUMs
 */
var ACTIONS = {
  SELECT_DAU_ZONE : 'SELECT_DAU_ZONE',

  LOAD_DAU_REQUEST: 'LOAD_DAU_REQUEST', 
  LOAD_DAU_SUCCESS: 'LOAD_DAU_SUCCESS', 
  LOAD_DAU_FAILURE: 'LOAD_DAU_FAILURE',

  LOAD_DAU_GEOMETRY_REQUEST: 'LOAD_DAU_GEOMETRY_REQUEST', 
  LOAD_DAU_GEOMETRY_SUCCESS: 'LOAD_DAU_GEOMETRY_SUCCESS', 
  LOAD_DAU_GEOMETRY_FAILURE: 'LOAD_DAU_GEOMETRY_FAILURE'
}


/**
 * Action Functions
 */
function loadGeometry(id, data) {
  return {
    types: [ACTIONS.LOAD_DAU_GEOMETRY_REQUEST, ACTIONS.LOAD_DAU_GEOMETRY_SUCCESS, ACTIONS.LOAD_DAU_GEOMETRY_FAILURE],
    shouldCallAPI: (state) => {
      return state.collections.dau.geometry.state === 'init';
    },
    callAPI: (callback) => { 
      services.loadGeometry(callback);
    },
    payload: { 
      id : id
    }
  }
}

function loadData(id) {
  return {
    types: [ACTIONS.LOAD_DAU_REQUEST, ACTIONS.LOAD_DAU_SUCCESS, ACTIONS.LOAD_DAU_FAILURE],
    shouldCallAPI: (state) => !state.collections.dau.byId[id],
    callAPI: (callback) => { 
      services.loadData(id, callback);
    },
    payload: { 
      id : id
    }
  }
}

function selectZone(id) {
  return {
    types: [ACTIONS.LOAD_DAU_REQUEST, ACTIONS.LOAD_DAU_SUCCESS, ACTIONS.LOAD_DAU_FAILURE],
    shouldCallAPI: (state) => !state.collections.dau.byId[id],
    shouldSelect : (state) => state.collections.dau.selected !== id,
    select : ACTIONS.SELECT_DAU_ZONE,
    callAPI: (callback) => { 
      services.loadData(id, callback);
    },
    payload: { 
      id : id
    }
  }
}


module.exports = {
  ACTIONS : ACTIONS,
  loadGeometry : loadGeometry,
  loadData : loadData,
  selectZone : selectZone
}
},{"../../../services/dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/dau.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/etoZones.js":[function(require,module,exports){
var services = require('../../../services/etoZones');

/**
 * STATE ENUMs
 */
var ACTIONS = {
  SELECT_ETO_ZONE : 'SELECT_ETO_ZONE',

  LOAD_ETO_REQUEST: 'LOAD_ETO_REQUEST', 
  LOAD_ETO_SUCCESS: 'LOAD_ETO_SUCCESS', 
  LOAD_ETO_FAILURE: 'LOAD_ETO_FAILURE',

  LOAD_ETO_GEOMETRY_REQUEST: 'LOAD_ETO_GEOMETRY_REQUEST', 
  LOAD_ETO_GEOMETRY_SUCCESS: 'LOAD_ETO_GEOMETRY_SUCCESS', 
  LOAD_ETO_GEOMETRY_FAILURE: 'LOAD_ETO_GEOMETRY_FAILURE'
}


/**
 * Action Functions
 */
function loadGeometry(id, data) {
  return {
    types: [ACTIONS.LOAD_ETO_GEOMETRY_REQUEST, ACTIONS.LOAD_ETO_GEOMETRY_SUCCESS, ACTIONS.LOAD_ETO_GEOMETRY_FAILURE],
    shouldCallAPI: (state) => {
      return state.collections.etoZones.geometry.state === 'init';
    },
    callAPI: (callback) => { 
      services.loadGeometry(callback);
    },
    payload: { 
      id : id
    }
  }
}

function loadData(id, data) {
  return {
    types: [ACTIONS.LOAD_ETO_REQUEST, ACTIONS.LOAD_ETO_SUCCESS, ACTIONS.LOAD_ETO_FAILURE],
    shouldCallAPI: (state) => !state.collections.etoZones.byId[id],
    callAPI: (callback) => { 
      services.loadData(id, callback);
    },
    payload: { 
      id : id
    }
  }
}

function selectZone(id) {
  return {
    type : ACTIONS.SELECT_ETO_ZONE,
    id : id
  }
}


module.exports = {
  ACTIONS : ACTIONS,
  loadGeometry : loadGeometry,
  loadData : loadData,
  selectZone : selectZone
}
},{"../../../services/etoZones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/etoZones.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/index.js":[function(require,module,exports){
module.exports = {
  dau : require('./dau'),
  cimis : require('./cimis'),
  etoZones : require('./etoZones')
}
},{"./cimis":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/cimis.js","./dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/dau.js","./etoZones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/etoZones.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/config.js":[function(require,module,exports){
/**
 * STATE ENUMs
 */
var ACTIONS = {
  SET_CONFIG_HOST : 'SET_CONFIG_HOST',
}

/**
 * Action Functions
 */
function setConfigHost(host) {
  return {
    type : ACTIONS.SET_CONFIG_HOST,
    host : host
  }
}

module.exports = {
  ACTIONS : ACTIONS,
  setConfigHost : setConfigHost,
}
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/index.js":[function(require,module,exports){
module.exports = {
  appState : require('./appState'),
  config : require('./config'),
  collections : require('./collections')
}
},{"./appState":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/appState.js","./collections":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/index.js","./config":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/config.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/index.js":[function(require,module,exports){
module.exports = {
  store : require('./store'),
  ui : require('./ui'),
  actions : require('./actions')
}
},{"./actions":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/index.js","./store":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js","./ui":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/middleware/api.js":[function(require,module,exports){
module.exports = function(store) {
  var dispatch = store.dispatch;

  return function(next) {
    return function(action) {

      const {
        api,
        types,
        callAPI,
        shouldCallAPI = () => true,
        select,
        shouldSelect = () => true,
        payload = {}
      } = action

      if (!types) {
        // Normal action: pass it on
        return next(action);
      }

      if (
        !Array.isArray(types) ||
        types.length !== 3 ||
        !types.every(type => typeof type === 'string')
      ) {
        throw new Error('Expected an array of three string types.')
      }

      if (typeof callAPI !== 'function') {
        throw new Error('Expected callAPI to be a function.')
      }

      if( select && shouldSelect(store.getState()) ) {
        dispatch(Object.assign({}, payload, {
          type: select
        }))
      }

      if (!shouldCallAPI(store.getState())) {
        return;
      }

      const [ requestType, successType, failureType ] = types

      dispatch(Object.assign({}, payload, {
        type: requestType
      }))

      return callAPI((error, response) => {
        if( error ) {
          dispatch(Object.assign({}, payload, {
              error,
              type: failureType
          }));
        } else {
          dispatch(Object.assign({}, payload, {
            response,
            type: successType
          }));
        }
      });
    }
  }
}
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/middleware/logging.js":[function(require,module,exports){
module.exports = function(store) {
  return function(next) {
    return function(action) {
      console.groupCollapsed(action.type);
      console.log(`DISPATCHING:`, action, store.getState());
      state = next(action);
      console.log(`COMPLETE: ${action.type}`, store.getState());
      console.groupEnd(action.type);
    }
  }
}
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/observers/appState.js":[function(require,module,exports){
var observer = require('redux-observers').observer;
var eventBus = require('../../eventBus');

var appState = observer(
  (state) => state.appState,
  (dispatch, current, previous) => {
    eventBus.emit('app-state-update', current);
  }
);

module.exports = [appState];
},{"../../eventBus":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eventBus.js","redux-observers":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux-observers/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/observers/cimis.js":[function(require,module,exports){
var observer = require('redux-observers').observer;
var eventBus = require('../../eventBus');

var byId = observer(
  (state) => state.collections.cimis.byId,
  (dispatch, current, previous) => {
    for( var key in current ) {
      if( current[key] !== previous[key] ) {
        eventBus.emit('cimis-grid-data-update', current[key]);
      }
    }
  }
);

var dates = observer(
  (state) => state.collections.cimis.dates,
  (dispatch, current, previous) => {
    eventBus.emit('cimis-grid-dates-update', current);
  }
);

var selected = observer(
  (state) => state.collections.cimis.selected,
  (dispatch, current, previous) => {
    eventBus.emit('cimis-grid-selected-update', current);
  }
);

module.exports = [byId, dates, selected];
},{"../../eventBus":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eventBus.js","redux-observers":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux-observers/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/observers/etoZones.js":[function(require,module,exports){
var observer = require('redux-observers').observer;
var eventBus = require('../../eventBus');

var byId = observer(
  (state) => state.collections.etoZones.byId,
  (dispatch, current, previous) => {
    for( var key in current ) {
      if( current[key] !== previous[key] ) {
        eventBus.emit('eto-zone-data-update', current[key]);
      }
    }
  }
);

var geometry = observer(
  (state) => state.collections.etoZones.geometry,
  (dispatch, current, previous) => {
    eventBus.emit('eto-zone-geometry-update', current);
  }
);

var selected = observer(
  (state) => state.collections.etoZones.selected,
  (dispatch, current, previous) => {
    eventBus.emit('eto-zone-selected-update', current);
  }
);

module.exports = [byId, geometry, selected];
},{"../../eventBus":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eventBus.js","redux-observers":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux-observers/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/observers/index.js":[function(require,module,exports){
/**
 * Observe the redux store and send change events to UI
 */
var observe = require('redux-observers').observe;

var observers = []
          .concat(require('./cimis'))
          .concat(require('./appState'))
          .concat(require('./etoZones'));

module.exports = function(store) {
  observe(store, observers);
}
},{"./appState":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/observers/appState.js","./cimis":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/observers/cimis.js","./etoZones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/observers/etoZones.js","redux-observers":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux-observers/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/appState.js":[function(require,module,exports){
var appStateActions = require('../actions/appState');
var utils = require('./utils');

var actions = appStateActions.ACTIONS;
var mapStates = appStateActions.MAP_STATES;
var appSections = appStateActions.APP_SECTIONS;

var initialState = {
  section : appSections.map,
  mapState : mapStates.cimisGrid,
  extras : []
};

function setMapState(state, action) {
  return utils.assign(state, {mapState: action.state});
}

function setState(state, action) {
  return Object.assign({}, action.state);
}

function setSection(state, action) {
  return utils.assign(state, {section: action.section});
}


function appState(state = initialState, action) {
  switch (action.type) {
    case actions.SET_MAP_STATE:
      return setMapState(state, action);
    case actions.SET_SECTION:
      return setSection(state, action);
    case actions.SET_STATE:
      return setState(state, action);
    default:
      return state
  }
}
module.exports = appState;
},{"../actions/appState":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/appState.js","./utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/utils.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/collections/cimis.js":[function(require,module,exports){
var cimisActions = require('../../actions/collections/cimis');
var utils = require('../utils');

var actions = cimisActions.ACTIONS;

var initialState = {
  dates : {},
  byId : {},
  selected : ''
};

/**
 * Dates
 */
function setDates(state, value) {
  state.dates = utils.assign(state.dates, value);
  return state;
}


/**
 * Data
 */
function setData(state, value) {
  state.byId = Object.assign({}, state.byId, {[value.id]: value});
  return state;
}

function select(state, action) {
  return utils.assign(state, {selected: action.id});
}

function cimis(state = initialState, action) {
  switch (action.type) {
    case actions.LOAD_CIMIS_DATES_REQUEST:
      return setDates(state, {state: 'loading'});
    case actions.LOAD_CIMIS_DATES_SUCCESS:
      return setDates(state, {state: 'loaded', data: action.response.body});
    case actions.LOAD_CIMIS_DATES_FAILURE:
      return setDates(state, {state: 'error', error: action.error});

    case actions.LOAD_CIMIS_REQUEST:
      return setData(state, {state: 'loading', id: action.id});
    case actions.LOAD_CIMIS_SUCCESS:
      return setData(state, {state: 'loaded', data: action.response.body, id: action.id});
    case actions.LOAD_CIMIS_FAILURE:
      return setData(state, {state: 'error', error: action.error, id: action.id});

    case actions.SELECT_CIMIS_GRID_LOCATION:
      return select(state, action);
    default:
      return state
  }
}
module.exports = cimis;
},{"../../actions/collections/cimis":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/cimis.js","../utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/utils.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/collections/dau.js":[function(require,module,exports){
var dauActions = require('../../actions/collections/dau');
var utils = require('../utils');

var actions = dauActions.ACTIONS;

var initialState = {
  geometry : {
    data : null,
    state : 'init'
  },
  byId : {},
  selected : ''
};

/**
 * Geometry
 */
function setGeometry(state, value) {
  state.geometry = utils.assign(state.geometry, value);
  return state;
}

/**
 * Data
 */
function setData(state, value) {
  state.byId = utils.assign(state.byId, {[value.id]: value});
  return state;
}

function selectZone(state, action) {
  if( state.selected === action.id ) return state;
  return utils.assign(state, {selected: action.id});
}

function dau(state = initialState, action) {
  switch (action.type) {
    case actions.SELECT_DAU_ZONE:
      return selectZone(state, action);
    
    case actions.LOAD_DAU_GEOMETRY_REQUEST:
      return setGeometry(state, {state: 'loading'});
    case actions.LOAD_DAU_GEOMETRY_SUCCESS:
      return setGeometry(state, {state: 'loaded', data: action.response.body});
    case actions.LOAD_DAU_GEOMETRY_FAILURE:
      return setGeometry(state, {state: 'error', error: action.error});

    case actions.LOAD_DAU_REQUEST:
      return setData(state, {state: 'loading', id: action.id});
    case actions.LOAD_DAU_SUCCESS:
      return setData(state, {state: 'loaded', data: action.response.body, id: action.id});
    case actions.LOAD_DAU_FAILURE:
      return setData(state, {state: 'error', error: action.error, id: action.id});

    default:
      return state
  }
}
module.exports = dau;
},{"../../actions/collections/dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/dau.js","../utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/utils.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/collections/etoZones.js":[function(require,module,exports){
var etoActions = require('../../actions/collections/etoZones');
var utils = require('../utils');

var actions = etoActions.ACTIONS;

var initialState = {
  geometry : {
    data : null,
    state : 'init'
  },
  byId : {},
  selected : ''
};

/**
 * Geometry
 */
function setGeometry(state, value) {
  state.geometry = utils.assign(state.geometry, value);
  return state;
}

/**
 * Data
 */
function setData(state, value) {
  state.byId = utils.assign(state.byId, {[value.id]: value});
  return state;
}

function selectZone(state, action) {
  if( state.selected === action.id ) return state;
  return utils.assign(state, {selected: action.id});
}

function etoZones(state = initialState, action) {
  switch (action.type) {
    case actions.SELECT_ETO_ZONE:
      return selectZone(state, action);
    
    case actions.LOAD_ETO_GEOMETRY_REQUEST:
      return setGeometry(state, {state: 'loading'});
    case actions.LOAD_ETO_GEOMETRY_SUCCESS:
      return setGeometry(state, {state: 'loaded', data: action.response.body});
    case actions.LOAD_ETO_GEOMETRY_FAILURE:
      return setGeometry(state, {state: 'error', error: action.error});

    case actions.LOAD_ETO_REQUEST:
      return setData(state, {state: 'loading', id: action.id});
    case actions.LOAD_ETO_SUCCESS:
      return setData(state, {state: 'loaded', data: action.response.body, id: action.id});
    case actions.LOAD_ETO_FAILURE:
      return setData(state, {state: 'error', error: action.error, id: action.id});

    default:
      return state
  }
}
module.exports = etoZones;
},{"../../actions/collections/etoZones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/etoZones.js","../utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/utils.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/collections/index.js":[function(require,module,exports){
var combineReducers = require('redux').combineReducers;

module.exports = combineReducers({
  dau : require('./dau'),
  cimis : require('./cimis'),
  etoZones : require('./etoZones')
});
},{"./cimis":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/collections/cimis.js","./dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/collections/dau.js","./etoZones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/collections/etoZones.js","redux":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/config.js":[function(require,module,exports){
var configActions = require('../actions/config');
var utils = require('./utils');

var actions = configActions.ACTIONS;

var initialState = {
  host : ''
};

function setHost(state, action) {
  return utils.assign(state, {host: action.host});
}

function config(state = initialState, action) {
  switch (action.type) {
    case actions.SET_CONFIG_HOST:
      return setHost(state, action);
    default:
      return state
  }
}
module.exports = config;
},{"../actions/config":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/config.js","./utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/utils.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/index.js":[function(require,module,exports){
var combineReducers = require('redux').combineReducers;

module.exports = combineReducers({
  appState : require('./appState'),
  config : require('./config'),
  collections : require('./collections')
});
},{"./appState":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/appState.js","./collections":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/collections/index.js","./config":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/config.js","redux":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/utils.js":[function(require,module,exports){
function assign(state, newState) {
  return Object.assign({}, state, newState);
}

module.exports = {
  assign : assign
}
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js":[function(require,module,exports){
var redux = require('redux');

var store = redux.createStore(
                    require('./reducers'),
                    redux.applyMiddleware(
                      require('./middleware/api')
                      ,require('./middleware/logging')
                    )
                  );

require('./observers')(store);

module.exports = store;
},{"./middleware/api":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/middleware/api.js","./middleware/logging":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/middleware/logging.js","./observers":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/observers/index.js","./reducers":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/index.js","redux":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/behavior.js":[function(require,module,exports){
module.exports = require('polymer-redux')(require('../store'));
},{"../store":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js","polymer-redux":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/polymer-redux/polymer-redux.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-app.js":[function(require,module,exports){
var actions = require('../../actions/appState');

module.exports = {
  actions : actions,
  propertyPaths : {
    appState : 'appState'
  }
}
},{"../../actions/appState":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/appState.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-page-dau.js":[function(require,module,exports){
var actions = require('../../actions/collections/dau');


module.exports = {
  actions : actions,
  behavior : {
    loadGeometry : function() {
      this.dispatch('loadGeometry')
    },
    selectZone : function(id) {
      if( this.selected === id ) return;

      this.debounce('selectZone', function(){
        this.dispatch('selectZone', id);
      }, 0);
    },
    _onDataUpdate : function() {
      if( !this.currentZoneData ) return;
      
      /**
       * TODO: handle error state
       * */
      if( this.currentZoneData.state !== 'loaded' ) {
          return;
      }

      this._onDataLoad();
    }
  },
  propertyPaths : {
    geometry : 'collections.dau.geometry',
    selected : 'collections.dau.selected',
    currentZoneData : function(state) {
      return state.collections.dau.byId[state.collections.dau.selected];
    }
  }
}
},{"../../actions/collections/dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/dau.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-page-eto.js":[function(require,module,exports){
var actions = require('../../actions/collections/etoZones');
var utils = require('../../../eto-zones');

module.exports = {
  actions : actions,
  behavior : {
    getZone : utils.getZone,
    loadGeometry : function() {
      this.dispatch('loadGeometry')
    },
    loadData : function(id) {
      if( !this.active || !id ) return;
      this.dispatch('loadData', id)
    },
    selectZone : function(id) {
      if( this.selected === id ) return;
      this.dispatch('selectZone', id);
    }
  },
  propertyPaths : {
    geometry : 'collections.etoZones.geometry',
    selected : 'collections.etoZones.selected',
    currentZoneData : function(state) {
      return state.collections.etoZones.byId[state.collections.etoZones.selected];
    }
  }
}
},{"../../../eto-zones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eto-zones/index.js","../../actions/collections/etoZones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/etoZones.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-page-map.js":[function(require,module,exports){
var actions = require('../../actions/collections/cimis');
var getZone = require('../../../eto-zones').getZone;
var sortDates = require('../../../utils').sortDates;
var llToGrid = require('../../../cimis-grid').llToGrid;

module.exports = {
  actions : actions,
  behavior : {
    llToGrid : llToGrid,
    getZone : getZone,
    sortDates : sortDates,
    _selectGridId : function(id) {
      this.dispatch('select', id);
    },
    _loadDates : function() {
      this.dispatch('loadDates');
    },
    _loadGridData : function(id) {
      if( !this.active || !id ) return;
      this.dispatch('loadData', id);
    }
  },
  propertyPaths : {
    mapState : 'appState.mapState',
    dates : 'collections.cimis.dates',
    dauGeometry : 'collections.dau.geometry',
    etoGeometry : 'collections.etoZones.geometry',
    selectedCimisGrid : 'collections.cimis.selected',
    selectedCimisGridData : function(state) {
      return state.collections.cimis.byId[state.collections.cimis.selected];
    }
  }
}
},{"../../../cimis-grid":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/cimis-grid/index.js","../../../eto-zones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eto-zones/index.js","../../../utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/utils/index.js","../../actions/collections/cimis":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/cimis.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/index.js":[function(require,module,exports){
module.exports = {
  'dwr-page-dau' : require('./dwr-page-dau'),
  'dwr-page-map' : require('./dwr-page-map'),
  'dwr-page-eto' : require('./dwr-page-eto'),
  'dwr-app' : require('./dwr-app')
}
},{"./dwr-app":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-app.js","./dwr-page-dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-page-dau.js","./dwr-page-eto":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-page-eto.js","./dwr-page-map":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-page-map.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/index.js":[function(require,module,exports){
module.exports = {
  bindings : require('./bindings'),
  behavior : require('./behavior')
}
},{"./behavior":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/behavior.js","./bindings":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/utils.js":[function(require,module,exports){
var store = require('./store');

function dispatch() {
  var args = [].slice.call(arguments);
  var fn = args.splice(0, 1)[0];
  require('./store').dispatch(fn.apply(this, args));
}

module.exports = {
  dispatch : dispatch
}
},{"./store":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/cimis.js":[function(require,module,exports){
var request = require('superagent');
var actions = require('../redux/actions/collections/cimis');
var dispatch = require('../redux/utils').dispatch;
var store = require('../redux/store');
var getHost = require('./utils').getHost;

function loadDates(callback) {
  request
    .get(`${getHost()}/cimis/dates`)
    .end(callback);
}

function loadData(cimisGridId, callback) {
  var urlId = cimisGridId.replace(/-/, '/');

  request
    .get(`${getHost()}/cimis/${urlId}`)
    .end(callback);
}


module.exports = {
  loadDates : loadDates,
  loadData : loadData
}
},{"../redux/actions/collections/cimis":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/cimis.js","../redux/store":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js","../redux/utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/utils.js","./utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/utils.js","superagent":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/client.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/dau.js":[function(require,module,exports){
var request = require('superagent');
var getHost = require('./utils').getHost;

function loadGeometry(callback) {
  request
    .get(`${getHost()}/dauco.json`)
    .end(callback);
}

function loadData(dauZoneId, callback) {
  request
    .get(`${getHost()}/cimis/region/DAU${dauZoneId}`)
    .end(callback);
}

module.exports = {
  loadGeometry : loadGeometry,
  loadData : loadData
}
},{"./utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/utils.js","superagent":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/client.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/etoZones.js":[function(require,module,exports){
var request = require('superagent');
var etoZoneUtils = require('../eto-zones');
var getHost = require('./utils').getHost;


function loadGeometry(callback) {
  request
    .get(`${getHost()}/eto_zones.json`)
    .end(function(err, resp){
      if( err ) return callback(err);

      // merge in zone styles
      etoZoneUtils.mergeZoneMap(resp.body);
      
      callback(null, resp);
    });
}

function loadData(etoZoneId, callback) {
  request
    .get(`${getHost()}/cimis/region/Z${etoZoneId}`)
    .end(callback);
}

module.exports = {
  loadGeometry : loadGeometry,
  loadData : loadData
}
},{"../eto-zones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eto-zones/index.js","./utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/utils.js","superagent":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/client.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/index.js":[function(require,module,exports){
module.exports = {
  dau : require('./dau')
}
},{"./dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/dau.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/utils.js":[function(require,module,exports){
var store = require('../redux/store');

function getHost() {
  // HACK for cyclical dependency
  return require('../redux/store').getState().config.host;
}

module.exports = {
  getHost : getHost
}
},{"../redux/store":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/utils/index.js":[function(require,module,exports){
'use strict';

function sortDates(data) {
  var arr = [];

  if( Array.isArray(data) ) {
    for( var i = 0; i < data.length; i++ ) {
      arr.push({
        str : data[i],
        time : toDate(data[i]).getTime()
      });
    }
  } else {
    for( var date in data ) {
      arr.push({
        str : date,
        time : toDate(date).getTime()
      });
    }
  }

  arr.sort(function(a, b){
    if( a.time > b.time ) {
      return 1;
    } else if( a.time < b.time ) {
      return -1;
    }
    return 0;
  });

  var tmp = [];
  arr.forEach(function(item){
    tmp.push(item.str);
  });

  return tmp;
}

function toDate(str) {
  var parts = str.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
}

module.exports = {
  sortDates : sortDates
};

},{}]},{},["/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/index.js"])("/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/index.js")
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19TeW1ib2wuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlR2V0VGFnLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fZnJlZUdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFByb3RvdHlwZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX29iamVjdFRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fb3ZlckFyZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX3Jvb3QuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0TGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNQbGFpbk9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9wb2x5bWVyLXJlZHV4L3BvbHltZXItcmVkdXguanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL1BvaW50LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9Qcm9qLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9hZGp1c3RfYXhpcy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2FkanVzdF9sYXQuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9hZGp1c3RfbG9uLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vYXNpbnouanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9lMGZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vZTFmbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2UyZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9lM2ZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vZ04uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9pbWxmbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2lxc2Zuei5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL21sZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9tc2Zuei5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL3BoaTJ6LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vcGpfZW5mbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL3BqX2ludl9tbGZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vcGpfbWxmbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL3FzZm56LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL3NyYXQuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi90b1BvaW50LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vdHNmbnouanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbnN0YW50cy9EYXR1bS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29uc3RhbnRzL0VsbGlwc29pZC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29uc3RhbnRzL1ByaW1lTWVyaWRpYW4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbnN0YW50cy91bml0cy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvZGF0dW0uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2RhdHVtX3RyYW5zZm9ybS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvZGVmcy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvZGVyaXZlQ29uc3RhbnRzLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9leHRlbmQuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2dsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvaW5jbHVkZWRQcm9qZWN0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3BhcnNlQ29kZS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvalN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2FlYS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvYWVxZC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvY2Fzcy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvY2VhLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9lcWMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2VxZGMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2dhdXNzLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9nbm9tLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9rcm92YWsuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2xhZWEuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2xjYy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvbG9uZ2xhdC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvbWVyYy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvbWlsbC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvbW9sbC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvbnptZy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvb21lcmMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL3BvbHkuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL3NpbnUuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL3NvbWVyYy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvc3RlcmUuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL3N0ZXJlYS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvdG1lcmMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL3V0bS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvdmFuZGcuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3RyYW5zZm9ybS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvd2t0LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L25vZGVfbW9kdWxlcy9tZ3JzL21ncnMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvcGFja2FnZS5qc29uIiwibm9kZV9tb2R1bGVzL3JlZHV4LW9ic2VydmVycy9saWIvY29uc3RhbnRzLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4LW9ic2VydmVycy9saWIvaGVscGVycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC1vYnNlcnZlcnMvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9hcHBseU1pZGRsZXdhcmUuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2JpbmRBY3Rpb25DcmVhdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY29tYmluZVJlZHVjZXJzLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9jb21wb3NlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9jcmVhdGVTdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL3V0aWxzL3dhcm5pbmcuanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvY2xpZW50LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2lzLWZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2lzLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L2xpYi9yZXF1ZXN0LWJhc2UuanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvcmVzcG9uc2UtYmFzZS5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L2xpYi91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9zeW1ib2wtb2JzZXJ2YWJsZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zeW1ib2wtb2JzZXJ2YWJsZS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3ltYm9sLW9ic2VydmFibGUvbGliL3BvbnlmaWxsLmpzIiwicHVibGljL2pzL2xpYi9jaW1pcy1ncmlkL2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9jb250cm9sbGVycy9hcHBTdGF0ZS9ldmVudHMuanMiLCJwdWJsaWMvanMvbGliL2NvbnRyb2xsZXJzL2FwcFN0YXRlL2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9jb250cm9sbGVycy9jaW1pcy9ldmVudHMuanMiLCJwdWJsaWMvanMvbGliL2NvbnRyb2xsZXJzL2NpbWlzL2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9jb250cm9sbGVycy9kYXUvZXZlbnRzLmpzIiwicHVibGljL2pzL2xpYi9jb250cm9sbGVycy9kYXUvaW5kZXguanMiLCJwdWJsaWMvanMvbGliL2NvbnRyb2xsZXJzL2V0b1pvbmVzL2V2ZW50cy5qcyIsInB1YmxpYy9qcy9saWIvY29udHJvbGxlcnMvZXRvWm9uZXMvaW5kZXguanMiLCJwdWJsaWMvanMvbGliL2NvbnRyb2xsZXJzL2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9kZWZpbml0aW9ucy5qc29uIiwicHVibGljL2pzL2xpYi9ldG8tem9uZXMvaW5kZXguanMiLCJwdWJsaWMvanMvbGliL2V0by16b25lcy9zdHlsZS5qcyIsInB1YmxpYy9qcy9saWIvZXZlbnRCdXMuanMiLCJwdWJsaWMvanMvbGliL2ZmdC5qcyIsInB1YmxpYy9qcy9saWIvaW5kZXguanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L2FjdGlvbnMvYXBwU3RhdGUuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L2FjdGlvbnMvY29sbGVjdGlvbnMvY2ltaXMuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L2FjdGlvbnMvY29sbGVjdGlvbnMvZGF1LmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9hY3Rpb25zL2NvbGxlY3Rpb25zL2V0b1pvbmVzLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9hY3Rpb25zL2NvbGxlY3Rpb25zL2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9hY3Rpb25zL2NvbmZpZy5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvYWN0aW9ucy9pbmRleC5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvaW5kZXguanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L21pZGRsZXdhcmUvYXBpLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9taWRkbGV3YXJlL2xvZ2dpbmcuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L29ic2VydmVycy9hcHBTdGF0ZS5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvb2JzZXJ2ZXJzL2NpbWlzLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9vYnNlcnZlcnMvZXRvWm9uZXMuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L29ic2VydmVycy9pbmRleC5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvcmVkdWNlcnMvYXBwU3RhdGUuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L3JlZHVjZXJzL2NvbGxlY3Rpb25zL2NpbWlzLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9yZWR1Y2Vycy9jb2xsZWN0aW9ucy9kYXUuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L3JlZHVjZXJzL2NvbGxlY3Rpb25zL2V0b1pvbmVzLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9yZWR1Y2Vycy9jb2xsZWN0aW9ucy9pbmRleC5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvcmVkdWNlcnMvY29uZmlnLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9yZWR1Y2Vycy9pbmRleC5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvcmVkdWNlcnMvdXRpbHMuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L3N0b3JlLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC91aS9iZWhhdmlvci5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvdWkvYmluZGluZ3MvZHdyLWFwcC5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvdWkvYmluZGluZ3MvZHdyLXBhZ2UtZGF1LmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC91aS9iaW5kaW5ncy9kd3ItcGFnZS1ldG8uanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L3VpL2JpbmRpbmdzL2R3ci1wYWdlLW1hcC5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvdWkvYmluZGluZ3MvaW5kZXguanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L3VpL2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC91dGlscy5qcyIsInB1YmxpYy9qcy9saWIvc2VydmljZXMvY2ltaXMuanMiLCJwdWJsaWMvanMvbGliL3NlcnZpY2VzL2RhdS5qcyIsInB1YmxpYy9qcy9saWIvc2VydmljZXMvZXRvWm9uZXMuanMiLCJwdWJsaWMvanMvbGliL3NlcnZpY2VzL2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9zZXJ2aWNlcy91dGlscy5qcyIsInB1YmxpYy9qcy9saWIvdXRpbHMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdHVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzc0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7OztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcclxuLyoqXHJcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXHJcbiAqL1xyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xyXG59XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXHJcbiAqXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcclxuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAqIEByZXR1cm4ge09iamVjdH1cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XHJcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XHJcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XHJcbiAgfVxyXG4gIHJldHVybiBvYmo7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cclxuICogQHJldHVybiB7RW1pdHRlcn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XHJcbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xyXG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcclxuICAodGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW10pXHJcbiAgICAucHVzaChmbik7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXHJcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxyXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xyXG4gIGZ1bmN0aW9uIG9uKCkge1xyXG4gICAgdGhpcy5vZmYoZXZlbnQsIG9uKTtcclxuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG5cclxuICBvbi5mbiA9IGZuO1xyXG4gIHRoaXMub24oZXZlbnQsIG9uKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxyXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXHJcbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cclxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxyXG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxyXG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcclxuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XHJcblxyXG4gIC8vIGFsbFxyXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcclxuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyBzcGVjaWZpYyBldmVudFxyXG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xyXG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcclxuXHJcbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xyXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcclxuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxyXG4gIHZhciBjYjtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY2IgPSBjYWxsYmFja3NbaV07XHJcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xyXG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcGFyYW0ge01peGVkfSAuLi5cclxuICogQHJldHVybiB7RW1pdHRlcn1cclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xyXG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcclxuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxyXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xyXG5cclxuICBpZiAoY2FsbGJhY2tzKSB7XHJcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcmV0dXJuIHtBcnJheX1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XHJcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xyXG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xyXG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xyXG59O1xyXG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgZ2V0UmF3VGFnID0gcmVxdWlyZSgnLi9fZ2V0UmF3VGFnJyksXG4gICAgb2JqZWN0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19vYmplY3RUb1N0cmluZycpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHJldHVybiAoc3ltVG9TdHJpbmdUYWcgJiYgc3ltVG9TdHJpbmdUYWcgaW4gT2JqZWN0KHZhbHVlKSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0VGFnO1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuIiwidmFyIG92ZXJBcmcgPSByZXF1aXJlKCcuL19vdmVyQXJnJyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIGdldFByb3RvdHlwZSA9IG92ZXJBcmcoT2JqZWN0LmdldFByb3RvdHlwZU9mLCBPYmplY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFByb3RvdHlwZTtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFRvU3RyaW5nO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlckFyZztcbiIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vdDtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHwgYmFzZUdldFRhZyh2YWx1ZSkgIT0gb2JqZWN0VGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmXG4gICAgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1BsYWluT2JqZWN0O1xuIiwiKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3RbJ1BvbHltZXJSZWR1eCddID0gZmFjdG9yeSgpO1xuICAgIH1cbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xuICAgIHZhciB3YXJuaW5nID0gJ1BvbHltZXIgUmVkdXg6IDwlcz4uJXMgaGFzIFwibm90aWZ5XCIgZW5hYmxlZCwgdHdvLXdheSBiaW5kaW5ncyBnb2VzIGFnYWluc3QgUmVkdXhcXCdzIHBhcmFkaWdtJztcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgcHJvcGVydHkgYmluZGluZ3MgZm91bmQgb24gYSBnaXZlbiBFbGVtZW50L0JlaGF2aW9yLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fE9iamVjdH0gb2JqIEVsZW1lbnQgb3IgQmVoYXZpb3IuXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBQb2x5bWVyIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHN0b3JlIFJlZHV4IHN0b3JlLlxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFN0YXRlUGF0aFByb3BlcnRpZXMob2JqLCBlbGVtZW50LCBzdG9yZSkge1xuICAgICAgICB2YXIgcHJvcHMgPSBbXTtcblxuICAgICAgICBpZiAob2JqLnByb3BlcnRpZXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMob2JqLnByb3BlcnRpZXMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gb2JqLnByb3BlcnRpZXNbbmFtZV07XG4gICAgICAgICAgICAgICAgaWYgKHByb3AuaGFzT3duUHJvcGVydHkoJ3N0YXRlUGF0aCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGlmeSBmbGFnLCB3YXJuIGFnYWluc3QgdHdvLXdheSBiaW5kaW5nc1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcC5ub3RpZnkgJiYgIXByb3AucmVhZE9ubHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybih3YXJuaW5nLCBlbGVtZW50LmlzLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFbXB0eSBzdGF0ZVBhdGggcmV0dXJuIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBwcm9wLnN0YXRlUGF0aCB8fCBzdG9yZS5nZXRTdGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRPbmx5OiBwcm9wLnJlYWRPbmx5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogcHJvcC50eXBlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZhY3RvcnkgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGEgbGlzdGVuZXIgZm9yIGEgZ2l2ZSBQb2x5bWVyIGVsZW1lbnQuIFRoZVxuICAgICAqIHJldHVybmluZyBsaXN0ZW5lciBzaG91bGQgYmUgcGFzc2VkIHRvIGBzdG9yZS5zdWJzY3JpYmVgLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFBvbHltZXIgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn0gUmVkdXggc3ViY3JpYmUgbGlzdGVuZXIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlTGlzdGVuZXIoZWxlbWVudCwgc3RvcmUpIHtcbiAgICAgICAgdmFyIHByb3BzID0gZ2V0U3RhdGVQYXRoUHJvcGVydGllcyhlbGVtZW50LCBlbGVtZW50LCBzdG9yZSk7XG5cbiAgICAgICAgLy8gYmVoYXZpb3IgcHJvcGVydHkgYmluZGluZ3NcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZWxlbWVudC5iZWhhdmlvcnMpKSB7XG4gICAgICAgICAgICBlbGVtZW50LmJlaGF2aW9ycy5mb3JFYWNoKGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV4dHJhcyA9IGdldFN0YXRlUGF0aFByb3BlcnRpZXMoYmVoYXZpb3IsIGVsZW1lbnQsIHN0b3JlKTtcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShwcm9wcywgZXh0cmFzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZGUtZHVwZSBiZWhhdmlvciBwcm9wc1xuICAgICAgICAgICAgdmFyIG5hbWVzID0gcHJvcHMubWFwKGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcC5uYW1lOyAvLyBncmFiIHRoZSBwcm9wIG5hbWVzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHByb3BzID0gcHJvcHMuZmlsdGVyKGZ1bmN0aW9uKHByb3AsIGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmFtZXMuaW5kZXhPZihwcm9wLm5hbWUpID09PSBpOyAvLyBpbmRpY2VzIG11c3QgbWF0Y2hcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVkdXggbGlzdGVuZXJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKTtcbiAgICAgICAgICAgIHByb3BzLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvcE5hbWUgPSBwcm9wZXJ0eS5uYW1lO1xuICAgICAgICAgICAgICAgIHZhciBzcGxpY2VzID0gW107XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlLCBwcmV2aW91cztcblxuICAgICAgICAgICAgICAgIC8vIHN0YXRlUGF0aCwgYSBwYXRoIG9yIGZ1bmN0aW9uLlxuICAgICAgICAgICAgICAgIHZhciBwYXRoID0gcHJvcGVydHkucGF0aDtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhdGggPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHBhdGguY2FsbChlbGVtZW50LCBzdGF0ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBQb2x5bWVyLkJhc2UuZ2V0KHBhdGgsIHN0YXRlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBwcmV2ZW50IHVubmVjZXNhcnkgcG9seW1lciBub3RpZmljYXRpb25zXG4gICAgICAgICAgICAgICAgcHJldmlvdXMgPSBlbGVtZW50LmdldChwcm9wZXJ0eS5uYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHByZXZpb3VzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyB0eXBlIG9mIGFycmF5LCB3b3JrIG91dCBzcGxpY2VzIGJlZm9yZSBzZXR0aW5nIHRoZSB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS50eXBlID09PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlIHx8IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIFtdO1xuICAgICAgICAgICAgICAgICAgICBwcmV2aW91cyA9IHByZXZpb3VzIHx8IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRoZSB2YWx1ZSB0eXBlXG4gICAgICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwnKyBlbGVtZW50LmlzICsnPi4nKyBwcm9wTmFtZSArJyB0eXBlIGlzIEFycmF5IGJ1dCBnaXZlbjogJyArICh0eXBlb2YgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc3BsaWNlcyA9IFBvbHltZXIuQXJyYXlTcGxpY2UuY2FsY3VsYXRlU3BsaWNlcyh2YWx1ZSwgcHJldmlvdXMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHNldFxuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5yZWFkT25seSkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm5vdGlmeVBhdGgocHJvcE5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNldChwcm9wTmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIG5vdGlmeSBlbGVtZW50IG9mIHNwbGljZXNcbiAgICAgICAgICAgICAgICBpZiAoc3BsaWNlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5ub3RpZnlTcGxpY2VzKHByb3BOYW1lLCBzcGxpY2VzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsZW1lbnQuZmlyZSgnc3RhdGUtY2hhbmdlZCcsIHN0YXRlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmRzIGFuIGdpdmVuIFBvbHltZXIgZWxlbWVudCB0byBhIFJlZHV4IHN0b3JlLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFBvbHltZXIgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RvcmUgUmVkdXggc3RvcmUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmluZFJlZHV4TGlzdGVuZXIoZWxlbWVudCwgc3RvcmUpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyO1xuXG4gICAgICAgIGlmIChlbGVtZW50Ll9yZWR1eFVuc3Vic2NyaWJlKSByZXR1cm47XG5cbiAgICAgICAgbGlzdGVuZXIgPSBjcmVhdGVMaXN0ZW5lcihlbGVtZW50LCBzdG9yZSk7XG4gICAgICAgIGxpc3RlbmVyKCk7IC8vIHN0YXJ0IGJpbmRpbmdzXG5cbiAgICAgICAgZWxlbWVudC5fcmVkdXhVbnN1YnNjcmliZSA9IHN0b3JlLnN1YnNjcmliZShsaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kcyBhIFBvbHltZXIgZWxlbWVudCBmcm9tIGEgUmVkdXggc3RvcmUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmJpbmRSZWR1eExpc3RlbmVyKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50Ll9yZWR1eFVuc3Vic2NyaWJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBlbGVtZW50Ll9yZWR1eFVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICBkZWxldGUgZWxlbWVudC5fcmVkdXhVbnN1YnNjcmliZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJ1aWxkcyBsaXN0IG9mIGFjdGlvbiBjcmVhdG9ycyBmcm9tIGEgZ2l2ZW4gZWxlbWVudCBhbmQgaXQncyBpbmhlcml0ZWRcbiAgICAgKiBiZWhhdmlvcnMgc2V0dGluZyB0aGUgbGlzdCBvbnRvIHRoZSBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFBvbHltZXIgZWxlbWVudCBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb21waWxlQWN0aW9uQ3JlYXRvcnMoZWxlbWVudCkge1xuICAgICAgICB2YXIgYWN0aW9ucyA9IHt9O1xuICAgICAgICB2YXIgYmVoYXZpb3JzID0gZWxlbWVudC5iZWhhdmlvcnM7XG5cbiAgICAgICAgaWYgKGVsZW1lbnQuX3JlZHV4QWN0aW9ucykgcmV0dXJuO1xuXG4gICAgICAgIC8vIGFkZCBiZWhhdmlvciBhY3Rpb25zIGZpcnN0LCBpbiByZXZlcnNlIG9yZGVyIHNvIHdlIGtlZXAgcHJpb3JpdHlcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYmVoYXZpb3JzKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGJlaGF2aW9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oYWN0aW9ucywgYmVoYXZpb3JzW2ldLmFjdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZWxlbWVudCBhY3Rpb25zIGhhdmUgcHJpb3JpdHlcbiAgICAgICAgZWxlbWVudC5fcmVkdXhBY3Rpb25zID0gT2JqZWN0LmFzc2lnbihhY3Rpb25zLCBlbGVtZW50LmFjdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BhdGNoZXMgYSBSZWR1eCBhY3Rpb24gdmlhIGEgUG9seW1lciBlbGVtZW50LiBUaGlzIGdpdmVzIHRoZSBlbGVtZW50XG4gICAgICogYSBwb2x5bW9ycGhpYyBkaXNwYXRjaCBmdW5jdGlvbi4gU2VlIHRoZSByZWFkbWUgZm9yIHRoZSB2YXJpb3VzIHdheXMgdG9cbiAgICAgKiBkaXNwYXRjaC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBQb2x5bWVyIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHN0b3JlIFJlZHV4IHN0b3JlLlxuICAgICAqIEBwYXJhbSB7QXJndW1lbnRzfSBhcmdzIFRoZSBhcmd1bWVudHMgcGFzc2VkIHRvIGBlbGVtZW50LmRpc3BhdGNoYC5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBjb21wdXRlZCBSZWR1eCBhY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gZGlzcGF0Y2hSZWR1eEFjdGlvbihlbGVtZW50LCBzdG9yZSwgYXJncykge1xuICAgICAgICB2YXIgYWN0aW9uID0gYXJnc1swXTtcbiAgICAgICAgdmFyIGFjdGlvbnMgPSBlbGVtZW50Ll9yZWR1eEFjdGlvbnM7XG5cbiAgICAgICAgYXJncyA9IGNhc3RBcmd1bWVudHNUb0FycmF5KGFyZ3MpO1xuXG4gICAgICAgIC8vIGFjdGlvbiBuYW1lXG4gICAgICAgIGlmIChhY3Rpb25zICYmIHR5cGVvZiBhY3Rpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGFjdGlvbnNbYWN0aW9uXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1BvbHltZXIgUmVkdXg6IDwnICsgZWxlbWVudC5pcyArICc+IGhhcyBubyBhY3Rpb24gXCInICsgYWN0aW9uICsgJ1wiJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhY3Rpb24gPSBhY3Rpb25zW2FjdGlvbl0uYXBwbHkoZWxlbWVudCwgYXJncy5zbGljZSgxKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAhISEgREVQUkVDSUFURUQgISEhXG4gICAgICAgIC8vIFRoaXMgd2lsbCBiZSByZW1vdmVkIGFzIG9mIDEuMC5cblxuICAgICAgICAvLyBhY3Rpb24gY3JlYXRvclxuICAgICAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gJ2Z1bmN0aW9uJyAmJiBhY3Rpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RvcmUuZGlzcGF0Y2goYWN0aW9uKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gLS0tXG5cbiAgICAgICAgLy8gbWlkZGxld2FyZSwgbWFrZSBzdXJlIHdlIHBhc3MgdGhlIHBvbHltZXItcmVkdXggZGlzcGF0Y2hcbiAgICAgICAgLy8gc28gd2UgaGF2ZSBhY2Nlc3MgdG8gdGhlIGVsZW1lbnRzIGFjdGlvbiBjcmVhdG9yc1xuICAgICAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIHN0b3JlLmRpc3BhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBhcmd2ID0gY2FzdEFyZ3VtZW50c1RvQXJyYXkoYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAvLyByZXBsYWNlIHJlZHV4IGRpc3BhdGNoXG4gICAgICAgICAgICAgICAgYXJndi5zcGxpY2UoMCwgMSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXNwYXRjaFJlZHV4QWN0aW9uKGVsZW1lbnQsIHN0b3JlLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBhY3Rpb24uYXBwbHkoZWxlbWVudCwgYXJndik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFjdGlvblxuICAgICAgICByZXR1cm4gc3RvcmUuZGlzcGF0Y2goYWN0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUdXJucyBhcmd1bWVudHMgaW50byBhbiBBcnJheS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QXJndW1lbnRzfSBhcmdzXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgZnVuY3Rpb24gY2FzdEFyZ3VtZW50c1RvQXJyYXkoYXJncykge1xuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncywgMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBQb2x5bWVyUmVkdXggYmVoYXZpb3JzIGZyb20gYSBnaXZlbiBSZWR1eCBzdG9yZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdG9yZSBSZWR1eCBzdG9yZS5cbiAgICAgKiBAcmV0dXJuIHtQb2x5bWVyUmVkdXh9XG4gICAgICovXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0b3JlKSB7XG4gICAgICAgIHZhciBQb2x5bWVyUmVkdXg7XG5cbiAgICAgICAgLy8gY2hlY2sgZm9yIHN0b3JlXG4gICAgICAgIGlmICghc3RvcmUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ21pc3NpbmcgcmVkdXggc3RvcmUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBgUG9seW1lclJlZHV4YCBiaW5kcyBhIGdpdmVuIFJlZHV4IHN0b3JlJ3Mgc3RhdGUgdG8gaW1wbGVtZW50aW5nIEVsZW1lbnRzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBGdWxsIGRvY3VtZW50YXRpb24gYXZhaWxhYmxlLCBodHRwczovL2dpdGh1Yi5jb20vdHVyLW5yL3BvbHltZXItcmVkdXguXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwb2x5bWVyQmVoYXZpb3IgUG9seW1lclJlZHV4XG4gICAgICAgICAqIEBkZW1vIGRlbW8vaW5kZXguaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIFBvbHltZXJSZWR1eCA9IHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRmlyZWQgd2hlbiB0aGUgUmVkdXggc3RvcmUgc3RhdGUgY2hhbmdlcy5cbiAgICAgICAgICAgICAqIEBldmVudCBzdGF0ZS1jaGFuZ2VkXG4gICAgICAgICAgICAgKiBAcGFyYW0geyp9IHN0YXRlXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGJpbmRSZWR1eExpc3RlbmVyKHRoaXMsIHN0b3JlKTtcbiAgICAgICAgICAgICAgICBjb21waWxlQWN0aW9uQ3JlYXRvcnModGhpcyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYmluZFJlZHV4TGlzdGVuZXIodGhpcywgc3RvcmUpO1xuICAgICAgICAgICAgICAgIGNvbXBpbGVBY3Rpb25DcmVhdG9ycyh0aGlzKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGRldGFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB1bmJpbmRSZWR1eExpc3RlbmVyKHRoaXMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEaXNwYXRjaGVzIGFuIGFjdGlvbiB0byB0aGUgUmVkdXggc3RvcmUuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fEZ1bmN0aW9ufSBhY3Rpb25cbiAgICAgICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGFjdGlvbiB0aGF0IHdhcyBkaXNwYXRjaGVkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBkaXNwYXRjaDogZnVuY3Rpb24oYWN0aW9uIC8qLCBbLi4uYXJnc10gKi8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlzcGF0Y2hSZWR1eEFjdGlvbih0aGlzLCBzdG9yZSwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR2V0cyB0aGUgY3VycmVudCBzdGF0ZSBpbiB0aGUgUmVkdXggc3RvcmUuXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHsqfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBnZXRTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0b3JlLmdldFN0YXRlKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH07XG59KTtcbiIsInZhciBtZ3JzID0gcmVxdWlyZSgnbWdycycpO1xuXG5mdW5jdGlvbiBQb2ludCh4LCB5LCB6KSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQb2ludCkpIHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHgsIHksIHopO1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHgpKSB7XG4gICAgdGhpcy54ID0geFswXTtcbiAgICB0aGlzLnkgPSB4WzFdO1xuICAgIHRoaXMueiA9IHhbMl0gfHwgMC4wO1xuICB9ZWxzZSBpZih0eXBlb2YgeCA9PT0gJ29iamVjdCcpe1xuICAgIHRoaXMueCA9IHgueDtcbiAgICB0aGlzLnkgPSB4Lnk7XG4gICAgdGhpcy56ID0geC56IHx8IDAuMDtcbiAgfSBlbHNlIGlmICh0eXBlb2YgeCA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIGNvb3JkcyA9IHguc3BsaXQoJywnKTtcbiAgICB0aGlzLnggPSBwYXJzZUZsb2F0KGNvb3Jkc1swXSwgMTApO1xuICAgIHRoaXMueSA9IHBhcnNlRmxvYXQoY29vcmRzWzFdLCAxMCk7XG4gICAgdGhpcy56ID0gcGFyc2VGbG9hdChjb29yZHNbMl0sIDEwKSB8fCAwLjA7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMueiA9IHogfHwgMC4wO1xuICB9XG4gIGNvbnNvbGUud2FybigncHJvajQuUG9pbnQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMywgdXNlIHByb2o0LnRvUG9pbnQnKTtcbn1cblxuUG9pbnQuZnJvbU1HUlMgPSBmdW5jdGlvbihtZ3JzU3RyKSB7XG4gIHJldHVybiBuZXcgUG9pbnQobWdycy50b1BvaW50KG1ncnNTdHIpKTtcbn07XG5Qb2ludC5wcm90b3R5cGUudG9NR1JTID0gZnVuY3Rpb24oYWNjdXJhY3kpIHtcbiAgcmV0dXJuIG1ncnMuZm9yd2FyZChbdGhpcy54LCB0aGlzLnldLCBhY2N1cmFjeSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBQb2ludDsiLCJ2YXIgcGFyc2VDb2RlID0gcmVxdWlyZShcIi4vcGFyc2VDb2RlXCIpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJy4vZXh0ZW5kJyk7XG52YXIgcHJvamVjdGlvbnMgPSByZXF1aXJlKCcuL3Byb2plY3Rpb25zJyk7XG52YXIgZGVyaXZlQ29uc3RhbnRzID0gcmVxdWlyZSgnLi9kZXJpdmVDb25zdGFudHMnKTtcblxuZnVuY3Rpb24gUHJvamVjdGlvbihzcnNDb2RlLGNhbGxiYWNrKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9qZWN0aW9uKSkge1xuICAgIHJldHVybiBuZXcgUHJvamVjdGlvbihzcnNDb2RlKTtcbiAgfVxuICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKGVycm9yKXtcbiAgICBpZihlcnJvcil7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH07XG4gIHZhciBqc29uID0gcGFyc2VDb2RlKHNyc0NvZGUpO1xuICBpZih0eXBlb2YganNvbiAhPT0gJ29iamVjdCcpe1xuICAgIGNhbGxiYWNrKHNyc0NvZGUpO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbW9kaWZpZWRKU09OID0gZGVyaXZlQ29uc3RhbnRzKGpzb24pO1xuICB2YXIgb3VyUHJvaiA9IFByb2plY3Rpb24ucHJvamVjdGlvbnMuZ2V0KG1vZGlmaWVkSlNPTi5wcm9qTmFtZSk7XG4gIGlmKG91clByb2ope1xuICAgIGV4dGVuZCh0aGlzLCBtb2RpZmllZEpTT04pO1xuICAgIGV4dGVuZCh0aGlzLCBvdXJQcm9qKTtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBjYWxsYmFjayhudWxsLCB0aGlzKTtcbiAgfWVsc2V7XG4gICAgY2FsbGJhY2soc3JzQ29kZSk7XG4gIH1cbn1cblByb2plY3Rpb24ucHJvamVjdGlvbnMgPSBwcm9qZWN0aW9ucztcblByb2plY3Rpb24ucHJvamVjdGlvbnMuc3RhcnQoKTtcbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdGlvbjtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3JzLCBkZW5vcm0sIHBvaW50KSB7XG4gIHZhciB4aW4gPSBwb2ludC54LFxuICAgIHlpbiA9IHBvaW50LnksXG4gICAgemluID0gcG9pbnQueiB8fCAwLjA7XG4gIHZhciB2LCB0LCBpO1xuICBmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgaWYgKGRlbm9ybSAmJiBpID09PSAyICYmIHBvaW50LnogPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChpID09PSAwKSB7XG4gICAgICB2ID0geGluO1xuICAgICAgdCA9ICd4JztcbiAgICB9XG4gICAgZWxzZSBpZiAoaSA9PT0gMSkge1xuICAgICAgdiA9IHlpbjtcbiAgICAgIHQgPSAneSc7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdiA9IHppbjtcbiAgICAgIHQgPSAneic7XG4gICAgfVxuICAgIHN3aXRjaCAoY3JzLmF4aXNbaV0pIHtcbiAgICBjYXNlICdlJzpcbiAgICAgIHBvaW50W3RdID0gdjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3cnOlxuICAgICAgcG9pbnRbdF0gPSAtdjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ24nOlxuICAgICAgcG9pbnRbdF0gPSB2O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncyc6XG4gICAgICBwb2ludFt0XSA9IC12O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndSc6XG4gICAgICBpZiAocG9pbnRbdF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwb2ludC56ID0gdjtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2QnOlxuICAgICAgaWYgKHBvaW50W3RdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcG9pbnQueiA9IC12O1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vY29uc29sZS5sb2coXCJFUlJPUjogdW5rbm93IGF4aXMgKFwiK2Nycy5heGlzW2ldK1wiKSAtIGNoZWNrIGRlZmluaXRpb24gb2YgXCIrY3JzLnByb2pOYW1lKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcG9pbnQ7XG59O1xuIiwidmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgc2lnbiA9IHJlcXVpcmUoJy4vc2lnbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIChNYXRoLmFicyh4KSA8IEhBTEZfUEkpID8geCA6ICh4IC0gKHNpZ24oeCkgKiBNYXRoLlBJKSk7XG59OyIsInZhciBUV09fUEkgPSBNYXRoLlBJICogMjtcbi8vIFNQSSBpcyBzbGlnaHRseSBncmVhdGVyIHRoYW4gTWF0aC5QSSwgc28gdmFsdWVzIHRoYXQgZXhjZWVkIHRoZSAtMTgwLi4xODBcbi8vIGRlZ3JlZSByYW5nZSBieSBhIHRpbnkgYW1vdW50IGRvbid0IGdldCB3cmFwcGVkLiBUaGlzIHByZXZlbnRzIHBvaW50cyB0aGF0XG4vLyBoYXZlIGRyaWZ0ZWQgZnJvbSB0aGVpciBvcmlnaW5hbCBsb2NhdGlvbiBhbG9uZyB0aGUgMTgwdGggbWVyaWRpYW4gKGR1ZSB0b1xuLy8gZmxvYXRpbmcgcG9pbnQgZXJyb3IpIGZyb20gY2hhbmdpbmcgdGhlaXIgc2lnbi5cbnZhciBTUEkgPSAzLjE0MTU5MjY1MzU5O1xudmFyIHNpZ24gPSByZXF1aXJlKCcuL3NpZ24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoTWF0aC5hYnMoeCkgPD0gU1BJKSA/IHggOiAoeCAtIChzaWduKHgpICogVFdPX1BJKSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oeCkge1xuICBpZiAoTWF0aC5hYnMoeCkgPiAxKSB7XG4gICAgeCA9ICh4ID4gMSkgPyAxIDogLTE7XG4gIH1cbiAgcmV0dXJuIE1hdGguYXNpbih4KTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoMSAtIDAuMjUgKiB4ICogKDEgKyB4IC8gMTYgKiAoMyArIDEuMjUgKiB4KSkpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuICgwLjM3NSAqIHggKiAoMSArIDAuMjUgKiB4ICogKDEgKyAwLjQ2ODc1ICogeCkpKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoMC4wNTg1OTM3NSAqIHggKiB4ICogKDEgKyAwLjc1ICogeCkpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuICh4ICogeCAqIHggKiAoMzUgLyAzMDcyKSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYSwgZSwgc2lucGhpKSB7XG4gIHZhciB0ZW1wID0gZSAqIHNpbnBoaTtcbiAgcmV0dXJuIGEgLyBNYXRoLnNxcnQoMSAtIHRlbXAgKiB0ZW1wKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtbCwgZTAsIGUxLCBlMiwgZTMpIHtcbiAgdmFyIHBoaTtcbiAgdmFyIGRwaGk7XG5cbiAgcGhpID0gbWwgLyBlMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgZHBoaSA9IChtbCAtIChlMCAqIHBoaSAtIGUxICogTWF0aC5zaW4oMiAqIHBoaSkgKyBlMiAqIE1hdGguc2luKDQgKiBwaGkpIC0gZTMgKiBNYXRoLnNpbig2ICogcGhpKSkpIC8gKGUwIC0gMiAqIGUxICogTWF0aC5jb3MoMiAqIHBoaSkgKyA0ICogZTIgKiBNYXRoLmNvcyg0ICogcGhpKSAtIDYgKiBlMyAqIE1hdGguY29zKDYgKiBwaGkpKTtcbiAgICBwaGkgKz0gZHBoaTtcbiAgICBpZiAoTWF0aC5hYnMoZHBoaSkgPD0gMC4wMDAwMDAwMDAxKSB7XG4gICAgICByZXR1cm4gcGhpO1xuICAgIH1cbiAgfVxuXG4gIC8vLi5yZXBvcnRFcnJvcihcIklNTEZOLUNPTlY6TGF0aXR1ZGUgZmFpbGVkIHRvIGNvbnZlcmdlIGFmdGVyIDE1IGl0ZXJhdGlvbnNcIik7XG4gIHJldHVybiBOYU47XG59OyIsInZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVjY2VudCwgcSkge1xuICB2YXIgdGVtcCA9IDEgLSAoMSAtIGVjY2VudCAqIGVjY2VudCkgLyAoMiAqIGVjY2VudCkgKiBNYXRoLmxvZygoMSAtIGVjY2VudCkgLyAoMSArIGVjY2VudCkpO1xuICBpZiAoTWF0aC5hYnMoTWF0aC5hYnMocSkgLSB0ZW1wKSA8IDEuMEUtNikge1xuICAgIGlmIChxIDwgMCkge1xuICAgICAgcmV0dXJuICgtMSAqIEhBTEZfUEkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBIQUxGX1BJO1xuICAgIH1cbiAgfVxuICAvL3ZhciBwaGkgPSAwLjUqIHEvKDEtZWNjZW50KmVjY2VudCk7XG4gIHZhciBwaGkgPSBNYXRoLmFzaW4oMC41ICogcSk7XG4gIHZhciBkcGhpO1xuICB2YXIgc2luX3BoaTtcbiAgdmFyIGNvc19waGk7XG4gIHZhciBjb247XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzA7IGkrKykge1xuICAgIHNpbl9waGkgPSBNYXRoLnNpbihwaGkpO1xuICAgIGNvc19waGkgPSBNYXRoLmNvcyhwaGkpO1xuICAgIGNvbiA9IGVjY2VudCAqIHNpbl9waGk7XG4gICAgZHBoaSA9IE1hdGgucG93KDEgLSBjb24gKiBjb24sIDIpIC8gKDIgKiBjb3NfcGhpKSAqIChxIC8gKDEgLSBlY2NlbnQgKiBlY2NlbnQpIC0gc2luX3BoaSAvICgxIC0gY29uICogY29uKSArIDAuNSAvIGVjY2VudCAqIE1hdGgubG9nKCgxIC0gY29uKSAvICgxICsgY29uKSkpO1xuICAgIHBoaSArPSBkcGhpO1xuICAgIGlmIChNYXRoLmFicyhkcGhpKSA8PSAwLjAwMDAwMDAwMDEpIHtcbiAgICAgIHJldHVybiBwaGk7XG4gICAgfVxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhcIklRU0ZOLUNPTlY6TGF0aXR1ZGUgZmFpbGVkIHRvIGNvbnZlcmdlIGFmdGVyIDMwIGl0ZXJhdGlvbnNcIik7XG4gIHJldHVybiBOYU47XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZTAsIGUxLCBlMiwgZTMsIHBoaSkge1xuICByZXR1cm4gKGUwICogcGhpIC0gZTEgKiBNYXRoLnNpbigyICogcGhpKSArIGUyICogTWF0aC5zaW4oNCAqIHBoaSkgLSBlMyAqIE1hdGguc2luKDYgKiBwaGkpKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlY2NlbnQsIHNpbnBoaSwgY29zcGhpKSB7XG4gIHZhciBjb24gPSBlY2NlbnQgKiBzaW5waGk7XG4gIHJldHVybiBjb3NwaGkgLyAoTWF0aC5zcXJ0KDEgLSBjb24gKiBjb24pKTtcbn07IiwidmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVjY2VudCwgdHMpIHtcbiAgdmFyIGVjY250aCA9IDAuNSAqIGVjY2VudDtcbiAgdmFyIGNvbiwgZHBoaTtcbiAgdmFyIHBoaSA9IEhBTEZfUEkgLSAyICogTWF0aC5hdGFuKHRzKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPD0gMTU7IGkrKykge1xuICAgIGNvbiA9IGVjY2VudCAqIE1hdGguc2luKHBoaSk7XG4gICAgZHBoaSA9IEhBTEZfUEkgLSAyICogTWF0aC5hdGFuKHRzICogKE1hdGgucG93KCgoMSAtIGNvbikgLyAoMSArIGNvbikpLCBlY2NudGgpKSkgLSBwaGk7XG4gICAgcGhpICs9IGRwaGk7XG4gICAgaWYgKE1hdGguYWJzKGRwaGkpIDw9IDAuMDAwMDAwMDAwMSkge1xuICAgICAgcmV0dXJuIHBoaTtcbiAgICB9XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhcInBoaTJ6IGhhcyBOb0NvbnZlcmdlbmNlXCIpO1xuICByZXR1cm4gLTk5OTk7XG59OyIsInZhciBDMDAgPSAxO1xudmFyIEMwMiA9IDAuMjU7XG52YXIgQzA0ID0gMC4wNDY4NzU7XG52YXIgQzA2ID0gMC4wMTk1MzEyNTtcbnZhciBDMDggPSAwLjAxMDY4MTE1MjM0Mzc1O1xudmFyIEMyMiA9IDAuNzU7XG52YXIgQzQ0ID0gMC40Njg3NTtcbnZhciBDNDYgPSAwLjAxMzAyMDgzMzMzMzMzMzMzMzMzO1xudmFyIEM0OCA9IDAuMDA3MTIwNzY4MjI5MTY2NjY2NjY7XG52YXIgQzY2ID0gMC4zNjQ1ODMzMzMzMzMzMzMzMzMzMztcbnZhciBDNjggPSAwLjAwNTY5NjYxNDU4MzMzMzMzMzMzO1xudmFyIEM4OCA9IDAuMzA3NjE3MTg3NTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlcykge1xuICB2YXIgZW4gPSBbXTtcbiAgZW5bMF0gPSBDMDAgLSBlcyAqIChDMDIgKyBlcyAqIChDMDQgKyBlcyAqIChDMDYgKyBlcyAqIEMwOCkpKTtcbiAgZW5bMV0gPSBlcyAqIChDMjIgLSBlcyAqIChDMDQgKyBlcyAqIChDMDYgKyBlcyAqIEMwOCkpKTtcbiAgdmFyIHQgPSBlcyAqIGVzO1xuICBlblsyXSA9IHQgKiAoQzQ0IC0gZXMgKiAoQzQ2ICsgZXMgKiBDNDgpKTtcbiAgdCAqPSBlcztcbiAgZW5bM10gPSB0ICogKEM2NiAtIGVzICogQzY4KTtcbiAgZW5bNF0gPSB0ICogZXMgKiBDODg7XG4gIHJldHVybiBlbjtcbn07IiwidmFyIHBqX21sZm4gPSByZXF1aXJlKFwiLi9wal9tbGZuXCIpO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBNQVhfSVRFUiA9IDIwO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcmcsIGVzLCBlbikge1xuICB2YXIgayA9IDEgLyAoMSAtIGVzKTtcbiAgdmFyIHBoaSA9IGFyZztcbiAgZm9yICh2YXIgaSA9IE1BWF9JVEVSOyBpOyAtLWkpIHsgLyogcmFyZWx5IGdvZXMgb3ZlciAyIGl0ZXJhdGlvbnMgKi9cbiAgICB2YXIgcyA9IE1hdGguc2luKHBoaSk7XG4gICAgdmFyIHQgPSAxIC0gZXMgKiBzICogcztcbiAgICAvL3QgPSB0aGlzLnBqX21sZm4ocGhpLCBzLCBNYXRoLmNvcyhwaGkpLCBlbikgLSBhcmc7XG4gICAgLy9waGkgLT0gdCAqICh0ICogTWF0aC5zcXJ0KHQpKSAqIGs7XG4gICAgdCA9IChwal9tbGZuKHBoaSwgcywgTWF0aC5jb3MocGhpKSwgZW4pIC0gYXJnKSAqICh0ICogTWF0aC5zcXJ0KHQpKSAqIGs7XG4gICAgcGhpIC09IHQ7XG4gICAgaWYgKE1hdGguYWJzKHQpIDwgRVBTTE4pIHtcbiAgICAgIHJldHVybiBwaGk7XG4gICAgfVxuICB9XG4gIC8vLi5yZXBvcnRFcnJvcihcImNhc3M6cGpfaW52X21sZm46IENvbnZlcmdlbmNlIGVycm9yXCIpO1xuICByZXR1cm4gcGhpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHBoaSwgc3BoaSwgY3BoaSwgZW4pIHtcbiAgY3BoaSAqPSBzcGhpO1xuICBzcGhpICo9IHNwaGk7XG4gIHJldHVybiAoZW5bMF0gKiBwaGkgLSBjcGhpICogKGVuWzFdICsgc3BoaSAqIChlblsyXSArIHNwaGkgKiAoZW5bM10gKyBzcGhpICogZW5bNF0pKSkpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVjY2VudCwgc2lucGhpKSB7XG4gIHZhciBjb247XG4gIGlmIChlY2NlbnQgPiAxLjBlLTcpIHtcbiAgICBjb24gPSBlY2NlbnQgKiBzaW5waGk7XG4gICAgcmV0dXJuICgoMSAtIGVjY2VudCAqIGVjY2VudCkgKiAoc2lucGhpIC8gKDEgLSBjb24gKiBjb24pIC0gKDAuNSAvIGVjY2VudCkgKiBNYXRoLmxvZygoMSAtIGNvbikgLyAoMSArIGNvbikpKSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuICgyICogc2lucGhpKTtcbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHg8MCA/IC0xIDogMTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlc2lucCwgZXhwKSB7XG4gIHJldHVybiAoTWF0aC5wb3coKDEgLSBlc2lucCkgLyAoMSArIGVzaW5wKSwgZXhwKSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFycmF5KXtcbiAgdmFyIG91dCA9IHtcbiAgICB4OiBhcnJheVswXSxcbiAgICB5OiBhcnJheVsxXVxuICB9O1xuICBpZiAoYXJyYXkubGVuZ3RoPjIpIHtcbiAgICBvdXQueiA9IGFycmF5WzJdO1xuICB9XG4gIGlmIChhcnJheS5sZW5ndGg+Mykge1xuICAgIG91dC5tID0gYXJyYXlbM107XG4gIH1cbiAgcmV0dXJuIG91dDtcbn07IiwidmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWNjZW50LCBwaGksIHNpbnBoaSkge1xuICB2YXIgY29uID0gZWNjZW50ICogc2lucGhpO1xuICB2YXIgY29tID0gMC41ICogZWNjZW50O1xuICBjb24gPSBNYXRoLnBvdygoKDEgLSBjb24pIC8gKDEgKyBjb24pKSwgY29tKTtcbiAgcmV0dXJuIChNYXRoLnRhbigwLjUgKiAoSEFMRl9QSSAtIHBoaSkpIC8gY29uKTtcbn07IiwiZXhwb3J0cy53Z3M4NCA9IHtcbiAgdG93Z3M4NDogXCIwLDAsMFwiLFxuICBlbGxpcHNlOiBcIldHUzg0XCIsXG4gIGRhdHVtTmFtZTogXCJXR1M4NFwiXG59O1xuZXhwb3J0cy5jaDE5MDMgPSB7XG4gIHRvd2dzODQ6IFwiNjc0LjM3NCwxNS4wNTYsNDA1LjM0NlwiLFxuICBlbGxpcHNlOiBcImJlc3NlbFwiLFxuICBkYXR1bU5hbWU6IFwic3dpc3NcIlxufTtcbmV4cG9ydHMuZ2dyczg3ID0ge1xuICB0b3dnczg0OiBcIi0xOTkuODcsNzQuNzksMjQ2LjYyXCIsXG4gIGVsbGlwc2U6IFwiR1JTODBcIixcbiAgZGF0dW1OYW1lOiBcIkdyZWVrX0dlb2RldGljX1JlZmVyZW5jZV9TeXN0ZW1fMTk4N1wiXG59O1xuZXhwb3J0cy5uYWQ4MyA9IHtcbiAgdG93Z3M4NDogXCIwLDAsMFwiLFxuICBlbGxpcHNlOiBcIkdSUzgwXCIsXG4gIGRhdHVtTmFtZTogXCJOb3J0aF9BbWVyaWNhbl9EYXR1bV8xOTgzXCJcbn07XG5leHBvcnRzLm5hZDI3ID0ge1xuICBuYWRncmlkczogXCJAY29udXMsQGFsYXNrYSxAbnR2Ml8wLmdzYixAbnR2MV9jYW4uZGF0XCIsXG4gIGVsbGlwc2U6IFwiY2xyazY2XCIsXG4gIGRhdHVtTmFtZTogXCJOb3J0aF9BbWVyaWNhbl9EYXR1bV8xOTI3XCJcbn07XG5leHBvcnRzLnBvdHNkYW0gPSB7XG4gIHRvd2dzODQ6IFwiNjA2LjAsMjMuMCw0MTMuMFwiLFxuICBlbGxpcHNlOiBcImJlc3NlbFwiLFxuICBkYXR1bU5hbWU6IFwiUG90c2RhbSBSYXVlbmJlcmcgMTk1MCBESEROXCJcbn07XG5leHBvcnRzLmNhcnRoYWdlID0ge1xuICB0b3dnczg0OiBcIi0yNjMuMCw2LjAsNDMxLjBcIixcbiAgZWxsaXBzZTogXCJjbGFyazgwXCIsXG4gIGRhdHVtTmFtZTogXCJDYXJ0aGFnZSAxOTM0IFR1bmlzaWFcIlxufTtcbmV4cG9ydHMuaGVybWFubnNrb2dlbCA9IHtcbiAgdG93Z3M4NDogXCI2NTMuMCwtMjEyLjAsNDQ5LjBcIixcbiAgZWxsaXBzZTogXCJiZXNzZWxcIixcbiAgZGF0dW1OYW1lOiBcIkhlcm1hbm5za29nZWxcIlxufTtcbmV4cG9ydHMuaXJlNjUgPSB7XG4gIHRvd2dzODQ6IFwiNDgyLjUzMCwtMTMwLjU5Niw1NjQuNTU3LC0xLjA0MiwtMC4yMTQsLTAuNjMxLDguMTVcIixcbiAgZWxsaXBzZTogXCJtb2RfYWlyeVwiLFxuICBkYXR1bU5hbWU6IFwiSXJlbGFuZCAxOTY1XCJcbn07XG5leHBvcnRzLnJhc3NhZGlyYW4gPSB7XG4gIHRvd2dzODQ6IFwiLTEzMy42MywtMTU3LjUsLTE1OC42MlwiLFxuICBlbGxpcHNlOiBcImludGxcIixcbiAgZGF0dW1OYW1lOiBcIlJhc3NhZGlyYW5cIlxufTtcbmV4cG9ydHMubnpnZDQ5ID0ge1xuICB0b3dnczg0OiBcIjU5LjQ3LC01LjA0LDE4Ny40NCwwLjQ3LC0wLjEsMS4wMjQsLTQuNTk5M1wiLFxuICBlbGxpcHNlOiBcImludGxcIixcbiAgZGF0dW1OYW1lOiBcIk5ldyBaZWFsYW5kIEdlb2RldGljIERhdHVtIDE5NDlcIlxufTtcbmV4cG9ydHMub3NnYjM2ID0ge1xuICB0b3dnczg0OiBcIjQ0Ni40NDgsLTEyNS4xNTcsNTQyLjA2MCwwLjE1MDIsMC4yNDcwLDAuODQyMSwtMjAuNDg5NFwiLFxuICBlbGxpcHNlOiBcImFpcnlcIixcbiAgZGF0dW1OYW1lOiBcIkFpcnkgMTgzMFwiXG59O1xuZXhwb3J0cy5zX2p0c2sgPSB7XG4gIHRvd2dzODQ6IFwiNTg5LDc2LDQ4MFwiLFxuICBlbGxpcHNlOiAnYmVzc2VsJyxcbiAgZGF0dW1OYW1lOiAnUy1KVFNLIChGZXJybyknXG59O1xuZXhwb3J0cy5iZWR1YXJhbSA9IHtcbiAgdG93Z3M4NDogJy0xMDYsLTg3LDE4OCcsXG4gIGVsbGlwc2U6ICdjbHJrODAnLFxuICBkYXR1bU5hbWU6ICdCZWR1YXJhbSdcbn07XG5leHBvcnRzLmd1bnVuZ19zZWdhcmEgPSB7XG4gIHRvd2dzODQ6ICctNDAzLDY4NCw0MScsXG4gIGVsbGlwc2U6ICdiZXNzZWwnLFxuICBkYXR1bU5hbWU6ICdHdW51bmcgU2VnYXJhIEpha2FydGEnXG59O1xuZXhwb3J0cy5ybmI3MiA9IHtcbiAgdG93Z3M4NDogXCIxMDYuODY5LC01Mi4yOTc4LDEwMy43MjQsLTAuMzM2NTcsMC40NTY5NTUsLTEuODQyMTgsMVwiLFxuICBlbGxpcHNlOiBcImludGxcIixcbiAgZGF0dW1OYW1lOiBcIlJlc2VhdSBOYXRpb25hbCBCZWxnZSAxOTcyXCJcbn07IiwiZXhwb3J0cy5NRVJJVCA9IHtcbiAgYTogNjM3ODEzNy4wLFxuICByZjogMjk4LjI1NyxcbiAgZWxsaXBzZU5hbWU6IFwiTUVSSVQgMTk4M1wiXG59O1xuZXhwb3J0cy5TR1M4NSA9IHtcbiAgYTogNjM3ODEzNi4wLFxuICByZjogMjk4LjI1NyxcbiAgZWxsaXBzZU5hbWU6IFwiU292aWV0IEdlb2RldGljIFN5c3RlbSA4NVwiXG59O1xuZXhwb3J0cy5HUlM4MCA9IHtcbiAgYTogNjM3ODEzNy4wLFxuICByZjogMjk4LjI1NzIyMjEwMSxcbiAgZWxsaXBzZU5hbWU6IFwiR1JTIDE5ODAoSVVHRywgMTk4MClcIlxufTtcbmV4cG9ydHMuSUFVNzYgPSB7XG4gIGE6IDYzNzgxNDAuMCxcbiAgcmY6IDI5OC4yNTcsXG4gIGVsbGlwc2VOYW1lOiBcIklBVSAxOTc2XCJcbn07XG5leHBvcnRzLmFpcnkgPSB7XG4gIGE6IDYzNzc1NjMuMzk2LFxuICBiOiA2MzU2MjU2LjkxMCxcbiAgZWxsaXBzZU5hbWU6IFwiQWlyeSAxODMwXCJcbn07XG5leHBvcnRzLkFQTDQgPSB7XG4gIGE6IDYzNzgxMzcsXG4gIHJmOiAyOTguMjUsXG4gIGVsbGlwc2VOYW1lOiBcIkFwcGwuIFBoeXNpY3MuIDE5NjVcIlxufTtcbmV4cG9ydHMuTldMOUQgPSB7XG4gIGE6IDYzNzgxNDUuMCxcbiAgcmY6IDI5OC4yNSxcbiAgZWxsaXBzZU5hbWU6IFwiTmF2YWwgV2VhcG9ucyBMYWIuLCAxOTY1XCJcbn07XG5leHBvcnRzLm1vZF9haXJ5ID0ge1xuICBhOiA2Mzc3MzQwLjE4OSxcbiAgYjogNjM1NjAzNC40NDYsXG4gIGVsbGlwc2VOYW1lOiBcIk1vZGlmaWVkIEFpcnlcIlxufTtcbmV4cG9ydHMuYW5kcmFlID0ge1xuICBhOiA2Mzc3MTA0LjQzLFxuICByZjogMzAwLjAsXG4gIGVsbGlwc2VOYW1lOiBcIkFuZHJhZSAxODc2IChEZW4uLCBJY2xuZC4pXCJcbn07XG5leHBvcnRzLmF1c3RfU0EgPSB7XG4gIGE6IDYzNzgxNjAuMCxcbiAgcmY6IDI5OC4yNSxcbiAgZWxsaXBzZU5hbWU6IFwiQXVzdHJhbGlhbiBOYXRsICYgUy4gQW1lci4gMTk2OVwiXG59O1xuZXhwb3J0cy5HUlM2NyA9IHtcbiAgYTogNjM3ODE2MC4wLFxuICByZjogMjk4LjI0NzE2NzQyNzAsXG4gIGVsbGlwc2VOYW1lOiBcIkdSUyA2NyhJVUdHIDE5NjcpXCJcbn07XG5leHBvcnRzLmJlc3NlbCA9IHtcbiAgYTogNjM3NzM5Ny4xNTUsXG4gIHJmOiAyOTkuMTUyODEyOCxcbiAgZWxsaXBzZU5hbWU6IFwiQmVzc2VsIDE4NDFcIlxufTtcbmV4cG9ydHMuYmVzc19uYW0gPSB7XG4gIGE6IDYzNzc0ODMuODY1LFxuICByZjogMjk5LjE1MjgxMjgsXG4gIGVsbGlwc2VOYW1lOiBcIkJlc3NlbCAxODQxIChOYW1pYmlhKVwiXG59O1xuZXhwb3J0cy5jbHJrNjYgPSB7XG4gIGE6IDYzNzgyMDYuNCxcbiAgYjogNjM1NjU4My44LFxuICBlbGxpcHNlTmFtZTogXCJDbGFya2UgMTg2NlwiXG59O1xuZXhwb3J0cy5jbHJrODAgPSB7XG4gIGE6IDYzNzgyNDkuMTQ1LFxuICByZjogMjkzLjQ2NjMsXG4gIGVsbGlwc2VOYW1lOiBcIkNsYXJrZSAxODgwIG1vZC5cIlxufTtcbmV4cG9ydHMuY2xyazU4ID0ge1xuICBhOiA2Mzc4MjkzLjY0NTIwODc1OSxcbiAgcmY6IDI5NC4yNjA2NzYzNjkyNjU0LFxuICBlbGxpcHNlTmFtZTogXCJDbGFya2UgMTg1OFwiXG59O1xuZXhwb3J0cy5DUE0gPSB7XG4gIGE6IDYzNzU3MzguNyxcbiAgcmY6IDMzNC4yOSxcbiAgZWxsaXBzZU5hbWU6IFwiQ29tbS4gZGVzIFBvaWRzIGV0IE1lc3VyZXMgMTc5OVwiXG59O1xuZXhwb3J0cy5kZWxtYnIgPSB7XG4gIGE6IDYzNzY0MjguMCxcbiAgcmY6IDMxMS41LFxuICBlbGxpcHNlTmFtZTogXCJEZWxhbWJyZSAxODEwIChCZWxnaXVtKVwiXG59O1xuZXhwb3J0cy5lbmdlbGlzID0ge1xuICBhOiA2Mzc4MTM2LjA1LFxuICByZjogMjk4LjI1NjYsXG4gIGVsbGlwc2VOYW1lOiBcIkVuZ2VsaXMgMTk4NVwiXG59O1xuZXhwb3J0cy5ldnJzdDMwID0ge1xuICBhOiA2Mzc3Mjc2LjM0NSxcbiAgcmY6IDMwMC44MDE3LFxuICBlbGxpcHNlTmFtZTogXCJFdmVyZXN0IDE4MzBcIlxufTtcbmV4cG9ydHMuZXZyc3Q0OCA9IHtcbiAgYTogNjM3NzMwNC4wNjMsXG4gIHJmOiAzMDAuODAxNyxcbiAgZWxsaXBzZU5hbWU6IFwiRXZlcmVzdCAxOTQ4XCJcbn07XG5leHBvcnRzLmV2cnN0NTYgPSB7XG4gIGE6IDYzNzczMDEuMjQzLFxuICByZjogMzAwLjgwMTcsXG4gIGVsbGlwc2VOYW1lOiBcIkV2ZXJlc3QgMTk1NlwiXG59O1xuZXhwb3J0cy5ldnJzdDY5ID0ge1xuICBhOiA2Mzc3Mjk1LjY2NCxcbiAgcmY6IDMwMC44MDE3LFxuICBlbGxpcHNlTmFtZTogXCJFdmVyZXN0IDE5NjlcIlxufTtcbmV4cG9ydHMuZXZyc3RTUyA9IHtcbiAgYTogNjM3NzI5OC41NTYsXG4gIHJmOiAzMDAuODAxNyxcbiAgZWxsaXBzZU5hbWU6IFwiRXZlcmVzdCAoU2FiYWggJiBTYXJhd2FrKVwiXG59O1xuZXhwb3J0cy5mc2NocjYwID0ge1xuICBhOiA2Mzc4MTY2LjAsXG4gIHJmOiAyOTguMyxcbiAgZWxsaXBzZU5hbWU6IFwiRmlzY2hlciAoTWVyY3VyeSBEYXR1bSkgMTk2MFwiXG59O1xuZXhwb3J0cy5mc2NocjYwbSA9IHtcbiAgYTogNjM3ODE1NS4wLFxuICByZjogMjk4LjMsXG4gIGVsbGlwc2VOYW1lOiBcIkZpc2NoZXIgMTk2MFwiXG59O1xuZXhwb3J0cy5mc2NocjY4ID0ge1xuICBhOiA2Mzc4MTUwLjAsXG4gIHJmOiAyOTguMyxcbiAgZWxsaXBzZU5hbWU6IFwiRmlzY2hlciAxOTY4XCJcbn07XG5leHBvcnRzLmhlbG1lcnQgPSB7XG4gIGE6IDYzNzgyMDAuMCxcbiAgcmY6IDI5OC4zLFxuICBlbGxpcHNlTmFtZTogXCJIZWxtZXJ0IDE5MDZcIlxufTtcbmV4cG9ydHMuaG91Z2ggPSB7XG4gIGE6IDYzNzgyNzAuMCxcbiAgcmY6IDI5Ny4wLFxuICBlbGxpcHNlTmFtZTogXCJIb3VnaFwiXG59O1xuZXhwb3J0cy5pbnRsID0ge1xuICBhOiA2Mzc4Mzg4LjAsXG4gIHJmOiAyOTcuMCxcbiAgZWxsaXBzZU5hbWU6IFwiSW50ZXJuYXRpb25hbCAxOTA5IChIYXlmb3JkKVwiXG59O1xuZXhwb3J0cy5rYXVsYSA9IHtcbiAgYTogNjM3ODE2My4wLFxuICByZjogMjk4LjI0LFxuICBlbGxpcHNlTmFtZTogXCJLYXVsYSAxOTYxXCJcbn07XG5leHBvcnRzLmxlcmNoID0ge1xuICBhOiA2Mzc4MTM5LjAsXG4gIHJmOiAyOTguMjU3LFxuICBlbGxpcHNlTmFtZTogXCJMZXJjaCAxOTc5XCJcbn07XG5leHBvcnRzLm1wcnRzID0ge1xuICBhOiA2Mzk3MzAwLjAsXG4gIHJmOiAxOTEuMCxcbiAgZWxsaXBzZU5hbWU6IFwiTWF1cGVydGl1cyAxNzM4XCJcbn07XG5leHBvcnRzLm5ld19pbnRsID0ge1xuICBhOiA2Mzc4MTU3LjUsXG4gIGI6IDYzNTY3NzIuMixcbiAgZWxsaXBzZU5hbWU6IFwiTmV3IEludGVybmF0aW9uYWwgMTk2N1wiXG59O1xuZXhwb3J0cy5wbGVzc2lzID0ge1xuICBhOiA2Mzc2NTIzLjAsXG4gIHJmOiA2MzU1ODYzLjAsXG4gIGVsbGlwc2VOYW1lOiBcIlBsZXNzaXMgMTgxNyAoRnJhbmNlKVwiXG59O1xuZXhwb3J0cy5rcmFzcyA9IHtcbiAgYTogNjM3ODI0NS4wLFxuICByZjogMjk4LjMsXG4gIGVsbGlwc2VOYW1lOiBcIktyYXNzb3Zza3ksIDE5NDJcIlxufTtcbmV4cG9ydHMuU0Vhc2lhID0ge1xuICBhOiA2Mzc4MTU1LjAsXG4gIGI6IDYzNTY3NzMuMzIwNSxcbiAgZWxsaXBzZU5hbWU6IFwiU291dGhlYXN0IEFzaWFcIlxufTtcbmV4cG9ydHMud2FsYmVjayA9IHtcbiAgYTogNjM3Njg5Ni4wLFxuICBiOiA2MzU1ODM0Ljg0NjcsXG4gIGVsbGlwc2VOYW1lOiBcIldhbGJlY2tcIlxufTtcbmV4cG9ydHMuV0dTNjAgPSB7XG4gIGE6IDYzNzgxNjUuMCxcbiAgcmY6IDI5OC4zLFxuICBlbGxpcHNlTmFtZTogXCJXR1MgNjBcIlxufTtcbmV4cG9ydHMuV0dTNjYgPSB7XG4gIGE6IDYzNzgxNDUuMCxcbiAgcmY6IDI5OC4yNSxcbiAgZWxsaXBzZU5hbWU6IFwiV0dTIDY2XCJcbn07XG5leHBvcnRzLldHUzcgPSB7XG4gIGE6IDYzNzgxMzUuMCxcbiAgcmY6IDI5OC4yNixcbiAgZWxsaXBzZU5hbWU6IFwiV0dTIDcyXCJcbn07XG5leHBvcnRzLldHUzg0ID0ge1xuICBhOiA2Mzc4MTM3LjAsXG4gIHJmOiAyOTguMjU3MjIzNTYzLFxuICBlbGxpcHNlTmFtZTogXCJXR1MgODRcIlxufTtcbmV4cG9ydHMuc3BoZXJlID0ge1xuICBhOiA2MzcwOTk3LjAsXG4gIGI6IDYzNzA5OTcuMCxcbiAgZWxsaXBzZU5hbWU6IFwiTm9ybWFsIFNwaGVyZSAocj02MzcwOTk3KVwiXG59OyIsImV4cG9ydHMuZ3JlZW53aWNoID0gMC4wOyAvL1wiMGRFXCIsXG5leHBvcnRzLmxpc2JvbiA9IC05LjEzMTkwNjExMTExMTsgLy9cIjlkMDcnNTQuODYyXFxcIldcIixcbmV4cG9ydHMucGFyaXMgPSAyLjMzNzIyOTE2NjY2NzsgLy9cIjJkMjAnMTQuMDI1XFxcIkVcIixcbmV4cG9ydHMuYm9nb3RhID0gLTc0LjA4MDkxNjY2NjY2NzsgLy9cIjc0ZDA0JzUxLjNcXFwiV1wiLFxuZXhwb3J0cy5tYWRyaWQgPSAtMy42ODc5Mzg4ODg4ODk7IC8vXCIzZDQxJzE2LjU4XFxcIldcIixcbmV4cG9ydHMucm9tZSA9IDEyLjQ1MjMzMzMzMzMzMzsgLy9cIjEyZDI3JzguNFxcXCJFXCIsXG5leHBvcnRzLmJlcm4gPSA3LjQzOTU4MzMzMzMzMzsgLy9cIjdkMjYnMjIuNVxcXCJFXCIsXG5leHBvcnRzLmpha2FydGEgPSAxMDYuODA3NzE5NDQ0NDQ0OyAvL1wiMTA2ZDQ4JzI3Ljc5XFxcIkVcIixcbmV4cG9ydHMuZmVycm8gPSAtMTcuNjY2NjY2NjY2NjY3OyAvL1wiMTdkNDAnV1wiLFxuZXhwb3J0cy5icnVzc2VscyA9IDQuMzY3OTc1OyAvL1wiNGQyMic0LjcxXFxcIkVcIixcbmV4cG9ydHMuc3RvY2tob2xtID0gMTguMDU4Mjc3Nzc3Nzc4OyAvL1wiMThkMycyOS44XFxcIkVcIixcbmV4cG9ydHMuYXRoZW5zID0gMjMuNzE2MzM3NTsgLy9cIjIzZDQyJzU4LjgxNVxcXCJFXCIsXG5leHBvcnRzLm9zbG8gPSAxMC43MjI5MTY2NjY2Njc7IC8vXCIxMGQ0MycyMi41XFxcIkVcIiIsImV4cG9ydHMuZnQgPSB7dG9fbWV0ZXI6IDAuMzA0OH07XG5leHBvcnRzWyd1cy1mdCddID0ge3RvX21ldGVyOiAxMjAwIC8gMzkzN307XG4iLCJ2YXIgcHJvaiA9IHJlcXVpcmUoJy4vUHJvaicpO1xudmFyIHRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtJyk7XG52YXIgd2dzODQgPSBwcm9qKCdXR1M4NCcpO1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1lcihmcm9tLCB0bywgY29vcmRzKSB7XG4gIHZhciB0cmFuc2Zvcm1lZEFycmF5O1xuICBpZiAoQXJyYXkuaXNBcnJheShjb29yZHMpKSB7XG4gICAgdHJhbnNmb3JtZWRBcnJheSA9IHRyYW5zZm9ybShmcm9tLCB0bywgY29vcmRzKTtcbiAgICBpZiAoY29vcmRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgcmV0dXJuIFt0cmFuc2Zvcm1lZEFycmF5LngsIHRyYW5zZm9ybWVkQXJyYXkueSwgdHJhbnNmb3JtZWRBcnJheS56XTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gW3RyYW5zZm9ybWVkQXJyYXkueCwgdHJhbnNmb3JtZWRBcnJheS55XTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIHRyYW5zZm9ybShmcm9tLCB0bywgY29vcmRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1Byb2ooaXRlbSkge1xuICBpZiAoaXRlbSBpbnN0YW5jZW9mIHByb2opIHtcbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuICBpZiAoaXRlbS5vUHJvaikge1xuICAgIHJldHVybiBpdGVtLm9Qcm9qO1xuICB9XG4gIHJldHVybiBwcm9qKGl0ZW0pO1xufVxuZnVuY3Rpb24gcHJvajQoZnJvbVByb2osIHRvUHJvaiwgY29vcmQpIHtcbiAgZnJvbVByb2ogPSBjaGVja1Byb2ooZnJvbVByb2opO1xuICB2YXIgc2luZ2xlID0gZmFsc2U7XG4gIHZhciBvYmo7XG4gIGlmICh0eXBlb2YgdG9Qcm9qID09PSAndW5kZWZpbmVkJykge1xuICAgIHRvUHJvaiA9IGZyb21Qcm9qO1xuICAgIGZyb21Qcm9qID0gd2dzODQ7XG4gICAgc2luZ2xlID0gdHJ1ZTtcbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgdG9Qcm9qLnggIT09ICd1bmRlZmluZWQnIHx8IEFycmF5LmlzQXJyYXkodG9Qcm9qKSkge1xuICAgIGNvb3JkID0gdG9Qcm9qO1xuICAgIHRvUHJvaiA9IGZyb21Qcm9qO1xuICAgIGZyb21Qcm9qID0gd2dzODQ7XG4gICAgc2luZ2xlID0gdHJ1ZTtcbiAgfVxuICB0b1Byb2ogPSBjaGVja1Byb2oodG9Qcm9qKTtcbiAgaWYgKGNvb3JkKSB7XG4gICAgcmV0dXJuIHRyYW5zZm9ybWVyKGZyb21Qcm9qLCB0b1Byb2osIGNvb3JkKTtcbiAgfVxuICBlbHNlIHtcbiAgICBvYmogPSB7XG4gICAgICBmb3J3YXJkOiBmdW5jdGlvbihjb29yZHMpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVyKGZyb21Qcm9qLCB0b1Byb2osIGNvb3Jkcyk7XG4gICAgICB9LFxuICAgICAgaW52ZXJzZTogZnVuY3Rpb24oY29vcmRzKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1lcih0b1Byb2osIGZyb21Qcm9qLCBjb29yZHMpO1xuICAgICAgfVxuICAgIH07XG4gICAgaWYgKHNpbmdsZSkge1xuICAgICAgb2JqLm9Qcm9qID0gdG9Qcm9qO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHByb2o0OyIsInZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIFBKRF8zUEFSQU0gPSAxO1xudmFyIFBKRF83UEFSQU0gPSAyO1xudmFyIFBKRF9HUklEU0hJRlQgPSAzO1xudmFyIFBKRF9XR1M4NCA9IDQ7IC8vIFdHUzg0IG9yIGVxdWl2YWxlbnRcbnZhciBQSkRfTk9EQVRVTSA9IDU7IC8vIFdHUzg0IG9yIGVxdWl2YWxlbnRcbnZhciBTRUNfVE9fUkFEID0gNC44NDgxMzY4MTEwOTUzNTk5MzU4OTkxNDEwMjM1N2UtNjtcbnZhciBBRF9DID0gMS4wMDI2MDAwO1xudmFyIENPU182N1A1ID0gMC4zODI2ODM0MzIzNjUwODk3NztcbnZhciBkYXR1bSA9IGZ1bmN0aW9uKHByb2opIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGRhdHVtKSkge1xuICAgIHJldHVybiBuZXcgZGF0dW0ocHJvaik7XG4gIH1cbiAgdGhpcy5kYXR1bV90eXBlID0gUEpEX1dHUzg0OyAvL2RlZmF1bHQgc2V0dGluZ1xuICBpZiAoIXByb2opIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHByb2ouZGF0dW1Db2RlICYmIHByb2ouZGF0dW1Db2RlID09PSAnbm9uZScpIHtcbiAgICB0aGlzLmRhdHVtX3R5cGUgPSBQSkRfTk9EQVRVTTtcbiAgfVxuICBpZiAocHJvai5kYXR1bV9wYXJhbXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb2ouZGF0dW1fcGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwcm9qLmRhdHVtX3BhcmFtc1tpXSA9IHBhcnNlRmxvYXQocHJvai5kYXR1bV9wYXJhbXNbaV0pO1xuICAgIH1cbiAgICBpZiAocHJvai5kYXR1bV9wYXJhbXNbMF0gIT09IDAgfHwgcHJvai5kYXR1bV9wYXJhbXNbMV0gIT09IDAgfHwgcHJvai5kYXR1bV9wYXJhbXNbMl0gIT09IDApIHtcbiAgICAgIHRoaXMuZGF0dW1fdHlwZSA9IFBKRF8zUEFSQU07XG4gICAgfVxuICAgIGlmIChwcm9qLmRhdHVtX3BhcmFtcy5sZW5ndGggPiAzKSB7XG4gICAgICBpZiAocHJvai5kYXR1bV9wYXJhbXNbM10gIT09IDAgfHwgcHJvai5kYXR1bV9wYXJhbXNbNF0gIT09IDAgfHwgcHJvai5kYXR1bV9wYXJhbXNbNV0gIT09IDAgfHwgcHJvai5kYXR1bV9wYXJhbXNbNl0gIT09IDApIHtcbiAgICAgICAgdGhpcy5kYXR1bV90eXBlID0gUEpEXzdQQVJBTTtcbiAgICAgICAgcHJvai5kYXR1bV9wYXJhbXNbM10gKj0gU0VDX1RPX1JBRDtcbiAgICAgICAgcHJvai5kYXR1bV9wYXJhbXNbNF0gKj0gU0VDX1RPX1JBRDtcbiAgICAgICAgcHJvai5kYXR1bV9wYXJhbXNbNV0gKj0gU0VDX1RPX1JBRDtcbiAgICAgICAgcHJvai5kYXR1bV9wYXJhbXNbNl0gPSAocHJvai5kYXR1bV9wYXJhbXNbNl0gLyAxMDAwMDAwLjApICsgMS4wO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBER1IgMjAxMS0wMy0yMSA6IG5hZGdyaWRzIHN1cHBvcnRcbiAgdGhpcy5kYXR1bV90eXBlID0gcHJvai5ncmlkcyA/IFBKRF9HUklEU0hJRlQgOiB0aGlzLmRhdHVtX3R5cGU7XG5cbiAgdGhpcy5hID0gcHJvai5hOyAvL2RhdHVtIG9iamVjdCBhbHNvIHVzZXMgdGhlc2UgdmFsdWVzXG4gIHRoaXMuYiA9IHByb2ouYjtcbiAgdGhpcy5lcyA9IHByb2ouZXM7XG4gIHRoaXMuZXAyID0gcHJvai5lcDI7XG4gIHRoaXMuZGF0dW1fcGFyYW1zID0gcHJvai5kYXR1bV9wYXJhbXM7XG4gIGlmICh0aGlzLmRhdHVtX3R5cGUgPT09IFBKRF9HUklEU0hJRlQpIHtcbiAgICB0aGlzLmdyaWRzID0gcHJvai5ncmlkcztcbiAgfVxufTtcbmRhdHVtLnByb3RvdHlwZSA9IHtcblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAvLyBjc19jb21wYXJlX2RhdHVtcygpXG4gIC8vICAgUmV0dXJucyBUUlVFIGlmIHRoZSB0d28gZGF0dW1zIG1hdGNoLCBvdGhlcndpc2UgRkFMU0UuXG4gIGNvbXBhcmVfZGF0dW1zOiBmdW5jdGlvbihkZXN0KSB7XG4gICAgaWYgKHRoaXMuZGF0dW1fdHlwZSAhPT0gZGVzdC5kYXR1bV90eXBlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIGZhbHNlLCBkYXR1bXMgYXJlIG5vdCBlcXVhbFxuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmEgIT09IGRlc3QuYSB8fCBNYXRoLmFicyh0aGlzLmVzIC0gZGVzdC5lcykgPiAwLjAwMDAwMDAwMDA1MCkge1xuICAgICAgLy8gdGhlIHRvbGVyZW5jZSBmb3IgZXMgaXMgdG8gZW5zdXJlIHRoYXQgR1JTODAgYW5kIFdHUzg0XG4gICAgICAvLyBhcmUgY29uc2lkZXJlZCBpZGVudGljYWxcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5kYXR1bV90eXBlID09PSBQSkRfM1BBUkFNKSB7XG4gICAgICByZXR1cm4gKHRoaXMuZGF0dW1fcGFyYW1zWzBdID09PSBkZXN0LmRhdHVtX3BhcmFtc1swXSAmJiB0aGlzLmRhdHVtX3BhcmFtc1sxXSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbMV0gJiYgdGhpcy5kYXR1bV9wYXJhbXNbMl0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzJdKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5kYXR1bV90eXBlID09PSBQSkRfN1BBUkFNKSB7XG4gICAgICByZXR1cm4gKHRoaXMuZGF0dW1fcGFyYW1zWzBdID09PSBkZXN0LmRhdHVtX3BhcmFtc1swXSAmJiB0aGlzLmRhdHVtX3BhcmFtc1sxXSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbMV0gJiYgdGhpcy5kYXR1bV9wYXJhbXNbMl0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzJdICYmIHRoaXMuZGF0dW1fcGFyYW1zWzNdID09PSBkZXN0LmRhdHVtX3BhcmFtc1szXSAmJiB0aGlzLmRhdHVtX3BhcmFtc1s0XSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbNF0gJiYgdGhpcy5kYXR1bV9wYXJhbXNbNV0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzVdICYmIHRoaXMuZGF0dW1fcGFyYW1zWzZdID09PSBkZXN0LmRhdHVtX3BhcmFtc1s2XSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZGF0dW1fdHlwZSA9PT0gUEpEX0dSSURTSElGVCB8fCBkZXN0LmRhdHVtX3R5cGUgPT09IFBKRF9HUklEU0hJRlQpIHtcbiAgICAgIC8vYWxlcnQoXCJFUlJPUjogR3JpZCBzaGlmdCB0cmFuc2Zvcm1hdGlvbnMgYXJlIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgICAvL3JldHVybiBmYWxzZVxuICAgICAgLy9ER1IgMjAxMi0wNy0yOSBsYXp5IC4uLlxuICAgICAgcmV0dXJuIHRoaXMubmFkZ3JpZHMgPT09IGRlc3QubmFkZ3JpZHM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7IC8vIGRhdHVtcyBhcmUgZXF1YWxcbiAgICB9XG4gIH0sIC8vIGNzX2NvbXBhcmVfZGF0dW1zKClcblxuICAvKlxuICAgKiBUaGUgZnVuY3Rpb24gQ29udmVydF9HZW9kZXRpY19Ub19HZW9jZW50cmljIGNvbnZlcnRzIGdlb2RldGljIGNvb3JkaW5hdGVzXG4gICAqIChsYXRpdHVkZSwgbG9uZ2l0dWRlLCBhbmQgaGVpZ2h0KSB0byBnZW9jZW50cmljIGNvb3JkaW5hdGVzIChYLCBZLCBaKSxcbiAgICogYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGVsbGlwc29pZCBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiAgICBMYXRpdHVkZSAgOiBHZW9kZXRpYyBsYXRpdHVkZSBpbiByYWRpYW5zICAgICAgICAgICAgICAgICAgICAgKGlucHV0KVxuICAgKiAgICBMb25naXR1ZGUgOiBHZW9kZXRpYyBsb25naXR1ZGUgaW4gcmFkaWFucyAgICAgICAgICAgICAgICAgICAgKGlucHV0KVxuICAgKiAgICBIZWlnaHQgICAgOiBHZW9kZXRpYyBoZWlnaHQsIGluIG1ldGVycyAgICAgICAgICAgICAgICAgICAgICAgKGlucHV0KVxuICAgKiAgICBYICAgICAgICAgOiBDYWxjdWxhdGVkIEdlb2NlbnRyaWMgWCBjb29yZGluYXRlLCBpbiBtZXRlcnMgICAgKG91dHB1dClcbiAgICogICAgWSAgICAgICAgIDogQ2FsY3VsYXRlZCBHZW9jZW50cmljIFkgY29vcmRpbmF0ZSwgaW4gbWV0ZXJzICAgIChvdXRwdXQpXG4gICAqICAgIFogICAgICAgICA6IENhbGN1bGF0ZWQgR2VvY2VudHJpYyBaIGNvb3JkaW5hdGUsIGluIG1ldGVycyAgICAob3V0cHV0KVxuICAgKlxuICAgKi9cbiAgZ2VvZGV0aWNfdG9fZ2VvY2VudHJpYzogZnVuY3Rpb24ocCkge1xuICAgIHZhciBMb25naXR1ZGUgPSBwLng7XG4gICAgdmFyIExhdGl0dWRlID0gcC55O1xuICAgIHZhciBIZWlnaHQgPSBwLnogPyBwLnogOiAwOyAvL1ogdmFsdWUgbm90IGFsd2F5cyBzdXBwbGllZFxuICAgIHZhciBYOyAvLyBvdXRwdXRcbiAgICB2YXIgWTtcbiAgICB2YXIgWjtcblxuICAgIHZhciBFcnJvcl9Db2RlID0gMDsgLy8gIEdFT0NFTlRfTk9fRVJST1I7XG4gICAgdmFyIFJuOyAvKiAgRWFydGggcmFkaXVzIGF0IGxvY2F0aW9uICAqL1xuICAgIHZhciBTaW5fTGF0OyAvKiAgTWF0aC5zaW4oTGF0aXR1ZGUpICAqL1xuICAgIHZhciBTaW4yX0xhdDsgLyogIFNxdWFyZSBvZiBNYXRoLnNpbihMYXRpdHVkZSkgICovXG4gICAgdmFyIENvc19MYXQ7IC8qICBNYXRoLmNvcyhMYXRpdHVkZSkgICovXG5cbiAgICAvKlxuICAgICAqKiBEb24ndCBibG93IHVwIGlmIExhdGl0dWRlIGlzIGp1c3QgYSBsaXR0bGUgb3V0IG9mIHRoZSB2YWx1ZVxuICAgICAqKiByYW5nZSBhcyBpdCBtYXkganVzdCBiZSBhIHJvdW5kaW5nIGlzc3VlLiAgQWxzbyByZW1vdmVkIGxvbmdpdHVkZVxuICAgICAqKiB0ZXN0LCBpdCBzaG91bGQgYmUgd3JhcHBlZCBieSBNYXRoLmNvcygpIGFuZCBNYXRoLnNpbigpLiAgTkZXIGZvciBQUk9KLjQsIFNlcC8yMDAxLlxuICAgICAqL1xuICAgIGlmIChMYXRpdHVkZSA8IC1IQUxGX1BJICYmIExhdGl0dWRlID4gLTEuMDAxICogSEFMRl9QSSkge1xuICAgICAgTGF0aXR1ZGUgPSAtSEFMRl9QSTtcbiAgICB9XG4gICAgZWxzZSBpZiAoTGF0aXR1ZGUgPiBIQUxGX1BJICYmIExhdGl0dWRlIDwgMS4wMDEgKiBIQUxGX1BJKSB7XG4gICAgICBMYXRpdHVkZSA9IEhBTEZfUEk7XG4gICAgfVxuICAgIGVsc2UgaWYgKChMYXRpdHVkZSA8IC1IQUxGX1BJKSB8fCAoTGF0aXR1ZGUgPiBIQUxGX1BJKSkge1xuICAgICAgLyogTGF0aXR1ZGUgb3V0IG9mIHJhbmdlICovXG4gICAgICAvLy4ucmVwb3J0RXJyb3IoJ2dlb2NlbnQ6bGF0IG91dCBvZiByYW5nZTonICsgTGF0aXR1ZGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKExvbmdpdHVkZSA+IE1hdGguUEkpIHtcbiAgICAgIExvbmdpdHVkZSAtPSAoMiAqIE1hdGguUEkpO1xuICAgIH1cbiAgICBTaW5fTGF0ID0gTWF0aC5zaW4oTGF0aXR1ZGUpO1xuICAgIENvc19MYXQgPSBNYXRoLmNvcyhMYXRpdHVkZSk7XG4gICAgU2luMl9MYXQgPSBTaW5fTGF0ICogU2luX0xhdDtcbiAgICBSbiA9IHRoaXMuYSAvIChNYXRoLnNxcnQoMS4wZTAgLSB0aGlzLmVzICogU2luMl9MYXQpKTtcbiAgICBYID0gKFJuICsgSGVpZ2h0KSAqIENvc19MYXQgKiBNYXRoLmNvcyhMb25naXR1ZGUpO1xuICAgIFkgPSAoUm4gKyBIZWlnaHQpICogQ29zX0xhdCAqIE1hdGguc2luKExvbmdpdHVkZSk7XG4gICAgWiA9ICgoUm4gKiAoMSAtIHRoaXMuZXMpKSArIEhlaWdodCkgKiBTaW5fTGF0O1xuXG4gICAgcC54ID0gWDtcbiAgICBwLnkgPSBZO1xuICAgIHAueiA9IFo7XG4gICAgcmV0dXJuIEVycm9yX0NvZGU7XG4gIH0sIC8vIGNzX2dlb2RldGljX3RvX2dlb2NlbnRyaWMoKVxuXG5cbiAgZ2VvY2VudHJpY190b19nZW9kZXRpYzogZnVuY3Rpb24ocCkge1xuICAgIC8qIGxvY2FsIGRlZmludGlvbnMgYW5kIHZhcmlhYmxlcyAqL1xuICAgIC8qIGVuZC1jcml0ZXJpdW0gb2YgbG9vcCwgYWNjdXJhY3kgb2Ygc2luKExhdGl0dWRlKSAqL1xuICAgIHZhciBnZW5hdSA9IDFlLTEyO1xuICAgIHZhciBnZW5hdTIgPSAoZ2VuYXUgKiBnZW5hdSk7XG4gICAgdmFyIG1heGl0ZXIgPSAzMDtcblxuICAgIHZhciBQOyAvKiBkaXN0YW5jZSBiZXR3ZWVuIHNlbWktbWlub3IgYXhpcyBhbmQgbG9jYXRpb24gKi9cbiAgICB2YXIgUlI7IC8qIGRpc3RhbmNlIGJldHdlZW4gY2VudGVyIGFuZCBsb2NhdGlvbiAqL1xuICAgIHZhciBDVDsgLyogc2luIG9mIGdlb2NlbnRyaWMgbGF0aXR1ZGUgKi9cbiAgICB2YXIgU1Q7IC8qIGNvcyBvZiBnZW9jZW50cmljIGxhdGl0dWRlICovXG4gICAgdmFyIFJYO1xuICAgIHZhciBSSztcbiAgICB2YXIgUk47IC8qIEVhcnRoIHJhZGl1cyBhdCBsb2NhdGlvbiAqL1xuICAgIHZhciBDUEhJMDsgLyogY29zIG9mIHN0YXJ0IG9yIG9sZCBnZW9kZXRpYyBsYXRpdHVkZSBpbiBpdGVyYXRpb25zICovXG4gICAgdmFyIFNQSEkwOyAvKiBzaW4gb2Ygc3RhcnQgb3Igb2xkIGdlb2RldGljIGxhdGl0dWRlIGluIGl0ZXJhdGlvbnMgKi9cbiAgICB2YXIgQ1BISTsgLyogY29zIG9mIHNlYXJjaGVkIGdlb2RldGljIGxhdGl0dWRlICovXG4gICAgdmFyIFNQSEk7IC8qIHNpbiBvZiBzZWFyY2hlZCBnZW9kZXRpYyBsYXRpdHVkZSAqL1xuICAgIHZhciBTRFBISTsgLyogZW5kLWNyaXRlcml1bTogYWRkaXRpb24tdGhlb3JlbSBvZiBzaW4oTGF0aXR1ZGUoaXRlciktTGF0aXR1ZGUoaXRlci0xKSkgKi9cbiAgICB2YXIgQXRfUG9sZTsgLyogaW5kaWNhdGVzIGxvY2F0aW9uIGlzIGluIHBvbGFyIHJlZ2lvbiAqL1xuICAgIHZhciBpdGVyOyAvKiAjIG9mIGNvbnRpbm91cyBpdGVyYXRpb24sIG1heC4gMzAgaXMgYWx3YXlzIGVub3VnaCAocy5hLikgKi9cblxuICAgIHZhciBYID0gcC54O1xuICAgIHZhciBZID0gcC55O1xuICAgIHZhciBaID0gcC56ID8gcC56IDogMC4wOyAvL1ogdmFsdWUgbm90IGFsd2F5cyBzdXBwbGllZFxuICAgIHZhciBMb25naXR1ZGU7XG4gICAgdmFyIExhdGl0dWRlO1xuICAgIHZhciBIZWlnaHQ7XG5cbiAgICBBdF9Qb2xlID0gZmFsc2U7XG4gICAgUCA9IE1hdGguc3FydChYICogWCArIFkgKiBZKTtcbiAgICBSUiA9IE1hdGguc3FydChYICogWCArIFkgKiBZICsgWiAqIFopO1xuXG4gICAgLyogICAgICBzcGVjaWFsIGNhc2VzIGZvciBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlICovXG4gICAgaWYgKFAgLyB0aGlzLmEgPCBnZW5hdSkge1xuXG4gICAgICAvKiAgc3BlY2lhbCBjYXNlLCBpZiBQPTAuIChYPTAuLCBZPTAuKSAqL1xuICAgICAgQXRfUG9sZSA9IHRydWU7XG4gICAgICBMb25naXR1ZGUgPSAwLjA7XG5cbiAgICAgIC8qICBpZiAoWCxZLFopPSgwLiwwLiwwLikgdGhlbiBIZWlnaHQgYmVjb21lcyBzZW1pLW1pbm9yIGF4aXNcbiAgICAgICAqICBvZiBlbGxpcHNvaWQgKD1jZW50ZXIgb2YgbWFzcyksIExhdGl0dWRlIGJlY29tZXMgUEkvMiAqL1xuICAgICAgaWYgKFJSIC8gdGhpcy5hIDwgZ2VuYXUpIHtcbiAgICAgICAgTGF0aXR1ZGUgPSBIQUxGX1BJO1xuICAgICAgICBIZWlnaHQgPSAtdGhpcy5iO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLyogIGVsbGlwc29pZGFsIChnZW9kZXRpYykgbG9uZ2l0dWRlXG4gICAgICAgKiAgaW50ZXJ2YWw6IC1QSSA8IExvbmdpdHVkZSA8PSArUEkgKi9cbiAgICAgIExvbmdpdHVkZSA9IE1hdGguYXRhbjIoWSwgWCk7XG4gICAgfVxuXG4gICAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgKiBGb2xsb3dpbmcgaXRlcmF0aXZlIGFsZ29yaXRobSB3YXMgZGV2ZWxvcHBlZCBieVxuICAgICAqIFwiSW5zdGl0dXQgZm9yIEVyZG1lc3N1bmdcIiwgVW5pdmVyc2l0eSBvZiBIYW5ub3ZlciwgSnVseSAxOTg4LlxuICAgICAqIEludGVybmV0OiB3d3cuaWZlLnVuaS1oYW5ub3Zlci5kZVxuICAgICAqIEl0ZXJhdGl2ZSBjb21wdXRhdGlvbiBvZiBDUEhJLFNQSEkgYW5kIEhlaWdodC5cbiAgICAgKiBJdGVyYXRpb24gb2YgQ1BISSBhbmQgU1BISSB0byAxMCoqLTEyIHJhZGlhbiByZXNwLlxuICAgICAqIDIqMTAqKi03IGFyY3NlYy5cbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAqL1xuICAgIENUID0gWiAvIFJSO1xuICAgIFNUID0gUCAvIFJSO1xuICAgIFJYID0gMS4wIC8gTWF0aC5zcXJ0KDEuMCAtIHRoaXMuZXMgKiAoMi4wIC0gdGhpcy5lcykgKiBTVCAqIFNUKTtcbiAgICBDUEhJMCA9IFNUICogKDEuMCAtIHRoaXMuZXMpICogUlg7XG4gICAgU1BISTAgPSBDVCAqIFJYO1xuICAgIGl0ZXIgPSAwO1xuXG4gICAgLyogbG9vcCB0byBmaW5kIHNpbihMYXRpdHVkZSkgcmVzcC4gTGF0aXR1ZGVcbiAgICAgKiB1bnRpbCB8c2luKExhdGl0dWRlKGl0ZXIpLUxhdGl0dWRlKGl0ZXItMSkpfCA8IGdlbmF1ICovXG4gICAgZG8ge1xuICAgICAgaXRlcisrO1xuICAgICAgUk4gPSB0aGlzLmEgLyBNYXRoLnNxcnQoMS4wIC0gdGhpcy5lcyAqIFNQSEkwICogU1BISTApO1xuXG4gICAgICAvKiAgZWxsaXBzb2lkYWwgKGdlb2RldGljKSBoZWlnaHQgKi9cbiAgICAgIEhlaWdodCA9IFAgKiBDUEhJMCArIFogKiBTUEhJMCAtIFJOICogKDEuMCAtIHRoaXMuZXMgKiBTUEhJMCAqIFNQSEkwKTtcblxuICAgICAgUksgPSB0aGlzLmVzICogUk4gLyAoUk4gKyBIZWlnaHQpO1xuICAgICAgUlggPSAxLjAgLyBNYXRoLnNxcnQoMS4wIC0gUksgKiAoMi4wIC0gUkspICogU1QgKiBTVCk7XG4gICAgICBDUEhJID0gU1QgKiAoMS4wIC0gUkspICogUlg7XG4gICAgICBTUEhJID0gQ1QgKiBSWDtcbiAgICAgIFNEUEhJID0gU1BISSAqIENQSEkwIC0gQ1BISSAqIFNQSEkwO1xuICAgICAgQ1BISTAgPSBDUEhJO1xuICAgICAgU1BISTAgPSBTUEhJO1xuICAgIH1cbiAgICB3aGlsZSAoU0RQSEkgKiBTRFBISSA+IGdlbmF1MiAmJiBpdGVyIDwgbWF4aXRlcik7XG5cbiAgICAvKiAgICAgIGVsbGlwc29pZGFsIChnZW9kZXRpYykgbGF0aXR1ZGUgKi9cbiAgICBMYXRpdHVkZSA9IE1hdGguYXRhbihTUEhJIC8gTWF0aC5hYnMoQ1BISSkpO1xuXG4gICAgcC54ID0gTG9uZ2l0dWRlO1xuICAgIHAueSA9IExhdGl0dWRlO1xuICAgIHAueiA9IEhlaWdodDtcbiAgICByZXR1cm4gcDtcbiAgfSwgLy8gY3NfZ2VvY2VudHJpY190b19nZW9kZXRpYygpXG5cbiAgLyoqIENvbnZlcnRfR2VvY2VudHJpY19Ub19HZW9kZXRpY1xuICAgKiBUaGUgbWV0aG9kIHVzZWQgaGVyZSBpcyBkZXJpdmVkIGZyb20gJ0FuIEltcHJvdmVkIEFsZ29yaXRobSBmb3JcbiAgICogR2VvY2VudHJpYyB0byBHZW9kZXRpYyBDb29yZGluYXRlIENvbnZlcnNpb24nLCBieSBSYWxwaCBUb21zLCBGZWIgMTk5NlxuICAgKi9cbiAgZ2VvY2VudHJpY190b19nZW9kZXRpY19ub25pdGVyOiBmdW5jdGlvbihwKSB7XG4gICAgdmFyIFggPSBwLng7XG4gICAgdmFyIFkgPSBwLnk7XG4gICAgdmFyIFogPSBwLnogPyBwLnogOiAwOyAvL1ogdmFsdWUgbm90IGFsd2F5cyBzdXBwbGllZFxuICAgIHZhciBMb25naXR1ZGU7XG4gICAgdmFyIExhdGl0dWRlO1xuICAgIHZhciBIZWlnaHQ7XG5cbiAgICB2YXIgVzsgLyogZGlzdGFuY2UgZnJvbSBaIGF4aXMgKi9cbiAgICB2YXIgVzI7IC8qIHNxdWFyZSBvZiBkaXN0YW5jZSBmcm9tIFogYXhpcyAqL1xuICAgIHZhciBUMDsgLyogaW5pdGlhbCBlc3RpbWF0ZSBvZiB2ZXJ0aWNhbCBjb21wb25lbnQgKi9cbiAgICB2YXIgVDE7IC8qIGNvcnJlY3RlZCBlc3RpbWF0ZSBvZiB2ZXJ0aWNhbCBjb21wb25lbnQgKi9cbiAgICB2YXIgUzA7IC8qIGluaXRpYWwgZXN0aW1hdGUgb2YgaG9yaXpvbnRhbCBjb21wb25lbnQgKi9cbiAgICB2YXIgUzE7IC8qIGNvcnJlY3RlZCBlc3RpbWF0ZSBvZiBob3Jpem9udGFsIGNvbXBvbmVudCAqL1xuICAgIHZhciBTaW5fQjA7IC8qIE1hdGguc2luKEIwKSwgQjAgaXMgZXN0aW1hdGUgb2YgQm93cmluZyBhdXggdmFyaWFibGUgKi9cbiAgICB2YXIgU2luM19CMDsgLyogY3ViZSBvZiBNYXRoLnNpbihCMCkgKi9cbiAgICB2YXIgQ29zX0IwOyAvKiBNYXRoLmNvcyhCMCkgKi9cbiAgICB2YXIgU2luX3AxOyAvKiBNYXRoLnNpbihwaGkxKSwgcGhpMSBpcyBlc3RpbWF0ZWQgbGF0aXR1ZGUgKi9cbiAgICB2YXIgQ29zX3AxOyAvKiBNYXRoLmNvcyhwaGkxKSAqL1xuICAgIHZhciBSbjsgLyogRWFydGggcmFkaXVzIGF0IGxvY2F0aW9uICovXG4gICAgdmFyIFN1bTsgLyogbnVtZXJhdG9yIG9mIE1hdGguY29zKHBoaTEpICovXG4gICAgdmFyIEF0X1BvbGU7IC8qIGluZGljYXRlcyBsb2NhdGlvbiBpcyBpbiBwb2xhciByZWdpb24gKi9cblxuICAgIFggPSBwYXJzZUZsb2F0KFgpOyAvLyBjYXN0IGZyb20gc3RyaW5nIHRvIGZsb2F0XG4gICAgWSA9IHBhcnNlRmxvYXQoWSk7XG4gICAgWiA9IHBhcnNlRmxvYXQoWik7XG5cbiAgICBBdF9Qb2xlID0gZmFsc2U7XG4gICAgaWYgKFggIT09IDAuMCkge1xuICAgICAgTG9uZ2l0dWRlID0gTWF0aC5hdGFuMihZLCBYKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpZiAoWSA+IDApIHtcbiAgICAgICAgTG9uZ2l0dWRlID0gSEFMRl9QSTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKFkgPCAwKSB7XG4gICAgICAgIExvbmdpdHVkZSA9IC1IQUxGX1BJO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIEF0X1BvbGUgPSB0cnVlO1xuICAgICAgICBMb25naXR1ZGUgPSAwLjA7XG4gICAgICAgIGlmIChaID4gMC4wKSB7IC8qIG5vcnRoIHBvbGUgKi9cbiAgICAgICAgICBMYXRpdHVkZSA9IEhBTEZfUEk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoWiA8IDAuMCkgeyAvKiBzb3V0aCBwb2xlICovXG4gICAgICAgICAgTGF0aXR1ZGUgPSAtSEFMRl9QSTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLyogY2VudGVyIG9mIGVhcnRoICovXG4gICAgICAgICAgTGF0aXR1ZGUgPSBIQUxGX1BJO1xuICAgICAgICAgIEhlaWdodCA9IC10aGlzLmI7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFcyID0gWCAqIFggKyBZICogWTtcbiAgICBXID0gTWF0aC5zcXJ0KFcyKTtcbiAgICBUMCA9IFogKiBBRF9DO1xuICAgIFMwID0gTWF0aC5zcXJ0KFQwICogVDAgKyBXMik7XG4gICAgU2luX0IwID0gVDAgLyBTMDtcbiAgICBDb3NfQjAgPSBXIC8gUzA7XG4gICAgU2luM19CMCA9IFNpbl9CMCAqIFNpbl9CMCAqIFNpbl9CMDtcbiAgICBUMSA9IFogKyB0aGlzLmIgKiB0aGlzLmVwMiAqIFNpbjNfQjA7XG4gICAgU3VtID0gVyAtIHRoaXMuYSAqIHRoaXMuZXMgKiBDb3NfQjAgKiBDb3NfQjAgKiBDb3NfQjA7XG4gICAgUzEgPSBNYXRoLnNxcnQoVDEgKiBUMSArIFN1bSAqIFN1bSk7XG4gICAgU2luX3AxID0gVDEgLyBTMTtcbiAgICBDb3NfcDEgPSBTdW0gLyBTMTtcbiAgICBSbiA9IHRoaXMuYSAvIE1hdGguc3FydCgxLjAgLSB0aGlzLmVzICogU2luX3AxICogU2luX3AxKTtcbiAgICBpZiAoQ29zX3AxID49IENPU182N1A1KSB7XG4gICAgICBIZWlnaHQgPSBXIC8gQ29zX3AxIC0gUm47XG4gICAgfVxuICAgIGVsc2UgaWYgKENvc19wMSA8PSAtQ09TXzY3UDUpIHtcbiAgICAgIEhlaWdodCA9IFcgLyAtQ29zX3AxIC0gUm47XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgSGVpZ2h0ID0gWiAvIFNpbl9wMSArIFJuICogKHRoaXMuZXMgLSAxLjApO1xuICAgIH1cbiAgICBpZiAoQXRfUG9sZSA9PT0gZmFsc2UpIHtcbiAgICAgIExhdGl0dWRlID0gTWF0aC5hdGFuKFNpbl9wMSAvIENvc19wMSk7XG4gICAgfVxuXG4gICAgcC54ID0gTG9uZ2l0dWRlO1xuICAgIHAueSA9IExhdGl0dWRlO1xuICAgIHAueiA9IEhlaWdodDtcbiAgICByZXR1cm4gcDtcbiAgfSwgLy8gZ2VvY2VudHJpY190b19nZW9kZXRpY19ub25pdGVyKClcblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgLy8gcGpfZ2VvY2VudGljX3RvX3dnczg0KCBwIClcbiAgLy8gIHAgPSBwb2ludCB0byB0cmFuc2Zvcm0gaW4gZ2VvY2VudHJpYyBjb29yZGluYXRlcyAoeCx5LHopXG4gIGdlb2NlbnRyaWNfdG9fd2dzODQ6IGZ1bmN0aW9uKHApIHtcblxuICAgIGlmICh0aGlzLmRhdHVtX3R5cGUgPT09IFBKRF8zUEFSQU0pIHtcbiAgICAgIC8vIGlmKCB4W2lvXSA9PT0gSFVHRV9WQUwgKVxuICAgICAgLy8gICAgY29udGludWU7XG4gICAgICBwLnggKz0gdGhpcy5kYXR1bV9wYXJhbXNbMF07XG4gICAgICBwLnkgKz0gdGhpcy5kYXR1bV9wYXJhbXNbMV07XG4gICAgICBwLnogKz0gdGhpcy5kYXR1bV9wYXJhbXNbMl07XG5cbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5kYXR1bV90eXBlID09PSBQSkRfN1BBUkFNKSB7XG4gICAgICB2YXIgRHhfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1swXTtcbiAgICAgIHZhciBEeV9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzFdO1xuICAgICAgdmFyIER6X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbMl07XG4gICAgICB2YXIgUnhfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1szXTtcbiAgICAgIHZhciBSeV9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzRdO1xuICAgICAgdmFyIFJ6X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbNV07XG4gICAgICB2YXIgTV9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzZdO1xuICAgICAgLy8gaWYoIHhbaW9dID09PSBIVUdFX1ZBTCApXG4gICAgICAvLyAgICBjb250aW51ZTtcbiAgICAgIHZhciB4X291dCA9IE1fQkYgKiAocC54IC0gUnpfQkYgKiBwLnkgKyBSeV9CRiAqIHAueikgKyBEeF9CRjtcbiAgICAgIHZhciB5X291dCA9IE1fQkYgKiAoUnpfQkYgKiBwLnggKyBwLnkgLSBSeF9CRiAqIHAueikgKyBEeV9CRjtcbiAgICAgIHZhciB6X291dCA9IE1fQkYgKiAoLVJ5X0JGICogcC54ICsgUnhfQkYgKiBwLnkgKyBwLnopICsgRHpfQkY7XG4gICAgICBwLnggPSB4X291dDtcbiAgICAgIHAueSA9IHlfb3V0O1xuICAgICAgcC56ID0gel9vdXQ7XG4gICAgfVxuICB9LCAvLyBjc19nZW9jZW50cmljX3RvX3dnczg0XG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIC8vIHBqX2dlb2NlbnRpY19mcm9tX3dnczg0KClcbiAgLy8gIGNvb3JkaW5hdGUgc3lzdGVtIGRlZmluaXRpb24sXG4gIC8vICBwb2ludCB0byB0cmFuc2Zvcm0gaW4gZ2VvY2VudHJpYyBjb29yZGluYXRlcyAoeCx5LHopXG4gIGdlb2NlbnRyaWNfZnJvbV93Z3M4NDogZnVuY3Rpb24ocCkge1xuXG4gICAgaWYgKHRoaXMuZGF0dW1fdHlwZSA9PT0gUEpEXzNQQVJBTSkge1xuICAgICAgLy9pZiggeFtpb10gPT09IEhVR0VfVkFMIClcbiAgICAgIC8vICAgIGNvbnRpbnVlO1xuICAgICAgcC54IC09IHRoaXMuZGF0dW1fcGFyYW1zWzBdO1xuICAgICAgcC55IC09IHRoaXMuZGF0dW1fcGFyYW1zWzFdO1xuICAgICAgcC56IC09IHRoaXMuZGF0dW1fcGFyYW1zWzJdO1xuXG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZGF0dW1fdHlwZSA9PT0gUEpEXzdQQVJBTSkge1xuICAgICAgdmFyIER4X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbMF07XG4gICAgICB2YXIgRHlfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1sxXTtcbiAgICAgIHZhciBEel9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzJdO1xuICAgICAgdmFyIFJ4X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbM107XG4gICAgICB2YXIgUnlfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1s0XTtcbiAgICAgIHZhciBSel9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzVdO1xuICAgICAgdmFyIE1fQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1s2XTtcbiAgICAgIHZhciB4X3RtcCA9IChwLnggLSBEeF9CRikgLyBNX0JGO1xuICAgICAgdmFyIHlfdG1wID0gKHAueSAtIER5X0JGKSAvIE1fQkY7XG4gICAgICB2YXIgel90bXAgPSAocC56IC0gRHpfQkYpIC8gTV9CRjtcbiAgICAgIC8vaWYoIHhbaW9dID09PSBIVUdFX1ZBTCApXG4gICAgICAvLyAgICBjb250aW51ZTtcblxuICAgICAgcC54ID0geF90bXAgKyBSel9CRiAqIHlfdG1wIC0gUnlfQkYgKiB6X3RtcDtcbiAgICAgIHAueSA9IC1Sel9CRiAqIHhfdG1wICsgeV90bXAgKyBSeF9CRiAqIHpfdG1wO1xuICAgICAgcC56ID0gUnlfQkYgKiB4X3RtcCAtIFJ4X0JGICogeV90bXAgKyB6X3RtcDtcbiAgICB9IC8vY3NfZ2VvY2VudHJpY19mcm9tX3dnczg0KClcbiAgfVxufTtcblxuLyoqIHBvaW50IG9iamVjdCwgbm90aGluZyBmYW5jeSwganVzdCBhbGxvd3MgdmFsdWVzIHRvIGJlXG4gICAgcGFzc2VkIGJhY2sgYW5kIGZvcnRoIGJ5IHJlZmVyZW5jZSByYXRoZXIgdGhhbiBieSB2YWx1ZS5cbiAgICBPdGhlciBwb2ludCBjbGFzc2VzIG1heSBiZSB1c2VkIGFzIGxvbmcgYXMgdGhleSBoYXZlXG4gICAgeCBhbmQgeSBwcm9wZXJ0aWVzLCB3aGljaCB3aWxsIGdldCBtb2RpZmllZCBpbiB0aGUgdHJhbnNmb3JtIG1ldGhvZC5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGRhdHVtO1xuIiwidmFyIFBKRF8zUEFSQU0gPSAxO1xudmFyIFBKRF83UEFSQU0gPSAyO1xudmFyIFBKRF9HUklEU0hJRlQgPSAzO1xudmFyIFBKRF9OT0RBVFVNID0gNTsgLy8gV0dTODQgb3IgZXF1aXZhbGVudFxudmFyIFNSU19XR1M4NF9TRU1JTUFKT1IgPSA2Mzc4MTM3OyAvLyBvbmx5IHVzZWQgaW4gZ3JpZCBzaGlmdCB0cmFuc2Zvcm1zXG52YXIgU1JTX1dHUzg0X0VTUVVBUkVEID0gMC4wMDY2OTQzNzk5OTAxNDEzMTY7IC8vREdSOiAyMDEyLTA3LTI5XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNvdXJjZSwgZGVzdCwgcG9pbnQpIHtcbiAgdmFyIHdwLCBpLCBsO1xuXG4gIGZ1bmN0aW9uIGNoZWNrUGFyYW1zKGZhbGxiYWNrKSB7XG4gICAgcmV0dXJuIChmYWxsYmFjayA9PT0gUEpEXzNQQVJBTSB8fCBmYWxsYmFjayA9PT0gUEpEXzdQQVJBTSk7XG4gIH1cbiAgLy8gU2hvcnQgY3V0IGlmIHRoZSBkYXR1bXMgYXJlIGlkZW50aWNhbC5cbiAgaWYgKHNvdXJjZS5jb21wYXJlX2RhdHVtcyhkZXN0KSkge1xuICAgIHJldHVybiBwb2ludDsgLy8gaW4gdGhpcyBjYXNlLCB6ZXJvIGlzIHN1Y2VzcyxcbiAgICAvLyB3aGVyZWFzIGNzX2NvbXBhcmVfZGF0dW1zIHJldHVybnMgMSB0byBpbmRpY2F0ZSBUUlVFXG4gICAgLy8gY29uZnVzaW5nLCBzaG91bGQgZml4IHRoaXNcbiAgfVxuXG4gIC8vIEV4cGxpY2l0bHkgc2tpcCBkYXR1bSB0cmFuc2Zvcm0gYnkgc2V0dGluZyAnZGF0dW09bm9uZScgYXMgcGFyYW1ldGVyIGZvciBlaXRoZXIgc291cmNlIG9yIGRlc3RcbiAgaWYgKHNvdXJjZS5kYXR1bV90eXBlID09PSBQSkRfTk9EQVRVTSB8fCBkZXN0LmRhdHVtX3R5cGUgPT09IFBKRF9OT0RBVFVNKSB7XG4gICAgcmV0dXJuIHBvaW50O1xuICB9XG5cbiAgLy9ER1I6IDIwMTItMDctMjkgOiBhZGQgbmFkZ3JpZHMgc3VwcG9ydCAoYmVnaW4pXG4gIHZhciBzcmNfYSA9IHNvdXJjZS5hO1xuICB2YXIgc3JjX2VzID0gc291cmNlLmVzO1xuXG4gIHZhciBkc3RfYSA9IGRlc3QuYTtcbiAgdmFyIGRzdF9lcyA9IGRlc3QuZXM7XG5cbiAgdmFyIGZhbGxiYWNrID0gc291cmNlLmRhdHVtX3R5cGU7XG4gIC8vIElmIHRoaXMgZGF0dW0gcmVxdWlyZXMgZ3JpZCBzaGlmdHMsIHRoZW4gYXBwbHkgaXQgdG8gZ2VvZGV0aWMgY29vcmRpbmF0ZXMuXG4gIGlmIChmYWxsYmFjayA9PT0gUEpEX0dSSURTSElGVCkge1xuICAgIGlmICh0aGlzLmFwcGx5X2dyaWRzaGlmdChzb3VyY2UsIDAsIHBvaW50KSA9PT0gMCkge1xuICAgICAgc291cmNlLmEgPSBTUlNfV0dTODRfU0VNSU1BSk9SO1xuICAgICAgc291cmNlLmVzID0gU1JTX1dHUzg0X0VTUVVBUkVEO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHRyeSAzIG9yIDcgcGFyYW1zIHRyYW5zZm9ybWF0aW9uIG9yIG5vdGhpbmcgP1xuICAgICAgaWYgKCFzb3VyY2UuZGF0dW1fcGFyYW1zKSB7XG4gICAgICAgIHNvdXJjZS5hID0gc3JjX2E7XG4gICAgICAgIHNvdXJjZS5lcyA9IHNvdXJjZS5lcztcbiAgICAgICAgcmV0dXJuIHBvaW50O1xuICAgICAgfVxuICAgICAgd3AgPSAxO1xuICAgICAgZm9yIChpID0gMCwgbCA9IHNvdXJjZS5kYXR1bV9wYXJhbXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHdwICo9IHNvdXJjZS5kYXR1bV9wYXJhbXNbaV07XG4gICAgICB9XG4gICAgICBpZiAod3AgPT09IDApIHtcbiAgICAgICAgc291cmNlLmEgPSBzcmNfYTtcbiAgICAgICAgc291cmNlLmVzID0gc291cmNlLmVzO1xuICAgICAgICByZXR1cm4gcG9pbnQ7XG4gICAgICB9XG4gICAgICBpZiAoc291cmNlLmRhdHVtX3BhcmFtcy5sZW5ndGggPiAzKSB7XG4gICAgICAgIGZhbGxiYWNrID0gUEpEXzdQQVJBTTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBmYWxsYmFjayA9IFBKRF8zUEFSQU07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChkZXN0LmRhdHVtX3R5cGUgPT09IFBKRF9HUklEU0hJRlQpIHtcbiAgICBkZXN0LmEgPSBTUlNfV0dTODRfU0VNSU1BSk9SO1xuICAgIGRlc3QuZXMgPSBTUlNfV0dTODRfRVNRVUFSRUQ7XG4gIH1cbiAgLy8gRG8gd2UgbmVlZCB0byBnbyB0aHJvdWdoIGdlb2NlbnRyaWMgY29vcmRpbmF0ZXM/XG4gIGlmIChzb3VyY2UuZXMgIT09IGRlc3QuZXMgfHwgc291cmNlLmEgIT09IGRlc3QuYSB8fCBjaGVja1BhcmFtcyhmYWxsYmFjaykgfHwgY2hlY2tQYXJhbXMoZGVzdC5kYXR1bV90eXBlKSkge1xuICAgIC8vREdSOiAyMDEyLTA3LTI5IDogYWRkIG5hZGdyaWRzIHN1cHBvcnQgKGVuZClcbiAgICAvLyBDb252ZXJ0IHRvIGdlb2NlbnRyaWMgY29vcmRpbmF0ZXMuXG4gICAgc291cmNlLmdlb2RldGljX3RvX2dlb2NlbnRyaWMocG9pbnQpO1xuICAgIC8vIENIRUNLX1JFVFVSTjtcbiAgICAvLyBDb252ZXJ0IGJldHdlZW4gZGF0dW1zXG4gICAgaWYgKGNoZWNrUGFyYW1zKHNvdXJjZS5kYXR1bV90eXBlKSkge1xuICAgICAgc291cmNlLmdlb2NlbnRyaWNfdG9fd2dzODQocG9pbnQpO1xuICAgICAgLy8gQ0hFQ0tfUkVUVVJOO1xuICAgIH1cbiAgICBpZiAoY2hlY2tQYXJhbXMoZGVzdC5kYXR1bV90eXBlKSkge1xuICAgICAgZGVzdC5nZW9jZW50cmljX2Zyb21fd2dzODQocG9pbnQpO1xuICAgICAgLy8gQ0hFQ0tfUkVUVVJOO1xuICAgIH1cbiAgICAvLyBDb252ZXJ0IGJhY2sgdG8gZ2VvZGV0aWMgY29vcmRpbmF0ZXNcbiAgICBkZXN0Lmdlb2NlbnRyaWNfdG9fZ2VvZGV0aWMocG9pbnQpO1xuICAgIC8vIENIRUNLX1JFVFVSTjtcbiAgfVxuICAvLyBBcHBseSBncmlkIHNoaWZ0IHRvIGRlc3RpbmF0aW9uIGlmIHJlcXVpcmVkXG4gIGlmIChkZXN0LmRhdHVtX3R5cGUgPT09IFBKRF9HUklEU0hJRlQpIHtcbiAgICB0aGlzLmFwcGx5X2dyaWRzaGlmdChkZXN0LCAxLCBwb2ludCk7XG4gICAgLy8gQ0hFQ0tfUkVUVVJOO1xuICB9XG5cbiAgc291cmNlLmEgPSBzcmNfYTtcbiAgc291cmNlLmVzID0gc3JjX2VzO1xuICBkZXN0LmEgPSBkc3RfYTtcbiAgZGVzdC5lcyA9IGRzdF9lcztcblxuICByZXR1cm4gcG9pbnQ7XG59O1xuXG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4vZ2xvYmFsJyk7XG52YXIgcGFyc2VQcm9qID0gcmVxdWlyZSgnLi9wcm9qU3RyaW5nJyk7XG52YXIgd2t0ID0gcmVxdWlyZSgnLi93a3QnKTtcblxuZnVuY3Rpb24gZGVmcyhuYW1lKSB7XG4gIC8qZ2xvYmFsIGNvbnNvbGUqL1xuICB2YXIgdGhhdCA9IHRoaXM7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgdmFyIGRlZiA9IGFyZ3VtZW50c1sxXTtcbiAgICBpZiAodHlwZW9mIGRlZiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChkZWYuY2hhckF0KDApID09PSAnKycpIHtcbiAgICAgICAgZGVmc1tuYW1lXSA9IHBhcnNlUHJvaihhcmd1bWVudHNbMV0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGRlZnNbbmFtZV0gPSB3a3QoYXJndW1lbnRzWzFdKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGVmc1tuYW1lXSA9IGRlZjtcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gbmFtZS5tYXAoZnVuY3Rpb24odikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2KSkge1xuICAgICAgICAgIGRlZnMuYXBwbHkodGhhdCwgdik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVmcyh2KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKG5hbWUgaW4gZGVmcykge1xuICAgICAgICByZXR1cm4gZGVmc1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoJ0VQU0cnIGluIG5hbWUpIHtcbiAgICAgIGRlZnNbJ0VQU0c6JyArIG5hbWUuRVBTR10gPSBuYW1lO1xuICAgIH1cbiAgICBlbHNlIGlmICgnRVNSSScgaW4gbmFtZSkge1xuICAgICAgZGVmc1snRVNSSTonICsgbmFtZS5FU1JJXSA9IG5hbWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKCdJQVUyMDAwJyBpbiBuYW1lKSB7XG4gICAgICBkZWZzWydJQVUyMDAwOicgKyBuYW1lLklBVTIwMDBdID0gbmFtZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cblxufVxuZ2xvYmFscyhkZWZzKTtcbm1vZHVsZS5leHBvcnRzID0gZGVmcztcbiIsInZhciBEYXR1bSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL0RhdHVtJyk7XG52YXIgRWxsaXBzb2lkID0gcmVxdWlyZSgnLi9jb25zdGFudHMvRWxsaXBzb2lkJyk7XG52YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi9leHRlbmQnKTtcbnZhciBkYXR1bSA9IHJlcXVpcmUoJy4vZGF0dW0nKTtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG4vLyBlbGxpcG9pZCBwal9zZXRfZWxsLmNcbnZhciBTSVhUSCA9IDAuMTY2NjY2NjY2NjY2NjY2NjY2Nztcbi8qIDEvNiAqL1xudmFyIFJBNCA9IDAuMDQ3MjIyMjIyMjIyMjIyMjIyMjI7XG4vKiAxNy8zNjAgKi9cbnZhciBSQTYgPSAwLjAyMjE1NjA4NDY1NjA4NDY1NjA4O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihqc29uKSB7XG4gIC8vIERHUiAyMDExLTAzLTIwIDogbmFncmlkcyAtPiBuYWRncmlkc1xuICBpZiAoanNvbi5kYXR1bUNvZGUgJiYganNvbi5kYXR1bUNvZGUgIT09ICdub25lJykge1xuICAgIHZhciBkYXR1bURlZiA9IERhdHVtW2pzb24uZGF0dW1Db2RlXTtcbiAgICBpZiAoZGF0dW1EZWYpIHtcbiAgICAgIGpzb24uZGF0dW1fcGFyYW1zID0gZGF0dW1EZWYudG93Z3M4NCA/IGRhdHVtRGVmLnRvd2dzODQuc3BsaXQoJywnKSA6IG51bGw7XG4gICAgICBqc29uLmVsbHBzID0gZGF0dW1EZWYuZWxsaXBzZTtcbiAgICAgIGpzb24uZGF0dW1OYW1lID0gZGF0dW1EZWYuZGF0dW1OYW1lID8gZGF0dW1EZWYuZGF0dW1OYW1lIDoganNvbi5kYXR1bUNvZGU7XG4gICAgfVxuICB9XG4gIGlmICghanNvbi5hKSB7IC8vIGRvIHdlIGhhdmUgYW4gZWxsaXBzb2lkP1xuICAgIHZhciBlbGxpcHNlID0gRWxsaXBzb2lkW2pzb24uZWxscHNdID8gRWxsaXBzb2lkW2pzb24uZWxscHNdIDogRWxsaXBzb2lkLldHUzg0O1xuICAgIGV4dGVuZChqc29uLCBlbGxpcHNlKTtcbiAgfVxuICBpZiAoanNvbi5yZiAmJiAhanNvbi5iKSB7XG4gICAganNvbi5iID0gKDEuMCAtIDEuMCAvIGpzb24ucmYpICoganNvbi5hO1xuICB9XG4gIGlmIChqc29uLnJmID09PSAwIHx8IE1hdGguYWJzKGpzb24uYSAtIGpzb24uYikgPCBFUFNMTikge1xuICAgIGpzb24uc3BoZXJlID0gdHJ1ZTtcbiAgICBqc29uLmIgPSBqc29uLmE7XG4gIH1cbiAganNvbi5hMiA9IGpzb24uYSAqIGpzb24uYTsgLy8gdXNlZCBpbiBnZW9jZW50cmljXG4gIGpzb24uYjIgPSBqc29uLmIgKiBqc29uLmI7IC8vIHVzZWQgaW4gZ2VvY2VudHJpY1xuICBqc29uLmVzID0gKGpzb24uYTIgLSBqc29uLmIyKSAvIGpzb24uYTI7IC8vIGUgXiAyXG4gIGpzb24uZSA9IE1hdGguc3FydChqc29uLmVzKTsgLy8gZWNjZW50cmljaXR5XG4gIGlmIChqc29uLlJfQSkge1xuICAgIGpzb24uYSAqPSAxIC0ganNvbi5lcyAqIChTSVhUSCArIGpzb24uZXMgKiAoUkE0ICsganNvbi5lcyAqIFJBNikpO1xuICAgIGpzb24uYTIgPSBqc29uLmEgKiBqc29uLmE7XG4gICAganNvbi5iMiA9IGpzb24uYiAqIGpzb24uYjtcbiAgICBqc29uLmVzID0gMDtcbiAgfVxuICBqc29uLmVwMiA9IChqc29uLmEyIC0ganNvbi5iMikgLyBqc29uLmIyOyAvLyB1c2VkIGluIGdlb2NlbnRyaWNcbiAgaWYgKCFqc29uLmswKSB7XG4gICAganNvbi5rMCA9IDEuMDsgLy9kZWZhdWx0IHZhbHVlXG4gIH1cbiAgLy9ER1IgMjAxMC0xMS0xMjogYXhpc1xuICBpZiAoIWpzb24uYXhpcykge1xuICAgIGpzb24uYXhpcyA9IFwiZW51XCI7XG4gIH1cblxuICBpZiAoIWpzb24uZGF0dW0pIHtcbiAgICBqc29uLmRhdHVtID0gZGF0dW0oanNvbik7XG4gIH1cbiAgcmV0dXJuIGpzb247XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gIGRlc3RpbmF0aW9uID0gZGVzdGluYXRpb24gfHwge307XG4gIHZhciB2YWx1ZSwgcHJvcGVydHk7XG4gIGlmICghc291cmNlKSB7XG4gICAgcmV0dXJuIGRlc3RpbmF0aW9uO1xuICB9XG4gIGZvciAocHJvcGVydHkgaW4gc291cmNlKSB7XG4gICAgdmFsdWUgPSBzb3VyY2VbcHJvcGVydHldO1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkZXN0aW5hdGlvbltwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGVmcykge1xuICBkZWZzKCdFUFNHOjQzMjYnLCBcIit0aXRsZT1XR1MgODQgKGxvbmcvbGF0KSArcHJvaj1sb25nbGF0ICtlbGxwcz1XR1M4NCArZGF0dW09V0dTODQgK3VuaXRzPWRlZ3JlZXNcIik7XG4gIGRlZnMoJ0VQU0c6NDI2OScsIFwiK3RpdGxlPU5BRDgzIChsb25nL2xhdCkgK3Byb2o9bG9uZ2xhdCArYT02Mzc4MTM3LjAgK2I9NjM1Njc1Mi4zMTQxNDAzNiArZWxscHM9R1JTODAgK2RhdHVtPU5BRDgzICt1bml0cz1kZWdyZWVzXCIpO1xuICBkZWZzKCdFUFNHOjM4NTcnLCBcIit0aXRsZT1XR1MgODQgLyBQc2V1ZG8tTWVyY2F0b3IgK3Byb2o9bWVyYyArYT02Mzc4MTM3ICtiPTYzNzgxMzcgK2xhdF90cz0wLjAgK2xvbl8wPTAuMCAreF8wPTAuMCAreV8wPTAgK2s9MS4wICt1bml0cz1tICtuYWRncmlkcz1AbnVsbCArbm9fZGVmc1wiKTtcblxuICBkZWZzLldHUzg0ID0gZGVmc1snRVBTRzo0MzI2J107XG4gIGRlZnNbJ0VQU0c6Mzc4NSddID0gZGVmc1snRVBTRzozODU3J107IC8vIG1haW50YWluIGJhY2t3YXJkIGNvbXBhdCwgb2ZmaWNpYWwgY29kZSBpcyAzODU3XG4gIGRlZnMuR09PR0xFID0gZGVmc1snRVBTRzozODU3J107XG4gIGRlZnNbJ0VQU0c6OTAwOTEzJ10gPSBkZWZzWydFUFNHOjM4NTcnXTtcbiAgZGVmc1snRVBTRzoxMDIxMTMnXSA9IGRlZnNbJ0VQU0c6Mzg1NyddO1xufTtcbiIsInZhciBwcm9qcyA9IFtcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy90bWVyYycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL3V0bScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL3N0ZXJlYScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL3N0ZXJlJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvc29tZXJjJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvb21lcmMnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9sY2MnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9rcm92YWsnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9jYXNzJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvbGFlYScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2FlYScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2dub20nKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9jZWEnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9lcWMnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9wb2x5JyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvbnptZycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL21pbGwnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9zaW51JyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvbW9sbCcpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2VxZGMnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy92YW5kZycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2FlcWQnKVxuXTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocHJvajQpe1xuICBwcm9qcy5mb3JFYWNoKGZ1bmN0aW9uKHByb2ope1xuICAgIHByb2o0LlByb2oucHJvamVjdGlvbnMuYWRkKHByb2opO1xuICB9KTtcbn07IiwidmFyIHByb2o0ID0gcmVxdWlyZSgnLi9jb3JlJyk7XG5wcm9qNC5kZWZhdWx0RGF0dW0gPSAnV0dTODQnOyAvL2RlZmF1bHQgZGF0dW1cbnByb2o0LlByb2ogPSByZXF1aXJlKCcuL1Byb2onKTtcbnByb2o0LldHUzg0ID0gbmV3IHByb2o0LlByb2ooJ1dHUzg0Jyk7XG5wcm9qNC5Qb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQnKTtcbnByb2o0LnRvUG9pbnQgPSByZXF1aXJlKFwiLi9jb21tb24vdG9Qb2ludFwiKTtcbnByb2o0LmRlZnMgPSByZXF1aXJlKCcuL2RlZnMnKTtcbnByb2o0LnRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtJyk7XG5wcm9qNC5tZ3JzID0gcmVxdWlyZSgnbWdycycpO1xucHJvajQudmVyc2lvbiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb247XG5yZXF1aXJlKCcuL2luY2x1ZGVkUHJvamVjdGlvbnMnKShwcm9qNCk7XG5tb2R1bGUuZXhwb3J0cyA9IHByb2o0OyIsInZhciBkZWZzID0gcmVxdWlyZSgnLi9kZWZzJyk7XG52YXIgd2t0ID0gcmVxdWlyZSgnLi93a3QnKTtcbnZhciBwcm9qU3RyID0gcmVxdWlyZSgnLi9wcm9qU3RyaW5nJyk7XG5mdW5jdGlvbiB0ZXN0T2JqKGNvZGUpe1xuICByZXR1cm4gdHlwZW9mIGNvZGUgPT09ICdzdHJpbmcnO1xufVxuZnVuY3Rpb24gdGVzdERlZihjb2RlKXtcbiAgcmV0dXJuIGNvZGUgaW4gZGVmcztcbn1cbmZ1bmN0aW9uIHRlc3RXS1QoY29kZSl7XG4gIHZhciBjb2RlV29yZHMgPSBbJ0dFT0dDUycsJ0dFT0NDUycsJ1BST0pDUycsJ0xPQ0FMX0NTJ107XG4gIHJldHVybiBjb2RlV29yZHMucmVkdWNlKGZ1bmN0aW9uKGEsYil7XG4gICAgcmV0dXJuIGErMStjb2RlLmluZGV4T2YoYik7XG4gIH0sMCk7XG59XG5mdW5jdGlvbiB0ZXN0UHJvaihjb2RlKXtcbiAgcmV0dXJuIGNvZGVbMF0gPT09ICcrJztcbn1cbmZ1bmN0aW9uIHBhcnNlKGNvZGUpe1xuICBpZiAodGVzdE9iaihjb2RlKSkge1xuICAgIC8vY2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgYSBXS1Qgc3RyaW5nXG4gICAgaWYgKHRlc3REZWYoY29kZSkpIHtcbiAgICAgIHJldHVybiBkZWZzW2NvZGVdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0ZXN0V0tUKGNvZGUpKSB7XG4gICAgICByZXR1cm4gd2t0KGNvZGUpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0ZXN0UHJvaihjb2RlKSkge1xuICAgICAgcmV0dXJuIHByb2pTdHIoY29kZSk7XG4gICAgfVxuICB9ZWxzZXtcbiAgICByZXR1cm4gY29kZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlOyIsInZhciBEMlIgPSAwLjAxNzQ1MzI5MjUxOTk0MzI5NTc3O1xudmFyIFByaW1lTWVyaWRpYW4gPSByZXF1aXJlKCcuL2NvbnN0YW50cy9QcmltZU1lcmlkaWFuJyk7XG52YXIgdW5pdHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cy91bml0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRlZkRhdGEpIHtcbiAgdmFyIHNlbGYgPSB7fTtcbiAgdmFyIHBhcmFtT2JqID0ge307XG4gIGRlZkRhdGEuc3BsaXQoXCIrXCIpLm1hcChmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHYudHJpbSgpO1xuICB9KS5maWx0ZXIoZnVuY3Rpb24oYSkge1xuICAgIHJldHVybiBhO1xuICB9KS5mb3JFYWNoKGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgc3BsaXQgPSBhLnNwbGl0KFwiPVwiKTtcbiAgICBzcGxpdC5wdXNoKHRydWUpO1xuICAgIHBhcmFtT2JqW3NwbGl0WzBdLnRvTG93ZXJDYXNlKCldID0gc3BsaXRbMV07XG4gIH0pO1xuICB2YXIgcGFyYW1OYW1lLCBwYXJhbVZhbCwgcGFyYW1PdXRuYW1lO1xuICB2YXIgcGFyYW1zID0ge1xuICAgIHByb2o6ICdwcm9qTmFtZScsXG4gICAgZGF0dW06ICdkYXR1bUNvZGUnLFxuICAgIHJmOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLnJmID0gcGFyc2VGbG9hdCh2KTtcbiAgICB9LFxuICAgIGxhdF8wOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmxhdDAgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgbGF0XzE6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubGF0MSA9IHYgKiBEMlI7XG4gICAgfSxcbiAgICBsYXRfMjogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5sYXQyID0gdiAqIEQyUjtcbiAgICB9LFxuICAgIGxhdF90czogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5sYXRfdHMgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgbG9uXzA6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubG9uZzAgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgbG9uXzE6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubG9uZzEgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgbG9uXzI6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubG9uZzIgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgYWxwaGE6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuYWxwaGEgPSBwYXJzZUZsb2F0KHYpICogRDJSO1xuICAgIH0sXG4gICAgbG9uYzogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5sb25nYyA9IHYgKiBEMlI7XG4gICAgfSxcbiAgICB4XzA6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYueDAgPSBwYXJzZUZsb2F0KHYpO1xuICAgIH0sXG4gICAgeV8wOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLnkwID0gcGFyc2VGbG9hdCh2KTtcbiAgICB9LFxuICAgIGtfMDogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5rMCA9IHBhcnNlRmxvYXQodik7XG4gICAgfSxcbiAgICBrOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmswID0gcGFyc2VGbG9hdCh2KTtcbiAgICB9LFxuICAgIGE6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuYSA9IHBhcnNlRmxvYXQodik7XG4gICAgfSxcbiAgICBiOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmIgPSBwYXJzZUZsb2F0KHYpO1xuICAgIH0sXG4gICAgcl9hOiBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuUl9BID0gdHJ1ZTtcbiAgICB9LFxuICAgIHpvbmU6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuem9uZSA9IHBhcnNlSW50KHYsIDEwKTtcbiAgICB9LFxuICAgIHNvdXRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYudXRtU291dGggPSB0cnVlO1xuICAgIH0sXG4gICAgdG93Z3M4NDogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5kYXR1bV9wYXJhbXMgPSB2LnNwbGl0KFwiLFwiKS5tYXAoZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChhKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgdG9fbWV0ZXI6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYudG9fbWV0ZXIgPSBwYXJzZUZsb2F0KHYpO1xuICAgIH0sXG4gICAgdW5pdHM6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYudW5pdHMgPSB2O1xuICAgICAgaWYgKHVuaXRzW3ZdKSB7XG4gICAgICAgIHNlbGYudG9fbWV0ZXIgPSB1bml0c1t2XS50b19tZXRlcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIGZyb21fZ3JlZW53aWNoOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmZyb21fZ3JlZW53aWNoID0gdiAqIEQyUjtcbiAgICB9LFxuICAgIHBtOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmZyb21fZ3JlZW53aWNoID0gKFByaW1lTWVyaWRpYW5bdl0gPyBQcmltZU1lcmlkaWFuW3ZdIDogcGFyc2VGbG9hdCh2KSkgKiBEMlI7XG4gICAgfSxcbiAgICBuYWRncmlkczogZnVuY3Rpb24odikge1xuICAgICAgaWYgKHYgPT09ICdAbnVsbCcpIHtcbiAgICAgICAgc2VsZi5kYXR1bUNvZGUgPSAnbm9uZSc7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2VsZi5uYWRncmlkcyA9IHY7XG4gICAgICB9XG4gICAgfSxcbiAgICBheGlzOiBmdW5jdGlvbih2KSB7XG4gICAgICB2YXIgbGVnYWxBeGlzID0gXCJld25zdWRcIjtcbiAgICAgIGlmICh2Lmxlbmd0aCA9PT0gMyAmJiBsZWdhbEF4aXMuaW5kZXhPZih2LnN1YnN0cigwLCAxKSkgIT09IC0xICYmIGxlZ2FsQXhpcy5pbmRleE9mKHYuc3Vic3RyKDEsIDEpKSAhPT0gLTEgJiYgbGVnYWxBeGlzLmluZGV4T2Yodi5zdWJzdHIoMiwgMSkpICE9PSAtMSkge1xuICAgICAgICBzZWxmLmF4aXMgPSB2O1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgZm9yIChwYXJhbU5hbWUgaW4gcGFyYW1PYmopIHtcbiAgICBwYXJhbVZhbCA9IHBhcmFtT2JqW3BhcmFtTmFtZV07XG4gICAgaWYgKHBhcmFtTmFtZSBpbiBwYXJhbXMpIHtcbiAgICAgIHBhcmFtT3V0bmFtZSA9IHBhcmFtc1twYXJhbU5hbWVdO1xuICAgICAgaWYgKHR5cGVvZiBwYXJhbU91dG5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcGFyYW1PdXRuYW1lKHBhcmFtVmFsKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzZWxmW3BhcmFtT3V0bmFtZV0gPSBwYXJhbVZhbDtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzZWxmW3BhcmFtTmFtZV0gPSBwYXJhbVZhbDtcbiAgICB9XG4gIH1cbiAgaWYodHlwZW9mIHNlbGYuZGF0dW1Db2RlID09PSAnc3RyaW5nJyAmJiBzZWxmLmRhdHVtQ29kZSAhPT0gXCJXR1M4NFwiKXtcbiAgICBzZWxmLmRhdHVtQ29kZSA9IHNlbGYuZGF0dW1Db2RlLnRvTG93ZXJDYXNlKCk7XG4gIH1cbiAgcmV0dXJuIHNlbGY7XG59O1xuIiwidmFyIHByb2pzID0gW1xuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL21lcmMnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9sb25nbGF0Jylcbl07XG52YXIgbmFtZXMgPSB7fTtcbnZhciBwcm9qU3RvcmUgPSBbXTtcblxuZnVuY3Rpb24gYWRkKHByb2osIGkpIHtcbiAgdmFyIGxlbiA9IHByb2pTdG9yZS5sZW5ndGg7XG4gIGlmICghcHJvai5uYW1lcykge1xuICAgIGNvbnNvbGUubG9nKGkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHByb2pTdG9yZVtsZW5dID0gcHJvajtcbiAgcHJvai5uYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKG4pIHtcbiAgICBuYW1lc1tuLnRvTG93ZXJDYXNlKCldID0gbGVuO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbmV4cG9ydHMuYWRkID0gYWRkO1xuXG5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgaWYgKCFuYW1lKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBuID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuICBpZiAodHlwZW9mIG5hbWVzW25dICE9PSAndW5kZWZpbmVkJyAmJiBwcm9qU3RvcmVbbmFtZXNbbl1dKSB7XG4gICAgcmV0dXJuIHByb2pTdG9yZVtuYW1lc1tuXV07XG4gIH1cbn07XG5leHBvcnRzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIHByb2pzLmZvckVhY2goYWRkKTtcbn07XG4iLCJ2YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIG1zZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL21zZm56Jyk7XG52YXIgcXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vcXNmbnonKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBhc2lueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hc2lueicpO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgaWYgKE1hdGguYWJzKHRoaXMubGF0MSArIHRoaXMubGF0MikgPCBFUFNMTikge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnRlbXAgPSB0aGlzLmIgLyB0aGlzLmE7XG4gIHRoaXMuZXMgPSAxIC0gTWF0aC5wb3codGhpcy50ZW1wLCAyKTtcbiAgdGhpcy5lMyA9IE1hdGguc3FydCh0aGlzLmVzKTtcblxuICB0aGlzLnNpbl9wbyA9IE1hdGguc2luKHRoaXMubGF0MSk7XG4gIHRoaXMuY29zX3BvID0gTWF0aC5jb3ModGhpcy5sYXQxKTtcbiAgdGhpcy50MSA9IHRoaXMuc2luX3BvO1xuICB0aGlzLmNvbiA9IHRoaXMuc2luX3BvO1xuICB0aGlzLm1zMSA9IG1zZm56KHRoaXMuZTMsIHRoaXMuc2luX3BvLCB0aGlzLmNvc19wbyk7XG4gIHRoaXMucXMxID0gcXNmbnoodGhpcy5lMywgdGhpcy5zaW5fcG8sIHRoaXMuY29zX3BvKTtcblxuICB0aGlzLnNpbl9wbyA9IE1hdGguc2luKHRoaXMubGF0Mik7XG4gIHRoaXMuY29zX3BvID0gTWF0aC5jb3ModGhpcy5sYXQyKTtcbiAgdGhpcy50MiA9IHRoaXMuc2luX3BvO1xuICB0aGlzLm1zMiA9IG1zZm56KHRoaXMuZTMsIHRoaXMuc2luX3BvLCB0aGlzLmNvc19wbyk7XG4gIHRoaXMucXMyID0gcXNmbnoodGhpcy5lMywgdGhpcy5zaW5fcG8sIHRoaXMuY29zX3BvKTtcblxuICB0aGlzLnNpbl9wbyA9IE1hdGguc2luKHRoaXMubGF0MCk7XG4gIHRoaXMuY29zX3BvID0gTWF0aC5jb3ModGhpcy5sYXQwKTtcbiAgdGhpcy50MyA9IHRoaXMuc2luX3BvO1xuICB0aGlzLnFzMCA9IHFzZm56KHRoaXMuZTMsIHRoaXMuc2luX3BvLCB0aGlzLmNvc19wbyk7XG5cbiAgaWYgKE1hdGguYWJzKHRoaXMubGF0MSAtIHRoaXMubGF0MikgPiBFUFNMTikge1xuICAgIHRoaXMubnMwID0gKHRoaXMubXMxICogdGhpcy5tczEgLSB0aGlzLm1zMiAqIHRoaXMubXMyKSAvICh0aGlzLnFzMiAtIHRoaXMucXMxKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLm5zMCA9IHRoaXMuY29uO1xuICB9XG4gIHRoaXMuYyA9IHRoaXMubXMxICogdGhpcy5tczEgKyB0aGlzLm5zMCAqIHRoaXMucXMxO1xuICB0aGlzLnJoID0gdGhpcy5hICogTWF0aC5zcXJ0KHRoaXMuYyAtIHRoaXMubnMwICogdGhpcy5xczApIC8gdGhpcy5uczA7XG59O1xuXG4vKiBBbGJlcnMgQ29uaWNhbCBFcXVhbCBBcmVhIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcblxuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuXG4gIHRoaXMuc2luX3BoaSA9IE1hdGguc2luKGxhdCk7XG4gIHRoaXMuY29zX3BoaSA9IE1hdGguY29zKGxhdCk7XG5cbiAgdmFyIHFzID0gcXNmbnoodGhpcy5lMywgdGhpcy5zaW5fcGhpLCB0aGlzLmNvc19waGkpO1xuICB2YXIgcmgxID0gdGhpcy5hICogTWF0aC5zcXJ0KHRoaXMuYyAtIHRoaXMubnMwICogcXMpIC8gdGhpcy5uczA7XG4gIHZhciB0aGV0YSA9IHRoaXMubnMwICogYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIHggPSByaDEgKiBNYXRoLnNpbih0aGV0YSkgKyB0aGlzLngwO1xuICB2YXIgeSA9IHRoaXMucmggLSByaDEgKiBNYXRoLmNvcyh0aGV0YSkgKyB0aGlzLnkwO1xuXG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciByaDEsIHFzLCBjb24sIHRoZXRhLCBsb24sIGxhdDtcblxuICBwLnggLT0gdGhpcy54MDtcbiAgcC55ID0gdGhpcy5yaCAtIHAueSArIHRoaXMueTA7XG4gIGlmICh0aGlzLm5zMCA+PSAwKSB7XG4gICAgcmgxID0gTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gICAgY29uID0gMTtcbiAgfVxuICBlbHNlIHtcbiAgICByaDEgPSAtTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gICAgY29uID0gLTE7XG4gIH1cbiAgdGhldGEgPSAwO1xuICBpZiAocmgxICE9PSAwKSB7XG4gICAgdGhldGEgPSBNYXRoLmF0YW4yKGNvbiAqIHAueCwgY29uICogcC55KTtcbiAgfVxuICBjb24gPSByaDEgKiB0aGlzLm5zMCAvIHRoaXMuYTtcbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgbGF0ID0gTWF0aC5hc2luKCh0aGlzLmMgLSBjb24gKiBjb24pIC8gKDIgKiB0aGlzLm5zMCkpO1xuICB9XG4gIGVsc2Uge1xuICAgIHFzID0gKHRoaXMuYyAtIGNvbiAqIGNvbikgLyB0aGlzLm5zMDtcbiAgICBsYXQgPSB0aGlzLnBoaTF6KHRoaXMuZTMsIHFzKTtcbiAgfVxuXG4gIGxvbiA9IGFkanVzdF9sb24odGhldGEgLyB0aGlzLm5zMCArIHRoaXMubG9uZzApO1xuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBGdW5jdGlvbiB0byBjb21wdXRlIHBoaTEsIHRoZSBsYXRpdHVkZSBmb3IgdGhlIGludmVyc2Ugb2YgdGhlXG4gICBBbGJlcnMgQ29uaWNhbCBFcXVhbC1BcmVhIHByb2plY3Rpb24uXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMucGhpMXogPSBmdW5jdGlvbihlY2NlbnQsIHFzKSB7XG4gIHZhciBzaW5waGksIGNvc3BoaSwgY29uLCBjb20sIGRwaGk7XG4gIHZhciBwaGkgPSBhc2lueigwLjUgKiBxcyk7XG4gIGlmIChlY2NlbnQgPCBFUFNMTikge1xuICAgIHJldHVybiBwaGk7XG4gIH1cblxuICB2YXIgZWNjbnRzID0gZWNjZW50ICogZWNjZW50O1xuICBmb3IgKHZhciBpID0gMTsgaSA8PSAyNTsgaSsrKSB7XG4gICAgc2lucGhpID0gTWF0aC5zaW4ocGhpKTtcbiAgICBjb3NwaGkgPSBNYXRoLmNvcyhwaGkpO1xuICAgIGNvbiA9IGVjY2VudCAqIHNpbnBoaTtcbiAgICBjb20gPSAxIC0gY29uICogY29uO1xuICAgIGRwaGkgPSAwLjUgKiBjb20gKiBjb20gLyBjb3NwaGkgKiAocXMgLyAoMSAtIGVjY250cykgLSBzaW5waGkgLyBjb20gKyAwLjUgLyBlY2NlbnQgKiBNYXRoLmxvZygoMSAtIGNvbikgLyAoMSArIGNvbikpKTtcbiAgICBwaGkgPSBwaGkgKyBkcGhpO1xuICAgIGlmIChNYXRoLmFicyhkcGhpKSA8PSAxZS03KSB7XG4gICAgICByZXR1cm4gcGhpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiQWxiZXJzX0NvbmljX0VxdWFsX0FyZWFcIiwgXCJBbGJlcnNcIiwgXCJhZWFcIl07XG4iLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tbGZuJyk7XG52YXIgZTBmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMGZuJyk7XG52YXIgZTFmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMWZuJyk7XG52YXIgZTJmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMmZuJyk7XG52YXIgZTNmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lM2ZuJyk7XG52YXIgZ04gPSByZXF1aXJlKCcuLi9jb21tb24vZ04nKTtcbnZhciBhc2lueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hc2lueicpO1xudmFyIGltbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2ltbGZuJyk7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zaW5fcDEyID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgdGhpcy5jb3NfcDEyID0gTWF0aC5jb3ModGhpcy5sYXQwKTtcbn07XG5cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIHNpbnBoaSA9IE1hdGguc2luKHAueSk7XG4gIHZhciBjb3NwaGkgPSBNYXRoLmNvcyhwLnkpO1xuICB2YXIgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciBlMCwgZTEsIGUyLCBlMywgTWxwLCBNbCwgdGFucGhpLCBObDEsIE5sLCBwc2ksIEF6LCBHLCBILCBHSCwgSHMsIGMsIGtwLCBjb3NfYywgcywgczIsIHMzLCBzNCwgczU7XG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGlmIChNYXRoLmFicyh0aGlzLnNpbl9wMTIgLSAxKSA8PSBFUFNMTikge1xuICAgICAgLy9Ob3J0aCBQb2xlIGNhc2VcbiAgICAgIHAueCA9IHRoaXMueDAgKyB0aGlzLmEgKiAoSEFMRl9QSSAtIGxhdCkgKiBNYXRoLnNpbihkbG9uKTtcbiAgICAgIHAueSA9IHRoaXMueTAgLSB0aGlzLmEgKiAoSEFMRl9QSSAtIGxhdCkgKiBNYXRoLmNvcyhkbG9uKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBlbHNlIGlmIChNYXRoLmFicyh0aGlzLnNpbl9wMTIgKyAxKSA8PSBFUFNMTikge1xuICAgICAgLy9Tb3V0aCBQb2xlIGNhc2VcbiAgICAgIHAueCA9IHRoaXMueDAgKyB0aGlzLmEgKiAoSEFMRl9QSSArIGxhdCkgKiBNYXRoLnNpbihkbG9uKTtcbiAgICAgIHAueSA9IHRoaXMueTAgKyB0aGlzLmEgKiAoSEFMRl9QSSArIGxhdCkgKiBNYXRoLmNvcyhkbG9uKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vZGVmYXVsdCBjYXNlXG4gICAgICBjb3NfYyA9IHRoaXMuc2luX3AxMiAqIHNpbnBoaSArIHRoaXMuY29zX3AxMiAqIGNvc3BoaSAqIE1hdGguY29zKGRsb24pO1xuICAgICAgYyA9IE1hdGguYWNvcyhjb3NfYyk7XG4gICAgICBrcCA9IGMgLyBNYXRoLnNpbihjKTtcbiAgICAgIHAueCA9IHRoaXMueDAgKyB0aGlzLmEgKiBrcCAqIGNvc3BoaSAqIE1hdGguc2luKGRsb24pO1xuICAgICAgcC55ID0gdGhpcy55MCArIHRoaXMuYSAqIGtwICogKHRoaXMuY29zX3AxMiAqIHNpbnBoaSAtIHRoaXMuc2luX3AxMiAqIGNvc3BoaSAqIE1hdGguY29zKGRsb24pKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBlMCA9IGUwZm4odGhpcy5lcyk7XG4gICAgZTEgPSBlMWZuKHRoaXMuZXMpO1xuICAgIGUyID0gZTJmbih0aGlzLmVzKTtcbiAgICBlMyA9IGUzZm4odGhpcy5lcyk7XG4gICAgaWYgKE1hdGguYWJzKHRoaXMuc2luX3AxMiAtIDEpIDw9IEVQU0xOKSB7XG4gICAgICAvL05vcnRoIFBvbGUgY2FzZVxuICAgICAgTWxwID0gdGhpcy5hICogbWxmbihlMCwgZTEsIGUyLCBlMywgSEFMRl9QSSk7XG4gICAgICBNbCA9IHRoaXMuYSAqIG1sZm4oZTAsIGUxLCBlMiwgZTMsIGxhdCk7XG4gICAgICBwLnggPSB0aGlzLngwICsgKE1scCAtIE1sKSAqIE1hdGguc2luKGRsb24pO1xuICAgICAgcC55ID0gdGhpcy55MCAtIChNbHAgLSBNbCkgKiBNYXRoLmNvcyhkbG9uKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBlbHNlIGlmIChNYXRoLmFicyh0aGlzLnNpbl9wMTIgKyAxKSA8PSBFUFNMTikge1xuICAgICAgLy9Tb3V0aCBQb2xlIGNhc2VcbiAgICAgIE1scCA9IHRoaXMuYSAqIG1sZm4oZTAsIGUxLCBlMiwgZTMsIEhBTEZfUEkpO1xuICAgICAgTWwgPSB0aGlzLmEgKiBtbGZuKGUwLCBlMSwgZTIsIGUzLCBsYXQpO1xuICAgICAgcC54ID0gdGhpcy54MCArIChNbHAgKyBNbCkgKiBNYXRoLnNpbihkbG9uKTtcbiAgICAgIHAueSA9IHRoaXMueTAgKyAoTWxwICsgTWwpICogTWF0aC5jb3MoZGxvbik7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvL0RlZmF1bHQgY2FzZVxuICAgICAgdGFucGhpID0gc2lucGhpIC8gY29zcGhpO1xuICAgICAgTmwxID0gZ04odGhpcy5hLCB0aGlzLmUsIHRoaXMuc2luX3AxMik7XG4gICAgICBObCA9IGdOKHRoaXMuYSwgdGhpcy5lLCBzaW5waGkpO1xuICAgICAgcHNpID0gTWF0aC5hdGFuKCgxIC0gdGhpcy5lcykgKiB0YW5waGkgKyB0aGlzLmVzICogTmwxICogdGhpcy5zaW5fcDEyIC8gKE5sICogY29zcGhpKSk7XG4gICAgICBBeiA9IE1hdGguYXRhbjIoTWF0aC5zaW4oZGxvbiksIHRoaXMuY29zX3AxMiAqIE1hdGgudGFuKHBzaSkgLSB0aGlzLnNpbl9wMTIgKiBNYXRoLmNvcyhkbG9uKSk7XG4gICAgICBpZiAoQXogPT09IDApIHtcbiAgICAgICAgcyA9IE1hdGguYXNpbih0aGlzLmNvc19wMTIgKiBNYXRoLnNpbihwc2kpIC0gdGhpcy5zaW5fcDEyICogTWF0aC5jb3MocHNpKSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLmFicyhNYXRoLmFicyhBeikgLSBNYXRoLlBJKSA8PSBFUFNMTikge1xuICAgICAgICBzID0gLU1hdGguYXNpbih0aGlzLmNvc19wMTIgKiBNYXRoLnNpbihwc2kpIC0gdGhpcy5zaW5fcDEyICogTWF0aC5jb3MocHNpKSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcyA9IE1hdGguYXNpbihNYXRoLnNpbihkbG9uKSAqIE1hdGguY29zKHBzaSkgLyBNYXRoLnNpbihBeikpO1xuICAgICAgfVxuICAgICAgRyA9IHRoaXMuZSAqIHRoaXMuc2luX3AxMiAvIE1hdGguc3FydCgxIC0gdGhpcy5lcyk7XG4gICAgICBIID0gdGhpcy5lICogdGhpcy5jb3NfcDEyICogTWF0aC5jb3MoQXopIC8gTWF0aC5zcXJ0KDEgLSB0aGlzLmVzKTtcbiAgICAgIEdIID0gRyAqIEg7XG4gICAgICBIcyA9IEggKiBIO1xuICAgICAgczIgPSBzICogcztcbiAgICAgIHMzID0gczIgKiBzO1xuICAgICAgczQgPSBzMyAqIHM7XG4gICAgICBzNSA9IHM0ICogcztcbiAgICAgIGMgPSBObDEgKiBzICogKDEgLSBzMiAqIEhzICogKDEgLSBIcykgLyA2ICsgczMgLyA4ICogR0ggKiAoMSAtIDIgKiBIcykgKyBzNCAvIDEyMCAqIChIcyAqICg0IC0gNyAqIEhzKSAtIDMgKiBHICogRyAqICgxIC0gNyAqIEhzKSkgLSBzNSAvIDQ4ICogR0gpO1xuICAgICAgcC54ID0gdGhpcy54MCArIGMgKiBNYXRoLnNpbihBeik7XG4gICAgICBwLnkgPSB0aGlzLnkwICsgYyAqIE1hdGguY29zKEF6KTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgfVxuXG5cbn07XG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICB2YXIgcmgsIHosIHNpbnosIGNvc3osIGxvbiwgbGF0LCBjb24sIGUwLCBlMSwgZTIsIGUzLCBNbHAsIE0sIE4xLCBwc2ksIEF6LCBjb3NBeiwgdG1wLCBBLCBCLCBELCBFZSwgRjtcbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgcmggPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgICBpZiAocmggPiAoMiAqIEhBTEZfUEkgKiB0aGlzLmEpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHogPSByaCAvIHRoaXMuYTtcblxuICAgIHNpbnogPSBNYXRoLnNpbih6KTtcbiAgICBjb3N6ID0gTWF0aC5jb3Moeik7XG5cbiAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgIGlmIChNYXRoLmFicyhyaCkgPD0gRVBTTE4pIHtcbiAgICAgIGxhdCA9IHRoaXMubGF0MDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsYXQgPSBhc2lueihjb3N6ICogdGhpcy5zaW5fcDEyICsgKHAueSAqIHNpbnogKiB0aGlzLmNvc19wMTIpIC8gcmgpO1xuICAgICAgY29uID0gTWF0aC5hYnModGhpcy5sYXQwKSAtIEhBTEZfUEk7XG4gICAgICBpZiAoTWF0aC5hYnMoY29uKSA8PSBFUFNMTikge1xuICAgICAgICBpZiAodGhpcy5sYXQwID49IDApIHtcbiAgICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCwgLSBwLnkpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgLSBNYXRoLmF0YW4yKC1wLngsIHAueSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLypjb24gPSBjb3N6IC0gdGhpcy5zaW5fcDEyICogTWF0aC5zaW4obGF0KTtcbiAgICAgICAgaWYgKChNYXRoLmFicyhjb24pIDwgRVBTTE4pICYmIChNYXRoLmFicyhwLngpIDwgRVBTTE4pKSB7XG4gICAgICAgICAgLy9uby1vcCwganVzdCBrZWVwIHRoZSBsb24gdmFsdWUgYXMgaXNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgdGVtcCA9IE1hdGguYXRhbjIoKHAueCAqIHNpbnogKiB0aGlzLmNvc19wMTIpLCAoY29uICogcmgpKTtcbiAgICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKChwLnggKiBzaW56ICogdGhpcy5jb3NfcDEyKSwgKGNvbiAqIHJoKSkpO1xuICAgICAgICB9Ki9cbiAgICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLnggKiBzaW56LCByaCAqIHRoaXMuY29zX3AxMiAqIGNvc3ogLSBwLnkgKiB0aGlzLnNpbl9wMTIgKiBzaW56KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcC54ID0gbG9uO1xuICAgIHAueSA9IGxhdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuICBlbHNlIHtcbiAgICBlMCA9IGUwZm4odGhpcy5lcyk7XG4gICAgZTEgPSBlMWZuKHRoaXMuZXMpO1xuICAgIGUyID0gZTJmbih0aGlzLmVzKTtcbiAgICBlMyA9IGUzZm4odGhpcy5lcyk7XG4gICAgaWYgKE1hdGguYWJzKHRoaXMuc2luX3AxMiAtIDEpIDw9IEVQU0xOKSB7XG4gICAgICAvL05vcnRoIHBvbGUgY2FzZVxuICAgICAgTWxwID0gdGhpcy5hICogbWxmbihlMCwgZTEsIGUyLCBlMywgSEFMRl9QSSk7XG4gICAgICByaCA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgICAgTSA9IE1scCAtIHJoO1xuICAgICAgbGF0ID0gaW1sZm4oTSAvIHRoaXMuYSwgZTAsIGUxLCBlMiwgZTMpO1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLngsIC0gMSAqIHAueSkpO1xuICAgICAgcC54ID0gbG9uO1xuICAgICAgcC55ID0gbGF0O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGVsc2UgaWYgKE1hdGguYWJzKHRoaXMuc2luX3AxMiArIDEpIDw9IEVQU0xOKSB7XG4gICAgICAvL1NvdXRoIHBvbGUgY2FzZVxuICAgICAgTWxwID0gdGhpcy5hICogbWxmbihlMCwgZTEsIGUyLCBlMywgSEFMRl9QSSk7XG4gICAgICByaCA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgICAgTSA9IHJoIC0gTWxwO1xuXG4gICAgICBsYXQgPSBpbWxmbihNIC8gdGhpcy5hLCBlMCwgZTEsIGUyLCBlMyk7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCwgcC55KSk7XG4gICAgICBwLnggPSBsb247XG4gICAgICBwLnkgPSBsYXQ7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvL2RlZmF1bHQgY2FzZVxuICAgICAgcmggPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgICAgIEF6ID0gTWF0aC5hdGFuMihwLngsIHAueSk7XG4gICAgICBOMSA9IGdOKHRoaXMuYSwgdGhpcy5lLCB0aGlzLnNpbl9wMTIpO1xuICAgICAgY29zQXogPSBNYXRoLmNvcyhBeik7XG4gICAgICB0bXAgPSB0aGlzLmUgKiB0aGlzLmNvc19wMTIgKiBjb3NBejtcbiAgICAgIEEgPSAtdG1wICogdG1wIC8gKDEgLSB0aGlzLmVzKTtcbiAgICAgIEIgPSAzICogdGhpcy5lcyAqICgxIC0gQSkgKiB0aGlzLnNpbl9wMTIgKiB0aGlzLmNvc19wMTIgKiBjb3NBeiAvICgxIC0gdGhpcy5lcyk7XG4gICAgICBEID0gcmggLyBOMTtcbiAgICAgIEVlID0gRCAtIEEgKiAoMSArIEEpICogTWF0aC5wb3coRCwgMykgLyA2IC0gQiAqICgxICsgMyAqIEEpICogTWF0aC5wb3coRCwgNCkgLyAyNDtcbiAgICAgIEYgPSAxIC0gQSAqIEVlICogRWUgLyAyIC0gRCAqIEVlICogRWUgKiBFZSAvIDY7XG4gICAgICBwc2kgPSBNYXRoLmFzaW4odGhpcy5zaW5fcDEyICogTWF0aC5jb3MoRWUpICsgdGhpcy5jb3NfcDEyICogTWF0aC5zaW4oRWUpICogY29zQXopO1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hc2luKE1hdGguc2luKEF6KSAqIE1hdGguc2luKEVlKSAvIE1hdGguY29zKHBzaSkpKTtcbiAgICAgIGxhdCA9IE1hdGguYXRhbigoMSAtIHRoaXMuZXMgKiBGICogdGhpcy5zaW5fcDEyIC8gTWF0aC5zaW4ocHNpKSkgKiBNYXRoLnRhbihwc2kpIC8gKDEgLSB0aGlzLmVzKSk7XG4gICAgICBwLnggPSBsb247XG4gICAgICBwLnkgPSBsYXQ7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gIH1cblxufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJBemltdXRoYWxfRXF1aWRpc3RhbnRcIiwgXCJhZXFkXCJdO1xuIiwidmFyIG1sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vbWxmbicpO1xudmFyIGUwZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTBmbicpO1xudmFyIGUxZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTFmbicpO1xudmFyIGUyZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTJmbicpO1xudmFyIGUzZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTNmbicpO1xudmFyIGdOID0gcmVxdWlyZSgnLi4vY29tbW9uL2dOJyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgYWRqdXN0X2xhdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbGF0Jyk7XG52YXIgaW1sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vaW1sZm4nKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXRoaXMuc3BoZXJlKSB7XG4gICAgdGhpcy5lMCA9IGUwZm4odGhpcy5lcyk7XG4gICAgdGhpcy5lMSA9IGUxZm4odGhpcy5lcyk7XG4gICAgdGhpcy5lMiA9IGUyZm4odGhpcy5lcyk7XG4gICAgdGhpcy5lMyA9IGUzZm4odGhpcy5lcyk7XG4gICAgdGhpcy5tbDAgPSB0aGlzLmEgKiBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIHRoaXMubGF0MCk7XG4gIH1cbn07XG5cblxuXG4vKiBDYXNzaW5pIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG5cbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdmFyIHgsIHk7XG4gIHZhciBsYW0gPSBwLng7XG4gIHZhciBwaGkgPSBwLnk7XG4gIGxhbSA9IGFkanVzdF9sb24obGFtIC0gdGhpcy5sb25nMCk7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgeCA9IHRoaXMuYSAqIE1hdGguYXNpbihNYXRoLmNvcyhwaGkpICogTWF0aC5zaW4obGFtKSk7XG4gICAgeSA9IHRoaXMuYSAqIChNYXRoLmF0YW4yKE1hdGgudGFuKHBoaSksIE1hdGguY29zKGxhbSkpIC0gdGhpcy5sYXQwKTtcbiAgfVxuICBlbHNlIHtcbiAgICAvL2VsbGlwc29pZFxuICAgIHZhciBzaW5waGkgPSBNYXRoLnNpbihwaGkpO1xuICAgIHZhciBjb3NwaGkgPSBNYXRoLmNvcyhwaGkpO1xuICAgIHZhciBubCA9IGdOKHRoaXMuYSwgdGhpcy5lLCBzaW5waGkpO1xuICAgIHZhciB0bCA9IE1hdGgudGFuKHBoaSkgKiBNYXRoLnRhbihwaGkpO1xuICAgIHZhciBhbCA9IGxhbSAqIE1hdGguY29zKHBoaSk7XG4gICAgdmFyIGFzcSA9IGFsICogYWw7XG4gICAgdmFyIGNsID0gdGhpcy5lcyAqIGNvc3BoaSAqIGNvc3BoaSAvICgxIC0gdGhpcy5lcyk7XG4gICAgdmFyIG1sID0gdGhpcy5hICogbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCBwaGkpO1xuXG4gICAgeCA9IG5sICogYWwgKiAoMSAtIGFzcSAqIHRsICogKDEgLyA2IC0gKDggLSB0bCArIDggKiBjbCkgKiBhc3EgLyAxMjApKTtcbiAgICB5ID0gbWwgLSB0aGlzLm1sMCArIG5sICogc2lucGhpIC8gY29zcGhpICogYXNxICogKDAuNSArICg1IC0gdGwgKyA2ICogY2wpICogYXNxIC8gMjQpO1xuXG5cbiAgfVxuXG4gIHAueCA9IHggKyB0aGlzLngwO1xuICBwLnkgPSB5ICsgdGhpcy55MDtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBJbnZlcnNlIGVxdWF0aW9uc1xuICAtLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgLT0gdGhpcy55MDtcbiAgdmFyIHggPSBwLnggLyB0aGlzLmE7XG4gIHZhciB5ID0gcC55IC8gdGhpcy5hO1xuICB2YXIgcGhpLCBsYW07XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgdmFyIGRkID0geSArIHRoaXMubGF0MDtcbiAgICBwaGkgPSBNYXRoLmFzaW4oTWF0aC5zaW4oZGQpICogTWF0aC5jb3MoeCkpO1xuICAgIGxhbSA9IE1hdGguYXRhbjIoTWF0aC50YW4oeCksIE1hdGguY29zKGRkKSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgLyogZWxsaXBzb2lkICovXG4gICAgdmFyIG1sMSA9IHRoaXMubWwwIC8gdGhpcy5hICsgeTtcbiAgICB2YXIgcGhpMSA9IGltbGZuKG1sMSwgdGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMyk7XG4gICAgaWYgKE1hdGguYWJzKE1hdGguYWJzKHBoaTEpIC0gSEFMRl9QSSkgPD0gRVBTTE4pIHtcbiAgICAgIHAueCA9IHRoaXMubG9uZzA7XG4gICAgICBwLnkgPSBIQUxGX1BJO1xuICAgICAgaWYgKHkgPCAwKSB7XG4gICAgICAgIHAueSAqPSAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICB2YXIgbmwxID0gZ04odGhpcy5hLCB0aGlzLmUsIE1hdGguc2luKHBoaTEpKTtcblxuICAgIHZhciBybDEgPSBubDEgKiBubDEgKiBubDEgLyB0aGlzLmEgLyB0aGlzLmEgKiAoMSAtIHRoaXMuZXMpO1xuICAgIHZhciB0bDEgPSBNYXRoLnBvdyhNYXRoLnRhbihwaGkxKSwgMik7XG4gICAgdmFyIGRsID0geCAqIHRoaXMuYSAvIG5sMTtcbiAgICB2YXIgZHNxID0gZGwgKiBkbDtcbiAgICBwaGkgPSBwaGkxIC0gbmwxICogTWF0aC50YW4ocGhpMSkgLyBybDEgKiBkbCAqIGRsICogKDAuNSAtICgxICsgMyAqIHRsMSkgKiBkbCAqIGRsIC8gMjQpO1xuICAgIGxhbSA9IGRsICogKDEgLSBkc3EgKiAodGwxIC8gMyArICgxICsgMyAqIHRsMSkgKiB0bDEgKiBkc3EgLyAxNSkpIC8gTWF0aC5jb3MocGhpMSk7XG5cbiAgfVxuXG4gIHAueCA9IGFkanVzdF9sb24obGFtICsgdGhpcy5sb25nMCk7XG4gIHAueSA9IGFkanVzdF9sYXQocGhpKTtcbiAgcmV0dXJuIHA7XG5cbn07XG5leHBvcnRzLm5hbWVzID0gW1wiQ2Fzc2luaVwiLCBcIkNhc3NpbmlfU29sZG5lclwiLCBcImNhc3NcIl07IiwidmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIHFzZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL3FzZm56Jyk7XG52YXIgbXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vbXNmbnonKTtcbnZhciBpcXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vaXFzZm56Jyk7XG4vKlxuICByZWZlcmVuY2U6ICBcbiAgICBcIkNhcnRvZ3JhcGhpYyBQcm9qZWN0aW9uIFByb2NlZHVyZXMgZm9yIHRoZSBVTklYIEVudmlyb25tZW50LVxuICAgIEEgVXNlcidzIE1hbnVhbFwiIGJ5IEdlcmFsZCBJLiBFdmVuZGVuLFxuICAgIFVTR1MgT3BlbiBGaWxlIFJlcG9ydCA5MC0yODRhbmQgUmVsZWFzZSA0IEludGVyaW0gUmVwb3J0cyAoMjAwMylcbiovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgLy9uby1vcFxuICBpZiAoIXRoaXMuc3BoZXJlKSB7XG4gICAgdGhpcy5rMCA9IG1zZm56KHRoaXMuZSwgTWF0aC5zaW4odGhpcy5sYXRfdHMpLCBNYXRoLmNvcyh0aGlzLmxhdF90cykpO1xuICB9XG59O1xuXG5cbi8qIEN5bGluZHJpY2FsIEVxdWFsIEFyZWEgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIHgsIHk7XG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgeCA9IHRoaXMueDAgKyB0aGlzLmEgKiBkbG9uICogTWF0aC5jb3ModGhpcy5sYXRfdHMpO1xuICAgIHkgPSB0aGlzLnkwICsgdGhpcy5hICogTWF0aC5zaW4obGF0KSAvIE1hdGguY29zKHRoaXMubGF0X3RzKTtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgcXMgPSBxc2Zueih0aGlzLmUsIE1hdGguc2luKGxhdCkpO1xuICAgIHggPSB0aGlzLngwICsgdGhpcy5hICogdGhpcy5rMCAqIGRsb247XG4gICAgeSA9IHRoaXMueTAgKyB0aGlzLmEgKiBxcyAqIDAuNSAvIHRoaXMuazA7XG4gIH1cblxuICBwLnggPSB4O1xuICBwLnkgPSB5O1xuICByZXR1cm4gcDtcbn07XG5cbi8qIEN5bGluZHJpY2FsIEVxdWFsIEFyZWEgaW52ZXJzZSBlcXVhdGlvbnMtLW1hcHBpbmcgeCx5IHRvIGxhdC9sb25nXG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICB2YXIgbG9uLCBsYXQ7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgKHAueCAvIHRoaXMuYSkgLyBNYXRoLmNvcyh0aGlzLmxhdF90cykpO1xuICAgIGxhdCA9IE1hdGguYXNpbigocC55IC8gdGhpcy5hKSAqIE1hdGguY29zKHRoaXMubGF0X3RzKSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgbGF0ID0gaXFzZm56KHRoaXMuZSwgMiAqIHAueSAqIHRoaXMuazAgLyB0aGlzLmEpO1xuICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIHAueCAvICh0aGlzLmEgKiB0aGlzLmswKSk7XG4gIH1cblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcImNlYVwiXTtcbiIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBhZGp1c3RfbGF0ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sYXQnKTtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIHRoaXMueDAgPSB0aGlzLngwIHx8IDA7XG4gIHRoaXMueTAgPSB0aGlzLnkwIHx8IDA7XG4gIHRoaXMubGF0MCA9IHRoaXMubGF0MCB8fCAwO1xuICB0aGlzLmxvbmcwID0gdGhpcy5sb25nMCB8fCAwO1xuICB0aGlzLmxhdF90cyA9IHRoaXMubGF0X3RzIHx8IDA7XG4gIHRoaXMudGl0bGUgPSB0aGlzLnRpdGxlIHx8IFwiRXF1aWRpc3RhbnQgQ3lsaW5kcmljYWwgKFBsYXRlIENhcnJlKVwiO1xuXG4gIHRoaXMucmMgPSBNYXRoLmNvcyh0aGlzLmxhdF90cyk7XG59O1xuXG5cbi8vIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcblxuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuXG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIGRsYXQgPSBhZGp1c3RfbGF0KGxhdCAtIHRoaXMubGF0MCk7XG4gIHAueCA9IHRoaXMueDAgKyAodGhpcy5hICogZGxvbiAqIHRoaXMucmMpO1xuICBwLnkgPSB0aGlzLnkwICsgKHRoaXMuYSAqIGRsYXQpO1xuICByZXR1cm4gcDtcbn07XG5cbi8vIGludmVyc2UgZXF1YXRpb25zLS1tYXBwaW5nIHgseSB0byBsYXQvbG9uZ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcblxuICB2YXIgeCA9IHAueDtcbiAgdmFyIHkgPSBwLnk7XG5cbiAgcC54ID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgKCh4IC0gdGhpcy54MCkgLyAodGhpcy5hICogdGhpcy5yYykpKTtcbiAgcC55ID0gYWRqdXN0X2xhdCh0aGlzLmxhdDAgKyAoKHkgLSB0aGlzLnkwKSAvICh0aGlzLmEpKSk7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJFcXVpcmVjdGFuZ3VsYXJcIiwgXCJFcXVpZGlzdGFudF9DeWxpbmRyaWNhbFwiLCBcImVxY1wiXTtcbiIsInZhciBlMGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UwZm4nKTtcbnZhciBlMWZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UxZm4nKTtcbnZhciBlMmZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UyZm4nKTtcbnZhciBlM2ZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UzZm4nKTtcbnZhciBtc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tc2ZueicpO1xudmFyIG1sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vbWxmbicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIGFkanVzdF9sYXQgPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xhdCcpO1xudmFyIGltbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2ltbGZuJyk7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgLyogUGxhY2UgcGFyYW1ldGVycyBpbiBzdGF0aWMgc3RvcmFnZSBmb3IgY29tbW9uIHVzZVxuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIC8vIFN0YW5kYXJkIFBhcmFsbGVscyBjYW5ub3QgYmUgZXF1YWwgYW5kIG9uIG9wcG9zaXRlIHNpZGVzIG9mIHRoZSBlcXVhdG9yXG4gIGlmIChNYXRoLmFicyh0aGlzLmxhdDEgKyB0aGlzLmxhdDIpIDwgRVBTTE4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5sYXQyID0gdGhpcy5sYXQyIHx8IHRoaXMubGF0MTtcbiAgdGhpcy50ZW1wID0gdGhpcy5iIC8gdGhpcy5hO1xuICB0aGlzLmVzID0gMSAtIE1hdGgucG93KHRoaXMudGVtcCwgMik7XG4gIHRoaXMuZSA9IE1hdGguc3FydCh0aGlzLmVzKTtcbiAgdGhpcy5lMCA9IGUwZm4odGhpcy5lcyk7XG4gIHRoaXMuZTEgPSBlMWZuKHRoaXMuZXMpO1xuICB0aGlzLmUyID0gZTJmbih0aGlzLmVzKTtcbiAgdGhpcy5lMyA9IGUzZm4odGhpcy5lcyk7XG5cbiAgdGhpcy5zaW5waGkgPSBNYXRoLnNpbih0aGlzLmxhdDEpO1xuICB0aGlzLmNvc3BoaSA9IE1hdGguY29zKHRoaXMubGF0MSk7XG5cbiAgdGhpcy5tczEgPSBtc2Zueih0aGlzLmUsIHRoaXMuc2lucGhpLCB0aGlzLmNvc3BoaSk7XG4gIHRoaXMubWwxID0gbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCB0aGlzLmxhdDEpO1xuXG4gIGlmIChNYXRoLmFicyh0aGlzLmxhdDEgLSB0aGlzLmxhdDIpIDwgRVBTTE4pIHtcbiAgICB0aGlzLm5zID0gdGhpcy5zaW5waGk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5zaW5waGkgPSBNYXRoLnNpbih0aGlzLmxhdDIpO1xuICAgIHRoaXMuY29zcGhpID0gTWF0aC5jb3ModGhpcy5sYXQyKTtcbiAgICB0aGlzLm1zMiA9IG1zZm56KHRoaXMuZSwgdGhpcy5zaW5waGksIHRoaXMuY29zcGhpKTtcbiAgICB0aGlzLm1sMiA9IG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgdGhpcy5sYXQyKTtcbiAgICB0aGlzLm5zID0gKHRoaXMubXMxIC0gdGhpcy5tczIpIC8gKHRoaXMubWwyIC0gdGhpcy5tbDEpO1xuICB9XG4gIHRoaXMuZyA9IHRoaXMubWwxICsgdGhpcy5tczEgLyB0aGlzLm5zO1xuICB0aGlzLm1sMCA9IG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgdGhpcy5sYXQwKTtcbiAgdGhpcy5yaCA9IHRoaXMuYSAqICh0aGlzLmcgLSB0aGlzLm1sMCk7XG59O1xuXG5cbi8qIEVxdWlkaXN0YW50IENvbmljIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIHZhciByaDE7XG5cbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgcmgxID0gdGhpcy5hICogKHRoaXMuZyAtIGxhdCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIG1sID0gbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCBsYXQpO1xuICAgIHJoMSA9IHRoaXMuYSAqICh0aGlzLmcgLSBtbCk7XG4gIH1cbiAgdmFyIHRoZXRhID0gdGhpcy5ucyAqIGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciB4ID0gdGhpcy54MCArIHJoMSAqIE1hdGguc2luKHRoZXRhKTtcbiAgdmFyIHkgPSB0aGlzLnkwICsgdGhpcy5yaCAtIHJoMSAqIE1hdGguY29zKHRoZXRhKTtcbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBJbnZlcnNlIGVxdWF0aW9uc1xuICAtLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgPSB0aGlzLnJoIC0gcC55ICsgdGhpcy55MDtcbiAgdmFyIGNvbiwgcmgxLCBsYXQsIGxvbjtcbiAgaWYgKHRoaXMubnMgPj0gMCkge1xuICAgIHJoMSA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgIGNvbiA9IDE7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmgxID0gLU1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgIGNvbiA9IC0xO1xuICB9XG4gIHZhciB0aGV0YSA9IDA7XG4gIGlmIChyaDEgIT09IDApIHtcbiAgICB0aGV0YSA9IE1hdGguYXRhbjIoY29uICogcC54LCBjb24gKiBwLnkpO1xuICB9XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgdGhldGEgLyB0aGlzLm5zKTtcbiAgICBsYXQgPSBhZGp1c3RfbGF0KHRoaXMuZyAtIHJoMSAvIHRoaXMuYSk7XG4gICAgcC54ID0gbG9uO1xuICAgIHAueSA9IGxhdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgbWwgPSB0aGlzLmcgLSByaDEgLyB0aGlzLmE7XG4gICAgbGF0ID0gaW1sZm4obWwsIHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMpO1xuICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIHRoZXRhIC8gdGhpcy5ucyk7XG4gICAgcC54ID0gbG9uO1xuICAgIHAueSA9IGxhdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuXG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIkVxdWlkaXN0YW50X0NvbmljXCIsIFwiZXFkY1wiXTtcbiIsInZhciBGT1JUUEkgPSBNYXRoLlBJLzQ7XG52YXIgc3JhdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zcmF0Jyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBNQVhfSVRFUiA9IDIwO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzcGhpID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgdmFyIGNwaGkgPSBNYXRoLmNvcyh0aGlzLmxhdDApO1xuICBjcGhpICo9IGNwaGk7XG4gIHRoaXMucmMgPSBNYXRoLnNxcnQoMSAtIHRoaXMuZXMpIC8gKDEgLSB0aGlzLmVzICogc3BoaSAqIHNwaGkpO1xuICB0aGlzLkMgPSBNYXRoLnNxcnQoMSArIHRoaXMuZXMgKiBjcGhpICogY3BoaSAvICgxIC0gdGhpcy5lcykpO1xuICB0aGlzLnBoaWMwID0gTWF0aC5hc2luKHNwaGkgLyB0aGlzLkMpO1xuICB0aGlzLnJhdGV4cCA9IDAuNSAqIHRoaXMuQyAqIHRoaXMuZTtcbiAgdGhpcy5LID0gTWF0aC50YW4oMC41ICogdGhpcy5waGljMCArIEZPUlRQSSkgLyAoTWF0aC5wb3coTWF0aC50YW4oMC41ICogdGhpcy5sYXQwICsgRk9SVFBJKSwgdGhpcy5DKSAqIHNyYXQodGhpcy5lICogc3BoaSwgdGhpcy5yYXRleHApKTtcbn07XG5cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcblxuICBwLnkgPSAyICogTWF0aC5hdGFuKHRoaXMuSyAqIE1hdGgucG93KE1hdGgudGFuKDAuNSAqIGxhdCArIEZPUlRQSSksIHRoaXMuQykgKiBzcmF0KHRoaXMuZSAqIE1hdGguc2luKGxhdCksIHRoaXMucmF0ZXhwKSkgLSBIQUxGX1BJO1xuICBwLnggPSB0aGlzLkMgKiBsb247XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgREVMX1RPTCA9IDFlLTE0O1xuICB2YXIgbG9uID0gcC54IC8gdGhpcy5DO1xuICB2YXIgbGF0ID0gcC55O1xuICB2YXIgbnVtID0gTWF0aC5wb3coTWF0aC50YW4oMC41ICogbGF0ICsgRk9SVFBJKSAvIHRoaXMuSywgMSAvIHRoaXMuQyk7XG4gIGZvciAodmFyIGkgPSBNQVhfSVRFUjsgaSA+IDA7IC0taSkge1xuICAgIGxhdCA9IDIgKiBNYXRoLmF0YW4obnVtICogc3JhdCh0aGlzLmUgKiBNYXRoLnNpbihwLnkpLCAtIDAuNSAqIHRoaXMuZSkpIC0gSEFMRl9QSTtcbiAgICBpZiAoTWF0aC5hYnMobGF0IC0gcC55KSA8IERFTF9UT0wpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBwLnkgPSBsYXQ7XG4gIH1cbiAgLyogY29udmVyZ2VuY2UgZmFpbGVkICovXG4gIGlmICghaSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiZ2F1c3NcIl07XG4iLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIGFzaW56ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FzaW56Jyk7XG5cbi8qXG4gIHJlZmVyZW5jZTpcbiAgICBXb2xmcmFtIE1hdGh3b3JsZCBcIkdub21vbmljIFByb2plY3Rpb25cIlxuICAgIGh0dHA6Ly9tYXRod29ybGQud29sZnJhbS5jb20vR25vbW9uaWNQcm9qZWN0aW9uLmh0bWxcbiAgICBBY2Nlc3NlZDogMTJ0aCBOb3ZlbWJlciAyMDA5XG4gICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcblxuICAvKiBQbGFjZSBwYXJhbWV0ZXJzIGluIHN0YXRpYyBzdG9yYWdlIGZvciBjb21tb24gdXNlXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdGhpcy5zaW5fcDE0ID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgdGhpcy5jb3NfcDE0ID0gTWF0aC5jb3ModGhpcy5sYXQwKTtcbiAgLy8gQXBwcm94aW1hdGlvbiBmb3IgcHJvamVjdGluZyBwb2ludHMgdG8gdGhlIGhvcml6b24gKGluZmluaXR5KVxuICB0aGlzLmluZmluaXR5X2Rpc3QgPSAxMDAwICogdGhpcy5hO1xuICB0aGlzLnJjID0gMTtcbn07XG5cblxuLyogR25vbW9uaWMgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHNpbnBoaSwgY29zcGhpOyAvKiBzaW4gYW5kIGNvcyB2YWx1ZSAgICAgICAgKi9cbiAgdmFyIGRsb247IC8qIGRlbHRhIGxvbmdpdHVkZSB2YWx1ZSAgICAgICovXG4gIHZhciBjb3Nsb247IC8qIGNvcyBvZiBsb25naXR1ZGUgICAgICAgICovXG4gIHZhciBrc3A7IC8qIHNjYWxlIGZhY3RvciAgICAgICAgICAqL1xuICB2YXIgZztcbiAgdmFyIHgsIHk7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIGRsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuXG4gIHNpbnBoaSA9IE1hdGguc2luKGxhdCk7XG4gIGNvc3BoaSA9IE1hdGguY29zKGxhdCk7XG5cbiAgY29zbG9uID0gTWF0aC5jb3MoZGxvbik7XG4gIGcgPSB0aGlzLnNpbl9wMTQgKiBzaW5waGkgKyB0aGlzLmNvc19wMTQgKiBjb3NwaGkgKiBjb3Nsb247XG4gIGtzcCA9IDE7XG4gIGlmICgoZyA+IDApIHx8IChNYXRoLmFicyhnKSA8PSBFUFNMTikpIHtcbiAgICB4ID0gdGhpcy54MCArIHRoaXMuYSAqIGtzcCAqIGNvc3BoaSAqIE1hdGguc2luKGRsb24pIC8gZztcbiAgICB5ID0gdGhpcy55MCArIHRoaXMuYSAqIGtzcCAqICh0aGlzLmNvc19wMTQgKiBzaW5waGkgLSB0aGlzLnNpbl9wMTQgKiBjb3NwaGkgKiBjb3Nsb24pIC8gZztcbiAgfVxuICBlbHNlIHtcblxuICAgIC8vIFBvaW50IGlzIGluIHRoZSBvcHBvc2luZyBoZW1pc3BoZXJlIGFuZCBpcyB1bnByb2plY3RhYmxlXG4gICAgLy8gV2Ugc3RpbGwgbmVlZCB0byByZXR1cm4gYSByZWFzb25hYmxlIHBvaW50LCBzbyB3ZSBwcm9qZWN0IFxuICAgIC8vIHRvIGluZmluaXR5LCBvbiBhIGJlYXJpbmcgXG4gICAgLy8gZXF1aXZhbGVudCB0byB0aGUgbm9ydGhlcm4gaGVtaXNwaGVyZSBlcXVpdmFsZW50XG4gICAgLy8gVGhpcyBpcyBhIHJlYXNvbmFibGUgYXBwcm94aW1hdGlvbiBmb3Igc2hvcnQgc2hhcGVzIGFuZCBsaW5lcyB0aGF0IFxuICAgIC8vIHN0cmFkZGxlIHRoZSBob3Jpem9uLlxuXG4gICAgeCA9IHRoaXMueDAgKyB0aGlzLmluZmluaXR5X2Rpc3QgKiBjb3NwaGkgKiBNYXRoLnNpbihkbG9uKTtcbiAgICB5ID0gdGhpcy55MCArIHRoaXMuaW5maW5pdHlfZGlzdCAqICh0aGlzLmNvc19wMTQgKiBzaW5waGkgLSB0aGlzLnNpbl9wMTQgKiBjb3NwaGkgKiBjb3Nsb24pO1xuXG4gIH1cbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHJoOyAvKiBSaG8gKi9cbiAgdmFyIHNpbmMsIGNvc2M7XG4gIHZhciBjO1xuICB2YXIgbG9uLCBsYXQ7XG5cbiAgLyogSW52ZXJzZSBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgcC54ID0gKHAueCAtIHRoaXMueDApIC8gdGhpcy5hO1xuICBwLnkgPSAocC55IC0gdGhpcy55MCkgLyB0aGlzLmE7XG5cbiAgcC54IC89IHRoaXMuazA7XG4gIHAueSAvPSB0aGlzLmswO1xuXG4gIGlmICgocmggPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KSkpIHtcbiAgICBjID0gTWF0aC5hdGFuMihyaCwgdGhpcy5yYyk7XG4gICAgc2luYyA9IE1hdGguc2luKGMpO1xuICAgIGNvc2MgPSBNYXRoLmNvcyhjKTtcblxuICAgIGxhdCA9IGFzaW56KGNvc2MgKiB0aGlzLnNpbl9wMTQgKyAocC55ICogc2luYyAqIHRoaXMuY29zX3AxNCkgLyByaCk7XG4gICAgbG9uID0gTWF0aC5hdGFuMihwLnggKiBzaW5jLCByaCAqIHRoaXMuY29zX3AxNCAqIGNvc2MgLSBwLnkgKiB0aGlzLnNpbl9wMTQgKiBzaW5jKTtcbiAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBsb24pO1xuICB9XG4gIGVsc2Uge1xuICAgIGxhdCA9IHRoaXMucGhpYzA7XG4gICAgbG9uID0gMDtcbiAgfVxuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiZ25vbVwiXTtcbiIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmEgPSA2Mzc3Mzk3LjE1NTtcbiAgdGhpcy5lcyA9IDAuMDA2Njc0MzcyMjMwNjE0O1xuICB0aGlzLmUgPSBNYXRoLnNxcnQodGhpcy5lcyk7XG4gIGlmICghdGhpcy5sYXQwKSB7XG4gICAgdGhpcy5sYXQwID0gMC44NjM5Mzc5Nzk3MzcxOTM7XG4gIH1cbiAgaWYgKCF0aGlzLmxvbmcwKSB7XG4gICAgdGhpcy5sb25nMCA9IDAuNzQxNzY0OTMyMDk3NTkwMSAtIDAuMzA4MzQxNTAxMTg1NjY1O1xuICB9XG4gIC8qIGlmIHNjYWxlIG5vdCBzZXQgZGVmYXVsdCB0byAwLjk5OTkgKi9cbiAgaWYgKCF0aGlzLmswKSB7XG4gICAgdGhpcy5rMCA9IDAuOTk5OTtcbiAgfVxuICB0aGlzLnM0NSA9IDAuNzg1Mzk4MTYzMzk3NDQ4OyAvKiA0NSAqL1xuICB0aGlzLnM5MCA9IDIgKiB0aGlzLnM0NTtcbiAgdGhpcy5maTAgPSB0aGlzLmxhdDA7XG4gIHRoaXMuZTIgPSB0aGlzLmVzO1xuICB0aGlzLmUgPSBNYXRoLnNxcnQodGhpcy5lMik7XG4gIHRoaXMuYWxmYSA9IE1hdGguc3FydCgxICsgKHRoaXMuZTIgKiBNYXRoLnBvdyhNYXRoLmNvcyh0aGlzLmZpMCksIDQpKSAvICgxIC0gdGhpcy5lMikpO1xuICB0aGlzLnVxID0gMS4wNDIxNjg1NjM4MDQ3NDtcbiAgdGhpcy51MCA9IE1hdGguYXNpbihNYXRoLnNpbih0aGlzLmZpMCkgLyB0aGlzLmFsZmEpO1xuICB0aGlzLmcgPSBNYXRoLnBvdygoMSArIHRoaXMuZSAqIE1hdGguc2luKHRoaXMuZmkwKSkgLyAoMSAtIHRoaXMuZSAqIE1hdGguc2luKHRoaXMuZmkwKSksIHRoaXMuYWxmYSAqIHRoaXMuZSAvIDIpO1xuICB0aGlzLmsgPSBNYXRoLnRhbih0aGlzLnUwIC8gMiArIHRoaXMuczQ1KSAvIE1hdGgucG93KE1hdGgudGFuKHRoaXMuZmkwIC8gMiArIHRoaXMuczQ1KSwgdGhpcy5hbGZhKSAqIHRoaXMuZztcbiAgdGhpcy5rMSA9IHRoaXMuazA7XG4gIHRoaXMubjAgPSB0aGlzLmEgKiBNYXRoLnNxcnQoMSAtIHRoaXMuZTIpIC8gKDEgLSB0aGlzLmUyICogTWF0aC5wb3coTWF0aC5zaW4odGhpcy5maTApLCAyKSk7XG4gIHRoaXMuczAgPSAxLjM3MDA4MzQ2MjgxNTU1O1xuICB0aGlzLm4gPSBNYXRoLnNpbih0aGlzLnMwKTtcbiAgdGhpcy5ybzAgPSB0aGlzLmsxICogdGhpcy5uMCAvIE1hdGgudGFuKHRoaXMuczApO1xuICB0aGlzLmFkID0gdGhpcy5zOTAgLSB0aGlzLnVxO1xufTtcblxuLyogZWxsaXBzb2lkICovXG4vKiBjYWxjdWxhdGUgeHkgZnJvbSBsYXQvbG9uICovXG4vKiBDb25zdGFudHMsIGlkZW50aWNhbCB0byBpbnZlcnNlIHRyYW5zZm9ybSBmdW5jdGlvbiAqL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgZ2ZpLCB1LCBkZWx0YXYsIHMsIGQsIGVwcywgcm87XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIHZhciBkZWx0YV9sb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICAvKiBUcmFuc2Zvcm1hdGlvbiAqL1xuICBnZmkgPSBNYXRoLnBvdygoKDEgKyB0aGlzLmUgKiBNYXRoLnNpbihsYXQpKSAvICgxIC0gdGhpcy5lICogTWF0aC5zaW4obGF0KSkpLCAodGhpcy5hbGZhICogdGhpcy5lIC8gMikpO1xuICB1ID0gMiAqIChNYXRoLmF0YW4odGhpcy5rICogTWF0aC5wb3coTWF0aC50YW4obGF0IC8gMiArIHRoaXMuczQ1KSwgdGhpcy5hbGZhKSAvIGdmaSkgLSB0aGlzLnM0NSk7XG4gIGRlbHRhdiA9IC1kZWx0YV9sb24gKiB0aGlzLmFsZmE7XG4gIHMgPSBNYXRoLmFzaW4oTWF0aC5jb3ModGhpcy5hZCkgKiBNYXRoLnNpbih1KSArIE1hdGguc2luKHRoaXMuYWQpICogTWF0aC5jb3ModSkgKiBNYXRoLmNvcyhkZWx0YXYpKTtcbiAgZCA9IE1hdGguYXNpbihNYXRoLmNvcyh1KSAqIE1hdGguc2luKGRlbHRhdikgLyBNYXRoLmNvcyhzKSk7XG4gIGVwcyA9IHRoaXMubiAqIGQ7XG4gIHJvID0gdGhpcy5ybzAgKiBNYXRoLnBvdyhNYXRoLnRhbih0aGlzLnMwIC8gMiArIHRoaXMuczQ1KSwgdGhpcy5uKSAvIE1hdGgucG93KE1hdGgudGFuKHMgLyAyICsgdGhpcy5zNDUpLCB0aGlzLm4pO1xuICBwLnkgPSBybyAqIE1hdGguY29zKGVwcykgLyAxO1xuICBwLnggPSBybyAqIE1hdGguc2luKGVwcykgLyAxO1xuXG4gIGlmICghdGhpcy5jemVjaCkge1xuICAgIHAueSAqPSAtMTtcbiAgICBwLnggKj0gLTE7XG4gIH1cbiAgcmV0dXJuIChwKTtcbn07XG5cbi8qIGNhbGN1bGF0ZSBsYXQvbG9uIGZyb20geHkgKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHUsIGRlbHRhdiwgcywgZCwgZXBzLCBybywgZmkxO1xuICB2YXIgb2s7XG5cbiAgLyogVHJhbnNmb3JtYXRpb24gKi9cbiAgLyogcmV2ZXJ0IHksIHgqL1xuICB2YXIgdG1wID0gcC54O1xuICBwLnggPSBwLnk7XG4gIHAueSA9IHRtcDtcbiAgaWYgKCF0aGlzLmN6ZWNoKSB7XG4gICAgcC55ICo9IC0xO1xuICAgIHAueCAqPSAtMTtcbiAgfVxuICBybyA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICBlcHMgPSBNYXRoLmF0YW4yKHAueSwgcC54KTtcbiAgZCA9IGVwcyAvIE1hdGguc2luKHRoaXMuczApO1xuICBzID0gMiAqIChNYXRoLmF0YW4oTWF0aC5wb3codGhpcy5ybzAgLyBybywgMSAvIHRoaXMubikgKiBNYXRoLnRhbih0aGlzLnMwIC8gMiArIHRoaXMuczQ1KSkgLSB0aGlzLnM0NSk7XG4gIHUgPSBNYXRoLmFzaW4oTWF0aC5jb3ModGhpcy5hZCkgKiBNYXRoLnNpbihzKSAtIE1hdGguc2luKHRoaXMuYWQpICogTWF0aC5jb3MocykgKiBNYXRoLmNvcyhkKSk7XG4gIGRlbHRhdiA9IE1hdGguYXNpbihNYXRoLmNvcyhzKSAqIE1hdGguc2luKGQpIC8gTWF0aC5jb3ModSkpO1xuICBwLnggPSB0aGlzLmxvbmcwIC0gZGVsdGF2IC8gdGhpcy5hbGZhO1xuICBmaTEgPSB1O1xuICBvayA9IDA7XG4gIHZhciBpdGVyID0gMDtcbiAgZG8ge1xuICAgIHAueSA9IDIgKiAoTWF0aC5hdGFuKE1hdGgucG93KHRoaXMuaywgLSAxIC8gdGhpcy5hbGZhKSAqIE1hdGgucG93KE1hdGgudGFuKHUgLyAyICsgdGhpcy5zNDUpLCAxIC8gdGhpcy5hbGZhKSAqIE1hdGgucG93KCgxICsgdGhpcy5lICogTWF0aC5zaW4oZmkxKSkgLyAoMSAtIHRoaXMuZSAqIE1hdGguc2luKGZpMSkpLCB0aGlzLmUgLyAyKSkgLSB0aGlzLnM0NSk7XG4gICAgaWYgKE1hdGguYWJzKGZpMSAtIHAueSkgPCAwLjAwMDAwMDAwMDEpIHtcbiAgICAgIG9rID0gMTtcbiAgICB9XG4gICAgZmkxID0gcC55O1xuICAgIGl0ZXIgKz0gMTtcbiAgfSB3aGlsZSAob2sgPT09IDAgJiYgaXRlciA8IDE1KTtcbiAgaWYgKGl0ZXIgPj0gMTUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiAocCk7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIktyb3Zha1wiLCBcImtyb3Zha1wiXTtcbiIsInZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEZPUlRQSSA9IE1hdGguUEkvNDtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgcXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vcXNmbnonKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbi8qXG4gIHJlZmVyZW5jZVxuICAgIFwiTmV3IEVxdWFsLUFyZWEgTWFwIFByb2plY3Rpb25zIGZvciBOb25jaXJjdWxhciBSZWdpb25zXCIsIEpvaG4gUC4gU255ZGVyLFxuICAgIFRoZSBBbWVyaWNhbiBDYXJ0b2dyYXBoZXIsIFZvbCAxNSwgTm8uIDQsIE9jdG9iZXIgMTk4OCwgcHAuIDM0MS0zNTUuXG4gICovXG5cbmV4cG9ydHMuU19QT0xFID0gMTtcbmV4cG9ydHMuTl9QT0xFID0gMjtcbmV4cG9ydHMuRVFVSVQgPSAzO1xuZXhwb3J0cy5PQkxJUSA9IDQ7XG5cblxuLyogSW5pdGlhbGl6ZSB0aGUgTGFtYmVydCBBemltdXRoYWwgRXF1YWwgQXJlYSBwcm9qZWN0aW9uXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBNYXRoLmFicyh0aGlzLmxhdDApO1xuICBpZiAoTWF0aC5hYnModCAtIEhBTEZfUEkpIDwgRVBTTE4pIHtcbiAgICB0aGlzLm1vZGUgPSB0aGlzLmxhdDAgPCAwID8gdGhpcy5TX1BPTEUgOiB0aGlzLk5fUE9MRTtcbiAgfVxuICBlbHNlIGlmIChNYXRoLmFicyh0KSA8IEVQU0xOKSB7XG4gICAgdGhpcy5tb2RlID0gdGhpcy5FUVVJVDtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLm1vZGUgPSB0aGlzLk9CTElRO1xuICB9XG4gIGlmICh0aGlzLmVzID4gMCkge1xuICAgIHZhciBzaW5waGk7XG5cbiAgICB0aGlzLnFwID0gcXNmbnoodGhpcy5lLCAxKTtcbiAgICB0aGlzLm1tZiA9IDAuNSAvICgxIC0gdGhpcy5lcyk7XG4gICAgdGhpcy5hcGEgPSB0aGlzLmF1dGhzZXQodGhpcy5lcyk7XG4gICAgc3dpdGNoICh0aGlzLm1vZGUpIHtcbiAgICBjYXNlIHRoaXMuTl9QT0xFOlxuICAgICAgdGhpcy5kZCA9IDE7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuU19QT0xFOlxuICAgICAgdGhpcy5kZCA9IDE7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuRVFVSVQ6XG4gICAgICB0aGlzLnJxID0gTWF0aC5zcXJ0KDAuNSAqIHRoaXMucXApO1xuICAgICAgdGhpcy5kZCA9IDEgLyB0aGlzLnJxO1xuICAgICAgdGhpcy54bWYgPSAxO1xuICAgICAgdGhpcy55bWYgPSAwLjUgKiB0aGlzLnFwO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLk9CTElROlxuICAgICAgdGhpcy5ycSA9IE1hdGguc3FydCgwLjUgKiB0aGlzLnFwKTtcbiAgICAgIHNpbnBoaSA9IE1hdGguc2luKHRoaXMubGF0MCk7XG4gICAgICB0aGlzLnNpbmIxID0gcXNmbnoodGhpcy5lLCBzaW5waGkpIC8gdGhpcy5xcDtcbiAgICAgIHRoaXMuY29zYjEgPSBNYXRoLnNxcnQoMSAtIHRoaXMuc2luYjEgKiB0aGlzLnNpbmIxKTtcbiAgICAgIHRoaXMuZGQgPSBNYXRoLmNvcyh0aGlzLmxhdDApIC8gKE1hdGguc3FydCgxIC0gdGhpcy5lcyAqIHNpbnBoaSAqIHNpbnBoaSkgKiB0aGlzLnJxICogdGhpcy5jb3NiMSk7XG4gICAgICB0aGlzLnltZiA9ICh0aGlzLnhtZiA9IHRoaXMucnEpIC8gdGhpcy5kZDtcbiAgICAgIHRoaXMueG1mICo9IHRoaXMuZGQ7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSkge1xuICAgICAgdGhpcy5zaW5waDAgPSBNYXRoLnNpbih0aGlzLmxhdDApO1xuICAgICAgdGhpcy5jb3NwaDAgPSBNYXRoLmNvcyh0aGlzLmxhdDApO1xuICAgIH1cbiAgfVxufTtcblxuLyogTGFtYmVydCBBemltdXRoYWwgRXF1YWwgQXJlYSBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuXG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHZhciB4LCB5LCBjb3NsYW0sIHNpbmxhbSwgc2lucGhpLCBxLCBzaW5iLCBjb3NiLCBiLCBjb3NwaGk7XG4gIHZhciBsYW0gPSBwLng7XG4gIHZhciBwaGkgPSBwLnk7XG5cbiAgbGFtID0gYWRqdXN0X2xvbihsYW0gLSB0aGlzLmxvbmcwKTtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBzaW5waGkgPSBNYXRoLnNpbihwaGkpO1xuICAgIGNvc3BoaSA9IE1hdGguY29zKHBoaSk7XG4gICAgY29zbGFtID0gTWF0aC5jb3MobGFtKTtcbiAgICBpZiAodGhpcy5tb2RlID09PSB0aGlzLk9CTElRIHx8IHRoaXMubW9kZSA9PT0gdGhpcy5FUVVJVCkge1xuICAgICAgeSA9ICh0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQpID8gMSArIGNvc3BoaSAqIGNvc2xhbSA6IDEgKyB0aGlzLnNpbnBoMCAqIHNpbnBoaSArIHRoaXMuY29zcGgwICogY29zcGhpICogY29zbGFtO1xuICAgICAgaWYgKHkgPD0gRVBTTE4pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB5ID0gTWF0aC5zcXJ0KDIgLyB5KTtcbiAgICAgIHggPSB5ICogY29zcGhpICogTWF0aC5zaW4obGFtKTtcbiAgICAgIHkgKj0gKHRoaXMubW9kZSA9PT0gdGhpcy5FUVVJVCkgPyBzaW5waGkgOiB0aGlzLmNvc3BoMCAqIHNpbnBoaSAtIHRoaXMuc2lucGgwICogY29zcGhpICogY29zbGFtO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuTl9QT0xFIHx8IHRoaXMubW9kZSA9PT0gdGhpcy5TX1BPTEUpIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuTl9QT0xFKSB7XG4gICAgICAgIGNvc2xhbSA9IC1jb3NsYW07XG4gICAgICB9XG4gICAgICBpZiAoTWF0aC5hYnMocGhpICsgdGhpcy5waGkwKSA8IEVQU0xOKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgeSA9IEZPUlRQSSAtIHBoaSAqIDAuNTtcbiAgICAgIHkgPSAyICogKCh0aGlzLm1vZGUgPT09IHRoaXMuU19QT0xFKSA/IE1hdGguY29zKHkpIDogTWF0aC5zaW4oeSkpO1xuICAgICAgeCA9IHkgKiBNYXRoLnNpbihsYW0pO1xuICAgICAgeSAqPSBjb3NsYW07XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIHNpbmIgPSAwO1xuICAgIGNvc2IgPSAwO1xuICAgIGIgPSAwO1xuICAgIGNvc2xhbSA9IE1hdGguY29zKGxhbSk7XG4gICAgc2lubGFtID0gTWF0aC5zaW4obGFtKTtcbiAgICBzaW5waGkgPSBNYXRoLnNpbihwaGkpO1xuICAgIHEgPSBxc2Zueih0aGlzLmUsIHNpbnBoaSk7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSB8fCB0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQpIHtcbiAgICAgIHNpbmIgPSBxIC8gdGhpcy5xcDtcbiAgICAgIGNvc2IgPSBNYXRoLnNxcnQoMSAtIHNpbmIgKiBzaW5iKTtcbiAgICB9XG4gICAgc3dpdGNoICh0aGlzLm1vZGUpIHtcbiAgICBjYXNlIHRoaXMuT0JMSVE6XG4gICAgICBiID0gMSArIHRoaXMuc2luYjEgKiBzaW5iICsgdGhpcy5jb3NiMSAqIGNvc2IgKiBjb3NsYW07XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuRVFVSVQ6XG4gICAgICBiID0gMSArIGNvc2IgKiBjb3NsYW07XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuTl9QT0xFOlxuICAgICAgYiA9IEhBTEZfUEkgKyBwaGk7XG4gICAgICBxID0gdGhpcy5xcCAtIHE7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuU19QT0xFOlxuICAgICAgYiA9IHBoaSAtIEhBTEZfUEk7XG4gICAgICBxID0gdGhpcy5xcCArIHE7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKE1hdGguYWJzKGIpIDwgRVBTTE4pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBzd2l0Y2ggKHRoaXMubW9kZSkge1xuICAgIGNhc2UgdGhpcy5PQkxJUTpcbiAgICBjYXNlIHRoaXMuRVFVSVQ6XG4gICAgICBiID0gTWF0aC5zcXJ0KDIgLyBiKTtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuT0JMSVEpIHtcbiAgICAgICAgeSA9IHRoaXMueW1mICogYiAqICh0aGlzLmNvc2IxICogc2luYiAtIHRoaXMuc2luYjEgKiBjb3NiICogY29zbGFtKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB5ID0gKGIgPSBNYXRoLnNxcnQoMiAvICgxICsgY29zYiAqIGNvc2xhbSkpKSAqIHNpbmIgKiB0aGlzLnltZjtcbiAgICAgIH1cbiAgICAgIHggPSB0aGlzLnhtZiAqIGIgKiBjb3NiICogc2lubGFtO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLk5fUE9MRTpcbiAgICBjYXNlIHRoaXMuU19QT0xFOlxuICAgICAgaWYgKHEgPj0gMCkge1xuICAgICAgICB4ID0gKGIgPSBNYXRoLnNxcnQocSkpICogc2lubGFtO1xuICAgICAgICB5ID0gY29zbGFtICogKCh0aGlzLm1vZGUgPT09IHRoaXMuU19QT0xFKSA/IGIgOiAtYik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgeCA9IHkgPSAwO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcC54ID0gdGhpcy5hICogeCArIHRoaXMueDA7XG4gIHAueSA9IHRoaXMuYSAqIHkgKyB0aGlzLnkwO1xuICByZXR1cm4gcDtcbn07XG5cbi8qIEludmVyc2UgZXF1YXRpb25zXG4gIC0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICB2YXIgeCA9IHAueCAvIHRoaXMuYTtcbiAgdmFyIHkgPSBwLnkgLyB0aGlzLmE7XG4gIHZhciBsYW0sIHBoaSwgY0NlLCBzQ2UsIHEsIHJobywgYWI7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgdmFyIGNvc3ogPSAwLFxuICAgICAgcmgsIHNpbnogPSAwO1xuXG4gICAgcmggPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG4gICAgcGhpID0gcmggKiAwLjU7XG4gICAgaWYgKHBoaSA+IDEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwaGkgPSAyICogTWF0aC5hc2luKHBoaSk7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSB8fCB0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQpIHtcbiAgICAgIHNpbnogPSBNYXRoLnNpbihwaGkpO1xuICAgICAgY29zeiA9IE1hdGguY29zKHBoaSk7XG4gICAgfVxuICAgIHN3aXRjaCAodGhpcy5tb2RlKSB7XG4gICAgY2FzZSB0aGlzLkVRVUlUOlxuICAgICAgcGhpID0gKE1hdGguYWJzKHJoKSA8PSBFUFNMTikgPyAwIDogTWF0aC5hc2luKHkgKiBzaW56IC8gcmgpO1xuICAgICAgeCAqPSBzaW56O1xuICAgICAgeSA9IGNvc3ogKiByaDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5PQkxJUTpcbiAgICAgIHBoaSA9IChNYXRoLmFicyhyaCkgPD0gRVBTTE4pID8gdGhpcy5waGkwIDogTWF0aC5hc2luKGNvc3ogKiB0aGlzLnNpbnBoMCArIHkgKiBzaW56ICogdGhpcy5jb3NwaDAgLyByaCk7XG4gICAgICB4ICo9IHNpbnogKiB0aGlzLmNvc3BoMDtcbiAgICAgIHkgPSAoY29zeiAtIE1hdGguc2luKHBoaSkgKiB0aGlzLnNpbnBoMCkgKiByaDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5OX1BPTEU6XG4gICAgICB5ID0gLXk7XG4gICAgICBwaGkgPSBIQUxGX1BJIC0gcGhpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLlNfUE9MRTpcbiAgICAgIHBoaSAtPSBIQUxGX1BJO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxhbSA9ICh5ID09PSAwICYmICh0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQgfHwgdGhpcy5tb2RlID09PSB0aGlzLk9CTElRKSkgPyAwIDogTWF0aC5hdGFuMih4LCB5KTtcbiAgfVxuICBlbHNlIHtcbiAgICBhYiA9IDA7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSB8fCB0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQpIHtcbiAgICAgIHggLz0gdGhpcy5kZDtcbiAgICAgIHkgKj0gdGhpcy5kZDtcbiAgICAgIHJobyA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICAgIGlmIChyaG8gPCBFUFNMTikge1xuICAgICAgICBwLnggPSAwO1xuICAgICAgICBwLnkgPSB0aGlzLnBoaTA7XG4gICAgICAgIHJldHVybiBwO1xuICAgICAgfVxuICAgICAgc0NlID0gMiAqIE1hdGguYXNpbigwLjUgKiByaG8gLyB0aGlzLnJxKTtcbiAgICAgIGNDZSA9IE1hdGguY29zKHNDZSk7XG4gICAgICB4ICo9IChzQ2UgPSBNYXRoLnNpbihzQ2UpKTtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuT0JMSVEpIHtcbiAgICAgICAgYWIgPSBjQ2UgKiB0aGlzLnNpbmIxICsgeSAqIHNDZSAqIHRoaXMuY29zYjEgLyByaG87XG4gICAgICAgIHEgPSB0aGlzLnFwICogYWI7XG4gICAgICAgIHkgPSByaG8gKiB0aGlzLmNvc2IxICogY0NlIC0geSAqIHRoaXMuc2luYjEgKiBzQ2U7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYWIgPSB5ICogc0NlIC8gcmhvO1xuICAgICAgICBxID0gdGhpcy5xcCAqIGFiO1xuICAgICAgICB5ID0gcmhvICogY0NlO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuTl9QT0xFIHx8IHRoaXMubW9kZSA9PT0gdGhpcy5TX1BPTEUpIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuTl9QT0xFKSB7XG4gICAgICAgIHkgPSAteTtcbiAgICAgIH1cbiAgICAgIHEgPSAoeCAqIHggKyB5ICogeSk7XG4gICAgICBpZiAoIXEpIHtcbiAgICAgICAgcC54ID0gMDtcbiAgICAgICAgcC55ID0gdGhpcy5waGkwO1xuICAgICAgICByZXR1cm4gcDtcbiAgICAgIH1cbiAgICAgIGFiID0gMSAtIHEgLyB0aGlzLnFwO1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5TX1BPTEUpIHtcbiAgICAgICAgYWIgPSAtYWI7XG4gICAgICB9XG4gICAgfVxuICAgIGxhbSA9IE1hdGguYXRhbjIoeCwgeSk7XG4gICAgcGhpID0gdGhpcy5hdXRobGF0KE1hdGguYXNpbihhYiksIHRoaXMuYXBhKTtcbiAgfVxuXG5cbiAgcC54ID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgbGFtKTtcbiAgcC55ID0gcGhpO1xuICByZXR1cm4gcDtcbn07XG5cbi8qIGRldGVybWluZSBsYXRpdHVkZSBmcm9tIGF1dGhhbGljIGxhdGl0dWRlICovXG5leHBvcnRzLlAwMCA9IDAuMzMzMzMzMzMzMzMzMzMzMzMzMzM7XG5leHBvcnRzLlAwMSA9IDAuMTcyMjIyMjIyMjIyMjIyMjIyMjI7XG5leHBvcnRzLlAwMiA9IDAuMTAyNTc5MzY1MDc5MzY1MDc5MzY7XG5leHBvcnRzLlAxMCA9IDAuMDYzODg4ODg4ODg4ODg4ODg4ODg7XG5leHBvcnRzLlAxMSA9IDAuMDY2NDAyMTE2NDAyMTE2NDAyMTE7XG5leHBvcnRzLlAyMCA9IDAuMDE2NDE1MDEyOTQyMTkxNTQ0NDM7XG5cbmV4cG9ydHMuYXV0aHNldCA9IGZ1bmN0aW9uKGVzKSB7XG4gIHZhciB0O1xuICB2YXIgQVBBID0gW107XG4gIEFQQVswXSA9IGVzICogdGhpcy5QMDA7XG4gIHQgPSBlcyAqIGVzO1xuICBBUEFbMF0gKz0gdCAqIHRoaXMuUDAxO1xuICBBUEFbMV0gPSB0ICogdGhpcy5QMTA7XG4gIHQgKj0gZXM7XG4gIEFQQVswXSArPSB0ICogdGhpcy5QMDI7XG4gIEFQQVsxXSArPSB0ICogdGhpcy5QMTE7XG4gIEFQQVsyXSA9IHQgKiB0aGlzLlAyMDtcbiAgcmV0dXJuIEFQQTtcbn07XG5cbmV4cG9ydHMuYXV0aGxhdCA9IGZ1bmN0aW9uKGJldGEsIEFQQSkge1xuICB2YXIgdCA9IGJldGEgKyBiZXRhO1xuICByZXR1cm4gKGJldGEgKyBBUEFbMF0gKiBNYXRoLnNpbih0KSArIEFQQVsxXSAqIE1hdGguc2luKHQgKyB0KSArIEFQQVsyXSAqIE1hdGguc2luKHQgKyB0ICsgdCkpO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJMYW1iZXJ0IEF6aW11dGhhbCBFcXVhbCBBcmVhXCIsIFwiTGFtYmVydF9BemltdXRoYWxfRXF1YWxfQXJlYVwiLCBcImxhZWFcIl07XG4iLCJ2YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIG1zZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL21zZm56Jyk7XG52YXIgdHNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vdHNmbnonKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIHNpZ24gPSByZXF1aXJlKCcuLi9jb21tb24vc2lnbicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIHBoaTJ6ID0gcmVxdWlyZSgnLi4vY29tbW9uL3BoaTJ6Jyk7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcblxuICAvLyBhcnJheSBvZjogIHJfbWFqLHJfbWluLGxhdDEsbGF0MixjX2xvbixjX2xhdCxmYWxzZV9lYXN0LGZhbHNlX25vcnRoXG4gIC8vZG91YmxlIGNfbGF0OyAgICAgICAgICAgICAgICAgICAvKiBjZW50ZXIgbGF0aXR1ZGUgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgLy9kb3VibGUgY19sb247ICAgICAgICAgICAgICAgICAgIC8qIGNlbnRlciBsb25naXR1ZGUgICAgICAgICAgICAgICAgICAgICAqL1xuICAvL2RvdWJsZSBsYXQxOyAgICAgICAgICAgICAgICAgICAgLyogZmlyc3Qgc3RhbmRhcmQgcGFyYWxsZWwgICAgICAgICAgICAgICovXG4gIC8vZG91YmxlIGxhdDI7ICAgICAgICAgICAgICAgICAgICAvKiBzZWNvbmQgc3RhbmRhcmQgcGFyYWxsZWwgICAgICAgICAgICAgKi9cbiAgLy9kb3VibGUgcl9tYWo7ICAgICAgICAgICAgICAgICAgIC8qIG1ham9yIGF4aXMgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAvL2RvdWJsZSByX21pbjsgICAgICAgICAgICAgICAgICAgLyogbWlub3IgYXhpcyAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gIC8vZG91YmxlIGZhbHNlX2Vhc3Q7ICAgICAgICAgICAgICAvKiB4IG9mZnNldCBpbiBtZXRlcnMgICAgICAgICAgICAgICAgICAgKi9cbiAgLy9kb3VibGUgZmFsc2Vfbm9ydGg7ICAgICAgICAgICAgIC8qIHkgb2Zmc2V0IGluIG1ldGVycyAgICAgICAgICAgICAgICAgICAqL1xuXG4gIGlmICghdGhpcy5sYXQyKSB7XG4gICAgdGhpcy5sYXQyID0gdGhpcy5sYXQxO1xuICB9IC8vaWYgbGF0MiBpcyBub3QgZGVmaW5lZFxuICBpZiAoIXRoaXMuazApIHtcbiAgICB0aGlzLmswID0gMTtcbiAgfVxuICB0aGlzLngwID0gdGhpcy54MCB8fCAwO1xuICB0aGlzLnkwID0gdGhpcy55MCB8fCAwO1xuICAvLyBTdGFuZGFyZCBQYXJhbGxlbHMgY2Fubm90IGJlIGVxdWFsIGFuZCBvbiBvcHBvc2l0ZSBzaWRlcyBvZiB0aGUgZXF1YXRvclxuICBpZiAoTWF0aC5hYnModGhpcy5sYXQxICsgdGhpcy5sYXQyKSA8IEVQU0xOKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHRlbXAgPSB0aGlzLmIgLyB0aGlzLmE7XG4gIHRoaXMuZSA9IE1hdGguc3FydCgxIC0gdGVtcCAqIHRlbXApO1xuXG4gIHZhciBzaW4xID0gTWF0aC5zaW4odGhpcy5sYXQxKTtcbiAgdmFyIGNvczEgPSBNYXRoLmNvcyh0aGlzLmxhdDEpO1xuICB2YXIgbXMxID0gbXNmbnoodGhpcy5lLCBzaW4xLCBjb3MxKTtcbiAgdmFyIHRzMSA9IHRzZm56KHRoaXMuZSwgdGhpcy5sYXQxLCBzaW4xKTtcblxuICB2YXIgc2luMiA9IE1hdGguc2luKHRoaXMubGF0Mik7XG4gIHZhciBjb3MyID0gTWF0aC5jb3ModGhpcy5sYXQyKTtcbiAgdmFyIG1zMiA9IG1zZm56KHRoaXMuZSwgc2luMiwgY29zMik7XG4gIHZhciB0czIgPSB0c2Zueih0aGlzLmUsIHRoaXMubGF0Miwgc2luMik7XG5cbiAgdmFyIHRzMCA9IHRzZm56KHRoaXMuZSwgdGhpcy5sYXQwLCBNYXRoLnNpbih0aGlzLmxhdDApKTtcblxuICBpZiAoTWF0aC5hYnModGhpcy5sYXQxIC0gdGhpcy5sYXQyKSA+IEVQU0xOKSB7XG4gICAgdGhpcy5ucyA9IE1hdGgubG9nKG1zMSAvIG1zMikgLyBNYXRoLmxvZyh0czEgLyB0czIpO1xuICB9XG4gIGVsc2Uge1xuICAgIHRoaXMubnMgPSBzaW4xO1xuICB9XG4gIGlmIChpc05hTih0aGlzLm5zKSkge1xuICAgIHRoaXMubnMgPSBzaW4xO1xuICB9XG4gIHRoaXMuZjAgPSBtczEgLyAodGhpcy5ucyAqIE1hdGgucG93KHRzMSwgdGhpcy5ucykpO1xuICB0aGlzLnJoID0gdGhpcy5hICogdGhpcy5mMCAqIE1hdGgucG93KHRzMCwgdGhpcy5ucyk7XG4gIGlmICghdGhpcy50aXRsZSkge1xuICAgIHRoaXMudGl0bGUgPSBcIkxhbWJlcnQgQ29uZm9ybWFsIENvbmljXCI7XG4gIH1cbn07XG5cblxuLy8gTGFtYmVydCBDb25mb3JtYWwgY29uaWMgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuXG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG5cbiAgLy8gc2luZ3VsYXIgY2FzZXMgOlxuICBpZiAoTWF0aC5hYnMoMiAqIE1hdGguYWJzKGxhdCkgLSBNYXRoLlBJKSA8PSBFUFNMTikge1xuICAgIGxhdCA9IHNpZ24obGF0KSAqIChIQUxGX1BJIC0gMiAqIEVQU0xOKTtcbiAgfVxuXG4gIHZhciBjb24gPSBNYXRoLmFicyhNYXRoLmFicyhsYXQpIC0gSEFMRl9QSSk7XG4gIHZhciB0cywgcmgxO1xuICBpZiAoY29uID4gRVBTTE4pIHtcbiAgICB0cyA9IHRzZm56KHRoaXMuZSwgbGF0LCBNYXRoLnNpbihsYXQpKTtcbiAgICByaDEgPSB0aGlzLmEgKiB0aGlzLmYwICogTWF0aC5wb3codHMsIHRoaXMubnMpO1xuICB9XG4gIGVsc2Uge1xuICAgIGNvbiA9IGxhdCAqIHRoaXMubnM7XG4gICAgaWYgKGNvbiA8PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmgxID0gMDtcbiAgfVxuICB2YXIgdGhldGEgPSB0aGlzLm5zICogYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgcC54ID0gdGhpcy5rMCAqIChyaDEgKiBNYXRoLnNpbih0aGV0YSkpICsgdGhpcy54MDtcbiAgcC55ID0gdGhpcy5rMCAqICh0aGlzLnJoIC0gcmgxICogTWF0aC5jb3ModGhldGEpKSArIHRoaXMueTA7XG5cbiAgcmV0dXJuIHA7XG59O1xuXG4vLyBMYW1iZXJ0IENvbmZvcm1hbCBDb25pYyBpbnZlcnNlIGVxdWF0aW9ucy0tbWFwcGluZyB4LHkgdG8gbGF0L2xvbmdcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG5cbiAgdmFyIHJoMSwgY29uLCB0cztcbiAgdmFyIGxhdCwgbG9uO1xuICB2YXIgeCA9IChwLnggLSB0aGlzLngwKSAvIHRoaXMuazA7XG4gIHZhciB5ID0gKHRoaXMucmggLSAocC55IC0gdGhpcy55MCkgLyB0aGlzLmswKTtcbiAgaWYgKHRoaXMubnMgPiAwKSB7XG4gICAgcmgxID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xuICAgIGNvbiA9IDE7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmgxID0gLU1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICBjb24gPSAtMTtcbiAgfVxuICB2YXIgdGhldGEgPSAwO1xuICBpZiAocmgxICE9PSAwKSB7XG4gICAgdGhldGEgPSBNYXRoLmF0YW4yKChjb24gKiB4KSwgKGNvbiAqIHkpKTtcbiAgfVxuICBpZiAoKHJoMSAhPT0gMCkgfHwgKHRoaXMubnMgPiAwKSkge1xuICAgIGNvbiA9IDEgLyB0aGlzLm5zO1xuICAgIHRzID0gTWF0aC5wb3coKHJoMSAvICh0aGlzLmEgKiB0aGlzLmYwKSksIGNvbik7XG4gICAgbGF0ID0gcGhpMnoodGhpcy5lLCB0cyk7XG4gICAgaWYgKGxhdCA9PT0gLTk5OTkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBsYXQgPSAtSEFMRl9QSTtcbiAgfVxuICBsb24gPSBhZGp1c3RfbG9uKHRoZXRhIC8gdGhpcy5ucyArIHRoaXMubG9uZzApO1xuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMubmFtZXMgPSBbXCJMYW1iZXJ0IFRhbmdlbnRpYWwgQ29uZm9ybWFsIENvbmljIFByb2plY3Rpb25cIiwgXCJMYW1iZXJ0X0NvbmZvcm1hbF9Db25pY1wiLCBcIkxhbWJlcnRfQ29uZm9ybWFsX0NvbmljXzJTUFwiLCBcImxjY1wiXTtcbiIsImV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAvL25vLW9wIGZvciBsb25nbGF0XG59O1xuXG5mdW5jdGlvbiBpZGVudGl0eShwdCkge1xuICByZXR1cm4gcHQ7XG59XG5leHBvcnRzLmZvcndhcmQgPSBpZGVudGl0eTtcbmV4cG9ydHMuaW52ZXJzZSA9IGlkZW50aXR5O1xuZXhwb3J0cy5uYW1lcyA9IFtcImxvbmdsYXRcIiwgXCJpZGVudGl0eVwiXTtcbiIsInZhciBtc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tc2ZueicpO1xudmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIFIyRCA9IDU3LjI5NTc3OTUxMzA4MjMyMDg4O1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIEZPUlRQSSA9IE1hdGguUEkvNDtcbnZhciB0c2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi90c2ZueicpO1xudmFyIHBoaTJ6ID0gcmVxdWlyZSgnLi4vY29tbW9uL3BoaTJ6Jyk7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNvbiA9IHRoaXMuYiAvIHRoaXMuYTtcbiAgdGhpcy5lcyA9IDEgLSBjb24gKiBjb247XG4gIGlmKCEoJ3gwJyBpbiB0aGlzKSl7XG4gICAgdGhpcy54MCA9IDA7XG4gIH1cbiAgaWYoISgneTAnIGluIHRoaXMpKXtcbiAgICB0aGlzLnkwID0gMDtcbiAgfVxuICB0aGlzLmUgPSBNYXRoLnNxcnQodGhpcy5lcyk7XG4gIGlmICh0aGlzLmxhdF90cykge1xuICAgIGlmICh0aGlzLnNwaGVyZSkge1xuICAgICAgdGhpcy5rMCA9IE1hdGguY29zKHRoaXMubGF0X3RzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmswID0gbXNmbnoodGhpcy5lLCBNYXRoLnNpbih0aGlzLmxhdF90cyksIE1hdGguY29zKHRoaXMubGF0X3RzKSk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5rMCkge1xuICAgICAgaWYgKHRoaXMuaykge1xuICAgICAgICB0aGlzLmswID0gdGhpcy5rO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuazAgPSAxO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuLyogTWVyY2F0b3IgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICAvLyBjb252ZXJ0IHRvIHJhZGlhbnNcbiAgaWYgKGxhdCAqIFIyRCA+IDkwICYmIGxhdCAqIFIyRCA8IC05MCAmJiBsb24gKiBSMkQgPiAxODAgJiYgbG9uICogUjJEIDwgLTE4MCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIHgsIHk7XG4gIGlmIChNYXRoLmFicyhNYXRoLmFicyhsYXQpIC0gSEFMRl9QSSkgPD0gRVBTTE4pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICAgIHggPSB0aGlzLngwICsgdGhpcy5hICogdGhpcy5rMCAqIGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gICAgICB5ID0gdGhpcy55MCArIHRoaXMuYSAqIHRoaXMuazAgKiBNYXRoLmxvZyhNYXRoLnRhbihGT1JUUEkgKyAwLjUgKiBsYXQpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXIgc2lucGhpID0gTWF0aC5zaW4obGF0KTtcbiAgICAgIHZhciB0cyA9IHRzZm56KHRoaXMuZSwgbGF0LCBzaW5waGkpO1xuICAgICAgeCA9IHRoaXMueDAgKyB0aGlzLmEgKiB0aGlzLmswICogYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgICAgIHkgPSB0aGlzLnkwIC0gdGhpcy5hICogdGhpcy5rMCAqIE1hdGgubG9nKHRzKTtcbiAgICB9XG4gICAgcC54ID0geDtcbiAgICBwLnkgPSB5O1xuICAgIHJldHVybiBwO1xuICB9XG59O1xuXG5cbi8qIE1lcmNhdG9yIGludmVyc2UgZXF1YXRpb25zLS1tYXBwaW5nIHgseSB0byBsYXQvbG9uZ1xuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG5cbiAgdmFyIHggPSBwLnggLSB0aGlzLngwO1xuICB2YXIgeSA9IHAueSAtIHRoaXMueTA7XG4gIHZhciBsb24sIGxhdDtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBsYXQgPSBIQUxGX1BJIC0gMiAqIE1hdGguYXRhbihNYXRoLmV4cCgteSAvICh0aGlzLmEgKiB0aGlzLmswKSkpO1xuICB9XG4gIGVsc2Uge1xuICAgIHZhciB0cyA9IE1hdGguZXhwKC15IC8gKHRoaXMuYSAqIHRoaXMuazApKTtcbiAgICBsYXQgPSBwaGkyeih0aGlzLmUsIHRzKTtcbiAgICBpZiAobGF0ID09PSAtOTk5OSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIHggLyAodGhpcy5hICogdGhpcy5rMCkpO1xuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMubmFtZXMgPSBbXCJNZXJjYXRvclwiLCBcIlBvcHVsYXIgVmlzdWFsaXNhdGlvbiBQc2V1ZG8gTWVyY2F0b3JcIiwgXCJNZXJjYXRvcl8xU1BcIiwgXCJNZXJjYXRvcl9BdXhpbGlhcnlfU3BoZXJlXCIsIFwibWVyY1wiXTtcbiIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbi8qXG4gIHJlZmVyZW5jZVxuICAgIFwiTmV3IEVxdWFsLUFyZWEgTWFwIFByb2plY3Rpb25zIGZvciBOb25jaXJjdWxhciBSZWdpb25zXCIsIEpvaG4gUC4gU255ZGVyLFxuICAgIFRoZSBBbWVyaWNhbiBDYXJ0b2dyYXBoZXIsIFZvbCAxNSwgTm8uIDQsIE9jdG9iZXIgMTk4OCwgcHAuIDM0MS0zNTUuXG4gICovXG5cblxuLyogSW5pdGlhbGl6ZSB0aGUgTWlsbGVyIEN5bGluZHJpY2FsIHByb2plY3Rpb25cbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgLy9uby1vcFxufTtcblxuXG4vKiBNaWxsZXIgQ3lsaW5kcmljYWwgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdmFyIGRsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICB2YXIgeCA9IHRoaXMueDAgKyB0aGlzLmEgKiBkbG9uO1xuICB2YXIgeSA9IHRoaXMueTAgKyB0aGlzLmEgKiBNYXRoLmxvZyhNYXRoLnRhbigoTWF0aC5QSSAvIDQpICsgKGxhdCAvIDIuNSkpKSAqIDEuMjU7XG5cbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBNaWxsZXIgQ3lsaW5kcmljYWwgaW52ZXJzZSBlcXVhdGlvbnMtLW1hcHBpbmcgeCx5IHRvIGxhdC9sb25nXG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuXG4gIHZhciBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBwLnggLyB0aGlzLmEpO1xuICB2YXIgbGF0ID0gMi41ICogKE1hdGguYXRhbihNYXRoLmV4cCgwLjggKiBwLnkgLyB0aGlzLmEpKSAtIE1hdGguUEkgLyA0KTtcblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIk1pbGxlcl9DeWxpbmRyaWNhbFwiLCBcIm1pbGxcIl07XG4iLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7fTtcblxuLyogTW9sbHdlaWRlIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuXG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG5cbiAgdmFyIGRlbHRhX2xvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciB0aGV0YSA9IGxhdDtcbiAgdmFyIGNvbiA9IE1hdGguUEkgKiBNYXRoLnNpbihsYXQpO1xuXG4gIC8qIEl0ZXJhdGUgdXNpbmcgdGhlIE5ld3Rvbi1SYXBoc29uIG1ldGhvZCB0byBmaW5kIHRoZXRhXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIGZvciAodmFyIGkgPSAwOyB0cnVlOyBpKyspIHtcbiAgICB2YXIgZGVsdGFfdGhldGEgPSAtKHRoZXRhICsgTWF0aC5zaW4odGhldGEpIC0gY29uKSAvICgxICsgTWF0aC5jb3ModGhldGEpKTtcbiAgICB0aGV0YSArPSBkZWx0YV90aGV0YTtcbiAgICBpZiAoTWF0aC5hYnMoZGVsdGFfdGhldGEpIDwgRVBTTE4pIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICB0aGV0YSAvPSAyO1xuXG4gIC8qIElmIHRoZSBsYXRpdHVkZSBpcyA5MCBkZWcsIGZvcmNlIHRoZSB4IGNvb3JkaW5hdGUgdG8gYmUgXCIwICsgZmFsc2UgZWFzdGluZ1wiXG4gICAgICAgdGhpcyBpcyBkb25lIGhlcmUgYmVjYXVzZSBvZiBwcmVjaXNpb24gcHJvYmxlbXMgd2l0aCBcImNvcyh0aGV0YSlcIlxuICAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgaWYgKE1hdGguUEkgLyAyIC0gTWF0aC5hYnMobGF0KSA8IEVQU0xOKSB7XG4gICAgZGVsdGFfbG9uID0gMDtcbiAgfVxuICB2YXIgeCA9IDAuOTAwMzE2MzE2MTU4ICogdGhpcy5hICogZGVsdGFfbG9uICogTWF0aC5jb3ModGhldGEpICsgdGhpcy54MDtcbiAgdmFyIHkgPSAxLjQxNDIxMzU2MjM3MzEgKiB0aGlzLmEgKiBNYXRoLnNpbih0aGV0YSkgKyB0aGlzLnkwO1xuXG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgdGhldGE7XG4gIHZhciBhcmc7XG5cbiAgLyogSW52ZXJzZSBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICBhcmcgPSBwLnkgLyAoMS40MTQyMTM1NjIzNzMxICogdGhpcy5hKTtcblxuICAvKiBCZWNhdXNlIG9mIGRpdmlzaW9uIGJ5IHplcm8gcHJvYmxlbXMsICdhcmcnIGNhbiBub3QgYmUgMS4gIFRoZXJlZm9yZVxuICAgICAgIGEgbnVtYmVyIHZlcnkgY2xvc2UgdG8gb25lIGlzIHVzZWQgaW5zdGVhZC5cbiAgICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgaWYgKE1hdGguYWJzKGFyZykgPiAwLjk5OTk5OTk5OTk5OSkge1xuICAgIGFyZyA9IDAuOTk5OTk5OTk5OTk5O1xuICB9XG4gIHRoZXRhID0gTWF0aC5hc2luKGFyZyk7XG4gIHZhciBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyAocC54IC8gKDAuOTAwMzE2MzE2MTU4ICogdGhpcy5hICogTWF0aC5jb3ModGhldGEpKSkpO1xuICBpZiAobG9uIDwgKC1NYXRoLlBJKSkge1xuICAgIGxvbiA9IC1NYXRoLlBJO1xuICB9XG4gIGlmIChsb24gPiBNYXRoLlBJKSB7XG4gICAgbG9uID0gTWF0aC5QSTtcbiAgfVxuICBhcmcgPSAoMiAqIHRoZXRhICsgTWF0aC5zaW4oMiAqIHRoZXRhKSkgLyBNYXRoLlBJO1xuICBpZiAoTWF0aC5hYnMoYXJnKSA+IDEpIHtcbiAgICBhcmcgPSAxO1xuICB9XG4gIHZhciBsYXQgPSBNYXRoLmFzaW4oYXJnKTtcblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIk1vbGx3ZWlkZVwiLCBcIm1vbGxcIl07XG4iLCJ2YXIgU0VDX1RPX1JBRCA9IDQuODQ4MTM2ODExMDk1MzU5OTM1ODk5MTQxMDIzNTdlLTY7XG4vKlxuICByZWZlcmVuY2VcbiAgICBEZXBhcnRtZW50IG9mIExhbmQgYW5kIFN1cnZleSBUZWNobmljYWwgQ2lyY3VsYXIgMTk3My8zMlxuICAgICAgaHR0cDovL3d3dy5saW56LmdvdnQubnovZG9jcy9taXNjZWxsYW5lb3VzL256LW1hcC1kZWZpbml0aW9uLnBkZlxuICAgIE9TRyBUZWNobmljYWwgUmVwb3J0IDQuMVxuICAgICAgaHR0cDovL3d3dy5saW56LmdvdnQubnovZG9jcy9taXNjZWxsYW5lb3VzL256bWcucGRmXG4gICovXG5cbi8qKlxuICogaXRlcmF0aW9uczogTnVtYmVyIG9mIGl0ZXJhdGlvbnMgdG8gcmVmaW5lIGludmVyc2UgdHJhbnNmb3JtLlxuICogICAgIDAgLT4ga20gYWNjdXJhY3lcbiAqICAgICAxIC0+IG0gYWNjdXJhY3kgLS0gc3VpdGFibGUgZm9yIG1vc3QgbWFwcGluZyBhcHBsaWNhdGlvbnNcbiAqICAgICAyIC0+IG1tIGFjY3VyYWN5XG4gKi9cbmV4cG9ydHMuaXRlcmF0aW9ucyA9IDE7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLkEgPSBbXTtcbiAgdGhpcy5BWzFdID0gMC42Mzk5MTc1MDczO1xuICB0aGlzLkFbMl0gPSAtMC4xMzU4Nzk3NjEzO1xuICB0aGlzLkFbM10gPSAwLjA2MzI5NDQwOTtcbiAgdGhpcy5BWzRdID0gLTAuMDI1MjY4NTM7XG4gIHRoaXMuQVs1XSA9IDAuMDExNzg3OTtcbiAgdGhpcy5BWzZdID0gLTAuMDA1NTE2MTtcbiAgdGhpcy5BWzddID0gMC4wMDI2OTA2O1xuICB0aGlzLkFbOF0gPSAtMC4wMDEzMzM7XG4gIHRoaXMuQVs5XSA9IDAuMDAwNjc7XG4gIHRoaXMuQVsxMF0gPSAtMC4wMDAzNDtcblxuICB0aGlzLkJfcmUgPSBbXTtcbiAgdGhpcy5CX2ltID0gW107XG4gIHRoaXMuQl9yZVsxXSA9IDAuNzU1Nzg1MzIyODtcbiAgdGhpcy5CX2ltWzFdID0gMDtcbiAgdGhpcy5CX3JlWzJdID0gMC4yNDkyMDQ2NDY7XG4gIHRoaXMuQl9pbVsyXSA9IDAuMDAzMzcxNTA3O1xuICB0aGlzLkJfcmVbM10gPSAtMC4wMDE1NDE3Mzk7XG4gIHRoaXMuQl9pbVszXSA9IDAuMDQxMDU4NTYwO1xuICB0aGlzLkJfcmVbNF0gPSAtMC4xMDE2MjkwNztcbiAgdGhpcy5CX2ltWzRdID0gMC4wMTcyNzYwOTtcbiAgdGhpcy5CX3JlWzVdID0gLTAuMjY2MjM0ODk7XG4gIHRoaXMuQl9pbVs1XSA9IC0wLjM2MjQ5MjE4O1xuICB0aGlzLkJfcmVbNl0gPSAtMC42ODcwOTgzO1xuICB0aGlzLkJfaW1bNl0gPSAtMS4xNjUxOTY3O1xuXG4gIHRoaXMuQ19yZSA9IFtdO1xuICB0aGlzLkNfaW0gPSBbXTtcbiAgdGhpcy5DX3JlWzFdID0gMS4zMjMxMjcwNDM5O1xuICB0aGlzLkNfaW1bMV0gPSAwO1xuICB0aGlzLkNfcmVbMl0gPSAtMC41NzcyNDU3ODk7XG4gIHRoaXMuQ19pbVsyXSA9IC0wLjAwNzgwOTU5ODtcbiAgdGhpcy5DX3JlWzNdID0gMC41MDgzMDc1MTM7XG4gIHRoaXMuQ19pbVszXSA9IC0wLjExMjIwODk1MjtcbiAgdGhpcy5DX3JlWzRdID0gLTAuMTUwOTQ3NjI7XG4gIHRoaXMuQ19pbVs0XSA9IDAuMTgyMDA2MDI7XG4gIHRoaXMuQ19yZVs1XSA9IDEuMDE0MTgxNzk7XG4gIHRoaXMuQ19pbVs1XSA9IDEuNjQ0OTc2OTY7XG4gIHRoaXMuQ19yZVs2XSA9IDEuOTY2MDU0OTtcbiAgdGhpcy5DX2ltWzZdID0gMi41MTI3NjQ1O1xuXG4gIHRoaXMuRCA9IFtdO1xuICB0aGlzLkRbMV0gPSAxLjU2MjcwMTQyNDM7XG4gIHRoaXMuRFsyXSA9IDAuNTE4NTQwNjM5ODtcbiAgdGhpcy5EWzNdID0gLTAuMDMzMzMwOTg7XG4gIHRoaXMuRFs0XSA9IC0wLjEwNTI5MDY7XG4gIHRoaXMuRFs1XSA9IC0wLjAzNjg1OTQ7XG4gIHRoaXMuRFs2XSA9IDAuMDA3MzE3O1xuICB0aGlzLkRbN10gPSAwLjAxMjIwO1xuICB0aGlzLkRbOF0gPSAwLjAwMzk0O1xuICB0aGlzLkRbOV0gPSAtMC4wMDEzO1xufTtcblxuLyoqXG4gICAgTmV3IFplYWxhbmQgTWFwIEdyaWQgRm9yd2FyZCAgLSBsb25nL2xhdCB0byB4L3lcbiAgICBsb25nL2xhdCBpbiByYWRpYW5zXG4gICovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBuO1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuXG4gIHZhciBkZWx0YV9sYXQgPSBsYXQgLSB0aGlzLmxhdDA7XG4gIHZhciBkZWx0YV9sb24gPSBsb24gLSB0aGlzLmxvbmcwO1xuXG4gIC8vIDEuIENhbGN1bGF0ZSBkX3BoaSBhbmQgZF9wc2kgICAgLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmQgZF9sYW1iZGFcbiAgLy8gRm9yIHRoaXMgYWxnb3JpdGhtLCBkZWx0YV9sYXRpdHVkZSBpcyBpbiBzZWNvbmRzIG9mIGFyYyB4IDEwLTUsIHNvIHdlIG5lZWQgdG8gc2NhbGUgdG8gdGhvc2UgdW5pdHMuIExvbmdpdHVkZSBpcyByYWRpYW5zLlxuICB2YXIgZF9waGkgPSBkZWx0YV9sYXQgLyBTRUNfVE9fUkFEICogMUUtNTtcbiAgdmFyIGRfbGFtYmRhID0gZGVsdGFfbG9uO1xuICB2YXIgZF9waGlfbiA9IDE7IC8vIGRfcGhpXjBcblxuICB2YXIgZF9wc2kgPSAwO1xuICBmb3IgKG4gPSAxOyBuIDw9IDEwOyBuKyspIHtcbiAgICBkX3BoaV9uID0gZF9waGlfbiAqIGRfcGhpO1xuICAgIGRfcHNpID0gZF9wc2kgKyB0aGlzLkFbbl0gKiBkX3BoaV9uO1xuICB9XG5cbiAgLy8gMi4gQ2FsY3VsYXRlIHRoZXRhXG4gIHZhciB0aF9yZSA9IGRfcHNpO1xuICB2YXIgdGhfaW0gPSBkX2xhbWJkYTtcblxuICAvLyAzLiBDYWxjdWxhdGUgelxuICB2YXIgdGhfbl9yZSA9IDE7XG4gIHZhciB0aF9uX2ltID0gMDsgLy8gdGhldGFeMFxuICB2YXIgdGhfbl9yZTE7XG4gIHZhciB0aF9uX2ltMTtcblxuICB2YXIgel9yZSA9IDA7XG4gIHZhciB6X2ltID0gMDtcbiAgZm9yIChuID0gMTsgbiA8PSA2OyBuKyspIHtcbiAgICB0aF9uX3JlMSA9IHRoX25fcmUgKiB0aF9yZSAtIHRoX25faW0gKiB0aF9pbTtcbiAgICB0aF9uX2ltMSA9IHRoX25faW0gKiB0aF9yZSArIHRoX25fcmUgKiB0aF9pbTtcbiAgICB0aF9uX3JlID0gdGhfbl9yZTE7XG4gICAgdGhfbl9pbSA9IHRoX25faW0xO1xuICAgIHpfcmUgPSB6X3JlICsgdGhpcy5CX3JlW25dICogdGhfbl9yZSAtIHRoaXMuQl9pbVtuXSAqIHRoX25faW07XG4gICAgel9pbSA9IHpfaW0gKyB0aGlzLkJfaW1bbl0gKiB0aF9uX3JlICsgdGhpcy5CX3JlW25dICogdGhfbl9pbTtcbiAgfVxuXG4gIC8vIDQuIENhbGN1bGF0ZSBlYXN0aW5nIGFuZCBub3J0aGluZ1xuICBwLnggPSAoel9pbSAqIHRoaXMuYSkgKyB0aGlzLngwO1xuICBwLnkgPSAoel9yZSAqIHRoaXMuYSkgKyB0aGlzLnkwO1xuXG4gIHJldHVybiBwO1xufTtcblxuXG4vKipcbiAgICBOZXcgWmVhbGFuZCBNYXAgR3JpZCBJbnZlcnNlICAtICB4L3kgdG8gbG9uZy9sYXRcbiAgKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIG47XG4gIHZhciB4ID0gcC54O1xuICB2YXIgeSA9IHAueTtcblxuICB2YXIgZGVsdGFfeCA9IHggLSB0aGlzLngwO1xuICB2YXIgZGVsdGFfeSA9IHkgLSB0aGlzLnkwO1xuXG4gIC8vIDEuIENhbGN1bGF0ZSB6XG4gIHZhciB6X3JlID0gZGVsdGFfeSAvIHRoaXMuYTtcbiAgdmFyIHpfaW0gPSBkZWx0YV94IC8gdGhpcy5hO1xuXG4gIC8vIDJhLiBDYWxjdWxhdGUgdGhldGEgLSBmaXJzdCBhcHByb3hpbWF0aW9uIGdpdmVzIGttIGFjY3VyYWN5XG4gIHZhciB6X25fcmUgPSAxO1xuICB2YXIgel9uX2ltID0gMDsgLy8gel4wXG4gIHZhciB6X25fcmUxO1xuICB2YXIgel9uX2ltMTtcblxuICB2YXIgdGhfcmUgPSAwO1xuICB2YXIgdGhfaW0gPSAwO1xuICBmb3IgKG4gPSAxOyBuIDw9IDY7IG4rKykge1xuICAgIHpfbl9yZTEgPSB6X25fcmUgKiB6X3JlIC0gel9uX2ltICogel9pbTtcbiAgICB6X25faW0xID0gel9uX2ltICogel9yZSArIHpfbl9yZSAqIHpfaW07XG4gICAgel9uX3JlID0gel9uX3JlMTtcbiAgICB6X25faW0gPSB6X25faW0xO1xuICAgIHRoX3JlID0gdGhfcmUgKyB0aGlzLkNfcmVbbl0gKiB6X25fcmUgLSB0aGlzLkNfaW1bbl0gKiB6X25faW07XG4gICAgdGhfaW0gPSB0aF9pbSArIHRoaXMuQ19pbVtuXSAqIHpfbl9yZSArIHRoaXMuQ19yZVtuXSAqIHpfbl9pbTtcbiAgfVxuXG4gIC8vIDJiLiBJdGVyYXRlIHRvIHJlZmluZSB0aGUgYWNjdXJhY3kgb2YgdGhlIGNhbGN1bGF0aW9uXG4gIC8vICAgICAgICAwIGl0ZXJhdGlvbnMgZ2l2ZXMga20gYWNjdXJhY3lcbiAgLy8gICAgICAgIDEgaXRlcmF0aW9uIGdpdmVzIG0gYWNjdXJhY3kgLS0gZ29vZCBlbm91Z2ggZm9yIG1vc3QgbWFwcGluZyBhcHBsaWNhdGlvbnNcbiAgLy8gICAgICAgIDIgaXRlcmF0aW9ucyBiaXZlcyBtbSBhY2N1cmFjeVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaXRlcmF0aW9uczsgaSsrKSB7XG4gICAgdmFyIHRoX25fcmUgPSB0aF9yZTtcbiAgICB2YXIgdGhfbl9pbSA9IHRoX2ltO1xuICAgIHZhciB0aF9uX3JlMTtcbiAgICB2YXIgdGhfbl9pbTE7XG5cbiAgICB2YXIgbnVtX3JlID0gel9yZTtcbiAgICB2YXIgbnVtX2ltID0gel9pbTtcbiAgICBmb3IgKG4gPSAyOyBuIDw9IDY7IG4rKykge1xuICAgICAgdGhfbl9yZTEgPSB0aF9uX3JlICogdGhfcmUgLSB0aF9uX2ltICogdGhfaW07XG4gICAgICB0aF9uX2ltMSA9IHRoX25faW0gKiB0aF9yZSArIHRoX25fcmUgKiB0aF9pbTtcbiAgICAgIHRoX25fcmUgPSB0aF9uX3JlMTtcbiAgICAgIHRoX25faW0gPSB0aF9uX2ltMTtcbiAgICAgIG51bV9yZSA9IG51bV9yZSArIChuIC0gMSkgKiAodGhpcy5CX3JlW25dICogdGhfbl9yZSAtIHRoaXMuQl9pbVtuXSAqIHRoX25faW0pO1xuICAgICAgbnVtX2ltID0gbnVtX2ltICsgKG4gLSAxKSAqICh0aGlzLkJfaW1bbl0gKiB0aF9uX3JlICsgdGhpcy5CX3JlW25dICogdGhfbl9pbSk7XG4gICAgfVxuXG4gICAgdGhfbl9yZSA9IDE7XG4gICAgdGhfbl9pbSA9IDA7XG4gICAgdmFyIGRlbl9yZSA9IHRoaXMuQl9yZVsxXTtcbiAgICB2YXIgZGVuX2ltID0gdGhpcy5CX2ltWzFdO1xuICAgIGZvciAobiA9IDI7IG4gPD0gNjsgbisrKSB7XG4gICAgICB0aF9uX3JlMSA9IHRoX25fcmUgKiB0aF9yZSAtIHRoX25faW0gKiB0aF9pbTtcbiAgICAgIHRoX25faW0xID0gdGhfbl9pbSAqIHRoX3JlICsgdGhfbl9yZSAqIHRoX2ltO1xuICAgICAgdGhfbl9yZSA9IHRoX25fcmUxO1xuICAgICAgdGhfbl9pbSA9IHRoX25faW0xO1xuICAgICAgZGVuX3JlID0gZGVuX3JlICsgbiAqICh0aGlzLkJfcmVbbl0gKiB0aF9uX3JlIC0gdGhpcy5CX2ltW25dICogdGhfbl9pbSk7XG4gICAgICBkZW5faW0gPSBkZW5faW0gKyBuICogKHRoaXMuQl9pbVtuXSAqIHRoX25fcmUgKyB0aGlzLkJfcmVbbl0gKiB0aF9uX2ltKTtcbiAgICB9XG5cbiAgICAvLyBDb21wbGV4IGRpdmlzaW9uXG4gICAgdmFyIGRlbjIgPSBkZW5fcmUgKiBkZW5fcmUgKyBkZW5faW0gKiBkZW5faW07XG4gICAgdGhfcmUgPSAobnVtX3JlICogZGVuX3JlICsgbnVtX2ltICogZGVuX2ltKSAvIGRlbjI7XG4gICAgdGhfaW0gPSAobnVtX2ltICogZGVuX3JlIC0gbnVtX3JlICogZGVuX2ltKSAvIGRlbjI7XG4gIH1cblxuICAvLyAzLiBDYWxjdWxhdGUgZF9waGkgICAgICAgICAgICAgIC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuZCBkX2xhbWJkYVxuICB2YXIgZF9wc2kgPSB0aF9yZTtcbiAgdmFyIGRfbGFtYmRhID0gdGhfaW07XG4gIHZhciBkX3BzaV9uID0gMTsgLy8gZF9wc2leMFxuXG4gIHZhciBkX3BoaSA9IDA7XG4gIGZvciAobiA9IDE7IG4gPD0gOTsgbisrKSB7XG4gICAgZF9wc2lfbiA9IGRfcHNpX24gKiBkX3BzaTtcbiAgICBkX3BoaSA9IGRfcGhpICsgdGhpcy5EW25dICogZF9wc2lfbjtcbiAgfVxuXG4gIC8vIDQuIENhbGN1bGF0ZSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlXG4gIC8vIGRfcGhpIGlzIGNhbGN1YXRlZCBpbiBzZWNvbmQgb2YgYXJjICogMTBeLTUsIHNvIHdlIG5lZWQgdG8gc2NhbGUgYmFjayB0byByYWRpYW5zLiBkX2xhbWJkYSBpcyBpbiByYWRpYW5zLlxuICB2YXIgbGF0ID0gdGhpcy5sYXQwICsgKGRfcGhpICogU0VDX1RPX1JBRCAqIDFFNSk7XG4gIHZhciBsb24gPSB0aGlzLmxvbmcwICsgZF9sYW1iZGE7XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG5cbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIk5ld19aZWFsYW5kX01hcF9HcmlkXCIsIFwibnptZ1wiXTsiLCJ2YXIgdHNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vdHNmbnonKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBwaGkyeiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9waGkyeicpO1xudmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRk9SVFBJID0gTWF0aC5QSS80O1xudmFyIEVQU0xOID0gMS4wZS0xMDtcblxuLyogSW5pdGlhbGl6ZSB0aGUgT2JsaXF1ZSBNZXJjYXRvciAgcHJvamVjdGlvblxuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5ub19vZmYgPSB0aGlzLm5vX29mZiB8fCBmYWxzZTtcbiAgdGhpcy5ub19yb3QgPSB0aGlzLm5vX3JvdCB8fCBmYWxzZTtcblxuICBpZiAoaXNOYU4odGhpcy5rMCkpIHtcbiAgICB0aGlzLmswID0gMTtcbiAgfVxuICB2YXIgc2lubGF0ID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgdmFyIGNvc2xhdCA9IE1hdGguY29zKHRoaXMubGF0MCk7XG4gIHZhciBjb24gPSB0aGlzLmUgKiBzaW5sYXQ7XG5cbiAgdGhpcy5ibCA9IE1hdGguc3FydCgxICsgdGhpcy5lcyAvICgxIC0gdGhpcy5lcykgKiBNYXRoLnBvdyhjb3NsYXQsIDQpKTtcbiAgdGhpcy5hbCA9IHRoaXMuYSAqIHRoaXMuYmwgKiB0aGlzLmswICogTWF0aC5zcXJ0KDEgLSB0aGlzLmVzKSAvICgxIC0gY29uICogY29uKTtcbiAgdmFyIHQwID0gdHNmbnoodGhpcy5lLCB0aGlzLmxhdDAsIHNpbmxhdCk7XG4gIHZhciBkbCA9IHRoaXMuYmwgLyBjb3NsYXQgKiBNYXRoLnNxcnQoKDEgLSB0aGlzLmVzKSAvICgxIC0gY29uICogY29uKSk7XG4gIGlmIChkbCAqIGRsIDwgMSkge1xuICAgIGRsID0gMTtcbiAgfVxuICB2YXIgZmw7XG4gIHZhciBnbDtcbiAgaWYgKCFpc05hTih0aGlzLmxvbmdjKSkge1xuICAgIC8vQ2VudHJhbCBwb2ludCBhbmQgYXppbXV0aCBtZXRob2RcblxuICAgIGlmICh0aGlzLmxhdDAgPj0gMCkge1xuICAgICAgZmwgPSBkbCArIE1hdGguc3FydChkbCAqIGRsIC0gMSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZmwgPSBkbCAtIE1hdGguc3FydChkbCAqIGRsIC0gMSk7XG4gICAgfVxuICAgIHRoaXMuZWwgPSBmbCAqIE1hdGgucG93KHQwLCB0aGlzLmJsKTtcbiAgICBnbCA9IDAuNSAqIChmbCAtIDEgLyBmbCk7XG4gICAgdGhpcy5nYW1tYTAgPSBNYXRoLmFzaW4oTWF0aC5zaW4odGhpcy5hbHBoYSkgLyBkbCk7XG4gICAgdGhpcy5sb25nMCA9IHRoaXMubG9uZ2MgLSBNYXRoLmFzaW4oZ2wgKiBNYXRoLnRhbih0aGlzLmdhbW1hMCkpIC8gdGhpcy5ibDtcblxuICB9XG4gIGVsc2Uge1xuICAgIC8vMiBwb2ludHMgbWV0aG9kXG4gICAgdmFyIHQxID0gdHNmbnoodGhpcy5lLCB0aGlzLmxhdDEsIE1hdGguc2luKHRoaXMubGF0MSkpO1xuICAgIHZhciB0MiA9IHRzZm56KHRoaXMuZSwgdGhpcy5sYXQyLCBNYXRoLnNpbih0aGlzLmxhdDIpKTtcbiAgICBpZiAodGhpcy5sYXQwID49IDApIHtcbiAgICAgIHRoaXMuZWwgPSAoZGwgKyBNYXRoLnNxcnQoZGwgKiBkbCAtIDEpKSAqIE1hdGgucG93KHQwLCB0aGlzLmJsKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmVsID0gKGRsIC0gTWF0aC5zcXJ0KGRsICogZGwgLSAxKSkgKiBNYXRoLnBvdyh0MCwgdGhpcy5ibCk7XG4gICAgfVxuICAgIHZhciBobCA9IE1hdGgucG93KHQxLCB0aGlzLmJsKTtcbiAgICB2YXIgbGwgPSBNYXRoLnBvdyh0MiwgdGhpcy5ibCk7XG4gICAgZmwgPSB0aGlzLmVsIC8gaGw7XG4gICAgZ2wgPSAwLjUgKiAoZmwgLSAxIC8gZmwpO1xuICAgIHZhciBqbCA9ICh0aGlzLmVsICogdGhpcy5lbCAtIGxsICogaGwpIC8gKHRoaXMuZWwgKiB0aGlzLmVsICsgbGwgKiBobCk7XG4gICAgdmFyIHBsID0gKGxsIC0gaGwpIC8gKGxsICsgaGwpO1xuICAgIHZhciBkbG9uMTIgPSBhZGp1c3RfbG9uKHRoaXMubG9uZzEgLSB0aGlzLmxvbmcyKTtcbiAgICB0aGlzLmxvbmcwID0gMC41ICogKHRoaXMubG9uZzEgKyB0aGlzLmxvbmcyKSAtIE1hdGguYXRhbihqbCAqIE1hdGgudGFuKDAuNSAqIHRoaXMuYmwgKiAoZGxvbjEyKSkgLyBwbCkgLyB0aGlzLmJsO1xuICAgIHRoaXMubG9uZzAgPSBhZGp1c3RfbG9uKHRoaXMubG9uZzApO1xuICAgIHZhciBkbG9uMTAgPSBhZGp1c3RfbG9uKHRoaXMubG9uZzEgLSB0aGlzLmxvbmcwKTtcbiAgICB0aGlzLmdhbW1hMCA9IE1hdGguYXRhbihNYXRoLnNpbih0aGlzLmJsICogKGRsb24xMCkpIC8gZ2wpO1xuICAgIHRoaXMuYWxwaGEgPSBNYXRoLmFzaW4oZGwgKiBNYXRoLnNpbih0aGlzLmdhbW1hMCkpO1xuICB9XG5cbiAgaWYgKHRoaXMubm9fb2ZmKSB7XG4gICAgdGhpcy51YyA9IDA7XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHRoaXMubGF0MCA+PSAwKSB7XG4gICAgICB0aGlzLnVjID0gdGhpcy5hbCAvIHRoaXMuYmwgKiBNYXRoLmF0YW4yKE1hdGguc3FydChkbCAqIGRsIC0gMSksIE1hdGguY29zKHRoaXMuYWxwaGEpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnVjID0gLTEgKiB0aGlzLmFsIC8gdGhpcy5ibCAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGRsICogZGwgLSAxKSwgTWF0aC5jb3ModGhpcy5hbHBoYSkpO1xuICAgIH1cbiAgfVxuXG59O1xuXG5cbi8qIE9ibGlxdWUgTWVyY2F0b3IgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIHVzLCB2cztcbiAgdmFyIGNvbjtcbiAgaWYgKE1hdGguYWJzKE1hdGguYWJzKGxhdCkgLSBIQUxGX1BJKSA8PSBFUFNMTikge1xuICAgIGlmIChsYXQgPiAwKSB7XG4gICAgICBjb24gPSAtMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb24gPSAxO1xuICAgIH1cbiAgICB2cyA9IHRoaXMuYWwgLyB0aGlzLmJsICogTWF0aC5sb2coTWF0aC50YW4oRk9SVFBJICsgY29uICogdGhpcy5nYW1tYTAgKiAwLjUpKTtcbiAgICB1cyA9IC0xICogY29uICogSEFMRl9QSSAqIHRoaXMuYWwgLyB0aGlzLmJsO1xuICB9XG4gIGVsc2Uge1xuICAgIHZhciB0ID0gdHNmbnoodGhpcy5lLCBsYXQsIE1hdGguc2luKGxhdCkpO1xuICAgIHZhciBxbCA9IHRoaXMuZWwgLyBNYXRoLnBvdyh0LCB0aGlzLmJsKTtcbiAgICB2YXIgc2wgPSAwLjUgKiAocWwgLSAxIC8gcWwpO1xuICAgIHZhciB0bCA9IDAuNSAqIChxbCArIDEgLyBxbCk7XG4gICAgdmFyIHZsID0gTWF0aC5zaW4odGhpcy5ibCAqIChkbG9uKSk7XG4gICAgdmFyIHVsID0gKHNsICogTWF0aC5zaW4odGhpcy5nYW1tYTApIC0gdmwgKiBNYXRoLmNvcyh0aGlzLmdhbW1hMCkpIC8gdGw7XG4gICAgaWYgKE1hdGguYWJzKE1hdGguYWJzKHVsKSAtIDEpIDw9IEVQU0xOKSB7XG4gICAgICB2cyA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2cyA9IDAuNSAqIHRoaXMuYWwgKiBNYXRoLmxvZygoMSAtIHVsKSAvICgxICsgdWwpKSAvIHRoaXMuYmw7XG4gICAgfVxuICAgIGlmIChNYXRoLmFicyhNYXRoLmNvcyh0aGlzLmJsICogKGRsb24pKSkgPD0gRVBTTE4pIHtcbiAgICAgIHVzID0gdGhpcy5hbCAqIHRoaXMuYmwgKiAoZGxvbik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdXMgPSB0aGlzLmFsICogTWF0aC5hdGFuMihzbCAqIE1hdGguY29zKHRoaXMuZ2FtbWEwKSArIHZsICogTWF0aC5zaW4odGhpcy5nYW1tYTApLCBNYXRoLmNvcyh0aGlzLmJsICogZGxvbikpIC8gdGhpcy5ibDtcbiAgICB9XG4gIH1cblxuICBpZiAodGhpcy5ub19yb3QpIHtcbiAgICBwLnggPSB0aGlzLngwICsgdXM7XG4gICAgcC55ID0gdGhpcy55MCArIHZzO1xuICB9XG4gIGVsc2Uge1xuXG4gICAgdXMgLT0gdGhpcy51YztcbiAgICBwLnggPSB0aGlzLngwICsgdnMgKiBNYXRoLmNvcyh0aGlzLmFscGhhKSArIHVzICogTWF0aC5zaW4odGhpcy5hbHBoYSk7XG4gICAgcC55ID0gdGhpcy55MCArIHVzICogTWF0aC5jb3ModGhpcy5hbHBoYSkgLSB2cyAqIE1hdGguc2luKHRoaXMuYWxwaGEpO1xuICB9XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgdXMsIHZzO1xuICBpZiAodGhpcy5ub19yb3QpIHtcbiAgICB2cyA9IHAueSAtIHRoaXMueTA7XG4gICAgdXMgPSBwLnggLSB0aGlzLngwO1xuICB9XG4gIGVsc2Uge1xuICAgIHZzID0gKHAueCAtIHRoaXMueDApICogTWF0aC5jb3ModGhpcy5hbHBoYSkgLSAocC55IC0gdGhpcy55MCkgKiBNYXRoLnNpbih0aGlzLmFscGhhKTtcbiAgICB1cyA9IChwLnkgLSB0aGlzLnkwKSAqIE1hdGguY29zKHRoaXMuYWxwaGEpICsgKHAueCAtIHRoaXMueDApICogTWF0aC5zaW4odGhpcy5hbHBoYSk7XG4gICAgdXMgKz0gdGhpcy51YztcbiAgfVxuICB2YXIgcXAgPSBNYXRoLmV4cCgtMSAqIHRoaXMuYmwgKiB2cyAvIHRoaXMuYWwpO1xuICB2YXIgc3AgPSAwLjUgKiAocXAgLSAxIC8gcXApO1xuICB2YXIgdHAgPSAwLjUgKiAocXAgKyAxIC8gcXApO1xuICB2YXIgdnAgPSBNYXRoLnNpbih0aGlzLmJsICogdXMgLyB0aGlzLmFsKTtcbiAgdmFyIHVwID0gKHZwICogTWF0aC5jb3ModGhpcy5nYW1tYTApICsgc3AgKiBNYXRoLnNpbih0aGlzLmdhbW1hMCkpIC8gdHA7XG4gIHZhciB0cyA9IE1hdGgucG93KHRoaXMuZWwgLyBNYXRoLnNxcnQoKDEgKyB1cCkgLyAoMSAtIHVwKSksIDEgLyB0aGlzLmJsKTtcbiAgaWYgKE1hdGguYWJzKHVwIC0gMSkgPCBFUFNMTikge1xuICAgIHAueCA9IHRoaXMubG9uZzA7XG4gICAgcC55ID0gSEFMRl9QSTtcbiAgfVxuICBlbHNlIGlmIChNYXRoLmFicyh1cCArIDEpIDwgRVBTTE4pIHtcbiAgICBwLnggPSB0aGlzLmxvbmcwO1xuICAgIHAueSA9IC0xICogSEFMRl9QSTtcbiAgfVxuICBlbHNlIHtcbiAgICBwLnkgPSBwaGkyeih0aGlzLmUsIHRzKTtcbiAgICBwLnggPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgLSBNYXRoLmF0YW4yKHNwICogTWF0aC5jb3ModGhpcy5nYW1tYTApIC0gdnAgKiBNYXRoLnNpbih0aGlzLmdhbW1hMCksIE1hdGguY29zKHRoaXMuYmwgKiB1cyAvIHRoaXMuYWwpKSAvIHRoaXMuYmwpO1xuICB9XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5uYW1lcyA9IFtcIkhvdGluZV9PYmxpcXVlX01lcmNhdG9yXCIsIFwiSG90aW5lIE9ibGlxdWUgTWVyY2F0b3JcIiwgXCJIb3RpbmVfT2JsaXF1ZV9NZXJjYXRvcl9BemltdXRoX05hdHVyYWxfT3JpZ2luXCIsIFwiSG90aW5lX09ibGlxdWVfTWVyY2F0b3JfQXppbXV0aF9DZW50ZXJcIiwgXCJvbWVyY1wiXTsiLCJ2YXIgZTBmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMGZuJyk7XG52YXIgZTFmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMWZuJyk7XG52YXIgZTJmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMmZuJyk7XG52YXIgZTNmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lM2ZuJyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgYWRqdXN0X2xhdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbGF0Jyk7XG52YXIgbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tbGZuJyk7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIGdOID0gcmVxdWlyZSgnLi4vY29tbW9uL2dOJyk7XG52YXIgTUFYX0lURVIgPSAyMDtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAvKiBQbGFjZSBwYXJhbWV0ZXJzIGluIHN0YXRpYyBzdG9yYWdlIGZvciBjb21tb24gdXNlXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdGhpcy50ZW1wID0gdGhpcy5iIC8gdGhpcy5hO1xuICB0aGlzLmVzID0gMSAtIE1hdGgucG93KHRoaXMudGVtcCwgMik7IC8vIGRldmFpdCBldHJlIGRhbnMgdG1lcmMuanMgbWFpcyBuIHkgZXN0IHBhcyBkb25jIGplIGNvbW1lbnRlIHNpbm9uIHJldG91ciBkZSB2YWxldXJzIG51bGxlc1xuICB0aGlzLmUgPSBNYXRoLnNxcnQodGhpcy5lcyk7XG4gIHRoaXMuZTAgPSBlMGZuKHRoaXMuZXMpO1xuICB0aGlzLmUxID0gZTFmbih0aGlzLmVzKTtcbiAgdGhpcy5lMiA9IGUyZm4odGhpcy5lcyk7XG4gIHRoaXMuZTMgPSBlM2ZuKHRoaXMuZXMpO1xuICB0aGlzLm1sMCA9IHRoaXMuYSAqIG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgdGhpcy5sYXQwKTsgLy9zaSBxdWUgZGVzIHplcm9zIGxlIGNhbGN1bCBuZSBzZSBmYWl0IHBhc1xufTtcblxuXG4vKiBQb2x5Y29uaWMgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIHgsIHksIGVsO1xuICB2YXIgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIGVsID0gZGxvbiAqIE1hdGguc2luKGxhdCk7XG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGlmIChNYXRoLmFicyhsYXQpIDw9IEVQU0xOKSB7XG4gICAgICB4ID0gdGhpcy5hICogZGxvbjtcbiAgICAgIHkgPSAtMSAqIHRoaXMuYSAqIHRoaXMubGF0MDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB4ID0gdGhpcy5hICogTWF0aC5zaW4oZWwpIC8gTWF0aC50YW4obGF0KTtcbiAgICAgIHkgPSB0aGlzLmEgKiAoYWRqdXN0X2xhdChsYXQgLSB0aGlzLmxhdDApICsgKDEgLSBNYXRoLmNvcyhlbCkpIC8gTWF0aC50YW4obGF0KSk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGlmIChNYXRoLmFicyhsYXQpIDw9IEVQU0xOKSB7XG4gICAgICB4ID0gdGhpcy5hICogZGxvbjtcbiAgICAgIHkgPSAtMSAqIHRoaXMubWwwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciBubCA9IGdOKHRoaXMuYSwgdGhpcy5lLCBNYXRoLnNpbihsYXQpKSAvIE1hdGgudGFuKGxhdCk7XG4gICAgICB4ID0gbmwgKiBNYXRoLnNpbihlbCk7XG4gICAgICB5ID0gdGhpcy5hICogbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCBsYXQpIC0gdGhpcy5tbDAgKyBubCAqICgxIC0gTWF0aC5jb3MoZWwpKTtcbiAgICB9XG5cbiAgfVxuICBwLnggPSB4ICsgdGhpcy54MDtcbiAgcC55ID0geSArIHRoaXMueTA7XG4gIHJldHVybiBwO1xufTtcblxuXG4vKiBJbnZlcnNlIGVxdWF0aW9uc1xuICAtLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24sIGxhdCwgeCwgeSwgaTtcbiAgdmFyIGFsLCBibDtcbiAgdmFyIHBoaSwgZHBoaTtcbiAgeCA9IHAueCAtIHRoaXMueDA7XG4gIHkgPSBwLnkgLSB0aGlzLnkwO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGlmIChNYXRoLmFicyh5ICsgdGhpcy5hICogdGhpcy5sYXQwKSA8PSBFUFNMTikge1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih4IC8gdGhpcy5hICsgdGhpcy5sb25nMCk7XG4gICAgICBsYXQgPSAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGFsID0gdGhpcy5sYXQwICsgeSAvIHRoaXMuYTtcbiAgICAgIGJsID0geCAqIHggLyB0aGlzLmEgLyB0aGlzLmEgKyBhbCAqIGFsO1xuICAgICAgcGhpID0gYWw7XG4gICAgICB2YXIgdGFucGhpO1xuICAgICAgZm9yIChpID0gTUFYX0lURVI7IGk7IC0taSkge1xuICAgICAgICB0YW5waGkgPSBNYXRoLnRhbihwaGkpO1xuICAgICAgICBkcGhpID0gLTEgKiAoYWwgKiAocGhpICogdGFucGhpICsgMSkgLSBwaGkgLSAwLjUgKiAocGhpICogcGhpICsgYmwpICogdGFucGhpKSAvICgocGhpIC0gYWwpIC8gdGFucGhpIC0gMSk7XG4gICAgICAgIHBoaSArPSBkcGhpO1xuICAgICAgICBpZiAoTWF0aC5hYnMoZHBoaSkgPD0gRVBTTE4pIHtcbiAgICAgICAgICBsYXQgPSBwaGk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIChNYXRoLmFzaW4oeCAqIE1hdGgudGFuKHBoaSkgLyB0aGlzLmEpKSAvIE1hdGguc2luKGxhdCkpO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBpZiAoTWF0aC5hYnMoeSArIHRoaXMubWwwKSA8PSBFUFNMTikge1xuICAgICAgbGF0ID0gMDtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIHggLyB0aGlzLmEpO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgYWwgPSAodGhpcy5tbDAgKyB5KSAvIHRoaXMuYTtcbiAgICAgIGJsID0geCAqIHggLyB0aGlzLmEgLyB0aGlzLmEgKyBhbCAqIGFsO1xuICAgICAgcGhpID0gYWw7XG4gICAgICB2YXIgY2wsIG1sbiwgbWxucCwgbWE7XG4gICAgICB2YXIgY29uO1xuICAgICAgZm9yIChpID0gTUFYX0lURVI7IGk7IC0taSkge1xuICAgICAgICBjb24gPSB0aGlzLmUgKiBNYXRoLnNpbihwaGkpO1xuICAgICAgICBjbCA9IE1hdGguc3FydCgxIC0gY29uICogY29uKSAqIE1hdGgudGFuKHBoaSk7XG4gICAgICAgIG1sbiA9IHRoaXMuYSAqIG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgcGhpKTtcbiAgICAgICAgbWxucCA9IHRoaXMuZTAgLSAyICogdGhpcy5lMSAqIE1hdGguY29zKDIgKiBwaGkpICsgNCAqIHRoaXMuZTIgKiBNYXRoLmNvcyg0ICogcGhpKSAtIDYgKiB0aGlzLmUzICogTWF0aC5jb3MoNiAqIHBoaSk7XG4gICAgICAgIG1hID0gbWxuIC8gdGhpcy5hO1xuICAgICAgICBkcGhpID0gKGFsICogKGNsICogbWEgKyAxKSAtIG1hIC0gMC41ICogY2wgKiAobWEgKiBtYSArIGJsKSkgLyAodGhpcy5lcyAqIE1hdGguc2luKDIgKiBwaGkpICogKG1hICogbWEgKyBibCAtIDIgKiBhbCAqIG1hKSAvICg0ICogY2wpICsgKGFsIC0gbWEpICogKGNsICogbWxucCAtIDIgLyBNYXRoLnNpbigyICogcGhpKSkgLSBtbG5wKTtcbiAgICAgICAgcGhpIC09IGRwaGk7XG4gICAgICAgIGlmIChNYXRoLmFicyhkcGhpKSA8PSBFUFNMTikge1xuICAgICAgICAgIGxhdCA9IHBoaTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL2xhdD1waGk0eih0aGlzLmUsdGhpcy5lMCx0aGlzLmUxLHRoaXMuZTIsdGhpcy5lMyxhbCxibCwwLDApO1xuICAgICAgY2wgPSBNYXRoLnNxcnQoMSAtIHRoaXMuZXMgKiBNYXRoLnBvdyhNYXRoLnNpbihsYXQpLCAyKSkgKiBNYXRoLnRhbihsYXQpO1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hc2luKHggKiBjbCAvIHRoaXMuYSkgLyBNYXRoLnNpbihsYXQpKTtcbiAgICB9XG4gIH1cblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIlBvbHljb25pY1wiLCBcInBvbHlcIl07IiwidmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIGFkanVzdF9sYXQgPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xhdCcpO1xudmFyIHBqX2VuZm4gPSByZXF1aXJlKCcuLi9jb21tb24vcGpfZW5mbicpO1xudmFyIE1BWF9JVEVSID0gMjA7XG52YXIgcGpfbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9wal9tbGZuJyk7XG52YXIgcGpfaW52X21sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vcGpfaW52X21sZm4nKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBhc2lueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hc2lueicpO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIC8qIFBsYWNlIHBhcmFtZXRlcnMgaW4gc3RhdGljIHN0b3JhZ2UgZm9yIGNvbW1vbiB1c2VcbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXG4gIGlmICghdGhpcy5zcGhlcmUpIHtcbiAgICB0aGlzLmVuID0gcGpfZW5mbih0aGlzLmVzKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLm4gPSAxO1xuICAgIHRoaXMubSA9IDA7XG4gICAgdGhpcy5lcyA9IDA7XG4gICAgdGhpcy5DX3kgPSBNYXRoLnNxcnQoKHRoaXMubSArIDEpIC8gdGhpcy5uKTtcbiAgICB0aGlzLkNfeCA9IHRoaXMuQ195IC8gKHRoaXMubSArIDEpO1xuICB9XG5cbn07XG5cbi8qIFNpbnVzb2lkYWwgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHgsIHk7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGlmICghdGhpcy5tKSB7XG4gICAgICBsYXQgPSB0aGlzLm4gIT09IDEgPyBNYXRoLmFzaW4odGhpcy5uICogTWF0aC5zaW4obGF0KSkgOiBsYXQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdmFyIGsgPSB0aGlzLm4gKiBNYXRoLnNpbihsYXQpO1xuICAgICAgZm9yICh2YXIgaSA9IE1BWF9JVEVSOyBpOyAtLWkpIHtcbiAgICAgICAgdmFyIFYgPSAodGhpcy5tICogbGF0ICsgTWF0aC5zaW4obGF0KSAtIGspIC8gKHRoaXMubSArIE1hdGguY29zKGxhdCkpO1xuICAgICAgICBsYXQgLT0gVjtcbiAgICAgICAgaWYgKE1hdGguYWJzKFYpIDwgRVBTTE4pIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB4ID0gdGhpcy5hICogdGhpcy5DX3ggKiBsb24gKiAodGhpcy5tICsgTWF0aC5jb3MobGF0KSk7XG4gICAgeSA9IHRoaXMuYSAqIHRoaXMuQ195ICogbGF0O1xuXG4gIH1cbiAgZWxzZSB7XG5cbiAgICB2YXIgcyA9IE1hdGguc2luKGxhdCk7XG4gICAgdmFyIGMgPSBNYXRoLmNvcyhsYXQpO1xuICAgIHkgPSB0aGlzLmEgKiBwal9tbGZuKGxhdCwgcywgYywgdGhpcy5lbik7XG4gICAgeCA9IHRoaXMuYSAqIGxvbiAqIGMgLyBNYXRoLnNxcnQoMSAtIHRoaXMuZXMgKiBzICogcyk7XG4gIH1cblxuICBwLnggPSB4O1xuICBwLnkgPSB5O1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxhdCwgdGVtcCwgbG9uLCBzO1xuXG4gIHAueCAtPSB0aGlzLngwO1xuICBsb24gPSBwLnggLyB0aGlzLmE7XG4gIHAueSAtPSB0aGlzLnkwO1xuICBsYXQgPSBwLnkgLyB0aGlzLmE7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgbGF0IC89IHRoaXMuQ195O1xuICAgIGxvbiA9IGxvbiAvICh0aGlzLkNfeCAqICh0aGlzLm0gKyBNYXRoLmNvcyhsYXQpKSk7XG4gICAgaWYgKHRoaXMubSkge1xuICAgICAgbGF0ID0gYXNpbnooKHRoaXMubSAqIGxhdCArIE1hdGguc2luKGxhdCkpIC8gdGhpcy5uKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5uICE9PSAxKSB7XG4gICAgICBsYXQgPSBhc2lueihNYXRoLnNpbihsYXQpIC8gdGhpcy5uKTtcbiAgICB9XG4gICAgbG9uID0gYWRqdXN0X2xvbihsb24gKyB0aGlzLmxvbmcwKTtcbiAgICBsYXQgPSBhZGp1c3RfbGF0KGxhdCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgbGF0ID0gcGpfaW52X21sZm4ocC55IC8gdGhpcy5hLCB0aGlzLmVzLCB0aGlzLmVuKTtcbiAgICBzID0gTWF0aC5hYnMobGF0KTtcbiAgICBpZiAocyA8IEhBTEZfUEkpIHtcbiAgICAgIHMgPSBNYXRoLnNpbihsYXQpO1xuICAgICAgdGVtcCA9IHRoaXMubG9uZzAgKyBwLnggKiBNYXRoLnNxcnQoMSAtIHRoaXMuZXMgKiBzICogcykgLyAodGhpcy5hICogTWF0aC5jb3MobGF0KSk7XG4gICAgICAvL3RlbXAgPSB0aGlzLmxvbmcwICsgcC54IC8gKHRoaXMuYSAqIE1hdGguY29zKGxhdCkpO1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0ZW1wKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoKHMgLSBFUFNMTikgPCBIQUxGX1BJKSB7XG4gICAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgIH1cbiAgfVxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIlNpbnVzb2lkYWxcIiwgXCJzaW51XCJdOyIsIi8qXG4gIHJlZmVyZW5jZXM6XG4gICAgRm9ybXVsZXMgZXQgY29uc3RhbnRlcyBwb3VyIGxlIENhbGN1bCBwb3VyIGxhXG4gICAgcHJvamVjdGlvbiBjeWxpbmRyaXF1ZSBjb25mb3JtZSDDoCBheGUgb2JsaXF1ZSBldCBwb3VyIGxhIHRyYW5zZm9ybWF0aW9uIGVudHJlXG4gICAgZGVzIHN5c3TDqG1lcyBkZSByw6lmw6lyZW5jZS5cbiAgICBodHRwOi8vd3d3LnN3aXNzdG9wby5hZG1pbi5jaC9pbnRlcm5ldC9zd2lzc3RvcG8vZnIvaG9tZS90b3BpY3Mvc3VydmV5L3N5cy9yZWZzeXMvc3dpdHplcmxhbmQucGFyc3lzcmVsYXRlZDEuMzEyMTYuZG93bmxvYWRMaXN0Ljc3MDA0LkRvd25sb2FkRmlsZS50bXAvc3dpc3Nwcm9qZWN0aW9uZnIucGRmXG4gICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBoeTAgPSB0aGlzLmxhdDA7XG4gIHRoaXMubGFtYmRhMCA9IHRoaXMubG9uZzA7XG4gIHZhciBzaW5QaHkwID0gTWF0aC5zaW4ocGh5MCk7XG4gIHZhciBzZW1pTWFqb3JBeGlzID0gdGhpcy5hO1xuICB2YXIgaW52RiA9IHRoaXMucmY7XG4gIHZhciBmbGF0dGVuaW5nID0gMSAvIGludkY7XG4gIHZhciBlMiA9IDIgKiBmbGF0dGVuaW5nIC0gTWF0aC5wb3coZmxhdHRlbmluZywgMik7XG4gIHZhciBlID0gdGhpcy5lID0gTWF0aC5zcXJ0KGUyKTtcbiAgdGhpcy5SID0gdGhpcy5rMCAqIHNlbWlNYWpvckF4aXMgKiBNYXRoLnNxcnQoMSAtIGUyKSAvICgxIC0gZTIgKiBNYXRoLnBvdyhzaW5QaHkwLCAyKSk7XG4gIHRoaXMuYWxwaGEgPSBNYXRoLnNxcnQoMSArIGUyIC8gKDEgLSBlMikgKiBNYXRoLnBvdyhNYXRoLmNvcyhwaHkwKSwgNCkpO1xuICB0aGlzLmIwID0gTWF0aC5hc2luKHNpblBoeTAgLyB0aGlzLmFscGhhKTtcbiAgdmFyIGsxID0gTWF0aC5sb2coTWF0aC50YW4oTWF0aC5QSSAvIDQgKyB0aGlzLmIwIC8gMikpO1xuICB2YXIgazIgPSBNYXRoLmxvZyhNYXRoLnRhbihNYXRoLlBJIC8gNCArIHBoeTAgLyAyKSk7XG4gIHZhciBrMyA9IE1hdGgubG9nKCgxICsgZSAqIHNpblBoeTApIC8gKDEgLSBlICogc2luUGh5MCkpO1xuICB0aGlzLksgPSBrMSAtIHRoaXMuYWxwaGEgKiBrMiArIHRoaXMuYWxwaGEgKiBlIC8gMiAqIGszO1xufTtcblxuXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBTYTEgPSBNYXRoLmxvZyhNYXRoLnRhbihNYXRoLlBJIC8gNCAtIHAueSAvIDIpKTtcbiAgdmFyIFNhMiA9IHRoaXMuZSAvIDIgKiBNYXRoLmxvZygoMSArIHRoaXMuZSAqIE1hdGguc2luKHAueSkpIC8gKDEgLSB0aGlzLmUgKiBNYXRoLnNpbihwLnkpKSk7XG4gIHZhciBTID0gLXRoaXMuYWxwaGEgKiAoU2ExICsgU2EyKSArIHRoaXMuSztcblxuICAvLyBzcGhlcmljIGxhdGl0dWRlXG4gIHZhciBiID0gMiAqIChNYXRoLmF0YW4oTWF0aC5leHAoUykpIC0gTWF0aC5QSSAvIDQpO1xuXG4gIC8vIHNwaGVyaWMgbG9uZ2l0dWRlXG4gIHZhciBJID0gdGhpcy5hbHBoYSAqIChwLnggLSB0aGlzLmxhbWJkYTApO1xuXG4gIC8vIHBzb2V1ZG8gZXF1YXRvcmlhbCByb3RhdGlvblxuICB2YXIgcm90SSA9IE1hdGguYXRhbihNYXRoLnNpbihJKSAvIChNYXRoLnNpbih0aGlzLmIwKSAqIE1hdGgudGFuKGIpICsgTWF0aC5jb3ModGhpcy5iMCkgKiBNYXRoLmNvcyhJKSkpO1xuXG4gIHZhciByb3RCID0gTWF0aC5hc2luKE1hdGguY29zKHRoaXMuYjApICogTWF0aC5zaW4oYikgLSBNYXRoLnNpbih0aGlzLmIwKSAqIE1hdGguY29zKGIpICogTWF0aC5jb3MoSSkpO1xuXG4gIHAueSA9IHRoaXMuUiAvIDIgKiBNYXRoLmxvZygoMSArIE1hdGguc2luKHJvdEIpKSAvICgxIC0gTWF0aC5zaW4ocm90QikpKSArIHRoaXMueTA7XG4gIHAueCA9IHRoaXMuUiAqIHJvdEkgKyB0aGlzLngwO1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIFkgPSBwLnggLSB0aGlzLngwO1xuICB2YXIgWCA9IHAueSAtIHRoaXMueTA7XG5cbiAgdmFyIHJvdEkgPSBZIC8gdGhpcy5SO1xuICB2YXIgcm90QiA9IDIgKiAoTWF0aC5hdGFuKE1hdGguZXhwKFggLyB0aGlzLlIpKSAtIE1hdGguUEkgLyA0KTtcblxuICB2YXIgYiA9IE1hdGguYXNpbihNYXRoLmNvcyh0aGlzLmIwKSAqIE1hdGguc2luKHJvdEIpICsgTWF0aC5zaW4odGhpcy5iMCkgKiBNYXRoLmNvcyhyb3RCKSAqIE1hdGguY29zKHJvdEkpKTtcbiAgdmFyIEkgPSBNYXRoLmF0YW4oTWF0aC5zaW4ocm90SSkgLyAoTWF0aC5jb3ModGhpcy5iMCkgKiBNYXRoLmNvcyhyb3RJKSAtIE1hdGguc2luKHRoaXMuYjApICogTWF0aC50YW4ocm90QikpKTtcblxuICB2YXIgbGFtYmRhID0gdGhpcy5sYW1iZGEwICsgSSAvIHRoaXMuYWxwaGE7XG5cbiAgdmFyIFMgPSAwO1xuICB2YXIgcGh5ID0gYjtcbiAgdmFyIHByZXZQaHkgPSAtMTAwMDtcbiAgdmFyIGl0ZXJhdGlvbiA9IDA7XG4gIHdoaWxlIChNYXRoLmFicyhwaHkgLSBwcmV2UGh5KSA+IDAuMDAwMDAwMSkge1xuICAgIGlmICgrK2l0ZXJhdGlvbiA+IDIwKSB7XG4gICAgICAvLy4uLnJlcG9ydEVycm9yKFwib21lcmNGd2RJbmZpbml0eVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy9TID0gTWF0aC5sb2coTWF0aC50YW4oTWF0aC5QSSAvIDQgKyBwaHkgLyAyKSk7XG4gICAgUyA9IDEgLyB0aGlzLmFscGhhICogKE1hdGgubG9nKE1hdGgudGFuKE1hdGguUEkgLyA0ICsgYiAvIDIpKSAtIHRoaXMuSykgKyB0aGlzLmUgKiBNYXRoLmxvZyhNYXRoLnRhbihNYXRoLlBJIC8gNCArIE1hdGguYXNpbih0aGlzLmUgKiBNYXRoLnNpbihwaHkpKSAvIDIpKTtcbiAgICBwcmV2UGh5ID0gcGh5O1xuICAgIHBoeSA9IDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoUykpIC0gTWF0aC5QSSAvIDI7XG4gIH1cblxuICBwLnggPSBsYW1iZGE7XG4gIHAueSA9IHBoeTtcbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLm5hbWVzID0gW1wic29tZXJjXCJdO1xuIiwidmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIHNpZ24gPSByZXF1aXJlKCcuLi9jb21tb24vc2lnbicpO1xudmFyIG1zZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL21zZm56Jyk7XG52YXIgdHNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vdHNmbnonKTtcbnZhciBwaGkyeiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9waGkyeicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xuZXhwb3J0cy5zc2ZuXyA9IGZ1bmN0aW9uKHBoaXQsIHNpbnBoaSwgZWNjZW4pIHtcbiAgc2lucGhpICo9IGVjY2VuO1xuICByZXR1cm4gKE1hdGgudGFuKDAuNSAqIChIQUxGX1BJICsgcGhpdCkpICogTWF0aC5wb3coKDEgLSBzaW5waGkpIC8gKDEgKyBzaW5waGkpLCAwLjUgKiBlY2NlbikpO1xufTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29zbGF0MCA9IE1hdGguY29zKHRoaXMubGF0MCk7XG4gIHRoaXMuc2lubGF0MCA9IE1hdGguc2luKHRoaXMubGF0MCk7XG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGlmICh0aGlzLmswID09PSAxICYmICFpc05hTih0aGlzLmxhdF90cykgJiYgTWF0aC5hYnModGhpcy5jb3NsYXQwKSA8PSBFUFNMTikge1xuICAgICAgdGhpcy5rMCA9IDAuNSAqICgxICsgc2lnbih0aGlzLmxhdDApICogTWF0aC5zaW4odGhpcy5sYXRfdHMpKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKE1hdGguYWJzKHRoaXMuY29zbGF0MCkgPD0gRVBTTE4pIHtcbiAgICAgIGlmICh0aGlzLmxhdDAgPiAwKSB7XG4gICAgICAgIC8vTm9ydGggcG9sZVxuICAgICAgICAvL3RyYWNlKCdzdGVyZTpub3J0aCBwb2xlJyk7XG4gICAgICAgIHRoaXMuY29uID0gMTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvL1NvdXRoIHBvbGVcbiAgICAgICAgLy90cmFjZSgnc3RlcmU6c291dGggcG9sZScpO1xuICAgICAgICB0aGlzLmNvbiA9IC0xO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnMgPSBNYXRoLnNxcnQoTWF0aC5wb3coMSArIHRoaXMuZSwgMSArIHRoaXMuZSkgKiBNYXRoLnBvdygxIC0gdGhpcy5lLCAxIC0gdGhpcy5lKSk7XG4gICAgaWYgKHRoaXMuazAgPT09IDEgJiYgIWlzTmFOKHRoaXMubGF0X3RzKSAmJiBNYXRoLmFicyh0aGlzLmNvc2xhdDApIDw9IEVQU0xOKSB7XG4gICAgICB0aGlzLmswID0gMC41ICogdGhpcy5jb25zICogbXNmbnoodGhpcy5lLCBNYXRoLnNpbih0aGlzLmxhdF90cyksIE1hdGguY29zKHRoaXMubGF0X3RzKSkgLyB0c2Zueih0aGlzLmUsIHRoaXMuY29uICogdGhpcy5sYXRfdHMsIHRoaXMuY29uICogTWF0aC5zaW4odGhpcy5sYXRfdHMpKTtcbiAgICB9XG4gICAgdGhpcy5tczEgPSBtc2Zueih0aGlzLmUsIHRoaXMuc2lubGF0MCwgdGhpcy5jb3NsYXQwKTtcbiAgICB0aGlzLlgwID0gMiAqIE1hdGguYXRhbih0aGlzLnNzZm5fKHRoaXMubGF0MCwgdGhpcy5zaW5sYXQwLCB0aGlzLmUpKSAtIEhBTEZfUEk7XG4gICAgdGhpcy5jb3NYMCA9IE1hdGguY29zKHRoaXMuWDApO1xuICAgIHRoaXMuc2luWDAgPSBNYXRoLnNpbih0aGlzLlgwKTtcbiAgfVxufTtcblxuLy8gU3RlcmVvZ3JhcGhpYyBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIHNpbmxhdCA9IE1hdGguc2luKGxhdCk7XG4gIHZhciBjb3NsYXQgPSBNYXRoLmNvcyhsYXQpO1xuICB2YXIgQSwgWCwgc2luWCwgY29zWCwgdHMsIHJoO1xuICB2YXIgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG5cbiAgaWYgKE1hdGguYWJzKE1hdGguYWJzKGxvbiAtIHRoaXMubG9uZzApIC0gTWF0aC5QSSkgPD0gRVBTTE4gJiYgTWF0aC5hYnMobGF0ICsgdGhpcy5sYXQwKSA8PSBFUFNMTikge1xuICAgIC8vY2FzZSBvZiB0aGUgb3JpZ2luZSBwb2ludFxuICAgIC8vdHJhY2UoJ3N0ZXJlOnRoaXMgaXMgdGhlIG9yaWdpbiBwb2ludCcpO1xuICAgIHAueCA9IE5hTjtcbiAgICBwLnkgPSBOYU47XG4gICAgcmV0dXJuIHA7XG4gIH1cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgLy90cmFjZSgnc3RlcmU6c3BoZXJlIGNhc2UnKTtcbiAgICBBID0gMiAqIHRoaXMuazAgLyAoMSArIHRoaXMuc2lubGF0MCAqIHNpbmxhdCArIHRoaXMuY29zbGF0MCAqIGNvc2xhdCAqIE1hdGguY29zKGRsb24pKTtcbiAgICBwLnggPSB0aGlzLmEgKiBBICogY29zbGF0ICogTWF0aC5zaW4oZGxvbikgKyB0aGlzLngwO1xuICAgIHAueSA9IHRoaXMuYSAqIEEgKiAodGhpcy5jb3NsYXQwICogc2lubGF0IC0gdGhpcy5zaW5sYXQwICogY29zbGF0ICogTWF0aC5jb3MoZGxvbikpICsgdGhpcy55MDtcbiAgICByZXR1cm4gcDtcbiAgfVxuICBlbHNlIHtcbiAgICBYID0gMiAqIE1hdGguYXRhbih0aGlzLnNzZm5fKGxhdCwgc2lubGF0LCB0aGlzLmUpKSAtIEhBTEZfUEk7XG4gICAgY29zWCA9IE1hdGguY29zKFgpO1xuICAgIHNpblggPSBNYXRoLnNpbihYKTtcbiAgICBpZiAoTWF0aC5hYnModGhpcy5jb3NsYXQwKSA8PSBFUFNMTikge1xuICAgICAgdHMgPSB0c2Zueih0aGlzLmUsIGxhdCAqIHRoaXMuY29uLCB0aGlzLmNvbiAqIHNpbmxhdCk7XG4gICAgICByaCA9IDIgKiB0aGlzLmEgKiB0aGlzLmswICogdHMgLyB0aGlzLmNvbnM7XG4gICAgICBwLnggPSB0aGlzLngwICsgcmggKiBNYXRoLnNpbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgICAgIHAueSA9IHRoaXMueTAgLSB0aGlzLmNvbiAqIHJoICogTWF0aC5jb3MobG9uIC0gdGhpcy5sb25nMCk7XG4gICAgICAvL3RyYWNlKHAudG9TdHJpbmcoKSk7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZWxzZSBpZiAoTWF0aC5hYnModGhpcy5zaW5sYXQwKSA8IEVQU0xOKSB7XG4gICAgICAvL0VxXG4gICAgICAvL3RyYWNlKCdzdGVyZTplcXVhdGV1cicpO1xuICAgICAgQSA9IDIgKiB0aGlzLmEgKiB0aGlzLmswIC8gKDEgKyBjb3NYICogTWF0aC5jb3MoZGxvbikpO1xuICAgICAgcC55ID0gQSAqIHNpblg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy9vdGhlciBjYXNlXG4gICAgICAvL3RyYWNlKCdzdGVyZTpub3JtYWwgY2FzZScpO1xuICAgICAgQSA9IDIgKiB0aGlzLmEgKiB0aGlzLmswICogdGhpcy5tczEgLyAodGhpcy5jb3NYMCAqICgxICsgdGhpcy5zaW5YMCAqIHNpblggKyB0aGlzLmNvc1gwICogY29zWCAqIE1hdGguY29zKGRsb24pKSk7XG4gICAgICBwLnkgPSBBICogKHRoaXMuY29zWDAgKiBzaW5YIC0gdGhpcy5zaW5YMCAqIGNvc1ggKiBNYXRoLmNvcyhkbG9uKSkgKyB0aGlzLnkwO1xuICAgIH1cbiAgICBwLnggPSBBICogY29zWCAqIE1hdGguc2luKGRsb24pICsgdGhpcy54MDtcbiAgfVxuICAvL3RyYWNlKHAudG9TdHJpbmcoKSk7XG4gIHJldHVybiBwO1xufTtcblxuXG4vLyogU3RlcmVvZ3JhcGhpYyBpbnZlcnNlIGVxdWF0aW9ucy0tbWFwcGluZyB4LHkgdG8gbGF0L2xvbmdcbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICB2YXIgbG9uLCBsYXQsIHRzLCBjZSwgQ2hpO1xuICB2YXIgcmggPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgdmFyIGMgPSAyICogTWF0aC5hdGFuKHJoIC8gKDAuNSAqIHRoaXMuYSAqIHRoaXMuazApKTtcbiAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgIGxhdCA9IHRoaXMubGF0MDtcbiAgICBpZiAocmggPD0gRVBTTE4pIHtcbiAgICAgIHAueCA9IGxvbjtcbiAgICAgIHAueSA9IGxhdDtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBsYXQgPSBNYXRoLmFzaW4oTWF0aC5jb3MoYykgKiB0aGlzLnNpbmxhdDAgKyBwLnkgKiBNYXRoLnNpbihjKSAqIHRoaXMuY29zbGF0MCAvIHJoKTtcbiAgICBpZiAoTWF0aC5hYnModGhpcy5jb3NsYXQwKSA8IEVQU0xOKSB7XG4gICAgICBpZiAodGhpcy5sYXQwID4gMCkge1xuICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCwgLSAxICogcC55KSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLngsIHAueSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXRhbjIocC54ICogTWF0aC5zaW4oYyksIHJoICogdGhpcy5jb3NsYXQwICogTWF0aC5jb3MoYykgLSBwLnkgKiB0aGlzLnNpbmxhdDAgKiBNYXRoLnNpbihjKSkpO1xuICAgIH1cbiAgICBwLnggPSBsb247XG4gICAgcC55ID0gbGF0O1xuICAgIHJldHVybiBwO1xuICB9XG4gIGVsc2Uge1xuICAgIGlmIChNYXRoLmFicyh0aGlzLmNvc2xhdDApIDw9IEVQU0xOKSB7XG4gICAgICBpZiAocmggPD0gRVBTTE4pIHtcbiAgICAgICAgbGF0ID0gdGhpcy5sYXQwO1xuICAgICAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgICAgICBwLnggPSBsb247XG4gICAgICAgIHAueSA9IGxhdDtcbiAgICAgICAgLy90cmFjZShwLnRvU3RyaW5nKCkpO1xuICAgICAgICByZXR1cm4gcDtcbiAgICAgIH1cbiAgICAgIHAueCAqPSB0aGlzLmNvbjtcbiAgICAgIHAueSAqPSB0aGlzLmNvbjtcbiAgICAgIHRzID0gcmggKiB0aGlzLmNvbnMgLyAoMiAqIHRoaXMuYSAqIHRoaXMuazApO1xuICAgICAgbGF0ID0gdGhpcy5jb24gKiBwaGkyeih0aGlzLmUsIHRzKTtcbiAgICAgIGxvbiA9IHRoaXMuY29uICogYWRqdXN0X2xvbih0aGlzLmNvbiAqIHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCwgLSAxICogcC55KSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY2UgPSAyICogTWF0aC5hdGFuKHJoICogdGhpcy5jb3NYMCAvICgyICogdGhpcy5hICogdGhpcy5rMCAqIHRoaXMubXMxKSk7XG4gICAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgICAgaWYgKHJoIDw9IEVQU0xOKSB7XG4gICAgICAgIENoaSA9IHRoaXMuWDA7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgQ2hpID0gTWF0aC5hc2luKE1hdGguY29zKGNlKSAqIHRoaXMuc2luWDAgKyBwLnkgKiBNYXRoLnNpbihjZSkgKiB0aGlzLmNvc1gwIC8gcmgpO1xuICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCAqIE1hdGguc2luKGNlKSwgcmggKiB0aGlzLmNvc1gwICogTWF0aC5jb3MoY2UpIC0gcC55ICogdGhpcy5zaW5YMCAqIE1hdGguc2luKGNlKSkpO1xuICAgICAgfVxuICAgICAgbGF0ID0gLTEgKiBwaGkyeih0aGlzLmUsIE1hdGgudGFuKDAuNSAqIChIQUxGX1BJICsgQ2hpKSkpO1xuICAgIH1cbiAgfVxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcblxuICAvL3RyYWNlKHAudG9TdHJpbmcoKSk7XG4gIHJldHVybiBwO1xuXG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcInN0ZXJlXCIsIFwiU3RlcmVvZ3JhcGhpY19Tb3V0aF9Qb2xlXCIsIFwiUG9sYXIgU3RlcmVvZ3JhcGhpYyAodmFyaWFudCBCKVwiXTtcbiIsInZhciBnYXVzcyA9IHJlcXVpcmUoJy4vZ2F1c3MnKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBnYXVzcy5pbml0LmFwcGx5KHRoaXMpO1xuICBpZiAoIXRoaXMucmMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5zaW5jMCA9IE1hdGguc2luKHRoaXMucGhpYzApO1xuICB0aGlzLmNvc2MwID0gTWF0aC5jb3ModGhpcy5waGljMCk7XG4gIHRoaXMuUjIgPSAyICogdGhpcy5yYztcbiAgaWYgKCF0aGlzLnRpdGxlKSB7XG4gICAgdGhpcy50aXRsZSA9IFwiT2JsaXF1ZSBTdGVyZW9ncmFwaGljIEFsdGVybmF0aXZlXCI7XG4gIH1cbn07XG5cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHNpbmMsIGNvc2MsIGNvc2wsIGs7XG4gIHAueCA9IGFkanVzdF9sb24ocC54IC0gdGhpcy5sb25nMCk7XG4gIGdhdXNzLmZvcndhcmQuYXBwbHkodGhpcywgW3BdKTtcbiAgc2luYyA9IE1hdGguc2luKHAueSk7XG4gIGNvc2MgPSBNYXRoLmNvcyhwLnkpO1xuICBjb3NsID0gTWF0aC5jb3MocC54KTtcbiAgayA9IHRoaXMuazAgKiB0aGlzLlIyIC8gKDEgKyB0aGlzLnNpbmMwICogc2luYyArIHRoaXMuY29zYzAgKiBjb3NjICogY29zbCk7XG4gIHAueCA9IGsgKiBjb3NjICogTWF0aC5zaW4ocC54KTtcbiAgcC55ID0gayAqICh0aGlzLmNvc2MwICogc2luYyAtIHRoaXMuc2luYzAgKiBjb3NjICogY29zbCk7XG4gIHAueCA9IHRoaXMuYSAqIHAueCArIHRoaXMueDA7XG4gIHAueSA9IHRoaXMuYSAqIHAueSArIHRoaXMueTA7XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgc2luYywgY29zYywgbG9uLCBsYXQsIHJobztcbiAgcC54ID0gKHAueCAtIHRoaXMueDApIC8gdGhpcy5hO1xuICBwLnkgPSAocC55IC0gdGhpcy55MCkgLyB0aGlzLmE7XG5cbiAgcC54IC89IHRoaXMuazA7XG4gIHAueSAvPSB0aGlzLmswO1xuICBpZiAoKHJobyA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpKSkge1xuICAgIHZhciBjID0gMiAqIE1hdGguYXRhbjIocmhvLCB0aGlzLlIyKTtcbiAgICBzaW5jID0gTWF0aC5zaW4oYyk7XG4gICAgY29zYyA9IE1hdGguY29zKGMpO1xuICAgIGxhdCA9IE1hdGguYXNpbihjb3NjICogdGhpcy5zaW5jMCArIHAueSAqIHNpbmMgKiB0aGlzLmNvc2MwIC8gcmhvKTtcbiAgICBsb24gPSBNYXRoLmF0YW4yKHAueCAqIHNpbmMsIHJobyAqIHRoaXMuY29zYzAgKiBjb3NjIC0gcC55ICogdGhpcy5zaW5jMCAqIHNpbmMpO1xuICB9XG4gIGVsc2Uge1xuICAgIGxhdCA9IHRoaXMucGhpYzA7XG4gICAgbG9uID0gMDtcbiAgfVxuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICBnYXVzcy5pbnZlcnNlLmFwcGx5KHRoaXMsIFtwXSk7XG4gIHAueCA9IGFkanVzdF9sb24ocC54ICsgdGhpcy5sb25nMCk7XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5uYW1lcyA9IFtcIlN0ZXJlb2dyYXBoaWNfTm9ydGhfUG9sZVwiLCBcIk9ibGlxdWVfU3RlcmVvZ3JhcGhpY1wiLCBcIlBvbGFyX1N0ZXJlb2dyYXBoaWNcIiwgXCJzdGVyZWFcIixcIk9ibGlxdWUgU3RlcmVvZ3JhcGhpYyBBbHRlcm5hdGl2ZVwiXTtcbiIsInZhciBlMGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UwZm4nKTtcbnZhciBlMWZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UxZm4nKTtcbnZhciBlMmZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UyZm4nKTtcbnZhciBlM2ZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UzZm4nKTtcbnZhciBtbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL21sZm4nKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBzaWduID0gcmVxdWlyZSgnLi4vY29tbW9uL3NpZ24nKTtcbnZhciBhc2lueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hc2lueicpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lMCA9IGUwZm4odGhpcy5lcyk7XG4gIHRoaXMuZTEgPSBlMWZuKHRoaXMuZXMpO1xuICB0aGlzLmUyID0gZTJmbih0aGlzLmVzKTtcbiAgdGhpcy5lMyA9IGUzZm4odGhpcy5lcyk7XG4gIHRoaXMubWwwID0gdGhpcy5hICogbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCB0aGlzLmxhdDApO1xufTtcblxuLyoqXG4gICAgVHJhbnN2ZXJzZSBNZXJjYXRvciBGb3J3YXJkICAtIGxvbmcvbGF0IHRvIHgveVxuICAgIGxvbmcvbGF0IGluIHJhZGlhbnNcbiAgKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcblxuICB2YXIgZGVsdGFfbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIGNvbjtcbiAgdmFyIHgsIHk7XG4gIHZhciBzaW5fcGhpID0gTWF0aC5zaW4obGF0KTtcbiAgdmFyIGNvc19waGkgPSBNYXRoLmNvcyhsYXQpO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHZhciBiID0gY29zX3BoaSAqIE1hdGguc2luKGRlbHRhX2xvbik7XG4gICAgaWYgKChNYXRoLmFicyhNYXRoLmFicyhiKSAtIDEpKSA8IDAuMDAwMDAwMDAwMSkge1xuICAgICAgcmV0dXJuICg5Myk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgeCA9IDAuNSAqIHRoaXMuYSAqIHRoaXMuazAgKiBNYXRoLmxvZygoMSArIGIpIC8gKDEgLSBiKSk7XG4gICAgICBjb24gPSBNYXRoLmFjb3MoY29zX3BoaSAqIE1hdGguY29zKGRlbHRhX2xvbikgLyBNYXRoLnNxcnQoMSAtIGIgKiBiKSk7XG4gICAgICBpZiAobGF0IDwgMCkge1xuICAgICAgICBjb24gPSAtY29uO1xuICAgICAgfVxuICAgICAgeSA9IHRoaXMuYSAqIHRoaXMuazAgKiAoY29uIC0gdGhpcy5sYXQwKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIGFsID0gY29zX3BoaSAqIGRlbHRhX2xvbjtcbiAgICB2YXIgYWxzID0gTWF0aC5wb3coYWwsIDIpO1xuICAgIHZhciBjID0gdGhpcy5lcDIgKiBNYXRoLnBvdyhjb3NfcGhpLCAyKTtcbiAgICB2YXIgdHEgPSBNYXRoLnRhbihsYXQpO1xuICAgIHZhciB0ID0gTWF0aC5wb3codHEsIDIpO1xuICAgIGNvbiA9IDEgLSB0aGlzLmVzICogTWF0aC5wb3coc2luX3BoaSwgMik7XG4gICAgdmFyIG4gPSB0aGlzLmEgLyBNYXRoLnNxcnQoY29uKTtcbiAgICB2YXIgbWwgPSB0aGlzLmEgKiBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIGxhdCk7XG5cbiAgICB4ID0gdGhpcy5rMCAqIG4gKiBhbCAqICgxICsgYWxzIC8gNiAqICgxIC0gdCArIGMgKyBhbHMgLyAyMCAqICg1IC0gMTggKiB0ICsgTWF0aC5wb3codCwgMikgKyA3MiAqIGMgLSA1OCAqIHRoaXMuZXAyKSkpICsgdGhpcy54MDtcbiAgICB5ID0gdGhpcy5rMCAqIChtbCAtIHRoaXMubWwwICsgbiAqIHRxICogKGFscyAqICgwLjUgKyBhbHMgLyAyNCAqICg1IC0gdCArIDkgKiBjICsgNCAqIE1hdGgucG93KGMsIDIpICsgYWxzIC8gMzAgKiAoNjEgLSA1OCAqIHQgKyBNYXRoLnBvdyh0LCAyKSArIDYwMCAqIGMgLSAzMzAgKiB0aGlzLmVwMikpKSkpICsgdGhpcy55MDtcblxuICB9XG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gICAgVHJhbnN2ZXJzZSBNZXJjYXRvciBJbnZlcnNlICAtICB4L3kgdG8gbG9uZy9sYXRcbiAgKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGNvbiwgcGhpO1xuICB2YXIgZGVsdGFfcGhpO1xuICB2YXIgaTtcbiAgdmFyIG1heF9pdGVyID0gNjtcbiAgdmFyIGxhdCwgbG9uO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHZhciBmID0gTWF0aC5leHAocC54IC8gKHRoaXMuYSAqIHRoaXMuazApKTtcbiAgICB2YXIgZyA9IDAuNSAqIChmIC0gMSAvIGYpO1xuICAgIHZhciB0ZW1wID0gdGhpcy5sYXQwICsgcC55IC8gKHRoaXMuYSAqIHRoaXMuazApO1xuICAgIHZhciBoID0gTWF0aC5jb3ModGVtcCk7XG4gICAgY29uID0gTWF0aC5zcXJ0KCgxIC0gaCAqIGgpIC8gKDEgKyBnICogZykpO1xuICAgIGxhdCA9IGFzaW56KGNvbik7XG4gICAgaWYgKHRlbXAgPCAwKSB7XG4gICAgICBsYXQgPSAtbGF0O1xuICAgIH1cbiAgICBpZiAoKGcgPT09IDApICYmIChoID09PSAwKSkge1xuICAgICAgbG9uID0gdGhpcy5sb25nMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKE1hdGguYXRhbjIoZywgaCkgKyB0aGlzLmxvbmcwKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7IC8vIGVsbGlwc29pZGFsIGZvcm1cbiAgICB2YXIgeCA9IHAueCAtIHRoaXMueDA7XG4gICAgdmFyIHkgPSBwLnkgLSB0aGlzLnkwO1xuXG4gICAgY29uID0gKHRoaXMubWwwICsgeSAvIHRoaXMuazApIC8gdGhpcy5hO1xuICAgIHBoaSA9IGNvbjtcbiAgICBmb3IgKGkgPSAwOyB0cnVlOyBpKyspIHtcbiAgICAgIGRlbHRhX3BoaSA9ICgoY29uICsgdGhpcy5lMSAqIE1hdGguc2luKDIgKiBwaGkpIC0gdGhpcy5lMiAqIE1hdGguc2luKDQgKiBwaGkpICsgdGhpcy5lMyAqIE1hdGguc2luKDYgKiBwaGkpKSAvIHRoaXMuZTApIC0gcGhpO1xuICAgICAgcGhpICs9IGRlbHRhX3BoaTtcbiAgICAgIGlmIChNYXRoLmFicyhkZWx0YV9waGkpIDw9IEVQU0xOKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGkgPj0gbWF4X2l0ZXIpIHtcbiAgICAgICAgcmV0dXJuICg5NSk7XG4gICAgICB9XG4gICAgfSAvLyBmb3IoKVxuICAgIGlmIChNYXRoLmFicyhwaGkpIDwgSEFMRl9QSSkge1xuICAgICAgdmFyIHNpbl9waGkgPSBNYXRoLnNpbihwaGkpO1xuICAgICAgdmFyIGNvc19waGkgPSBNYXRoLmNvcyhwaGkpO1xuICAgICAgdmFyIHRhbl9waGkgPSBNYXRoLnRhbihwaGkpO1xuICAgICAgdmFyIGMgPSB0aGlzLmVwMiAqIE1hdGgucG93KGNvc19waGksIDIpO1xuICAgICAgdmFyIGNzID0gTWF0aC5wb3coYywgMik7XG4gICAgICB2YXIgdCA9IE1hdGgucG93KHRhbl9waGksIDIpO1xuICAgICAgdmFyIHRzID0gTWF0aC5wb3codCwgMik7XG4gICAgICBjb24gPSAxIC0gdGhpcy5lcyAqIE1hdGgucG93KHNpbl9waGksIDIpO1xuICAgICAgdmFyIG4gPSB0aGlzLmEgLyBNYXRoLnNxcnQoY29uKTtcbiAgICAgIHZhciByID0gbiAqICgxIC0gdGhpcy5lcykgLyBjb247XG4gICAgICB2YXIgZCA9IHggLyAobiAqIHRoaXMuazApO1xuICAgICAgdmFyIGRzID0gTWF0aC5wb3coZCwgMik7XG4gICAgICBsYXQgPSBwaGkgLSAobiAqIHRhbl9waGkgKiBkcyAvIHIpICogKDAuNSAtIGRzIC8gMjQgKiAoNSArIDMgKiB0ICsgMTAgKiBjIC0gNCAqIGNzIC0gOSAqIHRoaXMuZXAyIC0gZHMgLyAzMCAqICg2MSArIDkwICogdCArIDI5OCAqIGMgKyA0NSAqIHRzIC0gMjUyICogdGhpcy5lcDIgLSAzICogY3MpKSk7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyAoZCAqICgxIC0gZHMgLyA2ICogKDEgKyAyICogdCArIGMgLSBkcyAvIDIwICogKDUgLSAyICogYyArIDI4ICogdCAtIDMgKiBjcyArIDggKiB0aGlzLmVwMiArIDI0ICogdHMpKSkgLyBjb3NfcGhpKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbGF0ID0gSEFMRl9QSSAqIHNpZ24oeSk7XG4gICAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgIH1cbiAgfVxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIlRyYW5zdmVyc2VfTWVyY2F0b3JcIiwgXCJUcmFuc3ZlcnNlIE1lcmNhdG9yXCIsIFwidG1lcmNcIl07XG4iLCJ2YXIgRDJSID0gMC4wMTc0NTMyOTI1MTk5NDMyOTU3NztcbnZhciB0bWVyYyA9IHJlcXVpcmUoJy4vdG1lcmMnKTtcbmV4cG9ydHMuZGVwZW5kc09uID0gJ3RtZXJjJztcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXRoaXMuem9uZSkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLmxhdDAgPSAwO1xuICB0aGlzLmxvbmcwID0gKCg2ICogTWF0aC5hYnModGhpcy56b25lKSkgLSAxODMpICogRDJSO1xuICB0aGlzLngwID0gNTAwMDAwO1xuICB0aGlzLnkwID0gdGhpcy51dG1Tb3V0aCA/IDEwMDAwMDAwIDogMDtcbiAgdGhpcy5rMCA9IDAuOTk5NjtcblxuICB0bWVyYy5pbml0LmFwcGx5KHRoaXMpO1xuICB0aGlzLmZvcndhcmQgPSB0bWVyYy5mb3J3YXJkO1xuICB0aGlzLmludmVyc2UgPSB0bWVyYy5pbnZlcnNlO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJVbml2ZXJzYWwgVHJhbnN2ZXJzZSBNZXJjYXRvciBTeXN0ZW1cIiwgXCJ1dG1cIl07XG4iLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgYXNpbnogPSByZXF1aXJlKCcuLi9jb21tb24vYXNpbnonKTtcbi8qIEluaXRpYWxpemUgdGhlIFZhbiBEZXIgR3JpbnRlbiBwcm9qZWN0aW9uXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIC8vdGhpcy5SID0gNjM3MDk5NzsgLy9SYWRpdXMgb2YgZWFydGhcbiAgdGhpcy5SID0gdGhpcy5hO1xufTtcblxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuXG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG5cbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIHgsIHk7XG5cbiAgaWYgKE1hdGguYWJzKGxhdCkgPD0gRVBTTE4pIHtcbiAgICB4ID0gdGhpcy54MCArIHRoaXMuUiAqIGRsb247XG4gICAgeSA9IHRoaXMueTA7XG4gIH1cbiAgdmFyIHRoZXRhID0gYXNpbnooMiAqIE1hdGguYWJzKGxhdCAvIE1hdGguUEkpKTtcbiAgaWYgKChNYXRoLmFicyhkbG9uKSA8PSBFUFNMTikgfHwgKE1hdGguYWJzKE1hdGguYWJzKGxhdCkgLSBIQUxGX1BJKSA8PSBFUFNMTikpIHtcbiAgICB4ID0gdGhpcy54MDtcbiAgICBpZiAobGF0ID49IDApIHtcbiAgICAgIHkgPSB0aGlzLnkwICsgTWF0aC5QSSAqIHRoaXMuUiAqIE1hdGgudGFuKDAuNSAqIHRoZXRhKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB5ID0gdGhpcy55MCArIE1hdGguUEkgKiB0aGlzLlIgKiAtTWF0aC50YW4oMC41ICogdGhldGEpO1xuICAgIH1cbiAgICAvLyAgcmV0dXJuKE9LKTtcbiAgfVxuICB2YXIgYWwgPSAwLjUgKiBNYXRoLmFicygoTWF0aC5QSSAvIGRsb24pIC0gKGRsb24gLyBNYXRoLlBJKSk7XG4gIHZhciBhc3EgPSBhbCAqIGFsO1xuICB2YXIgc2ludGggPSBNYXRoLnNpbih0aGV0YSk7XG4gIHZhciBjb3N0aCA9IE1hdGguY29zKHRoZXRhKTtcblxuICB2YXIgZyA9IGNvc3RoIC8gKHNpbnRoICsgY29zdGggLSAxKTtcbiAgdmFyIGdzcSA9IGcgKiBnO1xuICB2YXIgbSA9IGcgKiAoMiAvIHNpbnRoIC0gMSk7XG4gIHZhciBtc3EgPSBtICogbTtcbiAgdmFyIGNvbiA9IE1hdGguUEkgKiB0aGlzLlIgKiAoYWwgKiAoZyAtIG1zcSkgKyBNYXRoLnNxcnQoYXNxICogKGcgLSBtc3EpICogKGcgLSBtc3EpIC0gKG1zcSArIGFzcSkgKiAoZ3NxIC0gbXNxKSkpIC8gKG1zcSArIGFzcSk7XG4gIGlmIChkbG9uIDwgMCkge1xuICAgIGNvbiA9IC1jb247XG4gIH1cbiAgeCA9IHRoaXMueDAgKyBjb247XG4gIC8vY29uID0gTWF0aC5hYnMoY29uIC8gKE1hdGguUEkgKiB0aGlzLlIpKTtcbiAgdmFyIHEgPSBhc3EgKyBnO1xuICBjb24gPSBNYXRoLlBJICogdGhpcy5SICogKG0gKiBxIC0gYWwgKiBNYXRoLnNxcnQoKG1zcSArIGFzcSkgKiAoYXNxICsgMSkgLSBxICogcSkpIC8gKG1zcSArIGFzcSk7XG4gIGlmIChsYXQgPj0gMCkge1xuICAgIC8veSA9IHRoaXMueTAgKyBNYXRoLlBJICogdGhpcy5SICogTWF0aC5zcXJ0KDEgLSBjb24gKiBjb24gLSAyICogYWwgKiBjb24pO1xuICAgIHkgPSB0aGlzLnkwICsgY29uO1xuICB9XG4gIGVsc2Uge1xuICAgIC8veSA9IHRoaXMueTAgLSBNYXRoLlBJICogdGhpcy5SICogTWF0aC5zcXJ0KDEgLSBjb24gKiBjb24gLSAyICogYWwgKiBjb24pO1xuICAgIHkgPSB0aGlzLnkwIC0gY29uO1xuICB9XG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuLyogVmFuIERlciBHcmludGVuIGludmVyc2UgZXF1YXRpb25zLS1tYXBwaW5nIHgseSB0byBsYXQvbG9uZ1xuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uLCBsYXQ7XG4gIHZhciB4eCwgeXksIHh5cywgYzEsIGMyLCBjMztcbiAgdmFyIGExO1xuICB2YXIgbTE7XG4gIHZhciBjb247XG4gIHZhciB0aDE7XG4gIHZhciBkO1xuXG4gIC8qIGludmVyc2UgZXF1YXRpb25zXG4gICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBwLnggLT0gdGhpcy54MDtcbiAgcC55IC09IHRoaXMueTA7XG4gIGNvbiA9IE1hdGguUEkgKiB0aGlzLlI7XG4gIHh4ID0gcC54IC8gY29uO1xuICB5eSA9IHAueSAvIGNvbjtcbiAgeHlzID0geHggKiB4eCArIHl5ICogeXk7XG4gIGMxID0gLU1hdGguYWJzKHl5KSAqICgxICsgeHlzKTtcbiAgYzIgPSBjMSAtIDIgKiB5eSAqIHl5ICsgeHggKiB4eDtcbiAgYzMgPSAtMiAqIGMxICsgMSArIDIgKiB5eSAqIHl5ICsgeHlzICogeHlzO1xuICBkID0geXkgKiB5eSAvIGMzICsgKDIgKiBjMiAqIGMyICogYzIgLyBjMyAvIGMzIC8gYzMgLSA5ICogYzEgKiBjMiAvIGMzIC8gYzMpIC8gMjc7XG4gIGExID0gKGMxIC0gYzIgKiBjMiAvIDMgLyBjMykgLyBjMztcbiAgbTEgPSAyICogTWF0aC5zcXJ0KC1hMSAvIDMpO1xuICBjb24gPSAoKDMgKiBkKSAvIGExKSAvIG0xO1xuICBpZiAoTWF0aC5hYnMoY29uKSA+IDEpIHtcbiAgICBpZiAoY29uID49IDApIHtcbiAgICAgIGNvbiA9IDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uID0gLTE7XG4gICAgfVxuICB9XG4gIHRoMSA9IE1hdGguYWNvcyhjb24pIC8gMztcbiAgaWYgKHAueSA+PSAwKSB7XG4gICAgbGF0ID0gKC1tMSAqIE1hdGguY29zKHRoMSArIE1hdGguUEkgLyAzKSAtIGMyIC8gMyAvIGMzKSAqIE1hdGguUEk7XG4gIH1cbiAgZWxzZSB7XG4gICAgbGF0ID0gLSgtbTEgKiBNYXRoLmNvcyh0aDEgKyBNYXRoLlBJIC8gMykgLSBjMiAvIDMgLyBjMykgKiBNYXRoLlBJO1xuICB9XG5cbiAgaWYgKE1hdGguYWJzKHh4KSA8IEVQU0xOKSB7XG4gICAgbG9uID0gdGhpcy5sb25nMDtcbiAgfVxuICBlbHNlIHtcbiAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLlBJICogKHh5cyAtIDEgKyBNYXRoLnNxcnQoMSArIDIgKiAoeHggKiB4eCAtIHl5ICogeXkpICsgeHlzICogeHlzKSkgLyAyIC8geHgpO1xuICB9XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJWYW5fZGVyX0dyaW50ZW5fSVwiLCBcIlZhbkRlckdyaW50ZW5cIiwgXCJ2YW5kZ1wiXTsiLCJ2YXIgRDJSID0gMC4wMTc0NTMyOTI1MTk5NDMyOTU3NztcbnZhciBSMkQgPSA1Ny4yOTU3Nzk1MTMwODIzMjA4ODtcbnZhciBQSkRfM1BBUkFNID0gMTtcbnZhciBQSkRfN1BBUkFNID0gMjtcbnZhciBkYXR1bV90cmFuc2Zvcm0gPSByZXF1aXJlKCcuL2RhdHVtX3RyYW5zZm9ybScpO1xudmFyIGFkanVzdF9heGlzID0gcmVxdWlyZSgnLi9hZGp1c3RfYXhpcycpO1xudmFyIHByb2ogPSByZXF1aXJlKCcuL1Byb2onKTtcbnZhciB0b1BvaW50ID0gcmVxdWlyZSgnLi9jb21tb24vdG9Qb2ludCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm0oc291cmNlLCBkZXN0LCBwb2ludCkge1xuICB2YXIgd2dzODQ7XG4gIGlmIChBcnJheS5pc0FycmF5KHBvaW50KSkge1xuICAgIHBvaW50ID0gdG9Qb2ludChwb2ludCk7XG4gIH1cbiAgZnVuY3Rpb24gY2hlY2tOb3RXR1Moc291cmNlLCBkZXN0KSB7XG4gICAgcmV0dXJuICgoc291cmNlLmRhdHVtLmRhdHVtX3R5cGUgPT09IFBKRF8zUEFSQU0gfHwgc291cmNlLmRhdHVtLmRhdHVtX3R5cGUgPT09IFBKRF83UEFSQU0pICYmIGRlc3QuZGF0dW1Db2RlICE9PSBcIldHUzg0XCIpO1xuICB9XG5cbiAgLy8gV29ya2Fyb3VuZCBmb3IgZGF0dW0gc2hpZnRzIHRvd2dzODQsIGlmIGVpdGhlciBzb3VyY2Ugb3IgZGVzdGluYXRpb24gcHJvamVjdGlvbiBpcyBub3Qgd2dzODRcbiAgaWYgKHNvdXJjZS5kYXR1bSAmJiBkZXN0LmRhdHVtICYmIChjaGVja05vdFdHUyhzb3VyY2UsIGRlc3QpIHx8IGNoZWNrTm90V0dTKGRlc3QsIHNvdXJjZSkpKSB7XG4gICAgd2dzODQgPSBuZXcgcHJvaignV0dTODQnKTtcbiAgICB0cmFuc2Zvcm0oc291cmNlLCB3Z3M4NCwgcG9pbnQpO1xuICAgIHNvdXJjZSA9IHdnczg0O1xuICB9XG4gIC8vIERHUiwgMjAxMC8xMS8xMlxuICBpZiAoc291cmNlLmF4aXMgIT09IFwiZW51XCIpIHtcbiAgICBhZGp1c3RfYXhpcyhzb3VyY2UsIGZhbHNlLCBwb2ludCk7XG4gIH1cbiAgLy8gVHJhbnNmb3JtIHNvdXJjZSBwb2ludHMgdG8gbG9uZy9sYXQsIGlmIHRoZXkgYXJlbid0IGFscmVhZHkuXG4gIGlmIChzb3VyY2UucHJvak5hbWUgPT09IFwibG9uZ2xhdFwiKSB7XG4gICAgcG9pbnQueCAqPSBEMlI7IC8vIGNvbnZlcnQgZGVncmVlcyB0byByYWRpYW5zXG4gICAgcG9pbnQueSAqPSBEMlI7XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHNvdXJjZS50b19tZXRlcikge1xuICAgICAgcG9pbnQueCAqPSBzb3VyY2UudG9fbWV0ZXI7XG4gICAgICBwb2ludC55ICo9IHNvdXJjZS50b19tZXRlcjtcbiAgICB9XG4gICAgc291cmNlLmludmVyc2UocG9pbnQpOyAvLyBDb252ZXJ0IENhcnRlc2lhbiB0byBsb25nbGF0XG4gIH1cbiAgLy8gQWRqdXN0IGZvciB0aGUgcHJpbWUgbWVyaWRpYW4gaWYgbmVjZXNzYXJ5XG4gIGlmIChzb3VyY2UuZnJvbV9ncmVlbndpY2gpIHtcbiAgICBwb2ludC54ICs9IHNvdXJjZS5mcm9tX2dyZWVud2ljaDtcbiAgfVxuXG4gIC8vIENvbnZlcnQgZGF0dW1zIGlmIG5lZWRlZCwgYW5kIGlmIHBvc3NpYmxlLlxuICBwb2ludCA9IGRhdHVtX3RyYW5zZm9ybShzb3VyY2UuZGF0dW0sIGRlc3QuZGF0dW0sIHBvaW50KTtcblxuICAvLyBBZGp1c3QgZm9yIHRoZSBwcmltZSBtZXJpZGlhbiBpZiBuZWNlc3NhcnlcbiAgaWYgKGRlc3QuZnJvbV9ncmVlbndpY2gpIHtcbiAgICBwb2ludC54IC09IGRlc3QuZnJvbV9ncmVlbndpY2g7XG4gIH1cblxuICBpZiAoZGVzdC5wcm9qTmFtZSA9PT0gXCJsb25nbGF0XCIpIHtcbiAgICAvLyBjb252ZXJ0IHJhZGlhbnMgdG8gZGVjaW1hbCBkZWdyZWVzXG4gICAgcG9pbnQueCAqPSBSMkQ7XG4gICAgcG9pbnQueSAqPSBSMkQ7XG4gIH1cbiAgZWxzZSB7IC8vIGVsc2UgcHJvamVjdFxuICAgIGRlc3QuZm9yd2FyZChwb2ludCk7XG4gICAgaWYgKGRlc3QudG9fbWV0ZXIpIHtcbiAgICAgIHBvaW50LnggLz0gZGVzdC50b19tZXRlcjtcbiAgICAgIHBvaW50LnkgLz0gZGVzdC50b19tZXRlcjtcbiAgICB9XG4gIH1cblxuICAvLyBER1IsIDIwMTAvMTEvMTJcbiAgaWYgKGRlc3QuYXhpcyAhPT0gXCJlbnVcIikge1xuICAgIGFkanVzdF9heGlzKGRlc3QsIHRydWUsIHBvaW50KTtcbiAgfVxuXG4gIHJldHVybiBwb2ludDtcbn07IiwidmFyIEQyUiA9IDAuMDE3NDUzMjkyNTE5OTQzMjk1Nzc7XG52YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi9leHRlbmQnKTtcblxuZnVuY3Rpb24gbWFwaXQob2JqLCBrZXksIHYpIHtcbiAgb2JqW2tleV0gPSB2Lm1hcChmdW5jdGlvbihhYSkge1xuICAgIHZhciBvID0ge307XG4gICAgc0V4cHIoYWEsIG8pO1xuICAgIHJldHVybiBvO1xuICB9KS5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBleHRlbmQoYSwgYik7XG4gIH0sIHt9KTtcbn1cblxuZnVuY3Rpb24gc0V4cHIodiwgb2JqKSB7XG4gIHZhciBrZXk7XG4gIGlmICghQXJyYXkuaXNBcnJheSh2KSkge1xuICAgIG9ialt2XSA9IHRydWU7XG4gICAgcmV0dXJuO1xuICB9XG4gIGVsc2Uge1xuICAgIGtleSA9IHYuc2hpZnQoKTtcbiAgICBpZiAoa2V5ID09PSAnUEFSQU1FVEVSJykge1xuICAgICAga2V5ID0gdi5zaGlmdCgpO1xuICAgIH1cbiAgICBpZiAodi5sZW5ndGggPT09IDEpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZbMF0pKSB7XG4gICAgICAgIG9ialtrZXldID0ge307XG4gICAgICAgIHNFeHByKHZbMF0sIG9ialtrZXldKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBvYmpba2V5XSA9IHZbMF07XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCF2Lmxlbmd0aCkge1xuICAgICAgb2JqW2tleV0gPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChrZXkgPT09ICdUT1dHUzg0Jykge1xuICAgICAgb2JqW2tleV0gPSB2O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIG9ialtrZXldID0ge307XG4gICAgICBpZiAoWydVTklUJywgJ1BSSU1FTScsICdWRVJUX0RBVFVNJ10uaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgICAgb2JqW2tleV0gPSB7XG4gICAgICAgICAgbmFtZTogdlswXS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgIGNvbnZlcnQ6IHZbMV1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHYubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgb2JqW2tleV0uYXV0aCA9IHZbMl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ1NQSEVST0lEJykge1xuICAgICAgICBvYmpba2V5XSA9IHtcbiAgICAgICAgICBuYW1lOiB2WzBdLFxuICAgICAgICAgIGE6IHZbMV0sXG4gICAgICAgICAgcmY6IHZbMl1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHYubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgb2JqW2tleV0uYXV0aCA9IHZbM107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKFsnR0VPR0NTJywgJ0dFT0NDUycsICdEQVRVTScsICdWRVJUX0NTJywgJ0NPTVBEX0NTJywgJ0xPQ0FMX0NTJywgJ0ZJVFRFRF9DUycsICdMT0NBTF9EQVRVTSddLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICAgIHZbMF0gPSBbJ25hbWUnLCB2WzBdXTtcbiAgICAgICAgbWFwaXQob2JqLCBrZXksIHYpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAodi5ldmVyeShmdW5jdGlvbihhYSkge1xuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhYSk7XG4gICAgICB9KSkge1xuICAgICAgICBtYXBpdChvYmosIGtleSwgdik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc0V4cHIodiwgb2JqW2tleV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZW5hbWUob2JqLCBwYXJhbXMpIHtcbiAgdmFyIG91dE5hbWUgPSBwYXJhbXNbMF07XG4gIHZhciBpbk5hbWUgPSBwYXJhbXNbMV07XG4gIGlmICghKG91dE5hbWUgaW4gb2JqKSAmJiAoaW5OYW1lIGluIG9iaikpIHtcbiAgICBvYmpbb3V0TmFtZV0gPSBvYmpbaW5OYW1lXTtcbiAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMykge1xuICAgICAgb2JqW291dE5hbWVdID0gcGFyYW1zWzJdKG9ialtvdXROYW1lXSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGQycihpbnB1dCkge1xuICByZXR1cm4gaW5wdXQgKiBEMlI7XG59XG5cbmZ1bmN0aW9uIGNsZWFuV0tUKHdrdCkge1xuICBpZiAod2t0LnR5cGUgPT09ICdHRU9HQ1MnKSB7XG4gICAgd2t0LnByb2pOYW1lID0gJ2xvbmdsYXQnO1xuICB9XG4gIGVsc2UgaWYgKHdrdC50eXBlID09PSAnTE9DQUxfQ1MnKSB7XG4gICAgd2t0LnByb2pOYW1lID0gJ2lkZW50aXR5JztcbiAgICB3a3QubG9jYWwgPSB0cnVlO1xuICB9XG4gIGVsc2Uge1xuICAgIGlmICh0eXBlb2Ygd2t0LlBST0pFQ1RJT04gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHdrdC5wcm9qTmFtZSA9IE9iamVjdC5rZXlzKHdrdC5QUk9KRUNUSU9OKVswXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB3a3QucHJvak5hbWUgPSB3a3QuUFJPSkVDVElPTjtcbiAgICB9XG4gIH1cbiAgaWYgKHdrdC5VTklUKSB7XG4gICAgd2t0LnVuaXRzID0gd2t0LlVOSVQubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh3a3QudW5pdHMgPT09ICdtZXRyZScpIHtcbiAgICAgIHdrdC51bml0cyA9ICdtZXRlcic7XG4gICAgfVxuICAgIGlmICh3a3QuVU5JVC5jb252ZXJ0KSB7XG4gICAgICB3a3QudG9fbWV0ZXIgPSBwYXJzZUZsb2F0KHdrdC5VTklULmNvbnZlcnQsIDEwKTtcbiAgICB9XG4gIH1cblxuICBpZiAod2t0LkdFT0dDUykge1xuICAgIC8vaWYod2t0LkdFT0dDUy5QUklNRU0mJndrdC5HRU9HQ1MuUFJJTUVNLmNvbnZlcnQpe1xuICAgIC8vICB3a3QuZnJvbV9ncmVlbndpY2g9d2t0LkdFT0dDUy5QUklNRU0uY29udmVydCpEMlI7XG4gICAgLy99XG4gICAgaWYgKHdrdC5HRU9HQ1MuREFUVU0pIHtcbiAgICAgIHdrdC5kYXR1bUNvZGUgPSB3a3QuR0VPR0NTLkRBVFVNLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB3a3QuZGF0dW1Db2RlID0gd2t0LkdFT0dDUy5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICAgIGlmICh3a3QuZGF0dW1Db2RlLnNsaWNlKDAsIDIpID09PSAnZF8nKSB7XG4gICAgICB3a3QuZGF0dW1Db2RlID0gd2t0LmRhdHVtQ29kZS5zbGljZSgyKTtcbiAgICB9XG4gICAgaWYgKHdrdC5kYXR1bUNvZGUgPT09ICduZXdfemVhbGFuZF9nZW9kZXRpY19kYXR1bV8xOTQ5JyB8fCB3a3QuZGF0dW1Db2RlID09PSAnbmV3X3plYWxhbmRfMTk0OScpIHtcbiAgICAgIHdrdC5kYXR1bUNvZGUgPSAnbnpnZDQ5JztcbiAgICB9XG4gICAgaWYgKHdrdC5kYXR1bUNvZGUgPT09IFwid2dzXzE5ODRcIikge1xuICAgICAgaWYgKHdrdC5QUk9KRUNUSU9OID09PSAnTWVyY2F0b3JfQXV4aWxpYXJ5X1NwaGVyZScpIHtcbiAgICAgICAgd2t0LnNwaGVyZSA9IHRydWU7XG4gICAgICB9XG4gICAgICB3a3QuZGF0dW1Db2RlID0gJ3dnczg0JztcbiAgICB9XG4gICAgaWYgKHdrdC5kYXR1bUNvZGUuc2xpY2UoLTYpID09PSAnX2ZlcnJvJykge1xuICAgICAgd2t0LmRhdHVtQ29kZSA9IHdrdC5kYXR1bUNvZGUuc2xpY2UoMCwgLSA2KTtcbiAgICB9XG4gICAgaWYgKHdrdC5kYXR1bUNvZGUuc2xpY2UoLTgpID09PSAnX2pha2FydGEnKSB7XG4gICAgICB3a3QuZGF0dW1Db2RlID0gd2t0LmRhdHVtQ29kZS5zbGljZSgwLCAtIDgpO1xuICAgIH1cbiAgICBpZiAofndrdC5kYXR1bUNvZGUuaW5kZXhPZignYmVsZ2UnKSkge1xuICAgICAgd2t0LmRhdHVtQ29kZSA9IFwicm5iNzJcIjtcbiAgICB9XG4gICAgaWYgKHdrdC5HRU9HQ1MuREFUVU0gJiYgd2t0LkdFT0dDUy5EQVRVTS5TUEhFUk9JRCkge1xuICAgICAgd2t0LmVsbHBzID0gd2t0LkdFT0dDUy5EQVRVTS5TUEhFUk9JRC5uYW1lLnJlcGxhY2UoJ18xOScsICcnKS5yZXBsYWNlKC9bQ2NdbGFya2VcXF8xOC8sICdjbHJrJyk7XG4gICAgICBpZiAod2t0LmVsbHBzLnRvTG93ZXJDYXNlKCkuc2xpY2UoMCwgMTMpID09PSBcImludGVybmF0aW9uYWxcIikge1xuICAgICAgICB3a3QuZWxscHMgPSAnaW50bCc7XG4gICAgICB9XG5cbiAgICAgIHdrdC5hID0gd2t0LkdFT0dDUy5EQVRVTS5TUEhFUk9JRC5hO1xuICAgICAgd2t0LnJmID0gcGFyc2VGbG9hdCh3a3QuR0VPR0NTLkRBVFVNLlNQSEVST0lELnJmLCAxMCk7XG4gICAgfVxuICAgIGlmICh+d2t0LmRhdHVtQ29kZS5pbmRleE9mKCdvc2diXzE5MzYnKSkge1xuICAgICAgd2t0LmRhdHVtQ29kZSA9IFwib3NnYjM2XCI7XG4gICAgfVxuICB9XG4gIGlmICh3a3QuYiAmJiAhaXNGaW5pdGUod2t0LmIpKSB7XG4gICAgd2t0LmIgPSB3a3QuYTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRvTWV0ZXIoaW5wdXQpIHtcbiAgICB2YXIgcmF0aW8gPSB3a3QudG9fbWV0ZXIgfHwgMTtcbiAgICByZXR1cm4gcGFyc2VGbG9hdChpbnB1dCwgMTApICogcmF0aW87XG4gIH1cbiAgdmFyIHJlbmFtZXIgPSBmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIHJlbmFtZSh3a3QsIGEpO1xuICB9O1xuICB2YXIgbGlzdCA9IFtcbiAgICBbJ3N0YW5kYXJkX3BhcmFsbGVsXzEnLCAnU3RhbmRhcmRfUGFyYWxsZWxfMSddLFxuICAgIFsnc3RhbmRhcmRfcGFyYWxsZWxfMicsICdTdGFuZGFyZF9QYXJhbGxlbF8yJ10sXG4gICAgWydmYWxzZV9lYXN0aW5nJywgJ0ZhbHNlX0Vhc3RpbmcnXSxcbiAgICBbJ2ZhbHNlX25vcnRoaW5nJywgJ0ZhbHNlX05vcnRoaW5nJ10sXG4gICAgWydjZW50cmFsX21lcmlkaWFuJywgJ0NlbnRyYWxfTWVyaWRpYW4nXSxcbiAgICBbJ2xhdGl0dWRlX29mX29yaWdpbicsICdMYXRpdHVkZV9PZl9PcmlnaW4nXSxcbiAgICBbJ2xhdGl0dWRlX29mX29yaWdpbicsICdDZW50cmFsX1BhcmFsbGVsJ10sXG4gICAgWydzY2FsZV9mYWN0b3InLCAnU2NhbGVfRmFjdG9yJ10sXG4gICAgWydrMCcsICdzY2FsZV9mYWN0b3InXSxcbiAgICBbJ2xhdGl0dWRlX29mX2NlbnRlcicsICdMYXRpdHVkZV9vZl9jZW50ZXInXSxcbiAgICBbJ2xhdDAnLCAnbGF0aXR1ZGVfb2ZfY2VudGVyJywgZDJyXSxcbiAgICBbJ2xvbmdpdHVkZV9vZl9jZW50ZXInLCAnTG9uZ2l0dWRlX09mX0NlbnRlciddLFxuICAgIFsnbG9uZ2MnLCAnbG9uZ2l0dWRlX29mX2NlbnRlcicsIGQycl0sXG4gICAgWyd4MCcsICdmYWxzZV9lYXN0aW5nJywgdG9NZXRlcl0sXG4gICAgWyd5MCcsICdmYWxzZV9ub3J0aGluZycsIHRvTWV0ZXJdLFxuICAgIFsnbG9uZzAnLCAnY2VudHJhbF9tZXJpZGlhbicsIGQycl0sXG4gICAgWydsYXQwJywgJ2xhdGl0dWRlX29mX29yaWdpbicsIGQycl0sXG4gICAgWydsYXQwJywgJ3N0YW5kYXJkX3BhcmFsbGVsXzEnLCBkMnJdLFxuICAgIFsnbGF0MScsICdzdGFuZGFyZF9wYXJhbGxlbF8xJywgZDJyXSxcbiAgICBbJ2xhdDInLCAnc3RhbmRhcmRfcGFyYWxsZWxfMicsIGQycl0sXG4gICAgWydhbHBoYScsICdhemltdXRoJywgZDJyXSxcbiAgICBbJ3Nyc0NvZGUnLCAnbmFtZSddXG4gIF07XG4gIGxpc3QuZm9yRWFjaChyZW5hbWVyKTtcbiAgaWYgKCF3a3QubG9uZzAgJiYgd2t0LmxvbmdjICYmICh3a3QucHJvak5hbWUgPT09ICdBbGJlcnNfQ29uaWNfRXF1YWxfQXJlYScgfHwgd2t0LnByb2pOYW1lID09PSBcIkxhbWJlcnRfQXppbXV0aGFsX0VxdWFsX0FyZWFcIikpIHtcbiAgICB3a3QubG9uZzAgPSB3a3QubG9uZ2M7XG4gIH1cbiAgaWYgKCF3a3QubGF0X3RzICYmIHdrdC5sYXQxICYmICh3a3QucHJvak5hbWUgPT09ICdTdGVyZW9ncmFwaGljX1NvdXRoX1BvbGUnIHx8IHdrdC5wcm9qTmFtZSA9PT0gJ1BvbGFyIFN0ZXJlb2dyYXBoaWMgKHZhcmlhbnQgQiknKSkge1xuICAgIHdrdC5sYXQwID0gZDJyKHdrdC5sYXQxID4gMCA/IDkwIDogLTkwKTtcbiAgICB3a3QubGF0X3RzID0gd2t0LmxhdDE7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24od2t0LCBzZWxmKSB7XG4gIHZhciBsaXNwID0gSlNPTi5wYXJzZSgoXCIsXCIgKyB3a3QpLnJlcGxhY2UoL1xccypcXCxcXHMqKFtBLVpfMC05XSs/KShcXFspL2csICcsW1wiJDFcIiwnKS5zbGljZSgxKS5yZXBsYWNlKC9cXHMqXFwsXFxzKihbQS1aXzAtOV0rPylcXF0vZywgJyxcIiQxXCJdJykucmVwbGFjZSgvLFxcW1wiVkVSVENTXCIuKy8sJycpKTtcbiAgdmFyIHR5cGUgPSBsaXNwLnNoaWZ0KCk7XG4gIHZhciBuYW1lID0gbGlzcC5zaGlmdCgpO1xuICBsaXNwLnVuc2hpZnQoWyduYW1lJywgbmFtZV0pO1xuICBsaXNwLnVuc2hpZnQoWyd0eXBlJywgdHlwZV0pO1xuICBsaXNwLnVuc2hpZnQoJ291dHB1dCcpO1xuICB2YXIgb2JqID0ge307XG4gIHNFeHByKGxpc3AsIG9iaik7XG4gIGNsZWFuV0tUKG9iai5vdXRwdXQpO1xuICByZXR1cm4gZXh0ZW5kKHNlbGYsIG9iai5vdXRwdXQpO1xufTtcbiIsIlxuXG5cbi8qKlxuICogVVRNIHpvbmVzIGFyZSBncm91cGVkLCBhbmQgYXNzaWduZWQgdG8gb25lIG9mIGEgZ3JvdXAgb2YgNlxuICogc2V0cy5cbiAqXG4gKiB7aW50fSBAcHJpdmF0ZVxuICovXG52YXIgTlVNXzEwMEtfU0VUUyA9IDY7XG5cbi8qKlxuICogVGhlIGNvbHVtbiBsZXR0ZXJzIChmb3IgZWFzdGluZykgb2YgdGhlIGxvd2VyIGxlZnQgdmFsdWUsIHBlclxuICogc2V0LlxuICpcbiAqIHtzdHJpbmd9IEBwcml2YXRlXG4gKi9cbnZhciBTRVRfT1JJR0lOX0NPTFVNTl9MRVRURVJTID0gJ0FKU0FKUyc7XG5cbi8qKlxuICogVGhlIHJvdyBsZXR0ZXJzIChmb3Igbm9ydGhpbmcpIG9mIHRoZSBsb3dlciBsZWZ0IHZhbHVlLCBwZXJcbiAqIHNldC5cbiAqXG4gKiB7c3RyaW5nfSBAcHJpdmF0ZVxuICovXG52YXIgU0VUX09SSUdJTl9ST1dfTEVUVEVSUyA9ICdBRkFGQUYnO1xuXG52YXIgQSA9IDY1OyAvLyBBXG52YXIgSSA9IDczOyAvLyBJXG52YXIgTyA9IDc5OyAvLyBPXG52YXIgViA9IDg2OyAvLyBWXG52YXIgWiA9IDkwOyAvLyBaXG5cbi8qKlxuICogQ29udmVyc2lvbiBvZiBsYXQvbG9uIHRvIE1HUlMuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGxsIE9iamVjdCBsaXRlcmFsIHdpdGggbGF0IGFuZCBsb24gcHJvcGVydGllcyBvbiBhXG4gKiAgICAgV0dTODQgZWxsaXBzb2lkLlxuICogQHBhcmFtIHtpbnR9IGFjY3VyYWN5IEFjY3VyYWN5IGluIGRpZ2l0cyAoNSBmb3IgMSBtLCA0IGZvciAxMCBtLCAzIGZvclxuICogICAgICAxMDAgbSwgMiBmb3IgMTAwMCBtIG9yIDEgZm9yIDEwMDAwIG0pLiBPcHRpb25hbCwgZGVmYXVsdCBpcyA1LlxuICogQHJldHVybiB7c3RyaW5nfSB0aGUgTUdSUyBzdHJpbmcgZm9yIHRoZSBnaXZlbiBsb2NhdGlvbiBhbmQgYWNjdXJhY3kuXG4gKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKGxsLCBhY2N1cmFjeSkge1xuICBhY2N1cmFjeSA9IGFjY3VyYWN5IHx8IDU7IC8vIGRlZmF1bHQgYWNjdXJhY3kgMW1cbiAgcmV0dXJuIGVuY29kZShMTHRvVVRNKHtcbiAgICBsYXQ6IGxsWzFdLFxuICAgIGxvbjogbGxbMF1cbiAgfSksIGFjY3VyYWN5KTtcbn07XG5cbi8qKlxuICogQ29udmVyc2lvbiBvZiBNR1JTIHRvIGxhdC9sb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1ncnMgTUdSUyBzdHJpbmcuXG4gKiBAcmV0dXJuIHthcnJheX0gQW4gYXJyYXkgd2l0aCBsZWZ0IChsb25naXR1ZGUpLCBib3R0b20gKGxhdGl0dWRlKSwgcmlnaHRcbiAqICAgICAobG9uZ2l0dWRlKSBhbmQgdG9wIChsYXRpdHVkZSkgdmFsdWVzIGluIFdHUzg0LCByZXByZXNlbnRpbmcgdGhlXG4gKiAgICAgYm91bmRpbmcgYm94IGZvciB0aGUgcHJvdmlkZWQgTUdSUyByZWZlcmVuY2UuXG4gKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKG1ncnMpIHtcbiAgdmFyIGJib3ggPSBVVE10b0xMKGRlY29kZShtZ3JzLnRvVXBwZXJDYXNlKCkpKTtcbiAgaWYgKGJib3gubGF0ICYmIGJib3gubG9uKSB7XG4gICAgcmV0dXJuIFtiYm94LmxvbiwgYmJveC5sYXQsIGJib3gubG9uLCBiYm94LmxhdF07XG4gIH1cbiAgcmV0dXJuIFtiYm94LmxlZnQsIGJib3guYm90dG9tLCBiYm94LnJpZ2h0LCBiYm94LnRvcF07XG59O1xuXG5leHBvcnRzLnRvUG9pbnQgPSBmdW5jdGlvbihtZ3JzKSB7XG4gIHZhciBiYm94ID0gVVRNdG9MTChkZWNvZGUobWdycy50b1VwcGVyQ2FzZSgpKSk7XG4gIGlmIChiYm94LmxhdCAmJiBiYm94Lmxvbikge1xuICAgIHJldHVybiBbYmJveC5sb24sIGJib3gubGF0XTtcbiAgfVxuICByZXR1cm4gWyhiYm94LmxlZnQgKyBiYm94LnJpZ2h0KSAvIDIsIChiYm94LnRvcCArIGJib3guYm90dG9tKSAvIDJdO1xufTtcbi8qKlxuICogQ29udmVyc2lvbiBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IGRlZyB0aGUgYW5nbGUgaW4gZGVncmVlcy5cbiAqIEByZXR1cm4ge251bWJlcn0gdGhlIGFuZ2xlIGluIHJhZGlhbnMuXG4gKi9cbmZ1bmN0aW9uIGRlZ1RvUmFkKGRlZykge1xuICByZXR1cm4gKGRlZyAqIChNYXRoLlBJIC8gMTgwLjApKTtcbn1cblxuLyoqXG4gKiBDb252ZXJzaW9uIGZyb20gcmFkaWFucyB0byBkZWdyZWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIHRoZSBhbmdsZSBpbiByYWRpYW5zLlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgYW5nbGUgaW4gZGVncmVlcy5cbiAqL1xuZnVuY3Rpb24gcmFkVG9EZWcocmFkKSB7XG4gIHJldHVybiAoMTgwLjAgKiAocmFkIC8gTWF0aC5QSSkpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgc2V0IG9mIExvbmdpdHVkZSBhbmQgTGF0aXR1ZGUgY28tb3JkaW5hdGVzIHRvIFVUTVxuICogdXNpbmcgdGhlIFdHUzg0IGVsbGlwc29pZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGxsIE9iamVjdCBsaXRlcmFsIHdpdGggbGF0IGFuZCBsb24gcHJvcGVydGllc1xuICogICAgIHJlcHJlc2VudGluZyB0aGUgV0dTODQgY29vcmRpbmF0ZSB0byBiZSBjb252ZXJ0ZWQuXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCBsaXRlcmFsIGNvbnRhaW5pbmcgdGhlIFVUTSB2YWx1ZSB3aXRoIGVhc3RpbmcsXG4gKiAgICAgbm9ydGhpbmcsIHpvbmVOdW1iZXIgYW5kIHpvbmVMZXR0ZXIgcHJvcGVydGllcywgYW5kIGFuIG9wdGlvbmFsXG4gKiAgICAgYWNjdXJhY3kgcHJvcGVydHkgaW4gZGlnaXRzLiBSZXR1cm5zIG51bGwgaWYgdGhlIGNvbnZlcnNpb24gZmFpbGVkLlxuICovXG5mdW5jdGlvbiBMTHRvVVRNKGxsKSB7XG4gIHZhciBMYXQgPSBsbC5sYXQ7XG4gIHZhciBMb25nID0gbGwubG9uO1xuICB2YXIgYSA9IDYzNzgxMzcuMDsgLy9lbGxpcC5yYWRpdXM7XG4gIHZhciBlY2NTcXVhcmVkID0gMC4wMDY2OTQzODsgLy9lbGxpcC5lY2NzcTtcbiAgdmFyIGswID0gMC45OTk2O1xuICB2YXIgTG9uZ09yaWdpbjtcbiAgdmFyIGVjY1ByaW1lU3F1YXJlZDtcbiAgdmFyIE4sIFQsIEMsIEEsIE07XG4gIHZhciBMYXRSYWQgPSBkZWdUb1JhZChMYXQpO1xuICB2YXIgTG9uZ1JhZCA9IGRlZ1RvUmFkKExvbmcpO1xuICB2YXIgTG9uZ09yaWdpblJhZDtcbiAgdmFyIFpvbmVOdW1iZXI7XG4gIC8vIChpbnQpXG4gIFpvbmVOdW1iZXIgPSBNYXRoLmZsb29yKChMb25nICsgMTgwKSAvIDYpICsgMTtcblxuICAvL01ha2Ugc3VyZSB0aGUgbG9uZ2l0dWRlIDE4MC4wMCBpcyBpbiBab25lIDYwXG4gIGlmIChMb25nID09PSAxODApIHtcbiAgICBab25lTnVtYmVyID0gNjA7XG4gIH1cblxuICAvLyBTcGVjaWFsIHpvbmUgZm9yIE5vcndheVxuICBpZiAoTGF0ID49IDU2LjAgJiYgTGF0IDwgNjQuMCAmJiBMb25nID49IDMuMCAmJiBMb25nIDwgMTIuMCkge1xuICAgIFpvbmVOdW1iZXIgPSAzMjtcbiAgfVxuXG4gIC8vIFNwZWNpYWwgem9uZXMgZm9yIFN2YWxiYXJkXG4gIGlmIChMYXQgPj0gNzIuMCAmJiBMYXQgPCA4NC4wKSB7XG4gICAgaWYgKExvbmcgPj0gMC4wICYmIExvbmcgPCA5LjApIHtcbiAgICAgIFpvbmVOdW1iZXIgPSAzMTtcbiAgICB9XG4gICAgZWxzZSBpZiAoTG9uZyA+PSA5LjAgJiYgTG9uZyA8IDIxLjApIHtcbiAgICAgIFpvbmVOdW1iZXIgPSAzMztcbiAgICB9XG4gICAgZWxzZSBpZiAoTG9uZyA+PSAyMS4wICYmIExvbmcgPCAzMy4wKSB7XG4gICAgICBab25lTnVtYmVyID0gMzU7XG4gICAgfVxuICAgIGVsc2UgaWYgKExvbmcgPj0gMzMuMCAmJiBMb25nIDwgNDIuMCkge1xuICAgICAgWm9uZU51bWJlciA9IDM3O1xuICAgIH1cbiAgfVxuXG4gIExvbmdPcmlnaW4gPSAoWm9uZU51bWJlciAtIDEpICogNiAtIDE4MCArIDM7IC8vKzMgcHV0cyBvcmlnaW5cbiAgLy8gaW4gbWlkZGxlIG9mXG4gIC8vIHpvbmVcbiAgTG9uZ09yaWdpblJhZCA9IGRlZ1RvUmFkKExvbmdPcmlnaW4pO1xuXG4gIGVjY1ByaW1lU3F1YXJlZCA9IChlY2NTcXVhcmVkKSAvICgxIC0gZWNjU3F1YXJlZCk7XG5cbiAgTiA9IGEgLyBNYXRoLnNxcnQoMSAtIGVjY1NxdWFyZWQgKiBNYXRoLnNpbihMYXRSYWQpICogTWF0aC5zaW4oTGF0UmFkKSk7XG4gIFQgPSBNYXRoLnRhbihMYXRSYWQpICogTWF0aC50YW4oTGF0UmFkKTtcbiAgQyA9IGVjY1ByaW1lU3F1YXJlZCAqIE1hdGguY29zKExhdFJhZCkgKiBNYXRoLmNvcyhMYXRSYWQpO1xuICBBID0gTWF0aC5jb3MoTGF0UmFkKSAqIChMb25nUmFkIC0gTG9uZ09yaWdpblJhZCk7XG5cbiAgTSA9IGEgKiAoKDEgLSBlY2NTcXVhcmVkIC8gNCAtIDMgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDY0IC0gNSAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDI1NikgKiBMYXRSYWQgLSAoMyAqIGVjY1NxdWFyZWQgLyA4ICsgMyAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkIC8gMzIgKyA0NSAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDEwMjQpICogTWF0aC5zaW4oMiAqIExhdFJhZCkgKyAoMTUgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDI1NiArIDQ1ICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkIC8gMTAyNCkgKiBNYXRoLnNpbig0ICogTGF0UmFkKSAtICgzNSAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDMwNzIpICogTWF0aC5zaW4oNiAqIExhdFJhZCkpO1xuXG4gIHZhciBVVE1FYXN0aW5nID0gKGswICogTiAqIChBICsgKDEgLSBUICsgQykgKiBBICogQSAqIEEgLyA2LjAgKyAoNSAtIDE4ICogVCArIFQgKiBUICsgNzIgKiBDIC0gNTggKiBlY2NQcmltZVNxdWFyZWQpICogQSAqIEEgKiBBICogQSAqIEEgLyAxMjAuMCkgKyA1MDAwMDAuMCk7XG5cbiAgdmFyIFVUTU5vcnRoaW5nID0gKGswICogKE0gKyBOICogTWF0aC50YW4oTGF0UmFkKSAqIChBICogQSAvIDIgKyAoNSAtIFQgKyA5ICogQyArIDQgKiBDICogQykgKiBBICogQSAqIEEgKiBBIC8gMjQuMCArICg2MSAtIDU4ICogVCArIFQgKiBUICsgNjAwICogQyAtIDMzMCAqIGVjY1ByaW1lU3F1YXJlZCkgKiBBICogQSAqIEEgKiBBICogQSAqIEEgLyA3MjAuMCkpKTtcbiAgaWYgKExhdCA8IDAuMCkge1xuICAgIFVUTU5vcnRoaW5nICs9IDEwMDAwMDAwLjA7IC8vMTAwMDAwMDAgbWV0ZXIgb2Zmc2V0IGZvclxuICAgIC8vIHNvdXRoZXJuIGhlbWlzcGhlcmVcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbm9ydGhpbmc6IE1hdGgucm91bmQoVVRNTm9ydGhpbmcpLFxuICAgIGVhc3Rpbmc6IE1hdGgucm91bmQoVVRNRWFzdGluZyksXG4gICAgem9uZU51bWJlcjogWm9uZU51bWJlcixcbiAgICB6b25lTGV0dGVyOiBnZXRMZXR0ZXJEZXNpZ25hdG9yKExhdClcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBVVE0gY29vcmRzIHRvIGxhdC9sb25nLCB1c2luZyB0aGUgV0dTODQgZWxsaXBzb2lkLiBUaGlzIGlzIGEgY29udmVuaWVuY2VcbiAqIGNsYXNzIHdoZXJlIHRoZSBab25lIGNhbiBiZSBzcGVjaWZpZWQgYXMgYSBzaW5nbGUgc3RyaW5nIGVnLlwiNjBOXCIgd2hpY2hcbiAqIGlzIHRoZW4gYnJva2VuIGRvd24gaW50byB0aGUgWm9uZU51bWJlciBhbmQgWm9uZUxldHRlci5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IHV0bSBBbiBvYmplY3QgbGl0ZXJhbCB3aXRoIG5vcnRoaW5nLCBlYXN0aW5nLCB6b25lTnVtYmVyXG4gKiAgICAgYW5kIHpvbmVMZXR0ZXIgcHJvcGVydGllcy4gSWYgYW4gb3B0aW9uYWwgYWNjdXJhY3kgcHJvcGVydHkgaXNcbiAqICAgICBwcm92aWRlZCAoaW4gbWV0ZXJzKSwgYSBib3VuZGluZyBib3ggd2lsbCBiZSByZXR1cm5lZCBpbnN0ZWFkIG9mXG4gKiAgICAgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZS5cbiAqIEByZXR1cm4ge29iamVjdH0gQW4gb2JqZWN0IGxpdGVyYWwgY29udGFpbmluZyBlaXRoZXIgbGF0IGFuZCBsb24gdmFsdWVzXG4gKiAgICAgKGlmIG5vIGFjY3VyYWN5IHdhcyBwcm92aWRlZCksIG9yIHRvcCwgcmlnaHQsIGJvdHRvbSBhbmQgbGVmdCB2YWx1ZXNcbiAqICAgICBmb3IgdGhlIGJvdW5kaW5nIGJveCBjYWxjdWxhdGVkIGFjY29yZGluZyB0byB0aGUgcHJvdmlkZWQgYWNjdXJhY3kuXG4gKiAgICAgUmV0dXJucyBudWxsIGlmIHRoZSBjb252ZXJzaW9uIGZhaWxlZC5cbiAqL1xuZnVuY3Rpb24gVVRNdG9MTCh1dG0pIHtcblxuICB2YXIgVVRNTm9ydGhpbmcgPSB1dG0ubm9ydGhpbmc7XG4gIHZhciBVVE1FYXN0aW5nID0gdXRtLmVhc3Rpbmc7XG4gIHZhciB6b25lTGV0dGVyID0gdXRtLnpvbmVMZXR0ZXI7XG4gIHZhciB6b25lTnVtYmVyID0gdXRtLnpvbmVOdW1iZXI7XG4gIC8vIGNoZWNrIHRoZSBab25lTnVtbWJlciBpcyB2YWxpZFxuICBpZiAoem9uZU51bWJlciA8IDAgfHwgem9uZU51bWJlciA+IDYwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgazAgPSAwLjk5OTY7XG4gIHZhciBhID0gNjM3ODEzNy4wOyAvL2VsbGlwLnJhZGl1cztcbiAgdmFyIGVjY1NxdWFyZWQgPSAwLjAwNjY5NDM4OyAvL2VsbGlwLmVjY3NxO1xuICB2YXIgZWNjUHJpbWVTcXVhcmVkO1xuICB2YXIgZTEgPSAoMSAtIE1hdGguc3FydCgxIC0gZWNjU3F1YXJlZCkpIC8gKDEgKyBNYXRoLnNxcnQoMSAtIGVjY1NxdWFyZWQpKTtcbiAgdmFyIE4xLCBUMSwgQzEsIFIxLCBELCBNO1xuICB2YXIgTG9uZ09yaWdpbjtcbiAgdmFyIG11LCBwaGkxUmFkO1xuXG4gIC8vIHJlbW92ZSA1MDAsMDAwIG1ldGVyIG9mZnNldCBmb3IgbG9uZ2l0dWRlXG4gIHZhciB4ID0gVVRNRWFzdGluZyAtIDUwMDAwMC4wO1xuICB2YXIgeSA9IFVUTU5vcnRoaW5nO1xuXG4gIC8vIFdlIG11c3Qga25vdyBzb21laG93IGlmIHdlIGFyZSBpbiB0aGUgTm9ydGhlcm4gb3IgU291dGhlcm5cbiAgLy8gaGVtaXNwaGVyZSwgdGhpcyBpcyB0aGUgb25seSB0aW1lIHdlIHVzZSB0aGUgbGV0dGVyIFNvIGV2ZW5cbiAgLy8gaWYgdGhlIFpvbmUgbGV0dGVyIGlzbid0IGV4YWN0bHkgY29ycmVjdCBpdCBzaG91bGQgaW5kaWNhdGVcbiAgLy8gdGhlIGhlbWlzcGhlcmUgY29ycmVjdGx5XG4gIGlmICh6b25lTGV0dGVyIDwgJ04nKSB7XG4gICAgeSAtPSAxMDAwMDAwMC4wOyAvLyByZW1vdmUgMTAsMDAwLDAwMCBtZXRlciBvZmZzZXQgdXNlZFxuICAgIC8vIGZvciBzb3V0aGVybiBoZW1pc3BoZXJlXG4gIH1cblxuICAvLyBUaGVyZSBhcmUgNjAgem9uZXMgd2l0aCB6b25lIDEgYmVpbmcgYXQgV2VzdCAtMTgwIHRvIC0xNzRcbiAgTG9uZ09yaWdpbiA9ICh6b25lTnVtYmVyIC0gMSkgKiA2IC0gMTgwICsgMzsgLy8gKzMgcHV0cyBvcmlnaW5cbiAgLy8gaW4gbWlkZGxlIG9mXG4gIC8vIHpvbmVcblxuICBlY2NQcmltZVNxdWFyZWQgPSAoZWNjU3F1YXJlZCkgLyAoMSAtIGVjY1NxdWFyZWQpO1xuXG4gIE0gPSB5IC8gazA7XG4gIG11ID0gTSAvIChhICogKDEgLSBlY2NTcXVhcmVkIC8gNCAtIDMgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDY0IC0gNSAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDI1NikpO1xuXG4gIHBoaTFSYWQgPSBtdSArICgzICogZTEgLyAyIC0gMjcgKiBlMSAqIGUxICogZTEgLyAzMikgKiBNYXRoLnNpbigyICogbXUpICsgKDIxICogZTEgKiBlMSAvIDE2IC0gNTUgKiBlMSAqIGUxICogZTEgKiBlMSAvIDMyKSAqIE1hdGguc2luKDQgKiBtdSkgKyAoMTUxICogZTEgKiBlMSAqIGUxIC8gOTYpICogTWF0aC5zaW4oNiAqIG11KTtcbiAgLy8gZG91YmxlIHBoaTEgPSBQcm9qTWF0aC5yYWRUb0RlZyhwaGkxUmFkKTtcblxuICBOMSA9IGEgLyBNYXRoLnNxcnQoMSAtIGVjY1NxdWFyZWQgKiBNYXRoLnNpbihwaGkxUmFkKSAqIE1hdGguc2luKHBoaTFSYWQpKTtcbiAgVDEgPSBNYXRoLnRhbihwaGkxUmFkKSAqIE1hdGgudGFuKHBoaTFSYWQpO1xuICBDMSA9IGVjY1ByaW1lU3F1YXJlZCAqIE1hdGguY29zKHBoaTFSYWQpICogTWF0aC5jb3MocGhpMVJhZCk7XG4gIFIxID0gYSAqICgxIC0gZWNjU3F1YXJlZCkgLyBNYXRoLnBvdygxIC0gZWNjU3F1YXJlZCAqIE1hdGguc2luKHBoaTFSYWQpICogTWF0aC5zaW4ocGhpMVJhZCksIDEuNSk7XG4gIEQgPSB4IC8gKE4xICogazApO1xuXG4gIHZhciBsYXQgPSBwaGkxUmFkIC0gKE4xICogTWF0aC50YW4ocGhpMVJhZCkgLyBSMSkgKiAoRCAqIEQgLyAyIC0gKDUgKyAzICogVDEgKyAxMCAqIEMxIC0gNCAqIEMxICogQzEgLSA5ICogZWNjUHJpbWVTcXVhcmVkKSAqIEQgKiBEICogRCAqIEQgLyAyNCArICg2MSArIDkwICogVDEgKyAyOTggKiBDMSArIDQ1ICogVDEgKiBUMSAtIDI1MiAqIGVjY1ByaW1lU3F1YXJlZCAtIDMgKiBDMSAqIEMxKSAqIEQgKiBEICogRCAqIEQgKiBEICogRCAvIDcyMCk7XG4gIGxhdCA9IHJhZFRvRGVnKGxhdCk7XG5cbiAgdmFyIGxvbiA9IChEIC0gKDEgKyAyICogVDEgKyBDMSkgKiBEICogRCAqIEQgLyA2ICsgKDUgLSAyICogQzEgKyAyOCAqIFQxIC0gMyAqIEMxICogQzEgKyA4ICogZWNjUHJpbWVTcXVhcmVkICsgMjQgKiBUMSAqIFQxKSAqIEQgKiBEICogRCAqIEQgKiBEIC8gMTIwKSAvIE1hdGguY29zKHBoaTFSYWQpO1xuICBsb24gPSBMb25nT3JpZ2luICsgcmFkVG9EZWcobG9uKTtcblxuICB2YXIgcmVzdWx0O1xuICBpZiAodXRtLmFjY3VyYWN5KSB7XG4gICAgdmFyIHRvcFJpZ2h0ID0gVVRNdG9MTCh7XG4gICAgICBub3J0aGluZzogdXRtLm5vcnRoaW5nICsgdXRtLmFjY3VyYWN5LFxuICAgICAgZWFzdGluZzogdXRtLmVhc3RpbmcgKyB1dG0uYWNjdXJhY3ksXG4gICAgICB6b25lTGV0dGVyOiB1dG0uem9uZUxldHRlcixcbiAgICAgIHpvbmVOdW1iZXI6IHV0bS56b25lTnVtYmVyXG4gICAgfSk7XG4gICAgcmVzdWx0ID0ge1xuICAgICAgdG9wOiB0b3BSaWdodC5sYXQsXG4gICAgICByaWdodDogdG9wUmlnaHQubG9uLFxuICAgICAgYm90dG9tOiBsYXQsXG4gICAgICBsZWZ0OiBsb25cbiAgICB9O1xuICB9XG4gIGVsc2Uge1xuICAgIHJlc3VsdCA9IHtcbiAgICAgIGxhdDogbGF0LFxuICAgICAgbG9uOiBsb25cbiAgICB9O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgTUdSUyBsZXR0ZXIgZGVzaWduYXRvciBmb3IgdGhlIGdpdmVuIGxhdGl0dWRlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gbGF0IFRoZSBsYXRpdHVkZSBpbiBXR1M4NCB0byBnZXQgdGhlIGxldHRlciBkZXNpZ25hdG9yXG4gKiAgICAgZm9yLlxuICogQHJldHVybiB7Y2hhcn0gVGhlIGxldHRlciBkZXNpZ25hdG9yLlxuICovXG5mdW5jdGlvbiBnZXRMZXR0ZXJEZXNpZ25hdG9yKGxhdCkge1xuICAvL1RoaXMgaXMgaGVyZSBhcyBhbiBlcnJvciBmbGFnIHRvIHNob3cgdGhhdCB0aGUgTGF0aXR1ZGUgaXNcbiAgLy9vdXRzaWRlIE1HUlMgbGltaXRzXG4gIHZhciBMZXR0ZXJEZXNpZ25hdG9yID0gJ1onO1xuXG4gIGlmICgoODQgPj0gbGF0KSAmJiAobGF0ID49IDcyKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnWCc7XG4gIH1cbiAgZWxzZSBpZiAoKDcyID4gbGF0KSAmJiAobGF0ID49IDY0KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnVyc7XG4gIH1cbiAgZWxzZSBpZiAoKDY0ID4gbGF0KSAmJiAobGF0ID49IDU2KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnVic7XG4gIH1cbiAgZWxzZSBpZiAoKDU2ID4gbGF0KSAmJiAobGF0ID49IDQ4KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnVSc7XG4gIH1cbiAgZWxzZSBpZiAoKDQ4ID4gbGF0KSAmJiAobGF0ID49IDQwKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnVCc7XG4gIH1cbiAgZWxzZSBpZiAoKDQwID4gbGF0KSAmJiAobGF0ID49IDMyKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnUyc7XG4gIH1cbiAgZWxzZSBpZiAoKDMyID4gbGF0KSAmJiAobGF0ID49IDI0KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnUic7XG4gIH1cbiAgZWxzZSBpZiAoKDI0ID4gbGF0KSAmJiAobGF0ID49IDE2KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnUSc7XG4gIH1cbiAgZWxzZSBpZiAoKDE2ID4gbGF0KSAmJiAobGF0ID49IDgpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdQJztcbiAgfVxuICBlbHNlIGlmICgoOCA+IGxhdCkgJiYgKGxhdCA+PSAwKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnTic7XG4gIH1cbiAgZWxzZSBpZiAoKDAgPiBsYXQpICYmIChsYXQgPj0gLTgpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdNJztcbiAgfVxuICBlbHNlIGlmICgoLTggPiBsYXQpICYmIChsYXQgPj0gLTE2KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnTCc7XG4gIH1cbiAgZWxzZSBpZiAoKC0xNiA+IGxhdCkgJiYgKGxhdCA+PSAtMjQpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdLJztcbiAgfVxuICBlbHNlIGlmICgoLTI0ID4gbGF0KSAmJiAobGF0ID49IC0zMikpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0onO1xuICB9XG4gIGVsc2UgaWYgKCgtMzIgPiBsYXQpICYmIChsYXQgPj0gLTQwKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnSCc7XG4gIH1cbiAgZWxzZSBpZiAoKC00MCA+IGxhdCkgJiYgKGxhdCA+PSAtNDgpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdHJztcbiAgfVxuICBlbHNlIGlmICgoLTQ4ID4gbGF0KSAmJiAobGF0ID49IC01NikpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0YnO1xuICB9XG4gIGVsc2UgaWYgKCgtNTYgPiBsYXQpICYmIChsYXQgPj0gLTY0KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnRSc7XG4gIH1cbiAgZWxzZSBpZiAoKC02NCA+IGxhdCkgJiYgKGxhdCA+PSAtNzIpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdEJztcbiAgfVxuICBlbHNlIGlmICgoLTcyID4gbGF0KSAmJiAobGF0ID49IC04MCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0MnO1xuICB9XG4gIHJldHVybiBMZXR0ZXJEZXNpZ25hdG9yO1xufVxuXG4vKipcbiAqIEVuY29kZXMgYSBVVE0gbG9jYXRpb24gYXMgTUdSUyBzdHJpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSB1dG0gQW4gb2JqZWN0IGxpdGVyYWwgd2l0aCBlYXN0aW5nLCBub3J0aGluZyxcbiAqICAgICB6b25lTGV0dGVyLCB6b25lTnVtYmVyXG4gKiBAcGFyYW0ge251bWJlcn0gYWNjdXJhY3kgQWNjdXJhY3kgaW4gZGlnaXRzICgxLTUpLlxuICogQHJldHVybiB7c3RyaW5nfSBNR1JTIHN0cmluZyBmb3IgdGhlIGdpdmVuIFVUTSBsb2NhdGlvbi5cbiAqL1xuZnVuY3Rpb24gZW5jb2RlKHV0bSwgYWNjdXJhY3kpIHtcbiAgLy8gcHJlcGVuZCB3aXRoIGxlYWRpbmcgemVyb2VzXG4gIHZhciBzZWFzdGluZyA9IFwiMDAwMDBcIiArIHV0bS5lYXN0aW5nLFxuICAgIHNub3J0aGluZyA9IFwiMDAwMDBcIiArIHV0bS5ub3J0aGluZztcblxuICByZXR1cm4gdXRtLnpvbmVOdW1iZXIgKyB1dG0uem9uZUxldHRlciArIGdldDEwMGtJRCh1dG0uZWFzdGluZywgdXRtLm5vcnRoaW5nLCB1dG0uem9uZU51bWJlcikgKyBzZWFzdGluZy5zdWJzdHIoc2Vhc3RpbmcubGVuZ3RoIC0gNSwgYWNjdXJhY3kpICsgc25vcnRoaW5nLnN1YnN0cihzbm9ydGhpbmcubGVuZ3RoIC0gNSwgYWNjdXJhY3kpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgdHdvIGxldHRlciAxMDBrIGRlc2lnbmF0b3IgZm9yIGEgZ2l2ZW4gVVRNIGVhc3RpbmcsXG4gKiBub3J0aGluZyBhbmQgem9uZSBudW1iZXIgdmFsdWUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBlYXN0aW5nXG4gKiBAcGFyYW0ge251bWJlcn0gbm9ydGhpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSB6b25lTnVtYmVyXG4gKiBAcmV0dXJuIHRoZSB0d28gbGV0dGVyIDEwMGsgZGVzaWduYXRvciBmb3IgdGhlIGdpdmVuIFVUTSBsb2NhdGlvbi5cbiAqL1xuZnVuY3Rpb24gZ2V0MTAwa0lEKGVhc3RpbmcsIG5vcnRoaW5nLCB6b25lTnVtYmVyKSB7XG4gIHZhciBzZXRQYXJtID0gZ2V0MTAwa1NldEZvclpvbmUoem9uZU51bWJlcik7XG4gIHZhciBzZXRDb2x1bW4gPSBNYXRoLmZsb29yKGVhc3RpbmcgLyAxMDAwMDApO1xuICB2YXIgc2V0Um93ID0gTWF0aC5mbG9vcihub3J0aGluZyAvIDEwMDAwMCkgJSAyMDtcbiAgcmV0dXJuIGdldExldHRlcjEwMGtJRChzZXRDb2x1bW4sIHNldFJvdywgc2V0UGFybSk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBVVE0gem9uZSBudW1iZXIsIGZpZ3VyZSBvdXQgdGhlIE1HUlMgMTAwSyBzZXQgaXQgaXMgaW4uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBpIEFuIFVUTSB6b25lIG51bWJlci5cbiAqIEByZXR1cm4ge251bWJlcn0gdGhlIDEwMGsgc2V0IHRoZSBVVE0gem9uZSBpcyBpbi5cbiAqL1xuZnVuY3Rpb24gZ2V0MTAwa1NldEZvclpvbmUoaSkge1xuICB2YXIgc2V0UGFybSA9IGkgJSBOVU1fMTAwS19TRVRTO1xuICBpZiAoc2V0UGFybSA9PT0gMCkge1xuICAgIHNldFBhcm0gPSBOVU1fMTAwS19TRVRTO1xuICB9XG5cbiAgcmV0dXJuIHNldFBhcm07XG59XG5cbi8qKlxuICogR2V0IHRoZSB0d28tbGV0dGVyIE1HUlMgMTAwayBkZXNpZ25hdG9yIGdpdmVuIGluZm9ybWF0aW9uXG4gKiB0cmFuc2xhdGVkIGZyb20gdGhlIFVUTSBub3J0aGluZywgZWFzdGluZyBhbmQgem9uZSBudW1iZXIuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW4gdGhlIGNvbHVtbiBpbmRleCBhcyBpdCByZWxhdGVzIHRvIHRoZSBNR1JTXG4gKiAgICAgICAgMTAwayBzZXQgc3ByZWFkc2hlZXQsIGNyZWF0ZWQgZnJvbSB0aGUgVVRNIGVhc3RpbmcuXG4gKiAgICAgICAgVmFsdWVzIGFyZSAxLTguXG4gKiBAcGFyYW0ge251bWJlcn0gcm93IHRoZSByb3cgaW5kZXggYXMgaXQgcmVsYXRlcyB0byB0aGUgTUdSUyAxMDBrIHNldFxuICogICAgICAgIHNwcmVhZHNoZWV0LCBjcmVhdGVkIGZyb20gdGhlIFVUTSBub3J0aGluZyB2YWx1ZS4gVmFsdWVzXG4gKiAgICAgICAgYXJlIGZyb20gMC0xOS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBwYXJtIHRoZSBzZXQgYmxvY2ssIGFzIGl0IHJlbGF0ZXMgdG8gdGhlIE1HUlMgMTAwayBzZXRcbiAqICAgICAgICBzcHJlYWRzaGVldCwgY3JlYXRlZCBmcm9tIHRoZSBVVE0gem9uZS4gVmFsdWVzIGFyZSBmcm9tXG4gKiAgICAgICAgMS02MC5cbiAqIEByZXR1cm4gdHdvIGxldHRlciBNR1JTIDEwMGsgY29kZS5cbiAqL1xuZnVuY3Rpb24gZ2V0TGV0dGVyMTAwa0lEKGNvbHVtbiwgcm93LCBwYXJtKSB7XG4gIC8vIGNvbE9yaWdpbiBhbmQgcm93T3JpZ2luIGFyZSB0aGUgbGV0dGVycyBhdCB0aGUgb3JpZ2luIG9mIHRoZSBzZXRcbiAgdmFyIGluZGV4ID0gcGFybSAtIDE7XG4gIHZhciBjb2xPcmlnaW4gPSBTRVRfT1JJR0lOX0NPTFVNTl9MRVRURVJTLmNoYXJDb2RlQXQoaW5kZXgpO1xuICB2YXIgcm93T3JpZ2luID0gU0VUX09SSUdJTl9ST1dfTEVUVEVSUy5jaGFyQ29kZUF0KGluZGV4KTtcblxuICAvLyBjb2xJbnQgYW5kIHJvd0ludCBhcmUgdGhlIGxldHRlcnMgdG8gYnVpbGQgdG8gcmV0dXJuXG4gIHZhciBjb2xJbnQgPSBjb2xPcmlnaW4gKyBjb2x1bW4gLSAxO1xuICB2YXIgcm93SW50ID0gcm93T3JpZ2luICsgcm93O1xuICB2YXIgcm9sbG92ZXIgPSBmYWxzZTtcblxuICBpZiAoY29sSW50ID4gWikge1xuICAgIGNvbEludCA9IGNvbEludCAtIFogKyBBIC0gMTtcbiAgICByb2xsb3ZlciA9IHRydWU7XG4gIH1cblxuICBpZiAoY29sSW50ID09PSBJIHx8IChjb2xPcmlnaW4gPCBJICYmIGNvbEludCA+IEkpIHx8ICgoY29sSW50ID4gSSB8fCBjb2xPcmlnaW4gPCBJKSAmJiByb2xsb3ZlcikpIHtcbiAgICBjb2xJbnQrKztcbiAgfVxuXG4gIGlmIChjb2xJbnQgPT09IE8gfHwgKGNvbE9yaWdpbiA8IE8gJiYgY29sSW50ID4gTykgfHwgKChjb2xJbnQgPiBPIHx8IGNvbE9yaWdpbiA8IE8pICYmIHJvbGxvdmVyKSkge1xuICAgIGNvbEludCsrO1xuXG4gICAgaWYgKGNvbEludCA9PT0gSSkge1xuICAgICAgY29sSW50Kys7XG4gICAgfVxuICB9XG5cbiAgaWYgKGNvbEludCA+IFopIHtcbiAgICBjb2xJbnQgPSBjb2xJbnQgLSBaICsgQSAtIDE7XG4gIH1cblxuICBpZiAocm93SW50ID4gVikge1xuICAgIHJvd0ludCA9IHJvd0ludCAtIFYgKyBBIC0gMTtcbiAgICByb2xsb3ZlciA9IHRydWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgcm9sbG92ZXIgPSBmYWxzZTtcbiAgfVxuXG4gIGlmICgoKHJvd0ludCA9PT0gSSkgfHwgKChyb3dPcmlnaW4gPCBJKSAmJiAocm93SW50ID4gSSkpKSB8fCAoKChyb3dJbnQgPiBJKSB8fCAocm93T3JpZ2luIDwgSSkpICYmIHJvbGxvdmVyKSkge1xuICAgIHJvd0ludCsrO1xuICB9XG5cbiAgaWYgKCgocm93SW50ID09PSBPKSB8fCAoKHJvd09yaWdpbiA8IE8pICYmIChyb3dJbnQgPiBPKSkpIHx8ICgoKHJvd0ludCA+IE8pIHx8IChyb3dPcmlnaW4gPCBPKSkgJiYgcm9sbG92ZXIpKSB7XG4gICAgcm93SW50Kys7XG5cbiAgICBpZiAocm93SW50ID09PSBJKSB7XG4gICAgICByb3dJbnQrKztcbiAgICB9XG4gIH1cblxuICBpZiAocm93SW50ID4gVikge1xuICAgIHJvd0ludCA9IHJvd0ludCAtIFYgKyBBIC0gMTtcbiAgfVxuXG4gIHZhciB0d29MZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvbEludCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKHJvd0ludCk7XG4gIHJldHVybiB0d29MZXR0ZXI7XG59XG5cbi8qKlxuICogRGVjb2RlIHRoZSBVVE0gcGFyYW1ldGVycyBmcm9tIGEgTUdSUyBzdHJpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZ3JzU3RyaW5nIGFuIFVQUEVSQ0FTRSBjb29yZGluYXRlIHN0cmluZyBpcyBleHBlY3RlZC5cbiAqIEByZXR1cm4ge29iamVjdH0gQW4gb2JqZWN0IGxpdGVyYWwgd2l0aCBlYXN0aW5nLCBub3J0aGluZywgem9uZUxldHRlcixcbiAqICAgICB6b25lTnVtYmVyIGFuZCBhY2N1cmFjeSAoaW4gbWV0ZXJzKSBwcm9wZXJ0aWVzLlxuICovXG5mdW5jdGlvbiBkZWNvZGUobWdyc1N0cmluZykge1xuXG4gIGlmIChtZ3JzU3RyaW5nICYmIG1ncnNTdHJpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgKFwiTUdSU1BvaW50IGNvdmVydGluZyBmcm9tIG5vdGhpbmdcIik7XG4gIH1cblxuICB2YXIgbGVuZ3RoID0gbWdyc1N0cmluZy5sZW5ndGg7XG5cbiAgdmFyIGh1bksgPSBudWxsO1xuICB2YXIgc2IgPSBcIlwiO1xuICB2YXIgdGVzdENoYXI7XG4gIHZhciBpID0gMDtcblxuICAvLyBnZXQgWm9uZSBudW1iZXJcbiAgd2hpbGUgKCEoL1tBLVpdLykudGVzdCh0ZXN0Q2hhciA9IG1ncnNTdHJpbmcuY2hhckF0KGkpKSkge1xuICAgIGlmIChpID49IDIpIHtcbiAgICAgIHRocm93IChcIk1HUlNQb2ludCBiYWQgY29udmVyc2lvbiBmcm9tOiBcIiArIG1ncnNTdHJpbmcpO1xuICAgIH1cbiAgICBzYiArPSB0ZXN0Q2hhcjtcbiAgICBpKys7XG4gIH1cblxuICB2YXIgem9uZU51bWJlciA9IHBhcnNlSW50KHNiLCAxMCk7XG5cbiAgaWYgKGkgPT09IDAgfHwgaSArIDMgPiBsZW5ndGgpIHtcbiAgICAvLyBBIGdvb2QgTUdSUyBzdHJpbmcgaGFzIHRvIGJlIDQtNSBkaWdpdHMgbG9uZyxcbiAgICAvLyAjI0FBQS8jQUFBIGF0IGxlYXN0LlxuICAgIHRocm93IChcIk1HUlNQb2ludCBiYWQgY29udmVyc2lvbiBmcm9tOiBcIiArIG1ncnNTdHJpbmcpO1xuICB9XG5cbiAgdmFyIHpvbmVMZXR0ZXIgPSBtZ3JzU3RyaW5nLmNoYXJBdChpKyspO1xuXG4gIC8vIFNob3VsZCB3ZSBjaGVjayB0aGUgem9uZSBsZXR0ZXIgaGVyZT8gV2h5IG5vdC5cbiAgaWYgKHpvbmVMZXR0ZXIgPD0gJ0EnIHx8IHpvbmVMZXR0ZXIgPT09ICdCJyB8fCB6b25lTGV0dGVyID09PSAnWScgfHwgem9uZUxldHRlciA+PSAnWicgfHwgem9uZUxldHRlciA9PT0gJ0knIHx8IHpvbmVMZXR0ZXIgPT09ICdPJykge1xuICAgIHRocm93IChcIk1HUlNQb2ludCB6b25lIGxldHRlciBcIiArIHpvbmVMZXR0ZXIgKyBcIiBub3QgaGFuZGxlZDogXCIgKyBtZ3JzU3RyaW5nKTtcbiAgfVxuXG4gIGh1bksgPSBtZ3JzU3RyaW5nLnN1YnN0cmluZyhpLCBpICs9IDIpO1xuXG4gIHZhciBzZXQgPSBnZXQxMDBrU2V0Rm9yWm9uZSh6b25lTnVtYmVyKTtcblxuICB2YXIgZWFzdDEwMGsgPSBnZXRFYXN0aW5nRnJvbUNoYXIoaHVuSy5jaGFyQXQoMCksIHNldCk7XG4gIHZhciBub3J0aDEwMGsgPSBnZXROb3J0aGluZ0Zyb21DaGFyKGh1bksuY2hhckF0KDEpLCBzZXQpO1xuXG4gIC8vIFdlIGhhdmUgYSBidWcgd2hlcmUgdGhlIG5vcnRoaW5nIG1heSBiZSAyMDAwMDAwIHRvbyBsb3cuXG4gIC8vIEhvd1xuICAvLyBkbyB3ZSBrbm93IHdoZW4gdG8gcm9sbCBvdmVyP1xuXG4gIHdoaWxlIChub3J0aDEwMGsgPCBnZXRNaW5Ob3J0aGluZyh6b25lTGV0dGVyKSkge1xuICAgIG5vcnRoMTAwayArPSAyMDAwMDAwO1xuICB9XG5cbiAgLy8gY2FsY3VsYXRlIHRoZSBjaGFyIGluZGV4IGZvciBlYXN0aW5nL25vcnRoaW5nIHNlcGFyYXRvclxuICB2YXIgcmVtYWluZGVyID0gbGVuZ3RoIC0gaTtcblxuICBpZiAocmVtYWluZGVyICUgMiAhPT0gMCkge1xuICAgIHRocm93IChcIk1HUlNQb2ludCBoYXMgdG8gaGF2ZSBhbiBldmVuIG51bWJlciBcXG5vZiBkaWdpdHMgYWZ0ZXIgdGhlIHpvbmUgbGV0dGVyIGFuZCB0d28gMTAwa20gbGV0dGVycyAtIGZyb250IFxcbmhhbGYgZm9yIGVhc3RpbmcgbWV0ZXJzLCBzZWNvbmQgaGFsZiBmb3IgXFxubm9ydGhpbmcgbWV0ZXJzXCIgKyBtZ3JzU3RyaW5nKTtcbiAgfVxuXG4gIHZhciBzZXAgPSByZW1haW5kZXIgLyAyO1xuXG4gIHZhciBzZXBFYXN0aW5nID0gMC4wO1xuICB2YXIgc2VwTm9ydGhpbmcgPSAwLjA7XG4gIHZhciBhY2N1cmFjeUJvbnVzLCBzZXBFYXN0aW5nU3RyaW5nLCBzZXBOb3J0aGluZ1N0cmluZywgZWFzdGluZywgbm9ydGhpbmc7XG4gIGlmIChzZXAgPiAwKSB7XG4gICAgYWNjdXJhY3lCb251cyA9IDEwMDAwMC4wIC8gTWF0aC5wb3coMTAsIHNlcCk7XG4gICAgc2VwRWFzdGluZ1N0cmluZyA9IG1ncnNTdHJpbmcuc3Vic3RyaW5nKGksIGkgKyBzZXApO1xuICAgIHNlcEVhc3RpbmcgPSBwYXJzZUZsb2F0KHNlcEVhc3RpbmdTdHJpbmcpICogYWNjdXJhY3lCb251cztcbiAgICBzZXBOb3J0aGluZ1N0cmluZyA9IG1ncnNTdHJpbmcuc3Vic3RyaW5nKGkgKyBzZXApO1xuICAgIHNlcE5vcnRoaW5nID0gcGFyc2VGbG9hdChzZXBOb3J0aGluZ1N0cmluZykgKiBhY2N1cmFjeUJvbnVzO1xuICB9XG5cbiAgZWFzdGluZyA9IHNlcEVhc3RpbmcgKyBlYXN0MTAwaztcbiAgbm9ydGhpbmcgPSBzZXBOb3J0aGluZyArIG5vcnRoMTAwaztcblxuICByZXR1cm4ge1xuICAgIGVhc3Rpbmc6IGVhc3RpbmcsXG4gICAgbm9ydGhpbmc6IG5vcnRoaW5nLFxuICAgIHpvbmVMZXR0ZXI6IHpvbmVMZXR0ZXIsXG4gICAgem9uZU51bWJlcjogem9uZU51bWJlcixcbiAgICBhY2N1cmFjeTogYWNjdXJhY3lCb251c1xuICB9O1xufVxuXG4vKipcbiAqIEdpdmVuIHRoZSBmaXJzdCBsZXR0ZXIgZnJvbSBhIHR3by1sZXR0ZXIgTUdSUyAxMDBrIHpvbmUsIGFuZCBnaXZlbiB0aGVcbiAqIE1HUlMgdGFibGUgc2V0IGZvciB0aGUgem9uZSBudW1iZXIsIGZpZ3VyZSBvdXQgdGhlIGVhc3RpbmcgdmFsdWUgdGhhdFxuICogc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBvdGhlciwgc2Vjb25kYXJ5IGVhc3RpbmcgdmFsdWUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Y2hhcn0gZSBUaGUgZmlyc3QgbGV0dGVyIGZyb20gYSB0d28tbGV0dGVyIE1HUlMgMTAwwrRrIHpvbmUuXG4gKiBAcGFyYW0ge251bWJlcn0gc2V0IFRoZSBNR1JTIHRhYmxlIHNldCBmb3IgdGhlIHpvbmUgbnVtYmVyLlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgZWFzdGluZyB2YWx1ZSBmb3IgdGhlIGdpdmVuIGxldHRlciBhbmQgc2V0LlxuICovXG5mdW5jdGlvbiBnZXRFYXN0aW5nRnJvbUNoYXIoZSwgc2V0KSB7XG4gIC8vIGNvbE9yaWdpbiBpcyB0aGUgbGV0dGVyIGF0IHRoZSBvcmlnaW4gb2YgdGhlIHNldCBmb3IgdGhlXG4gIC8vIGNvbHVtblxuICB2YXIgY3VyQ29sID0gU0VUX09SSUdJTl9DT0xVTU5fTEVUVEVSUy5jaGFyQ29kZUF0KHNldCAtIDEpO1xuICB2YXIgZWFzdGluZ1ZhbHVlID0gMTAwMDAwLjA7XG4gIHZhciByZXdpbmRNYXJrZXIgPSBmYWxzZTtcblxuICB3aGlsZSAoY3VyQ29sICE9PSBlLmNoYXJDb2RlQXQoMCkpIHtcbiAgICBjdXJDb2wrKztcbiAgICBpZiAoY3VyQ29sID09PSBJKSB7XG4gICAgICBjdXJDb2wrKztcbiAgICB9XG4gICAgaWYgKGN1ckNvbCA9PT0gTykge1xuICAgICAgY3VyQ29sKys7XG4gICAgfVxuICAgIGlmIChjdXJDb2wgPiBaKSB7XG4gICAgICBpZiAocmV3aW5kTWFya2VyKSB7XG4gICAgICAgIHRocm93IChcIkJhZCBjaGFyYWN0ZXI6IFwiICsgZSk7XG4gICAgICB9XG4gICAgICBjdXJDb2wgPSBBO1xuICAgICAgcmV3aW5kTWFya2VyID0gdHJ1ZTtcbiAgICB9XG4gICAgZWFzdGluZ1ZhbHVlICs9IDEwMDAwMC4wO1xuICB9XG5cbiAgcmV0dXJuIGVhc3RpbmdWYWx1ZTtcbn1cblxuLyoqXG4gKiBHaXZlbiB0aGUgc2Vjb25kIGxldHRlciBmcm9tIGEgdHdvLWxldHRlciBNR1JTIDEwMGsgem9uZSwgYW5kIGdpdmVuIHRoZVxuICogTUdSUyB0YWJsZSBzZXQgZm9yIHRoZSB6b25lIG51bWJlciwgZmlndXJlIG91dCB0aGUgbm9ydGhpbmcgdmFsdWUgdGhhdFxuICogc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBvdGhlciwgc2Vjb25kYXJ5IG5vcnRoaW5nIHZhbHVlLiBZb3UgaGF2ZSB0b1xuICogcmVtZW1iZXIgdGhhdCBOb3J0aGluZ3MgYXJlIGRldGVybWluZWQgZnJvbSB0aGUgZXF1YXRvciwgYW5kIHRoZSB2ZXJ0aWNhbFxuICogY3ljbGUgb2YgbGV0dGVycyBtZWFuIGEgMjAwMDAwMCBhZGRpdGlvbmFsIG5vcnRoaW5nIG1ldGVycy4gVGhpcyBoYXBwZW5zXG4gKiBhcHByb3guIGV2ZXJ5IDE4IGRlZ3JlZXMgb2YgbGF0aXR1ZGUuIFRoaXMgbWV0aG9kIGRvZXMgKk5PVCogY291bnQgYW55XG4gKiBhZGRpdGlvbmFsIG5vcnRoaW5ncy4gWW91IGhhdmUgdG8gZmlndXJlIG91dCBob3cgbWFueSAyMDAwMDAwIG1ldGVycyBuZWVkXG4gKiB0byBiZSBhZGRlZCBmb3IgdGhlIHpvbmUgbGV0dGVyIG9mIHRoZSBNR1JTIGNvb3JkaW5hdGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Y2hhcn0gbiBTZWNvbmQgbGV0dGVyIG9mIHRoZSBNR1JTIDEwMGsgem9uZVxuICogQHBhcmFtIHtudW1iZXJ9IHNldCBUaGUgTUdSUyB0YWJsZSBzZXQgbnVtYmVyLCB3aGljaCBpcyBkZXBlbmRlbnQgb24gdGhlXG4gKiAgICAgVVRNIHpvbmUgbnVtYmVyLlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbm9ydGhpbmcgdmFsdWUgZm9yIHRoZSBnaXZlbiBsZXR0ZXIgYW5kIHNldC5cbiAqL1xuZnVuY3Rpb24gZ2V0Tm9ydGhpbmdGcm9tQ2hhcihuLCBzZXQpIHtcblxuICBpZiAobiA+ICdWJykge1xuICAgIHRocm93IChcIk1HUlNQb2ludCBnaXZlbiBpbnZhbGlkIE5vcnRoaW5nIFwiICsgbik7XG4gIH1cblxuICAvLyByb3dPcmlnaW4gaXMgdGhlIGxldHRlciBhdCB0aGUgb3JpZ2luIG9mIHRoZSBzZXQgZm9yIHRoZVxuICAvLyBjb2x1bW5cbiAgdmFyIGN1clJvdyA9IFNFVF9PUklHSU5fUk9XX0xFVFRFUlMuY2hhckNvZGVBdChzZXQgLSAxKTtcbiAgdmFyIG5vcnRoaW5nVmFsdWUgPSAwLjA7XG4gIHZhciByZXdpbmRNYXJrZXIgPSBmYWxzZTtcblxuICB3aGlsZSAoY3VyUm93ICE9PSBuLmNoYXJDb2RlQXQoMCkpIHtcbiAgICBjdXJSb3crKztcbiAgICBpZiAoY3VyUm93ID09PSBJKSB7XG4gICAgICBjdXJSb3crKztcbiAgICB9XG4gICAgaWYgKGN1clJvdyA9PT0gTykge1xuICAgICAgY3VyUm93Kys7XG4gICAgfVxuICAgIC8vIGZpeGluZyBhIGJ1ZyBtYWtpbmcgd2hvbGUgYXBwbGljYXRpb24gaGFuZyBpbiB0aGlzIGxvb3BcbiAgICAvLyB3aGVuICduJyBpcyBhIHdyb25nIGNoYXJhY3RlclxuICAgIGlmIChjdXJSb3cgPiBWKSB7XG4gICAgICBpZiAocmV3aW5kTWFya2VyKSB7IC8vIG1ha2luZyBzdXJlIHRoYXQgdGhpcyBsb29wIGVuZHNcbiAgICAgICAgdGhyb3cgKFwiQmFkIGNoYXJhY3RlcjogXCIgKyBuKTtcbiAgICAgIH1cbiAgICAgIGN1clJvdyA9IEE7XG4gICAgICByZXdpbmRNYXJrZXIgPSB0cnVlO1xuICAgIH1cbiAgICBub3J0aGluZ1ZhbHVlICs9IDEwMDAwMC4wO1xuICB9XG5cbiAgcmV0dXJuIG5vcnRoaW5nVmFsdWU7XG59XG5cbi8qKlxuICogVGhlIGZ1bmN0aW9uIGdldE1pbk5vcnRoaW5nIHJldHVybnMgdGhlIG1pbmltdW0gbm9ydGhpbmcgdmFsdWUgb2YgYSBNR1JTXG4gKiB6b25lLlxuICpcbiAqIFBvcnRlZCBmcm9tIEdlb3RyYW5zJyBjIExhdHRpdHVkZV9CYW5kX1ZhbHVlIHN0cnVjdHVyZSB0YWJsZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtjaGFyfSB6b25lTGV0dGVyIFRoZSBNR1JTIHpvbmUgdG8gZ2V0IHRoZSBtaW4gbm9ydGhpbmcgZm9yLlxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRNaW5Ob3J0aGluZyh6b25lTGV0dGVyKSB7XG4gIHZhciBub3J0aGluZztcbiAgc3dpdGNoICh6b25lTGV0dGVyKSB7XG4gIGNhc2UgJ0MnOlxuICAgIG5vcnRoaW5nID0gMTEwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdEJzpcbiAgICBub3J0aGluZyA9IDIwMDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnRSc6XG4gICAgbm9ydGhpbmcgPSAyODAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ0YnOlxuICAgIG5vcnRoaW5nID0gMzcwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdHJzpcbiAgICBub3J0aGluZyA9IDQ2MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnSCc6XG4gICAgbm9ydGhpbmcgPSA1NTAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ0onOlxuICAgIG5vcnRoaW5nID0gNjQwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdLJzpcbiAgICBub3J0aGluZyA9IDczMDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnTCc6XG4gICAgbm9ydGhpbmcgPSA4MjAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ00nOlxuICAgIG5vcnRoaW5nID0gOTEwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdOJzpcbiAgICBub3J0aGluZyA9IDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnUCc6XG4gICAgbm9ydGhpbmcgPSA4MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnUSc6XG4gICAgbm9ydGhpbmcgPSAxNzAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1InOlxuICAgIG5vcnRoaW5nID0gMjYwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdTJzpcbiAgICBub3J0aGluZyA9IDM1MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnVCc6XG4gICAgbm9ydGhpbmcgPSA0NDAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1UnOlxuICAgIG5vcnRoaW5nID0gNTMwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdWJzpcbiAgICBub3J0aGluZyA9IDYyMDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnVyc6XG4gICAgbm9ydGhpbmcgPSA3MDAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1gnOlxuICAgIG5vcnRoaW5nID0gNzkwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBkZWZhdWx0OlxuICAgIG5vcnRoaW5nID0gLTEuMDtcbiAgfVxuICBpZiAobm9ydGhpbmcgPj0gMC4wKSB7XG4gICAgcmV0dXJuIG5vcnRoaW5nO1xuICB9XG4gIGVsc2Uge1xuICAgIHRocm93IChcIkludmFsaWQgem9uZSBsZXR0ZXI6IFwiICsgem9uZUxldHRlcik7XG4gIH1cblxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm5hbWVcIjogXCJwcm9qNFwiLFxuICBcInZlcnNpb25cIjogXCIyLjMuMTBcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlByb2o0anMgaXMgYSBKYXZhU2NyaXB0IGxpYnJhcnkgdG8gdHJhbnNmb3JtIHBvaW50IGNvb3JkaW5hdGVzIGZyb20gb25lIGNvb3JkaW5hdGUgc3lzdGVtIHRvIGFub3RoZXIsIGluY2x1ZGluZyBkYXR1bSB0cmFuc2Zvcm1hdGlvbnMuXCIsXG4gIFwibWFpblwiOiBcImxpYi9pbmRleC5qc1wiLFxuICBcImRpcmVjdG9yaWVzXCI6IHtcbiAgICBcInRlc3RcIjogXCJ0ZXN0XCIsXG4gICAgXCJkb2NcIjogXCJkb2NzXCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcInRlc3RcIjogXCIuL25vZGVfbW9kdWxlcy9pc3RhbmJ1bC9saWIvY2xpLmpzIHRlc3QgLi9ub2RlX21vZHVsZXMvbW9jaGEvYmluL19tb2NoYSB0ZXN0L3Rlc3QuanNcIlxuICB9LFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiZ2l0Oi8vZ2l0aHViLmNvbS9wcm9qNGpzL3Byb2o0anMuZ2l0XCJcbiAgfSxcbiAgXCJhdXRob3JcIjogXCJcIixcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwiamFtXCI6IHtcbiAgICBcIm1haW5cIjogXCJkaXN0L3Byb2o0LmpzXCIsXG4gICAgXCJpbmNsdWRlXCI6IFtcbiAgICAgIFwiZGlzdC9wcm9qNC5qc1wiLFxuICAgICAgXCJSRUFETUUubWRcIixcbiAgICAgIFwiQVVUSE9SU1wiLFxuICAgICAgXCJMSUNFTlNFLm1kXCJcbiAgICBdXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcImdydW50LWNsaVwiOiBcIn4wLjEuMTNcIixcbiAgICBcImdydW50XCI6IFwifjAuNC4yXCIsXG4gICAgXCJncnVudC1jb250cmliLWNvbm5lY3RcIjogXCJ+MC42LjBcIixcbiAgICBcImdydW50LWNvbnRyaWItanNoaW50XCI6IFwifjAuOC4wXCIsXG4gICAgXCJjaGFpXCI6IFwifjEuOC4xXCIsXG4gICAgXCJtb2NoYVwiOiBcIn4xLjE3LjFcIixcbiAgICBcImdydW50LW1vY2hhLXBoYW50b21qc1wiOiBcIn4wLjQuMFwiLFxuICAgIFwiYnJvd3NlcmlmeVwiOiBcIn4zLjI0LjVcIixcbiAgICBcImdydW50LWJyb3dzZXJpZnlcIjogXCJ+MS4zLjBcIixcbiAgICBcImdydW50LWNvbnRyaWItdWdsaWZ5XCI6IFwifjAuMy4yXCIsXG4gICAgXCJjdXJsXCI6IFwiZ2l0Oi8vZ2l0aHViLmNvbS9jdWpvanMvY3VybC5naXRcIixcbiAgICBcImlzdGFuYnVsXCI6IFwifjAuMi40XCIsXG4gICAgXCJ0aW5cIjogXCJ+MC40LjBcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJtZ3JzXCI6IFwifjAuMC4yXCJcbiAgfSxcbiAgXCJjb250cmlidXRvcnNcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1pa2UgQWRhaXJcIixcbiAgICAgIFwiZW1haWxcIjogXCJtYWRhaXJAZG1zb2x1dGlvbnMuY2FcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUmljaGFyZCBHcmVlbndvb2RcIixcbiAgICAgIFwiZW1haWxcIjogXCJyaWNoQGdyZWVud29vZG1hcC5jb21cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQ2FsdmluIE1ldGNhbGZcIixcbiAgICAgIFwiZW1haWxcIjogXCJjYWx2aW4ubWV0Y2FsZkBnbWFpbC5jb21cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUmljaGFyZCBNYXJzZGVuXCIsXG4gICAgICBcInVybFwiOiBcImh0dHA6Ly93d3cud2lud2FlZC5jb21cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVC4gTWl0dGFuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkQuIFN0ZWlud2FuZFwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJTLiBOZWxzb25cIlxuICAgIH1cbiAgXSxcbiAgXCJnaXRIZWFkXCI6IFwiYWMwM2QxNDM5NDkxZGMzMTNkYTgwOTg1MTkzZjcwMmNhNDcxYjNkMFwiLFxuICBcImJ1Z3NcIjoge1xuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3Byb2o0anMvcHJvajRqcy9pc3N1ZXNcIlxuICB9LFxuICBcImhvbWVwYWdlXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3Byb2o0anMvcHJvajRqcyNyZWFkbWVcIixcbiAgXCJfaWRcIjogXCJwcm9qNEAyLjMuMTBcIixcbiAgXCJfc2hhc3VtXCI6IFwiZjZlNjZiZGNjYTMzMmMyNWE1ZTNkOGVmMjY1Y2ZjOWQ3YjYwZmQwY1wiLFxuICBcIl9mcm9tXCI6IFwicHJvajRAKlwiLFxuICBcIl9ucG1WZXJzaW9uXCI6IFwiMi4xMS4yXCIsXG4gIFwiX25vZGVWZXJzaW9uXCI6IFwiMC4xMi41XCIsXG4gIFwiX25wbVVzZXJcIjoge1xuICAgIFwibmFtZVwiOiBcImFob2NldmFyXCIsXG4gICAgXCJlbWFpbFwiOiBcImFuZHJlYXMuaG9jZXZhckBnbWFpbC5jb21cIlxuICB9LFxuICBcIm1haW50YWluZXJzXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJjd21tYVwiLFxuICAgICAgXCJlbWFpbFwiOiBcImNhbHZpbi5tZXRjYWxmQGdtYWlsLmNvbVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJhaG9jZXZhclwiLFxuICAgICAgXCJlbWFpbFwiOiBcImFuZHJlYXMuaG9jZXZhckBnbWFpbC5jb21cIlxuICAgIH1cbiAgXSxcbiAgXCJkaXN0XCI6IHtcbiAgICBcInNoYXN1bVwiOiBcImY2ZTY2YmRjY2EzMzJjMjVhNWUzZDhlZjI2NWNmYzlkN2I2MGZkMGNcIixcbiAgICBcInRhcmJhbGxcIjogXCJodHRwOi8vcmVnaXN0cnkubnBtanMub3JnL3Byb2o0Ly0vcHJvajQtMi4zLjEwLnRnelwiXG4gIH0sXG4gIFwiX3Jlc29sdmVkXCI6IFwiaHR0cHM6Ly9yZWdpc3RyeS5ucG1qcy5vcmcvcHJvajQvLS9wcm9qNC0yLjMuMTAudGd6XCJcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciBTS0lQID0gZXhwb3J0cy5TS0lQID0gJ3NraXBJbml0aWFsQ2FsbCc7XG52YXIgRVFVQUxTID0gZXhwb3J0cy5FUVVBTFMgPSAnZXF1YWxzJztcbnZhciBPQlNFUlZFUiA9IGV4cG9ydHMuT0JTRVJWRVIgPSAnX19PQlNFUlZFUl9fJzsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHtcbiAgaXNTdG9yZTogaXNTdG9yZSwgaXNPYnNlcnZlckFycmF5OiBpc09ic2VydmVyQXJyYXksIGlzUHJpbWl0aXZlOiBpc1ByaW1pdGl2ZSwgaGFzS2V5OiBoYXNLZXlcbn07XG5cbnZhciBzdG9yZUtleXMgPSBbJ2Rpc3BhdGNoJywgJ2dldFN0YXRlJywgJ3N1YnNjcmliZSddO1xuZnVuY3Rpb24gaXNTdG9yZSh2YWwpIHtcbiAgaWYgKCF2YWwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHN0b3JlS2V5cy5ldmVyeShmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGhhcy5jYWxsKHZhbCwga2V5KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGlzT2JzZXJ2ZXJBcnJheSh2YWwpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHZhbC5ldmVyeShpc09ic2VydmVyKTtcbn1cblxuZnVuY3Rpb24gaXNPYnNlcnZlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicgJiYgdmFsW19jb25zdGFudHMuT0JTRVJWRVJdO1xufVxuXG52YXIgcHJpbWl0aXZlcyA9IFsnc3RyaW5nJywgJ251bWJlcicsICdib29sZWFuJ107XG5mdW5jdGlvbiBpc1ByaW1pdGl2ZSh2YWwpIHtcbiAgcmV0dXJuIHByaW1pdGl2ZXMuc29tZShmdW5jdGlvbiAocCkge1xuICAgIHJldHVybiAodHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YodmFsKSkgPT09IHA7XG4gIH0pO1xufVxuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbmZ1bmN0aW9uIGhhc0tleShvYmosIGtleSkge1xuICByZXR1cm4gaGFzLmNhbGwob2JqLCBrZXkpO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9kZWZhdWx0cztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMub2JzZXJ2ZSA9IG9ic2VydmU7XG5leHBvcnRzLm9ic2VydmVyID0gb2JzZXJ2ZXI7XG5leHBvcnRzLnNoYWxsb3dFcXVhbHMgPSBzaGFsbG93RXF1YWxzO1xuXG52YXIgX2hlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxudmFyIF9oZWxwZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnMpO1xuXG52YXIgX2NvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbi8vIERlZmF1bHQgb3B0aW9ucy5cbnZhciBkZWZhdWx0cyA9IChfZGVmYXVsdHMgPSB7fSwgX2RlZmluZVByb3BlcnR5KF9kZWZhdWx0cywgX2NvbnN0YW50cy5TS0lQLCB0cnVlKSwgX2RlZmluZVByb3BlcnR5KF9kZWZhdWx0cywgX2NvbnN0YW50cy5FUVVBTFMsIHNoYWxsb3dFcXVhbHMpLCBfZGVmYXVsdHMpO1xuXG5mdW5jdGlvbiBvYnNlcnZlKHN0b3JlLCBvYnNlcnZlcnMpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1syXTtcblxuICBpZiAoIV9oZWxwZXJzMi5kZWZhdWx0LmlzU3RvcmUoc3RvcmUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdvYnNlcnZlcnM6IGludmFsaWQgYHN0b3JlYCBhcmd1bWVudDsgJyArICdleHBlY3RlZCBhIFJlZHV4IHN0b3JlIG9iamVjdC4nKTtcbiAgfVxuXG4gIGlmICghX2hlbHBlcnMyLmRlZmF1bHQuaXNPYnNlcnZlckFycmF5KG9ic2VydmVycykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ29ic2VydmVyczogaW52YWxpZCBgb2JzZXJ2ZXJzYCBhcmd1bWVudDsgJyArICdleHBlY3RlZCBhbiBhcnJheSBvZiBvYnNlcnZlcigpIGZ1bmN0aW9ucy4nKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSBnbG9iYWxseS1hcHBsaWNhYmxlIG9wdGlvbnMgZm9yIHRoZSBnaXZlbiBvYnNlcnZlciBzZXQuXG4gIHZhciBnbG9iYWxzID0gW19jb25zdGFudHMuU0tJUCwgX2NvbnN0YW50cy5FUVVBTFNdLnJlZHVjZShmdW5jdGlvbiAoZ2xvYmFscywga2V5KSB7XG4gICAgZ2xvYmFsc1trZXldID0gX2hlbHBlcnMyLmRlZmF1bHQuaGFzS2V5KG9wdGlvbnMsIGtleSkgPyBvcHRpb25zW2tleV0gOiBkZWZhdWx0c1trZXldO1xuICAgIHJldHVybiBnbG9iYWxzO1xuICB9LCB7fSk7XG5cbiAgdmFyIGRpc3BhdGNoID0gc3RvcmUuZGlzcGF0Y2g7XG4gIHZhciBnZXRTdGF0ZSA9IHN0b3JlLmdldFN0YXRlO1xuICB2YXIgc3Vic2NyaWJlID0gc3RvcmUuc3Vic2NyaWJlO1xuXG4gIHZhciBhcHBseSA9IGZ1bmN0aW9uIGFwcGx5KHN0YXRlKSB7XG4gICAgb2JzZXJ2ZXJzLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICBmbihzdGF0ZSwgZGlzcGF0Y2gsIGdsb2JhbHMpO1xuICAgIH0pO1xuICB9O1xuICB2YXIgbGlzdGVuID0gZnVuY3Rpb24gbGlzdGVuKCkge1xuICAgIGFwcGx5KGdldFN0YXRlKCkpO1xuICB9O1xuXG4gIHZhciB1bnN1YnNjcmliZSA9IHN1YnNjcmliZShsaXN0ZW4pO1xuICBsaXN0ZW4oKTtcbiAgcmV0dXJuIHVuc3Vic2NyaWJlO1xufVxuXG5mdW5jdGlvbiBvYnNlcnZlcihtYXBwZXIsIGRpc3BhdGNoZXIpIHtcbiAgdmFyIGxvY2FscyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzJdO1xuXG4gIG1hcHBlciA9IG1hcHBlciB8fCBkZWZhdWx0TWFwcGVyO1xuICBpZiAodHlwZW9mIGRpc3BhdGNoZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ29ic2VydmVyczogYSBgZGlzcGF0Y2hlcmAgZnVuY3Rpb24gbXVzdCBiZSBwcm92aWRlZC4nKTtcbiAgfVxuXG4gIHZhciBpbml0aWFsaXplZCA9IGZhbHNlO1xuICB2YXIgY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgdmFyIG9ic2VydmVyID0gZnVuY3Rpb24gb2JzZXJ2ZXIoc3RhdGUsIGRpc3BhdGNoLCBnbG9iYWxzKSB7XG4gICAgdmFyIHByZXZpb3VzID0gY3VycmVudDtcbiAgICBjdXJyZW50ID0gbWFwcGVyKHN0YXRlKTtcblxuICAgIC8vIFRoaXMgYnJhbmNoIGlzIHJ1biBvbmx5IG9uY2UsIGJlZm9yZSB0aGUgUmVkdXggcmVkdWNlcnNcbiAgICAvLyByZXR1cm4gdGhlaXIgaW5pdGlhbCBzdGF0ZS5cbiAgICBpZiAoIWluaXRpYWxpemVkKSB7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICB2YXIgc2tpcCA9IF9oZWxwZXJzMi5kZWZhdWx0Lmhhc0tleShsb2NhbHMsIF9jb25zdGFudHMuU0tJUCkgPyAhIWxvY2Fsc1tfY29uc3RhbnRzLlNLSVBdIDogZ2xvYmFsc1tfY29uc3RhbnRzLlNLSVBdO1xuICAgICAgaWYgKHNraXApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBlcXVhbHMgPSBsb2NhbHNbX2NvbnN0YW50cy5FUVVBTFNdIHx8IGdsb2JhbHNbX2NvbnN0YW50cy5FUVVBTFNdO1xuICAgIGlmICghZXF1YWxzKGN1cnJlbnQsIHByZXZpb3VzKSkge1xuICAgICAgZGlzcGF0Y2hlcihkaXNwYXRjaCwgY3VycmVudCwgcHJldmlvdXMpO1xuICAgIH1cbiAgfTtcblxuICBvYnNlcnZlcltfY29uc3RhbnRzLk9CU0VSVkVSXSA9IHRydWU7XG5cbiAgcmV0dXJuIG9ic2VydmVyO1xufVxuXG52YXIgZGVmYXVsdE1hcHBlciA9IGZ1bmN0aW9uIGRlZmF1bHRNYXBwZXIoc3RhdGUpIHtcbiAgcmV0dXJuIHN0YXRlO1xufTtcblxuLy8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9yYWNrdC9yZWFjdC1yZWR1eC9ibG9iL21hc3Rlci9zcmMvdXRpbHMvc2hhbGxvd0VxdWFsLmpzXG5mdW5jdGlvbiBzaGFsbG93RXF1YWxzKGEsIGIpIHtcbiAgaWYgKGEgPT09IGIpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEd1YXJkIGFnYWluc3QgdW5kZWZpbmVkIHZhbHVlcy5cbiAgLy9cbiAgLy8gTm90ZTogZXZlbiB0aG91Z2ggUmVkdXggZXhwZWN0cyByZWR1Y2VycyB0byBuZXZlciByZXR1cm4gYHVuZGVmaW5lZGAsXG4gIC8vIGludGVybmFsbHktbWFwcGVkIHN0YXRlIHNsaWNlcyAodmlhIGBtYXBwZXJgKSBtYXkgYmUgc2V0IHRvIGB1bmRlZmluZWRgLlxuICBpZiAoYSA9PT0gdW5kZWZpbmVkIHx8IGIgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChfaGVscGVyczIuZGVmYXVsdC5pc1ByaW1pdGl2ZShhKSB8fCBfaGVscGVyczIuZGVmYXVsdC5pc1ByaW1pdGl2ZShiKSkge1xuICAgIHJldHVybiBhID09PSBiO1xuICB9XG5cbiAgdmFyIGFLZXlzID0gT2JqZWN0LmtleXMoYSk7XG4gIHZhciBiS2V5cyA9IE9iamVjdC5rZXlzKGIpO1xuXG4gIGlmIChhS2V5cy5sZW5ndGggIT09IGJLZXlzLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYktleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gYktleXNbaV07XG4gICAgaWYgKCFfaGVscGVyczIuZGVmYXVsdC5oYXNLZXkoYSwga2V5KSB8fCBhW2tleV0gIT09IGJba2V5XSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gYXBwbHlNaWRkbGV3YXJlO1xuXG52YXIgX2NvbXBvc2UgPSByZXF1aXJlKCcuL2NvbXBvc2UnKTtcblxudmFyIF9jb21wb3NlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2UpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0b3JlIGVuaGFuY2VyIHRoYXQgYXBwbGllcyBtaWRkbGV3YXJlIHRvIHRoZSBkaXNwYXRjaCBtZXRob2RcbiAqIG9mIHRoZSBSZWR1eCBzdG9yZS4gVGhpcyBpcyBoYW5keSBmb3IgYSB2YXJpZXR5IG9mIHRhc2tzLCBzdWNoIGFzIGV4cHJlc3NpbmdcbiAqIGFzeW5jaHJvbm91cyBhY3Rpb25zIGluIGEgY29uY2lzZSBtYW5uZXIsIG9yIGxvZ2dpbmcgZXZlcnkgYWN0aW9uIHBheWxvYWQuXG4gKlxuICogU2VlIGByZWR1eC10aHVua2AgcGFja2FnZSBhcyBhbiBleGFtcGxlIG9mIHRoZSBSZWR1eCBtaWRkbGV3YXJlLlxuICpcbiAqIEJlY2F1c2UgbWlkZGxld2FyZSBpcyBwb3RlbnRpYWxseSBhc3luY2hyb25vdXMsIHRoaXMgc2hvdWxkIGJlIHRoZSBmaXJzdFxuICogc3RvcmUgZW5oYW5jZXIgaW4gdGhlIGNvbXBvc2l0aW9uIGNoYWluLlxuICpcbiAqIE5vdGUgdGhhdCBlYWNoIG1pZGRsZXdhcmUgd2lsbCBiZSBnaXZlbiB0aGUgYGRpc3BhdGNoYCBhbmQgYGdldFN0YXRlYCBmdW5jdGlvbnNcbiAqIGFzIG5hbWVkIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBtaWRkbGV3YXJlcyBUaGUgbWlkZGxld2FyZSBjaGFpbiB0byBiZSBhcHBsaWVkLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHN0b3JlIGVuaGFuY2VyIGFwcGx5aW5nIHRoZSBtaWRkbGV3YXJlLlxuICovXG5mdW5jdGlvbiBhcHBseU1pZGRsZXdhcmUoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBtaWRkbGV3YXJlcyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIG1pZGRsZXdhcmVzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjcmVhdGVTdG9yZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAocmVkdWNlciwgcHJlbG9hZGVkU3RhdGUsIGVuaGFuY2VyKSB7XG4gICAgICB2YXIgc3RvcmUgPSBjcmVhdGVTdG9yZShyZWR1Y2VyLCBwcmVsb2FkZWRTdGF0ZSwgZW5oYW5jZXIpO1xuICAgICAgdmFyIF9kaXNwYXRjaCA9IHN0b3JlLmRpc3BhdGNoO1xuICAgICAgdmFyIGNoYWluID0gW107XG5cbiAgICAgIHZhciBtaWRkbGV3YXJlQVBJID0ge1xuICAgICAgICBnZXRTdGF0ZTogc3RvcmUuZ2V0U3RhdGUsXG4gICAgICAgIGRpc3BhdGNoOiBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gX2Rpc3BhdGNoKGFjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjaGFpbiA9IG1pZGRsZXdhcmVzLm1hcChmdW5jdGlvbiAobWlkZGxld2FyZSkge1xuICAgICAgICByZXR1cm4gbWlkZGxld2FyZShtaWRkbGV3YXJlQVBJKTtcbiAgICAgIH0pO1xuICAgICAgX2Rpc3BhdGNoID0gX2NvbXBvc2UyWydkZWZhdWx0J10uYXBwbHkodW5kZWZpbmVkLCBjaGFpbikoc3RvcmUuZGlzcGF0Y2gpO1xuXG4gICAgICByZXR1cm4gX2V4dGVuZHMoe30sIHN0b3JlLCB7XG4gICAgICAgIGRpc3BhdGNoOiBfZGlzcGF0Y2hcbiAgICAgIH0pO1xuICAgIH07XG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1snZGVmYXVsdCddID0gYmluZEFjdGlvbkNyZWF0b3JzO1xuZnVuY3Rpb24gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvciwgZGlzcGF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2goYWN0aW9uQ3JlYXRvci5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGFjdGlvbiBjcmVhdG9ycywgaW50byBhbiBvYmplY3Qgd2l0aCB0aGVcbiAqIHNhbWUga2V5cywgYnV0IHdpdGggZXZlcnkgZnVuY3Rpb24gd3JhcHBlZCBpbnRvIGEgYGRpc3BhdGNoYCBjYWxsIHNvIHRoZXlcbiAqIG1heSBiZSBpbnZva2VkIGRpcmVjdGx5LiBUaGlzIGlzIGp1c3QgYSBjb252ZW5pZW5jZSBtZXRob2QsIGFzIHlvdSBjYW4gY2FsbFxuICogYHN0b3JlLmRpc3BhdGNoKE15QWN0aW9uQ3JlYXRvcnMuZG9Tb21ldGhpbmcoKSlgIHlvdXJzZWxmIGp1c3QgZmluZS5cbiAqXG4gKiBGb3IgY29udmVuaWVuY2UsIHlvdSBjYW4gYWxzbyBwYXNzIGEgc2luZ2xlIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCxcbiAqIGFuZCBnZXQgYSBmdW5jdGlvbiBpbiByZXR1cm4uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R9IGFjdGlvbkNyZWF0b3JzIEFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGFjdGlvblxuICogY3JlYXRvciBmdW5jdGlvbnMuIE9uZSBoYW5keSB3YXkgdG8gb2J0YWluIGl0IGlzIHRvIHVzZSBFUzYgYGltcG9ydCAqIGFzYFxuICogc3ludGF4LiBZb3UgbWF5IGFsc28gcGFzcyBhIHNpbmdsZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBkaXNwYXRjaCBUaGUgYGRpc3BhdGNoYCBmdW5jdGlvbiBhdmFpbGFibGUgb24geW91ciBSZWR1eFxuICogc3RvcmUuXG4gKlxuICogQHJldHVybnMge0Z1bmN0aW9ufE9iamVjdH0gVGhlIG9iamVjdCBtaW1pY2tpbmcgdGhlIG9yaWdpbmFsIG9iamVjdCwgYnV0IHdpdGhcbiAqIGV2ZXJ5IGFjdGlvbiBjcmVhdG9yIHdyYXBwZWQgaW50byB0aGUgYGRpc3BhdGNoYCBjYWxsLiBJZiB5b3UgcGFzc2VkIGFcbiAqIGZ1bmN0aW9uIGFzIGBhY3Rpb25DcmVhdG9yc2AsIHRoZSByZXR1cm4gdmFsdWUgd2lsbCBhbHNvIGJlIGEgc2luZ2xlXG4gKiBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmluZEFjdGlvbkNyZWF0b3JzKGFjdGlvbkNyZWF0b3JzLCBkaXNwYXRjaCkge1xuICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3JzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3JzLCBkaXNwYXRjaCk7XG4gIH1cblxuICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3JzICE9PSAnb2JqZWN0JyB8fCBhY3Rpb25DcmVhdG9ycyA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYmluZEFjdGlvbkNyZWF0b3JzIGV4cGVjdGVkIGFuIG9iamVjdCBvciBhIGZ1bmN0aW9uLCBpbnN0ZWFkIHJlY2VpdmVkICcgKyAoYWN0aW9uQ3JlYXRvcnMgPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2YgYWN0aW9uQ3JlYXRvcnMpICsgJy4gJyArICdEaWQgeW91IHdyaXRlIFwiaW1wb3J0IEFjdGlvbkNyZWF0b3JzIGZyb21cIiBpbnN0ZWFkIG9mIFwiaW1wb3J0ICogYXMgQWN0aW9uQ3JlYXRvcnMgZnJvbVwiPycpO1xuICB9XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhY3Rpb25DcmVhdG9ycyk7XG4gIHZhciBib3VuZEFjdGlvbkNyZWF0b3JzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIHZhciBhY3Rpb25DcmVhdG9yID0gYWN0aW9uQ3JlYXRvcnNba2V5XTtcbiAgICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGJvdW5kQWN0aW9uQ3JlYXRvcnNba2V5XSA9IGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3IsIGRpc3BhdGNoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJvdW5kQWN0aW9uQ3JlYXRvcnM7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1snZGVmYXVsdCddID0gY29tYmluZVJlZHVjZXJzO1xuXG52YXIgX2NyZWF0ZVN0b3JlID0gcmVxdWlyZSgnLi9jcmVhdGVTdG9yZScpO1xuXG52YXIgX2lzUGxhaW5PYmplY3QgPSByZXF1aXJlKCdsb2Rhc2gvaXNQbGFpbk9iamVjdCcpO1xuXG52YXIgX2lzUGxhaW5PYmplY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNQbGFpbk9iamVjdCk7XG5cbnZhciBfd2FybmluZyA9IHJlcXVpcmUoJy4vdXRpbHMvd2FybmluZycpO1xuXG52YXIgX3dhcm5pbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfd2FybmluZyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gZ2V0VW5kZWZpbmVkU3RhdGVFcnJvck1lc3NhZ2Uoa2V5LCBhY3Rpb24pIHtcbiAgdmFyIGFjdGlvblR5cGUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGU7XG4gIHZhciBhY3Rpb25OYW1lID0gYWN0aW9uVHlwZSAmJiAnXCInICsgYWN0aW9uVHlwZS50b1N0cmluZygpICsgJ1wiJyB8fCAnYW4gYWN0aW9uJztcblxuICByZXR1cm4gJ0dpdmVuIGFjdGlvbiAnICsgYWN0aW9uTmFtZSArICcsIHJlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZC4gJyArICdUbyBpZ25vcmUgYW4gYWN0aW9uLCB5b3UgbXVzdCBleHBsaWNpdGx5IHJldHVybiB0aGUgcHJldmlvdXMgc3RhdGUuJztcbn1cblxuZnVuY3Rpb24gZ2V0VW5leHBlY3RlZFN0YXRlU2hhcGVXYXJuaW5nTWVzc2FnZShpbnB1dFN0YXRlLCByZWR1Y2VycywgYWN0aW9uLCB1bmV4cGVjdGVkS2V5Q2FjaGUpIHtcbiAgdmFyIHJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICB2YXIgYXJndW1lbnROYW1lID0gYWN0aW9uICYmIGFjdGlvbi50eXBlID09PSBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCA/ICdwcmVsb2FkZWRTdGF0ZSBhcmd1bWVudCBwYXNzZWQgdG8gY3JlYXRlU3RvcmUnIDogJ3ByZXZpb3VzIHN0YXRlIHJlY2VpdmVkIGJ5IHRoZSByZWR1Y2VyJztcblxuICBpZiAocmVkdWNlcktleXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuICdTdG9yZSBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgcmVkdWNlci4gTWFrZSBzdXJlIHRoZSBhcmd1bWVudCBwYXNzZWQgJyArICd0byBjb21iaW5lUmVkdWNlcnMgaXMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgcmVkdWNlcnMuJztcbiAgfVxuXG4gIGlmICghKDAsIF9pc1BsYWluT2JqZWN0MlsnZGVmYXVsdCddKShpbnB1dFN0YXRlKSkge1xuICAgIHJldHVybiAnVGhlICcgKyBhcmd1bWVudE5hbWUgKyAnIGhhcyB1bmV4cGVjdGVkIHR5cGUgb2YgXCInICsge30udG9TdHJpbmcuY2FsbChpbnB1dFN0YXRlKS5tYXRjaCgvXFxzKFthLXp8QS1aXSspLylbMV0gKyAnXCIuIEV4cGVjdGVkIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgJyArICgna2V5czogXCInICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyAnXCInKTtcbiAgfVxuXG4gIHZhciB1bmV4cGVjdGVkS2V5cyA9IE9iamVjdC5rZXlzKGlucHV0U3RhdGUpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuICFyZWR1Y2Vycy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmICF1bmV4cGVjdGVkS2V5Q2FjaGVba2V5XTtcbiAgfSk7XG5cbiAgdW5leHBlY3RlZEtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdW5leHBlY3RlZEtleUNhY2hlW2tleV0gPSB0cnVlO1xuICB9KTtcblxuICBpZiAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiAnVW5leHBlY3RlZCAnICsgKHVuZXhwZWN0ZWRLZXlzLmxlbmd0aCA+IDEgPyAna2V5cycgOiAna2V5JykgKyAnICcgKyAoJ1wiJyArIHVuZXhwZWN0ZWRLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiIGZvdW5kIGluICcgKyBhcmd1bWVudE5hbWUgKyAnLiAnKSArICdFeHBlY3RlZCB0byBmaW5kIG9uZSBvZiB0aGUga25vd24gcmVkdWNlciBrZXlzIGluc3RlYWQ6ICcgKyAoJ1wiJyArIHJlZHVjZXJLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiLiBVbmV4cGVjdGVkIGtleXMgd2lsbCBiZSBpZ25vcmVkLicpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFJlZHVjZXJTYW5pdHkocmVkdWNlcnMpIHtcbiAgT2JqZWN0LmtleXMocmVkdWNlcnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciByZWR1Y2VyID0gcmVkdWNlcnNba2V5XTtcbiAgICB2YXIgaW5pdGlhbFN0YXRlID0gcmVkdWNlcih1bmRlZmluZWQsIHsgdHlwZTogX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgfSk7XG5cbiAgICBpZiAodHlwZW9mIGluaXRpYWxTdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIGR1cmluZyBpbml0aWFsaXphdGlvbi4gJyArICdJZiB0aGUgc3RhdGUgcGFzc2VkIHRvIHRoZSByZWR1Y2VyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgJyArICdleHBsaWNpdGx5IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZS4gVGhlIGluaXRpYWwgc3RhdGUgbWF5ICcgKyAnbm90IGJlIHVuZGVmaW5lZC4nKTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9ICdAQHJlZHV4L1BST0JFX1VOS05PV05fQUNUSU9OXycgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNykuc3BsaXQoJycpLmpvaW4oJy4nKTtcbiAgICBpZiAodHlwZW9mIHJlZHVjZXIodW5kZWZpbmVkLCB7IHR5cGU6IHR5cGUgfSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCB3aGVuIHByb2JlZCB3aXRoIGEgcmFuZG9tIHR5cGUuICcgKyAoJ0RvblxcJ3QgdHJ5IHRvIGhhbmRsZSAnICsgX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgKyAnIG9yIG90aGVyIGFjdGlvbnMgaW4gXCJyZWR1eC8qXCIgJykgKyAnbmFtZXNwYWNlLiBUaGV5IGFyZSBjb25zaWRlcmVkIHByaXZhdGUuIEluc3RlYWQsIHlvdSBtdXN0IHJldHVybiB0aGUgJyArICdjdXJyZW50IHN0YXRlIGZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB1bmxlc3MgaXQgaXMgdW5kZWZpbmVkLCAnICsgJ2luIHdoaWNoIGNhc2UgeW91IG11c3QgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLCByZWdhcmRsZXNzIG9mIHRoZSAnICsgJ2FjdGlvbiB0eXBlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgbm90IGJlIHVuZGVmaW5lZC4nKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGRpZmZlcmVudCByZWR1Y2VyIGZ1bmN0aW9ucywgaW50byBhIHNpbmdsZVxuICogcmVkdWNlciBmdW5jdGlvbi4gSXQgd2lsbCBjYWxsIGV2ZXJ5IGNoaWxkIHJlZHVjZXIsIGFuZCBnYXRoZXIgdGhlaXIgcmVzdWx0c1xuICogaW50byBhIHNpbmdsZSBzdGF0ZSBvYmplY3QsIHdob3NlIGtleXMgY29ycmVzcG9uZCB0byB0aGUga2V5cyBvZiB0aGUgcGFzc2VkXG4gKiByZWR1Y2VyIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVkdWNlcnMgQW4gb2JqZWN0IHdob3NlIHZhbHVlcyBjb3JyZXNwb25kIHRvIGRpZmZlcmVudFxuICogcmVkdWNlciBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlIGNvbWJpbmVkIGludG8gb25lLiBPbmUgaGFuZHkgd2F5IHRvIG9idGFpblxuICogaXQgaXMgdG8gdXNlIEVTNiBgaW1wb3J0ICogYXMgcmVkdWNlcnNgIHN5bnRheC4gVGhlIHJlZHVjZXJzIG1heSBuZXZlciByZXR1cm5cbiAqIHVuZGVmaW5lZCBmb3IgYW55IGFjdGlvbi4gSW5zdGVhZCwgdGhleSBzaG91bGQgcmV0dXJuIHRoZWlyIGluaXRpYWwgc3RhdGVcbiAqIGlmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlbSB3YXMgdW5kZWZpbmVkLCBhbmQgdGhlIGN1cnJlbnQgc3RhdGUgZm9yIGFueVxuICogdW5yZWNvZ25pemVkIGFjdGlvbi5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgcmVkdWNlciBmdW5jdGlvbiB0aGF0IGludm9rZXMgZXZlcnkgcmVkdWNlciBpbnNpZGUgdGhlXG4gKiBwYXNzZWQgb2JqZWN0LCBhbmQgYnVpbGRzIGEgc3RhdGUgb2JqZWN0IHdpdGggdGhlIHNhbWUgc2hhcGUuXG4gKi9cbmZ1bmN0aW9uIGNvbWJpbmVSZWR1Y2VycyhyZWR1Y2Vycykge1xuICB2YXIgcmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhyZWR1Y2Vycyk7XG4gIHZhciBmaW5hbFJlZHVjZXJzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmVkdWNlcktleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gcmVkdWNlcktleXNbaV07XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgaWYgKHR5cGVvZiByZWR1Y2Vyc1trZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAoMCwgX3dhcm5pbmcyWydkZWZhdWx0J10pKCdObyByZWR1Y2VyIHByb3ZpZGVkIGZvciBrZXkgXCInICsga2V5ICsgJ1wiJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByZWR1Y2Vyc1trZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmaW5hbFJlZHVjZXJzW2tleV0gPSByZWR1Y2Vyc1trZXldO1xuICAgIH1cbiAgfVxuICB2YXIgZmluYWxSZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKGZpbmFsUmVkdWNlcnMpO1xuXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgdmFyIHVuZXhwZWN0ZWRLZXlDYWNoZSA9IHt9O1xuICB9XG5cbiAgdmFyIHNhbml0eUVycm9yO1xuICB0cnkge1xuICAgIGFzc2VydFJlZHVjZXJTYW5pdHkoZmluYWxSZWR1Y2Vycyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzYW5pdHlFcnJvciA9IGU7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gY29tYmluYXRpb24oKSB7XG4gICAgdmFyIHN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50c1sxXTtcblxuICAgIGlmIChzYW5pdHlFcnJvcikge1xuICAgICAgdGhyb3cgc2FuaXR5RXJyb3I7XG4gICAgfVxuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIHZhciB3YXJuaW5nTWVzc2FnZSA9IGdldFVuZXhwZWN0ZWRTdGF0ZVNoYXBlV2FybmluZ01lc3NhZ2Uoc3RhdGUsIGZpbmFsUmVkdWNlcnMsIGFjdGlvbiwgdW5leHBlY3RlZEtleUNhY2hlKTtcbiAgICAgIGlmICh3YXJuaW5nTWVzc2FnZSkge1xuICAgICAgICAoMCwgX3dhcm5pbmcyWydkZWZhdWx0J10pKHdhcm5pbmdNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaGFzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHZhciBuZXh0U3RhdGUgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbmFsUmVkdWNlcktleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBmaW5hbFJlZHVjZXJLZXlzW2ldO1xuICAgICAgdmFyIHJlZHVjZXIgPSBmaW5hbFJlZHVjZXJzW2tleV07XG4gICAgICB2YXIgcHJldmlvdXNTdGF0ZUZvcktleSA9IHN0YXRlW2tleV07XG4gICAgICB2YXIgbmV4dFN0YXRlRm9yS2V5ID0gcmVkdWNlcihwcmV2aW91c1N0YXRlRm9yS2V5LCBhY3Rpb24pO1xuICAgICAgaWYgKHR5cGVvZiBuZXh0U3RhdGVGb3JLZXkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciBlcnJvck1lc3NhZ2UgPSBnZXRVbmRlZmluZWRTdGF0ZUVycm9yTWVzc2FnZShrZXksIGFjdGlvbik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgbmV4dFN0YXRlW2tleV0gPSBuZXh0U3RhdGVGb3JLZXk7XG4gICAgICBoYXNDaGFuZ2VkID0gaGFzQ2hhbmdlZCB8fCBuZXh0U3RhdGVGb3JLZXkgIT09IHByZXZpb3VzU3RhdGVGb3JLZXk7XG4gICAgfVxuICAgIHJldHVybiBoYXNDaGFuZ2VkID8gbmV4dFN0YXRlIDogc3RhdGU7XG4gIH07XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNvbXBvc2U7XG4vKipcbiAqIENvbXBvc2VzIHNpbmdsZS1hcmd1bWVudCBmdW5jdGlvbnMgZnJvbSByaWdodCB0byBsZWZ0LiBUaGUgcmlnaHRtb3N0XG4gKiBmdW5jdGlvbiBjYW4gdGFrZSBtdWx0aXBsZSBhcmd1bWVudHMgYXMgaXQgcHJvdmlkZXMgdGhlIHNpZ25hdHVyZSBmb3JcbiAqIHRoZSByZXN1bHRpbmcgY29tcG9zaXRlIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IGZ1bmNzIFRoZSBmdW5jdGlvbnMgdG8gY29tcG9zZS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiBvYnRhaW5lZCBieSBjb21wb3NpbmcgdGhlIGFyZ3VtZW50IGZ1bmN0aW9uc1xuICogZnJvbSByaWdodCB0byBsZWZ0LiBGb3IgZXhhbXBsZSwgY29tcG9zZShmLCBnLCBoKSBpcyBpZGVudGljYWwgdG8gZG9pbmdcbiAqICguLi5hcmdzKSA9PiBmKGcoaCguLi5hcmdzKSkpLlxuICovXG5cbmZ1bmN0aW9uIGNvbXBvc2UoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBmdW5jcyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGZ1bmNzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gIH1cblxuICBpZiAoZnVuY3MubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGZ1bmNzWzBdO1xuICB9XG5cbiAgdmFyIGxhc3QgPSBmdW5jc1tmdW5jcy5sZW5ndGggLSAxXTtcbiAgdmFyIHJlc3QgPSBmdW5jcy5zbGljZSgwLCAtMSk7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHJlc3QucmVkdWNlUmlnaHQoZnVuY3Rpb24gKGNvbXBvc2VkLCBmKSB7XG4gICAgICByZXR1cm4gZihjb21wb3NlZCk7XG4gICAgfSwgbGFzdC5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuQWN0aW9uVHlwZXMgPSB1bmRlZmluZWQ7XG5leHBvcnRzWydkZWZhdWx0J10gPSBjcmVhdGVTdG9yZTtcblxudmFyIF9pc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoL2lzUGxhaW5PYmplY3QnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzUGxhaW5PYmplY3QpO1xuXG52YXIgX3N5bWJvbE9ic2VydmFibGUgPSByZXF1aXJlKCdzeW1ib2wtb2JzZXJ2YWJsZScpO1xuXG52YXIgX3N5bWJvbE9ic2VydmFibGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3ltYm9sT2JzZXJ2YWJsZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuLyoqXG4gKiBUaGVzZSBhcmUgcHJpdmF0ZSBhY3Rpb24gdHlwZXMgcmVzZXJ2ZWQgYnkgUmVkdXguXG4gKiBGb3IgYW55IHVua25vd24gYWN0aW9ucywgeW91IG11c3QgcmV0dXJuIHRoZSBjdXJyZW50IHN0YXRlLlxuICogSWYgdGhlIGN1cnJlbnQgc3RhdGUgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUuXG4gKiBEbyBub3QgcmVmZXJlbmNlIHRoZXNlIGFjdGlvbiB0eXBlcyBkaXJlY3RseSBpbiB5b3VyIGNvZGUuXG4gKi9cbnZhciBBY3Rpb25UeXBlcyA9IGV4cG9ydHMuQWN0aW9uVHlwZXMgPSB7XG4gIElOSVQ6ICdAQHJlZHV4L0lOSVQnXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBSZWR1eCBzdG9yZSB0aGF0IGhvbGRzIHRoZSBzdGF0ZSB0cmVlLlxuICogVGhlIG9ubHkgd2F5IHRvIGNoYW5nZSB0aGUgZGF0YSBpbiB0aGUgc3RvcmUgaXMgdG8gY2FsbCBgZGlzcGF0Y2goKWAgb24gaXQuXG4gKlxuICogVGhlcmUgc2hvdWxkIG9ubHkgYmUgYSBzaW5nbGUgc3RvcmUgaW4geW91ciBhcHAuIFRvIHNwZWNpZnkgaG93IGRpZmZlcmVudFxuICogcGFydHMgb2YgdGhlIHN0YXRlIHRyZWUgcmVzcG9uZCB0byBhY3Rpb25zLCB5b3UgbWF5IGNvbWJpbmUgc2V2ZXJhbCByZWR1Y2Vyc1xuICogaW50byBhIHNpbmdsZSByZWR1Y2VyIGZ1bmN0aW9uIGJ5IHVzaW5nIGBjb21iaW5lUmVkdWNlcnNgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlZHVjZXIgQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIG5leHQgc3RhdGUgdHJlZSwgZ2l2ZW5cbiAqIHRoZSBjdXJyZW50IHN0YXRlIHRyZWUgYW5kIHRoZSBhY3Rpb24gdG8gaGFuZGxlLlxuICpcbiAqIEBwYXJhbSB7YW55fSBbcHJlbG9hZGVkU3RhdGVdIFRoZSBpbml0aWFsIHN0YXRlLiBZb3UgbWF5IG9wdGlvbmFsbHkgc3BlY2lmeSBpdFxuICogdG8gaHlkcmF0ZSB0aGUgc3RhdGUgZnJvbSB0aGUgc2VydmVyIGluIHVuaXZlcnNhbCBhcHBzLCBvciB0byByZXN0b3JlIGFcbiAqIHByZXZpb3VzbHkgc2VyaWFsaXplZCB1c2VyIHNlc3Npb24uXG4gKiBJZiB5b3UgdXNlIGBjb21iaW5lUmVkdWNlcnNgIHRvIHByb2R1Y2UgdGhlIHJvb3QgcmVkdWNlciBmdW5jdGlvbiwgdGhpcyBtdXN0IGJlXG4gKiBhbiBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzaGFwZSBhcyBgY29tYmluZVJlZHVjZXJzYCBrZXlzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVuaGFuY2VyIFRoZSBzdG9yZSBlbmhhbmNlci4gWW91IG1heSBvcHRpb25hbGx5IHNwZWNpZnkgaXRcbiAqIHRvIGVuaGFuY2UgdGhlIHN0b3JlIHdpdGggdGhpcmQtcGFydHkgY2FwYWJpbGl0aWVzIHN1Y2ggYXMgbWlkZGxld2FyZSxcbiAqIHRpbWUgdHJhdmVsLCBwZXJzaXN0ZW5jZSwgZXRjLiBUaGUgb25seSBzdG9yZSBlbmhhbmNlciB0aGF0IHNoaXBzIHdpdGggUmVkdXhcbiAqIGlzIGBhcHBseU1pZGRsZXdhcmUoKWAuXG4gKlxuICogQHJldHVybnMge1N0b3JlfSBBIFJlZHV4IHN0b3JlIHRoYXQgbGV0cyB5b3UgcmVhZCB0aGUgc3RhdGUsIGRpc3BhdGNoIGFjdGlvbnNcbiAqIGFuZCBzdWJzY3JpYmUgdG8gY2hhbmdlcy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlU3RvcmUocmVkdWNlciwgcHJlbG9hZGVkU3RhdGUsIGVuaGFuY2VyKSB7XG4gIHZhciBfcmVmMjtcblxuICBpZiAodHlwZW9mIHByZWxvYWRlZFN0YXRlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBlbmhhbmNlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBlbmhhbmNlciA9IHByZWxvYWRlZFN0YXRlO1xuICAgIHByZWxvYWRlZFN0YXRlID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBlbmhhbmNlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIGVuaGFuY2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSBlbmhhbmNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIHJldHVybiBlbmhhbmNlcihjcmVhdGVTdG9yZSkocmVkdWNlciwgcHJlbG9hZGVkU3RhdGUpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiByZWR1Y2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgcmVkdWNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIGN1cnJlbnRSZWR1Y2VyID0gcmVkdWNlcjtcbiAgdmFyIGN1cnJlbnRTdGF0ZSA9IHByZWxvYWRlZFN0YXRlO1xuICB2YXIgY3VycmVudExpc3RlbmVycyA9IFtdO1xuICB2YXIgbmV4dExpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnM7XG4gIHZhciBpc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpIHtcbiAgICBpZiAobmV4dExpc3RlbmVycyA9PT0gY3VycmVudExpc3RlbmVycykge1xuICAgICAgbmV4dExpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnMuc2xpY2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIHN0YXRlIHRyZWUgbWFuYWdlZCBieSB0aGUgc3RvcmUuXG4gICAqXG4gICAqIEByZXR1cm5zIHthbnl9IFRoZSBjdXJyZW50IHN0YXRlIHRyZWUgb2YgeW91ciBhcHBsaWNhdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIGdldFN0YXRlKCkge1xuICAgIHJldHVybiBjdXJyZW50U3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGNoYW5nZSBsaXN0ZW5lci4gSXQgd2lsbCBiZSBjYWxsZWQgYW55IHRpbWUgYW4gYWN0aW9uIGlzIGRpc3BhdGNoZWQsXG4gICAqIGFuZCBzb21lIHBhcnQgb2YgdGhlIHN0YXRlIHRyZWUgbWF5IHBvdGVudGlhbGx5IGhhdmUgY2hhbmdlZC4gWW91IG1heSB0aGVuXG4gICAqIGNhbGwgYGdldFN0YXRlKClgIHRvIHJlYWQgdGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBpbnNpZGUgdGhlIGNhbGxiYWNrLlxuICAgKlxuICAgKiBZb3UgbWF5IGNhbGwgYGRpc3BhdGNoKClgIGZyb20gYSBjaGFuZ2UgbGlzdGVuZXIsIHdpdGggdGhlIGZvbGxvd2luZ1xuICAgKiBjYXZlYXRzOlxuICAgKlxuICAgKiAxLiBUaGUgc3Vic2NyaXB0aW9ucyBhcmUgc25hcHNob3R0ZWQganVzdCBiZWZvcmUgZXZlcnkgYGRpc3BhdGNoKClgIGNhbGwuXG4gICAqIElmIHlvdSBzdWJzY3JpYmUgb3IgdW5zdWJzY3JpYmUgd2hpbGUgdGhlIGxpc3RlbmVycyBhcmUgYmVpbmcgaW52b2tlZCwgdGhpc1xuICAgKiB3aWxsIG5vdCBoYXZlIGFueSBlZmZlY3Qgb24gdGhlIGBkaXNwYXRjaCgpYCB0aGF0IGlzIGN1cnJlbnRseSBpbiBwcm9ncmVzcy5cbiAgICogSG93ZXZlciwgdGhlIG5leHQgYGRpc3BhdGNoKClgIGNhbGwsIHdoZXRoZXIgbmVzdGVkIG9yIG5vdCwgd2lsbCB1c2UgYSBtb3JlXG4gICAqIHJlY2VudCBzbmFwc2hvdCBvZiB0aGUgc3Vic2NyaXB0aW9uIGxpc3QuXG4gICAqXG4gICAqIDIuIFRoZSBsaXN0ZW5lciBzaG91bGQgbm90IGV4cGVjdCB0byBzZWUgYWxsIHN0YXRlIGNoYW5nZXMsIGFzIHRoZSBzdGF0ZVxuICAgKiBtaWdodCBoYXZlIGJlZW4gdXBkYXRlZCBtdWx0aXBsZSB0aW1lcyBkdXJpbmcgYSBuZXN0ZWQgYGRpc3BhdGNoKClgIGJlZm9yZVxuICAgKiB0aGUgbGlzdGVuZXIgaXMgY2FsbGVkLiBJdCBpcywgaG93ZXZlciwgZ3VhcmFudGVlZCB0aGF0IGFsbCBzdWJzY3JpYmVyc1xuICAgKiByZWdpc3RlcmVkIGJlZm9yZSB0aGUgYGRpc3BhdGNoKClgIHN0YXJ0ZWQgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGUgbGF0ZXN0XG4gICAqIHN0YXRlIGJ5IHRoZSB0aW1lIGl0IGV4aXRzLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBBIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgb24gZXZlcnkgZGlzcGF0Y2guXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiB0byByZW1vdmUgdGhpcyBjaGFuZ2UgbGlzdGVuZXIuXG4gICAqL1xuICBmdW5jdGlvbiBzdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGxpc3RlbmVyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgdmFyIGlzU3Vic2NyaWJlZCA9IHRydWU7XG5cbiAgICBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCk7XG4gICAgbmV4dExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiB1bnN1YnNjcmliZSgpIHtcbiAgICAgIGlmICghaXNTdWJzY3JpYmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaXNTdWJzY3JpYmVkID0gZmFsc2U7XG5cbiAgICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICAgIHZhciBpbmRleCA9IG5leHRMaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICBuZXh0TGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGFuIGFjdGlvbi4gSXQgaXMgdGhlIG9ubHkgd2F5IHRvIHRyaWdnZXIgYSBzdGF0ZSBjaGFuZ2UuXG4gICAqXG4gICAqIFRoZSBgcmVkdWNlcmAgZnVuY3Rpb24sIHVzZWQgdG8gY3JlYXRlIHRoZSBzdG9yZSwgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGVcbiAgICogY3VycmVudCBzdGF0ZSB0cmVlIGFuZCB0aGUgZ2l2ZW4gYGFjdGlvbmAuIEl0cyByZXR1cm4gdmFsdWUgd2lsbFxuICAgKiBiZSBjb25zaWRlcmVkIHRoZSAqKm5leHQqKiBzdGF0ZSBvZiB0aGUgdHJlZSwgYW5kIHRoZSBjaGFuZ2UgbGlzdGVuZXJzXG4gICAqIHdpbGwgYmUgbm90aWZpZWQuXG4gICAqXG4gICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9ubHkgc3VwcG9ydHMgcGxhaW4gb2JqZWN0IGFjdGlvbnMuIElmIHlvdSB3YW50IHRvXG4gICAqIGRpc3BhdGNoIGEgUHJvbWlzZSwgYW4gT2JzZXJ2YWJsZSwgYSB0aHVuaywgb3Igc29tZXRoaW5nIGVsc2UsIHlvdSBuZWVkIHRvXG4gICAqIHdyYXAgeW91ciBzdG9yZSBjcmVhdGluZyBmdW5jdGlvbiBpbnRvIHRoZSBjb3JyZXNwb25kaW5nIG1pZGRsZXdhcmUuIEZvclxuICAgKiBleGFtcGxlLCBzZWUgdGhlIGRvY3VtZW50YXRpb24gZm9yIHRoZSBgcmVkdXgtdGh1bmtgIHBhY2thZ2UuIEV2ZW4gdGhlXG4gICAqIG1pZGRsZXdhcmUgd2lsbCBldmVudHVhbGx5IGRpc3BhdGNoIHBsYWluIG9iamVjdCBhY3Rpb25zIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gYWN0aW9uIEEgcGxhaW4gb2JqZWN0IHJlcHJlc2VudGluZyDigJx3aGF0IGNoYW5nZWTigJ0uIEl0IGlzXG4gICAqIGEgZ29vZCBpZGVhIHRvIGtlZXAgYWN0aW9ucyBzZXJpYWxpemFibGUgc28geW91IGNhbiByZWNvcmQgYW5kIHJlcGxheSB1c2VyXG4gICAqIHNlc3Npb25zLCBvciB1c2UgdGhlIHRpbWUgdHJhdmVsbGluZyBgcmVkdXgtZGV2dG9vbHNgLiBBbiBhY3Rpb24gbXVzdCBoYXZlXG4gICAqIGEgYHR5cGVgIHByb3BlcnR5IHdoaWNoIG1heSBub3QgYmUgYHVuZGVmaW5lZGAuIEl0IGlzIGEgZ29vZCBpZGVhIHRvIHVzZVxuICAgKiBzdHJpbmcgY29uc3RhbnRzIGZvciBhY3Rpb24gdHlwZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IEZvciBjb252ZW5pZW5jZSwgdGhlIHNhbWUgYWN0aW9uIG9iamVjdCB5b3UgZGlzcGF0Y2hlZC5cbiAgICpcbiAgICogTm90ZSB0aGF0LCBpZiB5b3UgdXNlIGEgY3VzdG9tIG1pZGRsZXdhcmUsIGl0IG1heSB3cmFwIGBkaXNwYXRjaCgpYCB0b1xuICAgKiByZXR1cm4gc29tZXRoaW5nIGVsc2UgKGZvciBleGFtcGxlLCBhIFByb21pc2UgeW91IGNhbiBhd2FpdCkuXG4gICAqL1xuICBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICBpZiAoISgwLCBfaXNQbGFpbk9iamVjdDJbJ2RlZmF1bHQnXSkoYWN0aW9uKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3Rpb25zIG11c3QgYmUgcGxhaW4gb2JqZWN0cy4gJyArICdVc2UgY3VzdG9tIG1pZGRsZXdhcmUgZm9yIGFzeW5jIGFjdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhY3Rpb24udHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aW9ucyBtYXkgbm90IGhhdmUgYW4gdW5kZWZpbmVkIFwidHlwZVwiIHByb3BlcnR5LiAnICsgJ0hhdmUgeW91IG1pc3NwZWxsZWQgYSBjb25zdGFudD8nKTtcbiAgICB9XG5cbiAgICBpZiAoaXNEaXNwYXRjaGluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VycyBtYXkgbm90IGRpc3BhdGNoIGFjdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGlzRGlzcGF0Y2hpbmcgPSB0cnVlO1xuICAgICAgY3VycmVudFN0YXRlID0gY3VycmVudFJlZHVjZXIoY3VycmVudFN0YXRlLCBhY3Rpb24pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGxpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnMgPSBuZXh0TGlzdGVuZXJzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsaXN0ZW5lcnNbaV0oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSByZWR1Y2VyIGN1cnJlbnRseSB1c2VkIGJ5IHRoZSBzdG9yZSB0byBjYWxjdWxhdGUgdGhlIHN0YXRlLlxuICAgKlxuICAgKiBZb3UgbWlnaHQgbmVlZCB0aGlzIGlmIHlvdXIgYXBwIGltcGxlbWVudHMgY29kZSBzcGxpdHRpbmcgYW5kIHlvdSB3YW50IHRvXG4gICAqIGxvYWQgc29tZSBvZiB0aGUgcmVkdWNlcnMgZHluYW1pY2FsbHkuIFlvdSBtaWdodCBhbHNvIG5lZWQgdGhpcyBpZiB5b3VcbiAgICogaW1wbGVtZW50IGEgaG90IHJlbG9hZGluZyBtZWNoYW5pc20gZm9yIFJlZHV4LlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0UmVkdWNlciBUaGUgcmVkdWNlciBmb3IgdGhlIHN0b3JlIHRvIHVzZSBpbnN0ZWFkLlxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGZ1bmN0aW9uIHJlcGxhY2VSZWR1Y2VyKG5leHRSZWR1Y2VyKSB7XG4gICAgaWYgKHR5cGVvZiBuZXh0UmVkdWNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgbmV4dFJlZHVjZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICBjdXJyZW50UmVkdWNlciA9IG5leHRSZWR1Y2VyO1xuICAgIGRpc3BhdGNoKHsgdHlwZTogQWN0aW9uVHlwZXMuSU5JVCB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcm9wZXJhYmlsaXR5IHBvaW50IGZvciBvYnNlcnZhYmxlL3JlYWN0aXZlIGxpYnJhcmllcy5cbiAgICogQHJldHVybnMge29ic2VydmFibGV9IEEgbWluaW1hbCBvYnNlcnZhYmxlIG9mIHN0YXRlIGNoYW5nZXMuXG4gICAqIEZvciBtb3JlIGluZm9ybWF0aW9uLCBzZWUgdGhlIG9ic2VydmFibGUgcHJvcG9zYWw6XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS96ZW5wYXJzaW5nL2VzLW9ic2VydmFibGVcbiAgICovXG4gIGZ1bmN0aW9uIG9ic2VydmFibGUoKSB7XG4gICAgdmFyIF9yZWY7XG5cbiAgICB2YXIgb3V0ZXJTdWJzY3JpYmUgPSBzdWJzY3JpYmU7XG4gICAgcmV0dXJuIF9yZWYgPSB7XG4gICAgICAvKipcbiAgICAgICAqIFRoZSBtaW5pbWFsIG9ic2VydmFibGUgc3Vic2NyaXB0aW9uIG1ldGhvZC5cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYnNlcnZlciBBbnkgb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgYXMgYW4gb2JzZXJ2ZXIuXG4gICAgICAgKiBUaGUgb2JzZXJ2ZXIgb2JqZWN0IHNob3VsZCBoYXZlIGEgYG5leHRgIG1ldGhvZC5cbiAgICAgICAqIEByZXR1cm5zIHtzdWJzY3JpcHRpb259IEFuIG9iamVjdCB3aXRoIGFuIGB1bnN1YnNjcmliZWAgbWV0aG9kIHRoYXQgY2FuXG4gICAgICAgKiBiZSB1c2VkIHRvIHVuc3Vic2NyaWJlIHRoZSBvYnNlcnZhYmxlIGZyb20gdGhlIHN0b3JlLCBhbmQgcHJldmVudCBmdXJ0aGVyXG4gICAgICAgKiBlbWlzc2lvbiBvZiB2YWx1ZXMgZnJvbSB0aGUgb2JzZXJ2YWJsZS5cbiAgICAgICAqL1xuICAgICAgc3Vic2NyaWJlOiBmdW5jdGlvbiBzdWJzY3JpYmUob2JzZXJ2ZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvYnNlcnZlciAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCB0aGUgb2JzZXJ2ZXIgdG8gYmUgYW4gb2JqZWN0LicpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb2JzZXJ2ZVN0YXRlKCkge1xuICAgICAgICAgIGlmIChvYnNlcnZlci5uZXh0KSB7XG4gICAgICAgICAgICBvYnNlcnZlci5uZXh0KGdldFN0YXRlKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG9ic2VydmVTdGF0ZSgpO1xuICAgICAgICB2YXIgdW5zdWJzY3JpYmUgPSBvdXRlclN1YnNjcmliZShvYnNlcnZlU3RhdGUpO1xuICAgICAgICByZXR1cm4geyB1bnN1YnNjcmliZTogdW5zdWJzY3JpYmUgfTtcbiAgICAgIH1cbiAgICB9LCBfcmVmW19zeW1ib2xPYnNlcnZhYmxlMlsnZGVmYXVsdCddXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sIF9yZWY7XG4gIH1cblxuICAvLyBXaGVuIGEgc3RvcmUgaXMgY3JlYXRlZCwgYW4gXCJJTklUXCIgYWN0aW9uIGlzIGRpc3BhdGNoZWQgc28gdGhhdCBldmVyeVxuICAvLyByZWR1Y2VyIHJldHVybnMgdGhlaXIgaW5pdGlhbCBzdGF0ZS4gVGhpcyBlZmZlY3RpdmVseSBwb3B1bGF0ZXNcbiAgLy8gdGhlIGluaXRpYWwgc3RhdGUgdHJlZS5cbiAgZGlzcGF0Y2goeyB0eXBlOiBBY3Rpb25UeXBlcy5JTklUIH0pO1xuXG4gIHJldHVybiBfcmVmMiA9IHtcbiAgICBkaXNwYXRjaDogZGlzcGF0Y2gsXG4gICAgc3Vic2NyaWJlOiBzdWJzY3JpYmUsXG4gICAgZ2V0U3RhdGU6IGdldFN0YXRlLFxuICAgIHJlcGxhY2VSZWR1Y2VyOiByZXBsYWNlUmVkdWNlclxuICB9LCBfcmVmMltfc3ltYm9sT2JzZXJ2YWJsZTJbJ2RlZmF1bHQnXV0gPSBvYnNlcnZhYmxlLCBfcmVmMjtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmNvbXBvc2UgPSBleHBvcnRzLmFwcGx5TWlkZGxld2FyZSA9IGV4cG9ydHMuYmluZEFjdGlvbkNyZWF0b3JzID0gZXhwb3J0cy5jb21iaW5lUmVkdWNlcnMgPSBleHBvcnRzLmNyZWF0ZVN0b3JlID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZVN0b3JlID0gcmVxdWlyZSgnLi9jcmVhdGVTdG9yZScpO1xuXG52YXIgX2NyZWF0ZVN0b3JlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NyZWF0ZVN0b3JlKTtcblxudmFyIF9jb21iaW5lUmVkdWNlcnMgPSByZXF1aXJlKCcuL2NvbWJpbmVSZWR1Y2VycycpO1xuXG52YXIgX2NvbWJpbmVSZWR1Y2VyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21iaW5lUmVkdWNlcnMpO1xuXG52YXIgX2JpbmRBY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4vYmluZEFjdGlvbkNyZWF0b3JzJyk7XG5cbnZhciBfYmluZEFjdGlvbkNyZWF0b3JzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2JpbmRBY3Rpb25DcmVhdG9ycyk7XG5cbnZhciBfYXBwbHlNaWRkbGV3YXJlID0gcmVxdWlyZSgnLi9hcHBseU1pZGRsZXdhcmUnKTtcblxudmFyIF9hcHBseU1pZGRsZXdhcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXBwbHlNaWRkbGV3YXJlKTtcblxudmFyIF9jb21wb3NlID0gcmVxdWlyZSgnLi9jb21wb3NlJyk7XG5cbnZhciBfY29tcG9zZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21wb3NlKTtcblxudmFyIF93YXJuaW5nID0gcmVxdWlyZSgnLi91dGlscy93YXJuaW5nJyk7XG5cbnZhciBfd2FybmluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93YXJuaW5nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG4vKlxuKiBUaGlzIGlzIGEgZHVtbXkgZnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIGZ1bmN0aW9uIG5hbWUgaGFzIGJlZW4gYWx0ZXJlZCBieSBtaW5pZmljYXRpb24uXG4qIElmIHRoZSBmdW5jdGlvbiBoYXMgYmVlbiBtaW5pZmllZCBhbmQgTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJywgd2FybiB0aGUgdXNlci5cbiovXG5mdW5jdGlvbiBpc0NydXNoZWQoKSB7fVxuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB0eXBlb2YgaXNDcnVzaGVkLm5hbWUgPT09ICdzdHJpbmcnICYmIGlzQ3J1c2hlZC5uYW1lICE9PSAnaXNDcnVzaGVkJykge1xuICAoMCwgX3dhcm5pbmcyWydkZWZhdWx0J10pKCdZb3UgYXJlIGN1cnJlbnRseSB1c2luZyBtaW5pZmllZCBjb2RlIG91dHNpZGUgb2YgTk9ERV9FTlYgPT09IFxcJ3Byb2R1Y3Rpb25cXCcuICcgKyAnVGhpcyBtZWFucyB0aGF0IHlvdSBhcmUgcnVubmluZyBhIHNsb3dlciBkZXZlbG9wbWVudCBidWlsZCBvZiBSZWR1eC4gJyArICdZb3UgY2FuIHVzZSBsb29zZS1lbnZpZnkgKGh0dHBzOi8vZ2l0aHViLmNvbS96ZXJ0b3NoL2xvb3NlLWVudmlmeSkgZm9yIGJyb3dzZXJpZnkgJyArICdvciBEZWZpbmVQbHVnaW4gZm9yIHdlYnBhY2sgKGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzAwMzAwMzEpICcgKyAndG8gZW5zdXJlIHlvdSBoYXZlIHRoZSBjb3JyZWN0IGNvZGUgZm9yIHlvdXIgcHJvZHVjdGlvbiBidWlsZC4nKTtcbn1cblxuZXhwb3J0cy5jcmVhdGVTdG9yZSA9IF9jcmVhdGVTdG9yZTJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuY29tYmluZVJlZHVjZXJzID0gX2NvbWJpbmVSZWR1Y2VyczJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuYmluZEFjdGlvbkNyZWF0b3JzID0gX2JpbmRBY3Rpb25DcmVhdG9yczJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuYXBwbHlNaWRkbGV3YXJlID0gX2FwcGx5TWlkZGxld2FyZTJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuY29tcG9zZSA9IF9jb21wb3NlMlsnZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHdhcm5pbmc7XG4vKipcbiAqIFByaW50cyBhIHdhcm5pbmcgaW4gdGhlIGNvbnNvbGUgaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIFRoZSB3YXJuaW5nIG1lc3NhZ2UuXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gd2FybmluZyhtZXNzYWdlKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG4gIHRyeSB7XG4gICAgLy8gVGhpcyBlcnJvciB3YXMgdGhyb3duIGFzIGEgY29udmVuaWVuY2Ugc28gdGhhdCBpZiB5b3UgZW5hYmxlXG4gICAgLy8gXCJicmVhayBvbiBhbGwgZXhjZXB0aW9uc1wiIGluIHlvdXIgY29uc29sZSxcbiAgICAvLyBpdCB3b3VsZCBwYXVzZSB0aGUgZXhlY3V0aW9uIGF0IHRoaXMgbGluZS5cbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tZW1wdHkgKi9cbiAgfSBjYXRjaCAoZSkge31cbiAgLyogZXNsaW50LWVuYWJsZSBuby1lbXB0eSAqL1xufSIsIi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxudmFyIHJvb3Q7XG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gQnJvd3NlciB3aW5kb3dcbiAgcm9vdCA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7IC8vIFdlYiBXb3JrZXJcbiAgcm9vdCA9IHNlbGY7XG59IGVsc2UgeyAvLyBPdGhlciBlbnZpcm9ubWVudHNcbiAgY29uc29sZS53YXJuKFwiVXNpbmcgYnJvd3Nlci1vbmx5IHZlcnNpb24gb2Ygc3VwZXJhZ2VudCBpbiBub24tYnJvd3NlciBlbnZpcm9ubWVudFwiKTtcbiAgcm9vdCA9IHRoaXM7XG59XG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpO1xudmFyIFJlcXVlc3RCYXNlID0gcmVxdWlyZSgnLi9yZXF1ZXN0LWJhc2UnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXMtb2JqZWN0Jyk7XG52YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXMtZnVuY3Rpb24nKTtcbnZhciBSZXNwb25zZUJhc2UgPSByZXF1aXJlKCcuL3Jlc3BvbnNlLWJhc2UnKTtcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxudmFyIHJlcXVlc3QgPSBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgZXhwb3J0cy5SZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG5leHBvcnRzLlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxucmVxdWVzdC5nZXRYSFIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0XG4gICAgICAmJiAoIXJvb3QubG9jYXRpb24gfHwgJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sXG4gICAgICAgICAgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgdGhyb3cgRXJyb3IoXCJCcm93c2VyLW9ubHkgdmVyaXNvbiBvZiBzdXBlcmFnZW50IGNvdWxkIG5vdCBmaW5kIFhIUlwiKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgdHJpbSA9ICcnLnRyaW1cbiAgPyBmdW5jdGlvbihzKSB7IHJldHVybiBzLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7IH07XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHBhaXJzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCBvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBIZWxwcyAnc2VyaWFsaXplJyB3aXRoIHNlcmlhbGl6aW5nIGFycmF5cy5cbiAqIE11dGF0ZXMgdGhlIHBhaXJzIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhaXJzXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqL1xuXG5mdW5jdGlvbiBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2YWwpIHtcbiAgaWYgKHZhbCAhPSBudWxsKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgdmFsLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodmFsKSkge1xuICAgICAgZm9yKHZhciBzdWJrZXkgaW4gdmFsKSB7XG4gICAgICAgIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBrZXkgKyAnWycgKyBzdWJrZXkgKyAnXScsIHZhbFtzdWJrZXldKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICAgICArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodmFsID09PSBudWxsKSB7XG4gICAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2Ugc2VyaWFsaXphdGlvbiBtZXRob2QuXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0ID0gc2VyaWFsaXplO1xuXG4gLyoqXG4gICogUGFyc2UgdGhlIGdpdmVuIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBgc3RyYC5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICogQGFwaSBwcml2YXRlXG4gICovXG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuICB2YXIgb2JqID0ge307XG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdCgnJicpO1xuICB2YXIgcGFpcjtcbiAgdmFyIHBvcztcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcG9zID0gcGFpci5pbmRleE9mKCc9Jyk7XG4gICAgaWYgKHBvcyA9PSAtMSkge1xuICAgICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYWlyKV0gPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYWlyLnNsaWNlKDAsIHBvcykpXSA9XG4gICAgICAgIGRlY29kZVVSSUNvbXBvbmVudChwYWlyLnNsaWNlKHBvcyArIDEpKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAnYXBwbGljYXRpb24veG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICAnYXBwbGljYXRpb24vanNvbic6IEpTT04uc3RyaW5naWZ5XG4gfTtcblxuIC8qKlxuICAqIERlZmF1bHQgcGFyc2Vycy5cbiAgKlxuICAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICAqICAgICB9O1xuICAqXG4gICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyKSB7XG4gIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICB2YXIgZmllbGRzID0ge307XG4gIHZhciBpbmRleDtcbiAgdmFyIGxpbmU7XG4gIHZhciBmaWVsZDtcbiAgdmFyIHZhbDtcblxuICBsaW5lcy5wb3AoKTsgLy8gdHJhaWxpbmcgQ1JMRlxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG1pbWVgIGlzIGpzb24gb3IgaGFzICtqc29uIHN0cnVjdHVyZWQgc3ludGF4IHN1ZmZpeC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWltZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSlNPTihtaW1lKSB7XG4gIHJldHVybiAvW1xcLytdanNvblxcYi8udGVzdChtaW1lKTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXNwb25zZWAgd2l0aCB0aGUgZ2l2ZW4gYHhocmAuXG4gKlxuICogIC0gc2V0IGZsYWdzICgub2ssIC5lcnJvciwgZXRjKVxuICogIC0gcGFyc2UgaGVhZGVyXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogIEFsaWFzaW5nIGBzdXBlcmFnZW50YCBhcyBgcmVxdWVzdGAgaXMgbmljZTpcbiAqXG4gKiAgICAgIHJlcXVlc3QgPSBzdXBlcmFnZW50O1xuICpcbiAqICBXZSBjYW4gdXNlIHRoZSBwcm9taXNlLWxpa2UgQVBJLCBvciBwYXNzIGNhbGxiYWNrczpcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJykuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJywgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgU2VuZGluZyBkYXRhIGNhbiBiZSBjaGFpbmVkOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5zZW5kKClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnBvc3QoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIE9yIGZ1cnRoZXIgcmVkdWNlZCB0byBhIHNpbmdsZSBjYWxsIGZvciBzaW1wbGUgY2FzZXM6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogQHBhcmFtIHtYTUxIVFRQUmVxdWVzdH0geGhyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gUmVzcG9uc2UocmVxLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLnJlcSA9IHJlcTtcbiAgdGhpcy54aHIgPSB0aGlzLnJlcS54aHI7XG4gIC8vIHJlc3BvbnNlVGV4dCBpcyBhY2Nlc3NpYmxlIG9ubHkgaWYgcmVzcG9uc2VUeXBlIGlzICcnIG9yICd0ZXh0JyBhbmQgb24gb2xkZXIgYnJvd3NlcnNcbiAgdGhpcy50ZXh0ID0gKCh0aGlzLnJlcS5tZXRob2QgIT0nSEVBRCcgJiYgKHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJycgfHwgdGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAndGV4dCcpKSB8fCB0eXBlb2YgdGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAndW5kZWZpbmVkJylcbiAgICAgPyB0aGlzLnhoci5yZXNwb25zZVRleHRcbiAgICAgOiBudWxsO1xuICB0aGlzLnN0YXR1c1RleHQgPSB0aGlzLnJlcS54aHIuc3RhdHVzVGV4dDtcbiAgdmFyIHN0YXR1cyA9IHRoaXMueGhyLnN0YXR1cztcbiAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICBpZiAoc3RhdHVzID09PSAxMjIzKSB7XG4gICAgICBzdGF0dXMgPSAyMDQ7XG4gIH1cbiAgdGhpcy5fc2V0U3RhdHVzUHJvcGVydGllcyhzdGF0dXMpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgY29udGVudC10eXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG4gIHRoaXMuX3NldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuXG4gIGlmIChudWxsID09PSB0aGlzLnRleHQgJiYgcmVxLl9yZXNwb25zZVR5cGUpIHtcbiAgICB0aGlzLmJvZHkgPSB0aGlzLnhoci5yZXNwb25zZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgICA/IHRoaXMuX3BhcnNlQm9keSh0aGlzLnRleHQgPyB0aGlzLnRleHQgOiB0aGlzLnhoci5yZXNwb25zZSlcbiAgICAgIDogbnVsbDtcbiAgfVxufVxuXG5SZXNwb25zZUJhc2UoUmVzcG9uc2UucHJvdG90eXBlKTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5fcGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICBpZih0aGlzLnJlcS5fcGFyc2VyKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxLl9wYXJzZXIodGhpcywgc3RyKTtcbiAgfVxuICBpZiAoIXBhcnNlICYmIGlzSlNPTih0aGlzLnR5cGUpKSB7XG4gICAgcGFyc2UgPSByZXF1ZXN0LnBhcnNlWydhcHBsaWNhdGlvbi9qc29uJ107XG4gIH1cbiAgcmV0dXJuIHBhcnNlICYmIHN0ciAmJiAoc3RyLmxlbmd0aCB8fCBzdHIgaW5zdGFuY2VvZiBPYmplY3QpXG4gICAgPyBwYXJzZShzdHIpXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciByZXEgPSB0aGlzLnJlcTtcbiAgdmFyIG1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gIHZhciB1cmwgPSByZXEudXJsO1xuXG4gIHZhciBtc2cgPSAnY2Fubm90ICcgKyBtZXRob2QgKyAnICcgKyB1cmwgKyAnICgnICsgdGhpcy5zdGF0dXMgKyAnKSc7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IobXNnKTtcbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gbWV0aG9kO1xuICBlcnIudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9OyAvLyBwcmVzZXJ2ZXMgaGVhZGVyIG5hbWUgY2FzZVxuICB0aGlzLl9oZWFkZXIgPSB7fTsgLy8gY29lcmNlcyBoZWFkZXIgbmFtZXMgdG8gbG93ZXJjYXNlXG4gIHRoaXMub24oJ2VuZCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGVyciA9IG51bGw7XG4gICAgdmFyIHJlcyA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgZXJyID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVyci5vcmlnaW5hbCA9IGU7XG4gICAgICAvLyBpc3N1ZSAjNjc1OiByZXR1cm4gdGhlIHJhdyByZXNwb25zZSBpZiB0aGUgcmVzcG9uc2UgcGFyc2luZyBmYWlsc1xuICAgICAgaWYgKHNlbGYueGhyKSB7XG4gICAgICAgIC8vIGllOSBkb2Vzbid0IGhhdmUgJ3Jlc3BvbnNlJyBwcm9wZXJ0eVxuICAgICAgICBlcnIucmF3UmVzcG9uc2UgPSB0eXBlb2Ygc2VsZi54aHIucmVzcG9uc2VUeXBlID09ICd1bmRlZmluZWQnID8gc2VsZi54aHIucmVzcG9uc2VUZXh0IDogc2VsZi54aHIucmVzcG9uc2U7XG4gICAgICAgIC8vIGlzc3VlICM4NzY6IHJldHVybiB0aGUgaHR0cCBzdGF0dXMgY29kZSBpZiB0aGUgcmVzcG9uc2UgcGFyc2luZyBmYWlsc1xuICAgICAgICBlcnIuc3RhdHVzID0gc2VsZi54aHIuc3RhdHVzID8gc2VsZi54aHIuc3RhdHVzIDogbnVsbDtcbiAgICAgICAgZXJyLnN0YXR1c0NvZGUgPSBlcnIuc3RhdHVzOyAvLyBiYWNrd2FyZHMtY29tcGF0IG9ubHlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVyci5yYXdSZXNwb25zZSA9IG51bGw7XG4gICAgICAgIGVyci5zdGF0dXMgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIpO1xuICAgIH1cblxuICAgIHNlbGYuZW1pdCgncmVzcG9uc2UnLCByZXMpO1xuXG4gICAgdmFyIG5ld19lcnI7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghc2VsZi5faXNSZXNwb25zZU9LKHJlcykpIHtcbiAgICAgICAgbmV3X2VyciA9IG5ldyBFcnJvcihyZXMuc3RhdHVzVGV4dCB8fCAnVW5zdWNjZXNzZnVsIEhUVFAgcmVzcG9uc2UnKTtcbiAgICAgICAgbmV3X2Vyci5vcmlnaW5hbCA9IGVycjtcbiAgICAgICAgbmV3X2Vyci5yZXNwb25zZSA9IHJlcztcbiAgICAgICAgbmV3X2Vyci5zdGF0dXMgPSByZXMuc3RhdHVzO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgbmV3X2VyciA9IGU7IC8vICM5ODUgdG91Y2hpbmcgcmVzIG1heSBjYXVzZSBJTlZBTElEX1NUQVRFX0VSUiBvbiBvbGQgQW5kcm9pZFxuICAgIH1cblxuICAgIC8vICMxMDAwIGRvbid0IGNhdGNoIGVycm9ycyBmcm9tIHRoZSBjYWxsYmFjayB0byBhdm9pZCBkb3VibGUgY2FsbGluZyBpdFxuICAgIGlmIChuZXdfZXJyKSB7XG4gICAgICBzZWxmLmNhbGxiYWNrKG5ld19lcnIsIHJlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYCBhbmQgYFJlcXVlc3RCYXNlYC5cbiAqL1xuXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcblJlcXVlc3RCYXNlKFJlcXVlc3QucHJvdG90eXBlKTtcblxuLyoqXG4gKiBTZXQgQ29udGVudC1UeXBlIHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi94bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0NvbnRlbnQtVHlwZScsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQWNjZXB0IHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgd2l0aCAndHlwZScgcHJvcGVydHkgJ2F1dG8nIG9yICdiYXNpYycgKGRlZmF1bHQgJ2Jhc2ljJylcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzcywgb3B0aW9ucyl7XG4gIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7XG4gICAgICB0eXBlOiAnZnVuY3Rpb24nID09PSB0eXBlb2YgYnRvYSA/ICdiYXNpYycgOiAnYXV0bycsXG4gICAgfVxuICB9XG5cbiAgc3dpdGNoIChvcHRpb25zLnR5cGUpIHtcbiAgICBjYXNlICdiYXNpYyc6XG4gICAgICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgYnRvYSh1c2VyICsgJzonICsgcGFzcykpO1xuICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYXV0byc6XG4gICAgICB0aGlzLnVzZXJuYW1lID0gdXNlcjtcbiAgICAgIHRoaXMucGFzc3dvcmQgPSBwYXNzO1xuICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4qXG4qIEV4YW1wbGVzOlxuKlxuKiAgIHJlcXVlc3QuZ2V0KCcvc2hvZXMnKVxuKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbipcbiogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4qIEBhcGkgcHVibGljXG4qL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB2YWwgPSBzZXJpYWxpemUodmFsKTtcbiAgaWYgKHZhbCkgdGhpcy5fcXVlcnkucHVzaCh2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUXVldWUgdGhlIGdpdmVuIGBmaWxlYCBhcyBhbiBhdHRhY2htZW50IHRvIHRoZSBzcGVjaWZpZWQgYGZpZWxkYCxcbiAqIHdpdGggb3B0aW9uYWwgYG9wdGlvbnNgIChvciBmaWxlbmFtZSkuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKCdjb250ZW50JywgbmV3IEJsb2IoWyc8YSBpZD1cImFcIj48YiBpZD1cImJcIj5oZXkhPC9iPjwvYT4nXSwgeyB0eXBlOiBcInRleHQvaHRtbFwifSkpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge0Jsb2J8RmlsZX0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24oZmllbGQsIGZpbGUsIG9wdGlvbnMpe1xuICBpZiAodGhpcy5fZGF0YSkge1xuICAgIHRocm93IEVycm9yKFwic3VwZXJhZ2VudCBjYW4ndCBtaXggLnNlbmQoKSBhbmQgLmF0dGFjaCgpXCIpO1xuICB9XG5cbiAgdGhpcy5fZ2V0Rm9ybURhdGEoKS5hcHBlbmQoZmllbGQsIGZpbGUsIG9wdGlvbnMgfHwgZmlsZS5uYW1lKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fZ2V0Rm9ybURhdGEgPSBmdW5jdGlvbigpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB7XG4gICAgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB9XG4gIHJldHVybiB0aGlzLl9mb3JtRGF0YTtcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuXG4gIGlmIChlcnIpIHtcbiAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgfVxuXG4gIGZuKGVyciwgcmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1JlcXVlc3QgaGFzIGJlZW4gdGVybWluYXRlZFxcblBvc3NpYmxlIGNhdXNlczogdGhlIG5ldHdvcmsgaXMgb2ZmbGluZSwgT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiwgdGhlIHBhZ2UgaXMgYmVpbmcgdW5sb2FkZWQsIGV0Yy4nKTtcbiAgZXJyLmNyb3NzRG9tYWluID0gdHJ1ZTtcblxuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSB0aGlzLm1ldGhvZDtcbiAgZXJyLnVybCA9IHRoaXMudXJsO1xuXG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8vIFRoaXMgb25seSB3YXJucywgYmVjYXVzZSB0aGUgcmVxdWVzdCBpcyBzdGlsbCBsaWtlbHkgdG8gd29ya1xuUmVxdWVzdC5wcm90b3R5cGUuYnVmZmVyID0gUmVxdWVzdC5wcm90b3R5cGUuY2EgPSBSZXF1ZXN0LnByb3RvdHlwZS5hZ2VudCA9IGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUud2FybihcIlRoaXMgaXMgbm90IHN1cHBvcnRlZCBpbiBicm93c2VyIHZlcnNpb24gb2Ygc3VwZXJhZ2VudFwiKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBUaGlzIHRocm93cywgYmVjYXVzZSBpdCBjYW4ndCBzZW5kL3JlY2VpdmUgZGF0YSBhcyBleHBlY3RlZFxuUmVxdWVzdC5wcm90b3R5cGUucGlwZSA9IFJlcXVlc3QucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24oKXtcbiAgdGhyb3cgRXJyb3IoXCJTdHJlYW1pbmcgaXMgbm90IHN1cHBvcnRlZCBpbiBicm93c2VyIHZlcnNpb24gb2Ygc3VwZXJhZ2VudFwiKTtcbn07XG5cbi8qKlxuICogQ29tcG9zZSBxdWVyeXN0cmluZyB0byBhcHBlbmQgdG8gcmVxLnVybFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLl9hcHBlbmRRdWVyeVN0cmluZyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgdGhpcy51cmwgKz0gKHRoaXMudXJsLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArIHF1ZXJ5O1xuICB9XG5cbiAgaWYgKHRoaXMuX3NvcnQpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnVybC5pbmRleE9mKCc/Jyk7XG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHZhciBxdWVyeUFyciA9IHRoaXMudXJsLnN1YnN0cmluZyhpbmRleCArIDEpLnNwbGl0KCcmJyk7XG4gICAgICBpZiAoaXNGdW5jdGlvbih0aGlzLl9zb3J0KSkge1xuICAgICAgICBxdWVyeUFyci5zb3J0KHRoaXMuX3NvcnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcXVlcnlBcnIuc29ydCgpO1xuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSB0aGlzLnVybC5zdWJzdHJpbmcoMCwgaW5kZXgpICsgJz8nICsgcXVlcnlBcnIuam9pbignJicpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIGhvc3Qgb2JqZWN0LFxuICogd2UgZG9uJ3Qgd2FudCB0byBzZXJpYWxpemUgdGhlc2UgOilcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblJlcXVlc3QucHJvdG90eXBlLl9pc0hvc3QgPSBmdW5jdGlvbiBfaXNIb3N0KG9iaikge1xuICAvLyBOYXRpdmUgb2JqZWN0cyBzdHJpbmdpZnkgdG8gW29iamVjdCBGaWxlXSwgW29iamVjdCBCbG9iXSwgW29iamVjdCBGb3JtRGF0YV0sIGV0Yy5cbiAgcmV0dXJuIG9iaiAmJiAnb2JqZWN0JyA9PT0gdHlwZW9mIG9iaiAmJiAhQXJyYXkuaXNBcnJheShvYmopICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJztcbn1cblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB4aHIgPSB0aGlzLnhociA9IHJlcXVlc3QuZ2V0WEhSKCk7XG4gIHZhciBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICBpZiAodGhpcy5fZW5kQ2FsbGVkKSB7XG4gICAgY29uc29sZS53YXJuKFwiV2FybmluZzogLmVuZCgpIHdhcyBjYWxsZWQgdHdpY2UuIFRoaXMgaXMgbm90IHN1cHBvcnRlZCBpbiBzdXBlcmFnZW50XCIpO1xuICB9XG4gIHRoaXMuX2VuZENhbGxlZCA9IHRydWU7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgcmVhZHlTdGF0ZSA9IHhoci5yZWFkeVN0YXRlO1xuICAgIGlmIChyZWFkeVN0YXRlID49IDIgJiYgc2VsZi5fcmVzcG9uc2VUaW1lb3V0VGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dChzZWxmLl9yZXNwb25zZVRpbWVvdXRUaW1lcik7XG4gICAgfVxuICAgIGlmICg0ICE9IHJlYWR5U3RhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJbiBJRTksIHJlYWRzIHRvIGFueSBwcm9wZXJ0eSAoZS5nLiBzdGF0dXMpIG9mZiBvZiBhbiBhYm9ydGVkIFhIUiB3aWxsXG4gICAgLy8gcmVzdWx0IGluIHRoZSBlcnJvciBcIkNvdWxkIG5vdCBjb21wbGV0ZSB0aGUgb3BlcmF0aW9uIGR1ZSB0byBlcnJvciBjMDBjMDIzZlwiXG4gICAgdmFyIHN0YXR1cztcbiAgICB0cnkgeyBzdGF0dXMgPSB4aHIuc3RhdHVzIH0gY2F0Y2goZSkgeyBzdGF0dXMgPSAwOyB9XG5cbiAgICBpZiAoIXN0YXR1cykge1xuICAgICAgaWYgKHNlbGYudGltZWRvdXQgfHwgc2VsZi5fYWJvcnRlZCkgcmV0dXJuO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIHZhciBoYW5kbGVQcm9ncmVzcyA9IGZ1bmN0aW9uKGRpcmVjdGlvbiwgZSkge1xuICAgIGlmIChlLnRvdGFsID4gMCkge1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgIH1cbiAgICBlLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gIH1cbiAgaWYgKHRoaXMuaGFzTGlzdGVuZXJzKCdwcm9ncmVzcycpKSB7XG4gICAgdHJ5IHtcbiAgICAgIHhoci5vbnByb2dyZXNzID0gaGFuZGxlUHJvZ3Jlc3MuYmluZChudWxsLCAnZG93bmxvYWQnKTtcbiAgICAgIGlmICh4aHIudXBsb2FkKSB7XG4gICAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzLmJpbmQobnVsbCwgJ3VwbG9hZCcpO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgICAgLy8gUmVwb3J0ZWQgaGVyZTpcbiAgICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvODM3MjQ1L3htbGh0dHByZXF1ZXN0LXVwbG9hZC10aHJvd3MtaW52YWxpZC1hcmd1bWVudC13aGVuLXVzZWQtZnJvbS13ZWItd29ya2VyLWNvbnRleHRcbiAgICB9XG4gIH1cblxuICAvLyBxdWVyeXN0cmluZ1xuICB0aGlzLl9hcHBlbmRRdWVyeVN0cmluZygpO1xuXG4gIHRoaXMuX3NldFRpbWVvdXRzKCk7XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICB0cnkge1xuICAgIGlmICh0aGlzLnVzZXJuYW1lICYmIHRoaXMucGFzc3dvcmQpIHtcbiAgICAgIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSwgdGhpcy51c2VybmFtZSwgdGhpcy5wYXNzd29yZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBzZWUgIzExNDlcbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhlcnIpO1xuICB9XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBib2R5XG4gIGlmICghdGhpcy5fZm9ybURhdGEgJiYgJ0dFVCcgIT0gdGhpcy5tZXRob2QgJiYgJ0hFQUQnICE9IHRoaXMubWV0aG9kICYmICdzdHJpbmcnICE9IHR5cGVvZiBkYXRhICYmICF0aGlzLl9pc0hvc3QoZGF0YSkpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICB2YXIgY29udGVudFR5cGUgPSB0aGlzLl9oZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICAgIHZhciBzZXJpYWxpemUgPSB0aGlzLl9zZXJpYWxpemVyIHx8IHJlcXVlc3Quc2VyaWFsaXplW2NvbnRlbnRUeXBlID8gY29udGVudFR5cGUuc3BsaXQoJzsnKVswXSA6ICcnXTtcbiAgICBpZiAoIXNlcmlhbGl6ZSAmJiBpc0pTT04oY29udGVudFR5cGUpKSB7XG4gICAgICBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24vanNvbiddO1xuICAgIH1cbiAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICB9XG5cbiAgLy8gc2V0IGhlYWRlciBmaWVsZHNcbiAgZm9yICh2YXIgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAobnVsbCA9PSB0aGlzLmhlYWRlcltmaWVsZF0pIGNvbnRpbnVlO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgaWYgKHRoaXMuX3Jlc3BvbnNlVHlwZSkge1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSB0aGlzLl9yZXNwb25zZVR5cGU7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuXG4gIC8vIElFMTEgeGhyLnNlbmQodW5kZWZpbmVkKSBzZW5kcyAndW5kZWZpbmVkJyBzdHJpbmcgYXMgUE9TVCBwYXlsb2FkIChpbnN0ZWFkIG9mIG5vdGhpbmcpXG4gIC8vIFdlIG5lZWQgbnVsbCBoZXJlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gIHhoci5zZW5kKHR5cGVvZiBkYXRhICE9PSAndW5kZWZpbmVkJyA/IGRhdGEgOiBudWxsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIE9QVElPTlMgcXVlcnkgdG8gYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0Lm9wdGlvbnMgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ09QVElPTlMnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVsKHVybCwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnREVMRVRFJywgdXJsKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbnJlcXVlc3RbJ2RlbCddID0gZGVsO1xucmVxdWVzdFsnZGVsZXRlJ10gPSBkZWw7XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBbZGF0YV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IFtkYXRhXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnB1dCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUFVUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG4iLCIvKipcbiAqIENoZWNrIGlmIGBmbmAgaXMgYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzLW9iamVjdCcpO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGZuKSB7XG4gIHZhciB0YWcgPSBpc09iamVjdChmbikgPyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZm4pIDogJyc7XG4gIHJldHVybiB0YWcgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcbiIsIi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG51bGwgIT09IG9iaiAmJiAnb2JqZWN0JyA9PT0gdHlwZW9mIG9iajtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsIi8qKlxuICogTW9kdWxlIG9mIG1peGVkLWluIGZ1bmN0aW9ucyBzaGFyZWQgYmV0d2VlbiBub2RlIGFuZCBjbGllbnQgY29kZVxuICovXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzLW9iamVjdCcpO1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdEJhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gUmVxdWVzdEJhc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdEJhc2VgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdEJhc2Uob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufVxuXG4vKipcbiAqIE1peGluIHRoZSBwcm90b3R5cGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIFJlcXVlc3RCYXNlLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gUmVxdWVzdEJhc2UucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24gX2NsZWFyVGltZW91dCgpe1xuICB0aGlzLl90aW1lb3V0ID0gMDtcbiAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0ID0gMDtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3Jlc3BvbnNlVGltZW91dFRpbWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE92ZXJyaWRlIGRlZmF1bHQgcmVzcG9uc2UgYm9keSBwYXJzZXJcbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIHRvIGNvbnZlcnQgaW5jb21pbmcgZGF0YSBpbnRvIHJlcXVlc3QuYm9keVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlKGZuKXtcbiAgdGhpcy5fcGFyc2VyID0gZm47XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgZm9ybWF0IG9mIGJpbmFyeSByZXNwb25zZSBib2R5LlxuICogSW4gYnJvd3NlciB2YWxpZCBmb3JtYXRzIGFyZSAnYmxvYicgYW5kICdhcnJheWJ1ZmZlcicsXG4gKiB3aGljaCByZXR1cm4gQmxvYiBhbmQgQXJyYXlCdWZmZXIsIHJlc3BlY3RpdmVseS5cbiAqXG4gKiBJbiBOb2RlIGFsbCB2YWx1ZXMgcmVzdWx0IGluIEJ1ZmZlci5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5yZXNwb25zZVR5cGUoJ2Jsb2InKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUucmVzcG9uc2VUeXBlID0gZnVuY3Rpb24odmFsKXtcbiAgdGhpcy5fcmVzcG9uc2VUeXBlID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogT3ZlcnJpZGUgZGVmYXVsdCByZXF1ZXN0IGJvZHkgc2VyaWFsaXplclxuICpcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgdG8gY29udmVydCBkYXRhIHNldCB2aWEgLnNlbmQgb3IgLmF0dGFjaCBpbnRvIHBheWxvYWQgdG8gc2VuZFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5zZXJpYWxpemUgPSBmdW5jdGlvbiBzZXJpYWxpemUoZm4pe1xuICB0aGlzLl9zZXJpYWxpemVyID0gZm47XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGltZW91dHMuXG4gKlxuICogLSByZXNwb25zZSB0aW1lb3V0IGlzIHRpbWUgYmV0d2VlbiBzZW5kaW5nIHJlcXVlc3QgYW5kIHJlY2VpdmluZyB0aGUgZmlyc3QgYnl0ZSBvZiB0aGUgcmVzcG9uc2UuIEluY2x1ZGVzIEROUyBhbmQgY29ubmVjdGlvbiB0aW1lLlxuICogLSBkZWFkbGluZSBpcyB0aGUgdGltZSBmcm9tIHN0YXJ0IG9mIHRoZSByZXF1ZXN0IHRvIHJlY2VpdmluZyByZXNwb25zZSBib2R5IGluIGZ1bGwuIElmIHRoZSBkZWFkbGluZSBpcyB0b28gc2hvcnQgbGFyZ2UgZmlsZXMgbWF5IG5vdCBsb2FkIGF0IGFsbCBvbiBzbG93IGNvbm5lY3Rpb25zLlxuICpcbiAqIFZhbHVlIG9mIDAgb3IgZmFsc2UgbWVhbnMgbm8gdGltZW91dC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcnxPYmplY3R9IG1zIG9yIHtyZXNwb25zZSwgcmVhZCwgZGVhZGxpbmV9XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbiB0aW1lb3V0KG9wdGlvbnMpe1xuICBpZiAoIW9wdGlvbnMgfHwgJ29iamVjdCcgIT09IHR5cGVvZiBvcHRpb25zKSB7XG4gICAgdGhpcy5fdGltZW91dCA9IG9wdGlvbnM7XG4gICAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0ID0gMDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG9wdGlvbnMuZGVhZGxpbmUpIHtcbiAgICB0aGlzLl90aW1lb3V0ID0gb3B0aW9ucy5kZWFkbGluZTtcbiAgfVxuICBpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBvcHRpb25zLnJlc3BvbnNlKSB7XG4gICAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0ID0gb3B0aW9ucy5yZXNwb25zZTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUHJvbWlzZSBzdXBwb3J0XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW3JlamVjdF1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiB0aGVuKHJlc29sdmUsIHJlamVjdCkge1xuICBpZiAoIXRoaXMuX2Z1bGxmaWxsZWRQcm9taXNlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICh0aGlzLl9lbmRDYWxsZWQpIHtcbiAgICAgIGNvbnNvbGUud2FybihcIldhcm5pbmc6IHN1cGVyYWdlbnQgcmVxdWVzdCB3YXMgc2VudCB0d2ljZSwgYmVjYXVzZSBib3RoIC5lbmQoKSBhbmQgLnRoZW4oKSB3ZXJlIGNhbGxlZC4gTmV2ZXIgY2FsbCAuZW5kKCkgaWYgeW91IHVzZSBwcm9taXNlc1wiKTtcbiAgICB9XG4gICAgdGhpcy5fZnVsbGZpbGxlZFByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihpbm5lclJlc29sdmUsIGlubmVyUmVqZWN0KXtcbiAgICAgIHNlbGYuZW5kKGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgICAgICAgaWYgKGVycikgaW5uZXJSZWplY3QoZXJyKTsgZWxzZSBpbm5lclJlc29sdmUocmVzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiB0aGlzLl9mdWxsZmlsbGVkUHJvbWlzZS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG59XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5jYXRjaCA9IGZ1bmN0aW9uKGNiKSB7XG4gIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBjYik7XG59O1xuXG4vKipcbiAqIEFsbG93IGZvciBleHRlbnNpb25cbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLm9rID0gZnVuY3Rpb24oY2IpIHtcbiAgaWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiBjYikgdGhyb3cgRXJyb3IoXCJDYWxsYmFjayByZXF1aXJlZFwiKTtcbiAgdGhpcy5fb2tDYWxsYmFjayA9IGNiO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5faXNSZXNwb25zZU9LID0gZnVuY3Rpb24ocmVzKSB7XG4gIGlmICghcmVzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHRoaXMuX29rQ2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5fb2tDYWxsYmFjayhyZXMpO1xuICB9XG5cbiAgcmV0dXJuIHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDA7XG59O1xuXG5cbi8qKlxuICogR2V0IHJlcXVlc3QgaGVhZGVyIGBmaWVsZGAuXG4gKiBDYXNlLWluc2Vuc2l0aXZlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqIFRoaXMgaXMgYSBkZXByZWNhdGVkIGludGVybmFsIEFQSS4gVXNlIGAuZ2V0KGZpZWxkKWAgaW5zdGVhZC5cbiAqXG4gKiAoZ2V0SGVhZGVyIGlzIG5vIGxvbmdlciB1c2VkIGludGVybmFsbHkgYnkgdGhlIHN1cGVyYWdlbnQgY29kZSBiYXNlKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKiBAZGVwcmVjYXRlZFxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5nZXRIZWFkZXIgPSBSZXF1ZXN0QmFzZS5wcm90b3R5cGUuZ2V0O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqIENhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICogQ2FzZS1pbnNlbnNpdGl2ZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnVuc2V0KCdVc2VyLUFnZW50JylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgdGhlIGZpZWxkIGBuYW1lYCBhbmQgYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3RcbiAqIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIiByZXF1ZXN0IGJvZGllcy5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCgnZm9vJywgJ2JhcicpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCh7IGZvbzogJ2JhcicsIGJhejogJ3F1eCcgfSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZXxCdWZmZXJ8ZnMuUmVhZFN0cmVhbX0gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5maWVsZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCkge1xuXG4gIC8vIG5hbWUgc2hvdWxkIGJlIGVpdGhlciBhIHN0cmluZyBvciBhbiBvYmplY3QuXG4gIGlmIChudWxsID09PSBuYW1lIHx8ICB1bmRlZmluZWQgPT09IG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJy5maWVsZChuYW1lLCB2YWwpIG5hbWUgY2FuIG5vdCBiZSBlbXB0eScpO1xuICB9XG5cbiAgaWYgKHRoaXMuX2RhdGEpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiLmZpZWxkKCkgY2FuJ3QgYmUgdXNlZCBpZiAuc2VuZCgpIGlzIHVzZWQuIFBsZWFzZSB1c2Ugb25seSAuc2VuZCgpIG9yIG9ubHkgLmZpZWxkKCkgJiAuYXR0YWNoKClcIik7XG4gIH1cblxuICBpZiAoaXNPYmplY3QobmFtZSkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZSkge1xuICAgICAgdGhpcy5maWVsZChrZXksIG5hbWVba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgIGZvciAodmFyIGkgaW4gdmFsKSB7XG4gICAgICB0aGlzLmZpZWxkKG5hbWUsIHZhbFtpXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gdmFsIHNob3VsZCBiZSBkZWZpbmVkIG5vd1xuICBpZiAobnVsbCA9PT0gdmFsIHx8IHVuZGVmaW5lZCA9PT0gdmFsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCcuZmllbGQobmFtZSwgdmFsKSB2YWwgY2FuIG5vdCBiZSBlbXB0eScpO1xuICB9XG4gIGlmICgnYm9vbGVhbicgPT09IHR5cGVvZiB2YWwpIHtcbiAgICB2YWwgPSAnJyArIHZhbDtcbiAgfVxuICB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChuYW1lLCB2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuX2Fib3J0ZWQpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0aGlzLl9hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIgJiYgdGhpcy54aHIuYWJvcnQoKTsgLy8gYnJvd3NlclxuICB0aGlzLnJlcSAmJiB0aGlzLnJlcS5hYm9ydCgpOyAvLyBub2RlXG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICAvLyBUaGlzIGlzIGJyb3dzZXItb25seSBmdW5jdGlvbmFsaXR5LiBOb2RlIHNpZGUgaXMgbm8tb3AuXG4gIHRoaXMuX3dpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIG1heCByZWRpcmVjdHMgdG8gYG5gLiBEb2VzIG5vdGluZyBpbiBicm93c2VyIFhIUiBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5yZWRpcmVjdHMgPSBmdW5jdGlvbihuKXtcbiAgdGhpcy5fbWF4UmVkaXJlY3RzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvbnZlcnQgdG8gYSBwbGFpbiBqYXZhc2NyaXB0IG9iamVjdCAobm90IEpTT04gc3RyaW5nKSBvZiBzY2FsYXIgcHJvcGVydGllcy5cbiAqIE5vdGUgYXMgdGhpcyBtZXRob2QgaXMgZGVzaWduZWQgdG8gcmV0dXJuIGEgdXNlZnVsIG5vbi10aGlzIHZhbHVlLFxuICogaXQgY2Fubm90IGJlIGNoYWluZWQuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBkZXNjcmliaW5nIG1ldGhvZCwgdXJsLCBhbmQgZGF0YSBvZiB0aGlzIHJlcXVlc3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgbWV0aG9kOiB0aGlzLm1ldGhvZCxcbiAgICB1cmw6IHRoaXMudXJsLFxuICAgIGRhdGE6IHRoaXMuX2RhdGEsXG4gICAgaGVhZGVyczogdGhpcy5faGVhZGVyXG4gIH07XG59O1xuXG5cbi8qKlxuICogU2VuZCBgZGF0YWAgYXMgdGhlIHJlcXVlc3QgYm9keSwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9JylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCgnbmFtZT10b2JpJylcbiAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIGlzT2JqID0gaXNPYmplY3QoZGF0YSk7XG4gIHZhciB0eXBlID0gdGhpcy5faGVhZGVyWydjb250ZW50LXR5cGUnXTtcblxuICBpZiAodGhpcy5fZm9ybURhdGEpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiLnNlbmQoKSBjYW4ndCBiZSB1c2VkIGlmIC5hdHRhY2goKSBvciAuZmllbGQoKSBpcyB1c2VkLiBQbGVhc2UgdXNlIG9ubHkgLnNlbmQoKSBvciBvbmx5IC5maWVsZCgpICYgLmF0dGFjaCgpXCIpO1xuICB9XG5cbiAgaWYgKGlzT2JqICYmICF0aGlzLl9kYXRhKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSBbXTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9pc0hvc3QoZGF0YSkpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB7fTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGF0YSAmJiB0aGlzLl9kYXRhICYmIHRoaXMuX2lzSG9zdCh0aGlzLl9kYXRhKSkge1xuICAgIHRocm93IEVycm9yKFwiQ2FuJ3QgbWVyZ2UgdGhlc2Ugc2VuZCBjYWxsc1wiKTtcbiAgfVxuXG4gIC8vIG1lcmdlXG4gIGlmIChpc09iaiAmJiBpc09iamVjdCh0aGlzLl9kYXRhKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhW2tleV0gPSBkYXRhW2tleV07XG4gICAgfVxuICB9IGVsc2UgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBkYXRhKSB7XG4gICAgLy8gZGVmYXVsdCB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLl9oZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICAgIGlmICgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyA9PSB0eXBlKSB7XG4gICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGF0YVxuICAgICAgICA/IHRoaXMuX2RhdGEgKyAnJicgKyBkYXRhXG4gICAgICAgIDogZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGF0YSA9ICh0aGlzLl9kYXRhIHx8ICcnKSArIGRhdGE7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB9XG5cbiAgaWYgKCFpc09iaiB8fCB0aGlzLl9pc0hvc3QoZGF0YSkpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGRlZmF1bHQgdG8ganNvblxuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblxuLyoqXG4gKiBTb3J0IGBxdWVyeXN0cmluZ2AgYnkgdGhlIHNvcnQgZnVuY3Rpb25cbiAqXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICAgLy8gZGVmYXVsdCBvcmRlclxuICogICAgICAgcmVxdWVzdC5nZXQoJy91c2VyJylcbiAqICAgICAgICAgLnF1ZXJ5KCduYW1lPU5pY2snKVxuICogICAgICAgICAucXVlcnkoJ3NlYXJjaD1NYW5ueScpXG4gKiAgICAgICAgIC5zb3J0UXVlcnkoKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGN1c3RvbWl6ZWQgc29ydCBmdW5jdGlvblxuICogICAgICAgcmVxdWVzdC5nZXQoJy91c2VyJylcbiAqICAgICAgICAgLnF1ZXJ5KCduYW1lPU5pY2snKVxuICogICAgICAgICAucXVlcnkoJ3NlYXJjaD1NYW5ueScpXG4gKiAgICAgICAgIC5zb3J0UXVlcnkoZnVuY3Rpb24oYSwgYil7XG4gKiAgICAgICAgICAgcmV0dXJuIGEubGVuZ3RoIC0gYi5sZW5ndGg7XG4gKiAgICAgICAgIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHNvcnRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuc29ydFF1ZXJ5ID0gZnVuY3Rpb24oc29ydCkge1xuICAvLyBfc29ydCBkZWZhdWx0IHRvIHRydWUgYnV0IG90aGVyd2lzZSBjYW4gYmUgYSBmdW5jdGlvbiBvciBib29sZWFuXG4gIHRoaXMuX3NvcnQgPSB0eXBlb2Ygc29ydCA9PT0gJ3VuZGVmaW5lZCcgPyB0cnVlIDogc29ydDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLl90aW1lb3V0RXJyb3IgPSBmdW5jdGlvbihyZWFzb24sIHRpbWVvdXQpe1xuICBpZiAodGhpcy5fYWJvcnRlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgZXJyID0gbmV3IEVycm9yKHJlYXNvbiArIHRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnKTtcbiAgZXJyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICBlcnIuY29kZSA9ICdFQ09OTkFCT1JURUQnO1xuICB0aGlzLnRpbWVkb3V0ID0gdHJ1ZTtcbiAgdGhpcy5hYm9ydCgpO1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX3NldFRpbWVvdXRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBkZWFkbGluZVxuICBpZiAodGhpcy5fdGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYuX3RpbWVvdXRFcnJvcignVGltZW91dCBvZiAnLCBzZWxmLl90aW1lb3V0KTtcbiAgICB9LCB0aGlzLl90aW1lb3V0KTtcbiAgfVxuICAvLyByZXNwb25zZSB0aW1lb3V0XG4gIGlmICh0aGlzLl9yZXNwb25zZVRpbWVvdXQgJiYgIXRoaXMuX3Jlc3BvbnNlVGltZW91dFRpbWVyKSB7XG4gICAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBzZWxmLl90aW1lb3V0RXJyb3IoJ1Jlc3BvbnNlIHRpbWVvdXQgb2YgJywgc2VsZi5fcmVzcG9uc2VUaW1lb3V0KTtcbiAgICB9LCB0aGlzLl9yZXNwb25zZVRpbWVvdXQpO1xuICB9XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZUJhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gUmVzcG9uc2VCYXNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlQmFzZWAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZUJhc2Uob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufVxuXG4vKipcbiAqIE1peGluIHRoZSBwcm90b3R5cGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIFJlc3BvbnNlQmFzZS5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IFJlc3BvbnNlQmFzZS5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlQmFzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICAgIHJldHVybiB0aGlzLmhlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciByZWxhdGVkIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAudHlwZWAgdGhlIGNvbnRlbnQgdHlwZSB3aXRob3V0IHBhcmFtc1xuICpcbiAqIEEgcmVzcG9uc2Ugb2YgXCJDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLThcIlxuICogd2lsbCBwcm92aWRlIHlvdSB3aXRoIGEgYC50eXBlYCBvZiBcInRleHQvcGxhaW5cIi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZUJhc2UucHJvdG90eXBlLl9zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgICAvLyBUT0RPOiBtb2FyIVxuICAgIC8vIFRPRE86IG1ha2UgdGhpcyBhIHV0aWxcblxuICAgIC8vIGNvbnRlbnQtdHlwZVxuICAgIHZhciBjdCA9IGhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gICAgdGhpcy50eXBlID0gdXRpbHMudHlwZShjdCk7XG5cbiAgICAvLyBwYXJhbXNcbiAgICB2YXIgcGFyYW1zID0gdXRpbHMucGFyYW1zKGN0KTtcbiAgICBmb3IgKHZhciBrZXkgaW4gcGFyYW1zKSB0aGlzW2tleV0gPSBwYXJhbXNba2V5XTtcblxuICAgIHRoaXMubGlua3MgPSB7fTtcblxuICAgIC8vIGxpbmtzXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKGhlYWRlci5saW5rKSB7XG4gICAgICAgICAgICB0aGlzLmxpbmtzID0gdXRpbHMucGFyc2VMaW5rcyhoZWFkZXIubGluayk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gaWdub3JlXG4gICAgfVxufTtcblxuLyoqXG4gKiBTZXQgZmxhZ3Mgc3VjaCBhcyBgLm9rYCBiYXNlZCBvbiBgc3RhdHVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBhIDJ4eCByZXNwb25zZSB3aWxsIGdpdmUgeW91IGEgYC5va2Agb2YgX190cnVlX19cbiAqIHdoZXJlYXMgNXh4IHdpbGwgYmUgX19mYWxzZV9fIGFuZCBgLmVycm9yYCB3aWxsIGJlIF9fdHJ1ZV9fLiBUaGVcbiAqIGAuY2xpZW50RXJyb3JgIGFuZCBgLnNlcnZlckVycm9yYCBhcmUgYWxzbyBhdmFpbGFibGUgdG8gYmUgbW9yZVxuICogc3BlY2lmaWMsIGFuZCBgLnN0YXR1c1R5cGVgIGlzIHRoZSBjbGFzcyBvZiBlcnJvciByYW5naW5nIGZyb20gMS4uNVxuICogc29tZXRpbWVzIHVzZWZ1bCBmb3IgbWFwcGluZyByZXNwb25kIGNvbG9ycyBldGMuXG4gKlxuICogXCJzdWdhclwiIHByb3BlcnRpZXMgYXJlIGFsc28gZGVmaW5lZCBmb3IgY29tbW9uIGNhc2VzLiBDdXJyZW50bHkgcHJvdmlkaW5nOlxuICpcbiAqICAgLSAubm9Db250ZW50XG4gKiAgIC0gLmJhZFJlcXVlc3RcbiAqICAgLSAudW5hdXRob3JpemVkXG4gKiAgIC0gLm5vdEFjY2VwdGFibGVcbiAqICAgLSAubm90Rm91bmRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZUJhc2UucHJvdG90eXBlLl9zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgICB2YXIgdHlwZSA9IHN0YXR1cyAvIDEwMCB8IDA7XG5cbiAgICAvLyBzdGF0dXMgLyBjbGFzc1xuICAgIHRoaXMuc3RhdHVzID0gdGhpcy5zdGF0dXNDb2RlID0gc3RhdHVzO1xuICAgIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgICAvLyBiYXNpY3NcbiAgICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gICAgdGhpcy5vayA9IDIgPT0gdHlwZTtcbiAgICB0aGlzLnJlZGlyZWN0ID0gMyA9PSB0eXBlO1xuICAgIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gICAgdGhpcy5zZXJ2ZXJFcnJvciA9IDUgPT0gdHlwZTtcbiAgICB0aGlzLmVycm9yID0gKDQgPT0gdHlwZSB8fCA1ID09IHR5cGUpXG4gICAgICAgID8gdGhpcy50b0Vycm9yKClcbiAgICAgICAgOiBmYWxzZTtcblxuICAgIC8vIHN1Z2FyXG4gICAgdGhpcy5hY2NlcHRlZCA9IDIwMiA9PSBzdGF0dXM7XG4gICAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzO1xuICAgIHRoaXMuYmFkUmVxdWVzdCA9IDQwMCA9PSBzdGF0dXM7XG4gICAgdGhpcy51bmF1dGhvcml6ZWQgPSA0MDEgPT0gc3RhdHVzO1xuICAgIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gICAgdGhpcy5mb3JiaWRkZW4gPSA0MDMgPT0gc3RhdHVzO1xuICAgIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xufTtcbiIsIlxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMudHlwZSA9IGZ1bmN0aW9uKHN0cil7XG4gIHJldHVybiBzdHIuc3BsaXQoLyAqOyAqLykuc2hpZnQoKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGhlYWRlciBmaWVsZCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucGFyYW1zID0gZnVuY3Rpb24oc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5yZWR1Y2UoZnVuY3Rpb24ob2JqLCBzdHIpe1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgvICo9ICovKTtcbiAgICB2YXIga2V5ID0gcGFydHMuc2hpZnQoKTtcbiAgICB2YXIgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIFBhcnNlIExpbmsgaGVhZGVyIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnBhcnNlTGlua3MgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKiwgKi8pLnJlZHVjZShmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKjsgKi8pO1xuICAgIHZhciB1cmwgPSBwYXJ0c1swXS5zbGljZSgxLCAtMSk7XG4gICAgdmFyIHJlbCA9IHBhcnRzWzFdLnNwbGl0KC8gKj0gKi8pWzFdLnNsaWNlKDEsIC0xKTtcbiAgICBvYmpbcmVsXSA9IHVybDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIFN0cmlwIGNvbnRlbnQgcmVsYXRlZCBmaWVsZHMgZnJvbSBgaGVhZGVyYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAcmV0dXJuIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5jbGVhbkhlYWRlciA9IGZ1bmN0aW9uKGhlYWRlciwgc2hvdWxkU3RyaXBDb29raWUpe1xuICBkZWxldGUgaGVhZGVyWydjb250ZW50LXR5cGUnXTtcbiAgZGVsZXRlIGhlYWRlclsnY29udGVudC1sZW5ndGgnXTtcbiAgZGVsZXRlIGhlYWRlclsndHJhbnNmZXItZW5jb2RpbmcnXTtcbiAgZGVsZXRlIGhlYWRlclsnaG9zdCddO1xuICBpZiAoc2hvdWxkU3RyaXBDb29raWUpIHtcbiAgICBkZWxldGUgaGVhZGVyWydjb29raWUnXTtcbiAgfVxuICByZXR1cm4gaGVhZGVyO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvaW5kZXgnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9wb255ZmlsbCA9IHJlcXVpcmUoJy4vcG9ueWZpbGwnKTtcblxudmFyIF9wb255ZmlsbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wb255ZmlsbCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIHJvb3Q7IC8qIGdsb2JhbCB3aW5kb3cgKi9cblxuXG5pZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gIHJvb3QgPSBzZWxmO1xufSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICByb290ID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICByb290ID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICByb290ID0gbW9kdWxlO1xufSBlbHNlIHtcbiAgcm9vdCA9IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG59XG5cbnZhciByZXN1bHQgPSAoMCwgX3BvbnlmaWxsMlsnZGVmYXVsdCddKShyb290KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHJlc3VsdDsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuXHR2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzWydkZWZhdWx0J10gPSBzeW1ib2xPYnNlcnZhYmxlUG9ueWZpbGw7XG5mdW5jdGlvbiBzeW1ib2xPYnNlcnZhYmxlUG9ueWZpbGwocm9vdCkge1xuXHR2YXIgcmVzdWx0O1xuXHR2YXIgX1N5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5cdGlmICh0eXBlb2YgX1N5bWJvbCA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdGlmIChfU3ltYm9sLm9ic2VydmFibGUpIHtcblx0XHRcdHJlc3VsdCA9IF9TeW1ib2wub2JzZXJ2YWJsZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0ID0gX1N5bWJvbCgnb2JzZXJ2YWJsZScpO1xuXHRcdFx0X1N5bWJvbC5vYnNlcnZhYmxlID0gcmVzdWx0O1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXN1bHQgPSAnQEBvYnNlcnZhYmxlJztcblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHByb2o0ID0gcmVxdWlyZSgncHJvajQnKTtcblxuLy8gbWF0Y2ggbGF5ZXJzIGZvciBlYXNpZXIgY2hlY2tpbmdcbnZhciBuY29scyA9IDUxMCxcbiAgICBucm93cyA9IDU2MCxcbiAgICB4bGxjb3JuZXIgPSAtNDEwMDAwLFxuICAgIHlsbGNvcm5lciA9IC02NjAwMDAsXG4gICAgY2VsbHNpemUgPSAyMDAwO1xuXG52YXIgcHJval9nbWFwcyA9ICdFUFNHOjQzMjYnO1xudmFyIHByb2pfY2ltaXMgPSAnRVBTRzozMzEwJztcblxucHJvajQuZGVmcygnRVBTRzozMzEwJywnK3Byb2o9YWVhICtsYXRfMT0zNCArbGF0XzI9NDAuNSArbGF0XzA9MCArbG9uXzA9LTEyMCAreF8wPTAgK3lfMD0tNDAwMDAwMCArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmcycpO1xuXG5cbmZ1bmN0aW9uIGJvdW5kcygpIHtcbiAgdmFyIGJvdHRvbUxlZnQgPSBwcm9qNChwcm9qX2NpbWlzLCBwcm9qX2dtYXBzLCBbeGxsY29ybmVyLCB5bGxjb3JuZXJdKTtcbiAgdmFyIHRvcFJpZ2h0ID0gcHJvajQocHJval9jaW1pcywgcHJval9nbWFwcyxbeGxsY29ybmVyK25jb2xzKmNlbGxzaXplLCB5bGxjb3JuZXIrbnJvd3MqY2VsbHNpemVdKTtcbiAgdmFyIGJvdW5kcyA9IFtib3R0b21MZWZ0LCB0b3BSaWdodF07XG4gIHJldHVybiBib3VuZHM7XG59XG5cbmZ1bmN0aW9uIGdyaWRUb0JvdW5kcyhyb3csIGNvbCkge1xuICB2YXIgYm90dG9tTGVmdCA9IHByb2o0KHByb2pfY2ltaXMsIHByb2pfZ21hcHMsIFt4bGxjb3JuZXIgKyAoY29sKmNlbGxzaXplKSwgeWxsY29ybmVyICsgKChucm93cyAtIHJvdykqY2VsbHNpemUpXSk7XG4gIHZhciB0b3BSaWdodCA9IHByb2o0KHByb2pfY2ltaXMsIHByb2pfZ21hcHMsIFt4bGxjb3JuZXIgKyAoKGNvbCsxKSAqIGNlbGxzaXplKSwgeWxsY29ybmVyICsgKChucm93cyAtKHJvdysxKSkgKiBjZWxsc2l6ZSldKTtcbiAgdmFyIGJvdW5kcyA9IFtib3R0b21MZWZ0LCB0b3BSaWdodF07XG5cbiAgcmV0dXJuIGJvdW5kcztcbn1cblxuZnVuY3Rpb24gbGxUb0dyaWQobG5nLCBsYXQpIHtcbiAgaWYoIHR5cGVvZiBsbmcgPT09ICdvYmplY3QnICkge1xuICAgIGxhdCA9IGxuZy5sYXQoKTtcbiAgICBsbmcgPSBsbmcubG5nKCk7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gcHJvajQocHJval9nbWFwcywgcHJval9jaW1pcywgW2xuZywgbGF0XSk7XG5cbiAgLy8gQXNzdW1pbmcgdGhpcyBpcyB0aGUgaW5wdXQgdG8gdGhlIGdyaWQuLi4uXG4gIC8vIENvbHMgYXJlIFguIFJvd3MgYXJlIFkgYW5kIGNvdW50ZWQgZnJvbSB0aGUgdG9wIGRvd25cbiAgcmVzdWx0ID0ge1xuICAgIHJvdyA6IG5yb3dzIC0gTWF0aC5mbG9vcigocmVzdWx0WzFdIC0geWxsY29ybmVyKSAvIGNlbGxzaXplKSxcbiAgICBjb2wgOiBNYXRoLmZsb29yKChyZXN1bHRbMF0gLSB4bGxjb3JuZXIpIC8gY2VsbHNpemUpLFxuICB9O1xuXG4gIHZhciB5ID0geWxsY29ybmVyICsgKChucm93cy1yZXN1bHQucm93KSAqIGNlbGxzaXplKTtcbiAgdmFyIHggPSB4bGxjb3JuZXIgKyAocmVzdWx0LmNvbCAqIGNlbGxzaXplKSA7XG5cbiAgcmVzdWx0LnRvcFJpZ2h0ID0gcHJvajQocHJval9jaW1pcywgcHJval9nbWFwcyxbeCtjZWxsc2l6ZSwgeStjZWxsc2l6ZV0pO1xuICByZXN1bHQuYm90dG9tTGVmdCA9IHByb2o0KHByb2pfY2ltaXMsIHByb2pfZ21hcHMsW3gsIHldKTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsbFRvR3JpZCA6IGxsVG9HcmlkLFxuICB4bGxjb3JuZXIgOiB4bGxjb3JuZXIsXG4gIHlsbGNvcm5lciA6IHlsbGNvcm5lcixcbiAgY2VsbHNpemUgOiBjZWxsc2l6ZSxcbiAgYm91bmRzIDogYm91bmRzLFxuICBncmlkVG9Cb3VuZHMgOiBncmlkVG9Cb3VuZHNcbn07XG4iLCJ2YXIgZXZlbnRCdXMgPSByZXF1aXJlKCcuLi8uLi9ldmVudEJ1cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgZXZlbnRCdXMub24oJ3NldC1hcHAtc3RhdGUnLCAoZSkgPT4ge1xuICAgIHZhciByZXNwID0gY29udHJvbGxlci5zZXQoZS5zdGF0ZSk7XG4gICAgaWYoIGUuaGFuZGxlciApIGUuaGFuZGxlcihyZXNwKTtcbiAgfSk7XG5cbiAgZXZlbnRCdXMub24oJ3NldC1hcHAtbWFwLXN0YXRlJywgKGUpID0+IHtcbiAgICB2YXIgcmVzcCA9IGNvbnRyb2xsZXIuc2V0TWFwU3RhdGUoZS5zdGF0ZSk7XG4gICAgaWYoIGUuaGFuZGxlciApIGUuaGFuZGxlcihyZXNwKTtcbiAgfSk7XG59IiwidmFyIGFjdGlvbnMgPSByZXF1aXJlKCcuLi8uLi9yZWR1eC9hY3Rpb25zL2FwcFN0YXRlJyk7XG52YXIgc3RvcmUgPSByZXF1aXJlKCcuLi8uLi9yZWR1eC9zdG9yZScpO1xuXG5mdW5jdGlvbiBBcHBTdGF0ZUNvbnRyb2xsZXIoKSB7XG5cbiAgdGhpcy5zZXQgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHN0b3JlLmRpc3BhdGNoKFxuICAgICAgYWN0aW9ucy5zZXRBcHBTdGF0ZShzdGF0ZSlcbiAgICApO1xuXG4gICAgcmV0dXJuIHN0b3JlLmdldFN0YXRlKCkuYXBwU3RhdGU7XG4gIH1cblxuICB0aGlzLnNldE1hcFN0YXRlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBzdG9yZS5kaXNwYXRjaChcbiAgICAgIGFjdGlvbnMuc2V0TWFwU3RhdGUoc3RhdGUpXG4gICAgKTtcblxuICAgIHJldHVybiBzdG9yZS5nZXRTdGF0ZSgpLmFwcFN0YXRlO1xuICB9XG59XG5cbnZhciBjb250cm9sbGVyID0gbmV3IEFwcFN0YXRlQ29udHJvbGxlcigpO1xucmVxdWlyZSgnLi9ldmVudHMnKShjb250cm9sbGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb250cm9sbGVyOyIsInZhciBldmVudEJ1cyA9IHJlcXVpcmUoJy4uLy4uL2V2ZW50QnVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29udHJvbGxlcikge1xuICBldmVudEJ1cy5vbignZ2V0LWNpbWlzLWdyaWQtZGF0YScsIChlKSA9PiB7XG4gICAgdmFyIHJlc3AgPSBjb250cm9sbGVyLmdldChlLmlkKTtcbiAgICBpZiggZS5oYW5kbGVyICkgZS5oYW5kbGVyKHJlc3ApO1xuICB9KTtcblxuICBldmVudEJ1cy5vbignZ2V0LWNpbWlzLWdyaWQtZGF0ZXMnLCAoZSkgPT4ge1xuICAgIHZhciByZXNwID0gY29udHJvbGxlci5sb2FkRGF0ZXMoKTtcbiAgICBpZiggZSAmJiBlLmhhbmRsZXIgKSBlLmhhbmRsZXIocmVzcCk7XG4gIH0pO1xuXG4gIGV2ZW50QnVzLm9uKCdzZWxlY3QtY2ltaXMtZ3JpZCcsIChlKSA9PiB7XG4gICAgdmFyIHJlc3AgPSBjb250cm9sbGVyLnNlbGVjdChlLmlkKTtcbiAgICBpZiggZS5oYW5kbGVyICkgZS5oYW5kbGVyKHJlc3ApO1xuICB9KTtcbn0iLCJ2YXIgYWN0aW9ucyA9IHJlcXVpcmUoJy4uLy4uL3JlZHV4L2FjdGlvbnMvY29sbGVjdGlvbnMvY2ltaXMnKTtcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uLy4uL3JlZHV4L3N0b3JlJyk7XG5cbmZ1bmN0aW9uIENpbWlzR3JpZENvbnRyb2xsZXIoKSB7XG5cbiAgdGhpcy5sb2FkRGF0ZXMgPSBmdW5jdGlvbigpIHtcbiAgICBzdG9yZS5kaXNwYXRjaChcbiAgICAgIGFjdGlvbnMubG9hZERhdGVzKClcbiAgICApO1xuXG4gICAgcmV0dXJuIHN0b3JlLmdldFN0YXRlKCkuY29sbGVjdGlvbnMuY2ltaXMuZGF0ZXM7XG4gIH1cblxuICB0aGlzLmdldCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgc3RvcmUuZGlzcGF0Y2goXG4gICAgICBhY3Rpb25zLmxvYWREYXRhKGlkKVxuICAgICk7XG5cbiAgICByZXR1cm4gc3RvcmUuZ2V0U3RhdGUoKS5jb2xsZWN0aW9ucy5jaW1pcy5ieUlkW2lkXTtcbiAgfVxuXG4gIHRoaXMuc2VsZWN0ID0gZnVuY3Rpb24oaWQpIHtcbiAgICBzdG9yZS5kaXNwYXRjaChcbiAgICAgIGFjdGlvbnMuc2VsZWN0KGlkKVxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5nZXQoaWQpO1xuICB9XG59XG5cbnZhciBjb250cm9sbGVyID0gbmV3IENpbWlzR3JpZENvbnRyb2xsZXIoKTtcbnJlcXVpcmUoJy4vZXZlbnRzJykoY29udHJvbGxlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gY29udHJvbGxlcjsiLCJ2YXIgZXZlbnRCdXMgPSByZXF1aXJlKCcuLi8uLi9ldmVudEJ1cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgZXZlbnRCdXMub24oJ2dldC1kYXUtZGF0YScsIChlKSA9PiB7XG4gICAgdmFyIHJlc3AgPSBjb250cm9sbGVyLmdldChlLmlkKTtcbiAgICBpZiggZS5oYW5kbGVyICkgZS5oYW5kbGVyKHJlc3ApO1xuICB9KTtcblxuICBldmVudEJ1cy5vbignZ2V0LWRhdS1nZW9tZXRyeScsIChlKSA9PiB7XG4gICAgdmFyIHJlc3AgPSBjb250cm9sbGVyLmxvYWRHZW9tZXRyeSgpO1xuICAgIGlmKCBlICYmIGUuaGFuZGxlciApIGUuaGFuZGxlcihyZXNwKTtcbiAgfSk7XG5cbiAgZXZlbnRCdXMub24oJ3NlbGVjdC1kYXUnLCAoZSkgPT4ge1xuICAgIHZhciByZXNwID0gY29udHJvbGxlci5zZWxlY3QoZS5pZCk7XG4gICAgaWYoIGUuaGFuZGxlciApIGUuaGFuZGxlcihyZXNwKTtcbiAgfSk7XG59IiwidmFyIGFjdGlvbnMgPSByZXF1aXJlKCcuLi8uLi9yZWR1eC9hY3Rpb25zL2NvbGxlY3Rpb25zL2RhdScpO1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vLi4vcmVkdXgvc3RvcmUnKTtcblxuZnVuY3Rpb24gRGF1Q29udHJvbGxlcigpIHtcblxuICB0aGlzLmxvYWRHZW9tZXRyeSA9IGZ1bmN0aW9uKCkge1xuICAgIHN0b3JlLmRpc3BhdGNoKFxuICAgICAgYWN0aW9ucy5sb2FkR2VvbWV0cnkoKVxuICAgICk7XG5cbiAgICByZXR1cm4gc3RvcmUuZ2V0U3RhdGUoKS5jb2xsZWN0aW9ucy5kYXUuZ2VvbWV0cnk7XG4gIH1cblxuICB0aGlzLmdldCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgc3RvcmUuZGlzcGF0Y2goXG4gICAgICBhY3Rpb25zLmxvYWREYXRhKGlkKVxuICAgICk7XG5cbiAgICByZXR1cm4gc3RvcmUuZ2V0U3RhdGUoKS5jb2xsZWN0aW9ucy5kYXUuYnlJZFtpZF07XG4gIH1cblxuICB0aGlzLnNlbGVjdCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgc3RvcmUuZGlzcGF0Y2goXG4gICAgICBhY3Rpb25zLnNlbGVjdFpvbmUoaWQpXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzLmdldChpZCk7XG4gIH1cbn1cblxudmFyIGNvbnRyb2xsZXIgPSBuZXcgRGF1Q29udHJvbGxlcigpO1xucmVxdWlyZSgnLi9ldmVudHMnKShjb250cm9sbGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb250cm9sbGVyOyIsInZhciBldmVudEJ1cyA9IHJlcXVpcmUoJy4uLy4uL2V2ZW50QnVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29udHJvbGxlcikge1xuICBldmVudEJ1cy5vbignZ2V0LWV0by16b25lLWRhdGEnLCAoZSkgPT4ge1xuICAgIHZhciByZXNwID0gY29udHJvbGxlci5nZXQoZS5pZCk7XG4gICAgaWYoIGUuaGFuZGxlciApIGUuaGFuZGxlcihyZXNwKTtcbiAgfSk7XG5cbiAgZXZlbnRCdXMub24oJ2dldC1ldG8tem9uZS1nZW9tZXRyeScsIChlKSA9PiB7XG4gICAgdmFyIHJlc3AgPSBjb250cm9sbGVyLmxvYWRHZW9tZXRyeSgpO1xuICAgIGlmKCBlICYmIGUuaGFuZGxlciApIGUuaGFuZGxlcihyZXNwKTtcbiAgfSk7XG5cbiAgZXZlbnRCdXMub24oJ3NlbGVjdC1ldG8tem9uZScsIChlKSA9PiB7XG4gICAgdmFyIHJlc3AgPSBjb250cm9sbGVyLnNlbGVjdChlLmlkKTtcbiAgICBpZiggZS5oYW5kbGVyICkgZS5oYW5kbGVyKHJlc3ApO1xuICB9KTtcbn0iLCJ2YXIgYWN0aW9ucyA9IHJlcXVpcmUoJy4uLy4uL3JlZHV4L2FjdGlvbnMvY29sbGVjdGlvbnMvZXRvWm9uZXMnKTtcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uLy4uL3JlZHV4L3N0b3JlJyk7XG5cbmZ1bmN0aW9uIEV0b1pvbmVzQ29udHJvbGxlcigpIHtcblxuICB0aGlzLmxvYWRHZW9tZXRyeSA9IGZ1bmN0aW9uKCkge1xuICAgIHN0b3JlLmRpc3BhdGNoKFxuICAgICAgYWN0aW9ucy5sb2FkR2VvbWV0cnkoKVxuICAgICk7XG5cbiAgICByZXR1cm4gc3RvcmUuZ2V0U3RhdGUoKS5jb2xsZWN0aW9ucy5ldG9ab25lcy5nZW9tZXRyeTtcbiAgfVxuXG4gIHRoaXMuZ2V0ID0gZnVuY3Rpb24oaWQpIHtcbiAgICBzdG9yZS5kaXNwYXRjaChcbiAgICAgIGFjdGlvbnMubG9hZERhdGEoaWQpXG4gICAgKTtcblxuICAgIHJldHVybiBzdG9yZS5nZXRTdGF0ZSgpLmNvbGxlY3Rpb25zLmV0b1pvbmVzLmJ5SWRbaWRdO1xuICB9XG5cbiAgdGhpcy5zZWxlY3QgPSBmdW5jdGlvbihpZCkge1xuICAgIHN0b3JlLmRpc3BhdGNoKFxuICAgICAgYWN0aW9ucy5zZWxlY3Rab25lKGlkKVxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5nZXQoaWQpO1xuICB9XG59XG5cbnZhciBjb250cm9sbGVyID0gbmV3IEV0b1pvbmVzQ29udHJvbGxlcigpO1xucmVxdWlyZSgnLi9ldmVudHMnKShjb250cm9sbGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb250cm9sbGVyOyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjaW1pcyA6IHJlcXVpcmUoJy4vY2ltaXMnKSxcbiAgZGF1IDogcmVxdWlyZSgnLi9kYXUnKSxcbiAgZXRvWm9uZXMgOiByZXF1aXJlKCcuL2V0b1pvbmVzJyksXG4gIGFwcFN0YXRlIDogcmVxdWlyZSgnLi9hcHBTdGF0ZScpXG59IiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIkVUb1wiIDoge1xuICAgIFwibGFiZWxcIiA6IFwiUmVmZXJlbmNlIEV2YXBvdHJhbnNwaXJhdGlvblwiLFxuICAgIFwidW5pdHNcIiA6IFwibW1cIlxuICB9LFxuICBcIlRkZXdcIiA6IHtcbiAgICBcImxhYmVsXCIgOiBcIkRld3BvaW50IFRlbXBlcmF0dXJlXCIsXG4gICAgXCJ1bml0c1wiIDogXCJDXCJcbiAgfSxcbiAgXCJUeFwiIDoge1xuICAgIFwibGFiZWxcIiA6IFwiTWF4IFRlbXBlcmF0dXJlXCIsXG4gICAgXCJ1bml0c1wiIDogXCJDXCJcbiAgfSxcbiAgXCJUblwiIDoge1xuICAgIFwibGFiZWxcIiA6IFwiTWluIFRlbXBlcmF0dXJlXCIsXG4gICAgXCJ1bml0c1wiIDogXCJDXCJcbiAgfSxcbiAgXCJLXCIgOiB7XG4gICAgXCJsYWJlbFwiIDogXCJDbGVhciBTa3kgRmFjdG9yXCIsXG4gICAgXCJ1bml0c1wiIDogXCJcIlxuICB9LFxuICBcIlJubFwiIDoge1xuICAgIFwibGFiZWxcIiA6IFwiTG9uZ3dhdmUgUmFkaWF0aW9uXCIsXG4gICAgXCJ1bml0c1wiIDogXCJNVy9oXCJcbiAgfSxcbiAgXCJSc29cIiA6IHtcbiAgICBcImxhYmVsXCIgOiBcIlNob3J0d2F2ZSBSYWRpYXRpb25cIixcbiAgICBcInVuaXRzXCIgOiBcIk1XL2hcIlxuICB9LFxuICBcIlUyXCIgOiB7XG4gICAgXCJsYWJlbFwiIDogXCJXaW5kIFNwZWVkXCIsXG4gICAgXCJ1bml0c1wiIDogXCJtL3NcIlxuICB9XG59XG4iLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuLi9yZWR1eC9zdG9yZScpO1xudmFyIHN0eWxlcyA9IHJlcXVpcmUoJy4vc3R5bGUnKTtcblxuZnVuY3Rpb24gbWVyZ2Vab25lTWFwKGdlb2pzb24pIHtcbiAgZ2VvanNvbi5mZWF0dXJlcy5mb3JFYWNoKGZ1bmN0aW9uKGZlYXR1cmUsIGluZGV4KXtcbiAgICB2YXIgem9uZURhdGEgPSBnZXRab25lQnlBdmdEZWx0YShmZWF0dXJlLnByb3BlcnRpZXMuem9uZSk7XG4gICAgaWYoICF6b25lRGF0YSApIHJldHVybjtcbiAgICBmb3IoIHZhciBrZXkgaW4gem9uZURhdGEuZGF0YSApIHtcbiAgICAgIGZlYXR1cmUucHJvcGVydGllc1trZXldID0gem9uZURhdGEuZGF0YVtrZXldO1xuICAgIH1cbiAgfSk7XG5cbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgZm9yKCB2YXIgaiA9IDA7IGogPCBnZW9qc29uLmZlYXR1cmVzLmxlbmd0aDsgaisrICkge1xuICAgICAgaWYoIHN0eWxlc1tpXS56b25lID09PSBnZW9qc29uLmZlYXR1cmVzW2pdLnByb3BlcnRpZXMuem9uZSApIHtcbiAgICAgICAgc3R5bGVzW2ldID0gZ2VvanNvbi5mZWF0dXJlc1tqXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldFpvbmVCeUF2Z0RlbHRhKGlkKSB7XG4gIGZvciggdmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrICkge1xuICAgIGlmKCBzdHlsZXNbaV0uYXZnLnRvRml4ZWQoMSkrJ18nK3N0eWxlc1tpXS5kZWx0YS50b0ZpeGVkKDEpID09PSBpZCApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGEgOiBzdHlsZXNbaV0sXG4gICAgICAgIGluZGV4IDogaVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0Wm9uZShpZCkge1xuICAvKiogSEFDSyBmb3IgY3ljbGljYWwgZGVwZW5kZW5jeSAqL1xuICB2YXIgZ2VvbWV0cnkgPSByZXF1aXJlKCcuLi9yZWR1eC9zdG9yZScpLmdldFN0YXRlKCkuY29sbGVjdGlvbnMuZXRvWm9uZXMuZ2VvbWV0cnk7XG4gIGlmKCBnZW9tZXRyeS5zdGF0ZSAhPT0gJ2xvYWRlZCcgKSByZXR1cm4ge307XG5cbiAgdmFyIHpvbmVzID0gZ2VvbWV0cnkuZGF0YS5mZWF0dXJlcztcbiAgaWQgPSBwYXJzZUludChpZCk7XG4gIGZvciggdmFyIGkgPSAwOyBpIDwgem9uZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgaWYoIHpvbmVzW2ldLnByb3BlcnRpZXMuem9uZSA9PT0gaWQgKSB7XG4gICAgICByZXR1cm4gem9uZXNbaV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHt9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0Wm9uZSA6IGdldFpvbmUsXG4gIG1lcmdlWm9uZU1hcCA6IG1lcmdlWm9uZU1hcFxufSIsIm1vZHVsZS5leHBvcnRzID0gW1xuICB7XG4gICAgem9uZSAgOiAxMyxcbiAgICBhdmcgICA6IDIuMixcbiAgICBkZWx0YSA6IDAuNSxcbiAgICBjb2xvciA6ICcjMDAyNjczJ1xuICB9LFxuICB7XG4gICAgem9uZSAgOiAzLFxuICAgIGF2ZyAgIDogMi43LFxuICAgIGRlbHRhIDogMS4zLFxuICAgIGNvbG9yIDogJyM1MjkwZmEnXG4gIH0sXG4gIHtcbiAgICB6b25lICA6IDEyLFxuICAgIGF2ZyAgIDogMy4wLFxuICAgIGRlbHRhIDogMS43LFxuICAgIGNvbG9yIDogJyM3ZmI2ZjUnXG4gIH0sXG4gIHtcbiAgICB6b25lICA6IDQsXG4gICAgYXZnICAgOiAzLjAsXG4gICAgZGVsdGEgOiAyLjUsXG4gICAgY29sb3IgOiAnI2JlZjBmZidcbiAgfSxcbiAge1xuICAgIHpvbmUgIDogNixcbiAgICBhdmcgICA6IDMuMixcbiAgICBkZWx0YSA6IDIuMCxcbiAgICBjb2xvciA6ICcjMjY3MzAwJ1xuICB9LFxuICB7XG4gICAgem9uZSAgOiA4LFxuICAgIGF2ZyAgIDogMy40LFxuICAgIGRlbHRhIDogMi42LFxuICAgIGNvbG9yIDogJyMzOGE4MDAnXG4gIH0sXG4gIHtcbiAgICB6b25lICA6IDE2LFxuICAgIGF2ZyAgIDogMy43LFxuICAgIGRlbHRhIDogMi4yLFxuICAgIGNvbG9yIDogJyM5OGU2MDAnXG4gIH0sXG4gIHtcbiAgICB6b25lICA6IDEsXG4gICAgYXZnICAgOiAzLjgsXG4gICAgZGVsdGEgOiAyLjgsXG4gICAgY29sb3IgOiAnI2E4YTgwMCdcbiAgfSxcbiAge1xuICAgIHpvbmUgIDogNyxcbiAgICBhdmcgICA6IDQuMCxcbiAgICBkZWx0YSA6IDMuMSxcbiAgICBjb2xvciA6ICcjNjY4MDAwJ1xuICB9LFxuICB7XG4gICAgem9uZSAgOiAxNSxcbiAgICBhdmcgICA6IDQuNixcbiAgICBkZWx0YSA6IDMuMSxcbiAgICBjb2xvciA6ICcjNzM0YzAwJ1xuICB9LFxuICB7XG4gICAgem9uZSAgOiA1LFxuICAgIGF2ZyAgIDogNS4wLFxuICAgIGRlbHRhIDogMy4xLFxuICAgIGNvbG9yIDogJyM4OTVhNDQnXG4gIH0sXG4gIHtcbiAgICB6b25lICA6IDksXG4gICAgYXZnICAgOiA1LjAsXG4gICAgZGVsdGEgOiAzLjUsXG4gICAgY29sb3IgOiAnI2E4MzgwMCdcbiAgfSxcbiAge1xuICAgIHpvbmUgIDogMTEsXG4gICAgYXZnICAgOiA1LjMsXG4gICAgZGVsdGEgOiAzLjMsXG4gICAgY29sb3IgOiAnI2U2NGMwMCdcbiAgfSxcbiAge1xuICAgIHpvbmUgIDogMTQsXG4gICAgYXZnICAgOiA1LjUsXG4gICAgZGVsdGEgOiAzLjgsXG4gICAgY29sb3IgOiAnI2ZmYTIwMCdcbiAgfSxcbiAge1xuICAgIHpvbmUgIDogMixcbiAgICBhdmcgICA6IDYuMCxcbiAgICBkZWx0YSA6IDQuMCxcbiAgICBjb2xvciA6ICcjZmZkMDAwJ1xuICB9LFxuICB7XG4gICAgem9uZSAgOiAxMCxcbiAgICBhdmcgICA6IDYuNixcbiAgICBkZWx0YSA6IDQuMyxcbiAgICBjb2xvciA6ICcjZmZmZjAwJ1xuICB9XG5dOyIsInZhciBFdmVudHMgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBFdmVudHMoKTsiLCJ2YXIgc3RhdGV3aWRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFszLjgwMDAwMzQ0NzU5NDQ4LDMuMzcyNDE1NzA0MjYzNDMsMi45ODg0ODU1MzY5Mzk0MSwyLjcwMDEyMTA2NDg1NjAxLDIuMzg5MzAyMTQyNzM0OTgsMi4wMzEyMzE5ODUwMzgyMSwxLjc2OTA2MDU4NzI2MTA2LDEuNjAxNTIxMDk5MzgxMSwxLjQ1NTc0NDY4OTcwNTMxLDEuMjg2MzQ2ODEwMjU2ODMsMS4xMzQ3MTIyNDA0ODAzNSwxLjE0ODEyODc3NTc5Njc0LDEuMTQzMTE3MzM0NTg4NDQsMS4xNzA0OTcyMDUxOTg3OSwxLjMzMjA4MDQ0NzUyNzk4LDEuNDkxMDQ4MDI5OTg4NDQsMS41NzIwMzY2Mjk5MjQwNiwxLjcxNjEwOTQxMzYwNTcyLDEuOTYzODYxMzUxNzAxMzgsMi4wODc5Nzc0MjUxNjAyNSwyLjE5NDY2MzU3MzQxOTY1LDIuNTAyMjcwMTMxMTQwODksMy4wMzk2NDYwNDQ0NjQzNSwzLjM0MTY0MTk1NjIyNzc3LDMuNTk2MjAyNzE5NDU3NzYsMy42Mjk2ODExMzk1ODg2NSwzLjk2MjQ0ODEwNzU5OTkyLDQuMjA1MDUyMTk4NDYyMzMsNC40Njg4OTc5MDgzMjkzNiw0Ljg3Nzk4OTAzNjczMzIxLDUuMzM0ODgyNDQwOTkzNTMsNS41ODA0NzkwNzMwOTkyNSw1Ljc4NTcwMDYyNTIzNzA0LDUuNzMyMTY5MDIyMjg3NTEsNi4wNzcyOTI0Nzk0MTIwNSw2LjQxMzgzMDk0ODE3NzU3LDYuNzA0NDQwNzk5MTMwNDQsNi44OTI4Njc2MDI2MjI2LDYuOTMwMzk5NzExNzMyNDcsNi45Mjc5NTc1NjMyMTE3NCw2Ljg3NTE1MzI5MjQyODc1LDYuODEwMjc2Mzk2ODc0NDQsNi42NzY2ODY2NDkzMjIsNi41MDM1MDQ0ODgwNjE3Niw2LjM0NDczMDc0NzY5MjcsNi4yMTQzMzUyNjg4MjI0MSw2LjAzNTU0NjY3NjU4NjA4LDUuNzc5MDQxMjQ4MDM0NjgsNS40MzE5ODg1NjE0OTM1Nyw0Ljk3NDY3NDg0OTUxOTgxLDQuNjMyNDY0NzQwNjk4NzYsNC4yNzY3NzQ1MDA1ODY3OF07XG59O1xuXG52YXIgY3VtX2V0ID0gZnVuY3Rpb24gKEUsRCxkKSB7XG4gICAgdmFyIGFuZz0yKk1hdGguUEkqKGQvMzY1KTtcbiAgICB2YXIgZDE9YW5nLTIqTWF0aC5QSSooRFsxXSkvMzY1O1xuICAgIHZhciBkMj1hbmctMipNYXRoLlBJKihEWzJdLURbMV0pLzM2NTtcbiAgICB2YXIgZXQ9IChFWzBdKmQgLSAoMzY1LzIqTWF0aC5QSSkpICogKEVbMV0qTWF0aC5zaW4oZDEpICsgRVsyXSpNYXRoLnNpbihkMSkpO1xuICAgIHJldHVybiBldDtcbn07XG5cbnZhciBldCA9IGZ1bmN0aW9uIChFLEQsZCkge1xuICAgIHZhciBkMT0yKk1hdGguUEkqKGQtRFsxXSkvMzY1O1xuICAgIHZhciBkMj0oMioyKk1hdGguUEkvMzY1KSooKGQtRFsxXSktRFsyXSk7XG4gICAgdmFyIGV0PUVbMF0rRVsxXSpNYXRoLmNvcyhkMSkrRVsyXSpNYXRoLmNvcyhkMik7XG4gICAgcmV0dXJuIGV0O1xufTtcblxudmFyIGlmZnQgPSBmdW5jdGlvbiAoRSxELE4pIHtcbiAgICB2YXIgbjtcbiAgICB2YXIgZXQ9W107XG4gICAgZm9yIChuPTA7bjxOO24rKykge1xuXHRldFtuXT10aGlzLmV0KEUsRCwzNjUqKG4vTikpO1xuICAgIH1cbiAgICByZXR1cm4gZXQ7XG59O1xuXG52YXIgZmZ0ID0gZnVuY3Rpb24oZXQpIHtcbiAgICB2YXIgTj1ldC5sZW5ndGg7XG4gICAgdmFyIGksbjtcbiAgICB2YXIgcmU9W107XG4gICAgdmFyIGltPVtdO1xuICAgIHZhciBFPVtdLEQ9W107XG4gICAgdmFyIGFuZywgZXRjLCBldHM7XG5cbiAgICBmb3IgKGk9MDtpPDM7aSsrKSB7XG4gICAgXHRyZVtpXT0wO1xuXHRpbVtpXT0wO1xuXHRmb3IgKG49MDtuPE47bisrKSB7XG5cdCAgICBhbmc9MipNYXRoLlBJKm4vTjtcblx0ICAgIHJlW2ldKz1ldFtuXSpNYXRoLmNvcygtaSphbmcpO1xuXHQgICAgaW1baV0rPWV0W25dKk1hdGguc2luKC1hbmcqaSk7XG5cdH1cblx0c3dpdGNoKGkpIHtcblx0Y2FzZSAwOlxuXHQgICAgRFtpXT0wO1xuXHQgICAgRVtpXT1NYXRoLnNxcnQoTWF0aC5wb3cocmVbaV0sMikrXG5cdFx0ICAgICAgIE1hdGgucG93KGltW2ldLDIpKS9OO1xuXHQgICAgYnJlYWs7XG5cdGNhc2UgMTpcblx0ICAgIERbaV09KDM2NSAtIDM2NS8oMipNYXRoLlBJKSpNYXRoLmF0YW4yKGltW2ldLHJlW2ldKSkgJSAzNjU7XG5cdCAgICBFW2ldPTIqTWF0aC5zcXJ0KE1hdGgucG93KHJlW2ldLDIpK1xuXHRcdFx0ICAgTWF0aC5wb3coaW1baV0sMikpL047XG5cdCAgICBicmVhaztcblx0ZGVmYXVsdDpcblx0ICAgIERbaV09KCgzNjUuMC8oMipNYXRoLlBJKmkpKSooLU1hdGguYXRhbjIoaW1baV0scmVbaV0pKS1EW2ktMV0pICUgKDM2NS4wL2kpO1xuXHQgICAgRVtpXT0yKk1hdGguc3FydChNYXRoLnBvdyhyZVtpXSwyKStcblx0XHRcdCAgICAgTWF0aC5wb3coaW1baV0sMikpL047XG5cdCAgICAvLyBDZW50ZXIgb24gbWF4XG5cdCAgICBEW2ldPShEW2ldPC0zNjUuMC80KT9EW2ldKygzNjUuMC8yKTpEW2ldO1xuXHQgICAgLy8gVGhlbiBjZW50ZXIgYWdhaW4sIGJ1dCBvbiBlaXRoZXIgaGlnaCBvciBsb3dcblx0ICAgIEVbaV09KERbaV0gPCAtMzY1LjAvOCk/LUVbaV06KERbaV0gPCAzNjUuMC84KT9FW2ldOi1FW2ldO1xuXHQgICAgRFtpXT0oRFtpXSA8IC0zNjUuMC84KT9EW2ldKygzNjUuMC80KTooRFtpXSA8IDM2NS4wLzgpP0RbaV06RFtpXS0oMzY1LjAvNClcblx0fVxuICAgIH1cbiAgICByZXR1cm4oe2U6RSxkOkQscmU6cmUsaW06aW19KTtcbn07XG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzdGF0ZXdpZGU6c3RhdGV3aWRlLFxuICAgIGZmdDpmZnQsXG4gICAgZXQ6ZXQsXG4gICAgY3VtX2V0OmN1bV9ldCxcbiAgICBpZmZ0OmlmZnRcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByZWR1eCA6IHJlcXVpcmUoJy4vcmVkdXgnKSxcbiAgc2VydmljZXMgOiByZXF1aXJlKCcuL3NlcnZpY2VzJyksXG4gIGZmdCA6IHJlcXVpcmUoJy4vZmZ0JyksXG4gIGV0b1pvbmVVdGlscyA6IHJlcXVpcmUoJy4vZXRvLXpvbmVzJyksXG4gIGdyaWQgOiByZXF1aXJlKCcuL2NpbWlzLWdyaWQnKSxcbiAgdXRpbHMgOiByZXF1aXJlKCcuL3V0aWxzJyksXG4gIGRlZmluaXRpb25zIDogcmVxdWlyZSgnLi9kZWZpbml0aW9ucy5qc29uJyksXG4gIGV2ZW50QnVzIDogcmVxdWlyZSgnLi9ldmVudEJ1cycpLFxuICBjb250cm9sbGVycyA6IHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKVxufTtcbiIsIi8qKlxuICogU1RBVEUgRU5VTXNcbiAqL1xudmFyIEFDVElPTlMgPSB7XG4gIFNFVF9TRUNUSU9OIDogJ1NFVF9TRUNUSU9OJyxcbiAgU0VUX1NUQVRFIDogJ1NFVF9TVEFURScsXG4gIFNFVF9NQVBfU1RBVEUgOiAnU0VUX01BUF9TVEFURSdcbn1cblxudmFyIE1BUF9TVEFURVMgPSB7XG4gIGNpbWlzR3JpZCA6ICdjaW1pc0dyaWQnLFxuICBldG9ab25lcyA6ICdldG9ab25lcycsXG4gIGRhdVpvbmVzIDogJ2RhdVpvbmVzJyxcbiAgY2ltaXNTdGF0aW9ucyA6ICdjaW1pc1N0YXRpb25zJ1xufVxuXG52YXIgQVBQX1NFQ1RJT05TID0ge1xuICBtYXAgOiAnbWFwJyxcbiAgZGF0YSA6ICdkYXRhJyxcbiAgYWJvdXQgOiAnYWJvdXQnLFxuICBpbnN0YWxsIDogJ2luc3RhbGwnLFxuICBzdXJ2ZXkgOiAnc3VydmV5J1xufVxuXG5cbi8qKlxuICogQWN0aW9uIEZ1bmN0aW9uc1xuICovXG5mdW5jdGlvbiBzZXRBcHBTdGF0ZShzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIHR5cGUgOiBBQ1RJT05TLlNFVF9TVEFURSxcbiAgICBzdGF0ZSA6IHN0YXRlXG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0QXBwU2VjdGlvbihzZWN0aW9uKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZSA6IEFDVElPTlMuU0VUX1NFQ1RJT04sXG4gICAgc2VjdGlvbiA6IHNlY3Rpb25cbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHNldE1hcFN0YXRlKHN0YXRlKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZSA6IEFDVElPTlMuU0VUX01BUF9TVEFURSxcbiAgICBzdGF0ZSA6IHN0YXRlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEFDVElPTlMgOiBBQ1RJT05TLFxuICBNQVBfU1RBVEVTIDogTUFQX1NUQVRFUyxcbiAgQVBQX1NFQ1RJT05TIDogQVBQX1NFQ1RJT05TLFxuICBzZXRBcHBTdGF0ZSA6IHNldEFwcFN0YXRlLFxuICBzZXRBcHBTZWN0aW9uIDogc2V0QXBwU2VjdGlvbixcbiAgc2V0TWFwU3RhdGUgOiBzZXRNYXBTdGF0ZSxcbn0iLCJ2YXIgc2VydmljZXMgPSByZXF1aXJlKCcuLi8uLi8uLi9zZXJ2aWNlcy9jaW1pcycpO1xuXG4vKipcbiAqIFNUQVRFIEVOVU1zXG4gKi9cbnZhciBBQ1RJT05TID0ge1xuICBMT0FEX0NJTUlTX1JFUVVFU1Q6ICdMT0FEX0NJTUlTX1JFUVVFU1QnLCBcbiAgTE9BRF9DSU1JU19TVUNDRVNTOiAnTE9BRF9DSU1JU19TVUNDRVNTJywgXG4gIExPQURfQ0lNSVNfRkFJTFVSRTogJ0xPQURfQ0lNSVNfRkFJTFVSRScsXG5cbiAgTE9BRF9DSU1JU19EQVRFU19SRVFVRVNUOiAnTE9BRF9DSU1JU19EQVRFU19SRVFVRVNUJywgXG4gIExPQURfQ0lNSVNfREFURVNfU1VDQ0VTUzogJ0xPQURfQ0lNSVNfREFURVNfU1VDQ0VTUycsIFxuICBMT0FEX0NJTUlTX0RBVEVTX0ZBSUxVUkU6ICdMT0FEX0NJTUlTX0RBVEVTX0ZBSUxVUkUnLFxuICBcbiAgU0VMRUNUX0NJTUlTX0dSSURfTE9DQVRJT04gOiAnU0VMRUNUX0NJTUlTX0dSSURfTE9DQVRJT04nXG59XG5cbi8qKlxuICogQWN0aW9uIEZ1bmN0aW9uc1xuICovXG5mdW5jdGlvbiBsb2FkRGF0ZXMoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZXM6IFtBQ1RJT05TLkxPQURfQ0lNSVNfREFURVNfUkVRVUVTVCwgQUNUSU9OUy5MT0FEX0NJTUlTX0RBVEVTX1NVQ0NFU1MsIEFDVElPTlMuTE9BRF9DSU1JU19EQVRFU19GQUlMVVJFXSxcbiAgICBzaG91bGRDYWxsQVBJOiAoc3RhdGUpID0+IHtcbiAgICAgIHJldHVybiBzdGF0ZS5jb2xsZWN0aW9ucy5jaW1pcy5kYXRlcy5zdGF0ZSAhPT0gJ2xvYWRlZCdcbiAgICB9LFxuICAgIGNhbGxBUEk6IChjYWxsYmFjaykgPT4geyBcbiAgICAgIHNlcnZpY2VzLmxvYWREYXRlcyhjYWxsYmFjaykgO1xuICAgIH0sXG4gICAgcGF5bG9hZDoge31cbiAgfVxufVxuXG5mdW5jdGlvbiBzZWxlY3QoaWQpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlIDogQUNUSU9OUy5TRUxFQ1RfQ0lNSVNfR1JJRF9MT0NBVElPTixcbiAgICBpZCA6IGlkXG4gIH1cbn1cblxuZnVuY3Rpb24gbG9hZERhdGEoZ3JpZElkKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZXM6IFtBQ1RJT05TLkxPQURfQ0lNSVNfUkVRVUVTVCwgQUNUSU9OUy5MT0FEX0NJTUlTX1NVQ0NFU1MsIEFDVElPTlMuTE9BRF9DSU1JU19GQUlMVVJFXSxcbiAgICBzaG91bGRDYWxsQVBJOiAoc3RhdGUpID0+ICFzdGF0ZS5jb2xsZWN0aW9ucy5jaW1pcy5ieUlkW2dyaWRJZF0sXG4gICAgY2FsbEFQSTogKGNhbGxiYWNrKSA9PiB7IFxuICAgICAgc2VydmljZXMubG9hZERhdGEoZ3JpZElkLCBjYWxsYmFjayk7XG4gICAgfSxcbiAgICBwYXlsb2FkOiB7IFxuICAgICAgaWQgOiBncmlkSWRcbiAgICB9XG4gIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQUNUSU9OUyA6IEFDVElPTlMsXG4gIGxvYWREYXRlczogbG9hZERhdGVzLFxuICBsb2FkRGF0YTogbG9hZERhdGEsXG4gIHNlbGVjdCA6IHNlbGVjdFxufSIsInZhciBzZXJ2aWNlcyA9IHJlcXVpcmUoJy4uLy4uLy4uL3NlcnZpY2VzL2RhdScpO1xuXG4vKipcbiAqIFNUQVRFIEVOVU1zXG4gKi9cbnZhciBBQ1RJT05TID0ge1xuICBTRUxFQ1RfREFVX1pPTkUgOiAnU0VMRUNUX0RBVV9aT05FJyxcblxuICBMT0FEX0RBVV9SRVFVRVNUOiAnTE9BRF9EQVVfUkVRVUVTVCcsIFxuICBMT0FEX0RBVV9TVUNDRVNTOiAnTE9BRF9EQVVfU1VDQ0VTUycsIFxuICBMT0FEX0RBVV9GQUlMVVJFOiAnTE9BRF9EQVVfRkFJTFVSRScsXG5cbiAgTE9BRF9EQVVfR0VPTUVUUllfUkVRVUVTVDogJ0xPQURfREFVX0dFT01FVFJZX1JFUVVFU1QnLCBcbiAgTE9BRF9EQVVfR0VPTUVUUllfU1VDQ0VTUzogJ0xPQURfREFVX0dFT01FVFJZX1NVQ0NFU1MnLCBcbiAgTE9BRF9EQVVfR0VPTUVUUllfRkFJTFVSRTogJ0xPQURfREFVX0dFT01FVFJZX0ZBSUxVUkUnXG59XG5cblxuLyoqXG4gKiBBY3Rpb24gRnVuY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGxvYWRHZW9tZXRyeShpZCwgZGF0YSkge1xuICByZXR1cm4ge1xuICAgIHR5cGVzOiBbQUNUSU9OUy5MT0FEX0RBVV9HRU9NRVRSWV9SRVFVRVNULCBBQ1RJT05TLkxPQURfREFVX0dFT01FVFJZX1NVQ0NFU1MsIEFDVElPTlMuTE9BRF9EQVVfR0VPTUVUUllfRkFJTFVSRV0sXG4gICAgc2hvdWxkQ2FsbEFQSTogKHN0YXRlKSA9PiB7XG4gICAgICByZXR1cm4gc3RhdGUuY29sbGVjdGlvbnMuZGF1Lmdlb21ldHJ5LnN0YXRlID09PSAnaW5pdCc7XG4gICAgfSxcbiAgICBjYWxsQVBJOiAoY2FsbGJhY2spID0+IHsgXG4gICAgICBzZXJ2aWNlcy5sb2FkR2VvbWV0cnkoY2FsbGJhY2spO1xuICAgIH0sXG4gICAgcGF5bG9hZDogeyBcbiAgICAgIGlkIDogaWRcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9hZERhdGEoaWQpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlczogW0FDVElPTlMuTE9BRF9EQVVfUkVRVUVTVCwgQUNUSU9OUy5MT0FEX0RBVV9TVUNDRVNTLCBBQ1RJT05TLkxPQURfREFVX0ZBSUxVUkVdLFxuICAgIHNob3VsZENhbGxBUEk6IChzdGF0ZSkgPT4gIXN0YXRlLmNvbGxlY3Rpb25zLmRhdS5ieUlkW2lkXSxcbiAgICBjYWxsQVBJOiAoY2FsbGJhY2spID0+IHsgXG4gICAgICBzZXJ2aWNlcy5sb2FkRGF0YShpZCwgY2FsbGJhY2spO1xuICAgIH0sXG4gICAgcGF5bG9hZDogeyBcbiAgICAgIGlkIDogaWRcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2VsZWN0Wm9uZShpZCkge1xuICByZXR1cm4ge1xuICAgIHR5cGVzOiBbQUNUSU9OUy5MT0FEX0RBVV9SRVFVRVNULCBBQ1RJT05TLkxPQURfREFVX1NVQ0NFU1MsIEFDVElPTlMuTE9BRF9EQVVfRkFJTFVSRV0sXG4gICAgc2hvdWxkQ2FsbEFQSTogKHN0YXRlKSA9PiAhc3RhdGUuY29sbGVjdGlvbnMuZGF1LmJ5SWRbaWRdLFxuICAgIHNob3VsZFNlbGVjdCA6IChzdGF0ZSkgPT4gc3RhdGUuY29sbGVjdGlvbnMuZGF1LnNlbGVjdGVkICE9PSBpZCxcbiAgICBzZWxlY3QgOiBBQ1RJT05TLlNFTEVDVF9EQVVfWk9ORSxcbiAgICBjYWxsQVBJOiAoY2FsbGJhY2spID0+IHsgXG4gICAgICBzZXJ2aWNlcy5sb2FkRGF0YShpZCwgY2FsbGJhY2spO1xuICAgIH0sXG4gICAgcGF5bG9hZDogeyBcbiAgICAgIGlkIDogaWRcbiAgICB9XG4gIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQUNUSU9OUyA6IEFDVElPTlMsXG4gIGxvYWRHZW9tZXRyeSA6IGxvYWRHZW9tZXRyeSxcbiAgbG9hZERhdGEgOiBsb2FkRGF0YSxcbiAgc2VsZWN0Wm9uZSA6IHNlbGVjdFpvbmVcbn0iLCJ2YXIgc2VydmljZXMgPSByZXF1aXJlKCcuLi8uLi8uLi9zZXJ2aWNlcy9ldG9ab25lcycpO1xuXG4vKipcbiAqIFNUQVRFIEVOVU1zXG4gKi9cbnZhciBBQ1RJT05TID0ge1xuICBTRUxFQ1RfRVRPX1pPTkUgOiAnU0VMRUNUX0VUT19aT05FJyxcblxuICBMT0FEX0VUT19SRVFVRVNUOiAnTE9BRF9FVE9fUkVRVUVTVCcsIFxuICBMT0FEX0VUT19TVUNDRVNTOiAnTE9BRF9FVE9fU1VDQ0VTUycsIFxuICBMT0FEX0VUT19GQUlMVVJFOiAnTE9BRF9FVE9fRkFJTFVSRScsXG5cbiAgTE9BRF9FVE9fR0VPTUVUUllfUkVRVUVTVDogJ0xPQURfRVRPX0dFT01FVFJZX1JFUVVFU1QnLCBcbiAgTE9BRF9FVE9fR0VPTUVUUllfU1VDQ0VTUzogJ0xPQURfRVRPX0dFT01FVFJZX1NVQ0NFU1MnLCBcbiAgTE9BRF9FVE9fR0VPTUVUUllfRkFJTFVSRTogJ0xPQURfRVRPX0dFT01FVFJZX0ZBSUxVUkUnXG59XG5cblxuLyoqXG4gKiBBY3Rpb24gRnVuY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGxvYWRHZW9tZXRyeShpZCwgZGF0YSkge1xuICByZXR1cm4ge1xuICAgIHR5cGVzOiBbQUNUSU9OUy5MT0FEX0VUT19HRU9NRVRSWV9SRVFVRVNULCBBQ1RJT05TLkxPQURfRVRPX0dFT01FVFJZX1NVQ0NFU1MsIEFDVElPTlMuTE9BRF9FVE9fR0VPTUVUUllfRkFJTFVSRV0sXG4gICAgc2hvdWxkQ2FsbEFQSTogKHN0YXRlKSA9PiB7XG4gICAgICByZXR1cm4gc3RhdGUuY29sbGVjdGlvbnMuZXRvWm9uZXMuZ2VvbWV0cnkuc3RhdGUgPT09ICdpbml0JztcbiAgICB9LFxuICAgIGNhbGxBUEk6IChjYWxsYmFjaykgPT4geyBcbiAgICAgIHNlcnZpY2VzLmxvYWRHZW9tZXRyeShjYWxsYmFjayk7XG4gICAgfSxcbiAgICBwYXlsb2FkOiB7IFxuICAgICAgaWQgOiBpZFxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBsb2FkRGF0YShpZCwgZGF0YSkge1xuICByZXR1cm4ge1xuICAgIHR5cGVzOiBbQUNUSU9OUy5MT0FEX0VUT19SRVFVRVNULCBBQ1RJT05TLkxPQURfRVRPX1NVQ0NFU1MsIEFDVElPTlMuTE9BRF9FVE9fRkFJTFVSRV0sXG4gICAgc2hvdWxkQ2FsbEFQSTogKHN0YXRlKSA9PiAhc3RhdGUuY29sbGVjdGlvbnMuZXRvWm9uZXMuYnlJZFtpZF0sXG4gICAgY2FsbEFQSTogKGNhbGxiYWNrKSA9PiB7IFxuICAgICAgc2VydmljZXMubG9hZERhdGEoaWQsIGNhbGxiYWNrKTtcbiAgICB9LFxuICAgIHBheWxvYWQ6IHsgXG4gICAgICBpZCA6IGlkXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNlbGVjdFpvbmUoaWQpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlIDogQUNUSU9OUy5TRUxFQ1RfRVRPX1pPTkUsXG4gICAgaWQgOiBpZFxuICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEFDVElPTlMgOiBBQ1RJT05TLFxuICBsb2FkR2VvbWV0cnkgOiBsb2FkR2VvbWV0cnksXG4gIGxvYWREYXRhIDogbG9hZERhdGEsXG4gIHNlbGVjdFpvbmUgOiBzZWxlY3Rab25lXG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRhdSA6IHJlcXVpcmUoJy4vZGF1JyksXG4gIGNpbWlzIDogcmVxdWlyZSgnLi9jaW1pcycpLFxuICBldG9ab25lcyA6IHJlcXVpcmUoJy4vZXRvWm9uZXMnKVxufSIsIi8qKlxuICogU1RBVEUgRU5VTXNcbiAqL1xudmFyIEFDVElPTlMgPSB7XG4gIFNFVF9DT05GSUdfSE9TVCA6ICdTRVRfQ09ORklHX0hPU1QnLFxufVxuXG4vKipcbiAqIEFjdGlvbiBGdW5jdGlvbnNcbiAqL1xuZnVuY3Rpb24gc2V0Q29uZmlnSG9zdChob3N0KSB7XG4gIHJldHVybiB7XG4gICAgdHlwZSA6IEFDVElPTlMuU0VUX0NPTkZJR19IT1NULFxuICAgIGhvc3QgOiBob3N0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEFDVElPTlMgOiBBQ1RJT05TLFxuICBzZXRDb25maWdIb3N0IDogc2V0Q29uZmlnSG9zdCxcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXBwU3RhdGUgOiByZXF1aXJlKCcuL2FwcFN0YXRlJyksXG4gIGNvbmZpZyA6IHJlcXVpcmUoJy4vY29uZmlnJyksXG4gIGNvbGxlY3Rpb25zIDogcmVxdWlyZSgnLi9jb2xsZWN0aW9ucycpXG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIHN0b3JlIDogcmVxdWlyZSgnLi9zdG9yZScpLFxuICB1aSA6IHJlcXVpcmUoJy4vdWknKSxcbiAgYWN0aW9ucyA6IHJlcXVpcmUoJy4vYWN0aW9ucycpXG59IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdG9yZSkge1xuICB2YXIgZGlzcGF0Y2ggPSBzdG9yZS5kaXNwYXRjaDtcblxuICByZXR1cm4gZnVuY3Rpb24obmV4dCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhY3Rpb24pIHtcblxuICAgICAgY29uc3Qge1xuICAgICAgICBhcGksXG4gICAgICAgIHR5cGVzLFxuICAgICAgICBjYWxsQVBJLFxuICAgICAgICBzaG91bGRDYWxsQVBJID0gKCkgPT4gdHJ1ZSxcbiAgICAgICAgc2VsZWN0LFxuICAgICAgICBzaG91bGRTZWxlY3QgPSAoKSA9PiB0cnVlLFxuICAgICAgICBwYXlsb2FkID0ge31cbiAgICAgIH0gPSBhY3Rpb25cblxuICAgICAgaWYgKCF0eXBlcykge1xuICAgICAgICAvLyBOb3JtYWwgYWN0aW9uOiBwYXNzIGl0IG9uXG4gICAgICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgIUFycmF5LmlzQXJyYXkodHlwZXMpIHx8XG4gICAgICAgIHR5cGVzLmxlbmd0aCAhPT0gMyB8fFxuICAgICAgICAhdHlwZXMuZXZlcnkodHlwZSA9PiB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycpXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBhbiBhcnJheSBvZiB0aHJlZSBzdHJpbmcgdHlwZXMuJylcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBjYWxsQVBJICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgY2FsbEFQSSB0byBiZSBhIGZ1bmN0aW9uLicpXG4gICAgICB9XG5cbiAgICAgIGlmKCBzZWxlY3QgJiYgc2hvdWxkU2VsZWN0KHN0b3JlLmdldFN0YXRlKCkpICkge1xuICAgICAgICBkaXNwYXRjaChPYmplY3QuYXNzaWduKHt9LCBwYXlsb2FkLCB7XG4gICAgICAgICAgdHlwZTogc2VsZWN0XG4gICAgICAgIH0pKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXNob3VsZENhbGxBUEkoc3RvcmUuZ2V0U3RhdGUoKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBbIHJlcXVlc3RUeXBlLCBzdWNjZXNzVHlwZSwgZmFpbHVyZVR5cGUgXSA9IHR5cGVzXG5cbiAgICAgIGRpc3BhdGNoKE9iamVjdC5hc3NpZ24oe30sIHBheWxvYWQsIHtcbiAgICAgICAgdHlwZTogcmVxdWVzdFR5cGVcbiAgICAgIH0pKVxuXG4gICAgICByZXR1cm4gY2FsbEFQSSgoZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmKCBlcnJvciApIHtcbiAgICAgICAgICBkaXNwYXRjaChPYmplY3QuYXNzaWduKHt9LCBwYXlsb2FkLCB7XG4gICAgICAgICAgICAgIGVycm9yLFxuICAgICAgICAgICAgICB0eXBlOiBmYWlsdXJlVHlwZVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaXNwYXRjaChPYmplY3QuYXNzaWduKHt9LCBwYXlsb2FkLCB7XG4gICAgICAgICAgICByZXNwb25zZSxcbiAgICAgICAgICAgIHR5cGU6IHN1Y2Nlc3NUeXBlXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0b3JlKSB7XG4gIHJldHVybiBmdW5jdGlvbihuZXh0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFjdGlvbikge1xuICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZChhY3Rpb24udHlwZSk7XG4gICAgICBjb25zb2xlLmxvZyhgRElTUEFUQ0hJTkc6YCwgYWN0aW9uLCBzdG9yZS5nZXRTdGF0ZSgpKTtcbiAgICAgIHN0YXRlID0gbmV4dChhY3Rpb24pO1xuICAgICAgY29uc29sZS5sb2coYENPTVBMRVRFOiAke2FjdGlvbi50eXBlfWAsIHN0b3JlLmdldFN0YXRlKCkpO1xuICAgICAgY29uc29sZS5ncm91cEVuZChhY3Rpb24udHlwZSk7XG4gICAgfVxuICB9XG59IiwidmFyIG9ic2VydmVyID0gcmVxdWlyZSgncmVkdXgtb2JzZXJ2ZXJzJykub2JzZXJ2ZXI7XG52YXIgZXZlbnRCdXMgPSByZXF1aXJlKCcuLi8uLi9ldmVudEJ1cycpO1xuXG52YXIgYXBwU3RhdGUgPSBvYnNlcnZlcihcbiAgKHN0YXRlKSA9PiBzdGF0ZS5hcHBTdGF0ZSxcbiAgKGRpc3BhdGNoLCBjdXJyZW50LCBwcmV2aW91cykgPT4ge1xuICAgIGV2ZW50QnVzLmVtaXQoJ2FwcC1zdGF0ZS11cGRhdGUnLCBjdXJyZW50KTtcbiAgfVxuKTtcblxubW9kdWxlLmV4cG9ydHMgPSBbYXBwU3RhdGVdOyIsInZhciBvYnNlcnZlciA9IHJlcXVpcmUoJ3JlZHV4LW9ic2VydmVycycpLm9ic2VydmVyO1xudmFyIGV2ZW50QnVzID0gcmVxdWlyZSgnLi4vLi4vZXZlbnRCdXMnKTtcblxudmFyIGJ5SWQgPSBvYnNlcnZlcihcbiAgKHN0YXRlKSA9PiBzdGF0ZS5jb2xsZWN0aW9ucy5jaW1pcy5ieUlkLFxuICAoZGlzcGF0Y2gsIGN1cnJlbnQsIHByZXZpb3VzKSA9PiB7XG4gICAgZm9yKCB2YXIga2V5IGluIGN1cnJlbnQgKSB7XG4gICAgICBpZiggY3VycmVudFtrZXldICE9PSBwcmV2aW91c1trZXldICkge1xuICAgICAgICBldmVudEJ1cy5lbWl0KCdjaW1pcy1ncmlkLWRhdGEtdXBkYXRlJywgY3VycmVudFtrZXldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbik7XG5cbnZhciBkYXRlcyA9IG9ic2VydmVyKFxuICAoc3RhdGUpID0+IHN0YXRlLmNvbGxlY3Rpb25zLmNpbWlzLmRhdGVzLFxuICAoZGlzcGF0Y2gsIGN1cnJlbnQsIHByZXZpb3VzKSA9PiB7XG4gICAgZXZlbnRCdXMuZW1pdCgnY2ltaXMtZ3JpZC1kYXRlcy11cGRhdGUnLCBjdXJyZW50KTtcbiAgfVxuKTtcblxudmFyIHNlbGVjdGVkID0gb2JzZXJ2ZXIoXG4gIChzdGF0ZSkgPT4gc3RhdGUuY29sbGVjdGlvbnMuY2ltaXMuc2VsZWN0ZWQsXG4gIChkaXNwYXRjaCwgY3VycmVudCwgcHJldmlvdXMpID0+IHtcbiAgICBldmVudEJ1cy5lbWl0KCdjaW1pcy1ncmlkLXNlbGVjdGVkLXVwZGF0ZScsIGN1cnJlbnQpO1xuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFtieUlkLCBkYXRlcywgc2VsZWN0ZWRdOyIsInZhciBvYnNlcnZlciA9IHJlcXVpcmUoJ3JlZHV4LW9ic2VydmVycycpLm9ic2VydmVyO1xudmFyIGV2ZW50QnVzID0gcmVxdWlyZSgnLi4vLi4vZXZlbnRCdXMnKTtcblxudmFyIGJ5SWQgPSBvYnNlcnZlcihcbiAgKHN0YXRlKSA9PiBzdGF0ZS5jb2xsZWN0aW9ucy5ldG9ab25lcy5ieUlkLFxuICAoZGlzcGF0Y2gsIGN1cnJlbnQsIHByZXZpb3VzKSA9PiB7XG4gICAgZm9yKCB2YXIga2V5IGluIGN1cnJlbnQgKSB7XG4gICAgICBpZiggY3VycmVudFtrZXldICE9PSBwcmV2aW91c1trZXldICkge1xuICAgICAgICBldmVudEJ1cy5lbWl0KCdldG8tem9uZS1kYXRhLXVwZGF0ZScsIGN1cnJlbnRba2V5XSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4pO1xuXG52YXIgZ2VvbWV0cnkgPSBvYnNlcnZlcihcbiAgKHN0YXRlKSA9PiBzdGF0ZS5jb2xsZWN0aW9ucy5ldG9ab25lcy5nZW9tZXRyeSxcbiAgKGRpc3BhdGNoLCBjdXJyZW50LCBwcmV2aW91cykgPT4ge1xuICAgIGV2ZW50QnVzLmVtaXQoJ2V0by16b25lLWdlb21ldHJ5LXVwZGF0ZScsIGN1cnJlbnQpO1xuICB9XG4pO1xuXG52YXIgc2VsZWN0ZWQgPSBvYnNlcnZlcihcbiAgKHN0YXRlKSA9PiBzdGF0ZS5jb2xsZWN0aW9ucy5ldG9ab25lcy5zZWxlY3RlZCxcbiAgKGRpc3BhdGNoLCBjdXJyZW50LCBwcmV2aW91cykgPT4ge1xuICAgIGV2ZW50QnVzLmVtaXQoJ2V0by16b25lLXNlbGVjdGVkLXVwZGF0ZScsIGN1cnJlbnQpO1xuICB9XG4pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFtieUlkLCBnZW9tZXRyeSwgc2VsZWN0ZWRdOyIsIi8qKlxuICogT2JzZXJ2ZSB0aGUgcmVkdXggc3RvcmUgYW5kIHNlbmQgY2hhbmdlIGV2ZW50cyB0byBVSVxuICovXG52YXIgb2JzZXJ2ZSA9IHJlcXVpcmUoJ3JlZHV4LW9ic2VydmVycycpLm9ic2VydmU7XG5cbnZhciBvYnNlcnZlcnMgPSBbXVxuICAgICAgICAgIC5jb25jYXQocmVxdWlyZSgnLi9jaW1pcycpKVxuICAgICAgICAgIC5jb25jYXQocmVxdWlyZSgnLi9hcHBTdGF0ZScpKVxuICAgICAgICAgIC5jb25jYXQocmVxdWlyZSgnLi9ldG9ab25lcycpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdG9yZSkge1xuICBvYnNlcnZlKHN0b3JlLCBvYnNlcnZlcnMpO1xufSIsInZhciBhcHBTdGF0ZUFjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL2FwcFN0YXRlJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBhY3Rpb25zID0gYXBwU3RhdGVBY3Rpb25zLkFDVElPTlM7XG52YXIgbWFwU3RhdGVzID0gYXBwU3RhdGVBY3Rpb25zLk1BUF9TVEFURVM7XG52YXIgYXBwU2VjdGlvbnMgPSBhcHBTdGF0ZUFjdGlvbnMuQVBQX1NFQ1RJT05TO1xuXG52YXIgaW5pdGlhbFN0YXRlID0ge1xuICBzZWN0aW9uIDogYXBwU2VjdGlvbnMubWFwLFxuICBtYXBTdGF0ZSA6IG1hcFN0YXRlcy5jaW1pc0dyaWQsXG4gIGV4dHJhcyA6IFtdXG59O1xuXG5mdW5jdGlvbiBzZXRNYXBTdGF0ZShzdGF0ZSwgYWN0aW9uKSB7XG4gIHJldHVybiB1dGlscy5hc3NpZ24oc3RhdGUsIHttYXBTdGF0ZTogYWN0aW9uLnN0YXRlfSk7XG59XG5cbmZ1bmN0aW9uIHNldFN0YXRlKHN0YXRlLCBhY3Rpb24pIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGFjdGlvbi5zdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIHNldFNlY3Rpb24oc3RhdGUsIGFjdGlvbikge1xuICByZXR1cm4gdXRpbHMuYXNzaWduKHN0YXRlLCB7c2VjdGlvbjogYWN0aW9uLnNlY3Rpb259KTtcbn1cblxuXG5mdW5jdGlvbiBhcHBTdGF0ZShzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKSB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIGFjdGlvbnMuU0VUX01BUF9TVEFURTpcbiAgICAgIHJldHVybiBzZXRNYXBTdGF0ZShzdGF0ZSwgYWN0aW9uKTtcbiAgICBjYXNlIGFjdGlvbnMuU0VUX1NFQ1RJT046XG4gICAgICByZXR1cm4gc2V0U2VjdGlvbihzdGF0ZSwgYWN0aW9uKTtcbiAgICBjYXNlIGFjdGlvbnMuU0VUX1NUQVRFOlxuICAgICAgcmV0dXJuIHNldFN0YXRlKHN0YXRlLCBhY3Rpb24pO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGVcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBhcHBTdGF0ZTsiLCJ2YXIgY2ltaXNBY3Rpb25zID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucy9jb2xsZWN0aW9ucy9jaW1pcycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIGFjdGlvbnMgPSBjaW1pc0FjdGlvbnMuQUNUSU9OUztcblxudmFyIGluaXRpYWxTdGF0ZSA9IHtcbiAgZGF0ZXMgOiB7fSxcbiAgYnlJZCA6IHt9LFxuICBzZWxlY3RlZCA6ICcnXG59O1xuXG4vKipcbiAqIERhdGVzXG4gKi9cbmZ1bmN0aW9uIHNldERhdGVzKHN0YXRlLCB2YWx1ZSkge1xuICBzdGF0ZS5kYXRlcyA9IHV0aWxzLmFzc2lnbihzdGF0ZS5kYXRlcywgdmFsdWUpO1xuICByZXR1cm4gc3RhdGU7XG59XG5cblxuLyoqXG4gKiBEYXRhXG4gKi9cbmZ1bmN0aW9uIHNldERhdGEoc3RhdGUsIHZhbHVlKSB7XG4gIHN0YXRlLmJ5SWQgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZS5ieUlkLCB7W3ZhbHVlLmlkXTogdmFsdWV9KTtcbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Qoc3RhdGUsIGFjdGlvbikge1xuICByZXR1cm4gdXRpbHMuYXNzaWduKHN0YXRlLCB7c2VsZWN0ZWQ6IGFjdGlvbi5pZH0pO1xufVxuXG5mdW5jdGlvbiBjaW1pcyhzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKSB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9DSU1JU19EQVRFU19SRVFVRVNUOlxuICAgICAgcmV0dXJuIHNldERhdGVzKHN0YXRlLCB7c3RhdGU6ICdsb2FkaW5nJ30pO1xuICAgIGNhc2UgYWN0aW9ucy5MT0FEX0NJTUlTX0RBVEVTX1NVQ0NFU1M6XG4gICAgICByZXR1cm4gc2V0RGF0ZXMoc3RhdGUsIHtzdGF0ZTogJ2xvYWRlZCcsIGRhdGE6IGFjdGlvbi5yZXNwb25zZS5ib2R5fSk7XG4gICAgY2FzZSBhY3Rpb25zLkxPQURfQ0lNSVNfREFURVNfRkFJTFVSRTpcbiAgICAgIHJldHVybiBzZXREYXRlcyhzdGF0ZSwge3N0YXRlOiAnZXJyb3InLCBlcnJvcjogYWN0aW9uLmVycm9yfSk7XG5cbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9DSU1JU19SRVFVRVNUOlxuICAgICAgcmV0dXJuIHNldERhdGEoc3RhdGUsIHtzdGF0ZTogJ2xvYWRpbmcnLCBpZDogYWN0aW9uLmlkfSk7XG4gICAgY2FzZSBhY3Rpb25zLkxPQURfQ0lNSVNfU1VDQ0VTUzpcbiAgICAgIHJldHVybiBzZXREYXRhKHN0YXRlLCB7c3RhdGU6ICdsb2FkZWQnLCBkYXRhOiBhY3Rpb24ucmVzcG9uc2UuYm9keSwgaWQ6IGFjdGlvbi5pZH0pO1xuICAgIGNhc2UgYWN0aW9ucy5MT0FEX0NJTUlTX0ZBSUxVUkU6XG4gICAgICByZXR1cm4gc2V0RGF0YShzdGF0ZSwge3N0YXRlOiAnZXJyb3InLCBlcnJvcjogYWN0aW9uLmVycm9yLCBpZDogYWN0aW9uLmlkfSk7XG5cbiAgICBjYXNlIGFjdGlvbnMuU0VMRUNUX0NJTUlTX0dSSURfTE9DQVRJT046XG4gICAgICByZXR1cm4gc2VsZWN0KHN0YXRlLCBhY3Rpb24pO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGVcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBjaW1pczsiLCJ2YXIgZGF1QWN0aW9ucyA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMvY29sbGVjdGlvbnMvZGF1Jyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgYWN0aW9ucyA9IGRhdUFjdGlvbnMuQUNUSU9OUztcblxudmFyIGluaXRpYWxTdGF0ZSA9IHtcbiAgZ2VvbWV0cnkgOiB7XG4gICAgZGF0YSA6IG51bGwsXG4gICAgc3RhdGUgOiAnaW5pdCdcbiAgfSxcbiAgYnlJZCA6IHt9LFxuICBzZWxlY3RlZCA6ICcnXG59O1xuXG4vKipcbiAqIEdlb21ldHJ5XG4gKi9cbmZ1bmN0aW9uIHNldEdlb21ldHJ5KHN0YXRlLCB2YWx1ZSkge1xuICBzdGF0ZS5nZW9tZXRyeSA9IHV0aWxzLmFzc2lnbihzdGF0ZS5nZW9tZXRyeSwgdmFsdWUpO1xuICByZXR1cm4gc3RhdGU7XG59XG5cbi8qKlxuICogRGF0YVxuICovXG5mdW5jdGlvbiBzZXREYXRhKHN0YXRlLCB2YWx1ZSkge1xuICBzdGF0ZS5ieUlkID0gdXRpbHMuYXNzaWduKHN0YXRlLmJ5SWQsIHtbdmFsdWUuaWRdOiB2YWx1ZX0pO1xuICByZXR1cm4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdFpvbmUoc3RhdGUsIGFjdGlvbikge1xuICBpZiggc3RhdGUuc2VsZWN0ZWQgPT09IGFjdGlvbi5pZCApIHJldHVybiBzdGF0ZTtcbiAgcmV0dXJuIHV0aWxzLmFzc2lnbihzdGF0ZSwge3NlbGVjdGVkOiBhY3Rpb24uaWR9KTtcbn1cblxuZnVuY3Rpb24gZGF1KHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgYWN0aW9ucy5TRUxFQ1RfREFVX1pPTkU6XG4gICAgICByZXR1cm4gc2VsZWN0Wm9uZShzdGF0ZSwgYWN0aW9uKTtcbiAgICBcbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9EQVVfR0VPTUVUUllfUkVRVUVTVDpcbiAgICAgIHJldHVybiBzZXRHZW9tZXRyeShzdGF0ZSwge3N0YXRlOiAnbG9hZGluZyd9KTtcbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9EQVVfR0VPTUVUUllfU1VDQ0VTUzpcbiAgICAgIHJldHVybiBzZXRHZW9tZXRyeShzdGF0ZSwge3N0YXRlOiAnbG9hZGVkJywgZGF0YTogYWN0aW9uLnJlc3BvbnNlLmJvZHl9KTtcbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9EQVVfR0VPTUVUUllfRkFJTFVSRTpcbiAgICAgIHJldHVybiBzZXRHZW9tZXRyeShzdGF0ZSwge3N0YXRlOiAnZXJyb3InLCBlcnJvcjogYWN0aW9uLmVycm9yfSk7XG5cbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9EQVVfUkVRVUVTVDpcbiAgICAgIHJldHVybiBzZXREYXRhKHN0YXRlLCB7c3RhdGU6ICdsb2FkaW5nJywgaWQ6IGFjdGlvbi5pZH0pO1xuICAgIGNhc2UgYWN0aW9ucy5MT0FEX0RBVV9TVUNDRVNTOlxuICAgICAgcmV0dXJuIHNldERhdGEoc3RhdGUsIHtzdGF0ZTogJ2xvYWRlZCcsIGRhdGE6IGFjdGlvbi5yZXNwb25zZS5ib2R5LCBpZDogYWN0aW9uLmlkfSk7XG4gICAgY2FzZSBhY3Rpb25zLkxPQURfREFVX0ZBSUxVUkU6XG4gICAgICByZXR1cm4gc2V0RGF0YShzdGF0ZSwge3N0YXRlOiAnZXJyb3InLCBlcnJvcjogYWN0aW9uLmVycm9yLCBpZDogYWN0aW9uLmlkfSk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlXG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZGF1OyIsInZhciBldG9BY3Rpb25zID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucy9jb2xsZWN0aW9ucy9ldG9ab25lcycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIGFjdGlvbnMgPSBldG9BY3Rpb25zLkFDVElPTlM7XG5cbnZhciBpbml0aWFsU3RhdGUgPSB7XG4gIGdlb21ldHJ5IDoge1xuICAgIGRhdGEgOiBudWxsLFxuICAgIHN0YXRlIDogJ2luaXQnXG4gIH0sXG4gIGJ5SWQgOiB7fSxcbiAgc2VsZWN0ZWQgOiAnJ1xufTtcblxuLyoqXG4gKiBHZW9tZXRyeVxuICovXG5mdW5jdGlvbiBzZXRHZW9tZXRyeShzdGF0ZSwgdmFsdWUpIHtcbiAgc3RhdGUuZ2VvbWV0cnkgPSB1dGlscy5hc3NpZ24oc3RhdGUuZ2VvbWV0cnksIHZhbHVlKTtcbiAgcmV0dXJuIHN0YXRlO1xufVxuXG4vKipcbiAqIERhdGFcbiAqL1xuZnVuY3Rpb24gc2V0RGF0YShzdGF0ZSwgdmFsdWUpIHtcbiAgc3RhdGUuYnlJZCA9IHV0aWxzLmFzc2lnbihzdGF0ZS5ieUlkLCB7W3ZhbHVlLmlkXTogdmFsdWV9KTtcbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rab25lKHN0YXRlLCBhY3Rpb24pIHtcbiAgaWYoIHN0YXRlLnNlbGVjdGVkID09PSBhY3Rpb24uaWQgKSByZXR1cm4gc3RhdGU7XG4gIHJldHVybiB1dGlscy5hc3NpZ24oc3RhdGUsIHtzZWxlY3RlZDogYWN0aW9uLmlkfSk7XG59XG5cbmZ1bmN0aW9uIGV0b1pvbmVzKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgYWN0aW9ucy5TRUxFQ1RfRVRPX1pPTkU6XG4gICAgICByZXR1cm4gc2VsZWN0Wm9uZShzdGF0ZSwgYWN0aW9uKTtcbiAgICBcbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9FVE9fR0VPTUVUUllfUkVRVUVTVDpcbiAgICAgIHJldHVybiBzZXRHZW9tZXRyeShzdGF0ZSwge3N0YXRlOiAnbG9hZGluZyd9KTtcbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9FVE9fR0VPTUVUUllfU1VDQ0VTUzpcbiAgICAgIHJldHVybiBzZXRHZW9tZXRyeShzdGF0ZSwge3N0YXRlOiAnbG9hZGVkJywgZGF0YTogYWN0aW9uLnJlc3BvbnNlLmJvZHl9KTtcbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9FVE9fR0VPTUVUUllfRkFJTFVSRTpcbiAgICAgIHJldHVybiBzZXRHZW9tZXRyeShzdGF0ZSwge3N0YXRlOiAnZXJyb3InLCBlcnJvcjogYWN0aW9uLmVycm9yfSk7XG5cbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9FVE9fUkVRVUVTVDpcbiAgICAgIHJldHVybiBzZXREYXRhKHN0YXRlLCB7c3RhdGU6ICdsb2FkaW5nJywgaWQ6IGFjdGlvbi5pZH0pO1xuICAgIGNhc2UgYWN0aW9ucy5MT0FEX0VUT19TVUNDRVNTOlxuICAgICAgcmV0dXJuIHNldERhdGEoc3RhdGUsIHtzdGF0ZTogJ2xvYWRlZCcsIGRhdGE6IGFjdGlvbi5yZXNwb25zZS5ib2R5LCBpZDogYWN0aW9uLmlkfSk7XG4gICAgY2FzZSBhY3Rpb25zLkxPQURfRVRPX0ZBSUxVUkU6XG4gICAgICByZXR1cm4gc2V0RGF0YShzdGF0ZSwge3N0YXRlOiAnZXJyb3InLCBlcnJvcjogYWN0aW9uLmVycm9yLCBpZDogYWN0aW9uLmlkfSk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlXG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZXRvWm9uZXM7IiwidmFyIGNvbWJpbmVSZWR1Y2VycyA9IHJlcXVpcmUoJ3JlZHV4JykuY29tYmluZVJlZHVjZXJzO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbWJpbmVSZWR1Y2Vycyh7XG4gIGRhdSA6IHJlcXVpcmUoJy4vZGF1JyksXG4gIGNpbWlzIDogcmVxdWlyZSgnLi9jaW1pcycpLFxuICBldG9ab25lcyA6IHJlcXVpcmUoJy4vZXRvWm9uZXMnKVxufSk7IiwidmFyIGNvbmZpZ0FjdGlvbnMgPSByZXF1aXJlKCcuLi9hY3Rpb25zL2NvbmZpZycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgYWN0aW9ucyA9IGNvbmZpZ0FjdGlvbnMuQUNUSU9OUztcblxudmFyIGluaXRpYWxTdGF0ZSA9IHtcbiAgaG9zdCA6ICcnXG59O1xuXG5mdW5jdGlvbiBzZXRIb3N0KHN0YXRlLCBhY3Rpb24pIHtcbiAgcmV0dXJuIHV0aWxzLmFzc2lnbihzdGF0ZSwge2hvc3Q6IGFjdGlvbi5ob3N0fSk7XG59XG5cbmZ1bmN0aW9uIGNvbmZpZyhzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKSB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIGFjdGlvbnMuU0VUX0NPTkZJR19IT1NUOlxuICAgICAgcmV0dXJuIHNldEhvc3Qoc3RhdGUsIGFjdGlvbik7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IGNvbmZpZzsiLCJ2YXIgY29tYmluZVJlZHVjZXJzID0gcmVxdWlyZSgncmVkdXgnKS5jb21iaW5lUmVkdWNlcnM7XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYmluZVJlZHVjZXJzKHtcbiAgYXBwU3RhdGUgOiByZXF1aXJlKCcuL2FwcFN0YXRlJyksXG4gIGNvbmZpZyA6IHJlcXVpcmUoJy4vY29uZmlnJyksXG4gIGNvbGxlY3Rpb25zIDogcmVxdWlyZSgnLi9jb2xsZWN0aW9ucycpXG59KTsiLCJmdW5jdGlvbiBhc3NpZ24oc3RhdGUsIG5ld1N0YXRlKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwgbmV3U3RhdGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXNzaWduIDogYXNzaWduXG59IiwidmFyIHJlZHV4ID0gcmVxdWlyZSgncmVkdXgnKTtcblxudmFyIHN0b3JlID0gcmVkdXguY3JlYXRlU3RvcmUoXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vcmVkdWNlcnMnKSxcbiAgICAgICAgICAgICAgICAgICAgcmVkdXguYXBwbHlNaWRkbGV3YXJlKFxuICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vbWlkZGxld2FyZS9hcGknKVxuICAgICAgICAgICAgICAgICAgICAgICxyZXF1aXJlKCcuL21pZGRsZXdhcmUvbG9nZ2luZycpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICk7XG5cbnJlcXVpcmUoJy4vb2JzZXJ2ZXJzJykoc3RvcmUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0b3JlOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgncG9seW1lci1yZWR1eCcpKHJlcXVpcmUoJy4uL3N0b3JlJykpOyIsInZhciBhY3Rpb25zID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucy9hcHBTdGF0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aW9ucyA6IGFjdGlvbnMsXG4gIHByb3BlcnR5UGF0aHMgOiB7XG4gICAgYXBwU3RhdGUgOiAnYXBwU3RhdGUnXG4gIH1cbn0iLCJ2YXIgYWN0aW9ucyA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMvY29sbGVjdGlvbnMvZGF1Jyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGlvbnMgOiBhY3Rpb25zLFxuICBiZWhhdmlvciA6IHtcbiAgICBsb2FkR2VvbWV0cnkgOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2goJ2xvYWRHZW9tZXRyeScpXG4gICAgfSxcbiAgICBzZWxlY3Rab25lIDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIGlmKCB0aGlzLnNlbGVjdGVkID09PSBpZCApIHJldHVybjtcblxuICAgICAgdGhpcy5kZWJvdW5jZSgnc2VsZWN0Wm9uZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2goJ3NlbGVjdFpvbmUnLCBpZCk7XG4gICAgICB9LCAwKTtcbiAgICB9LFxuICAgIF9vbkRhdGFVcGRhdGUgOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmKCAhdGhpcy5jdXJyZW50Wm9uZURhdGEgKSByZXR1cm47XG4gICAgICBcbiAgICAgIC8qKlxuICAgICAgICogVE9ETzogaGFuZGxlIGVycm9yIHN0YXRlXG4gICAgICAgKiAqL1xuICAgICAgaWYoIHRoaXMuY3VycmVudFpvbmVEYXRhLnN0YXRlICE9PSAnbG9hZGVkJyApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX29uRGF0YUxvYWQoKTtcbiAgICB9XG4gIH0sXG4gIHByb3BlcnR5UGF0aHMgOiB7XG4gICAgZ2VvbWV0cnkgOiAnY29sbGVjdGlvbnMuZGF1Lmdlb21ldHJ5JyxcbiAgICBzZWxlY3RlZCA6ICdjb2xsZWN0aW9ucy5kYXUuc2VsZWN0ZWQnLFxuICAgIGN1cnJlbnRab25lRGF0YSA6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICByZXR1cm4gc3RhdGUuY29sbGVjdGlvbnMuZGF1LmJ5SWRbc3RhdGUuY29sbGVjdGlvbnMuZGF1LnNlbGVjdGVkXTtcbiAgICB9XG4gIH1cbn0iLCJ2YXIgYWN0aW9ucyA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMvY29sbGVjdGlvbnMvZXRvWm9uZXMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uLy4uLy4uL2V0by16b25lcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aW9ucyA6IGFjdGlvbnMsXG4gIGJlaGF2aW9yIDoge1xuICAgIGdldFpvbmUgOiB1dGlscy5nZXRab25lLFxuICAgIGxvYWRHZW9tZXRyeSA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kaXNwYXRjaCgnbG9hZEdlb21ldHJ5JylcbiAgICB9LFxuICAgIGxvYWREYXRhIDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIGlmKCAhdGhpcy5hY3RpdmUgfHwgIWlkICkgcmV0dXJuO1xuICAgICAgdGhpcy5kaXNwYXRjaCgnbG9hZERhdGEnLCBpZClcbiAgICB9LFxuICAgIHNlbGVjdFpvbmUgOiBmdW5jdGlvbihpZCkge1xuICAgICAgaWYoIHRoaXMuc2VsZWN0ZWQgPT09IGlkICkgcmV0dXJuO1xuICAgICAgdGhpcy5kaXNwYXRjaCgnc2VsZWN0Wm9uZScsIGlkKTtcbiAgICB9XG4gIH0sXG4gIHByb3BlcnR5UGF0aHMgOiB7XG4gICAgZ2VvbWV0cnkgOiAnY29sbGVjdGlvbnMuZXRvWm9uZXMuZ2VvbWV0cnknLFxuICAgIHNlbGVjdGVkIDogJ2NvbGxlY3Rpb25zLmV0b1pvbmVzLnNlbGVjdGVkJyxcbiAgICBjdXJyZW50Wm9uZURhdGEgOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgcmV0dXJuIHN0YXRlLmNvbGxlY3Rpb25zLmV0b1pvbmVzLmJ5SWRbc3RhdGUuY29sbGVjdGlvbnMuZXRvWm9uZXMuc2VsZWN0ZWRdO1xuICAgIH1cbiAgfVxufSIsInZhciBhY3Rpb25zID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucy9jb2xsZWN0aW9ucy9jaW1pcycpO1xudmFyIGdldFpvbmUgPSByZXF1aXJlKCcuLi8uLi8uLi9ldG8tem9uZXMnKS5nZXRab25lO1xudmFyIHNvcnREYXRlcyA9IHJlcXVpcmUoJy4uLy4uLy4uL3V0aWxzJykuc29ydERhdGVzO1xudmFyIGxsVG9HcmlkID0gcmVxdWlyZSgnLi4vLi4vLi4vY2ltaXMtZ3JpZCcpLmxsVG9HcmlkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aW9ucyA6IGFjdGlvbnMsXG4gIGJlaGF2aW9yIDoge1xuICAgIGxsVG9HcmlkIDogbGxUb0dyaWQsXG4gICAgZ2V0Wm9uZSA6IGdldFpvbmUsXG4gICAgc29ydERhdGVzIDogc29ydERhdGVzLFxuICAgIF9zZWxlY3RHcmlkSWQgOiBmdW5jdGlvbihpZCkge1xuICAgICAgdGhpcy5kaXNwYXRjaCgnc2VsZWN0JywgaWQpO1xuICAgIH0sXG4gICAgX2xvYWREYXRlcyA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kaXNwYXRjaCgnbG9hZERhdGVzJyk7XG4gICAgfSxcbiAgICBfbG9hZEdyaWREYXRhIDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIGlmKCAhdGhpcy5hY3RpdmUgfHwgIWlkICkgcmV0dXJuO1xuICAgICAgdGhpcy5kaXNwYXRjaCgnbG9hZERhdGEnLCBpZCk7XG4gICAgfVxuICB9LFxuICBwcm9wZXJ0eVBhdGhzIDoge1xuICAgIG1hcFN0YXRlIDogJ2FwcFN0YXRlLm1hcFN0YXRlJyxcbiAgICBkYXRlcyA6ICdjb2xsZWN0aW9ucy5jaW1pcy5kYXRlcycsXG4gICAgZGF1R2VvbWV0cnkgOiAnY29sbGVjdGlvbnMuZGF1Lmdlb21ldHJ5JyxcbiAgICBldG9HZW9tZXRyeSA6ICdjb2xsZWN0aW9ucy5ldG9ab25lcy5nZW9tZXRyeScsXG4gICAgc2VsZWN0ZWRDaW1pc0dyaWQgOiAnY29sbGVjdGlvbnMuY2ltaXMuc2VsZWN0ZWQnLFxuICAgIHNlbGVjdGVkQ2ltaXNHcmlkRGF0YSA6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICByZXR1cm4gc3RhdGUuY29sbGVjdGlvbnMuY2ltaXMuYnlJZFtzdGF0ZS5jb2xsZWN0aW9ucy5jaW1pcy5zZWxlY3RlZF07XG4gICAgfVxuICB9XG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICdkd3ItcGFnZS1kYXUnIDogcmVxdWlyZSgnLi9kd3ItcGFnZS1kYXUnKSxcbiAgJ2R3ci1wYWdlLW1hcCcgOiByZXF1aXJlKCcuL2R3ci1wYWdlLW1hcCcpLFxuICAnZHdyLXBhZ2UtZXRvJyA6IHJlcXVpcmUoJy4vZHdyLXBhZ2UtZXRvJyksXG4gICdkd3ItYXBwJyA6IHJlcXVpcmUoJy4vZHdyLWFwcCcpXG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJpbmRpbmdzIDogcmVxdWlyZSgnLi9iaW5kaW5ncycpLFxuICBiZWhhdmlvciA6IHJlcXVpcmUoJy4vYmVoYXZpb3InKVxufSIsInZhciBzdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmUnKTtcblxuZnVuY3Rpb24gZGlzcGF0Y2goKSB7XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICB2YXIgZm4gPSBhcmdzLnNwbGljZSgwLCAxKVswXTtcbiAgcmVxdWlyZSgnLi9zdG9yZScpLmRpc3BhdGNoKGZuLmFwcGx5KHRoaXMsIGFyZ3MpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRpc3BhdGNoIDogZGlzcGF0Y2hcbn0iLCJ2YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcbnZhciBhY3Rpb25zID0gcmVxdWlyZSgnLi4vcmVkdXgvYWN0aW9ucy9jb2xsZWN0aW9ucy9jaW1pcycpO1xudmFyIGRpc3BhdGNoID0gcmVxdWlyZSgnLi4vcmVkdXgvdXRpbHMnKS5kaXNwYXRjaDtcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3JlZHV4L3N0b3JlJyk7XG52YXIgZ2V0SG9zdCA9IHJlcXVpcmUoJy4vdXRpbHMnKS5nZXRIb3N0O1xuXG5mdW5jdGlvbiBsb2FkRGF0ZXMoY2FsbGJhY2spIHtcbiAgcmVxdWVzdFxuICAgIC5nZXQoYCR7Z2V0SG9zdCgpfS9jaW1pcy9kYXRlc2ApXG4gICAgLmVuZChjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGxvYWREYXRhKGNpbWlzR3JpZElkLCBjYWxsYmFjaykge1xuICB2YXIgdXJsSWQgPSBjaW1pc0dyaWRJZC5yZXBsYWNlKC8tLywgJy8nKTtcblxuICByZXF1ZXN0XG4gICAgLmdldChgJHtnZXRIb3N0KCl9L2NpbWlzLyR7dXJsSWR9YClcbiAgICAuZW5kKGNhbGxiYWNrKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9hZERhdGVzIDogbG9hZERhdGVzLFxuICBsb2FkRGF0YSA6IGxvYWREYXRhXG59IiwidmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG52YXIgZ2V0SG9zdCA9IHJlcXVpcmUoJy4vdXRpbHMnKS5nZXRIb3N0O1xuXG5mdW5jdGlvbiBsb2FkR2VvbWV0cnkoY2FsbGJhY2spIHtcbiAgcmVxdWVzdFxuICAgIC5nZXQoYCR7Z2V0SG9zdCgpfS9kYXVjby5qc29uYClcbiAgICAuZW5kKGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gbG9hZERhdGEoZGF1Wm9uZUlkLCBjYWxsYmFjaykge1xuICByZXF1ZXN0XG4gICAgLmdldChgJHtnZXRIb3N0KCl9L2NpbWlzL3JlZ2lvbi9EQVUke2RhdVpvbmVJZH1gKVxuICAgIC5lbmQoY2FsbGJhY2spO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9hZEdlb21ldHJ5IDogbG9hZEdlb21ldHJ5LFxuICBsb2FkRGF0YSA6IGxvYWREYXRhXG59IiwidmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG52YXIgZXRvWm9uZVV0aWxzID0gcmVxdWlyZSgnLi4vZXRvLXpvbmVzJyk7XG52YXIgZ2V0SG9zdCA9IHJlcXVpcmUoJy4vdXRpbHMnKS5nZXRIb3N0O1xuXG5cbmZ1bmN0aW9uIGxvYWRHZW9tZXRyeShjYWxsYmFjaykge1xuICByZXF1ZXN0XG4gICAgLmdldChgJHtnZXRIb3N0KCl9L2V0b196b25lcy5qc29uYClcbiAgICAuZW5kKGZ1bmN0aW9uKGVyciwgcmVzcCl7XG4gICAgICBpZiggZXJyICkgcmV0dXJuIGNhbGxiYWNrKGVycik7XG5cbiAgICAgIC8vIG1lcmdlIGluIHpvbmUgc3R5bGVzXG4gICAgICBldG9ab25lVXRpbHMubWVyZ2Vab25lTWFwKHJlc3AuYm9keSk7XG4gICAgICBcbiAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3ApO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBsb2FkRGF0YShldG9ab25lSWQsIGNhbGxiYWNrKSB7XG4gIHJlcXVlc3RcbiAgICAuZ2V0KGAke2dldEhvc3QoKX0vY2ltaXMvcmVnaW9uL1oke2V0b1pvbmVJZH1gKVxuICAgIC5lbmQoY2FsbGJhY2spO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9hZEdlb21ldHJ5IDogbG9hZEdlb21ldHJ5LFxuICBsb2FkRGF0YSA6IGxvYWREYXRhXG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRhdSA6IHJlcXVpcmUoJy4vZGF1Jylcbn0iLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuLi9yZWR1eC9zdG9yZScpO1xuXG5mdW5jdGlvbiBnZXRIb3N0KCkge1xuICAvLyBIQUNLIGZvciBjeWNsaWNhbCBkZXBlbmRlbmN5XG4gIHJldHVybiByZXF1aXJlKCcuLi9yZWR1eC9zdG9yZScpLmdldFN0YXRlKCkuY29uZmlnLmhvc3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRIb3N0IDogZ2V0SG9zdFxufSIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gc29ydERhdGVzKGRhdGEpIHtcbiAgdmFyIGFyciA9IFtdO1xuXG4gIGlmKCBBcnJheS5pc0FycmF5KGRhdGEpICkge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGFyci5wdXNoKHtcbiAgICAgICAgc3RyIDogZGF0YVtpXSxcbiAgICAgICAgdGltZSA6IHRvRGF0ZShkYXRhW2ldKS5nZXRUaW1lKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IoIHZhciBkYXRlIGluIGRhdGEgKSB7XG4gICAgICBhcnIucHVzaCh7XG4gICAgICAgIHN0ciA6IGRhdGUsXG4gICAgICAgIHRpbWUgOiB0b0RhdGUoZGF0ZSkuZ2V0VGltZSgpXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhcnIuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICBpZiggYS50aW1lID4gYi50aW1lICkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmKCBhLnRpbWUgPCBiLnRpbWUgKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9KTtcblxuICB2YXIgdG1wID0gW107XG4gIGFyci5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgIHRtcC5wdXNoKGl0ZW0uc3RyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRtcDtcbn1cblxuZnVuY3Rpb24gdG9EYXRlKHN0cikge1xuICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoJy0nKTtcbiAgcmV0dXJuIG5ldyBEYXRlKHBhcnNlSW50KHBhcnRzWzBdKSwgcGFyc2VJbnQocGFydHNbMV0pLTEsIHBhcnNlSW50KHBhcnRzWzJdKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzb3J0RGF0ZXMgOiBzb3J0RGF0ZXNcbn07XG4iXX0=
