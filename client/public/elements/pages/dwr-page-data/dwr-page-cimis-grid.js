import {PolymerElement} from "@polymer/polymer/polymer-element"
import template from "./dwr-page-cimis-grid.html"

import AppStateInterface from "../../interfaces/AppStateInterface"
import CimisGridInterface from "../../interfaces/CimisGridInterface"
import ToggleStateInterace from "../../interfaces/ToggleStateInterace"

class DwrPageCimisGrid extends Mixin(PolymerElement)
    .with(EventInterface, AppStateInterface, CimisGridInterface, ToggleStateInterace) {

  static get template() {
    return template;
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
          position : 'none'
        }
      },
      {
        //chart : {
          title : 'Temperature Min/Max/Dew (^C)',
        //},
        curveType: 'function',
        height : 550,
        legend : {
          position : 'none'
        }
      },
      {
        //chart : {
          title : 'Radiation Short/Long (MW/h)',
        //},
        curveType: 'function',
        height : 550,
        legend : {
          position : 'none'
        }
      },
      {
        //chart : {
          title : 'Wind Speed (m/s)',
        //},
        curveType: 'function',
        height : 550,
        legend : {
          position : 'none'
        }
      }
    ];

    this.charts = null;
    this.datatables = [];
    this.resize();

    this.toggleState('loading');

    window.addEventListener('resize', () => {
      if( !this.active ) return;
      this.resize();
      this.redraw();
    });
  }

  resize() {
    if( !this.active ) return;
    var size = 550;
    if( window.innerWidth < 768 ) {
      size = 450;
    }

    for( var i = 0; i < this.options.length; i++ ) {
      this.options[i].height = size;
    }
  }

  createDataTables() {
    this.datatables = [];
    var d, arr;

    // eto chart
    var dt = new google.visualization.DataTable();
    dt.addColumn('string', 'Date');
    dt.addColumn('number', 'ETo');

    this.sortedDates.forEach(function(date){
      d = this.currentGridData.payload.data[date];
      arr = [date];

      arr.push(d.ETo || 0);

      dt.addRow(arr);
    }.bind(this));

    this.datatables.push(dt);

    // temp chart
    dt = new google.visualization.DataTable();
    dt.addColumn('string', 'Date');
    dt.addColumn('number', 'Dewpoint Temperature');
    dt.addColumn('number', 'Max Temperature');
    dt.addColumn('number', 'Min Temperature');

    this.sortedDates.forEach(function(date){
      d = this.currentGridData.payload.data[date];
      arr = [date];

      arr.push(d.Tdew || 0);
      arr.push(d.Tx || 0);
      arr.push(d.Tn || 0);

      dt.addRow(arr);
    }.bind(this));

    this.datatables.push(dt);

    // Radiation chart
    dt = new google.visualization.DataTable();
    dt.addColumn('string', 'Date');
    dt.addColumn('number', 'Longwave Radiation');
    dt.addColumn('number', 'Shortwave Radiation');

    this.sortedDates.forEach(function(date){
      d = this.currentGridData.payload.data[date];
      arr = [date];

      arr.push(d.Rnl || 0);
      arr.push(d.Rso || 0);

      dt.addRow(arr);
    }.bind(this));

    this.datatables.push(dt);

    // wind speed chart
    dt = new google.visualization.DataTable();
    dt.addColumn('string', 'Date');
    dt.addColumn('number', 'Wind Speed');


    this.sortedDates.forEach(function(date){
      d = this.currentGridData.payload.data[date];
      arr = [date];

      arr.push(d.U2 || 0);

      dt.addRow(arr);
    }.bind(this));

    this.datatables.push(dt);
  }

  _onAppStateUpdate(e) {
    if( this.selected === e.selectedCimisLocation ) return;
    this.selected = e.selectedCimisLocation;

    if( !this.selected ) return;
    this._getCimisGridData(this.selected)
          .then(e => this._onCimisDataUpdate(e));
  }

  _onCimisDataUpdate(e) {
    this.currentGridData = e;
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
    if( this.currentGridData.state !== 'loaded' ) {
        return;
    }

    var payload = this.currentGridData.payload;

    this.sortedDates = this._sortDates(payload.data);
    this.$.gridLabel.innerHTML = 'Cell: '+payload.location.row+', '+payload.location.col +
      ' <a style="float:right" href="/cimis/'+payload.location.row+'/'+payload.location.col+
      '" target="_blank">API</a>';


    this.createDataTables();

    if( !this.charts ) {
      this.charts = [];
      this.$.charts.innerHTML = '';

      for( var i = 0; i < this.datatables.length; i++ ) {

        var decor = document.createElement('paper-material');
        var root = document.createElement('div');
        decor.appendChild(root);
        this.$.charts.appendChild(decor);

        //this.charts.push(new google.charts.Line(root));
        this.charts.push(new google.visualization.LineChart(root));
      }
    }

    this.resize();

    for( var i = 0; i < this.datatables.length; i++ ) {
      this.charts[i].draw(this.datatables[i], this.options[i]);
    }
  }

  _onActive() {
    if( !this.active ) return;

    this.resize();
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

    this.resize();

    for( var i = 0; i < this.datatables.length; i++ ) {
      this.charts[i].draw(this.datatables[i], this.options[i]);
    }
  }
}

window.customElements.define('dwr-page-cimis-grid', DwrPageCimisGrid);