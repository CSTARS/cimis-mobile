'use strict';

var db = require('./redis');
var config = require('../../config');
var MS_PER_DAY = 86400000;

class RingBuffer {

  // day should be number 1 - 31;
  getIndex(date) {
    return Math.floor(date.getTime() / MS_PER_DAY) % config.ringBuffer.buffer;
  }

  async write(options) {
    var index = getIndex(options.date);
    var keys = Object.keys(options.data);
  
    if( config.ringBuffer.max_keys ) {
      keys = keys.slice(0, config.ringBuffer.max_keys);
      console.log('max_keys:', config.ringBuffer.max_keys, keys);
    }
  
    var {dateIsWritten, index} = await this.exists(options.date);
    console.log('dateIsWritten', dateIsWritten);
    
    if( dateIsWritten && !config.ringBuffer.force ) {
      console.log(
        dateUtil.nice(options.date).join('-') + 
        ' is already in the buffer at index '+index+' and no force flag set.  ignoring.'
      );
      return;
    }
  
    console.log('Writing '+keys.length+' cells to index '+index+' in ring buffer for '+options.date.toDateString());
    var count = 0;
  
    for( var i = 0; i < keys.length; i++ ) {
      await db.write(keys[i], index, options.data[keys[i]]);
      display(i, keys.length);
    }

    await db.write(config.ringBuffer.date_key, index, dateUtil.nice(options.date).join('-'));
    await this.writeAggregates(options);
  }

  async exists(date) {
    var index = getIndex(date);
    date = niceDate(date).join('-');
  
    var val = await db.valueAt(config.ringBuffer.date_key, index);
    
    if( val === date ) return {exists: true, index};
    return {exists: false, index};
  }

  async writeAggregates(options) {
    var index = getIndex(options.date);
    var keys = Object.keys(options.aggregate);
    
    if (config.ringBuffer.max_keys) {
      keys = keys.slice(0, config.ringBuffer.max_keys);
      console.log('max_keys:', config.ringBuffer.max_keys, keys);
    }
  
    console.log('Writing '+keys.length+' aggregates to index '+index+' in ring buffer for '+options.date.toDateString());
    var count = 0;

    for( var i = 0; i < keys.length; i++ ) {
      await db.write(keys[i], index, options.aggregate[keys[i]]);
      display(i, keys.length);
    }
  }

  async read(row, col){
    return await db.read(row, col);
  }

  display(count, len) {
    if( count % 10000 === 0 ) {
      console.log('  '+((count/len)*100).toFixed(2)+'%');
    }
  }
}

function niceDate(date) {
  var year = date.getUTCFullYear();
  var month = (date.getUTCMonth()+1)+'';
  if( month.length == 1 ) month = '0'+month;
  var day = date.getUTCDate()+'';
  if( day.length == 1 ) day = '0'+day;

  return [year, month, day];
};

module.exports = new RingBuffer();
