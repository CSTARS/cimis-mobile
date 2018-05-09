import {PolymerElement, html} from '@polymer/polymer';
import template from "./dwr-page-map.html"

import utils from "../../lib/utils"
import config from "../../lib/config"
import EtoOverlay from "../../lib/map/etoOverlay"

import AppStateInterface from "../interfaces/AppStateInterface"
import DauInterface from "../interfaces/DauInterface"
import EtoZonesInterface from "../interfaces/EtoZonesInterface"
import StationInterface from "../interfaces/StationInterface"
import CimisGridInterface from "../interfaces/CimisGridInterface"
import ElementUtilsInterface from "../interfaces/ElementUtilsInterface"
import GeolocationInterface from "../interfaces/GeolocationInterface"

class DwrPageMap extends Mixin(PolymerElement)
    .with(EventInterface, AppStateInterface, CimisGridInterface, 
        StationInterface, DauInterface, EtoZonesInterface, ElementUtilsInterface, GeolocationInterface) {
  
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

      selectedCimisLocation : {
        type : String,
        value : '',
        observer : '_onSelectedCimisLocationUpdate'
      },

      dates: {
        type: Array,
        value : () => []
      },
      selectedCimisGrid : {
        type: String
      },
      active : {
        type : Boolean,
        value : false,
        observer : '_onActiveChange'
      }
    }
  }

  static get template() {
    let tag = document.createElement('template');
    tag.innerHTML = template;
    return tag;
  }

  async ready() {
    super.ready();

    let options = config.mainMap.options;
    this.latLng = new google.maps.LatLng(options.center.lat, options.center.lng);
    
    /**
     * Safari HACK!!!!
     * Safari dies adding markers to map when div is in shadow dom... so
     * we are moving it to root document and controlling like a modal :/
     */
    this.shadowRoot.removeChild(this.$.map);
    document.body.appendChild(this.$.map);

    this.map = new google.maps.Map(this.$.map, options);
    this.map.data.setStyle({visible: false});

    google.maps.event.addListener(this.map, 'click', (e) => this._onMapClick(e));
    this.map.data.addListener('click', this._onRegionClick.bind(this));

    // set current date
    this.dates = (await this._getCimisGridDates()).payload;
    var dates = utils.sortDates(this.dates);
    this.yesterday = dates[dates.length-1];

    // set current stations
    this.stations = (await this._getCimisStations()).payload;
    for( var key in this.stations ) {
      this.stations[key].marker = this._createMarker(key, this.stations[key]);
    }
  }

  _onActiveChange() {
    this.$.map.style.display = this.active ? 'block' : 'none';
  }

  /**
   * @method _onSelectedGeolocationUpdate
   * @description via GeolocationInterface, fired when location is selected 
   * by user
   * 
   * @param {Object} e selected state
   */
  _onSelectedGeolocationUpdate(e) {
    var ll = {
      lat : e.location.latitude,
      lng : e.location.longitude
    }
    setTimeout(() => this.map.setCenter(ll), 200);
  }

  /**
   * @method _onDauGeometryUpdate
   * @description via DauInterface.  called when dau geometry state updates
   * 
   * @param {Obect} e dau geometry state object
   */
  _onDauGeometryUpdate(e) {
    this.dauGeometry = e;

    // if we are waiting to render dau geometry, show it now
    if( e.state === 'loaded' && 
      this.appState.section === 'map' &&
      this.appState.mapState === 'dauZones' ) {
      this._render();
    }
  }

  /**
   * @method _onEtoZonesGeometryUpdate
   * @description via EtoZoneInterface.  called when Eto zone geometry
   * state udpates.
   * 
   * @param {Object} e eto zone geometry state object
   */
  _onEtoZonesGeometryUpdate(e) {
    this.etoGeometry = e;

    // if we are waiting to render eto geometry, show it now
    if( e.state === 'loaded' && 
      this.appState.section === 'map' &&
      this.appState.mapState === 'etoZones' ) {
      this._render();
    }
  }

  /**
   * @method _onAppStateUpdate
   * @description via AppStateInterface. called when app state updates
   * 
   * @param {Object} e 
   */
  _onAppStateUpdate(e) {
    this.appState = e;
    // if we are not showing map, we are done
    if( e.section !== 'map' ) return;

    // if the selected cimis grid updated, set it
    // it's wired to an observer will fill fire off changes
    if( e.mapState === 'cimisGrid' && 
      this.selectedCimisLocation !== e.selectedCimisLocation ) {
      this.selectedCimisLocation = e.selectedCimisLocation;
    }

    // if the mapState hasn't updated, we are done
    if( this.renderedMapState === e.mapState ) return;

    // make sure the map is center where we expect it to be as it might
    // have been display:none and resized
    this.debounce('resizeMap', () => {
      google.maps.event.trigger(this.map, 'resize');
      this.map.panTo(this.latLng);
    }, 50);

    this._render();
  }

  /**
   * @method _onLocationUpdate
   * @description bound to 'location' property observer
   */
  _onSelectedCimisLocationUpdate() {
    if( !this.selectedCimisLocation ) return;

    var parts = this.selectedCimisLocation.split('-').map(p => parseInt(p));
    var location = this._gridToBounds(parts[0], parts[1])[0];

    if( !this.map ) return;
    this.debounce('resizeMap', () => {
      this.map.panTo({
        lat: location[1], 
        lng: location[0]
      });
    }, 50);
  }

  /**
   * @method _render
   * @description main function for getting map layers in order with
   * current appstate
   */
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

    // render is expensive, make sure we are only calling once
    this.debounce('_renderAsync', () => this._renderAsync(), 50);
  }

  /**
   * @method _renderAsync
   * @description _render does most checks for state and buffers
   * this call.  Now actually set the current layer
   */
  _renderAsync() {
    if( this.renderedMapState === this.appState.mapState ) return;

    // clear current data layer
    this.map.data.forEach((feature) => {
      this.map.data.remove(feature);
    });
    this.map.data.setStyle({visible: false});

    // remove a cimis grid if one exists
    this._clearCurrentGrid();

    // if we have dau or eto zones, render geometry
    if( this.appState.mapState === 'etoZones' || 
        this.appState.mapState === 'dauZones' ) {

      if( this.appState.mapState === 'etoZones' ) {
        this.map.data.addGeoJson(this.etoGeometry.payload);
      } else {
        this.map.data.addGeoJson(this.dauGeometry.payload);
      }

      // render layer styles
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

      // make sure we clear any grid geometry
      this._clearCurrentGrid();
    } else {
      // hide any geometry (eto/dau)
      this.map.data.setStyle({visible: false});
    }

    // are we rendering stations?
    if( this.appState.mapState === 'cimisStations' ) {
      this._showStationMarks();
    } else {
      this._hideStationMarks();
    }

    // set the current render state
    this.renderedMapState = this.appState.mapState;
  }

  /**
   * @method _getRegionNumber
   * @description given a google maps geojson feature, return 
   * the feature number.  For eto zones this is the 'zone'
   * property, for dau is the 'dau_code' property.
   * 
   * @param {Object} feature google maps geojson feature
   * 
   * @returns String
   */
  _getRegionNumber(feature) {
    var zone = feature.getProperty('zone');
    if( zone ) return zone;
    return feature.getProperty('dau_code');
  }

  /**
   * @method _onRegionClick
   * @description bound to google maps data layer click event (see constructor)
   * 
   * @param {Object} e 
   */
  _onRegionClick(e) {
    // make sure we have a feature
    if( !e.feature ) return;
    this.latLng = e.latLng;

    // easy check to see if a dau feature or eto feature was clicked on
    if( e.feature.getProperty('dauco') ) {
      window.location.hash = '#data/'+this.appState.mapState+'/'+this._getRegionNumber(e.feature);
    } else{
      window.location.hash = '#data/'+this.appState.mapState+'/'+this._getRegionNumber(e.feature);
    }
  }

  /**
   * @method _onMapClick
   * @description bound to google maps click event (see contructor) 
   * 
   * @param {Object} e google maps click event 
   */
  async _onMapClick(e){
    // we only care about general map clicks for the cimis grid
    if( this.appState.mapState !== 'cimisGrid' ) return;

    // store the current click location
    var storage = {
      latitude : e.latLng.lat(),
      longitude : e.latLng.lng()
    }
    if( window.localStorage ) {
      window.localStorage.setItem('cimis-location', JSON.stringify(storage));
    }
    this.latLng = e.latLng;

    // calc the grid id row-col 
    this.grid = this._llToGrid(this.latLng);

    // render current grid
    var id = this.grid.row+'-'+this.grid.col;
    this._renderGrid(
      this.grid.bottomLeft[1], 
      this.grid.bottomLeft[0], 
      this.grid.topRight[1], 
      this.grid.topRight[0], 
      id
    );

    // set our select grid in the app status 
    this._setAppState({
      selectedCimisLocation : id
    });

    // show we are loading
    if( this.overlay ) {
      this.overlay.setValue('<iron-icon icon="cached" set-size></iron-icon>');
    }
    this.selectedCimisGridData = await this._getCimisGridData(id);

    // set a analytics event
    this.ga('gridview', window.userType || 'unknown', this.selectedCimisLocation);

    // render the google maps grid overlay html
    var payload = this.selectedCimisGridData.payload;
    var html;
    if( payload.data[this.yesterday] && payload.data[this.yesterday].ETo !== undefined ) {
      html = '<div>'+payload.data[this.yesterday].ETo.toFixed(1)+'</div><div>mm</div>';
    } else {
      return this.overlay.setValue('<iron-icon icon="error" set-size style="color: red"></iron-icon>');
    }

    // we don't have an overlay yet?
    // TODO: why is this here
    if( !this.overlay ) {
      var id = payload.location.row+'-'+payload.location.col;
      var bounds = payload.location.bounds;
      this._renderGrid(bounds[1][1], bounds[0][0], bounds[0][1], bounds[1][0], id);
    }

    this.overlay.setValue(html);
  }

  /**
   * @method _renderGrid
   * @description given bbox coordinates and a grid id, render the google maps
   * EtoOverlay geometry
   * 
   * @param {Number} bottom 
   * @param {Number} left 
   * @param {Number} top 
   * @param {Number} right 
   * @param {String} id grid id
   */
  _renderGrid(bottom, left, top, right, id) {
    // used to create eto geometry
    this.bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(bottom, left),
        new google.maps.LatLng(top, right)
    );

    // used as a click handler
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

  /**
   * @method _clearCurrentGrid
   * @description remove current cimis grid geometry objects
   */
  _clearCurrentGrid() {
    if( this.rectangle ) this.rectangle.setMap(null);
    if( this.overlay ) this.overlay.setMap(null);
  }

  /**
   * @method _showStationMarks
   * @description add all pre-created station marker objects to map
   */
  _showStationMarks() {
    for( var key in this.stations ) {
      this.stations[key].marker.setMap(this.map);
    }
  }

  /**
   * @method _hideStationMarks
   * @description remove all precreated station markers from map
   */
  _hideStationMarks() {
    for( var key in this.stations ) {
      this.stations[key].marker.setMap(null);
    }
  }

  /**
   * @method _createMarker 
   * @description create station google maps marker
   * 
   * @param {String} key station id
   * @param {Object} latlng 
   * 
   * @returns {Object} google maps marker
   */  
  _createMarker(key, latlng) {
    var marker = new google.maps.Marker({
      position: Object.assign({}, latlng),
      station_id : key,
      title: 'Cimis Station: '+key
    });

    marker.addListener('click', function(e) {
      window.location.hash = 'data/cimisStations/'+key;
    });

    return marker;
  }

  /**
   * @method ga
   * @description send a google analyics event
   * 
   * @param {String} name 
   * @param {String} type 
   * @param {String} value 
   */
  ga(name, type, value) {
    if( !window.ga ) return;
    ga('send', 'event', name, type, value, 1);
  }
}

window.customElements.define('dwr-page-map', DwrPageMap);