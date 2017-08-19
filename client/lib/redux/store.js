var redux = require('redux');

var store = redux.createStore(
                    require('./reducers'),
                    redux.applyMiddleware(
                      require('./middleware/api')
                      ,require('./middleware/logging')
                    )
                  );

require('./observers')(store);

module.exports = store;