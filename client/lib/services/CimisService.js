var GoogleMaps = require('@google/maps');
var BaseService = require('cork-app-utils').BaseService;
var CimisStore = require('../stores/CimisStore');
var ConfigStore = require('../stores/ConfigStore');

class CimisService extends BaseService {
  
    constructor() {
      super();
      this.store = CimisStore;

    }

    getHost() {
      return ConfigStore.getHost();
    }

    async getDates() {
      var cached = this.store.data.dates;
      if( this.isLoaded(cached) ) return cached;

      this.store.setDatesLoading();

      return this.call({
        request : this.request.get(`${this.getHost()}/cimis/dates`),
        onError : this.store.setDatesError,
        onSuccess : this.store.setDatesLoaded
      });
    }

    async getData(cimisGridId) {
      var cached = this.store.data.byId[cimisGridId];
      if( this.isLoaded(cached) ) return cached;

      var urlId = cimisGridId.replace(/-/, '/');      
      this.store.setDataLoading(cimisGridId);
      
      return this.call({
        request : this.request.get(`${this.getHost()}/cimis/${urlId}`),
        onError : (error) => this.store.setDatesError(cimisGridId, error),
        onSuccess : (body) => this.store.setDataLoaded(cimisGridId, body)
      });
    }
}

module.exports = new CimisService();