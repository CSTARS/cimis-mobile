'use strict';

const redis = require('redis');
const util = require('util');
const config = require('../../config');
const logger = require('../../logger');

var promisify = ['auth', 'del', 'rpush', 'lset', 'lindex', 'lrange', 'get', 'set'];


class RedisRingBuffer {

  constructor() {
    this.client = null;
  }

  async connect(callback) {
    if( this.client ) return this.client;
      
    this.client = redis.createClient(config.redis.port, config.redis.host, {no_ready_check:true});
    promisify.forEach((key) => {
      this.client[key] = util.promisify(this.client[key]);
    });

    if( config.redis.password ) {
      await this.client.auth(config.redis.password);
    }
    await this._connect();
    
    logger.info('RingBuffer connected to Redis host: ', config.redis.host);
  }
  
  _connect() {
    return new Promise((resolve, reject) => {
      this.client.on('connect', (err, reply) => {
        if( err ) reject(err);
        else resolve();
      });
    });
  }

  disconnect() {
    this.client.quit();
    this.client = null;
  }

  // Called when length id < days
  async initialize(id) {
    await this.connect();
    
    var keyval = [id];
    for (var i = 0; i < config.ringBuffer.buffer; i++ ) {
      keyval.push(i);
    }
    
    await this.client.del(id);
    return await this.client.rpush(keyval);
  }

  /**
   * write value to index of array, if it fails, initialize array
   * then try again.
   */
  async write(id, index, value, attempted) {
    await this.connect();
    
    if( typeof value === 'object' ) {
      value = JSON.stringify(value);
    }
    
    try {
      return await this.client.lset(id, index, value);
    } catch(e) {
      if( attempted ) throw e;

      // on first fail, try to initialize and then write again
      await this.initialize(id);
      return await this.write(id, index, value, true);
    }
  }

  /**
   * return value at index of array
   */
  async valueAt(id, index) {
    await this.connect();
    return await this.client.lindex(id, index);
  }

  /**
   * Read entire array
   */
  async read(id) {
    await this.connect();
    return await this.client.lrange(id, 0, -1);
  }

  async writeSingleton(key, value) {
    await this.connect();
    return await this.client.set(key, value);
  }

  async readSingleton(key) {
    await this.connect();
    return await this.client.get(key);
  }

}

module.exports = new RedisRingBuffer();