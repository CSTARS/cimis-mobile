var etoActions = require('../../actions/collections/etoZones');
var utils = require('../utils');

var actions = etoActions.ACTIONS;

var initialState = {
  geometry : {
    data : null,
    state : 'init'
  },
  byId : {},
  selected : ''
};

/**
 * Geometry
 */
function setGeometry(state, action) {
  state.geometry = utils.assign(state.geometry, action.data);
  return state;
}

/**
 * Data
 */
function setData(state, action) {
  state.byId = utils.assign(state.byId, {[action.id]: action.data});
  return state;
}

function selectZone(state, action) {
  if( state.selected === action.id ) return state;
  return utils.assign(state, {selected: action.id});
}

function etoZone(state = initialState, action) {
  switch (action.type) {
    case actions.SET_ETO_ZONE_GEOMETRY:
      return setGeometry(state, action);
    case actions.SET_ETO_ZONE_DATA:
      return setData(state, action);
    case actions.SELECT_ETO_ZONE_ZONE:
      return selectZone(state, action);
    default:
      return state
  }
}
module.exports = etoZone;