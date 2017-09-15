'use strict';

var db = require('./redis');
var config = require('../../config');
var niceDate = require('../niceDate');
var MS_PER_DAY = 86400000;

class RingBuffer {

  constructor() {
    if( config.force ) {
      config.ringBuffer.force = true;
    }
  }

  // day should be number 1 - 31;
  getIndex(date) {
    return Math.floor(date.getTime() / MS_PER_DAY) % config.ringBuffer.buffer;
  }

  async write(options) {
    if( !options.data ) {
      return console.error('No Data');
    }

    var index = this.getIndex(options.date);
    var keys = Object.keys(options.data);
    var stationKeys = Object.keys(options.stationData);
  
    if( config.ringBuffer.max_keys ) {
      keys = keys.slice(0, config.ringBuffer.max_keys);
      console.log('max_keys:', config.ringBuffer.max_keys, keys);
    }
  
    var {dateIsWritten, index} = await this.exists(options.date);
    
    if( dateIsWritten && !config.ringBuffer.force ) {
      console.log(
        niceDate(options.date).join('-') + 
        ' is already in the buffer at index '+index+' and no force flag set.  ignoring.'
      );
      return;
    }
  
    console.log('Writing '+keys.length+' cells to index '+index+' in ring buffer for '+options.date.toDateString());
    var count = 0;
  
    for( var i = 0; i < keys.length; i++ ) {
      await db.write(keys[i], index, options.data[keys[i]]);
      this.display(i, keys.length);
    }

    console.log('Writing '+stationKeys.length+' station to index '+index+' in ring buffer for '+options.date.toDateString());
    var stations = [];
    for( var i = 0; i < stationKeys.length; i++ ) {
      await db.write('ST'+stationKeys[i], index, options.stationData[stationKeys[i]]);
      this.display(i, stationKeys.length);
    }

    await db.write(config.ringBuffer.dateKey, index, niceDate(options.date).join('-'));
    await db.write(config.ringBuffer.dateKey, index, niceDate(options.date).join('-'));
    await this.writeAggregates(options);
  }

  async exists(date) {
    var index = this.getIndex(date);
    date = niceDate(date).join('-');
  
    var val = await db.valueAt(config.ringBuffer.dateKey, index);
    
    if( val === date ) return {dateIsWritten: true, index};
    return {dateIsWritten: false, index};
  }

  async writeAggregates(options) {
    var index = this.getIndex(options.date);
    var keys = Object.keys(options.aggregate);
    
    if (config.ringBuffer.max_keys) {
      keys = keys.slice(0, config.ringBuffer.max_keys);
      console.log('max_keys:', config.ringBuffer.max_keys, keys);
    }
  
    console.log('Writing '+keys.length+' aggregates to index '+index+' in ring buffer for '+options.date.toDateString());
    var count = 0;

    for( var i = 0; i < keys.length; i++ ) {
      await db.write(keys[i], index, options.aggregate[keys[i]]);
      this.display(i, keys.length);
    }
  }

  async read(row, col){
    return await db.read(row, col);
  }

  display(count, len) {
    if( count % 10000 === 0 ) {
      process.stdout.clearLine();  // clear current text
      process.stdout.cursorTo(0);
      process.stdout.write('  '+((count/len)*100).toFixed(2)+'%');
    }
  }

  async getStations() {
    var stations = await db.readSingleton(config.ringBuffer.stationKey);
    return stations ? JSON.parse(stations) : {};
  }

  async setStations(stations) {
    await db.writeSingleton(config.ringBuffer.stationKey, JSON.stringify(stations));
  }
}

module.exports = new RingBuffer();
