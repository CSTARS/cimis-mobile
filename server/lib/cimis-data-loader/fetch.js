
'use strict';

const request = require('superagent');
const csvparse = require('csv-parse');
const proj4 = require('proj4');
const aggregatesDefinition = require('./aggregates');
const config = require('../../config');
const niceDate = require('../niceDate');
const logger = require('../../logger');

proj4.defs('EPSG:3310','+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
var proj_gmaps = 'EPSG:4326';
var proj_cimis = 'EPSG:3310';

class Fetch {

  constructor() {
    this.verbose = config.fetch.verbose;
  }

  async getDate(date) {
    logger.info('data-loader fetching data for '+date.toDateString()+' from '+config.cimis.rootUrl);
    var pathDate = niceDate(date).join('/');
  
    var data = {};
    var aggregate, resp;
  
    var stationData = await this.getStationData(date);

    for( var i = 0; i < config.cimis.params.length; i++ ) {
      var param = config.cimis.params[i];
      var url = config.cimis.rootUrl+'/'+pathDate+'/'+param+'.asc.gz';

      try {
        resp = await request.get(url).buffer(true);
      } catch(e) {
        return new Error('No Data');
      }

      var layer = await this.parseBuffer(param, resp.text);

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
      data: this.munge(data),
      stationData : stationData,
      aggregate : aggregate
    }
  }

  async getStationData(date) {
    var pathDate = niceDate(date).join('/');

    // first we fetch station data
    var url = config.cimis.rootUrl+'/'+pathDate+'/station.csv';
    var resp;
    try {
      resp = await request.get(url).buffer(true);
    } catch(e) {
      logger.error(e);
      return new Error('No Station Data');
    }

    return await this.parseStationCSV(resp.text);
  }

  munge(data) {  
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

  parseStationCSV(text) {
    return new Promise((resolve, reject) => {
      csvparse(text, {}, (err, output) => {

        var headers = output.splice(0, 1)[0];
        var data = {};

        
        output.forEach((row) => {
          var station = {};
          row.forEach((col, index) => {
            station[headers[index]] = col;
          });

          station.x = parseFloat(station.x);
          station.y = parseFloat(station.y);

          var latlng = proj4(
            proj_cimis, 
            proj_gmaps, 
            [station.x, station.y]
          );
          station.lng = latlng[0];
          station.lat = latlng[1];

          data[station.station_id] = station;
        });

        resolve(data);
      });
    });
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

    logger.info('data-loader parser param', parm, 'Parsed: '+row+'-'+cols, `good=${good}, noData=${noData}, bad=${bad}`);
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
