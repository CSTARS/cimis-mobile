'use strict';

const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const config = require('./config');
const logger = require('./logger');
const dataLoader = require('./lib/cimis-data-loader');

// enable CORS
app.use(cors());
app.options('*', cors());

// setup simple http logging
app.use((req, res, next) => {
  res.on('finish',() => {
    logger.info(`${res.statusCode} ${req.method} ${req.protocol}/${req.httpVersion} ${req.originalUrl || req.url} ${req.get('User-Agent') || 'no-user-agent'}`);
  });
  next();
});

/**
 * Register Controllers
 */
app.use('/cimis', require('./controllers/cimis'));

/**
 * Set static asset path
 */
var assetPath = path.resolve(__dirname, '..', 'client', config.server.assetPath);
app.use(express.static(assetPath));

logger.info(`CIMIS Mobile in ${config.env} mode, serving ${assetPath}`);

app.listen(config.server.port, function () {
  logger.info(`CIMIS Mobile app listening on port ${config.server.port}`);
});


/**
 * Startup to the dataloader
 */

// run every 4 hours
setInterval(() => {
  dataLoader.run();
}, 1000 * 60 * 60 * 4);

// run on startup after small delay
setTimeout(() => {
  dataLoader.run();
}, 1000 * 10);