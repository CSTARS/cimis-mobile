var services = require('../../../services/etoZones');

/**
 * STATE ENUMs
 */
var ACTIONS = {
  SELECT_ETO_ZONE : 'SELECT_ETO_ZONE',

  LOAD_ETO_REQUEST: 'LOAD_ETO_REQUEST', 
  LOAD_ETO_SUCCESS: 'LOAD_ETO_SUCCESS', 
  LOAD_ETO_FAILURE: 'LOAD_ETO_FAILURE',

  LOAD_ETO_GEOMETRY_REQUEST: 'LOAD_ETO_GEOMETRY_REQUEST', 
  LOAD_ETO_GEOMETRY_SUCCESS: 'LOAD_ETO_GEOMETRY_SUCCESS', 
  LOAD_ETO_GEOMETRY_FAILURE: 'LOAD_ETO_GEOMETRY_FAILURE'
}


/**
 * Action Functions
 */
function loadGeometry(id, data) {
  return {
    types: [ACTIONS.LOAD_ETO_GEOMETRY_REQUEST, ACTIONS.LOAD_ETO_GEOMETRY_SUCCESS, ACTIONS.LOAD_ETO_GEOMETRY_FAILURE],
    shouldCallAPI: (state) => {
      return state.collections.etoZones.geometry.state === 'init';
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
    types: [ACTIONS.LOAD_ETO_REQUEST, ACTIONS.LOAD_ETO_SUCCESS, ACTIONS.LOAD_ETO_FAILURE],
    shouldCallAPI: (state) => !state.collections.etoZones.byId[id],
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
    type : ACTIONS.SELECT_ETO_ZONE,
    id : id
  }
}


module.exports = {
  ACTIONS : ACTIONS,
  loadGeometry : loadGeometry,
  loadData : loadData,
  selectZone : selectZone
}