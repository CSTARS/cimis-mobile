var BaseModel = require('cork-app-utils').BaseModel;
var DauStore = require('../stores/DauStore');
var DauService = require('../services/DauService');
var styles = require('./styles');

class DauModel extends BaseModel {

  constructor() {
    super();
    this.store = DauStore;
    this.service = DauService;
    this.registerIOC('DauModel');
  }

  getStyles() {
    return styles;
  }

  getGeometry() {
    // pass model for access to util method
    return this.service.getGeometry(this);
  }

  getData(id) {
    return this.service.getDauData(id);
  }

}

module.exports = new DauModel();