var BaseModel = require('cork-app-utils').BaseModel;
var CimisGridStore = require('../stores/CimisStore');
var CimisGridService = require('../services/CimisService');

class CimisGridModel extends BaseModel {

  constructor() {
    super();
    this.store = CimisGridStore;
    this.service = CimisGridService;
    this.registerIOC('CimisGridModel');
  }

  getDates() {
    return this.service.getDates();
  }

  getData(id) {
    return this.service.getData(id);
  }

}

module.exports = new CimisGridModel();