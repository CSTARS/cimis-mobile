var ZoneBehavior = {
  mapOptions : {
      center: { lat: 38.033291, lng: -119.961762 },
      zoom: 5,
      scrollwheel : false,
      draggable : false,
      panControl:true,
      zoomControl:true,
      mapTypeControl:false,
      scaleControl:false,
      streetViewControl:false,
      overviewMapControl:false,
      rotateControl:false,
      disableDefaultUI: true
  },

  fitToFeature : function(selectedId) {
      var features = [];
      this.map.data.forEach(function(feature){
          if( this.getRegionNumber(feature)+'' === selectedId) {
              features.push(feature);
          }
      }.bind(this));

      var bounds = new google.maps.LatLngBounds();
      features.forEach(function(feature){
          this.processPoints(feature.getGeometry(), bounds.extend, bounds);
      }.bind(this));
      this.map.fitBounds(bounds);
  },

  processPoints : function(geometry, callback, thisArg) {
      if (geometry instanceof google.maps.LatLng) {
          callback.call(thisArg, geometry);
      } else if (geometry instanceof google.maps.Data.Point) {
          callback.call(thisArg, geometry.get());
      } else {
          geometry.getArray().forEach(function(g) {
              this.processPoints(g, callback, thisArg);
          }.bind(this));
      }
  }
}