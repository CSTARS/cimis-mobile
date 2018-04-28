module.exports = subclass =>

  class DauInterface extends subclass {
    constructor() {
      super();
      this._injectModel('DauModel');
    }

    _getDauGeometry() {
      return this.DauModel.getGeometry();
    }

    _getDauData(id) {
      return this.DauModel.getData(id);
    }
  }
