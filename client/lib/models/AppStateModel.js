var BaseModel = require('cork-app-utils').BaseModel;
var AppStateStore = require('../stores/AppStateStore');

class AppStateModel extends BaseModel {

  constructor() {
    super();
    this.store = AppStateStore;
    this.registerIOC('AppStateModel');
  }

  async get() {
    return this.store.data;
  }

  set(update) {
    this.store.set(update);
    return this.get();
  }
}

module.exports = new AppStateModel();