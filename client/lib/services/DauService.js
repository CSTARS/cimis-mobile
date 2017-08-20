var BaseService = require('cork-app-utils').BaseService;
var DauStore = require('../stores/DauStore');
var ConfigStore = require('../stores/ConfigStore');

class DauService extends BaseService {

  constructor() {
    super();
    this.store = EtoZonesStore;
  }

  getHost() {
    return this.ConfigStore.getHost();
  }

  async getGeometry(model) {
    var cached = this.store.data.geometry;
    if( this.isLoaded(cached) ) return cached;

    this.store.setGeometryLoading();

    return this.call({
      request : this.request.get(`${this.getHost()}/dauco.json`),
      onError : this.store.setGeometryError,
      onSuccess : body => this.store.setGeometryLoaded(body)
    });
  }

  async getData(etoZoneId) {
    var cached = this.store.data.byId[etoZoneId];
    if( this.isLoaded(cached) ) return cached;

    this.store.setZoneLoading();

    return this.call({
      request : this.request.get(`${this.getHost()}/cimis/region/DAU${dauZoneId}`),
      onError : error => this.store.setDauError(etoZoneId, error),
      onSuccess : body => this.store.setDauLoaded(etoZoneId, body)
    });
  }

}

module.exports = new DauService();