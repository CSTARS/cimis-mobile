var BaseModel = require('cork-app-utils').BaseModel;
var CimisGridStore = require('../stores/CimisStore');
var CimisGridService = require('../services/CimisService');
var CimisGrid = require('cimis-grid');

class CimisGridModel extends BaseModel {

  constructor() {
    super();
    this.store = CimisGridStore;
    this.service = CimisGridService;
    this.cimisGrid = new CimisGrid();
    this.registerIOC('CimisGridModel');
  }

  llToGrid(lng, lat) {
    return this.cimisGrid.llToGrid(lng, lat);
  }

  gridToBounds(row, col) {
    return this.cimisGrid.gridToBounds(row, col);
  }

  getDates() {
    return this.service.getDates();
  }

  getData(id) {
    return this.service.getData(id);
  }

}

module.exports = new CimisGridModel();