"use strict";
var async = require('async')
, config = require('config').get("ringBuffer")
, dateUtil = require('./date')
, db
, msPerDay = 86400000
;

if (config.db === 'redis') {
  db = require('./redis');
} else {
  db = require('./firebase');
}

// day should be number 1 - 31;
function getIndex(date) {
  return Math.floor(date.getTime() / msPerDay) % config.buffer;
}

function write (options, callback) {
  var index = getIndex(options.date);
  var keys = Object.keys(options.data);
  if (config.max_keys) {
    keys = keys.slice(0,config.max_keys);
    console.log('max_keys:',config.max_keys,keys);
  }

  exists(options.date, function(dateIsWritten) {
    console.log("dateIsWritten",dateIsWritten);
    if( dateIsWritten && !config.force ) {
      console.log(dateUtil.nice(options.date).join('-')+' is already in the buffer at index '+index+' and no force flag set.  ignoring.');
      callback();
    }

    console.log('Writing '+keys.length+' cells to index '+index+' in ring buffer for '+options.date.toDateString());
    var count = 0;

    async.eachLimit(
      keys,
      25,
      function(id, next) {
        db.write(id, index, options.data[id], function(err, resp){
          count++;
          display(count, keys.length);
          next();
        });
      },
      function(err) {
        db.write(config.date_key, index, dateUtil.nice(options.date).join('-'), function(err, resp){
          callback(err);
        });
      }
    );
  });
};


function exists(date, callback) {
  var index = getIndex(date);
  date = dateUtil.nice(date).join('-');

  db.valueAt(config.date_key, index, function(val){
    if( val === date ) callback(true, index);
    else callback(false, index);
  });
}

function display(count, len) {
  if( count % 10000 === 0 ) {
    console.log('  '+((count/len)*100).toFixed(2)+'%');
  }
}

module.exports = {
  exists:exists,
  write:write,
  getIndex:getIndex,
};
