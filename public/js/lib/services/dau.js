var request = require('superagent');
var actions = require('../actions/collections/dau');
var dispatch = require('../utils').dispatch;
var store = require('../store');

function loadGeometry(callback) {
  dispatch(actions.setGeometry, {state: 'loading'});

  request
    .get(`${getHost()}/dauco.json`)
    .end(function(err, resp) {
      if( err ) {
        dispatch(actions.setGeometry, {state: 'error', errorState: err});
      } else {
        dispatch(actions.setGeometry, {state: 'loaded', data: resp.body, errorState: null});
      }
      if( callback ) callback();
    });
}

function loadData(dauZoneId, callback) {
  dispatch(actions.setData, dauZoneId, {state: 'loading'});

  request
    .get(`${getHost()}/cimis/region/DAU${dauZoneId}`)
    .end(function(err, resp) {
      if( err ) {
        dispatch(actions.setData, dauZoneId, {state: 'error', errorState: err});
      } else {
        dispatch(actions.setData, dauZoneId, {state: 'loaded', data: resp.body, errorState: null});
      }
      if( callback ) callback();
    });
}


function getHost() {
  return store.getState().config.host;
}

module.exports = {
  loadGeometry : loadGeometry,
  loadData : loadData
}