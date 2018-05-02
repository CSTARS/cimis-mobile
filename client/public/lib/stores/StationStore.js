var BaseStore = require('@ucd-lib/cork-app-utils').BaseStore;

class StationStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      stations : {
        payload: APP_DATA.stations,
        state : this.STATE.LOADED
      },
      byId : {}
    }

    this.events = {
      STATIONS_UPDATE : 'stations-update',
      STATION_UPDATE : 'station-data-update'
    }
  }

  setStationsLoading(request) {
    this._setStationsState({
      state : this.STATE.LOADING,
      request
    });
  }

  setStationsLoaded(payload) {
    this._setStationsState({
      state : this.STATE.LOADED,
      payload
    })
  }

  setStationsError(error) {
    this._setStationsState({
      state : this.STATE.ERROR,
      error
    });
  }

  getStations() {
    return this.data.stations;
  }

  _setStationsState(state) {
    this.data.stations = state;
    this.emit(this.events.STATIONS_UPDATE, this.data.stations);
  }

  setDataLoading(id, request) {
    this._setDataState({
      state : this.STATE.LOADING,
      id, request
    });
  }

  setDataLoaded(id, payload) {
    this._setDataState({
      state : this.STATE.LOADED,
      payload, id
    })
  }

  setDataError(id, error) {
    this._setDataState({
      state : this.STATE.ERROR,
      id, error
    });
  }

  _setDataState(state) {
    this.data.byId[state.id] = state;
    this.emit(this.events.STATION_UPDATE, this.data.byId[state.id]);
  }

}

module.exports = new StationStore();