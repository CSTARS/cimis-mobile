var redux = require('redux');

module.exports = redux.createStore(
                    require('./reducers'),
                    redux.applyMiddleware(
                      require('./middleware/api')
                      ,require('./middleware/logging')
                    )
                  );