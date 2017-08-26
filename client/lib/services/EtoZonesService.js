var BaseService = require('cork-app-utils').BaseService;
var EtoZonesStore = require('../stores/EtoZonesStore');
var ConfigStore = require('../stores/ConfigStore');

class EtoZonesService extends BaseService {

  constructor() {
    super();
    this.store = EtoZonesStore;
  }

  getHost() {
    return ConfigStore.getHost();
  }

  async getGeometry(model) {
    var cached = this.store.data.geometry;
    if( this.isLoaded(cached) ) return cached;

    this.store.setGeometryLoading();

    return this.call({
      request : this.request.get(`${this.getHost()}/eto_zones.json`),
      onError : this.store.setGeometryError,
      onSuccess : (body) => {
        model.mergeZoneMap(body);
        this.store.setGeometryLoaded(body);
      }
    });
  }

  async getData(etoZoneId) {
    var cached = this.store.data.byId[etoZoneId];
    if( this.isLoaded(cached) ) return cached;

    this.store.setZoneLoading();

    return this.call({
      request : this.request.get(`${this.getHost()}/cimis/region/Z${etoZoneId}`),
      onError : error => this.store.setZoneError(etoZoneId, error),
      onSuccess : body => this.store.setZoneLoaded(etoZoneId, body)
    });
  }

}

module.exports = new EtoZonesService();