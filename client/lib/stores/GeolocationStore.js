var BaseStore = require('cork-app-utils').BaseStore;

class GeolocationStore extends BaseStore {

  constructor() {
    super();
    this.data = {};

    this.events = {
      GEOLOCATION_SEARCH_UPDATE : 'geolocation-search-update'
    }
  }

  setLoading(params) {
    this._setState({
      state : this.STATE.LOADING,
      params : params
    });
  }

  setLoaded(payload, params) {
    this._setState({
      state : this.STATE.LOADED,
      payload, params
    });
  }

  setError(error, params) {
    this._setState({
      state : this.STATE.ERROR,
      error, params
    });
  }

  _setState(state) {
    this.data = state;
    this.emit(this.events.GEOLOCATION_SEARCH_UPDATE, this.data);
  }

  getState() {
    return this.data
  }

}

module.exports = new GeolocationStore();