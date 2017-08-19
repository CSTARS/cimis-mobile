var observer = require('redux-observers').observer;
var eventBus = require('../../eventBus');

var byId = observer(
  (state) => state.collections.dau.byId,
  (dispatch, current, previous) => {
    for( var key in current ) {
      if( current[key] !== previous[key] ) {
        eventBus.emit('dau-data-update', current[key]);
      }
    }
  }
);

var geometry = observer(
  (state) => state.collections.dau.geometry,
  (dispatch, current, previous) => {
    eventBus.emit('dau-geometry-update', current);
  }
);

var selected = observer(
  (state) => state.collections.dau.selected,
  (dispatch, current, previous) => {
    eventBus.emit('dau-selected-update', current);
  }
);

module.exports = [byId, geometry, selected];