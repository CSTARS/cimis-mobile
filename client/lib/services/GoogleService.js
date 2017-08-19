var GoogleMaps = require('@google/maps');
var BaseService = require('cork-app-utils').BaseService;
var GeolocationStore = require('../stores/GeolocationStore');
var ConfigStore = require('../stores/ConfigStore');

class GoogleService extends BaseService {
  
    constructor() {
      super();
      this.store = GeolocationStore;

      this.googleMapsClient = GoogleMaps.createClient({
        key: ConfigStore.data.googleMapsApiKey
      });
    }

    geocode(query) {
      query = {
        address: query+' California',
        bounds : {
          south: 31.116463,
          west: -125.649703,
          north: 42.279745,
          east: -113.838212
        }
      }

      this.store.setLoading(query);

      return new Promise((resolve, reject) => {
        this.googleMapsClient
            .geocode(query, (error, resp) => {

              // succcess
              if (!error && resp && resp.status === 200) {
                this.store.setLoaded(resp.json.results, query);
                resolve(resp.json.results);

              // fail 
              } else {
                this.store.setError(error, query);
                reject(error);
              }
            });
      });
    }
}

module.exports = new GoogleService();