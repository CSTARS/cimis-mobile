import {PolymerElement, html} from '@polymer/polymer';
import "@polymer/paper-input/paper-input"
import template from "./dwr-page-location.html"

import AppStateInterface from "../interfaces/AppStateInterface"
import GeolocationInterface from "../interfaces/GeolocationInterface"
import ElementUtilsInterface  from "../interfaces/ElementUtilsInterface"

class DwrPageLocation extends Mixin(PolymerElement)
    .with(EventInterface, AppStateInterface, GeolocationInterface, ElementUtilsInterface) {
  
    static get properties() {
      return {
        results : {
          type : Array,
          value : function() {
            return [];
          }
        },
        currentLocations : {
          type : Array,
          value : function() {
            return [];
          }
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
      this.searchTimer = -1;
      this.currentLocations = this.load();
    }
  
    show() {
      this.renderCurrentLocations();
    }
  
    _onKeyPress() {
      this.query = this.$.inputSearch.value;
  
      if( this.searchTimer != -1 ) clearTimeout(this.searchTimer);
      if( !this.query ) return;
  
      this.searchTimer = setTimeout(() => {
        this.query = this.$.inputSearch.value;
        this.searchTimer = -1;
        this._geolocate(this.query);
      }, 200);
    }
  
    _onGeolocationSearchUpdate(e) {
      this.toggleState(e.state);
      if( e.state !== 'loaded' ) return;
  
      var tmp = e.payload
        .map((item) =>({
          name : item.name,
          address : item.formatted_address,
          latitude : item.geometry.location.lat(),
          longitude : item.geometry.location.lng()
        }));
  
      this.results = tmp;
  
      if( this.results.length == 0 ) {
        this.$.noResults.style.display = 'block';
        this.$.noResults.innerText = 'No resuls found for "'+this.query+'"';
        return;
      }
  
      this.$.noResults.style.display = 'none';
    }
  
    _onLocationSelect(e) {
      var index = parseInt(e.currentTarget.getAttribute('index'));
  
      this._setGeolocation({location: this.results[index]});  
      this.ga('data', 'location', 'select-searched');
      
      this._addToHistory(this.results[index]);
  
      this.$.inputSearch.value = '';
      this.results = [];
      window.location.hash = 'map';
    }
  
    _onHistorySelect(e) {
      var index = parseInt(e.currentTarget.getAttribute('index'));

      this._setGeolocation({location: this.currentLocations[index]});

      this.ga('data', 'location', 'select-history');
  
      window.location.hash = 'map';
    }
  
    _addToHistory(location) {
      var index = -1;
      for( var i = 0; i < this.currentLocations.length; i++ ) {
        if( this.currentLocations[i].address === location.address ) {
          index = i;
          break;
        }
      }
  
      if( index > -1 ) {
        this.currentLocations.splice(i, 1);
      }
  
      this.currentLocations.unshift(location);
      this.currentLocations = this.currentLocations.slice(0);
      this.save();
    }
  
    _onHistoryDeleteAll() {
      this.currentLocations = [];
      this.save();
    }
  
    _onHistoryDelete(e) {
      var index = parseInt(e.currentTarget.getAttribute('index'));
      this.currentLocations.splice(index, 1);
      this.set('currentLocations', this.currentLocations.slice(0));
      this.save();
    }
  
    save() {
      if( !window.localStorage ) return;
      window.localStorage.setItem('cimis-history', JSON.stringify(this.currentLocations));
    }
  
    load() {
      if( !window.localStorage ) return [];
      var history = window.localStorage.getItem('cimis-history');
      if( !history ) return [];
      return JSON.parse(history);
    }
  
    geolocate() {
      if( this.geolocating ) return;
      this._setLocating(true);
  
      if ( navigator.geolocation ) {
        navigator.geolocation.getCurrentPosition(this._onGeolocate.bind(this), this._onGeolocatError.bind(this));
      } else {
        this._setLocating(false);
        this.$.geolocateMsg.innerHTML = '<div class="text text-danger">Geolocation is not supported by this browser.  Sorry :(</div>';
      }
    }
  
    _onGeolocate(position) {
      this.ga('data', 'location', 'geolocate');
  
      var event = {
        latitude : position.coords.latitude,
        longitude : position.coords.longitude,
        address : 'My Location'
      };
  
      this._setGeolocation({location: event});
      window.location.hash = 'map';
  
      this._setLocating(false);
    }
  
    _onGeolocatError(err) {
      this.ga('data', 'location', 'geolocate-error');
      this.$.geolocateMsg.innerHTML = '<div class="text text-danger">Geolocation Error. '+(err.message ? err.message : JSON.stringify(err))+'</div>';
      this._setLocating(false);
    }
  
    _setLocating(locating) {
      this.geolocating = locating;
      if( locating ) {
        this.$.geolocateMsg.innerHTML = '';
        this.$.geolocate.setAttribute('disabled', '');
        this.$.geolocate.innerHTML = 'Geolocating...';
      } else {
        this.$.geolocate.removeAttribute('disabled');
        this.$.geolocate.innerHTML = 'Geolocate';
      }
    }
  
    ga(name, type, value) {
      if( !window.ga ) return;
      ga('send', 'event', name, type, value, 1);
    }
  }
  
  window.customElements.define('dwr-page-location', DwrPageLocation);