var redis = require('redis')
  , opt = require('config').get('redis')
  , buffer = require('config').get('buffer')
  , client
  ;

function connect(callback) {
  client=redis.createClient(opt.port,opt.host,{no_ready_check:true});
  client.auth(opt.password,function(err) {
    if (err) {throw err }
  });

  client.on('connect',function(err,reply) {
    console.log('Connected to Redis',opt.host);
    callback(client);
  });
}

function disconnect(callback) {
  client.quit();
  if (callback) { callback();}
}

// Called when length id <days
function initialize(id,callback) {
  var keyval=[id];
  for (var i=0; i<buffer; i++ ) {
    keyval.push(i);
  }
  client.del(id,function(err,reply) {
    if (err) { throw err}
    client.rpush(keyval,function(err,reply) {
      if (err) {throw err}
      callback(reply)
    });
  });
}

function write(id,index,value,callback,tried_already) {
  client.lset(id, index,function(err,reply) {
    if (err) {
      if (tried_already) { throw err }
      client.initialize(id,function(err,reply){
        if (err) { throw err }
        write(id,index,value,callback,true);
      })
    } else {
      callback(reply);
    }
  });
}

function valueAt(id,index,callback) {
  client.lindex(id, index,function(err,reply){
    if(err) {throw err}
    callback(reply);
  });
}

function read(id,callback) {
  client.lrange(id, 0, -1, function(err, reply) {
    if (err) { throw err}
    callback(reply);
  })
}

module.exports= {
    connect:connect,
    disconnect:disconnect,
    initialize:initialize,
    read:read,
    write:write,
    valueAt:valueAt,
    client : function() { return client;}
};
