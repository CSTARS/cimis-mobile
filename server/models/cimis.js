'use strict';

const ringBuffer = require('../lib/ring-buffer');
const config = require('../config');
const CimisGridUtils = require('cimis-grid');


class CimisModel {

  constructor() {
    this.grid = new CimisGridUtils();
  }

  /**
   * @method get
   * @description get cimis grid data by row/col grid location
   * 
   * @param {Number} row 
   * @param {Number} col
   * 
   * @returns {Promise} resovle to grid data 
   */
  async get(row, col) {
    var data = await ringBuffer.read(row+'-'+col);
    data = await this._prepareGridData(data, false);
  
    row = parseInt(row);
    col = parseInt(col);
  
    return {
      location : {
        row : row,
        col : col,
        bounds : this.grid.gridToBounds(row, col)
      },
      data : data
    };
  }

  /**
   * @method getByLatLng
   * @description get cimis grid point by lat/lng
   * 
   * @param {Number} lat 
   * @param {Number} lng 
   * 
   * @returns {Promise} resolves to grid data
   */
  getByLatLng(lat, lng) {
    var g = this.grid.llToGrid(lng, lat);
    return this.get(g.row, g.col);
  }

  /**
   * @method getRegion
   * @description get region by name
   * 
   * @param {String} name region name
   * 
   * @returns {Promise} resolves to region data
   */
  async getRegion(name) {
    var data = await ringBuffer.read(name);
    data = await this._prepareGridData(data, true);

    return {
      location : {
        name : name
      },
      data : data
    };
  }

  /**
   * @method getStation
   * @description get station data by id
   * 
   * @param {String} id station id
   * 
   * @returns {Promise} resolves to station data
   */
  async getStation(id) {
    var data = await ringBuffer.read('ST'+id);
    
    var first = data.length > 0 ? JSON.parse(data[0]) : {};
    var location = {
      station : id,
      stationInfoApi : config.stationInfoApi+id,
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
    
    data = await this._prepareGridData(data, true);

    return {
      location : location,
      data : data
    };
  }

  /**
   * @method getDates
   * @description return current dates in the ring buffer
   * 
   * @returns {Promise} resolves to Array of strings
   */
  getDates() {
    return ringBuffer.read(config.ringBuffer.dateKey);
  }

  /**
   * @method getStations
   * @description return the current stations in the ring buffer
   * 
   * @returns {Promise} resolves to Array of objects
   */
  getStations() {
    return ringBuffer.getStations();
  }

  /**
   * @method _prepareGridData
   * @description prepare redis ring buffer response data
   * 
   * @param {Object} data ring buffer response object
   * @param {Boolean} isRegion is this a region object
   * 
   * @returns {Promise} resolves to Object
   */
  async _prepareGridData(data, isRegion) {
    var result = await this.getDates();
  
    var resp = {};
    for( var i = 0; i < data.length; i++ ) {
      resp[result[i]] = isRegion ? data[i] : JSON.parse(data[i]);
    }
  
    return resp;
  }

}

module.exports = new CimisModel();