/**
 * STATE ENUMs
 */
var ACTIONS = {
  SET_DAU_GEOMETRY : 'SET_DAU_GEOMETRY',
  SET_DAU_DATA : 'SET_DAU_DATA',
  SELECT_DAU_ZONE : 'SELECT_DAU_ZONE'
}


/**
 * Action Functions
 */
function setGeometry(data) {
  return {
    type : ACTIONS.SET_DAU_GEOMETRY,
    data : data
  }
}

function setData(id, data) {
  data.id = id;
  
  return {
    type : ACTIONS.SET_DAU_DATA,
    id : id,
    data : data
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
  setGeometry : setGeometry,
  setData : setData,
  selectZone : selectZone
}