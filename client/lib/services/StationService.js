var BaseService = require('cork-app-utils').BaseService;
var StationStore = require('../stores/StationStore');
var ConfigStore = require('../stores/ConfigStore');

class StationService extends BaseService {
  
    constructor() {
      super();
      this.store = StationStore;
    }

    getHost() {
      return ConfigStore.getHost();
    }

    async getStations() {
      return this.call({
        checkCached : () => this.store.data.stations,
        request : this.request.get(`${this.getHost()}/cimis/stations`),
        onLoading : request => this.store.setStationsLoading(request),
        onError : e => this.store.setStationsError(e),
        onSuccess : payload => this.store.setStationsLoaded(payload)
      });
    }

    async getData(stationId) {
      return this.call({
        checkCached : () => this.store.data.byId[stationId],
        request : this.request.get(`${this.getHost()}/cimis/station/${stationId}`),
        onLoading : request => this.store.setDataLoading(stationId, request),
        onError : (error) => this.store.setDatesError(stationId, error),
        onSuccess : (body) => this.store.setDataLoaded(stationId, body)
      });
    }
}

module.exports = new StationService();