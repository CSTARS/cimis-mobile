let config = require('@ucd-lib/cork-app-build').dist({
  root : __dirname,
  entry : 'public/elements/dwr-app.js',
  dist : 'dist',
  clientModules : 'public/node_modules'
});

module.exports = config;