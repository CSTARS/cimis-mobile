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

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/applyMiddleware.js":[function(require,module,exports){
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

},{"proj4":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/definitions.json":[function(require,module,exports){
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

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eto-zones.js":[function(require,module,exports){
var zones = [
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
]

function mergeZoneMap(geojson) {
  geojson.features.forEach(function(feature, index){
    var zoneData = getZoneByAvgDelta(feature.properties.zone);
    if( !zoneData ) return;
    for( var key in zoneData.data ) {
      feature.properties[key] = zoneData.data[key];
    }
  });

  for( var i = 0; i < zones.length; i++ ) {
    for( var j = 0; j < geojson.features.length; j++ ) {
      if( zones[i].zone === geojson.features[j].properties.zone ) {
        zones[i] = geojson.features[j];
        break;
      }
    }
  }
}

function getZoneByAvgDelta(id) {
  for( var i = 0; i < zones.length; i++ ) {
    if( zones[i].avg.toFixed(1)+'_'+zones[i].delta.toFixed(1) === id ) {
      return {
        data : zones[i],
        index : i
      }
    }
  }
  return null;
}

function getZone(id) {
  id = parseInt(id);
  for( var i = 0; i < zones.length; i++ ) {
    if( zones[i].properties.zone === id ) return zones[i];
  }
  return {};
}

function getAll() {
  return zones;
}

module.exports = {
  getZone : getZone,
  getAll : getAll,
  mergeZoneMap : mergeZoneMap
}
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/fft.js":[function(require,module,exports){
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
  zones : require('./eto-zones'),
  grid : require('./cimis-grid'),
  utils : require('./utils'),
  definitions : require('./definitions.json')
};

},{"./cimis-grid":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/cimis-grid/index.js","./definitions.json":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/definitions.json","./eto-zones":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/eto-zones.js","./fft":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/fft.js","./redux":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/index.js","./services":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/index.js","./utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/utils/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/appState.js":[function(require,module,exports){
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

function loadData(id, data) {
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
    type : ACTIONS.SELECT_DAU_ZONE,
    id : id
  }
}


module.exports = {
  ACTIONS : ACTIONS,
  loadGeometry : loadGeometry,
  loadData : loadData,
  selectZone : selectZone
}
},{"../../../services/dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/dau.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/etoZones.js":[function(require,module,exports){
/**
 * STATE ENUMs
 */
var ACTIONS = {
  SET_ETO_ZONE_GEOMETRY : 'SET_ETO_ZONE_GEOMETRY',
  SET_ETO_ZONE_DATA : 'SET_ETO_ZONE_DATA',
  SELECT_ETO_ZONE_ZONE : 'SELECT_ETO_ZONE_ZONE'
}


/**
 * Action Functions
 */
function setGeometry(data) {
  return {
    type : ACTIONS.SET_ETO_ZONE_GEOMETRY,
    data : data
  }
}

function setData(id, data) {
  data.id = id;
  
  return {
    type : ACTIONS.SET_ETO_ZONE_DATA,
    id : id,
    data : data
  }
}

function selectZone(id) {
  return {
    type : ACTIONS.SELECT_ETO_ZONE_ZONE,
    id : id
  }
}


module.exports = {
  ACTIONS : ACTIONS,
  setGeometry : setGeometry,
  setData : setData,
  selectZone : selectZone
}
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/index.js":[function(require,module,exports){
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
        types,
        callAPI,
        shouldCallAPI = () => true,
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
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/appState.js":[function(require,module,exports){
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
  if( !mapStates[action.state] ) {
    action.state = initialState.mapState;
  }

  if( state.mapState === action.state ) return state;

  return utils.assign(state, {mapState: action.state});
}

function setState(state, action) {
  return utils.assign(state, action.state);
}

function setSection(state, action) {
  if( !appSections[action.section] ) {
    action.section = initialState.section;
  }

  if( state.section === action.section ) return state;

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
  state.byId = utils.assign(state.byId, {[value.id]: value});
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
function setGeometry(state, action) {
  state.geometry = utils.assign(state.geometry, action.data);
  return state;
}

/**
 * Data
 */
function setData(state, action) {
  state.byId = utils.assign(state.byId, {[action.id]: action.data});
  return state;
}

function selectZone(state, action) {
  if( state.selected === action.id ) return state;
  return utils.assign(state, {selected: action.id});
}

function etoZone(state = initialState, action) {
  switch (action.type) {
    case actions.SET_ETO_ZONE_GEOMETRY:
      return setGeometry(state, action);
    case actions.SET_ETO_ZONE_DATA:
      return setData(state, action);
    case actions.SELECT_ETO_ZONE_ZONE:
      return selectZone(state, action);
    default:
      return state
  }
}
module.exports = etoZone;
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

module.exports = redux.createStore(
                    require('./reducers'),
                    redux.applyMiddleware(
                      require('./middleware/api')
                      ,require('./middleware/logging')
                    )
                  );
},{"./middleware/api":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/middleware/api.js","./middleware/logging":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/middleware/logging.js","./reducers":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/reducers/index.js","redux":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/redux/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/behavior.js":[function(require,module,exports){
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
    geometry : 'collections.dau.geometry',
    selected : 'collections.dau.selected',
    currentZoneData : function(state) {
      return state.collections.dau.byId[state.collections.dau.selected];
    }
  }
}
},{"../../actions/collections/dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/dau.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-page-map.js":[function(require,module,exports){
var actions = require('../../actions/collections/cimis');

module.exports = {
  actions : actions,
  behavior : {
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
    dauData : 'collections.dau.geometry',
    selectedCimisGrid : 'collections.cimis.selected',
    dates : 'collections.cimis.dates',
    selectedCimisGridData : function(state) {
      return state.collections.cimis.byId[state.collections.cimis.selected];
    }
  }
}
},{"../../actions/collections/cimis":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/cimis.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/index.js":[function(require,module,exports){
module.exports = {
  'dwr-page-dau' : require('./dwr-page-dau'),
  'dwr-page-map' : require('./dwr-page-map'),
  'dwr-app' : require('./dwr-app')
}
},{"./dwr-app":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-app.js","./dwr-page-dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-page-dau.js","./dwr-page-map":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/bindings/dwr-page-map.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/ui/index.js":[function(require,module,exports){
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
var actions = require('../redux/actions/collections/dau');
var dispatch = require('../redux/utils').dispatch;
var store = require('../redux/store');
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
},{"../redux/actions/collections/dau":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/actions/collections/dau.js","../redux/store":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/store.js","../redux/utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/redux/utils.js","./utils":"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/utils.js","superagent":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/superagent/lib/client.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/public/js/lib/services/index.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fU3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2ZyZWVHbG9iYWwuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19nZXRQcm90b3R5cGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19nZXRSYXdUYWcuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX292ZXJBcmcuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL19yb290LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdExpa2UuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2lzUGxhaW5PYmplY3QuanMiLCJub2RlX21vZHVsZXMvcG9seW1lci1yZWR1eC9wb2x5bWVyLXJlZHV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9Qb2ludC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvUHJvai5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvYWRqdXN0X2F4aXMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9hZGp1c3RfbGF0LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vYWRqdXN0X2xvbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2FzaW56LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vZTBmbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2UxZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9lMmZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vZTNmbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2dOLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vaW1sZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9pcXNmbnouanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9tbGZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vbXNmbnouanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9waGkyei5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL3BqX2VuZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9wal9pbnZfbWxmbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL3BqX21sZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9xc2Zuei5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL3NpZ24uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9zcmF0LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vdG9Qb2ludC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL3RzZm56LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb25zdGFudHMvRGF0dW0uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbnN0YW50cy9FbGxpcHNvaWQuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbnN0YW50cy9QcmltZU1lcmlkaWFuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb25zdGFudHMvdW5pdHMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvcmUuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2RhdHVtLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9kYXR1bV90cmFuc2Zvcm0uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2RlZnMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2Rlcml2ZUNvbnN0YW50cy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvZXh0ZW5kLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9nbG9iYWwuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2luY2x1ZGVkUHJvamVjdGlvbnMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wYXJzZUNvZGUuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2pTdHJpbmcuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9hZWEuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2FlcWQuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2Nhc3MuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2NlYS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvZXFjLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9lcWRjLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9nYXVzcy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvZ25vbS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMva3JvdmFrLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9sYWVhLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9sY2MuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2xvbmdsYXQuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL21lcmMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL21pbGwuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL21vbGwuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL256bWcuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL29tZXJjLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9wb2x5LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9zaW51LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9zb21lcmMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL3N0ZXJlLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9zdGVyZWEuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL3RtZXJjLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy91dG0uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL3ZhbmRnLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi90cmFuc2Zvcm0uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3drdC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9ub2RlX21vZHVsZXMvbWdycy9tZ3JzLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L3BhY2thZ2UuanNvbiIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvYXBwbHlNaWRkbGV3YXJlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9iaW5kQWN0aW9uQ3JlYXRvcnMuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NvbWJpbmVSZWR1Y2Vycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY29tcG9zZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY3JlYXRlU3RvcmUuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi91dGlscy93YXJuaW5nLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L2xpYi9pcy1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L2xpYi9pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvcmVxdWVzdC1iYXNlLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL3Jlc3BvbnNlLWJhc2UuanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvc3ltYm9sLW9ic2VydmFibGUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3ltYm9sLW9ic2VydmFibGUvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N5bWJvbC1vYnNlcnZhYmxlL2xpYi9wb255ZmlsbC5qcyIsInB1YmxpYy9qcy9saWIvY2ltaXMtZ3JpZC9pbmRleC5qcyIsInB1YmxpYy9qcy9saWIvZGVmaW5pdGlvbnMuanNvbiIsInB1YmxpYy9qcy9saWIvZXRvLXpvbmVzLmpzIiwicHVibGljL2pzL2xpYi9mZnQuanMiLCJwdWJsaWMvanMvbGliL2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9hY3Rpb25zL2FwcFN0YXRlLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9hY3Rpb25zL2NvbGxlY3Rpb25zL2NpbWlzLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9hY3Rpb25zL2NvbGxlY3Rpb25zL2RhdS5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvYWN0aW9ucy9jb2xsZWN0aW9ucy9ldG9ab25lcy5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvYWN0aW9ucy9jb2xsZWN0aW9ucy9pbmRleC5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvYWN0aW9ucy9jb25maWcuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L2FjdGlvbnMvaW5kZXguanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9taWRkbGV3YXJlL2FwaS5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvbWlkZGxld2FyZS9sb2dnaW5nLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9yZWR1Y2Vycy9hcHBTdGF0ZS5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvcmVkdWNlcnMvY29sbGVjdGlvbnMvY2ltaXMuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L3JlZHVjZXJzL2NvbGxlY3Rpb25zL2RhdS5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvcmVkdWNlcnMvY29sbGVjdGlvbnMvZXRvWm9uZXMuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L3JlZHVjZXJzL2NvbGxlY3Rpb25zL2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9yZWR1Y2Vycy9jb25maWcuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L3JlZHVjZXJzL2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC9yZWR1Y2Vycy91dGlscy5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvc3RvcmUuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L3VpL2JlaGF2aW9yLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC91aS9iaW5kaW5ncy9kd3ItYXBwLmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC91aS9iaW5kaW5ncy9kd3ItcGFnZS1kYXUuanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L3VpL2JpbmRpbmdzL2R3ci1wYWdlLW1hcC5qcyIsInB1YmxpYy9qcy9saWIvcmVkdXgvdWkvYmluZGluZ3MvaW5kZXguanMiLCJwdWJsaWMvanMvbGliL3JlZHV4L3VpL2luZGV4LmpzIiwicHVibGljL2pzL2xpYi9yZWR1eC91dGlscy5qcyIsInB1YmxpYy9qcy9saWIvc2VydmljZXMvY2ltaXMuanMiLCJwdWJsaWMvanMvbGliL3NlcnZpY2VzL2RhdS5qcyIsInB1YmxpYy9qcy9saWIvc2VydmljZXMvaW5kZXguanMiLCJwdWJsaWMvanMvbGliL3NlcnZpY2VzL3V0aWxzLmpzIiwicHVibGljL2pzL2xpYi91dGlscy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0dUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzc0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7OztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxyXG4vKipcclxuICogRXhwb3NlIGBFbWl0dGVyYC5cclxuICovXHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICBtb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cclxuICpcclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xyXG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcclxuICogQHJldHVybiB7T2JqZWN0fVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcblxyXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcclxuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcclxuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcclxuICB9XHJcbiAgcmV0dXJuIG9iajtcclxufVxyXG5cclxuLyoqXHJcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxyXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cclxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XHJcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xyXG4gICh0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSB8fCBbXSlcclxuICAgIC5wdXNoKGZuKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcclxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXHJcbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XHJcbiAgZnVuY3Rpb24gb24oKSB7XHJcbiAgICB0aGlzLm9mZihldmVudCwgb24pO1xyXG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICB9XHJcblxyXG4gIG9uLmZuID0gZm47XHJcbiAgdGhpcy5vbihldmVudCwgb24pO1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXHJcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cclxuICogQHJldHVybiB7RW1pdHRlcn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxyXG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XHJcbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XHJcbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xyXG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcclxuXHJcbiAgLy8gYWxsXHJcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xyXG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8vIHNwZWNpZmljIGV2ZW50XHJcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XHJcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xyXG5cclxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXHJcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xyXG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXHJcbiAgdmFyIGNiO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcclxuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XHJcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxyXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XHJcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xyXG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXHJcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07XHJcblxyXG4gIGlmIChjYWxsYmFja3MpIHtcclxuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcclxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEByZXR1cm4ge0FycmF5fVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcclxuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XHJcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW107XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHJldHVybiB7Qm9vbGVhbn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XHJcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XHJcbn07XHJcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bWJvbDtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBnZXRSYXdUYWcgPSByZXF1aXJlKCcuL19nZXRSYXdUYWcnKSxcbiAgICBvYmplY3RUb1N0cmluZyA9IHJlcXVpcmUoJy4vX29iamVjdFRvU3RyaW5nJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiBPYmplY3QodmFsdWUpKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRUYWc7XG4iLCIvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZyZWVHbG9iYWw7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UmF3VGFnO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VG9TdHJpbmc7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSB1bmFyeSBmdW5jdGlvbiB0aGF0IGludm9rZXMgYGZ1bmNgIHdpdGggaXRzIGFyZ3VtZW50IHRyYW5zZm9ybWVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB3cmFwLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSBhcmd1bWVudCB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlckFyZyhmdW5jLCB0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBmdW5jKHRyYW5zZm9ybShhcmcpKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvdmVyQXJnO1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gaW5mZXIgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLiAqL1xudmFyIG9iamVjdEN0b3JTdHJpbmcgPSBmdW5jVG9TdHJpbmcuY2FsbChPYmplY3QpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCB0aGF0IGlzLCBhbiBvYmplY3QgY3JlYXRlZCBieSB0aGVcbiAqIGBPYmplY3RgIGNvbnN0cnVjdG9yIG9yIG9uZSB3aXRoIGEgYFtbUHJvdG90eXBlXV1gIG9mIGBudWxsYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuOC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiB9XG4gKlxuICogXy5pc1BsYWluT2JqZWN0KG5ldyBGb28pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KHsgJ3gnOiAwLCAneSc6IDAgfSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KE9iamVjdC5jcmVhdGUobnVsbCkpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RMaWtlKHZhbHVlKSB8fCBiYXNlR2V0VGFnKHZhbHVlKSAhPSBvYmplY3RUYWcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHByb3RvID0gZ2V0UHJvdG90eXBlKHZhbHVlKTtcbiAgaWYgKHByb3RvID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIEN0b3IgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCAnY29uc3RydWN0b3InKSAmJiBwcm90by5jb25zdHJ1Y3RvcjtcbiAgcmV0dXJuIHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3RvciBpbnN0YW5jZW9mIEN0b3IgJiZcbiAgICBmdW5jVG9TdHJpbmcuY2FsbChDdG9yKSA9PSBvYmplY3RDdG9yU3RyaW5nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUGxhaW5PYmplY3Q7XG4iLCIoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdFsnUG9seW1lclJlZHV4J10gPSBmYWN0b3J5KCk7XG4gICAgfVxufSkodGhpcywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIHdhcm5pbmcgPSAnUG9seW1lciBSZWR1eDogPCVzPi4lcyBoYXMgXCJub3RpZnlcIiBlbmFibGVkLCB0d28td2F5IGJpbmRpbmdzIGdvZXMgYWdhaW5zdCBSZWR1eFxcJ3MgcGFyYWRpZ20nO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBwcm9wZXJ0eSBiaW5kaW5ncyBmb3VuZCBvbiBhIGdpdmVuIEVsZW1lbnQvQmVoYXZpb3IuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8T2JqZWN0fSBvYmogRWxlbWVudCBvciBCZWhhdmlvci5cbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFBvbHltZXIgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RvcmUgUmVkdXggc3RvcmUuXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0U3RhdGVQYXRoUHJvcGVydGllcyhvYmosIGVsZW1lbnQsIHN0b3JlKSB7XG4gICAgICAgIHZhciBwcm9wcyA9IFtdO1xuXG4gICAgICAgIGlmIChvYmoucHJvcGVydGllcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhvYmoucHJvcGVydGllcykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSBvYmoucHJvcGVydGllc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAocHJvcC5oYXNPd25Qcm9wZXJ0eSgnc3RhdGVQYXRoJykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aWZ5IGZsYWcsIHdhcm4gYWdhaW5zdCB0d28td2F5IGJpbmRpbmdzXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wLm5vdGlmeSAmJiAhcHJvcC5yZWFkT25seSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKHdhcm5pbmcsIGVsZW1lbnQuaXMsIG5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHByb3BzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVtcHR5IHN0YXRlUGF0aCByZXR1cm4gc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHByb3Auc3RhdGVQYXRoIHx8IHN0b3JlLmdldFN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHk6IHByb3AucmVhZE9ubHksXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBwcm9wLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmFjdG9yeSBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYSBsaXN0ZW5lciBmb3IgYSBnaXZlIFBvbHltZXIgZWxlbWVudC4gVGhlXG4gICAgICogcmV0dXJuaW5nIGxpc3RlbmVyIHNob3VsZCBiZSBwYXNzZWQgdG8gYHN0b3JlLnN1YnNjcmliZWAuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgUG9seW1lciBlbGVtZW50LlxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBSZWR1eCBzdWJjcmliZSBsaXN0ZW5lci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjcmVhdGVMaXN0ZW5lcihlbGVtZW50LCBzdG9yZSkge1xuICAgICAgICB2YXIgcHJvcHMgPSBnZXRTdGF0ZVBhdGhQcm9wZXJ0aWVzKGVsZW1lbnQsIGVsZW1lbnQsIHN0b3JlKTtcblxuICAgICAgICAvLyBiZWhhdmlvciBwcm9wZXJ0eSBiaW5kaW5nc1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbGVtZW50LmJlaGF2aW9ycykpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYmVoYXZpb3JzLmZvckVhY2goZnVuY3Rpb24oYmVoYXZpb3IpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXh0cmFzID0gZ2V0U3RhdGVQYXRoUHJvcGVydGllcyhiZWhhdmlvciwgZWxlbWVudCwgc3RvcmUpO1xuICAgICAgICAgICAgICAgIGlmIChleHRyYXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHByb3BzLCBleHRyYXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBkZS1kdXBlIGJlaGF2aW9yIHByb3BzXG4gICAgICAgICAgICB2YXIgbmFtZXMgPSBwcm9wcy5tYXAoZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wLm5hbWU7IC8vIGdyYWIgdGhlIHByb3AgbmFtZXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJvcHMgPSBwcm9wcy5maWx0ZXIoZnVuY3Rpb24ocHJvcCwgaSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuYW1lcy5pbmRleE9mKHByb3AubmFtZSkgPT09IGk7IC8vIGluZGljZXMgbXVzdCBtYXRjaFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZWR1eCBsaXN0ZW5lclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpO1xuICAgICAgICAgICAgcHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wTmFtZSA9IHByb3BlcnR5Lm5hbWU7XG4gICAgICAgICAgICAgICAgdmFyIHNwbGljZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUsIHByZXZpb3VzO1xuXG4gICAgICAgICAgICAgICAgLy8gc3RhdGVQYXRoLCBhIHBhdGggb3IgZnVuY3Rpb24uXG4gICAgICAgICAgICAgICAgdmFyIHBhdGggPSBwcm9wZXJ0eS5wYXRoO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGF0aCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gcGF0aC5jYWxsKGVsZW1lbnQsIHN0YXRlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFBvbHltZXIuQmFzZS5nZXQocGF0aCwgc3RhdGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHByZXZlbnQgdW5uZWNlc2FyeSBwb2x5bWVyIG5vdGlmaWNhdGlvbnNcbiAgICAgICAgICAgICAgICBwcmV2aW91cyA9IGVsZW1lbnQuZ2V0KHByb3BlcnR5Lm5hbWUpO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gcHJldmlvdXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHR5cGUgb2YgYXJyYXksIHdvcmsgb3V0IHNwbGljZXMgYmVmb3JlIHNldHRpbmcgdGhlIHZhbHVlXG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LnR5cGUgPT09IEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgfHwgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gW107XG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzID0gcHJldmlvdXMgfHwgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gW107XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdGhlIHZhbHVlIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPCcrIGVsZW1lbnQuaXMgKyc+LicrIHByb3BOYW1lICsnIHR5cGUgaXMgQXJyYXkgYnV0IGdpdmVuOiAnICsgKHR5cGVvZiB2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzcGxpY2VzID0gUG9seW1lci5BcnJheVNwbGljZS5jYWxjdWxhdGVTcGxpY2VzKHZhbHVlLCBwcmV2aW91cyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gc2V0XG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LnJlYWRPbmx5KSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQubm90aWZ5UGF0aChwcm9wTmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0KHByb3BOYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gbm90aWZ5IGVsZW1lbnQgb2Ygc3BsaWNlc1xuICAgICAgICAgICAgICAgIGlmIChzcGxpY2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm5vdGlmeVNwbGljZXMocHJvcE5hbWUsIHNwbGljZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxlbWVudC5maXJlKCdzdGF0ZS1jaGFuZ2VkJywgc3RhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQmluZHMgYW4gZ2l2ZW4gUG9seW1lciBlbGVtZW50IHRvIGEgUmVkdXggc3RvcmUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgUG9seW1lciBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdG9yZSBSZWR1eCBzdG9yZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiaW5kUmVkdXhMaXN0ZW5lcihlbGVtZW50LCBzdG9yZSkge1xuICAgICAgICB2YXIgbGlzdGVuZXI7XG5cbiAgICAgICAgaWYgKGVsZW1lbnQuX3JlZHV4VW5zdWJzY3JpYmUpIHJldHVybjtcblxuICAgICAgICBsaXN0ZW5lciA9IGNyZWF0ZUxpc3RlbmVyKGVsZW1lbnQsIHN0b3JlKTtcbiAgICAgICAgbGlzdGVuZXIoKTsgLy8gc3RhcnQgYmluZGluZ3NcblxuICAgICAgICBlbGVtZW50Ll9yZWR1eFVuc3Vic2NyaWJlID0gc3RvcmUuc3Vic2NyaWJlKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmRzIGEgUG9seW1lciBlbGVtZW50IGZyb20gYSBSZWR1eCBzdG9yZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHVuYmluZFJlZHV4TGlzdGVuZXIoZWxlbWVudCkge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQuX3JlZHV4VW5zdWJzY3JpYmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuX3JlZHV4VW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIGRlbGV0ZSBlbGVtZW50Ll9yZWR1eFVuc3Vic2NyaWJlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQnVpbGRzIGxpc3Qgb2YgYWN0aW9uIGNyZWF0b3JzIGZyb20gYSBnaXZlbiBlbGVtZW50IGFuZCBpdCdzIGluaGVyaXRlZFxuICAgICAqIGJlaGF2aW9ycyBzZXR0aW5nIHRoZSBsaXN0IG9udG8gdGhlIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgUG9seW1lciBlbGVtZW50IGluc3RhbmNlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbXBpbGVBY3Rpb25DcmVhdG9ycyhlbGVtZW50KSB7XG4gICAgICAgIHZhciBhY3Rpb25zID0ge307XG4gICAgICAgIHZhciBiZWhhdmlvcnMgPSBlbGVtZW50LmJlaGF2aW9ycztcblxuICAgICAgICBpZiAoZWxlbWVudC5fcmVkdXhBY3Rpb25zKSByZXR1cm47XG5cbiAgICAgICAgLy8gYWRkIGJlaGF2aW9yIGFjdGlvbnMgZmlyc3QsIGluIHJldmVyc2Ugb3JkZXIgc28gd2Uga2VlcCBwcmlvcml0eVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShiZWhhdmlvcnMpKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gYmVoYXZpb3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihhY3Rpb25zLCBiZWhhdmlvcnNbaV0uYWN0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBlbGVtZW50IGFjdGlvbnMgaGF2ZSBwcmlvcml0eVxuICAgICAgICBlbGVtZW50Ll9yZWR1eEFjdGlvbnMgPSBPYmplY3QuYXNzaWduKGFjdGlvbnMsIGVsZW1lbnQuYWN0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2hlcyBhIFJlZHV4IGFjdGlvbiB2aWEgYSBQb2x5bWVyIGVsZW1lbnQuIFRoaXMgZ2l2ZXMgdGhlIGVsZW1lbnRcbiAgICAgKiBhIHBvbHltb3JwaGljIGRpc3BhdGNoIGZ1bmN0aW9uLiBTZWUgdGhlIHJlYWRtZSBmb3IgdGhlIHZhcmlvdXMgd2F5cyB0b1xuICAgICAqIGRpc3BhdGNoLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFBvbHltZXIgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RvcmUgUmVkdXggc3RvcmUuXG4gICAgICogQHBhcmFtIHtBcmd1bWVudHN9IGFyZ3MgVGhlIGFyZ3VtZW50cyBwYXNzZWQgdG8gYGVsZW1lbnQuZGlzcGF0Y2hgLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGNvbXB1dGVkIFJlZHV4IGFjdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkaXNwYXRjaFJlZHV4QWN0aW9uKGVsZW1lbnQsIHN0b3JlLCBhcmdzKSB7XG4gICAgICAgIHZhciBhY3Rpb24gPSBhcmdzWzBdO1xuICAgICAgICB2YXIgYWN0aW9ucyA9IGVsZW1lbnQuX3JlZHV4QWN0aW9ucztcblxuICAgICAgICBhcmdzID0gY2FzdEFyZ3VtZW50c1RvQXJyYXkoYXJncyk7XG5cbiAgICAgICAgLy8gYWN0aW9uIG5hbWVcbiAgICAgICAgaWYgKGFjdGlvbnMgJiYgdHlwZW9mIGFjdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYWN0aW9uc1thY3Rpb25dICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUG9seW1lciBSZWR1eDogPCcgKyBlbGVtZW50LmlzICsgJz4gaGFzIG5vIGFjdGlvbiBcIicgKyBhY3Rpb24gKyAnXCInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFjdGlvbiA9IGFjdGlvbnNbYWN0aW9uXS5hcHBseShlbGVtZW50LCBhcmdzLnNsaWNlKDEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vICEhISBERVBSRUNJQVRFRCAhISFcbiAgICAgICAgLy8gVGhpcyB3aWxsIGJlIHJlbW92ZWQgYXMgb2YgMS4wLlxuXG4gICAgICAgIC8vIGFjdGlvbiBjcmVhdG9yXG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSAnZnVuY3Rpb24nICYmIGFjdGlvbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzdG9yZS5kaXNwYXRjaChhY3Rpb24oKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAtLS1cblxuICAgICAgICAvLyBtaWRkbGV3YXJlLCBtYWtlIHN1cmUgd2UgcGFzcyB0aGUgcG9seW1lci1yZWR1eCBkaXNwYXRjaFxuICAgICAgICAvLyBzbyB3ZSBoYXZlIGFjY2VzcyB0byB0aGUgZWxlbWVudHMgYWN0aW9uIGNyZWF0b3JzXG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RvcmUuZGlzcGF0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3YgPSBjYXN0QXJndW1lbnRzVG9BcnJheShhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIC8vIHJlcGxhY2UgcmVkdXggZGlzcGF0Y2hcbiAgICAgICAgICAgICAgICBhcmd2LnNwbGljZSgwLCAxLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpc3BhdGNoUmVkdXhBY3Rpb24oZWxlbWVudCwgc3RvcmUsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGlvbi5hcHBseShlbGVtZW50LCBhcmd2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWN0aW9uXG4gICAgICAgIHJldHVybiBzdG9yZS5kaXNwYXRjaChhY3Rpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFR1cm5zIGFyZ3VtZW50cyBpbnRvIGFuIEFycmF5LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtBcmd1bWVudHN9IGFyZ3NcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjYXN0QXJndW1lbnRzVG9BcnJheShhcmdzKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzLCAwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIFBvbHltZXJSZWR1eCBiZWhhdmlvcnMgZnJvbSBhIGdpdmVuIFJlZHV4IHN0b3JlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHN0b3JlIFJlZHV4IHN0b3JlLlxuICAgICAqIEByZXR1cm4ge1BvbHltZXJSZWR1eH1cbiAgICAgKi9cbiAgICByZXR1cm4gZnVuY3Rpb24oc3RvcmUpIHtcbiAgICAgICAgdmFyIFBvbHltZXJSZWR1eDtcblxuICAgICAgICAvLyBjaGVjayBmb3Igc3RvcmVcbiAgICAgICAgaWYgKCFzdG9yZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWlzc2luZyByZWR1eCBzdG9yZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGBQb2x5bWVyUmVkdXhgIGJpbmRzIGEgZ2l2ZW4gUmVkdXggc3RvcmUncyBzdGF0ZSB0byBpbXBsZW1lbnRpbmcgRWxlbWVudHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEZ1bGwgZG9jdW1lbnRhdGlvbiBhdmFpbGFibGUsIGh0dHBzOi8vZ2l0aHViLmNvbS90dXItbnIvcG9seW1lci1yZWR1eC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBvbHltZXJCZWhhdmlvciBQb2x5bWVyUmVkdXhcbiAgICAgICAgICogQGRlbW8gZGVtby9pbmRleC5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gUG9seW1lclJlZHV4ID0ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBGaXJlZCB3aGVuIHRoZSBSZWR1eCBzdG9yZSBzdGF0ZSBjaGFuZ2VzLlxuICAgICAgICAgICAgICogQGV2ZW50IHN0YXRlLWNoYW5nZWRcbiAgICAgICAgICAgICAqIEBwYXJhbSB7Kn0gc3RhdGVcbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYmluZFJlZHV4TGlzdGVuZXIodGhpcywgc3RvcmUpO1xuICAgICAgICAgICAgICAgIGNvbXBpbGVBY3Rpb25DcmVhdG9ycyh0aGlzKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBiaW5kUmVkdXhMaXN0ZW5lcih0aGlzLCBzdG9yZSk7XG4gICAgICAgICAgICAgICAgY29tcGlsZUFjdGlvbkNyZWF0b3JzKHRoaXMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZGV0YWNoZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHVuYmluZFJlZHV4TGlzdGVuZXIodGhpcyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIERpc3BhdGNoZXMgYW4gYWN0aW9uIHRvIHRoZSBSZWR1eCBzdG9yZS5cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R8RnVuY3Rpb259IGFjdGlvblxuICAgICAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgYWN0aW9uIHRoYXQgd2FzIGRpc3BhdGNoZWQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRpc3BhdGNoOiBmdW5jdGlvbihhY3Rpb24gLyosIFsuLi5hcmdzXSAqLykge1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXNwYXRjaFJlZHV4QWN0aW9uKHRoaXMsIHN0b3JlLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBHZXRzIHRoZSBjdXJyZW50IHN0YXRlIGluIHRoZSBSZWR1eCBzdG9yZS5cbiAgICAgICAgICAgICAqIEByZXR1cm4geyp9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdldFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmUuZ2V0U3RhdGUoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfTtcbn0pO1xuIiwidmFyIG1ncnMgPSByZXF1aXJlKCdtZ3JzJyk7XG5cbmZ1bmN0aW9uIFBvaW50KHgsIHksIHopIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFBvaW50KSkge1xuICAgIHJldHVybiBuZXcgUG9pbnQoeCwgeSwgeik7XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkoeCkpIHtcbiAgICB0aGlzLnggPSB4WzBdO1xuICAgIHRoaXMueSA9IHhbMV07XG4gICAgdGhpcy56ID0geFsyXSB8fCAwLjA7XG4gIH1lbHNlIGlmKHR5cGVvZiB4ID09PSAnb2JqZWN0Jyl7XG4gICAgdGhpcy54ID0geC54O1xuICAgIHRoaXMueSA9IHgueTtcbiAgICB0aGlzLnogPSB4LnogfHwgMC4wO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB4ID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgeSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgY29vcmRzID0geC5zcGxpdCgnLCcpO1xuICAgIHRoaXMueCA9IHBhcnNlRmxvYXQoY29vcmRzWzBdLCAxMCk7XG4gICAgdGhpcy55ID0gcGFyc2VGbG9hdChjb29yZHNbMV0sIDEwKTtcbiAgICB0aGlzLnogPSBwYXJzZUZsb2F0KGNvb3Jkc1syXSwgMTApIHx8IDAuMDtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy56ID0geiB8fCAwLjA7XG4gIH1cbiAgY29uc29sZS53YXJuKCdwcm9qNC5Qb2ludCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAzLCB1c2UgcHJvajQudG9Qb2ludCcpO1xufVxuXG5Qb2ludC5mcm9tTUdSUyA9IGZ1bmN0aW9uKG1ncnNTdHIpIHtcbiAgcmV0dXJuIG5ldyBQb2ludChtZ3JzLnRvUG9pbnQobWdyc1N0cikpO1xufTtcblBvaW50LnByb3RvdHlwZS50b01HUlMgPSBmdW5jdGlvbihhY2N1cmFjeSkge1xuICByZXR1cm4gbWdycy5mb3J3YXJkKFt0aGlzLngsIHRoaXMueV0sIGFjY3VyYWN5KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50OyIsInZhciBwYXJzZUNvZGUgPSByZXF1aXJlKFwiLi9wYXJzZUNvZGVcIik7XG52YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi9leHRlbmQnKTtcbnZhciBwcm9qZWN0aW9ucyA9IHJlcXVpcmUoJy4vcHJvamVjdGlvbnMnKTtcbnZhciBkZXJpdmVDb25zdGFudHMgPSByZXF1aXJlKCcuL2Rlcml2ZUNvbnN0YW50cycpO1xuXG5mdW5jdGlvbiBQcm9qZWN0aW9uKHNyc0NvZGUsY2FsbGJhY2spIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFByb2plY3Rpb24pKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9qZWN0aW9uKHNyc0NvZGUpO1xuICB9XG4gIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oZXJyb3Ipe1xuICAgIGlmKGVycm9yKXtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfTtcbiAgdmFyIGpzb24gPSBwYXJzZUNvZGUoc3JzQ29kZSk7XG4gIGlmKHR5cGVvZiBqc29uICE9PSAnb2JqZWN0Jyl7XG4gICAgY2FsbGJhY2soc3JzQ29kZSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBtb2RpZmllZEpTT04gPSBkZXJpdmVDb25zdGFudHMoanNvbik7XG4gIHZhciBvdXJQcm9qID0gUHJvamVjdGlvbi5wcm9qZWN0aW9ucy5nZXQobW9kaWZpZWRKU09OLnByb2pOYW1lKTtcbiAgaWYob3VyUHJvail7XG4gICAgZXh0ZW5kKHRoaXMsIG1vZGlmaWVkSlNPTik7XG4gICAgZXh0ZW5kKHRoaXMsIG91clByb2opO1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGNhbGxiYWNrKG51bGwsIHRoaXMpO1xuICB9ZWxzZXtcbiAgICBjYWxsYmFjayhzcnNDb2RlKTtcbiAgfVxufVxuUHJvamVjdGlvbi5wcm9qZWN0aW9ucyA9IHByb2plY3Rpb25zO1xuUHJvamVjdGlvbi5wcm9qZWN0aW9ucy5zdGFydCgpO1xubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0aW9uO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjcnMsIGRlbm9ybSwgcG9pbnQpIHtcbiAgdmFyIHhpbiA9IHBvaW50LngsXG4gICAgeWluID0gcG9pbnQueSxcbiAgICB6aW4gPSBwb2ludC56IHx8IDAuMDtcbiAgdmFyIHYsIHQsIGk7XG4gIGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICBpZiAoZGVub3JtICYmIGkgPT09IDIgJiYgcG9pbnQueiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIHYgPSB4aW47XG4gICAgICB0ID0gJ3gnO1xuICAgIH1cbiAgICBlbHNlIGlmIChpID09PSAxKSB7XG4gICAgICB2ID0geWluO1xuICAgICAgdCA9ICd5JztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2ID0gemluO1xuICAgICAgdCA9ICd6JztcbiAgICB9XG4gICAgc3dpdGNoIChjcnMuYXhpc1tpXSkge1xuICAgIGNhc2UgJ2UnOlxuICAgICAgcG9pbnRbdF0gPSB2O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndyc6XG4gICAgICBwb2ludFt0XSA9IC12O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbic6XG4gICAgICBwb2ludFt0XSA9IHY7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzJzpcbiAgICAgIHBvaW50W3RdID0gLXY7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd1JzpcbiAgICAgIGlmIChwb2ludFt0XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBvaW50LnogPSB2O1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZCc6XG4gICAgICBpZiAocG9pbnRbdF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwb2ludC56ID0gLXY7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgLy9jb25zb2xlLmxvZyhcIkVSUk9SOiB1bmtub3cgYXhpcyAoXCIrY3JzLmF4aXNbaV0rXCIpIC0gY2hlY2sgZGVmaW5pdGlvbiBvZiBcIitjcnMucHJvak5hbWUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIHJldHVybiBwb2ludDtcbn07XG4iLCJ2YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBzaWduID0gcmVxdWlyZSgnLi9zaWduJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gKE1hdGguYWJzKHgpIDwgSEFMRl9QSSkgPyB4IDogKHggLSAoc2lnbih4KSAqIE1hdGguUEkpKTtcbn07IiwidmFyIFRXT19QSSA9IE1hdGguUEkgKiAyO1xuLy8gU1BJIGlzIHNsaWdodGx5IGdyZWF0ZXIgdGhhbiBNYXRoLlBJLCBzbyB2YWx1ZXMgdGhhdCBleGNlZWQgdGhlIC0xODAuLjE4MFxuLy8gZGVncmVlIHJhbmdlIGJ5IGEgdGlueSBhbW91bnQgZG9uJ3QgZ2V0IHdyYXBwZWQuIFRoaXMgcHJldmVudHMgcG9pbnRzIHRoYXRcbi8vIGhhdmUgZHJpZnRlZCBmcm9tIHRoZWlyIG9yaWdpbmFsIGxvY2F0aW9uIGFsb25nIHRoZSAxODB0aCBtZXJpZGlhbiAoZHVlIHRvXG4vLyBmbG9hdGluZyBwb2ludCBlcnJvcikgZnJvbSBjaGFuZ2luZyB0aGVpciBzaWduLlxudmFyIFNQSSA9IDMuMTQxNTkyNjUzNTk7XG52YXIgc2lnbiA9IHJlcXVpcmUoJy4vc2lnbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIChNYXRoLmFicyh4KSA8PSBTUEkpID8geCA6ICh4IC0gKHNpZ24oeCkgKiBUV09fUEkpKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4KSB7XG4gIGlmIChNYXRoLmFicyh4KSA+IDEpIHtcbiAgICB4ID0gKHggPiAxKSA/IDEgOiAtMTtcbiAgfVxuICByZXR1cm4gTWF0aC5hc2luKHgpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuICgxIC0gMC4yNSAqIHggKiAoMSArIHggLyAxNiAqICgzICsgMS4yNSAqIHgpKSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gKDAuMzc1ICogeCAqICgxICsgMC4yNSAqIHggKiAoMSArIDAuNDY4NzUgKiB4KSkpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuICgwLjA1ODU5Mzc1ICogeCAqIHggKiAoMSArIDAuNzUgKiB4KSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gKHggKiB4ICogeCAqICgzNSAvIDMwNzIpKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhLCBlLCBzaW5waGkpIHtcbiAgdmFyIHRlbXAgPSBlICogc2lucGhpO1xuICByZXR1cm4gYSAvIE1hdGguc3FydCgxIC0gdGVtcCAqIHRlbXApO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1sLCBlMCwgZTEsIGUyLCBlMykge1xuICB2YXIgcGhpO1xuICB2YXIgZHBoaTtcblxuICBwaGkgPSBtbCAvIGUwO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgICBkcGhpID0gKG1sIC0gKGUwICogcGhpIC0gZTEgKiBNYXRoLnNpbigyICogcGhpKSArIGUyICogTWF0aC5zaW4oNCAqIHBoaSkgLSBlMyAqIE1hdGguc2luKDYgKiBwaGkpKSkgLyAoZTAgLSAyICogZTEgKiBNYXRoLmNvcygyICogcGhpKSArIDQgKiBlMiAqIE1hdGguY29zKDQgKiBwaGkpIC0gNiAqIGUzICogTWF0aC5jb3MoNiAqIHBoaSkpO1xuICAgIHBoaSArPSBkcGhpO1xuICAgIGlmIChNYXRoLmFicyhkcGhpKSA8PSAwLjAwMDAwMDAwMDEpIHtcbiAgICAgIHJldHVybiBwaGk7XG4gICAgfVxuICB9XG5cbiAgLy8uLnJlcG9ydEVycm9yKFwiSU1MRk4tQ09OVjpMYXRpdHVkZSBmYWlsZWQgdG8gY29udmVyZ2UgYWZ0ZXIgMTUgaXRlcmF0aW9uc1wiKTtcbiAgcmV0dXJuIE5hTjtcbn07IiwidmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWNjZW50LCBxKSB7XG4gIHZhciB0ZW1wID0gMSAtICgxIC0gZWNjZW50ICogZWNjZW50KSAvICgyICogZWNjZW50KSAqIE1hdGgubG9nKCgxIC0gZWNjZW50KSAvICgxICsgZWNjZW50KSk7XG4gIGlmIChNYXRoLmFicyhNYXRoLmFicyhxKSAtIHRlbXApIDwgMS4wRS02KSB7XG4gICAgaWYgKHEgPCAwKSB7XG4gICAgICByZXR1cm4gKC0xICogSEFMRl9QSSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIEhBTEZfUEk7XG4gICAgfVxuICB9XG4gIC8vdmFyIHBoaSA9IDAuNSogcS8oMS1lY2NlbnQqZWNjZW50KTtcbiAgdmFyIHBoaSA9IE1hdGguYXNpbigwLjUgKiBxKTtcbiAgdmFyIGRwaGk7XG4gIHZhciBzaW5fcGhpO1xuICB2YXIgY29zX3BoaTtcbiAgdmFyIGNvbjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMDsgaSsrKSB7XG4gICAgc2luX3BoaSA9IE1hdGguc2luKHBoaSk7XG4gICAgY29zX3BoaSA9IE1hdGguY29zKHBoaSk7XG4gICAgY29uID0gZWNjZW50ICogc2luX3BoaTtcbiAgICBkcGhpID0gTWF0aC5wb3coMSAtIGNvbiAqIGNvbiwgMikgLyAoMiAqIGNvc19waGkpICogKHEgLyAoMSAtIGVjY2VudCAqIGVjY2VudCkgLSBzaW5fcGhpIC8gKDEgLSBjb24gKiBjb24pICsgMC41IC8gZWNjZW50ICogTWF0aC5sb2coKDEgLSBjb24pIC8gKDEgKyBjb24pKSk7XG4gICAgcGhpICs9IGRwaGk7XG4gICAgaWYgKE1hdGguYWJzKGRwaGkpIDw9IDAuMDAwMDAwMDAwMSkge1xuICAgICAgcmV0dXJuIHBoaTtcbiAgICB9XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKFwiSVFTRk4tQ09OVjpMYXRpdHVkZSBmYWlsZWQgdG8gY29udmVyZ2UgYWZ0ZXIgMzAgaXRlcmF0aW9uc1wiKTtcbiAgcmV0dXJuIE5hTjtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlMCwgZTEsIGUyLCBlMywgcGhpKSB7XG4gIHJldHVybiAoZTAgKiBwaGkgLSBlMSAqIE1hdGguc2luKDIgKiBwaGkpICsgZTIgKiBNYXRoLnNpbig0ICogcGhpKSAtIGUzICogTWF0aC5zaW4oNiAqIHBoaSkpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVjY2VudCwgc2lucGhpLCBjb3NwaGkpIHtcbiAgdmFyIGNvbiA9IGVjY2VudCAqIHNpbnBoaTtcbiAgcmV0dXJuIGNvc3BoaSAvIChNYXRoLnNxcnQoMSAtIGNvbiAqIGNvbikpO1xufTsiLCJ2YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWNjZW50LCB0cykge1xuICB2YXIgZWNjbnRoID0gMC41ICogZWNjZW50O1xuICB2YXIgY29uLCBkcGhpO1xuICB2YXIgcGhpID0gSEFMRl9QSSAtIDIgKiBNYXRoLmF0YW4odHMpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8PSAxNTsgaSsrKSB7XG4gICAgY29uID0gZWNjZW50ICogTWF0aC5zaW4ocGhpKTtcbiAgICBkcGhpID0gSEFMRl9QSSAtIDIgKiBNYXRoLmF0YW4odHMgKiAoTWF0aC5wb3coKCgxIC0gY29uKSAvICgxICsgY29uKSksIGVjY250aCkpKSAtIHBoaTtcbiAgICBwaGkgKz0gZHBoaTtcbiAgICBpZiAoTWF0aC5hYnMoZHBoaSkgPD0gMC4wMDAwMDAwMDAxKSB7XG4gICAgICByZXR1cm4gcGhpO1xuICAgIH1cbiAgfVxuICAvL2NvbnNvbGUubG9nKFwicGhpMnogaGFzIE5vQ29udmVyZ2VuY2VcIik7XG4gIHJldHVybiAtOTk5OTtcbn07IiwidmFyIEMwMCA9IDE7XG52YXIgQzAyID0gMC4yNTtcbnZhciBDMDQgPSAwLjA0Njg3NTtcbnZhciBDMDYgPSAwLjAxOTUzMTI1O1xudmFyIEMwOCA9IDAuMDEwNjgxMTUyMzQzNzU7XG52YXIgQzIyID0gMC43NTtcbnZhciBDNDQgPSAwLjQ2ODc1O1xudmFyIEM0NiA9IDAuMDEzMDIwODMzMzMzMzMzMzMzMzM7XG52YXIgQzQ4ID0gMC4wMDcxMjA3NjgyMjkxNjY2NjY2NjtcbnZhciBDNjYgPSAwLjM2NDU4MzMzMzMzMzMzMzMzMzMzO1xudmFyIEM2OCA9IDAuMDA1Njk2NjE0NTgzMzMzMzMzMzM7XG52YXIgQzg4ID0gMC4zMDc2MTcxODc1O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVzKSB7XG4gIHZhciBlbiA9IFtdO1xuICBlblswXSA9IEMwMCAtIGVzICogKEMwMiArIGVzICogKEMwNCArIGVzICogKEMwNiArIGVzICogQzA4KSkpO1xuICBlblsxXSA9IGVzICogKEMyMiAtIGVzICogKEMwNCArIGVzICogKEMwNiArIGVzICogQzA4KSkpO1xuICB2YXIgdCA9IGVzICogZXM7XG4gIGVuWzJdID0gdCAqIChDNDQgLSBlcyAqIChDNDYgKyBlcyAqIEM0OCkpO1xuICB0ICo9IGVzO1xuICBlblszXSA9IHQgKiAoQzY2IC0gZXMgKiBDNjgpO1xuICBlbls0XSA9IHQgKiBlcyAqIEM4ODtcbiAgcmV0dXJuIGVuO1xufTsiLCJ2YXIgcGpfbWxmbiA9IHJlcXVpcmUoXCIuL3BqX21sZm5cIik7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIE1BWF9JVEVSID0gMjA7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyZywgZXMsIGVuKSB7XG4gIHZhciBrID0gMSAvICgxIC0gZXMpO1xuICB2YXIgcGhpID0gYXJnO1xuICBmb3IgKHZhciBpID0gTUFYX0lURVI7IGk7IC0taSkgeyAvKiByYXJlbHkgZ29lcyBvdmVyIDIgaXRlcmF0aW9ucyAqL1xuICAgIHZhciBzID0gTWF0aC5zaW4ocGhpKTtcbiAgICB2YXIgdCA9IDEgLSBlcyAqIHMgKiBzO1xuICAgIC8vdCA9IHRoaXMucGpfbWxmbihwaGksIHMsIE1hdGguY29zKHBoaSksIGVuKSAtIGFyZztcbiAgICAvL3BoaSAtPSB0ICogKHQgKiBNYXRoLnNxcnQodCkpICogaztcbiAgICB0ID0gKHBqX21sZm4ocGhpLCBzLCBNYXRoLmNvcyhwaGkpLCBlbikgLSBhcmcpICogKHQgKiBNYXRoLnNxcnQodCkpICogaztcbiAgICBwaGkgLT0gdDtcbiAgICBpZiAoTWF0aC5hYnModCkgPCBFUFNMTikge1xuICAgICAgcmV0dXJuIHBoaTtcbiAgICB9XG4gIH1cbiAgLy8uLnJlcG9ydEVycm9yKFwiY2Fzczpwal9pbnZfbWxmbjogQ29udmVyZ2VuY2UgZXJyb3JcIik7XG4gIHJldHVybiBwaGk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocGhpLCBzcGhpLCBjcGhpLCBlbikge1xuICBjcGhpICo9IHNwaGk7XG4gIHNwaGkgKj0gc3BoaTtcbiAgcmV0dXJuIChlblswXSAqIHBoaSAtIGNwaGkgKiAoZW5bMV0gKyBzcGhpICogKGVuWzJdICsgc3BoaSAqIChlblszXSArIHNwaGkgKiBlbls0XSkpKSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWNjZW50LCBzaW5waGkpIHtcbiAgdmFyIGNvbjtcbiAgaWYgKGVjY2VudCA+IDEuMGUtNykge1xuICAgIGNvbiA9IGVjY2VudCAqIHNpbnBoaTtcbiAgICByZXR1cm4gKCgxIC0gZWNjZW50ICogZWNjZW50KSAqIChzaW5waGkgLyAoMSAtIGNvbiAqIGNvbikgLSAoMC41IC8gZWNjZW50KSAqIE1hdGgubG9nKCgxIC0gY29uKSAvICgxICsgY29uKSkpKTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gKDIgKiBzaW5waGkpO1xuICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4geDwwID8gLTEgOiAxO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVzaW5wLCBleHApIHtcbiAgcmV0dXJuIChNYXRoLnBvdygoMSAtIGVzaW5wKSAvICgxICsgZXNpbnApLCBleHApKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJyYXkpe1xuICB2YXIgb3V0ID0ge1xuICAgIHg6IGFycmF5WzBdLFxuICAgIHk6IGFycmF5WzFdXG4gIH07XG4gIGlmIChhcnJheS5sZW5ndGg+Mikge1xuICAgIG91dC56ID0gYXJyYXlbMl07XG4gIH1cbiAgaWYgKGFycmF5Lmxlbmd0aD4zKSB7XG4gICAgb3V0Lm0gPSBhcnJheVszXTtcbiAgfVxuICByZXR1cm4gb3V0O1xufTsiLCJ2YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlY2NlbnQsIHBoaSwgc2lucGhpKSB7XG4gIHZhciBjb24gPSBlY2NlbnQgKiBzaW5waGk7XG4gIHZhciBjb20gPSAwLjUgKiBlY2NlbnQ7XG4gIGNvbiA9IE1hdGgucG93KCgoMSAtIGNvbikgLyAoMSArIGNvbikpLCBjb20pO1xuICByZXR1cm4gKE1hdGgudGFuKDAuNSAqIChIQUxGX1BJIC0gcGhpKSkgLyBjb24pO1xufTsiLCJleHBvcnRzLndnczg0ID0ge1xuICB0b3dnczg0OiBcIjAsMCwwXCIsXG4gIGVsbGlwc2U6IFwiV0dTODRcIixcbiAgZGF0dW1OYW1lOiBcIldHUzg0XCJcbn07XG5leHBvcnRzLmNoMTkwMyA9IHtcbiAgdG93Z3M4NDogXCI2NzQuMzc0LDE1LjA1Niw0MDUuMzQ2XCIsXG4gIGVsbGlwc2U6IFwiYmVzc2VsXCIsXG4gIGRhdHVtTmFtZTogXCJzd2lzc1wiXG59O1xuZXhwb3J0cy5nZ3JzODcgPSB7XG4gIHRvd2dzODQ6IFwiLTE5OS44Nyw3NC43OSwyNDYuNjJcIixcbiAgZWxsaXBzZTogXCJHUlM4MFwiLFxuICBkYXR1bU5hbWU6IFwiR3JlZWtfR2VvZGV0aWNfUmVmZXJlbmNlX1N5c3RlbV8xOTg3XCJcbn07XG5leHBvcnRzLm5hZDgzID0ge1xuICB0b3dnczg0OiBcIjAsMCwwXCIsXG4gIGVsbGlwc2U6IFwiR1JTODBcIixcbiAgZGF0dW1OYW1lOiBcIk5vcnRoX0FtZXJpY2FuX0RhdHVtXzE5ODNcIlxufTtcbmV4cG9ydHMubmFkMjcgPSB7XG4gIG5hZGdyaWRzOiBcIkBjb251cyxAYWxhc2thLEBudHYyXzAuZ3NiLEBudHYxX2Nhbi5kYXRcIixcbiAgZWxsaXBzZTogXCJjbHJrNjZcIixcbiAgZGF0dW1OYW1lOiBcIk5vcnRoX0FtZXJpY2FuX0RhdHVtXzE5MjdcIlxufTtcbmV4cG9ydHMucG90c2RhbSA9IHtcbiAgdG93Z3M4NDogXCI2MDYuMCwyMy4wLDQxMy4wXCIsXG4gIGVsbGlwc2U6IFwiYmVzc2VsXCIsXG4gIGRhdHVtTmFtZTogXCJQb3RzZGFtIFJhdWVuYmVyZyAxOTUwIERIRE5cIlxufTtcbmV4cG9ydHMuY2FydGhhZ2UgPSB7XG4gIHRvd2dzODQ6IFwiLTI2My4wLDYuMCw0MzEuMFwiLFxuICBlbGxpcHNlOiBcImNsYXJrODBcIixcbiAgZGF0dW1OYW1lOiBcIkNhcnRoYWdlIDE5MzQgVHVuaXNpYVwiXG59O1xuZXhwb3J0cy5oZXJtYW5uc2tvZ2VsID0ge1xuICB0b3dnczg0OiBcIjY1My4wLC0yMTIuMCw0NDkuMFwiLFxuICBlbGxpcHNlOiBcImJlc3NlbFwiLFxuICBkYXR1bU5hbWU6IFwiSGVybWFubnNrb2dlbFwiXG59O1xuZXhwb3J0cy5pcmU2NSA9IHtcbiAgdG93Z3M4NDogXCI0ODIuNTMwLC0xMzAuNTk2LDU2NC41NTcsLTEuMDQyLC0wLjIxNCwtMC42MzEsOC4xNVwiLFxuICBlbGxpcHNlOiBcIm1vZF9haXJ5XCIsXG4gIGRhdHVtTmFtZTogXCJJcmVsYW5kIDE5NjVcIlxufTtcbmV4cG9ydHMucmFzc2FkaXJhbiA9IHtcbiAgdG93Z3M4NDogXCItMTMzLjYzLC0xNTcuNSwtMTU4LjYyXCIsXG4gIGVsbGlwc2U6IFwiaW50bFwiLFxuICBkYXR1bU5hbWU6IFwiUmFzc2FkaXJhblwiXG59O1xuZXhwb3J0cy5uemdkNDkgPSB7XG4gIHRvd2dzODQ6IFwiNTkuNDcsLTUuMDQsMTg3LjQ0LDAuNDcsLTAuMSwxLjAyNCwtNC41OTkzXCIsXG4gIGVsbGlwc2U6IFwiaW50bFwiLFxuICBkYXR1bU5hbWU6IFwiTmV3IFplYWxhbmQgR2VvZGV0aWMgRGF0dW0gMTk0OVwiXG59O1xuZXhwb3J0cy5vc2diMzYgPSB7XG4gIHRvd2dzODQ6IFwiNDQ2LjQ0OCwtMTI1LjE1Nyw1NDIuMDYwLDAuMTUwMiwwLjI0NzAsMC44NDIxLC0yMC40ODk0XCIsXG4gIGVsbGlwc2U6IFwiYWlyeVwiLFxuICBkYXR1bU5hbWU6IFwiQWlyeSAxODMwXCJcbn07XG5leHBvcnRzLnNfanRzayA9IHtcbiAgdG93Z3M4NDogXCI1ODksNzYsNDgwXCIsXG4gIGVsbGlwc2U6ICdiZXNzZWwnLFxuICBkYXR1bU5hbWU6ICdTLUpUU0sgKEZlcnJvKSdcbn07XG5leHBvcnRzLmJlZHVhcmFtID0ge1xuICB0b3dnczg0OiAnLTEwNiwtODcsMTg4JyxcbiAgZWxsaXBzZTogJ2Nscms4MCcsXG4gIGRhdHVtTmFtZTogJ0JlZHVhcmFtJ1xufTtcbmV4cG9ydHMuZ3VudW5nX3NlZ2FyYSA9IHtcbiAgdG93Z3M4NDogJy00MDMsNjg0LDQxJyxcbiAgZWxsaXBzZTogJ2Jlc3NlbCcsXG4gIGRhdHVtTmFtZTogJ0d1bnVuZyBTZWdhcmEgSmFrYXJ0YSdcbn07XG5leHBvcnRzLnJuYjcyID0ge1xuICB0b3dnczg0OiBcIjEwNi44NjksLTUyLjI5NzgsMTAzLjcyNCwtMC4zMzY1NywwLjQ1Njk1NSwtMS44NDIxOCwxXCIsXG4gIGVsbGlwc2U6IFwiaW50bFwiLFxuICBkYXR1bU5hbWU6IFwiUmVzZWF1IE5hdGlvbmFsIEJlbGdlIDE5NzJcIlxufTsiLCJleHBvcnRzLk1FUklUID0ge1xuICBhOiA2Mzc4MTM3LjAsXG4gIHJmOiAyOTguMjU3LFxuICBlbGxpcHNlTmFtZTogXCJNRVJJVCAxOTgzXCJcbn07XG5leHBvcnRzLlNHUzg1ID0ge1xuICBhOiA2Mzc4MTM2LjAsXG4gIHJmOiAyOTguMjU3LFxuICBlbGxpcHNlTmFtZTogXCJTb3ZpZXQgR2VvZGV0aWMgU3lzdGVtIDg1XCJcbn07XG5leHBvcnRzLkdSUzgwID0ge1xuICBhOiA2Mzc4MTM3LjAsXG4gIHJmOiAyOTguMjU3MjIyMTAxLFxuICBlbGxpcHNlTmFtZTogXCJHUlMgMTk4MChJVUdHLCAxOTgwKVwiXG59O1xuZXhwb3J0cy5JQVU3NiA9IHtcbiAgYTogNjM3ODE0MC4wLFxuICByZjogMjk4LjI1NyxcbiAgZWxsaXBzZU5hbWU6IFwiSUFVIDE5NzZcIlxufTtcbmV4cG9ydHMuYWlyeSA9IHtcbiAgYTogNjM3NzU2My4zOTYsXG4gIGI6IDYzNTYyNTYuOTEwLFxuICBlbGxpcHNlTmFtZTogXCJBaXJ5IDE4MzBcIlxufTtcbmV4cG9ydHMuQVBMNCA9IHtcbiAgYTogNjM3ODEzNyxcbiAgcmY6IDI5OC4yNSxcbiAgZWxsaXBzZU5hbWU6IFwiQXBwbC4gUGh5c2ljcy4gMTk2NVwiXG59O1xuZXhwb3J0cy5OV0w5RCA9IHtcbiAgYTogNjM3ODE0NS4wLFxuICByZjogMjk4LjI1LFxuICBlbGxpcHNlTmFtZTogXCJOYXZhbCBXZWFwb25zIExhYi4sIDE5NjVcIlxufTtcbmV4cG9ydHMubW9kX2FpcnkgPSB7XG4gIGE6IDYzNzczNDAuMTg5LFxuICBiOiA2MzU2MDM0LjQ0NixcbiAgZWxsaXBzZU5hbWU6IFwiTW9kaWZpZWQgQWlyeVwiXG59O1xuZXhwb3J0cy5hbmRyYWUgPSB7XG4gIGE6IDYzNzcxMDQuNDMsXG4gIHJmOiAzMDAuMCxcbiAgZWxsaXBzZU5hbWU6IFwiQW5kcmFlIDE4NzYgKERlbi4sIEljbG5kLilcIlxufTtcbmV4cG9ydHMuYXVzdF9TQSA9IHtcbiAgYTogNjM3ODE2MC4wLFxuICByZjogMjk4LjI1LFxuICBlbGxpcHNlTmFtZTogXCJBdXN0cmFsaWFuIE5hdGwgJiBTLiBBbWVyLiAxOTY5XCJcbn07XG5leHBvcnRzLkdSUzY3ID0ge1xuICBhOiA2Mzc4MTYwLjAsXG4gIHJmOiAyOTguMjQ3MTY3NDI3MCxcbiAgZWxsaXBzZU5hbWU6IFwiR1JTIDY3KElVR0cgMTk2NylcIlxufTtcbmV4cG9ydHMuYmVzc2VsID0ge1xuICBhOiA2Mzc3Mzk3LjE1NSxcbiAgcmY6IDI5OS4xNTI4MTI4LFxuICBlbGxpcHNlTmFtZTogXCJCZXNzZWwgMTg0MVwiXG59O1xuZXhwb3J0cy5iZXNzX25hbSA9IHtcbiAgYTogNjM3NzQ4My44NjUsXG4gIHJmOiAyOTkuMTUyODEyOCxcbiAgZWxsaXBzZU5hbWU6IFwiQmVzc2VsIDE4NDEgKE5hbWliaWEpXCJcbn07XG5leHBvcnRzLmNscms2NiA9IHtcbiAgYTogNjM3ODIwNi40LFxuICBiOiA2MzU2NTgzLjgsXG4gIGVsbGlwc2VOYW1lOiBcIkNsYXJrZSAxODY2XCJcbn07XG5leHBvcnRzLmNscms4MCA9IHtcbiAgYTogNjM3ODI0OS4xNDUsXG4gIHJmOiAyOTMuNDY2MyxcbiAgZWxsaXBzZU5hbWU6IFwiQ2xhcmtlIDE4ODAgbW9kLlwiXG59O1xuZXhwb3J0cy5jbHJrNTggPSB7XG4gIGE6IDYzNzgyOTMuNjQ1MjA4NzU5LFxuICByZjogMjk0LjI2MDY3NjM2OTI2NTQsXG4gIGVsbGlwc2VOYW1lOiBcIkNsYXJrZSAxODU4XCJcbn07XG5leHBvcnRzLkNQTSA9IHtcbiAgYTogNjM3NTczOC43LFxuICByZjogMzM0LjI5LFxuICBlbGxpcHNlTmFtZTogXCJDb21tLiBkZXMgUG9pZHMgZXQgTWVzdXJlcyAxNzk5XCJcbn07XG5leHBvcnRzLmRlbG1iciA9IHtcbiAgYTogNjM3NjQyOC4wLFxuICByZjogMzExLjUsXG4gIGVsbGlwc2VOYW1lOiBcIkRlbGFtYnJlIDE4MTAgKEJlbGdpdW0pXCJcbn07XG5leHBvcnRzLmVuZ2VsaXMgPSB7XG4gIGE6IDYzNzgxMzYuMDUsXG4gIHJmOiAyOTguMjU2NixcbiAgZWxsaXBzZU5hbWU6IFwiRW5nZWxpcyAxOTg1XCJcbn07XG5leHBvcnRzLmV2cnN0MzAgPSB7XG4gIGE6IDYzNzcyNzYuMzQ1LFxuICByZjogMzAwLjgwMTcsXG4gIGVsbGlwc2VOYW1lOiBcIkV2ZXJlc3QgMTgzMFwiXG59O1xuZXhwb3J0cy5ldnJzdDQ4ID0ge1xuICBhOiA2Mzc3MzA0LjA2MyxcbiAgcmY6IDMwMC44MDE3LFxuICBlbGxpcHNlTmFtZTogXCJFdmVyZXN0IDE5NDhcIlxufTtcbmV4cG9ydHMuZXZyc3Q1NiA9IHtcbiAgYTogNjM3NzMwMS4yNDMsXG4gIHJmOiAzMDAuODAxNyxcbiAgZWxsaXBzZU5hbWU6IFwiRXZlcmVzdCAxOTU2XCJcbn07XG5leHBvcnRzLmV2cnN0NjkgPSB7XG4gIGE6IDYzNzcyOTUuNjY0LFxuICByZjogMzAwLjgwMTcsXG4gIGVsbGlwc2VOYW1lOiBcIkV2ZXJlc3QgMTk2OVwiXG59O1xuZXhwb3J0cy5ldnJzdFNTID0ge1xuICBhOiA2Mzc3Mjk4LjU1NixcbiAgcmY6IDMwMC44MDE3LFxuICBlbGxpcHNlTmFtZTogXCJFdmVyZXN0IChTYWJhaCAmIFNhcmF3YWspXCJcbn07XG5leHBvcnRzLmZzY2hyNjAgPSB7XG4gIGE6IDYzNzgxNjYuMCxcbiAgcmY6IDI5OC4zLFxuICBlbGxpcHNlTmFtZTogXCJGaXNjaGVyIChNZXJjdXJ5IERhdHVtKSAxOTYwXCJcbn07XG5leHBvcnRzLmZzY2hyNjBtID0ge1xuICBhOiA2Mzc4MTU1LjAsXG4gIHJmOiAyOTguMyxcbiAgZWxsaXBzZU5hbWU6IFwiRmlzY2hlciAxOTYwXCJcbn07XG5leHBvcnRzLmZzY2hyNjggPSB7XG4gIGE6IDYzNzgxNTAuMCxcbiAgcmY6IDI5OC4zLFxuICBlbGxpcHNlTmFtZTogXCJGaXNjaGVyIDE5NjhcIlxufTtcbmV4cG9ydHMuaGVsbWVydCA9IHtcbiAgYTogNjM3ODIwMC4wLFxuICByZjogMjk4LjMsXG4gIGVsbGlwc2VOYW1lOiBcIkhlbG1lcnQgMTkwNlwiXG59O1xuZXhwb3J0cy5ob3VnaCA9IHtcbiAgYTogNjM3ODI3MC4wLFxuICByZjogMjk3LjAsXG4gIGVsbGlwc2VOYW1lOiBcIkhvdWdoXCJcbn07XG5leHBvcnRzLmludGwgPSB7XG4gIGE6IDYzNzgzODguMCxcbiAgcmY6IDI5Ny4wLFxuICBlbGxpcHNlTmFtZTogXCJJbnRlcm5hdGlvbmFsIDE5MDkgKEhheWZvcmQpXCJcbn07XG5leHBvcnRzLmthdWxhID0ge1xuICBhOiA2Mzc4MTYzLjAsXG4gIHJmOiAyOTguMjQsXG4gIGVsbGlwc2VOYW1lOiBcIkthdWxhIDE5NjFcIlxufTtcbmV4cG9ydHMubGVyY2ggPSB7XG4gIGE6IDYzNzgxMzkuMCxcbiAgcmY6IDI5OC4yNTcsXG4gIGVsbGlwc2VOYW1lOiBcIkxlcmNoIDE5NzlcIlxufTtcbmV4cG9ydHMubXBydHMgPSB7XG4gIGE6IDYzOTczMDAuMCxcbiAgcmY6IDE5MS4wLFxuICBlbGxpcHNlTmFtZTogXCJNYXVwZXJ0aXVzIDE3MzhcIlxufTtcbmV4cG9ydHMubmV3X2ludGwgPSB7XG4gIGE6IDYzNzgxNTcuNSxcbiAgYjogNjM1Njc3Mi4yLFxuICBlbGxpcHNlTmFtZTogXCJOZXcgSW50ZXJuYXRpb25hbCAxOTY3XCJcbn07XG5leHBvcnRzLnBsZXNzaXMgPSB7XG4gIGE6IDYzNzY1MjMuMCxcbiAgcmY6IDYzNTU4NjMuMCxcbiAgZWxsaXBzZU5hbWU6IFwiUGxlc3NpcyAxODE3IChGcmFuY2UpXCJcbn07XG5leHBvcnRzLmtyYXNzID0ge1xuICBhOiA2Mzc4MjQ1LjAsXG4gIHJmOiAyOTguMyxcbiAgZWxsaXBzZU5hbWU6IFwiS3Jhc3NvdnNreSwgMTk0MlwiXG59O1xuZXhwb3J0cy5TRWFzaWEgPSB7XG4gIGE6IDYzNzgxNTUuMCxcbiAgYjogNjM1Njc3My4zMjA1LFxuICBlbGxpcHNlTmFtZTogXCJTb3V0aGVhc3QgQXNpYVwiXG59O1xuZXhwb3J0cy53YWxiZWNrID0ge1xuICBhOiA2Mzc2ODk2LjAsXG4gIGI6IDYzNTU4MzQuODQ2NyxcbiAgZWxsaXBzZU5hbWU6IFwiV2FsYmVja1wiXG59O1xuZXhwb3J0cy5XR1M2MCA9IHtcbiAgYTogNjM3ODE2NS4wLFxuICByZjogMjk4LjMsXG4gIGVsbGlwc2VOYW1lOiBcIldHUyA2MFwiXG59O1xuZXhwb3J0cy5XR1M2NiA9IHtcbiAgYTogNjM3ODE0NS4wLFxuICByZjogMjk4LjI1LFxuICBlbGxpcHNlTmFtZTogXCJXR1MgNjZcIlxufTtcbmV4cG9ydHMuV0dTNyA9IHtcbiAgYTogNjM3ODEzNS4wLFxuICByZjogMjk4LjI2LFxuICBlbGxpcHNlTmFtZTogXCJXR1MgNzJcIlxufTtcbmV4cG9ydHMuV0dTODQgPSB7XG4gIGE6IDYzNzgxMzcuMCxcbiAgcmY6IDI5OC4yNTcyMjM1NjMsXG4gIGVsbGlwc2VOYW1lOiBcIldHUyA4NFwiXG59O1xuZXhwb3J0cy5zcGhlcmUgPSB7XG4gIGE6IDYzNzA5OTcuMCxcbiAgYjogNjM3MDk5Ny4wLFxuICBlbGxpcHNlTmFtZTogXCJOb3JtYWwgU3BoZXJlIChyPTYzNzA5OTcpXCJcbn07IiwiZXhwb3J0cy5ncmVlbndpY2ggPSAwLjA7IC8vXCIwZEVcIixcbmV4cG9ydHMubGlzYm9uID0gLTkuMTMxOTA2MTExMTExOyAvL1wiOWQwNyc1NC44NjJcXFwiV1wiLFxuZXhwb3J0cy5wYXJpcyA9IDIuMzM3MjI5MTY2NjY3OyAvL1wiMmQyMCcxNC4wMjVcXFwiRVwiLFxuZXhwb3J0cy5ib2dvdGEgPSAtNzQuMDgwOTE2NjY2NjY3OyAvL1wiNzRkMDQnNTEuM1xcXCJXXCIsXG5leHBvcnRzLm1hZHJpZCA9IC0zLjY4NzkzODg4ODg4OTsgLy9cIjNkNDEnMTYuNThcXFwiV1wiLFxuZXhwb3J0cy5yb21lID0gMTIuNDUyMzMzMzMzMzMzOyAvL1wiMTJkMjcnOC40XFxcIkVcIixcbmV4cG9ydHMuYmVybiA9IDcuNDM5NTgzMzMzMzMzOyAvL1wiN2QyNicyMi41XFxcIkVcIixcbmV4cG9ydHMuamFrYXJ0YSA9IDEwNi44MDc3MTk0NDQ0NDQ7IC8vXCIxMDZkNDgnMjcuNzlcXFwiRVwiLFxuZXhwb3J0cy5mZXJybyA9IC0xNy42NjY2NjY2NjY2Njc7IC8vXCIxN2Q0MCdXXCIsXG5leHBvcnRzLmJydXNzZWxzID0gNC4zNjc5NzU7IC8vXCI0ZDIyJzQuNzFcXFwiRVwiLFxuZXhwb3J0cy5zdG9ja2hvbG0gPSAxOC4wNTgyNzc3Nzc3Nzg7IC8vXCIxOGQzJzI5LjhcXFwiRVwiLFxuZXhwb3J0cy5hdGhlbnMgPSAyMy43MTYzMzc1OyAvL1wiMjNkNDInNTguODE1XFxcIkVcIixcbmV4cG9ydHMub3NsbyA9IDEwLjcyMjkxNjY2NjY2NzsgLy9cIjEwZDQzJzIyLjVcXFwiRVwiIiwiZXhwb3J0cy5mdCA9IHt0b19tZXRlcjogMC4zMDQ4fTtcbmV4cG9ydHNbJ3VzLWZ0J10gPSB7dG9fbWV0ZXI6IDEyMDAgLyAzOTM3fTtcbiIsInZhciBwcm9qID0gcmVxdWlyZSgnLi9Qcm9qJyk7XG52YXIgdHJhbnNmb3JtID0gcmVxdWlyZSgnLi90cmFuc2Zvcm0nKTtcbnZhciB3Z3M4NCA9IHByb2ooJ1dHUzg0Jyk7XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybWVyKGZyb20sIHRvLCBjb29yZHMpIHtcbiAgdmFyIHRyYW5zZm9ybWVkQXJyYXk7XG4gIGlmIChBcnJheS5pc0FycmF5KGNvb3JkcykpIHtcbiAgICB0cmFuc2Zvcm1lZEFycmF5ID0gdHJhbnNmb3JtKGZyb20sIHRvLCBjb29yZHMpO1xuICAgIGlmIChjb29yZHMubGVuZ3RoID09PSAzKSB7XG4gICAgICByZXR1cm4gW3RyYW5zZm9ybWVkQXJyYXkueCwgdHJhbnNmb3JtZWRBcnJheS55LCB0cmFuc2Zvcm1lZEFycmF5LnpdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBbdHJhbnNmb3JtZWRBcnJheS54LCB0cmFuc2Zvcm1lZEFycmF5LnldO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gdHJhbnNmb3JtKGZyb20sIHRvLCBjb29yZHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrUHJvaihpdGVtKSB7XG4gIGlmIChpdGVtIGluc3RhbmNlb2YgcHJvaikge1xuICAgIHJldHVybiBpdGVtO1xuICB9XG4gIGlmIChpdGVtLm9Qcm9qKSB7XG4gICAgcmV0dXJuIGl0ZW0ub1Byb2o7XG4gIH1cbiAgcmV0dXJuIHByb2ooaXRlbSk7XG59XG5mdW5jdGlvbiBwcm9qNChmcm9tUHJvaiwgdG9Qcm9qLCBjb29yZCkge1xuICBmcm9tUHJvaiA9IGNoZWNrUHJvaihmcm9tUHJvaik7XG4gIHZhciBzaW5nbGUgPSBmYWxzZTtcbiAgdmFyIG9iajtcbiAgaWYgKHR5cGVvZiB0b1Byb2ogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdG9Qcm9qID0gZnJvbVByb2o7XG4gICAgZnJvbVByb2ogPSB3Z3M4NDtcbiAgICBzaW5nbGUgPSB0cnVlO1xuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiB0b1Byb2oueCAhPT0gJ3VuZGVmaW5lZCcgfHwgQXJyYXkuaXNBcnJheSh0b1Byb2opKSB7XG4gICAgY29vcmQgPSB0b1Byb2o7XG4gICAgdG9Qcm9qID0gZnJvbVByb2o7XG4gICAgZnJvbVByb2ogPSB3Z3M4NDtcbiAgICBzaW5nbGUgPSB0cnVlO1xuICB9XG4gIHRvUHJvaiA9IGNoZWNrUHJvaih0b1Byb2opO1xuICBpZiAoY29vcmQpIHtcbiAgICByZXR1cm4gdHJhbnNmb3JtZXIoZnJvbVByb2osIHRvUHJvaiwgY29vcmQpO1xuICB9XG4gIGVsc2Uge1xuICAgIG9iaiA9IHtcbiAgICAgIGZvcndhcmQ6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtZXIoZnJvbVByb2osIHRvUHJvaiwgY29vcmRzKTtcbiAgICAgIH0sXG4gICAgICBpbnZlcnNlOiBmdW5jdGlvbihjb29yZHMpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVyKHRvUHJvaiwgZnJvbVByb2osIGNvb3Jkcyk7XG4gICAgICB9XG4gICAgfTtcbiAgICBpZiAoc2luZ2xlKSB7XG4gICAgICBvYmoub1Byb2ogPSB0b1Byb2o7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gcHJvajQ7IiwidmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgUEpEXzNQQVJBTSA9IDE7XG52YXIgUEpEXzdQQVJBTSA9IDI7XG52YXIgUEpEX0dSSURTSElGVCA9IDM7XG52YXIgUEpEX1dHUzg0ID0gNDsgLy8gV0dTODQgb3IgZXF1aXZhbGVudFxudmFyIFBKRF9OT0RBVFVNID0gNTsgLy8gV0dTODQgb3IgZXF1aXZhbGVudFxudmFyIFNFQ19UT19SQUQgPSA0Ljg0ODEzNjgxMTA5NTM1OTkzNTg5OTE0MTAyMzU3ZS02O1xudmFyIEFEX0MgPSAxLjAwMjYwMDA7XG52YXIgQ09TXzY3UDUgPSAwLjM4MjY4MzQzMjM2NTA4OTc3O1xudmFyIGRhdHVtID0gZnVuY3Rpb24ocHJvaikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgZGF0dW0pKSB7XG4gICAgcmV0dXJuIG5ldyBkYXR1bShwcm9qKTtcbiAgfVxuICB0aGlzLmRhdHVtX3R5cGUgPSBQSkRfV0dTODQ7IC8vZGVmYXVsdCBzZXR0aW5nXG4gIGlmICghcHJvaikge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocHJvai5kYXR1bUNvZGUgJiYgcHJvai5kYXR1bUNvZGUgPT09ICdub25lJykge1xuICAgIHRoaXMuZGF0dW1fdHlwZSA9IFBKRF9OT0RBVFVNO1xuICB9XG4gIGlmIChwcm9qLmRhdHVtX3BhcmFtcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvai5kYXR1bV9wYXJhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHByb2ouZGF0dW1fcGFyYW1zW2ldID0gcGFyc2VGbG9hdChwcm9qLmRhdHVtX3BhcmFtc1tpXSk7XG4gICAgfVxuICAgIGlmIChwcm9qLmRhdHVtX3BhcmFtc1swXSAhPT0gMCB8fCBwcm9qLmRhdHVtX3BhcmFtc1sxXSAhPT0gMCB8fCBwcm9qLmRhdHVtX3BhcmFtc1syXSAhPT0gMCkge1xuICAgICAgdGhpcy5kYXR1bV90eXBlID0gUEpEXzNQQVJBTTtcbiAgICB9XG4gICAgaWYgKHByb2ouZGF0dW1fcGFyYW1zLmxlbmd0aCA+IDMpIHtcbiAgICAgIGlmIChwcm9qLmRhdHVtX3BhcmFtc1szXSAhPT0gMCB8fCBwcm9qLmRhdHVtX3BhcmFtc1s0XSAhPT0gMCB8fCBwcm9qLmRhdHVtX3BhcmFtc1s1XSAhPT0gMCB8fCBwcm9qLmRhdHVtX3BhcmFtc1s2XSAhPT0gMCkge1xuICAgICAgICB0aGlzLmRhdHVtX3R5cGUgPSBQSkRfN1BBUkFNO1xuICAgICAgICBwcm9qLmRhdHVtX3BhcmFtc1szXSAqPSBTRUNfVE9fUkFEO1xuICAgICAgICBwcm9qLmRhdHVtX3BhcmFtc1s0XSAqPSBTRUNfVE9fUkFEO1xuICAgICAgICBwcm9qLmRhdHVtX3BhcmFtc1s1XSAqPSBTRUNfVE9fUkFEO1xuICAgICAgICBwcm9qLmRhdHVtX3BhcmFtc1s2XSA9IChwcm9qLmRhdHVtX3BhcmFtc1s2XSAvIDEwMDAwMDAuMCkgKyAxLjA7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIERHUiAyMDExLTAzLTIxIDogbmFkZ3JpZHMgc3VwcG9ydFxuICB0aGlzLmRhdHVtX3R5cGUgPSBwcm9qLmdyaWRzID8gUEpEX0dSSURTSElGVCA6IHRoaXMuZGF0dW1fdHlwZTtcblxuICB0aGlzLmEgPSBwcm9qLmE7IC8vZGF0dW0gb2JqZWN0IGFsc28gdXNlcyB0aGVzZSB2YWx1ZXNcbiAgdGhpcy5iID0gcHJvai5iO1xuICB0aGlzLmVzID0gcHJvai5lcztcbiAgdGhpcy5lcDIgPSBwcm9qLmVwMjtcbiAgdGhpcy5kYXR1bV9wYXJhbXMgPSBwcm9qLmRhdHVtX3BhcmFtcztcbiAgaWYgKHRoaXMuZGF0dW1fdHlwZSA9PT0gUEpEX0dSSURTSElGVCkge1xuICAgIHRoaXMuZ3JpZHMgPSBwcm9qLmdyaWRzO1xuICB9XG59O1xuZGF0dW0ucHJvdG90eXBlID0ge1xuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIC8vIGNzX2NvbXBhcmVfZGF0dW1zKClcbiAgLy8gICBSZXR1cm5zIFRSVUUgaWYgdGhlIHR3byBkYXR1bXMgbWF0Y2gsIG90aGVyd2lzZSBGQUxTRS5cbiAgY29tcGFyZV9kYXR1bXM6IGZ1bmN0aW9uKGRlc3QpIHtcbiAgICBpZiAodGhpcy5kYXR1bV90eXBlICE9PSBkZXN0LmRhdHVtX3R5cGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTsgLy8gZmFsc2UsIGRhdHVtcyBhcmUgbm90IGVxdWFsXG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuYSAhPT0gZGVzdC5hIHx8IE1hdGguYWJzKHRoaXMuZXMgLSBkZXN0LmVzKSA+IDAuMDAwMDAwMDAwMDUwKSB7XG4gICAgICAvLyB0aGUgdG9sZXJlbmNlIGZvciBlcyBpcyB0byBlbnN1cmUgdGhhdCBHUlM4MCBhbmQgV0dTODRcbiAgICAgIC8vIGFyZSBjb25zaWRlcmVkIGlkZW50aWNhbFxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmRhdHVtX3R5cGUgPT09IFBKRF8zUEFSQU0pIHtcbiAgICAgIHJldHVybiAodGhpcy5kYXR1bV9wYXJhbXNbMF0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzBdICYmIHRoaXMuZGF0dW1fcGFyYW1zWzFdID09PSBkZXN0LmRhdHVtX3BhcmFtc1sxXSAmJiB0aGlzLmRhdHVtX3BhcmFtc1syXSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbMl0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmRhdHVtX3R5cGUgPT09IFBKRF83UEFSQU0pIHtcbiAgICAgIHJldHVybiAodGhpcy5kYXR1bV9wYXJhbXNbMF0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzBdICYmIHRoaXMuZGF0dW1fcGFyYW1zWzFdID09PSBkZXN0LmRhdHVtX3BhcmFtc1sxXSAmJiB0aGlzLmRhdHVtX3BhcmFtc1syXSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbMl0gJiYgdGhpcy5kYXR1bV9wYXJhbXNbM10gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzNdICYmIHRoaXMuZGF0dW1fcGFyYW1zWzRdID09PSBkZXN0LmRhdHVtX3BhcmFtc1s0XSAmJiB0aGlzLmRhdHVtX3BhcmFtc1s1XSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbNV0gJiYgdGhpcy5kYXR1bV9wYXJhbXNbNl0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzZdKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5kYXR1bV90eXBlID09PSBQSkRfR1JJRFNISUZUIHx8IGRlc3QuZGF0dW1fdHlwZSA9PT0gUEpEX0dSSURTSElGVCkge1xuICAgICAgLy9hbGVydChcIkVSUk9SOiBHcmlkIHNoaWZ0IHRyYW5zZm9ybWF0aW9ucyBhcmUgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICAgIC8vcmV0dXJuIGZhbHNlXG4gICAgICAvL0RHUiAyMDEyLTA3LTI5IGxhenkgLi4uXG4gICAgICByZXR1cm4gdGhpcy5uYWRncmlkcyA9PT0gZGVzdC5uYWRncmlkcztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTsgLy8gZGF0dW1zIGFyZSBlcXVhbFxuICAgIH1cbiAgfSwgLy8gY3NfY29tcGFyZV9kYXR1bXMoKVxuXG4gIC8qXG4gICAqIFRoZSBmdW5jdGlvbiBDb252ZXJ0X0dlb2RldGljX1RvX0dlb2NlbnRyaWMgY29udmVydHMgZ2VvZGV0aWMgY29vcmRpbmF0ZXNcbiAgICogKGxhdGl0dWRlLCBsb25naXR1ZGUsIGFuZCBoZWlnaHQpIHRvIGdlb2NlbnRyaWMgY29vcmRpbmF0ZXMgKFgsIFksIFopLFxuICAgKiBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgZWxsaXBzb2lkIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqICAgIExhdGl0dWRlICA6IEdlb2RldGljIGxhdGl0dWRlIGluIHJhZGlhbnMgICAgICAgICAgICAgICAgICAgICAoaW5wdXQpXG4gICAqICAgIExvbmdpdHVkZSA6IEdlb2RldGljIGxvbmdpdHVkZSBpbiByYWRpYW5zICAgICAgICAgICAgICAgICAgICAoaW5wdXQpXG4gICAqICAgIEhlaWdodCAgICA6IEdlb2RldGljIGhlaWdodCwgaW4gbWV0ZXJzICAgICAgICAgICAgICAgICAgICAgICAoaW5wdXQpXG4gICAqICAgIFggICAgICAgICA6IENhbGN1bGF0ZWQgR2VvY2VudHJpYyBYIGNvb3JkaW5hdGUsIGluIG1ldGVycyAgICAob3V0cHV0KVxuICAgKiAgICBZICAgICAgICAgOiBDYWxjdWxhdGVkIEdlb2NlbnRyaWMgWSBjb29yZGluYXRlLCBpbiBtZXRlcnMgICAgKG91dHB1dClcbiAgICogICAgWiAgICAgICAgIDogQ2FsY3VsYXRlZCBHZW9jZW50cmljIFogY29vcmRpbmF0ZSwgaW4gbWV0ZXJzICAgIChvdXRwdXQpXG4gICAqXG4gICAqL1xuICBnZW9kZXRpY190b19nZW9jZW50cmljOiBmdW5jdGlvbihwKSB7XG4gICAgdmFyIExvbmdpdHVkZSA9IHAueDtcbiAgICB2YXIgTGF0aXR1ZGUgPSBwLnk7XG4gICAgdmFyIEhlaWdodCA9IHAueiA/IHAueiA6IDA7IC8vWiB2YWx1ZSBub3QgYWx3YXlzIHN1cHBsaWVkXG4gICAgdmFyIFg7IC8vIG91dHB1dFxuICAgIHZhciBZO1xuICAgIHZhciBaO1xuXG4gICAgdmFyIEVycm9yX0NvZGUgPSAwOyAvLyAgR0VPQ0VOVF9OT19FUlJPUjtcbiAgICB2YXIgUm47IC8qICBFYXJ0aCByYWRpdXMgYXQgbG9jYXRpb24gICovXG4gICAgdmFyIFNpbl9MYXQ7IC8qICBNYXRoLnNpbihMYXRpdHVkZSkgICovXG4gICAgdmFyIFNpbjJfTGF0OyAvKiAgU3F1YXJlIG9mIE1hdGguc2luKExhdGl0dWRlKSAgKi9cbiAgICB2YXIgQ29zX0xhdDsgLyogIE1hdGguY29zKExhdGl0dWRlKSAgKi9cblxuICAgIC8qXG4gICAgICoqIERvbid0IGJsb3cgdXAgaWYgTGF0aXR1ZGUgaXMganVzdCBhIGxpdHRsZSBvdXQgb2YgdGhlIHZhbHVlXG4gICAgICoqIHJhbmdlIGFzIGl0IG1heSBqdXN0IGJlIGEgcm91bmRpbmcgaXNzdWUuICBBbHNvIHJlbW92ZWQgbG9uZ2l0dWRlXG4gICAgICoqIHRlc3QsIGl0IHNob3VsZCBiZSB3cmFwcGVkIGJ5IE1hdGguY29zKCkgYW5kIE1hdGguc2luKCkuICBORlcgZm9yIFBST0ouNCwgU2VwLzIwMDEuXG4gICAgICovXG4gICAgaWYgKExhdGl0dWRlIDwgLUhBTEZfUEkgJiYgTGF0aXR1ZGUgPiAtMS4wMDEgKiBIQUxGX1BJKSB7XG4gICAgICBMYXRpdHVkZSA9IC1IQUxGX1BJO1xuICAgIH1cbiAgICBlbHNlIGlmIChMYXRpdHVkZSA+IEhBTEZfUEkgJiYgTGF0aXR1ZGUgPCAxLjAwMSAqIEhBTEZfUEkpIHtcbiAgICAgIExhdGl0dWRlID0gSEFMRl9QSTtcbiAgICB9XG4gICAgZWxzZSBpZiAoKExhdGl0dWRlIDwgLUhBTEZfUEkpIHx8IChMYXRpdHVkZSA+IEhBTEZfUEkpKSB7XG4gICAgICAvKiBMYXRpdHVkZSBvdXQgb2YgcmFuZ2UgKi9cbiAgICAgIC8vLi5yZXBvcnRFcnJvcignZ2VvY2VudDpsYXQgb3V0IG9mIHJhbmdlOicgKyBMYXRpdHVkZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoTG9uZ2l0dWRlID4gTWF0aC5QSSkge1xuICAgICAgTG9uZ2l0dWRlIC09ICgyICogTWF0aC5QSSk7XG4gICAgfVxuICAgIFNpbl9MYXQgPSBNYXRoLnNpbihMYXRpdHVkZSk7XG4gICAgQ29zX0xhdCA9IE1hdGguY29zKExhdGl0dWRlKTtcbiAgICBTaW4yX0xhdCA9IFNpbl9MYXQgKiBTaW5fTGF0O1xuICAgIFJuID0gdGhpcy5hIC8gKE1hdGguc3FydCgxLjBlMCAtIHRoaXMuZXMgKiBTaW4yX0xhdCkpO1xuICAgIFggPSAoUm4gKyBIZWlnaHQpICogQ29zX0xhdCAqIE1hdGguY29zKExvbmdpdHVkZSk7XG4gICAgWSA9IChSbiArIEhlaWdodCkgKiBDb3NfTGF0ICogTWF0aC5zaW4oTG9uZ2l0dWRlKTtcbiAgICBaID0gKChSbiAqICgxIC0gdGhpcy5lcykpICsgSGVpZ2h0KSAqIFNpbl9MYXQ7XG5cbiAgICBwLnggPSBYO1xuICAgIHAueSA9IFk7XG4gICAgcC56ID0gWjtcbiAgICByZXR1cm4gRXJyb3JfQ29kZTtcbiAgfSwgLy8gY3NfZ2VvZGV0aWNfdG9fZ2VvY2VudHJpYygpXG5cblxuICBnZW9jZW50cmljX3RvX2dlb2RldGljOiBmdW5jdGlvbihwKSB7XG4gICAgLyogbG9jYWwgZGVmaW50aW9ucyBhbmQgdmFyaWFibGVzICovXG4gICAgLyogZW5kLWNyaXRlcml1bSBvZiBsb29wLCBhY2N1cmFjeSBvZiBzaW4oTGF0aXR1ZGUpICovXG4gICAgdmFyIGdlbmF1ID0gMWUtMTI7XG4gICAgdmFyIGdlbmF1MiA9IChnZW5hdSAqIGdlbmF1KTtcbiAgICB2YXIgbWF4aXRlciA9IDMwO1xuXG4gICAgdmFyIFA7IC8qIGRpc3RhbmNlIGJldHdlZW4gc2VtaS1taW5vciBheGlzIGFuZCBsb2NhdGlvbiAqL1xuICAgIHZhciBSUjsgLyogZGlzdGFuY2UgYmV0d2VlbiBjZW50ZXIgYW5kIGxvY2F0aW9uICovXG4gICAgdmFyIENUOyAvKiBzaW4gb2YgZ2VvY2VudHJpYyBsYXRpdHVkZSAqL1xuICAgIHZhciBTVDsgLyogY29zIG9mIGdlb2NlbnRyaWMgbGF0aXR1ZGUgKi9cbiAgICB2YXIgUlg7XG4gICAgdmFyIFJLO1xuICAgIHZhciBSTjsgLyogRWFydGggcmFkaXVzIGF0IGxvY2F0aW9uICovXG4gICAgdmFyIENQSEkwOyAvKiBjb3Mgb2Ygc3RhcnQgb3Igb2xkIGdlb2RldGljIGxhdGl0dWRlIGluIGl0ZXJhdGlvbnMgKi9cbiAgICB2YXIgU1BISTA7IC8qIHNpbiBvZiBzdGFydCBvciBvbGQgZ2VvZGV0aWMgbGF0aXR1ZGUgaW4gaXRlcmF0aW9ucyAqL1xuICAgIHZhciBDUEhJOyAvKiBjb3Mgb2Ygc2VhcmNoZWQgZ2VvZGV0aWMgbGF0aXR1ZGUgKi9cbiAgICB2YXIgU1BISTsgLyogc2luIG9mIHNlYXJjaGVkIGdlb2RldGljIGxhdGl0dWRlICovXG4gICAgdmFyIFNEUEhJOyAvKiBlbmQtY3JpdGVyaXVtOiBhZGRpdGlvbi10aGVvcmVtIG9mIHNpbihMYXRpdHVkZShpdGVyKS1MYXRpdHVkZShpdGVyLTEpKSAqL1xuICAgIHZhciBBdF9Qb2xlOyAvKiBpbmRpY2F0ZXMgbG9jYXRpb24gaXMgaW4gcG9sYXIgcmVnaW9uICovXG4gICAgdmFyIGl0ZXI7IC8qICMgb2YgY29udGlub3VzIGl0ZXJhdGlvbiwgbWF4LiAzMCBpcyBhbHdheXMgZW5vdWdoIChzLmEuKSAqL1xuXG4gICAgdmFyIFggPSBwLng7XG4gICAgdmFyIFkgPSBwLnk7XG4gICAgdmFyIFogPSBwLnogPyBwLnogOiAwLjA7IC8vWiB2YWx1ZSBub3QgYWx3YXlzIHN1cHBsaWVkXG4gICAgdmFyIExvbmdpdHVkZTtcbiAgICB2YXIgTGF0aXR1ZGU7XG4gICAgdmFyIEhlaWdodDtcblxuICAgIEF0X1BvbGUgPSBmYWxzZTtcbiAgICBQID0gTWF0aC5zcXJ0KFggKiBYICsgWSAqIFkpO1xuICAgIFJSID0gTWF0aC5zcXJ0KFggKiBYICsgWSAqIFkgKyBaICogWik7XG5cbiAgICAvKiAgICAgIHNwZWNpYWwgY2FzZXMgZm9yIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgKi9cbiAgICBpZiAoUCAvIHRoaXMuYSA8IGdlbmF1KSB7XG5cbiAgICAgIC8qICBzcGVjaWFsIGNhc2UsIGlmIFA9MC4gKFg9MC4sIFk9MC4pICovXG4gICAgICBBdF9Qb2xlID0gdHJ1ZTtcbiAgICAgIExvbmdpdHVkZSA9IDAuMDtcblxuICAgICAgLyogIGlmIChYLFksWik9KDAuLDAuLDAuKSB0aGVuIEhlaWdodCBiZWNvbWVzIHNlbWktbWlub3IgYXhpc1xuICAgICAgICogIG9mIGVsbGlwc29pZCAoPWNlbnRlciBvZiBtYXNzKSwgTGF0aXR1ZGUgYmVjb21lcyBQSS8yICovXG4gICAgICBpZiAoUlIgLyB0aGlzLmEgPCBnZW5hdSkge1xuICAgICAgICBMYXRpdHVkZSA9IEhBTEZfUEk7XG4gICAgICAgIEhlaWdodCA9IC10aGlzLmI7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvKiAgZWxsaXBzb2lkYWwgKGdlb2RldGljKSBsb25naXR1ZGVcbiAgICAgICAqICBpbnRlcnZhbDogLVBJIDwgTG9uZ2l0dWRlIDw9ICtQSSAqL1xuICAgICAgTG9uZ2l0dWRlID0gTWF0aC5hdGFuMihZLCBYKTtcbiAgICB9XG5cbiAgICAvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAqIEZvbGxvd2luZyBpdGVyYXRpdmUgYWxnb3JpdGhtIHdhcyBkZXZlbG9wcGVkIGJ5XG4gICAgICogXCJJbnN0aXR1dCBmb3IgRXJkbWVzc3VuZ1wiLCBVbml2ZXJzaXR5IG9mIEhhbm5vdmVyLCBKdWx5IDE5ODguXG4gICAgICogSW50ZXJuZXQ6IHd3dy5pZmUudW5pLWhhbm5vdmVyLmRlXG4gICAgICogSXRlcmF0aXZlIGNvbXB1dGF0aW9uIG9mIENQSEksU1BISSBhbmQgSGVpZ2h0LlxuICAgICAqIEl0ZXJhdGlvbiBvZiBDUEhJIGFuZCBTUEhJIHRvIDEwKiotMTIgcmFkaWFuIHJlc3AuXG4gICAgICogMioxMCoqLTcgYXJjc2VjLlxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICovXG4gICAgQ1QgPSBaIC8gUlI7XG4gICAgU1QgPSBQIC8gUlI7XG4gICAgUlggPSAxLjAgLyBNYXRoLnNxcnQoMS4wIC0gdGhpcy5lcyAqICgyLjAgLSB0aGlzLmVzKSAqIFNUICogU1QpO1xuICAgIENQSEkwID0gU1QgKiAoMS4wIC0gdGhpcy5lcykgKiBSWDtcbiAgICBTUEhJMCA9IENUICogUlg7XG4gICAgaXRlciA9IDA7XG5cbiAgICAvKiBsb29wIHRvIGZpbmQgc2luKExhdGl0dWRlKSByZXNwLiBMYXRpdHVkZVxuICAgICAqIHVudGlsIHxzaW4oTGF0aXR1ZGUoaXRlciktTGF0aXR1ZGUoaXRlci0xKSl8IDwgZ2VuYXUgKi9cbiAgICBkbyB7XG4gICAgICBpdGVyKys7XG4gICAgICBSTiA9IHRoaXMuYSAvIE1hdGguc3FydCgxLjAgLSB0aGlzLmVzICogU1BISTAgKiBTUEhJMCk7XG5cbiAgICAgIC8qICBlbGxpcHNvaWRhbCAoZ2VvZGV0aWMpIGhlaWdodCAqL1xuICAgICAgSGVpZ2h0ID0gUCAqIENQSEkwICsgWiAqIFNQSEkwIC0gUk4gKiAoMS4wIC0gdGhpcy5lcyAqIFNQSEkwICogU1BISTApO1xuXG4gICAgICBSSyA9IHRoaXMuZXMgKiBSTiAvIChSTiArIEhlaWdodCk7XG4gICAgICBSWCA9IDEuMCAvIE1hdGguc3FydCgxLjAgLSBSSyAqICgyLjAgLSBSSykgKiBTVCAqIFNUKTtcbiAgICAgIENQSEkgPSBTVCAqICgxLjAgLSBSSykgKiBSWDtcbiAgICAgIFNQSEkgPSBDVCAqIFJYO1xuICAgICAgU0RQSEkgPSBTUEhJICogQ1BISTAgLSBDUEhJICogU1BISTA7XG4gICAgICBDUEhJMCA9IENQSEk7XG4gICAgICBTUEhJMCA9IFNQSEk7XG4gICAgfVxuICAgIHdoaWxlIChTRFBISSAqIFNEUEhJID4gZ2VuYXUyICYmIGl0ZXIgPCBtYXhpdGVyKTtcblxuICAgIC8qICAgICAgZWxsaXBzb2lkYWwgKGdlb2RldGljKSBsYXRpdHVkZSAqL1xuICAgIExhdGl0dWRlID0gTWF0aC5hdGFuKFNQSEkgLyBNYXRoLmFicyhDUEhJKSk7XG5cbiAgICBwLnggPSBMb25naXR1ZGU7XG4gICAgcC55ID0gTGF0aXR1ZGU7XG4gICAgcC56ID0gSGVpZ2h0O1xuICAgIHJldHVybiBwO1xuICB9LCAvLyBjc19nZW9jZW50cmljX3RvX2dlb2RldGljKClcblxuICAvKiogQ29udmVydF9HZW9jZW50cmljX1RvX0dlb2RldGljXG4gICAqIFRoZSBtZXRob2QgdXNlZCBoZXJlIGlzIGRlcml2ZWQgZnJvbSAnQW4gSW1wcm92ZWQgQWxnb3JpdGhtIGZvclxuICAgKiBHZW9jZW50cmljIHRvIEdlb2RldGljIENvb3JkaW5hdGUgQ29udmVyc2lvbicsIGJ5IFJhbHBoIFRvbXMsIEZlYiAxOTk2XG4gICAqL1xuICBnZW9jZW50cmljX3RvX2dlb2RldGljX25vbml0ZXI6IGZ1bmN0aW9uKHApIHtcbiAgICB2YXIgWCA9IHAueDtcbiAgICB2YXIgWSA9IHAueTtcbiAgICB2YXIgWiA9IHAueiA/IHAueiA6IDA7IC8vWiB2YWx1ZSBub3QgYWx3YXlzIHN1cHBsaWVkXG4gICAgdmFyIExvbmdpdHVkZTtcbiAgICB2YXIgTGF0aXR1ZGU7XG4gICAgdmFyIEhlaWdodDtcblxuICAgIHZhciBXOyAvKiBkaXN0YW5jZSBmcm9tIFogYXhpcyAqL1xuICAgIHZhciBXMjsgLyogc3F1YXJlIG9mIGRpc3RhbmNlIGZyb20gWiBheGlzICovXG4gICAgdmFyIFQwOyAvKiBpbml0aWFsIGVzdGltYXRlIG9mIHZlcnRpY2FsIGNvbXBvbmVudCAqL1xuICAgIHZhciBUMTsgLyogY29ycmVjdGVkIGVzdGltYXRlIG9mIHZlcnRpY2FsIGNvbXBvbmVudCAqL1xuICAgIHZhciBTMDsgLyogaW5pdGlhbCBlc3RpbWF0ZSBvZiBob3Jpem9udGFsIGNvbXBvbmVudCAqL1xuICAgIHZhciBTMTsgLyogY29ycmVjdGVkIGVzdGltYXRlIG9mIGhvcml6b250YWwgY29tcG9uZW50ICovXG4gICAgdmFyIFNpbl9CMDsgLyogTWF0aC5zaW4oQjApLCBCMCBpcyBlc3RpbWF0ZSBvZiBCb3dyaW5nIGF1eCB2YXJpYWJsZSAqL1xuICAgIHZhciBTaW4zX0IwOyAvKiBjdWJlIG9mIE1hdGguc2luKEIwKSAqL1xuICAgIHZhciBDb3NfQjA7IC8qIE1hdGguY29zKEIwKSAqL1xuICAgIHZhciBTaW5fcDE7IC8qIE1hdGguc2luKHBoaTEpLCBwaGkxIGlzIGVzdGltYXRlZCBsYXRpdHVkZSAqL1xuICAgIHZhciBDb3NfcDE7IC8qIE1hdGguY29zKHBoaTEpICovXG4gICAgdmFyIFJuOyAvKiBFYXJ0aCByYWRpdXMgYXQgbG9jYXRpb24gKi9cbiAgICB2YXIgU3VtOyAvKiBudW1lcmF0b3Igb2YgTWF0aC5jb3MocGhpMSkgKi9cbiAgICB2YXIgQXRfUG9sZTsgLyogaW5kaWNhdGVzIGxvY2F0aW9uIGlzIGluIHBvbGFyIHJlZ2lvbiAqL1xuXG4gICAgWCA9IHBhcnNlRmxvYXQoWCk7IC8vIGNhc3QgZnJvbSBzdHJpbmcgdG8gZmxvYXRcbiAgICBZID0gcGFyc2VGbG9hdChZKTtcbiAgICBaID0gcGFyc2VGbG9hdChaKTtcblxuICAgIEF0X1BvbGUgPSBmYWxzZTtcbiAgICBpZiAoWCAhPT0gMC4wKSB7XG4gICAgICBMb25naXR1ZGUgPSBNYXRoLmF0YW4yKFksIFgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlmIChZID4gMCkge1xuICAgICAgICBMb25naXR1ZGUgPSBIQUxGX1BJO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoWSA8IDApIHtcbiAgICAgICAgTG9uZ2l0dWRlID0gLUhBTEZfUEk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgQXRfUG9sZSA9IHRydWU7XG4gICAgICAgIExvbmdpdHVkZSA9IDAuMDtcbiAgICAgICAgaWYgKFogPiAwLjApIHsgLyogbm9ydGggcG9sZSAqL1xuICAgICAgICAgIExhdGl0dWRlID0gSEFMRl9QSTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChaIDwgMC4wKSB7IC8qIHNvdXRoIHBvbGUgKi9cbiAgICAgICAgICBMYXRpdHVkZSA9IC1IQUxGX1BJO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvKiBjZW50ZXIgb2YgZWFydGggKi9cbiAgICAgICAgICBMYXRpdHVkZSA9IEhBTEZfUEk7XG4gICAgICAgICAgSGVpZ2h0ID0gLXRoaXMuYjtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgVzIgPSBYICogWCArIFkgKiBZO1xuICAgIFcgPSBNYXRoLnNxcnQoVzIpO1xuICAgIFQwID0gWiAqIEFEX0M7XG4gICAgUzAgPSBNYXRoLnNxcnQoVDAgKiBUMCArIFcyKTtcbiAgICBTaW5fQjAgPSBUMCAvIFMwO1xuICAgIENvc19CMCA9IFcgLyBTMDtcbiAgICBTaW4zX0IwID0gU2luX0IwICogU2luX0IwICogU2luX0IwO1xuICAgIFQxID0gWiArIHRoaXMuYiAqIHRoaXMuZXAyICogU2luM19CMDtcbiAgICBTdW0gPSBXIC0gdGhpcy5hICogdGhpcy5lcyAqIENvc19CMCAqIENvc19CMCAqIENvc19CMDtcbiAgICBTMSA9IE1hdGguc3FydChUMSAqIFQxICsgU3VtICogU3VtKTtcbiAgICBTaW5fcDEgPSBUMSAvIFMxO1xuICAgIENvc19wMSA9IFN1bSAvIFMxO1xuICAgIFJuID0gdGhpcy5hIC8gTWF0aC5zcXJ0KDEuMCAtIHRoaXMuZXMgKiBTaW5fcDEgKiBTaW5fcDEpO1xuICAgIGlmIChDb3NfcDEgPj0gQ09TXzY3UDUpIHtcbiAgICAgIEhlaWdodCA9IFcgLyBDb3NfcDEgLSBSbjtcbiAgICB9XG4gICAgZWxzZSBpZiAoQ29zX3AxIDw9IC1DT1NfNjdQNSkge1xuICAgICAgSGVpZ2h0ID0gVyAvIC1Db3NfcDEgLSBSbjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBIZWlnaHQgPSBaIC8gU2luX3AxICsgUm4gKiAodGhpcy5lcyAtIDEuMCk7XG4gICAgfVxuICAgIGlmIChBdF9Qb2xlID09PSBmYWxzZSkge1xuICAgICAgTGF0aXR1ZGUgPSBNYXRoLmF0YW4oU2luX3AxIC8gQ29zX3AxKTtcbiAgICB9XG5cbiAgICBwLnggPSBMb25naXR1ZGU7XG4gICAgcC55ID0gTGF0aXR1ZGU7XG4gICAgcC56ID0gSGVpZ2h0O1xuICAgIHJldHVybiBwO1xuICB9LCAvLyBnZW9jZW50cmljX3RvX2dlb2RldGljX25vbml0ZXIoKVxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAvLyBwal9nZW9jZW50aWNfdG9fd2dzODQoIHAgKVxuICAvLyAgcCA9IHBvaW50IHRvIHRyYW5zZm9ybSBpbiBnZW9jZW50cmljIGNvb3JkaW5hdGVzICh4LHkseilcbiAgZ2VvY2VudHJpY190b193Z3M4NDogZnVuY3Rpb24ocCkge1xuXG4gICAgaWYgKHRoaXMuZGF0dW1fdHlwZSA9PT0gUEpEXzNQQVJBTSkge1xuICAgICAgLy8gaWYoIHhbaW9dID09PSBIVUdFX1ZBTCApXG4gICAgICAvLyAgICBjb250aW51ZTtcbiAgICAgIHAueCArPSB0aGlzLmRhdHVtX3BhcmFtc1swXTtcbiAgICAgIHAueSArPSB0aGlzLmRhdHVtX3BhcmFtc1sxXTtcbiAgICAgIHAueiArPSB0aGlzLmRhdHVtX3BhcmFtc1syXTtcblxuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmRhdHVtX3R5cGUgPT09IFBKRF83UEFSQU0pIHtcbiAgICAgIHZhciBEeF9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzBdO1xuICAgICAgdmFyIER5X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbMV07XG4gICAgICB2YXIgRHpfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1syXTtcbiAgICAgIHZhciBSeF9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzNdO1xuICAgICAgdmFyIFJ5X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbNF07XG4gICAgICB2YXIgUnpfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1s1XTtcbiAgICAgIHZhciBNX0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbNl07XG4gICAgICAvLyBpZiggeFtpb10gPT09IEhVR0VfVkFMIClcbiAgICAgIC8vICAgIGNvbnRpbnVlO1xuICAgICAgdmFyIHhfb3V0ID0gTV9CRiAqIChwLnggLSBSel9CRiAqIHAueSArIFJ5X0JGICogcC56KSArIER4X0JGO1xuICAgICAgdmFyIHlfb3V0ID0gTV9CRiAqIChSel9CRiAqIHAueCArIHAueSAtIFJ4X0JGICogcC56KSArIER5X0JGO1xuICAgICAgdmFyIHpfb3V0ID0gTV9CRiAqICgtUnlfQkYgKiBwLnggKyBSeF9CRiAqIHAueSArIHAueikgKyBEel9CRjtcbiAgICAgIHAueCA9IHhfb3V0O1xuICAgICAgcC55ID0geV9vdXQ7XG4gICAgICBwLnogPSB6X291dDtcbiAgICB9XG4gIH0sIC8vIGNzX2dlb2NlbnRyaWNfdG9fd2dzODRcblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgLy8gcGpfZ2VvY2VudGljX2Zyb21fd2dzODQoKVxuICAvLyAgY29vcmRpbmF0ZSBzeXN0ZW0gZGVmaW5pdGlvbixcbiAgLy8gIHBvaW50IHRvIHRyYW5zZm9ybSBpbiBnZW9jZW50cmljIGNvb3JkaW5hdGVzICh4LHkseilcbiAgZ2VvY2VudHJpY19mcm9tX3dnczg0OiBmdW5jdGlvbihwKSB7XG5cbiAgICBpZiAodGhpcy5kYXR1bV90eXBlID09PSBQSkRfM1BBUkFNKSB7XG4gICAgICAvL2lmKCB4W2lvXSA9PT0gSFVHRV9WQUwgKVxuICAgICAgLy8gICAgY29udGludWU7XG4gICAgICBwLnggLT0gdGhpcy5kYXR1bV9wYXJhbXNbMF07XG4gICAgICBwLnkgLT0gdGhpcy5kYXR1bV9wYXJhbXNbMV07XG4gICAgICBwLnogLT0gdGhpcy5kYXR1bV9wYXJhbXNbMl07XG5cbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5kYXR1bV90eXBlID09PSBQSkRfN1BBUkFNKSB7XG4gICAgICB2YXIgRHhfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1swXTtcbiAgICAgIHZhciBEeV9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzFdO1xuICAgICAgdmFyIER6X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbMl07XG4gICAgICB2YXIgUnhfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1szXTtcbiAgICAgIHZhciBSeV9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzRdO1xuICAgICAgdmFyIFJ6X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbNV07XG4gICAgICB2YXIgTV9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzZdO1xuICAgICAgdmFyIHhfdG1wID0gKHAueCAtIER4X0JGKSAvIE1fQkY7XG4gICAgICB2YXIgeV90bXAgPSAocC55IC0gRHlfQkYpIC8gTV9CRjtcbiAgICAgIHZhciB6X3RtcCA9IChwLnogLSBEel9CRikgLyBNX0JGO1xuICAgICAgLy9pZiggeFtpb10gPT09IEhVR0VfVkFMIClcbiAgICAgIC8vICAgIGNvbnRpbnVlO1xuXG4gICAgICBwLnggPSB4X3RtcCArIFJ6X0JGICogeV90bXAgLSBSeV9CRiAqIHpfdG1wO1xuICAgICAgcC55ID0gLVJ6X0JGICogeF90bXAgKyB5X3RtcCArIFJ4X0JGICogel90bXA7XG4gICAgICBwLnogPSBSeV9CRiAqIHhfdG1wIC0gUnhfQkYgKiB5X3RtcCArIHpfdG1wO1xuICAgIH0gLy9jc19nZW9jZW50cmljX2Zyb21fd2dzODQoKVxuICB9XG59O1xuXG4vKiogcG9pbnQgb2JqZWN0LCBub3RoaW5nIGZhbmN5LCBqdXN0IGFsbG93cyB2YWx1ZXMgdG8gYmVcbiAgICBwYXNzZWQgYmFjayBhbmQgZm9ydGggYnkgcmVmZXJlbmNlIHJhdGhlciB0aGFuIGJ5IHZhbHVlLlxuICAgIE90aGVyIHBvaW50IGNsYXNzZXMgbWF5IGJlIHVzZWQgYXMgbG9uZyBhcyB0aGV5IGhhdmVcbiAgICB4IGFuZCB5IHByb3BlcnRpZXMsIHdoaWNoIHdpbGwgZ2V0IG1vZGlmaWVkIGluIHRoZSB0cmFuc2Zvcm0gbWV0aG9kLlxuKi9cbm1vZHVsZS5leHBvcnRzID0gZGF0dW07XG4iLCJ2YXIgUEpEXzNQQVJBTSA9IDE7XG52YXIgUEpEXzdQQVJBTSA9IDI7XG52YXIgUEpEX0dSSURTSElGVCA9IDM7XG52YXIgUEpEX05PREFUVU0gPSA1OyAvLyBXR1M4NCBvciBlcXVpdmFsZW50XG52YXIgU1JTX1dHUzg0X1NFTUlNQUpPUiA9IDYzNzgxMzc7IC8vIG9ubHkgdXNlZCBpbiBncmlkIHNoaWZ0IHRyYW5zZm9ybXNcbnZhciBTUlNfV0dTODRfRVNRVUFSRUQgPSAwLjAwNjY5NDM3OTk5MDE0MTMxNjsgLy9ER1I6IDIwMTItMDctMjlcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc291cmNlLCBkZXN0LCBwb2ludCkge1xuICB2YXIgd3AsIGksIGw7XG5cbiAgZnVuY3Rpb24gY2hlY2tQYXJhbXMoZmFsbGJhY2spIHtcbiAgICByZXR1cm4gKGZhbGxiYWNrID09PSBQSkRfM1BBUkFNIHx8IGZhbGxiYWNrID09PSBQSkRfN1BBUkFNKTtcbiAgfVxuICAvLyBTaG9ydCBjdXQgaWYgdGhlIGRhdHVtcyBhcmUgaWRlbnRpY2FsLlxuICBpZiAoc291cmNlLmNvbXBhcmVfZGF0dW1zKGRlc3QpKSB7XG4gICAgcmV0dXJuIHBvaW50OyAvLyBpbiB0aGlzIGNhc2UsIHplcm8gaXMgc3VjZXNzLFxuICAgIC8vIHdoZXJlYXMgY3NfY29tcGFyZV9kYXR1bXMgcmV0dXJucyAxIHRvIGluZGljYXRlIFRSVUVcbiAgICAvLyBjb25mdXNpbmcsIHNob3VsZCBmaXggdGhpc1xuICB9XG5cbiAgLy8gRXhwbGljaXRseSBza2lwIGRhdHVtIHRyYW5zZm9ybSBieSBzZXR0aW5nICdkYXR1bT1ub25lJyBhcyBwYXJhbWV0ZXIgZm9yIGVpdGhlciBzb3VyY2Ugb3IgZGVzdFxuICBpZiAoc291cmNlLmRhdHVtX3R5cGUgPT09IFBKRF9OT0RBVFVNIHx8IGRlc3QuZGF0dW1fdHlwZSA9PT0gUEpEX05PREFUVU0pIHtcbiAgICByZXR1cm4gcG9pbnQ7XG4gIH1cblxuICAvL0RHUjogMjAxMi0wNy0yOSA6IGFkZCBuYWRncmlkcyBzdXBwb3J0IChiZWdpbilcbiAgdmFyIHNyY19hID0gc291cmNlLmE7XG4gIHZhciBzcmNfZXMgPSBzb3VyY2UuZXM7XG5cbiAgdmFyIGRzdF9hID0gZGVzdC5hO1xuICB2YXIgZHN0X2VzID0gZGVzdC5lcztcblxuICB2YXIgZmFsbGJhY2sgPSBzb3VyY2UuZGF0dW1fdHlwZTtcbiAgLy8gSWYgdGhpcyBkYXR1bSByZXF1aXJlcyBncmlkIHNoaWZ0cywgdGhlbiBhcHBseSBpdCB0byBnZW9kZXRpYyBjb29yZGluYXRlcy5cbiAgaWYgKGZhbGxiYWNrID09PSBQSkRfR1JJRFNISUZUKSB7XG4gICAgaWYgKHRoaXMuYXBwbHlfZ3JpZHNoaWZ0KHNvdXJjZSwgMCwgcG9pbnQpID09PSAwKSB7XG4gICAgICBzb3VyY2UuYSA9IFNSU19XR1M4NF9TRU1JTUFKT1I7XG4gICAgICBzb3VyY2UuZXMgPSBTUlNfV0dTODRfRVNRVUFSRUQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gdHJ5IDMgb3IgNyBwYXJhbXMgdHJhbnNmb3JtYXRpb24gb3Igbm90aGluZyA/XG4gICAgICBpZiAoIXNvdXJjZS5kYXR1bV9wYXJhbXMpIHtcbiAgICAgICAgc291cmNlLmEgPSBzcmNfYTtcbiAgICAgICAgc291cmNlLmVzID0gc291cmNlLmVzO1xuICAgICAgICByZXR1cm4gcG9pbnQ7XG4gICAgICB9XG4gICAgICB3cCA9IDE7XG4gICAgICBmb3IgKGkgPSAwLCBsID0gc291cmNlLmRhdHVtX3BhcmFtcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgd3AgKj0gc291cmNlLmRhdHVtX3BhcmFtc1tpXTtcbiAgICAgIH1cbiAgICAgIGlmICh3cCA9PT0gMCkge1xuICAgICAgICBzb3VyY2UuYSA9IHNyY19hO1xuICAgICAgICBzb3VyY2UuZXMgPSBzb3VyY2UuZXM7XG4gICAgICAgIHJldHVybiBwb2ludDtcbiAgICAgIH1cbiAgICAgIGlmIChzb3VyY2UuZGF0dW1fcGFyYW1zLmxlbmd0aCA+IDMpIHtcbiAgICAgICAgZmFsbGJhY2sgPSBQSkRfN1BBUkFNO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGZhbGxiYWNrID0gUEpEXzNQQVJBTTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGRlc3QuZGF0dW1fdHlwZSA9PT0gUEpEX0dSSURTSElGVCkge1xuICAgIGRlc3QuYSA9IFNSU19XR1M4NF9TRU1JTUFKT1I7XG4gICAgZGVzdC5lcyA9IFNSU19XR1M4NF9FU1FVQVJFRDtcbiAgfVxuICAvLyBEbyB3ZSBuZWVkIHRvIGdvIHRocm91Z2ggZ2VvY2VudHJpYyBjb29yZGluYXRlcz9cbiAgaWYgKHNvdXJjZS5lcyAhPT0gZGVzdC5lcyB8fCBzb3VyY2UuYSAhPT0gZGVzdC5hIHx8IGNoZWNrUGFyYW1zKGZhbGxiYWNrKSB8fCBjaGVja1BhcmFtcyhkZXN0LmRhdHVtX3R5cGUpKSB7XG4gICAgLy9ER1I6IDIwMTItMDctMjkgOiBhZGQgbmFkZ3JpZHMgc3VwcG9ydCAoZW5kKVxuICAgIC8vIENvbnZlcnQgdG8gZ2VvY2VudHJpYyBjb29yZGluYXRlcy5cbiAgICBzb3VyY2UuZ2VvZGV0aWNfdG9fZ2VvY2VudHJpYyhwb2ludCk7XG4gICAgLy8gQ0hFQ0tfUkVUVVJOO1xuICAgIC8vIENvbnZlcnQgYmV0d2VlbiBkYXR1bXNcbiAgICBpZiAoY2hlY2tQYXJhbXMoc291cmNlLmRhdHVtX3R5cGUpKSB7XG4gICAgICBzb3VyY2UuZ2VvY2VudHJpY190b193Z3M4NChwb2ludCk7XG4gICAgICAvLyBDSEVDS19SRVRVUk47XG4gICAgfVxuICAgIGlmIChjaGVja1BhcmFtcyhkZXN0LmRhdHVtX3R5cGUpKSB7XG4gICAgICBkZXN0Lmdlb2NlbnRyaWNfZnJvbV93Z3M4NChwb2ludCk7XG4gICAgICAvLyBDSEVDS19SRVRVUk47XG4gICAgfVxuICAgIC8vIENvbnZlcnQgYmFjayB0byBnZW9kZXRpYyBjb29yZGluYXRlc1xuICAgIGRlc3QuZ2VvY2VudHJpY190b19nZW9kZXRpYyhwb2ludCk7XG4gICAgLy8gQ0hFQ0tfUkVUVVJOO1xuICB9XG4gIC8vIEFwcGx5IGdyaWQgc2hpZnQgdG8gZGVzdGluYXRpb24gaWYgcmVxdWlyZWRcbiAgaWYgKGRlc3QuZGF0dW1fdHlwZSA9PT0gUEpEX0dSSURTSElGVCkge1xuICAgIHRoaXMuYXBwbHlfZ3JpZHNoaWZ0KGRlc3QsIDEsIHBvaW50KTtcbiAgICAvLyBDSEVDS19SRVRVUk47XG4gIH1cblxuICBzb3VyY2UuYSA9IHNyY19hO1xuICBzb3VyY2UuZXMgPSBzcmNfZXM7XG4gIGRlc3QuYSA9IGRzdF9hO1xuICBkZXN0LmVzID0gZHN0X2VzO1xuXG4gIHJldHVybiBwb2ludDtcbn07XG5cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi9nbG9iYWwnKTtcbnZhciBwYXJzZVByb2ogPSByZXF1aXJlKCcuL3Byb2pTdHJpbmcnKTtcbnZhciB3a3QgPSByZXF1aXJlKCcuL3drdCcpO1xuXG5mdW5jdGlvbiBkZWZzKG5hbWUpIHtcbiAgLypnbG9iYWwgY29uc29sZSovXG4gIHZhciB0aGF0ID0gdGhpcztcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICB2YXIgZGVmID0gYXJndW1lbnRzWzFdO1xuICAgIGlmICh0eXBlb2YgZGVmID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKGRlZi5jaGFyQXQoMCkgPT09ICcrJykge1xuICAgICAgICBkZWZzW25hbWVdID0gcGFyc2VQcm9qKGFyZ3VtZW50c1sxXSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZGVmc1tuYW1lXSA9IHdrdChhcmd1bWVudHNbMV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkZWZzW25hbWVdID0gZGVmO1xuICAgIH1cbiAgfVxuICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobmFtZSkpIHtcbiAgICAgIHJldHVybiBuYW1lLm1hcChmdW5jdGlvbih2KSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHYpKSB7XG4gICAgICAgICAgZGVmcy5hcHBseSh0aGF0LCB2KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkZWZzKHYpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAobmFtZSBpbiBkZWZzKSB7XG4gICAgICAgIHJldHVybiBkZWZzW25hbWVdO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgnRVBTRycgaW4gbmFtZSkge1xuICAgICAgZGVmc1snRVBTRzonICsgbmFtZS5FUFNHXSA9IG5hbWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKCdFU1JJJyBpbiBuYW1lKSB7XG4gICAgICBkZWZzWydFU1JJOicgKyBuYW1lLkVTUkldID0gbmFtZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoJ0lBVTIwMDAnIGluIG5hbWUpIHtcbiAgICAgIGRlZnNbJ0lBVTIwMDA6JyArIG5hbWUuSUFVMjAwMF0gPSBuYW1lO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKG5hbWUpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuXG59XG5nbG9iYWxzKGRlZnMpO1xubW9kdWxlLmV4cG9ydHMgPSBkZWZzO1xuIiwidmFyIERhdHVtID0gcmVxdWlyZSgnLi9jb25zdGFudHMvRGF0dW0nKTtcbnZhciBFbGxpcHNvaWQgPSByZXF1aXJlKCcuL2NvbnN0YW50cy9FbGxpcHNvaWQnKTtcbnZhciBleHRlbmQgPSByZXF1aXJlKCcuL2V4dGVuZCcpO1xudmFyIGRhdHVtID0gcmVxdWlyZSgnLi9kYXR1bScpO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbi8vIGVsbGlwb2lkIHBqX3NldF9lbGwuY1xudmFyIFNJWFRIID0gMC4xNjY2NjY2NjY2NjY2NjY2NjY3O1xuLyogMS82ICovXG52YXIgUkE0ID0gMC4wNDcyMjIyMjIyMjIyMjIyMjIyMjtcbi8qIDE3LzM2MCAqL1xudmFyIFJBNiA9IDAuMDIyMTU2MDg0NjU2MDg0NjU2MDg7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGpzb24pIHtcbiAgLy8gREdSIDIwMTEtMDMtMjAgOiBuYWdyaWRzIC0+IG5hZGdyaWRzXG4gIGlmIChqc29uLmRhdHVtQ29kZSAmJiBqc29uLmRhdHVtQ29kZSAhPT0gJ25vbmUnKSB7XG4gICAgdmFyIGRhdHVtRGVmID0gRGF0dW1banNvbi5kYXR1bUNvZGVdO1xuICAgIGlmIChkYXR1bURlZikge1xuICAgICAganNvbi5kYXR1bV9wYXJhbXMgPSBkYXR1bURlZi50b3dnczg0ID8gZGF0dW1EZWYudG93Z3M4NC5zcGxpdCgnLCcpIDogbnVsbDtcbiAgICAgIGpzb24uZWxscHMgPSBkYXR1bURlZi5lbGxpcHNlO1xuICAgICAganNvbi5kYXR1bU5hbWUgPSBkYXR1bURlZi5kYXR1bU5hbWUgPyBkYXR1bURlZi5kYXR1bU5hbWUgOiBqc29uLmRhdHVtQ29kZTtcbiAgICB9XG4gIH1cbiAgaWYgKCFqc29uLmEpIHsgLy8gZG8gd2UgaGF2ZSBhbiBlbGxpcHNvaWQ/XG4gICAgdmFyIGVsbGlwc2UgPSBFbGxpcHNvaWRbanNvbi5lbGxwc10gPyBFbGxpcHNvaWRbanNvbi5lbGxwc10gOiBFbGxpcHNvaWQuV0dTODQ7XG4gICAgZXh0ZW5kKGpzb24sIGVsbGlwc2UpO1xuICB9XG4gIGlmIChqc29uLnJmICYmICFqc29uLmIpIHtcbiAgICBqc29uLmIgPSAoMS4wIC0gMS4wIC8ganNvbi5yZikgKiBqc29uLmE7XG4gIH1cbiAgaWYgKGpzb24ucmYgPT09IDAgfHwgTWF0aC5hYnMoanNvbi5hIC0ganNvbi5iKSA8IEVQU0xOKSB7XG4gICAganNvbi5zcGhlcmUgPSB0cnVlO1xuICAgIGpzb24uYiA9IGpzb24uYTtcbiAgfVxuICBqc29uLmEyID0ganNvbi5hICoganNvbi5hOyAvLyB1c2VkIGluIGdlb2NlbnRyaWNcbiAganNvbi5iMiA9IGpzb24uYiAqIGpzb24uYjsgLy8gdXNlZCBpbiBnZW9jZW50cmljXG4gIGpzb24uZXMgPSAoanNvbi5hMiAtIGpzb24uYjIpIC8ganNvbi5hMjsgLy8gZSBeIDJcbiAganNvbi5lID0gTWF0aC5zcXJ0KGpzb24uZXMpOyAvLyBlY2NlbnRyaWNpdHlcbiAgaWYgKGpzb24uUl9BKSB7XG4gICAganNvbi5hICo9IDEgLSBqc29uLmVzICogKFNJWFRIICsganNvbi5lcyAqIChSQTQgKyBqc29uLmVzICogUkE2KSk7XG4gICAganNvbi5hMiA9IGpzb24uYSAqIGpzb24uYTtcbiAgICBqc29uLmIyID0ganNvbi5iICoganNvbi5iO1xuICAgIGpzb24uZXMgPSAwO1xuICB9XG4gIGpzb24uZXAyID0gKGpzb24uYTIgLSBqc29uLmIyKSAvIGpzb24uYjI7IC8vIHVzZWQgaW4gZ2VvY2VudHJpY1xuICBpZiAoIWpzb24uazApIHtcbiAgICBqc29uLmswID0gMS4wOyAvL2RlZmF1bHQgdmFsdWVcbiAgfVxuICAvL0RHUiAyMDEwLTExLTEyOiBheGlzXG4gIGlmICghanNvbi5heGlzKSB7XG4gICAganNvbi5heGlzID0gXCJlbnVcIjtcbiAgfVxuXG4gIGlmICghanNvbi5kYXR1bSkge1xuICAgIGpzb24uZGF0dW0gPSBkYXR1bShqc29uKTtcbiAgfVxuICByZXR1cm4ganNvbjtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRlc3RpbmF0aW9uLCBzb3VyY2UpIHtcbiAgZGVzdGluYXRpb24gPSBkZXN0aW5hdGlvbiB8fCB7fTtcbiAgdmFyIHZhbHVlLCBwcm9wZXJ0eTtcbiAgaWYgKCFzb3VyY2UpIHtcbiAgICByZXR1cm4gZGVzdGluYXRpb247XG4gIH1cbiAgZm9yIChwcm9wZXJ0eSBpbiBzb3VyY2UpIHtcbiAgICB2YWx1ZSA9IHNvdXJjZVtwcm9wZXJ0eV07XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRlc3RpbmF0aW9uW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVzdGluYXRpb247XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkZWZzKSB7XG4gIGRlZnMoJ0VQU0c6NDMyNicsIFwiK3RpdGxlPVdHUyA4NCAobG9uZy9sYXQpICtwcm9qPWxvbmdsYXQgK2VsbHBzPVdHUzg0ICtkYXR1bT1XR1M4NCArdW5pdHM9ZGVncmVlc1wiKTtcbiAgZGVmcygnRVBTRzo0MjY5JywgXCIrdGl0bGU9TkFEODMgKGxvbmcvbGF0KSArcHJvaj1sb25nbGF0ICthPTYzNzgxMzcuMCArYj02MzU2NzUyLjMxNDE0MDM2ICtlbGxwcz1HUlM4MCArZGF0dW09TkFEODMgK3VuaXRzPWRlZ3JlZXNcIik7XG4gIGRlZnMoJ0VQU0c6Mzg1NycsIFwiK3RpdGxlPVdHUyA4NCAvIFBzZXVkby1NZXJjYXRvciArcHJvaj1tZXJjICthPTYzNzgxMzcgK2I9NjM3ODEzNyArbGF0X3RzPTAuMCArbG9uXzA9MC4wICt4XzA9MC4wICt5XzA9MCAraz0xLjAgK3VuaXRzPW0gK25hZGdyaWRzPUBudWxsICtub19kZWZzXCIpO1xuXG4gIGRlZnMuV0dTODQgPSBkZWZzWydFUFNHOjQzMjYnXTtcbiAgZGVmc1snRVBTRzozNzg1J10gPSBkZWZzWydFUFNHOjM4NTcnXTsgLy8gbWFpbnRhaW4gYmFja3dhcmQgY29tcGF0LCBvZmZpY2lhbCBjb2RlIGlzIDM4NTdcbiAgZGVmcy5HT09HTEUgPSBkZWZzWydFUFNHOjM4NTcnXTtcbiAgZGVmc1snRVBTRzo5MDA5MTMnXSA9IGRlZnNbJ0VQU0c6Mzg1NyddO1xuICBkZWZzWydFUFNHOjEwMjExMyddID0gZGVmc1snRVBTRzozODU3J107XG59O1xuIiwidmFyIHByb2pzID0gW1xuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL3RtZXJjJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvdXRtJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvc3RlcmVhJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvc3RlcmUnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9zb21lcmMnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9vbWVyYycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2xjYycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2tyb3ZhaycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2Nhc3MnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9sYWVhJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvYWVhJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvZ25vbScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2NlYScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2VxYycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL3BvbHknKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9uem1nJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvbWlsbCcpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL3NpbnUnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9tb2xsJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvZXFkYycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL3ZhbmRnJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvYWVxZCcpXG5dO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcm9qNCl7XG4gIHByb2pzLmZvckVhY2goZnVuY3Rpb24ocHJvail7XG4gICAgcHJvajQuUHJvai5wcm9qZWN0aW9ucy5hZGQocHJvaik7XG4gIH0pO1xufTsiLCJ2YXIgcHJvajQgPSByZXF1aXJlKCcuL2NvcmUnKTtcbnByb2o0LmRlZmF1bHREYXR1bSA9ICdXR1M4NCc7IC8vZGVmYXVsdCBkYXR1bVxucHJvajQuUHJvaiA9IHJlcXVpcmUoJy4vUHJvaicpO1xucHJvajQuV0dTODQgPSBuZXcgcHJvajQuUHJvaignV0dTODQnKTtcbnByb2o0LlBvaW50ID0gcmVxdWlyZSgnLi9Qb2ludCcpO1xucHJvajQudG9Qb2ludCA9IHJlcXVpcmUoXCIuL2NvbW1vbi90b1BvaW50XCIpO1xucHJvajQuZGVmcyA9IHJlcXVpcmUoJy4vZGVmcycpO1xucHJvajQudHJhbnNmb3JtID0gcmVxdWlyZSgnLi90cmFuc2Zvcm0nKTtcbnByb2o0Lm1ncnMgPSByZXF1aXJlKCdtZ3JzJyk7XG5wcm9qNC52ZXJzaW9uID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvbjtcbnJlcXVpcmUoJy4vaW5jbHVkZWRQcm9qZWN0aW9ucycpKHByb2o0KTtcbm1vZHVsZS5leHBvcnRzID0gcHJvajQ7IiwidmFyIGRlZnMgPSByZXF1aXJlKCcuL2RlZnMnKTtcbnZhciB3a3QgPSByZXF1aXJlKCcuL3drdCcpO1xudmFyIHByb2pTdHIgPSByZXF1aXJlKCcuL3Byb2pTdHJpbmcnKTtcbmZ1bmN0aW9uIHRlc3RPYmooY29kZSl7XG4gIHJldHVybiB0eXBlb2YgY29kZSA9PT0gJ3N0cmluZyc7XG59XG5mdW5jdGlvbiB0ZXN0RGVmKGNvZGUpe1xuICByZXR1cm4gY29kZSBpbiBkZWZzO1xufVxuZnVuY3Rpb24gdGVzdFdLVChjb2RlKXtcbiAgdmFyIGNvZGVXb3JkcyA9IFsnR0VPR0NTJywnR0VPQ0NTJywnUFJPSkNTJywnTE9DQUxfQ1MnXTtcbiAgcmV0dXJuIGNvZGVXb3Jkcy5yZWR1Y2UoZnVuY3Rpb24oYSxiKXtcbiAgICByZXR1cm4gYSsxK2NvZGUuaW5kZXhPZihiKTtcbiAgfSwwKTtcbn1cbmZ1bmN0aW9uIHRlc3RQcm9qKGNvZGUpe1xuICByZXR1cm4gY29kZVswXSA9PT0gJysnO1xufVxuZnVuY3Rpb24gcGFyc2UoY29kZSl7XG4gIGlmICh0ZXN0T2JqKGNvZGUpKSB7XG4gICAgLy9jaGVjayB0byBzZWUgaWYgdGhpcyBpcyBhIFdLVCBzdHJpbmdcbiAgICBpZiAodGVzdERlZihjb2RlKSkge1xuICAgICAgcmV0dXJuIGRlZnNbY29kZV07XG4gICAgfVxuICAgIGVsc2UgaWYgKHRlc3RXS1QoY29kZSkpIHtcbiAgICAgIHJldHVybiB3a3QoY29kZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRlc3RQcm9qKGNvZGUpKSB7XG4gICAgICByZXR1cm4gcHJvalN0cihjb2RlKTtcbiAgICB9XG4gIH1lbHNle1xuICAgIHJldHVybiBjb2RlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7IiwidmFyIEQyUiA9IDAuMDE3NDUzMjkyNTE5OTQzMjk1Nzc7XG52YXIgUHJpbWVNZXJpZGlhbiA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL1ByaW1lTWVyaWRpYW4nKTtcbnZhciB1bml0cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL3VuaXRzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGVmRGF0YSkge1xuICB2YXIgc2VsZiA9IHt9O1xuICB2YXIgcGFyYW1PYmogPSB7fTtcbiAgZGVmRGF0YS5zcGxpdChcIitcIikubWFwKGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gdi50cmltKCk7XG4gIH0pLmZpbHRlcihmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIGE7XG4gIH0pLmZvckVhY2goZnVuY3Rpb24oYSkge1xuICAgIHZhciBzcGxpdCA9IGEuc3BsaXQoXCI9XCIpO1xuICAgIHNwbGl0LnB1c2godHJ1ZSk7XG4gICAgcGFyYW1PYmpbc3BsaXRbMF0udG9Mb3dlckNhc2UoKV0gPSBzcGxpdFsxXTtcbiAgfSk7XG4gIHZhciBwYXJhbU5hbWUsIHBhcmFtVmFsLCBwYXJhbU91dG5hbWU7XG4gIHZhciBwYXJhbXMgPSB7XG4gICAgcHJvajogJ3Byb2pOYW1lJyxcbiAgICBkYXR1bTogJ2RhdHVtQ29kZScsXG4gICAgcmY6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYucmYgPSBwYXJzZUZsb2F0KHYpO1xuICAgIH0sXG4gICAgbGF0XzA6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubGF0MCA9IHYgKiBEMlI7XG4gICAgfSxcbiAgICBsYXRfMTogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5sYXQxID0gdiAqIEQyUjtcbiAgICB9LFxuICAgIGxhdF8yOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmxhdDIgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgbGF0X3RzOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmxhdF90cyA9IHYgKiBEMlI7XG4gICAgfSxcbiAgICBsb25fMDogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5sb25nMCA9IHYgKiBEMlI7XG4gICAgfSxcbiAgICBsb25fMTogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5sb25nMSA9IHYgKiBEMlI7XG4gICAgfSxcbiAgICBsb25fMjogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5sb25nMiA9IHYgKiBEMlI7XG4gICAgfSxcbiAgICBhbHBoYTogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5hbHBoYSA9IHBhcnNlRmxvYXQodikgKiBEMlI7XG4gICAgfSxcbiAgICBsb25jOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmxvbmdjID0gdiAqIEQyUjtcbiAgICB9LFxuICAgIHhfMDogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi54MCA9IHBhcnNlRmxvYXQodik7XG4gICAgfSxcbiAgICB5XzA6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYueTAgPSBwYXJzZUZsb2F0KHYpO1xuICAgIH0sXG4gICAga18wOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmswID0gcGFyc2VGbG9hdCh2KTtcbiAgICB9LFxuICAgIGs6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuazAgPSBwYXJzZUZsb2F0KHYpO1xuICAgIH0sXG4gICAgYTogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5hID0gcGFyc2VGbG9hdCh2KTtcbiAgICB9LFxuICAgIGI6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuYiA9IHBhcnNlRmxvYXQodik7XG4gICAgfSxcbiAgICByX2E6IGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5SX0EgPSB0cnVlO1xuICAgIH0sXG4gICAgem9uZTogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi56b25lID0gcGFyc2VJbnQodiwgMTApO1xuICAgIH0sXG4gICAgc291dGg6IGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi51dG1Tb3V0aCA9IHRydWU7XG4gICAgfSxcbiAgICB0b3dnczg0OiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmRhdHVtX3BhcmFtcyA9IHYuc3BsaXQoXCIsXCIpLm1hcChmdW5jdGlvbihhKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGEpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICB0b19tZXRlcjogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi50b19tZXRlciA9IHBhcnNlRmxvYXQodik7XG4gICAgfSxcbiAgICB1bml0czogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi51bml0cyA9IHY7XG4gICAgICBpZiAodW5pdHNbdl0pIHtcbiAgICAgICAgc2VsZi50b19tZXRlciA9IHVuaXRzW3ZdLnRvX21ldGVyO1xuICAgICAgfVxuICAgIH0sXG4gICAgZnJvbV9ncmVlbndpY2g6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuZnJvbV9ncmVlbndpY2ggPSB2ICogRDJSO1xuICAgIH0sXG4gICAgcG06IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuZnJvbV9ncmVlbndpY2ggPSAoUHJpbWVNZXJpZGlhblt2XSA/IFByaW1lTWVyaWRpYW5bdl0gOiBwYXJzZUZsb2F0KHYpKSAqIEQyUjtcbiAgICB9LFxuICAgIG5hZGdyaWRzOiBmdW5jdGlvbih2KSB7XG4gICAgICBpZiAodiA9PT0gJ0BudWxsJykge1xuICAgICAgICBzZWxmLmRhdHVtQ29kZSA9ICdub25lJztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzZWxmLm5hZGdyaWRzID0gdjtcbiAgICAgIH1cbiAgICB9LFxuICAgIGF4aXM6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHZhciBsZWdhbEF4aXMgPSBcImV3bnN1ZFwiO1xuICAgICAgaWYgKHYubGVuZ3RoID09PSAzICYmIGxlZ2FsQXhpcy5pbmRleE9mKHYuc3Vic3RyKDAsIDEpKSAhPT0gLTEgJiYgbGVnYWxBeGlzLmluZGV4T2Yodi5zdWJzdHIoMSwgMSkpICE9PSAtMSAmJiBsZWdhbEF4aXMuaW5kZXhPZih2LnN1YnN0cigyLCAxKSkgIT09IC0xKSB7XG4gICAgICAgIHNlbGYuYXhpcyA9IHY7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBmb3IgKHBhcmFtTmFtZSBpbiBwYXJhbU9iaikge1xuICAgIHBhcmFtVmFsID0gcGFyYW1PYmpbcGFyYW1OYW1lXTtcbiAgICBpZiAocGFyYW1OYW1lIGluIHBhcmFtcykge1xuICAgICAgcGFyYW1PdXRuYW1lID0gcGFyYW1zW3BhcmFtTmFtZV07XG4gICAgICBpZiAodHlwZW9mIHBhcmFtT3V0bmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwYXJhbU91dG5hbWUocGFyYW1WYWwpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNlbGZbcGFyYW1PdXRuYW1lXSA9IHBhcmFtVmFsO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHNlbGZbcGFyYW1OYW1lXSA9IHBhcmFtVmFsO1xuICAgIH1cbiAgfVxuICBpZih0eXBlb2Ygc2VsZi5kYXR1bUNvZGUgPT09ICdzdHJpbmcnICYmIHNlbGYuZGF0dW1Db2RlICE9PSBcIldHUzg0XCIpe1xuICAgIHNlbGYuZGF0dW1Db2RlID0gc2VsZi5kYXR1bUNvZGUudG9Mb3dlckNhc2UoKTtcbiAgfVxuICByZXR1cm4gc2VsZjtcbn07XG4iLCJ2YXIgcHJvanMgPSBbXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvbWVyYycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2xvbmdsYXQnKVxuXTtcbnZhciBuYW1lcyA9IHt9O1xudmFyIHByb2pTdG9yZSA9IFtdO1xuXG5mdW5jdGlvbiBhZGQocHJvaiwgaSkge1xuICB2YXIgbGVuID0gcHJvalN0b3JlLmxlbmd0aDtcbiAgaWYgKCFwcm9qLm5hbWVzKSB7XG4gICAgY29uc29sZS5sb2coaSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcHJvalN0b3JlW2xlbl0gPSBwcm9qO1xuICBwcm9qLm5hbWVzLmZvckVhY2goZnVuY3Rpb24obikge1xuICAgIG5hbWVzW24udG9Mb3dlckNhc2UoKV0gPSBsZW47XG4gIH0pO1xuICByZXR1cm4gdGhpcztcbn1cblxuZXhwb3J0cy5hZGQgPSBhZGQ7XG5cbmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICBpZiAoIW5hbWUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIG4gPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gIGlmICh0eXBlb2YgbmFtZXNbbl0gIT09ICd1bmRlZmluZWQnICYmIHByb2pTdG9yZVtuYW1lc1tuXV0pIHtcbiAgICByZXR1cm4gcHJvalN0b3JlW25hbWVzW25dXTtcbiAgfVxufTtcbmV4cG9ydHMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgcHJvanMuZm9yRWFjaChhZGQpO1xufTtcbiIsInZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgbXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vbXNmbnonKTtcbnZhciBxc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9xc2ZueicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIGFzaW56ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FzaW56Jyk7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcblxuICBpZiAoTWF0aC5hYnModGhpcy5sYXQxICsgdGhpcy5sYXQyKSA8IEVQU0xOKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMudGVtcCA9IHRoaXMuYiAvIHRoaXMuYTtcbiAgdGhpcy5lcyA9IDEgLSBNYXRoLnBvdyh0aGlzLnRlbXAsIDIpO1xuICB0aGlzLmUzID0gTWF0aC5zcXJ0KHRoaXMuZXMpO1xuXG4gIHRoaXMuc2luX3BvID0gTWF0aC5zaW4odGhpcy5sYXQxKTtcbiAgdGhpcy5jb3NfcG8gPSBNYXRoLmNvcyh0aGlzLmxhdDEpO1xuICB0aGlzLnQxID0gdGhpcy5zaW5fcG87XG4gIHRoaXMuY29uID0gdGhpcy5zaW5fcG87XG4gIHRoaXMubXMxID0gbXNmbnoodGhpcy5lMywgdGhpcy5zaW5fcG8sIHRoaXMuY29zX3BvKTtcbiAgdGhpcy5xczEgPSBxc2Zueih0aGlzLmUzLCB0aGlzLnNpbl9wbywgdGhpcy5jb3NfcG8pO1xuXG4gIHRoaXMuc2luX3BvID0gTWF0aC5zaW4odGhpcy5sYXQyKTtcbiAgdGhpcy5jb3NfcG8gPSBNYXRoLmNvcyh0aGlzLmxhdDIpO1xuICB0aGlzLnQyID0gdGhpcy5zaW5fcG87XG4gIHRoaXMubXMyID0gbXNmbnoodGhpcy5lMywgdGhpcy5zaW5fcG8sIHRoaXMuY29zX3BvKTtcbiAgdGhpcy5xczIgPSBxc2Zueih0aGlzLmUzLCB0aGlzLnNpbl9wbywgdGhpcy5jb3NfcG8pO1xuXG4gIHRoaXMuc2luX3BvID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgdGhpcy5jb3NfcG8gPSBNYXRoLmNvcyh0aGlzLmxhdDApO1xuICB0aGlzLnQzID0gdGhpcy5zaW5fcG87XG4gIHRoaXMucXMwID0gcXNmbnoodGhpcy5lMywgdGhpcy5zaW5fcG8sIHRoaXMuY29zX3BvKTtcblxuICBpZiAoTWF0aC5hYnModGhpcy5sYXQxIC0gdGhpcy5sYXQyKSA+IEVQU0xOKSB7XG4gICAgdGhpcy5uczAgPSAodGhpcy5tczEgKiB0aGlzLm1zMSAtIHRoaXMubXMyICogdGhpcy5tczIpIC8gKHRoaXMucXMyIC0gdGhpcy5xczEpO1xuICB9XG4gIGVsc2Uge1xuICAgIHRoaXMubnMwID0gdGhpcy5jb247XG4gIH1cbiAgdGhpcy5jID0gdGhpcy5tczEgKiB0aGlzLm1zMSArIHRoaXMubnMwICogdGhpcy5xczE7XG4gIHRoaXMucmggPSB0aGlzLmEgKiBNYXRoLnNxcnQodGhpcy5jIC0gdGhpcy5uczAgKiB0aGlzLnFzMCkgLyB0aGlzLm5zMDtcbn07XG5cbi8qIEFsYmVycyBDb25pY2FsIEVxdWFsIEFyZWEgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuXG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG5cbiAgdGhpcy5zaW5fcGhpID0gTWF0aC5zaW4obGF0KTtcbiAgdGhpcy5jb3NfcGhpID0gTWF0aC5jb3MobGF0KTtcblxuICB2YXIgcXMgPSBxc2Zueih0aGlzLmUzLCB0aGlzLnNpbl9waGksIHRoaXMuY29zX3BoaSk7XG4gIHZhciByaDEgPSB0aGlzLmEgKiBNYXRoLnNxcnQodGhpcy5jIC0gdGhpcy5uczAgKiBxcykgLyB0aGlzLm5zMDtcbiAgdmFyIHRoZXRhID0gdGhpcy5uczAgKiBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICB2YXIgeCA9IHJoMSAqIE1hdGguc2luKHRoZXRhKSArIHRoaXMueDA7XG4gIHZhciB5ID0gdGhpcy5yaCAtIHJoMSAqIE1hdGguY29zKHRoZXRhKSArIHRoaXMueTA7XG5cbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHJoMSwgcXMsIGNvbiwgdGhldGEsIGxvbiwgbGF0O1xuXG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgPSB0aGlzLnJoIC0gcC55ICsgdGhpcy55MDtcbiAgaWYgKHRoaXMubnMwID49IDApIHtcbiAgICByaDEgPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgICBjb24gPSAxO1xuICB9XG4gIGVsc2Uge1xuICAgIHJoMSA9IC1NYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgICBjb24gPSAtMTtcbiAgfVxuICB0aGV0YSA9IDA7XG4gIGlmIChyaDEgIT09IDApIHtcbiAgICB0aGV0YSA9IE1hdGguYXRhbjIoY29uICogcC54LCBjb24gKiBwLnkpO1xuICB9XG4gIGNvbiA9IHJoMSAqIHRoaXMubnMwIC8gdGhpcy5hO1xuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBsYXQgPSBNYXRoLmFzaW4oKHRoaXMuYyAtIGNvbiAqIGNvbikgLyAoMiAqIHRoaXMubnMwKSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcXMgPSAodGhpcy5jIC0gY29uICogY29uKSAvIHRoaXMubnMwO1xuICAgIGxhdCA9IHRoaXMucGhpMXoodGhpcy5lMywgcXMpO1xuICB9XG5cbiAgbG9uID0gYWRqdXN0X2xvbih0aGV0YSAvIHRoaXMubnMwICsgdGhpcy5sb25nMCk7XG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5cbi8qIEZ1bmN0aW9uIHRvIGNvbXB1dGUgcGhpMSwgdGhlIGxhdGl0dWRlIGZvciB0aGUgaW52ZXJzZSBvZiB0aGVcbiAgIEFsYmVycyBDb25pY2FsIEVxdWFsLUFyZWEgcHJvamVjdGlvbi5cbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5waGkxeiA9IGZ1bmN0aW9uKGVjY2VudCwgcXMpIHtcbiAgdmFyIHNpbnBoaSwgY29zcGhpLCBjb24sIGNvbSwgZHBoaTtcbiAgdmFyIHBoaSA9IGFzaW56KDAuNSAqIHFzKTtcbiAgaWYgKGVjY2VudCA8IEVQU0xOKSB7XG4gICAgcmV0dXJuIHBoaTtcbiAgfVxuXG4gIHZhciBlY2NudHMgPSBlY2NlbnQgKiBlY2NlbnQ7XG4gIGZvciAodmFyIGkgPSAxOyBpIDw9IDI1OyBpKyspIHtcbiAgICBzaW5waGkgPSBNYXRoLnNpbihwaGkpO1xuICAgIGNvc3BoaSA9IE1hdGguY29zKHBoaSk7XG4gICAgY29uID0gZWNjZW50ICogc2lucGhpO1xuICAgIGNvbSA9IDEgLSBjb24gKiBjb247XG4gICAgZHBoaSA9IDAuNSAqIGNvbSAqIGNvbSAvIGNvc3BoaSAqIChxcyAvICgxIC0gZWNjbnRzKSAtIHNpbnBoaSAvIGNvbSArIDAuNSAvIGVjY2VudCAqIE1hdGgubG9nKCgxIC0gY29uKSAvICgxICsgY29uKSkpO1xuICAgIHBoaSA9IHBoaSArIGRwaGk7XG4gICAgaWYgKE1hdGguYWJzKGRwaGkpIDw9IDFlLTcpIHtcbiAgICAgIHJldHVybiBwaGk7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJBbGJlcnNfQ29uaWNfRXF1YWxfQXJlYVwiLCBcIkFsYmVyc1wiLCBcImFlYVwiXTtcbiIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBtbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL21sZm4nKTtcbnZhciBlMGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UwZm4nKTtcbnZhciBlMWZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UxZm4nKTtcbnZhciBlMmZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UyZm4nKTtcbnZhciBlM2ZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UzZm4nKTtcbnZhciBnTiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9nTicpO1xudmFyIGFzaW56ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FzaW56Jyk7XG52YXIgaW1sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vaW1sZm4nKTtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNpbl9wMTIgPSBNYXRoLnNpbih0aGlzLmxhdDApO1xuICB0aGlzLmNvc19wMTIgPSBNYXRoLmNvcyh0aGlzLmxhdDApO1xufTtcblxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICB2YXIgc2lucGhpID0gTWF0aC5zaW4ocC55KTtcbiAgdmFyIGNvc3BoaSA9IE1hdGguY29zKHAueSk7XG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIGUwLCBlMSwgZTIsIGUzLCBNbHAsIE1sLCB0YW5waGksIE5sMSwgTmwsIHBzaSwgQXosIEcsIEgsIEdILCBIcywgYywga3AsIGNvc19jLCBzLCBzMiwgczMsIHM0LCBzNTtcbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgaWYgKE1hdGguYWJzKHRoaXMuc2luX3AxMiAtIDEpIDw9IEVQU0xOKSB7XG4gICAgICAvL05vcnRoIFBvbGUgY2FzZVxuICAgICAgcC54ID0gdGhpcy54MCArIHRoaXMuYSAqIChIQUxGX1BJIC0gbGF0KSAqIE1hdGguc2luKGRsb24pO1xuICAgICAgcC55ID0gdGhpcy55MCAtIHRoaXMuYSAqIChIQUxGX1BJIC0gbGF0KSAqIE1hdGguY29zKGRsb24pO1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGVsc2UgaWYgKE1hdGguYWJzKHRoaXMuc2luX3AxMiArIDEpIDw9IEVQU0xOKSB7XG4gICAgICAvL1NvdXRoIFBvbGUgY2FzZVxuICAgICAgcC54ID0gdGhpcy54MCArIHRoaXMuYSAqIChIQUxGX1BJICsgbGF0KSAqIE1hdGguc2luKGRsb24pO1xuICAgICAgcC55ID0gdGhpcy55MCArIHRoaXMuYSAqIChIQUxGX1BJICsgbGF0KSAqIE1hdGguY29zKGRsb24pO1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy9kZWZhdWx0IGNhc2VcbiAgICAgIGNvc19jID0gdGhpcy5zaW5fcDEyICogc2lucGhpICsgdGhpcy5jb3NfcDEyICogY29zcGhpICogTWF0aC5jb3MoZGxvbik7XG4gICAgICBjID0gTWF0aC5hY29zKGNvc19jKTtcbiAgICAgIGtwID0gYyAvIE1hdGguc2luKGMpO1xuICAgICAgcC54ID0gdGhpcy54MCArIHRoaXMuYSAqIGtwICogY29zcGhpICogTWF0aC5zaW4oZGxvbik7XG4gICAgICBwLnkgPSB0aGlzLnkwICsgdGhpcy5hICoga3AgKiAodGhpcy5jb3NfcDEyICogc2lucGhpIC0gdGhpcy5zaW5fcDEyICogY29zcGhpICogTWF0aC5jb3MoZGxvbikpO1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGUwID0gZTBmbih0aGlzLmVzKTtcbiAgICBlMSA9IGUxZm4odGhpcy5lcyk7XG4gICAgZTIgPSBlMmZuKHRoaXMuZXMpO1xuICAgIGUzID0gZTNmbih0aGlzLmVzKTtcbiAgICBpZiAoTWF0aC5hYnModGhpcy5zaW5fcDEyIC0gMSkgPD0gRVBTTE4pIHtcbiAgICAgIC8vTm9ydGggUG9sZSBjYXNlXG4gICAgICBNbHAgPSB0aGlzLmEgKiBtbGZuKGUwLCBlMSwgZTIsIGUzLCBIQUxGX1BJKTtcbiAgICAgIE1sID0gdGhpcy5hICogbWxmbihlMCwgZTEsIGUyLCBlMywgbGF0KTtcbiAgICAgIHAueCA9IHRoaXMueDAgKyAoTWxwIC0gTWwpICogTWF0aC5zaW4oZGxvbik7XG4gICAgICBwLnkgPSB0aGlzLnkwIC0gKE1scCAtIE1sKSAqIE1hdGguY29zKGRsb24pO1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGVsc2UgaWYgKE1hdGguYWJzKHRoaXMuc2luX3AxMiArIDEpIDw9IEVQU0xOKSB7XG4gICAgICAvL1NvdXRoIFBvbGUgY2FzZVxuICAgICAgTWxwID0gdGhpcy5hICogbWxmbihlMCwgZTEsIGUyLCBlMywgSEFMRl9QSSk7XG4gICAgICBNbCA9IHRoaXMuYSAqIG1sZm4oZTAsIGUxLCBlMiwgZTMsIGxhdCk7XG4gICAgICBwLnggPSB0aGlzLngwICsgKE1scCArIE1sKSAqIE1hdGguc2luKGRsb24pO1xuICAgICAgcC55ID0gdGhpcy55MCArIChNbHAgKyBNbCkgKiBNYXRoLmNvcyhkbG9uKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vRGVmYXVsdCBjYXNlXG4gICAgICB0YW5waGkgPSBzaW5waGkgLyBjb3NwaGk7XG4gICAgICBObDEgPSBnTih0aGlzLmEsIHRoaXMuZSwgdGhpcy5zaW5fcDEyKTtcbiAgICAgIE5sID0gZ04odGhpcy5hLCB0aGlzLmUsIHNpbnBoaSk7XG4gICAgICBwc2kgPSBNYXRoLmF0YW4oKDEgLSB0aGlzLmVzKSAqIHRhbnBoaSArIHRoaXMuZXMgKiBObDEgKiB0aGlzLnNpbl9wMTIgLyAoTmwgKiBjb3NwaGkpKTtcbiAgICAgIEF6ID0gTWF0aC5hdGFuMihNYXRoLnNpbihkbG9uKSwgdGhpcy5jb3NfcDEyICogTWF0aC50YW4ocHNpKSAtIHRoaXMuc2luX3AxMiAqIE1hdGguY29zKGRsb24pKTtcbiAgICAgIGlmIChBeiA9PT0gMCkge1xuICAgICAgICBzID0gTWF0aC5hc2luKHRoaXMuY29zX3AxMiAqIE1hdGguc2luKHBzaSkgLSB0aGlzLnNpbl9wMTIgKiBNYXRoLmNvcyhwc2kpKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKE1hdGguYWJzKE1hdGguYWJzKEF6KSAtIE1hdGguUEkpIDw9IEVQU0xOKSB7XG4gICAgICAgIHMgPSAtTWF0aC5hc2luKHRoaXMuY29zX3AxMiAqIE1hdGguc2luKHBzaSkgLSB0aGlzLnNpbl9wMTIgKiBNYXRoLmNvcyhwc2kpKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzID0gTWF0aC5hc2luKE1hdGguc2luKGRsb24pICogTWF0aC5jb3MocHNpKSAvIE1hdGguc2luKEF6KSk7XG4gICAgICB9XG4gICAgICBHID0gdGhpcy5lICogdGhpcy5zaW5fcDEyIC8gTWF0aC5zcXJ0KDEgLSB0aGlzLmVzKTtcbiAgICAgIEggPSB0aGlzLmUgKiB0aGlzLmNvc19wMTIgKiBNYXRoLmNvcyhBeikgLyBNYXRoLnNxcnQoMSAtIHRoaXMuZXMpO1xuICAgICAgR0ggPSBHICogSDtcbiAgICAgIEhzID0gSCAqIEg7XG4gICAgICBzMiA9IHMgKiBzO1xuICAgICAgczMgPSBzMiAqIHM7XG4gICAgICBzNCA9IHMzICogcztcbiAgICAgIHM1ID0gczQgKiBzO1xuICAgICAgYyA9IE5sMSAqIHMgKiAoMSAtIHMyICogSHMgKiAoMSAtIEhzKSAvIDYgKyBzMyAvIDggKiBHSCAqICgxIC0gMiAqIEhzKSArIHM0IC8gMTIwICogKEhzICogKDQgLSA3ICogSHMpIC0gMyAqIEcgKiBHICogKDEgLSA3ICogSHMpKSAtIHM1IC8gNDggKiBHSCk7XG4gICAgICBwLnggPSB0aGlzLngwICsgYyAqIE1hdGguc2luKEF6KTtcbiAgICAgIHAueSA9IHRoaXMueTAgKyBjICogTWF0aC5jb3MoQXopO1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICB9XG5cblxufTtcblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICBwLnggLT0gdGhpcy54MDtcbiAgcC55IC09IHRoaXMueTA7XG4gIHZhciByaCwgeiwgc2lueiwgY29zeiwgbG9uLCBsYXQsIGNvbiwgZTAsIGUxLCBlMiwgZTMsIE1scCwgTSwgTjEsIHBzaSwgQXosIGNvc0F6LCB0bXAsIEEsIEIsIEQsIEVlLCBGO1xuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICByaCA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgIGlmIChyaCA+ICgyICogSEFMRl9QSSAqIHRoaXMuYSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgeiA9IHJoIC8gdGhpcy5hO1xuXG4gICAgc2lueiA9IE1hdGguc2luKHopO1xuICAgIGNvc3ogPSBNYXRoLmNvcyh6KTtcblxuICAgIGxvbiA9IHRoaXMubG9uZzA7XG4gICAgaWYgKE1hdGguYWJzKHJoKSA8PSBFUFNMTikge1xuICAgICAgbGF0ID0gdGhpcy5sYXQwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxhdCA9IGFzaW56KGNvc3ogKiB0aGlzLnNpbl9wMTIgKyAocC55ICogc2lueiAqIHRoaXMuY29zX3AxMikgLyByaCk7XG4gICAgICBjb24gPSBNYXRoLmFicyh0aGlzLmxhdDApIC0gSEFMRl9QSTtcbiAgICAgIGlmIChNYXRoLmFicyhjb24pIDw9IEVQU0xOKSB7XG4gICAgICAgIGlmICh0aGlzLmxhdDAgPj0gMCkge1xuICAgICAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXRhbjIocC54LCAtIHAueSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCAtIE1hdGguYXRhbjIoLXAueCwgcC55KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvKmNvbiA9IGNvc3ogLSB0aGlzLnNpbl9wMTIgKiBNYXRoLnNpbihsYXQpO1xuICAgICAgICBpZiAoKE1hdGguYWJzKGNvbikgPCBFUFNMTikgJiYgKE1hdGguYWJzKHAueCkgPCBFUFNMTikpIHtcbiAgICAgICAgICAvL25vLW9wLCBqdXN0IGtlZXAgdGhlIGxvbiB2YWx1ZSBhcyBpc1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB0ZW1wID0gTWF0aC5hdGFuMigocC54ICogc2lueiAqIHRoaXMuY29zX3AxMiksIChjb24gKiByaCkpO1xuICAgICAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXRhbjIoKHAueCAqIHNpbnogKiB0aGlzLmNvc19wMTIpLCAoY29uICogcmgpKSk7XG4gICAgICAgIH0qL1xuICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCAqIHNpbnosIHJoICogdGhpcy5jb3NfcDEyICogY29zeiAtIHAueSAqIHRoaXMuc2luX3AxMiAqIHNpbnopKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwLnggPSBsb247XG4gICAgcC55ID0gbGF0O1xuICAgIHJldHVybiBwO1xuICB9XG4gIGVsc2Uge1xuICAgIGUwID0gZTBmbih0aGlzLmVzKTtcbiAgICBlMSA9IGUxZm4odGhpcy5lcyk7XG4gICAgZTIgPSBlMmZuKHRoaXMuZXMpO1xuICAgIGUzID0gZTNmbih0aGlzLmVzKTtcbiAgICBpZiAoTWF0aC5hYnModGhpcy5zaW5fcDEyIC0gMSkgPD0gRVBTTE4pIHtcbiAgICAgIC8vTm9ydGggcG9sZSBjYXNlXG4gICAgICBNbHAgPSB0aGlzLmEgKiBtbGZuKGUwLCBlMSwgZTIsIGUzLCBIQUxGX1BJKTtcbiAgICAgIHJoID0gTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gICAgICBNID0gTWxwIC0gcmg7XG4gICAgICBsYXQgPSBpbWxmbihNIC8gdGhpcy5hLCBlMCwgZTEsIGUyLCBlMyk7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCwgLSAxICogcC55KSk7XG4gICAgICBwLnggPSBsb247XG4gICAgICBwLnkgPSBsYXQ7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZWxzZSBpZiAoTWF0aC5hYnModGhpcy5zaW5fcDEyICsgMSkgPD0gRVBTTE4pIHtcbiAgICAgIC8vU291dGggcG9sZSBjYXNlXG4gICAgICBNbHAgPSB0aGlzLmEgKiBtbGZuKGUwLCBlMSwgZTIsIGUzLCBIQUxGX1BJKTtcbiAgICAgIHJoID0gTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gICAgICBNID0gcmggLSBNbHA7XG5cbiAgICAgIGxhdCA9IGltbGZuKE0gLyB0aGlzLmEsIGUwLCBlMSwgZTIsIGUzKTtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXRhbjIocC54LCBwLnkpKTtcbiAgICAgIHAueCA9IGxvbjtcbiAgICAgIHAueSA9IGxhdDtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vZGVmYXVsdCBjYXNlXG4gICAgICByaCA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgICAgQXogPSBNYXRoLmF0YW4yKHAueCwgcC55KTtcbiAgICAgIE4xID0gZ04odGhpcy5hLCB0aGlzLmUsIHRoaXMuc2luX3AxMik7XG4gICAgICBjb3NBeiA9IE1hdGguY29zKEF6KTtcbiAgICAgIHRtcCA9IHRoaXMuZSAqIHRoaXMuY29zX3AxMiAqIGNvc0F6O1xuICAgICAgQSA9IC10bXAgKiB0bXAgLyAoMSAtIHRoaXMuZXMpO1xuICAgICAgQiA9IDMgKiB0aGlzLmVzICogKDEgLSBBKSAqIHRoaXMuc2luX3AxMiAqIHRoaXMuY29zX3AxMiAqIGNvc0F6IC8gKDEgLSB0aGlzLmVzKTtcbiAgICAgIEQgPSByaCAvIE4xO1xuICAgICAgRWUgPSBEIC0gQSAqICgxICsgQSkgKiBNYXRoLnBvdyhELCAzKSAvIDYgLSBCICogKDEgKyAzICogQSkgKiBNYXRoLnBvdyhELCA0KSAvIDI0O1xuICAgICAgRiA9IDEgLSBBICogRWUgKiBFZSAvIDIgLSBEICogRWUgKiBFZSAqIEVlIC8gNjtcbiAgICAgIHBzaSA9IE1hdGguYXNpbih0aGlzLnNpbl9wMTIgKiBNYXRoLmNvcyhFZSkgKyB0aGlzLmNvc19wMTIgKiBNYXRoLnNpbihFZSkgKiBjb3NBeik7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmFzaW4oTWF0aC5zaW4oQXopICogTWF0aC5zaW4oRWUpIC8gTWF0aC5jb3MocHNpKSkpO1xuICAgICAgbGF0ID0gTWF0aC5hdGFuKCgxIC0gdGhpcy5lcyAqIEYgKiB0aGlzLnNpbl9wMTIgLyBNYXRoLnNpbihwc2kpKSAqIE1hdGgudGFuKHBzaSkgLyAoMSAtIHRoaXMuZXMpKTtcbiAgICAgIHAueCA9IGxvbjtcbiAgICAgIHAueSA9IGxhdDtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgfVxuXG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIkF6aW11dGhhbF9FcXVpZGlzdGFudFwiLCBcImFlcWRcIl07XG4iLCJ2YXIgbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tbGZuJyk7XG52YXIgZTBmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMGZuJyk7XG52YXIgZTFmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMWZuJyk7XG52YXIgZTJmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMmZuJyk7XG52YXIgZTNmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lM2ZuJyk7XG52YXIgZ04gPSByZXF1aXJlKCcuLi9jb21tb24vZ04nKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBhZGp1c3RfbGF0ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sYXQnKTtcbnZhciBpbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9pbWxmbicpO1xudmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5zcGhlcmUpIHtcbiAgICB0aGlzLmUwID0gZTBmbih0aGlzLmVzKTtcbiAgICB0aGlzLmUxID0gZTFmbih0aGlzLmVzKTtcbiAgICB0aGlzLmUyID0gZTJmbih0aGlzLmVzKTtcbiAgICB0aGlzLmUzID0gZTNmbih0aGlzLmVzKTtcbiAgICB0aGlzLm1sMCA9IHRoaXMuYSAqIG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgdGhpcy5sYXQwKTtcbiAgfVxufTtcblxuXG5cbi8qIENhc3NpbmkgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcblxuICAvKiBGb3J3YXJkIGVxdWF0aW9uc1xuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICB2YXIgeCwgeTtcbiAgdmFyIGxhbSA9IHAueDtcbiAgdmFyIHBoaSA9IHAueTtcbiAgbGFtID0gYWRqdXN0X2xvbihsYW0gLSB0aGlzLmxvbmcwKTtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICB4ID0gdGhpcy5hICogTWF0aC5hc2luKE1hdGguY29zKHBoaSkgKiBNYXRoLnNpbihsYW0pKTtcbiAgICB5ID0gdGhpcy5hICogKE1hdGguYXRhbjIoTWF0aC50YW4ocGhpKSwgTWF0aC5jb3MobGFtKSkgLSB0aGlzLmxhdDApO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vZWxsaXBzb2lkXG4gICAgdmFyIHNpbnBoaSA9IE1hdGguc2luKHBoaSk7XG4gICAgdmFyIGNvc3BoaSA9IE1hdGguY29zKHBoaSk7XG4gICAgdmFyIG5sID0gZ04odGhpcy5hLCB0aGlzLmUsIHNpbnBoaSk7XG4gICAgdmFyIHRsID0gTWF0aC50YW4ocGhpKSAqIE1hdGgudGFuKHBoaSk7XG4gICAgdmFyIGFsID0gbGFtICogTWF0aC5jb3MocGhpKTtcbiAgICB2YXIgYXNxID0gYWwgKiBhbDtcbiAgICB2YXIgY2wgPSB0aGlzLmVzICogY29zcGhpICogY29zcGhpIC8gKDEgLSB0aGlzLmVzKTtcbiAgICB2YXIgbWwgPSB0aGlzLmEgKiBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIHBoaSk7XG5cbiAgICB4ID0gbmwgKiBhbCAqICgxIC0gYXNxICogdGwgKiAoMSAvIDYgLSAoOCAtIHRsICsgOCAqIGNsKSAqIGFzcSAvIDEyMCkpO1xuICAgIHkgPSBtbCAtIHRoaXMubWwwICsgbmwgKiBzaW5waGkgLyBjb3NwaGkgKiBhc3EgKiAoMC41ICsgKDUgLSB0bCArIDYgKiBjbCkgKiBhc3EgLyAyNCk7XG5cblxuICB9XG5cbiAgcC54ID0geCArIHRoaXMueDA7XG4gIHAueSA9IHkgKyB0aGlzLnkwO1xuICByZXR1cm4gcDtcbn07XG5cbi8qIEludmVyc2UgZXF1YXRpb25zXG4gIC0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICB2YXIgeCA9IHAueCAvIHRoaXMuYTtcbiAgdmFyIHkgPSBwLnkgLyB0aGlzLmE7XG4gIHZhciBwaGksIGxhbTtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICB2YXIgZGQgPSB5ICsgdGhpcy5sYXQwO1xuICAgIHBoaSA9IE1hdGguYXNpbihNYXRoLnNpbihkZCkgKiBNYXRoLmNvcyh4KSk7XG4gICAgbGFtID0gTWF0aC5hdGFuMihNYXRoLnRhbih4KSwgTWF0aC5jb3MoZGQpKTtcbiAgfVxuICBlbHNlIHtcbiAgICAvKiBlbGxpcHNvaWQgKi9cbiAgICB2YXIgbWwxID0gdGhpcy5tbDAgLyB0aGlzLmEgKyB5O1xuICAgIHZhciBwaGkxID0gaW1sZm4obWwxLCB0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzKTtcbiAgICBpZiAoTWF0aC5hYnMoTWF0aC5hYnMocGhpMSkgLSBIQUxGX1BJKSA8PSBFUFNMTikge1xuICAgICAgcC54ID0gdGhpcy5sb25nMDtcbiAgICAgIHAueSA9IEhBTEZfUEk7XG4gICAgICBpZiAoeSA8IDApIHtcbiAgICAgICAgcC55ICo9IC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIHZhciBubDEgPSBnTih0aGlzLmEsIHRoaXMuZSwgTWF0aC5zaW4ocGhpMSkpO1xuXG4gICAgdmFyIHJsMSA9IG5sMSAqIG5sMSAqIG5sMSAvIHRoaXMuYSAvIHRoaXMuYSAqICgxIC0gdGhpcy5lcyk7XG4gICAgdmFyIHRsMSA9IE1hdGgucG93KE1hdGgudGFuKHBoaTEpLCAyKTtcbiAgICB2YXIgZGwgPSB4ICogdGhpcy5hIC8gbmwxO1xuICAgIHZhciBkc3EgPSBkbCAqIGRsO1xuICAgIHBoaSA9IHBoaTEgLSBubDEgKiBNYXRoLnRhbihwaGkxKSAvIHJsMSAqIGRsICogZGwgKiAoMC41IC0gKDEgKyAzICogdGwxKSAqIGRsICogZGwgLyAyNCk7XG4gICAgbGFtID0gZGwgKiAoMSAtIGRzcSAqICh0bDEgLyAzICsgKDEgKyAzICogdGwxKSAqIHRsMSAqIGRzcSAvIDE1KSkgLyBNYXRoLmNvcyhwaGkxKTtcblxuICB9XG5cbiAgcC54ID0gYWRqdXN0X2xvbihsYW0gKyB0aGlzLmxvbmcwKTtcbiAgcC55ID0gYWRqdXN0X2xhdChwaGkpO1xuICByZXR1cm4gcDtcblxufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJDYXNzaW5pXCIsIFwiQ2Fzc2luaV9Tb2xkbmVyXCIsIFwiY2Fzc1wiXTsiLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgcXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vcXNmbnonKTtcbnZhciBtc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tc2ZueicpO1xudmFyIGlxc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9pcXNmbnonKTtcbi8qXG4gIHJlZmVyZW5jZTogIFxuICAgIFwiQ2FydG9ncmFwaGljIFByb2plY3Rpb24gUHJvY2VkdXJlcyBmb3IgdGhlIFVOSVggRW52aXJvbm1lbnQtXG4gICAgQSBVc2VyJ3MgTWFudWFsXCIgYnkgR2VyYWxkIEkuIEV2ZW5kZW4sXG4gICAgVVNHUyBPcGVuIEZpbGUgUmVwb3J0IDkwLTI4NGFuZCBSZWxlYXNlIDQgSW50ZXJpbSBSZXBvcnRzICgyMDAzKVxuKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAvL25vLW9wXG4gIGlmICghdGhpcy5zcGhlcmUpIHtcbiAgICB0aGlzLmswID0gbXNmbnoodGhpcy5lLCBNYXRoLnNpbih0aGlzLmxhdF90cyksIE1hdGguY29zKHRoaXMubGF0X3RzKSk7XG4gIH1cbn07XG5cblxuLyogQ3lsaW5kcmljYWwgRXF1YWwgQXJlYSBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICB2YXIgeCwgeTtcbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdmFyIGRsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICB4ID0gdGhpcy54MCArIHRoaXMuYSAqIGRsb24gKiBNYXRoLmNvcyh0aGlzLmxhdF90cyk7XG4gICAgeSA9IHRoaXMueTAgKyB0aGlzLmEgKiBNYXRoLnNpbihsYXQpIC8gTWF0aC5jb3ModGhpcy5sYXRfdHMpO1xuICB9XG4gIGVsc2Uge1xuICAgIHZhciBxcyA9IHFzZm56KHRoaXMuZSwgTWF0aC5zaW4obGF0KSk7XG4gICAgeCA9IHRoaXMueDAgKyB0aGlzLmEgKiB0aGlzLmswICogZGxvbjtcbiAgICB5ID0gdGhpcy55MCArIHRoaXMuYSAqIHFzICogMC41IC8gdGhpcy5rMDtcbiAgfVxuXG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuLyogQ3lsaW5kcmljYWwgRXF1YWwgQXJlYSBpbnZlcnNlIGVxdWF0aW9ucy0tbWFwcGluZyB4LHkgdG8gbGF0L2xvbmdcbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICBwLnggLT0gdGhpcy54MDtcbiAgcC55IC09IHRoaXMueTA7XG4gIHZhciBsb24sIGxhdDtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyAocC54IC8gdGhpcy5hKSAvIE1hdGguY29zKHRoaXMubGF0X3RzKSk7XG4gICAgbGF0ID0gTWF0aC5hc2luKChwLnkgLyB0aGlzLmEpICogTWF0aC5jb3ModGhpcy5sYXRfdHMpKTtcbiAgfVxuICBlbHNlIHtcbiAgICBsYXQgPSBpcXNmbnoodGhpcy5lLCAyICogcC55ICogdGhpcy5rMCAvIHRoaXMuYSk7XG4gICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgcC54IC8gKHRoaXMuYSAqIHRoaXMuazApKTtcbiAgfVxuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiY2VhXCJdO1xuIiwidmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIGFkanVzdF9sYXQgPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xhdCcpO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgdGhpcy54MCA9IHRoaXMueDAgfHwgMDtcbiAgdGhpcy55MCA9IHRoaXMueTAgfHwgMDtcbiAgdGhpcy5sYXQwID0gdGhpcy5sYXQwIHx8IDA7XG4gIHRoaXMubG9uZzAgPSB0aGlzLmxvbmcwIHx8IDA7XG4gIHRoaXMubGF0X3RzID0gdGhpcy5sYXRfdHMgfHwgMDtcbiAgdGhpcy50aXRsZSA9IHRoaXMudGl0bGUgfHwgXCJFcXVpZGlzdGFudCBDeWxpbmRyaWNhbCAoUGxhdGUgQ2FycmUpXCI7XG5cbiAgdGhpcy5yYyA9IE1hdGguY29zKHRoaXMubGF0X3RzKTtcbn07XG5cblxuLy8gZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuXG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG5cbiAgdmFyIGRsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICB2YXIgZGxhdCA9IGFkanVzdF9sYXQobGF0IC0gdGhpcy5sYXQwKTtcbiAgcC54ID0gdGhpcy54MCArICh0aGlzLmEgKiBkbG9uICogdGhpcy5yYyk7XG4gIHAueSA9IHRoaXMueTAgKyAodGhpcy5hICogZGxhdCk7XG4gIHJldHVybiBwO1xufTtcblxuLy8gaW52ZXJzZSBlcXVhdGlvbnMtLW1hcHBpbmcgeCx5IHRvIGxhdC9sb25nXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuXG4gIHZhciB4ID0gcC54O1xuICB2YXIgeSA9IHAueTtcblxuICBwLnggPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyAoKHggLSB0aGlzLngwKSAvICh0aGlzLmEgKiB0aGlzLnJjKSkpO1xuICBwLnkgPSBhZGp1c3RfbGF0KHRoaXMubGF0MCArICgoeSAtIHRoaXMueTApIC8gKHRoaXMuYSkpKTtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIkVxdWlyZWN0YW5ndWxhclwiLCBcIkVxdWlkaXN0YW50X0N5bGluZHJpY2FsXCIsIFwiZXFjXCJdO1xuIiwidmFyIGUwZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTBmbicpO1xudmFyIGUxZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTFmbicpO1xudmFyIGUyZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTJmbicpO1xudmFyIGUzZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTNmbicpO1xudmFyIG1zZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL21zZm56Jyk7XG52YXIgbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tbGZuJyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgYWRqdXN0X2xhdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbGF0Jyk7XG52YXIgaW1sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vaW1sZm4nKTtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcblxuICAvKiBQbGFjZSBwYXJhbWV0ZXJzIGluIHN0YXRpYyBzdG9yYWdlIGZvciBjb21tb24gdXNlXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgLy8gU3RhbmRhcmQgUGFyYWxsZWxzIGNhbm5vdCBiZSBlcXVhbCBhbmQgb24gb3Bwb3NpdGUgc2lkZXMgb2YgdGhlIGVxdWF0b3JcbiAgaWYgKE1hdGguYWJzKHRoaXMubGF0MSArIHRoaXMubGF0MikgPCBFUFNMTikge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLmxhdDIgPSB0aGlzLmxhdDIgfHwgdGhpcy5sYXQxO1xuICB0aGlzLnRlbXAgPSB0aGlzLmIgLyB0aGlzLmE7XG4gIHRoaXMuZXMgPSAxIC0gTWF0aC5wb3codGhpcy50ZW1wLCAyKTtcbiAgdGhpcy5lID0gTWF0aC5zcXJ0KHRoaXMuZXMpO1xuICB0aGlzLmUwID0gZTBmbih0aGlzLmVzKTtcbiAgdGhpcy5lMSA9IGUxZm4odGhpcy5lcyk7XG4gIHRoaXMuZTIgPSBlMmZuKHRoaXMuZXMpO1xuICB0aGlzLmUzID0gZTNmbih0aGlzLmVzKTtcblxuICB0aGlzLnNpbnBoaSA9IE1hdGguc2luKHRoaXMubGF0MSk7XG4gIHRoaXMuY29zcGhpID0gTWF0aC5jb3ModGhpcy5sYXQxKTtcblxuICB0aGlzLm1zMSA9IG1zZm56KHRoaXMuZSwgdGhpcy5zaW5waGksIHRoaXMuY29zcGhpKTtcbiAgdGhpcy5tbDEgPSBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIHRoaXMubGF0MSk7XG5cbiAgaWYgKE1hdGguYWJzKHRoaXMubGF0MSAtIHRoaXMubGF0MikgPCBFUFNMTikge1xuICAgIHRoaXMubnMgPSB0aGlzLnNpbnBoaTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLnNpbnBoaSA9IE1hdGguc2luKHRoaXMubGF0Mik7XG4gICAgdGhpcy5jb3NwaGkgPSBNYXRoLmNvcyh0aGlzLmxhdDIpO1xuICAgIHRoaXMubXMyID0gbXNmbnoodGhpcy5lLCB0aGlzLnNpbnBoaSwgdGhpcy5jb3NwaGkpO1xuICAgIHRoaXMubWwyID0gbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCB0aGlzLmxhdDIpO1xuICAgIHRoaXMubnMgPSAodGhpcy5tczEgLSB0aGlzLm1zMikgLyAodGhpcy5tbDIgLSB0aGlzLm1sMSk7XG4gIH1cbiAgdGhpcy5nID0gdGhpcy5tbDEgKyB0aGlzLm1zMSAvIHRoaXMubnM7XG4gIHRoaXMubWwwID0gbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCB0aGlzLmxhdDApO1xuICB0aGlzLnJoID0gdGhpcy5hICogKHRoaXMuZyAtIHRoaXMubWwwKTtcbn07XG5cblxuLyogRXF1aWRpc3RhbnQgQ29uaWMgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIHJoMTtcblxuICAvKiBGb3J3YXJkIGVxdWF0aW9uc1xuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICByaDEgPSB0aGlzLmEgKiAodGhpcy5nIC0gbGF0KTtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgbWwgPSBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIGxhdCk7XG4gICAgcmgxID0gdGhpcy5hICogKHRoaXMuZyAtIG1sKTtcbiAgfVxuICB2YXIgdGhldGEgPSB0aGlzLm5zICogYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIHggPSB0aGlzLngwICsgcmgxICogTWF0aC5zaW4odGhldGEpO1xuICB2YXIgeSA9IHRoaXMueTAgKyB0aGlzLnJoIC0gcmgxICogTWF0aC5jb3ModGhldGEpO1xuICBwLnggPSB4O1xuICBwLnkgPSB5O1xuICByZXR1cm4gcDtcbn07XG5cbi8qIEludmVyc2UgZXF1YXRpb25zXG4gIC0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSA9IHRoaXMucmggLSBwLnkgKyB0aGlzLnkwO1xuICB2YXIgY29uLCByaDEsIGxhdCwgbG9uO1xuICBpZiAodGhpcy5ucyA+PSAwKSB7XG4gICAgcmgxID0gTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gICAgY29uID0gMTtcbiAgfVxuICBlbHNlIHtcbiAgICByaDEgPSAtTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gICAgY29uID0gLTE7XG4gIH1cbiAgdmFyIHRoZXRhID0gMDtcbiAgaWYgKHJoMSAhPT0gMCkge1xuICAgIHRoZXRhID0gTWF0aC5hdGFuMihjb24gKiBwLngsIGNvbiAqIHAueSk7XG4gIH1cblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyB0aGV0YSAvIHRoaXMubnMpO1xuICAgIGxhdCA9IGFkanVzdF9sYXQodGhpcy5nIC0gcmgxIC8gdGhpcy5hKTtcbiAgICBwLnggPSBsb247XG4gICAgcC55ID0gbGF0O1xuICAgIHJldHVybiBwO1xuICB9XG4gIGVsc2Uge1xuICAgIHZhciBtbCA9IHRoaXMuZyAtIHJoMSAvIHRoaXMuYTtcbiAgICBsYXQgPSBpbWxmbihtbCwgdGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMyk7XG4gICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgdGhldGEgLyB0aGlzLm5zKTtcbiAgICBwLnggPSBsb247XG4gICAgcC55ID0gbGF0O1xuICAgIHJldHVybiBwO1xuICB9XG5cbn07XG5leHBvcnRzLm5hbWVzID0gW1wiRXF1aWRpc3RhbnRfQ29uaWNcIiwgXCJlcWRjXCJdO1xuIiwidmFyIEZPUlRQSSA9IE1hdGguUEkvNDtcbnZhciBzcmF0ID0gcmVxdWlyZSgnLi4vY29tbW9uL3NyYXQnKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIE1BWF9JVEVSID0gMjA7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNwaGkgPSBNYXRoLnNpbih0aGlzLmxhdDApO1xuICB2YXIgY3BoaSA9IE1hdGguY29zKHRoaXMubGF0MCk7XG4gIGNwaGkgKj0gY3BoaTtcbiAgdGhpcy5yYyA9IE1hdGguc3FydCgxIC0gdGhpcy5lcykgLyAoMSAtIHRoaXMuZXMgKiBzcGhpICogc3BoaSk7XG4gIHRoaXMuQyA9IE1hdGguc3FydCgxICsgdGhpcy5lcyAqIGNwaGkgKiBjcGhpIC8gKDEgLSB0aGlzLmVzKSk7XG4gIHRoaXMucGhpYzAgPSBNYXRoLmFzaW4oc3BoaSAvIHRoaXMuQyk7XG4gIHRoaXMucmF0ZXhwID0gMC41ICogdGhpcy5DICogdGhpcy5lO1xuICB0aGlzLksgPSBNYXRoLnRhbigwLjUgKiB0aGlzLnBoaWMwICsgRk9SVFBJKSAvIChNYXRoLnBvdyhNYXRoLnRhbigwLjUgKiB0aGlzLmxhdDAgKyBGT1JUUEkpLCB0aGlzLkMpICogc3JhdCh0aGlzLmUgKiBzcGhpLCB0aGlzLnJhdGV4cCkpO1xufTtcblxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuXG4gIHAueSA9IDIgKiBNYXRoLmF0YW4odGhpcy5LICogTWF0aC5wb3coTWF0aC50YW4oMC41ICogbGF0ICsgRk9SVFBJKSwgdGhpcy5DKSAqIHNyYXQodGhpcy5lICogTWF0aC5zaW4obGF0KSwgdGhpcy5yYXRleHApKSAtIEhBTEZfUEk7XG4gIHAueCA9IHRoaXMuQyAqIGxvbjtcbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBERUxfVE9MID0gMWUtMTQ7XG4gIHZhciBsb24gPSBwLnggLyB0aGlzLkM7XG4gIHZhciBsYXQgPSBwLnk7XG4gIHZhciBudW0gPSBNYXRoLnBvdyhNYXRoLnRhbigwLjUgKiBsYXQgKyBGT1JUUEkpIC8gdGhpcy5LLCAxIC8gdGhpcy5DKTtcbiAgZm9yICh2YXIgaSA9IE1BWF9JVEVSOyBpID4gMDsgLS1pKSB7XG4gICAgbGF0ID0gMiAqIE1hdGguYXRhbihudW0gKiBzcmF0KHRoaXMuZSAqIE1hdGguc2luKHAueSksIC0gMC41ICogdGhpcy5lKSkgLSBIQUxGX1BJO1xuICAgIGlmIChNYXRoLmFicyhsYXQgLSBwLnkpIDwgREVMX1RPTCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHAueSA9IGxhdDtcbiAgfVxuICAvKiBjb252ZXJnZW5jZSBmYWlsZWQgKi9cbiAgaWYgKCFpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJnYXVzc1wiXTtcbiIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgYXNpbnogPSByZXF1aXJlKCcuLi9jb21tb24vYXNpbnonKTtcblxuLypcbiAgcmVmZXJlbmNlOlxuICAgIFdvbGZyYW0gTWF0aHdvcmxkIFwiR25vbW9uaWMgUHJvamVjdGlvblwiXG4gICAgaHR0cDovL21hdGh3b3JsZC53b2xmcmFtLmNvbS9Hbm9tb25pY1Byb2plY3Rpb24uaHRtbFxuICAgIEFjY2Vzc2VkOiAxMnRoIE5vdmVtYmVyIDIwMDlcbiAgKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIC8qIFBsYWNlIHBhcmFtZXRlcnMgaW4gc3RhdGljIHN0b3JhZ2UgZm9yIGNvbW1vbiB1c2VcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICB0aGlzLnNpbl9wMTQgPSBNYXRoLnNpbih0aGlzLmxhdDApO1xuICB0aGlzLmNvc19wMTQgPSBNYXRoLmNvcyh0aGlzLmxhdDApO1xuICAvLyBBcHByb3hpbWF0aW9uIGZvciBwcm9qZWN0aW5nIHBvaW50cyB0byB0aGUgaG9yaXpvbiAoaW5maW5pdHkpXG4gIHRoaXMuaW5maW5pdHlfZGlzdCA9IDEwMDAgKiB0aGlzLmE7XG4gIHRoaXMucmMgPSAxO1xufTtcblxuXG4vKiBHbm9tb25pYyBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgc2lucGhpLCBjb3NwaGk7IC8qIHNpbiBhbmQgY29zIHZhbHVlICAgICAgICAqL1xuICB2YXIgZGxvbjsgLyogZGVsdGEgbG9uZ2l0dWRlIHZhbHVlICAgICAgKi9cbiAgdmFyIGNvc2xvbjsgLyogY29zIG9mIGxvbmdpdHVkZSAgICAgICAgKi9cbiAgdmFyIGtzcDsgLyogc2NhbGUgZmFjdG9yICAgICAgICAgICovXG4gIHZhciBnO1xuICB2YXIgeCwgeTtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG5cbiAgc2lucGhpID0gTWF0aC5zaW4obGF0KTtcbiAgY29zcGhpID0gTWF0aC5jb3MobGF0KTtcblxuICBjb3Nsb24gPSBNYXRoLmNvcyhkbG9uKTtcbiAgZyA9IHRoaXMuc2luX3AxNCAqIHNpbnBoaSArIHRoaXMuY29zX3AxNCAqIGNvc3BoaSAqIGNvc2xvbjtcbiAga3NwID0gMTtcbiAgaWYgKChnID4gMCkgfHwgKE1hdGguYWJzKGcpIDw9IEVQU0xOKSkge1xuICAgIHggPSB0aGlzLngwICsgdGhpcy5hICoga3NwICogY29zcGhpICogTWF0aC5zaW4oZGxvbikgLyBnO1xuICAgIHkgPSB0aGlzLnkwICsgdGhpcy5hICoga3NwICogKHRoaXMuY29zX3AxNCAqIHNpbnBoaSAtIHRoaXMuc2luX3AxNCAqIGNvc3BoaSAqIGNvc2xvbikgLyBnO1xuICB9XG4gIGVsc2Uge1xuXG4gICAgLy8gUG9pbnQgaXMgaW4gdGhlIG9wcG9zaW5nIGhlbWlzcGhlcmUgYW5kIGlzIHVucHJvamVjdGFibGVcbiAgICAvLyBXZSBzdGlsbCBuZWVkIHRvIHJldHVybiBhIHJlYXNvbmFibGUgcG9pbnQsIHNvIHdlIHByb2plY3QgXG4gICAgLy8gdG8gaW5maW5pdHksIG9uIGEgYmVhcmluZyBcbiAgICAvLyBlcXVpdmFsZW50IHRvIHRoZSBub3J0aGVybiBoZW1pc3BoZXJlIGVxdWl2YWxlbnRcbiAgICAvLyBUaGlzIGlzIGEgcmVhc29uYWJsZSBhcHByb3hpbWF0aW9uIGZvciBzaG9ydCBzaGFwZXMgYW5kIGxpbmVzIHRoYXQgXG4gICAgLy8gc3RyYWRkbGUgdGhlIGhvcml6b24uXG5cbiAgICB4ID0gdGhpcy54MCArIHRoaXMuaW5maW5pdHlfZGlzdCAqIGNvc3BoaSAqIE1hdGguc2luKGRsb24pO1xuICAgIHkgPSB0aGlzLnkwICsgdGhpcy5pbmZpbml0eV9kaXN0ICogKHRoaXMuY29zX3AxNCAqIHNpbnBoaSAtIHRoaXMuc2luX3AxNCAqIGNvc3BoaSAqIGNvc2xvbik7XG5cbiAgfVxuICBwLnggPSB4O1xuICBwLnkgPSB5O1xuICByZXR1cm4gcDtcbn07XG5cblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgcmg7IC8qIFJobyAqL1xuICB2YXIgc2luYywgY29zYztcbiAgdmFyIGM7XG4gIHZhciBsb24sIGxhdDtcblxuICAvKiBJbnZlcnNlIGVxdWF0aW9uc1xuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBwLnggPSAocC54IC0gdGhpcy54MCkgLyB0aGlzLmE7XG4gIHAueSA9IChwLnkgLSB0aGlzLnkwKSAvIHRoaXMuYTtcblxuICBwLnggLz0gdGhpcy5rMDtcbiAgcC55IC89IHRoaXMuazA7XG5cbiAgaWYgKChyaCA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpKSkge1xuICAgIGMgPSBNYXRoLmF0YW4yKHJoLCB0aGlzLnJjKTtcbiAgICBzaW5jID0gTWF0aC5zaW4oYyk7XG4gICAgY29zYyA9IE1hdGguY29zKGMpO1xuXG4gICAgbGF0ID0gYXNpbnooY29zYyAqIHRoaXMuc2luX3AxNCArIChwLnkgKiBzaW5jICogdGhpcy5jb3NfcDE0KSAvIHJoKTtcbiAgICBsb24gPSBNYXRoLmF0YW4yKHAueCAqIHNpbmMsIHJoICogdGhpcy5jb3NfcDE0ICogY29zYyAtIHAueSAqIHRoaXMuc2luX3AxNCAqIHNpbmMpO1xuICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIGxvbik7XG4gIH1cbiAgZWxzZSB7XG4gICAgbGF0ID0gdGhpcy5waGljMDtcbiAgICBsb24gPSAwO1xuICB9XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJnbm9tXCJdO1xuIiwidmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYSA9IDYzNzczOTcuMTU1O1xuICB0aGlzLmVzID0gMC4wMDY2NzQzNzIyMzA2MTQ7XG4gIHRoaXMuZSA9IE1hdGguc3FydCh0aGlzLmVzKTtcbiAgaWYgKCF0aGlzLmxhdDApIHtcbiAgICB0aGlzLmxhdDAgPSAwLjg2MzkzNzk3OTczNzE5MztcbiAgfVxuICBpZiAoIXRoaXMubG9uZzApIHtcbiAgICB0aGlzLmxvbmcwID0gMC43NDE3NjQ5MzIwOTc1OTAxIC0gMC4zMDgzNDE1MDExODU2NjU7XG4gIH1cbiAgLyogaWYgc2NhbGUgbm90IHNldCBkZWZhdWx0IHRvIDAuOTk5OSAqL1xuICBpZiAoIXRoaXMuazApIHtcbiAgICB0aGlzLmswID0gMC45OTk5O1xuICB9XG4gIHRoaXMuczQ1ID0gMC43ODUzOTgxNjMzOTc0NDg7IC8qIDQ1ICovXG4gIHRoaXMuczkwID0gMiAqIHRoaXMuczQ1O1xuICB0aGlzLmZpMCA9IHRoaXMubGF0MDtcbiAgdGhpcy5lMiA9IHRoaXMuZXM7XG4gIHRoaXMuZSA9IE1hdGguc3FydCh0aGlzLmUyKTtcbiAgdGhpcy5hbGZhID0gTWF0aC5zcXJ0KDEgKyAodGhpcy5lMiAqIE1hdGgucG93KE1hdGguY29zKHRoaXMuZmkwKSwgNCkpIC8gKDEgLSB0aGlzLmUyKSk7XG4gIHRoaXMudXEgPSAxLjA0MjE2ODU2MzgwNDc0O1xuICB0aGlzLnUwID0gTWF0aC5hc2luKE1hdGguc2luKHRoaXMuZmkwKSAvIHRoaXMuYWxmYSk7XG4gIHRoaXMuZyA9IE1hdGgucG93KCgxICsgdGhpcy5lICogTWF0aC5zaW4odGhpcy5maTApKSAvICgxIC0gdGhpcy5lICogTWF0aC5zaW4odGhpcy5maTApKSwgdGhpcy5hbGZhICogdGhpcy5lIC8gMik7XG4gIHRoaXMuayA9IE1hdGgudGFuKHRoaXMudTAgLyAyICsgdGhpcy5zNDUpIC8gTWF0aC5wb3coTWF0aC50YW4odGhpcy5maTAgLyAyICsgdGhpcy5zNDUpLCB0aGlzLmFsZmEpICogdGhpcy5nO1xuICB0aGlzLmsxID0gdGhpcy5rMDtcbiAgdGhpcy5uMCA9IHRoaXMuYSAqIE1hdGguc3FydCgxIC0gdGhpcy5lMikgLyAoMSAtIHRoaXMuZTIgKiBNYXRoLnBvdyhNYXRoLnNpbih0aGlzLmZpMCksIDIpKTtcbiAgdGhpcy5zMCA9IDEuMzcwMDgzNDYyODE1NTU7XG4gIHRoaXMubiA9IE1hdGguc2luKHRoaXMuczApO1xuICB0aGlzLnJvMCA9IHRoaXMuazEgKiB0aGlzLm4wIC8gTWF0aC50YW4odGhpcy5zMCk7XG4gIHRoaXMuYWQgPSB0aGlzLnM5MCAtIHRoaXMudXE7XG59O1xuXG4vKiBlbGxpcHNvaWQgKi9cbi8qIGNhbGN1bGF0ZSB4eSBmcm9tIGxhdC9sb24gKi9cbi8qIENvbnN0YW50cywgaWRlbnRpY2FsIHRvIGludmVyc2UgdHJhbnNmb3JtIGZ1bmN0aW9uICovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBnZmksIHUsIGRlbHRhdiwgcywgZCwgZXBzLCBybztcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIGRlbHRhX2xvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIC8qIFRyYW5zZm9ybWF0aW9uICovXG4gIGdmaSA9IE1hdGgucG93KCgoMSArIHRoaXMuZSAqIE1hdGguc2luKGxhdCkpIC8gKDEgLSB0aGlzLmUgKiBNYXRoLnNpbihsYXQpKSksICh0aGlzLmFsZmEgKiB0aGlzLmUgLyAyKSk7XG4gIHUgPSAyICogKE1hdGguYXRhbih0aGlzLmsgKiBNYXRoLnBvdyhNYXRoLnRhbihsYXQgLyAyICsgdGhpcy5zNDUpLCB0aGlzLmFsZmEpIC8gZ2ZpKSAtIHRoaXMuczQ1KTtcbiAgZGVsdGF2ID0gLWRlbHRhX2xvbiAqIHRoaXMuYWxmYTtcbiAgcyA9IE1hdGguYXNpbihNYXRoLmNvcyh0aGlzLmFkKSAqIE1hdGguc2luKHUpICsgTWF0aC5zaW4odGhpcy5hZCkgKiBNYXRoLmNvcyh1KSAqIE1hdGguY29zKGRlbHRhdikpO1xuICBkID0gTWF0aC5hc2luKE1hdGguY29zKHUpICogTWF0aC5zaW4oZGVsdGF2KSAvIE1hdGguY29zKHMpKTtcbiAgZXBzID0gdGhpcy5uICogZDtcbiAgcm8gPSB0aGlzLnJvMCAqIE1hdGgucG93KE1hdGgudGFuKHRoaXMuczAgLyAyICsgdGhpcy5zNDUpLCB0aGlzLm4pIC8gTWF0aC5wb3coTWF0aC50YW4ocyAvIDIgKyB0aGlzLnM0NSksIHRoaXMubik7XG4gIHAueSA9IHJvICogTWF0aC5jb3MoZXBzKSAvIDE7XG4gIHAueCA9IHJvICogTWF0aC5zaW4oZXBzKSAvIDE7XG5cbiAgaWYgKCF0aGlzLmN6ZWNoKSB7XG4gICAgcC55ICo9IC0xO1xuICAgIHAueCAqPSAtMTtcbiAgfVxuICByZXR1cm4gKHApO1xufTtcblxuLyogY2FsY3VsYXRlIGxhdC9sb24gZnJvbSB4eSAqL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgdSwgZGVsdGF2LCBzLCBkLCBlcHMsIHJvLCBmaTE7XG4gIHZhciBvaztcblxuICAvKiBUcmFuc2Zvcm1hdGlvbiAqL1xuICAvKiByZXZlcnQgeSwgeCovXG4gIHZhciB0bXAgPSBwLng7XG4gIHAueCA9IHAueTtcbiAgcC55ID0gdG1wO1xuICBpZiAoIXRoaXMuY3plY2gpIHtcbiAgICBwLnkgKj0gLTE7XG4gICAgcC54ICo9IC0xO1xuICB9XG4gIHJvID0gTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gIGVwcyA9IE1hdGguYXRhbjIocC55LCBwLngpO1xuICBkID0gZXBzIC8gTWF0aC5zaW4odGhpcy5zMCk7XG4gIHMgPSAyICogKE1hdGguYXRhbihNYXRoLnBvdyh0aGlzLnJvMCAvIHJvLCAxIC8gdGhpcy5uKSAqIE1hdGgudGFuKHRoaXMuczAgLyAyICsgdGhpcy5zNDUpKSAtIHRoaXMuczQ1KTtcbiAgdSA9IE1hdGguYXNpbihNYXRoLmNvcyh0aGlzLmFkKSAqIE1hdGguc2luKHMpIC0gTWF0aC5zaW4odGhpcy5hZCkgKiBNYXRoLmNvcyhzKSAqIE1hdGguY29zKGQpKTtcbiAgZGVsdGF2ID0gTWF0aC5hc2luKE1hdGguY29zKHMpICogTWF0aC5zaW4oZCkgLyBNYXRoLmNvcyh1KSk7XG4gIHAueCA9IHRoaXMubG9uZzAgLSBkZWx0YXYgLyB0aGlzLmFsZmE7XG4gIGZpMSA9IHU7XG4gIG9rID0gMDtcbiAgdmFyIGl0ZXIgPSAwO1xuICBkbyB7XG4gICAgcC55ID0gMiAqIChNYXRoLmF0YW4oTWF0aC5wb3codGhpcy5rLCAtIDEgLyB0aGlzLmFsZmEpICogTWF0aC5wb3coTWF0aC50YW4odSAvIDIgKyB0aGlzLnM0NSksIDEgLyB0aGlzLmFsZmEpICogTWF0aC5wb3coKDEgKyB0aGlzLmUgKiBNYXRoLnNpbihmaTEpKSAvICgxIC0gdGhpcy5lICogTWF0aC5zaW4oZmkxKSksIHRoaXMuZSAvIDIpKSAtIHRoaXMuczQ1KTtcbiAgICBpZiAoTWF0aC5hYnMoZmkxIC0gcC55KSA8IDAuMDAwMDAwMDAwMSkge1xuICAgICAgb2sgPSAxO1xuICAgIH1cbiAgICBmaTEgPSBwLnk7XG4gICAgaXRlciArPSAxO1xuICB9IHdoaWxlIChvayA9PT0gMCAmJiBpdGVyIDwgMTUpO1xuICBpZiAoaXRlciA+PSAxNSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIChwKTtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiS3JvdmFrXCIsIFwia3JvdmFrXCJdO1xuIiwidmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRk9SVFBJID0gTWF0aC5QSS80O1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBxc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9xc2ZueicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xuLypcbiAgcmVmZXJlbmNlXG4gICAgXCJOZXcgRXF1YWwtQXJlYSBNYXAgUHJvamVjdGlvbnMgZm9yIE5vbmNpcmN1bGFyIFJlZ2lvbnNcIiwgSm9obiBQLiBTbnlkZXIsXG4gICAgVGhlIEFtZXJpY2FuIENhcnRvZ3JhcGhlciwgVm9sIDE1LCBOby4gNCwgT2N0b2JlciAxOTg4LCBwcC4gMzQxLTM1NS5cbiAgKi9cblxuZXhwb3J0cy5TX1BPTEUgPSAxO1xuZXhwb3J0cy5OX1BPTEUgPSAyO1xuZXhwb3J0cy5FUVVJVCA9IDM7XG5leHBvcnRzLk9CTElRID0gNDtcblxuXG4vKiBJbml0aWFsaXplIHRoZSBMYW1iZXJ0IEF6aW11dGhhbCBFcXVhbCBBcmVhIHByb2plY3Rpb25cbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IE1hdGguYWJzKHRoaXMubGF0MCk7XG4gIGlmIChNYXRoLmFicyh0IC0gSEFMRl9QSSkgPCBFUFNMTikge1xuICAgIHRoaXMubW9kZSA9IHRoaXMubGF0MCA8IDAgPyB0aGlzLlNfUE9MRSA6IHRoaXMuTl9QT0xFO1xuICB9XG4gIGVsc2UgaWYgKE1hdGguYWJzKHQpIDwgRVBTTE4pIHtcbiAgICB0aGlzLm1vZGUgPSB0aGlzLkVRVUlUO1xuICB9XG4gIGVsc2Uge1xuICAgIHRoaXMubW9kZSA9IHRoaXMuT0JMSVE7XG4gIH1cbiAgaWYgKHRoaXMuZXMgPiAwKSB7XG4gICAgdmFyIHNpbnBoaTtcblxuICAgIHRoaXMucXAgPSBxc2Zueih0aGlzLmUsIDEpO1xuICAgIHRoaXMubW1mID0gMC41IC8gKDEgLSB0aGlzLmVzKTtcbiAgICB0aGlzLmFwYSA9IHRoaXMuYXV0aHNldCh0aGlzLmVzKTtcbiAgICBzd2l0Y2ggKHRoaXMubW9kZSkge1xuICAgIGNhc2UgdGhpcy5OX1BPTEU6XG4gICAgICB0aGlzLmRkID0gMTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5TX1BPTEU6XG4gICAgICB0aGlzLmRkID0gMTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5FUVVJVDpcbiAgICAgIHRoaXMucnEgPSBNYXRoLnNxcnQoMC41ICogdGhpcy5xcCk7XG4gICAgICB0aGlzLmRkID0gMSAvIHRoaXMucnE7XG4gICAgICB0aGlzLnhtZiA9IDE7XG4gICAgICB0aGlzLnltZiA9IDAuNSAqIHRoaXMucXA7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuT0JMSVE6XG4gICAgICB0aGlzLnJxID0gTWF0aC5zcXJ0KDAuNSAqIHRoaXMucXApO1xuICAgICAgc2lucGhpID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgICAgIHRoaXMuc2luYjEgPSBxc2Zueih0aGlzLmUsIHNpbnBoaSkgLyB0aGlzLnFwO1xuICAgICAgdGhpcy5jb3NiMSA9IE1hdGguc3FydCgxIC0gdGhpcy5zaW5iMSAqIHRoaXMuc2luYjEpO1xuICAgICAgdGhpcy5kZCA9IE1hdGguY29zKHRoaXMubGF0MCkgLyAoTWF0aC5zcXJ0KDEgLSB0aGlzLmVzICogc2lucGhpICogc2lucGhpKSAqIHRoaXMucnEgKiB0aGlzLmNvc2IxKTtcbiAgICAgIHRoaXMueW1mID0gKHRoaXMueG1mID0gdGhpcy5ycSkgLyB0aGlzLmRkO1xuICAgICAgdGhpcy54bWYgKj0gdGhpcy5kZDtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSB0aGlzLk9CTElRKSB7XG4gICAgICB0aGlzLnNpbnBoMCA9IE1hdGguc2luKHRoaXMubGF0MCk7XG4gICAgICB0aGlzLmNvc3BoMCA9IE1hdGguY29zKHRoaXMubGF0MCk7XG4gICAgfVxuICB9XG59O1xuXG4vKiBMYW1iZXJ0IEF6aW11dGhhbCBFcXVhbCBBcmVhIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG5cbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdmFyIHgsIHksIGNvc2xhbSwgc2lubGFtLCBzaW5waGksIHEsIHNpbmIsIGNvc2IsIGIsIGNvc3BoaTtcbiAgdmFyIGxhbSA9IHAueDtcbiAgdmFyIHBoaSA9IHAueTtcblxuICBsYW0gPSBhZGp1c3RfbG9uKGxhbSAtIHRoaXMubG9uZzApO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHNpbnBoaSA9IE1hdGguc2luKHBoaSk7XG4gICAgY29zcGhpID0gTWF0aC5jb3MocGhpKTtcbiAgICBjb3NsYW0gPSBNYXRoLmNvcyhsYW0pO1xuICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuT0JMSVEgfHwgdGhpcy5tb2RlID09PSB0aGlzLkVRVUlUKSB7XG4gICAgICB5ID0gKHRoaXMubW9kZSA9PT0gdGhpcy5FUVVJVCkgPyAxICsgY29zcGhpICogY29zbGFtIDogMSArIHRoaXMuc2lucGgwICogc2lucGhpICsgdGhpcy5jb3NwaDAgKiBjb3NwaGkgKiBjb3NsYW07XG4gICAgICBpZiAoeSA8PSBFUFNMTikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHkgPSBNYXRoLnNxcnQoMiAvIHkpO1xuICAgICAgeCA9IHkgKiBjb3NwaGkgKiBNYXRoLnNpbihsYW0pO1xuICAgICAgeSAqPSAodGhpcy5tb2RlID09PSB0aGlzLkVRVUlUKSA/IHNpbnBoaSA6IHRoaXMuY29zcGgwICogc2lucGhpIC0gdGhpcy5zaW5waDAgKiBjb3NwaGkgKiBjb3NsYW07XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5OX1BPTEUgfHwgdGhpcy5tb2RlID09PSB0aGlzLlNfUE9MRSkge1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5OX1BPTEUpIHtcbiAgICAgICAgY29zbGFtID0gLWNvc2xhbTtcbiAgICAgIH1cbiAgICAgIGlmIChNYXRoLmFicyhwaGkgKyB0aGlzLnBoaTApIDwgRVBTTE4pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB5ID0gRk9SVFBJIC0gcGhpICogMC41O1xuICAgICAgeSA9IDIgKiAoKHRoaXMubW9kZSA9PT0gdGhpcy5TX1BPTEUpID8gTWF0aC5jb3MoeSkgOiBNYXRoLnNpbih5KSk7XG4gICAgICB4ID0geSAqIE1hdGguc2luKGxhbSk7XG4gICAgICB5ICo9IGNvc2xhbTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgc2luYiA9IDA7XG4gICAgY29zYiA9IDA7XG4gICAgYiA9IDA7XG4gICAgY29zbGFtID0gTWF0aC5jb3MobGFtKTtcbiAgICBzaW5sYW0gPSBNYXRoLnNpbihsYW0pO1xuICAgIHNpbnBoaSA9IE1hdGguc2luKHBoaSk7XG4gICAgcSA9IHFzZm56KHRoaXMuZSwgc2lucGhpKTtcbiAgICBpZiAodGhpcy5tb2RlID09PSB0aGlzLk9CTElRIHx8IHRoaXMubW9kZSA9PT0gdGhpcy5FUVVJVCkge1xuICAgICAgc2luYiA9IHEgLyB0aGlzLnFwO1xuICAgICAgY29zYiA9IE1hdGguc3FydCgxIC0gc2luYiAqIHNpbmIpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHRoaXMubW9kZSkge1xuICAgIGNhc2UgdGhpcy5PQkxJUTpcbiAgICAgIGIgPSAxICsgdGhpcy5zaW5iMSAqIHNpbmIgKyB0aGlzLmNvc2IxICogY29zYiAqIGNvc2xhbTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5FUVVJVDpcbiAgICAgIGIgPSAxICsgY29zYiAqIGNvc2xhbTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5OX1BPTEU6XG4gICAgICBiID0gSEFMRl9QSSArIHBoaTtcbiAgICAgIHEgPSB0aGlzLnFwIC0gcTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5TX1BPTEU6XG4gICAgICBiID0gcGhpIC0gSEFMRl9QSTtcbiAgICAgIHEgPSB0aGlzLnFwICsgcTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoTWF0aC5hYnMoYikgPCBFUFNMTikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHN3aXRjaCAodGhpcy5tb2RlKSB7XG4gICAgY2FzZSB0aGlzLk9CTElROlxuICAgIGNhc2UgdGhpcy5FUVVJVDpcbiAgICAgIGIgPSBNYXRoLnNxcnQoMiAvIGIpO1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSkge1xuICAgICAgICB5ID0gdGhpcy55bWYgKiBiICogKHRoaXMuY29zYjEgKiBzaW5iIC0gdGhpcy5zaW5iMSAqIGNvc2IgKiBjb3NsYW0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHkgPSAoYiA9IE1hdGguc3FydCgyIC8gKDEgKyBjb3NiICogY29zbGFtKSkpICogc2luYiAqIHRoaXMueW1mO1xuICAgICAgfVxuICAgICAgeCA9IHRoaXMueG1mICogYiAqIGNvc2IgKiBzaW5sYW07XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuTl9QT0xFOlxuICAgIGNhc2UgdGhpcy5TX1BPTEU6XG4gICAgICBpZiAocSA+PSAwKSB7XG4gICAgICAgIHggPSAoYiA9IE1hdGguc3FydChxKSkgKiBzaW5sYW07XG4gICAgICAgIHkgPSBjb3NsYW0gKiAoKHRoaXMubW9kZSA9PT0gdGhpcy5TX1BPTEUpID8gYiA6IC1iKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB4ID0geSA9IDA7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwLnggPSB0aGlzLmEgKiB4ICsgdGhpcy54MDtcbiAgcC55ID0gdGhpcy5hICogeSArIHRoaXMueTA7XG4gIHJldHVybiBwO1xufTtcblxuLyogSW52ZXJzZSBlcXVhdGlvbnNcbiAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICBwLnggLT0gdGhpcy54MDtcbiAgcC55IC09IHRoaXMueTA7XG4gIHZhciB4ID0gcC54IC8gdGhpcy5hO1xuICB2YXIgeSA9IHAueSAvIHRoaXMuYTtcbiAgdmFyIGxhbSwgcGhpLCBjQ2UsIHNDZSwgcSwgcmhvLCBhYjtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICB2YXIgY29zeiA9IDAsXG4gICAgICByaCwgc2lueiA9IDA7XG5cbiAgICByaCA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICBwaGkgPSByaCAqIDAuNTtcbiAgICBpZiAocGhpID4gMSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHBoaSA9IDIgKiBNYXRoLmFzaW4ocGhpKTtcbiAgICBpZiAodGhpcy5tb2RlID09PSB0aGlzLk9CTElRIHx8IHRoaXMubW9kZSA9PT0gdGhpcy5FUVVJVCkge1xuICAgICAgc2lueiA9IE1hdGguc2luKHBoaSk7XG4gICAgICBjb3N6ID0gTWF0aC5jb3MocGhpKTtcbiAgICB9XG4gICAgc3dpdGNoICh0aGlzLm1vZGUpIHtcbiAgICBjYXNlIHRoaXMuRVFVSVQ6XG4gICAgICBwaGkgPSAoTWF0aC5hYnMocmgpIDw9IEVQU0xOKSA/IDAgOiBNYXRoLmFzaW4oeSAqIHNpbnogLyByaCk7XG4gICAgICB4ICo9IHNpbno7XG4gICAgICB5ID0gY29zeiAqIHJoO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLk9CTElROlxuICAgICAgcGhpID0gKE1hdGguYWJzKHJoKSA8PSBFUFNMTikgPyB0aGlzLnBoaTAgOiBNYXRoLmFzaW4oY29zeiAqIHRoaXMuc2lucGgwICsgeSAqIHNpbnogKiB0aGlzLmNvc3BoMCAvIHJoKTtcbiAgICAgIHggKj0gc2lueiAqIHRoaXMuY29zcGgwO1xuICAgICAgeSA9IChjb3N6IC0gTWF0aC5zaW4ocGhpKSAqIHRoaXMuc2lucGgwKSAqIHJoO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLk5fUE9MRTpcbiAgICAgIHkgPSAteTtcbiAgICAgIHBoaSA9IEhBTEZfUEkgLSBwaGk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuU19QT0xFOlxuICAgICAgcGhpIC09IEhBTEZfUEk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgbGFtID0gKHkgPT09IDAgJiYgKHRoaXMubW9kZSA9PT0gdGhpcy5FUVVJVCB8fCB0aGlzLm1vZGUgPT09IHRoaXMuT0JMSVEpKSA/IDAgOiBNYXRoLmF0YW4yKHgsIHkpO1xuICB9XG4gIGVsc2Uge1xuICAgIGFiID0gMDtcbiAgICBpZiAodGhpcy5tb2RlID09PSB0aGlzLk9CTElRIHx8IHRoaXMubW9kZSA9PT0gdGhpcy5FUVVJVCkge1xuICAgICAgeCAvPSB0aGlzLmRkO1xuICAgICAgeSAqPSB0aGlzLmRkO1xuICAgICAgcmhvID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xuICAgICAgaWYgKHJobyA8IEVQU0xOKSB7XG4gICAgICAgIHAueCA9IDA7XG4gICAgICAgIHAueSA9IHRoaXMucGhpMDtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgICB9XG4gICAgICBzQ2UgPSAyICogTWF0aC5hc2luKDAuNSAqIHJobyAvIHRoaXMucnEpO1xuICAgICAgY0NlID0gTWF0aC5jb3Moc0NlKTtcbiAgICAgIHggKj0gKHNDZSA9IE1hdGguc2luKHNDZSkpO1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSkge1xuICAgICAgICBhYiA9IGNDZSAqIHRoaXMuc2luYjEgKyB5ICogc0NlICogdGhpcy5jb3NiMSAvIHJobztcbiAgICAgICAgcSA9IHRoaXMucXAgKiBhYjtcbiAgICAgICAgeSA9IHJobyAqIHRoaXMuY29zYjEgKiBjQ2UgLSB5ICogdGhpcy5zaW5iMSAqIHNDZTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhYiA9IHkgKiBzQ2UgLyByaG87XG4gICAgICAgIHEgPSB0aGlzLnFwICogYWI7XG4gICAgICAgIHkgPSByaG8gKiBjQ2U7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5OX1BPTEUgfHwgdGhpcy5tb2RlID09PSB0aGlzLlNfUE9MRSkge1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5OX1BPTEUpIHtcbiAgICAgICAgeSA9IC15O1xuICAgICAgfVxuICAgICAgcSA9ICh4ICogeCArIHkgKiB5KTtcbiAgICAgIGlmICghcSkge1xuICAgICAgICBwLnggPSAwO1xuICAgICAgICBwLnkgPSB0aGlzLnBoaTA7XG4gICAgICAgIHJldHVybiBwO1xuICAgICAgfVxuICAgICAgYWIgPSAxIC0gcSAvIHRoaXMucXA7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSB0aGlzLlNfUE9MRSkge1xuICAgICAgICBhYiA9IC1hYjtcbiAgICAgIH1cbiAgICB9XG4gICAgbGFtID0gTWF0aC5hdGFuMih4LCB5KTtcbiAgICBwaGkgPSB0aGlzLmF1dGhsYXQoTWF0aC5hc2luKGFiKSwgdGhpcy5hcGEpO1xuICB9XG5cblxuICBwLnggPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBsYW0pO1xuICBwLnkgPSBwaGk7XG4gIHJldHVybiBwO1xufTtcblxuLyogZGV0ZXJtaW5lIGxhdGl0dWRlIGZyb20gYXV0aGFsaWMgbGF0aXR1ZGUgKi9cbmV4cG9ydHMuUDAwID0gMC4zMzMzMzMzMzMzMzMzMzMzMzMzMztcbmV4cG9ydHMuUDAxID0gMC4xNzIyMjIyMjIyMjIyMjIyMjIyMjtcbmV4cG9ydHMuUDAyID0gMC4xMDI1NzkzNjUwNzkzNjUwNzkzNjtcbmV4cG9ydHMuUDEwID0gMC4wNjM4ODg4ODg4ODg4ODg4ODg4ODtcbmV4cG9ydHMuUDExID0gMC4wNjY0MDIxMTY0MDIxMTY0MDIxMTtcbmV4cG9ydHMuUDIwID0gMC4wMTY0MTUwMTI5NDIxOTE1NDQ0MztcblxuZXhwb3J0cy5hdXRoc2V0ID0gZnVuY3Rpb24oZXMpIHtcbiAgdmFyIHQ7XG4gIHZhciBBUEEgPSBbXTtcbiAgQVBBWzBdID0gZXMgKiB0aGlzLlAwMDtcbiAgdCA9IGVzICogZXM7XG4gIEFQQVswXSArPSB0ICogdGhpcy5QMDE7XG4gIEFQQVsxXSA9IHQgKiB0aGlzLlAxMDtcbiAgdCAqPSBlcztcbiAgQVBBWzBdICs9IHQgKiB0aGlzLlAwMjtcbiAgQVBBWzFdICs9IHQgKiB0aGlzLlAxMTtcbiAgQVBBWzJdID0gdCAqIHRoaXMuUDIwO1xuICByZXR1cm4gQVBBO1xufTtcblxuZXhwb3J0cy5hdXRobGF0ID0gZnVuY3Rpb24oYmV0YSwgQVBBKSB7XG4gIHZhciB0ID0gYmV0YSArIGJldGE7XG4gIHJldHVybiAoYmV0YSArIEFQQVswXSAqIE1hdGguc2luKHQpICsgQVBBWzFdICogTWF0aC5zaW4odCArIHQpICsgQVBBWzJdICogTWF0aC5zaW4odCArIHQgKyB0KSk7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIkxhbWJlcnQgQXppbXV0aGFsIEVxdWFsIEFyZWFcIiwgXCJMYW1iZXJ0X0F6aW11dGhhbF9FcXVhbF9BcmVhXCIsIFwibGFlYVwiXTtcbiIsInZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgbXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vbXNmbnonKTtcbnZhciB0c2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi90c2ZueicpO1xudmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgc2lnbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zaWduJyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgcGhpMnogPSByZXF1aXJlKCcuLi9jb21tb24vcGhpMnonKTtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIC8vIGFycmF5IG9mOiAgcl9tYWoscl9taW4sbGF0MSxsYXQyLGNfbG9uLGNfbGF0LGZhbHNlX2Vhc3QsZmFsc2Vfbm9ydGhcbiAgLy9kb3VibGUgY19sYXQ7ICAgICAgICAgICAgICAgICAgIC8qIGNlbnRlciBsYXRpdHVkZSAgICAgICAgICAgICAgICAgICAgICAqL1xuICAvL2RvdWJsZSBjX2xvbjsgICAgICAgICAgICAgICAgICAgLyogY2VudGVyIGxvbmdpdHVkZSAgICAgICAgICAgICAgICAgICAgICovXG4gIC8vZG91YmxlIGxhdDE7ICAgICAgICAgICAgICAgICAgICAvKiBmaXJzdCBzdGFuZGFyZCBwYXJhbGxlbCAgICAgICAgICAgICAgKi9cbiAgLy9kb3VibGUgbGF0MjsgICAgICAgICAgICAgICAgICAgIC8qIHNlY29uZCBzdGFuZGFyZCBwYXJhbGxlbCAgICAgICAgICAgICAqL1xuICAvL2RvdWJsZSByX21hajsgICAgICAgICAgICAgICAgICAgLyogbWFqb3IgYXhpcyAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gIC8vZG91YmxlIHJfbWluOyAgICAgICAgICAgICAgICAgICAvKiBtaW5vciBheGlzICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgLy9kb3VibGUgZmFsc2VfZWFzdDsgICAgICAgICAgICAgIC8qIHggb2Zmc2V0IGluIG1ldGVycyAgICAgICAgICAgICAgICAgICAqL1xuICAvL2RvdWJsZSBmYWxzZV9ub3J0aDsgICAgICAgICAgICAgLyogeSBvZmZzZXQgaW4gbWV0ZXJzICAgICAgICAgICAgICAgICAgICovXG5cbiAgaWYgKCF0aGlzLmxhdDIpIHtcbiAgICB0aGlzLmxhdDIgPSB0aGlzLmxhdDE7XG4gIH0gLy9pZiBsYXQyIGlzIG5vdCBkZWZpbmVkXG4gIGlmICghdGhpcy5rMCkge1xuICAgIHRoaXMuazAgPSAxO1xuICB9XG4gIHRoaXMueDAgPSB0aGlzLngwIHx8IDA7XG4gIHRoaXMueTAgPSB0aGlzLnkwIHx8IDA7XG4gIC8vIFN0YW5kYXJkIFBhcmFsbGVscyBjYW5ub3QgYmUgZXF1YWwgYW5kIG9uIG9wcG9zaXRlIHNpZGVzIG9mIHRoZSBlcXVhdG9yXG4gIGlmIChNYXRoLmFicyh0aGlzLmxhdDEgKyB0aGlzLmxhdDIpIDwgRVBTTE4pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgdGVtcCA9IHRoaXMuYiAvIHRoaXMuYTtcbiAgdGhpcy5lID0gTWF0aC5zcXJ0KDEgLSB0ZW1wICogdGVtcCk7XG5cbiAgdmFyIHNpbjEgPSBNYXRoLnNpbih0aGlzLmxhdDEpO1xuICB2YXIgY29zMSA9IE1hdGguY29zKHRoaXMubGF0MSk7XG4gIHZhciBtczEgPSBtc2Zueih0aGlzLmUsIHNpbjEsIGNvczEpO1xuICB2YXIgdHMxID0gdHNmbnoodGhpcy5lLCB0aGlzLmxhdDEsIHNpbjEpO1xuXG4gIHZhciBzaW4yID0gTWF0aC5zaW4odGhpcy5sYXQyKTtcbiAgdmFyIGNvczIgPSBNYXRoLmNvcyh0aGlzLmxhdDIpO1xuICB2YXIgbXMyID0gbXNmbnoodGhpcy5lLCBzaW4yLCBjb3MyKTtcbiAgdmFyIHRzMiA9IHRzZm56KHRoaXMuZSwgdGhpcy5sYXQyLCBzaW4yKTtcblxuICB2YXIgdHMwID0gdHNmbnoodGhpcy5lLCB0aGlzLmxhdDAsIE1hdGguc2luKHRoaXMubGF0MCkpO1xuXG4gIGlmIChNYXRoLmFicyh0aGlzLmxhdDEgLSB0aGlzLmxhdDIpID4gRVBTTE4pIHtcbiAgICB0aGlzLm5zID0gTWF0aC5sb2cobXMxIC8gbXMyKSAvIE1hdGgubG9nKHRzMSAvIHRzMik7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5ucyA9IHNpbjE7XG4gIH1cbiAgaWYgKGlzTmFOKHRoaXMubnMpKSB7XG4gICAgdGhpcy5ucyA9IHNpbjE7XG4gIH1cbiAgdGhpcy5mMCA9IG1zMSAvICh0aGlzLm5zICogTWF0aC5wb3codHMxLCB0aGlzLm5zKSk7XG4gIHRoaXMucmggPSB0aGlzLmEgKiB0aGlzLmYwICogTWF0aC5wb3codHMwLCB0aGlzLm5zKTtcbiAgaWYgKCF0aGlzLnRpdGxlKSB7XG4gICAgdGhpcy50aXRsZSA9IFwiTGFtYmVydCBDb25mb3JtYWwgQ29uaWNcIjtcbiAgfVxufTtcblxuXG4vLyBMYW1iZXJ0IENvbmZvcm1hbCBjb25pYyBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG5cbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcblxuICAvLyBzaW5ndWxhciBjYXNlcyA6XG4gIGlmIChNYXRoLmFicygyICogTWF0aC5hYnMobGF0KSAtIE1hdGguUEkpIDw9IEVQU0xOKSB7XG4gICAgbGF0ID0gc2lnbihsYXQpICogKEhBTEZfUEkgLSAyICogRVBTTE4pO1xuICB9XG5cbiAgdmFyIGNvbiA9IE1hdGguYWJzKE1hdGguYWJzKGxhdCkgLSBIQUxGX1BJKTtcbiAgdmFyIHRzLCByaDE7XG4gIGlmIChjb24gPiBFUFNMTikge1xuICAgIHRzID0gdHNmbnoodGhpcy5lLCBsYXQsIE1hdGguc2luKGxhdCkpO1xuICAgIHJoMSA9IHRoaXMuYSAqIHRoaXMuZjAgKiBNYXRoLnBvdyh0cywgdGhpcy5ucyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgY29uID0gbGF0ICogdGhpcy5ucztcbiAgICBpZiAoY29uIDw9IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByaDEgPSAwO1xuICB9XG4gIHZhciB0aGV0YSA9IHRoaXMubnMgKiBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICBwLnggPSB0aGlzLmswICogKHJoMSAqIE1hdGguc2luKHRoZXRhKSkgKyB0aGlzLngwO1xuICBwLnkgPSB0aGlzLmswICogKHRoaXMucmggLSByaDEgKiBNYXRoLmNvcyh0aGV0YSkpICsgdGhpcy55MDtcblxuICByZXR1cm4gcDtcbn07XG5cbi8vIExhbWJlcnQgQ29uZm9ybWFsIENvbmljIGludmVyc2UgZXF1YXRpb25zLS1tYXBwaW5nIHgseSB0byBsYXQvbG9uZ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcblxuICB2YXIgcmgxLCBjb24sIHRzO1xuICB2YXIgbGF0LCBsb247XG4gIHZhciB4ID0gKHAueCAtIHRoaXMueDApIC8gdGhpcy5rMDtcbiAgdmFyIHkgPSAodGhpcy5yaCAtIChwLnkgLSB0aGlzLnkwKSAvIHRoaXMuazApO1xuICBpZiAodGhpcy5ucyA+IDApIHtcbiAgICByaDEgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG4gICAgY29uID0gMTtcbiAgfVxuICBlbHNlIHtcbiAgICByaDEgPSAtTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xuICAgIGNvbiA9IC0xO1xuICB9XG4gIHZhciB0aGV0YSA9IDA7XG4gIGlmIChyaDEgIT09IDApIHtcbiAgICB0aGV0YSA9IE1hdGguYXRhbjIoKGNvbiAqIHgpLCAoY29uICogeSkpO1xuICB9XG4gIGlmICgocmgxICE9PSAwKSB8fCAodGhpcy5ucyA+IDApKSB7XG4gICAgY29uID0gMSAvIHRoaXMubnM7XG4gICAgdHMgPSBNYXRoLnBvdygocmgxIC8gKHRoaXMuYSAqIHRoaXMuZjApKSwgY29uKTtcbiAgICBsYXQgPSBwaGkyeih0aGlzLmUsIHRzKTtcbiAgICBpZiAobGF0ID09PSAtOTk5OSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGxhdCA9IC1IQUxGX1BJO1xuICB9XG4gIGxvbiA9IGFkanVzdF9sb24odGhldGEgLyB0aGlzLm5zICsgdGhpcy5sb25nMCk7XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5uYW1lcyA9IFtcIkxhbWJlcnQgVGFuZ2VudGlhbCBDb25mb3JtYWwgQ29uaWMgUHJvamVjdGlvblwiLCBcIkxhbWJlcnRfQ29uZm9ybWFsX0NvbmljXCIsIFwiTGFtYmVydF9Db25mb3JtYWxfQ29uaWNfMlNQXCIsIFwibGNjXCJdO1xuIiwiZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIC8vbm8tb3AgZm9yIGxvbmdsYXRcbn07XG5cbmZ1bmN0aW9uIGlkZW50aXR5KHB0KSB7XG4gIHJldHVybiBwdDtcbn1cbmV4cG9ydHMuZm9yd2FyZCA9IGlkZW50aXR5O1xuZXhwb3J0cy5pbnZlcnNlID0gaWRlbnRpdHk7XG5leHBvcnRzLm5hbWVzID0gW1wibG9uZ2xhdFwiLCBcImlkZW50aXR5XCJdO1xuIiwidmFyIG1zZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL21zZm56Jyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgUjJEID0gNTcuMjk1Nzc5NTEzMDgyMzIwODg7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgRk9SVFBJID0gTWF0aC5QSS80O1xudmFyIHRzZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL3RzZm56Jyk7XG52YXIgcGhpMnogPSByZXF1aXJlKCcuLi9jb21tb24vcGhpMnonKTtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY29uID0gdGhpcy5iIC8gdGhpcy5hO1xuICB0aGlzLmVzID0gMSAtIGNvbiAqIGNvbjtcbiAgaWYoISgneDAnIGluIHRoaXMpKXtcbiAgICB0aGlzLngwID0gMDtcbiAgfVxuICBpZighKCd5MCcgaW4gdGhpcykpe1xuICAgIHRoaXMueTAgPSAwO1xuICB9XG4gIHRoaXMuZSA9IE1hdGguc3FydCh0aGlzLmVzKTtcbiAgaWYgKHRoaXMubGF0X3RzKSB7XG4gICAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgICB0aGlzLmswID0gTWF0aC5jb3ModGhpcy5sYXRfdHMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuazAgPSBtc2Zueih0aGlzLmUsIE1hdGguc2luKHRoaXMubGF0X3RzKSwgTWF0aC5jb3ModGhpcy5sYXRfdHMpKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLmswKSB7XG4gICAgICBpZiAodGhpcy5rKSB7XG4gICAgICAgIHRoaXMuazAgPSB0aGlzLms7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5rMCA9IDE7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKiBNZXJjYXRvciBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIC8vIGNvbnZlcnQgdG8gcmFkaWFuc1xuICBpZiAobGF0ICogUjJEID4gOTAgJiYgbGF0ICogUjJEIDwgLTkwICYmIGxvbiAqIFIyRCA+IDE4MCAmJiBsb24gKiBSMkQgPCAtMTgwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgeCwgeTtcbiAgaWYgKE1hdGguYWJzKE1hdGguYWJzKGxhdCkgLSBIQUxGX1BJKSA8PSBFUFNMTikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGVsc2Uge1xuICAgIGlmICh0aGlzLnNwaGVyZSkge1xuICAgICAgeCA9IHRoaXMueDAgKyB0aGlzLmEgKiB0aGlzLmswICogYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgICAgIHkgPSB0aGlzLnkwICsgdGhpcy5hICogdGhpcy5rMCAqIE1hdGgubG9nKE1hdGgudGFuKEZPUlRQSSArIDAuNSAqIGxhdCkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciBzaW5waGkgPSBNYXRoLnNpbihsYXQpO1xuICAgICAgdmFyIHRzID0gdHNmbnoodGhpcy5lLCBsYXQsIHNpbnBoaSk7XG4gICAgICB4ID0gdGhpcy54MCArIHRoaXMuYSAqIHRoaXMuazAgKiBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICAgICAgeSA9IHRoaXMueTAgLSB0aGlzLmEgKiB0aGlzLmswICogTWF0aC5sb2codHMpO1xuICAgIH1cbiAgICBwLnggPSB4O1xuICAgIHAueSA9IHk7XG4gICAgcmV0dXJuIHA7XG4gIH1cbn07XG5cblxuLyogTWVyY2F0b3IgaW52ZXJzZSBlcXVhdGlvbnMtLW1hcHBpbmcgeCx5IHRvIGxhdC9sb25nXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcblxuICB2YXIgeCA9IHAueCAtIHRoaXMueDA7XG4gIHZhciB5ID0gcC55IC0gdGhpcy55MDtcbiAgdmFyIGxvbiwgbGF0O1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGxhdCA9IEhBTEZfUEkgLSAyICogTWF0aC5hdGFuKE1hdGguZXhwKC15IC8gKHRoaXMuYSAqIHRoaXMuazApKSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIHRzID0gTWF0aC5leHAoLXkgLyAodGhpcy5hICogdGhpcy5rMCkpO1xuICAgIGxhdCA9IHBoaTJ6KHRoaXMuZSwgdHMpO1xuICAgIGlmIChsYXQgPT09IC05OTk5KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgeCAvICh0aGlzLmEgKiB0aGlzLmswKSk7XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5uYW1lcyA9IFtcIk1lcmNhdG9yXCIsIFwiUG9wdWxhciBWaXN1YWxpc2F0aW9uIFBzZXVkbyBNZXJjYXRvclwiLCBcIk1lcmNhdG9yXzFTUFwiLCBcIk1lcmNhdG9yX0F1eGlsaWFyeV9TcGhlcmVcIiwgXCJtZXJjXCJdO1xuIiwidmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xuLypcbiAgcmVmZXJlbmNlXG4gICAgXCJOZXcgRXF1YWwtQXJlYSBNYXAgUHJvamVjdGlvbnMgZm9yIE5vbmNpcmN1bGFyIFJlZ2lvbnNcIiwgSm9obiBQLiBTbnlkZXIsXG4gICAgVGhlIEFtZXJpY2FuIENhcnRvZ3JhcGhlciwgVm9sIDE1LCBOby4gNCwgT2N0b2JlciAxOTg4LCBwcC4gMzQxLTM1NS5cbiAgKi9cblxuXG4vKiBJbml0aWFsaXplIHRoZSBNaWxsZXIgQ3lsaW5kcmljYWwgcHJvamVjdGlvblxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAvL25vLW9wXG59O1xuXG5cbi8qIE1pbGxlciBDeWxpbmRyaWNhbCBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICAvKiBGb3J3YXJkIGVxdWF0aW9uc1xuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICB2YXIgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciB4ID0gdGhpcy54MCArIHRoaXMuYSAqIGRsb247XG4gIHZhciB5ID0gdGhpcy55MCArIHRoaXMuYSAqIE1hdGgubG9nKE1hdGgudGFuKChNYXRoLlBJIC8gNCkgKyAobGF0IC8gMi41KSkpICogMS4yNTtcblxuICBwLnggPSB4O1xuICBwLnkgPSB5O1xuICByZXR1cm4gcDtcbn07XG5cbi8qIE1pbGxlciBDeWxpbmRyaWNhbCBpbnZlcnNlIGVxdWF0aW9ucy0tbWFwcGluZyB4LHkgdG8gbGF0L2xvbmdcbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICBwLnggLT0gdGhpcy54MDtcbiAgcC55IC09IHRoaXMueTA7XG5cbiAgdmFyIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIHAueCAvIHRoaXMuYSk7XG4gIHZhciBsYXQgPSAyLjUgKiAoTWF0aC5hdGFuKE1hdGguZXhwKDAuOCAqIHAueSAvIHRoaXMuYSkpIC0gTWF0aC5QSSAvIDQpO1xuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiTWlsbGVyX0N5bGluZHJpY2FsXCIsIFwibWlsbFwiXTtcbiIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHt9O1xuXG4vKiBNb2xsd2VpZGUgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG5cbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcblxuICB2YXIgZGVsdGFfbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIHRoZXRhID0gbGF0O1xuICB2YXIgY29uID0gTWF0aC5QSSAqIE1hdGguc2luKGxhdCk7XG5cbiAgLyogSXRlcmF0ZSB1c2luZyB0aGUgTmV3dG9uLVJhcGhzb24gbWV0aG9kIHRvIGZpbmQgdGhldGFcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgZm9yICh2YXIgaSA9IDA7IHRydWU7IGkrKykge1xuICAgIHZhciBkZWx0YV90aGV0YSA9IC0odGhldGEgKyBNYXRoLnNpbih0aGV0YSkgLSBjb24pIC8gKDEgKyBNYXRoLmNvcyh0aGV0YSkpO1xuICAgIHRoZXRhICs9IGRlbHRhX3RoZXRhO1xuICAgIGlmIChNYXRoLmFicyhkZWx0YV90aGV0YSkgPCBFUFNMTikge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHRoZXRhIC89IDI7XG5cbiAgLyogSWYgdGhlIGxhdGl0dWRlIGlzIDkwIGRlZywgZm9yY2UgdGhlIHggY29vcmRpbmF0ZSB0byBiZSBcIjAgKyBmYWxzZSBlYXN0aW5nXCJcbiAgICAgICB0aGlzIGlzIGRvbmUgaGVyZSBiZWNhdXNlIG9mIHByZWNpc2lvbiBwcm9ibGVtcyB3aXRoIFwiY29zKHRoZXRhKVwiXG4gICAgICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBpZiAoTWF0aC5QSSAvIDIgLSBNYXRoLmFicyhsYXQpIDwgRVBTTE4pIHtcbiAgICBkZWx0YV9sb24gPSAwO1xuICB9XG4gIHZhciB4ID0gMC45MDAzMTYzMTYxNTggKiB0aGlzLmEgKiBkZWx0YV9sb24gKiBNYXRoLmNvcyh0aGV0YSkgKyB0aGlzLngwO1xuICB2YXIgeSA9IDEuNDE0MjEzNTYyMzczMSAqIHRoaXMuYSAqIE1hdGguc2luKHRoZXRhKSArIHRoaXMueTA7XG5cbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciB0aGV0YTtcbiAgdmFyIGFyZztcblxuICAvKiBJbnZlcnNlIGVxdWF0aW9uc1xuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBwLnggLT0gdGhpcy54MDtcbiAgcC55IC09IHRoaXMueTA7XG4gIGFyZyA9IHAueSAvICgxLjQxNDIxMzU2MjM3MzEgKiB0aGlzLmEpO1xuXG4gIC8qIEJlY2F1c2Ugb2YgZGl2aXNpb24gYnkgemVybyBwcm9ibGVtcywgJ2FyZycgY2FuIG5vdCBiZSAxLiAgVGhlcmVmb3JlXG4gICAgICAgYSBudW1iZXIgdmVyeSBjbG9zZSB0byBvbmUgaXMgdXNlZCBpbnN0ZWFkLlxuICAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBpZiAoTWF0aC5hYnMoYXJnKSA+IDAuOTk5OTk5OTk5OTk5KSB7XG4gICAgYXJnID0gMC45OTk5OTk5OTk5OTk7XG4gIH1cbiAgdGhldGEgPSBNYXRoLmFzaW4oYXJnKTtcbiAgdmFyIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIChwLnggLyAoMC45MDAzMTYzMTYxNTggKiB0aGlzLmEgKiBNYXRoLmNvcyh0aGV0YSkpKSk7XG4gIGlmIChsb24gPCAoLU1hdGguUEkpKSB7XG4gICAgbG9uID0gLU1hdGguUEk7XG4gIH1cbiAgaWYgKGxvbiA+IE1hdGguUEkpIHtcbiAgICBsb24gPSBNYXRoLlBJO1xuICB9XG4gIGFyZyA9ICgyICogdGhldGEgKyBNYXRoLnNpbigyICogdGhldGEpKSAvIE1hdGguUEk7XG4gIGlmIChNYXRoLmFicyhhcmcpID4gMSkge1xuICAgIGFyZyA9IDE7XG4gIH1cbiAgdmFyIGxhdCA9IE1hdGguYXNpbihhcmcpO1xuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiTW9sbHdlaWRlXCIsIFwibW9sbFwiXTtcbiIsInZhciBTRUNfVE9fUkFEID0gNC44NDgxMzY4MTEwOTUzNTk5MzU4OTkxNDEwMjM1N2UtNjtcbi8qXG4gIHJlZmVyZW5jZVxuICAgIERlcGFydG1lbnQgb2YgTGFuZCBhbmQgU3VydmV5IFRlY2huaWNhbCBDaXJjdWxhciAxOTczLzMyXG4gICAgICBodHRwOi8vd3d3LmxpbnouZ292dC5uei9kb2NzL21pc2NlbGxhbmVvdXMvbnotbWFwLWRlZmluaXRpb24ucGRmXG4gICAgT1NHIFRlY2huaWNhbCBSZXBvcnQgNC4xXG4gICAgICBodHRwOi8vd3d3LmxpbnouZ292dC5uei9kb2NzL21pc2NlbGxhbmVvdXMvbnptZy5wZGZcbiAgKi9cblxuLyoqXG4gKiBpdGVyYXRpb25zOiBOdW1iZXIgb2YgaXRlcmF0aW9ucyB0byByZWZpbmUgaW52ZXJzZSB0cmFuc2Zvcm0uXG4gKiAgICAgMCAtPiBrbSBhY2N1cmFjeVxuICogICAgIDEgLT4gbSBhY2N1cmFjeSAtLSBzdWl0YWJsZSBmb3IgbW9zdCBtYXBwaW5nIGFwcGxpY2F0aW9uc1xuICogICAgIDIgLT4gbW0gYWNjdXJhY3lcbiAqL1xuZXhwb3J0cy5pdGVyYXRpb25zID0gMTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuQSA9IFtdO1xuICB0aGlzLkFbMV0gPSAwLjYzOTkxNzUwNzM7XG4gIHRoaXMuQVsyXSA9IC0wLjEzNTg3OTc2MTM7XG4gIHRoaXMuQVszXSA9IDAuMDYzMjk0NDA5O1xuICB0aGlzLkFbNF0gPSAtMC4wMjUyNjg1MztcbiAgdGhpcy5BWzVdID0gMC4wMTE3ODc5O1xuICB0aGlzLkFbNl0gPSAtMC4wMDU1MTYxO1xuICB0aGlzLkFbN10gPSAwLjAwMjY5MDY7XG4gIHRoaXMuQVs4XSA9IC0wLjAwMTMzMztcbiAgdGhpcy5BWzldID0gMC4wMDA2NztcbiAgdGhpcy5BWzEwXSA9IC0wLjAwMDM0O1xuXG4gIHRoaXMuQl9yZSA9IFtdO1xuICB0aGlzLkJfaW0gPSBbXTtcbiAgdGhpcy5CX3JlWzFdID0gMC43NTU3ODUzMjI4O1xuICB0aGlzLkJfaW1bMV0gPSAwO1xuICB0aGlzLkJfcmVbMl0gPSAwLjI0OTIwNDY0NjtcbiAgdGhpcy5CX2ltWzJdID0gMC4wMDMzNzE1MDc7XG4gIHRoaXMuQl9yZVszXSA9IC0wLjAwMTU0MTczOTtcbiAgdGhpcy5CX2ltWzNdID0gMC4wNDEwNTg1NjA7XG4gIHRoaXMuQl9yZVs0XSA9IC0wLjEwMTYyOTA3O1xuICB0aGlzLkJfaW1bNF0gPSAwLjAxNzI3NjA5O1xuICB0aGlzLkJfcmVbNV0gPSAtMC4yNjYyMzQ4OTtcbiAgdGhpcy5CX2ltWzVdID0gLTAuMzYyNDkyMTg7XG4gIHRoaXMuQl9yZVs2XSA9IC0wLjY4NzA5ODM7XG4gIHRoaXMuQl9pbVs2XSA9IC0xLjE2NTE5Njc7XG5cbiAgdGhpcy5DX3JlID0gW107XG4gIHRoaXMuQ19pbSA9IFtdO1xuICB0aGlzLkNfcmVbMV0gPSAxLjMyMzEyNzA0Mzk7XG4gIHRoaXMuQ19pbVsxXSA9IDA7XG4gIHRoaXMuQ19yZVsyXSA9IC0wLjU3NzI0NTc4OTtcbiAgdGhpcy5DX2ltWzJdID0gLTAuMDA3ODA5NTk4O1xuICB0aGlzLkNfcmVbM10gPSAwLjUwODMwNzUxMztcbiAgdGhpcy5DX2ltWzNdID0gLTAuMTEyMjA4OTUyO1xuICB0aGlzLkNfcmVbNF0gPSAtMC4xNTA5NDc2MjtcbiAgdGhpcy5DX2ltWzRdID0gMC4xODIwMDYwMjtcbiAgdGhpcy5DX3JlWzVdID0gMS4wMTQxODE3OTtcbiAgdGhpcy5DX2ltWzVdID0gMS42NDQ5NzY5NjtcbiAgdGhpcy5DX3JlWzZdID0gMS45NjYwNTQ5O1xuICB0aGlzLkNfaW1bNl0gPSAyLjUxMjc2NDU7XG5cbiAgdGhpcy5EID0gW107XG4gIHRoaXMuRFsxXSA9IDEuNTYyNzAxNDI0MztcbiAgdGhpcy5EWzJdID0gMC41MTg1NDA2Mzk4O1xuICB0aGlzLkRbM10gPSAtMC4wMzMzMzA5ODtcbiAgdGhpcy5EWzRdID0gLTAuMTA1MjkwNjtcbiAgdGhpcy5EWzVdID0gLTAuMDM2ODU5NDtcbiAgdGhpcy5EWzZdID0gMC4wMDczMTc7XG4gIHRoaXMuRFs3XSA9IDAuMDEyMjA7XG4gIHRoaXMuRFs4XSA9IDAuMDAzOTQ7XG4gIHRoaXMuRFs5XSA9IC0wLjAwMTM7XG59O1xuXG4vKipcbiAgICBOZXcgWmVhbGFuZCBNYXAgR3JpZCBGb3J3YXJkICAtIGxvbmcvbGF0IHRvIHgveVxuICAgIGxvbmcvbGF0IGluIHJhZGlhbnNcbiAgKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIG47XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG5cbiAgdmFyIGRlbHRhX2xhdCA9IGxhdCAtIHRoaXMubGF0MDtcbiAgdmFyIGRlbHRhX2xvbiA9IGxvbiAtIHRoaXMubG9uZzA7XG5cbiAgLy8gMS4gQ2FsY3VsYXRlIGRfcGhpIGFuZCBkX3BzaSAgICAuLi4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuZCBkX2xhbWJkYVxuICAvLyBGb3IgdGhpcyBhbGdvcml0aG0sIGRlbHRhX2xhdGl0dWRlIGlzIGluIHNlY29uZHMgb2YgYXJjIHggMTAtNSwgc28gd2UgbmVlZCB0byBzY2FsZSB0byB0aG9zZSB1bml0cy4gTG9uZ2l0dWRlIGlzIHJhZGlhbnMuXG4gIHZhciBkX3BoaSA9IGRlbHRhX2xhdCAvIFNFQ19UT19SQUQgKiAxRS01O1xuICB2YXIgZF9sYW1iZGEgPSBkZWx0YV9sb247XG4gIHZhciBkX3BoaV9uID0gMTsgLy8gZF9waGleMFxuXG4gIHZhciBkX3BzaSA9IDA7XG4gIGZvciAobiA9IDE7IG4gPD0gMTA7IG4rKykge1xuICAgIGRfcGhpX24gPSBkX3BoaV9uICogZF9waGk7XG4gICAgZF9wc2kgPSBkX3BzaSArIHRoaXMuQVtuXSAqIGRfcGhpX247XG4gIH1cblxuICAvLyAyLiBDYWxjdWxhdGUgdGhldGFcbiAgdmFyIHRoX3JlID0gZF9wc2k7XG4gIHZhciB0aF9pbSA9IGRfbGFtYmRhO1xuXG4gIC8vIDMuIENhbGN1bGF0ZSB6XG4gIHZhciB0aF9uX3JlID0gMTtcbiAgdmFyIHRoX25faW0gPSAwOyAvLyB0aGV0YV4wXG4gIHZhciB0aF9uX3JlMTtcbiAgdmFyIHRoX25faW0xO1xuXG4gIHZhciB6X3JlID0gMDtcbiAgdmFyIHpfaW0gPSAwO1xuICBmb3IgKG4gPSAxOyBuIDw9IDY7IG4rKykge1xuICAgIHRoX25fcmUxID0gdGhfbl9yZSAqIHRoX3JlIC0gdGhfbl9pbSAqIHRoX2ltO1xuICAgIHRoX25faW0xID0gdGhfbl9pbSAqIHRoX3JlICsgdGhfbl9yZSAqIHRoX2ltO1xuICAgIHRoX25fcmUgPSB0aF9uX3JlMTtcbiAgICB0aF9uX2ltID0gdGhfbl9pbTE7XG4gICAgel9yZSA9IHpfcmUgKyB0aGlzLkJfcmVbbl0gKiB0aF9uX3JlIC0gdGhpcy5CX2ltW25dICogdGhfbl9pbTtcbiAgICB6X2ltID0gel9pbSArIHRoaXMuQl9pbVtuXSAqIHRoX25fcmUgKyB0aGlzLkJfcmVbbl0gKiB0aF9uX2ltO1xuICB9XG5cbiAgLy8gNC4gQ2FsY3VsYXRlIGVhc3RpbmcgYW5kIG5vcnRoaW5nXG4gIHAueCA9ICh6X2ltICogdGhpcy5hKSArIHRoaXMueDA7XG4gIHAueSA9ICh6X3JlICogdGhpcy5hKSArIHRoaXMueTA7XG5cbiAgcmV0dXJuIHA7XG59O1xuXG5cbi8qKlxuICAgIE5ldyBaZWFsYW5kIE1hcCBHcmlkIEludmVyc2UgIC0gIHgveSB0byBsb25nL2xhdFxuICAqL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbjtcbiAgdmFyIHggPSBwLng7XG4gIHZhciB5ID0gcC55O1xuXG4gIHZhciBkZWx0YV94ID0geCAtIHRoaXMueDA7XG4gIHZhciBkZWx0YV95ID0geSAtIHRoaXMueTA7XG5cbiAgLy8gMS4gQ2FsY3VsYXRlIHpcbiAgdmFyIHpfcmUgPSBkZWx0YV95IC8gdGhpcy5hO1xuICB2YXIgel9pbSA9IGRlbHRhX3ggLyB0aGlzLmE7XG5cbiAgLy8gMmEuIENhbGN1bGF0ZSB0aGV0YSAtIGZpcnN0IGFwcHJveGltYXRpb24gZ2l2ZXMga20gYWNjdXJhY3lcbiAgdmFyIHpfbl9yZSA9IDE7XG4gIHZhciB6X25faW0gPSAwOyAvLyB6XjBcbiAgdmFyIHpfbl9yZTE7XG4gIHZhciB6X25faW0xO1xuXG4gIHZhciB0aF9yZSA9IDA7XG4gIHZhciB0aF9pbSA9IDA7XG4gIGZvciAobiA9IDE7IG4gPD0gNjsgbisrKSB7XG4gICAgel9uX3JlMSA9IHpfbl9yZSAqIHpfcmUgLSB6X25faW0gKiB6X2ltO1xuICAgIHpfbl9pbTEgPSB6X25faW0gKiB6X3JlICsgel9uX3JlICogel9pbTtcbiAgICB6X25fcmUgPSB6X25fcmUxO1xuICAgIHpfbl9pbSA9IHpfbl9pbTE7XG4gICAgdGhfcmUgPSB0aF9yZSArIHRoaXMuQ19yZVtuXSAqIHpfbl9yZSAtIHRoaXMuQ19pbVtuXSAqIHpfbl9pbTtcbiAgICB0aF9pbSA9IHRoX2ltICsgdGhpcy5DX2ltW25dICogel9uX3JlICsgdGhpcy5DX3JlW25dICogel9uX2ltO1xuICB9XG5cbiAgLy8gMmIuIEl0ZXJhdGUgdG8gcmVmaW5lIHRoZSBhY2N1cmFjeSBvZiB0aGUgY2FsY3VsYXRpb25cbiAgLy8gICAgICAgIDAgaXRlcmF0aW9ucyBnaXZlcyBrbSBhY2N1cmFjeVxuICAvLyAgICAgICAgMSBpdGVyYXRpb24gZ2l2ZXMgbSBhY2N1cmFjeSAtLSBnb29kIGVub3VnaCBmb3IgbW9zdCBtYXBwaW5nIGFwcGxpY2F0aW9uc1xuICAvLyAgICAgICAgMiBpdGVyYXRpb25zIGJpdmVzIG1tIGFjY3VyYWN5XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVyYXRpb25zOyBpKyspIHtcbiAgICB2YXIgdGhfbl9yZSA9IHRoX3JlO1xuICAgIHZhciB0aF9uX2ltID0gdGhfaW07XG4gICAgdmFyIHRoX25fcmUxO1xuICAgIHZhciB0aF9uX2ltMTtcblxuICAgIHZhciBudW1fcmUgPSB6X3JlO1xuICAgIHZhciBudW1faW0gPSB6X2ltO1xuICAgIGZvciAobiA9IDI7IG4gPD0gNjsgbisrKSB7XG4gICAgICB0aF9uX3JlMSA9IHRoX25fcmUgKiB0aF9yZSAtIHRoX25faW0gKiB0aF9pbTtcbiAgICAgIHRoX25faW0xID0gdGhfbl9pbSAqIHRoX3JlICsgdGhfbl9yZSAqIHRoX2ltO1xuICAgICAgdGhfbl9yZSA9IHRoX25fcmUxO1xuICAgICAgdGhfbl9pbSA9IHRoX25faW0xO1xuICAgICAgbnVtX3JlID0gbnVtX3JlICsgKG4gLSAxKSAqICh0aGlzLkJfcmVbbl0gKiB0aF9uX3JlIC0gdGhpcy5CX2ltW25dICogdGhfbl9pbSk7XG4gICAgICBudW1faW0gPSBudW1faW0gKyAobiAtIDEpICogKHRoaXMuQl9pbVtuXSAqIHRoX25fcmUgKyB0aGlzLkJfcmVbbl0gKiB0aF9uX2ltKTtcbiAgICB9XG5cbiAgICB0aF9uX3JlID0gMTtcbiAgICB0aF9uX2ltID0gMDtcbiAgICB2YXIgZGVuX3JlID0gdGhpcy5CX3JlWzFdO1xuICAgIHZhciBkZW5faW0gPSB0aGlzLkJfaW1bMV07XG4gICAgZm9yIChuID0gMjsgbiA8PSA2OyBuKyspIHtcbiAgICAgIHRoX25fcmUxID0gdGhfbl9yZSAqIHRoX3JlIC0gdGhfbl9pbSAqIHRoX2ltO1xuICAgICAgdGhfbl9pbTEgPSB0aF9uX2ltICogdGhfcmUgKyB0aF9uX3JlICogdGhfaW07XG4gICAgICB0aF9uX3JlID0gdGhfbl9yZTE7XG4gICAgICB0aF9uX2ltID0gdGhfbl9pbTE7XG4gICAgICBkZW5fcmUgPSBkZW5fcmUgKyBuICogKHRoaXMuQl9yZVtuXSAqIHRoX25fcmUgLSB0aGlzLkJfaW1bbl0gKiB0aF9uX2ltKTtcbiAgICAgIGRlbl9pbSA9IGRlbl9pbSArIG4gKiAodGhpcy5CX2ltW25dICogdGhfbl9yZSArIHRoaXMuQl9yZVtuXSAqIHRoX25faW0pO1xuICAgIH1cblxuICAgIC8vIENvbXBsZXggZGl2aXNpb25cbiAgICB2YXIgZGVuMiA9IGRlbl9yZSAqIGRlbl9yZSArIGRlbl9pbSAqIGRlbl9pbTtcbiAgICB0aF9yZSA9IChudW1fcmUgKiBkZW5fcmUgKyBudW1faW0gKiBkZW5faW0pIC8gZGVuMjtcbiAgICB0aF9pbSA9IChudW1faW0gKiBkZW5fcmUgLSBudW1fcmUgKiBkZW5faW0pIC8gZGVuMjtcbiAgfVxuXG4gIC8vIDMuIENhbGN1bGF0ZSBkX3BoaSAgICAgICAgICAgICAgLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYW5kIGRfbGFtYmRhXG4gIHZhciBkX3BzaSA9IHRoX3JlO1xuICB2YXIgZF9sYW1iZGEgPSB0aF9pbTtcbiAgdmFyIGRfcHNpX24gPSAxOyAvLyBkX3BzaV4wXG5cbiAgdmFyIGRfcGhpID0gMDtcbiAgZm9yIChuID0gMTsgbiA8PSA5OyBuKyspIHtcbiAgICBkX3BzaV9uID0gZF9wc2lfbiAqIGRfcHNpO1xuICAgIGRfcGhpID0gZF9waGkgKyB0aGlzLkRbbl0gKiBkX3BzaV9uO1xuICB9XG5cbiAgLy8gNC4gQ2FsY3VsYXRlIGxhdGl0dWRlIGFuZCBsb25naXR1ZGVcbiAgLy8gZF9waGkgaXMgY2FsY3VhdGVkIGluIHNlY29uZCBvZiBhcmMgKiAxMF4tNSwgc28gd2UgbmVlZCB0byBzY2FsZSBiYWNrIHRvIHJhZGlhbnMuIGRfbGFtYmRhIGlzIGluIHJhZGlhbnMuXG4gIHZhciBsYXQgPSB0aGlzLmxhdDAgKyAoZF9waGkgKiBTRUNfVE9fUkFEICogMUU1KTtcbiAgdmFyIGxvbiA9IHRoaXMubG9uZzAgKyBkX2xhbWJkYTtcblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcblxuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiTmV3X1plYWxhbmRfTWFwX0dyaWRcIiwgXCJuem1nXCJdOyIsInZhciB0c2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi90c2ZueicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIHBoaTJ6ID0gcmVxdWlyZSgnLi4vY29tbW9uL3BoaTJ6Jyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBGT1JUUEkgPSBNYXRoLlBJLzQ7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xuXG4vKiBJbml0aWFsaXplIHRoZSBPYmxpcXVlIE1lcmNhdG9yICBwcm9qZWN0aW9uXG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm5vX29mZiA9IHRoaXMubm9fb2ZmIHx8IGZhbHNlO1xuICB0aGlzLm5vX3JvdCA9IHRoaXMubm9fcm90IHx8IGZhbHNlO1xuXG4gIGlmIChpc05hTih0aGlzLmswKSkge1xuICAgIHRoaXMuazAgPSAxO1xuICB9XG4gIHZhciBzaW5sYXQgPSBNYXRoLnNpbih0aGlzLmxhdDApO1xuICB2YXIgY29zbGF0ID0gTWF0aC5jb3ModGhpcy5sYXQwKTtcbiAgdmFyIGNvbiA9IHRoaXMuZSAqIHNpbmxhdDtcblxuICB0aGlzLmJsID0gTWF0aC5zcXJ0KDEgKyB0aGlzLmVzIC8gKDEgLSB0aGlzLmVzKSAqIE1hdGgucG93KGNvc2xhdCwgNCkpO1xuICB0aGlzLmFsID0gdGhpcy5hICogdGhpcy5ibCAqIHRoaXMuazAgKiBNYXRoLnNxcnQoMSAtIHRoaXMuZXMpIC8gKDEgLSBjb24gKiBjb24pO1xuICB2YXIgdDAgPSB0c2Zueih0aGlzLmUsIHRoaXMubGF0MCwgc2lubGF0KTtcbiAgdmFyIGRsID0gdGhpcy5ibCAvIGNvc2xhdCAqIE1hdGguc3FydCgoMSAtIHRoaXMuZXMpIC8gKDEgLSBjb24gKiBjb24pKTtcbiAgaWYgKGRsICogZGwgPCAxKSB7XG4gICAgZGwgPSAxO1xuICB9XG4gIHZhciBmbDtcbiAgdmFyIGdsO1xuICBpZiAoIWlzTmFOKHRoaXMubG9uZ2MpKSB7XG4gICAgLy9DZW50cmFsIHBvaW50IGFuZCBhemltdXRoIG1ldGhvZFxuXG4gICAgaWYgKHRoaXMubGF0MCA+PSAwKSB7XG4gICAgICBmbCA9IGRsICsgTWF0aC5zcXJ0KGRsICogZGwgLSAxKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBmbCA9IGRsIC0gTWF0aC5zcXJ0KGRsICogZGwgLSAxKTtcbiAgICB9XG4gICAgdGhpcy5lbCA9IGZsICogTWF0aC5wb3codDAsIHRoaXMuYmwpO1xuICAgIGdsID0gMC41ICogKGZsIC0gMSAvIGZsKTtcbiAgICB0aGlzLmdhbW1hMCA9IE1hdGguYXNpbihNYXRoLnNpbih0aGlzLmFscGhhKSAvIGRsKTtcbiAgICB0aGlzLmxvbmcwID0gdGhpcy5sb25nYyAtIE1hdGguYXNpbihnbCAqIE1hdGgudGFuKHRoaXMuZ2FtbWEwKSkgLyB0aGlzLmJsO1xuXG4gIH1cbiAgZWxzZSB7XG4gICAgLy8yIHBvaW50cyBtZXRob2RcbiAgICB2YXIgdDEgPSB0c2Zueih0aGlzLmUsIHRoaXMubGF0MSwgTWF0aC5zaW4odGhpcy5sYXQxKSk7XG4gICAgdmFyIHQyID0gdHNmbnoodGhpcy5lLCB0aGlzLmxhdDIsIE1hdGguc2luKHRoaXMubGF0MikpO1xuICAgIGlmICh0aGlzLmxhdDAgPj0gMCkge1xuICAgICAgdGhpcy5lbCA9IChkbCArIE1hdGguc3FydChkbCAqIGRsIC0gMSkpICogTWF0aC5wb3codDAsIHRoaXMuYmwpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZWwgPSAoZGwgLSBNYXRoLnNxcnQoZGwgKiBkbCAtIDEpKSAqIE1hdGgucG93KHQwLCB0aGlzLmJsKTtcbiAgICB9XG4gICAgdmFyIGhsID0gTWF0aC5wb3codDEsIHRoaXMuYmwpO1xuICAgIHZhciBsbCA9IE1hdGgucG93KHQyLCB0aGlzLmJsKTtcbiAgICBmbCA9IHRoaXMuZWwgLyBobDtcbiAgICBnbCA9IDAuNSAqIChmbCAtIDEgLyBmbCk7XG4gICAgdmFyIGpsID0gKHRoaXMuZWwgKiB0aGlzLmVsIC0gbGwgKiBobCkgLyAodGhpcy5lbCAqIHRoaXMuZWwgKyBsbCAqIGhsKTtcbiAgICB2YXIgcGwgPSAobGwgLSBobCkgLyAobGwgKyBobCk7XG4gICAgdmFyIGRsb24xMiA9IGFkanVzdF9sb24odGhpcy5sb25nMSAtIHRoaXMubG9uZzIpO1xuICAgIHRoaXMubG9uZzAgPSAwLjUgKiAodGhpcy5sb25nMSArIHRoaXMubG9uZzIpIC0gTWF0aC5hdGFuKGpsICogTWF0aC50YW4oMC41ICogdGhpcy5ibCAqIChkbG9uMTIpKSAvIHBsKSAvIHRoaXMuYmw7XG4gICAgdGhpcy5sb25nMCA9IGFkanVzdF9sb24odGhpcy5sb25nMCk7XG4gICAgdmFyIGRsb24xMCA9IGFkanVzdF9sb24odGhpcy5sb25nMSAtIHRoaXMubG9uZzApO1xuICAgIHRoaXMuZ2FtbWEwID0gTWF0aC5hdGFuKE1hdGguc2luKHRoaXMuYmwgKiAoZGxvbjEwKSkgLyBnbCk7XG4gICAgdGhpcy5hbHBoYSA9IE1hdGguYXNpbihkbCAqIE1hdGguc2luKHRoaXMuZ2FtbWEwKSk7XG4gIH1cblxuICBpZiAodGhpcy5ub19vZmYpIHtcbiAgICB0aGlzLnVjID0gMDtcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAodGhpcy5sYXQwID49IDApIHtcbiAgICAgIHRoaXMudWMgPSB0aGlzLmFsIC8gdGhpcy5ibCAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGRsICogZGwgLSAxKSwgTWF0aC5jb3ModGhpcy5hbHBoYSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMudWMgPSAtMSAqIHRoaXMuYWwgLyB0aGlzLmJsICogTWF0aC5hdGFuMihNYXRoLnNxcnQoZGwgKiBkbCAtIDEpLCBNYXRoLmNvcyh0aGlzLmFscGhhKSk7XG4gICAgfVxuICB9XG5cbn07XG5cblxuLyogT2JsaXF1ZSBNZXJjYXRvciBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIGRsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICB2YXIgdXMsIHZzO1xuICB2YXIgY29uO1xuICBpZiAoTWF0aC5hYnMoTWF0aC5hYnMobGF0KSAtIEhBTEZfUEkpIDw9IEVQU0xOKSB7XG4gICAgaWYgKGxhdCA+IDApIHtcbiAgICAgIGNvbiA9IC0xO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbiA9IDE7XG4gICAgfVxuICAgIHZzID0gdGhpcy5hbCAvIHRoaXMuYmwgKiBNYXRoLmxvZyhNYXRoLnRhbihGT1JUUEkgKyBjb24gKiB0aGlzLmdhbW1hMCAqIDAuNSkpO1xuICAgIHVzID0gLTEgKiBjb24gKiBIQUxGX1BJICogdGhpcy5hbCAvIHRoaXMuYmw7XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIHQgPSB0c2Zueih0aGlzLmUsIGxhdCwgTWF0aC5zaW4obGF0KSk7XG4gICAgdmFyIHFsID0gdGhpcy5lbCAvIE1hdGgucG93KHQsIHRoaXMuYmwpO1xuICAgIHZhciBzbCA9IDAuNSAqIChxbCAtIDEgLyBxbCk7XG4gICAgdmFyIHRsID0gMC41ICogKHFsICsgMSAvIHFsKTtcbiAgICB2YXIgdmwgPSBNYXRoLnNpbih0aGlzLmJsICogKGRsb24pKTtcbiAgICB2YXIgdWwgPSAoc2wgKiBNYXRoLnNpbih0aGlzLmdhbW1hMCkgLSB2bCAqIE1hdGguY29zKHRoaXMuZ2FtbWEwKSkgLyB0bDtcbiAgICBpZiAoTWF0aC5hYnMoTWF0aC5hYnModWwpIC0gMSkgPD0gRVBTTE4pIHtcbiAgICAgIHZzID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZzID0gMC41ICogdGhpcy5hbCAqIE1hdGgubG9nKCgxIC0gdWwpIC8gKDEgKyB1bCkpIC8gdGhpcy5ibDtcbiAgICB9XG4gICAgaWYgKE1hdGguYWJzKE1hdGguY29zKHRoaXMuYmwgKiAoZGxvbikpKSA8PSBFUFNMTikge1xuICAgICAgdXMgPSB0aGlzLmFsICogdGhpcy5ibCAqIChkbG9uKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB1cyA9IHRoaXMuYWwgKiBNYXRoLmF0YW4yKHNsICogTWF0aC5jb3ModGhpcy5nYW1tYTApICsgdmwgKiBNYXRoLnNpbih0aGlzLmdhbW1hMCksIE1hdGguY29zKHRoaXMuYmwgKiBkbG9uKSkgLyB0aGlzLmJsO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLm5vX3JvdCkge1xuICAgIHAueCA9IHRoaXMueDAgKyB1cztcbiAgICBwLnkgPSB0aGlzLnkwICsgdnM7XG4gIH1cbiAgZWxzZSB7XG5cbiAgICB1cyAtPSB0aGlzLnVjO1xuICAgIHAueCA9IHRoaXMueDAgKyB2cyAqIE1hdGguY29zKHRoaXMuYWxwaGEpICsgdXMgKiBNYXRoLnNpbih0aGlzLmFscGhhKTtcbiAgICBwLnkgPSB0aGlzLnkwICsgdXMgKiBNYXRoLmNvcyh0aGlzLmFscGhhKSAtIHZzICogTWF0aC5zaW4odGhpcy5hbHBoYSk7XG4gIH1cbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciB1cywgdnM7XG4gIGlmICh0aGlzLm5vX3JvdCkge1xuICAgIHZzID0gcC55IC0gdGhpcy55MDtcbiAgICB1cyA9IHAueCAtIHRoaXMueDA7XG4gIH1cbiAgZWxzZSB7XG4gICAgdnMgPSAocC54IC0gdGhpcy54MCkgKiBNYXRoLmNvcyh0aGlzLmFscGhhKSAtIChwLnkgLSB0aGlzLnkwKSAqIE1hdGguc2luKHRoaXMuYWxwaGEpO1xuICAgIHVzID0gKHAueSAtIHRoaXMueTApICogTWF0aC5jb3ModGhpcy5hbHBoYSkgKyAocC54IC0gdGhpcy54MCkgKiBNYXRoLnNpbih0aGlzLmFscGhhKTtcbiAgICB1cyArPSB0aGlzLnVjO1xuICB9XG4gIHZhciBxcCA9IE1hdGguZXhwKC0xICogdGhpcy5ibCAqIHZzIC8gdGhpcy5hbCk7XG4gIHZhciBzcCA9IDAuNSAqIChxcCAtIDEgLyBxcCk7XG4gIHZhciB0cCA9IDAuNSAqIChxcCArIDEgLyBxcCk7XG4gIHZhciB2cCA9IE1hdGguc2luKHRoaXMuYmwgKiB1cyAvIHRoaXMuYWwpO1xuICB2YXIgdXAgPSAodnAgKiBNYXRoLmNvcyh0aGlzLmdhbW1hMCkgKyBzcCAqIE1hdGguc2luKHRoaXMuZ2FtbWEwKSkgLyB0cDtcbiAgdmFyIHRzID0gTWF0aC5wb3codGhpcy5lbCAvIE1hdGguc3FydCgoMSArIHVwKSAvICgxIC0gdXApKSwgMSAvIHRoaXMuYmwpO1xuICBpZiAoTWF0aC5hYnModXAgLSAxKSA8IEVQU0xOKSB7XG4gICAgcC54ID0gdGhpcy5sb25nMDtcbiAgICBwLnkgPSBIQUxGX1BJO1xuICB9XG4gIGVsc2UgaWYgKE1hdGguYWJzKHVwICsgMSkgPCBFUFNMTikge1xuICAgIHAueCA9IHRoaXMubG9uZzA7XG4gICAgcC55ID0gLTEgKiBIQUxGX1BJO1xuICB9XG4gIGVsc2Uge1xuICAgIHAueSA9IHBoaTJ6KHRoaXMuZSwgdHMpO1xuICAgIHAueCA9IGFkanVzdF9sb24odGhpcy5sb25nMCAtIE1hdGguYXRhbjIoc3AgKiBNYXRoLmNvcyh0aGlzLmdhbW1hMCkgLSB2cCAqIE1hdGguc2luKHRoaXMuZ2FtbWEwKSwgTWF0aC5jb3ModGhpcy5ibCAqIHVzIC8gdGhpcy5hbCkpIC8gdGhpcy5ibCk7XG4gIH1cbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLm5hbWVzID0gW1wiSG90aW5lX09ibGlxdWVfTWVyY2F0b3JcIiwgXCJIb3RpbmUgT2JsaXF1ZSBNZXJjYXRvclwiLCBcIkhvdGluZV9PYmxpcXVlX01lcmNhdG9yX0F6aW11dGhfTmF0dXJhbF9PcmlnaW5cIiwgXCJIb3RpbmVfT2JsaXF1ZV9NZXJjYXRvcl9BemltdXRoX0NlbnRlclwiLCBcIm9tZXJjXCJdOyIsInZhciBlMGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UwZm4nKTtcbnZhciBlMWZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UxZm4nKTtcbnZhciBlMmZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UyZm4nKTtcbnZhciBlM2ZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UzZm4nKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBhZGp1c3RfbGF0ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sYXQnKTtcbnZhciBtbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL21sZm4nKTtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgZ04gPSByZXF1aXJlKCcuLi9jb21tb24vZ04nKTtcbnZhciBNQVhfSVRFUiA9IDIwO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIC8qIFBsYWNlIHBhcmFtZXRlcnMgaW4gc3RhdGljIHN0b3JhZ2UgZm9yIGNvbW1vbiB1c2VcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICB0aGlzLnRlbXAgPSB0aGlzLmIgLyB0aGlzLmE7XG4gIHRoaXMuZXMgPSAxIC0gTWF0aC5wb3codGhpcy50ZW1wLCAyKTsgLy8gZGV2YWl0IGV0cmUgZGFucyB0bWVyYy5qcyBtYWlzIG4geSBlc3QgcGFzIGRvbmMgamUgY29tbWVudGUgc2lub24gcmV0b3VyIGRlIHZhbGV1cnMgbnVsbGVzXG4gIHRoaXMuZSA9IE1hdGguc3FydCh0aGlzLmVzKTtcbiAgdGhpcy5lMCA9IGUwZm4odGhpcy5lcyk7XG4gIHRoaXMuZTEgPSBlMWZuKHRoaXMuZXMpO1xuICB0aGlzLmUyID0gZTJmbih0aGlzLmVzKTtcbiAgdGhpcy5lMyA9IGUzZm4odGhpcy5lcyk7XG4gIHRoaXMubWwwID0gdGhpcy5hICogbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCB0aGlzLmxhdDApOyAvL3NpIHF1ZSBkZXMgemVyb3MgbGUgY2FsY3VsIG5lIHNlIGZhaXQgcGFzXG59O1xuXG5cbi8qIFBvbHljb25pYyBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICB2YXIgeCwgeSwgZWw7XG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgZWwgPSBkbG9uICogTWF0aC5zaW4obGF0KTtcbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgaWYgKE1hdGguYWJzKGxhdCkgPD0gRVBTTE4pIHtcbiAgICAgIHggPSB0aGlzLmEgKiBkbG9uO1xuICAgICAgeSA9IC0xICogdGhpcy5hICogdGhpcy5sYXQwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHggPSB0aGlzLmEgKiBNYXRoLnNpbihlbCkgLyBNYXRoLnRhbihsYXQpO1xuICAgICAgeSA9IHRoaXMuYSAqIChhZGp1c3RfbGF0KGxhdCAtIHRoaXMubGF0MCkgKyAoMSAtIE1hdGguY29zKGVsKSkgLyBNYXRoLnRhbihsYXQpKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKE1hdGguYWJzKGxhdCkgPD0gRVBTTE4pIHtcbiAgICAgIHggPSB0aGlzLmEgKiBkbG9uO1xuICAgICAgeSA9IC0xICogdGhpcy5tbDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdmFyIG5sID0gZ04odGhpcy5hLCB0aGlzLmUsIE1hdGguc2luKGxhdCkpIC8gTWF0aC50YW4obGF0KTtcbiAgICAgIHggPSBubCAqIE1hdGguc2luKGVsKTtcbiAgICAgIHkgPSB0aGlzLmEgKiBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIGxhdCkgLSB0aGlzLm1sMCArIG5sICogKDEgLSBNYXRoLmNvcyhlbCkpO1xuICAgIH1cblxuICB9XG4gIHAueCA9IHggKyB0aGlzLngwO1xuICBwLnkgPSB5ICsgdGhpcy55MDtcbiAgcmV0dXJuIHA7XG59O1xuXG5cbi8qIEludmVyc2UgZXF1YXRpb25zXG4gIC0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiwgbGF0LCB4LCB5LCBpO1xuICB2YXIgYWwsIGJsO1xuICB2YXIgcGhpLCBkcGhpO1xuICB4ID0gcC54IC0gdGhpcy54MDtcbiAgeSA9IHAueSAtIHRoaXMueTA7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgaWYgKE1hdGguYWJzKHkgKyB0aGlzLmEgKiB0aGlzLmxhdDApIDw9IEVQU0xOKSB7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHggLyB0aGlzLmEgKyB0aGlzLmxvbmcwKTtcbiAgICAgIGxhdCA9IDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYWwgPSB0aGlzLmxhdDAgKyB5IC8gdGhpcy5hO1xuICAgICAgYmwgPSB4ICogeCAvIHRoaXMuYSAvIHRoaXMuYSArIGFsICogYWw7XG4gICAgICBwaGkgPSBhbDtcbiAgICAgIHZhciB0YW5waGk7XG4gICAgICBmb3IgKGkgPSBNQVhfSVRFUjsgaTsgLS1pKSB7XG4gICAgICAgIHRhbnBoaSA9IE1hdGgudGFuKHBoaSk7XG4gICAgICAgIGRwaGkgPSAtMSAqIChhbCAqIChwaGkgKiB0YW5waGkgKyAxKSAtIHBoaSAtIDAuNSAqIChwaGkgKiBwaGkgKyBibCkgKiB0YW5waGkpIC8gKChwaGkgLSBhbCkgLyB0YW5waGkgLSAxKTtcbiAgICAgICAgcGhpICs9IGRwaGk7XG4gICAgICAgIGlmIChNYXRoLmFicyhkcGhpKSA8PSBFUFNMTikge1xuICAgICAgICAgIGxhdCA9IHBoaTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgKE1hdGguYXNpbih4ICogTWF0aC50YW4ocGhpKSAvIHRoaXMuYSkpIC8gTWF0aC5zaW4obGF0KSk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGlmIChNYXRoLmFicyh5ICsgdGhpcy5tbDApIDw9IEVQU0xOKSB7XG4gICAgICBsYXQgPSAwO1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgeCAvIHRoaXMuYSk7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICBhbCA9ICh0aGlzLm1sMCArIHkpIC8gdGhpcy5hO1xuICAgICAgYmwgPSB4ICogeCAvIHRoaXMuYSAvIHRoaXMuYSArIGFsICogYWw7XG4gICAgICBwaGkgPSBhbDtcbiAgICAgIHZhciBjbCwgbWxuLCBtbG5wLCBtYTtcbiAgICAgIHZhciBjb247XG4gICAgICBmb3IgKGkgPSBNQVhfSVRFUjsgaTsgLS1pKSB7XG4gICAgICAgIGNvbiA9IHRoaXMuZSAqIE1hdGguc2luKHBoaSk7XG4gICAgICAgIGNsID0gTWF0aC5zcXJ0KDEgLSBjb24gKiBjb24pICogTWF0aC50YW4ocGhpKTtcbiAgICAgICAgbWxuID0gdGhpcy5hICogbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCBwaGkpO1xuICAgICAgICBtbG5wID0gdGhpcy5lMCAtIDIgKiB0aGlzLmUxICogTWF0aC5jb3MoMiAqIHBoaSkgKyA0ICogdGhpcy5lMiAqIE1hdGguY29zKDQgKiBwaGkpIC0gNiAqIHRoaXMuZTMgKiBNYXRoLmNvcyg2ICogcGhpKTtcbiAgICAgICAgbWEgPSBtbG4gLyB0aGlzLmE7XG4gICAgICAgIGRwaGkgPSAoYWwgKiAoY2wgKiBtYSArIDEpIC0gbWEgLSAwLjUgKiBjbCAqIChtYSAqIG1hICsgYmwpKSAvICh0aGlzLmVzICogTWF0aC5zaW4oMiAqIHBoaSkgKiAobWEgKiBtYSArIGJsIC0gMiAqIGFsICogbWEpIC8gKDQgKiBjbCkgKyAoYWwgLSBtYSkgKiAoY2wgKiBtbG5wIC0gMiAvIE1hdGguc2luKDIgKiBwaGkpKSAtIG1sbnApO1xuICAgICAgICBwaGkgLT0gZHBoaTtcbiAgICAgICAgaWYgKE1hdGguYWJzKGRwaGkpIDw9IEVQU0xOKSB7XG4gICAgICAgICAgbGF0ID0gcGhpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vbGF0PXBoaTR6KHRoaXMuZSx0aGlzLmUwLHRoaXMuZTEsdGhpcy5lMix0aGlzLmUzLGFsLGJsLDAsMCk7XG4gICAgICBjbCA9IE1hdGguc3FydCgxIC0gdGhpcy5lcyAqIE1hdGgucG93KE1hdGguc2luKGxhdCksIDIpKSAqIE1hdGgudGFuKGxhdCk7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmFzaW4oeCAqIGNsIC8gdGhpcy5hKSAvIE1hdGguc2luKGxhdCkpO1xuICAgIH1cbiAgfVxuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiUG9seWNvbmljXCIsIFwicG9seVwiXTsiLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgYWRqdXN0X2xhdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbGF0Jyk7XG52YXIgcGpfZW5mbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9wal9lbmZuJyk7XG52YXIgTUFYX0lURVIgPSAyMDtcbnZhciBwal9tbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL3BqX21sZm4nKTtcbnZhciBwal9pbnZfbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9wal9pbnZfbWxmbicpO1xudmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIGFzaW56ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FzaW56Jyk7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgLyogUGxhY2UgcGFyYW1ldGVycyBpbiBzdGF0aWMgc3RvcmFnZSBmb3IgY29tbW9uIHVzZVxuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cbiAgaWYgKCF0aGlzLnNwaGVyZSkge1xuICAgIHRoaXMuZW4gPSBwal9lbmZuKHRoaXMuZXMpO1xuICB9XG4gIGVsc2Uge1xuICAgIHRoaXMubiA9IDE7XG4gICAgdGhpcy5tID0gMDtcbiAgICB0aGlzLmVzID0gMDtcbiAgICB0aGlzLkNfeSA9IE1hdGguc3FydCgodGhpcy5tICsgMSkgLyB0aGlzLm4pO1xuICAgIHRoaXMuQ194ID0gdGhpcy5DX3kgLyAodGhpcy5tICsgMSk7XG4gIH1cblxufTtcblxuLyogU2ludXNvaWRhbCBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgeCwgeTtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgaWYgKCF0aGlzLm0pIHtcbiAgICAgIGxhdCA9IHRoaXMubiAhPT0gMSA/IE1hdGguYXNpbih0aGlzLm4gKiBNYXRoLnNpbihsYXQpKSA6IGxhdDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXIgayA9IHRoaXMubiAqIE1hdGguc2luKGxhdCk7XG4gICAgICBmb3IgKHZhciBpID0gTUFYX0lURVI7IGk7IC0taSkge1xuICAgICAgICB2YXIgViA9ICh0aGlzLm0gKiBsYXQgKyBNYXRoLnNpbihsYXQpIC0gaykgLyAodGhpcy5tICsgTWF0aC5jb3MobGF0KSk7XG4gICAgICAgIGxhdCAtPSBWO1xuICAgICAgICBpZiAoTWF0aC5hYnMoVikgPCBFUFNMTikge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHggPSB0aGlzLmEgKiB0aGlzLkNfeCAqIGxvbiAqICh0aGlzLm0gKyBNYXRoLmNvcyhsYXQpKTtcbiAgICB5ID0gdGhpcy5hICogdGhpcy5DX3kgKiBsYXQ7XG5cbiAgfVxuICBlbHNlIHtcblxuICAgIHZhciBzID0gTWF0aC5zaW4obGF0KTtcbiAgICB2YXIgYyA9IE1hdGguY29zKGxhdCk7XG4gICAgeSA9IHRoaXMuYSAqIHBqX21sZm4obGF0LCBzLCBjLCB0aGlzLmVuKTtcbiAgICB4ID0gdGhpcy5hICogbG9uICogYyAvIE1hdGguc3FydCgxIC0gdGhpcy5lcyAqIHMgKiBzKTtcbiAgfVxuXG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbGF0LCB0ZW1wLCBsb24sIHM7XG5cbiAgcC54IC09IHRoaXMueDA7XG4gIGxvbiA9IHAueCAvIHRoaXMuYTtcbiAgcC55IC09IHRoaXMueTA7XG4gIGxhdCA9IHAueSAvIHRoaXMuYTtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBsYXQgLz0gdGhpcy5DX3k7XG4gICAgbG9uID0gbG9uIC8gKHRoaXMuQ194ICogKHRoaXMubSArIE1hdGguY29zKGxhdCkpKTtcbiAgICBpZiAodGhpcy5tKSB7XG4gICAgICBsYXQgPSBhc2lueigodGhpcy5tICogbGF0ICsgTWF0aC5zaW4obGF0KSkgLyB0aGlzLm4pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLm4gIT09IDEpIHtcbiAgICAgIGxhdCA9IGFzaW56KE1hdGguc2luKGxhdCkgLyB0aGlzLm4pO1xuICAgIH1cbiAgICBsb24gPSBhZGp1c3RfbG9uKGxvbiArIHRoaXMubG9uZzApO1xuICAgIGxhdCA9IGFkanVzdF9sYXQobGF0KTtcbiAgfVxuICBlbHNlIHtcbiAgICBsYXQgPSBwal9pbnZfbWxmbihwLnkgLyB0aGlzLmEsIHRoaXMuZXMsIHRoaXMuZW4pO1xuICAgIHMgPSBNYXRoLmFicyhsYXQpO1xuICAgIGlmIChzIDwgSEFMRl9QSSkge1xuICAgICAgcyA9IE1hdGguc2luKGxhdCk7XG4gICAgICB0ZW1wID0gdGhpcy5sb25nMCArIHAueCAqIE1hdGguc3FydCgxIC0gdGhpcy5lcyAqIHMgKiBzKSAvICh0aGlzLmEgKiBNYXRoLmNvcyhsYXQpKTtcbiAgICAgIC8vdGVtcCA9IHRoaXMubG9uZzAgKyBwLnggLyAodGhpcy5hICogTWF0aC5jb3MobGF0KSk7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHRlbXApO1xuICAgIH1cbiAgICBlbHNlIGlmICgocyAtIEVQU0xOKSA8IEhBTEZfUEkpIHtcbiAgICAgIGxvbiA9IHRoaXMubG9uZzA7XG4gICAgfVxuICB9XG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiU2ludXNvaWRhbFwiLCBcInNpbnVcIl07IiwiLypcbiAgcmVmZXJlbmNlczpcbiAgICBGb3JtdWxlcyBldCBjb25zdGFudGVzIHBvdXIgbGUgQ2FsY3VsIHBvdXIgbGFcbiAgICBwcm9qZWN0aW9uIGN5bGluZHJpcXVlIGNvbmZvcm1lIMOgIGF4ZSBvYmxpcXVlIGV0IHBvdXIgbGEgdHJhbnNmb3JtYXRpb24gZW50cmVcbiAgICBkZXMgc3lzdMOobWVzIGRlIHLDqWbDqXJlbmNlLlxuICAgIGh0dHA6Ly93d3cuc3dpc3N0b3BvLmFkbWluLmNoL2ludGVybmV0L3N3aXNzdG9wby9mci9ob21lL3RvcGljcy9zdXJ2ZXkvc3lzL3JlZnN5cy9zd2l0emVybGFuZC5wYXJzeXNyZWxhdGVkMS4zMTIxNi5kb3dubG9hZExpc3QuNzcwMDQuRG93bmxvYWRGaWxlLnRtcC9zd2lzc3Byb2plY3Rpb25mci5wZGZcbiAgKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGh5MCA9IHRoaXMubGF0MDtcbiAgdGhpcy5sYW1iZGEwID0gdGhpcy5sb25nMDtcbiAgdmFyIHNpblBoeTAgPSBNYXRoLnNpbihwaHkwKTtcbiAgdmFyIHNlbWlNYWpvckF4aXMgPSB0aGlzLmE7XG4gIHZhciBpbnZGID0gdGhpcy5yZjtcbiAgdmFyIGZsYXR0ZW5pbmcgPSAxIC8gaW52RjtcbiAgdmFyIGUyID0gMiAqIGZsYXR0ZW5pbmcgLSBNYXRoLnBvdyhmbGF0dGVuaW5nLCAyKTtcbiAgdmFyIGUgPSB0aGlzLmUgPSBNYXRoLnNxcnQoZTIpO1xuICB0aGlzLlIgPSB0aGlzLmswICogc2VtaU1ham9yQXhpcyAqIE1hdGguc3FydCgxIC0gZTIpIC8gKDEgLSBlMiAqIE1hdGgucG93KHNpblBoeTAsIDIpKTtcbiAgdGhpcy5hbHBoYSA9IE1hdGguc3FydCgxICsgZTIgLyAoMSAtIGUyKSAqIE1hdGgucG93KE1hdGguY29zKHBoeTApLCA0KSk7XG4gIHRoaXMuYjAgPSBNYXRoLmFzaW4oc2luUGh5MCAvIHRoaXMuYWxwaGEpO1xuICB2YXIgazEgPSBNYXRoLmxvZyhNYXRoLnRhbihNYXRoLlBJIC8gNCArIHRoaXMuYjAgLyAyKSk7XG4gIHZhciBrMiA9IE1hdGgubG9nKE1hdGgudGFuKE1hdGguUEkgLyA0ICsgcGh5MCAvIDIpKTtcbiAgdmFyIGszID0gTWF0aC5sb2coKDEgKyBlICogc2luUGh5MCkgLyAoMSAtIGUgKiBzaW5QaHkwKSk7XG4gIHRoaXMuSyA9IGsxIC0gdGhpcy5hbHBoYSAqIGsyICsgdGhpcy5hbHBoYSAqIGUgLyAyICogazM7XG59O1xuXG5cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIFNhMSA9IE1hdGgubG9nKE1hdGgudGFuKE1hdGguUEkgLyA0IC0gcC55IC8gMikpO1xuICB2YXIgU2EyID0gdGhpcy5lIC8gMiAqIE1hdGgubG9nKCgxICsgdGhpcy5lICogTWF0aC5zaW4ocC55KSkgLyAoMSAtIHRoaXMuZSAqIE1hdGguc2luKHAueSkpKTtcbiAgdmFyIFMgPSAtdGhpcy5hbHBoYSAqIChTYTEgKyBTYTIpICsgdGhpcy5LO1xuXG4gIC8vIHNwaGVyaWMgbGF0aXR1ZGVcbiAgdmFyIGIgPSAyICogKE1hdGguYXRhbihNYXRoLmV4cChTKSkgLSBNYXRoLlBJIC8gNCk7XG5cbiAgLy8gc3BoZXJpYyBsb25naXR1ZGVcbiAgdmFyIEkgPSB0aGlzLmFscGhhICogKHAueCAtIHRoaXMubGFtYmRhMCk7XG5cbiAgLy8gcHNvZXVkbyBlcXVhdG9yaWFsIHJvdGF0aW9uXG4gIHZhciByb3RJID0gTWF0aC5hdGFuKE1hdGguc2luKEkpIC8gKE1hdGguc2luKHRoaXMuYjApICogTWF0aC50YW4oYikgKyBNYXRoLmNvcyh0aGlzLmIwKSAqIE1hdGguY29zKEkpKSk7XG5cbiAgdmFyIHJvdEIgPSBNYXRoLmFzaW4oTWF0aC5jb3ModGhpcy5iMCkgKiBNYXRoLnNpbihiKSAtIE1hdGguc2luKHRoaXMuYjApICogTWF0aC5jb3MoYikgKiBNYXRoLmNvcyhJKSk7XG5cbiAgcC55ID0gdGhpcy5SIC8gMiAqIE1hdGgubG9nKCgxICsgTWF0aC5zaW4ocm90QikpIC8gKDEgLSBNYXRoLnNpbihyb3RCKSkpICsgdGhpcy55MDtcbiAgcC54ID0gdGhpcy5SICogcm90SSArIHRoaXMueDA7XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgWSA9IHAueCAtIHRoaXMueDA7XG4gIHZhciBYID0gcC55IC0gdGhpcy55MDtcblxuICB2YXIgcm90SSA9IFkgLyB0aGlzLlI7XG4gIHZhciByb3RCID0gMiAqIChNYXRoLmF0YW4oTWF0aC5leHAoWCAvIHRoaXMuUikpIC0gTWF0aC5QSSAvIDQpO1xuXG4gIHZhciBiID0gTWF0aC5hc2luKE1hdGguY29zKHRoaXMuYjApICogTWF0aC5zaW4ocm90QikgKyBNYXRoLnNpbih0aGlzLmIwKSAqIE1hdGguY29zKHJvdEIpICogTWF0aC5jb3Mocm90SSkpO1xuICB2YXIgSSA9IE1hdGguYXRhbihNYXRoLnNpbihyb3RJKSAvIChNYXRoLmNvcyh0aGlzLmIwKSAqIE1hdGguY29zKHJvdEkpIC0gTWF0aC5zaW4odGhpcy5iMCkgKiBNYXRoLnRhbihyb3RCKSkpO1xuXG4gIHZhciBsYW1iZGEgPSB0aGlzLmxhbWJkYTAgKyBJIC8gdGhpcy5hbHBoYTtcblxuICB2YXIgUyA9IDA7XG4gIHZhciBwaHkgPSBiO1xuICB2YXIgcHJldlBoeSA9IC0xMDAwO1xuICB2YXIgaXRlcmF0aW9uID0gMDtcbiAgd2hpbGUgKE1hdGguYWJzKHBoeSAtIHByZXZQaHkpID4gMC4wMDAwMDAxKSB7XG4gICAgaWYgKCsraXRlcmF0aW9uID4gMjApIHtcbiAgICAgIC8vLi4ucmVwb3J0RXJyb3IoXCJvbWVyY0Z3ZEluZmluaXR5XCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvL1MgPSBNYXRoLmxvZyhNYXRoLnRhbihNYXRoLlBJIC8gNCArIHBoeSAvIDIpKTtcbiAgICBTID0gMSAvIHRoaXMuYWxwaGEgKiAoTWF0aC5sb2coTWF0aC50YW4oTWF0aC5QSSAvIDQgKyBiIC8gMikpIC0gdGhpcy5LKSArIHRoaXMuZSAqIE1hdGgubG9nKE1hdGgudGFuKE1hdGguUEkgLyA0ICsgTWF0aC5hc2luKHRoaXMuZSAqIE1hdGguc2luKHBoeSkpIC8gMikpO1xuICAgIHByZXZQaHkgPSBwaHk7XG4gICAgcGh5ID0gMiAqIE1hdGguYXRhbihNYXRoLmV4cChTKSkgLSBNYXRoLlBJIC8gMjtcbiAgfVxuXG4gIHAueCA9IGxhbWJkYTtcbiAgcC55ID0gcGh5O1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMubmFtZXMgPSBbXCJzb21lcmNcIl07XG4iLCJ2YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgc2lnbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zaWduJyk7XG52YXIgbXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vbXNmbnonKTtcbnZhciB0c2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi90c2ZueicpO1xudmFyIHBoaTJ6ID0gcmVxdWlyZSgnLi4vY29tbW9uL3BoaTJ6Jyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG5leHBvcnRzLnNzZm5fID0gZnVuY3Rpb24ocGhpdCwgc2lucGhpLCBlY2Nlbikge1xuICBzaW5waGkgKj0gZWNjZW47XG4gIHJldHVybiAoTWF0aC50YW4oMC41ICogKEhBTEZfUEkgKyBwaGl0KSkgKiBNYXRoLnBvdygoMSAtIHNpbnBoaSkgLyAoMSArIHNpbnBoaSksIDAuNSAqIGVjY2VuKSk7XG59O1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb3NsYXQwID0gTWF0aC5jb3ModGhpcy5sYXQwKTtcbiAgdGhpcy5zaW5sYXQwID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgaWYgKHRoaXMuazAgPT09IDEgJiYgIWlzTmFOKHRoaXMubGF0X3RzKSAmJiBNYXRoLmFicyh0aGlzLmNvc2xhdDApIDw9IEVQU0xOKSB7XG4gICAgICB0aGlzLmswID0gMC41ICogKDEgKyBzaWduKHRoaXMubGF0MCkgKiBNYXRoLnNpbih0aGlzLmxhdF90cykpO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBpZiAoTWF0aC5hYnModGhpcy5jb3NsYXQwKSA8PSBFUFNMTikge1xuICAgICAgaWYgKHRoaXMubGF0MCA+IDApIHtcbiAgICAgICAgLy9Ob3J0aCBwb2xlXG4gICAgICAgIC8vdHJhY2UoJ3N0ZXJlOm5vcnRoIHBvbGUnKTtcbiAgICAgICAgdGhpcy5jb24gPSAxO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vU291dGggcG9sZVxuICAgICAgICAvL3RyYWNlKCdzdGVyZTpzb3V0aCBwb2xlJyk7XG4gICAgICAgIHRoaXMuY29uID0gLTE7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29ucyA9IE1hdGguc3FydChNYXRoLnBvdygxICsgdGhpcy5lLCAxICsgdGhpcy5lKSAqIE1hdGgucG93KDEgLSB0aGlzLmUsIDEgLSB0aGlzLmUpKTtcbiAgICBpZiAodGhpcy5rMCA9PT0gMSAmJiAhaXNOYU4odGhpcy5sYXRfdHMpICYmIE1hdGguYWJzKHRoaXMuY29zbGF0MCkgPD0gRVBTTE4pIHtcbiAgICAgIHRoaXMuazAgPSAwLjUgKiB0aGlzLmNvbnMgKiBtc2Zueih0aGlzLmUsIE1hdGguc2luKHRoaXMubGF0X3RzKSwgTWF0aC5jb3ModGhpcy5sYXRfdHMpKSAvIHRzZm56KHRoaXMuZSwgdGhpcy5jb24gKiB0aGlzLmxhdF90cywgdGhpcy5jb24gKiBNYXRoLnNpbih0aGlzLmxhdF90cykpO1xuICAgIH1cbiAgICB0aGlzLm1zMSA9IG1zZm56KHRoaXMuZSwgdGhpcy5zaW5sYXQwLCB0aGlzLmNvc2xhdDApO1xuICAgIHRoaXMuWDAgPSAyICogTWF0aC5hdGFuKHRoaXMuc3Nmbl8odGhpcy5sYXQwLCB0aGlzLnNpbmxhdDAsIHRoaXMuZSkpIC0gSEFMRl9QSTtcbiAgICB0aGlzLmNvc1gwID0gTWF0aC5jb3ModGhpcy5YMCk7XG4gICAgdGhpcy5zaW5YMCA9IE1hdGguc2luKHRoaXMuWDApO1xuICB9XG59O1xuXG4vLyBTdGVyZW9ncmFwaGljIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICB2YXIgc2lubGF0ID0gTWF0aC5zaW4obGF0KTtcbiAgdmFyIGNvc2xhdCA9IE1hdGguY29zKGxhdCk7XG4gIHZhciBBLCBYLCBzaW5YLCBjb3NYLCB0cywgcmg7XG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcblxuICBpZiAoTWF0aC5hYnMoTWF0aC5hYnMobG9uIC0gdGhpcy5sb25nMCkgLSBNYXRoLlBJKSA8PSBFUFNMTiAmJiBNYXRoLmFicyhsYXQgKyB0aGlzLmxhdDApIDw9IEVQU0xOKSB7XG4gICAgLy9jYXNlIG9mIHRoZSBvcmlnaW5lIHBvaW50XG4gICAgLy90cmFjZSgnc3RlcmU6dGhpcyBpcyB0aGUgb3JpZ2luIHBvaW50Jyk7XG4gICAgcC54ID0gTmFOO1xuICAgIHAueSA9IE5hTjtcbiAgICByZXR1cm4gcDtcbiAgfVxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICAvL3RyYWNlKCdzdGVyZTpzcGhlcmUgY2FzZScpO1xuICAgIEEgPSAyICogdGhpcy5rMCAvICgxICsgdGhpcy5zaW5sYXQwICogc2lubGF0ICsgdGhpcy5jb3NsYXQwICogY29zbGF0ICogTWF0aC5jb3MoZGxvbikpO1xuICAgIHAueCA9IHRoaXMuYSAqIEEgKiBjb3NsYXQgKiBNYXRoLnNpbihkbG9uKSArIHRoaXMueDA7XG4gICAgcC55ID0gdGhpcy5hICogQSAqICh0aGlzLmNvc2xhdDAgKiBzaW5sYXQgLSB0aGlzLnNpbmxhdDAgKiBjb3NsYXQgKiBNYXRoLmNvcyhkbG9uKSkgKyB0aGlzLnkwO1xuICAgIHJldHVybiBwO1xuICB9XG4gIGVsc2Uge1xuICAgIFggPSAyICogTWF0aC5hdGFuKHRoaXMuc3Nmbl8obGF0LCBzaW5sYXQsIHRoaXMuZSkpIC0gSEFMRl9QSTtcbiAgICBjb3NYID0gTWF0aC5jb3MoWCk7XG4gICAgc2luWCA9IE1hdGguc2luKFgpO1xuICAgIGlmIChNYXRoLmFicyh0aGlzLmNvc2xhdDApIDw9IEVQU0xOKSB7XG4gICAgICB0cyA9IHRzZm56KHRoaXMuZSwgbGF0ICogdGhpcy5jb24sIHRoaXMuY29uICogc2lubGF0KTtcbiAgICAgIHJoID0gMiAqIHRoaXMuYSAqIHRoaXMuazAgKiB0cyAvIHRoaXMuY29ucztcbiAgICAgIHAueCA9IHRoaXMueDAgKyByaCAqIE1hdGguc2luKGxvbiAtIHRoaXMubG9uZzApO1xuICAgICAgcC55ID0gdGhpcy55MCAtIHRoaXMuY29uICogcmggKiBNYXRoLmNvcyhsb24gLSB0aGlzLmxvbmcwKTtcbiAgICAgIC8vdHJhY2UocC50b1N0cmluZygpKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBlbHNlIGlmIChNYXRoLmFicyh0aGlzLnNpbmxhdDApIDwgRVBTTE4pIHtcbiAgICAgIC8vRXFcbiAgICAgIC8vdHJhY2UoJ3N0ZXJlOmVxdWF0ZXVyJyk7XG4gICAgICBBID0gMiAqIHRoaXMuYSAqIHRoaXMuazAgLyAoMSArIGNvc1ggKiBNYXRoLmNvcyhkbG9uKSk7XG4gICAgICBwLnkgPSBBICogc2luWDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvL290aGVyIGNhc2VcbiAgICAgIC8vdHJhY2UoJ3N0ZXJlOm5vcm1hbCBjYXNlJyk7XG4gICAgICBBID0gMiAqIHRoaXMuYSAqIHRoaXMuazAgKiB0aGlzLm1zMSAvICh0aGlzLmNvc1gwICogKDEgKyB0aGlzLnNpblgwICogc2luWCArIHRoaXMuY29zWDAgKiBjb3NYICogTWF0aC5jb3MoZGxvbikpKTtcbiAgICAgIHAueSA9IEEgKiAodGhpcy5jb3NYMCAqIHNpblggLSB0aGlzLnNpblgwICogY29zWCAqIE1hdGguY29zKGRsb24pKSArIHRoaXMueTA7XG4gICAgfVxuICAgIHAueCA9IEEgKiBjb3NYICogTWF0aC5zaW4oZGxvbikgKyB0aGlzLngwO1xuICB9XG4gIC8vdHJhY2UocC50b1N0cmluZygpKTtcbiAgcmV0dXJuIHA7XG59O1xuXG5cbi8vKiBTdGVyZW9ncmFwaGljIGludmVyc2UgZXF1YXRpb25zLS1tYXBwaW5nIHgseSB0byBsYXQvbG9uZ1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICBwLnggLT0gdGhpcy54MDtcbiAgcC55IC09IHRoaXMueTA7XG4gIHZhciBsb24sIGxhdCwgdHMsIGNlLCBDaGk7XG4gIHZhciByaCA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICB2YXIgYyA9IDIgKiBNYXRoLmF0YW4ocmggLyAoMC41ICogdGhpcy5hICogdGhpcy5rMCkpO1xuICAgIGxvbiA9IHRoaXMubG9uZzA7XG4gICAgbGF0ID0gdGhpcy5sYXQwO1xuICAgIGlmIChyaCA8PSBFUFNMTikge1xuICAgICAgcC54ID0gbG9uO1xuICAgICAgcC55ID0gbGF0O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGxhdCA9IE1hdGguYXNpbihNYXRoLmNvcyhjKSAqIHRoaXMuc2lubGF0MCArIHAueSAqIE1hdGguc2luKGMpICogdGhpcy5jb3NsYXQwIC8gcmgpO1xuICAgIGlmIChNYXRoLmFicyh0aGlzLmNvc2xhdDApIDwgRVBTTE4pIHtcbiAgICAgIGlmICh0aGlzLmxhdDAgPiAwKSB7XG4gICAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXRhbjIocC54LCAtIDEgKiBwLnkpKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCwgcC55KSk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLnggKiBNYXRoLnNpbihjKSwgcmggKiB0aGlzLmNvc2xhdDAgKiBNYXRoLmNvcyhjKSAtIHAueSAqIHRoaXMuc2lubGF0MCAqIE1hdGguc2luKGMpKSk7XG4gICAgfVxuICAgIHAueCA9IGxvbjtcbiAgICBwLnkgPSBsYXQ7XG4gICAgcmV0dXJuIHA7XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKE1hdGguYWJzKHRoaXMuY29zbGF0MCkgPD0gRVBTTE4pIHtcbiAgICAgIGlmIChyaCA8PSBFUFNMTikge1xuICAgICAgICBsYXQgPSB0aGlzLmxhdDA7XG4gICAgICAgIGxvbiA9IHRoaXMubG9uZzA7XG4gICAgICAgIHAueCA9IGxvbjtcbiAgICAgICAgcC55ID0gbGF0O1xuICAgICAgICAvL3RyYWNlKHAudG9TdHJpbmcoKSk7XG4gICAgICAgIHJldHVybiBwO1xuICAgICAgfVxuICAgICAgcC54ICo9IHRoaXMuY29uO1xuICAgICAgcC55ICo9IHRoaXMuY29uO1xuICAgICAgdHMgPSByaCAqIHRoaXMuY29ucyAvICgyICogdGhpcy5hICogdGhpcy5rMCk7XG4gICAgICBsYXQgPSB0aGlzLmNvbiAqIHBoaTJ6KHRoaXMuZSwgdHMpO1xuICAgICAgbG9uID0gdGhpcy5jb24gKiBhZGp1c3RfbG9uKHRoaXMuY29uICogdGhpcy5sb25nMCArIE1hdGguYXRhbjIocC54LCAtIDEgKiBwLnkpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjZSA9IDIgKiBNYXRoLmF0YW4ocmggKiB0aGlzLmNvc1gwIC8gKDIgKiB0aGlzLmEgKiB0aGlzLmswICogdGhpcy5tczEpKTtcbiAgICAgIGxvbiA9IHRoaXMubG9uZzA7XG4gICAgICBpZiAocmggPD0gRVBTTE4pIHtcbiAgICAgICAgQ2hpID0gdGhpcy5YMDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBDaGkgPSBNYXRoLmFzaW4oTWF0aC5jb3MoY2UpICogdGhpcy5zaW5YMCArIHAueSAqIE1hdGguc2luKGNlKSAqIHRoaXMuY29zWDAgLyByaCk7XG4gICAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXRhbjIocC54ICogTWF0aC5zaW4oY2UpLCByaCAqIHRoaXMuY29zWDAgKiBNYXRoLmNvcyhjZSkgLSBwLnkgKiB0aGlzLnNpblgwICogTWF0aC5zaW4oY2UpKSk7XG4gICAgICB9XG4gICAgICBsYXQgPSAtMSAqIHBoaTJ6KHRoaXMuZSwgTWF0aC50YW4oMC41ICogKEhBTEZfUEkgKyBDaGkpKSk7XG4gICAgfVxuICB9XG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuXG4gIC8vdHJhY2UocC50b1N0cmluZygpKTtcbiAgcmV0dXJuIHA7XG5cbn07XG5leHBvcnRzLm5hbWVzID0gW1wic3RlcmVcIiwgXCJTdGVyZW9ncmFwaGljX1NvdXRoX1BvbGVcIiwgXCJQb2xhciBTdGVyZW9ncmFwaGljICh2YXJpYW50IEIpXCJdO1xuIiwidmFyIGdhdXNzID0gcmVxdWlyZSgnLi9nYXVzcycpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIGdhdXNzLmluaXQuYXBwbHkodGhpcyk7XG4gIGlmICghdGhpcy5yYykge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnNpbmMwID0gTWF0aC5zaW4odGhpcy5waGljMCk7XG4gIHRoaXMuY29zYzAgPSBNYXRoLmNvcyh0aGlzLnBoaWMwKTtcbiAgdGhpcy5SMiA9IDIgKiB0aGlzLnJjO1xuICBpZiAoIXRoaXMudGl0bGUpIHtcbiAgICB0aGlzLnRpdGxlID0gXCJPYmxpcXVlIFN0ZXJlb2dyYXBoaWMgQWx0ZXJuYXRpdmVcIjtcbiAgfVxufTtcblxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgc2luYywgY29zYywgY29zbCwgaztcbiAgcC54ID0gYWRqdXN0X2xvbihwLnggLSB0aGlzLmxvbmcwKTtcbiAgZ2F1c3MuZm9yd2FyZC5hcHBseSh0aGlzLCBbcF0pO1xuICBzaW5jID0gTWF0aC5zaW4ocC55KTtcbiAgY29zYyA9IE1hdGguY29zKHAueSk7XG4gIGNvc2wgPSBNYXRoLmNvcyhwLngpO1xuICBrID0gdGhpcy5rMCAqIHRoaXMuUjIgLyAoMSArIHRoaXMuc2luYzAgKiBzaW5jICsgdGhpcy5jb3NjMCAqIGNvc2MgKiBjb3NsKTtcbiAgcC54ID0gayAqIGNvc2MgKiBNYXRoLnNpbihwLngpO1xuICBwLnkgPSBrICogKHRoaXMuY29zYzAgKiBzaW5jIC0gdGhpcy5zaW5jMCAqIGNvc2MgKiBjb3NsKTtcbiAgcC54ID0gdGhpcy5hICogcC54ICsgdGhpcy54MDtcbiAgcC55ID0gdGhpcy5hICogcC55ICsgdGhpcy55MDtcbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBzaW5jLCBjb3NjLCBsb24sIGxhdCwgcmhvO1xuICBwLnggPSAocC54IC0gdGhpcy54MCkgLyB0aGlzLmE7XG4gIHAueSA9IChwLnkgLSB0aGlzLnkwKSAvIHRoaXMuYTtcblxuICBwLnggLz0gdGhpcy5rMDtcbiAgcC55IC89IHRoaXMuazA7XG4gIGlmICgocmhvID0gTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSkpKSB7XG4gICAgdmFyIGMgPSAyICogTWF0aC5hdGFuMihyaG8sIHRoaXMuUjIpO1xuICAgIHNpbmMgPSBNYXRoLnNpbihjKTtcbiAgICBjb3NjID0gTWF0aC5jb3MoYyk7XG4gICAgbGF0ID0gTWF0aC5hc2luKGNvc2MgKiB0aGlzLnNpbmMwICsgcC55ICogc2luYyAqIHRoaXMuY29zYzAgLyByaG8pO1xuICAgIGxvbiA9IE1hdGguYXRhbjIocC54ICogc2luYywgcmhvICogdGhpcy5jb3NjMCAqIGNvc2MgLSBwLnkgKiB0aGlzLnNpbmMwICogc2luYyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgbGF0ID0gdGhpcy5waGljMDtcbiAgICBsb24gPSAwO1xuICB9XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIGdhdXNzLmludmVyc2UuYXBwbHkodGhpcywgW3BdKTtcbiAgcC54ID0gYWRqdXN0X2xvbihwLnggKyB0aGlzLmxvbmcwKTtcbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLm5hbWVzID0gW1wiU3RlcmVvZ3JhcGhpY19Ob3J0aF9Qb2xlXCIsIFwiT2JsaXF1ZV9TdGVyZW9ncmFwaGljXCIsIFwiUG9sYXJfU3RlcmVvZ3JhcGhpY1wiLCBcInN0ZXJlYVwiLFwiT2JsaXF1ZSBTdGVyZW9ncmFwaGljIEFsdGVybmF0aXZlXCJdO1xuIiwidmFyIGUwZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTBmbicpO1xudmFyIGUxZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTFmbicpO1xudmFyIGUyZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTJmbicpO1xudmFyIGUzZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTNmbicpO1xudmFyIG1sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vbWxmbicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIHNpZ24gPSByZXF1aXJlKCcuLi9jb21tb24vc2lnbicpO1xudmFyIGFzaW56ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FzaW56Jyk7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmUwID0gZTBmbih0aGlzLmVzKTtcbiAgdGhpcy5lMSA9IGUxZm4odGhpcy5lcyk7XG4gIHRoaXMuZTIgPSBlMmZuKHRoaXMuZXMpO1xuICB0aGlzLmUzID0gZTNmbih0aGlzLmVzKTtcbiAgdGhpcy5tbDAgPSB0aGlzLmEgKiBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIHRoaXMubGF0MCk7XG59O1xuXG4vKipcbiAgICBUcmFuc3ZlcnNlIE1lcmNhdG9yIEZvcndhcmQgIC0gbG9uZy9sYXQgdG8geC95XG4gICAgbG9uZy9sYXQgaW4gcmFkaWFuc1xuICAqL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuXG4gIHZhciBkZWx0YV9sb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICB2YXIgY29uO1xuICB2YXIgeCwgeTtcbiAgdmFyIHNpbl9waGkgPSBNYXRoLnNpbihsYXQpO1xuICB2YXIgY29zX3BoaSA9IE1hdGguY29zKGxhdCk7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgdmFyIGIgPSBjb3NfcGhpICogTWF0aC5zaW4oZGVsdGFfbG9uKTtcbiAgICBpZiAoKE1hdGguYWJzKE1hdGguYWJzKGIpIC0gMSkpIDwgMC4wMDAwMDAwMDAxKSB7XG4gICAgICByZXR1cm4gKDkzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB4ID0gMC41ICogdGhpcy5hICogdGhpcy5rMCAqIE1hdGgubG9nKCgxICsgYikgLyAoMSAtIGIpKTtcbiAgICAgIGNvbiA9IE1hdGguYWNvcyhjb3NfcGhpICogTWF0aC5jb3MoZGVsdGFfbG9uKSAvIE1hdGguc3FydCgxIC0gYiAqIGIpKTtcbiAgICAgIGlmIChsYXQgPCAwKSB7XG4gICAgICAgIGNvbiA9IC1jb247XG4gICAgICB9XG4gICAgICB5ID0gdGhpcy5hICogdGhpcy5rMCAqIChjb24gLSB0aGlzLmxhdDApO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgYWwgPSBjb3NfcGhpICogZGVsdGFfbG9uO1xuICAgIHZhciBhbHMgPSBNYXRoLnBvdyhhbCwgMik7XG4gICAgdmFyIGMgPSB0aGlzLmVwMiAqIE1hdGgucG93KGNvc19waGksIDIpO1xuICAgIHZhciB0cSA9IE1hdGgudGFuKGxhdCk7XG4gICAgdmFyIHQgPSBNYXRoLnBvdyh0cSwgMik7XG4gICAgY29uID0gMSAtIHRoaXMuZXMgKiBNYXRoLnBvdyhzaW5fcGhpLCAyKTtcbiAgICB2YXIgbiA9IHRoaXMuYSAvIE1hdGguc3FydChjb24pO1xuICAgIHZhciBtbCA9IHRoaXMuYSAqIG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgbGF0KTtcblxuICAgIHggPSB0aGlzLmswICogbiAqIGFsICogKDEgKyBhbHMgLyA2ICogKDEgLSB0ICsgYyArIGFscyAvIDIwICogKDUgLSAxOCAqIHQgKyBNYXRoLnBvdyh0LCAyKSArIDcyICogYyAtIDU4ICogdGhpcy5lcDIpKSkgKyB0aGlzLngwO1xuICAgIHkgPSB0aGlzLmswICogKG1sIC0gdGhpcy5tbDAgKyBuICogdHEgKiAoYWxzICogKDAuNSArIGFscyAvIDI0ICogKDUgLSB0ICsgOSAqIGMgKyA0ICogTWF0aC5wb3coYywgMikgKyBhbHMgLyAzMCAqICg2MSAtIDU4ICogdCArIE1hdGgucG93KHQsIDIpICsgNjAwICogYyAtIDMzMCAqIHRoaXMuZXAyKSkpKSkgKyB0aGlzLnkwO1xuXG4gIH1cbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKipcbiAgICBUcmFuc3ZlcnNlIE1lcmNhdG9yIEludmVyc2UgIC0gIHgveSB0byBsb25nL2xhdFxuICAqL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgY29uLCBwaGk7XG4gIHZhciBkZWx0YV9waGk7XG4gIHZhciBpO1xuICB2YXIgbWF4X2l0ZXIgPSA2O1xuICB2YXIgbGF0LCBsb247XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgdmFyIGYgPSBNYXRoLmV4cChwLnggLyAodGhpcy5hICogdGhpcy5rMCkpO1xuICAgIHZhciBnID0gMC41ICogKGYgLSAxIC8gZik7XG4gICAgdmFyIHRlbXAgPSB0aGlzLmxhdDAgKyBwLnkgLyAodGhpcy5hICogdGhpcy5rMCk7XG4gICAgdmFyIGggPSBNYXRoLmNvcyh0ZW1wKTtcbiAgICBjb24gPSBNYXRoLnNxcnQoKDEgLSBoICogaCkgLyAoMSArIGcgKiBnKSk7XG4gICAgbGF0ID0gYXNpbnooY29uKTtcbiAgICBpZiAodGVtcCA8IDApIHtcbiAgICAgIGxhdCA9IC1sYXQ7XG4gICAgfVxuICAgIGlmICgoZyA9PT0gMCkgJiYgKGggPT09IDApKSB7XG4gICAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24oTWF0aC5hdGFuMihnLCBoKSArIHRoaXMubG9uZzApO1xuICAgIH1cbiAgfVxuICBlbHNlIHsgLy8gZWxsaXBzb2lkYWwgZm9ybVxuICAgIHZhciB4ID0gcC54IC0gdGhpcy54MDtcbiAgICB2YXIgeSA9IHAueSAtIHRoaXMueTA7XG5cbiAgICBjb24gPSAodGhpcy5tbDAgKyB5IC8gdGhpcy5rMCkgLyB0aGlzLmE7XG4gICAgcGhpID0gY29uO1xuICAgIGZvciAoaSA9IDA7IHRydWU7IGkrKykge1xuICAgICAgZGVsdGFfcGhpID0gKChjb24gKyB0aGlzLmUxICogTWF0aC5zaW4oMiAqIHBoaSkgLSB0aGlzLmUyICogTWF0aC5zaW4oNCAqIHBoaSkgKyB0aGlzLmUzICogTWF0aC5zaW4oNiAqIHBoaSkpIC8gdGhpcy5lMCkgLSBwaGk7XG4gICAgICBwaGkgKz0gZGVsdGFfcGhpO1xuICAgICAgaWYgKE1hdGguYWJzKGRlbHRhX3BoaSkgPD0gRVBTTE4pIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoaSA+PSBtYXhfaXRlcikge1xuICAgICAgICByZXR1cm4gKDk1KTtcbiAgICAgIH1cbiAgICB9IC8vIGZvcigpXG4gICAgaWYgKE1hdGguYWJzKHBoaSkgPCBIQUxGX1BJKSB7XG4gICAgICB2YXIgc2luX3BoaSA9IE1hdGguc2luKHBoaSk7XG4gICAgICB2YXIgY29zX3BoaSA9IE1hdGguY29zKHBoaSk7XG4gICAgICB2YXIgdGFuX3BoaSA9IE1hdGgudGFuKHBoaSk7XG4gICAgICB2YXIgYyA9IHRoaXMuZXAyICogTWF0aC5wb3coY29zX3BoaSwgMik7XG4gICAgICB2YXIgY3MgPSBNYXRoLnBvdyhjLCAyKTtcbiAgICAgIHZhciB0ID0gTWF0aC5wb3codGFuX3BoaSwgMik7XG4gICAgICB2YXIgdHMgPSBNYXRoLnBvdyh0LCAyKTtcbiAgICAgIGNvbiA9IDEgLSB0aGlzLmVzICogTWF0aC5wb3coc2luX3BoaSwgMik7XG4gICAgICB2YXIgbiA9IHRoaXMuYSAvIE1hdGguc3FydChjb24pO1xuICAgICAgdmFyIHIgPSBuICogKDEgLSB0aGlzLmVzKSAvIGNvbjtcbiAgICAgIHZhciBkID0geCAvIChuICogdGhpcy5rMCk7XG4gICAgICB2YXIgZHMgPSBNYXRoLnBvdyhkLCAyKTtcbiAgICAgIGxhdCA9IHBoaSAtIChuICogdGFuX3BoaSAqIGRzIC8gcikgKiAoMC41IC0gZHMgLyAyNCAqICg1ICsgMyAqIHQgKyAxMCAqIGMgLSA0ICogY3MgLSA5ICogdGhpcy5lcDIgLSBkcyAvIDMwICogKDYxICsgOTAgKiB0ICsgMjk4ICogYyArIDQ1ICogdHMgLSAyNTIgKiB0aGlzLmVwMiAtIDMgKiBjcykpKTtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIChkICogKDEgLSBkcyAvIDYgKiAoMSArIDIgKiB0ICsgYyAtIGRzIC8gMjAgKiAoNSAtIDIgKiBjICsgMjggKiB0IC0gMyAqIGNzICsgOCAqIHRoaXMuZXAyICsgMjQgKiB0cykpKSAvIGNvc19waGkpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsYXQgPSBIQUxGX1BJICogc2lnbih5KTtcbiAgICAgIGxvbiA9IHRoaXMubG9uZzA7XG4gICAgfVxuICB9XG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiVHJhbnN2ZXJzZV9NZXJjYXRvclwiLCBcIlRyYW5zdmVyc2UgTWVyY2F0b3JcIiwgXCJ0bWVyY1wiXTtcbiIsInZhciBEMlIgPSAwLjAxNzQ1MzI5MjUxOTk0MzI5NTc3O1xudmFyIHRtZXJjID0gcmVxdWlyZSgnLi90bWVyYycpO1xuZXhwb3J0cy5kZXBlbmRzT24gPSAndG1lcmMnO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy56b25lKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMubGF0MCA9IDA7XG4gIHRoaXMubG9uZzAgPSAoKDYgKiBNYXRoLmFicyh0aGlzLnpvbmUpKSAtIDE4MykgKiBEMlI7XG4gIHRoaXMueDAgPSA1MDAwMDA7XG4gIHRoaXMueTAgPSB0aGlzLnV0bVNvdXRoID8gMTAwMDAwMDAgOiAwO1xuICB0aGlzLmswID0gMC45OTk2O1xuXG4gIHRtZXJjLmluaXQuYXBwbHkodGhpcyk7XG4gIHRoaXMuZm9yd2FyZCA9IHRtZXJjLmZvcndhcmQ7XG4gIHRoaXMuaW52ZXJzZSA9IHRtZXJjLmludmVyc2U7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIlVuaXZlcnNhbCBUcmFuc3ZlcnNlIE1lcmNhdG9yIFN5c3RlbVwiLCBcInV0bVwiXTtcbiIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBhc2lueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hc2lueicpO1xuLyogSW5pdGlhbGl6ZSB0aGUgVmFuIERlciBHcmludGVuIHByb2plY3Rpb25cbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgLy90aGlzLlIgPSA2MzcwOTk3OyAvL1JhZGl1cyBvZiBlYXJ0aFxuICB0aGlzLlIgPSB0aGlzLmE7XG59O1xuXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG5cbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcblxuICAvKiBGb3J3YXJkIGVxdWF0aW9uc1xuICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdmFyIGRsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICB2YXIgeCwgeTtcblxuICBpZiAoTWF0aC5hYnMobGF0KSA8PSBFUFNMTikge1xuICAgIHggPSB0aGlzLngwICsgdGhpcy5SICogZGxvbjtcbiAgICB5ID0gdGhpcy55MDtcbiAgfVxuICB2YXIgdGhldGEgPSBhc2lueigyICogTWF0aC5hYnMobGF0IC8gTWF0aC5QSSkpO1xuICBpZiAoKE1hdGguYWJzKGRsb24pIDw9IEVQU0xOKSB8fCAoTWF0aC5hYnMoTWF0aC5hYnMobGF0KSAtIEhBTEZfUEkpIDw9IEVQU0xOKSkge1xuICAgIHggPSB0aGlzLngwO1xuICAgIGlmIChsYXQgPj0gMCkge1xuICAgICAgeSA9IHRoaXMueTAgKyBNYXRoLlBJICogdGhpcy5SICogTWF0aC50YW4oMC41ICogdGhldGEpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHkgPSB0aGlzLnkwICsgTWF0aC5QSSAqIHRoaXMuUiAqIC1NYXRoLnRhbigwLjUgKiB0aGV0YSk7XG4gICAgfVxuICAgIC8vICByZXR1cm4oT0spO1xuICB9XG4gIHZhciBhbCA9IDAuNSAqIE1hdGguYWJzKChNYXRoLlBJIC8gZGxvbikgLSAoZGxvbiAvIE1hdGguUEkpKTtcbiAgdmFyIGFzcSA9IGFsICogYWw7XG4gIHZhciBzaW50aCA9IE1hdGguc2luKHRoZXRhKTtcbiAgdmFyIGNvc3RoID0gTWF0aC5jb3ModGhldGEpO1xuXG4gIHZhciBnID0gY29zdGggLyAoc2ludGggKyBjb3N0aCAtIDEpO1xuICB2YXIgZ3NxID0gZyAqIGc7XG4gIHZhciBtID0gZyAqICgyIC8gc2ludGggLSAxKTtcbiAgdmFyIG1zcSA9IG0gKiBtO1xuICB2YXIgY29uID0gTWF0aC5QSSAqIHRoaXMuUiAqIChhbCAqIChnIC0gbXNxKSArIE1hdGguc3FydChhc3EgKiAoZyAtIG1zcSkgKiAoZyAtIG1zcSkgLSAobXNxICsgYXNxKSAqIChnc3EgLSBtc3EpKSkgLyAobXNxICsgYXNxKTtcbiAgaWYgKGRsb24gPCAwKSB7XG4gICAgY29uID0gLWNvbjtcbiAgfVxuICB4ID0gdGhpcy54MCArIGNvbjtcbiAgLy9jb24gPSBNYXRoLmFicyhjb24gLyAoTWF0aC5QSSAqIHRoaXMuUikpO1xuICB2YXIgcSA9IGFzcSArIGc7XG4gIGNvbiA9IE1hdGguUEkgKiB0aGlzLlIgKiAobSAqIHEgLSBhbCAqIE1hdGguc3FydCgobXNxICsgYXNxKSAqIChhc3EgKyAxKSAtIHEgKiBxKSkgLyAobXNxICsgYXNxKTtcbiAgaWYgKGxhdCA+PSAwKSB7XG4gICAgLy95ID0gdGhpcy55MCArIE1hdGguUEkgKiB0aGlzLlIgKiBNYXRoLnNxcnQoMSAtIGNvbiAqIGNvbiAtIDIgKiBhbCAqIGNvbik7XG4gICAgeSA9IHRoaXMueTAgKyBjb247XG4gIH1cbiAgZWxzZSB7XG4gICAgLy95ID0gdGhpcy55MCAtIE1hdGguUEkgKiB0aGlzLlIgKiBNYXRoLnNxcnQoMSAtIGNvbiAqIGNvbiAtIDIgKiBhbCAqIGNvbik7XG4gICAgeSA9IHRoaXMueTAgLSBjb247XG4gIH1cbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBWYW4gRGVyIEdyaW50ZW4gaW52ZXJzZSBlcXVhdGlvbnMtLW1hcHBpbmcgeCx5IHRvIGxhdC9sb25nXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24sIGxhdDtcbiAgdmFyIHh4LCB5eSwgeHlzLCBjMSwgYzIsIGMzO1xuICB2YXIgYTE7XG4gIHZhciBtMTtcbiAgdmFyIGNvbjtcbiAgdmFyIHRoMTtcbiAgdmFyIGQ7XG5cbiAgLyogaW52ZXJzZSBlcXVhdGlvbnNcbiAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgLT0gdGhpcy55MDtcbiAgY29uID0gTWF0aC5QSSAqIHRoaXMuUjtcbiAgeHggPSBwLnggLyBjb247XG4gIHl5ID0gcC55IC8gY29uO1xuICB4eXMgPSB4eCAqIHh4ICsgeXkgKiB5eTtcbiAgYzEgPSAtTWF0aC5hYnMoeXkpICogKDEgKyB4eXMpO1xuICBjMiA9IGMxIC0gMiAqIHl5ICogeXkgKyB4eCAqIHh4O1xuICBjMyA9IC0yICogYzEgKyAxICsgMiAqIHl5ICogeXkgKyB4eXMgKiB4eXM7XG4gIGQgPSB5eSAqIHl5IC8gYzMgKyAoMiAqIGMyICogYzIgKiBjMiAvIGMzIC8gYzMgLyBjMyAtIDkgKiBjMSAqIGMyIC8gYzMgLyBjMykgLyAyNztcbiAgYTEgPSAoYzEgLSBjMiAqIGMyIC8gMyAvIGMzKSAvIGMzO1xuICBtMSA9IDIgKiBNYXRoLnNxcnQoLWExIC8gMyk7XG4gIGNvbiA9ICgoMyAqIGQpIC8gYTEpIC8gbTE7XG4gIGlmIChNYXRoLmFicyhjb24pID4gMSkge1xuICAgIGlmIChjb24gPj0gMCkge1xuICAgICAgY29uID0gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb24gPSAtMTtcbiAgICB9XG4gIH1cbiAgdGgxID0gTWF0aC5hY29zKGNvbikgLyAzO1xuICBpZiAocC55ID49IDApIHtcbiAgICBsYXQgPSAoLW0xICogTWF0aC5jb3ModGgxICsgTWF0aC5QSSAvIDMpIC0gYzIgLyAzIC8gYzMpICogTWF0aC5QSTtcbiAgfVxuICBlbHNlIHtcbiAgICBsYXQgPSAtKC1tMSAqIE1hdGguY29zKHRoMSArIE1hdGguUEkgLyAzKSAtIGMyIC8gMyAvIGMzKSAqIE1hdGguUEk7XG4gIH1cblxuICBpZiAoTWF0aC5hYnMoeHgpIDwgRVBTTE4pIHtcbiAgICBsb24gPSB0aGlzLmxvbmcwO1xuICB9XG4gIGVsc2Uge1xuICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguUEkgKiAoeHlzIC0gMSArIE1hdGguc3FydCgxICsgMiAqICh4eCAqIHh4IC0geXkgKiB5eSkgKyB4eXMgKiB4eXMpKSAvIDIgLyB4eCk7XG4gIH1cblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIlZhbl9kZXJfR3JpbnRlbl9JXCIsIFwiVmFuRGVyR3JpbnRlblwiLCBcInZhbmRnXCJdOyIsInZhciBEMlIgPSAwLjAxNzQ1MzI5MjUxOTk0MzI5NTc3O1xudmFyIFIyRCA9IDU3LjI5NTc3OTUxMzA4MjMyMDg4O1xudmFyIFBKRF8zUEFSQU0gPSAxO1xudmFyIFBKRF83UEFSQU0gPSAyO1xudmFyIGRhdHVtX3RyYW5zZm9ybSA9IHJlcXVpcmUoJy4vZGF0dW1fdHJhbnNmb3JtJyk7XG52YXIgYWRqdXN0X2F4aXMgPSByZXF1aXJlKCcuL2FkanVzdF9heGlzJyk7XG52YXIgcHJvaiA9IHJlcXVpcmUoJy4vUHJvaicpO1xudmFyIHRvUG9pbnQgPSByZXF1aXJlKCcuL2NvbW1vbi90b1BvaW50Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybShzb3VyY2UsIGRlc3QsIHBvaW50KSB7XG4gIHZhciB3Z3M4NDtcbiAgaWYgKEFycmF5LmlzQXJyYXkocG9pbnQpKSB7XG4gICAgcG9pbnQgPSB0b1BvaW50KHBvaW50KTtcbiAgfVxuICBmdW5jdGlvbiBjaGVja05vdFdHUyhzb3VyY2UsIGRlc3QpIHtcbiAgICByZXR1cm4gKChzb3VyY2UuZGF0dW0uZGF0dW1fdHlwZSA9PT0gUEpEXzNQQVJBTSB8fCBzb3VyY2UuZGF0dW0uZGF0dW1fdHlwZSA9PT0gUEpEXzdQQVJBTSkgJiYgZGVzdC5kYXR1bUNvZGUgIT09IFwiV0dTODRcIik7XG4gIH1cblxuICAvLyBXb3JrYXJvdW5kIGZvciBkYXR1bSBzaGlmdHMgdG93Z3M4NCwgaWYgZWl0aGVyIHNvdXJjZSBvciBkZXN0aW5hdGlvbiBwcm9qZWN0aW9uIGlzIG5vdCB3Z3M4NFxuICBpZiAoc291cmNlLmRhdHVtICYmIGRlc3QuZGF0dW0gJiYgKGNoZWNrTm90V0dTKHNvdXJjZSwgZGVzdCkgfHwgY2hlY2tOb3RXR1MoZGVzdCwgc291cmNlKSkpIHtcbiAgICB3Z3M4NCA9IG5ldyBwcm9qKCdXR1M4NCcpO1xuICAgIHRyYW5zZm9ybShzb3VyY2UsIHdnczg0LCBwb2ludCk7XG4gICAgc291cmNlID0gd2dzODQ7XG4gIH1cbiAgLy8gREdSLCAyMDEwLzExLzEyXG4gIGlmIChzb3VyY2UuYXhpcyAhPT0gXCJlbnVcIikge1xuICAgIGFkanVzdF9heGlzKHNvdXJjZSwgZmFsc2UsIHBvaW50KTtcbiAgfVxuICAvLyBUcmFuc2Zvcm0gc291cmNlIHBvaW50cyB0byBsb25nL2xhdCwgaWYgdGhleSBhcmVuJ3QgYWxyZWFkeS5cbiAgaWYgKHNvdXJjZS5wcm9qTmFtZSA9PT0gXCJsb25nbGF0XCIpIHtcbiAgICBwb2ludC54ICo9IEQyUjsgLy8gY29udmVydCBkZWdyZWVzIHRvIHJhZGlhbnNcbiAgICBwb2ludC55ICo9IEQyUjtcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAoc291cmNlLnRvX21ldGVyKSB7XG4gICAgICBwb2ludC54ICo9IHNvdXJjZS50b19tZXRlcjtcbiAgICAgIHBvaW50LnkgKj0gc291cmNlLnRvX21ldGVyO1xuICAgIH1cbiAgICBzb3VyY2UuaW52ZXJzZShwb2ludCk7IC8vIENvbnZlcnQgQ2FydGVzaWFuIHRvIGxvbmdsYXRcbiAgfVxuICAvLyBBZGp1c3QgZm9yIHRoZSBwcmltZSBtZXJpZGlhbiBpZiBuZWNlc3NhcnlcbiAgaWYgKHNvdXJjZS5mcm9tX2dyZWVud2ljaCkge1xuICAgIHBvaW50LnggKz0gc291cmNlLmZyb21fZ3JlZW53aWNoO1xuICB9XG5cbiAgLy8gQ29udmVydCBkYXR1bXMgaWYgbmVlZGVkLCBhbmQgaWYgcG9zc2libGUuXG4gIHBvaW50ID0gZGF0dW1fdHJhbnNmb3JtKHNvdXJjZS5kYXR1bSwgZGVzdC5kYXR1bSwgcG9pbnQpO1xuXG4gIC8vIEFkanVzdCBmb3IgdGhlIHByaW1lIG1lcmlkaWFuIGlmIG5lY2Vzc2FyeVxuICBpZiAoZGVzdC5mcm9tX2dyZWVud2ljaCkge1xuICAgIHBvaW50LnggLT0gZGVzdC5mcm9tX2dyZWVud2ljaDtcbiAgfVxuXG4gIGlmIChkZXN0LnByb2pOYW1lID09PSBcImxvbmdsYXRcIikge1xuICAgIC8vIGNvbnZlcnQgcmFkaWFucyB0byBkZWNpbWFsIGRlZ3JlZXNcbiAgICBwb2ludC54ICo9IFIyRDtcbiAgICBwb2ludC55ICo9IFIyRDtcbiAgfVxuICBlbHNlIHsgLy8gZWxzZSBwcm9qZWN0XG4gICAgZGVzdC5mb3J3YXJkKHBvaW50KTtcbiAgICBpZiAoZGVzdC50b19tZXRlcikge1xuICAgICAgcG9pbnQueCAvPSBkZXN0LnRvX21ldGVyO1xuICAgICAgcG9pbnQueSAvPSBkZXN0LnRvX21ldGVyO1xuICAgIH1cbiAgfVxuXG4gIC8vIERHUiwgMjAxMC8xMS8xMlxuICBpZiAoZGVzdC5heGlzICE9PSBcImVudVwiKSB7XG4gICAgYWRqdXN0X2F4aXMoZGVzdCwgdHJ1ZSwgcG9pbnQpO1xuICB9XG5cbiAgcmV0dXJuIHBvaW50O1xufTsiLCJ2YXIgRDJSID0gMC4wMTc0NTMyOTI1MTk5NDMyOTU3NztcbnZhciBleHRlbmQgPSByZXF1aXJlKCcuL2V4dGVuZCcpO1xuXG5mdW5jdGlvbiBtYXBpdChvYmosIGtleSwgdikge1xuICBvYmpba2V5XSA9IHYubWFwKGZ1bmN0aW9uKGFhKSB7XG4gICAgdmFyIG8gPSB7fTtcbiAgICBzRXhwcihhYSwgbyk7XG4gICAgcmV0dXJuIG87XG4gIH0pLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGV4dGVuZChhLCBiKTtcbiAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBzRXhwcih2LCBvYmopIHtcbiAgdmFyIGtleTtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHYpKSB7XG4gICAgb2JqW3ZdID0gdHJ1ZTtcbiAgICByZXR1cm47XG4gIH1cbiAgZWxzZSB7XG4gICAga2V5ID0gdi5zaGlmdCgpO1xuICAgIGlmIChrZXkgPT09ICdQQVJBTUVURVInKSB7XG4gICAgICBrZXkgPSB2LnNoaWZ0KCk7XG4gICAgfVxuICAgIGlmICh2Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodlswXSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB7fTtcbiAgICAgICAgc0V4cHIodlswXSwgb2JqW2tleV0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG9ialtrZXldID0gdlswXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoIXYubGVuZ3RoKSB7XG4gICAgICBvYmpba2V5XSA9IHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKGtleSA9PT0gJ1RPV0dTODQnKSB7XG4gICAgICBvYmpba2V5XSA9IHY7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgb2JqW2tleV0gPSB7fTtcbiAgICAgIGlmIChbJ1VOSVQnLCAnUFJJTUVNJywgJ1ZFUlRfREFUVU0nXS5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgICAgICBvYmpba2V5XSA9IHtcbiAgICAgICAgICBuYW1lOiB2WzBdLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgY29udmVydDogdlsxXVxuICAgICAgICB9O1xuICAgICAgICBpZiAodi5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICBvYmpba2V5XS5hdXRoID0gdlsyXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoa2V5ID09PSAnU1BIRVJPSUQnKSB7XG4gICAgICAgIG9ialtrZXldID0ge1xuICAgICAgICAgIG5hbWU6IHZbMF0sXG4gICAgICAgICAgYTogdlsxXSxcbiAgICAgICAgICByZjogdlsyXVxuICAgICAgICB9O1xuICAgICAgICBpZiAodi5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICBvYmpba2V5XS5hdXRoID0gdlszXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoWydHRU9HQ1MnLCAnR0VPQ0NTJywgJ0RBVFVNJywgJ1ZFUlRfQ1MnLCAnQ09NUERfQ1MnLCAnTE9DQUxfQ1MnLCAnRklUVEVEX0NTJywgJ0xPQ0FMX0RBVFVNJ10uaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgICAgdlswXSA9IFsnbmFtZScsIHZbMF1dO1xuICAgICAgICBtYXBpdChvYmosIGtleSwgdik7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh2LmV2ZXJ5KGZ1bmN0aW9uKGFhKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGFhKTtcbiAgICAgIH0pKSB7XG4gICAgICAgIG1hcGl0KG9iaiwga2V5LCB2KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzRXhwcih2LCBvYmpba2V5XSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmFtZShvYmosIHBhcmFtcykge1xuICB2YXIgb3V0TmFtZSA9IHBhcmFtc1swXTtcbiAgdmFyIGluTmFtZSA9IHBhcmFtc1sxXTtcbiAgaWYgKCEob3V0TmFtZSBpbiBvYmopICYmIChpbk5hbWUgaW4gb2JqKSkge1xuICAgIG9ialtvdXROYW1lXSA9IG9ialtpbk5hbWVdO1xuICAgIGlmIChwYXJhbXMubGVuZ3RoID09PSAzKSB7XG4gICAgICBvYmpbb3V0TmFtZV0gPSBwYXJhbXNbMl0ob2JqW291dE5hbWVdKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZDJyKGlucHV0KSB7XG4gIHJldHVybiBpbnB1dCAqIEQyUjtcbn1cblxuZnVuY3Rpb24gY2xlYW5XS1Qod2t0KSB7XG4gIGlmICh3a3QudHlwZSA9PT0gJ0dFT0dDUycpIHtcbiAgICB3a3QucHJvak5hbWUgPSAnbG9uZ2xhdCc7XG4gIH1cbiAgZWxzZSBpZiAod2t0LnR5cGUgPT09ICdMT0NBTF9DUycpIHtcbiAgICB3a3QucHJvak5hbWUgPSAnaWRlbnRpdHknO1xuICAgIHdrdC5sb2NhbCA9IHRydWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHR5cGVvZiB3a3QuUFJPSkVDVElPTiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgd2t0LnByb2pOYW1lID0gT2JqZWN0LmtleXMod2t0LlBST0pFQ1RJT04pWzBdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHdrdC5wcm9qTmFtZSA9IHdrdC5QUk9KRUNUSU9OO1xuICAgIH1cbiAgfVxuICBpZiAod2t0LlVOSVQpIHtcbiAgICB3a3QudW5pdHMgPSB3a3QuVU5JVC5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHdrdC51bml0cyA9PT0gJ21ldHJlJykge1xuICAgICAgd2t0LnVuaXRzID0gJ21ldGVyJztcbiAgICB9XG4gICAgaWYgKHdrdC5VTklULmNvbnZlcnQpIHtcbiAgICAgIHdrdC50b19tZXRlciA9IHBhcnNlRmxvYXQod2t0LlVOSVQuY29udmVydCwgMTApO1xuICAgIH1cbiAgfVxuXG4gIGlmICh3a3QuR0VPR0NTKSB7XG4gICAgLy9pZih3a3QuR0VPR0NTLlBSSU1FTSYmd2t0LkdFT0dDUy5QUklNRU0uY29udmVydCl7XG4gICAgLy8gIHdrdC5mcm9tX2dyZWVud2ljaD13a3QuR0VPR0NTLlBSSU1FTS5jb252ZXJ0KkQyUjtcbiAgICAvL31cbiAgICBpZiAod2t0LkdFT0dDUy5EQVRVTSkge1xuICAgICAgd2t0LmRhdHVtQ29kZSA9IHdrdC5HRU9HQ1MuREFUVU0ubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHdrdC5kYXR1bUNvZGUgPSB3a3QuR0VPR0NTLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gICAgaWYgKHdrdC5kYXR1bUNvZGUuc2xpY2UoMCwgMikgPT09ICdkXycpIHtcbiAgICAgIHdrdC5kYXR1bUNvZGUgPSB3a3QuZGF0dW1Db2RlLnNsaWNlKDIpO1xuICAgIH1cbiAgICBpZiAod2t0LmRhdHVtQ29kZSA9PT0gJ25ld196ZWFsYW5kX2dlb2RldGljX2RhdHVtXzE5NDknIHx8IHdrdC5kYXR1bUNvZGUgPT09ICduZXdfemVhbGFuZF8xOTQ5Jykge1xuICAgICAgd2t0LmRhdHVtQ29kZSA9ICduemdkNDknO1xuICAgIH1cbiAgICBpZiAod2t0LmRhdHVtQ29kZSA9PT0gXCJ3Z3NfMTk4NFwiKSB7XG4gICAgICBpZiAod2t0LlBST0pFQ1RJT04gPT09ICdNZXJjYXRvcl9BdXhpbGlhcnlfU3BoZXJlJykge1xuICAgICAgICB3a3Quc3BoZXJlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHdrdC5kYXR1bUNvZGUgPSAnd2dzODQnO1xuICAgIH1cbiAgICBpZiAod2t0LmRhdHVtQ29kZS5zbGljZSgtNikgPT09ICdfZmVycm8nKSB7XG4gICAgICB3a3QuZGF0dW1Db2RlID0gd2t0LmRhdHVtQ29kZS5zbGljZSgwLCAtIDYpO1xuICAgIH1cbiAgICBpZiAod2t0LmRhdHVtQ29kZS5zbGljZSgtOCkgPT09ICdfamFrYXJ0YScpIHtcbiAgICAgIHdrdC5kYXR1bUNvZGUgPSB3a3QuZGF0dW1Db2RlLnNsaWNlKDAsIC0gOCk7XG4gICAgfVxuICAgIGlmICh+d2t0LmRhdHVtQ29kZS5pbmRleE9mKCdiZWxnZScpKSB7XG4gICAgICB3a3QuZGF0dW1Db2RlID0gXCJybmI3MlwiO1xuICAgIH1cbiAgICBpZiAod2t0LkdFT0dDUy5EQVRVTSAmJiB3a3QuR0VPR0NTLkRBVFVNLlNQSEVST0lEKSB7XG4gICAgICB3a3QuZWxscHMgPSB3a3QuR0VPR0NTLkRBVFVNLlNQSEVST0lELm5hbWUucmVwbGFjZSgnXzE5JywgJycpLnJlcGxhY2UoL1tDY11sYXJrZVxcXzE4LywgJ2NscmsnKTtcbiAgICAgIGlmICh3a3QuZWxscHMudG9Mb3dlckNhc2UoKS5zbGljZSgwLCAxMykgPT09IFwiaW50ZXJuYXRpb25hbFwiKSB7XG4gICAgICAgIHdrdC5lbGxwcyA9ICdpbnRsJztcbiAgICAgIH1cblxuICAgICAgd2t0LmEgPSB3a3QuR0VPR0NTLkRBVFVNLlNQSEVST0lELmE7XG4gICAgICB3a3QucmYgPSBwYXJzZUZsb2F0KHdrdC5HRU9HQ1MuREFUVU0uU1BIRVJPSUQucmYsIDEwKTtcbiAgICB9XG4gICAgaWYgKH53a3QuZGF0dW1Db2RlLmluZGV4T2YoJ29zZ2JfMTkzNicpKSB7XG4gICAgICB3a3QuZGF0dW1Db2RlID0gXCJvc2diMzZcIjtcbiAgICB9XG4gIH1cbiAgaWYgKHdrdC5iICYmICFpc0Zpbml0ZSh3a3QuYikpIHtcbiAgICB3a3QuYiA9IHdrdC5hO1xuICB9XG5cbiAgZnVuY3Rpb24gdG9NZXRlcihpbnB1dCkge1xuICAgIHZhciByYXRpbyA9IHdrdC50b19tZXRlciB8fCAxO1xuICAgIHJldHVybiBwYXJzZUZsb2F0KGlucHV0LCAxMCkgKiByYXRpbztcbiAgfVxuICB2YXIgcmVuYW1lciA9IGZ1bmN0aW9uKGEpIHtcbiAgICByZXR1cm4gcmVuYW1lKHdrdCwgYSk7XG4gIH07XG4gIHZhciBsaXN0ID0gW1xuICAgIFsnc3RhbmRhcmRfcGFyYWxsZWxfMScsICdTdGFuZGFyZF9QYXJhbGxlbF8xJ10sXG4gICAgWydzdGFuZGFyZF9wYXJhbGxlbF8yJywgJ1N0YW5kYXJkX1BhcmFsbGVsXzInXSxcbiAgICBbJ2ZhbHNlX2Vhc3RpbmcnLCAnRmFsc2VfRWFzdGluZyddLFxuICAgIFsnZmFsc2Vfbm9ydGhpbmcnLCAnRmFsc2VfTm9ydGhpbmcnXSxcbiAgICBbJ2NlbnRyYWxfbWVyaWRpYW4nLCAnQ2VudHJhbF9NZXJpZGlhbiddLFxuICAgIFsnbGF0aXR1ZGVfb2Zfb3JpZ2luJywgJ0xhdGl0dWRlX09mX09yaWdpbiddLFxuICAgIFsnbGF0aXR1ZGVfb2Zfb3JpZ2luJywgJ0NlbnRyYWxfUGFyYWxsZWwnXSxcbiAgICBbJ3NjYWxlX2ZhY3RvcicsICdTY2FsZV9GYWN0b3InXSxcbiAgICBbJ2swJywgJ3NjYWxlX2ZhY3RvciddLFxuICAgIFsnbGF0aXR1ZGVfb2ZfY2VudGVyJywgJ0xhdGl0dWRlX29mX2NlbnRlciddLFxuICAgIFsnbGF0MCcsICdsYXRpdHVkZV9vZl9jZW50ZXInLCBkMnJdLFxuICAgIFsnbG9uZ2l0dWRlX29mX2NlbnRlcicsICdMb25naXR1ZGVfT2ZfQ2VudGVyJ10sXG4gICAgWydsb25nYycsICdsb25naXR1ZGVfb2ZfY2VudGVyJywgZDJyXSxcbiAgICBbJ3gwJywgJ2ZhbHNlX2Vhc3RpbmcnLCB0b01ldGVyXSxcbiAgICBbJ3kwJywgJ2ZhbHNlX25vcnRoaW5nJywgdG9NZXRlcl0sXG4gICAgWydsb25nMCcsICdjZW50cmFsX21lcmlkaWFuJywgZDJyXSxcbiAgICBbJ2xhdDAnLCAnbGF0aXR1ZGVfb2Zfb3JpZ2luJywgZDJyXSxcbiAgICBbJ2xhdDAnLCAnc3RhbmRhcmRfcGFyYWxsZWxfMScsIGQycl0sXG4gICAgWydsYXQxJywgJ3N0YW5kYXJkX3BhcmFsbGVsXzEnLCBkMnJdLFxuICAgIFsnbGF0MicsICdzdGFuZGFyZF9wYXJhbGxlbF8yJywgZDJyXSxcbiAgICBbJ2FscGhhJywgJ2F6aW11dGgnLCBkMnJdLFxuICAgIFsnc3JzQ29kZScsICduYW1lJ11cbiAgXTtcbiAgbGlzdC5mb3JFYWNoKHJlbmFtZXIpO1xuICBpZiAoIXdrdC5sb25nMCAmJiB3a3QubG9uZ2MgJiYgKHdrdC5wcm9qTmFtZSA9PT0gJ0FsYmVyc19Db25pY19FcXVhbF9BcmVhJyB8fCB3a3QucHJvak5hbWUgPT09IFwiTGFtYmVydF9BemltdXRoYWxfRXF1YWxfQXJlYVwiKSkge1xuICAgIHdrdC5sb25nMCA9IHdrdC5sb25nYztcbiAgfVxuICBpZiAoIXdrdC5sYXRfdHMgJiYgd2t0LmxhdDEgJiYgKHdrdC5wcm9qTmFtZSA9PT0gJ1N0ZXJlb2dyYXBoaWNfU291dGhfUG9sZScgfHwgd2t0LnByb2pOYW1lID09PSAnUG9sYXIgU3RlcmVvZ3JhcGhpYyAodmFyaWFudCBCKScpKSB7XG4gICAgd2t0LmxhdDAgPSBkMnIod2t0LmxhdDEgPiAwID8gOTAgOiAtOTApO1xuICAgIHdrdC5sYXRfdHMgPSB3a3QubGF0MTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih3a3QsIHNlbGYpIHtcbiAgdmFyIGxpc3AgPSBKU09OLnBhcnNlKChcIixcIiArIHdrdCkucmVwbGFjZSgvXFxzKlxcLFxccyooW0EtWl8wLTldKz8pKFxcWykvZywgJyxbXCIkMVwiLCcpLnNsaWNlKDEpLnJlcGxhY2UoL1xccypcXCxcXHMqKFtBLVpfMC05XSs/KVxcXS9nLCAnLFwiJDFcIl0nKS5yZXBsYWNlKC8sXFxbXCJWRVJUQ1NcIi4rLywnJykpO1xuICB2YXIgdHlwZSA9IGxpc3Auc2hpZnQoKTtcbiAgdmFyIG5hbWUgPSBsaXNwLnNoaWZ0KCk7XG4gIGxpc3AudW5zaGlmdChbJ25hbWUnLCBuYW1lXSk7XG4gIGxpc3AudW5zaGlmdChbJ3R5cGUnLCB0eXBlXSk7XG4gIGxpc3AudW5zaGlmdCgnb3V0cHV0Jyk7XG4gIHZhciBvYmogPSB7fTtcbiAgc0V4cHIobGlzcCwgb2JqKTtcbiAgY2xlYW5XS1Qob2JqLm91dHB1dCk7XG4gIHJldHVybiBleHRlbmQoc2VsZiwgb2JqLm91dHB1dCk7XG59O1xuIiwiXG5cblxuLyoqXG4gKiBVVE0gem9uZXMgYXJlIGdyb3VwZWQsIGFuZCBhc3NpZ25lZCB0byBvbmUgb2YgYSBncm91cCBvZiA2XG4gKiBzZXRzLlxuICpcbiAqIHtpbnR9IEBwcml2YXRlXG4gKi9cbnZhciBOVU1fMTAwS19TRVRTID0gNjtcblxuLyoqXG4gKiBUaGUgY29sdW1uIGxldHRlcnMgKGZvciBlYXN0aW5nKSBvZiB0aGUgbG93ZXIgbGVmdCB2YWx1ZSwgcGVyXG4gKiBzZXQuXG4gKlxuICoge3N0cmluZ30gQHByaXZhdGVcbiAqL1xudmFyIFNFVF9PUklHSU5fQ09MVU1OX0xFVFRFUlMgPSAnQUpTQUpTJztcblxuLyoqXG4gKiBUaGUgcm93IGxldHRlcnMgKGZvciBub3J0aGluZykgb2YgdGhlIGxvd2VyIGxlZnQgdmFsdWUsIHBlclxuICogc2V0LlxuICpcbiAqIHtzdHJpbmd9IEBwcml2YXRlXG4gKi9cbnZhciBTRVRfT1JJR0lOX1JPV19MRVRURVJTID0gJ0FGQUZBRic7XG5cbnZhciBBID0gNjU7IC8vIEFcbnZhciBJID0gNzM7IC8vIElcbnZhciBPID0gNzk7IC8vIE9cbnZhciBWID0gODY7IC8vIFZcbnZhciBaID0gOTA7IC8vIFpcblxuLyoqXG4gKiBDb252ZXJzaW9uIG9mIGxhdC9sb24gdG8gTUdSUy5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gbGwgT2JqZWN0IGxpdGVyYWwgd2l0aCBsYXQgYW5kIGxvbiBwcm9wZXJ0aWVzIG9uIGFcbiAqICAgICBXR1M4NCBlbGxpcHNvaWQuXG4gKiBAcGFyYW0ge2ludH0gYWNjdXJhY3kgQWNjdXJhY3kgaW4gZGlnaXRzICg1IGZvciAxIG0sIDQgZm9yIDEwIG0sIDMgZm9yXG4gKiAgICAgIDEwMCBtLCAyIGZvciAxMDAwIG0gb3IgMSBmb3IgMTAwMDAgbSkuIE9wdGlvbmFsLCBkZWZhdWx0IGlzIDUuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBNR1JTIHN0cmluZyBmb3IgdGhlIGdpdmVuIGxvY2F0aW9uIGFuZCBhY2N1cmFjeS5cbiAqL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24obGwsIGFjY3VyYWN5KSB7XG4gIGFjY3VyYWN5ID0gYWNjdXJhY3kgfHwgNTsgLy8gZGVmYXVsdCBhY2N1cmFjeSAxbVxuICByZXR1cm4gZW5jb2RlKExMdG9VVE0oe1xuICAgIGxhdDogbGxbMV0sXG4gICAgbG9uOiBsbFswXVxuICB9KSwgYWNjdXJhY3kpO1xufTtcblxuLyoqXG4gKiBDb252ZXJzaW9uIG9mIE1HUlMgdG8gbGF0L2xvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWdycyBNR1JTIHN0cmluZy5cbiAqIEByZXR1cm4ge2FycmF5fSBBbiBhcnJheSB3aXRoIGxlZnQgKGxvbmdpdHVkZSksIGJvdHRvbSAobGF0aXR1ZGUpLCByaWdodFxuICogICAgIChsb25naXR1ZGUpIGFuZCB0b3AgKGxhdGl0dWRlKSB2YWx1ZXMgaW4gV0dTODQsIHJlcHJlc2VudGluZyB0aGVcbiAqICAgICBib3VuZGluZyBib3ggZm9yIHRoZSBwcm92aWRlZCBNR1JTIHJlZmVyZW5jZS5cbiAqL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24obWdycykge1xuICB2YXIgYmJveCA9IFVUTXRvTEwoZGVjb2RlKG1ncnMudG9VcHBlckNhc2UoKSkpO1xuICBpZiAoYmJveC5sYXQgJiYgYmJveC5sb24pIHtcbiAgICByZXR1cm4gW2Jib3gubG9uLCBiYm94LmxhdCwgYmJveC5sb24sIGJib3gubGF0XTtcbiAgfVxuICByZXR1cm4gW2Jib3gubGVmdCwgYmJveC5ib3R0b20sIGJib3gucmlnaHQsIGJib3gudG9wXTtcbn07XG5cbmV4cG9ydHMudG9Qb2ludCA9IGZ1bmN0aW9uKG1ncnMpIHtcbiAgdmFyIGJib3ggPSBVVE10b0xMKGRlY29kZShtZ3JzLnRvVXBwZXJDYXNlKCkpKTtcbiAgaWYgKGJib3gubGF0ICYmIGJib3gubG9uKSB7XG4gICAgcmV0dXJuIFtiYm94LmxvbiwgYmJveC5sYXRdO1xuICB9XG4gIHJldHVybiBbKGJib3gubGVmdCArIGJib3gucmlnaHQpIC8gMiwgKGJib3gudG9wICsgYmJveC5ib3R0b20pIC8gMl07XG59O1xuLyoqXG4gKiBDb252ZXJzaW9uIGZyb20gZGVncmVlcyB0byByYWRpYW5zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gZGVnIHRoZSBhbmdsZSBpbiBkZWdyZWVzLlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgYW5nbGUgaW4gcmFkaWFucy5cbiAqL1xuZnVuY3Rpb24gZGVnVG9SYWQoZGVnKSB7XG4gIHJldHVybiAoZGVnICogKE1hdGguUEkgLyAxODAuMCkpO1xufVxuXG4vKipcbiAqIENvbnZlcnNpb24gZnJvbSByYWRpYW5zIHRvIGRlZ3JlZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgdGhlIGFuZ2xlIGluIHJhZGlhbnMuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBhbmdsZSBpbiBkZWdyZWVzLlxuICovXG5mdW5jdGlvbiByYWRUb0RlZyhyYWQpIHtcbiAgcmV0dXJuICgxODAuMCAqIChyYWQgLyBNYXRoLlBJKSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBzZXQgb2YgTG9uZ2l0dWRlIGFuZCBMYXRpdHVkZSBjby1vcmRpbmF0ZXMgdG8gVVRNXG4gKiB1c2luZyB0aGUgV0dTODQgZWxsaXBzb2lkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gbGwgT2JqZWN0IGxpdGVyYWwgd2l0aCBsYXQgYW5kIGxvbiBwcm9wZXJ0aWVzXG4gKiAgICAgcmVwcmVzZW50aW5nIHRoZSBXR1M4NCBjb29yZGluYXRlIHRvIGJlIGNvbnZlcnRlZC5cbiAqIEByZXR1cm4ge29iamVjdH0gT2JqZWN0IGxpdGVyYWwgY29udGFpbmluZyB0aGUgVVRNIHZhbHVlIHdpdGggZWFzdGluZyxcbiAqICAgICBub3J0aGluZywgem9uZU51bWJlciBhbmQgem9uZUxldHRlciBwcm9wZXJ0aWVzLCBhbmQgYW4gb3B0aW9uYWxcbiAqICAgICBhY2N1cmFjeSBwcm9wZXJ0eSBpbiBkaWdpdHMuIFJldHVybnMgbnVsbCBpZiB0aGUgY29udmVyc2lvbiBmYWlsZWQuXG4gKi9cbmZ1bmN0aW9uIExMdG9VVE0obGwpIHtcbiAgdmFyIExhdCA9IGxsLmxhdDtcbiAgdmFyIExvbmcgPSBsbC5sb247XG4gIHZhciBhID0gNjM3ODEzNy4wOyAvL2VsbGlwLnJhZGl1cztcbiAgdmFyIGVjY1NxdWFyZWQgPSAwLjAwNjY5NDM4OyAvL2VsbGlwLmVjY3NxO1xuICB2YXIgazAgPSAwLjk5OTY7XG4gIHZhciBMb25nT3JpZ2luO1xuICB2YXIgZWNjUHJpbWVTcXVhcmVkO1xuICB2YXIgTiwgVCwgQywgQSwgTTtcbiAgdmFyIExhdFJhZCA9IGRlZ1RvUmFkKExhdCk7XG4gIHZhciBMb25nUmFkID0gZGVnVG9SYWQoTG9uZyk7XG4gIHZhciBMb25nT3JpZ2luUmFkO1xuICB2YXIgWm9uZU51bWJlcjtcbiAgLy8gKGludClcbiAgWm9uZU51bWJlciA9IE1hdGguZmxvb3IoKExvbmcgKyAxODApIC8gNikgKyAxO1xuXG4gIC8vTWFrZSBzdXJlIHRoZSBsb25naXR1ZGUgMTgwLjAwIGlzIGluIFpvbmUgNjBcbiAgaWYgKExvbmcgPT09IDE4MCkge1xuICAgIFpvbmVOdW1iZXIgPSA2MDtcbiAgfVxuXG4gIC8vIFNwZWNpYWwgem9uZSBmb3IgTm9yd2F5XG4gIGlmIChMYXQgPj0gNTYuMCAmJiBMYXQgPCA2NC4wICYmIExvbmcgPj0gMy4wICYmIExvbmcgPCAxMi4wKSB7XG4gICAgWm9uZU51bWJlciA9IDMyO1xuICB9XG5cbiAgLy8gU3BlY2lhbCB6b25lcyBmb3IgU3ZhbGJhcmRcbiAgaWYgKExhdCA+PSA3Mi4wICYmIExhdCA8IDg0LjApIHtcbiAgICBpZiAoTG9uZyA+PSAwLjAgJiYgTG9uZyA8IDkuMCkge1xuICAgICAgWm9uZU51bWJlciA9IDMxO1xuICAgIH1cbiAgICBlbHNlIGlmIChMb25nID49IDkuMCAmJiBMb25nIDwgMjEuMCkge1xuICAgICAgWm9uZU51bWJlciA9IDMzO1xuICAgIH1cbiAgICBlbHNlIGlmIChMb25nID49IDIxLjAgJiYgTG9uZyA8IDMzLjApIHtcbiAgICAgIFpvbmVOdW1iZXIgPSAzNTtcbiAgICB9XG4gICAgZWxzZSBpZiAoTG9uZyA+PSAzMy4wICYmIExvbmcgPCA0Mi4wKSB7XG4gICAgICBab25lTnVtYmVyID0gMzc7XG4gICAgfVxuICB9XG5cbiAgTG9uZ09yaWdpbiA9IChab25lTnVtYmVyIC0gMSkgKiA2IC0gMTgwICsgMzsgLy8rMyBwdXRzIG9yaWdpblxuICAvLyBpbiBtaWRkbGUgb2ZcbiAgLy8gem9uZVxuICBMb25nT3JpZ2luUmFkID0gZGVnVG9SYWQoTG9uZ09yaWdpbik7XG5cbiAgZWNjUHJpbWVTcXVhcmVkID0gKGVjY1NxdWFyZWQpIC8gKDEgLSBlY2NTcXVhcmVkKTtcblxuICBOID0gYSAvIE1hdGguc3FydCgxIC0gZWNjU3F1YXJlZCAqIE1hdGguc2luKExhdFJhZCkgKiBNYXRoLnNpbihMYXRSYWQpKTtcbiAgVCA9IE1hdGgudGFuKExhdFJhZCkgKiBNYXRoLnRhbihMYXRSYWQpO1xuICBDID0gZWNjUHJpbWVTcXVhcmVkICogTWF0aC5jb3MoTGF0UmFkKSAqIE1hdGguY29zKExhdFJhZCk7XG4gIEEgPSBNYXRoLmNvcyhMYXRSYWQpICogKExvbmdSYWQgLSBMb25nT3JpZ2luUmFkKTtcblxuICBNID0gYSAqICgoMSAtIGVjY1NxdWFyZWQgLyA0IC0gMyAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkIC8gNjQgLSA1ICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkIC8gMjU2KSAqIExhdFJhZCAtICgzICogZWNjU3F1YXJlZCAvIDggKyAzICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgLyAzMiArIDQ1ICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkIC8gMTAyNCkgKiBNYXRoLnNpbigyICogTGF0UmFkKSArICgxNSAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkIC8gMjU2ICsgNDUgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgLyAxMDI0KSAqIE1hdGguc2luKDQgKiBMYXRSYWQpIC0gKDM1ICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkIC8gMzA3MikgKiBNYXRoLnNpbig2ICogTGF0UmFkKSk7XG5cbiAgdmFyIFVUTUVhc3RpbmcgPSAoazAgKiBOICogKEEgKyAoMSAtIFQgKyBDKSAqIEEgKiBBICogQSAvIDYuMCArICg1IC0gMTggKiBUICsgVCAqIFQgKyA3MiAqIEMgLSA1OCAqIGVjY1ByaW1lU3F1YXJlZCkgKiBBICogQSAqIEEgKiBBICogQSAvIDEyMC4wKSArIDUwMDAwMC4wKTtcblxuICB2YXIgVVRNTm9ydGhpbmcgPSAoazAgKiAoTSArIE4gKiBNYXRoLnRhbihMYXRSYWQpICogKEEgKiBBIC8gMiArICg1IC0gVCArIDkgKiBDICsgNCAqIEMgKiBDKSAqIEEgKiBBICogQSAqIEEgLyAyNC4wICsgKDYxIC0gNTggKiBUICsgVCAqIFQgKyA2MDAgKiBDIC0gMzMwICogZWNjUHJpbWVTcXVhcmVkKSAqIEEgKiBBICogQSAqIEEgKiBBICogQSAvIDcyMC4wKSkpO1xuICBpZiAoTGF0IDwgMC4wKSB7XG4gICAgVVRNTm9ydGhpbmcgKz0gMTAwMDAwMDAuMDsgLy8xMDAwMDAwMCBtZXRlciBvZmZzZXQgZm9yXG4gICAgLy8gc291dGhlcm4gaGVtaXNwaGVyZVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBub3J0aGluZzogTWF0aC5yb3VuZChVVE1Ob3J0aGluZyksXG4gICAgZWFzdGluZzogTWF0aC5yb3VuZChVVE1FYXN0aW5nKSxcbiAgICB6b25lTnVtYmVyOiBab25lTnVtYmVyLFxuICAgIHpvbmVMZXR0ZXI6IGdldExldHRlckRlc2lnbmF0b3IoTGF0KVxuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnRzIFVUTSBjb29yZHMgdG8gbGF0L2xvbmcsIHVzaW5nIHRoZSBXR1M4NCBlbGxpcHNvaWQuIFRoaXMgaXMgYSBjb252ZW5pZW5jZVxuICogY2xhc3Mgd2hlcmUgdGhlIFpvbmUgY2FuIGJlIHNwZWNpZmllZCBhcyBhIHNpbmdsZSBzdHJpbmcgZWcuXCI2ME5cIiB3aGljaFxuICogaXMgdGhlbiBicm9rZW4gZG93biBpbnRvIHRoZSBab25lTnVtYmVyIGFuZCBab25lTGV0dGVyLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gdXRtIEFuIG9iamVjdCBsaXRlcmFsIHdpdGggbm9ydGhpbmcsIGVhc3RpbmcsIHpvbmVOdW1iZXJcbiAqICAgICBhbmQgem9uZUxldHRlciBwcm9wZXJ0aWVzLiBJZiBhbiBvcHRpb25hbCBhY2N1cmFjeSBwcm9wZXJ0eSBpc1xuICogICAgIHByb3ZpZGVkIChpbiBtZXRlcnMpLCBhIGJvdW5kaW5nIGJveCB3aWxsIGJlIHJldHVybmVkIGluc3RlYWQgb2ZcbiAqICAgICBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlLlxuICogQHJldHVybiB7b2JqZWN0fSBBbiBvYmplY3QgbGl0ZXJhbCBjb250YWluaW5nIGVpdGhlciBsYXQgYW5kIGxvbiB2YWx1ZXNcbiAqICAgICAoaWYgbm8gYWNjdXJhY3kgd2FzIHByb3ZpZGVkKSwgb3IgdG9wLCByaWdodCwgYm90dG9tIGFuZCBsZWZ0IHZhbHVlc1xuICogICAgIGZvciB0aGUgYm91bmRpbmcgYm94IGNhbGN1bGF0ZWQgYWNjb3JkaW5nIHRvIHRoZSBwcm92aWRlZCBhY2N1cmFjeS5cbiAqICAgICBSZXR1cm5zIG51bGwgaWYgdGhlIGNvbnZlcnNpb24gZmFpbGVkLlxuICovXG5mdW5jdGlvbiBVVE10b0xMKHV0bSkge1xuXG4gIHZhciBVVE1Ob3J0aGluZyA9IHV0bS5ub3J0aGluZztcbiAgdmFyIFVUTUVhc3RpbmcgPSB1dG0uZWFzdGluZztcbiAgdmFyIHpvbmVMZXR0ZXIgPSB1dG0uem9uZUxldHRlcjtcbiAgdmFyIHpvbmVOdW1iZXIgPSB1dG0uem9uZU51bWJlcjtcbiAgLy8gY2hlY2sgdGhlIFpvbmVOdW1tYmVyIGlzIHZhbGlkXG4gIGlmICh6b25lTnVtYmVyIDwgMCB8fCB6b25lTnVtYmVyID4gNjApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciBrMCA9IDAuOTk5NjtcbiAgdmFyIGEgPSA2Mzc4MTM3LjA7IC8vZWxsaXAucmFkaXVzO1xuICB2YXIgZWNjU3F1YXJlZCA9IDAuMDA2Njk0Mzg7IC8vZWxsaXAuZWNjc3E7XG4gIHZhciBlY2NQcmltZVNxdWFyZWQ7XG4gIHZhciBlMSA9ICgxIC0gTWF0aC5zcXJ0KDEgLSBlY2NTcXVhcmVkKSkgLyAoMSArIE1hdGguc3FydCgxIC0gZWNjU3F1YXJlZCkpO1xuICB2YXIgTjEsIFQxLCBDMSwgUjEsIEQsIE07XG4gIHZhciBMb25nT3JpZ2luO1xuICB2YXIgbXUsIHBoaTFSYWQ7XG5cbiAgLy8gcmVtb3ZlIDUwMCwwMDAgbWV0ZXIgb2Zmc2V0IGZvciBsb25naXR1ZGVcbiAgdmFyIHggPSBVVE1FYXN0aW5nIC0gNTAwMDAwLjA7XG4gIHZhciB5ID0gVVRNTm9ydGhpbmc7XG5cbiAgLy8gV2UgbXVzdCBrbm93IHNvbWVob3cgaWYgd2UgYXJlIGluIHRoZSBOb3J0aGVybiBvciBTb3V0aGVyblxuICAvLyBoZW1pc3BoZXJlLCB0aGlzIGlzIHRoZSBvbmx5IHRpbWUgd2UgdXNlIHRoZSBsZXR0ZXIgU28gZXZlblxuICAvLyBpZiB0aGUgWm9uZSBsZXR0ZXIgaXNuJ3QgZXhhY3RseSBjb3JyZWN0IGl0IHNob3VsZCBpbmRpY2F0ZVxuICAvLyB0aGUgaGVtaXNwaGVyZSBjb3JyZWN0bHlcbiAgaWYgKHpvbmVMZXR0ZXIgPCAnTicpIHtcbiAgICB5IC09IDEwMDAwMDAwLjA7IC8vIHJlbW92ZSAxMCwwMDAsMDAwIG1ldGVyIG9mZnNldCB1c2VkXG4gICAgLy8gZm9yIHNvdXRoZXJuIGhlbWlzcGhlcmVcbiAgfVxuXG4gIC8vIFRoZXJlIGFyZSA2MCB6b25lcyB3aXRoIHpvbmUgMSBiZWluZyBhdCBXZXN0IC0xODAgdG8gLTE3NFxuICBMb25nT3JpZ2luID0gKHpvbmVOdW1iZXIgLSAxKSAqIDYgLSAxODAgKyAzOyAvLyArMyBwdXRzIG9yaWdpblxuICAvLyBpbiBtaWRkbGUgb2ZcbiAgLy8gem9uZVxuXG4gIGVjY1ByaW1lU3F1YXJlZCA9IChlY2NTcXVhcmVkKSAvICgxIC0gZWNjU3F1YXJlZCk7XG5cbiAgTSA9IHkgLyBrMDtcbiAgbXUgPSBNIC8gKGEgKiAoMSAtIGVjY1NxdWFyZWQgLyA0IC0gMyAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkIC8gNjQgLSA1ICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkIC8gMjU2KSk7XG5cbiAgcGhpMVJhZCA9IG11ICsgKDMgKiBlMSAvIDIgLSAyNyAqIGUxICogZTEgKiBlMSAvIDMyKSAqIE1hdGguc2luKDIgKiBtdSkgKyAoMjEgKiBlMSAqIGUxIC8gMTYgLSA1NSAqIGUxICogZTEgKiBlMSAqIGUxIC8gMzIpICogTWF0aC5zaW4oNCAqIG11KSArICgxNTEgKiBlMSAqIGUxICogZTEgLyA5NikgKiBNYXRoLnNpbig2ICogbXUpO1xuICAvLyBkb3VibGUgcGhpMSA9IFByb2pNYXRoLnJhZFRvRGVnKHBoaTFSYWQpO1xuXG4gIE4xID0gYSAvIE1hdGguc3FydCgxIC0gZWNjU3F1YXJlZCAqIE1hdGguc2luKHBoaTFSYWQpICogTWF0aC5zaW4ocGhpMVJhZCkpO1xuICBUMSA9IE1hdGgudGFuKHBoaTFSYWQpICogTWF0aC50YW4ocGhpMVJhZCk7XG4gIEMxID0gZWNjUHJpbWVTcXVhcmVkICogTWF0aC5jb3MocGhpMVJhZCkgKiBNYXRoLmNvcyhwaGkxUmFkKTtcbiAgUjEgPSBhICogKDEgLSBlY2NTcXVhcmVkKSAvIE1hdGgucG93KDEgLSBlY2NTcXVhcmVkICogTWF0aC5zaW4ocGhpMVJhZCkgKiBNYXRoLnNpbihwaGkxUmFkKSwgMS41KTtcbiAgRCA9IHggLyAoTjEgKiBrMCk7XG5cbiAgdmFyIGxhdCA9IHBoaTFSYWQgLSAoTjEgKiBNYXRoLnRhbihwaGkxUmFkKSAvIFIxKSAqIChEICogRCAvIDIgLSAoNSArIDMgKiBUMSArIDEwICogQzEgLSA0ICogQzEgKiBDMSAtIDkgKiBlY2NQcmltZVNxdWFyZWQpICogRCAqIEQgKiBEICogRCAvIDI0ICsgKDYxICsgOTAgKiBUMSArIDI5OCAqIEMxICsgNDUgKiBUMSAqIFQxIC0gMjUyICogZWNjUHJpbWVTcXVhcmVkIC0gMyAqIEMxICogQzEpICogRCAqIEQgKiBEICogRCAqIEQgKiBEIC8gNzIwKTtcbiAgbGF0ID0gcmFkVG9EZWcobGF0KTtcblxuICB2YXIgbG9uID0gKEQgLSAoMSArIDIgKiBUMSArIEMxKSAqIEQgKiBEICogRCAvIDYgKyAoNSAtIDIgKiBDMSArIDI4ICogVDEgLSAzICogQzEgKiBDMSArIDggKiBlY2NQcmltZVNxdWFyZWQgKyAyNCAqIFQxICogVDEpICogRCAqIEQgKiBEICogRCAqIEQgLyAxMjApIC8gTWF0aC5jb3MocGhpMVJhZCk7XG4gIGxvbiA9IExvbmdPcmlnaW4gKyByYWRUb0RlZyhsb24pO1xuXG4gIHZhciByZXN1bHQ7XG4gIGlmICh1dG0uYWNjdXJhY3kpIHtcbiAgICB2YXIgdG9wUmlnaHQgPSBVVE10b0xMKHtcbiAgICAgIG5vcnRoaW5nOiB1dG0ubm9ydGhpbmcgKyB1dG0uYWNjdXJhY3ksXG4gICAgICBlYXN0aW5nOiB1dG0uZWFzdGluZyArIHV0bS5hY2N1cmFjeSxcbiAgICAgIHpvbmVMZXR0ZXI6IHV0bS56b25lTGV0dGVyLFxuICAgICAgem9uZU51bWJlcjogdXRtLnpvbmVOdW1iZXJcbiAgICB9KTtcbiAgICByZXN1bHQgPSB7XG4gICAgICB0b3A6IHRvcFJpZ2h0LmxhdCxcbiAgICAgIHJpZ2h0OiB0b3BSaWdodC5sb24sXG4gICAgICBib3R0b206IGxhdCxcbiAgICAgIGxlZnQ6IGxvblxuICAgIH07XG4gIH1cbiAgZWxzZSB7XG4gICAgcmVzdWx0ID0ge1xuICAgICAgbGF0OiBsYXQsXG4gICAgICBsb246IGxvblxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBNR1JTIGxldHRlciBkZXNpZ25hdG9yIGZvciB0aGUgZ2l2ZW4gbGF0aXR1ZGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBsYXQgVGhlIGxhdGl0dWRlIGluIFdHUzg0IHRvIGdldCB0aGUgbGV0dGVyIGRlc2lnbmF0b3JcbiAqICAgICBmb3IuXG4gKiBAcmV0dXJuIHtjaGFyfSBUaGUgbGV0dGVyIGRlc2lnbmF0b3IuXG4gKi9cbmZ1bmN0aW9uIGdldExldHRlckRlc2lnbmF0b3IobGF0KSB7XG4gIC8vVGhpcyBpcyBoZXJlIGFzIGFuIGVycm9yIGZsYWcgdG8gc2hvdyB0aGF0IHRoZSBMYXRpdHVkZSBpc1xuICAvL291dHNpZGUgTUdSUyBsaW1pdHNcbiAgdmFyIExldHRlckRlc2lnbmF0b3IgPSAnWic7XG5cbiAgaWYgKCg4NCA+PSBsYXQpICYmIChsYXQgPj0gNzIpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdYJztcbiAgfVxuICBlbHNlIGlmICgoNzIgPiBsYXQpICYmIChsYXQgPj0gNjQpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdXJztcbiAgfVxuICBlbHNlIGlmICgoNjQgPiBsYXQpICYmIChsYXQgPj0gNTYpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdWJztcbiAgfVxuICBlbHNlIGlmICgoNTYgPiBsYXQpICYmIChsYXQgPj0gNDgpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdVJztcbiAgfVxuICBlbHNlIGlmICgoNDggPiBsYXQpICYmIChsYXQgPj0gNDApKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdUJztcbiAgfVxuICBlbHNlIGlmICgoNDAgPiBsYXQpICYmIChsYXQgPj0gMzIpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdTJztcbiAgfVxuICBlbHNlIGlmICgoMzIgPiBsYXQpICYmIChsYXQgPj0gMjQpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdSJztcbiAgfVxuICBlbHNlIGlmICgoMjQgPiBsYXQpICYmIChsYXQgPj0gMTYpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdRJztcbiAgfVxuICBlbHNlIGlmICgoMTYgPiBsYXQpICYmIChsYXQgPj0gOCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ1AnO1xuICB9XG4gIGVsc2UgaWYgKCg4ID4gbGF0KSAmJiAobGF0ID49IDApKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdOJztcbiAgfVxuICBlbHNlIGlmICgoMCA+IGxhdCkgJiYgKGxhdCA+PSAtOCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ00nO1xuICB9XG4gIGVsc2UgaWYgKCgtOCA+IGxhdCkgJiYgKGxhdCA+PSAtMTYpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdMJztcbiAgfVxuICBlbHNlIGlmICgoLTE2ID4gbGF0KSAmJiAobGF0ID49IC0yNCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0snO1xuICB9XG4gIGVsc2UgaWYgKCgtMjQgPiBsYXQpICYmIChsYXQgPj0gLTMyKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnSic7XG4gIH1cbiAgZWxzZSBpZiAoKC0zMiA+IGxhdCkgJiYgKGxhdCA+PSAtNDApKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdIJztcbiAgfVxuICBlbHNlIGlmICgoLTQwID4gbGF0KSAmJiAobGF0ID49IC00OCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0cnO1xuICB9XG4gIGVsc2UgaWYgKCgtNDggPiBsYXQpICYmIChsYXQgPj0gLTU2KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnRic7XG4gIH1cbiAgZWxzZSBpZiAoKC01NiA+IGxhdCkgJiYgKGxhdCA+PSAtNjQpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdFJztcbiAgfVxuICBlbHNlIGlmICgoLTY0ID4gbGF0KSAmJiAobGF0ID49IC03MikpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0QnO1xuICB9XG4gIGVsc2UgaWYgKCgtNzIgPiBsYXQpICYmIChsYXQgPj0gLTgwKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnQyc7XG4gIH1cbiAgcmV0dXJuIExldHRlckRlc2lnbmF0b3I7XG59XG5cbi8qKlxuICogRW5jb2RlcyBhIFVUTSBsb2NhdGlvbiBhcyBNR1JTIHN0cmluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IHV0bSBBbiBvYmplY3QgbGl0ZXJhbCB3aXRoIGVhc3RpbmcsIG5vcnRoaW5nLFxuICogICAgIHpvbmVMZXR0ZXIsIHpvbmVOdW1iZXJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhY2N1cmFjeSBBY2N1cmFjeSBpbiBkaWdpdHMgKDEtNSkuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IE1HUlMgc3RyaW5nIGZvciB0aGUgZ2l2ZW4gVVRNIGxvY2F0aW9uLlxuICovXG5mdW5jdGlvbiBlbmNvZGUodXRtLCBhY2N1cmFjeSkge1xuICAvLyBwcmVwZW5kIHdpdGggbGVhZGluZyB6ZXJvZXNcbiAgdmFyIHNlYXN0aW5nID0gXCIwMDAwMFwiICsgdXRtLmVhc3RpbmcsXG4gICAgc25vcnRoaW5nID0gXCIwMDAwMFwiICsgdXRtLm5vcnRoaW5nO1xuXG4gIHJldHVybiB1dG0uem9uZU51bWJlciArIHV0bS56b25lTGV0dGVyICsgZ2V0MTAwa0lEKHV0bS5lYXN0aW5nLCB1dG0ubm9ydGhpbmcsIHV0bS56b25lTnVtYmVyKSArIHNlYXN0aW5nLnN1YnN0cihzZWFzdGluZy5sZW5ndGggLSA1LCBhY2N1cmFjeSkgKyBzbm9ydGhpbmcuc3Vic3RyKHNub3J0aGluZy5sZW5ndGggLSA1LCBhY2N1cmFjeSk7XG59XG5cbi8qKlxuICogR2V0IHRoZSB0d28gbGV0dGVyIDEwMGsgZGVzaWduYXRvciBmb3IgYSBnaXZlbiBVVE0gZWFzdGluZyxcbiAqIG5vcnRoaW5nIGFuZCB6b25lIG51bWJlciB2YWx1ZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IGVhc3RpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSBub3J0aGluZ1xuICogQHBhcmFtIHtudW1iZXJ9IHpvbmVOdW1iZXJcbiAqIEByZXR1cm4gdGhlIHR3byBsZXR0ZXIgMTAwayBkZXNpZ25hdG9yIGZvciB0aGUgZ2l2ZW4gVVRNIGxvY2F0aW9uLlxuICovXG5mdW5jdGlvbiBnZXQxMDBrSUQoZWFzdGluZywgbm9ydGhpbmcsIHpvbmVOdW1iZXIpIHtcbiAgdmFyIHNldFBhcm0gPSBnZXQxMDBrU2V0Rm9yWm9uZSh6b25lTnVtYmVyKTtcbiAgdmFyIHNldENvbHVtbiA9IE1hdGguZmxvb3IoZWFzdGluZyAvIDEwMDAwMCk7XG4gIHZhciBzZXRSb3cgPSBNYXRoLmZsb29yKG5vcnRoaW5nIC8gMTAwMDAwKSAlIDIwO1xuICByZXR1cm4gZ2V0TGV0dGVyMTAwa0lEKHNldENvbHVtbiwgc2V0Um93LCBzZXRQYXJtKTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIFVUTSB6b25lIG51bWJlciwgZmlndXJlIG91dCB0aGUgTUdSUyAxMDBLIHNldCBpdCBpcyBpbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IGkgQW4gVVRNIHpvbmUgbnVtYmVyLlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgMTAwayBzZXQgdGhlIFVUTSB6b25lIGlzIGluLlxuICovXG5mdW5jdGlvbiBnZXQxMDBrU2V0Rm9yWm9uZShpKSB7XG4gIHZhciBzZXRQYXJtID0gaSAlIE5VTV8xMDBLX1NFVFM7XG4gIGlmIChzZXRQYXJtID09PSAwKSB7XG4gICAgc2V0UGFybSA9IE5VTV8xMDBLX1NFVFM7XG4gIH1cblxuICByZXR1cm4gc2V0UGFybTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHR3by1sZXR0ZXIgTUdSUyAxMDBrIGRlc2lnbmF0b3IgZ2l2ZW4gaW5mb3JtYXRpb25cbiAqIHRyYW5zbGF0ZWQgZnJvbSB0aGUgVVRNIG5vcnRoaW5nLCBlYXN0aW5nIGFuZCB6b25lIG51bWJlci5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbiB0aGUgY29sdW1uIGluZGV4IGFzIGl0IHJlbGF0ZXMgdG8gdGhlIE1HUlNcbiAqICAgICAgICAxMDBrIHNldCBzcHJlYWRzaGVldCwgY3JlYXRlZCBmcm9tIHRoZSBVVE0gZWFzdGluZy5cbiAqICAgICAgICBWYWx1ZXMgYXJlIDEtOC5cbiAqIEBwYXJhbSB7bnVtYmVyfSByb3cgdGhlIHJvdyBpbmRleCBhcyBpdCByZWxhdGVzIHRvIHRoZSBNR1JTIDEwMGsgc2V0XG4gKiAgICAgICAgc3ByZWFkc2hlZXQsIGNyZWF0ZWQgZnJvbSB0aGUgVVRNIG5vcnRoaW5nIHZhbHVlLiBWYWx1ZXNcbiAqICAgICAgICBhcmUgZnJvbSAwLTE5LlxuICogQHBhcmFtIHtudW1iZXJ9IHBhcm0gdGhlIHNldCBibG9jaywgYXMgaXQgcmVsYXRlcyB0byB0aGUgTUdSUyAxMDBrIHNldFxuICogICAgICAgIHNwcmVhZHNoZWV0LCBjcmVhdGVkIGZyb20gdGhlIFVUTSB6b25lLiBWYWx1ZXMgYXJlIGZyb21cbiAqICAgICAgICAxLTYwLlxuICogQHJldHVybiB0d28gbGV0dGVyIE1HUlMgMTAwayBjb2RlLlxuICovXG5mdW5jdGlvbiBnZXRMZXR0ZXIxMDBrSUQoY29sdW1uLCByb3csIHBhcm0pIHtcbiAgLy8gY29sT3JpZ2luIGFuZCByb3dPcmlnaW4gYXJlIHRoZSBsZXR0ZXJzIGF0IHRoZSBvcmlnaW4gb2YgdGhlIHNldFxuICB2YXIgaW5kZXggPSBwYXJtIC0gMTtcbiAgdmFyIGNvbE9yaWdpbiA9IFNFVF9PUklHSU5fQ09MVU1OX0xFVFRFUlMuY2hhckNvZGVBdChpbmRleCk7XG4gIHZhciByb3dPcmlnaW4gPSBTRVRfT1JJR0lOX1JPV19MRVRURVJTLmNoYXJDb2RlQXQoaW5kZXgpO1xuXG4gIC8vIGNvbEludCBhbmQgcm93SW50IGFyZSB0aGUgbGV0dGVycyB0byBidWlsZCB0byByZXR1cm5cbiAgdmFyIGNvbEludCA9IGNvbE9yaWdpbiArIGNvbHVtbiAtIDE7XG4gIHZhciByb3dJbnQgPSByb3dPcmlnaW4gKyByb3c7XG4gIHZhciByb2xsb3ZlciA9IGZhbHNlO1xuXG4gIGlmIChjb2xJbnQgPiBaKSB7XG4gICAgY29sSW50ID0gY29sSW50IC0gWiArIEEgLSAxO1xuICAgIHJvbGxvdmVyID0gdHJ1ZTtcbiAgfVxuXG4gIGlmIChjb2xJbnQgPT09IEkgfHwgKGNvbE9yaWdpbiA8IEkgJiYgY29sSW50ID4gSSkgfHwgKChjb2xJbnQgPiBJIHx8IGNvbE9yaWdpbiA8IEkpICYmIHJvbGxvdmVyKSkge1xuICAgIGNvbEludCsrO1xuICB9XG5cbiAgaWYgKGNvbEludCA9PT0gTyB8fCAoY29sT3JpZ2luIDwgTyAmJiBjb2xJbnQgPiBPKSB8fCAoKGNvbEludCA+IE8gfHwgY29sT3JpZ2luIDwgTykgJiYgcm9sbG92ZXIpKSB7XG4gICAgY29sSW50Kys7XG5cbiAgICBpZiAoY29sSW50ID09PSBJKSB7XG4gICAgICBjb2xJbnQrKztcbiAgICB9XG4gIH1cblxuICBpZiAoY29sSW50ID4gWikge1xuICAgIGNvbEludCA9IGNvbEludCAtIFogKyBBIC0gMTtcbiAgfVxuXG4gIGlmIChyb3dJbnQgPiBWKSB7XG4gICAgcm93SW50ID0gcm93SW50IC0gViArIEEgLSAxO1xuICAgIHJvbGxvdmVyID0gdHJ1ZTtcbiAgfVxuICBlbHNlIHtcbiAgICByb2xsb3ZlciA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKCgocm93SW50ID09PSBJKSB8fCAoKHJvd09yaWdpbiA8IEkpICYmIChyb3dJbnQgPiBJKSkpIHx8ICgoKHJvd0ludCA+IEkpIHx8IChyb3dPcmlnaW4gPCBJKSkgJiYgcm9sbG92ZXIpKSB7XG4gICAgcm93SW50Kys7XG4gIH1cblxuICBpZiAoKChyb3dJbnQgPT09IE8pIHx8ICgocm93T3JpZ2luIDwgTykgJiYgKHJvd0ludCA+IE8pKSkgfHwgKCgocm93SW50ID4gTykgfHwgKHJvd09yaWdpbiA8IE8pKSAmJiByb2xsb3ZlcikpIHtcbiAgICByb3dJbnQrKztcblxuICAgIGlmIChyb3dJbnQgPT09IEkpIHtcbiAgICAgIHJvd0ludCsrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChyb3dJbnQgPiBWKSB7XG4gICAgcm93SW50ID0gcm93SW50IC0gViArIEEgLSAxO1xuICB9XG5cbiAgdmFyIHR3b0xldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoY29sSW50KSArIFN0cmluZy5mcm9tQ2hhckNvZGUocm93SW50KTtcbiAgcmV0dXJuIHR3b0xldHRlcjtcbn1cblxuLyoqXG4gKiBEZWNvZGUgdGhlIFVUTSBwYXJhbWV0ZXJzIGZyb20gYSBNR1JTIHN0cmluZy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IG1ncnNTdHJpbmcgYW4gVVBQRVJDQVNFIGNvb3JkaW5hdGUgc3RyaW5nIGlzIGV4cGVjdGVkLlxuICogQHJldHVybiB7b2JqZWN0fSBBbiBvYmplY3QgbGl0ZXJhbCB3aXRoIGVhc3RpbmcsIG5vcnRoaW5nLCB6b25lTGV0dGVyLFxuICogICAgIHpvbmVOdW1iZXIgYW5kIGFjY3VyYWN5IChpbiBtZXRlcnMpIHByb3BlcnRpZXMuXG4gKi9cbmZ1bmN0aW9uIGRlY29kZShtZ3JzU3RyaW5nKSB7XG5cbiAgaWYgKG1ncnNTdHJpbmcgJiYgbWdyc1N0cmluZy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyAoXCJNR1JTUG9pbnQgY292ZXJ0aW5nIGZyb20gbm90aGluZ1wiKTtcbiAgfVxuXG4gIHZhciBsZW5ndGggPSBtZ3JzU3RyaW5nLmxlbmd0aDtcblxuICB2YXIgaHVuSyA9IG51bGw7XG4gIHZhciBzYiA9IFwiXCI7XG4gIHZhciB0ZXN0Q2hhcjtcbiAgdmFyIGkgPSAwO1xuXG4gIC8vIGdldCBab25lIG51bWJlclxuICB3aGlsZSAoISgvW0EtWl0vKS50ZXN0KHRlc3RDaGFyID0gbWdyc1N0cmluZy5jaGFyQXQoaSkpKSB7XG4gICAgaWYgKGkgPj0gMikge1xuICAgICAgdGhyb3cgKFwiTUdSU1BvaW50IGJhZCBjb252ZXJzaW9uIGZyb206IFwiICsgbWdyc1N0cmluZyk7XG4gICAgfVxuICAgIHNiICs9IHRlc3RDaGFyO1xuICAgIGkrKztcbiAgfVxuXG4gIHZhciB6b25lTnVtYmVyID0gcGFyc2VJbnQoc2IsIDEwKTtcblxuICBpZiAoaSA9PT0gMCB8fCBpICsgMyA+IGxlbmd0aCkge1xuICAgIC8vIEEgZ29vZCBNR1JTIHN0cmluZyBoYXMgdG8gYmUgNC01IGRpZ2l0cyBsb25nLFxuICAgIC8vICMjQUFBLyNBQUEgYXQgbGVhc3QuXG4gICAgdGhyb3cgKFwiTUdSU1BvaW50IGJhZCBjb252ZXJzaW9uIGZyb206IFwiICsgbWdyc1N0cmluZyk7XG4gIH1cblxuICB2YXIgem9uZUxldHRlciA9IG1ncnNTdHJpbmcuY2hhckF0KGkrKyk7XG5cbiAgLy8gU2hvdWxkIHdlIGNoZWNrIHRoZSB6b25lIGxldHRlciBoZXJlPyBXaHkgbm90LlxuICBpZiAoem9uZUxldHRlciA8PSAnQScgfHwgem9uZUxldHRlciA9PT0gJ0InIHx8IHpvbmVMZXR0ZXIgPT09ICdZJyB8fCB6b25lTGV0dGVyID49ICdaJyB8fCB6b25lTGV0dGVyID09PSAnSScgfHwgem9uZUxldHRlciA9PT0gJ08nKSB7XG4gICAgdGhyb3cgKFwiTUdSU1BvaW50IHpvbmUgbGV0dGVyIFwiICsgem9uZUxldHRlciArIFwiIG5vdCBoYW5kbGVkOiBcIiArIG1ncnNTdHJpbmcpO1xuICB9XG5cbiAgaHVuSyA9IG1ncnNTdHJpbmcuc3Vic3RyaW5nKGksIGkgKz0gMik7XG5cbiAgdmFyIHNldCA9IGdldDEwMGtTZXRGb3Jab25lKHpvbmVOdW1iZXIpO1xuXG4gIHZhciBlYXN0MTAwayA9IGdldEVhc3RpbmdGcm9tQ2hhcihodW5LLmNoYXJBdCgwKSwgc2V0KTtcbiAgdmFyIG5vcnRoMTAwayA9IGdldE5vcnRoaW5nRnJvbUNoYXIoaHVuSy5jaGFyQXQoMSksIHNldCk7XG5cbiAgLy8gV2UgaGF2ZSBhIGJ1ZyB3aGVyZSB0aGUgbm9ydGhpbmcgbWF5IGJlIDIwMDAwMDAgdG9vIGxvdy5cbiAgLy8gSG93XG4gIC8vIGRvIHdlIGtub3cgd2hlbiB0byByb2xsIG92ZXI/XG5cbiAgd2hpbGUgKG5vcnRoMTAwayA8IGdldE1pbk5vcnRoaW5nKHpvbmVMZXR0ZXIpKSB7XG4gICAgbm9ydGgxMDBrICs9IDIwMDAwMDA7XG4gIH1cblxuICAvLyBjYWxjdWxhdGUgdGhlIGNoYXIgaW5kZXggZm9yIGVhc3Rpbmcvbm9ydGhpbmcgc2VwYXJhdG9yXG4gIHZhciByZW1haW5kZXIgPSBsZW5ndGggLSBpO1xuXG4gIGlmIChyZW1haW5kZXIgJSAyICE9PSAwKSB7XG4gICAgdGhyb3cgKFwiTUdSU1BvaW50IGhhcyB0byBoYXZlIGFuIGV2ZW4gbnVtYmVyIFxcbm9mIGRpZ2l0cyBhZnRlciB0aGUgem9uZSBsZXR0ZXIgYW5kIHR3byAxMDBrbSBsZXR0ZXJzIC0gZnJvbnQgXFxuaGFsZiBmb3IgZWFzdGluZyBtZXRlcnMsIHNlY29uZCBoYWxmIGZvciBcXG5ub3J0aGluZyBtZXRlcnNcIiArIG1ncnNTdHJpbmcpO1xuICB9XG5cbiAgdmFyIHNlcCA9IHJlbWFpbmRlciAvIDI7XG5cbiAgdmFyIHNlcEVhc3RpbmcgPSAwLjA7XG4gIHZhciBzZXBOb3J0aGluZyA9IDAuMDtcbiAgdmFyIGFjY3VyYWN5Qm9udXMsIHNlcEVhc3RpbmdTdHJpbmcsIHNlcE5vcnRoaW5nU3RyaW5nLCBlYXN0aW5nLCBub3J0aGluZztcbiAgaWYgKHNlcCA+IDApIHtcbiAgICBhY2N1cmFjeUJvbnVzID0gMTAwMDAwLjAgLyBNYXRoLnBvdygxMCwgc2VwKTtcbiAgICBzZXBFYXN0aW5nU3RyaW5nID0gbWdyc1N0cmluZy5zdWJzdHJpbmcoaSwgaSArIHNlcCk7XG4gICAgc2VwRWFzdGluZyA9IHBhcnNlRmxvYXQoc2VwRWFzdGluZ1N0cmluZykgKiBhY2N1cmFjeUJvbnVzO1xuICAgIHNlcE5vcnRoaW5nU3RyaW5nID0gbWdyc1N0cmluZy5zdWJzdHJpbmcoaSArIHNlcCk7XG4gICAgc2VwTm9ydGhpbmcgPSBwYXJzZUZsb2F0KHNlcE5vcnRoaW5nU3RyaW5nKSAqIGFjY3VyYWN5Qm9udXM7XG4gIH1cblxuICBlYXN0aW5nID0gc2VwRWFzdGluZyArIGVhc3QxMDBrO1xuICBub3J0aGluZyA9IHNlcE5vcnRoaW5nICsgbm9ydGgxMDBrO1xuXG4gIHJldHVybiB7XG4gICAgZWFzdGluZzogZWFzdGluZyxcbiAgICBub3J0aGluZzogbm9ydGhpbmcsXG4gICAgem9uZUxldHRlcjogem9uZUxldHRlcixcbiAgICB6b25lTnVtYmVyOiB6b25lTnVtYmVyLFxuICAgIGFjY3VyYWN5OiBhY2N1cmFjeUJvbnVzXG4gIH07XG59XG5cbi8qKlxuICogR2l2ZW4gdGhlIGZpcnN0IGxldHRlciBmcm9tIGEgdHdvLWxldHRlciBNR1JTIDEwMGsgem9uZSwgYW5kIGdpdmVuIHRoZVxuICogTUdSUyB0YWJsZSBzZXQgZm9yIHRoZSB6b25lIG51bWJlciwgZmlndXJlIG91dCB0aGUgZWFzdGluZyB2YWx1ZSB0aGF0XG4gKiBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIG90aGVyLCBzZWNvbmRhcnkgZWFzdGluZyB2YWx1ZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtjaGFyfSBlIFRoZSBmaXJzdCBsZXR0ZXIgZnJvbSBhIHR3by1sZXR0ZXIgTUdSUyAxMDDCtGsgem9uZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzZXQgVGhlIE1HUlMgdGFibGUgc2V0IGZvciB0aGUgem9uZSBudW1iZXIuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBlYXN0aW5nIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbGV0dGVyIGFuZCBzZXQuXG4gKi9cbmZ1bmN0aW9uIGdldEVhc3RpbmdGcm9tQ2hhcihlLCBzZXQpIHtcbiAgLy8gY29sT3JpZ2luIGlzIHRoZSBsZXR0ZXIgYXQgdGhlIG9yaWdpbiBvZiB0aGUgc2V0IGZvciB0aGVcbiAgLy8gY29sdW1uXG4gIHZhciBjdXJDb2wgPSBTRVRfT1JJR0lOX0NPTFVNTl9MRVRURVJTLmNoYXJDb2RlQXQoc2V0IC0gMSk7XG4gIHZhciBlYXN0aW5nVmFsdWUgPSAxMDAwMDAuMDtcbiAgdmFyIHJld2luZE1hcmtlciA9IGZhbHNlO1xuXG4gIHdoaWxlIChjdXJDb2wgIT09IGUuY2hhckNvZGVBdCgwKSkge1xuICAgIGN1ckNvbCsrO1xuICAgIGlmIChjdXJDb2wgPT09IEkpIHtcbiAgICAgIGN1ckNvbCsrO1xuICAgIH1cbiAgICBpZiAoY3VyQ29sID09PSBPKSB7XG4gICAgICBjdXJDb2wrKztcbiAgICB9XG4gICAgaWYgKGN1ckNvbCA+IFopIHtcbiAgICAgIGlmIChyZXdpbmRNYXJrZXIpIHtcbiAgICAgICAgdGhyb3cgKFwiQmFkIGNoYXJhY3RlcjogXCIgKyBlKTtcbiAgICAgIH1cbiAgICAgIGN1ckNvbCA9IEE7XG4gICAgICByZXdpbmRNYXJrZXIgPSB0cnVlO1xuICAgIH1cbiAgICBlYXN0aW5nVmFsdWUgKz0gMTAwMDAwLjA7XG4gIH1cblxuICByZXR1cm4gZWFzdGluZ1ZhbHVlO1xufVxuXG4vKipcbiAqIEdpdmVuIHRoZSBzZWNvbmQgbGV0dGVyIGZyb20gYSB0d28tbGV0dGVyIE1HUlMgMTAwayB6b25lLCBhbmQgZ2l2ZW4gdGhlXG4gKiBNR1JTIHRhYmxlIHNldCBmb3IgdGhlIHpvbmUgbnVtYmVyLCBmaWd1cmUgb3V0IHRoZSBub3J0aGluZyB2YWx1ZSB0aGF0XG4gKiBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIG90aGVyLCBzZWNvbmRhcnkgbm9ydGhpbmcgdmFsdWUuIFlvdSBoYXZlIHRvXG4gKiByZW1lbWJlciB0aGF0IE5vcnRoaW5ncyBhcmUgZGV0ZXJtaW5lZCBmcm9tIHRoZSBlcXVhdG9yLCBhbmQgdGhlIHZlcnRpY2FsXG4gKiBjeWNsZSBvZiBsZXR0ZXJzIG1lYW4gYSAyMDAwMDAwIGFkZGl0aW9uYWwgbm9ydGhpbmcgbWV0ZXJzLiBUaGlzIGhhcHBlbnNcbiAqIGFwcHJveC4gZXZlcnkgMTggZGVncmVlcyBvZiBsYXRpdHVkZS4gVGhpcyBtZXRob2QgZG9lcyAqTk9UKiBjb3VudCBhbnlcbiAqIGFkZGl0aW9uYWwgbm9ydGhpbmdzLiBZb3UgaGF2ZSB0byBmaWd1cmUgb3V0IGhvdyBtYW55IDIwMDAwMDAgbWV0ZXJzIG5lZWRcbiAqIHRvIGJlIGFkZGVkIGZvciB0aGUgem9uZSBsZXR0ZXIgb2YgdGhlIE1HUlMgY29vcmRpbmF0ZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtjaGFyfSBuIFNlY29uZCBsZXR0ZXIgb2YgdGhlIE1HUlMgMTAwayB6b25lXG4gKiBAcGFyYW0ge251bWJlcn0gc2V0IFRoZSBNR1JTIHRhYmxlIHNldCBudW1iZXIsIHdoaWNoIGlzIGRlcGVuZGVudCBvbiB0aGVcbiAqICAgICBVVE0gem9uZSBudW1iZXIuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBub3J0aGluZyB2YWx1ZSBmb3IgdGhlIGdpdmVuIGxldHRlciBhbmQgc2V0LlxuICovXG5mdW5jdGlvbiBnZXROb3J0aGluZ0Zyb21DaGFyKG4sIHNldCkge1xuXG4gIGlmIChuID4gJ1YnKSB7XG4gICAgdGhyb3cgKFwiTUdSU1BvaW50IGdpdmVuIGludmFsaWQgTm9ydGhpbmcgXCIgKyBuKTtcbiAgfVxuXG4gIC8vIHJvd09yaWdpbiBpcyB0aGUgbGV0dGVyIGF0IHRoZSBvcmlnaW4gb2YgdGhlIHNldCBmb3IgdGhlXG4gIC8vIGNvbHVtblxuICB2YXIgY3VyUm93ID0gU0VUX09SSUdJTl9ST1dfTEVUVEVSUy5jaGFyQ29kZUF0KHNldCAtIDEpO1xuICB2YXIgbm9ydGhpbmdWYWx1ZSA9IDAuMDtcbiAgdmFyIHJld2luZE1hcmtlciA9IGZhbHNlO1xuXG4gIHdoaWxlIChjdXJSb3cgIT09IG4uY2hhckNvZGVBdCgwKSkge1xuICAgIGN1clJvdysrO1xuICAgIGlmIChjdXJSb3cgPT09IEkpIHtcbiAgICAgIGN1clJvdysrO1xuICAgIH1cbiAgICBpZiAoY3VyUm93ID09PSBPKSB7XG4gICAgICBjdXJSb3crKztcbiAgICB9XG4gICAgLy8gZml4aW5nIGEgYnVnIG1ha2luZyB3aG9sZSBhcHBsaWNhdGlvbiBoYW5nIGluIHRoaXMgbG9vcFxuICAgIC8vIHdoZW4gJ24nIGlzIGEgd3JvbmcgY2hhcmFjdGVyXG4gICAgaWYgKGN1clJvdyA+IFYpIHtcbiAgICAgIGlmIChyZXdpbmRNYXJrZXIpIHsgLy8gbWFraW5nIHN1cmUgdGhhdCB0aGlzIGxvb3AgZW5kc1xuICAgICAgICB0aHJvdyAoXCJCYWQgY2hhcmFjdGVyOiBcIiArIG4pO1xuICAgICAgfVxuICAgICAgY3VyUm93ID0gQTtcbiAgICAgIHJld2luZE1hcmtlciA9IHRydWU7XG4gICAgfVxuICAgIG5vcnRoaW5nVmFsdWUgKz0gMTAwMDAwLjA7XG4gIH1cblxuICByZXR1cm4gbm9ydGhpbmdWYWx1ZTtcbn1cblxuLyoqXG4gKiBUaGUgZnVuY3Rpb24gZ2V0TWluTm9ydGhpbmcgcmV0dXJucyB0aGUgbWluaW11bSBub3J0aGluZyB2YWx1ZSBvZiBhIE1HUlNcbiAqIHpvbmUuXG4gKlxuICogUG9ydGVkIGZyb20gR2VvdHJhbnMnIGMgTGF0dGl0dWRlX0JhbmRfVmFsdWUgc3RydWN0dXJlIHRhYmxlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge2NoYXJ9IHpvbmVMZXR0ZXIgVGhlIE1HUlMgem9uZSB0byBnZXQgdGhlIG1pbiBub3J0aGluZyBmb3IuXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldE1pbk5vcnRoaW5nKHpvbmVMZXR0ZXIpIHtcbiAgdmFyIG5vcnRoaW5nO1xuICBzd2l0Y2ggKHpvbmVMZXR0ZXIpIHtcbiAgY2FzZSAnQyc6XG4gICAgbm9ydGhpbmcgPSAxMTAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ0QnOlxuICAgIG5vcnRoaW5nID0gMjAwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdFJzpcbiAgICBub3J0aGluZyA9IDI4MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnRic6XG4gICAgbm9ydGhpbmcgPSAzNzAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ0cnOlxuICAgIG5vcnRoaW5nID0gNDYwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdIJzpcbiAgICBub3J0aGluZyA9IDU1MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnSic6XG4gICAgbm9ydGhpbmcgPSA2NDAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ0snOlxuICAgIG5vcnRoaW5nID0gNzMwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdMJzpcbiAgICBub3J0aGluZyA9IDgyMDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnTSc6XG4gICAgbm9ydGhpbmcgPSA5MTAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ04nOlxuICAgIG5vcnRoaW5nID0gMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdQJzpcbiAgICBub3J0aGluZyA9IDgwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdRJzpcbiAgICBub3J0aGluZyA9IDE3MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnUic6XG4gICAgbm9ydGhpbmcgPSAyNjAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1MnOlxuICAgIG5vcnRoaW5nID0gMzUwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdUJzpcbiAgICBub3J0aGluZyA9IDQ0MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnVSc6XG4gICAgbm9ydGhpbmcgPSA1MzAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1YnOlxuICAgIG5vcnRoaW5nID0gNjIwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdXJzpcbiAgICBub3J0aGluZyA9IDcwMDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnWCc6XG4gICAgbm9ydGhpbmcgPSA3OTAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGRlZmF1bHQ6XG4gICAgbm9ydGhpbmcgPSAtMS4wO1xuICB9XG4gIGlmIChub3J0aGluZyA+PSAwLjApIHtcbiAgICByZXR1cm4gbm9ydGhpbmc7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhyb3cgKFwiSW52YWxpZCB6b25lIGxldHRlcjogXCIgKyB6b25lTGV0dGVyKTtcbiAgfVxuXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcInByb2o0XCIsXG4gIFwidmVyc2lvblwiOiBcIjIuMy4xMFwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiUHJvajRqcyBpcyBhIEphdmFTY3JpcHQgbGlicmFyeSB0byB0cmFuc2Zvcm0gcG9pbnQgY29vcmRpbmF0ZXMgZnJvbSBvbmUgY29vcmRpbmF0ZSBzeXN0ZW0gdG8gYW5vdGhlciwgaW5jbHVkaW5nIGRhdHVtIHRyYW5zZm9ybWF0aW9ucy5cIixcbiAgXCJtYWluXCI6IFwibGliL2luZGV4LmpzXCIsXG4gIFwiZGlyZWN0b3JpZXNcIjoge1xuICAgIFwidGVzdFwiOiBcInRlc3RcIixcbiAgICBcImRvY1wiOiBcImRvY3NcIlxuICB9LFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwidGVzdFwiOiBcIi4vbm9kZV9tb2R1bGVzL2lzdGFuYnVsL2xpYi9jbGkuanMgdGVzdCAuL25vZGVfbW9kdWxlcy9tb2NoYS9iaW4vX21vY2hhIHRlc3QvdGVzdC5qc1wiXG4gIH0sXG4gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXG4gICAgXCJ1cmxcIjogXCJnaXQ6Ly9naXRodWIuY29tL3Byb2o0anMvcHJvajRqcy5naXRcIlxuICB9LFxuICBcImF1dGhvclwiOiBcIlwiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJqYW1cIjoge1xuICAgIFwibWFpblwiOiBcImRpc3QvcHJvajQuanNcIixcbiAgICBcImluY2x1ZGVcIjogW1xuICAgICAgXCJkaXN0L3Byb2o0LmpzXCIsXG4gICAgICBcIlJFQURNRS5tZFwiLFxuICAgICAgXCJBVVRIT1JTXCIsXG4gICAgICBcIkxJQ0VOU0UubWRcIlxuICAgIF1cbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiZ3J1bnQtY2xpXCI6IFwifjAuMS4xM1wiLFxuICAgIFwiZ3J1bnRcIjogXCJ+MC40LjJcIixcbiAgICBcImdydW50LWNvbnRyaWItY29ubmVjdFwiOiBcIn4wLjYuMFwiLFxuICAgIFwiZ3J1bnQtY29udHJpYi1qc2hpbnRcIjogXCJ+MC44LjBcIixcbiAgICBcImNoYWlcIjogXCJ+MS44LjFcIixcbiAgICBcIm1vY2hhXCI6IFwifjEuMTcuMVwiLFxuICAgIFwiZ3J1bnQtbW9jaGEtcGhhbnRvbWpzXCI6IFwifjAuNC4wXCIsXG4gICAgXCJicm93c2VyaWZ5XCI6IFwifjMuMjQuNVwiLFxuICAgIFwiZ3J1bnQtYnJvd3NlcmlmeVwiOiBcIn4xLjMuMFwiLFxuICAgIFwiZ3J1bnQtY29udHJpYi11Z2xpZnlcIjogXCJ+MC4zLjJcIixcbiAgICBcImN1cmxcIjogXCJnaXQ6Ly9naXRodWIuY29tL2N1am9qcy9jdXJsLmdpdFwiLFxuICAgIFwiaXN0YW5idWxcIjogXCJ+MC4yLjRcIixcbiAgICBcInRpblwiOiBcIn4wLjQuMFwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIm1ncnNcIjogXCJ+MC4wLjJcIlxuICB9LFxuICBcImNvbnRyaWJ1dG9yc1wiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiTWlrZSBBZGFpclwiLFxuICAgICAgXCJlbWFpbFwiOiBcIm1hZGFpckBkbXNvbHV0aW9ucy5jYVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJSaWNoYXJkIEdyZWVud29vZFwiLFxuICAgICAgXCJlbWFpbFwiOiBcInJpY2hAZ3JlZW53b29kbWFwLmNvbVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJDYWx2aW4gTWV0Y2FsZlwiLFxuICAgICAgXCJlbWFpbFwiOiBcImNhbHZpbi5tZXRjYWxmQGdtYWlsLmNvbVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJSaWNoYXJkIE1hcnNkZW5cIixcbiAgICAgIFwidXJsXCI6IFwiaHR0cDovL3d3dy53aW53YWVkLmNvbVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJULiBNaXR0YW5cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiRC4gU3RlaW53YW5kXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlMuIE5lbHNvblwiXG4gICAgfVxuICBdLFxuICBcImdpdEhlYWRcIjogXCJhYzAzZDE0Mzk0OTFkYzMxM2RhODA5ODUxOTNmNzAyY2E0NzFiM2QwXCIsXG4gIFwiYnVnc1wiOiB7XG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vcHJvajRqcy9wcm9qNGpzL2lzc3Vlc1wiXG4gIH0sXG4gIFwiaG9tZXBhZ2VcIjogXCJodHRwczovL2dpdGh1Yi5jb20vcHJvajRqcy9wcm9qNGpzI3JlYWRtZVwiLFxuICBcIl9pZFwiOiBcInByb2o0QDIuMy4xMFwiLFxuICBcIl9zaGFzdW1cIjogXCJmNmU2NmJkY2NhMzMyYzI1YTVlM2Q4ZWYyNjVjZmM5ZDdiNjBmZDBjXCIsXG4gIFwiX2Zyb21cIjogXCJwcm9qNEAqXCIsXG4gIFwiX25wbVZlcnNpb25cIjogXCIyLjExLjJcIixcbiAgXCJfbm9kZVZlcnNpb25cIjogXCIwLjEyLjVcIixcbiAgXCJfbnBtVXNlclwiOiB7XG4gICAgXCJuYW1lXCI6IFwiYWhvY2V2YXJcIixcbiAgICBcImVtYWlsXCI6IFwiYW5kcmVhcy5ob2NldmFyQGdtYWlsLmNvbVwiXG4gIH0sXG4gIFwibWFpbnRhaW5lcnNcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcImN3bW1hXCIsXG4gICAgICBcImVtYWlsXCI6IFwiY2FsdmluLm1ldGNhbGZAZ21haWwuY29tXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcImFob2NldmFyXCIsXG4gICAgICBcImVtYWlsXCI6IFwiYW5kcmVhcy5ob2NldmFyQGdtYWlsLmNvbVwiXG4gICAgfVxuICBdLFxuICBcImRpc3RcIjoge1xuICAgIFwic2hhc3VtXCI6IFwiZjZlNjZiZGNjYTMzMmMyNWE1ZTNkOGVmMjY1Y2ZjOWQ3YjYwZmQwY1wiLFxuICAgIFwidGFyYmFsbFwiOiBcImh0dHA6Ly9yZWdpc3RyeS5ucG1qcy5vcmcvcHJvajQvLS9wcm9qNC0yLjMuMTAudGd6XCJcbiAgfSxcbiAgXCJfcmVzb2x2ZWRcIjogXCJodHRwczovL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9wcm9qNC8tL3Byb2o0LTIuMy4xMC50Z3pcIlxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBhcHBseU1pZGRsZXdhcmU7XG5cbnZhciBfY29tcG9zZSA9IHJlcXVpcmUoJy4vY29tcG9zZScpO1xuXG52YXIgX2NvbXBvc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuLyoqXG4gKiBDcmVhdGVzIGEgc3RvcmUgZW5oYW5jZXIgdGhhdCBhcHBsaWVzIG1pZGRsZXdhcmUgdG8gdGhlIGRpc3BhdGNoIG1ldGhvZFxuICogb2YgdGhlIFJlZHV4IHN0b3JlLiBUaGlzIGlzIGhhbmR5IGZvciBhIHZhcmlldHkgb2YgdGFza3MsIHN1Y2ggYXMgZXhwcmVzc2luZ1xuICogYXN5bmNocm9ub3VzIGFjdGlvbnMgaW4gYSBjb25jaXNlIG1hbm5lciwgb3IgbG9nZ2luZyBldmVyeSBhY3Rpb24gcGF5bG9hZC5cbiAqXG4gKiBTZWUgYHJlZHV4LXRodW5rYCBwYWNrYWdlIGFzIGFuIGV4YW1wbGUgb2YgdGhlIFJlZHV4IG1pZGRsZXdhcmUuXG4gKlxuICogQmVjYXVzZSBtaWRkbGV3YXJlIGlzIHBvdGVudGlhbGx5IGFzeW5jaHJvbm91cywgdGhpcyBzaG91bGQgYmUgdGhlIGZpcnN0XG4gKiBzdG9yZSBlbmhhbmNlciBpbiB0aGUgY29tcG9zaXRpb24gY2hhaW4uXG4gKlxuICogTm90ZSB0aGF0IGVhY2ggbWlkZGxld2FyZSB3aWxsIGJlIGdpdmVuIHRoZSBgZGlzcGF0Y2hgIGFuZCBgZ2V0U3RhdGVgIGZ1bmN0aW9uc1xuICogYXMgbmFtZWQgYXJndW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IG1pZGRsZXdhcmVzIFRoZSBtaWRkbGV3YXJlIGNoYWluIHRvIGJlIGFwcGxpZWQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgc3RvcmUgZW5oYW5jZXIgYXBwbHlpbmcgdGhlIG1pZGRsZXdhcmUuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5TWlkZGxld2FyZSgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIG1pZGRsZXdhcmVzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgbWlkZGxld2FyZXNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGNyZWF0ZVN0b3JlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChyZWR1Y2VyLCBwcmVsb2FkZWRTdGF0ZSwgZW5oYW5jZXIpIHtcbiAgICAgIHZhciBzdG9yZSA9IGNyZWF0ZVN0b3JlKHJlZHVjZXIsIHByZWxvYWRlZFN0YXRlLCBlbmhhbmNlcik7XG4gICAgICB2YXIgX2Rpc3BhdGNoID0gc3RvcmUuZGlzcGF0Y2g7XG4gICAgICB2YXIgY2hhaW4gPSBbXTtcblxuICAgICAgdmFyIG1pZGRsZXdhcmVBUEkgPSB7XG4gICAgICAgIGdldFN0YXRlOiBzdG9yZS5nZXRTdGF0ZSxcbiAgICAgICAgZGlzcGF0Y2g6IGZ1bmN0aW9uIGRpc3BhdGNoKGFjdGlvbikge1xuICAgICAgICAgIHJldHVybiBfZGlzcGF0Y2goYWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNoYWluID0gbWlkZGxld2FyZXMubWFwKGZ1bmN0aW9uIChtaWRkbGV3YXJlKSB7XG4gICAgICAgIHJldHVybiBtaWRkbGV3YXJlKG1pZGRsZXdhcmVBUEkpO1xuICAgICAgfSk7XG4gICAgICBfZGlzcGF0Y2ggPSBfY29tcG9zZTJbJ2RlZmF1bHQnXS5hcHBseSh1bmRlZmluZWQsIGNoYWluKShzdG9yZS5kaXNwYXRjaCk7XG5cbiAgICAgIHJldHVybiBfZXh0ZW5kcyh7fSwgc3RvcmUsIHtcbiAgICAgICAgZGlzcGF0Y2g6IF9kaXNwYXRjaFxuICAgICAgfSk7XG4gICAgfTtcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzWydkZWZhdWx0J10gPSBiaW5kQWN0aW9uQ3JlYXRvcnM7XG5mdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9yLCBkaXNwYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkaXNwYXRjaChhY3Rpb25DcmVhdG9yLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbi8qKlxuICogVHVybnMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgYWN0aW9uIGNyZWF0b3JzLCBpbnRvIGFuIG9iamVjdCB3aXRoIHRoZVxuICogc2FtZSBrZXlzLCBidXQgd2l0aCBldmVyeSBmdW5jdGlvbiB3cmFwcGVkIGludG8gYSBgZGlzcGF0Y2hgIGNhbGwgc28gdGhleVxuICogbWF5IGJlIGludm9rZWQgZGlyZWN0bHkuIFRoaXMgaXMganVzdCBhIGNvbnZlbmllbmNlIG1ldGhvZCwgYXMgeW91IGNhbiBjYWxsXG4gKiBgc3RvcmUuZGlzcGF0Y2goTXlBY3Rpb25DcmVhdG9ycy5kb1NvbWV0aGluZygpKWAgeW91cnNlbGYganVzdCBmaW5lLlxuICpcbiAqIEZvciBjb252ZW5pZW5jZSwgeW91IGNhbiBhbHNvIHBhc3MgYSBzaW5nbGUgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50LFxuICogYW5kIGdldCBhIGZ1bmN0aW9uIGluIHJldHVybi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gYWN0aW9uQ3JlYXRvcnMgQW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgYWN0aW9uXG4gKiBjcmVhdG9yIGZ1bmN0aW9ucy4gT25lIGhhbmR5IHdheSB0byBvYnRhaW4gaXQgaXMgdG8gdXNlIEVTNiBgaW1wb3J0ICogYXNgXG4gKiBzeW50YXguIFlvdSBtYXkgYWxzbyBwYXNzIGEgc2luZ2xlIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGRpc3BhdGNoIFRoZSBgZGlzcGF0Y2hgIGZ1bmN0aW9uIGF2YWlsYWJsZSBvbiB5b3VyIFJlZHV4XG4gKiBzdG9yZS5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb258T2JqZWN0fSBUaGUgb2JqZWN0IG1pbWlja2luZyB0aGUgb3JpZ2luYWwgb2JqZWN0LCBidXQgd2l0aFxuICogZXZlcnkgYWN0aW9uIGNyZWF0b3Igd3JhcHBlZCBpbnRvIHRoZSBgZGlzcGF0Y2hgIGNhbGwuIElmIHlvdSBwYXNzZWQgYVxuICogZnVuY3Rpb24gYXMgYGFjdGlvbkNyZWF0b3JzYCwgdGhlIHJldHVybiB2YWx1ZSB3aWxsIGFsc28gYmUgYSBzaW5nbGVcbiAqIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcnMoYWN0aW9uQ3JlYXRvcnMsIGRpc3BhdGNoKSB7XG4gIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvcnMsIGRpc3BhdGNoKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvcnMgIT09ICdvYmplY3QnIHx8IGFjdGlvbkNyZWF0b3JzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWN0aW9uQ3JlYXRvcnMgZXhwZWN0ZWQgYW4gb2JqZWN0IG9yIGEgZnVuY3Rpb24sIGluc3RlYWQgcmVjZWl2ZWQgJyArIChhY3Rpb25DcmVhdG9ycyA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVvZiBhY3Rpb25DcmVhdG9ycykgKyAnLiAnICsgJ0RpZCB5b3Ugd3JpdGUgXCJpbXBvcnQgQWN0aW9uQ3JlYXRvcnMgZnJvbVwiIGluc3RlYWQgb2YgXCJpbXBvcnQgKiBhcyBBY3Rpb25DcmVhdG9ycyBmcm9tXCI/Jyk7XG4gIH1cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFjdGlvbkNyZWF0b3JzKTtcbiAgdmFyIGJvdW5kQWN0aW9uQ3JlYXRvcnMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgdmFyIGFjdGlvbkNyZWF0b3IgPSBhY3Rpb25DcmVhdG9yc1trZXldO1xuICAgIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYm91bmRBY3Rpb25DcmVhdG9yc1trZXldID0gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvciwgZGlzcGF0Y2gpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYm91bmRBY3Rpb25DcmVhdG9ycztcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzWydkZWZhdWx0J10gPSBjb21iaW5lUmVkdWNlcnM7XG5cbnZhciBfY3JlYXRlU3RvcmUgPSByZXF1aXJlKCcuL2NyZWF0ZVN0b3JlJyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc1BsYWluT2JqZWN0Jyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1BsYWluT2JqZWN0KTtcblxudmFyIF93YXJuaW5nID0gcmVxdWlyZSgnLi91dGlscy93YXJuaW5nJyk7XG5cbnZhciBfd2FybmluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93YXJuaW5nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBnZXRVbmRlZmluZWRTdGF0ZUVycm9yTWVzc2FnZShrZXksIGFjdGlvbikge1xuICB2YXIgYWN0aW9uVHlwZSA9IGFjdGlvbiAmJiBhY3Rpb24udHlwZTtcbiAgdmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25UeXBlICYmICdcIicgKyBhY3Rpb25UeXBlLnRvU3RyaW5nKCkgKyAnXCInIHx8ICdhbiBhY3Rpb24nO1xuXG4gIHJldHVybiAnR2l2ZW4gYWN0aW9uICcgKyBhY3Rpb25OYW1lICsgJywgcmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkLiAnICsgJ1RvIGlnbm9yZSBhbiBhY3Rpb24sIHlvdSBtdXN0IGV4cGxpY2l0bHkgcmV0dXJuIHRoZSBwcmV2aW91cyBzdGF0ZS4nO1xufVxuXG5mdW5jdGlvbiBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKGlucHV0U3RhdGUsIHJlZHVjZXJzLCBhY3Rpb24sIHVuZXhwZWN0ZWRLZXlDYWNoZSkge1xuICB2YXIgcmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhyZWR1Y2Vycyk7XG4gIHZhciBhcmd1bWVudE5hbWUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGUgPT09IF9jcmVhdGVTdG9yZS5BY3Rpb25UeXBlcy5JTklUID8gJ3ByZWxvYWRlZFN0YXRlIGFyZ3VtZW50IHBhc3NlZCB0byBjcmVhdGVTdG9yZScgOiAncHJldmlvdXMgc3RhdGUgcmVjZWl2ZWQgYnkgdGhlIHJlZHVjZXInO1xuXG4gIGlmIChyZWR1Y2VyS2V5cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJ1N0b3JlIGRvZXMgbm90IGhhdmUgYSB2YWxpZCByZWR1Y2VyLiBNYWtlIHN1cmUgdGhlIGFyZ3VtZW50IHBhc3NlZCAnICsgJ3RvIGNvbWJpbmVSZWR1Y2VycyBpcyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSByZWR1Y2Vycy4nO1xuICB9XG5cbiAgaWYgKCEoMCwgX2lzUGxhaW5PYmplY3QyWydkZWZhdWx0J10pKGlucHV0U3RhdGUpKSB7XG4gICAgcmV0dXJuICdUaGUgJyArIGFyZ3VtZW50TmFtZSArICcgaGFzIHVuZXhwZWN0ZWQgdHlwZSBvZiBcIicgKyB7fS50b1N0cmluZy5jYWxsKGlucHV0U3RhdGUpLm1hdGNoKC9cXHMoW2EtenxBLVpdKykvKVsxXSArICdcIi4gRXhwZWN0ZWQgYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyAnICsgKCdrZXlzOiBcIicgKyByZWR1Y2VyS2V5cy5qb2luKCdcIiwgXCInKSArICdcIicpO1xuICB9XG5cbiAgdmFyIHVuZXhwZWN0ZWRLZXlzID0gT2JqZWN0LmtleXMoaW5wdXRTdGF0ZSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gIXJlZHVjZXJzLmhhc093blByb3BlcnR5KGtleSkgJiYgIXVuZXhwZWN0ZWRLZXlDYWNoZVtrZXldO1xuICB9KTtcblxuICB1bmV4cGVjdGVkS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB1bmV4cGVjdGVkS2V5Q2FjaGVba2V5XSA9IHRydWU7XG4gIH0pO1xuXG4gIGlmICh1bmV4cGVjdGVkS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuICdVbmV4cGVjdGVkICcgKyAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMSA/ICdrZXlzJyA6ICdrZXknKSArICcgJyArICgnXCInICsgdW5leHBlY3RlZEtleXMuam9pbignXCIsIFwiJykgKyAnXCIgZm91bmQgaW4gJyArIGFyZ3VtZW50TmFtZSArICcuICcpICsgJ0V4cGVjdGVkIHRvIGZpbmQgb25lIG9mIHRoZSBrbm93biByZWR1Y2VyIGtleXMgaW5zdGVhZDogJyArICgnXCInICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyAnXCIuIFVuZXhwZWN0ZWQga2V5cyB3aWxsIGJlIGlnbm9yZWQuJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0UmVkdWNlclNhbml0eShyZWR1Y2Vycykge1xuICBPYmplY3Qua2V5cyhyZWR1Y2VycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHJlZHVjZXIgPSByZWR1Y2Vyc1trZXldO1xuICAgIHZhciBpbml0aWFsU3RhdGUgPSByZWR1Y2VyKHVuZGVmaW5lZCwgeyB0eXBlOiBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCB9KTtcblxuICAgIGlmICh0eXBlb2YgaW5pdGlhbFN0YXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgZHVyaW5nIGluaXRpYWxpemF0aW9uLiAnICsgJ0lmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlIHJlZHVjZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCAnICsgJ2V4cGxpY2l0bHkgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgJyArICdub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgIH1cblxuICAgIHZhciB0eXBlID0gJ0BAcmVkdXgvUFJPQkVfVU5LTk9XTl9BQ1RJT05fJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KS5zcGxpdCgnJykuam9pbignLicpO1xuICAgIGlmICh0eXBlb2YgcmVkdWNlcih1bmRlZmluZWQsIHsgdHlwZTogdHlwZSB9KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIHdoZW4gcHJvYmVkIHdpdGggYSByYW5kb20gdHlwZS4gJyArICgnRG9uXFwndCB0cnkgdG8gaGFuZGxlICcgKyBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCArICcgb3Igb3RoZXIgYWN0aW9ucyBpbiBcInJlZHV4LypcIiAnKSArICduYW1lc3BhY2UuIFRoZXkgYXJlIGNvbnNpZGVyZWQgcHJpdmF0ZS4gSW5zdGVhZCwgeW91IG11c3QgcmV0dXJuIHRoZSAnICsgJ2N1cnJlbnQgc3RhdGUgZm9yIGFueSB1bmtub3duIGFjdGlvbnMsIHVubGVzcyBpdCBpcyB1bmRlZmluZWQsICcgKyAnaW4gd2hpY2ggY2FzZSB5b3UgbXVzdCByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUsIHJlZ2FyZGxlc3Mgb2YgdGhlICcgKyAnYWN0aW9uIHR5cGUuIFRoZSBpbml0aWFsIHN0YXRlIG1heSBub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVHVybnMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgZGlmZmVyZW50IHJlZHVjZXIgZnVuY3Rpb25zLCBpbnRvIGEgc2luZ2xlXG4gKiByZWR1Y2VyIGZ1bmN0aW9uLiBJdCB3aWxsIGNhbGwgZXZlcnkgY2hpbGQgcmVkdWNlciwgYW5kIGdhdGhlciB0aGVpciByZXN1bHRzXG4gKiBpbnRvIGEgc2luZ2xlIHN0YXRlIG9iamVjdCwgd2hvc2Uga2V5cyBjb3JyZXNwb25kIHRvIHRoZSBrZXlzIG9mIHRoZSBwYXNzZWRcbiAqIHJlZHVjZXIgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZWR1Y2VycyBBbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGNvcnJlc3BvbmQgdG8gZGlmZmVyZW50XG4gKiByZWR1Y2VyIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmUgY29tYmluZWQgaW50byBvbmUuIE9uZSBoYW5keSB3YXkgdG8gb2J0YWluXG4gKiBpdCBpcyB0byB1c2UgRVM2IGBpbXBvcnQgKiBhcyByZWR1Y2Vyc2Agc3ludGF4LiBUaGUgcmVkdWNlcnMgbWF5IG5ldmVyIHJldHVyblxuICogdW5kZWZpbmVkIGZvciBhbnkgYWN0aW9uLiBJbnN0ZWFkLCB0aGV5IHNob3VsZCByZXR1cm4gdGhlaXIgaW5pdGlhbCBzdGF0ZVxuICogaWYgdGhlIHN0YXRlIHBhc3NlZCB0byB0aGVtIHdhcyB1bmRlZmluZWQsIGFuZCB0aGUgY3VycmVudCBzdGF0ZSBmb3IgYW55XG4gKiB1bnJlY29nbml6ZWQgYWN0aW9uLlxuICpcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSByZWR1Y2VyIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBldmVyeSByZWR1Y2VyIGluc2lkZSB0aGVcbiAqIHBhc3NlZCBvYmplY3QsIGFuZCBidWlsZHMgYSBzdGF0ZSBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzaGFwZS5cbiAqL1xuZnVuY3Rpb24gY29tYmluZVJlZHVjZXJzKHJlZHVjZXJzKSB7XG4gIHZhciByZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKHJlZHVjZXJzKTtcbiAgdmFyIGZpbmFsUmVkdWNlcnMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWR1Y2VyS2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSByZWR1Y2VyS2V5c1tpXTtcblxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBpZiAodHlwZW9mIHJlZHVjZXJzW2tleV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICgwLCBfd2FybmluZzJbJ2RlZmF1bHQnXSkoJ05vIHJlZHVjZXIgcHJvdmlkZWQgZm9yIGtleSBcIicgKyBrZXkgKyAnXCInKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHJlZHVjZXJzW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZpbmFsUmVkdWNlcnNba2V5XSA9IHJlZHVjZXJzW2tleV07XG4gICAgfVxuICB9XG4gIHZhciBmaW5hbFJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMoZmluYWxSZWR1Y2Vycyk7XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICB2YXIgdW5leHBlY3RlZEtleUNhY2hlID0ge307XG4gIH1cblxuICB2YXIgc2FuaXR5RXJyb3I7XG4gIHRyeSB7XG4gICAgYXNzZXJ0UmVkdWNlclNhbml0eShmaW5hbFJlZHVjZXJzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHNhbml0eUVycm9yID0gZTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBjb21iaW5hdGlvbigpIHtcbiAgICB2YXIgc3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgYWN0aW9uID0gYXJndW1lbnRzWzFdO1xuXG4gICAgaWYgKHNhbml0eUVycm9yKSB7XG4gICAgICB0aHJvdyBzYW5pdHlFcnJvcjtcbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgdmFyIHdhcm5pbmdNZXNzYWdlID0gZ2V0VW5leHBlY3RlZFN0YXRlU2hhcGVXYXJuaW5nTWVzc2FnZShzdGF0ZSwgZmluYWxSZWR1Y2VycywgYWN0aW9uLCB1bmV4cGVjdGVkS2V5Q2FjaGUpO1xuICAgICAgaWYgKHdhcm5pbmdNZXNzYWdlKSB7XG4gICAgICAgICgwLCBfd2FybmluZzJbJ2RlZmF1bHQnXSkod2FybmluZ01lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBoYXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgdmFyIG5leHRTdGF0ZSA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmluYWxSZWR1Y2VyS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGZpbmFsUmVkdWNlcktleXNbaV07XG4gICAgICB2YXIgcmVkdWNlciA9IGZpbmFsUmVkdWNlcnNba2V5XTtcbiAgICAgIHZhciBwcmV2aW91c1N0YXRlRm9yS2V5ID0gc3RhdGVba2V5XTtcbiAgICAgIHZhciBuZXh0U3RhdGVGb3JLZXkgPSByZWR1Y2VyKHByZXZpb3VzU3RhdGVGb3JLZXksIGFjdGlvbik7XG4gICAgICBpZiAodHlwZW9mIG5leHRTdGF0ZUZvcktleSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IGdldFVuZGVmaW5lZFN0YXRlRXJyb3JNZXNzYWdlKGtleSwgYWN0aW9uKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBuZXh0U3RhdGVba2V5XSA9IG5leHRTdGF0ZUZvcktleTtcbiAgICAgIGhhc0NoYW5nZWQgPSBoYXNDaGFuZ2VkIHx8IG5leHRTdGF0ZUZvcktleSAhPT0gcHJldmlvdXNTdGF0ZUZvcktleTtcbiAgICB9XG4gICAgcmV0dXJuIGhhc0NoYW5nZWQgPyBuZXh0U3RhdGUgOiBzdGF0ZTtcbiAgfTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gY29tcG9zZTtcbi8qKlxuICogQ29tcG9zZXMgc2luZ2xlLWFyZ3VtZW50IGZ1bmN0aW9ucyBmcm9tIHJpZ2h0IHRvIGxlZnQuIFRoZSByaWdodG1vc3RcbiAqIGZ1bmN0aW9uIGNhbiB0YWtlIG11bHRpcGxlIGFyZ3VtZW50cyBhcyBpdCBwcm92aWRlcyB0aGUgc2lnbmF0dXJlIGZvclxuICogdGhlIHJlc3VsdGluZyBjb21wb3NpdGUgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHsuLi5GdW5jdGlvbn0gZnVuY3MgVGhlIGZ1bmN0aW9ucyB0byBjb21wb3NlLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIG9idGFpbmVkIGJ5IGNvbXBvc2luZyB0aGUgYXJndW1lbnQgZnVuY3Rpb25zXG4gKiBmcm9tIHJpZ2h0IHRvIGxlZnQuIEZvciBleGFtcGxlLCBjb21wb3NlKGYsIGcsIGgpIGlzIGlkZW50aWNhbCB0byBkb2luZ1xuICogKC4uLmFyZ3MpID0+IGYoZyhoKC4uLmFyZ3MpKSkuXG4gKi9cblxuZnVuY3Rpb24gY29tcG9zZSgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGZ1bmNzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgZnVuY3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICBpZiAoZnVuY3MubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgIHJldHVybiBhcmc7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChmdW5jcy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gZnVuY3NbMF07XG4gIH1cblxuICB2YXIgbGFzdCA9IGZ1bmNzW2Z1bmNzLmxlbmd0aCAtIDFdO1xuICB2YXIgcmVzdCA9IGZ1bmNzLnNsaWNlKDAsIC0xKTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcmVzdC5yZWR1Y2VSaWdodChmdW5jdGlvbiAoY29tcG9zZWQsIGYpIHtcbiAgICAgIHJldHVybiBmKGNvbXBvc2VkKTtcbiAgICB9LCBsYXN0LmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSk7XG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5BY3Rpb25UeXBlcyA9IHVuZGVmaW5lZDtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGNyZWF0ZVN0b3JlO1xuXG52YXIgX2lzUGxhaW5PYmplY3QgPSByZXF1aXJlKCdsb2Rhc2gvaXNQbGFpbk9iamVjdCcpO1xuXG52YXIgX2lzUGxhaW5PYmplY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNQbGFpbk9iamVjdCk7XG5cbnZhciBfc3ltYm9sT2JzZXJ2YWJsZSA9IHJlcXVpcmUoJ3N5bWJvbC1vYnNlcnZhYmxlJyk7XG5cbnZhciBfc3ltYm9sT2JzZXJ2YWJsZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zeW1ib2xPYnNlcnZhYmxlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG4vKipcbiAqIFRoZXNlIGFyZSBwcml2YXRlIGFjdGlvbiB0eXBlcyByZXNlcnZlZCBieSBSZWR1eC5cbiAqIEZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB5b3UgbXVzdCByZXR1cm4gdGhlIGN1cnJlbnQgc3RhdGUuXG4gKiBJZiB0aGUgY3VycmVudCBzdGF0ZSBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZS5cbiAqIERvIG5vdCByZWZlcmVuY2UgdGhlc2UgYWN0aW9uIHR5cGVzIGRpcmVjdGx5IGluIHlvdXIgY29kZS5cbiAqL1xudmFyIEFjdGlvblR5cGVzID0gZXhwb3J0cy5BY3Rpb25UeXBlcyA9IHtcbiAgSU5JVDogJ0BAcmVkdXgvSU5JVCdcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIFJlZHV4IHN0b3JlIHRoYXQgaG9sZHMgdGhlIHN0YXRlIHRyZWUuXG4gKiBUaGUgb25seSB3YXkgdG8gY2hhbmdlIHRoZSBkYXRhIGluIHRoZSBzdG9yZSBpcyB0byBjYWxsIGBkaXNwYXRjaCgpYCBvbiBpdC5cbiAqXG4gKiBUaGVyZSBzaG91bGQgb25seSBiZSBhIHNpbmdsZSBzdG9yZSBpbiB5b3VyIGFwcC4gVG8gc3BlY2lmeSBob3cgZGlmZmVyZW50XG4gKiBwYXJ0cyBvZiB0aGUgc3RhdGUgdHJlZSByZXNwb25kIHRvIGFjdGlvbnMsIHlvdSBtYXkgY29tYmluZSBzZXZlcmFsIHJlZHVjZXJzXG4gKiBpbnRvIGEgc2luZ2xlIHJlZHVjZXIgZnVuY3Rpb24gYnkgdXNpbmcgYGNvbWJpbmVSZWR1Y2Vyc2AuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVkdWNlciBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgbmV4dCBzdGF0ZSB0cmVlLCBnaXZlblxuICogdGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBhbmQgdGhlIGFjdGlvbiB0byBoYW5kbGUuXG4gKlxuICogQHBhcmFtIHthbnl9IFtwcmVsb2FkZWRTdGF0ZV0gVGhlIGluaXRpYWwgc3RhdGUuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBoeWRyYXRlIHRoZSBzdGF0ZSBmcm9tIHRoZSBzZXJ2ZXIgaW4gdW5pdmVyc2FsIGFwcHMsIG9yIHRvIHJlc3RvcmUgYVxuICogcHJldmlvdXNseSBzZXJpYWxpemVkIHVzZXIgc2Vzc2lvbi5cbiAqIElmIHlvdSB1c2UgYGNvbWJpbmVSZWR1Y2Vyc2AgdG8gcHJvZHVjZSB0aGUgcm9vdCByZWR1Y2VyIGZ1bmN0aW9uLCB0aGlzIG11c3QgYmVcbiAqIGFuIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNoYXBlIGFzIGBjb21iaW5lUmVkdWNlcnNgIGtleXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZW5oYW5jZXIgVGhlIHN0b3JlIGVuaGFuY2VyLiBZb3UgbWF5IG9wdGlvbmFsbHkgc3BlY2lmeSBpdFxuICogdG8gZW5oYW5jZSB0aGUgc3RvcmUgd2l0aCB0aGlyZC1wYXJ0eSBjYXBhYmlsaXRpZXMgc3VjaCBhcyBtaWRkbGV3YXJlLFxuICogdGltZSB0cmF2ZWwsIHBlcnNpc3RlbmNlLCBldGMuIFRoZSBvbmx5IHN0b3JlIGVuaGFuY2VyIHRoYXQgc2hpcHMgd2l0aCBSZWR1eFxuICogaXMgYGFwcGx5TWlkZGxld2FyZSgpYC5cbiAqXG4gKiBAcmV0dXJucyB7U3RvcmV9IEEgUmVkdXggc3RvcmUgdGhhdCBsZXRzIHlvdSByZWFkIHRoZSBzdGF0ZSwgZGlzcGF0Y2ggYWN0aW9uc1xuICogYW5kIHN1YnNjcmliZSB0byBjaGFuZ2VzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVTdG9yZShyZWR1Y2VyLCBwcmVsb2FkZWRTdGF0ZSwgZW5oYW5jZXIpIHtcbiAgdmFyIF9yZWYyO1xuXG4gIGlmICh0eXBlb2YgcHJlbG9hZGVkU3RhdGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGVuaGFuY2VyID09PSAndW5kZWZpbmVkJykge1xuICAgIGVuaGFuY2VyID0gcHJlbG9hZGVkU3RhdGU7XG4gICAgcHJlbG9hZGVkU3RhdGUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGVuaGFuY2VyICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIGVuaGFuY2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVuaGFuY2VyKGNyZWF0ZVN0b3JlKShyZWR1Y2VyLCBwcmVsb2FkZWRTdGF0ZSk7XG4gIH1cblxuICBpZiAodHlwZW9mIHJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSByZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgY3VycmVudFJlZHVjZXIgPSByZWR1Y2VyO1xuICB2YXIgY3VycmVudFN0YXRlID0gcHJlbG9hZGVkU3RhdGU7XG4gIHZhciBjdXJyZW50TGlzdGVuZXJzID0gW107XG4gIHZhciBuZXh0TGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycztcbiAgdmFyIGlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCkge1xuICAgIGlmIChuZXh0TGlzdGVuZXJzID09PSBjdXJyZW50TGlzdGVuZXJzKSB7XG4gICAgICBuZXh0TGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycy5zbGljZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyB0aGUgc3RhdGUgdHJlZSBtYW5hZ2VkIGJ5IHRoZSBzdG9yZS5cbiAgICpcbiAgICogQHJldHVybnMge2FueX0gVGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgY2hhbmdlIGxpc3RlbmVyLiBJdCB3aWxsIGJlIGNhbGxlZCBhbnkgdGltZSBhbiBhY3Rpb24gaXMgZGlzcGF0Y2hlZCxcbiAgICogYW5kIHNvbWUgcGFydCBvZiB0aGUgc3RhdGUgdHJlZSBtYXkgcG90ZW50aWFsbHkgaGF2ZSBjaGFuZ2VkLiBZb3UgbWF5IHRoZW5cbiAgICogY2FsbCBgZ2V0U3RhdGUoKWAgdG8gcmVhZCB0aGUgY3VycmVudCBzdGF0ZSB0cmVlIGluc2lkZSB0aGUgY2FsbGJhY2suXG4gICAqXG4gICAqIFlvdSBtYXkgY2FsbCBgZGlzcGF0Y2goKWAgZnJvbSBhIGNoYW5nZSBsaXN0ZW5lciwgd2l0aCB0aGUgZm9sbG93aW5nXG4gICAqIGNhdmVhdHM6XG4gICAqXG4gICAqIDEuIFRoZSBzdWJzY3JpcHRpb25zIGFyZSBzbmFwc2hvdHRlZCBqdXN0IGJlZm9yZSBldmVyeSBgZGlzcGF0Y2goKWAgY2FsbC5cbiAgICogSWYgeW91IHN1YnNjcmliZSBvciB1bnN1YnNjcmliZSB3aGlsZSB0aGUgbGlzdGVuZXJzIGFyZSBiZWluZyBpbnZva2VkLCB0aGlzXG4gICAqIHdpbGwgbm90IGhhdmUgYW55IGVmZmVjdCBvbiB0aGUgYGRpc3BhdGNoKClgIHRoYXQgaXMgY3VycmVudGx5IGluIHByb2dyZXNzLlxuICAgKiBIb3dldmVyLCB0aGUgbmV4dCBgZGlzcGF0Y2goKWAgY2FsbCwgd2hldGhlciBuZXN0ZWQgb3Igbm90LCB3aWxsIHVzZSBhIG1vcmVcbiAgICogcmVjZW50IHNuYXBzaG90IG9mIHRoZSBzdWJzY3JpcHRpb24gbGlzdC5cbiAgICpcbiAgICogMi4gVGhlIGxpc3RlbmVyIHNob3VsZCBub3QgZXhwZWN0IHRvIHNlZSBhbGwgc3RhdGUgY2hhbmdlcywgYXMgdGhlIHN0YXRlXG4gICAqIG1pZ2h0IGhhdmUgYmVlbiB1cGRhdGVkIG11bHRpcGxlIHRpbWVzIGR1cmluZyBhIG5lc3RlZCBgZGlzcGF0Y2goKWAgYmVmb3JlXG4gICAqIHRoZSBsaXN0ZW5lciBpcyBjYWxsZWQuIEl0IGlzLCBob3dldmVyLCBndWFyYW50ZWVkIHRoYXQgYWxsIHN1YnNjcmliZXJzXG4gICAqIHJlZ2lzdGVyZWQgYmVmb3JlIHRoZSBgZGlzcGF0Y2goKWAgc3RhcnRlZCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBsYXRlc3RcbiAgICogc3RhdGUgYnkgdGhlIHRpbWUgaXQgZXhpdHMuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIEEgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCBvbiBldmVyeSBkaXNwYXRjaC5cbiAgICogQHJldHVybnMge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGlzIGNoYW5nZSBsaXN0ZW5lci5cbiAgICovXG4gIGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgbGlzdGVuZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICB2YXIgaXNTdWJzY3JpYmVkID0gdHJ1ZTtcblxuICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICBuZXh0TGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHVuc3Vic2NyaWJlKCkge1xuICAgICAgaWYgKCFpc1N1YnNjcmliZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpc1N1YnNjcmliZWQgPSBmYWxzZTtcblxuICAgICAgZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpO1xuICAgICAgdmFyIGluZGV4ID0gbmV4dExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgIG5leHRMaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYW4gYWN0aW9uLiBJdCBpcyB0aGUgb25seSB3YXkgdG8gdHJpZ2dlciBhIHN0YXRlIGNoYW5nZS5cbiAgICpcbiAgICogVGhlIGByZWR1Y2VyYCBmdW5jdGlvbiwgdXNlZCB0byBjcmVhdGUgdGhlIHN0b3JlLCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZVxuICAgKiBjdXJyZW50IHN0YXRlIHRyZWUgYW5kIHRoZSBnaXZlbiBgYWN0aW9uYC4gSXRzIHJldHVybiB2YWx1ZSB3aWxsXG4gICAqIGJlIGNvbnNpZGVyZWQgdGhlICoqbmV4dCoqIHN0YXRlIG9mIHRoZSB0cmVlLCBhbmQgdGhlIGNoYW5nZSBsaXN0ZW5lcnNcbiAgICogd2lsbCBiZSBub3RpZmllZC5cbiAgICpcbiAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb25seSBzdXBwb3J0cyBwbGFpbiBvYmplY3QgYWN0aW9ucy4gSWYgeW91IHdhbnQgdG9cbiAgICogZGlzcGF0Y2ggYSBQcm9taXNlLCBhbiBPYnNlcnZhYmxlLCBhIHRodW5rLCBvciBzb21ldGhpbmcgZWxzZSwgeW91IG5lZWQgdG9cbiAgICogd3JhcCB5b3VyIHN0b3JlIGNyZWF0aW5nIGZ1bmN0aW9uIGludG8gdGhlIGNvcnJlc3BvbmRpbmcgbWlkZGxld2FyZS4gRm9yXG4gICAqIGV4YW1wbGUsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3IgdGhlIGByZWR1eC10aHVua2AgcGFja2FnZS4gRXZlbiB0aGVcbiAgICogbWlkZGxld2FyZSB3aWxsIGV2ZW50dWFsbHkgZGlzcGF0Y2ggcGxhaW4gb2JqZWN0IGFjdGlvbnMgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24gQSBwbGFpbiBvYmplY3QgcmVwcmVzZW50aW5nIOKAnHdoYXQgY2hhbmdlZOKAnS4gSXQgaXNcbiAgICogYSBnb29kIGlkZWEgdG8ga2VlcCBhY3Rpb25zIHNlcmlhbGl6YWJsZSBzbyB5b3UgY2FuIHJlY29yZCBhbmQgcmVwbGF5IHVzZXJcbiAgICogc2Vzc2lvbnMsIG9yIHVzZSB0aGUgdGltZSB0cmF2ZWxsaW5nIGByZWR1eC1kZXZ0b29sc2AuIEFuIGFjdGlvbiBtdXN0IGhhdmVcbiAgICogYSBgdHlwZWAgcHJvcGVydHkgd2hpY2ggbWF5IG5vdCBiZSBgdW5kZWZpbmVkYC4gSXQgaXMgYSBnb29kIGlkZWEgdG8gdXNlXG4gICAqIHN0cmluZyBjb25zdGFudHMgZm9yIGFjdGlvbiB0eXBlcy5cbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gRm9yIGNvbnZlbmllbmNlLCB0aGUgc2FtZSBhY3Rpb24gb2JqZWN0IHlvdSBkaXNwYXRjaGVkLlxuICAgKlxuICAgKiBOb3RlIHRoYXQsIGlmIHlvdSB1c2UgYSBjdXN0b20gbWlkZGxld2FyZSwgaXQgbWF5IHdyYXAgYGRpc3BhdGNoKClgIHRvXG4gICAqIHJldHVybiBzb21ldGhpbmcgZWxzZSAoZm9yIGV4YW1wbGUsIGEgUHJvbWlzZSB5b3UgY2FuIGF3YWl0KS5cbiAgICovXG4gIGZ1bmN0aW9uIGRpc3BhdGNoKGFjdGlvbikge1xuICAgIGlmICghKDAsIF9pc1BsYWluT2JqZWN0MlsnZGVmYXVsdCddKShhY3Rpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGlvbnMgbXVzdCBiZSBwbGFpbiBvYmplY3RzLiAnICsgJ1VzZSBjdXN0b20gbWlkZGxld2FyZSBmb3IgYXN5bmMgYWN0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFjdGlvbi50eXBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3Rpb25zIG1heSBub3QgaGF2ZSBhbiB1bmRlZmluZWQgXCJ0eXBlXCIgcHJvcGVydHkuICcgKyAnSGF2ZSB5b3UgbWlzc3BlbGxlZCBhIGNvbnN0YW50PycpO1xuICAgIH1cblxuICAgIGlmIChpc0Rpc3BhdGNoaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXJzIG1heSBub3QgZGlzcGF0Y2ggYWN0aW9ucy4nKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgaXNEaXNwYXRjaGluZyA9IHRydWU7XG4gICAgICBjdXJyZW50U3RhdGUgPSBjdXJyZW50UmVkdWNlcihjdXJyZW50U3RhdGUsIGFjdGlvbik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycyA9IG5leHRMaXN0ZW5lcnM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyc1tpXSgpO1xuICAgIH1cblxuICAgIHJldHVybiBhY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIHJlZHVjZXIgY3VycmVudGx5IHVzZWQgYnkgdGhlIHN0b3JlIHRvIGNhbGN1bGF0ZSB0aGUgc3RhdGUuXG4gICAqXG4gICAqIFlvdSBtaWdodCBuZWVkIHRoaXMgaWYgeW91ciBhcHAgaW1wbGVtZW50cyBjb2RlIHNwbGl0dGluZyBhbmQgeW91IHdhbnQgdG9cbiAgICogbG9hZCBzb21lIG9mIHRoZSByZWR1Y2VycyBkeW5hbWljYWxseS4gWW91IG1pZ2h0IGFsc28gbmVlZCB0aGlzIGlmIHlvdVxuICAgKiBpbXBsZW1lbnQgYSBob3QgcmVsb2FkaW5nIG1lY2hhbmlzbSBmb3IgUmVkdXguXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHRSZWR1Y2VyIFRoZSByZWR1Y2VyIGZvciB0aGUgc3RvcmUgdG8gdXNlIGluc3RlYWQuXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgZnVuY3Rpb24gcmVwbGFjZVJlZHVjZXIobmV4dFJlZHVjZXIpIHtcbiAgICBpZiAodHlwZW9mIG5leHRSZWR1Y2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSBuZXh0UmVkdWNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIGN1cnJlbnRSZWR1Y2VyID0gbmV4dFJlZHVjZXI7XG4gICAgZGlzcGF0Y2goeyB0eXBlOiBBY3Rpb25UeXBlcy5JTklUIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVyb3BlcmFiaWxpdHkgcG9pbnQgZm9yIG9ic2VydmFibGUvcmVhY3RpdmUgbGlicmFyaWVzLlxuICAgKiBAcmV0dXJucyB7b2JzZXJ2YWJsZX0gQSBtaW5pbWFsIG9ic2VydmFibGUgb2Ygc3RhdGUgY2hhbmdlcy5cbiAgICogRm9yIG1vcmUgaW5mb3JtYXRpb24sIHNlZSB0aGUgb2JzZXJ2YWJsZSBwcm9wb3NhbDpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3plbnBhcnNpbmcvZXMtb2JzZXJ2YWJsZVxuICAgKi9cbiAgZnVuY3Rpb24gb2JzZXJ2YWJsZSgpIHtcbiAgICB2YXIgX3JlZjtcblxuICAgIHZhciBvdXRlclN1YnNjcmliZSA9IHN1YnNjcmliZTtcbiAgICByZXR1cm4gX3JlZiA9IHtcbiAgICAgIC8qKlxuICAgICAgICogVGhlIG1pbmltYWwgb2JzZXJ2YWJsZSBzdWJzY3JpcHRpb24gbWV0aG9kLlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IG9ic2VydmVyIEFueSBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCBhcyBhbiBvYnNlcnZlci5cbiAgICAgICAqIFRoZSBvYnNlcnZlciBvYmplY3Qgc2hvdWxkIGhhdmUgYSBgbmV4dGAgbWV0aG9kLlxuICAgICAgICogQHJldHVybnMge3N1YnNjcmlwdGlvbn0gQW4gb2JqZWN0IHdpdGggYW4gYHVuc3Vic2NyaWJlYCBtZXRob2QgdGhhdCBjYW5cbiAgICAgICAqIGJlIHVzZWQgdG8gdW5zdWJzY3JpYmUgdGhlIG9ic2VydmFibGUgZnJvbSB0aGUgc3RvcmUsIGFuZCBwcmV2ZW50IGZ1cnRoZXJcbiAgICAgICAqIGVtaXNzaW9uIG9mIHZhbHVlcyBmcm9tIHRoZSBvYnNlcnZhYmxlLlxuICAgICAgICovXG4gICAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uIHN1YnNjcmliZShvYnNlcnZlcikge1xuICAgICAgICBpZiAodHlwZW9mIG9ic2VydmVyICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIHRoZSBvYnNlcnZlciB0byBiZSBhbiBvYmplY3QuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvYnNlcnZlU3RhdGUoKSB7XG4gICAgICAgICAgaWYgKG9ic2VydmVyLm5leHQpIHtcbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgb2JzZXJ2ZVN0YXRlKCk7XG4gICAgICAgIHZhciB1bnN1YnNjcmliZSA9IG91dGVyU3Vic2NyaWJlKG9ic2VydmVTdGF0ZSk7XG4gICAgICAgIHJldHVybiB7IHVuc3Vic2NyaWJlOiB1bnN1YnNjcmliZSB9O1xuICAgICAgfVxuICAgIH0sIF9yZWZbX3N5bWJvbE9ic2VydmFibGUyWydkZWZhdWx0J11dID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgX3JlZjtcbiAgfVxuXG4gIC8vIFdoZW4gYSBzdG9yZSBpcyBjcmVhdGVkLCBhbiBcIklOSVRcIiBhY3Rpb24gaXMgZGlzcGF0Y2hlZCBzbyB0aGF0IGV2ZXJ5XG4gIC8vIHJlZHVjZXIgcmV0dXJucyB0aGVpciBpbml0aWFsIHN0YXRlLiBUaGlzIGVmZmVjdGl2ZWx5IHBvcHVsYXRlc1xuICAvLyB0aGUgaW5pdGlhbCBzdGF0ZSB0cmVlLlxuICBkaXNwYXRjaCh7IHR5cGU6IEFjdGlvblR5cGVzLklOSVQgfSk7XG5cbiAgcmV0dXJuIF9yZWYyID0ge1xuICAgIGRpc3BhdGNoOiBkaXNwYXRjaCxcbiAgICBzdWJzY3JpYmU6IHN1YnNjcmliZSxcbiAgICBnZXRTdGF0ZTogZ2V0U3RhdGUsXG4gICAgcmVwbGFjZVJlZHVjZXI6IHJlcGxhY2VSZWR1Y2VyXG4gIH0sIF9yZWYyW19zeW1ib2xPYnNlcnZhYmxlMlsnZGVmYXVsdCddXSA9IG9ic2VydmFibGUsIF9yZWYyO1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuY29tcG9zZSA9IGV4cG9ydHMuYXBwbHlNaWRkbGV3YXJlID0gZXhwb3J0cy5iaW5kQWN0aW9uQ3JlYXRvcnMgPSBleHBvcnRzLmNvbWJpbmVSZWR1Y2VycyA9IGV4cG9ydHMuY3JlYXRlU3RvcmUgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlU3RvcmUgPSByZXF1aXJlKCcuL2NyZWF0ZVN0b3JlJyk7XG5cbnZhciBfY3JlYXRlU3RvcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3JlYXRlU3RvcmUpO1xuXG52YXIgX2NvbWJpbmVSZWR1Y2VycyA9IHJlcXVpcmUoJy4vY29tYmluZVJlZHVjZXJzJyk7XG5cbnZhciBfY29tYmluZVJlZHVjZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbWJpbmVSZWR1Y2Vycyk7XG5cbnZhciBfYmluZEFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi9iaW5kQWN0aW9uQ3JlYXRvcnMnKTtcblxudmFyIF9iaW5kQWN0aW9uQ3JlYXRvcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYmluZEFjdGlvbkNyZWF0b3JzKTtcblxudmFyIF9hcHBseU1pZGRsZXdhcmUgPSByZXF1aXJlKCcuL2FwcGx5TWlkZGxld2FyZScpO1xuXG52YXIgX2FwcGx5TWlkZGxld2FyZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcHBseU1pZGRsZXdhcmUpO1xuXG52YXIgX2NvbXBvc2UgPSByZXF1aXJlKCcuL2NvbXBvc2UnKTtcblxudmFyIF9jb21wb3NlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2UpO1xuXG52YXIgX3dhcm5pbmcgPSByZXF1aXJlKCcuL3V0aWxzL3dhcm5pbmcnKTtcblxudmFyIF93YXJuaW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dhcm5pbmcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbi8qXG4qIFRoaXMgaXMgYSBkdW1teSBmdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgZnVuY3Rpb24gbmFtZSBoYXMgYmVlbiBhbHRlcmVkIGJ5IG1pbmlmaWNhdGlvbi5cbiogSWYgdGhlIGZ1bmN0aW9uIGhhcyBiZWVuIG1pbmlmaWVkIGFuZCBOT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nLCB3YXJuIHRoZSB1c2VyLlxuKi9cbmZ1bmN0aW9uIGlzQ3J1c2hlZCgpIHt9XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHR5cGVvZiBpc0NydXNoZWQubmFtZSA9PT0gJ3N0cmluZycgJiYgaXNDcnVzaGVkLm5hbWUgIT09ICdpc0NydXNoZWQnKSB7XG4gICgwLCBfd2FybmluZzJbJ2RlZmF1bHQnXSkoJ1lvdSBhcmUgY3VycmVudGx5IHVzaW5nIG1pbmlmaWVkIGNvZGUgb3V0c2lkZSBvZiBOT0RFX0VOViA9PT0gXFwncHJvZHVjdGlvblxcJy4gJyArICdUaGlzIG1lYW5zIHRoYXQgeW91IGFyZSBydW5uaW5nIGEgc2xvd2VyIGRldmVsb3BtZW50IGJ1aWxkIG9mIFJlZHV4LiAnICsgJ1lvdSBjYW4gdXNlIGxvb3NlLWVudmlmeSAoaHR0cHM6Ly9naXRodWIuY29tL3plcnRvc2gvbG9vc2UtZW52aWZ5KSBmb3IgYnJvd3NlcmlmeSAnICsgJ29yIERlZmluZVBsdWdpbiBmb3Igd2VicGFjayAoaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMDAzMDAzMSkgJyArICd0byBlbnN1cmUgeW91IGhhdmUgdGhlIGNvcnJlY3QgY29kZSBmb3IgeW91ciBwcm9kdWN0aW9uIGJ1aWxkLicpO1xufVxuXG5leHBvcnRzLmNyZWF0ZVN0b3JlID0gX2NyZWF0ZVN0b3JlMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5jb21iaW5lUmVkdWNlcnMgPSBfY29tYmluZVJlZHVjZXJzMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5iaW5kQWN0aW9uQ3JlYXRvcnMgPSBfYmluZEFjdGlvbkNyZWF0b3JzMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5hcHBseU1pZGRsZXdhcmUgPSBfYXBwbHlNaWRkbGV3YXJlMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5jb21wb3NlID0gX2NvbXBvc2UyWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1snZGVmYXVsdCddID0gd2FybmluZztcbi8qKlxuICogUHJpbnRzIGEgd2FybmluZyBpbiB0aGUgY29uc29sZSBpZiBpdCBleGlzdHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgVGhlIHdhcm5pbmcgbWVzc2FnZS5cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiB3YXJuaW5nKG1lc3NhZ2UpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgdHJ5IHtcbiAgICAvLyBUaGlzIGVycm9yIHdhcyB0aHJvd24gYXMgYSBjb252ZW5pZW5jZSBzbyB0aGF0IGlmIHlvdSBlbmFibGVcbiAgICAvLyBcImJyZWFrIG9uIGFsbCBleGNlcHRpb25zXCIgaW4geW91ciBjb25zb2xlLFxuICAgIC8vIGl0IHdvdWxkIHBhdXNlIHRoZSBleGVjdXRpb24gYXQgdGhpcyBsaW5lLlxuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1lbXB0eSAqL1xuICB9IGNhdGNoIChlKSB7fVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWVtcHR5ICovXG59IiwiLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdDtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgeyAvLyBCcm93c2VyIHdpbmRvd1xuICByb290ID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gV2ViIFdvcmtlclxuICByb290ID0gc2VsZjtcbn0gZWxzZSB7IC8vIE90aGVyIGVudmlyb25tZW50c1xuICBjb25zb2xlLndhcm4oXCJVc2luZyBicm93c2VyLW9ubHkgdmVyc2lvbiBvZiBzdXBlcmFnZW50IGluIG5vbi1icm93c2VyIGVudmlyb25tZW50XCIpO1xuICByb290ID0gdGhpcztcbn1cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgUmVxdWVzdEJhc2UgPSByZXF1aXJlKCcuL3JlcXVlc3QtYmFzZScpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pcy1vYmplY3QnKTtcbnZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pcy1mdW5jdGlvbicpO1xudmFyIFJlc3BvbnNlQmFzZSA9IHJlcXVpcmUoJy4vcmVzcG9uc2UtYmFzZScpO1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe307XG5cbi8qKlxuICogRXhwb3NlIGByZXF1ZXN0YC5cbiAqL1xuXG52YXIgcmVxdWVzdCA9IGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB1cmwpIHtcbiAgICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdChtZXRob2QsIHVybCk7XG59XG5cbmV4cG9ydHMuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogRGV0ZXJtaW5lIFhIUi5cbiAqL1xuXG5yZXF1ZXN0LmdldFhIUiA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3RcbiAgICAgICYmICghcm9vdC5sb2NhdGlvbiB8fCAnZmlsZTonICE9IHJvb3QubG9jYXRpb24ucHJvdG9jb2xcbiAgICAgICAgICB8fCAhcm9vdC5BY3RpdmVYT2JqZWN0KSkge1xuICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC42LjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuMy4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgfVxuICB0aHJvdyBFcnJvcihcIkJyb3dzZXItb25seSB2ZXJpc29uIG9mIHN1cGVyYWdlbnQgY291bGQgbm90IGZpbmQgWEhSXCIpO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBrZXksIG9ialtrZXldKTtcbiAgfVxuICByZXR1cm4gcGFpcnMuam9pbignJicpO1xufVxuXG4vKipcbiAqIEhlbHBzICdzZXJpYWxpemUnIHdpdGggc2VyaWFsaXppbmcgYXJyYXlzLlxuICogTXV0YXRlcyB0aGUgcGFpcnMgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGFpcnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICovXG5cbmZ1bmN0aW9uIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBrZXksIHZhbCkge1xuICBpZiAodmFsICE9IG51bGwpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICB2YWwuZm9yRWFjaChmdW5jdGlvbih2KSB7XG4gICAgICAgIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBrZXksIHYpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh2YWwpKSB7XG4gICAgICBmb3IodmFyIHN1YmtleSBpbiB2YWwpIHtcbiAgICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSArICdbJyArIHN1YmtleSArICddJywgdmFsW3N1YmtleV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh2YWwgPT09IG51bGwpIHtcbiAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpKTtcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbiAvKipcbiAgKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAqIEByZXR1cm4ge09iamVjdH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciBwYWlyO1xuICB2YXIgcG9zO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICBwb3MgPSBwYWlyLmluZGV4T2YoJz0nKTtcbiAgICBpZiAocG9zID09IC0xKSB7XG4gICAgICBvYmpbZGVjb2RlVVJJQ29tcG9uZW50KHBhaXIpXSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpbZGVjb2RlVVJJQ29tcG9uZW50KHBhaXIuc2xpY2UoMCwgcG9zKSldID1cbiAgICAgICAgZGVjb2RlVVJJQ29tcG9uZW50KHBhaXIuc2xpY2UocG9zICsgMSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBgbWltZWAgaXMganNvbiBvciBoYXMgK2pzb24gc3RydWN0dXJlZCBzeW50YXggc3VmZml4LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtaW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNKU09OKG1pbWUpIHtcbiAgcmV0dXJuIC9bXFwvK11qc29uXFxiLy50ZXN0KG1pbWUpO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGFjY2Vzc2libGUgb25seSBpZiByZXNwb25zZVR5cGUgaXMgJycgb3IgJ3RleHQnIGFuZCBvbiBvbGRlciBicm93c2Vyc1xuICB0aGlzLnRleHQgPSAoKHRoaXMucmVxLm1ldGhvZCAhPSdIRUFEJyAmJiAodGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAnJyB8fCB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JykpIHx8IHR5cGVvZiB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnKVxuICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dFxuICAgICA6IG51bGw7XG4gIHRoaXMuc3RhdHVzVGV4dCA9IHRoaXMucmVxLnhoci5zdGF0dXNUZXh0O1xuICB2YXIgc3RhdHVzID0gdGhpcy54aHIuc3RhdHVzO1xuICAvLyBoYW5kbGUgSUU5IGJ1ZzogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDA0Njk3Mi9tc2llLXJldHVybnMtc3RhdHVzLWNvZGUtb2YtMTIyMy1mb3ItYWpheC1yZXF1ZXN0XG4gIGlmIChzdGF0dXMgPT09IDEyMjMpIHtcbiAgICAgIHN0YXR1cyA9IDIwNDtcbiAgfVxuICB0aGlzLl9zZXRTdGF0dXNQcm9wZXJ0aWVzKHN0YXR1cyk7XG4gIHRoaXMuaGVhZGVyID0gdGhpcy5oZWFkZXJzID0gcGFyc2VIZWFkZXIodGhpcy54aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICAvLyBnZXRBbGxSZXNwb25zZUhlYWRlcnMgc29tZXRpbWVzIGZhbHNlbHkgcmV0dXJucyBcIlwiIGZvciBDT1JTIHJlcXVlc3RzLCBidXRcbiAgLy8gZ2V0UmVzcG9uc2VIZWFkZXIgc3RpbGwgd29ya3MuIHNvIHdlIGdldCBjb250ZW50LXR5cGUgZXZlbiBpZiBnZXR0aW5nXG4gIC8vIG90aGVyIGhlYWRlcnMgZmFpbHMuXG4gIHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSA9IHRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKTtcbiAgdGhpcy5fc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG5cbiAgaWYgKG51bGwgPT09IHRoaXMudGV4dCAmJiByZXEuX3Jlc3BvbnNlVHlwZSkge1xuICAgIHRoaXMuYm9keSA9IHRoaXMueGhyLnJlc3BvbnNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuYm9keSA9IHRoaXMucmVxLm1ldGhvZCAhPSAnSEVBRCdcbiAgICAgID8gdGhpcy5fcGFyc2VCb2R5KHRoaXMudGV4dCA/IHRoaXMudGV4dCA6IHRoaXMueGhyLnJlc3BvbnNlKVxuICAgICAgOiBudWxsO1xuICB9XG59XG5cblJlc3BvbnNlQmFzZShSZXNwb25zZS5wcm90b3R5cGUpO1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLl9wYXJzZUJvZHkgPSBmdW5jdGlvbihzdHIpe1xuICB2YXIgcGFyc2UgPSByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIGlmKHRoaXMucmVxLl9wYXJzZXIpIHtcbiAgICByZXR1cm4gdGhpcy5yZXEuX3BhcnNlcih0aGlzLCBzdHIpO1xuICB9XG4gIGlmICghcGFyc2UgJiYgaXNKU09OKHRoaXMudHlwZSkpIHtcbiAgICBwYXJzZSA9IHJlcXVlc3QucGFyc2VbJ2FwcGxpY2F0aW9uL2pzb24nXTtcbiAgfVxuICByZXR1cm4gcGFyc2UgJiYgc3RyICYmIChzdHIubGVuZ3RoIHx8IHN0ciBpbnN0YW5jZW9mIE9iamVjdClcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHVybCA9IHJlcS51cmw7XG5cbiAgdmFyIG1zZyA9ICdjYW5ub3QgJyArIG1ldGhvZCArICcgJyArIHVybCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307IC8vIHByZXNlcnZlcyBoZWFkZXIgbmFtZSBjYXNlXG4gIHRoaXMuX2hlYWRlciA9IHt9OyAvLyBjb2VyY2VzIGhlYWRlciBuYW1lcyB0byBsb3dlcmNhc2VcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZXJyID0gbnVsbDtcbiAgICB2YXIgcmVzID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICAgIC8vIGlzc3VlICM2NzU6IHJldHVybiB0aGUgcmF3IHJlc3BvbnNlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICBpZiAoc2VsZi54aHIpIHtcbiAgICAgICAgLy8gaWU5IGRvZXNuJ3QgaGF2ZSAncmVzcG9uc2UnIHByb3BlcnR5XG4gICAgICAgIGVyci5yYXdSZXNwb25zZSA9IHR5cGVvZiBzZWxmLnhoci5yZXNwb25zZVR5cGUgPT0gJ3VuZGVmaW5lZCcgPyBzZWxmLnhoci5yZXNwb25zZVRleHQgOiBzZWxmLnhoci5yZXNwb25zZTtcbiAgICAgICAgLy8gaXNzdWUgIzg3NjogcmV0dXJuIHRoZSBodHRwIHN0YXR1cyBjb2RlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICAgIGVyci5zdGF0dXMgPSBzZWxmLnhoci5zdGF0dXMgPyBzZWxmLnhoci5zdGF0dXMgOiBudWxsO1xuICAgICAgICBlcnIuc3RhdHVzQ29kZSA9IGVyci5zdGF0dXM7IC8vIGJhY2t3YXJkcy1jb21wYXQgb25seVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXJyLnJhd1Jlc3BvbnNlID0gbnVsbDtcbiAgICAgICAgZXJyLnN0YXR1cyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVycik7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdyZXNwb25zZScsIHJlcyk7XG5cbiAgICB2YXIgbmV3X2VycjtcbiAgICB0cnkge1xuICAgICAgaWYgKCFzZWxmLl9pc1Jlc3BvbnNlT0socmVzKSkge1xuICAgICAgICBuZXdfZXJyID0gbmV3IEVycm9yKHJlcy5zdGF0dXNUZXh0IHx8ICdVbnN1Y2Nlc3NmdWwgSFRUUCByZXNwb25zZScpO1xuICAgICAgICBuZXdfZXJyLm9yaWdpbmFsID0gZXJyO1xuICAgICAgICBuZXdfZXJyLnJlc3BvbnNlID0gcmVzO1xuICAgICAgICBuZXdfZXJyLnN0YXR1cyA9IHJlcy5zdGF0dXM7XG4gICAgICB9XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBuZXdfZXJyID0gZTsgLy8gIzk4NSB0b3VjaGluZyByZXMgbWF5IGNhdXNlIElOVkFMSURfU1RBVEVfRVJSIG9uIG9sZCBBbmRyb2lkXG4gICAgfVxuXG4gICAgLy8gIzEwMDAgZG9uJ3QgY2F0Y2ggZXJyb3JzIGZyb20gdGhlIGNhbGxiYWNrIHRvIGF2b2lkIGRvdWJsZSBjYWxsaW5nIGl0XG4gICAgaWYgKG5ld19lcnIpIHtcbiAgICAgIHNlbGYuY2FsbGJhY2sobmV3X2VyciwgcmVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5jYWxsYmFjayhudWxsLCByZXMpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgIGFuZCBgUmVxdWVzdEJhc2VgLlxuICovXG5cbkVtaXR0ZXIoUmVxdWVzdC5wcm90b3R5cGUpO1xuUmVxdWVzdEJhc2UoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyB3aXRoICd0eXBlJyBwcm9wZXJ0eSAnYXV0bycgb3IgJ2Jhc2ljJyAoZGVmYXVsdCAnYmFzaWMnKVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzLCBvcHRpb25zKXtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIHR5cGU6ICdmdW5jdGlvbicgPT09IHR5cGVvZiBidG9hID8gJ2Jhc2ljJyA6ICdhdXRvJyxcbiAgICB9XG4gIH1cblxuICBzd2l0Y2ggKG9wdGlvbnMudHlwZSkge1xuICAgIGNhc2UgJ2Jhc2ljJzpcbiAgICAgIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBidG9hKHVzZXIgKyAnOicgKyBwYXNzKSk7XG4gICAgYnJlYWs7XG5cbiAgICBjYXNlICdhdXRvJzpcbiAgICAgIHRoaXMudXNlcm5hbWUgPSB1c2VyO1xuICAgICAgdGhpcy5wYXNzd29yZCA9IHBhc3M7XG4gICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQWRkIHF1ZXJ5LXN0cmluZyBgdmFsYC5cbipcbiogRXhhbXBsZXM6XG4qXG4qICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4qICAgICAucXVlcnkoJ3NpemU9MTAnKVxuKiAgICAgLnF1ZXJ5KHsgY29sb3I6ICdibHVlJyB9KVxuKlxuKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiogQGFwaSBwdWJsaWNcbiovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24odmFsKXtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHZhbCA9IHNlcmlhbGl6ZSh2YWwpO1xuICBpZiAodmFsKSB0aGlzLl9xdWVyeS5wdXNoKHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgb3B0aW9uc2AgKG9yIGZpbGVuYW1lKS5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2goJ2NvbnRlbnQnLCBuZXcgQmxvYihbJzxhIGlkPVwiYVwiPjxiIGlkPVwiYlwiPmhleSE8L2I+PC9hPiddLCB7IHR5cGU6IFwidGV4dC9odG1sXCJ9KSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEBwYXJhbSB7QmxvYnxGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbihmaWVsZCwgZmlsZSwgb3B0aW9ucyl7XG4gIGlmICh0aGlzLl9kYXRhKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJzdXBlcmFnZW50IGNhbid0IG1peCAuc2VuZCgpIGFuZCAuYXR0YWNoKClcIik7XG4gIH1cblxuICB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChmaWVsZCwgZmlsZSwgb3B0aW9ucyB8fCBmaWxlLm5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLl9nZXRGb3JtRGF0YSA9IGZ1bmN0aW9uKCl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHtcbiAgICB0aGlzLl9mb3JtRGF0YSA9IG5ldyByb290LkZvcm1EYXRhKCk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuX2Zvcm1EYXRhO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG5cbiAgaWYgKGVycikge1xuICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICB9XG5cbiAgZm4oZXJyLCByZXMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB4LWRvbWFpbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignUmVxdWVzdCBoYXMgYmVlbiB0ZXJtaW5hdGVkXFxuUG9zc2libGUgY2F1c2VzOiB0aGUgbmV0d29yayBpcyBvZmZsaW5lLCBPcmlnaW4gaXMgbm90IGFsbG93ZWQgYnkgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luLCB0aGUgcGFnZSBpcyBiZWluZyB1bmxvYWRlZCwgZXRjLicpO1xuICBlcnIuY3Jvc3NEb21haW4gPSB0cnVlO1xuXG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLm1ldGhvZCA9IHRoaXMubWV0aG9kO1xuICBlcnIudXJsID0gdGhpcy51cmw7XG5cbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLy8gVGhpcyBvbmx5IHdhcm5zLCBiZWNhdXNlIHRoZSByZXF1ZXN0IGlzIHN0aWxsIGxpa2VseSB0byB3b3JrXG5SZXF1ZXN0LnByb3RvdHlwZS5idWZmZXIgPSBSZXF1ZXN0LnByb3RvdHlwZS5jYSA9IFJlcXVlc3QucHJvdG90eXBlLmFnZW50ID0gZnVuY3Rpb24oKXtcbiAgY29uc29sZS53YXJuKFwiVGhpcyBpcyBub3Qgc3VwcG9ydGVkIGluIGJyb3dzZXIgdmVyc2lvbiBvZiBzdXBlcmFnZW50XCIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIFRoaXMgdGhyb3dzLCBiZWNhdXNlIGl0IGNhbid0IHNlbmQvcmVjZWl2ZSBkYXRhIGFzIGV4cGVjdGVkXG5SZXF1ZXN0LnByb3RvdHlwZS5waXBlID0gUmVxdWVzdC5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbigpe1xuICB0aHJvdyBFcnJvcihcIlN0cmVhbWluZyBpcyBub3Qgc3VwcG9ydGVkIGluIGJyb3dzZXIgdmVyc2lvbiBvZiBzdXBlcmFnZW50XCIpO1xufTtcblxuLyoqXG4gKiBDb21wb3NlIHF1ZXJ5c3RyaW5nIHRvIGFwcGVuZCB0byByZXEudXJsXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuX2FwcGVuZFF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgdmFyIHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICBpZiAocXVlcnkpIHtcbiAgICB0aGlzLnVybCArPSAodGhpcy51cmwuaW5kZXhPZignPycpID49IDAgPyAnJicgOiAnPycpICsgcXVlcnk7XG4gIH1cblxuICBpZiAodGhpcy5fc29ydCkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudXJsLmluZGV4T2YoJz8nKTtcbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgdmFyIHF1ZXJ5QXJyID0gdGhpcy51cmwuc3Vic3RyaW5nKGluZGV4ICsgMSkuc3BsaXQoJyYnKTtcbiAgICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMuX3NvcnQpKSB7XG4gICAgICAgIHF1ZXJ5QXJyLnNvcnQodGhpcy5fc29ydCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeUFyci5zb3J0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IHRoaXMudXJsLnN1YnN0cmluZygwLCBpbmRleCkgKyAnPycgKyBxdWVyeUFyci5qb2luKCcmJyk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUmVxdWVzdC5wcm90b3R5cGUuX2lzSG9zdCA9IGZ1bmN0aW9uIF9pc0hvc3Qob2JqKSB7XG4gIC8vIE5hdGl2ZSBvYmplY3RzIHN0cmluZ2lmeSB0byBbb2JqZWN0IEZpbGVdLCBbb2JqZWN0IEJsb2JdLCBbb2JqZWN0IEZvcm1EYXRhXSwgZXRjLlxuICByZXR1cm4gb2JqICYmICdvYmplY3QnID09PSB0eXBlb2Ygb2JqICYmICFBcnJheS5pc0FycmF5KG9iaikgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nO1xufVxuXG4vKipcbiAqIEluaXRpYXRlIHJlcXVlc3QsIGludm9raW5nIGNhbGxiYWNrIGBmbihyZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHhociA9IHRoaXMueGhyID0gcmVxdWVzdC5nZXRYSFIoKTtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIGlmICh0aGlzLl9lbmRDYWxsZWQpIHtcbiAgICBjb25zb2xlLndhcm4oXCJXYXJuaW5nOiAuZW5kKCkgd2FzIGNhbGxlZCB0d2ljZS4gVGhpcyBpcyBub3Qgc3VwcG9ydGVkIGluIHN1cGVyYWdlbnRcIik7XG4gIH1cbiAgdGhpcy5fZW5kQ2FsbGVkID0gdHJ1ZTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gc3RhdGUgY2hhbmdlXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIHZhciByZWFkeVN0YXRlID0geGhyLnJlYWR5U3RhdGU7XG4gICAgaWYgKHJlYWR5U3RhdGUgPj0gMiAmJiBzZWxmLl9yZXNwb25zZVRpbWVvdXRUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX3Jlc3BvbnNlVGltZW91dFRpbWVyKTtcbiAgICB9XG4gICAgaWYgKDQgIT0gcmVhZHlTdGF0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEluIElFOSwgcmVhZHMgdG8gYW55IHByb3BlcnR5IChlLmcuIHN0YXR1cykgb2ZmIG9mIGFuIGFib3J0ZWQgWEhSIHdpbGxcbiAgICAvLyByZXN1bHQgaW4gdGhlIGVycm9yIFwiQ291bGQgbm90IGNvbXBsZXRlIHRoZSBvcGVyYXRpb24gZHVlIHRvIGVycm9yIGMwMGMwMjNmXCJcbiAgICB2YXIgc3RhdHVzO1xuICAgIHRyeSB7IHN0YXR1cyA9IHhoci5zdGF0dXMgfSBjYXRjaChlKSB7IHN0YXR1cyA9IDA7IH1cblxuICAgIGlmICghc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi50aW1lZG91dCB8fCBzZWxmLl9hYm9ydGVkKSByZXR1cm47XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgdmFyIGhhbmRsZVByb2dyZXNzID0gZnVuY3Rpb24oZGlyZWN0aW9uLCBlKSB7XG4gICAgaWYgKGUudG90YWwgPiAwKSB7XG4gICAgICBlLnBlcmNlbnQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiAxMDA7XG4gICAgfVxuICAgIGUuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgfVxuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB0cnkge1xuICAgICAgeGhyLm9ucHJvZ3Jlc3MgPSBoYW5kbGVQcm9ncmVzcy5iaW5kKG51bGwsICdkb3dubG9hZCcpO1xuICAgICAgaWYgKHhoci51cGxvYWQpIHtcbiAgICAgICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gaGFuZGxlUHJvZ3Jlc3MuYmluZChudWxsLCAndXBsb2FkJyk7XG4gICAgICB9XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAvLyBBY2Nlc3NpbmcgeGhyLnVwbG9hZCBmYWlscyBpbiBJRSBmcm9tIGEgd2ViIHdvcmtlciwgc28ganVzdCBwcmV0ZW5kIGl0IGRvZXNuJ3QgZXhpc3QuXG4gICAgICAvLyBSZXBvcnRlZCBoZXJlOlxuICAgICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy84MzcyNDUveG1saHR0cHJlcXVlc3QtdXBsb2FkLXRocm93cy1pbnZhbGlkLWFyZ3VtZW50LXdoZW4tdXNlZC1mcm9tLXdlYi13b3JrZXItY29udGV4dFxuICAgIH1cbiAgfVxuXG4gIC8vIHF1ZXJ5c3RyaW5nXG4gIHRoaXMuX2FwcGVuZFF1ZXJ5U3RyaW5nKCk7XG5cbiAgdGhpcy5fc2V0VGltZW91dHMoKTtcblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHRyeSB7XG4gICAgaWYgKHRoaXMudXNlcm5hbWUgJiYgdGhpcy5wYXNzd29yZCkge1xuICAgICAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlLCB0aGlzLnVzZXJuYW1lLCB0aGlzLnBhc3N3b3JkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIC8vIHNlZSAjMTE0OVxuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKGVycik7XG4gIH1cblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSAmJiAnR0VUJyAhPSB0aGlzLm1ldGhvZCAmJiAnSEVBRCcgIT0gdGhpcy5tZXRob2QgJiYgJ3N0cmluZycgIT0gdHlwZW9mIGRhdGEgJiYgIXRoaXMuX2lzSG9zdChkYXRhKSkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIHZhciBjb250ZW50VHlwZSA9IHRoaXMuX2hlYWRlclsnY29udGVudC10eXBlJ107XG4gICAgdmFyIHNlcmlhbGl6ZSA9IHRoaXMuX3NlcmlhbGl6ZXIgfHwgcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmICghc2VyaWFsaXplICYmIGlzSlNPTihjb250ZW50VHlwZSkpIHtcbiAgICAgIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplWydhcHBsaWNhdGlvbi9qc29uJ107XG4gICAgfVxuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKHZhciBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmIChudWxsID09IHRoaXMuaGVhZGVyW2ZpZWxkXSkgY29udGludWU7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICBpZiAodGhpcy5fcmVzcG9uc2VUeXBlKSB7XG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9IHRoaXMuX3Jlc3BvbnNlVHlwZTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG5cbiAgLy8gSUUxMSB4aHIuc2VuZCh1bmRlZmluZWQpIHNlbmRzICd1bmRlZmluZWQnIHN0cmluZyBhcyBQT1NUIHBheWxvYWQgKGluc3RlYWQgb2Ygbm90aGluZylcbiAgLy8gV2UgbmVlZCBudWxsIGhlcmUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgeGhyLnNlbmQodHlwZW9mIGRhdGEgIT09ICd1bmRlZmluZWQnID8gZGF0YSA6IG51bGwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR0VUIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IFtkYXRhXSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IFtkYXRhXSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogT1BUSU9OUyBxdWVyeSB0byBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3Qub3B0aW9ucyA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnT1BUSU9OUycsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWwodXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxucmVxdWVzdFsnZGVsJ10gPSBkZWw7XG5yZXF1ZXN0WydkZWxldGUnXSA9IGRlbDtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IFtkYXRhXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wYXRjaCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUEFUQ0gnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gW2RhdGFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcbiIsIi8qKlxuICogQ2hlY2sgaWYgYGZuYCBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXMtb2JqZWN0Jyk7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oZm4pIHtcbiAgdmFyIHRhZyA9IGlzT2JqZWN0KGZuKSA/IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChmbikgOiAnJztcbiAgcmV0dXJuIHRhZyA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0Z1bmN0aW9uO1xuIiwiLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gbnVsbCAhPT0gb2JqICYmICdvYmplY3QnID09PSB0eXBlb2Ygb2JqO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuIiwiLyoqXG4gKiBNb2R1bGUgb2YgbWl4ZWQtaW4gZnVuY3Rpb25zIHNoYXJlZCBiZXR3ZWVuIG5vZGUgYW5kIGNsaWVudCBjb2RlXG4gKi9cbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXMtb2JqZWN0Jyk7XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0QmFzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBSZXF1ZXN0QmFzZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0QmFzZWAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0QmFzZShvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59XG5cbi8qKlxuICogTWl4aW4gdGhlIHByb3RvdHlwZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gUmVxdWVzdEJhc2UucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBSZXF1ZXN0QmFzZS5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbiBfY2xlYXJUaW1lb3V0KCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICB0aGlzLl9yZXNwb25zZVRpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICBjbGVhclRpbWVvdXQodGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogT3ZlcnJpZGUgZGVmYXVsdCByZXNwb25zZSBib2R5IHBhcnNlclxuICpcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgdG8gY29udmVydCBpbmNvbWluZyBkYXRhIGludG8gcmVxdWVzdC5ib2R5XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UoZm4pe1xuICB0aGlzLl9wYXJzZXIgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBmb3JtYXQgb2YgYmluYXJ5IHJlc3BvbnNlIGJvZHkuXG4gKiBJbiBicm93c2VyIHZhbGlkIGZvcm1hdHMgYXJlICdibG9iJyBhbmQgJ2FycmF5YnVmZmVyJyxcbiAqIHdoaWNoIHJldHVybiBCbG9iIGFuZCBBcnJheUJ1ZmZlciwgcmVzcGVjdGl2ZWx5LlxuICpcbiAqIEluIE5vZGUgYWxsIHZhbHVlcyByZXN1bHQgaW4gQnVmZmVyLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnJlc3BvbnNlVHlwZSgnYmxvYicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5yZXNwb25zZVR5cGUgPSBmdW5jdGlvbih2YWwpe1xuICB0aGlzLl9yZXNwb25zZVR5cGUgPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBPdmVycmlkZSBkZWZhdWx0IHJlcXVlc3QgYm9keSBzZXJpYWxpemVyXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCB0byBjb252ZXJ0IGRhdGEgc2V0IHZpYSAuc2VuZCBvciAuYXR0YWNoIGludG8gcGF5bG9hZCB0byBzZW5kXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uIHNlcmlhbGl6ZShmbil7XG4gIHRoaXMuX3NlcmlhbGl6ZXIgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aW1lb3V0cy5cbiAqXG4gKiAtIHJlc3BvbnNlIHRpbWVvdXQgaXMgdGltZSBiZXR3ZWVuIHNlbmRpbmcgcmVxdWVzdCBhbmQgcmVjZWl2aW5nIHRoZSBmaXJzdCBieXRlIG9mIHRoZSByZXNwb25zZS4gSW5jbHVkZXMgRE5TIGFuZCBjb25uZWN0aW9uIHRpbWUuXG4gKiAtIGRlYWRsaW5lIGlzIHRoZSB0aW1lIGZyb20gc3RhcnQgb2YgdGhlIHJlcXVlc3QgdG8gcmVjZWl2aW5nIHJlc3BvbnNlIGJvZHkgaW4gZnVsbC4gSWYgdGhlIGRlYWRsaW5lIGlzIHRvbyBzaG9ydCBsYXJnZSBmaWxlcyBtYXkgbm90IGxvYWQgYXQgYWxsIG9uIHNsb3cgY29ubmVjdGlvbnMuXG4gKlxuICogVmFsdWUgb2YgMCBvciBmYWxzZSBtZWFucyBubyB0aW1lb3V0LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfE9iamVjdH0gbXMgb3Ige3Jlc3BvbnNlLCByZWFkLCBkZWFkbGluZX1cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIHRpbWVvdXQob3B0aW9ucyl7XG4gIGlmICghb3B0aW9ucyB8fCAnb2JqZWN0JyAhPT0gdHlwZW9mIG9wdGlvbnMpIHtcbiAgICB0aGlzLl90aW1lb3V0ID0gb3B0aW9ucztcbiAgICB0aGlzLl9yZXNwb25zZVRpbWVvdXQgPSAwO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2Ygb3B0aW9ucy5kZWFkbGluZSkge1xuICAgIHRoaXMuX3RpbWVvdXQgPSBvcHRpb25zLmRlYWRsaW5lO1xuICB9XG4gIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG9wdGlvbnMucmVzcG9uc2UpIHtcbiAgICB0aGlzLl9yZXNwb25zZVRpbWVvdXQgPSBvcHRpb25zLnJlc3BvbnNlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQcm9taXNlIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbcmVqZWN0XVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIHRoZW4ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gIGlmICghdGhpcy5fZnVsbGZpbGxlZFByb21pc2UpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHRoaXMuX2VuZENhbGxlZCkge1xuICAgICAgY29uc29sZS53YXJuKFwiV2FybmluZzogc3VwZXJhZ2VudCByZXF1ZXN0IHdhcyBzZW50IHR3aWNlLCBiZWNhdXNlIGJvdGggLmVuZCgpIGFuZCAudGhlbigpIHdlcmUgY2FsbGVkLiBOZXZlciBjYWxsIC5lbmQoKSBpZiB5b3UgdXNlIHByb21pc2VzXCIpO1xuICAgIH1cbiAgICB0aGlzLl9mdWxsZmlsbGVkUHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKGlubmVyUmVzb2x2ZSwgaW5uZXJSZWplY3Qpe1xuICAgICAgc2VsZi5lbmQoZnVuY3Rpb24oZXJyLCByZXMpe1xuICAgICAgICBpZiAoZXJyKSBpbm5lclJlamVjdChlcnIpOyBlbHNlIGlubmVyUmVzb2x2ZShyZXMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuX2Z1bGxmaWxsZWRQcm9taXNlLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbn1cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLmNhdGNoID0gZnVuY3Rpb24oY2IpIHtcbiAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIGNiKTtcbn07XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUub2sgPSBmdW5jdGlvbihjYikge1xuICBpZiAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIGNiKSB0aHJvdyBFcnJvcihcIkNhbGxiYWNrIHJlcXVpcmVkXCIpO1xuICB0aGlzLl9va0NhbGxiYWNrID0gY2I7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9pc1Jlc3BvbnNlT0sgPSBmdW5jdGlvbihyZXMpIHtcbiAgaWYgKCFyZXMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodGhpcy5fb2tDYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLl9va0NhbGxiYWNrKHJlcyk7XG4gIH1cblxuICByZXR1cm4gcmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDMwMDtcbn07XG5cblxuLyoqXG4gKiBHZXQgcmVxdWVzdCBoZWFkZXIgYGZpZWxkYC5cbiAqIENhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGhlYWRlciBgZmllbGRgIHZhbHVlLlxuICogVGhpcyBpcyBhIGRlcHJlY2F0ZWQgaW50ZXJuYWwgQVBJLiBVc2UgYC5nZXQoZmllbGQpYCBpbnN0ZWFkLlxuICpcbiAqIChnZXRIZWFkZXIgaXMgbm8gbG9uZ2VyIHVzZWQgaW50ZXJuYWxseSBieSB0aGUgc3VwZXJhZ2VudCBjb2RlIGJhc2UpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqIEBkZXByZWNhdGVkXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLmdldEhlYWRlciA9IFJlcXVlc3RCYXNlLnByb3RvdHlwZS5nZXQ7XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICogQ2FzZS1pbnNlbnNpdGl2ZS5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2V0KCdYLUFQSS1LZXknLCAnZm9vYmFyJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJywgJ1gtQVBJLUtleSc6ICdmb29iYXInIH0pXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihmaWVsZCwgdmFsKXtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBmaWVsZCkge1xuICAgICAgdGhpcy5zZXQoa2V5LCBmaWVsZFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsO1xuICB0aGlzLmhlYWRlcltmaWVsZF0gPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgaGVhZGVyIGBmaWVsZGAuXG4gKiBDYXNlLWluc2Vuc2l0aXZlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudW5zZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG4gIGRlbGV0ZSB0aGlzLmhlYWRlcltmaWVsZF07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBXcml0ZSB0aGUgZmllbGQgYG5hbWVgIGFuZCBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdFxuICogZm9yIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiIHJlcXVlc3QgYm9kaWVzLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKCdmb28nLCAnYmFyJylcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKHsgZm9vOiAnYmFyJywgYmF6OiAncXV4JyB9KVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd8QmxvYnxGaWxlfEJ1ZmZlcnxmcy5SZWFkU3RyZWFtfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKSB7XG5cbiAgLy8gbmFtZSBzaG91bGQgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIGFuIG9iamVjdC5cbiAgaWYgKG51bGwgPT09IG5hbWUgfHwgIHVuZGVmaW5lZCA9PT0gbmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignLmZpZWxkKG5hbWUsIHZhbCkgbmFtZSBjYW4gbm90IGJlIGVtcHR5Jyk7XG4gIH1cblxuICBpZiAodGhpcy5fZGF0YSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCIuZmllbGQoKSBjYW4ndCBiZSB1c2VkIGlmIC5zZW5kKCkgaXMgdXNlZC4gUGxlYXNlIHVzZSBvbmx5IC5zZW5kKCkgb3Igb25seSAuZmllbGQoKSAmIC5hdHRhY2goKVwiKTtcbiAgfVxuXG4gIGlmIChpc09iamVjdChuYW1lKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICB0aGlzLmZpZWxkKGtleSwgbmFtZVtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgZm9yICh2YXIgaSBpbiB2YWwpIHtcbiAgICAgIHRoaXMuZmllbGQobmFtZSwgdmFsW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyB2YWwgc2hvdWxkIGJlIGRlZmluZWQgbm93XG4gIGlmIChudWxsID09PSB2YWwgfHwgdW5kZWZpbmVkID09PSB2YWwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJy5maWVsZChuYW1lLCB2YWwpIHZhbCBjYW4gbm90IGJlIGVtcHR5Jyk7XG4gIH1cbiAgaWYgKCdib29sZWFuJyA9PT0gdHlwZW9mIHZhbCkge1xuICAgIHZhbCA9ICcnICsgdmFsO1xuICB9XG4gIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKG5hbWUsIHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5fYWJvcnRlZCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2Fib3J0ZWQgPSB0cnVlO1xuICB0aGlzLnhociAmJiB0aGlzLnhoci5hYm9ydCgpOyAvLyBicm93c2VyXG4gIHRoaXMucmVxICYmIHRoaXMucmVxLmFib3J0KCk7IC8vIG5vZGVcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW5hYmxlIHRyYW5zbWlzc2lvbiBvZiBjb29raWVzIHdpdGggeC1kb21haW4gcmVxdWVzdHMuXG4gKlxuICogTm90ZSB0aGF0IGZvciB0aGlzIHRvIHdvcmsgdGhlIG9yaWdpbiBtdXN0IG5vdCBiZVxuICogdXNpbmcgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiB3aXRoIGEgd2lsZGNhcmQsXG4gKiBhbmQgYWxzbyBtdXN0IHNldCBcIkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCJcbiAqIHRvIFwidHJ1ZVwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLndpdGhDcmVkZW50aWFscyA9IGZ1bmN0aW9uKCl7XG4gIC8vIFRoaXMgaXMgYnJvd3Nlci1vbmx5IGZ1bmN0aW9uYWxpdHkuIE5vZGUgc2lkZSBpcyBuby1vcC5cbiAgdGhpcy5fd2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgbWF4IHJlZGlyZWN0cyB0byBgbmAuIERvZXMgbm90aW5nIGluIGJyb3dzZXIgWEhSIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnJlZGlyZWN0cyA9IGZ1bmN0aW9uKG4pe1xuICB0aGlzLl9tYXhSZWRpcmVjdHMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ29udmVydCB0byBhIHBsYWluIGphdmFzY3JpcHQgb2JqZWN0IChub3QgSlNPTiBzdHJpbmcpIG9mIHNjYWxhciBwcm9wZXJ0aWVzLlxuICogTm90ZSBhcyB0aGlzIG1ldGhvZCBpcyBkZXNpZ25lZCB0byByZXR1cm4gYSB1c2VmdWwgbm9uLXRoaXMgdmFsdWUsXG4gKiBpdCBjYW5ub3QgYmUgY2hhaW5lZC5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IGRlc2NyaWJpbmcgbWV0aG9kLCB1cmwsIGFuZCBkYXRhIG9mIHRoaXMgcmVxdWVzdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBtZXRob2Q6IHRoaXMubWV0aG9kLFxuICAgIHVybDogdGhpcy51cmwsXG4gICAgZGF0YTogdGhpcy5fZGF0YSxcbiAgICBoZWFkZXJzOiB0aGlzLl9oZWFkZXJcbiAgfTtcbn07XG5cblxuLyoqXG4gKiBTZW5kIGBkYXRhYCBhcyB0aGUgcmVxdWVzdCBib2R5LCBkZWZhdWx0aW5nIHRoZSBgLnR5cGUoKWAgdG8gXCJqc29uXCIgd2hlblxuICogYW4gb2JqZWN0IGlzIGdpdmVuLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0nKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8ganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKCduYW1lPXRqJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gZGVmYXVsdHMgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICogICAgICAgIC5zZW5kKCdzcGVjaWVzPWZlcnJldCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpe1xuICB2YXIgaXNPYmogPSBpc09iamVjdChkYXRhKTtcbiAgdmFyIHR5cGUgPSB0aGlzLl9oZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuXG4gIGlmICh0aGlzLl9mb3JtRGF0YSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCIuc2VuZCgpIGNhbid0IGJlIHVzZWQgaWYgLmF0dGFjaCgpIG9yIC5maWVsZCgpIGlzIHVzZWQuIFBsZWFzZSB1c2Ugb25seSAuc2VuZCgpIG9yIG9ubHkgLmZpZWxkKCkgJiAuYXR0YWNoKClcIik7XG4gIH1cblxuICBpZiAoaXNPYmogJiYgIXRoaXMuX2RhdGEpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgdGhpcy5fZGF0YSA9IFtdO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2lzSG9zdChkYXRhKSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHt9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChkYXRhICYmIHRoaXMuX2RhdGEgJiYgdGhpcy5faXNIb3N0KHRoaXMuX2RhdGEpKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJDYW4ndCBtZXJnZSB0aGVzZSBzZW5kIGNhbGxzXCIpO1xuICB9XG5cbiAgLy8gbWVyZ2VcbiAgaWYgKGlzT2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICAvLyBkZWZhdWx0IHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAgIGlmICghdHlwZSkgdGhpcy50eXBlKCdmb3JtJyk7XG4gICAgdHlwZSA9IHRoaXMuX2hlYWRlclsnY29udGVudC10eXBlJ107XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIWlzT2JqIHx8IHRoaXMuX2lzSG9zdChkYXRhKSkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZGVmYXVsdCB0byBqc29uXG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuXG4vKipcbiAqIFNvcnQgYHF1ZXJ5c3RyaW5nYCBieSB0aGUgc29ydCBmdW5jdGlvblxuICpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBkZWZhdWx0IG9yZGVyXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3VzZXInKVxuICogICAgICAgICAucXVlcnkoJ25hbWU9TmljaycpXG4gKiAgICAgICAgIC5xdWVyeSgnc2VhcmNoPU1hbm55JylcbiAqICAgICAgICAgLnNvcnRRdWVyeSgpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gY3VzdG9taXplZCBzb3J0IGZ1bmN0aW9uXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3VzZXInKVxuICogICAgICAgICAucXVlcnkoJ25hbWU9TmljaycpXG4gKiAgICAgICAgIC5xdWVyeSgnc2VhcmNoPU1hbm55JylcbiAqICAgICAgICAgLnNvcnRRdWVyeShmdW5jdGlvbihhLCBiKXtcbiAqICAgICAgICAgICByZXR1cm4gYS5sZW5ndGggLSBiLmxlbmd0aDtcbiAqICAgICAgICAgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc29ydFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5zb3J0UXVlcnkgPSBmdW5jdGlvbihzb3J0KSB7XG4gIC8vIF9zb3J0IGRlZmF1bHQgdG8gdHJ1ZSBidXQgb3RoZXJ3aXNlIGNhbiBiZSBhIGZ1bmN0aW9uIG9yIGJvb2xlYW5cbiAgdGhpcy5fc29ydCA9IHR5cGVvZiBzb3J0ID09PSAndW5kZWZpbmVkJyA/IHRydWUgOiBzb3J0O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX3RpbWVvdXRFcnJvciA9IGZ1bmN0aW9uKHJlYXNvbiwgdGltZW91dCl7XG4gIGlmICh0aGlzLl9hYm9ydGVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IocmVhc29uICsgdGltZW91dCArICdtcyBleGNlZWRlZCcpO1xuICBlcnIudGltZW91dCA9IHRpbWVvdXQ7XG4gIGVyci5jb2RlID0gJ0VDT05OQUJPUlRFRCc7XG4gIHRoaXMudGltZWRvdXQgPSB0cnVlO1xuICB0aGlzLmFib3J0KCk7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fc2V0VGltZW91dHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIGRlYWRsaW5lXG4gIGlmICh0aGlzLl90aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgc2VsZi5fdGltZW91dEVycm9yKCdUaW1lb3V0IG9mICcsIHNlbGYuX3RpbWVvdXQpO1xuICAgIH0sIHRoaXMuX3RpbWVvdXQpO1xuICB9XG4gIC8vIHJlc3BvbnNlIHRpbWVvdXRcbiAgaWYgKHRoaXMuX3Jlc3BvbnNlVGltZW91dCAmJiAhdGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXIpIHtcbiAgICB0aGlzLl9yZXNwb25zZVRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYuX3RpbWVvdXRFcnJvcignUmVzcG9uc2UgdGltZW91dCBvZiAnLCBzZWxmLl9yZXNwb25zZVRpbWVvdXQpO1xuICAgIH0sIHRoaXMuX3Jlc3BvbnNlVGltZW91dCk7XG4gIH1cbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlQmFzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBSZXNwb25zZUJhc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VCYXNlYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlQmFzZShvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59XG5cbi8qKlxuICogTWl4aW4gdGhlIHByb3RvdHlwZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gUmVzcG9uc2VCYXNlLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gUmVzcG9uc2VCYXNlLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2VCYXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gICAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlQmFzZS5wcm90b3R5cGUuX3NldEhlYWRlclByb3BlcnRpZXMgPSBmdW5jdGlvbihoZWFkZXIpe1xuICAgIC8vIFRPRE86IG1vYXIhXG4gICAgLy8gVE9ETzogbWFrZSB0aGlzIGEgdXRpbFxuXG4gICAgLy8gY29udGVudC10eXBlXG4gICAgdmFyIGN0ID0gaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgICB0aGlzLnR5cGUgPSB1dGlscy50eXBlKGN0KTtcblxuICAgIC8vIHBhcmFtc1xuICAgIHZhciBwYXJhbXMgPSB1dGlscy5wYXJhbXMoY3QpO1xuICAgIGZvciAodmFyIGtleSBpbiBwYXJhbXMpIHRoaXNba2V5XSA9IHBhcmFtc1trZXldO1xuXG4gICAgdGhpcy5saW5rcyA9IHt9O1xuXG4gICAgLy8gbGlua3NcbiAgICB0cnkge1xuICAgICAgICBpZiAoaGVhZGVyLmxpbmspIHtcbiAgICAgICAgICAgIHRoaXMubGlua3MgPSB1dGlscy5wYXJzZUxpbmtzKGhlYWRlci5saW5rKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBpZ25vcmVcbiAgICB9XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlQmFzZS5wcm90b3R5cGUuX3NldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbihzdGF0dXMpe1xuICAgIHZhciB0eXBlID0gc3RhdHVzIC8gMTAwIHwgMDtcblxuICAgIC8vIHN0YXR1cyAvIGNsYXNzXG4gICAgdGhpcy5zdGF0dXMgPSB0aGlzLnN0YXR1c0NvZGUgPSBzdGF0dXM7XG4gICAgdGhpcy5zdGF0dXNUeXBlID0gdHlwZTtcblxuICAgIC8vIGJhc2ljc1xuICAgIHRoaXMuaW5mbyA9IDEgPT0gdHlwZTtcbiAgICB0aGlzLm9rID0gMiA9PSB0eXBlO1xuICAgIHRoaXMucmVkaXJlY3QgPSAzID09IHR5cGU7XG4gICAgdGhpcy5jbGllbnRFcnJvciA9IDQgPT0gdHlwZTtcbiAgICB0aGlzLnNlcnZlckVycm9yID0gNSA9PSB0eXBlO1xuICAgIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICAgICAgPyB0aGlzLnRvRXJyb3IoKVxuICAgICAgICA6IGZhbHNlO1xuXG4gICAgLy8gc3VnYXJcbiAgICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgICB0aGlzLm5vQ29udGVudCA9IDIwNCA9PSBzdGF0dXM7XG4gICAgdGhpcy5iYWRSZXF1ZXN0ID0gNDAwID09IHN0YXR1cztcbiAgICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gICAgdGhpcy5ub3RBY2NlcHRhYmxlID0gNDA2ID09IHN0YXR1cztcbiAgICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG4gICAgdGhpcy5ub3RGb3VuZCA9IDQwNCA9PSBzdGF0dXM7XG59O1xuIiwiXG4vKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy50eXBlID0gZnVuY3Rpb24oc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5wYXJhbXMgPSBmdW5jdGlvbihzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKjsgKi8pLnJlZHVjZShmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pO1xuICAgIHZhciBrZXkgPSBwYXJ0cy5zaGlmdCgpO1xuICAgIHZhciB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogUGFyc2UgTGluayBoZWFkZXIgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucGFyc2VMaW5rcyA9IGZ1bmN0aW9uKHN0cil7XG4gIHJldHVybiBzdHIuc3BsaXQoLyAqLCAqLykucmVkdWNlKGZ1bmN0aW9uKG9iaiwgc3RyKXtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqOyAqLyk7XG4gICAgdmFyIHVybCA9IHBhcnRzWzBdLnNsaWNlKDEsIC0xKTtcbiAgICB2YXIgcmVsID0gcGFydHNbMV0uc3BsaXQoLyAqPSAqLylbMV0uc2xpY2UoMSwgLTEpO1xuICAgIG9ialtyZWxdID0gdXJsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogU3RyaXAgY29udGVudCByZWxhdGVkIGZpZWxkcyBmcm9tIGBoZWFkZXJgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEByZXR1cm4ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLmNsZWFuSGVhZGVyID0gZnVuY3Rpb24oaGVhZGVyLCBzaG91bGRTdHJpcENvb2tpZSl7XG4gIGRlbGV0ZSBoZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICBkZWxldGUgaGVhZGVyWydjb250ZW50LWxlbmd0aCddO1xuICBkZWxldGUgaGVhZGVyWyd0cmFuc2Zlci1lbmNvZGluZyddO1xuICBkZWxldGUgaGVhZGVyWydob3N0J107XG4gIGlmIChzaG91bGRTdHJpcENvb2tpZSkge1xuICAgIGRlbGV0ZSBoZWFkZXJbJ2Nvb2tpZSddO1xuICB9XG4gIHJldHVybiBoZWFkZXI7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9pbmRleCcpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3BvbnlmaWxsID0gcmVxdWlyZSgnLi9wb255ZmlsbCcpO1xuXG52YXIgX3BvbnlmaWxsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BvbnlmaWxsKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgcm9vdDsgLyogZ2xvYmFsIHdpbmRvdyAqL1xuXG5cbmlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgcm9vdCA9IHNlbGY7XG59IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIHJvb3QgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gIHJvb3QgPSBnbG9iYWw7XG59IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gIHJvb3QgPSBtb2R1bGU7XG59IGVsc2Uge1xuICByb290ID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbn1cblxudmFyIHJlc3VsdCA9ICgwLCBfcG9ueWZpbGwyWydkZWZhdWx0J10pKHJvb3QpO1xuZXhwb3J0c1snZGVmYXVsdCddID0gcmVzdWx0OyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG5cdHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHN5bWJvbE9ic2VydmFibGVQb255ZmlsbDtcbmZ1bmN0aW9uIHN5bWJvbE9ic2VydmFibGVQb255ZmlsbChyb290KSB7XG5cdHZhciByZXN1bHQ7XG5cdHZhciBfU3ltYm9sID0gcm9vdC5TeW1ib2w7XG5cblx0aWYgKHR5cGVvZiBfU3ltYm9sID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0aWYgKF9TeW1ib2wub2JzZXJ2YWJsZSkge1xuXHRcdFx0cmVzdWx0ID0gX1N5bWJvbC5vYnNlcnZhYmxlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHQgPSBfU3ltYm9sKCdvYnNlcnZhYmxlJyk7XG5cdFx0XHRfU3ltYm9sLm9ic2VydmFibGUgPSByZXN1bHQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJlc3VsdCA9ICdAQG9ic2VydmFibGUnO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHJvajQgPSByZXF1aXJlKCdwcm9qNCcpO1xuXG4vLyBtYXRjaCBsYXllcnMgZm9yIGVhc2llciBjaGVja2luZ1xudmFyIG5jb2xzID0gNTEwLFxuICAgIG5yb3dzID0gNTYwLFxuICAgIHhsbGNvcm5lciA9IC00MTAwMDAsXG4gICAgeWxsY29ybmVyID0gLTY2MDAwMCxcbiAgICBjZWxsc2l6ZSA9IDIwMDA7XG5cbnZhciBwcm9qX2dtYXBzID0gJ0VQU0c6NDMyNic7XG52YXIgcHJval9jaW1pcyA9ICdFUFNHOjMzMTAnO1xuXG5wcm9qNC5kZWZzKCdFUFNHOjMzMTAnLCcrcHJvaj1hZWEgK2xhdF8xPTM0ICtsYXRfMj00MC41ICtsYXRfMD0wICtsb25fMD0tMTIwICt4XzA9MCAreV8wPS00MDAwMDAwICtlbGxwcz1HUlM4MCArdG93Z3M4ND0wLDAsMCwwLDAsMCwwICt1bml0cz1tICtub19kZWZzJyk7XG5cblxuZnVuY3Rpb24gYm91bmRzKCkge1xuICB2YXIgYm90dG9tTGVmdCA9IHByb2o0KHByb2pfY2ltaXMsIHByb2pfZ21hcHMsIFt4bGxjb3JuZXIsIHlsbGNvcm5lcl0pO1xuICB2YXIgdG9wUmlnaHQgPSBwcm9qNChwcm9qX2NpbWlzLCBwcm9qX2dtYXBzLFt4bGxjb3JuZXIrbmNvbHMqY2VsbHNpemUsIHlsbGNvcm5lcitucm93cypjZWxsc2l6ZV0pO1xuICB2YXIgYm91bmRzID0gW2JvdHRvbUxlZnQsIHRvcFJpZ2h0XTtcbiAgcmV0dXJuIGJvdW5kcztcbn1cblxuZnVuY3Rpb24gZ3JpZFRvQm91bmRzKHJvdywgY29sKSB7XG4gIHZhciBib3R0b21MZWZ0ID0gcHJvajQocHJval9jaW1pcywgcHJval9nbWFwcywgW3hsbGNvcm5lciArIChjb2wqY2VsbHNpemUpLCB5bGxjb3JuZXIgKyAoKG5yb3dzIC0gcm93KSpjZWxsc2l6ZSldKTtcbiAgdmFyIHRvcFJpZ2h0ID0gcHJvajQocHJval9jaW1pcywgcHJval9nbWFwcywgW3hsbGNvcm5lciArICgoY29sKzEpICogY2VsbHNpemUpLCB5bGxjb3JuZXIgKyAoKG5yb3dzIC0ocm93KzEpKSAqIGNlbGxzaXplKV0pO1xuICB2YXIgYm91bmRzID0gW2JvdHRvbUxlZnQsIHRvcFJpZ2h0XTtcblxuICByZXR1cm4gYm91bmRzO1xufVxuXG5mdW5jdGlvbiBsbFRvR3JpZChsbmcsIGxhdCkge1xuICBpZiggdHlwZW9mIGxuZyA9PT0gJ29iamVjdCcgKSB7XG4gICAgbGF0ID0gbG5nLmxhdCgpO1xuICAgIGxuZyA9IGxuZy5sbmcoKTtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBwcm9qNChwcm9qX2dtYXBzLCBwcm9qX2NpbWlzLCBbbG5nLCBsYXRdKTtcblxuICAvLyBBc3N1bWluZyB0aGlzIGlzIHRoZSBpbnB1dCB0byB0aGUgZ3JpZC4uLi5cbiAgLy8gQ29scyBhcmUgWC4gUm93cyBhcmUgWSBhbmQgY291bnRlZCBmcm9tIHRoZSB0b3AgZG93blxuICByZXN1bHQgPSB7XG4gICAgcm93IDogbnJvd3MgLSBNYXRoLmZsb29yKChyZXN1bHRbMV0gLSB5bGxjb3JuZXIpIC8gY2VsbHNpemUpLFxuICAgIGNvbCA6IE1hdGguZmxvb3IoKHJlc3VsdFswXSAtIHhsbGNvcm5lcikgLyBjZWxsc2l6ZSksXG4gIH07XG5cbiAgdmFyIHkgPSB5bGxjb3JuZXIgKyAoKG5yb3dzLXJlc3VsdC5yb3cpICogY2VsbHNpemUpO1xuICB2YXIgeCA9IHhsbGNvcm5lciArIChyZXN1bHQuY29sICogY2VsbHNpemUpIDtcblxuICByZXN1bHQudG9wUmlnaHQgPSBwcm9qNChwcm9qX2NpbWlzLCBwcm9qX2dtYXBzLFt4K2NlbGxzaXplLCB5K2NlbGxzaXplXSk7XG4gIHJlc3VsdC5ib3R0b21MZWZ0ID0gcHJvajQocHJval9jaW1pcywgcHJval9nbWFwcyxbeCwgeV0pO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxsVG9HcmlkIDogbGxUb0dyaWQsXG4gIHhsbGNvcm5lciA6IHhsbGNvcm5lcixcbiAgeWxsY29ybmVyIDogeWxsY29ybmVyLFxuICBjZWxsc2l6ZSA6IGNlbGxzaXplLFxuICBib3VuZHMgOiBib3VuZHMsXG4gIGdyaWRUb0JvdW5kcyA6IGdyaWRUb0JvdW5kc1xufTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJFVG9cIiA6IHtcbiAgICBcImxhYmVsXCIgOiBcIlJlZmVyZW5jZSBFdmFwb3RyYW5zcGlyYXRpb25cIixcbiAgICBcInVuaXRzXCIgOiBcIm1tXCJcbiAgfSxcbiAgXCJUZGV3XCIgOiB7XG4gICAgXCJsYWJlbFwiIDogXCJEZXdwb2ludCBUZW1wZXJhdHVyZVwiLFxuICAgIFwidW5pdHNcIiA6IFwiQ1wiXG4gIH0sXG4gIFwiVHhcIiA6IHtcbiAgICBcImxhYmVsXCIgOiBcIk1heCBUZW1wZXJhdHVyZVwiLFxuICAgIFwidW5pdHNcIiA6IFwiQ1wiXG4gIH0sXG4gIFwiVG5cIiA6IHtcbiAgICBcImxhYmVsXCIgOiBcIk1pbiBUZW1wZXJhdHVyZVwiLFxuICAgIFwidW5pdHNcIiA6IFwiQ1wiXG4gIH0sXG4gIFwiS1wiIDoge1xuICAgIFwibGFiZWxcIiA6IFwiQ2xlYXIgU2t5IEZhY3RvclwiLFxuICAgIFwidW5pdHNcIiA6IFwiXCJcbiAgfSxcbiAgXCJSbmxcIiA6IHtcbiAgICBcImxhYmVsXCIgOiBcIkxvbmd3YXZlIFJhZGlhdGlvblwiLFxuICAgIFwidW5pdHNcIiA6IFwiTVcvaFwiXG4gIH0sXG4gIFwiUnNvXCIgOiB7XG4gICAgXCJsYWJlbFwiIDogXCJTaG9ydHdhdmUgUmFkaWF0aW9uXCIsXG4gICAgXCJ1bml0c1wiIDogXCJNVy9oXCJcbiAgfSxcbiAgXCJVMlwiIDoge1xuICAgIFwibGFiZWxcIiA6IFwiV2luZCBTcGVlZFwiLFxuICAgIFwidW5pdHNcIiA6IFwibS9zXCJcbiAgfVxufVxuIiwidmFyIHpvbmVzID0gW1xuICB7XG4gICAgem9uZSAgOiAxMyxcbiAgICBhdmcgICA6IDIuMixcbiAgICBkZWx0YSA6IDAuNSxcbiAgICBjb2xvciA6ICcjMDAyNjczJ1xuICB9LFxuICB7XG4gICAgem9uZSAgOiAzLFxuICAgIGF2ZyAgIDogMi43LFxuICAgIGRlbHRhIDogMS4zLFxuICAgIGNvbG9yIDogJyM1MjkwZmEnXG4gIH0sXG4gIHtcbiAgICB6b25lICA6IDEyLFxuICAgIGF2ZyAgIDogMy4wLFxuICAgIGRlbHRhIDogMS43LFxuICAgIGNvbG9yIDogJyM3ZmI2ZjUnXG4gIH0sXG4gIHtcbiAgICB6b25lICA6IDQsXG4gICAgYXZnICAgOiAzLjAsXG4gICAgZGVsdGEgOiAyLjUsXG4gICAgY29sb3IgOiAnI2JlZjBmZidcbiAgfSxcbiAge1xuICAgIHpvbmUgIDogNixcbiAgICBhdmcgICA6IDMuMixcbiAgICBkZWx0YSA6IDIuMCxcbiAgICBjb2xvciA6ICcjMjY3MzAwJ1xuICB9LFxuICB7XG4gICAgem9uZSAgOiA4LFxuICAgIGF2ZyAgIDogMy40LFxuICAgIGRlbHRhIDogMi42LFxuICAgIGNvbG9yIDogJyMzOGE4MDAnXG4gIH0sXG4gIHtcbiAgICB6b25lICA6IDE2LFxuICAgIGF2ZyAgIDogMy43LFxuICAgIGRlbHRhIDogMi4yLFxuICAgIGNvbG9yIDogJyM5OGU2MDAnXG4gIH0sXG4gIHtcbiAgICB6b25lICA6IDEsXG4gICAgYXZnICAgOiAzLjgsXG4gICAgZGVsdGEgOiAyLjgsXG4gICAgY29sb3IgOiAnI2E4YTgwMCdcbiAgfSxcbiAge1xuICAgIHpvbmUgIDogNyxcbiAgICBhdmcgICA6IDQuMCxcbiAgICBkZWx0YSA6IDMuMSxcbiAgICBjb2xvciA6ICcjNjY4MDAwJ1xuICB9LFxuICB7XG4gICAgem9uZSAgOiAxNSxcbiAgICBhdmcgICA6IDQuNixcbiAgICBkZWx0YSA6IDMuMSxcbiAgICBjb2xvciA6ICcjNzM0YzAwJ1xuICB9LFxuICB7XG4gICAgem9uZSAgOiA1LFxuICAgIGF2ZyAgIDogNS4wLFxuICAgIGRlbHRhIDogMy4xLFxuICAgIGNvbG9yIDogJyM4OTVhNDQnXG4gIH0sXG4gIHtcbiAgICB6b25lICA6IDksXG4gICAgYXZnICAgOiA1LjAsXG4gICAgZGVsdGEgOiAzLjUsXG4gICAgY29sb3IgOiAnI2E4MzgwMCdcbiAgfSxcbiAge1xuICAgIHpvbmUgIDogMTEsXG4gICAgYXZnICAgOiA1LjMsXG4gICAgZGVsdGEgOiAzLjMsXG4gICAgY29sb3IgOiAnI2U2NGMwMCdcbiAgfSxcbiAge1xuICAgIHpvbmUgIDogMTQsXG4gICAgYXZnICAgOiA1LjUsXG4gICAgZGVsdGEgOiAzLjgsXG4gICAgY29sb3IgOiAnI2ZmYTIwMCdcbiAgfSxcbiAge1xuICAgIHpvbmUgIDogMixcbiAgICBhdmcgICA6IDYuMCxcbiAgICBkZWx0YSA6IDQuMCxcbiAgICBjb2xvciA6ICcjZmZkMDAwJ1xuICB9LFxuICB7XG4gICAgem9uZSAgOiAxMCxcbiAgICBhdmcgICA6IDYuNixcbiAgICBkZWx0YSA6IDQuMyxcbiAgICBjb2xvciA6ICcjZmZmZjAwJ1xuICB9XG5dXG5cbmZ1bmN0aW9uIG1lcmdlWm9uZU1hcChnZW9qc29uKSB7XG4gIGdlb2pzb24uZmVhdHVyZXMuZm9yRWFjaChmdW5jdGlvbihmZWF0dXJlLCBpbmRleCl7XG4gICAgdmFyIHpvbmVEYXRhID0gZ2V0Wm9uZUJ5QXZnRGVsdGEoZmVhdHVyZS5wcm9wZXJ0aWVzLnpvbmUpO1xuICAgIGlmKCAhem9uZURhdGEgKSByZXR1cm47XG4gICAgZm9yKCB2YXIga2V5IGluIHpvbmVEYXRhLmRhdGEgKSB7XG4gICAgICBmZWF0dXJlLnByb3BlcnRpZXNba2V5XSA9IHpvbmVEYXRhLmRhdGFba2V5XTtcbiAgICB9XG4gIH0pO1xuXG4gIGZvciggdmFyIGkgPSAwOyBpIDwgem9uZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgZm9yKCB2YXIgaiA9IDA7IGogPCBnZW9qc29uLmZlYXR1cmVzLmxlbmd0aDsgaisrICkge1xuICAgICAgaWYoIHpvbmVzW2ldLnpvbmUgPT09IGdlb2pzb24uZmVhdHVyZXNbal0ucHJvcGVydGllcy56b25lICkge1xuICAgICAgICB6b25lc1tpXSA9IGdlb2pzb24uZmVhdHVyZXNbal07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRab25lQnlBdmdEZWx0YShpZCkge1xuICBmb3IoIHZhciBpID0gMDsgaSA8IHpvbmVzLmxlbmd0aDsgaSsrICkge1xuICAgIGlmKCB6b25lc1tpXS5hdmcudG9GaXhlZCgxKSsnXycrem9uZXNbaV0uZGVsdGEudG9GaXhlZCgxKSA9PT0gaWQgKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhIDogem9uZXNbaV0sXG4gICAgICAgIGluZGV4IDogaVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0Wm9uZShpZCkge1xuICBpZCA9IHBhcnNlSW50KGlkKTtcbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCB6b25lcy5sZW5ndGg7IGkrKyApIHtcbiAgICBpZiggem9uZXNbaV0ucHJvcGVydGllcy56b25lID09PSBpZCApIHJldHVybiB6b25lc1tpXTtcbiAgfVxuICByZXR1cm4ge307XG59XG5cbmZ1bmN0aW9uIGdldEFsbCgpIHtcbiAgcmV0dXJuIHpvbmVzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0Wm9uZSA6IGdldFpvbmUsXG4gIGdldEFsbCA6IGdldEFsbCxcbiAgbWVyZ2Vab25lTWFwIDogbWVyZ2Vab25lTWFwXG59IiwidmFyIHN0YXRld2lkZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBbMy44MDAwMDM0NDc1OTQ0OCwzLjM3MjQxNTcwNDI2MzQzLDIuOTg4NDg1NTM2OTM5NDEsMi43MDAxMjEwNjQ4NTYwMSwyLjM4OTMwMjE0MjczNDk4LDIuMDMxMjMxOTg1MDM4MjEsMS43NjkwNjA1ODcyNjEwNiwxLjYwMTUyMTA5OTM4MTEsMS40NTU3NDQ2ODk3MDUzMSwxLjI4NjM0NjgxMDI1NjgzLDEuMTM0NzEyMjQwNDgwMzUsMS4xNDgxMjg3NzU3OTY3NCwxLjE0MzExNzMzNDU4ODQ0LDEuMTcwNDk3MjA1MTk4NzksMS4zMzIwODA0NDc1Mjc5OCwxLjQ5MTA0ODAyOTk4ODQ0LDEuNTcyMDM2NjI5OTI0MDYsMS43MTYxMDk0MTM2MDU3MiwxLjk2Mzg2MTM1MTcwMTM4LDIuMDg3OTc3NDI1MTYwMjUsMi4xOTQ2NjM1NzM0MTk2NSwyLjUwMjI3MDEzMTE0MDg5LDMuMDM5NjQ2MDQ0NDY0MzUsMy4zNDE2NDE5NTYyMjc3NywzLjU5NjIwMjcxOTQ1Nzc2LDMuNjI5NjgxMTM5NTg4NjUsMy45NjI0NDgxMDc1OTk5Miw0LjIwNTA1MjE5ODQ2MjMzLDQuNDY4ODk3OTA4MzI5MzYsNC44Nzc5ODkwMzY3MzMyMSw1LjMzNDg4MjQ0MDk5MzUzLDUuNTgwNDc5MDczMDk5MjUsNS43ODU3MDA2MjUyMzcwNCw1LjczMjE2OTAyMjI4NzUxLDYuMDc3MjkyNDc5NDEyMDUsNi40MTM4MzA5NDgxNzc1Nyw2LjcwNDQ0MDc5OTEzMDQ0LDYuODkyODY3NjAyNjIyNiw2LjkzMDM5OTcxMTczMjQ3LDYuOTI3OTU3NTYzMjExNzQsNi44NzUxNTMyOTI0Mjg3NSw2LjgxMDI3NjM5Njg3NDQ0LDYuNjc2Njg2NjQ5MzIyLDYuNTAzNTA0NDg4MDYxNzYsNi4zNDQ3MzA3NDc2OTI3LDYuMjE0MzM1MjY4ODIyNDEsNi4wMzU1NDY2NzY1ODYwOCw1Ljc3OTA0MTI0ODAzNDY4LDUuNDMxOTg4NTYxNDkzNTcsNC45NzQ2NzQ4NDk1MTk4MSw0LjYzMjQ2NDc0MDY5ODc2LDQuMjc2Nzc0NTAwNTg2NzhdO1xufTtcblxudmFyIGN1bV9ldCA9IGZ1bmN0aW9uIChFLEQsZCkge1xuICAgIHZhciBhbmc9MipNYXRoLlBJKihkLzM2NSk7XG4gICAgdmFyIGQxPWFuZy0yKk1hdGguUEkqKERbMV0pLzM2NTtcbiAgICB2YXIgZDI9YW5nLTIqTWF0aC5QSSooRFsyXS1EWzFdKS8zNjU7XG4gICAgdmFyIGV0PSAoRVswXSpkIC0gKDM2NS8yKk1hdGguUEkpKSAqIChFWzFdKk1hdGguc2luKGQxKSArIEVbMl0qTWF0aC5zaW4oZDEpKTtcbiAgICByZXR1cm4gZXQ7XG59O1xuXG52YXIgZXQgPSBmdW5jdGlvbiAoRSxELGQpIHtcbiAgICB2YXIgZDE9MipNYXRoLlBJKihkLURbMV0pLzM2NTtcbiAgICB2YXIgZDI9KDIqMipNYXRoLlBJLzM2NSkqKChkLURbMV0pLURbMl0pO1xuICAgIHZhciBldD1FWzBdK0VbMV0qTWF0aC5jb3MoZDEpK0VbMl0qTWF0aC5jb3MoZDIpO1xuICAgIHJldHVybiBldDtcbn07XG5cbnZhciBpZmZ0ID0gZnVuY3Rpb24gKEUsRCxOKSB7XG4gICAgdmFyIG47XG4gICAgdmFyIGV0PVtdO1xuICAgIGZvciAobj0wO248TjtuKyspIHtcblx0ZXRbbl09dGhpcy5ldChFLEQsMzY1KihuL04pKTtcbiAgICB9XG4gICAgcmV0dXJuIGV0O1xufTtcblxudmFyIGZmdCA9IGZ1bmN0aW9uKGV0KSB7XG4gICAgdmFyIE49ZXQubGVuZ3RoO1xuICAgIHZhciBpLG47XG4gICAgdmFyIHJlPVtdO1xuICAgIHZhciBpbT1bXTtcbiAgICB2YXIgRT1bXSxEPVtdO1xuICAgIHZhciBhbmcsIGV0YywgZXRzO1xuXG4gICAgZm9yIChpPTA7aTwzO2krKykge1xuICAgIFx0cmVbaV09MDtcblx0aW1baV09MDtcblx0Zm9yIChuPTA7bjxOO24rKykge1xuXHQgICAgYW5nPTIqTWF0aC5QSSpuL047XG5cdCAgICByZVtpXSs9ZXRbbl0qTWF0aC5jb3MoLWkqYW5nKTtcblx0ICAgIGltW2ldKz1ldFtuXSpNYXRoLnNpbigtYW5nKmkpO1xuXHR9XG5cdHN3aXRjaChpKSB7XG5cdGNhc2UgMDpcblx0ICAgIERbaV09MDtcblx0ICAgIEVbaV09TWF0aC5zcXJ0KE1hdGgucG93KHJlW2ldLDIpK1xuXHRcdCAgICAgICBNYXRoLnBvdyhpbVtpXSwyKSkvTjtcblx0ICAgIGJyZWFrO1xuXHRjYXNlIDE6XG5cdCAgICBEW2ldPSgzNjUgLSAzNjUvKDIqTWF0aC5QSSkqTWF0aC5hdGFuMihpbVtpXSxyZVtpXSkpICUgMzY1O1xuXHQgICAgRVtpXT0yKk1hdGguc3FydChNYXRoLnBvdyhyZVtpXSwyKStcblx0XHRcdCAgIE1hdGgucG93KGltW2ldLDIpKS9OO1xuXHQgICAgYnJlYWs7XG5cdGRlZmF1bHQ6XG5cdCAgICBEW2ldPSgoMzY1LjAvKDIqTWF0aC5QSSppKSkqKC1NYXRoLmF0YW4yKGltW2ldLHJlW2ldKSktRFtpLTFdKSAlICgzNjUuMC9pKTtcblx0ICAgIEVbaV09MipNYXRoLnNxcnQoTWF0aC5wb3cocmVbaV0sMikrXG5cdFx0XHQgICAgIE1hdGgucG93KGltW2ldLDIpKS9OO1xuXHQgICAgLy8gQ2VudGVyIG9uIG1heFxuXHQgICAgRFtpXT0oRFtpXTwtMzY1LjAvNCk/RFtpXSsoMzY1LjAvMik6RFtpXTtcblx0ICAgIC8vIFRoZW4gY2VudGVyIGFnYWluLCBidXQgb24gZWl0aGVyIGhpZ2ggb3IgbG93XG5cdCAgICBFW2ldPShEW2ldIDwgLTM2NS4wLzgpPy1FW2ldOihEW2ldIDwgMzY1LjAvOCk/RVtpXTotRVtpXTtcblx0ICAgIERbaV09KERbaV0gPCAtMzY1LjAvOCk/RFtpXSsoMzY1LjAvNCk6KERbaV0gPCAzNjUuMC84KT9EW2ldOkRbaV0tKDM2NS4wLzQpXG5cdH1cbiAgICB9XG4gICAgcmV0dXJuKHtlOkUsZDpELHJlOnJlLGltOmltfSk7XG59O1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc3RhdGV3aWRlOnN0YXRld2lkZSxcbiAgICBmZnQ6ZmZ0LFxuICAgIGV0OmV0LFxuICAgIGN1bV9ldDpjdW1fZXQsXG4gICAgaWZmdDppZmZ0XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmVkdXggOiByZXF1aXJlKCcuL3JlZHV4JyksXG4gIHNlcnZpY2VzIDogcmVxdWlyZSgnLi9zZXJ2aWNlcycpLFxuICBmZnQgOiByZXF1aXJlKCcuL2ZmdCcpLFxuICB6b25lcyA6IHJlcXVpcmUoJy4vZXRvLXpvbmVzJyksXG4gIGdyaWQgOiByZXF1aXJlKCcuL2NpbWlzLWdyaWQnKSxcbiAgdXRpbHMgOiByZXF1aXJlKCcuL3V0aWxzJyksXG4gIGRlZmluaXRpb25zIDogcmVxdWlyZSgnLi9kZWZpbml0aW9ucy5qc29uJylcbn07XG4iLCIvKipcbiAqIFNUQVRFIEVOVU1zXG4gKi9cbnZhciBBQ1RJT05TID0ge1xuICBTRVRfU0VDVElPTiA6ICdTRVRfU0VDVElPTicsXG4gIFNFVF9TVEFURSA6ICdTRVRfU1RBVEUnLFxuICBTRVRfTUFQX1NUQVRFIDogJ1NFVF9NQVBfU1RBVEUnXG59XG5cbnZhciBNQVBfU1RBVEVTID0ge1xuICBjaW1pc0dyaWQgOiAnY2ltaXNHcmlkJyxcbiAgZXRvWm9uZXMgOiAnZXRvWm9uZXMnLFxuICBkYXVab25lcyA6ICdkYXVab25lcycsXG4gIGNpbWlzU3RhdGlvbnMgOiAnY2ltaXNTdGF0aW9ucydcbn1cblxudmFyIEFQUF9TRUNUSU9OUyA9IHtcbiAgbWFwIDogJ21hcCcsXG4gIGRhdGEgOiAnZGF0YScsXG4gIGFib3V0IDogJ2Fib3V0JyxcbiAgaW5zdGFsbCA6ICdpbnN0YWxsJyxcbiAgc3VydmV5IDogJ3N1cnZleSdcbn1cblxuXG4vKipcbiAqIEFjdGlvbiBGdW5jdGlvbnNcbiAqL1xuZnVuY3Rpb24gc2V0QXBwU3RhdGUoc3RhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlIDogQUNUSU9OUy5TRVRfU1RBVEUsXG4gICAgc3RhdGUgOiBzdGF0ZVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldEFwcFNlY3Rpb24oc2VjdGlvbikge1xuICByZXR1cm4ge1xuICAgIHR5cGUgOiBBQ1RJT05TLlNFVF9TRUNUSU9OLFxuICAgIHNlY3Rpb24gOiBzZWN0aW9uXG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzZXRNYXBTdGF0ZShzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIHR5cGUgOiBBQ1RJT05TLlNFVF9NQVBfU1RBVEUsXG4gICAgc3RhdGUgOiBzdGF0ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBBQ1RJT05TIDogQUNUSU9OUyxcbiAgTUFQX1NUQVRFUyA6IE1BUF9TVEFURVMsXG4gIEFQUF9TRUNUSU9OUyA6IEFQUF9TRUNUSU9OUyxcbiAgc2V0QXBwU3RhdGUgOiBzZXRBcHBTdGF0ZSxcbiAgc2V0QXBwU2VjdGlvbiA6IHNldEFwcFNlY3Rpb24sXG4gIHNldE1hcFN0YXRlIDogc2V0TWFwU3RhdGUsXG59IiwidmFyIHNlcnZpY2VzID0gcmVxdWlyZSgnLi4vLi4vLi4vc2VydmljZXMvY2ltaXMnKTtcblxuLyoqXG4gKiBTVEFURSBFTlVNc1xuICovXG52YXIgQUNUSU9OUyA9IHtcbiAgTE9BRF9DSU1JU19SRVFVRVNUOiAnTE9BRF9DSU1JU19SRVFVRVNUJywgXG4gIExPQURfQ0lNSVNfU1VDQ0VTUzogJ0xPQURfQ0lNSVNfU1VDQ0VTUycsIFxuICBMT0FEX0NJTUlTX0ZBSUxVUkU6ICdMT0FEX0NJTUlTX0ZBSUxVUkUnLFxuXG4gIExPQURfQ0lNSVNfREFURVNfUkVRVUVTVDogJ0xPQURfQ0lNSVNfREFURVNfUkVRVUVTVCcsIFxuICBMT0FEX0NJTUlTX0RBVEVTX1NVQ0NFU1M6ICdMT0FEX0NJTUlTX0RBVEVTX1NVQ0NFU1MnLCBcbiAgTE9BRF9DSU1JU19EQVRFU19GQUlMVVJFOiAnTE9BRF9DSU1JU19EQVRFU19GQUlMVVJFJyxcbiAgXG4gIFNFTEVDVF9DSU1JU19HUklEX0xPQ0FUSU9OIDogJ1NFTEVDVF9DSU1JU19HUklEX0xPQ0FUSU9OJ1xufVxuXG4vKipcbiAqIEFjdGlvbiBGdW5jdGlvbnNcbiAqL1xuZnVuY3Rpb24gbG9hZERhdGVzKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGVzOiBbQUNUSU9OUy5MT0FEX0NJTUlTX0RBVEVTX1JFUVVFU1QsIEFDVElPTlMuTE9BRF9DSU1JU19EQVRFU19TVUNDRVNTLCBBQ1RJT05TLkxPQURfQ0lNSVNfREFURVNfRkFJTFVSRV0sXG4gICAgc2hvdWxkQ2FsbEFQSTogKHN0YXRlKSA9PiB7XG4gICAgICByZXR1cm4gc3RhdGUuY29sbGVjdGlvbnMuY2ltaXMuZGF0ZXMuc3RhdGUgIT09ICdsb2FkZWQnXG4gICAgfSxcbiAgICBjYWxsQVBJOiAoY2FsbGJhY2spID0+IHsgXG4gICAgICBzZXJ2aWNlcy5sb2FkRGF0ZXMoY2FsbGJhY2spIDtcbiAgICB9LFxuICAgIHBheWxvYWQ6IHt9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2VsZWN0KGlkKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZSA6IEFDVElPTlMuU0VMRUNUX0NJTUlTX0dSSURfTE9DQVRJT04sXG4gICAgaWQgOiBpZFxuICB9XG59XG5cbmZ1bmN0aW9uIGxvYWREYXRhKGdyaWRJZCkge1xuICByZXR1cm4ge1xuICAgIHR5cGVzOiBbQUNUSU9OUy5MT0FEX0NJTUlTX1JFUVVFU1QsIEFDVElPTlMuTE9BRF9DSU1JU19TVUNDRVNTLCBBQ1RJT05TLkxPQURfQ0lNSVNfRkFJTFVSRV0sXG4gICAgc2hvdWxkQ2FsbEFQSTogKHN0YXRlKSA9PiAhc3RhdGUuY29sbGVjdGlvbnMuY2ltaXMuYnlJZFtncmlkSWRdLFxuICAgIGNhbGxBUEk6IChjYWxsYmFjaykgPT4geyBcbiAgICAgIHNlcnZpY2VzLmxvYWREYXRhKGdyaWRJZCwgY2FsbGJhY2spO1xuICAgIH0sXG4gICAgcGF5bG9hZDogeyBcbiAgICAgIGlkIDogZ3JpZElkXG4gICAgfVxuICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEFDVElPTlMgOiBBQ1RJT05TLFxuICBsb2FkRGF0ZXM6IGxvYWREYXRlcyxcbiAgbG9hZERhdGE6IGxvYWREYXRhLFxuICBzZWxlY3QgOiBzZWxlY3Rcbn0iLCJ2YXIgc2VydmljZXMgPSByZXF1aXJlKCcuLi8uLi8uLi9zZXJ2aWNlcy9kYXUnKTtcblxuLyoqXG4gKiBTVEFURSBFTlVNc1xuICovXG52YXIgQUNUSU9OUyA9IHtcbiAgU0VMRUNUX0RBVV9aT05FIDogJ1NFTEVDVF9EQVVfWk9ORScsXG5cbiAgTE9BRF9EQVVfUkVRVUVTVDogJ0xPQURfREFVX1JFUVVFU1QnLCBcbiAgTE9BRF9EQVVfU1VDQ0VTUzogJ0xPQURfREFVX1NVQ0NFU1MnLCBcbiAgTE9BRF9EQVVfRkFJTFVSRTogJ0xPQURfREFVX0ZBSUxVUkUnLFxuXG4gIExPQURfREFVX0dFT01FVFJZX1JFUVVFU1Q6ICdMT0FEX0RBVV9HRU9NRVRSWV9SRVFVRVNUJywgXG4gIExPQURfREFVX0dFT01FVFJZX1NVQ0NFU1M6ICdMT0FEX0RBVV9HRU9NRVRSWV9TVUNDRVNTJywgXG4gIExPQURfREFVX0dFT01FVFJZX0ZBSUxVUkU6ICdMT0FEX0RBVV9HRU9NRVRSWV9GQUlMVVJFJ1xufVxuXG5cbi8qKlxuICogQWN0aW9uIEZ1bmN0aW9uc1xuICovXG5mdW5jdGlvbiBsb2FkR2VvbWV0cnkoaWQsIGRhdGEpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlczogW0FDVElPTlMuTE9BRF9EQVVfR0VPTUVUUllfUkVRVUVTVCwgQUNUSU9OUy5MT0FEX0RBVV9HRU9NRVRSWV9TVUNDRVNTLCBBQ1RJT05TLkxPQURfREFVX0dFT01FVFJZX0ZBSUxVUkVdLFxuICAgIHNob3VsZENhbGxBUEk6IChzdGF0ZSkgPT4ge1xuICAgICAgcmV0dXJuIHN0YXRlLmNvbGxlY3Rpb25zLmRhdS5nZW9tZXRyeS5zdGF0ZSA9PT0gJ2luaXQnO1xuICAgIH0sXG4gICAgY2FsbEFQSTogKGNhbGxiYWNrKSA9PiB7IFxuICAgICAgc2VydmljZXMubG9hZEdlb21ldHJ5KGNhbGxiYWNrKTtcbiAgICB9LFxuICAgIHBheWxvYWQ6IHsgXG4gICAgICBpZCA6IGlkXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvYWREYXRhKGlkLCBkYXRhKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZXM6IFtBQ1RJT05TLkxPQURfREFVX1JFUVVFU1QsIEFDVElPTlMuTE9BRF9EQVVfU1VDQ0VTUywgQUNUSU9OUy5MT0FEX0RBVV9GQUlMVVJFXSxcbiAgICBzaG91bGRDYWxsQVBJOiAoc3RhdGUpID0+ICFzdGF0ZS5jb2xsZWN0aW9ucy5kYXUuYnlJZFtpZF0sXG4gICAgY2FsbEFQSTogKGNhbGxiYWNrKSA9PiB7IFxuICAgICAgc2VydmljZXMubG9hZERhdGEoaWQsIGNhbGxiYWNrKTtcbiAgICB9LFxuICAgIHBheWxvYWQ6IHsgXG4gICAgICBpZCA6IGlkXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNlbGVjdFpvbmUoaWQpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlIDogQUNUSU9OUy5TRUxFQ1RfREFVX1pPTkUsXG4gICAgaWQgOiBpZFxuICB9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEFDVElPTlMgOiBBQ1RJT05TLFxuICBsb2FkR2VvbWV0cnkgOiBsb2FkR2VvbWV0cnksXG4gIGxvYWREYXRhIDogbG9hZERhdGEsXG4gIHNlbGVjdFpvbmUgOiBzZWxlY3Rab25lXG59IiwiLyoqXG4gKiBTVEFURSBFTlVNc1xuICovXG52YXIgQUNUSU9OUyA9IHtcbiAgU0VUX0VUT19aT05FX0dFT01FVFJZIDogJ1NFVF9FVE9fWk9ORV9HRU9NRVRSWScsXG4gIFNFVF9FVE9fWk9ORV9EQVRBIDogJ1NFVF9FVE9fWk9ORV9EQVRBJyxcbiAgU0VMRUNUX0VUT19aT05FX1pPTkUgOiAnU0VMRUNUX0VUT19aT05FX1pPTkUnXG59XG5cblxuLyoqXG4gKiBBY3Rpb24gRnVuY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIHNldEdlb21ldHJ5KGRhdGEpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlIDogQUNUSU9OUy5TRVRfRVRPX1pPTkVfR0VPTUVUUlksXG4gICAgZGF0YSA6IGRhdGFcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXREYXRhKGlkLCBkYXRhKSB7XG4gIGRhdGEuaWQgPSBpZDtcbiAgXG4gIHJldHVybiB7XG4gICAgdHlwZSA6IEFDVElPTlMuU0VUX0VUT19aT05FX0RBVEEsXG4gICAgaWQgOiBpZCxcbiAgICBkYXRhIDogZGF0YVxuICB9XG59XG5cbmZ1bmN0aW9uIHNlbGVjdFpvbmUoaWQpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlIDogQUNUSU9OUy5TRUxFQ1RfRVRPX1pPTkVfWk9ORSxcbiAgICBpZCA6IGlkXG4gIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQUNUSU9OUyA6IEFDVElPTlMsXG4gIHNldEdlb21ldHJ5IDogc2V0R2VvbWV0cnksXG4gIHNldERhdGEgOiBzZXREYXRhLFxuICBzZWxlY3Rab25lIDogc2VsZWN0Wm9uZVxufSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBkYXUgOiByZXF1aXJlKCcuL2RhdScpLFxuICBjaW1pcyA6IHJlcXVpcmUoJy4vY2ltaXMnKSxcbiAgZXRvWm9uZXMgOiByZXF1aXJlKCcuL2V0b1pvbmVzJylcbn0iLCIvKipcbiAqIFNUQVRFIEVOVU1zXG4gKi9cbnZhciBBQ1RJT05TID0ge1xuICBTRVRfQ09ORklHX0hPU1QgOiAnU0VUX0NPTkZJR19IT1NUJyxcbn1cblxuLyoqXG4gKiBBY3Rpb24gRnVuY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIHNldENvbmZpZ0hvc3QoaG9zdCkge1xuICByZXR1cm4ge1xuICAgIHR5cGUgOiBBQ1RJT05TLlNFVF9DT05GSUdfSE9TVCxcbiAgICBob3N0IDogaG9zdFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBBQ1RJT05TIDogQUNUSU9OUyxcbiAgc2V0Q29uZmlnSG9zdCA6IHNldENvbmZpZ0hvc3QsXG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFwcFN0YXRlIDogcmVxdWlyZSgnLi9hcHBTdGF0ZScpLFxuICBjb25maWcgOiByZXF1aXJlKCcuL2NvbmZpZycpLFxuICBjb2xsZWN0aW9ucyA6IHJlcXVpcmUoJy4vY29sbGVjdGlvbnMnKVxufSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBzdG9yZSA6IHJlcXVpcmUoJy4vc3RvcmUnKSxcbiAgdWkgOiByZXF1aXJlKCcuL3VpJyksXG4gIGFjdGlvbnMgOiByZXF1aXJlKCcuL2FjdGlvbnMnKVxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RvcmUpIHtcbiAgdmFyIGRpc3BhdGNoID0gc3RvcmUuZGlzcGF0Y2g7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG5leHQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYWN0aW9uKSB7XG5cbiAgICAgIGNvbnN0IHtcbiAgICAgICAgdHlwZXMsXG4gICAgICAgIGNhbGxBUEksXG4gICAgICAgIHNob3VsZENhbGxBUEkgPSAoKSA9PiB0cnVlLFxuICAgICAgICBwYXlsb2FkID0ge31cbiAgICAgIH0gPSBhY3Rpb25cblxuICAgICAgaWYgKCF0eXBlcykge1xuICAgICAgICAvLyBOb3JtYWwgYWN0aW9uOiBwYXNzIGl0IG9uXG4gICAgICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgIUFycmF5LmlzQXJyYXkodHlwZXMpIHx8XG4gICAgICAgIHR5cGVzLmxlbmd0aCAhPT0gMyB8fFxuICAgICAgICAhdHlwZXMuZXZlcnkodHlwZSA9PiB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycpXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBhbiBhcnJheSBvZiB0aHJlZSBzdHJpbmcgdHlwZXMuJylcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBjYWxsQVBJICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgY2FsbEFQSSB0byBiZSBhIGZ1bmN0aW9uLicpXG4gICAgICB9XG5cbiAgICAgIGlmICghc2hvdWxkQ2FsbEFQSShzdG9yZS5nZXRTdGF0ZSgpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IFsgcmVxdWVzdFR5cGUsIHN1Y2Nlc3NUeXBlLCBmYWlsdXJlVHlwZSBdID0gdHlwZXNcblxuICAgICAgZGlzcGF0Y2goT2JqZWN0LmFzc2lnbih7fSwgcGF5bG9hZCwge1xuICAgICAgICB0eXBlOiByZXF1ZXN0VHlwZVxuICAgICAgfSkpXG5cbiAgICAgIHJldHVybiBjYWxsQVBJKChlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYoIGVycm9yICkge1xuICAgICAgICAgIGRpc3BhdGNoKE9iamVjdC5hc3NpZ24oe30sIHBheWxvYWQsIHtcbiAgICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICAgIHR5cGU6IGZhaWx1cmVUeXBlXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpc3BhdGNoKE9iamVjdC5hc3NpZ24oe30sIHBheWxvYWQsIHtcbiAgICAgICAgICAgIHJlc3BvbnNlLFxuICAgICAgICAgICAgdHlwZTogc3VjY2Vzc1R5cGVcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RvcmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG5leHQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGFjdGlvbi50eXBlKTtcbiAgICAgIGNvbnNvbGUubG9nKGBESVNQQVRDSElORzpgLCBhY3Rpb24sIHN0b3JlLmdldFN0YXRlKCkpO1xuICAgICAgc3RhdGUgPSBuZXh0KGFjdGlvbik7XG4gICAgICBjb25zb2xlLmxvZyhgQ09NUExFVEU6ICR7YWN0aW9uLnR5cGV9YCwgc3RvcmUuZ2V0U3RhdGUoKSk7XG4gICAgICBjb25zb2xlLmdyb3VwRW5kKGFjdGlvbi50eXBlKTtcbiAgICB9XG4gIH1cbn0iLCJ2YXIgYXBwU3RhdGVBY3Rpb25zID0gcmVxdWlyZSgnLi4vYWN0aW9ucy9hcHBTdGF0ZScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG52YXIgYWN0aW9ucyA9IGFwcFN0YXRlQWN0aW9ucy5BQ1RJT05TO1xudmFyIG1hcFN0YXRlcyA9IGFwcFN0YXRlQWN0aW9ucy5NQVBfU1RBVEVTO1xudmFyIGFwcFNlY3Rpb25zID0gYXBwU3RhdGVBY3Rpb25zLkFQUF9TRUNUSU9OUztcblxudmFyIGluaXRpYWxTdGF0ZSA9IHtcbiAgc2VjdGlvbiA6IGFwcFNlY3Rpb25zLm1hcCxcbiAgbWFwU3RhdGUgOiBtYXBTdGF0ZXMuY2ltaXNHcmlkLFxuICBleHRyYXMgOiBbXVxufTtcblxuZnVuY3Rpb24gc2V0TWFwU3RhdGUoc3RhdGUsIGFjdGlvbikge1xuICBpZiggIW1hcFN0YXRlc1thY3Rpb24uc3RhdGVdICkge1xuICAgIGFjdGlvbi5zdGF0ZSA9IGluaXRpYWxTdGF0ZS5tYXBTdGF0ZTtcbiAgfVxuXG4gIGlmKCBzdGF0ZS5tYXBTdGF0ZSA9PT0gYWN0aW9uLnN0YXRlICkgcmV0dXJuIHN0YXRlO1xuXG4gIHJldHVybiB1dGlscy5hc3NpZ24oc3RhdGUsIHttYXBTdGF0ZTogYWN0aW9uLnN0YXRlfSk7XG59XG5cbmZ1bmN0aW9uIHNldFN0YXRlKHN0YXRlLCBhY3Rpb24pIHtcbiAgcmV0dXJuIHV0aWxzLmFzc2lnbihzdGF0ZSwgYWN0aW9uLnN0YXRlKTtcbn1cblxuZnVuY3Rpb24gc2V0U2VjdGlvbihzdGF0ZSwgYWN0aW9uKSB7XG4gIGlmKCAhYXBwU2VjdGlvbnNbYWN0aW9uLnNlY3Rpb25dICkge1xuICAgIGFjdGlvbi5zZWN0aW9uID0gaW5pdGlhbFN0YXRlLnNlY3Rpb247XG4gIH1cblxuICBpZiggc3RhdGUuc2VjdGlvbiA9PT0gYWN0aW9uLnNlY3Rpb24gKSByZXR1cm4gc3RhdGU7XG5cbiAgcmV0dXJuIHV0aWxzLmFzc2lnbihzdGF0ZSwge3NlY3Rpb246IGFjdGlvbi5zZWN0aW9ufSk7XG59XG5cblxuZnVuY3Rpb24gYXBwU3RhdGUoc3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbikge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBhY3Rpb25zLlNFVF9NQVBfU1RBVEU6XG4gICAgICByZXR1cm4gc2V0TWFwU3RhdGUoc3RhdGUsIGFjdGlvbik7XG4gICAgY2FzZSBhY3Rpb25zLlNFVF9TRUNUSU9OOlxuICAgICAgcmV0dXJuIHNldFNlY3Rpb24oc3RhdGUsIGFjdGlvbik7XG4gICAgY2FzZSBhY3Rpb25zLlNFVF9TVEFURTpcbiAgICAgIHJldHVybiBzZXRTdGF0ZShzdGF0ZSwgYWN0aW9uKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlXG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gYXBwU3RhdGU7IiwidmFyIGNpbWlzQWN0aW9ucyA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMvY29sbGVjdGlvbnMvY2ltaXMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBhY3Rpb25zID0gY2ltaXNBY3Rpb25zLkFDVElPTlM7XG5cbnZhciBpbml0aWFsU3RhdGUgPSB7XG4gIGRhdGVzIDoge30sXG4gIGJ5SWQgOiB7fSxcbiAgc2VsZWN0ZWQgOiAnJ1xufTtcblxuLyoqXG4gKiBEYXRlc1xuICovXG5mdW5jdGlvbiBzZXREYXRlcyhzdGF0ZSwgdmFsdWUpIHtcbiAgc3RhdGUuZGF0ZXMgPSB1dGlscy5hc3NpZ24oc3RhdGUuZGF0ZXMsIHZhbHVlKTtcbiAgcmV0dXJuIHN0YXRlO1xufVxuXG4vKipcbiAqIERhdGFcbiAqL1xuZnVuY3Rpb24gc2V0RGF0YShzdGF0ZSwgdmFsdWUpIHtcbiAgc3RhdGUuYnlJZCA9IHV0aWxzLmFzc2lnbihzdGF0ZS5ieUlkLCB7W3ZhbHVlLmlkXTogdmFsdWV9KTtcbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Qoc3RhdGUsIGFjdGlvbikge1xuICByZXR1cm4gdXRpbHMuYXNzaWduKHN0YXRlLCB7c2VsZWN0ZWQ6IGFjdGlvbi5pZH0pO1xufVxuXG5mdW5jdGlvbiBjaW1pcyhzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKSB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9DSU1JU19EQVRFU19SRVFVRVNUOlxuICAgICAgcmV0dXJuIHNldERhdGVzKHN0YXRlLCB7c3RhdGU6ICdsb2FkaW5nJ30pO1xuICAgIGNhc2UgYWN0aW9ucy5MT0FEX0NJTUlTX0RBVEVTX1NVQ0NFU1M6XG4gICAgICByZXR1cm4gc2V0RGF0ZXMoc3RhdGUsIHtzdGF0ZTogJ2xvYWRlZCcsIGRhdGE6IGFjdGlvbi5yZXNwb25zZS5ib2R5fSk7XG4gICAgY2FzZSBhY3Rpb25zLkxPQURfQ0lNSVNfREFURVNfRkFJTFVSRTpcbiAgICAgIHJldHVybiBzZXREYXRlcyhzdGF0ZSwge3N0YXRlOiAnZXJyb3InLCBlcnJvcjogYWN0aW9uLmVycm9yfSk7XG5cbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9DSU1JU19SRVFVRVNUOlxuICAgICAgcmV0dXJuIHNldERhdGEoc3RhdGUsIHtzdGF0ZTogJ2xvYWRpbmcnLCBpZDogYWN0aW9uLmlkfSk7XG4gICAgY2FzZSBhY3Rpb25zLkxPQURfQ0lNSVNfU1VDQ0VTUzpcbiAgICAgIHJldHVybiBzZXREYXRhKHN0YXRlLCB7c3RhdGU6ICdsb2FkZWQnLCBkYXRhOiBhY3Rpb24ucmVzcG9uc2UuYm9keSwgaWQ6IGFjdGlvbi5pZH0pO1xuICAgIGNhc2UgYWN0aW9ucy5MT0FEX0NJTUlTX0ZBSUxVUkU6XG4gICAgICByZXR1cm4gc2V0RGF0YShzdGF0ZSwge3N0YXRlOiAnZXJyb3InLCBlcnJvcjogYWN0aW9uLmVycm9yLCBpZDogYWN0aW9uLmlkfSk7XG5cbiAgICBjYXNlIGFjdGlvbnMuU0VMRUNUX0NJTUlTX0dSSURfTE9DQVRJT046XG4gICAgICByZXR1cm4gc2VsZWN0KHN0YXRlLCBhY3Rpb24pO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gc3RhdGVcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBjaW1pczsiLCJ2YXIgZGF1QWN0aW9ucyA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMvY29sbGVjdGlvbnMvZGF1Jyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgYWN0aW9ucyA9IGRhdUFjdGlvbnMuQUNUSU9OUztcblxudmFyIGluaXRpYWxTdGF0ZSA9IHtcbiAgZ2VvbWV0cnkgOiB7XG4gICAgZGF0YSA6IG51bGwsXG4gICAgc3RhdGUgOiAnaW5pdCdcbiAgfSxcbiAgYnlJZCA6IHt9LFxuICBzZWxlY3RlZCA6ICcnXG59O1xuXG4vKipcbiAqIEdlb21ldHJ5XG4gKi9cbmZ1bmN0aW9uIHNldEdlb21ldHJ5KHN0YXRlLCB2YWx1ZSkge1xuICBzdGF0ZS5nZW9tZXRyeSA9IHV0aWxzLmFzc2lnbihzdGF0ZS5nZW9tZXRyeSwgdmFsdWUpO1xuICByZXR1cm4gc3RhdGU7XG59XG5cbi8qKlxuICogRGF0YVxuICovXG5mdW5jdGlvbiBzZXREYXRhKHN0YXRlLCB2YWx1ZSkge1xuICBzdGF0ZS5ieUlkID0gdXRpbHMuYXNzaWduKHN0YXRlLmJ5SWQsIHtbdmFsdWUuaWRdOiB2YWx1ZX0pO1xuICByZXR1cm4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdFpvbmUoc3RhdGUsIGFjdGlvbikge1xuICBpZiggc3RhdGUuc2VsZWN0ZWQgPT09IGFjdGlvbi5pZCApIHJldHVybiBzdGF0ZTtcbiAgcmV0dXJuIHV0aWxzLmFzc2lnbihzdGF0ZSwge3NlbGVjdGVkOiBhY3Rpb24uaWR9KTtcbn1cblxuZnVuY3Rpb24gZGF1KHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgYWN0aW9ucy5TRUxFQ1RfREFVX1pPTkU6XG4gICAgICByZXR1cm4gc2VsZWN0Wm9uZShzdGF0ZSwgYWN0aW9uKTtcbiAgICBcbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9EQVVfR0VPTUVUUllfUkVRVUVTVDpcbiAgICAgIHJldHVybiBzZXRHZW9tZXRyeShzdGF0ZSwge3N0YXRlOiAnbG9hZGluZyd9KTtcbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9EQVVfR0VPTUVUUllfU1VDQ0VTUzpcbiAgICAgIHJldHVybiBzZXRHZW9tZXRyeShzdGF0ZSwge3N0YXRlOiAnbG9hZGVkJywgZGF0YTogYWN0aW9uLnJlc3BvbnNlLmJvZHl9KTtcbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9EQVVfR0VPTUVUUllfRkFJTFVSRTpcbiAgICAgIHJldHVybiBzZXRHZW9tZXRyeShzdGF0ZSwge3N0YXRlOiAnZXJyb3InLCBlcnJvcjogYWN0aW9uLmVycm9yfSk7XG5cbiAgICBjYXNlIGFjdGlvbnMuTE9BRF9EQVVfUkVRVUVTVDpcbiAgICAgIHJldHVybiBzZXREYXRhKHN0YXRlLCB7c3RhdGU6ICdsb2FkaW5nJywgaWQ6IGFjdGlvbi5pZH0pO1xuICAgIGNhc2UgYWN0aW9ucy5MT0FEX0RBVV9TVUNDRVNTOlxuICAgICAgcmV0dXJuIHNldERhdGEoc3RhdGUsIHtzdGF0ZTogJ2xvYWRlZCcsIGRhdGE6IGFjdGlvbi5yZXNwb25zZS5ib2R5LCBpZDogYWN0aW9uLmlkfSk7XG4gICAgY2FzZSBhY3Rpb25zLkxPQURfREFVX0ZBSUxVUkU6XG4gICAgICByZXR1cm4gc2V0RGF0YShzdGF0ZSwge3N0YXRlOiAnZXJyb3InLCBlcnJvcjogYWN0aW9uLmVycm9yLCBpZDogYWN0aW9uLmlkfSk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlXG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZGF1OyIsInZhciBldG9BY3Rpb25zID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucy9jb2xsZWN0aW9ucy9ldG9ab25lcycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIGFjdGlvbnMgPSBldG9BY3Rpb25zLkFDVElPTlM7XG5cbnZhciBpbml0aWFsU3RhdGUgPSB7XG4gIGdlb21ldHJ5IDoge1xuICAgIGRhdGEgOiBudWxsLFxuICAgIHN0YXRlIDogJ2luaXQnXG4gIH0sXG4gIGJ5SWQgOiB7fSxcbiAgc2VsZWN0ZWQgOiAnJ1xufTtcblxuLyoqXG4gKiBHZW9tZXRyeVxuICovXG5mdW5jdGlvbiBzZXRHZW9tZXRyeShzdGF0ZSwgYWN0aW9uKSB7XG4gIHN0YXRlLmdlb21ldHJ5ID0gdXRpbHMuYXNzaWduKHN0YXRlLmdlb21ldHJ5LCBhY3Rpb24uZGF0YSk7XG4gIHJldHVybiBzdGF0ZTtcbn1cblxuLyoqXG4gKiBEYXRhXG4gKi9cbmZ1bmN0aW9uIHNldERhdGEoc3RhdGUsIGFjdGlvbikge1xuICBzdGF0ZS5ieUlkID0gdXRpbHMuYXNzaWduKHN0YXRlLmJ5SWQsIHtbYWN0aW9uLmlkXTogYWN0aW9uLmRhdGF9KTtcbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rab25lKHN0YXRlLCBhY3Rpb24pIHtcbiAgaWYoIHN0YXRlLnNlbGVjdGVkID09PSBhY3Rpb24uaWQgKSByZXR1cm4gc3RhdGU7XG4gIHJldHVybiB1dGlscy5hc3NpZ24oc3RhdGUsIHtzZWxlY3RlZDogYWN0aW9uLmlkfSk7XG59XG5cbmZ1bmN0aW9uIGV0b1pvbmUoc3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbikge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBhY3Rpb25zLlNFVF9FVE9fWk9ORV9HRU9NRVRSWTpcbiAgICAgIHJldHVybiBzZXRHZW9tZXRyeShzdGF0ZSwgYWN0aW9uKTtcbiAgICBjYXNlIGFjdGlvbnMuU0VUX0VUT19aT05FX0RBVEE6XG4gICAgICByZXR1cm4gc2V0RGF0YShzdGF0ZSwgYWN0aW9uKTtcbiAgICBjYXNlIGFjdGlvbnMuU0VMRUNUX0VUT19aT05FX1pPTkU6XG4gICAgICByZXR1cm4gc2VsZWN0Wm9uZShzdGF0ZSwgYWN0aW9uKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlXG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZXRvWm9uZTsiLCJ2YXIgY29tYmluZVJlZHVjZXJzID0gcmVxdWlyZSgncmVkdXgnKS5jb21iaW5lUmVkdWNlcnM7XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYmluZVJlZHVjZXJzKHtcbiAgZGF1IDogcmVxdWlyZSgnLi9kYXUnKSxcbiAgY2ltaXMgOiByZXF1aXJlKCcuL2NpbWlzJyksXG4gIGV0b1pvbmVzIDogcmVxdWlyZSgnLi9ldG9ab25lcycpXG59KTsiLCJ2YXIgY29uZmlnQWN0aW9ucyA9IHJlcXVpcmUoJy4uL2FjdGlvbnMvY29uZmlnJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBhY3Rpb25zID0gY29uZmlnQWN0aW9ucy5BQ1RJT05TO1xuXG52YXIgaW5pdGlhbFN0YXRlID0ge1xuICBob3N0IDogJydcbn07XG5cbmZ1bmN0aW9uIHNldEhvc3Qoc3RhdGUsIGFjdGlvbikge1xuICByZXR1cm4gdXRpbHMuYXNzaWduKHN0YXRlLCB7aG9zdDogYWN0aW9uLmhvc3R9KTtcbn1cblxuZnVuY3Rpb24gY29uZmlnKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgYWN0aW9ucy5TRVRfQ09ORklHX0hPU1Q6XG4gICAgICByZXR1cm4gc2V0SG9zdChzdGF0ZSwgYWN0aW9uKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHN0YXRlXG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gY29uZmlnOyIsInZhciBjb21iaW5lUmVkdWNlcnMgPSByZXF1aXJlKCdyZWR1eCcpLmNvbWJpbmVSZWR1Y2VycztcblxubW9kdWxlLmV4cG9ydHMgPSBjb21iaW5lUmVkdWNlcnMoe1xuICBhcHBTdGF0ZSA6IHJlcXVpcmUoJy4vYXBwU3RhdGUnKSxcbiAgY29uZmlnIDogcmVxdWlyZSgnLi9jb25maWcnKSxcbiAgY29sbGVjdGlvbnMgOiByZXF1aXJlKCcuL2NvbGxlY3Rpb25zJylcbn0pOyIsImZ1bmN0aW9uIGFzc2lnbihzdGF0ZSwgbmV3U3RhdGUpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLCBuZXdTdGF0ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3NpZ24gOiBhc3NpZ25cbn0iLCJ2YXIgcmVkdXggPSByZXF1aXJlKCdyZWR1eCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlZHV4LmNyZWF0ZVN0b3JlKFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlKCcuL3JlZHVjZXJzJyksXG4gICAgICAgICAgICAgICAgICAgIHJlZHV4LmFwcGx5TWlkZGxld2FyZShcbiAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlKCcuL21pZGRsZXdhcmUvYXBpJylcbiAgICAgICAgICAgICAgICAgICAgICAscmVxdWlyZSgnLi9taWRkbGV3YXJlL2xvZ2dpbmcnKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICApOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgncG9seW1lci1yZWR1eCcpKHJlcXVpcmUoJy4uL3N0b3JlJykpOyIsInZhciBhY3Rpb25zID0gcmVxdWlyZSgnLi4vLi4vYWN0aW9ucy9hcHBTdGF0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aW9ucyA6IGFjdGlvbnMsXG4gIHByb3BlcnR5UGF0aHMgOiB7XG4gICAgYXBwU3RhdGUgOiAnYXBwU3RhdGUnXG4gIH1cbn0iLCJ2YXIgYWN0aW9ucyA9IHJlcXVpcmUoJy4uLy4uL2FjdGlvbnMvY29sbGVjdGlvbnMvZGF1Jyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGlvbnMgOiBhY3Rpb25zLFxuICBiZWhhdmlvciA6IHtcbiAgICBsb2FkR2VvbWV0cnkgOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2goJ2xvYWRHZW9tZXRyeScpXG4gICAgfSxcbiAgICBsb2FkRGF0YSA6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICBpZiggIXRoaXMuYWN0aXZlIHx8ICFpZCApIHJldHVybjtcbiAgICAgIHRoaXMuZGlzcGF0Y2goJ2xvYWREYXRhJywgaWQpXG4gICAgfSxcbiAgICBzZWxlY3Rab25lIDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIGlmKCB0aGlzLnNlbGVjdGVkID09PSBpZCApIHJldHVybjtcbiAgICAgIHRoaXMuZGlzcGF0Y2goJ3NlbGVjdFpvbmUnLCBpZCk7XG4gICAgfVxuICB9LFxuICBwcm9wZXJ0eVBhdGhzIDoge1xuICAgIGdlb21ldHJ5IDogJ2NvbGxlY3Rpb25zLmRhdS5nZW9tZXRyeScsXG4gICAgc2VsZWN0ZWQgOiAnY29sbGVjdGlvbnMuZGF1LnNlbGVjdGVkJyxcbiAgICBjdXJyZW50Wm9uZURhdGEgOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgcmV0dXJuIHN0YXRlLmNvbGxlY3Rpb25zLmRhdS5ieUlkW3N0YXRlLmNvbGxlY3Rpb25zLmRhdS5zZWxlY3RlZF07XG4gICAgfVxuICB9XG59IiwidmFyIGFjdGlvbnMgPSByZXF1aXJlKCcuLi8uLi9hY3Rpb25zL2NvbGxlY3Rpb25zL2NpbWlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3Rpb25zIDogYWN0aW9ucyxcbiAgYmVoYXZpb3IgOiB7XG4gICAgX3NlbGVjdEdyaWRJZCA6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoKCdzZWxlY3QnLCBpZCk7XG4gICAgfSxcbiAgICBfbG9hZERhdGVzIDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoKCdsb2FkRGF0ZXMnKTtcbiAgICB9LFxuICAgIF9sb2FkR3JpZERhdGEgOiBmdW5jdGlvbihpZCkge1xuICAgICAgaWYoICF0aGlzLmFjdGl2ZSB8fCAhaWQgKSByZXR1cm47XG4gICAgICB0aGlzLmRpc3BhdGNoKCdsb2FkRGF0YScsIGlkKTtcbiAgICB9XG4gIH0sXG4gIHByb3BlcnR5UGF0aHMgOiB7XG4gICAgbWFwU3RhdGUgOiAnYXBwU3RhdGUubWFwU3RhdGUnLFxuICAgIGRhdURhdGEgOiAnY29sbGVjdGlvbnMuZGF1Lmdlb21ldHJ5JyxcbiAgICBzZWxlY3RlZENpbWlzR3JpZCA6ICdjb2xsZWN0aW9ucy5jaW1pcy5zZWxlY3RlZCcsXG4gICAgZGF0ZXMgOiAnY29sbGVjdGlvbnMuY2ltaXMuZGF0ZXMnLFxuICAgIHNlbGVjdGVkQ2ltaXNHcmlkRGF0YSA6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICByZXR1cm4gc3RhdGUuY29sbGVjdGlvbnMuY2ltaXMuYnlJZFtzdGF0ZS5jb2xsZWN0aW9ucy5jaW1pcy5zZWxlY3RlZF07XG4gICAgfVxuICB9XG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICdkd3ItcGFnZS1kYXUnIDogcmVxdWlyZSgnLi9kd3ItcGFnZS1kYXUnKSxcbiAgJ2R3ci1wYWdlLW1hcCcgOiByZXF1aXJlKCcuL2R3ci1wYWdlLW1hcCcpLFxuICAnZHdyLWFwcCcgOiByZXF1aXJlKCcuL2R3ci1hcHAnKVxufSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBiaW5kaW5ncyA6IHJlcXVpcmUoJy4vYmluZGluZ3MnKSxcbiAgYmVoYXZpb3IgOiByZXF1aXJlKCcuL2JlaGF2aW9yJylcbn0iLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuL3N0b3JlJyk7XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKCkge1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgdmFyIGZuID0gYXJncy5zcGxpY2UoMCwgMSlbMF07XG4gIHJlcXVpcmUoJy4vc3RvcmUnKS5kaXNwYXRjaChmbi5hcHBseSh0aGlzLCBhcmdzKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkaXNwYXRjaCA6IGRpc3BhdGNoXG59IiwidmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG52YXIgYWN0aW9ucyA9IHJlcXVpcmUoJy4uL3JlZHV4L2FjdGlvbnMvY29sbGVjdGlvbnMvY2ltaXMnKTtcbnZhciBkaXNwYXRjaCA9IHJlcXVpcmUoJy4uL3JlZHV4L3V0aWxzJykuZGlzcGF0Y2g7XG52YXIgc3RvcmUgPSByZXF1aXJlKCcuLi9yZWR1eC9zdG9yZScpO1xudmFyIGdldEhvc3QgPSByZXF1aXJlKCcuL3V0aWxzJykuZ2V0SG9zdDtcblxuZnVuY3Rpb24gbG9hZERhdGVzKGNhbGxiYWNrKSB7XG4gIHJlcXVlc3RcbiAgICAuZ2V0KGAke2dldEhvc3QoKX0vY2ltaXMvZGF0ZXNgKVxuICAgIC5lbmQoY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBsb2FkRGF0YShjaW1pc0dyaWRJZCwgY2FsbGJhY2spIHtcbiAgdmFyIHVybElkID0gY2ltaXNHcmlkSWQucmVwbGFjZSgvLS8sICcvJyk7XG5cbiAgcmVxdWVzdFxuICAgIC5nZXQoYCR7Z2V0SG9zdCgpfS9jaW1pcy8ke3VybElkfWApXG4gICAgLmVuZChjYWxsYmFjayk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvYWREYXRlcyA6IGxvYWREYXRlcyxcbiAgbG9hZERhdGEgOiBsb2FkRGF0YVxufSIsInZhciByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xudmFyIGFjdGlvbnMgPSByZXF1aXJlKCcuLi9yZWR1eC9hY3Rpb25zL2NvbGxlY3Rpb25zL2RhdScpO1xudmFyIGRpc3BhdGNoID0gcmVxdWlyZSgnLi4vcmVkdXgvdXRpbHMnKS5kaXNwYXRjaDtcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL3JlZHV4L3N0b3JlJyk7XG52YXIgZ2V0SG9zdCA9IHJlcXVpcmUoJy4vdXRpbHMnKS5nZXRIb3N0O1xuXG5mdW5jdGlvbiBsb2FkR2VvbWV0cnkoY2FsbGJhY2spIHtcbiAgcmVxdWVzdFxuICAgIC5nZXQoYCR7Z2V0SG9zdCgpfS9kYXVjby5qc29uYClcbiAgICAuZW5kKGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gbG9hZERhdGEoZGF1Wm9uZUlkLCBjYWxsYmFjaykge1xuICByZXF1ZXN0XG4gICAgLmdldChgJHtnZXRIb3N0KCl9L2NpbWlzL3JlZ2lvbi9EQVUke2RhdVpvbmVJZH1gKVxuICAgIC5lbmQoY2FsbGJhY2spO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9hZEdlb21ldHJ5IDogbG9hZEdlb21ldHJ5LFxuICBsb2FkRGF0YSA6IGxvYWREYXRhXG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRhdSA6IHJlcXVpcmUoJy4vZGF1Jylcbn0iLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuLi9yZWR1eC9zdG9yZScpO1xuXG5mdW5jdGlvbiBnZXRIb3N0KCkge1xuICAvLyBIQUNLIGZvciBjeWNsaWNhbCBkZXBlbmRlbmN5XG4gIHJldHVybiByZXF1aXJlKCcuLi9yZWR1eC9zdG9yZScpLmdldFN0YXRlKCkuY29uZmlnLmhvc3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRIb3N0IDogZ2V0SG9zdFxufSIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gc29ydERhdGVzKGRhdGEpIHtcbiAgdmFyIGFyciA9IFtdO1xuXG4gIGlmKCBBcnJheS5pc0FycmF5KGRhdGEpICkge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGFyci5wdXNoKHtcbiAgICAgICAgc3RyIDogZGF0YVtpXSxcbiAgICAgICAgdGltZSA6IHRvRGF0ZShkYXRhW2ldKS5nZXRUaW1lKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IoIHZhciBkYXRlIGluIGRhdGEgKSB7XG4gICAgICBhcnIucHVzaCh7XG4gICAgICAgIHN0ciA6IGRhdGUsXG4gICAgICAgIHRpbWUgOiB0b0RhdGUoZGF0ZSkuZ2V0VGltZSgpXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhcnIuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICBpZiggYS50aW1lID4gYi50aW1lICkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmKCBhLnRpbWUgPCBiLnRpbWUgKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9KTtcblxuICB2YXIgdG1wID0gW107XG4gIGFyci5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgIHRtcC5wdXNoKGl0ZW0uc3RyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRtcDtcbn1cblxuZnVuY3Rpb24gdG9EYXRlKHN0cikge1xuICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoJy0nKTtcbiAgcmV0dXJuIG5ldyBEYXRlKHBhcnNlSW50KHBhcnRzWzBdKSwgcGFyc2VJbnQocGFydHNbMV0pLTEsIHBhcnNlSW50KHBhcnRzWzJdKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzb3J0RGF0ZXMgOiBzb3J0RGF0ZXNcbn07XG4iXX0=
