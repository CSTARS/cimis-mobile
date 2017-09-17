'use strict';

var ringBuffer = require('../lib/ring-buffer');
var config = require('../config');
var CimisGridUtils = require('cimis-grid');
var grid = new CimisGridUtils();
var config;

module.exports = function() {
  return {
      name: 'cimis',
      get : get,
      getByLatLng : getByLatLng,
      getDates : getDates,
      getStations : getStations,
      getStation : getStation,
      getRegion : getRegion
  };
};

async function getByLatLng(lat, lng) {
  var g = grid.llToGrid(lng, lat);
  return await get(g.row, g.col);
}

async function get(row, col) {
  var data = await ringBuffer.read(row+'-'+col);
  data = await prepareGet(data, false);

  row = parseInt(row);
  col = parseInt(col);

  return {
    location : {
      row : row,
      col : col,
      bounds : grid.gridToBounds(row, col)
    },
    data : data
  };
}

async function getRegion(name, callback) {
  try {
    var data = ringBuffer.read(name);
    data = await prepareGet(data, true);

    return {
      location : {
        name : name
      },
      data : data
    };
  } catch(e) {
    return e;
  }
}

async function getDates() {
  return await ringBuffer.read(config.ringBuffer.dateKey);
}

async function getStation(id) {
  try {
    var data = await ringBuffer.read('ST'+id);
    
    var first = data.length > 0 ? JSON.parse(data[0]) : {};
    var location = {
      station : id,
      stationInfoApi : 'http://et.water.ca.gov/api/station/'+id,
      x: first.x,
      y: first.y,
      z: parseFloat(first.z),
      lat : first.lat,
      lng : first.lng
    }

    var clean = ['x','y','z','lat','lng','station_id','date'];
    data = data.map((item) => {
      item = JSON.parse(item);
      clean.forEach((del) => {
        if( item[del] ) delete item[del];
      });

      for( var key in item ) {
        if( !key.match(/_qc$/) ) {
          item[key] = parseFloat(item[key]);
        }
      }

      return item;
    });
    
    data = await prepareGet(data, true);

    return {
      location : location,
      data : data
    };
  } catch(e) {
    return e;
  }
}

async function getStations() {
  return await ringBuffer.getStations();
}

async function prepareGet(data, isRegion) {
  var result = await getDates();

  var resp = {};

  try {
    for( var i = 0; i < data.length; i++ ) {
      resp[result[i]] = isRegion ? data[i] : JSON.parse(data[i]);
    }
  } catch(e) {
    return e;
  }

  return resp;
}
