import {PolymerElement} from "@polymer/polymer/polymer-element"
import "@polymer/paper-tabs/paper-tabs"
import template from "./dwr-page-about.html"

import config from "../../lib/config"

class DwrPageAbout extends PolymerElement {

  static get properties() {
    return {
      selectedTab : {
        type : Number,
        value : 0
      }
    }
  }

  static get template() {
    return template;
  }

  ready() {
    super.ready();

    this.shadowRoot.querySelector('.host').innerHTML = window.location.protocol+'//'+window.location.host;
    this._createParamsTable();

    if( window.userType ) {
      this.shadowRoot.querySelector('input[value="'+window.userType+'"]').checked = true;
    }

    window.addEventListener('hashchange', this._setTab.bind(this));
    this._setTab();
  }

  _setTab() {
    var parts = window.location.hash.replace('#', '').split('/');
    if( parts.length === 0 ) return;
    if( parts[0] !== 'about' ) return;

    if( parts.length > 1 && parts[1] === 'api' ) {
      this.selectedTab = 2;
    }
  }

  _createParamsTable() {
    var tmp = [];
  
    for( var param in config.definitions ) {
      tmp.push({
        param : param,
        label : config.definitions[param].label,
        units : config.definitions[param].units
      })
    }

    this.definitions = tmp;
  }

  updateUserType(e) {
    var type = e.currentTarget.value;

    window.localStorage.setItem('userType', type);
    window.userType = type;
  }
}

window.customElements.define('dwr-page-about', DwrPageAbout);