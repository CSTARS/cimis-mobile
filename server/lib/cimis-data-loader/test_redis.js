"use strict";
var config=require('config')
  , rdb=require('./lib/redis')
  , async = require('async')
  , ringBuffer = require('./lib/ringBuffer')(config)
  , dateUtil = require('./lib/date')
  , client
  ;

console.log(config);

function init(callback) {
 rdb.connect(function(client) {
   console.log('inited');
   callback();
 });
 }

function rpush(callback) {
  console.log('rpush');
  var client=rdb.client();
  client.rpush(['foo','bar','{foo}','baz'],function(err,reply){
    console.log(reply);
    client.lrange('foo', 0, -1, function(err, reply) {
      console.log(reply);
      callback();
    });
  });
}

function init_bar(callback) {
  rdb.initialize('bar',function(reply) {
    rdb.valueAt('bar',2,function(reply) {
      rdb.read('bar',function(reply) {
        console.log('New Bar',reply);
        callback();
      });
    });
  });
}

// This should make a new key without complaint
function write_to_empty(callback) {
  var client = rdb.client();
  client.del('baz',function(err,reply) {
    rdb.write('baz',4,'{"item":4,"text":"test"}',function(reply) {
      rdb.read('baz',function(reply) {
        console.log('Writing empty baz',reply);
        callback();
      });
    });
  });
}

function pretend_to_add_dates(callback) {
  var days=[];
  for( var i = 0; i < config.buffer; i++ ) {
    days.push(new Date(new Date().getTime()-(86400000*(i+1))));
  }
  async.eachSeries(
    days,
    function(date, next) {
      ringBuffer.exists(date, function(dateIsWritten, index) {
        if( dateIsWritten ) {
          console.log(dateUtil.nice(date).join('-')+' is already in the buffer at index '+index+' and no force flag set.  ignoring.');
          next();
        } else {
          rdb.write('dates', ringBuffer.getIndex(date), dateUtil.nice(date).join('-'), function(err, resp){
            next();});
          }
        });
      },
      function(err) {
        rdb.read('dates',function(reply) {
          console.log('Pretend',reply)
          callback();
        });
      }
    );
}

async.eachSeries(
  [init,rpush,init_bar,write_to_empty,pretend_to_add_dates],
  function (f,next) {
    f(next);
  },
  function(err) {
    rdb.disconnect();
  });
