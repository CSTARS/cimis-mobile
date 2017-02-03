var actions = require('../../redux/actions/location');
var store = require('../../redux/store');

function LocationController() {

  this.search = function(query) {
    store.dispatch(
      actions.geolocate(query)
    );

    return store.getState().location.search;
  }

  this.select = function(location) {
    store.dispatch(
      actions.setLocation(location)
    );

    return store.getState().location.current;
  }
}

var controller = new LocationController();
require('./events')(controller);

module.exports = controller;