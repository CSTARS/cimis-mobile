import {PolymerElement} from "@polymer/polymer/polymer-element"
import "@polymer/paper-icon-button/paper-icon-button"
import "@polymer/paper-menu-button/paper-menu-button"
import "@polymer/paper-listbox/paper-listbox"
import "@polymer/paper-material/paper-material"
import "@polymer/paper-item/paper-item"
import "@polymer/paper-button/paper-button"
import "@polymer/paper-tabs/paper-tabs"
import "@polymer/iron-pages/iron-pages"
import "@polymer/iron-icons/iron-icons"
import "@polymer/iron-icons/maps-icons"

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
      },
      menuActive : {
        type : Boolean,
        value : false
      },
      loading : {
        type : Boolean,
        value : true
      },

      loadingDau : {
        type : Boolean,
        value : true
      },
      loadingEto : {
        type : Boolean,
        value : true
      },
      subSectionLabel : {
        type : String,
        value : ''
      }
    }
  }

  static get template() {
    return template;
  }

  ready() {
    super.ready();
    window.addEventListener('click', () => this.hideMenu());
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

  _onDauGeometryUpdate(e) {
    if( e.state === 'loading' ) {
      this.dauLoading = false;
    } else if( e.state === 'error' ) {
      this.$.dauBtn.removeAttribute('href');
      this.$.dauBtn.innerHTML = 'Failed to load Dau Zones :('
    }
  }

  _onEtoZonesGeometryUpdate(e) {
    if( e.state === 'loading' ) {
      this.etoLoading = false;
    } else if( e.state === 'error' ) {
      this.$.etoBtn.removeAttribute('href');
      this.$.etoBtn.innerHTML = 'Failed to load Eto Zones :('
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

    if( !e.mapState || e.mapState === 'cimisGrid' ) this.subSectionLabel = 'Grid';
    else if( e.mapState === 'dauZones' ) this.subSectionLabel = 'Dau Zones';
    else if( e.mapState === 'etoZones' ) this.subSectionLabel = 'Eto Zones';
    else if( e.mapState === 'cimisStations' ) this.subSectionLabel = 'Stations';
    else this.subSectionLabel = '';

    if( this.loading ) {
      this.loading = false;
      var loadingMsg = document.querySelector('#loading-init');
      if( loadingMsg ) document.body.removeChild(loadingMsg);
    }
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
    let layer = this.appState.mapState || '';
    window.location.hash = layer ? 'map/'+layer : '';
  }

  /**
   * @method _onMenuIconClicked
   * @description called when the menu icon is clicked
   * 
   * @param {Object} e html click event
   */
  _onMenuIconClicked(e) {
    e.preventDefault();
    e.stopPropagation();
    this.toggleMenu();
  }

  /**
   * @method toggleMenu
   * @description toggle the main menu
   */
  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  /**
   * @method hideMenu
   * @description hide the main menu
   */
  hideMenu() {
    this.menuActive = false;
  }
}

window.customElements.define('dwr-app', DwrApp);