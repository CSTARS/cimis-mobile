var dauActions = require('../../actions/collections/dau');
var utils = require('../utils');

var actions = dauActions.ACTIONS;

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
function setGeometry(state, value) {
  state.geometry = utils.assign(state.geometry, value);
  return state;
}

/**
 * Data
 */
function setData(state, value) {
  state.byId = utils.assign(state.byId, {[value.id]: value});
  return state;
}

function selectZone(state, action) {
  if( state.selected === action.id ) return state;
  return utils.assign(state, {selected: action.id});
}

function dau(state = initialState, action) {
  switch (action.type) {
    case actions.SELECT_DAU_ZONE:
      return selectZone(state, action);
    
    case actions.LOAD_DAU_GEOMETRY_REQUEST:
      return setGeometry(state, {state: 'loading'});
    case actions.LOAD_DAU_GEOMETRY_SUCCESS:
      return setGeometry(state, {state: 'loaded', data: action.response.body});
    case actions.LOAD_DAU_GEOMETRY_FAILURE:
      return setGeometry(state, {state: 'error', error: action.error});

    case actions.LOAD_DAU_REQUEST:
      return setData(state, {state: 'loading', id: action.id});
    case actions.LOAD_DAU_SUCCESS:
      return setData(state, {state: 'loaded', data: action.response.body, id: action.id});
    case actions.LOAD_DAU_FAILURE:
      return setData(state, {state: 'error', error: action.error, id: action.id});

    default:
      return state
  }
}
module.exports = dau;