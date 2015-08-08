#! /home/ubuntu/.nvm/v0.10.30/bin/node
var request = require('request');
var zlib = require('zlib');
var assert = require('assert');
var async = require('async');
var dateUtil = require('./date');

var params=['ETo','K','Rnl','Rso','Tdew','Tn','Tx','U2'];
var rootUrl = 'http://cimis.casil.ucdavis.edu/cimis';
module.exports.getRootUrl = function(){
  return rootUrl;
};

module.exports.getDate = function(date, callback) {
  console.log('loading data for '+date.toDateString()+' from '+rootUrl+' ...');
  var pathDate = dateUtil.nice(date).join('/');

  var data = {};

  async.eachSeries(
    params,
    function(param, next){
      console.log('  '+param);

      var url = rootUrl+'/'+pathDate+'/'+param+'.asc.gz';
      var readable = request(url).pipe(zlib.createGunzip());

      parse(param, readable, function(err, layer){
        layer.url = url;
        data[param] = layer;
        next();
      });
    },
    function(err) {
      callback(err, data);
    }
  );
};


function parse(parm, readable, callback) {
  assert.equal(typeof(parm),'string','argument \'param\' must be a string');
  assert.equal(typeof(readable),'object','argument \'readable\' must be an object');
  assert.equal(typeof (callback), 'function','argument \'callback\' must be a function');

  var err = new Error();
  var i = 0;
  var buffer ='';
  var layer = {
    parm: parm,
    header : false,
    data : {}
  };
  var row = 0;
  var cols = 0;

  readable.on('data', function(chunk) {
    var lines = buffer.concat(chunk.toString()).split('\n');
    var cnt = 0;

    for (var l = 0; l < lines.length - 1; l++) {
      var vals = lines[l].trim().split(' ');

      if (vals.length == 2) {
        layer[vals[0]] = parseInt(vals[1]);
        continue;
      }

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

        layer.pixels = 0;
        layer.header = true;
      }

      var northing = layer.yllcorner + (layer.nrows - row) * layer.cellsize;

      for (var col = 0; col < vals.length; col++) {
        var pixel = vals[col];

        if (pixel != layer.NODATA_value) {
          pixel = parseFloat(pixel);
          if( !isNaN(pixel) ) {
            layer.data[row+'-'+col] = pixel;
            layer.pixels++;
          }
        }
      }

      row++;
      if( vals.length > cols ) cols = vals.length;
    }
  });

  readable.on('end', function() {
    console.log('  --Parsed (row/col): '+row+'-'+cols);
    callback(null, layer);
  });
}
