module.exports = subclass => 
  class AuthInterface extends subclass {
    constructor() {
      super();
      this._injectModel('AppStateModel');
    }

    _setAppState(state) {
      this.AppStateModel.set(state);
    }

    _getAppState() {
      return this.AppStateModel.get();
    }
 
  }