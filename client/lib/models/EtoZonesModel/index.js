var BaseModel = require('cork-app-utils').BaseModel;
var EtoZonesStore = require('../../stores/EtoZonesStore');
var EtoZonesService = require('../../services/EtoZonesService');
var styles = require('./styles');

class EtoZonesModel extends BaseModel {

  constructor() {
    super();
    this.store = EtoZonesStore;
    this.service = EtoZonesService;
    this.registerIOC('EtoZonesModel');
  }

  getStyles() {
    return styles;
  }

  getGeometry() {
    // pass model for access to util method
    return this.service.getGeometry(this);
  }

  getZoneGeometry(id) {
    id = parseInt(id);
    return this.store.data.zoneGeometryById[id];
  }

  getZoneData(id) {
    return this.service.getZoneData(id);
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