module.exports = {
  params : ['Rnl','Rso','U2', 'ETo', 'Tdew','Tn','Tx'],
  options : [
    {
      title : 'ETo - Evapotranspiration (mm)',
      height : 550,
      vAxis : {
        minValue : 0
      },
      legend : {
        position : 'top'
      }
    },
    {
      title : 'Temperature Min/Max/Dew (^C)',
      height : 550,
      vAxis : {
        minValue : 0
      },
      legend : {
        position : 'top'
      }
    },
    {
      title : 'Radiation Short/Long (MW/h)',
      height : 550,
      vAxis : {
        minValue : 0
      },
      legend : {
        position : 'top'
      }
    },
    {
      title : 'Wind Speed (m/s)',
      height : 550,
      vAxis : {
        minValue : 0
      },
      legend : {
        position : 'top'
      }
    }
  ]
}