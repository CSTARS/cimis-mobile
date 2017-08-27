var BaseStore = require('cork-app-utils').BaseStore;

class EtoZonesStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      geometry : {
        state : this.STATE.INIT
      },
      zoneGeometryById : {},
      byId : {}
    };

    this.events = {
      ETO_ZONES_GEOMETRY_UPDATE : 'eto-zones-geometry-update',
      ETO_ZONES_DATA_UPDATE : 'eto-zones-data-update'
    }
  }

  setGeometryLoading() {
    this._setGeometryState({
      state : this.STATE.LOADING
    });
  }

  setGeometryLoaded(payload) {
    payload.features.forEach((zone) => {
      this.data.zoneGeometryById[zone.properties.zone] = zone;
    });

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
    this.emit(this.events.ETO_ZONES_GEOMETRY_UPDATE, this.data.geometry);
  }

  setZoneLoading(id) {
    this._setZoneState({
      state : this.STATE.LOADING,
      id
    });
  }

  setZoneLoaded(id, payload) {
    this._setZoneState({
      state : this.STATE.LOADED,
      id, payload
    });
  }

  setZoneError(id, error) {
    this._setZoneState({
      state : this.STATE.ERROR,
      id, error
    });
  }

  _setZoneState(state) {
    this.data.byId[state.id] = state;
    this.emit(
      this.events.ETO_ZONES_GEOMETRY_UPDATE, 
      this.data.byId[state.id]
    );
  }

}

module.exports = new EtoZonesStore();