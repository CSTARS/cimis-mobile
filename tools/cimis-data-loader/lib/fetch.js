var request = require('request')
, zlib = require('zlib')
, async = require('async')
, dateUtil = require('./date')
, config = require('config').get('cimis')
;

function log(txt) {
  if (config.verbose) {
    console.log(txt);
  }
}

function getDate(date, callback) {
  console.log('loading data for '+date.toDateString()+' from '+config.base+' ...');
  var pathDate = dateUtil.nice(date).join('/');

  var data = {};

  async.eachSeries(
    config.params,
    function(param, next){
      var url = config.base+'/'+pathDate+'/'+param+'.asc.gz';
      var readable = request(url).pipe(zlib.createGunzip());

      parse(param, readable, function(err, layer){
        layer.url = url;
        data[param] = layer;
        next();
      });
    },
    function(err) {
      callback(err, munge(data));
    }
  );
};

function munge (data) {
  log('Munging data...');

  var munged = {};

  // Only save data that exists in ETo
  for (var id in data.ETo.data) {
    if (id !== data.ETo.NODATA_value) {
      munged[id]= {'ETo':data.ETo.data[id]};
    }
  }
  for( var key in data ) {
    if (key === 'ETo') { continue; }

    var d = data[key].data;
    for( var id in d ) {
      if (munged[id]) {
        munged[id][key] = d[id];
      }
    }
  }
  return munged;
};

function parse(parm, readable, callback) {
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

  var good = 0;
  var noData = 0;
  var bad = 0;

  readable.on('data', function(chunk) {
    buffer += chunk.toString();
  });

  readable.on('end', function() {
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
      log(parm+'  --Parsed: '+row+'-'+cols+' '+good+'/'+noData+'/'+bad);
      callback(null, layer);
    });
  }

module.exports={
  getDate:getDate
}
