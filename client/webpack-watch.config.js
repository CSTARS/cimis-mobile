const path = require('path');
const BUILD_IE = true;

let config = require('@ucd-lib/cork-app-build').watch({
  root : path.join(__dirname, 'public'),
  entry : 'elements/dwr-app.js',
  ie : 'ie-bundle.js',
  preview : 'js',
  clientModules : 'node_modules'
}, BUILD_IE);

module.exports = config;