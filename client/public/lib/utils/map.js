class MapUtils {

  fitToFeature(selectedId, map, getRegionNumber) {
      var features = [];
      map.data.forEach((feature) => {
          if( getRegionNumber(feature)+'' === selectedId) {
              features.push(feature);
          }
      });

      var bounds = new google.maps.LatLngBounds();
      features.forEach((feature) => {
          this.processPoints(feature.getGeometry(), bounds.extend, bounds);
      });
      map.fitBounds(bounds);
  }

  processPoints(geometry, callback, thisArg) {
    if (geometry instanceof google.maps.LatLng) {
        callback.call(thisArg, geometry);
    } else if (geometry instanceof google.maps.Data.Point) {
        callback.call(thisArg, geometry.get());
    } else {
      geometry.getArray().forEach((g) => {
        this.processPoints(g, callback, thisArg);
      });
    }
  }

}

module.exports = new MapUtils();