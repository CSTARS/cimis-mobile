const BaseService = require('@ucd-lib/cork-app-utils').BaseService;
const EtoZonesStore = require('../stores/EtoZonesStore');
const config = require('../config');

class EtoZonesService extends BaseService {

  constructor() {
    super();
    this.store = EtoZonesStore;
  }

  getGeometry(model) {
    return this.request({
      url : `${config.host}/eto_zones.json`,
      checkCached : () => this.store.data.geometry,
      onLoading : request => this.store.setGeometryLoading(request),
      onError : e => this.store.setGeometryError(e),
      onSuccess : (body) => {
        model.mergeZoneMap(body);
        this.store.setGeometryLoaded(body);
      }
    });
  }

  getData(etoZoneId) {
    return this.request({
      url : `${config.host}/cimis/region/Z${etoZoneId}`,
      checkCached : () => this.store.data.byId[etoZoneId],
      onLoading : request => this.store.setZoneLoading(etoZoneId, request),
      onError : error => this.store.setZoneError(etoZoneId, error),
      onSuccess : body => this.store.setZoneLoaded(etoZoneId, body)
    });
  }

}

module.exports = new EtoZonesService();