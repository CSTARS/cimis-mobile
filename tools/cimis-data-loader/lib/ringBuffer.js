"use strict";
var async = require('async')
    , dateUtil = require('./date')
    , db
    , BUFFER_SIZE
    , msPerDay = 86400000
    , lookupArrayNs = 'dates'
    ;

// day should be number 1 - 31;
function getIndex(date) {
  return Math.floor(date.getTime() / msPerDay) % BUFFER_SIZE;
}

function write (options, callback) {
  var index = getIndex(options.date);
  var keys = Object.keys(options.data);

  exists(options.date, function(dateIsWritten) {
    if( dateIsWritten && !options.force ) {
      console.log(dateUtil.nice(options.date).join('-')+' is already in the buffer at index '+index+' and no force flag set.  ignoring.');
      return callback();
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
        db.write(lookupArrayNs, index, dateUtil.nice(options.date).join('-'), function(err, resp){
          callback(err);
        });
      }
    );
  });
};


function exists(date, callback) {
  var index = getIndex(date);
  date = dateUtil.nice(date).join('-');

  db.valueAt(lookupArrayNs, index, function(val){
    if( val === date ) callback(true, index);
    else callback(false, index);
  });
}

function display(count, len) {
  if( count % 10000 === 0 ) {
    console.log('  '+((count/len)*100).toFixed(2)+'%');
  }
}

module.exports = function(config) {
  // db should implement are write function taking id, index, value and callback parameters
  // see use below
  BUFFER_SIZE = config.buffer;

  if (config.db === 'redis') {
    db = require('./redis');
  } else {
    db = require('./firebase');
  }

  return {
    exists:exists,
    write:write,
    getIndex:getIndex,
  }
}
