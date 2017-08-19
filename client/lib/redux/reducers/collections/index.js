var combineReducers = require('redux').combineReducers;

module.exports = combineReducers({
  dau : require('./dau'),
  cimis : require('./cimis'),
  etoZones : require('./etoZones')
});