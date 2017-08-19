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