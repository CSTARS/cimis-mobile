var actions = require('../../actions/collections/etoZones');


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
    geometry : 'collections.etoZones.geometry',
    selected : 'collections.etoZones.selected',
    currentZoneData : function(state) {
      return state.collections.etoZones.byId[state.collections.etoZones.selected];
    }
  }
}