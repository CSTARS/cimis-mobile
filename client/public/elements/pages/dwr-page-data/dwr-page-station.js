import {PolymerElement} from "@polymer/polymer/polymer-element"
import template from "./dwr-page-station.html"

import AppStateInterface from "../../interfaces/AppStateInterface"
import StationInterface from "../../interfaces/StationInterface"
import ElementUtilsInterface from "../../interfaces/ElementUtilsInterface"

class DwrPageCimisStation extends Mixin(PolymerElement)
    .with(EventInterface, AppStateInterface, StationInterface, ElementUtilsInterface) {

  static get properties() {
    return {
      selectedStation : {
        type : String,
        value : ''
      }
    }
  }

  static get template() {
    return template;
  }

  ready() {
    super.ready();

    window.addEventListener('resize', () => {
      if( !this.active ) return;
      this.debounce('_redraw', this._redraw, 200);
    });
  }
  
  _onActive() {
    if( !this.active ) return;

    var parts = window.location.hash.replace(/#/,'').split('/');
    if( parts.length >= 3 ) {
        this._selectStation(parts[2]);
    }
  }

  _selectStation(id) {
    this.selectedStation = id;
    this._render();
  }

  async _render() {
    this.toggleState('loading');
    this.datatables = [];
    this.charts = [];
    this.options = [];
    this.$.charts.innerHTML = '';

    var chartData = await this._getCimisStationChartData(this.selectedStation);

    chartData.forEach((chartInfo) => {
      // init the datatable
      var dt = new google.visualization.DataTable();

      chartInfo.columns.forEach((column) => {
        dt.addColumn(column.type, column.label);
      });
      dt.addRows(chartInfo.rows);

      // create chart options
      this.options.push({
        title : chartInfo.title,
        curveType: 'function',
        height : 550,
        legend : {
          position : 'none'
        }
      });

      // create paper root
      var decor = document.createElement('paper-material');
      var root = document.createElement('div');
      decor.appendChild(root);
      this.$.charts.appendChild(decor);

      this.charts.push(new google.visualization.LineChart(root));
      this.datatables.push(dt);
    });

    this.toggleState('loaded');

    this._redraw();
  }

  _redraw() {
    if( !this.charts ) return;

    // this.resize();

    for( var i = 0; i < this.datatables.length; i++ ) {
      this.charts[i].draw(this.datatables[i], this.options[i]);
    }
  }
}

window.customElements.define('dwr-page-cimis-station', DwrPageCimisStation);