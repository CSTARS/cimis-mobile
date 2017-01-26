var services = require('../../../services/cimis');

/**
 * STATE ENUMs
 */
var ACTIONS = {
  LOAD_CIMIS_REQUEST: 'LOAD_CIMIS_REQUEST', 
  LOAD_CIMIS_SUCCESS: 'LOAD_CIMIS_SUCCESS', 
  LOAD_CIMIS_FAILURE: 'LOAD_CIMIS_FAILURE',
  LOAD_CIMIS_DATES_REQUEST: 'LOAD_CIMIS_DATES_REQUEST', 
  LOAD_CIMIS_DATES_SUCCESS: 'LOAD_CIMIS_DATES_SUCCESS', 
  LOAD_CIMIS_DATES_FAILURE: 'LOAD_CIMIS_DATES_FAILURE',
  SELECT_CIMIS_GRID_LOCATION : 'SELECT_CIMIS_GRID_LOCATION'
}

/**
 * Action Functions
 */
function loadDates() {
  return {
    types: [ACTIONS.LOAD_CIMIS_DATES_REQUEST, ACTIONS.LOAD_CIMIS_DATES_SUCCESS, ACTIONS.LOAD_CIMIS_DATES_FAILURE],
    shouldCallAPI: (state) => {
      return state.collections.cimis.dates.state !== 'loaded'
    },
    callAPI: (callback) => { 
      services.loadDates(callback) ;
    },
    payload: {}
  }
}

function select(id) {
  return {
    type : ACTIONS.SELECT_CIMIS_GRID_LOCATION,
    id : id
  }
}

function loadData(gridId) {
  return {
    types: [ACTIONS.LOAD_CIMIS_REQUEST, ACTIONS.LOAD_CIMIS_SUCCESS, ACTIONS.LOAD_CIMIS_FAILURE],
    shouldCallAPI: (state) => !state.collections.cimis.byId[gridId],
    callAPI: (callback) => { 
      services.loadData(gridId, callback);
    },
    payload: { 
      id : gridId
    }
  }
}


module.exports = {
  ACTIONS : ACTIONS,
  loadDates: loadDates,
  loadData: loadData,
  select : select
}