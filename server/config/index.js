var runningInDocker = false;
var env = process.env.CIMIS_MOBILE_ENV || 'development';

if( process.argv.indexOf('--docker') > -1 || env === 'production' ) {
  runningInDocker = true;
}


module.exports = {

  env : env,

  server : {
    assetPath : (env === 'production') ? 'dist' : 'public',
    port : process.env.CIMIS_MOBILE_PORT || 8080
  },

  ringBuffer : {
    db : 'redis',
    force : false,
    buffer : 14,
    date_key : 'dates'
  },
  
  redis : {
    host : runningInDocker ? 'redis' : 'localhost',
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
