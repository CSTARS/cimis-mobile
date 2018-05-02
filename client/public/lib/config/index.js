const config = {
  logging : false,
  host : '',

  googleMapsApiKey : 'AIzaSyB4rlURkcCLTg4nR8vBhMSLIPHyYKpahck',

  unknown: {
    mapOptions : {
      center: { 
        lat: 38.033291, 
        lng: -119.961762 
      },
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
  },

  mainMap : {
    options : {
      center: { lat: 38.033291, lng: -119.961762 },
      zoom: 5,
      mapTypeControl : false,
      streetViewControl : false,
      panControl : false,
      zoomControlOptions : {
        style : 'LARGE'
      }
    }
  },

  etoZones : {
    styles : require('./eto-zone-styles')
  },

  dataPages : {
    cimisGrid : require('./cimis-grid-charts')
  },
  
  definitions : require('./definitions.json')
};

module.exports = config;