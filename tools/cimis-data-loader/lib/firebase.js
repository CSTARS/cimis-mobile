var Firebase = require('firebase');
var rootRef = new Firebase('https://cimis-mobile.firebaseio.com/');

module.exports.write = function(id, index, value, callback) {
  rootRef.child(id+'/'+index).set(value, callback);
};

module.exports.valueAt = function(id, index, callback) {
  rootRef.child(id+'/'+index).once('value', function(snapshot) {
    if( snapshot ) callback(snapshot.val());
    else callback();
  });
};
