var BaseModel = require('@ucd-lib/cork-app-utils').BaseModel;
var StationStore = require('../stores/StationStore');
var StationService = require('../services/StationService');
var AppUtils = require('../utils');

class StationModel extends BaseModel {

  constructor() {
    super();
    this.store = StationStore;
    this.service = StationService;

    this.tables = {
      'ETo' : {
        params : ['day_asce_eto'],
        units : 'mm'
      },
      'Precip' : {
        params : ['day_precip'],
        units : 'mm'
      },
      'Avg Solar Radiation' : {
        params : ['day_sol_rad_avg'],
        units : 'W/m^2'
      },
      'Avg Vapor Presure' : {
        params : ['day_vap_pres_avg'],
        units : 'kPa'
      },
      'Temperature/Dewpoint' : {
        params : ['day_air_tmp_max', 'day_air_tmp_min', 
                  'day_air_tmp_avg', 'day_dew_pnt'],
        units : 'C'
      },
      'Humidity' : {
        params : ['day_rel_hum_max', 'day_rel_hum_min', 
                  'day_rel_hum_avg'],
        units : '%'
      },
      'Avg Wind Speed' : {
        params : ['day_wind_spd_avg'],
        units : 'm/s'
      }
    }

    this.register('StationModel');
  }

  async getStations() {
    await this.service.getStations();
    return this.store.getStations();
  }

  getData(id) {
    return this.service.getData(id);
  }

  async getChartData(id) {
    var station = await this.getData(id);
    var sortedDates = AppUtils.sortDates(station.payload.data);

    var charts = [];

    for( var title in this.tables ) {
      var chart = {
        title : `${title} (${this.tables[title].units})`,
        columns : [],
        rows : []
      }

      chart.columns.push({type: 'string', label: 'Date'});
      this.tables[title].params.forEach((param) => {
        chart.columns.push({
          type : 'number',
          label : this._formatParamName(param)
        });
      });

      sortedDates.forEach((date) => {
        var row = [];
        var dateData = station.payload.data[date] || {};

        row.push(date);
        this.tables[title].params.forEach((param) => {
          row.push(dateData[param] || 0);
        });

        chart.rows.push(row);
      });

      charts.push(chart);
    }

    return charts;
  }

  _formatParamName(name) {
   return name
            .replace('day_', '')
            .split('_')
            .map((part) => {
              return part.charAt(0).toUpperCase() + part.slice(1);
            })
            .join(' ');
  }
  

}

module.exports = new StationModel();