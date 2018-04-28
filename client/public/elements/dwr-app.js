import {PolymerElement} from "@polymer/polymer/polymer-element"
import "@polymer/paper-header-panel/paper-header-panel"
import "@polymer/paper-toolbar/paper-toolbar"
import "@polymer/paper-icon-button/paper-icon-button"
import "@polymer/paper-menu-button/paper-menu-button"
import "@polymer/paper-listbox/paper-listbox"
import "@polymer/paper-item/paper-item"
import "@polymer/iron-pages/iron-pages"

// sets globals Mixin and EventInterface
import "@ucd-lib/cork-app-utils";

// main app models
import '../lib'

// styles
import "./styles/style-properties"
import "./styles/shared-styles"

// local elements
import "./pages/dwr-page-about"
import "./pages/dwr-page-location"
import "./pages/dwr-page-map"
import "./pages/dwr-page-data/dwr-page-data"

import AppStateInterface from "./interfaces/AppStateInterface"
import DauInterface from "./interfaces/DauInterface"
import EtoZonesInterface from "./interfaces/EtoZonesInterface"

import template from "./dwr-app.html"

class DwrApp extends Mixin(PolymerElement)
  .with(EventInterface, AppStateInterface, DauInterface, EtoZonesInterface) {


  static get properties() {
    return {
      appState : {
        type : Object,
        value : () => ({section : 'map'})
      },
      selectedMenuItem : {
        type : String,
        value : '',
        observer : '_onMenuSelect'
      }
    }
  }

  static get template() {
    return template;
  }

  ready() {
    super.ready();

    if( google.visualization !== undefined ) {
      this.onChartsReady();
    } else {
      google.charts.setOnLoadCallback(() => {
        this.onChartsReady();
      });
    }
  }

  onChartsReady() {
    window.addEventListener('hashchange', this._setAppStateFromUrl.bind(this));
    this._setAppStateFromUrl();

    var loadingMsg = document.querySelector('#loading-init');
    if( loadingMsg ) document.body.removeChild(loadingMsg);
  }

  connectedCallback() {
    super.connectedCallback();

    if( window.standaloneMode ) {
      this.$.install.style.display = 'none';
    }
  }

  _onMenuSelect() {
    if( !this.selectedMenuItem ) return;

    switch(this.selectedMenuItem) {
      case 'about':
        window.location.hash = 'about';
        break;
      default:
        this._setLayerFromMenu()
    }
  }

  _setAppStateFromUrl() {
    var parts = window.location.hash.replace(/#/,'').split('/');
    var state = {
      section : 'map'
    };

    if( parts.length > 0 && parts[0] ) {
      state.section = parts.splice(0, 1)[0];
    }
    if( parts.length > 0 && parts[0]) {
      if( state.section === 'map' || state.section === 'data' ) {
        state.mapState = parts.splice(0, 1)[0];
      }
    }

    if( parts.length > 0 && parts[0]) {
      state.extras = parts;
    }

    this._setAppState(state);
  }

  _onDauGeometryUpdate(e) {
    switch(e.state) {
      case 'loaded':
        this.shadowRoot.querySelector('[page="dauZones"]').removeAttribute('disabled');
        this.$.dauSpinner.removeAttribute('active');
        this.$.dauSpinner.style.display = 'none';
        break;
      case 'error':
        this.shadowRoot.querySelector('[page="dauZones"]').innerHTML = 'Failed to load Dau Zones :('
    }
  }

  _onEtoZonesGeometryUpdate(e) {
    switch(e.state) {
      case 'loaded':
        this.shadowRoot.querySelector('[page="etoZones"]').removeAttribute('disabled');
        this.$.etoSpinner.removeAttribute('active');
        this.$.etoSpinner.style.display = 'none';
        break;
      case 'error':
        this.shadowRoot.querySelector('[page="etoZones"]').innerHTML = 'Failed to load Dau Zones :('
    }
  }

  _onAppStateUpdate(e) {
    this.appState = e;

    if( this.appState.section === 'map' ) {
      this.$.locationBtn.style.display = 'block';
      this.$.backToMapBtn.style.display = 'none';
    } else {
      this.$.locationBtn.style.display = 'none';
      this.$.backToMapBtn.style.display = 'block';
    }
  }

  _setUrlStateFromMenu(e) {
    var newState = this.$.mapLayerMenu.selected;
    if( !newState || newState === this.appState.section ) {
      return;
    }

    window.location.hash = newState;
  }

  _setLayerFromMenu(e) {
    var newState = this.selectedMenuItem;
    if( !newState || newState === this.appState.mapState ) {
      return;
    }

    this._setAppState({mapState: newState});

    if( this.appState.section !== 'map' ) {
      window.location.hash = 'map';
    }
  }

  _selectLocation() {
    window.location.hash = 'location';
  }

  _backToMap() {
    window.location.hash = 'map';
  }
}

window.customElements.define('dwr-app', DwrApp);