var appStateActions = require('../actions/appState');
var utils = require('./utils');

var actions = appStateActions.ACTIONS;
var mapStates = appStateActions.MAP_STATES;
var appSections = appStateActions.APP_SECTIONS;

var initialState = {
  section : appSections.map,
  mapState : mapStates.cimisGrid
};

function setMapState(state, action) {
  if( !mapStates[action.state] ) {
    action.state = initialState.mapState;
  }

  if( state.mapState === action.state ) return state;

  return utils.assign(state, {mapState: action.state});
}

function setState(state, action) {
  return utils.assign(state, action.state);
}

function setSection(state, action) {
  if( !appSections[action.section] ) {
    action.section = initialState.section;
  }

  if( state.section === action.section ) return state;

  return utils.assign(state, {section: action.section});
}


function appState(state = initialState, action) {
  switch (action.type) {
    case actions.SET_MAP_STATE:
      return setMapState(state, action);
    case actions.SET_SECTION:
      return setSection(state, action);
    case actions.SET_STATE:
      return setState(state, action);
    default:
      return state
  }
}
module.exports = appState;