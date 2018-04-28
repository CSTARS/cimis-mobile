var runningInDocker = false;
var force = false;

var env = process.env;


if( process.argv.indexOf('--docker') > -1 || env.CIMIS_DOCKER === 'true' ) {
  runningInDocker = true;
}
if( process.argv.indexOf('--force') > -1 ) {
  force = true;
}

module.exports = {

  env : env.CIMIS_MOBILE_ENV,

  logging : {
    name : 'cimis-mobile',
    level : env.CIMIS_LOG_LEVEL || 'info'
  },

  server : {
    assetPath : (env.CIMIS_CLIENT === 'production') ? 'dist' : 'public',
    port : env.CIMIS_MOBILE_PORT || 8080
  },

  ringBuffer : {
    db : 'redis',
    force : force,
    buffer : 14,
    dateKey : 'dates',
    stationKey : 'stations'
  },
  
  redis : {
    host : runningInDocker ? (env.REDIS_CONTAINER_NAME || 'redis') : 'localhost',
    port : 6379,
    verbose : true,
    disabled : true
  },
  
  fetch : {
    verbose : true
  },

  cimis : {
    rootUrl : 'http://cimis.casil.ucdavis.edu/cimis',
    params : ['ETo','K','Rnl','Rso','Tdew','Tn','Tx','U2']
  },

  stationInfoApi : 'http://et.water.ca.gov/api/station/'
}
