var GoogleMaps = require('@google/maps');
var store = require('../redux/store');
var googleMapsClient;

function getClient() {
  if( !googleMapsClient ) {
    googleMapsClient = GoogleMaps.createClient({
      // cyclical dependency hack
      key: require('../redux/store').getState().config.googleMapsApiKey
    });
  }
  return googleMapsClient;
}

function geocode(query, callback) {
  query = {
    address: query+' California',
    bounds : {
      south: 31.116463,
      west: -125.649703,
      north: 42.279745,
      east: -113.838212
    }
  }

  getClient()
    .geocode(query, (error, resp) => {
      if (!error && resp && resp.status === 200) {
        callback(null, {body: resp.json.results});
      } else {
        callback({
          error : error || true,
          response : resp
        });
      }
    });
}

module.exports = {
  geocode : geocode
}