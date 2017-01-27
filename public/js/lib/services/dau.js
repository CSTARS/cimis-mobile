var request = require('superagent');
var actions = require('../redux/actions/collections/dau');
var dispatch = require('../redux/utils').dispatch;
var store = require('../redux/store');
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