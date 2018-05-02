const model = require('../models/cimis')

module.exports = async function() {
  let stations = await model.getStations();
  let dates = await model.getDates();
  return {stations, dates};
}