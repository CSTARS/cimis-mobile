var BaseModel = require('@ucd-lib/cork-app-utils').BaseModel;
var DauStore = require('../stores/DauStore');
var DauService = require('../services/DauService');

class DauModel extends BaseModel {

  constructor() {
    super();
    this.store = DauStore;
    this.service = DauService;
    this.register('DauModel');
  }

  getGeometry() {
    // pass model for access to util method
    return this.service.getGeometry(this);
  }

  getData(id) {
    return this.service.getData(id);
  }

}

module.exports = new DauModel();