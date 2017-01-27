var services = require('../../../services/dau');

/**
 * STATE ENUMs
 */
var ACTIONS = {
  SELECT_DAU_ZONE : 'SELECT_DAU_ZONE',

  LOAD_DAU_REQUEST: 'LOAD_DAU_REQUEST', 
  LOAD_DAU_SUCCESS: 'LOAD_DAU_SUCCESS', 
  LOAD_DAU_FAILURE: 'LOAD_DAU_FAILURE',

  LOAD_DAU_GEOMETRY_REQUEST: 'LOAD_DAU_GEOMETRY_REQUEST', 
  LOAD_DAU_GEOMETRY_SUCCESS: 'LOAD_DAU_GEOMETRY_SUCCESS', 
  LOAD_DAU_GEOMETRY_FAILURE: 'LOAD_DAU_GEOMETRY_FAILURE'
}


/**
 * Action Functions
 */
function loadGeometry(id, data) {
  return {
    types: [ACTIONS.LOAD_DAU_GEOMETRY_REQUEST, ACTIONS.LOAD_DAU_GEOMETRY_SUCCESS, ACTIONS.LOAD_DAU_GEOMETRY_FAILURE],
    shouldCallAPI: (state) => {
      return state.collections.dau.geometry.state === 'init';
    },
    callAPI: (callback) => { 
      services.loadGeometry(callback);
    },
    payload: { 
      id : id
    }
  }
}

function loadData(id, data) {
  return {
    types: [ACTIONS.LOAD_DAU_REQUEST, ACTIONS.LOAD_DAU_SUCCESS, ACTIONS.LOAD_DAU_FAILURE],
    shouldCallAPI: (state) => !state.collections.dau.byId[id],
    callAPI: (callback) => { 
      services.loadData(id, callback);
    },
    payload: { 
      id : id
    }
  }
}

function selectZone(id) {
  return {
    type : ACTIONS.SELECT_DAU_ZONE,
    id : id
  }
}


module.exports = {
  ACTIONS : ACTIONS,
  loadGeometry : loadGeometry,
  loadData : loadData,
  selectZone : selectZone
}