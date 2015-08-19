'use strict';

var ringBuffer = require('../lib/ring-buffer');
var grid = require('../lib/shared/cimis-grid');
var config;

module.exports = function() {
  config = global.config;
  ringBuffer.init(config);

  return {
      name: 'cimis',
      get : get,
      getByLatLng : getByLatLng
  };
};

function getByLatLng(lat, lng, callback) {
  var g = grid.llToGrid(lng, lat);
  get(g.row, g.col, callback);
}

function get(row, col, callback) {
  ringBuffer.read(row+'-'+col, function(err, data){
    if( err ) {
      return callback(err);
    }

    prepareGet(data, function(err, data){
      if( err ) {
        return callback(err);
      }

      row = parseInt(row);
      col = parseInt(col);

      var resp = {
        location : {
          row : row,
          col : col,
          bounds : grid.gridToBounds(row, col)
        },
        data : data
      };
      callback(null, resp);
    });
  });
}

function prepareGet(data, callback) {
  ringBuffer.read(config.get('ringBuffer').date_key, function(err, result){
    if( err ) {
      callback(err);
    }

    var resp = {};

    try {
      for( var i = 0; i < data.length; i++ ) {
        resp[result[i]] = JSON.parse(data[i]);
      }
    } catch(e) {
      callback(e);
    }

    callback(null, resp);
  });
}
