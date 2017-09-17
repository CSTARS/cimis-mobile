'use strict';

const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
let config = require('./config');
var dataLoader = require('./lib/cimis-data-loader');

// enable CORS
app.use(cors());
app.options('*', cors());


/**
 * Register Controllers
 */
app.use('/cimis', require('./controllers/cimis'));

/**
 * Set static asset path
 */
var assetPath = path.resolve(__dirname, '..', 'client', config.server.assetPath);
app.use(express.static(assetPath));
console.log(`CIMIS Mobile in ${config.env} mode, serving ${assetPath}`);

app.listen(config.server.port, function () {
  console.log(`CIMIS Mobile app listening on port ${config.server.port}`);
});


setInterval(() => {
  dataLoader.run();
}, 1000 * 60 * 60 * 4);

setTimeout(() => {
  dataLoader.run();
}, 1000 * 10);