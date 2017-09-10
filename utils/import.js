'use strict';
var dataLoader = require('../server/lib/cimis-data-loader');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

try {
  dataLoader.run();
} catch(e) {
  console.error(e.stack);
}