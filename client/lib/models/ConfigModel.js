var BaseModel = require('cork-app-utils').BaseModel;
var ConfigStore = require('../stores/ConfigStore');

class ConfigModel extends BaseModel {

  constructor() {
    super();

    this.store = ConfigStore;
    this.getApiHost()
        .then(e => this.store.setHost(e));

    this.registerIOC('ConfigModel');
  }

  /**
   * Get the current host provided in config file.
   * @returns {string} - host url
   */
  async getApiHost() {
    if( this.apiHost ) {
      return this.apiHost;
    }

    var host = this.store.data.apiHost;
    var envVars = this.getEnv();
    host = host[envVars.location][envVars.env];

    this.apiHost = host;
    console.log('Current API ENV', envVars);
    console.log('API HOST', host);

    return host;
  }

  get() {
    return this.store.data;
  }

}

module.exports = new ConfigModel();