var BaseStore = require('cork-app-utils').BaseStore;

class DauStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      geometry : {
        state : this.STATE.INIT
      },
      byId : {}
    };

    this.events = {
      ETO_DAU_GEOMETRY_UPDATE : 'dau-geometry-update',
      ETO_DAU_DATA_UPDATE : 'dau-data-update'
    }
  }

  setGeometryLoading(request) {
    this._setGeometryState({
      state : this.STATE.LOADING,
      request
    });
  }

  setGeometryLoaded(payload) {
    this._setGeometryState({
      state : this.STATE.LOADED,
      payload
    });
  }

  setGeometryError(error) {
    this._setGeometryState({
      state : this.STATE.ERROR
    });
  }

  _setGeometryState(state) {
    this.data.geometry = state;
    this.emit(this.events.ETO_DAU_GEOMETRY_UPDATE, this.data.geometry);
  }

  setDauLoading(id, request) {
    this._setDauState({
      state : this.STATE.LOADING,
      id, request
    });
  }

  setDauLoaded(id, payload) {
    this._setDauState({
      state : this.STATE.LOADED,
      id, payload
    });
  }

  setDauError(id, error) {
    this._setDauState({
      state : this.STATE.ERROR,
      id, error
    });
  }

  _setDauState(state) {
    this.data.byId[state.id] = state;
    this.emit(
      this.events.ETO_DAU_DATA_UPDATE, 
      this.data.byId[state.id]
    );
  }

}

module.exports = new DauStore();