module.exports = subclass =>
  
  class EtoZonesInterface extends subclass {
    constructor() {
      super();
      this._injectModel('EtoZonesModel');
    }

    _etoZonesEnabled() {
      return this.EtoZonesModel.enabled();
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