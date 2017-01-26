var services = require('../../../services/cimis');
var actions = require('../../actions/collections/cimis');

module.exports = {
  actions : actions,
  behavior : {
    loadDates : services.loadDates,
    loadCimisGridData : services.loadData
  },
  propertyPaths : {
    mapState : 'appState.mapState',
    dauData : 'collections.dau.geometry',
    selectedCimisGrid : 'collections.cimis.selected',
    dates : 'collections.cimis.dates',
    selectedCimisGridData : function(state) {
      return state.collections.cimis.byId[state.collections.cimis.selected];
    }
  }
}