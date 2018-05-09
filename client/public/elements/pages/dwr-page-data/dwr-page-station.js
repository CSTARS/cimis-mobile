import {PolymerElement, html} from '@polymer/polymer';
import template from "./dwr-page-station.html"

import config from "../../../lib/config"
import utils from "../../../lib/utils"

import AppStateInterface from "../../interfaces/AppStateInterface"
import StationInterface from "../../interfaces/StationInterface"
import ElementUtilsInterface from "../../interfaces/ElementUtilsInterface"
import ChartUtilsInterface from "../../interfaces/ChartUtilsInterface"

class DwrPageCimisStation extends Mixin(PolymerElement)
    .with(EventInterface, AppStateInterface, StationInterface, ElementUtilsInterface, ChartUtilsInterface) {

  static get properties() {
    return {
      selectedStation : {
        type : String,
        value : ''
      },
      appState : {
        type : Object,
        value : () => ({})
      }
    }
  }

  static get template() {
    let tag = document.createElement('template');    
    tag.innerHTML = template;    
    return tag;
  }

  ready() {
    super.ready();

    window.addEventListener('resize', () => this._redraw());
  }

  /**
   * @method _onAppStateUpdate
   * @description via AppStateInterface.  Called when app state updates
   */
  async _onAppStateUpdate(e) {
    this.appState = e;
    if( e.section !== 'data' || e.mapState !== 'cimisStations' ) return;
    this.selectedStation = e.selectedStation;

    this.toggleState('loading');
    this.selectedStationData = await this._getCimisStationData(this.selectedStation);
    this._render();
  }

  /**
   * @method _render
   * 
   */
  async _render() {
    this.toggleState(this.selectedStationData.state);
    if( this.selectedStationData.state !== 'loaded' ) return;

    var sortedDates = utils.sortDates(this.selectedStationData.payload.data);

    this.chartOptions = [];
    this.datatables = [];
    
    for( var title in config.dataPages.stations ) {
      let c = config.dataPages.stations[title];
      let dt = new google.visualization.DataTable();

      dt.addColumn('date', 'Date');
      c.params.forEach((param) => {
        dt.addColumn('number', this._formatParamName(param));
      });

      let rows = [];
      sortedDates.forEach((date) => {
        let row = [];
        let dateData = this.selectedStationData.payload.data[date] || {};

        row.push(new Date(date));
        c.params.forEach((param) => {
          row.push(dateData[param] || 0);
        });

        rows.push(row);
      });
      dt.addRows(rows);

      // create chart options
      this.chartOptions.push({
        title : `${title} (${c.units})`,
        curveType: 'function',
        height : 550,
        legend : {
          position : 'top'
        }
      });
      this.datatables.push(dt);
    }

    if( !this.charts.length ) {
      this.chartOptions.forEach(() => {
        // create paper root
        var decor = document.createElement('paper-material');
        decor.classList.add('chart-card');
        var root = document.createElement('div');
        decor.appendChild(root);
        this.$.charts.appendChild(decor);

        this.charts.push(new google.visualization.LineChart(root));
      });
    }

    this._redraw();
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

  _redraw() {
    if( this.appState.section !== 'data' || this.appState.mapState !== 'cimisStations' ) return;
    this._redrawCharts();
  }
}

window.customElements.define('dwr-page-cimis-station', DwrPageCimisStation);