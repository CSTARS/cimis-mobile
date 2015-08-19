'use strict';

var async = require('async');
var dateUtil = require('./lib/date');
var db, config, msPerDay = 86400000;

function init(c) {
  config = c;
  if (config.get('ringBuffer').db === 'redis') {
    console.log('using redis');
    db = require('./lib/redis');
    db.init(config);
  } else {
    console.log('using firebase');
    db = require('./firebase');
  }
}

// day should be number 1 - 31;
function getIndex(date) {
  return Math.floor(date.getTime() / msPerDay) % config.get('ringBuffer').buffer;
}

function write (options, callback) {
  var index = getIndex(options.date);
  var keys = Object.keys(options.data);
  if (config.get('ringBuffer').max_keys) {
    keys = keys.slice(0, config.get('ringBuffer').max_keys);
    console.log('max_keys:', config.get('ringBuffer').max_keys, keys);
  }

  exists(options.date, function(dateIsWritten) {
    console.log('dateIsWritten', dateIsWritten);
    if( dateIsWritten && !config.get('ringBuffer').force ) {
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
        db.write(config.get('ringBuffer').date_key, index, dateUtil.nice(options.date).join('-'), function(err, resp){
          callback(err);
        });
      }
    );
  });
}

function read(row, col, callback){
  db.read(row, col, callback);
}


function exists(date, callback) {
  var index = getIndex(date);
  date = dateUtil.nice(date).join('-');

  db.valueAt(config.get('ringBuffer').date_key, index, function(val){
    if( val === date ) {
      callback(true, index);
    } else {
      callback(false, index);
    }
  });
}

function display(count, len) {
  if( count % 10000 === 0 ) {
    console.log('  '+((count/len)*100).toFixed(2)+'%');
  }
}

module.exports = {
  exists : exists,
  write : write,
  read : read,
  getIndex : getIndex,
  init : init
};
