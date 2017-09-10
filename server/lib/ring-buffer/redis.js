'use strict';

var redis = require('redis');
var util = require('util');
var config = require('../../config');

var promisify = ['auth', 'del', 'rpush', 'lset', 'lindex', 'lrange'];


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
    
    console.log('Connected to Redis', config.redis.host);
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

  async valueAt(id, index) {
    await this.connect();
    return await this.client.lindex(id, index);
  }

  async read(id) {
    await this.connect();
    return await this.client.lrange(id, 0, -1);
  }

}

module.exports = new RedisRingBuffer();