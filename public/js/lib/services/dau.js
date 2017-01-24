var request = require('superagent');
var actions = require('../actions/collections/dau');
var store = require('../store');

function loadGeometry(callback) {

  actions.loadDauData(true);

  request
    .get(`${getHost()}/dauco.json`)
    .end(function(err, resp) {
      actions.loadDauGeometry(false);

      if( err ) {
        actions.errorLoadingDauGeometry(true, err);
      } else {
        actions.setDauGeometry(resp.body);
      }
    });
}

function getHost() {
  return store.getState().config.host;
}

module.exports = {
  loadGeometry : loadGeometry
}