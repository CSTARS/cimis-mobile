const BaseModel = require('@ucd-lib/cork-app-utils').BaseModel;
const GeolocationStore = require('../stores/GeolocationStore');
const GoogleService = require('../services/GoogleService');

class GeolocationModel extends BaseModel {

  constructor() {
    super();
    this.store = GeolocationStore;
    this.service = GoogleService;
    this.register('GeolocationModel');
  }

  get() {
    return this.store.data;
  }

  geolocate(query) {
    return this.service.geocode(query);
  }

  setLocation(location) {
    this.store.setLocation(location);
  }
}

module.exports = new GeolocationModel();