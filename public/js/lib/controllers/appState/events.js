var eventBus = require('../../eventBus');

module.exports = function(controller) {
  eventBus.on('set-app-state', (e) => {
    var resp = controller.set(e.state);
    if( e.handler ) e.handler(resp);
  });

  eventBus.on('set-app-map-state', (e) => {
    var resp = controller.setMapState(e.state);
    if( e.handler ) e.handler(resp);
  });
}