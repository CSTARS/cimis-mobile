var actions = require('../../actions/collections/cimis');
var getZone = require('../../../eto-zones').getZone;
var sortDates = require('../../../utils').sortDates;
var llToGrid = require('../../../cimis-grid').llToGrid;

module.exports = {
  actions : actions,
  behavior : {
    llToGrid : llToGrid,
    getZone : getZone,
    sortDates : sortDates,
    _selectGridId : function(id) {
      this.dispatch('select', id);
    },
    _loadDates : function() {
      this.dispatch('loadDates');
    },
    _loadGridData : function(id) {
      if( !this.active || !id ) return;
      this.dispatch('loadData', id);
    }
  },
  propertyPaths : {
    mapState : 'appState.mapState',
    dates : 'collections.cimis.dates',
    dauGeometry : 'collections.dau.geometry',
    etoGeometry : 'collections.etoZones.geometry',
    selectedCimisGrid : 'collections.cimis.selected',
    selectedCimisGridData : function(state) {
      return state.collections.cimis.byId[state.collections.cimis.selected];
    }
  }
}