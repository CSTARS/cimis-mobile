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
      return this.call({
        checkCached : () => this.store.data.dates,
        request : this.request.get(`${this.getHost()}/cimis/dates`),
        onLoading : request => this.store.setDatesLoading(request),
        onError : e => this.store.setDatesError(e),
        onSuccess : payload => this.store.setDatesLoaded(payload)
      });
    }

    async getData(cimisGridId) {
      var urlId = cimisGridId.replace(/-/, '/');      

      return this.call({
        checkCached : () => this.store.data.byId[cimisGridId],
        request : this.request.get(`${this.getHost()}/cimis/${urlId}`),
        onLoading : request => this.store.setDataLoading(cimisGridId, request),
        onError : (error) => this.store.setDatesError(cimisGridId, error),
        onSuccess : (body) => this.store.setDataLoaded(cimisGridId, body)
      });
    }
}

module.exports = new CimisService();