var cimisActions = require('../../actions/collections/cimis');
var utils = require('../utils');

var actions = cimisActions.ACTIONS;

var initialState = {
  dates : {},
  byId : {},
  selected : ''
};

/**
 * Dates
 */
function setDates(state, action) {
  state.dates = utils.assign(state.dates, action.data);
  return state;
}

/**
 * Data
 */
function setData(state, action) {
  state.byId = utils.assign(state.byId, {[action.id]: action.data});
  return state;
}

function select(state, action) {
  return utils.assign(state, {selected: action.id});
}

function cimis(state = initialState, action) {
  switch (action.type) {
    case actions.SET_CIMIS_DATES:
      return setDates(state, action);
    case actions.SET_CIMIS_DATA:
      return setData(state, action);
    case actions.SELECT_CIMIS_GRID_LOCATION:
      return select(state, action);
    default:
      return state
  }
}
module.exports = cimis;