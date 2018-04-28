module.exports = subclass =>
  
  class EtoZonesInterface extends subclass {
    constructor() {
      super();
      this._injectModel('EtoZonesModel');
    }

    _getEtoZonesGeometry() {
      return this.EtoZonesModel.getGeometry();
    }

    _getEtoZoneGeometry(id) {
      return this.EtoZonesModel.getZoneGeometry(id);
    }

    _getEtoZoneData(id) {
      return this.EtoZonesModel.getZoneData(id);
    }
  }