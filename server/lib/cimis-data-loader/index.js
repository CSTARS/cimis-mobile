'use strict';

const config = require('../../config');
const fetch = require('./fetch');
const ringBuffer = require('../ring-buffer');
const niceDate = require('../niceDate');
const logger = require('../../logger');
var days = [];

async function load(date) {
  var {dateIsWritten, index} = await ringBuffer.exists(date);
  if( dateIsWritten && !config.ringBuffer.force ) {
    logger.info('data-loader '+niceDate(date).join('-')+' is already in the buffer at index '+index+' and no force flag set.  ignoring.');
    return await fetch.getStationData(date);
  }

  var resp = await fetch.getDate(date);
  
  await ringBuffer.write({
    date : date,
    data : resp.data,
    stationData : resp.stationData,
    aggregate : resp.aggregate,
    force : config.ringBuffer.force
  });

  return resp.stationData;
}

async function run() {
  logger.info('data-loader importing last '+config.ringBuffer.buffer+' days of CIMIS data from '+config.cimis.rootUrl);

  for( var i = 0; i < config.ringBuffer.buffer; i++ ) {
    days.push(new Date(new Date().getTime()-(86400000*(i+1))));
  }

  // keep list of all active stations for this date range
  var currentStationList = {};

  for( var i = 0; i < days.length; i++ ) {
    var t = new Date().getTime();
    var date = days[i];

    var stations = await load(date);
    for( var key in stations ) {
      currentStationList[key] = {
        lat : stations[key].lat,
        lng : stations[key].lng
      }
    }
  
    logger.info(`data-loader ${date.toISOString().replace(/T.*/,'')} load time: `+(new Date().getTime() - t)+'ms');
  }

  await ringBuffer.setStations(currentStationList);
}

module.exports = {
  run : run
};
