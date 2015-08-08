var Firebase = require('firebase');
var rootRef = new Firebase('https://cimis-mobile.firebaseio.com/');

/*  Make sure you really want to use this!!!
module.exports.destroy = function(callback) {
  rootRef.set({}, function(err, resp){
    callback(err, resp);
  });
};
*/

module.exports.write = function(id, index, value, callback) {
  rootRef.child(id+'/'+index).set(value, function(err, resp){
    callback(err, resp);
  });
};

module.exports.valueAt = function(id, index, callback) {
  rootRef.child(id+'/'+index).once('value', function(snapshot) {
    if( snapshot ) callback(snapshot.val());
    else callback();
  });
};
