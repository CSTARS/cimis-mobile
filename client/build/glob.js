var bulk = require('bulk-require');
var path = require('path');

window.EventBus = require('cork-app-utils').EventBus;
window.App = bulk(path.join(__dirname, '..', 'lib'), [ '**/*.js', '**/*.json']);