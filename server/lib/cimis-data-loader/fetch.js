
'use strict';

var request = require('superagent');
var zlib = require('zlib');
var aggregatesDefinition = require('../aggregates'),
var config = require('../../config');
var util = require('util');
var verbose = false;

zlib.unzip = util.promisify(zlib.unzip);

class Fetch {

  constructor() {
    this.verbose = config.fetch.verbose;
  }

  log(txt) {
    if( this.verbose) console.log(txt);
  }

  async getDate(date) {
    console.log('loading data for '+date.toDateString()+' from '+config.cimis.rootUrl+' ...');
    var pathDate = dateUtil.nice(date).join('/');
  
    var data = {};
    var aggregate;
  
    for( var i = 0; i < config.cimis.params.length; i++ ) {
      var param = config.cimis.params[i];
      var url = config.cimis.rootUrl+'/'+pathDate+'/'+param+'.asc.gz';

      var resp = await request.get(url);

      // this needs to be a buffer...
      var buffer = await zlib.unzip(resp.body);
      var layer = await this.parseBuffer(param, buffer.toString());

      layer.url = url;
      data[param] = layer;
      if( param === 'ETo' ) {
        aggregate = layer.aggregate;
      }
    }

    if( Object.keys(data).length === 0 ) {
      return new Error('No Data');
    }

    return {
      data: munge(data),
      aggregate : aggregate
    }
  }

  munge(data) {
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
  
  parseBuffer(parm, buffer) {
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
            return err;
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
              this.prepareAggregate(layer, row, col, pixel)
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
      this.aggregate(layer);
    }

    log(parm+'  --Parsed: '+row+'-'+cols+' '+good+'/'+noData+'/'+bad);
    return layer;
  }

  aggregate(layer) {
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

  prepareAggregate(layer, row, col, pixel) {
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
}

module.exports = new Fetch();
