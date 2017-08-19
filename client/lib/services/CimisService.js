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
      return this.ConfigStore.getHost();
    }

    async getDates() {
      // todo: make a helper for this?
      if( this.cached(this.store.data.dates) ) {
        return this.store.data.dates;
      }

      this.store.setDatesLoading();

      return this.call({
        request : this.request.get(`${this.getHost()}/cimis/dates`),
        onError : this.store.setDatesError,
        onSuccess : this.store.setDatesLoaded
      });
    }

    async getData(cimisGridId) {
      if( this.cached(this.store.data.byId[cimisGridId]) ) {
        return this.store.data.byId[cimisGridId];
      }

      var urlId = cimisGridId.replace(/-/, '/');      
      this.store.setDataLoading(cimisGridId);
      
      return this.call({
        request : this.request.get(`${getHost()}/cimis/${urlId}`),
        onError : (error) => this.store.setDatesError(cimisGridId, error),
        onSuccess : (body) => this.store.setDataLoaded(cimisGridId, body)
      });
    }

    cached(object) {
      if( object && object.state === this.store.STATE.LOADED ) {
        return true;
      }
      return false;
    }


}

module.exports = new CimisService();