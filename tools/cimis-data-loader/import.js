var async = require('async');
var importer = require('./index');

var info = importer.info();
console.log('Importing last '+info.size+' days of CIMIS data from '+info.url);

var days = [];
for( var i = 0; i < ringBuffer.size; i++ ) {
  days.push(new Date(new Date().getTime()-(86400000*i)));
}

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
