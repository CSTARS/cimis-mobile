var async = require('async');
var dateUtil = require('./date');

// db should implement are write function taking id, index, value and callback parameters
// see use below
var db = require('./firebase');

var BUFFER_SIZE = 14; // keep 14 days
var msPerDay = 86400000;
var lookupArrayNs = 'dates';

module.exports.getBufferSize = function(){
  return BUFFER_SIZE;
};

// day should be number 1 - 31;
function getIndex(date) {
  return Math.ceil(date.getTime() / msPerDay) % BUFFER_SIZE;
}
module.exports.getIndex = getIndex;

module.exports.write = function(options, callback) {
  var index = getIndex(options.date);
  var keys = Object.keys(options.data);

  exists(options.date, function(dateIsWritten) {
    if( dateIsWritten && !options.force ) {
      console.log(dateUtil.nice(options.date).join('-')+' is already in the buffer and no force flag set.  ignoring.');
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
    if( val === date ) callback(true);
    else callback(false);
  });
}
module.exports.exists = exists;

function display(count, len) {
  if( count % 10000 === 0 ) {
    console.log('  '+((count/len)*100).toFixed(2)+'%');
  }
}
