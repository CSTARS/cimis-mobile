module.exports = subclass => 
  class ToggleStateInterace extends subclass {
    ready() {
      super.ready();

      var states = this.states || [];
      if( states.indexOf('state') === -1 ) {
        states.push('state');
      }

      for( var j = 0; j < states.length; j++ ) {
        var type = states[j];
        var eles = this.querySelectorAll('['+type+']');
        for( var i = 0; i < eles.length; i++ ) {
          eles[i].style.display = 'none';
        }
      }
    }

    toggleState(state, type) {
      if( !type ) type = 'state';

      var eles = this.querySelectorAll('['+type+']');
      var i, ele;
      for( i = 0; i < eles.length; i++ ) {
        ele = eles[i];
        ele.style.display = (ele.getAttribute(type) === state) ? 'block' : 'none';
      }
    }
  }