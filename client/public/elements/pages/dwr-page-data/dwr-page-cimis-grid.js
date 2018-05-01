import {PolymerElement} from "@polymer/polymer/polymer-element"
import template from "./dwr-page-cimis-grid.html"

import utils from "../../../lib/utils"

import AppStateInterface from "../../interfaces/AppStateInterface"
import CimisGridInterface from "../../interfaces/CimisGridInterface"
import ElementUtilsInterface from "../../interfaces/ElementUtilsInterface"

class DwrPageCimisGrid extends Mixin(PolymerElement)
    .with(EventInterface, AppStateInterface, CimisGridInterface, ElementUtilsInterface) {

  static get template() {
    return template;
  }

  static get properties() {
    return {
      currentChartSize : {
        type : Array,
        value : () => [0,0]
      }
    }
  }

  ready() {
    super.ready();

    this.params = ['Rnl','Rso','U2', 'ETo', 'Tdew','Tn','Tx'];
    this.data = null;

    this.chartOptions = {
        title : '',
        height : 600,
        vAxes: [{
                title: "Radiation Short/Long (MW/h); Wind Speed (m/s); Temperature Min/Max/Dew (^C);",
                minValue : -5,
                maxValue : 35
              },{
                title: "ETo (mm)",
                minValue : 0,
                maxValue : 10
              }],
        hAxis: {title: "Date"},
        seriesType: "bars",
        series: {
            0: {type: "line", targetAxisIndex:0},
            1: {type: "line", targetAxisIndex:0},
            2: {type: "line", targetAxisIndex:0},
            3: {type: "area", targetAxisIndex:1}

        },
        legend : {
          maxLines : 3
        }
    }

    this.options = [
      {
        //chart : {
          title : 'ETo - Evapotranspiration (mm)',
        //},
        curveType: 'function',
        height : 550,
        legend : {
          position : 'top'
        }
      },
      {
        //chart : {
          title : 'Temperature Min/Max/Dew (^C)',
        //},
        curveType: 'function',
        height : 550,
        legend : {
          position : 'top'
        }
      },
      {
        //chart : {
          title : 'Radiation Short/Long (MW/h)',
        //},
        curveType: 'function',
        height : 550,
        legend : {
          position : 'top'
        }
      },
      {
        //chart : {
          title : 'Wind Speed (m/s)',
        //},
        curveType: 'function',
        height : 550,
        legend : {
          position : 'top'
        }
      }
    ];

    this.charts = null;
    this.datatables = [];

    this.toggleState('loading');

    window.addEventListener('resize', () => this.redraw());
  }

  createDataTables() {
    this.datatables = [];
    var d, arr;

    // eto chart
    var dt = new google.visualization.DataTable();
    dt.addColumn('date', 'Date');
    dt.addColumn('number', 'ETo');

    this.sortedDates.forEach(function(date){
      d = this.currentGridData.payload.data[date];
      arr = [new Date(date)];

      arr.push(d.ETo || 0);

      dt.addRow(arr);
    }.bind(this));

    this.datatables.push(dt);

    // temp chart
    dt = new google.visualization.DataTable();
    dt.addColumn('date', 'Date');
    dt.addColumn('number', 'Dewpoint Temperature');
    dt.addColumn('number', 'Max Temperature');
    dt.addColumn('number', 'Min Temperature');

    this.sortedDates.forEach(function(date){
      d = this.currentGridData.payload.data[date];
      arr = [new Date(date)];

      arr.push(d.Tdew || 0);
      arr.push(d.Tx || 0);
      arr.push(d.Tn || 0);

      dt.addRow(arr);
    }.bind(this));

    this.datatables.push(dt);

    // Radiation chart
    dt = new google.visualization.DataTable();
    dt.addColumn('date', 'Date');
    dt.addColumn('number', 'Longwave Radiation');
    dt.addColumn('number', 'Shortwave Radiation');

    this.sortedDates.forEach(function(date){
      d = this.currentGridData.payload.data[date];
      arr = [new Date(date)];

      arr.push(d.Rnl || 0);
      arr.push(d.Rso || 0);

      dt.addRow(arr);
    }.bind(this));

    this.datatables.push(dt);

    // wind speed chart
    dt = new google.visualization.DataTable();
    dt.addColumn('date', 'Date');
    dt.addColumn('number', 'Wind Speed');


    this.sortedDates.forEach(function(date){
      d = this.currentGridData.payload.data[date];
      arr = [new Date(date)];

      arr.push(d.U2 || 0);

      dt.addRow(arr);
    }.bind(this));

    this.datatables.push(dt);
  }

  async _onAppStateUpdate(e) {
    if( !e.selectedCimisLocation || e.section !== 'data' ) return;
    if( this.selected === e.selectedCimisLocation ) return;
    this.selected = e.selectedCimisLocation;
    this.currentGridData = await this._getCimisGridData(this.selected);
    this._renderData();
  }

  _renderData() {
    this.debounce('_renderData', function() {
      this._renderDataAsync();
    }, 50);
  }

  _renderDataAsync() {
    if( !this.currentGridData ) return;

    this.toggleState(this.currentGridData.state);
    if( this.currentGridData.state !== 'loaded' ) return;
  
    var payload = this.currentGridData.payload;
    this.sortedDates = utils.sortDates(payload.data);

    this.row = payload.location.row;
    this.col = payload.location.col;

    this.createDataTables();

    // first time through we create our charts
    if( !this.charts ) {
      this.charts = [];
      this.$.charts.innerHTML = '';

      for( var i = 0; i < this.datatables.length; i++ ) {

        var decor = document.createElement('paper-material');
        decor.classList.add('chart-card');
        var root = document.createElement('div');
        decor.appendChild(root);
        this.$.charts.appendChild(decor);
        this.charts.push(new google.visualization.LineChart(root));
      }
    }

    this.redraw();
  }

  _onActive() {
    if( !this.active ) return;


    this.redraw();

    var parts = window.location.hash.replace(/#/,'').split('/');
    if( parts.length >= 3 ) {
        this._selectZone(parts[2]);
    }
  }

  _selectZone(id) {
    this._setAppState({
      selectedCimisLocation : id
    });
  }

  redraw() {
    if( !this.charts ) return;

    let w = this.shadowRoot.querySelector('paper-material.chart-card').offsetWidth - 10;
    let h = Math.floor(w * 0.5);
    this._redraw(h, w);

    setTimeout(() => {
      let w = this.shadowRoot.querySelector('paper-material.chart-card').offsetWidth - 10;
      let h = Math.floor(w * 0.5);
      this._redraw(h, w);
    }, 100);
  }

  _redraw(height, width) {
    if( this.currentChartSize[0] === height && this.currentChartSize[1] === width ) return;
    this.currentChartSize = [height, width];

    for( var i = 0; i < this.datatables.length; i++ ) {
      this.options[i].height = height;
      this.options[i].width = width;

      this.charts[i].draw(this.datatables[i], this.options[i]);
    }
  }
}

window.customElements.define('dwr-page-cimis-grid', DwrPageCimisGrid);