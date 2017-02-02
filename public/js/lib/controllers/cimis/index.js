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