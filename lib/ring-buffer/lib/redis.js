'use strict';

var redis = require('redis');
var client, options;

function init(config) {
  options = config;
}

function connect(callback) {
  if( client ) {
    callback(client);
  } else {
    client = redis.createClient(options.get('redis').port, options.get('redis').host, {no_ready_check:true});

    if( options.get('redis').password ) {
      client.auth(options.get('redis').password, function(err) {
        if (err) {
          throw err;
        }
        _connect(callback);
      });
    } else {
      _connect(callback);
    }
  }
}

function _connect(callback) {
  client.on('connect',function(err, reply) {
    if( err ) {
      throw err;
    }

    console.log('Connected to Redis', options.get('redis').host);
    callback(client);
  });
}

function disconnect(callback) {
  client.quit();
  client = null; // make sure we reconnect on next call

  if (callback) { callback();}
}

// Called when length id <days
function initialize(id, callback) {
  connect(function(client) {
    var keyval = [id];
    for (var i = 0; i < options.get('ringBuffer').buffer; i++ ) {
      keyval.push(i);
    }
    client.del(id,function(err,reply) {
      if (err) {
        throw err;
      }
      client.rpush(keyval,function(err,reply) {
        if (err) {
          throw err;
        }
        callback(reply);
      });
    });
  });
}

function write(id, index, value, callback, tried_already) {
  connect(function(client) {
    if( typeof value === 'object' ) {
      value = JSON.stringify(value);
    }

    client.lset(id, index, value, function(err,reply) {
      if (err) {
        if ( tried_already ) {
          throw err;
        }
        initialize(id,function(reply){
          write(id,index,value,callback,true);
        });
      } else {
        callback(reply);
      }
    });
  });
}

function valueAt(id, index, callback) {
  connect(function(client) {
    client.lindex(id, index, function(err,reply){
      if( err ) {
        throw err;
      }
      callback(reply);
    });
  });
}

function read(id, callback) {
  connect(function(client) {
    client.lrange(id, 0, -1, function(err, reply) {
      if( err ) {
        return callback(err);
      }

      callback(null, reply);
    });
  });
}

module.exports= {
    connect : connect,
    disconnect : disconnect,
    initialize : initialize,
    read : read,
    write : write,
    valueAt : valueAt,
    init : init,
    client : function() { return client;}
};
