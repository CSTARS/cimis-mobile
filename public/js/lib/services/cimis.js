var request = require('superagent');
var actions = require('../redux/actions/collections/cimis');
var dispatch = require('../redux/utils').dispatch;
var store = require('../redux/store');

function loadDates(callback) {
  dispatch(actions.setDates, {state: 'loading'});

  request
    .get(`${getHost()}/cimis/dates`)
    .end(function(err, resp) {
      if( err ) {
        dispatch(actions.setDates, {state: 'error', errorState: err});
      } else {
        dispatch(actions.setDates, {state: 'loaded', data: resp.body, errorState: null});
      }
      if( callback ) callback();
    });
}

function loadData(cimisGridId, callback) {
  var data = store.getState().collections.cimis.byId[cimisGridId];
  if( data && data.state !== 'error' ) {
    return;
  }

  dispatch(actions.setData, cimisGridId, {state: 'loading'});

  var urlId = cimisGridId.replace(/-/, '/');

  request
    .get(`${getHost()}/cimis/${urlId}`)
    .end(function(err, resp) {
      if( err ) {
        dispatch(actions.setData, cimisGridId, {state: 'error', errorState: err});
      } else {
        dispatch(actions.setData, cimisGridId, {state: 'loaded', data: resp.body, errorState: null});
      }
      if( callback ) callback();
    });
}


function getHost() {
  return store.getState().config.host;
}

module.exports = {
  loadDates : loadDates,
  loadData : loadData
}