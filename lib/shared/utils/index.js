'use strict';

function sortDates(data) {
  var arr = [];

  if( Array.isArray(data) ) {
    for( var i = 0; i < data.length; i++ ) {
      arr.push({
        str : data[i],
        time : new Date(data[i]).getTime()
      });
    }
  } else {
    for( var date in data ) {
      arr.push({
        str : date,
        time : new Date(date).getTime()
      });
    }
  }

  arr.sort(function(a, b){
    if( a.time > b.time ) {
      return 1;
    } else if( b.time < a.time ) {
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

module.exports = {
  sortDates : sortDates
};
