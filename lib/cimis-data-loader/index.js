'use strict';

var async = require('async'),
  fetch = require('./lib/fetch'),
  path = require('path'),
  ringBuffer = require('../ring-buffer'),
  dateUtil = require('../ring-buffer/lib/date'),
  days = [], config;

function init(c) {
  config = c;
  fetch.init(config);
  ringBuffer.init(config);
}

function load(date, callback) {
  ringBuffer.exists(date, function(dateIsWritten, index) {
    if( dateIsWritten && !config.get('ringBuffer').force ) {
      console.log(dateUtil.nice(date).join('-')+' is already in the buffer at index '+index+' and no force flag set.  ignoring.');
      callback();
    }
    fetch.getDate(date,
      function(err, data){
        if( err ) {
          console.log(dateUtil.nice(date).join('-')+' failed to load.  ignoring.');
          return callback();
        }

        ringBuffer.write({
            date : date,
            data : data,
            force : config.get('ringBuffer').force
          },
          function(err,data) {
            callback();
        });
    });
  });
}

function run() {
  console.log(2);
  console.log(config.get('cimis'));
  console.log('Importing last '+config.get('ringBuffer').buffer+' days of CIMIS data from '+config.get('cimis').base);

  for( var i = 0; i < config.get('ringBuffer').buffer; i++ ) {
    days.push(new Date(new Date().getTime()-(86400000*(i))));
  }

  async.eachSeries(
    days,
    function(date,next) {
      var t = new Date().getTime();
      load(date,function(){
        console.log('  --time: '+(new Date().getTime() - t)+'ms');
        next();
      });
    },
    function(err) {
      console.log('done.');
      process.exit();
    }
  );
}

module.exports = {
  run : run,
  init : init
};
