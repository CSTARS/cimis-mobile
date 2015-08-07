module.exports.nice = function(date) {
  var year = date.getYear()+1900;
  var month = (date.getMonth()+1)+'';
  if( month.length == 1 ) month = '0'+month;
  var day = date.getDate()+'';
  if( day.length == 1 ) day = '0'+day;

  return [year, month, day];
};
