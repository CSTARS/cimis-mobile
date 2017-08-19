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