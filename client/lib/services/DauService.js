var BaseService = require('cork-app-utils').BaseService;
var DauStore = require('../stores/DauStore');
var ConfigStore = require('../stores/ConfigStore');

class DauService extends BaseService {

  constructor() {
    super();
    this.store = DauStore;
  }

  getHost() {
    return ConfigStore.getHost();
  }

  async getGeometry(model) {
    return this.call({
      checkCached : () => this.store.data.geometry,
      request : this.request.get(`${this.getHost()}/dauco.json`),
      onLoading : request => this.store.setGeometryLoading(request),
      onError : e => this.store.setGeometryError(a),
      onSuccess : body => this.store.setGeometryLoaded(body)
    });
  }

  async getData(dauZoneId) {
    return this.call({
      checkCached : () => this.store.data.byId[dauZoneId],
      request : this.request.get(`${this.getHost()}/cimis/region/DAU${dauZoneId}`),
      onLoading : request => this.store.setDauLoading(request),
      onError : error => this.store.setDauError(dauZoneId, error),
      onSuccess : body => this.store.setDauLoaded(dauZoneId, body)
    });
  }

}

module.exports = new DauService();