var BaseModel = require('@ucd-lib/cork-app-utils').BaseModel;
var AppStateStore = require('../stores/AppStateStore');

class AppStateModel extends BaseModel {

  constructor() {
    super();
    this.store = AppStateStore;
    this.register('AppStateModel');
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