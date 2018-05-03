import {PolymerElement} from "@polymer/polymer/polymer-element"
import template from "./dwr-page-cimis-grid.html"

import utils from "../../../lib/utils"
import config from "../../../lib/config"

import AppStateInterface from "../../interfaces/AppStateInterface"
import CimisGridInterface from "../../interfaces/CimisGridInterface"
import ElementUtilsInterface from "../../interfaces/ElementUtilsInterface"
import ChartUtilsInterface from "../../interfaces/ChartUtilsInterface"

class DwrPageCimisGrid extends Mixin(PolymerElement)
    .with(EventInterface, AppStateInterface, CimisGridInterface, 
        ElementUtilsInterface, ChartUtilsInterface) {

  static get template() {
    return template;
  }

  static get properties() {
    return {
      // currently selected grid state object
      selectedGridData : {
        type : Object,
        value : null
      },

      // currently selected grid id
      selectedGridId : {
        type : String,
        value : null
      }
    }
  }

  ready() {
    super.ready();

    this.params = config.dataPages.cimisGrid.params;
    this.chartOptions = config.dataPages.cimisGrid.options;


    this.toggleState('loading');
  }

  /**
   * @method _createDataTables
   * @description create google chart data table objects from selectedGridData
   */
  _createDataTables() {
    this.datatables = [];
    var d, arr;

    // eto chart
    var dt = new google.visualization.DataTable();
    dt.addColumn('date', 'Date');
    dt.addColumn('number', 'ETo');

    this.sortedDates.forEach(function(date){
      d = this.selectedGridData.payload.data[date];
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
      d = this.selectedGridData.payload.data[date];
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
      d = this.selectedGridData.payload.data[date];
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
      d = this.selectedGridData.payload.data[date];
      arr = [new Date(date)];

      arr.push(d.U2 || 0);

      dt.addRow(arr);
    }.bind(this));

    this.datatables.push(dt);
  }

  /**
   * @method _onAppStateUpdate
   * @description via AppStateInterface. Called when app state updates.  if
   * we are in the data section and have a selectedGridId that has not been
   * rendered, render charts 
   */
   _onAppStateUpdate(e) {
    if( !e.selectedCimisLocation || e.section !== 'data' ) return;
    if( this.selectedGridId === e.selectedCimisLocation ) return;
    this.selectedGridId = e.selectedCimisLocation;

    this.toggleState('loading');
    
    this._renderData();
  }

  /**
   * @method _renderData
   * @description simple debounce for render in its called in sequence
   */
  _renderData() {
    this.debounce('_renderData', () => this._renderDataAsync(), 50);
  }

  /**
   * @method _renderDataAsync
   * @description request grid data for selected grid.  create data tables
   * and render google charts;
   */
  async _renderDataAsync() {
    this.selectedGridData = await this._getCimisGridData(this.selectedGridId);
    this.toggleState(this.selectedGridData.state);
    if( this.selectedGridData.state !== 'loaded' ) return;
  
    var payload = this.selectedGridData.payload;
    this.sortedDates = utils.sortDates(payload.data);

    this.row = payload.location.row;
    this.col = payload.location.col;

    this._createDataTables();

    // first time through we create our charts
    if( !this.charts.length ) {
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

    this._redrawCharts();
  }



}

window.customElements.define('dwr-page-cimis-grid', DwrPageCimisGrid);