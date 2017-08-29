'use strict';

var redis = require('redis');
var util = require('util');
var config = require('../../config');

var promisify = ['auth', 'del', 'rpush', 'lset', 'lindex', 'lrange'];
promisify.forEach((key) => {
  client[key] = util.promisify(client[key]);
});

class RedisRingBuffer {

  constructor() {
    this.client = null;
  }

  async connect(callback) {
    if( this.client ) return this.client;
      
    this.client = redis.createClient(config.redis.port, config.redis.host, {no_ready_check:true});

    if( config.redis.password ) {
      await client.auth(config.redis.password);
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
    
    await client.del(id);
    return await client.rpush(keyval);
  }

  async write(id, index, value, attempted) {
    await this.connect();
    
    if( typeof value === 'object' ) {
      value = JSON.stringify(value);
    }
    
    try {
      return await client.lset(id, index, value);
    } catch(e) {
      if( attempted ) throw e;

      // on first fail, try to initialize and then write again
      await this.initialize(id);
      return await this.write(id, index, value, true);
    }
  }

  async valueAt(id, index) {
    await this.connect();
    return await client.lindex(id, index);
  }

  async read(id) {
    await this.connect();
    return await client.lrange(id, 0, -1);
  }

}

module.exports = new RedisRingBuffer();