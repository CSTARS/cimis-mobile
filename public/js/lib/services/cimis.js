var request = require('superagent');
var actions = require('../redux/actions/collections/cimis');
var dispatch = require('../redux/utils').dispatch;
var store = require('../redux/store');

function loadDates(callback) {
  request
    .get(`${getHost()}/cimis/dates`)
    .end(callback);
}

function loadData(cimisGridId, callback) {
  var urlId = cimisGridId.replace(/-/, '/');

  request
    .get(`${getHost()}/cimis/${urlId}`)
    .end(callback);
}

function getHost() {
  // HACK for cyclical dependency
  return require('../redux/store').getState().config.host;
}

module.exports = {
  loadDates : loadDates,
  loadData : loadData
}