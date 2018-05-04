var BaseModel = require('@ucd-lib/cork-app-utils').BaseModel;
var StationStore = require('../stores/StationStore');
var StationService = require('../services/StationService');
var AppUtils = require('../utils');

class StationModel extends BaseModel {

  constructor() {
    super();
    this.store = StationStore;
    this.service = StationService;

    this.register('StationModel');
  }

  async getStations() {
    await this.service.getStations();
    return this.store.getStations();
  }

  async getData(id) {
    await this.service.getData(id)
    return this.store.data.byId[id];
  }

  async getChartData(id) {
    var station = await this.getData(id);
    
    return charts;
  }

}

module.exports = new StationModel();