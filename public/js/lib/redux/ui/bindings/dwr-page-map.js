var actions = require('../../actions/collections/cimis');

module.exports = {
  actions : actions,
  behavior : {
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
    dauData : 'collections.dau.geometry',
    selectedCimisGrid : 'collections.cimis.selected',
    dates : 'collections.cimis.dates',
    selectedCimisGridData : function(state) {
      return state.collections.cimis.byId[state.collections.cimis.selected];
    }
  }
}