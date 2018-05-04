var BaseModel = require('@ucd-lib/cork-app-utils').BaseModel;
var AppStateStore = require('../stores/AppStateStore');

class AppStateModel extends BaseModel {

  constructor() {
    super();
    this.store = AppStateStore;
    this._init();
    this.register('AppStateModel');
  }

  /**
   * @method _init
   * @description wait for google charts before we startup
   */
  _init() {
    if( typeof google === 'undefined' ) return;

    if( google.visualization && google.visualization.LineChart ) {
      this._initWindowListeners();
    } else {
      google.charts.setOnLoadCallback(() => this._initWindowListeners());
    }
  } 

  /**
   * @method _initWindowListeners
   * @description once google charts is loaded setup window state listeners
   */
  _initWindowListeners() {
    if( typeof window === 'undefined' ) return;
    this._parseWindowState();
    window.addEventListener('hashchange', () => this._parseWindowState());
  }

  /**
   * @method _parseWindowState
   * @description parse the current window hash and set app state
   */
  _parseWindowState() {
    var parts = window.location.hash.replace(/#/,'').split('/');
    
    var state = {
      section : 'map'
    };

    if( parts.length > 0 && parts[0] ) {
      state.section = parts.splice(0, 1)[0];
    }

    if( parts.length > 0 && parts[0]) {
      if( state.section === 'map' || state.section === 'data' ) {
        state.mapState = parts.splice(0, 1)[0];
      }
    }

    if( parts.length > 0 ) {
      if( state.mapState === 'cimisGrid' ) {
        state.selectedCimisLocation = parts[0];
      } else if( state.mapState === 'etoZones' ) {
        state.selectedEtoZoneLocation = parts[0];
      } else if( state.mapState === 'dauZones' ) {
        state.selectedDauLocation = parts[0];
      } else if( state.mapState === 'cimisStations' ) {
        state.selectedStation = parts[0];
      }
    }

    if( parts.length > 0 && parts[0]) {
      state.extras = parts;
    }

    if( state.section === 'map' && !state.mapState ) {
      state.mapState = 'cimisGrid'
    }


    this.set(state);
  }


  /**
   * @method get
   * @description get the application state object
   * 
   * @returns {Object}
   */
  get() {
    return this.store.data;
  }

  /**
   * @method set
   * @description set the application state object.  This
   * object is always a update of the state.  So only provided
   * parameters will be updated
   * 
   * @param {Object} update key/values to update in app state
   * 
   * @returns {Object} current app state
   */
  set(update) {
    this.store.set(update);
    return this.get();
  }
}

module.exports = new AppStateModel();