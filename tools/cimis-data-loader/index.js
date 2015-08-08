var fetch = require('./lib/fetch');
var ringBuffer = require('./lib/ringBuffer');
var munge = require('./lib/munge');
var dateUtil = require('./lib/date');
var async = require('async');

var date = new Date(new Date().getTime()-(86400000*2));
var force = false;

module.exports.info = function() {
  return {
    size : ringBuffer.size,
    url : fetch.url
  };
};

module.exports.load = function(date, callback) {
  ringBuffer.exists(date, function(dateIsWritten) {
    if( dateIsWritten && !force ) {
      console.log(dateUtil.nice(date).join('-')+' is already in the buffer and no force flag set.  ignoring.');
      return callback();
    }

    fetch.getDate(date, function(err, data){
      var options = {
        data : munge(data),
        date : date
      };

      ringBuffer.write(options, callback);
    });
  });
}
