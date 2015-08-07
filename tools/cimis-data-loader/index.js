var fetch = require('./fetch');
var ringBuffer = require('./ringBuffer');
var munge = require('./munge');

var date = new Date(new Date().getTime()-86400000);

fetch.getDate(date, function(err, data){
  data = munge(data);
  ringBuffer.write(date, data, function(err, resp){
    console.log(err);
    console.log(resp);
    console.log('done.');
  });
});
