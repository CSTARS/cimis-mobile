const bunyan = require('bunyan');
const config = require('./config');

// TODO
// const LoggingBunyan = require('@google-cloud/logging-bunyan').LoggingBunyan;
// const loggingBunyan = new LoggingBunyan();

const logger = bunyan.createLogger({
  name: config.logging.name,
  streams: [
    // Log to the console at 'info' and above
    {
      stream: process.stdout, 
      level: config.logging.level
    }
    // And log to Stackdriver Logging, logging at 'info' and above
    // loggingBunyan.stream(config.logging.level),
  ]
});

module.exports = logger;