'use strict';

var ringBuffer = require('../lib/ring-buffer');
var config = require('../config');
var CimisGridUtils = require('cimis-grid');
var grid = new CimisGridUtils();
var config;

module.exports = function() {
  ringBuffer.init(config);

  return {
      name: 'cimis',
      get : get,
      getByLatLng : getByLatLng,
      getDates : getDates,
      getRegion : getRegion
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

    prepareGet(data, false, function(err, data){
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

function getRegion(name, callback) {
  ringBuffer.read(name, function(err, data){
    if( err ) {
      return callback(err);
    }

    prepareGet(data, true, function(err, data){
      if( err ) {
        return callback(err);
      }

      var resp = {
        location : {
          name : name
        },
        data : data
      };
      callback(null, resp);
    });
  });
}

function getDates(callback) {
  ringBuffer.read(config.ringBuffer.date_key, callback);
}

function prepareGet(data, isRegion, callback) {
  getDates(function(err, result){
    if( err ) {
      callback(err);
    }

    var resp = {};

    try {
      for( var i = 0; i < data.length; i++ ) {
        resp[result[i]] = isRegion ? data[i] : JSON.parse(data[i]);
      }
    } catch(e) {
      callback(e);
    }

    callback(null, resp);
  });
}
