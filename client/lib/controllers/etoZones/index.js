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