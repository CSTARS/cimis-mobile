const config = {
  logging : false,
  host : '',

  googleMapsApiKey : 'AIzaSyB4rlURkcCLTg4nR8vBhMSLIPHyYKpahck',

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

  etoZones : {
    styles : require('./eto-zone-styles')
  },
  
  definitions : require('./definitions.json')
};

module.exports = config;