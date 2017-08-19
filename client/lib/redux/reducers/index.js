var combineReducers = require('redux').combineReducers;

module.exports = combineReducers({
  appState : require('./appState'),
  config : require('./config'),
  collections : require('./collections'),
  location : require('./location')
});