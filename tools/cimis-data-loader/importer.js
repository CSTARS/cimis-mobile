var fetch = require('./lib/fetch');
var ringBuffer = require('./lib/ringBuffer');
var munge = require('./lib/munge');
var dateUtil = require('./lib/date');
var async = require('async');

var force = false;

module.exports.info = function() {
  return {
    size : ringBuffer.getBufferSize(),
    url : fetch.getRootUrl()
  };
};

module.exports.load = function(date, callback) {
  ringBuffer.exists(date, function(dateIsWritten, index) {
    if( dateIsWritten && !force ) {
      console.log(dateUtil.nice(date).join('-')+' is already in the buffer at index '+index+' and no force flag set.  ignoring.');
      return callback();
    }

    fetch.getDate(date, function(err, data){
      var options = {
        data : munge(data, ringBuffer.getIndex(date)),
        date : date,
        force : force
      };

      ringBuffer.write(options, callback);
    });
  });
};
