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
    return this.call({
      checkCached : () => this.store.data.geometry,
      request : this.request.get(`${this.getHost()}/eto_zones.json`),
      onLoading : request => this.store.setGeometryLoading(request),
      onError : e => this.store.setGeometryError(e),
      onSuccess : (body) => {
        model.mergeZoneMap(body);
        this.store.setGeometryLoaded(body);
      }
    });
  }

  async getData(etoZoneId) {
    return this.call({
      checkCached : () => this.store.data.byId[etoZoneId],
      request : this.request.get(`${this.getHost()}/cimis/region/Z${etoZoneId}`),
      onLoading : request => this.store.setZoneLoading(etoZoneId, request),
      onError : error => this.store.setZoneError(etoZoneId, error),
      onSuccess : body => this.store.setZoneLoaded(etoZoneId, body)
    });
  }

}

module.exports = new EtoZonesService();