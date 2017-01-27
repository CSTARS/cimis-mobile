var request = require('superagent');
var etoZoneUtils = require('../eto-zones');
var getHost = require('./utils').getHost;


function loadGeometry(callback) {
  request
    .get(`${getHost()}/eto_zones.json`)
    .end(function(err, resp){
      if( err ) return callback(err);

      // merge in zone styles
      etoZoneUtils.mergeZoneMap(resp.body);
      
      callback(null, resp);
    });
}

function loadData(etoZoneId, callback) {
  request
    .get(`${getHost()}/cimis/region/Z${etoZoneId}`)
    .end(callback);
}

module.exports = {
  loadGeometry : loadGeometry,
  loadData : loadData
}