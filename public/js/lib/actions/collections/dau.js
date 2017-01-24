/**
 * STATE ENUMs
 */
var ACTIONS = {
  SET_DAU_GEOMETRY : 'SET_DAU_GEOMETRY',
  LOAD_DAU_GEOMETRY : 'LOAD_DAU_GEOMETRY',
  LOAD_DAU_GEOMETRY_ERROR : 'LOAD_DAU_GEOMETRY_ERROR'
}


/**
 * Action Functions
 */
function setDauGeometry(data) {
  return {
    type : ACTIONS.SET_DAU_GEOMETRY,
    data : data
  }
}

function loadDauGeometry(loading) {
  return {
    type : ACTIONS.LOAD_DAU_GEOMETRY,
    loading : loading
  }
}

function errorLoadingDauGeometry(hasError, errorMessage) {
  return {
    type : ACTIONS.LOAD_DAU_GEOMETRY_ERROR,
    hasError : hasError,
    errorMessage : errorMessage
  }
}


module.exports = {
  ACTIONS : ACTIONS,
  setDauData : setDauData,
  loadDauData : loadDauData,
  errorLoadingDauGeometry : errorLoadingDauGeometry
}