import {PolymerElement} from "@polymer/polymer/polymer-element"
import template from "./dwr-page-map.html"

import utils from "../../lib/utils"
import EtoOverlay from "../../lib/map/etoOverlay"

import AppStateInterface from "../interfaces/AppStateInterface"
import DauInterface from "../interfaces/DauInterface"
import EtoZonesInterface from "../interfaces/EtoZonesInterface"
import StationInterface from "../interfaces/StationInterface"
import CimisGridInterface from "../interfaces/CimisGridInterface"
import ElementUtilsInterface from "../interfaces/ElementUtilsInterface"

class DwrPageMap extends Mixin(PolymerElement)
    .with(EventInterface, AppStateInterface, CimisGridInterface, 
        StationInterface, DauInterface, EtoZonesInterface, ElementUtilsInterface) {
  
  static get properties() {
    return {
      appState: {
        type: Object,
        value : () => ({})
      },
      
      dauGeometry: {
        type: Object,
        value : () => ({})
      },

      etoGeometry: {
        type: Object,
        value : () => ({state: 'loading'})
      },

      location : {
        type : String,
        value : '',
        observer : '_onLocationUpdate'
      },

      dates: {
        type: Array,
        value : () => []
      },
      selectedCimisGrid : {
        type: String
      },
      selectedCimisGridData : {
        type : Object
      }
    }
  }

  static get template() {
    return template;
  }

  ready() {
    super.ready();

    this.latLng = new google.maps.LatLng(38.033291, -119.961762);
    var mapOptions = {
      center: { lat: 38.033291, lng: -119.961762 },
      zoom: 5,
      mapTypeControl : false,
      streetViewControl : false,
      panControl : false,
      zoomControlOptions : {
        style : 'LARGE'
      }
    };
    this.map = new google.maps.Map(this.$.map, mapOptions);

    this.map.data.setStyle({visible: false});

    google.maps.event.addListener(this.map, 'click', (e) => this._onMapClick(e));
    this.map.data.addListener('click', this._onRegionClick.bind(this));

    this.MasterController().on('select-location', (e) => {
      var ll = {
        lat : e.location.latitude,
        lng : e.location.longitude
      }
      setTimeout(() => this.map.setCenter(ll), 200);
    });

    this._getCimisGridDates();
    this._getCimisStations();
  }

  _onDauGeometryUpdate(e) {
    this.dauGeometry = e;
    if( e.state === 'loaded' && this.appState.mapState === 'dauZones' ) {
      this._render();
    }
  }

  /**
   * @method _onEtoZonesGeometryUpdate
   * @param {Object} e eto zone geometry state object
   */
  _onEtoZonesGeometryUpdate(e) {
    this.etoGeometry = e;
    if( this.appState.mapState === 'etoZones' ) {
      this._render();
    }
  }

  _onAppStateUpdate(e) {
    this.appState = e;
    if( e.section !== 'map' ) return;

    if( e.mapState === 'cimisGrid' && this.location !== e.selectedCimisLocation ) {
      this.location = e.selectedCimisLocation;
    }

    this.debounce('resizeMap', () => {
      google.maps.event.trigger(this.map, 'resize');
      this.map.setCenter(this.latLng);
    }, 50);

    if( this.renderedMapState === e.mapState ) return;

    this._render();
  }

  /**
   * @method _onLocationUpdate
   * @description bound to 'location' property observer
   */
  _onLocationUpdate() {
    if( !this.location ) return;

    var parts = this.location.split('-').map(p => parseInt(p));
    var location = this._gridToBounds(parts[0], parts[1])[0];

    setTimeout(() => {
      if( !this.map ) return;
      this.map.setCenter({
        lat: location[1], 
        lng: location[0]
      });
    }, 300);
  }


  _render() {
    if( !this.map || this.appState.section !== 'map' ) return;

    // we only need to render a map state once
    if( this.renderedMapState === this.appState.mapState ) return;

    // if we are showing etoZones and they are not loaded, return
    if( this.appState.mapState === 'etoZones' && 
        this.etoGeometry.state !== 'loaded' ) {
      return;
    }

    // if we are showing dauZones and they are not loaded, return
    if( this.appState.mapState === 'dauZones' && 
        this.dauGeometry.state !== 'loaded' ) {
      return;
    }

    this.debounce('_renderAsync', () => this._renderAsync(), 50);
  }

  _renderAsync() {
    if( this.renderedMapState === this.appState.mapState ) return;

    // clear current data layer
    this.map.data.forEach((feature) => {
      this.map.data.remove(feature);
    });
    this.map.data.setStyle({visible: false});

    // remove a cimis grid if one exists
    this._clearCurrentGrid();

    if( this.appState.mapState === 'etoZones' || this.appState.mapState === 'dauZones' ) {

      if( this.appState.mapState === 'etoZones' ) this.map.data.addGeoJson(this.etoGeometry.payload);
      else this.map.data.addGeoJson(this.dauGeometry.payload);

      this.map.data.setStyle((feature) => {
        if( this.appState.mapState === 'dauZones' ) {
          return {
            fillColor: '#aaaaaa',
            strokeColor: '#ffffff',
            fillOpacity : .6,
            strokeWeight: 1
          };
        }

        var label = this._getRegionNumber(feature);

        return {
          fillColor: this._getEtoZoneGeometry(label).properties.color,
          strokeColor: '#ffffff',
          fillOpacity : .6,
          strokeWeight: 1
        };
      });

      this._clearCurrentGrid();
    } else {
      this.map.data.setStyle({visible: false});
    }

    if( this.appState.mapState === 'cimisStations' ) {
      this.showStationMarks();
    } else {
      this.hideStationMarks();
    }

    this.renderedMapState = this.appState.mapState;
  }

  _getRegionNumber(feature) {
    var zone = feature.getProperty('zone');
    if( zone ) return zone;
    return feature.getProperty('dau_code');
  }

  _onRegionClick(e) {
    if( !e.feature ) {
      return;
    }

    this.latLng = e.latLng;

    if( e.feature.getProperty('dauco') ) {
      window.location.hash = '#data/'+this.appState.mapState+'/'+this._getRegionNumber(e.feature);
    } else{
      window.location.hash = '#data/'+this.appState.mapState+'/'+this._getRegionNumber(e.feature);
    }
  }

  _onMapClick(e){
    if( this.appState.mapState !== 'cimisGrid' ) return;

    var storage = {
      latitude : e.latLng.lat(),
      longitude : e.latLng.lng()
    }

    if( window.localStorage ) {
      window.localStorage.setItem('cimis-location', JSON.stringify(storage));
    }

    this.latLng = e.latLng;
    this.grid = this._llToGrid(this.latLng);

    var id = this.grid.row+'-'+this.grid.col;
    this._renderGrid(this.grid.bottomLeft[1], this.grid.bottomLeft[0], 
                    this.grid.topRight[1], this.grid.topRight[0], id);

    this._setAppState({
      selectedCimisLocation : id
    });

    this._getCimisGridData(id)
        .then(e => this._onCimisDataUpdate(e));
  }

  _onCimisDataUpdate(e) {
    if( e.state === 'loading' && this.overlay ) {
      return this.overlay.setValue('<iron-icon icon="cached" set-size></iron-icon>');
    }
      
    if( e.state !== 'loaded') return;

    this.debounce('_onCimisDataUpdate', function() {
      this._onGridDataUpdateAsync(e);
    }, 50);
  }

  _onGridDataUpdateAsync(e) {
    this.selectedCimisGridData = e;

    this.ga('gridview', window.userType || 'unknown', this.selectedCimisGrid);

    var payload = this.selectedCimisGridData.payload;

    var html;
    if( payload.data[this.yesterday] && payload.data[this.yesterday].ETo !== undefined ) {
      html = '<div>'+payload.data[this.yesterday].ETo.toFixed(1)+'</div><div>mm</div>';
    } else {
      return this.overlay.setValue('<iron-icon icon="error" set-size style="color: red"></iron-icon>');
    }

    if( !this.overlay ) {
      var id = payload.location.row+'-'+payload.location.col;
      var bounds = payload.location.bounds;
      this._renderGrid(bounds[1][1], bounds[0][0], bounds[0][1], bounds[1][0]);
    }

    this.overlay.setValue(html);
  }

  _renderGrid(bottom, left, top, right, id) {
    this.bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(bottom, left),
        new google.maps.LatLng(top, right)
    );

    var polygon = [
      {lat: bottom, lng: left},
      {lat: top, lng: left},
      {lat: top, lng: right},
      {lat: bottom, lng: right},
      {lat: bottom, lng: left}
    ];

    this._clearCurrentGrid();

    this.rectangle = new google.maps.Polygon({paths: polygon});
    this.rectangle.setMap(this.map);

    this.overlay = new EtoOverlay(this.bounds, this.map);
    if( this.overlay.div_ ) {
      this.overlay.setValue('<iron-icon icon="cached" set-size></iron-icon>');
    }

    google.maps.event.addListener(this.rectangle, 'click', function(){
      window.location = '#data/cimisGrid/'+id;
    });
  }

  _clearCurrentGrid() {
    if( this.rectangle ) this.rectangle.setMap(null);
    if( this.overlay ) this.overlay.setMap(null);
  }

  // zoomToBounds() {
  //   if( !this.bounds ) return;
  //   this.map.fitBounds(this.bounds);
  // }


  // get the latest date
  _onCimisDatesUpdate(e) {
    if( e.state !== 'loaded' ) return;

    this.dates = e;

    var dates = utils.sortDates(this.dates.payload);
    this.yesterday = dates[dates.length-1];
  }

  showStationMarks() {
    for( var key in this.stations ) {
      this.stations[key].marker.setMap(this.map);
    }
  }

  hideStationMarks() {
    for( var key in this.stations ) {
      this.stations[key].marker.setMap(null);
    }
  }

  _onStationsUpdate(e) {
    if( e.state !== 'loaded' ) return;
    this.stations = e.payload;

    for( var key in this.stations ) {
      this.stations[key].marker = this._createMarker(key, this.stations[key]);
    }
  }

  _createMarker(key, latlng) {
    var marker = new google.maps.Marker({
      position: Object.assign({}, this.stations[key]),
      station_id : key,
      title: 'Cimis Station: '+key
    });

    marker.addListener('click', function(e) {
      window.location.hash = 'data/cimisStations/'+key;
    });

    return marker;
  }

  ga(name, type, value) {
    if( !window.ga ) return;
    ga('send', 'event', name, type, value, 1);
  }
}

window.customElements.define('dwr-page-map', DwrPageMap);