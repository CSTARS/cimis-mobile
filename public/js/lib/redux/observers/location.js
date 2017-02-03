var observer = require('redux-observers').observer;
var eventBus = require('../../eventBus');

var search = observer(
  (state) => state.location.search,
  (dispatch, current, previous) => {
    eventBus.emit('location-search-update', current);
  }
);

var selected = observer(
  (state) => state.location.current,
  (dispatch, current, previous) => {
    eventBus.emit('selected-location-update', current);
  }
);

module.exports = [search, selected];