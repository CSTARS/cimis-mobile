'use strict';
var store = require('../store');

function sortDates(data) {
  var arr = [];

  if( Array.isArray(data) ) {
    for( var i = 0; i < data.length; i++ ) {
      arr.push({
        str : data[i],
        time : toDate(data[i]).getTime()
      });
    }
  } else {
    for( var date in data ) {
      arr.push({
        str : date,
        time : toDate(date).getTime()
      });
    }
  }

  arr.sort(function(a, b){
    if( a.time > b.time ) {
      return 1;
    } else if( a.time < b.time ) {
      return -1;
    }
    return 0;
  });

  var tmp = [];
  arr.forEach(function(item){
    tmp.push(item.str);
  });

  return tmp;
}

function toDate(str) {
  var parts = str.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
}

function dispatch() {
  var args = [].slice.call(arguments);
  var fn = args.splice(0, 1)[0];
  store.dispatch(fn.apply(this, args));
}

module.exports = {
  sortDates : sortDates,
  dispatch : dispatch
};
