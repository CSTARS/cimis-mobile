module.exports = subclass =>
  class GeolocationInterface extends subclass {
    constructor() {
      super();
      this._injectModel('GeolocationModel');
    }

    _geolocate(query) {
      return this.GeolocationModel.geolocate(query);
    }

    _setGeolocation(location) {
      return this.GeolocationModel.setLocation(location);
    }
  }