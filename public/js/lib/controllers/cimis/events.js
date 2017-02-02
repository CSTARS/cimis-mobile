var eventBus = require('../../eventBus');

module.exports = function(controller) {
  eventBus.on('get-cimis-grid-data', (e) => {
    var resp = controller.get(e.id);
    if( e.handler ) e.handler(resp);
  });

  eventBus.on('get-cimis-grid-dates', (e) => {
    var resp = controller.loadDates();
    if( e && e.handler ) e.handler(resp);
  });

  eventBus.on('select-cimis-grid', (e) => {
    var resp = controller.select(e.id);
    if( e.handler ) e.handler(resp);
  });
}