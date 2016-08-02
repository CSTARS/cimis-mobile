
'use strict';

var request = require('request'),
  zlib = require('zlib'),
  async = require('async'),
  aggregatesDefinition = require('../aggregates'),
  dateUtil = require('../../ring-buffer/lib/date'),
  config, verbose = false;

//var gzip = zlib.createGzip();

function init(c) {
  config = c;
  verbose = config.get('fetch').verbose;
}

function log(txt) {
  if (verbose) {
    console.log(txt);
  }
}

function getDate(date, callback) {
  console.log('loading data for '+date.toDateString()+' from '+config.get('cimis').base+' ...');
  var pathDate = dateUtil.nice(date).join('/');

  var data = {};
  var aggregate;

  async.eachSeries(
    config.get('cimis').params,
    function(param, next){
      var url = config.get('cimis').base+'/'+pathDate+'/'+param+'.asc.gz';
      var readable = request(url);

      parse(param, readable, function(err, layer){
        if( err ) {
          return next();
        }

        layer.url = url;
        data[param] = layer;
        if( param === 'ETo' ) {
          aggregate = layer.aggregate;
        }
        next();
      });
    },
    function(err) {
      if( err ) {
        return callback(err);
      }
      callback(null, {
        data: munge(data),
        aggregate : aggregate
      });
    }
  );
}


function munge(data) {
  log('Munging data...');

  var munged = {}, id;

  // Only save data that exists in ETo
  for ( id in data.ETo.data) {
    if (id !== data.ETo.NODATA_value) {
      munged[id]= {'ETo':data.ETo.data[id]};
    }
  }

  for( var key in data ) {
    if (key === 'ETo') { continue; }

    var d = data[key].data;
    for( id in d ) {
      if (munged[id]) {
        munged[id][key] = d[id];
      }
    }
  }
  return munged;
}

function parse(parm, readable, callback) {
  var buffer = new Buffer(0);


  readable.on('data', function(chunk) {
    buffer = Buffer.concat([buffer, chunk]);
  });

  readable.on('end', function() {
    zlib.unzip(buffer, function(err, buffer) {
      if ( err ){
        return callback(err);
      }
      buffer = buffer.toString();
      parseBuffer(parm, buffer, callback);
    });
  });
}

function parseBuffer(parm, buffer, callback) {
  var err = new Error();
  var i = 0;
  var layer = {
    parm: parm,
    header : false,
    data : {},
    aggregate : {}
  };
  var row = 0;
  var cols = 0;

  var good = 0;
  var noData = 0;
  var bad = 0;
  var lines = buffer.split('\n');
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
            good++;
            layer.data[row+'-'+col] = pixel;

            if( parm === 'ETo' ) {
              prepareAggregate(layer, row, col, pixel)
            }
            
            layer.pixels++;
          } else {
            bad++;
          }
        } else {
          noData++;
        }
      }
      row++;
      if( vals.length > cols ) cols = vals.length;
    }

    if( parm === 'ETo' ) {
      aggregate(layer);
    }

    log(parm+'  --Parsed: '+row+'-'+cols+' '+good+'/'+noData+'/'+bad);
    callback(null, layer);
}

function aggregate(layer) {
  for( var key in layer.aggregate ) {
    var area = 0;
    var total = 0;
    layer.aggregate[key].forEach((px) => {
      total += px.et * px.area;
      area += px.area; 
    });
    layer.aggregate[key] = total / area;
  }
}

function prepareAggregate(layer, row, col, pixel) {
  var regions = aggregatesDefinition[row+'-'+col];

  for( var region in regions ) {
    if( !layer.aggregate[region] ) {
      layer.aggregate[region] = [];
    }
    layer.aggregate[region].push({
      et : pixel,
      area : parseFloat(regions[region])
    });
  }
}

module.exports = {
  getDate : getDate,
  init : init
};
