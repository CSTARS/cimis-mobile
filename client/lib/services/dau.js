var request = require('superagent');
var getHost = require('./utils').getHost;

function loadGeometry(callback) {
  request
    .get(`${getHost()}/dauco.json`)
    .end(callback);
}

function loadData(dauZoneId, callback) {
  request
    .get(`${getHost()}/cimis/region/DAU${dauZoneId}`)
    .end(callback);
}

module.exports = {
  loadGeometry : loadGeometry,
  loadData : loadData
}