module.exports = function(store) {
  var dispatch = store.dispatch;

  return function(next) {
    return function(action) {

      const {
        types,
        callAPI,
        shouldCallAPI = () => true,
        payload = {}
      } = action

      if (!types) {
        // Normal action: pass it on
        return next(action);
      }

      if (
        !Array.isArray(types) ||
        types.length !== 3 ||
        !types.every(type => typeof type === 'string')
      ) {
        throw new Error('Expected an array of three string types.')
      }

      if (typeof callAPI !== 'function') {
        throw new Error('Expected callAPI to be a function.')
      }

      if (!shouldCallAPI(store.getState())) {
        return;
      }

      const [ requestType, successType, failureType ] = types

      dispatch(Object.assign({}, payload, {
        type: requestType
      }))

      return callAPI((error, response) => {
        if( error ) {
          dispatch(Object.assign({}, payload, {
              error,
              type: failureType
          }));
        } else {
          dispatch(Object.assign({}, payload, {
            response,
            type: successType
          }));
        }
      });
    }
  }
}