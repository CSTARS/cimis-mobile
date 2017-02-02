var eventBus = require('../../eventBus');

module.exports = function(controller) {
  eventBus.on('get-eto-zone-data', (e) => {
    var resp = controller.get(e.id);
    if( e.handler ) e.handler(resp);
  });

  eventBus.on('get-eto-zone-geometry', (e) => {
    var resp = controller.loadGeometry();
    if( e && e.handler ) e.handler(resp);
  });

  eventBus.on('select-eto-zone', (e) => {
    var resp = controller.select(e.id);
    if( e.handler ) e.handler(resp);
  });
}