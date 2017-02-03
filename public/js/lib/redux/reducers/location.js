var actions = require('../actions/location').ACTIONS;
var utils = require('./utils');

var initialState = {
  search : {},
  current : ''
};

/**
 * Current Location
 */
function setLocation(state, action) {
  return utils.assign(state, {current: action.location});
}

/**
 * Search
 */
function setSearch(state, value) {
  return utils.assign(state, {search: value});
}


function location(state = initialState, action) {
  switch (action.type) {
    case actions.GEOLOCATE_REQUEST:
      return setSearch(state, {state: 'loading'});
    case actions.GEOLOCATE_SUCCESS:
      return setSearch(state, {state: 'loaded', data: action.response.body});
    case actions.GEOLOCATE_FAILURE:
      return setSearch(state, {state: 'error', error: action.error});

    case actions.SET_LOCATION:
      return setLocation(state, action);
    default:
      return state
  }
}
module.exports = location;