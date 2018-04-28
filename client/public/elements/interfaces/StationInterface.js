module.exports = subclass => 
  class StationInterface extends subclass {
      constructor() {
        super();
        this._injectModel('StationModel');
      }

      _getCimisStations() {
        return this.StationModel.getStations();
      }

      _getCimisStationData(id) {
        return this.StationModel.getData(id);
      }

      _getCimisStationChartData(id) {
        return this.StationModel.getChartData(id);
      }
  }