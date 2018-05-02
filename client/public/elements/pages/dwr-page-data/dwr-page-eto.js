import {PolymerElement} from "@polymer/polymer/polymer-element"
import template from "./dwr-page-eto.html"

import utils from "../../../lib/utils"
import config from "../../../lib/config"

import AppStateInterface from "../../interfaces/AppStateInterface"
import EtoZonesInterface from "../../interfaces/EtoZonesInterface"
import ElementUtilsInterface from "../../interfaces/ElementUtilsInterface"

class DwrPageEto extends Mixin(PolymerElement)
  .with(EventInterface, AppStateInterface, EtoZonesInterface, ElementUtilsInterface) {

  static get properties() {
    return {
      selected : {
        type : Object
      },
      geometry : {
        type : Object,
        value : () => null
      },
      currentZoneData : {
        type : Object,
        value : () => ({state : 'loading'})
      },
      selectedEtoZoneLocation : {
        type : String,
        value : null
      },
      appState : {
        type : Object,
        value : () => ({})
      }
    }
  }

  static get template() {
    return template;
  }

  ready() {
    super.ready();
    
    this.now = new Date();
    this.nowWeek = utils.getWeekOfYear(0, this.now);

    this.toggleState('loading');
    
    this.map = new google.maps.Map(this.$.zoneMap, config.etoMap.options);
    this.map.data.addListener('click', this._onRegionClick.bind(this));

    window.addEventListener('resize', this._redraw.bind(this));

    this._onAppStateUpdate(this._getAppState());
  }

  /**
   * @method _onEtoZonesGeometryUpdate
   * @description via EtoZoneInterface, called when eto zone geometry
   * state updates
   * 
   * @param {Object} e eto zone geometry state object
   */
  _onEtoZonesGeometryUpdate(e) {
    if( e.state !== 'loaded' ) return;

    this.geometry = e;
    this.map.data.addGeoJson(this.geometry.payload);

    // fake a app state update in case we are waiting for geometry to load
    this._onAppStateUpdate(this.appState);
  }

  /**
   * @method _onRegionClick
   * @description bound to google maps data click event (see contructor).
   * updates window state to clicked region
   */
  _onRegionClick(e) {
    if( !e.feature ) return;
    window.location.hash = '#data/etoZones/'+this._getRegionNumber(e.feature);
  }

  /**
   * @method _onAppStateUpdate
   * @description via AppStateInterface.  fires when app state updates
   * 
   * @param {Object} e app state object
   */
  async _onAppStateUpdate(e) {
    this.appState = e;

    if( e.section !== 'data' || e.mapState !== 'etoZones' ) return;
    if( !this.geometry || !e.selectedEtoZoneLocation ) return;
    if( this.selectedEtoZoneLocation === e.selectedEtoZoneLocation ) return;
    
    this.selectedEtoZoneLocation = e.selectedEtoZoneLocation;
    
    this.toggleState('loading');
    this.currentZoneData = await this._getEtoZoneData(this.selectedEtoZoneLocation);

    this.toggleState(this.currentZoneData.state);
 
    this._render(); 
  }

  
  _render() {
    // style map
    this.map.data.setStyle((feature) => {
      var label = this._getRegionNumber(feature);
      if( label+'' === this.selectedEtoZoneLocation ){
        this.feature = feature;
        return {
          fillColor: this._getEtoZoneGeometry(label).properties.color,
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
    });

    // grab values from geometry geojson
    debugger;
    var data = this._getEtoZoneGeometry(this.selectedEtoZoneLocation);
    this.$.average.innerHTML = data.properties.avg.toFixed(1);
    this.$.delta.innerHTML = data.properties.delta.toFixed(1);

    this.sortedDates = utils.sortDates(this.currentZoneData.payload.data);

    // do mathz
    var p = [data.properties.p0, data.properties.p1, data.properties.p2]; 
    var h = [0, data.properties.h1, data.properties.h2];
    var signature = utils.fft.ifft(p, h, 52);

    var cumSignature = [], prev = 0;
    for( var i = 0; i < signature.length; i++ ) {
        prev += signature[i]*7;
        cumSignature.push(prev);
    }

    // eto chart
    this.etoDataTable = new google.visualization.DataTable();
    this.etoDataTable.addColumn('string', 'Date');
    this.etoDataTable.addColumn('number', 'Avg ETo');
    this.etoDataTable.addColumn('number', 'Expected ETo');

    var weeks = [utils.getWeekOfYear(2), utils.getWeekOfYear(1), utils.getWeekOfYear(0)];

    var mid = Math.floor(this.sortedDates.length / 2);
    var end = this.sortedDates.length-1;

    this.sortedDates.forEach((date, index) => {
      var d = this.currentZoneData.payload.data[date];
      arr = [date];

      arr.push(parseFloat(d) || 0);

      if( index === 0 ) {
          arr.push(signature[this._weekOffsetHelperCurrent(weeks[0])]);
      } else if( index === mid ) {
          arr.push(signature[this._weekOffsetHelperCurrent(weeks[1])]);
      } else if( index === end ) {
          arr.push(signature[this._weekOffsetHelperCurrent(weeks[2])]);
      } else {
          arr.push(null);
      }

      this.etoDataTable.addRow(arr);
    });

    if( !this.etoChart ) {
      this.etoChart = new google.visualization.LineChart(this.$.eto);
    }

    this.expectedEtoDataTable = new google.visualization.DataTable();
    this.expectedEtoDataTable.addColumn('string', 'Week');
    this.expectedEtoDataTable.addColumn('number', 'Eto');
    this.expectedEtoDataTable.addColumn('number', 'Two Weeks Ago');
    this.expectedEtoDataTable.addColumn('number', 'This Week');

    for( var i = 0; i < signature.length; i++ ) {
      var actualWeek = this._getChartWeekLabel(i);
      var arr = [actualWeek.label, signature[i]];
      
      if( actualWeek.week === weeks[0] ) {
          arr.push(signature[i]);
      } else {
          arr.push(null);
      }
      if( actualWeek.week === weeks[2] ) {
          arr.push(signature[i]);
      } else {
          arr.push(null);
      }

      this.expectedEtoDataTable.addRow(arr);
    }

    if( !this.chart2 ) {
        this.expectedEtoChart = new google.visualization.ComboChart(this.$.expectedEto);
    }

    this.expectedCumEtoDataTable = new google.visualization.DataTable();
    this.expectedCumEtoDataTable.addColumn('string', 'Week');
    this.expectedCumEtoDataTable.addColumn('number', 'Cumulative ETo');
    this.expectedCumEtoDataTable.addColumn('number', 'Two Weeks Ago');
    this.expectedCumEtoDataTable.addColumn('number', 'This Week');

    for( var i = 0; i < cumSignature.length; i++ ) {
        var actualWeek = this._getChartWeekLabel(i);
        var arr = [actualWeek.label, cumSignature[i]];
        
        if( actualWeek.week === weeks[0] ) {
            arr.push(cumSignature[i]);
        } else {
            arr.push(null);
        }
        if( actualWeek.week === weeks[2] ) {
            arr.push(cumSignature[i]);
        } else {
            arr.push(null);
        }

        this.expectedCumEtoDataTable.addRow(arr);
    }

    if( !this.expectedCumEtoChart ) {
      this.expectedCumEtoChart = new google.visualization.ComboChart(this.$.expectedCumEto);
    }

    this._redraw();
  }
  
  /**
   * @method _redraw
   * @description update map to center on feature, redraw charts with given 
   * data tables and options.
   */
  _redraw() {
    if( this.appState.section !== 'data' || 
        this.appState.mapState !== 'mapState' ) {
      return;
    }

    this.debounce('redraw', () => {
      google.maps.event.trigger(this.map, "resize");
      utils.map.fitToFeature(this.selectedEtoZoneLocation, this.map, this._);

      let options = config.dataPages.etoZones;
      if( !this.etoChart ) return;
      this.etoChart.draw(this.etoDataTable, options.etoChartOptions);
      this.expectedEtoChart.draw(this.expectedEtoDataTable, options.expectedEtoOptions);
      this.expectedCumEtoChart.draw(this.expectedCumEtoDataTable, options.expectedEtoCumOptions);
    }, 50);
  }

  /**
   * @method _getRegionNumber
   * @description given a google maps geojson feature, return zone property
   * 
   * @param {Object} feature google maps geojson feature
   * 
   * @returns {String}
   */
  _getRegionNumber(feature) {
    return feature.getProperty('zone');
  }

  
  /**
   * @method _getChartWeekLabel
   * @description given a week number, return start date of that week
   * 
   * @param {Number} week
   * 
   * @return {Object}
   */
  _getChartWeekLabel(week) {
    week = this._weekOffsetHelper(week);
    return {
      week,
      label : this._getDateOfWeek(week)
    }
  }

  /**
   * @method _getDateOfWeek
   * @description helper for _getChartWeekLabel
   * 
   * @param {Number} week
   * 
   * @return {String}
   */
  _getDateOfWeek(week) {
    var y = this.now.getFullYear();
    
    // relative to water year?
    if( this.nowWeek >= 40 ) {
        if( week < 40 ) y++;
    } else {
        if( week >= 40 ) y--;
    }

    var d = (1 + (week - 1) * 7); // 1st of January + 7 days for each week
    d = new Date(y, 0, d);

    return this.months[d.getMonth()]+' '+d.getDate()+', '+y;
  }

  _weekOffsetHelper(w) {
    w = w-12;
    if( w < 0 ) w = w+52; 
    return w;
  }

  _weekOffsetHelperCurrent(w) {
    w = w+12;
    if( w > 52 ) w = w-52; 
    return w;
  }
}

window.customElements.define('dwr-page-eto', DwrPageEto);