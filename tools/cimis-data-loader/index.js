"use strict";
var async = require('async')
  , importer = require('./importer')
  , config = require('config')
  , path = require('path')
  , foo = require('./lib/ringBuffer')(config)
  , days = []
  ;

console.log(config.get('cimis'));
console.log('Importing last '+config.get('buffer')+' days of CIMIS data from '+config.get('cimis.base'));

for( var i = 0; i < config.get('buffer'); i++ ) {
//  days.push(new Date(new Date().getTime()-(86400000*(i+1))));
}
console.log(foo.getIndex(new Date()));

async.eachSeries(
  days,
  function(date, next) {
    importer.load(date, next);
  },
  function(err) {
    console.log('done.');
    process.exit();
  }
);
