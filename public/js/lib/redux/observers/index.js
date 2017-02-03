/**
 * Observe the redux store and send change events to UI
 */
var observe = require('redux-observers').observe;

var observers = []
          .concat(require('./cimis'))
          .concat(require('./appState'))
          .concat(require('./dau'))
          .concat(require('./etoZones'));


module.exports = function(store) {
  observe(store, observers);
}