var service = require('../../services/google');

/**
 * STATE ENUMs
 */
var ACTIONS = {
  SET_LOCATION : 'SET_LOCATION',

  GEOLOCATE_REQUEST : 'GEOLOCATE_REQUEST',
  GEOLOCATE_SUCCESS : 'GEOLOCATE_SUCCESS',
  GEOLOCATE_FAILURE : 'GEOLOCATE_FAILURE'
}


/**
 * Action Functions
 */
function geolocate(query) {
  return {
    types: [ACTIONS.GEOLOCATE_REQUEST, ACTIONS.GEOLOCATE_SUCCESS, ACTIONS.GEOLOCATE_FAILURE],
    shouldCallAPI: (state) => true,
    callAPI: (callback) => { 
      service.geocode(query, callback);
    },
    payload: {}
  }
}

function setLocation(location) {
  return {
    type : ACTIONS.SET_LOCATION,
    location : location
  }
}

module.exports = {
  ACTIONS : ACTIONS,
  setLocation : setLocation,
  geolocate : geolocate
}