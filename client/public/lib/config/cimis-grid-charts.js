module.exports = {
  params : ['Rnl','Rso','U2', 'ETo', 'Tdew','Tn','Tx'],
  options : [
    {
      //chart : {
        title : 'ETo - Evapotranspiration (mm)',
      //},
      curveType: 'function',
      height : 550,
      legend : {
        position : 'top'
      }
    },
    {
      //chart : {
        title : 'Temperature Min/Max/Dew (^C)',
      //},
      curveType: 'function',
      height : 550,
      legend : {
        position : 'top'
      }
    },
    {
      //chart : {
        title : 'Radiation Short/Long (MW/h)',
      //},
      curveType: 'function',
      height : 550,
      legend : {
        position : 'top'
      }
    },
    {
      //chart : {
        title : 'Wind Speed (m/s)',
      //},
      curveType: 'function',
      height : 550,
      legend : {
        position : 'top'
      }
    }
  ]
}