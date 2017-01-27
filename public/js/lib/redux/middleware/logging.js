module.exports = function(store) {
  return function(next) {
    return function(action) {
      console.groupCollapsed(action.type);
      console.log(`DISPATCHING:`, action, store.getState());
      state = next(action);
      console.log(`COMPLETE: ${action.type}`, store.getState());
      console.groupEnd(action.type);
    }
  }
}