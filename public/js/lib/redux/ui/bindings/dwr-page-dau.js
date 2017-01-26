
var actions = require('../../actions/collections/dau');
var services = require('../../../services/dau');

module.exports = {
  actions : actions,
  behavior : {
    loadGeometry : services.loadGeometry,
    loadData : services.loadData
  },
  propertyPaths : {
    geometry : 'collections.dau.geometry',
    selected : 'collections.dau.selected',
    currentZoneData : function(state) {
      return state.collections.dau.byId[state.collections.dau.selected];
    }
  }
}