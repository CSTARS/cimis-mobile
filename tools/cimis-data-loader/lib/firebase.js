var Firebase = require('firebase');
var myRootRef = new Firebase('https://cimis-mobile.firebaseio.com/');

module.exports.write = function(id, index, value, callback) {
  myRootRef.child(id+'/'+index).set(value, callback);
};
