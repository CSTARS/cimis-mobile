#! /home/ubuntu/.nvm/v0.10.30/bin/node
var request = require("request");
var zlib = require("zlib");
var assert=require("assert");


// HTTP GET Request
var readable=request("http://cimis.casil.ucdavis.edu/cimis/2014/09/25/ETo.asc.gz").pipe(zlib.createGunzip());
var redis={};

readAscParm(redis,'ETo',readable,function(err) {console.log(err)});

/*
 *    callback       invoked when the connection succeeds or fails.  Upon
 *                   success, callback is invoked as callback(null, socket),
 *                   where `socket` is a Node net.Socket object.  Upon failure,
 *                   callback is invoked as callback(err) instead.
 * https://www.joyent.com/developers/node/design/errors
*/
function readAscParm(kvp,parm,readable,callback) {
  assert.equal(typeof(kvp),'object',"argument 'kvp' must be an object");
  assert.equal(typeof(parm),'string',"argument 'parm' must be a string");
  assert.equal(typeof(readable),'object',"argument 'readable' must be an object");
  assert.equal(typeof (callback), 'function',"argument 'callback' must be a function");

  var err=new Error(); 
  var i=0;
  var buffer='';
  var layer={"header":false};
  var row=0;

  readable.on('data', function(chunk) {
    var lines = buffer.concat(chunk.toString()).split("\n");
    var cnt = 0;
    for (var l = 0; l < lines.length - 1; l++) {
      var vals = lines[l].split(' ');
      if (vals.length == 2) {
        layer[vals[0]] = Number(vals[1]);
      }
      else {
        if (!layer.header) {
          if (layer.ncols != 510 ||
            layer.nrows != 560 ||
            layer.xllcorner != -410000 ||
            layer.yllcorner != -660000 ||
            layer.cellsize != 2000) {
            err.name = 'InvalidFile';
            err.message = 'The raster file does not have a valid header';
            return callback(err);
          }
          layer.pixels=0;
          layer.header = true;
        }
        var northing = layer.yllcorner + (layer.nrows - row) * layer.cellsize;
        for (var col = 0; col < vals.length; col++) {
          var pixel = vals[col];
          if (pixel != layer.NODATA_value) {
            var easting = layer.xllcorner + col * layer.cellsize;
            var key = easting / 1000 + ':' + northing / 1000;
            var kv = redis[key] || {};
            kv[parm] = pixel.toFixed(2);
            layer.pixels++;
            console.log(col+":"+row+'or'+key+'['+parm+']='+kv[parm]);
          }
        }
      }
      row++;
    }
  buffer = buffer.concat(lines[lines.length - 1]);
  console.log('%d got %d bytes of data in %d lines, %d values', i++, chunk.length, lines.length, cnt);
  });
  
  readable.on('end', function() {
    console.log("Total Length : %d", buffer.length);
    console.log(layer);
  });
}