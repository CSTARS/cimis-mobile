var BaseStore = require('cork-app-utils').BaseStore;

class AppStateStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      dates : {
        state : this.STATE.INIT
      },
      byId : {}
    }

    this.events = {
      CIMIS_DATES_UPDATE : 'cimis-dates-update',
      CIMIS_DATA_UPDATE : 'cimis-data-update'
    }
  }

  setDatesLoading() {
    this._setDatesState({
      state : this.STATE.LOADING
    });
  }

  setDatesLoaded(payload) {
    this._setDatesState({
      state : this.STATE.LOADED,
      payload
    })
  }

  setDatesError(error) {
    this._setDatesState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setDatesState(state) {
    this.data.dates = state;
    this.emit(this.events.CIMIS_DATES_UPDATE, this.data);
  }

  setDataLoading(id) {
    this._setDataState({
      state : this.STATE.LOADING,
      id
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
    this.emit(this.events.CIMIS_DATA_UPDATE, this.data.byId[state.id]);
  }

}

module.exports = new AppStateStore();