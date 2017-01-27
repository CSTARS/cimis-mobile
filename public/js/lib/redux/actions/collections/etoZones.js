/**
 * STATE ENUMs
 */
var ACTIONS = {
  SET_ETO_ZONE_GEOMETRY : 'SET_ETO_ZONE_GEOMETRY',
  SET_ETO_ZONE_DATA : 'SET_ETO_ZONE_DATA',
  SELECT_ETO_ZONE_ZONE : 'SELECT_ETO_ZONE_ZONE'
}


/**
 * Action Functions
 */
function setGeometry(data) {
  return {
    type : ACTIONS.SET_ETO_ZONE_GEOMETRY,
    data : data
  }
}

function setData(id, data) {
  data.id = id;
  
  return {
    type : ACTIONS.SET_ETO_ZONE_DATA,
    id : id,
    data : data
  }
}

function selectZone(id) {
  return {
    type : ACTIONS.SELECT_ETO_ZONE_ZONE,
    id : id
  }
}


module.exports = {
  ACTIONS : ACTIONS,
  setGeometry : setGeometry,
  setData : setData,
  selectZone : selectZone
}