var BaseModel = require('@ucd-lib/cork-app-utils').BaseModel;
var EtoZonesStore = require('../stores/EtoZonesStore');
var EtoZonesService = require('../services/EtoZonesService');
var styles = require('../config').etoZones.styles;

class EtoZonesModel extends BaseModel {

  constructor() {
    super();
    this.store = EtoZonesStore;
    this.service = EtoZonesService;

    if( this.enabled() ) {
      this.getGeometry(); // start loading geometry
    }

    this.register('EtoZonesModel');
  }

  getStyles() {
    return styles;
  }

  enabled() {
    return this.store.data.enabled;
  }

  async getGeometry() {
    // pass model for access to util method
    await this.service.getGeometry(this);
    return this.store.data.geometry;
  }

  getZoneGeometry(id) {
    id = parseInt(id);
    return this.store.data.zoneGeometryById[id];
  }

  async getZoneData(id) {
    await this.service.getData(id);
    return this.store.data.byId[id];
  }


  // util method
  mergeZoneMap(geojson) {
    geojson.features.forEach((feature, index) => {
      var zoneData = this.getZoneByAvgDelta(feature.properties.zone);
      if( !zoneData ) return;
      for( var key in zoneData.data ) {
        feature.properties[key] = zoneData.data[key];
      }
    });
  
    for( var i = 0; i < styles.length; i++ ) {
      for( var j = 0; j < geojson.features.length; j++ ) {
        if( styles[i].zone === geojson.features[j].properties.zone ) {
          styles[i] = geojson.features[j];
          break;
        }
      }
    }
  }
  
  // util method
  getZoneByAvgDelta(id) {
    for( var i = 0; i < styles.length; i++ ) {
      if( styles[i].avg.toFixed(1)+'_'+styles[i].delta.toFixed(1) === id ) {
        return {
          data : styles[i],
          index : i
        }
      }
    }
    return null;
  }
  
}

module.exports = new EtoZonesModel();