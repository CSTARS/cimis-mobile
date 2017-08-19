var BaseModel = require('cork-app-utils').BaseModel;
var GeolocationStore = require('../stores/GeolocationStore');
var GoogleService = require('../stores/GoogleService');

class GeolocationModel extends BaseModel {

  constructor() {
    super();
    this.store = GeolocationStore;
    this.service = GoogleService;
    this.registerIOC('GeolocationModel');
  }

  get() {
    return this.store.data;
  }

  geolocate(query) {
    return this.service.geolocate(query);
  }
}

module.exports = new AppStateModel();