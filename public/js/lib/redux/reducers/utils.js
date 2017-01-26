function assign(state, newState) {
  return Object.assign({}, state, newState);
}

module.exports = {
  assign : assign
}