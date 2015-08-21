module.exports.nice = function(date) {
  var year = date.getUTCFullYear();
  var month = (date.getUTCMonth()+1)+'';
  if( month.length == 1 ) month = '0'+month;
  var day = date.getUTCDate()+'';
  if( day.length == 1 ) day = '0'+day;

  return [year, month, day];
};
