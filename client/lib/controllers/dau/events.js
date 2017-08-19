var eventBus = require('../../eventBus');

module.exports = function(controller) {
  eventBus.on('get-dau-data', (e) => {
    var resp = controller.get(e.id);
    if( e.handler ) e.handler(resp);
  });

  eventBus.on('get-dau-geometry', (e) => {
    var resp = controller.loadGeometry();
    if( e && e.handler ) e.handler(resp);
  });

  eventBus.on('select-dau', (e) => {
    var resp = controller.select(e.id);
    if( e.handler ) e.handler(resp);
  });
}