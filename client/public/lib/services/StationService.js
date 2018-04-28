var BaseService = require('@ucd-lib/cork-app-utils').BaseService;
var StationStore = require('../stores/StationStore');
var config = require('../config');

class StationService extends BaseService {
  
    constructor() {
      super();
      this.store = StationStore;
    }

    getStations() {
      return this.request({
        url : `${config.host}/cimis/stations`,
        checkCached : () => this.store.data.stations,
        onLoading : request => this.store.setStationsLoading(request),
        onError : e => this.store.setStationsError(e),
        onSuccess : payload => this.store.setStationsLoaded(payload)
      });
    }

    getData(stationId) {
      return this.request({
        url : `${config.host}/cimis/station/${stationId}`,
        checkCached : () => this.store.data.byId[stationId],
        onLoading : request => this.store.setDataLoading(stationId, request),
        onError : (error) => this.store.setDatesError(stationId, error),
        onSuccess : (body) => this.store.setDataLoaded(stationId, body)
      });
    }
}

module.exports = new StationService();