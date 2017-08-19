var observer = require('redux-observers').observer;
var eventBus = require('../../eventBus');

var byId = observer(
  (state) => state.collections.etoZones.byId,
  (dispatch, current, previous) => {
    for( var key in current ) {
      if( current[key] !== previous[key] ) {
        eventBus.emit('eto-zone-data-update', current[key]);
      }
    }
  }
);

var geometry = observer(
  (state) => state.collections.etoZones.geometry,
  (dispatch, current, previous) => {
    eventBus.emit('eto-zone-geometry-update', current);
  }
);

var selected = observer(
  (state) => state.collections.etoZones.selected,
  (dispatch, current, previous) => {
    eventBus.emit('eto-zone-selected-update', current);
  }
);

module.exports = [byId, geometry, selected];