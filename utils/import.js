'use strict';

var config = require('../server/config');
var dataLoader = require('../server/lib/cimis-data-loader');

try {
  dataLoader.init(config);
  dataLoader.run();
} catch(e) {
  console.error(e.stack);
}