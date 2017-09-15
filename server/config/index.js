var runningInDocker = false;
var force = false;
var env = process.env.CIMIS_MOBILE_ENV || 'development';

if( process.argv.indexOf('--docker') > -1 || env === 'production' ) {
  runningInDocker = true;
}
if( process.argv.indexOf('--force') > -1 ) {
  force = true;
}


module.exports = {

  env : env,

  server : {
    assetPath : (env === 'production') ? 'dist' : 'public',
    port : process.env.CIMIS_MOBILE_PORT || 8080
  },

  ringBuffer : {
    db : 'redis',
    force : force,
    buffer : 14,
    dateKey : 'dates',
    stationKey : 'stations'
  },
  
  redis : {
    host : runningInDocker ? (process.env.REDIS_CONTAINER_NAME || 'redis') : 'localhost',
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
  }
}
