'use strict';

var confit = require('confit');
var path = require('path');
var dataLoader = require('../lib/cimis-data-loader');
var basedir = path.join(__dirname, '../config');
console.log(basedir);

confit(basedir).
  create(function (err, config) {

    if( err ) {
      console.error(err);
      process.exit();
    }

    try {
      dataLoader.init(config);
      dataLoader.run();
    } catch(e) {
      console.error(e.stack);
    }

  }
);
