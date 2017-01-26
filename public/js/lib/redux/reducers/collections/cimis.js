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
function setDates(state, value) {
  state.dates = utils.assign(state.dates, value);
  return state;
}

/**
 * Data
 */
function setData(state, value) {
  state.byId = utils.assign(state.byId, {[value.id]: value});
  return state;
}

function select(state, action) {
  return utils.assign(state, {selected: action.id});
}

function cimis(state = initialState, action) {
  switch (action.type) {
    case actions.LOAD_CIMIS_DATES_REQUEST:
      return setDates(state, {state: 'loading'});
    case actions.LOAD_CIMIS_DATES_SUCCESS:
      return setDates(state, {state: 'loaded', data: action.response.body});
    case actions.LOAD_CIMIS_DATES_FAILURE:
      return setDates(state, {state: 'error', error: action.error});

    case actions.LOAD_CIMIS_REQUEST:
      return setData(state, {state: 'loading', id: action.id});
    case actions.LOAD_CIMIS_SUCCESS:
      return setData(state, {state: 'loaded', data: action.response.body, id: action.id});
    case actions.LOAD_CIMIS_FAILURE:
      return setData(state, {state: 'error', error: action.error, id: action.id});

    case actions.SELECT_CIMIS_GRID_LOCATION:
      return select(state, action);
    default:
      return state
  }
}
module.exports = cimis;