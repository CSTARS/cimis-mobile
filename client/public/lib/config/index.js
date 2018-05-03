const config = {
  logging : false,
  host : '',

  googleMapsApiKey : 'AIzaSyB4rlURkcCLTg4nR8vBhMSLIPHyYKpahck',

  months : ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"],

  etoMap: {
    options : {
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
    cimisGrid : require('./cimis-grid-charts'),
    etoZones : require('./eto-zone-charts'),
    dauZones : {
      chartOptions : {
        title : 'ETo - Evapotranspiration (mm)',
        curveType: 'function',
        height : 550,
        interpolateNulls : true,
        animation : {
          easing : 'out',
          startup : true
        }
      }
    }
  },
  
  definitions : require('./definitions.json')
};

module.exports = config;