var observer = require('redux-observers').observer;
var eventBus = require('../../eventBus');

var byId = observer(
  (state) => state.collections.cimis.byId,
  (dispatch, current, previous) => {
    for( var key in current ) {
      if( current[key] !== previous[key] ) {
        eventBus.emit('cimis-grid-data-update', current[key]);
      }
    }
  }
);

var dates = observer(
  (state) => state.collections.cimis.dates,
  (dispatch, current, previous) => {
    eventBus.emit('cimis-grid-dates-update', current);
  }
);

var selected = observer(
  (state) => state.collections.cimis.selected,
  (dispatch, current, previous) => {
    eventBus.emit('cimis-grid-selected-update', current);
  }
);

module.exports = [byId, dates, selected];