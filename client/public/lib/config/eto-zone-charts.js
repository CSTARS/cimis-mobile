module.exports = {
  etoChartOptions : {
    title : 'ETo - Evapotranspiration (mm)',
    height : 550,
    interpolateNulls : true,
    animation : {
        easing : 'out',
        startup : true
    },
    series: {
        1: { 
            lineDashStyle: [4, 4] 
        }
    }
  },

  expectedEtoOptions : {
    title : 'Weekly Expected Evapotranspiration (mm)',
    height : 550,
    legend : {
        position : 'none'
    },
    hAxis : {
        title : 'Week'
    },
    seriesType : 'bars',
    series: {
        0: { 
            type : 'line',
            targetAxisIndex : 0
        }
    }
  },

  expectedEtoCumOptions : {
    title : 'Expected Cumulative Weekly Evapotranspiration (mm)',
    height : 550,
    legend : {
        position : 'none'
    },
    hAxis : {
        title : 'Week'
    },
    seriesType : 'bars',
    series: {
        0: { 
            type : 'line',
            targetAxisIndex : 0
        }
    }
  }
}