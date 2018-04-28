class MapUtils {

  fitToFeature(selectedId) {
      var features = [];
      this.map.data.forEach((feature) => {
          if( this.getRegionNumber(feature)+'' === selectedId) {
              features.push(feature);
          }
      });

      var bounds = new google.maps.LatLngBounds();
      features.forEach((feature) => {
          this.processPoints(feature.getGeometry(), bounds.extend, bounds);
      });
      this.map.fitBounds(bounds);
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