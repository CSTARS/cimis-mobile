var store = require('../redux/store');
var styles = require('./style');

function mergeZoneMap(geojson) {
  geojson.features.forEach(function(feature, index){
    var zoneData = getZoneByAvgDelta(feature.properties.zone);
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

function getZoneByAvgDelta(id) {
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

function getZone(id) {
  /** HACK for cyclical dependency */
  var geometry = require('../redux/store').getState().collections.etoZones.geometry;
  if( geometry.state !== 'loaded' ) return {};

  var zones = geometry.data.features;
  id = parseInt(id);
  for( var i = 0; i < zones.length; i++ ) {
    if( zones[i].properties.zone === id ) {
      return zones[i];
    }
  }

  return {};
}

module.exports = {
  getZone : getZone,
  mergeZoneMap : mergeZoneMap
}