module.exports = function(store) {
  return function(next) {
    return function(action) {
      console.log(`DISPATCHING: ${action.type}`, store.getState());
      state = next(action);
      console.log(`COMPLETE: ${action.type}`, store.getState());
    }
  }
}