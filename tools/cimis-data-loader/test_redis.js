"use strict";
var config=require('config')
  , rdb=require('./lib/redis')
  , async = require('async')
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
    console.log(reply);
    rdb.valueAt('bar',2,function(reply) {
      console.log("ID",'bar',"VAL",reply);
      callback();
    });
  });
}

function read_bar(callback) {
  rdb.read('bar',function(reply) {
    console.log('bar',reply);
    callback();
  });
}

async.eachSeries(
  [init,rpush,init_bar,read_bar],
  function (f,next) {
    f(next);
  },
  function(err) {
    rdb.disconnect();
  });
