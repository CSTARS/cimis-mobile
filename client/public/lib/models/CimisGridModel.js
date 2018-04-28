var BaseModel = require('@ucd-lib/cork-app-utils').BaseModel;
var CimisGridStore = require('../stores/CimisGridStore');
var CimisGridService = require('../services/CimisGridService');
var CimisGridUtils = require('cimis-grid');

class CimisGridModel extends BaseModel {

  constructor() {
    super();
    this.store = CimisGridStore;
    this.service = CimisGridService;
    this.utils = new CimisGridUtils();
    this.register('CimisGridModel');
  }

  llToGrid(lng, lat) {
    return this.utils.llToGrid(lng, lat);
  }

  gridToBounds(row, col) {
    return this.utils.gridToBounds(row, col);
  }

  getDates() {
    return this.service.getDates();
  }

  getData(id) {
    return this.service.getData(id);
  }

}

module.exports = new CimisGridModel();