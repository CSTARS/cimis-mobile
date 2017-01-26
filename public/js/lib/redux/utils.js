var store = require('./store');

function dispatch() {
  var args = [].slice.call(arguments);
  var fn = args.splice(0, 1)[0];
  require('./store').dispatch(fn.apply(this, args));
}

module.exports = {
  dispatch : dispatch
}