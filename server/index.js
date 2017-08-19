'use strict';


const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
let config = require('./config');

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
  console.log(`Wine-Search app listening on port ${config.server.port}`);
  require('./lib/dataUpdate');
});
