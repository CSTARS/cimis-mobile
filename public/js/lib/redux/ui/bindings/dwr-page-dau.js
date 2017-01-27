var actions = require('../../actions/collections/dau');


module.exports = {
  actions : actions,
  behavior : {
    loadGeometry : function() {
      this.dispatch('loadGeometry')
    },
    loadData : function(id) {
      if( !this.active || !id ) return;
      this.dispatch('loadData', id)
    },
    selectZone : function(id) {
      if( this.selected === id ) return;
      this.dispatch('selectZone', id);
    }
  },
  propertyPaths : {
    geometry : 'collections.dau.geometry',
    selected : 'collections.dau.selected',
    currentZoneData : function(state) {
      return state.collections.dau.byId[state.collections.dau.selected];
    }
  }
}