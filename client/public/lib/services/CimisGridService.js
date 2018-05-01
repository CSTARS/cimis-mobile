const BaseService = require('@ucd-lib/cork-app-utils').BaseService;
const CimisGridStore = require('../stores/CimisGridStore');
const config = require('../config');

class CimisGridService extends BaseService {
  
    constructor() {
      super();
      this.store = CimisGridStore;
    }

    getDates() {
      return this.request({
        url : `${config.host}/cimis/dates`,
        checkCached : () => this.store.data.dates,
        onLoading : request => this.store.setDatesLoading(request),
        onError : e => this.store.setDatesError(e),
        onLoad : resp => this.store.setDatesLoaded(resp.body)
      });
    }

    getData(cimisGridId) {
      var urlId = cimisGridId.replace(/-/, '/');      

      return this.request({
        url : `${config.host}/cimis/${urlId}`,
        checkCached : () => this.store.data.byId[cimisGridId],
        onLoading : request => this.store.setDataLoading(cimisGridId, request),
        onError : (error) => this.store.setDatesError(cimisGridId, error),
        onLoad : resp => this.store.setDataLoaded(cimisGridId, resp.body)
      });
    }
}

module.exports = new CimisGridService();