/**
 * STATE ENUMs
 */
var ACTIONS = {
  SET_CIMIS_DATES : 'SET_CIMIS_DATES',
  SET_CIMIS_DATA : 'SET_CIMIS_DATA',
  SELECT_CIMIS_GRID_LOCATION : 'SELECT_CIMIS_GRID_LOCATION'
}

/**
 * Action Functions
 */
function setDates(data) {
  return {
    type : ACTIONS.SET_CIMIS_DATES,
    data : data
  }
}

function setData(id, data) {
  return {
    type : ACTIONS.SET_CIMIS_DATA,
    id : id,
    data : data
  }
}

function select(id) {
  return {
    type : ACTIONS.SELECT_CIMIS_GRID_LOCATION,
    id : id
  }
}

module.exports = {
  ACTIONS : ACTIONS,
  setDates: setDates,
  setData : setData,
  select : select
}