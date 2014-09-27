var request = require("request");
var zlib = require("zlib");

// HTTP GET Request
var readable=request("http://cimis.casil.ucdavis.edu/cimis/2014/09/25/ETo.asc.gz").pipe(zlib.createGunzip());

var i=0;
var buffer='';
var layer={};
readable.on('data', function(chunk) {
  var lines = buffer.concat(chunk.toString()).split("\n");
  var cnt=0;
  for (var l=0; l<lines.length-1;l++) {
      var vals=lines[l].split(' ');
      if (vals.length==2) {
        layer[vals[0]]=Number(vals[1]);
      } else {
      cnt+=vals.length;
      } 
  }
  buffer=lines[lines.length-1];
  console.log('%d got %d bytes of data in %d lines, %d values',i++, chunk.length,lines.length,cnt);
});

readable.on('end', function() {
  console.log("Total Length : %d",buffer.length);
  console.log(layer);
});
