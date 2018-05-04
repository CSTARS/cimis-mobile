const path = require('path');

let config = require('@ucd-lib/cork-app-build').watch({
  root : path.join(__dirname, 'public'),
  entry : 'elements/dwr-app.js',
  preview : 'js',
  clientModules : 'node_modules'
});

module.exports = config;