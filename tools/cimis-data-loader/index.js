"use strict";
var async = require('async')
, config = require('config')
, fetch = require('./lib/fetch')
, path = require('path')
, ringBuffer = require('./lib/ringBuffer')
, dateUtil = require('./lib/date')
, days = []
;

function load(date, callback) {
  ringBuffer.exists(date, function(dateIsWritten, index) {
    if( dateIsWritten && !config.ringBuffer.force ) {
      console.log(dateUtil.nice(date).join('-')+' is already in the buffer at index '+index+' and no force flag set.  ignoring.');
      callback();
    }
    fetch.getDate(date, function(err, data){
      ringBuffer.write({date:date,data:data,force:config.ringBuffer.force}, function(err,data) { callback(); });
    });
  });
};

console.log(config.get('cimis'));
console.log('Importing last '+config.get('ringBuffer.buffer')+' days of CIMIS data from '+config.get('cimis.base'));

for( var i = 0; i < config.get('ringBuffer.buffer'); i++ ) {
  days.push(new Date(new Date().getTime()-(86400000*(i+1))));
}

async.eachSeries(
  days,
  function(date,next) {
    load(date,next);
  },
  function(err) {
    console.log('done.');
    process.exit();
  }
);
