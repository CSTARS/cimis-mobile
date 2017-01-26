/**
 * STATE ENUMs
 */
var ACTIONS = {
  SET_SECTION : 'SET_SECTION',
  SET_STATE : 'SET_STATE',
  SET_MAP_STATE : 'SET_MAP_STATE'
}

var MAP_STATES = {
  cimisGrid : 'cimisGrid',
  etoZones : 'etoZones',
  dauZones : 'dauZones',
  cimisStations : 'cimisStations'
}

var APP_SECTIONS = {
  map : 'map',
  data : 'data',
  about : 'about',
  install : 'install',
  survey : 'survey'
}


/**
 * Action Functions
 */
function setAppState(state) {
  return {
    type : ACTIONS.SET_STATE,
    state : state
  }
}

function setAppSection(section) {
  return {
    type : ACTIONS.SET_SECTION,
    section : section
  }
}


function setMapState(state) {
  return {
    type : ACTIONS.SET_MAP_STATE,
    state : state
  }
}

module.exports = {
  ACTIONS : ACTIONS,
  MAP_STATES : MAP_STATES,
  APP_SECTIONS : APP_SECTIONS,
  setAppState : setAppState,
  setAppSection : setAppSection,
  setMapState : setMapState,
}