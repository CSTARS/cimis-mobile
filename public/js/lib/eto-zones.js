var zones = [
  {
    zone  : 13,
    avg   : 2.2,
    delta : 0.5,
    color : '#002673'
  },
  {
    zone  : 3,
    avg   : 2.7,
    delta : 1.3,
    color : '#5290fa'
  },
  {
    zone  : 12,
    avg   : 3.0,
    delta : 1.7,
    color : '#7fb6f5'
  },
  {
    zone  : 4,
    avg   : 3.0,
    delta : 2.5,
    color : '#bef0ff'
  },
  {
    zone  : 6,
    avg   : 3.2,
    delta : 2.0,
    color : '#267300'
  },
  {
    zone  : 8,
    avg   : 3.4,
    delta : 2.6,
    color : '#38a800'
  },
  {
    zone  : 16,
    avg   : 3.7,
    delta : 2.2,
    color : '#98e600'
  },
  {
    zone  : 1,
    avg   : 3.8,
    delta : 2.8,
    color : '#a8a800'
  },
  {
    zone  : 7,
    avg   : 4.0,
    delta : 3.1,
    color : '#668000'
  },
  {
    zone  : 15,
    avg   : 4.6,
    delta : 3.1,
    color : '#734c00'
  },
  {
    zone  : 5,
    avg   : 5.0,
    delta : 3.1,
    color : '#895a44'
  },
  {
    zone  : 9,
    avg   : 5.0,
    delta : 3.5,
    color : '#a83800'
  },
  {
    zone  : 11,
    avg   : 5.3,
    delta : 3.3,
    color : '#e64c00'
  },
  {
    zone  : 14,
    avg   : 5.5,
    delta : 3.8,
    color : '#ffa200'
  },
  {
    zone  : 2,
    avg   : 6.0,
    delta : 4.0,
    color : '#ffd000'
  },
  {
    zone  : 10,
    avg   : 6.6,
    delta : 4.3,
    color : '#ffff00'
  }
]

function mergeZoneMap(geojson) {
  geojson.features.forEach(function(feature, index){
    var zoneData = getZoneByAvgDelta(feature.properties.zone);
    if( !zoneData ) return;
    for( var key in zoneData.data ) {
      feature.properties[key] = zoneData.data[key];
    }
  });

  for( var i = 0; i < zones.length; i++ ) {
    for( var j = 0; j < geojson.features.length; j++ ) {
      if( zones[i].zone === geojson.features[j].properties.zone ) {
        zones[i] = geojson.features[j];
        break;
      }
    }
  }
}

function getZoneByAvgDelta(id) {
  for( var i = 0; i < zones.length; i++ ) {
    if( zones[i].avg.toFixed(1)+'_'+zones[i].delta.toFixed(1) === id ) {
      return {
        data : zones[i],
        index : i
      }
    }
  }
  return null;
}

function getZone(id) {
  id = parseInt(id);
  for( var i = 0; i < zones.length; i++ ) {
    if( zones[i].properties.zone === id ) return zones[i];
  }
  return {};
}

function getAll() {
  return zones;
}

module.exports = {
  getZone : getZone,
  getAll : getAll,
  mergeZoneMap : mergeZoneMap
}