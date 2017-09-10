'use strict';

var config = require('../../config');
var fetch = require('./fetch');
var ringBuffer = require('../ring-buffer');
var niceDate = require('../niceDate');
var days = [];

async function load(date) {
  var {dateIsWritten, index} = await ringBuffer.exists(date);
  if( dateIsWritten && !config.ringBuffer.force ) {
    console.log(niceDate(date).join('-')+' is already in the buffer at index '+index+' and no force flag set.  ignoring.');
    return;
  }

  var resp = await fetch.getDate(date);
  
  await ringBuffer.write({
    date : date,
    data : resp.data,
    aggregate : resp.aggregate,
    force : config.ringBuffer.force
  });
}

async function run() {
  console.log('Importing last '+config.ringBuffer.buffer+' days of CIMIS data from '+config.cimis.base);

  for( var i = 0; i < config.ringBuffer.buffer; i++ ) {
    days.push(new Date(new Date().getTime()-(86400000*(i+1))));
  }

  for( var i = 0; i < days.length; i++ ) {
    var t = new Date().getTime();
    var date = days[i];

    await load(date);
    console.log('  --time: '+(new Date().getTime() - t)+'ms');
  }
}

module.exports = {
  run : run
};
