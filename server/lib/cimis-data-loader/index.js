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

  if( config.get('force') ) {
    config.get('ringBuffer').force = true;
  }

  ringBuffer.init(config);
}

function load(date, callback) {
  ringBuffer.exists(date, function(dateIsWritten, index) {
    if( dateIsWritten && !config.get('ringBuffer').force ) {
      console.log(dateUtil.nice(date).join('-')+' is already in the buffer at index '+index+' and no force flag set.  ignoring.');
      return callback();
    }

    fetch.getDate(date,
      function(err, resp){
        if( err ) {
          console.log(dateUtil.nice(date).join('-')+' failed to load.  ignoring. ');
          return callback();
        }

        ringBuffer.write({
            date : date,
            data : resp.data,
            aggregate : resp.aggregate,
            force : config.get('ringBuffer').force
          },
          function(err,data) {
            callback();
        });
    });
  });
}

function run() {
  console.log('Importing last '+config.get('ringBuffer').buffer+' days of CIMIS data from '+config.get('cimis').base);

  for( var i = 0; i < config.get('ringBuffer').buffer; i++ ) {
    days.push(new Date(new Date().getTime()-(86400000*(i+1))));
  }

  async.eachSeries(
    days,
    function(date,next) {
      var t = new Date().getTime();
      var fired = false;

      load(date, function(){
        console.log('  --time: '+(new Date().getTime() - t)+'ms');
        if( !fired ) {
          fired = true;
          next();
        } else {
          console.log('Attempting to fire callback twice!');
        }
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
