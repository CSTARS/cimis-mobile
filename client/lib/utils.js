'use strict';

var IocRegistration = require('cork-app-utils').IocRegistration;
var fft = require('./fft');

class AppUtils extends IocRegistration {

  constructor() {
    super();
    this.fft = fft;
    this.registerIOC('AppUtils');    
  }

  sortDates(data) {
    var arr = [];
  
    if( Array.isArray(data) ) {
      for( var i = 0; i < data.length; i++ ) {
        arr.push({
          str : data[i],
          time : this.toDate(data[i]).getTime()
        });
      }
    } else {
      for( var date in data ) {
        arr.push({
          str : date,
          time : this.toDate(date).getTime()
        });
      }
    }
  
    arr.sort((a, b) => {
      if( a.time > b.time ) {
        return 1;
      } else if( a.time < b.time ) {
        return -1;
      }
      return 0;
    });
  
    return arr.map(item => item.str);
  }
  
  toDate(str) {
    var parts = str.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
  }

}

module.exports = new AppUtils();