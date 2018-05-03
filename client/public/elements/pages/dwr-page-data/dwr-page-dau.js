import {PolymerElement} from "@polymer/polymer/polymer-element"
import template from "./dwr-page-dau.html"

import utils from "../../../lib/utils"
import config from "../../../lib/config"

import AppStateInterface from "../../interfaces/AppStateInterface"
import DauInterface from "../../interfaces/DauInterface"
import ElementUtilsInterface from "../../interfaces/ElementUtilsInterface"
import ChartUtilsInterface from "../../interfaces/ChartUtilsInterface"

class DwrPageDau extends Mixin(PolymerElement)
  .with(EventInterface, AppStateInterface, DauInterface, ElementUtilsInterface, ChartUtilsInterface) {

  static get properties() {
    return {
      selectedDauLocation : {
        type : String
      },
      geometry : {
        type : Object,
        value : function() {
          return {state: 'loading'};
        }
      },
      currentZoneData : {
        type : Object,
        value : function() {
          return {};
        }
      }
    }
  }

  static get template() {
    return template;
  }

  ready() {
    super.ready();

    this.map = new google.maps.Map(this.$.zoneMap, config.etoMap.options);
    this.map.data.addListener('click', e => this._onRegionClick(e));

    window.addEventListener('resize', () => this._redraw());

    this.toggleState('loading');
  }

  /**
   * @method _onDauGeometryUpdate
   * @description via DauInterface. Firese when dau geometry state updates
   */
  _onDauGeometryUpdate(e) {
    if( e.state !== 'loaded' ) return;

    this.geometry = e;
    this.map.data.addGeoJson(this.geometry.payload);

    // make sure we weren't waiting on geometry
    this._onAppStateUpdate(this.appState || {});
  }

  /**
   * @method _onRegionClick
   * @description bound to google maps click event (See constructor)
   * 
   * @param {Object} e google maps click event
   */
  _onRegionClick(e) {
    if( !e.feature ) return;

    window.location.hash = '#data/dauZones/'+this._getRegionNumber(e.feature);
  }

  /**
   * @method _onAppStateUpdate
   * 
   * @param {*} e 
   */
  async _onAppStateUpdate(e) {
    this.appState = e;

    // check app state
    if( e.section !== 'data' || e.mapState !== 'dauZones'  ) return;
    // make sure we have geometry
    if( this.geometry.state !== 'loaded' ) return;
    // check if we have already rendered location
    if( !e.selectedDauLocation || this.selectedDauLocation === e.selectedDauLocation ) return;

    this.selectedDauLocation = e.selectedDauLocation;

    this.currentZoneData = await this._getDauData(this.selectedDauLocation)
    this._render();
  }

  /**
   * @method _render
   * @description main render function.  setup map and charts
   */
  _render() {
    this.toggleState(this.currentZoneData.state);
    if( this.currentZoneData.state !== 'loaded' ) return;

    // set map styles
    this.map.data.setStyle(function(feature) {
      var label = this._getRegionNumber(feature);
      if( label+'' === this.selectedDauLocation ){
        return {
          fillColor: '#2196f3',
          strokeColor: '#fff',
          fillOpacity : .6,
          strokeWeight: 1
        };
      } else {
        return {
          fillColor: '#333',
          strokeColor: '#fff',
          fillOpacity : .2,
          strokeWeight: 1
        };
      }
    }.bind(this));


    this.sortedDates = utils.sortDates(this.currentZoneData.payload.data);

    // eto chart
    this.datatables = [];
    this.dt = new google.visualization.DataTable();
    this.dt.addColumn('date', 'Date');
    this.dt.addColumn('number', 'Avg ETo');
    this.datatables.push(this.dt);

    this.sortedDates.forEach(function(date, index){
      var d = this.currentZoneData.payload.data[date];
      var arr = [new Date(date)];

      arr.push(parseFloat(d) || 0);

      this.dt.addRow(arr);
    }.bind(this));

    // if first pass, create chart object
    if( !this.chart ) {
      this.chart = new google.visualization.LineChart(this.$.chart);
      this.charts.push(this.chart);
      this.chartOptions.push(config.dataPages.dauZones.chartOptions)
    }

    this._redraw();
  }

  /**
   * @method _redraw
   * @description make sure the map and charts are rendered to screen size
   */
  _redraw() {
    if( !this.map ) return;
    this._redrawCharts();

    this.debounce('redrawMap', () => {
      google.maps.event.trigger(this.map, "resize");
      utils.map.fitToFeature(this.selectedDauLocation, this.map, this._getRegionNumber);
    }, 50);
  }

  /**
   * @method _getRegionNumber
   * @description given a google maps geojson feature return the
   * dau_code property
   * 
   * @param {Object} feature google maps geojson feature
   */
  _getRegionNumber(feature) {
    return feature.getProperty('dau_code');
  } 
}

window.customElements.define('dwr-page-dau', DwrPageDau);