var BaseStore = require('@ucd-lib/cork-app-utils').BaseStore;

class GeolocationStore extends BaseStore {

  constructor() {
    super();
    this.data = {
      geolocating : {},
      location : {}
    };

    this.events = {
      GEOLOCATION_SEARCH_UPDATE : 'geolocation-search-update',
      SELECTED_GEOLOCATION_UPDATE : 'selected-geolocation-update'
    }
  }

  setLoading(params) {
    this._setGeolocatingState({
      state : this.STATE.LOADING,
      params : params
    });
  }

  setLoaded(payload, params) {
    this._setGeolocatingState({
      state : this.STATE.LOADED,
      payload, params
    });
  }

  setError(error, params) {
    this._setGeolocatingState({
      state : this.STATE.ERROR,
      error, params
    });
  }

  _setGeolocatingState(state) {
    this.data.geolocating = state;
    this.emit(this.events.GEOLOCATION_SEARCH_UPDATE, state);
  }

  getState() {
    return this.data.geolocating;
  }

  setLocation(state) {
    this.data.location = state;
    this.emit(this.events.SELECTED_GEOLOCATION_UPDATE, state);
  }

}

module.exports = new GeolocationStore();