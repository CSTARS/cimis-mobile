var BaseStore = require('cork-app-utils').BaseStore;

class AppStateStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      // current page
      section : '',
      
      // current map view
      mapState : '',

      // selected location
      selectedCimisLocation : '',
      selectedDauLocation : '',
      selectedEtoZoneLocation : '',

      extras : [],

      MAP_STATES : {
        CIMIS_GRID : 'cimisGrid',
        ETO_ZONES : 'etoZones',
        DAU_ZONES : 'dauZones',
        CIMIS_STATIONS : 'cimisStations'
      },

      APP_SECTIONS : {
        MAP : 'map',
        DATA : 'data',
        ABOUT : 'about',
        INSTALL : 'install',
        survey : 'survey'
      }
    }

    this.events = {
      APP_STATE_UPDATE : 'app-state-update'
    }
  }

  set(state) {
    this.data = Object.assign({}, this.data, state);
    this.emit(this.events.APP_STATE_UPDATE, this.data);
  }

}

module.exports = new AppStateStore();