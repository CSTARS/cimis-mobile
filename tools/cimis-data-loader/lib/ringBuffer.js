var async = require('async');
var dateUtil = require('dateUtil');

// db should implement are write function taking id, index, value and callback parameters
// see use below
var db = require('./firebase');

var BUFFER_SIZE = 14; // keep 14 days
var msPerDay = 86400000;

// day should be number 1 - 31;
function getIndex(date) {
  return Math.ceil(date.getTime() / msPerDay) % BUFFER_SIZE;
}
module.exports.getIndex = getIndex;

module.exports.write = function(date, data, callback) {
  var index = getIndex(date);
  var keys = Object.keys(data);

  console.log('Writing '+keys.length+' cells to ring buffer for '+date.toDateString());

  async.eachSeries(
    keys,
    function(id, next) {
      db.write(id, index, data[id], function(err, resp){
        next();
      });
    },
    function(err) {
      db.write('dates', index, dateUtil.nice(date).join('-'), function(err, resp){
        callback(err);
      });
    }
  );
};
