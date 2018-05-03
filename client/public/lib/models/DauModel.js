var BaseModel = require('@ucd-lib/cork-app-utils').BaseModel;
var DauStore = require('../stores/DauStore');
var DauService = require('../services/DauService');

class DauModel extends BaseModel {

  constructor() {
    super();
    this.store = DauStore;
    this.service = DauService;

    this.getGeometry();

    this.register('DauModel');
  }

  async getGeometry() {
    // pass model for access to util method
    await this.service.getGeometry(this);
    return this.store.data.geometry;
  }

  async getData(id) {
    await this.service.getData(id);
    return this.store.data.byId[id];
  }

}

module.exports = new DauModel();