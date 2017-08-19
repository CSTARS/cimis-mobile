var store = require('../redux/store');

function getHost() {
  // HACK for cyclical dependency
  return require('../redux/store').getState().config.host;
}

module.exports = {
  getHost : getHost
}