module.exports = subclass => 
  class ChartUtilsInterface extends subclass {
    constructor() {
      super();

      this.currentChartSize = [0,0];
      this.charts = []; // google chart objects
      this.chartOptions = []; // google chart option objects
      this.datatables = null; // google chart datatables
      
      window.addEventListener('resize', () => this._redrawCharts());
    }

    /**
     * @method _redrawCharts
     * @description redraw takes the already render google charts and makes sure they
     * are the correct width for the current screensize.
     */
    _redrawCharts() {
      if( !this.datatables ) return;

      let w = this.shadowRoot.querySelector('paper-material.chart-card').offsetWidth - 10;
      let h = Math.floor(w * 0.5);
      this._setChartSize(h, w, true);

      setTimeout(() => {
        let w = this.shadowRoot.querySelector('paper-material.chart-card').offsetWidth - 10;
        let h = Math.floor(w * 0.5);
        this._setChartSize(h, w);
      }, 100);
    }

    /**
     * @method _setChartSize
     * @description set the height/width options for all charts and then call the
     * google charts 'draw' method.  This is only called if the current chart size
     * has changed.
     * 
     * @param {Number} height 
     * @param {Number} width 
     */
    _setChartSize(height, width, force=false) {
      if( !force && this.currentChartSize[0] === height && this.currentChartSize[1] === width ) return;
      this.currentChartSize = [height, width];

      for( var i = 0; i < this.datatables.length; i++ ) {
        this.chartOptions[i].height = height;
        this.chartOptions[i].width = width;

        this.charts[i].draw(this.datatables[i], this.chartOptions[i]);
      }
    }

  }