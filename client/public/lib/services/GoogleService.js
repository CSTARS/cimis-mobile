const BaseService = require('@ucd-lib/cork-app-utils').BaseService;
const GeolocationStore = require('../stores/GeolocationStore');

class GoogleService extends BaseService {
  
    constructor() {
      super();
      this.store = GeolocationStore;

      if( typeof google === 'undefined' ) return;
      this.geocoder = new google.maps.Geocoder();      
    }

    geocode(query) {
      if( typeof google === 'undefined' ) {
        return console.warn('Geocoding is currenlty only supported in browser env');
      }

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
        this.geocoder.geocode(query, (results, status) => {
          // succcess
          if (status == 'OK') {
            this.store.setLoaded(results, query);
            resolve(results);

          // fail 
          } else {
            this.store.setError('Failed to geocode: '+status, query);
            reject(error);
          }
        });
      });
    }
}

module.exports = new GoogleService();