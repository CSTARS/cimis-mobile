import {PolymerElement} from "@polymer/polymer/polymer-element"
import template from "./dwr-page-dau.html"

import utils from "../../../lib/utils"

import AppStateInterface from "../../interfaces/AppStateInterface"
import DauInterface from "../../interfaces/DauInterface"
import ElementUtilsInterface from "../../interfaces/ElementUtilsInterface"

class DwrPageDau extends Mixin(PolymerElement)
  .with(EventInterface, AppStateInterface, DauInterface, ElementUtilsInterface) {

  static get properties() {
    return {
      selected : {
        type : Object
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

    this._getDauGeometry();

    this.map = new google.maps.Map(this.$.zoneMap, this.mapOptions);
    this.map.data.addListener('click', this._onRegionClick.bind(this));

    window.addEventListener('resize', this.redraw.bind(this));
    window.addEventListener('hashchange', this._onActive.bind(this));

    this.toggleState('loading');
  }

  _onActive() {
    if( !this.active ) return;

    var parts = window.location.hash.replace(/#/,'').split('/');
    if( parts.length >= 3 ) {
      this._selectZone(parts[2]);
    }
  }

  _onDauGeometryUpdate(e) {
    if( e.state !== 'loaded' ) return;

    this.geometry = e;
    this.map.data.addGeoJson(this.geometry.payload);
    this.redrawMap();
    this._renderData();
  }

  _onRegionClick(e) {
    if( !e.feature ) {
      return;
    }
    window.location.hash = '#data/dauZones/'+this.getRegionNumber(e.feature);
    this._onActive();
  }

  _selectZone(id) {
    this._setAppState({
      selectedDauLocation : id
    });
  }

  _onAppStateUpdate(e) {
    if( this.selected === e.selectedDauLocation ) return;
    this.selected = e.selectedDauLocation;

    if( !this.active ) return;
    this._getDauData(this.selected)
        .then(e => this._onDauDataUpdate(e));
  }

  _onDauDataUpdate(e) {
    this.currentZoneData = e;

    if( this.geometry.state !== 'loaded' ) {
      return;
    }

    this._renderData();
  }

  _renderData() {
    this.debounce('_renderData', function() {
      this._renderDataAsync();
    }, 50);
  }

  _renderDataAsync() {
    this.toggleState(this.currentZoneData.state);

    if( this.currentZoneData.state !== 'loaded' ) {
      return;
    }

    this.map.data.setStyle(function(feature) {
      var label = this.getRegionNumber(feature);
      if( label+'' === this.selected ){
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

    this.redrawMap();
    this.onZoneDataLoad();
  }

  onZoneDataLoad() {
    this.sortedDates = this._sortDates(this.currentZoneData.payload.data);

    // eto chart
    this.dt = new google.visualization.DataTable();
    this.dt.addColumn('string', 'Date');
    this.dt.addColumn('number', 'Avg ETo');

    this.sortedDates.forEach(function(date, index){
      var d = this.currentZoneData.payload.data[date];
      var arr = [date];

      arr.push(parseFloat(d) || 0);

      this.dt.addRow(arr);
    }.bind(this));

    if( !this.chart ) {
      this.chart = new google.visualization.LineChart(this.$.chart);
      this.options = {
        title : 'ETo - Evapotranspiration (mm)',
        curveType: 'function',
        height : 550,
        interpolateNulls : true,
        animation : {
          easing : 'out',
          startup : true
        }
      }
    }

    this.redrawChart();
  }

  redraw() {
    this.redrawChart();
    this.redrawMap();
  }

  redrawChart() {
    if( !this.active || !this.chart) return;

    this.debounce('redrawChart', () => {
      this.chart.draw(this.dt, this.options);
    });
  }

  redrawMap() {
    if( !this.active || !this.map ) return;

    this.debounce('redrawMap', () => {
      google.maps.event.trigger(this.map, "resize");
      utils.map.fitToFeature(this.selected, this.map, this.getRegionNumber);
    }, 50);
  }

  getRegionNumber(feature) {
    return feature.getProperty('dau_code');
  } 
}

window.customElements.define('dwr-page-dau', DwrPageDau);