import {PolymerElement, html} from '@polymer/polymer';
import template from "./dwr-page-data.html"

import "./dwr-page-dau"
import "./dwr-page-eto"
import "./dwr-page-station"
import "./dwr-page-cimis-grid"

import AppStateInterface from "../../interfaces/AppStateInterface"

class DwrPageData extends Mixin(PolymerElement)
  .with(EventInterface, AppStateInterface) {
  
  static get properties() {
    return {
      properties: {
        appState: {
            type: Object
        },
        selected : {
          type : String,
          value : ''
        }
      }
    }
  }

  static get template() {
    let tag = document.createElement('template');    
    tag.innerHTML = template;    
    return tag;
  }

  _onAppStateUpdate(e) {
    this.appState = e;

    if( this.appState.section !== 'data' ) {
      this.selected = '';
      return;
    }

    this.selected = this.appState.mapState;
  }
}

window.customElements.define('dwr-page-data', DwrPageData);