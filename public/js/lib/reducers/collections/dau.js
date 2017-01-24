var dauActions = require('../../actions/collections/dau');
var utils = require('../utils');

var actions = dauActions.ACTIONS;

var initialState = {
  geometry : {
    data : {},
    loading : false,
    error : false
  },
  data : {}
};

function setDauLoadingGeometryState(state, action) {
  return utils.assign(state, {geometry: {loading: action.loading}});
}

function setGeometry(state, action) {
  return utils.assign(state, {geometry: {data: action.data}});
}

function setError(state, action) {
  return utils.assign(state, {geometry: {error: action.error}});
}

function dau(state = initialState, action) {
  switch (action.type) {
    case actions.LOAD_DAU_GEOMETRY:
      return setDauLoadingGeometryState(state, action);
    case actions.SET_DAU_GEOMETRY:
      return setGeometry(state, action);
    case actions.LOAD_DAU_GEOMETRY_ERROR:
      return setGeometryError(state, action);
    default:
      return state
  }
}
module.exports = dau;