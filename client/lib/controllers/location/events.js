var eventBus = require('../../eventBus');

module.exports = function(controller) {
  eventBus.on('search-location', (e) => {
    var resp = controller.search(e.query);
    if( e.handler ) e.handler(resp);
  });

  eventBus.on('select-location', (e) => {
    var resp = controller.select(e.location);
    if( e.handler ) e.handler(resp);
  });
}