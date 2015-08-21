(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CIMIS = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jrmerz/dev/cstars/cimis-mobile/lib/shared/cimis-grid/index.js":[function(require,module,exports){
'use strict';

var proj4 = require('proj4');

// match layers for easier checking
var ncols = 510,
    nrows = 560,
    xllcorner = -410000,
    yllcorner = -660000,
    cellsize = 2000;

var proj_gmaps = 'EPSG:4326';
var proj_cimis = 'EPSG:3310';

proj4.defs('EPSG:3310','+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');


function bounds() {
  var bottomLeft = proj4(proj_cimis, proj_gmaps, [xllcorner, yllcorner]);
  var topRight = proj4(proj_cimis, proj_gmaps,[xllcorner+ncols*cellsize, yllcorner+nrows*cellsize]);
  var bounds = [bottomLeft, topRight];
  return bounds;
}

function gridToBounds(row, col) {
  var bottomLeft = proj4(proj_cimis, proj_gmaps, [xllcorner + (col*cellsize), yllcorner + ((nrows - row)*cellsize)]);
  var topRight = proj4(proj_cimis, proj_gmaps, [xllcorner + ((col+1) * cellsize), yllcorner + ((nrows -(row+1)) * cellsize)]);
  var bounds = [bottomLeft, topRight];

  return bounds;
}

function llToGrid(lng, lat) {
  if( typeof lng === 'object' ) {
    lat = lng.lat();
    lng = lng.lng();
  }

  var result = proj4(proj_gmaps, proj_cimis, [lng, lat]);

  // Assuming this is the input to the grid....
  // Cols are X. Rows are Y and counted from the top down
  result = {
    row : nrows - Math.floor((result[1] - yllcorner) / cellsize),
    col : Math.floor((result[0] - xllcorner) / cellsize),
  };

  var y = yllcorner + ((nrows-result.row) * cellsize);
  var x = xllcorner + (result.col * cellsize) ;

  result.topRight = proj4(proj_cimis, proj_gmaps,[x+cellsize, y+cellsize]);
  result.bottomLeft = proj4(proj_cimis, proj_gmaps,[x, y]);

  return result;
}


module.exports = {
  llToGrid : llToGrid,
  xllcorner : xllcorner,
  yllcorner : yllcorner,
  cellsize : cellsize,
  bounds : bounds,
  gridToBounds : gridToBounds
};

},{"proj4":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/lib/shared/index.js":[function(require,module,exports){

module.exports = {
  grid : require('./cimis-grid'),
  utils : require('./utils')
};

},{"./cimis-grid":"/Users/jrmerz/dev/cstars/cimis-mobile/lib/shared/cimis-grid/index.js","./utils":"/Users/jrmerz/dev/cstars/cimis-mobile/lib/shared/utils/index.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/lib/shared/utils/index.js":[function(require,module,exports){
'use strict';

function sortDates(data) {
  var arr = [];

  if( Array.isArray(data) ) {
    for( var i = 0; i < data.length; i++ ) {
      arr.push({
        str : data[i],
        time : toDate(data[i]).getTime()
      });
    }
  } else {
    for( var date in data ) {
      arr.push({
        str : date,
        time : toDate(date).getTime()
      });
    }
  }

  arr.sort(function(a, b){
    if( a.time > b.time ) {
      return 1;
    } else if( a.time < b.time ) {
      return -1;
    }
    return 0;
  });

  var tmp = [];
  arr.forEach(function(item){
    tmp.push(item.str);
  });

  return tmp;
}

function toDate(str) {
  var parts = str.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
}

module.exports = {
  sortDates : sortDates
};

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Point.js":[function(require,module,exports){
var mgrs = require('mgrs');

function Point(x, y, z) {
  if (!(this instanceof Point)) {
    return new Point(x, y, z);
  }
  if (Array.isArray(x)) {
    this.x = x[0];
    this.y = x[1];
    this.z = x[2] || 0.0;
  }else if(typeof x === 'object'){
    this.x = x.x;
    this.y = x.y;
    this.z = x.z || 0.0;
  } else if (typeof x === 'string' && typeof y === 'undefined') {
    var coords = x.split(',');
    this.x = parseFloat(coords[0], 10);
    this.y = parseFloat(coords[1], 10);
    this.z = parseFloat(coords[2], 10) || 0.0;
  }
  else {
    this.x = x;
    this.y = y;
    this.z = z || 0.0;
  }
  console.warn('proj4.Point will be removed in version 3, use proj4.toPoint');
}

Point.fromMGRS = function(mgrsStr) {
  return new Point(mgrs.toPoint(mgrsStr));
};
Point.prototype.toMGRS = function(accuracy) {
  return mgrs.forward([this.x, this.y], accuracy);
};
module.exports = Point;
},{"mgrs":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/node_modules/mgrs/mgrs.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Proj.js":[function(require,module,exports){
var parseCode = require("./parseCode");
var extend = require('./extend');
var projections = require('./projections');
var deriveConstants = require('./deriveConstants');

function Projection(srsCode,callback) {
  if (!(this instanceof Projection)) {
    return new Projection(srsCode);
  }
  callback = callback || function(error){
    if(error){
      throw error;
    }
  };
  var json = parseCode(srsCode);
  if(typeof json !== 'object'){
    callback(srsCode);
    return;
  }
  var modifiedJSON = deriveConstants(json);
  var ourProj = Projection.projections.get(modifiedJSON.projName);
  if(ourProj){
    extend(this, modifiedJSON);
    extend(this, ourProj);
    this.init();
    callback(null, this);
  }else{
    callback(srsCode);
  }
}
Projection.projections = projections;
Projection.projections.start();
module.exports = Projection;

},{"./deriveConstants":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/deriveConstants.js","./extend":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/extend.js","./parseCode":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/parseCode.js","./projections":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/adjust_axis.js":[function(require,module,exports){
module.exports = function(crs, denorm, point) {
  var xin = point.x,
    yin = point.y,
    zin = point.z || 0.0;
  var v, t, i;
  for (i = 0; i < 3; i++) {
    if (denorm && i === 2 && point.z === undefined) {
      continue;
    }
    if (i === 0) {
      v = xin;
      t = 'x';
    }
    else if (i === 1) {
      v = yin;
      t = 'y';
    }
    else {
      v = zin;
      t = 'z';
    }
    switch (crs.axis[i]) {
    case 'e':
      point[t] = v;
      break;
    case 'w':
      point[t] = -v;
      break;
    case 'n':
      point[t] = v;
      break;
    case 's':
      point[t] = -v;
      break;
    case 'u':
      if (point[t] !== undefined) {
        point.z = v;
      }
      break;
    case 'd':
      if (point[t] !== undefined) {
        point.z = -v;
      }
      break;
    default:
      //console.log("ERROR: unknow axis ("+crs.axis[i]+") - check definition of "+crs.projName);
      return null;
    }
  }
  return point;
};

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;
var sign = require('./sign');

module.exports = function(x) {
  return (Math.abs(x) < HALF_PI) ? x : (x - (sign(x) * Math.PI));
};
},{"./sign":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js":[function(require,module,exports){
var TWO_PI = Math.PI * 2;
// SPI is slightly greater than Math.PI, so values that exceed the -180..180
// degree range by a tiny amount don't get wrapped. This prevents points that
// have drifted from their original location along the 180th meridian (due to
// floating point error) from changing their sign.
var SPI = 3.14159265359;
var sign = require('./sign');

module.exports = function(x) {
  return (Math.abs(x) <= SPI) ? x : (x - (sign(x) * TWO_PI));
};
},{"./sign":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js":[function(require,module,exports){
module.exports = function(x) {
  if (Math.abs(x) > 1) {
    x = (x > 1) ? 1 : -1;
  }
  return Math.asin(x);
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js":[function(require,module,exports){
module.exports = function(x) {
  return (1 - 0.25 * x * (1 + x / 16 * (3 + 1.25 * x)));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js":[function(require,module,exports){
module.exports = function(x) {
  return (0.375 * x * (1 + 0.25 * x * (1 + 0.46875 * x)));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js":[function(require,module,exports){
module.exports = function(x) {
  return (0.05859375 * x * x * (1 + 0.75 * x));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js":[function(require,module,exports){
module.exports = function(x) {
  return (x * x * x * (35 / 3072));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/gN.js":[function(require,module,exports){
module.exports = function(a, e, sinphi) {
  var temp = e * sinphi;
  return a / Math.sqrt(1 - temp * temp);
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/imlfn.js":[function(require,module,exports){
module.exports = function(ml, e0, e1, e2, e3) {
  var phi;
  var dphi;

  phi = ml / e0;
  for (var i = 0; i < 15; i++) {
    dphi = (ml - (e0 * phi - e1 * Math.sin(2 * phi) + e2 * Math.sin(4 * phi) - e3 * Math.sin(6 * phi))) / (e0 - 2 * e1 * Math.cos(2 * phi) + 4 * e2 * Math.cos(4 * phi) - 6 * e3 * Math.cos(6 * phi));
    phi += dphi;
    if (Math.abs(dphi) <= 0.0000000001) {
      return phi;
    }
  }

  //..reportError("IMLFN-CONV:Latitude failed to converge after 15 iterations");
  return NaN;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/iqsfnz.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;

module.exports = function(eccent, q) {
  var temp = 1 - (1 - eccent * eccent) / (2 * eccent) * Math.log((1 - eccent) / (1 + eccent));
  if (Math.abs(Math.abs(q) - temp) < 1.0E-6) {
    if (q < 0) {
      return (-1 * HALF_PI);
    }
    else {
      return HALF_PI;
    }
  }
  //var phi = 0.5* q/(1-eccent*eccent);
  var phi = Math.asin(0.5 * q);
  var dphi;
  var sin_phi;
  var cos_phi;
  var con;
  for (var i = 0; i < 30; i++) {
    sin_phi = Math.sin(phi);
    cos_phi = Math.cos(phi);
    con = eccent * sin_phi;
    dphi = Math.pow(1 - con * con, 2) / (2 * cos_phi) * (q / (1 - eccent * eccent) - sin_phi / (1 - con * con) + 0.5 / eccent * Math.log((1 - con) / (1 + con)));
    phi += dphi;
    if (Math.abs(dphi) <= 0.0000000001) {
      return phi;
    }
  }

  //console.log("IQSFN-CONV:Latitude failed to converge after 30 iterations");
  return NaN;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js":[function(require,module,exports){
module.exports = function(e0, e1, e2, e3, phi) {
  return (e0 * phi - e1 * Math.sin(2 * phi) + e2 * Math.sin(4 * phi) - e3 * Math.sin(6 * phi));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js":[function(require,module,exports){
module.exports = function(eccent, sinphi, cosphi) {
  var con = eccent * sinphi;
  return cosphi / (Math.sqrt(1 - con * con));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/phi2z.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;
module.exports = function(eccent, ts) {
  var eccnth = 0.5 * eccent;
  var con, dphi;
  var phi = HALF_PI - 2 * Math.atan(ts);
  for (var i = 0; i <= 15; i++) {
    con = eccent * Math.sin(phi);
    dphi = HALF_PI - 2 * Math.atan(ts * (Math.pow(((1 - con) / (1 + con)), eccnth))) - phi;
    phi += dphi;
    if (Math.abs(dphi) <= 0.0000000001) {
      return phi;
    }
  }
  //console.log("phi2z has NoConvergence");
  return -9999;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_enfn.js":[function(require,module,exports){
var C00 = 1;
var C02 = 0.25;
var C04 = 0.046875;
var C06 = 0.01953125;
var C08 = 0.01068115234375;
var C22 = 0.75;
var C44 = 0.46875;
var C46 = 0.01302083333333333333;
var C48 = 0.00712076822916666666;
var C66 = 0.36458333333333333333;
var C68 = 0.00569661458333333333;
var C88 = 0.3076171875;

module.exports = function(es) {
  var en = [];
  en[0] = C00 - es * (C02 + es * (C04 + es * (C06 + es * C08)));
  en[1] = es * (C22 - es * (C04 + es * (C06 + es * C08)));
  var t = es * es;
  en[2] = t * (C44 - es * (C46 + es * C48));
  t *= es;
  en[3] = t * (C66 - es * C68);
  en[4] = t * es * C88;
  return en;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_inv_mlfn.js":[function(require,module,exports){
var pj_mlfn = require("./pj_mlfn");
var EPSLN = 1.0e-10;
var MAX_ITER = 20;
module.exports = function(arg, es, en) {
  var k = 1 / (1 - es);
  var phi = arg;
  for (var i = MAX_ITER; i; --i) { /* rarely goes over 2 iterations */
    var s = Math.sin(phi);
    var t = 1 - es * s * s;
    //t = this.pj_mlfn(phi, s, Math.cos(phi), en) - arg;
    //phi -= t * (t * Math.sqrt(t)) * k;
    t = (pj_mlfn(phi, s, Math.cos(phi), en) - arg) * (t * Math.sqrt(t)) * k;
    phi -= t;
    if (Math.abs(t) < EPSLN) {
      return phi;
    }
  }
  //..reportError("cass:pj_inv_mlfn: Convergence error");
  return phi;
};
},{"./pj_mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_mlfn.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_mlfn.js":[function(require,module,exports){
module.exports = function(phi, sphi, cphi, en) {
  cphi *= sphi;
  sphi *= sphi;
  return (en[0] * phi - cphi * (en[1] + sphi * (en[2] + sphi * (en[3] + sphi * en[4]))));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/qsfnz.js":[function(require,module,exports){
module.exports = function(eccent, sinphi) {
  var con;
  if (eccent > 1.0e-7) {
    con = eccent * sinphi;
    return ((1 - eccent * eccent) * (sinphi / (1 - con * con) - (0.5 / eccent) * Math.log((1 - con) / (1 + con))));
  }
  else {
    return (2 * sinphi);
  }
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js":[function(require,module,exports){
module.exports = function(x) {
  return x<0 ? -1 : 1;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/srat.js":[function(require,module,exports){
module.exports = function(esinp, exp) {
  return (Math.pow((1 - esinp) / (1 + esinp), exp));
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/toPoint.js":[function(require,module,exports){
module.exports = function (array){
  var out = {
    x: array[0],
    y: array[1]
  };
  if (array.length>2) {
    out.z = array[2];
  }
  if (array.length>3) {
    out.m = array[3];
  }
  return out;
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/tsfnz.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;

module.exports = function(eccent, phi, sinphi) {
  var con = eccent * sinphi;
  var com = 0.5 * eccent;
  con = Math.pow(((1 - con) / (1 + con)), com);
  return (Math.tan(0.5 * (HALF_PI - phi)) / con);
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/Datum.js":[function(require,module,exports){
exports.wgs84 = {
  towgs84: "0,0,0",
  ellipse: "WGS84",
  datumName: "WGS84"
};
exports.ch1903 = {
  towgs84: "674.374,15.056,405.346",
  ellipse: "bessel",
  datumName: "swiss"
};
exports.ggrs87 = {
  towgs84: "-199.87,74.79,246.62",
  ellipse: "GRS80",
  datumName: "Greek_Geodetic_Reference_System_1987"
};
exports.nad83 = {
  towgs84: "0,0,0",
  ellipse: "GRS80",
  datumName: "North_American_Datum_1983"
};
exports.nad27 = {
  nadgrids: "@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",
  ellipse: "clrk66",
  datumName: "North_American_Datum_1927"
};
exports.potsdam = {
  towgs84: "606.0,23.0,413.0",
  ellipse: "bessel",
  datumName: "Potsdam Rauenberg 1950 DHDN"
};
exports.carthage = {
  towgs84: "-263.0,6.0,431.0",
  ellipse: "clark80",
  datumName: "Carthage 1934 Tunisia"
};
exports.hermannskogel = {
  towgs84: "653.0,-212.0,449.0",
  ellipse: "bessel",
  datumName: "Hermannskogel"
};
exports.ire65 = {
  towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",
  ellipse: "mod_airy",
  datumName: "Ireland 1965"
};
exports.rassadiran = {
  towgs84: "-133.63,-157.5,-158.62",
  ellipse: "intl",
  datumName: "Rassadiran"
};
exports.nzgd49 = {
  towgs84: "59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",
  ellipse: "intl",
  datumName: "New Zealand Geodetic Datum 1949"
};
exports.osgb36 = {
  towgs84: "446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",
  ellipse: "airy",
  datumName: "Airy 1830"
};
exports.s_jtsk = {
  towgs84: "589,76,480",
  ellipse: 'bessel',
  datumName: 'S-JTSK (Ferro)'
};
exports.beduaram = {
  towgs84: '-106,-87,188',
  ellipse: 'clrk80',
  datumName: 'Beduaram'
};
exports.gunung_segara = {
  towgs84: '-403,684,41',
  ellipse: 'bessel',
  datumName: 'Gunung Segara Jakarta'
};
exports.rnb72 = {
  towgs84: "106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1",
  ellipse: "intl",
  datumName: "Reseau National Belge 1972"
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/Ellipsoid.js":[function(require,module,exports){
exports.MERIT = {
  a: 6378137.0,
  rf: 298.257,
  ellipseName: "MERIT 1983"
};
exports.SGS85 = {
  a: 6378136.0,
  rf: 298.257,
  ellipseName: "Soviet Geodetic System 85"
};
exports.GRS80 = {
  a: 6378137.0,
  rf: 298.257222101,
  ellipseName: "GRS 1980(IUGG, 1980)"
};
exports.IAU76 = {
  a: 6378140.0,
  rf: 298.257,
  ellipseName: "IAU 1976"
};
exports.airy = {
  a: 6377563.396,
  b: 6356256.910,
  ellipseName: "Airy 1830"
};
exports.APL4 = {
  a: 6378137,
  rf: 298.25,
  ellipseName: "Appl. Physics. 1965"
};
exports.NWL9D = {
  a: 6378145.0,
  rf: 298.25,
  ellipseName: "Naval Weapons Lab., 1965"
};
exports.mod_airy = {
  a: 6377340.189,
  b: 6356034.446,
  ellipseName: "Modified Airy"
};
exports.andrae = {
  a: 6377104.43,
  rf: 300.0,
  ellipseName: "Andrae 1876 (Den., Iclnd.)"
};
exports.aust_SA = {
  a: 6378160.0,
  rf: 298.25,
  ellipseName: "Australian Natl & S. Amer. 1969"
};
exports.GRS67 = {
  a: 6378160.0,
  rf: 298.2471674270,
  ellipseName: "GRS 67(IUGG 1967)"
};
exports.bessel = {
  a: 6377397.155,
  rf: 299.1528128,
  ellipseName: "Bessel 1841"
};
exports.bess_nam = {
  a: 6377483.865,
  rf: 299.1528128,
  ellipseName: "Bessel 1841 (Namibia)"
};
exports.clrk66 = {
  a: 6378206.4,
  b: 6356583.8,
  ellipseName: "Clarke 1866"
};
exports.clrk80 = {
  a: 6378249.145,
  rf: 293.4663,
  ellipseName: "Clarke 1880 mod."
};
exports.clrk58 = {
  a: 6378293.645208759,
  rf: 294.2606763692654,
  ellipseName: "Clarke 1858"
};
exports.CPM = {
  a: 6375738.7,
  rf: 334.29,
  ellipseName: "Comm. des Poids et Mesures 1799"
};
exports.delmbr = {
  a: 6376428.0,
  rf: 311.5,
  ellipseName: "Delambre 1810 (Belgium)"
};
exports.engelis = {
  a: 6378136.05,
  rf: 298.2566,
  ellipseName: "Engelis 1985"
};
exports.evrst30 = {
  a: 6377276.345,
  rf: 300.8017,
  ellipseName: "Everest 1830"
};
exports.evrst48 = {
  a: 6377304.063,
  rf: 300.8017,
  ellipseName: "Everest 1948"
};
exports.evrst56 = {
  a: 6377301.243,
  rf: 300.8017,
  ellipseName: "Everest 1956"
};
exports.evrst69 = {
  a: 6377295.664,
  rf: 300.8017,
  ellipseName: "Everest 1969"
};
exports.evrstSS = {
  a: 6377298.556,
  rf: 300.8017,
  ellipseName: "Everest (Sabah & Sarawak)"
};
exports.fschr60 = {
  a: 6378166.0,
  rf: 298.3,
  ellipseName: "Fischer (Mercury Datum) 1960"
};
exports.fschr60m = {
  a: 6378155.0,
  rf: 298.3,
  ellipseName: "Fischer 1960"
};
exports.fschr68 = {
  a: 6378150.0,
  rf: 298.3,
  ellipseName: "Fischer 1968"
};
exports.helmert = {
  a: 6378200.0,
  rf: 298.3,
  ellipseName: "Helmert 1906"
};
exports.hough = {
  a: 6378270.0,
  rf: 297.0,
  ellipseName: "Hough"
};
exports.intl = {
  a: 6378388.0,
  rf: 297.0,
  ellipseName: "International 1909 (Hayford)"
};
exports.kaula = {
  a: 6378163.0,
  rf: 298.24,
  ellipseName: "Kaula 1961"
};
exports.lerch = {
  a: 6378139.0,
  rf: 298.257,
  ellipseName: "Lerch 1979"
};
exports.mprts = {
  a: 6397300.0,
  rf: 191.0,
  ellipseName: "Maupertius 1738"
};
exports.new_intl = {
  a: 6378157.5,
  b: 6356772.2,
  ellipseName: "New International 1967"
};
exports.plessis = {
  a: 6376523.0,
  rf: 6355863.0,
  ellipseName: "Plessis 1817 (France)"
};
exports.krass = {
  a: 6378245.0,
  rf: 298.3,
  ellipseName: "Krassovsky, 1942"
};
exports.SEasia = {
  a: 6378155.0,
  b: 6356773.3205,
  ellipseName: "Southeast Asia"
};
exports.walbeck = {
  a: 6376896.0,
  b: 6355834.8467,
  ellipseName: "Walbeck"
};
exports.WGS60 = {
  a: 6378165.0,
  rf: 298.3,
  ellipseName: "WGS 60"
};
exports.WGS66 = {
  a: 6378145.0,
  rf: 298.25,
  ellipseName: "WGS 66"
};
exports.WGS7 = {
  a: 6378135.0,
  rf: 298.26,
  ellipseName: "WGS 72"
};
exports.WGS84 = {
  a: 6378137.0,
  rf: 298.257223563,
  ellipseName: "WGS 84"
};
exports.sphere = {
  a: 6370997.0,
  b: 6370997.0,
  ellipseName: "Normal Sphere (r=6370997)"
};
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/PrimeMeridian.js":[function(require,module,exports){
exports.greenwich = 0.0; //"0dE",
exports.lisbon = -9.131906111111; //"9d07'54.862\"W",
exports.paris = 2.337229166667; //"2d20'14.025\"E",
exports.bogota = -74.080916666667; //"74d04'51.3\"W",
exports.madrid = -3.687938888889; //"3d41'16.58\"W",
exports.rome = 12.452333333333; //"12d27'8.4\"E",
exports.bern = 7.439583333333; //"7d26'22.5\"E",
exports.jakarta = 106.807719444444; //"106d48'27.79\"E",
exports.ferro = -17.666666666667; //"17d40'W",
exports.brussels = 4.367975; //"4d22'4.71\"E",
exports.stockholm = 18.058277777778; //"18d3'29.8\"E",
exports.athens = 23.7163375; //"23d42'58.815\"E",
exports.oslo = 10.722916666667; //"10d43'22.5\"E"
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/units.js":[function(require,module,exports){
exports.ft = {to_meter: 0.3048};
exports['us-ft'] = {to_meter: 1200 / 3937};

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/core.js":[function(require,module,exports){
var proj = require('./Proj');
var transform = require('./transform');
var wgs84 = proj('WGS84');

function transformer(from, to, coords) {
  var transformedArray;
  if (Array.isArray(coords)) {
    transformedArray = transform(from, to, coords);
    if (coords.length === 3) {
      return [transformedArray.x, transformedArray.y, transformedArray.z];
    }
    else {
      return [transformedArray.x, transformedArray.y];
    }
  }
  else {
    return transform(from, to, coords);
  }
}

function checkProj(item) {
  if (item instanceof proj) {
    return item;
  }
  if (item.oProj) {
    return item.oProj;
  }
  return proj(item);
}
function proj4(fromProj, toProj, coord) {
  fromProj = checkProj(fromProj);
  var single = false;
  var obj;
  if (typeof toProj === 'undefined') {
    toProj = fromProj;
    fromProj = wgs84;
    single = true;
  }
  else if (typeof toProj.x !== 'undefined' || Array.isArray(toProj)) {
    coord = toProj;
    toProj = fromProj;
    fromProj = wgs84;
    single = true;
  }
  toProj = checkProj(toProj);
  if (coord) {
    return transformer(fromProj, toProj, coord);
  }
  else {
    obj = {
      forward: function(coords) {
        return transformer(fromProj, toProj, coords);
      },
      inverse: function(coords) {
        return transformer(toProj, fromProj, coords);
      }
    };
    if (single) {
      obj.oProj = toProj;
    }
    return obj;
  }
}
module.exports = proj4;
},{"./Proj":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Proj.js","./transform":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/transform.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/datum.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;
var PJD_3PARAM = 1;
var PJD_7PARAM = 2;
var PJD_GRIDSHIFT = 3;
var PJD_WGS84 = 4; // WGS84 or equivalent
var PJD_NODATUM = 5; // WGS84 or equivalent
var SEC_TO_RAD = 4.84813681109535993589914102357e-6;
var AD_C = 1.0026000;
var COS_67P5 = 0.38268343236508977;
var datum = function(proj) {
  if (!(this instanceof datum)) {
    return new datum(proj);
  }
  this.datum_type = PJD_WGS84; //default setting
  if (!proj) {
    return;
  }
  if (proj.datumCode && proj.datumCode === 'none') {
    this.datum_type = PJD_NODATUM;
  }
  if (proj.datum_params) {
    for (var i = 0; i < proj.datum_params.length; i++) {
      proj.datum_params[i] = parseFloat(proj.datum_params[i]);
    }
    if (proj.datum_params[0] !== 0 || proj.datum_params[1] !== 0 || proj.datum_params[2] !== 0) {
      this.datum_type = PJD_3PARAM;
    }
    if (proj.datum_params.length > 3) {
      if (proj.datum_params[3] !== 0 || proj.datum_params[4] !== 0 || proj.datum_params[5] !== 0 || proj.datum_params[6] !== 0) {
        this.datum_type = PJD_7PARAM;
        proj.datum_params[3] *= SEC_TO_RAD;
        proj.datum_params[4] *= SEC_TO_RAD;
        proj.datum_params[5] *= SEC_TO_RAD;
        proj.datum_params[6] = (proj.datum_params[6] / 1000000.0) + 1.0;
      }
    }
  }
  // DGR 2011-03-21 : nadgrids support
  this.datum_type = proj.grids ? PJD_GRIDSHIFT : this.datum_type;

  this.a = proj.a; //datum object also uses these values
  this.b = proj.b;
  this.es = proj.es;
  this.ep2 = proj.ep2;
  this.datum_params = proj.datum_params;
  if (this.datum_type === PJD_GRIDSHIFT) {
    this.grids = proj.grids;
  }
};
datum.prototype = {


  /****************************************************************/
  // cs_compare_datums()
  //   Returns TRUE if the two datums match, otherwise FALSE.
  compare_datums: function(dest) {
    if (this.datum_type !== dest.datum_type) {
      return false; // false, datums are not equal
    }
    else if (this.a !== dest.a || Math.abs(this.es - dest.es) > 0.000000000050) {
      // the tolerence for es is to ensure that GRS80 and WGS84
      // are considered identical
      return false;
    }
    else if (this.datum_type === PJD_3PARAM) {
      return (this.datum_params[0] === dest.datum_params[0] && this.datum_params[1] === dest.datum_params[1] && this.datum_params[2] === dest.datum_params[2]);
    }
    else if (this.datum_type === PJD_7PARAM) {
      return (this.datum_params[0] === dest.datum_params[0] && this.datum_params[1] === dest.datum_params[1] && this.datum_params[2] === dest.datum_params[2] && this.datum_params[3] === dest.datum_params[3] && this.datum_params[4] === dest.datum_params[4] && this.datum_params[5] === dest.datum_params[5] && this.datum_params[6] === dest.datum_params[6]);
    }
    else if (this.datum_type === PJD_GRIDSHIFT || dest.datum_type === PJD_GRIDSHIFT) {
      //alert("ERROR: Grid shift transformations are not implemented.");
      //return false
      //DGR 2012-07-29 lazy ...
      return this.nadgrids === dest.nadgrids;
    }
    else {
      return true; // datums are equal
    }
  }, // cs_compare_datums()

  /*
   * The function Convert_Geodetic_To_Geocentric converts geodetic coordinates
   * (latitude, longitude, and height) to geocentric coordinates (X, Y, Z),
   * according to the current ellipsoid parameters.
   *
   *    Latitude  : Geodetic latitude in radians                     (input)
   *    Longitude : Geodetic longitude in radians                    (input)
   *    Height    : Geodetic height, in meters                       (input)
   *    X         : Calculated Geocentric X coordinate, in meters    (output)
   *    Y         : Calculated Geocentric Y coordinate, in meters    (output)
   *    Z         : Calculated Geocentric Z coordinate, in meters    (output)
   *
   */
  geodetic_to_geocentric: function(p) {
    var Longitude = p.x;
    var Latitude = p.y;
    var Height = p.z ? p.z : 0; //Z value not always supplied
    var X; // output
    var Y;
    var Z;

    var Error_Code = 0; //  GEOCENT_NO_ERROR;
    var Rn; /*  Earth radius at location  */
    var Sin_Lat; /*  Math.sin(Latitude)  */
    var Sin2_Lat; /*  Square of Math.sin(Latitude)  */
    var Cos_Lat; /*  Math.cos(Latitude)  */

    /*
     ** Don't blow up if Latitude is just a little out of the value
     ** range as it may just be a rounding issue.  Also removed longitude
     ** test, it should be wrapped by Math.cos() and Math.sin().  NFW for PROJ.4, Sep/2001.
     */
    if (Latitude < -HALF_PI && Latitude > -1.001 * HALF_PI) {
      Latitude = -HALF_PI;
    }
    else if (Latitude > HALF_PI && Latitude < 1.001 * HALF_PI) {
      Latitude = HALF_PI;
    }
    else if ((Latitude < -HALF_PI) || (Latitude > HALF_PI)) {
      /* Latitude out of range */
      //..reportError('geocent:lat out of range:' + Latitude);
      return null;
    }

    if (Longitude > Math.PI) {
      Longitude -= (2 * Math.PI);
    }
    Sin_Lat = Math.sin(Latitude);
    Cos_Lat = Math.cos(Latitude);
    Sin2_Lat = Sin_Lat * Sin_Lat;
    Rn = this.a / (Math.sqrt(1.0e0 - this.es * Sin2_Lat));
    X = (Rn + Height) * Cos_Lat * Math.cos(Longitude);
    Y = (Rn + Height) * Cos_Lat * Math.sin(Longitude);
    Z = ((Rn * (1 - this.es)) + Height) * Sin_Lat;

    p.x = X;
    p.y = Y;
    p.z = Z;
    return Error_Code;
  }, // cs_geodetic_to_geocentric()


  geocentric_to_geodetic: function(p) {
    /* local defintions and variables */
    /* end-criterium of loop, accuracy of sin(Latitude) */
    var genau = 1e-12;
    var genau2 = (genau * genau);
    var maxiter = 30;

    var P; /* distance between semi-minor axis and location */
    var RR; /* distance between center and location */
    var CT; /* sin of geocentric latitude */
    var ST; /* cos of geocentric latitude */
    var RX;
    var RK;
    var RN; /* Earth radius at location */
    var CPHI0; /* cos of start or old geodetic latitude in iterations */
    var SPHI0; /* sin of start or old geodetic latitude in iterations */
    var CPHI; /* cos of searched geodetic latitude */
    var SPHI; /* sin of searched geodetic latitude */
    var SDPHI; /* end-criterium: addition-theorem of sin(Latitude(iter)-Latitude(iter-1)) */
    var At_Pole; /* indicates location is in polar region */
    var iter; /* # of continous iteration, max. 30 is always enough (s.a.) */

    var X = p.x;
    var Y = p.y;
    var Z = p.z ? p.z : 0.0; //Z value not always supplied
    var Longitude;
    var Latitude;
    var Height;

    At_Pole = false;
    P = Math.sqrt(X * X + Y * Y);
    RR = Math.sqrt(X * X + Y * Y + Z * Z);

    /*      special cases for latitude and longitude */
    if (P / this.a < genau) {

      /*  special case, if P=0. (X=0., Y=0.) */
      At_Pole = true;
      Longitude = 0.0;

      /*  if (X,Y,Z)=(0.,0.,0.) then Height becomes semi-minor axis
       *  of ellipsoid (=center of mass), Latitude becomes PI/2 */
      if (RR / this.a < genau) {
        Latitude = HALF_PI;
        Height = -this.b;
        return;
      }
    }
    else {
      /*  ellipsoidal (geodetic) longitude
       *  interval: -PI < Longitude <= +PI */
      Longitude = Math.atan2(Y, X);
    }

    /* --------------------------------------------------------------
     * Following iterative algorithm was developped by
     * "Institut for Erdmessung", University of Hannover, July 1988.
     * Internet: www.ife.uni-hannover.de
     * Iterative computation of CPHI,SPHI and Height.
     * Iteration of CPHI and SPHI to 10**-12 radian resp.
     * 2*10**-7 arcsec.
     * --------------------------------------------------------------
     */
    CT = Z / RR;
    ST = P / RR;
    RX = 1.0 / Math.sqrt(1.0 - this.es * (2.0 - this.es) * ST * ST);
    CPHI0 = ST * (1.0 - this.es) * RX;
    SPHI0 = CT * RX;
    iter = 0;

    /* loop to find sin(Latitude) resp. Latitude
     * until |sin(Latitude(iter)-Latitude(iter-1))| < genau */
    do {
      iter++;
      RN = this.a / Math.sqrt(1.0 - this.es * SPHI0 * SPHI0);

      /*  ellipsoidal (geodetic) height */
      Height = P * CPHI0 + Z * SPHI0 - RN * (1.0 - this.es * SPHI0 * SPHI0);

      RK = this.es * RN / (RN + Height);
      RX = 1.0 / Math.sqrt(1.0 - RK * (2.0 - RK) * ST * ST);
      CPHI = ST * (1.0 - RK) * RX;
      SPHI = CT * RX;
      SDPHI = SPHI * CPHI0 - CPHI * SPHI0;
      CPHI0 = CPHI;
      SPHI0 = SPHI;
    }
    while (SDPHI * SDPHI > genau2 && iter < maxiter);

    /*      ellipsoidal (geodetic) latitude */
    Latitude = Math.atan(SPHI / Math.abs(CPHI));

    p.x = Longitude;
    p.y = Latitude;
    p.z = Height;
    return p;
  }, // cs_geocentric_to_geodetic()

  /** Convert_Geocentric_To_Geodetic
   * The method used here is derived from 'An Improved Algorithm for
   * Geocentric to Geodetic Coordinate Conversion', by Ralph Toms, Feb 1996
   */
  geocentric_to_geodetic_noniter: function(p) {
    var X = p.x;
    var Y = p.y;
    var Z = p.z ? p.z : 0; //Z value not always supplied
    var Longitude;
    var Latitude;
    var Height;

    var W; /* distance from Z axis */
    var W2; /* square of distance from Z axis */
    var T0; /* initial estimate of vertical component */
    var T1; /* corrected estimate of vertical component */
    var S0; /* initial estimate of horizontal component */
    var S1; /* corrected estimate of horizontal component */
    var Sin_B0; /* Math.sin(B0), B0 is estimate of Bowring aux variable */
    var Sin3_B0; /* cube of Math.sin(B0) */
    var Cos_B0; /* Math.cos(B0) */
    var Sin_p1; /* Math.sin(phi1), phi1 is estimated latitude */
    var Cos_p1; /* Math.cos(phi1) */
    var Rn; /* Earth radius at location */
    var Sum; /* numerator of Math.cos(phi1) */
    var At_Pole; /* indicates location is in polar region */

    X = parseFloat(X); // cast from string to float
    Y = parseFloat(Y);
    Z = parseFloat(Z);

    At_Pole = false;
    if (X !== 0.0) {
      Longitude = Math.atan2(Y, X);
    }
    else {
      if (Y > 0) {
        Longitude = HALF_PI;
      }
      else if (Y < 0) {
        Longitude = -HALF_PI;
      }
      else {
        At_Pole = true;
        Longitude = 0.0;
        if (Z > 0.0) { /* north pole */
          Latitude = HALF_PI;
        }
        else if (Z < 0.0) { /* south pole */
          Latitude = -HALF_PI;
        }
        else { /* center of earth */
          Latitude = HALF_PI;
          Height = -this.b;
          return;
        }
      }
    }
    W2 = X * X + Y * Y;
    W = Math.sqrt(W2);
    T0 = Z * AD_C;
    S0 = Math.sqrt(T0 * T0 + W2);
    Sin_B0 = T0 / S0;
    Cos_B0 = W / S0;
    Sin3_B0 = Sin_B0 * Sin_B0 * Sin_B0;
    T1 = Z + this.b * this.ep2 * Sin3_B0;
    Sum = W - this.a * this.es * Cos_B0 * Cos_B0 * Cos_B0;
    S1 = Math.sqrt(T1 * T1 + Sum * Sum);
    Sin_p1 = T1 / S1;
    Cos_p1 = Sum / S1;
    Rn = this.a / Math.sqrt(1.0 - this.es * Sin_p1 * Sin_p1);
    if (Cos_p1 >= COS_67P5) {
      Height = W / Cos_p1 - Rn;
    }
    else if (Cos_p1 <= -COS_67P5) {
      Height = W / -Cos_p1 - Rn;
    }
    else {
      Height = Z / Sin_p1 + Rn * (this.es - 1.0);
    }
    if (At_Pole === false) {
      Latitude = Math.atan(Sin_p1 / Cos_p1);
    }

    p.x = Longitude;
    p.y = Latitude;
    p.z = Height;
    return p;
  }, // geocentric_to_geodetic_noniter()

  /****************************************************************/
  // pj_geocentic_to_wgs84( p )
  //  p = point to transform in geocentric coordinates (x,y,z)
  geocentric_to_wgs84: function(p) {

    if (this.datum_type === PJD_3PARAM) {
      // if( x[io] === HUGE_VAL )
      //    continue;
      p.x += this.datum_params[0];
      p.y += this.datum_params[1];
      p.z += this.datum_params[2];

    }
    else if (this.datum_type === PJD_7PARAM) {
      var Dx_BF = this.datum_params[0];
      var Dy_BF = this.datum_params[1];
      var Dz_BF = this.datum_params[2];
      var Rx_BF = this.datum_params[3];
      var Ry_BF = this.datum_params[4];
      var Rz_BF = this.datum_params[5];
      var M_BF = this.datum_params[6];
      // if( x[io] === HUGE_VAL )
      //    continue;
      var x_out = M_BF * (p.x - Rz_BF * p.y + Ry_BF * p.z) + Dx_BF;
      var y_out = M_BF * (Rz_BF * p.x + p.y - Rx_BF * p.z) + Dy_BF;
      var z_out = M_BF * (-Ry_BF * p.x + Rx_BF * p.y + p.z) + Dz_BF;
      p.x = x_out;
      p.y = y_out;
      p.z = z_out;
    }
  }, // cs_geocentric_to_wgs84

  /****************************************************************/
  // pj_geocentic_from_wgs84()
  //  coordinate system definition,
  //  point to transform in geocentric coordinates (x,y,z)
  geocentric_from_wgs84: function(p) {

    if (this.datum_type === PJD_3PARAM) {
      //if( x[io] === HUGE_VAL )
      //    continue;
      p.x -= this.datum_params[0];
      p.y -= this.datum_params[1];
      p.z -= this.datum_params[2];

    }
    else if (this.datum_type === PJD_7PARAM) {
      var Dx_BF = this.datum_params[0];
      var Dy_BF = this.datum_params[1];
      var Dz_BF = this.datum_params[2];
      var Rx_BF = this.datum_params[3];
      var Ry_BF = this.datum_params[4];
      var Rz_BF = this.datum_params[5];
      var M_BF = this.datum_params[6];
      var x_tmp = (p.x - Dx_BF) / M_BF;
      var y_tmp = (p.y - Dy_BF) / M_BF;
      var z_tmp = (p.z - Dz_BF) / M_BF;
      //if( x[io] === HUGE_VAL )
      //    continue;

      p.x = x_tmp + Rz_BF * y_tmp - Ry_BF * z_tmp;
      p.y = -Rz_BF * x_tmp + y_tmp + Rx_BF * z_tmp;
      p.z = Ry_BF * x_tmp - Rx_BF * y_tmp + z_tmp;
    } //cs_geocentric_from_wgs84()
  }
};

/** point object, nothing fancy, just allows values to be
    passed back and forth by reference rather than by value.
    Other point classes may be used as long as they have
    x and y properties, which will get modified in the transform method.
*/
module.exports = datum;

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/datum_transform.js":[function(require,module,exports){
var PJD_3PARAM = 1;
var PJD_7PARAM = 2;
var PJD_GRIDSHIFT = 3;
var PJD_NODATUM = 5; // WGS84 or equivalent
var SRS_WGS84_SEMIMAJOR = 6378137; // only used in grid shift transforms
var SRS_WGS84_ESQUARED = 0.006694379990141316; //DGR: 2012-07-29
module.exports = function(source, dest, point) {
  var wp, i, l;

  function checkParams(fallback) {
    return (fallback === PJD_3PARAM || fallback === PJD_7PARAM);
  }
  // Short cut if the datums are identical.
  if (source.compare_datums(dest)) {
    return point; // in this case, zero is sucess,
    // whereas cs_compare_datums returns 1 to indicate TRUE
    // confusing, should fix this
  }

  // Explicitly skip datum transform by setting 'datum=none' as parameter for either source or dest
  if (source.datum_type === PJD_NODATUM || dest.datum_type === PJD_NODATUM) {
    return point;
  }

  //DGR: 2012-07-29 : add nadgrids support (begin)
  var src_a = source.a;
  var src_es = source.es;

  var dst_a = dest.a;
  var dst_es = dest.es;

  var fallback = source.datum_type;
  // If this datum requires grid shifts, then apply it to geodetic coordinates.
  if (fallback === PJD_GRIDSHIFT) {
    if (this.apply_gridshift(source, 0, point) === 0) {
      source.a = SRS_WGS84_SEMIMAJOR;
      source.es = SRS_WGS84_ESQUARED;
    }
    else {
      // try 3 or 7 params transformation or nothing ?
      if (!source.datum_params) {
        source.a = src_a;
        source.es = source.es;
        return point;
      }
      wp = 1;
      for (i = 0, l = source.datum_params.length; i < l; i++) {
        wp *= source.datum_params[i];
      }
      if (wp === 0) {
        source.a = src_a;
        source.es = source.es;
        return point;
      }
      if (source.datum_params.length > 3) {
        fallback = PJD_7PARAM;
      }
      else {
        fallback = PJD_3PARAM;
      }
    }
  }
  if (dest.datum_type === PJD_GRIDSHIFT) {
    dest.a = SRS_WGS84_SEMIMAJOR;
    dest.es = SRS_WGS84_ESQUARED;
  }
  // Do we need to go through geocentric coordinates?
  if (source.es !== dest.es || source.a !== dest.a || checkParams(fallback) || checkParams(dest.datum_type)) {
    //DGR: 2012-07-29 : add nadgrids support (end)
    // Convert to geocentric coordinates.
    source.geodetic_to_geocentric(point);
    // CHECK_RETURN;
    // Convert between datums
    if (checkParams(source.datum_type)) {
      source.geocentric_to_wgs84(point);
      // CHECK_RETURN;
    }
    if (checkParams(dest.datum_type)) {
      dest.geocentric_from_wgs84(point);
      // CHECK_RETURN;
    }
    // Convert back to geodetic coordinates
    dest.geocentric_to_geodetic(point);
    // CHECK_RETURN;
  }
  // Apply grid shift to destination if required
  if (dest.datum_type === PJD_GRIDSHIFT) {
    this.apply_gridshift(dest, 1, point);
    // CHECK_RETURN;
  }

  source.a = src_a;
  source.es = src_es;
  dest.a = dst_a;
  dest.es = dst_es;

  return point;
};


},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/defs.js":[function(require,module,exports){
var globals = require('./global');
var parseProj = require('./projString');
var wkt = require('./wkt');

function defs(name) {
  /*global console*/
  var that = this;
  if (arguments.length === 2) {
    var def = arguments[1];
    if (typeof def === 'string') {
      if (def.charAt(0) === '+') {
        defs[name] = parseProj(arguments[1]);
      }
      else {
        defs[name] = wkt(arguments[1]);
      }
    } else {
      defs[name] = def;
    }
  }
  else if (arguments.length === 1) {
    if (Array.isArray(name)) {
      return name.map(function(v) {
        if (Array.isArray(v)) {
          defs.apply(that, v);
        }
        else {
          defs(v);
        }
      });
    }
    else if (typeof name === 'string') {
      if (name in defs) {
        return defs[name];
      }
    }
    else if ('EPSG' in name) {
      defs['EPSG:' + name.EPSG] = name;
    }
    else if ('ESRI' in name) {
      defs['ESRI:' + name.ESRI] = name;
    }
    else if ('IAU2000' in name) {
      defs['IAU2000:' + name.IAU2000] = name;
    }
    else {
      console.log(name);
    }
    return;
  }


}
globals(defs);
module.exports = defs;

},{"./global":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/global.js","./projString":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projString.js","./wkt":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/wkt.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/deriveConstants.js":[function(require,module,exports){
var Datum = require('./constants/Datum');
var Ellipsoid = require('./constants/Ellipsoid');
var extend = require('./extend');
var datum = require('./datum');
var EPSLN = 1.0e-10;
// ellipoid pj_set_ell.c
var SIXTH = 0.1666666666666666667;
/* 1/6 */
var RA4 = 0.04722222222222222222;
/* 17/360 */
var RA6 = 0.02215608465608465608;
module.exports = function(json) {
  // DGR 2011-03-20 : nagrids -> nadgrids
  if (json.datumCode && json.datumCode !== 'none') {
    var datumDef = Datum[json.datumCode];
    if (datumDef) {
      json.datum_params = datumDef.towgs84 ? datumDef.towgs84.split(',') : null;
      json.ellps = datumDef.ellipse;
      json.datumName = datumDef.datumName ? datumDef.datumName : json.datumCode;
    }
  }
  if (!json.a) { // do we have an ellipsoid?
    var ellipse = Ellipsoid[json.ellps] ? Ellipsoid[json.ellps] : Ellipsoid.WGS84;
    extend(json, ellipse);
  }
  if (json.rf && !json.b) {
    json.b = (1.0 - 1.0 / json.rf) * json.a;
  }
  if (json.rf === 0 || Math.abs(json.a - json.b) < EPSLN) {
    json.sphere = true;
    json.b = json.a;
  }
  json.a2 = json.a * json.a; // used in geocentric
  json.b2 = json.b * json.b; // used in geocentric
  json.es = (json.a2 - json.b2) / json.a2; // e ^ 2
  json.e = Math.sqrt(json.es); // eccentricity
  if (json.R_A) {
    json.a *= 1 - json.es * (SIXTH + json.es * (RA4 + json.es * RA6));
    json.a2 = json.a * json.a;
    json.b2 = json.b * json.b;
    json.es = 0;
  }
  json.ep2 = (json.a2 - json.b2) / json.b2; // used in geocentric
  if (!json.k0) {
    json.k0 = 1.0; //default value
  }
  //DGR 2010-11-12: axis
  if (!json.axis) {
    json.axis = "enu";
  }

  if (!json.datum) {
    json.datum = datum(json);
  }
  return json;
};

},{"./constants/Datum":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/Datum.js","./constants/Ellipsoid":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/Ellipsoid.js","./datum":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/datum.js","./extend":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/extend.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/extend.js":[function(require,module,exports){
module.exports = function(destination, source) {
  destination = destination || {};
  var value, property;
  if (!source) {
    return destination;
  }
  for (property in source) {
    value = source[property];
    if (value !== undefined) {
      destination[property] = value;
    }
  }
  return destination;
};

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/global.js":[function(require,module,exports){
module.exports = function(defs) {
  defs('EPSG:4326', "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees");
  defs('EPSG:4269', "+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees");
  defs('EPSG:3857', "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");

  defs.WGS84 = defs['EPSG:4326'];
  defs['EPSG:3785'] = defs['EPSG:3857']; // maintain backward compat, official code is 3857
  defs.GOOGLE = defs['EPSG:3857'];
  defs['EPSG:900913'] = defs['EPSG:3857'];
  defs['EPSG:102113'] = defs['EPSG:3857'];
};

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/includedProjections.js":[function(require,module,exports){
var projs = [
  require('./projections/tmerc'),
  require('./projections/utm'),
  require('./projections/sterea'),
  require('./projections/stere'),
  require('./projections/somerc'),
  require('./projections/omerc'),
  require('./projections/lcc'),
  require('./projections/krovak'),
  require('./projections/cass'),
  require('./projections/laea'),
  require('./projections/aea'),
  require('./projections/gnom'),
  require('./projections/cea'),
  require('./projections/eqc'),
  require('./projections/poly'),
  require('./projections/nzmg'),
  require('./projections/mill'),
  require('./projections/sinu'),
  require('./projections/moll'),
  require('./projections/eqdc'),
  require('./projections/vandg'),
  require('./projections/aeqd')
];
module.exports = function(proj4){
  projs.forEach(function(proj){
    proj4.Proj.projections.add(proj);
  });
};
},{"./projections/aea":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/aea.js","./projections/aeqd":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/aeqd.js","./projections/cass":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/cass.js","./projections/cea":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/cea.js","./projections/eqc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/eqc.js","./projections/eqdc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/eqdc.js","./projections/gnom":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/gnom.js","./projections/krovak":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/krovak.js","./projections/laea":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/laea.js","./projections/lcc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/lcc.js","./projections/mill":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/mill.js","./projections/moll":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/moll.js","./projections/nzmg":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/nzmg.js","./projections/omerc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/omerc.js","./projections/poly":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/poly.js","./projections/sinu":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/sinu.js","./projections/somerc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/somerc.js","./projections/stere":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/stere.js","./projections/sterea":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/sterea.js","./projections/tmerc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/tmerc.js","./projections/utm":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/utm.js","./projections/vandg":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/vandg.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/index.js":[function(require,module,exports){
var proj4 = require('./core');
proj4.defaultDatum = 'WGS84'; //default datum
proj4.Proj = require('./Proj');
proj4.WGS84 = new proj4.Proj('WGS84');
proj4.Point = require('./Point');
proj4.toPoint = require("./common/toPoint");
proj4.defs = require('./defs');
proj4.transform = require('./transform');
proj4.mgrs = require('mgrs');
proj4.version = require('../package.json').version;
require('./includedProjections')(proj4);
module.exports = proj4;
},{"../package.json":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/package.json","./Point":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Point.js","./Proj":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Proj.js","./common/toPoint":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/toPoint.js","./core":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/core.js","./defs":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/defs.js","./includedProjections":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/includedProjections.js","./transform":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/transform.js","mgrs":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/node_modules/mgrs/mgrs.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/parseCode.js":[function(require,module,exports){
var defs = require('./defs');
var wkt = require('./wkt');
var projStr = require('./projString');
function testObj(code){
  return typeof code === 'string';
}
function testDef(code){
  return code in defs;
}
function testWKT(code){
  var codeWords = ['GEOGCS','GEOCCS','PROJCS','LOCAL_CS'];
  return codeWords.reduce(function(a,b){
    return a+1+code.indexOf(b);
  },0);
}
function testProj(code){
  return code[0] === '+';
}
function parse(code){
  if (testObj(code)) {
    //check to see if this is a WKT string
    if (testDef(code)) {
      return defs[code];
    }
    else if (testWKT(code)) {
      return wkt(code);
    }
    else if (testProj(code)) {
      return projStr(code);
    }
  }else{
    return code;
  }
}

module.exports = parse;
},{"./defs":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/defs.js","./projString":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projString.js","./wkt":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/wkt.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projString.js":[function(require,module,exports){
var D2R = 0.01745329251994329577;
var PrimeMeridian = require('./constants/PrimeMeridian');
var units = require('./constants/units');

module.exports = function(defData) {
  var self = {};
  var paramObj = {};
  defData.split("+").map(function(v) {
    return v.trim();
  }).filter(function(a) {
    return a;
  }).forEach(function(a) {
    var split = a.split("=");
    split.push(true);
    paramObj[split[0].toLowerCase()] = split[1];
  });
  var paramName, paramVal, paramOutname;
  var params = {
    proj: 'projName',
    datum: 'datumCode',
    rf: function(v) {
      self.rf = parseFloat(v);
    },
    lat_0: function(v) {
      self.lat0 = v * D2R;
    },
    lat_1: function(v) {
      self.lat1 = v * D2R;
    },
    lat_2: function(v) {
      self.lat2 = v * D2R;
    },
    lat_ts: function(v) {
      self.lat_ts = v * D2R;
    },
    lon_0: function(v) {
      self.long0 = v * D2R;
    },
    lon_1: function(v) {
      self.long1 = v * D2R;
    },
    lon_2: function(v) {
      self.long2 = v * D2R;
    },
    alpha: function(v) {
      self.alpha = parseFloat(v) * D2R;
    },
    lonc: function(v) {
      self.longc = v * D2R;
    },
    x_0: function(v) {
      self.x0 = parseFloat(v);
    },
    y_0: function(v) {
      self.y0 = parseFloat(v);
    },
    k_0: function(v) {
      self.k0 = parseFloat(v);
    },
    k: function(v) {
      self.k0 = parseFloat(v);
    },
    a: function(v) {
      self.a = parseFloat(v);
    },
    b: function(v) {
      self.b = parseFloat(v);
    },
    r_a: function() {
      self.R_A = true;
    },
    zone: function(v) {
      self.zone = parseInt(v, 10);
    },
    south: function() {
      self.utmSouth = true;
    },
    towgs84: function(v) {
      self.datum_params = v.split(",").map(function(a) {
        return parseFloat(a);
      });
    },
    to_meter: function(v) {
      self.to_meter = parseFloat(v);
    },
    units: function(v) {
      self.units = v;
      if (units[v]) {
        self.to_meter = units[v].to_meter;
      }
    },
    from_greenwich: function(v) {
      self.from_greenwich = v * D2R;
    },
    pm: function(v) {
      self.from_greenwich = (PrimeMeridian[v] ? PrimeMeridian[v] : parseFloat(v)) * D2R;
    },
    nadgrids: function(v) {
      if (v === '@null') {
        self.datumCode = 'none';
      }
      else {
        self.nadgrids = v;
      }
    },
    axis: function(v) {
      var legalAxis = "ewnsud";
      if (v.length === 3 && legalAxis.indexOf(v.substr(0, 1)) !== -1 && legalAxis.indexOf(v.substr(1, 1)) !== -1 && legalAxis.indexOf(v.substr(2, 1)) !== -1) {
        self.axis = v;
      }
    }
  };
  for (paramName in paramObj) {
    paramVal = paramObj[paramName];
    if (paramName in params) {
      paramOutname = params[paramName];
      if (typeof paramOutname === 'function') {
        paramOutname(paramVal);
      }
      else {
        self[paramOutname] = paramVal;
      }
    }
    else {
      self[paramName] = paramVal;
    }
  }
  if(typeof self.datumCode === 'string' && self.datumCode !== "WGS84"){
    self.datumCode = self.datumCode.toLowerCase();
  }
  return self;
};

},{"./constants/PrimeMeridian":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/PrimeMeridian.js","./constants/units":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/constants/units.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections.js":[function(require,module,exports){
var projs = [
  require('./projections/merc'),
  require('./projections/longlat')
];
var names = {};
var projStore = [];

function add(proj, i) {
  var len = projStore.length;
  if (!proj.names) {
    console.log(i);
    return true;
  }
  projStore[len] = proj;
  proj.names.forEach(function(n) {
    names[n.toLowerCase()] = len;
  });
  return this;
}

exports.add = add;

exports.get = function(name) {
  if (!name) {
    return false;
  }
  var n = name.toLowerCase();
  if (typeof names[n] !== 'undefined' && projStore[names[n]]) {
    return projStore[names[n]];
  }
};
exports.start = function() {
  projs.forEach(add);
};

},{"./projections/longlat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/longlat.js","./projections/merc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/merc.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/aea.js":[function(require,module,exports){
var EPSLN = 1.0e-10;
var msfnz = require('../common/msfnz');
var qsfnz = require('../common/qsfnz');
var adjust_lon = require('../common/adjust_lon');
var asinz = require('../common/asinz');
exports.init = function() {

  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2);
  this.e3 = Math.sqrt(this.es);

  this.sin_po = Math.sin(this.lat1);
  this.cos_po = Math.cos(this.lat1);
  this.t1 = this.sin_po;
  this.con = this.sin_po;
  this.ms1 = msfnz(this.e3, this.sin_po, this.cos_po);
  this.qs1 = qsfnz(this.e3, this.sin_po, this.cos_po);

  this.sin_po = Math.sin(this.lat2);
  this.cos_po = Math.cos(this.lat2);
  this.t2 = this.sin_po;
  this.ms2 = msfnz(this.e3, this.sin_po, this.cos_po);
  this.qs2 = qsfnz(this.e3, this.sin_po, this.cos_po);

  this.sin_po = Math.sin(this.lat0);
  this.cos_po = Math.cos(this.lat0);
  this.t3 = this.sin_po;
  this.qs0 = qsfnz(this.e3, this.sin_po, this.cos_po);

  if (Math.abs(this.lat1 - this.lat2) > EPSLN) {
    this.ns0 = (this.ms1 * this.ms1 - this.ms2 * this.ms2) / (this.qs2 - this.qs1);
  }
  else {
    this.ns0 = this.con;
  }
  this.c = this.ms1 * this.ms1 + this.ns0 * this.qs1;
  this.rh = this.a * Math.sqrt(this.c - this.ns0 * this.qs0) / this.ns0;
};

/* Albers Conical Equal Area forward equations--mapping lat,long to x,y
  -------------------------------------------------------------------*/
exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  this.sin_phi = Math.sin(lat);
  this.cos_phi = Math.cos(lat);

  var qs = qsfnz(this.e3, this.sin_phi, this.cos_phi);
  var rh1 = this.a * Math.sqrt(this.c - this.ns0 * qs) / this.ns0;
  var theta = this.ns0 * adjust_lon(lon - this.long0);
  var x = rh1 * Math.sin(theta) + this.x0;
  var y = this.rh - rh1 * Math.cos(theta) + this.y0;

  p.x = x;
  p.y = y;
  return p;
};


exports.inverse = function(p) {
  var rh1, qs, con, theta, lon, lat;

  p.x -= this.x0;
  p.y = this.rh - p.y + this.y0;
  if (this.ns0 >= 0) {
    rh1 = Math.sqrt(p.x * p.x + p.y * p.y);
    con = 1;
  }
  else {
    rh1 = -Math.sqrt(p.x * p.x + p.y * p.y);
    con = -1;
  }
  theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2(con * p.x, con * p.y);
  }
  con = rh1 * this.ns0 / this.a;
  if (this.sphere) {
    lat = Math.asin((this.c - con * con) / (2 * this.ns0));
  }
  else {
    qs = (this.c - con * con) / this.ns0;
    lat = this.phi1z(this.e3, qs);
  }

  lon = adjust_lon(theta / this.ns0 + this.long0);
  p.x = lon;
  p.y = lat;
  return p;
};

/* Function to compute phi1, the latitude for the inverse of the
   Albers Conical Equal-Area projection.
-------------------------------------------*/
exports.phi1z = function(eccent, qs) {
  var sinphi, cosphi, con, com, dphi;
  var phi = asinz(0.5 * qs);
  if (eccent < EPSLN) {
    return phi;
  }

  var eccnts = eccent * eccent;
  for (var i = 1; i <= 25; i++) {
    sinphi = Math.sin(phi);
    cosphi = Math.cos(phi);
    con = eccent * sinphi;
    com = 1 - con * con;
    dphi = 0.5 * com * com / cosphi * (qs / (1 - eccnts) - sinphi / com + 0.5 / eccent * Math.log((1 - con) / (1 + con)));
    phi = phi + dphi;
    if (Math.abs(dphi) <= 1e-7) {
      return phi;
    }
  }
  return null;
};
exports.names = ["Albers_Conic_Equal_Area", "Albers", "aea"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js","../common/qsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/qsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/aeqd.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var mlfn = require('../common/mlfn');
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var gN = require('../common/gN');
var asinz = require('../common/asinz');
var imlfn = require('../common/imlfn');
exports.init = function() {
  this.sin_p12 = Math.sin(this.lat0);
  this.cos_p12 = Math.cos(this.lat0);
};

exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var sinphi = Math.sin(p.y);
  var cosphi = Math.cos(p.y);
  var dlon = adjust_lon(lon - this.long0);
  var e0, e1, e2, e3, Mlp, Ml, tanphi, Nl1, Nl, psi, Az, G, H, GH, Hs, c, kp, cos_c, s, s2, s3, s4, s5;
  if (this.sphere) {
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      //North Pole case
      p.x = this.x0 + this.a * (HALF_PI - lat) * Math.sin(dlon);
      p.y = this.y0 - this.a * (HALF_PI - lat) * Math.cos(dlon);
      return p;
    }
    else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      //South Pole case
      p.x = this.x0 + this.a * (HALF_PI + lat) * Math.sin(dlon);
      p.y = this.y0 + this.a * (HALF_PI + lat) * Math.cos(dlon);
      return p;
    }
    else {
      //default case
      cos_c = this.sin_p12 * sinphi + this.cos_p12 * cosphi * Math.cos(dlon);
      c = Math.acos(cos_c);
      kp = c / Math.sin(c);
      p.x = this.x0 + this.a * kp * cosphi * Math.sin(dlon);
      p.y = this.y0 + this.a * kp * (this.cos_p12 * sinphi - this.sin_p12 * cosphi * Math.cos(dlon));
      return p;
    }
  }
  else {
    e0 = e0fn(this.es);
    e1 = e1fn(this.es);
    e2 = e2fn(this.es);
    e3 = e3fn(this.es);
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      //North Pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      Ml = this.a * mlfn(e0, e1, e2, e3, lat);
      p.x = this.x0 + (Mlp - Ml) * Math.sin(dlon);
      p.y = this.y0 - (Mlp - Ml) * Math.cos(dlon);
      return p;
    }
    else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      //South Pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      Ml = this.a * mlfn(e0, e1, e2, e3, lat);
      p.x = this.x0 + (Mlp + Ml) * Math.sin(dlon);
      p.y = this.y0 + (Mlp + Ml) * Math.cos(dlon);
      return p;
    }
    else {
      //Default case
      tanphi = sinphi / cosphi;
      Nl1 = gN(this.a, this.e, this.sin_p12);
      Nl = gN(this.a, this.e, sinphi);
      psi = Math.atan((1 - this.es) * tanphi + this.es * Nl1 * this.sin_p12 / (Nl * cosphi));
      Az = Math.atan2(Math.sin(dlon), this.cos_p12 * Math.tan(psi) - this.sin_p12 * Math.cos(dlon));
      if (Az === 0) {
        s = Math.asin(this.cos_p12 * Math.sin(psi) - this.sin_p12 * Math.cos(psi));
      }
      else if (Math.abs(Math.abs(Az) - Math.PI) <= EPSLN) {
        s = -Math.asin(this.cos_p12 * Math.sin(psi) - this.sin_p12 * Math.cos(psi));
      }
      else {
        s = Math.asin(Math.sin(dlon) * Math.cos(psi) / Math.sin(Az));
      }
      G = this.e * this.sin_p12 / Math.sqrt(1 - this.es);
      H = this.e * this.cos_p12 * Math.cos(Az) / Math.sqrt(1 - this.es);
      GH = G * H;
      Hs = H * H;
      s2 = s * s;
      s3 = s2 * s;
      s4 = s3 * s;
      s5 = s4 * s;
      c = Nl1 * s * (1 - s2 * Hs * (1 - Hs) / 6 + s3 / 8 * GH * (1 - 2 * Hs) + s4 / 120 * (Hs * (4 - 7 * Hs) - 3 * G * G * (1 - 7 * Hs)) - s5 / 48 * GH);
      p.x = this.x0 + c * Math.sin(Az);
      p.y = this.y0 + c * Math.cos(Az);
      return p;
    }
  }


};

exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var rh, z, sinz, cosz, lon, lat, con, e0, e1, e2, e3, Mlp, M, N1, psi, Az, cosAz, tmp, A, B, D, Ee, F;
  if (this.sphere) {
    rh = Math.sqrt(p.x * p.x + p.y * p.y);
    if (rh > (2 * HALF_PI * this.a)) {
      return;
    }
    z = rh / this.a;

    sinz = Math.sin(z);
    cosz = Math.cos(z);

    lon = this.long0;
    if (Math.abs(rh) <= EPSLN) {
      lat = this.lat0;
    }
    else {
      lat = asinz(cosz * this.sin_p12 + (p.y * sinz * this.cos_p12) / rh);
      con = Math.abs(this.lat0) - HALF_PI;
      if (Math.abs(con) <= EPSLN) {
        if (this.lat0 >= 0) {
          lon = adjust_lon(this.long0 + Math.atan2(p.x, - p.y));
        }
        else {
          lon = adjust_lon(this.long0 - Math.atan2(-p.x, p.y));
        }
      }
      else {
        /*con = cosz - this.sin_p12 * Math.sin(lat);
        if ((Math.abs(con) < EPSLN) && (Math.abs(p.x) < EPSLN)) {
          //no-op, just keep the lon value as is
        } else {
          var temp = Math.atan2((p.x * sinz * this.cos_p12), (con * rh));
          lon = adjust_lon(this.long0 + Math.atan2((p.x * sinz * this.cos_p12), (con * rh)));
        }*/
        lon = adjust_lon(this.long0 + Math.atan2(p.x * sinz, rh * this.cos_p12 * cosz - p.y * this.sin_p12 * sinz));
      }
    }

    p.x = lon;
    p.y = lat;
    return p;
  }
  else {
    e0 = e0fn(this.es);
    e1 = e1fn(this.es);
    e2 = e2fn(this.es);
    e3 = e3fn(this.es);
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      //North pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      rh = Math.sqrt(p.x * p.x + p.y * p.y);
      M = Mlp - rh;
      lat = imlfn(M / this.a, e0, e1, e2, e3);
      lon = adjust_lon(this.long0 + Math.atan2(p.x, - 1 * p.y));
      p.x = lon;
      p.y = lat;
      return p;
    }
    else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      //South pole case
      Mlp = this.a * mlfn(e0, e1, e2, e3, HALF_PI);
      rh = Math.sqrt(p.x * p.x + p.y * p.y);
      M = rh - Mlp;

      lat = imlfn(M / this.a, e0, e1, e2, e3);
      lon = adjust_lon(this.long0 + Math.atan2(p.x, p.y));
      p.x = lon;
      p.y = lat;
      return p;
    }
    else {
      //default case
      rh = Math.sqrt(p.x * p.x + p.y * p.y);
      Az = Math.atan2(p.x, p.y);
      N1 = gN(this.a, this.e, this.sin_p12);
      cosAz = Math.cos(Az);
      tmp = this.e * this.cos_p12 * cosAz;
      A = -tmp * tmp / (1 - this.es);
      B = 3 * this.es * (1 - A) * this.sin_p12 * this.cos_p12 * cosAz / (1 - this.es);
      D = rh / N1;
      Ee = D - A * (1 + A) * Math.pow(D, 3) / 6 - B * (1 + 3 * A) * Math.pow(D, 4) / 24;
      F = 1 - A * Ee * Ee / 2 - D * Ee * Ee * Ee / 6;
      psi = Math.asin(this.sin_p12 * Math.cos(Ee) + this.cos_p12 * Math.sin(Ee) * cosAz);
      lon = adjust_lon(this.long0 + Math.asin(Math.sin(Az) * Math.sin(Ee) / Math.cos(psi)));
      lat = Math.atan((1 - this.es * F * this.sin_p12 / Math.sin(psi)) * Math.tan(psi) / (1 - this.es));
      p.x = lon;
      p.y = lat;
      return p;
    }
  }

};
exports.names = ["Azimuthal_Equidistant", "aeqd"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js","../common/e0fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js","../common/e1fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js","../common/e2fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js","../common/e3fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js","../common/gN":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/gN.js","../common/imlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/imlfn.js","../common/mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/cass.js":[function(require,module,exports){
var mlfn = require('../common/mlfn');
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var gN = require('../common/gN');
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var imlfn = require('../common/imlfn');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
exports.init = function() {
  if (!this.sphere) {
    this.e0 = e0fn(this.es);
    this.e1 = e1fn(this.es);
    this.e2 = e2fn(this.es);
    this.e3 = e3fn(this.es);
    this.ml0 = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
  }
};



/* Cassini forward equations--mapping lat,long to x,y
  -----------------------------------------------------------------------*/
exports.forward = function(p) {

  /* Forward equations
      -----------------*/
  var x, y;
  var lam = p.x;
  var phi = p.y;
  lam = adjust_lon(lam - this.long0);

  if (this.sphere) {
    x = this.a * Math.asin(Math.cos(phi) * Math.sin(lam));
    y = this.a * (Math.atan2(Math.tan(phi), Math.cos(lam)) - this.lat0);
  }
  else {
    //ellipsoid
    var sinphi = Math.sin(phi);
    var cosphi = Math.cos(phi);
    var nl = gN(this.a, this.e, sinphi);
    var tl = Math.tan(phi) * Math.tan(phi);
    var al = lam * Math.cos(phi);
    var asq = al * al;
    var cl = this.es * cosphi * cosphi / (1 - this.es);
    var ml = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, phi);

    x = nl * al * (1 - asq * tl * (1 / 6 - (8 - tl + 8 * cl) * asq / 120));
    y = ml - this.ml0 + nl * sinphi / cosphi * asq * (0.5 + (5 - tl + 6 * cl) * asq / 24);


  }

  p.x = x + this.x0;
  p.y = y + this.y0;
  return p;
};

/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var x = p.x / this.a;
  var y = p.y / this.a;
  var phi, lam;

  if (this.sphere) {
    var dd = y + this.lat0;
    phi = Math.asin(Math.sin(dd) * Math.cos(x));
    lam = Math.atan2(Math.tan(x), Math.cos(dd));
  }
  else {
    /* ellipsoid */
    var ml1 = this.ml0 / this.a + y;
    var phi1 = imlfn(ml1, this.e0, this.e1, this.e2, this.e3);
    if (Math.abs(Math.abs(phi1) - HALF_PI) <= EPSLN) {
      p.x = this.long0;
      p.y = HALF_PI;
      if (y < 0) {
        p.y *= -1;
      }
      return p;
    }
    var nl1 = gN(this.a, this.e, Math.sin(phi1));

    var rl1 = nl1 * nl1 * nl1 / this.a / this.a * (1 - this.es);
    var tl1 = Math.pow(Math.tan(phi1), 2);
    var dl = x * this.a / nl1;
    var dsq = dl * dl;
    phi = phi1 - nl1 * Math.tan(phi1) / rl1 * dl * dl * (0.5 - (1 + 3 * tl1) * dl * dl / 24);
    lam = dl * (1 - dsq * (tl1 / 3 + (1 + 3 * tl1) * tl1 * dsq / 15)) / Math.cos(phi1);

  }

  p.x = adjust_lon(lam + this.long0);
  p.y = adjust_lat(phi);
  return p;

};
exports.names = ["Cassini", "Cassini_Soldner", "cass"];
},{"../common/adjust_lat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js","../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/e0fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js","../common/e1fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js","../common/e2fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js","../common/e3fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js","../common/gN":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/gN.js","../common/imlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/imlfn.js","../common/mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/cea.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var qsfnz = require('../common/qsfnz');
var msfnz = require('../common/msfnz');
var iqsfnz = require('../common/iqsfnz');
/*
  reference:  
    "Cartographic Projection Procedures for the UNIX Environment-
    A User's Manual" by Gerald I. Evenden,
    USGS Open File Report 90-284and Release 4 Interim Reports (2003)
*/
exports.init = function() {
  //no-op
  if (!this.sphere) {
    this.k0 = msfnz(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts));
  }
};


/* Cylindrical Equal Area forward equations--mapping lat,long to x,y
    ------------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var x, y;
  /* Forward equations
      -----------------*/
  var dlon = adjust_lon(lon - this.long0);
  if (this.sphere) {
    x = this.x0 + this.a * dlon * Math.cos(this.lat_ts);
    y = this.y0 + this.a * Math.sin(lat) / Math.cos(this.lat_ts);
  }
  else {
    var qs = qsfnz(this.e, Math.sin(lat));
    x = this.x0 + this.a * this.k0 * dlon;
    y = this.y0 + this.a * qs * 0.5 / this.k0;
  }

  p.x = x;
  p.y = y;
  return p;
};

/* Cylindrical Equal Area inverse equations--mapping x,y to lat/long
    ------------------------------------------------------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var lon, lat;

  if (this.sphere) {
    lon = adjust_lon(this.long0 + (p.x / this.a) / Math.cos(this.lat_ts));
    lat = Math.asin((p.y / this.a) * Math.cos(this.lat_ts));
  }
  else {
    lat = iqsfnz(this.e, 2 * p.y * this.k0 / this.a);
    lon = adjust_lon(this.long0 + p.x / (this.a * this.k0));
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["cea"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/iqsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/iqsfnz.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js","../common/qsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/qsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/eqc.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
exports.init = function() {

  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  this.lat0 = this.lat0 || 0;
  this.long0 = this.long0 || 0;
  this.lat_ts = this.lat_ts || 0;
  this.title = this.title || "Equidistant Cylindrical (Plate Carre)";

  this.rc = Math.cos(this.lat_ts);
};


// forward equations--mapping lat,long to x,y
// -----------------------------------------------------------------
exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  var dlon = adjust_lon(lon - this.long0);
  var dlat = adjust_lat(lat - this.lat0);
  p.x = this.x0 + (this.a * dlon * this.rc);
  p.y = this.y0 + (this.a * dlat);
  return p;
};

// inverse equations--mapping x,y to lat/long
// -----------------------------------------------------------------
exports.inverse = function(p) {

  var x = p.x;
  var y = p.y;

  p.x = adjust_lon(this.long0 + ((x - this.x0) / (this.a * this.rc)));
  p.y = adjust_lat(this.lat0 + ((y - this.y0) / (this.a)));
  return p;
};
exports.names = ["Equirectangular", "Equidistant_Cylindrical", "eqc"];

},{"../common/adjust_lat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js","../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/eqdc.js":[function(require,module,exports){
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var msfnz = require('../common/msfnz');
var mlfn = require('../common/mlfn');
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var imlfn = require('../common/imlfn');
var EPSLN = 1.0e-10;
exports.init = function() {

  /* Place parameters in static storage for common use
      -------------------------------------------------*/
  // Standard Parallels cannot be equal and on opposite sides of the equator
  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }
  this.lat2 = this.lat2 || this.lat1;
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2);
  this.e = Math.sqrt(this.es);
  this.e0 = e0fn(this.es);
  this.e1 = e1fn(this.es);
  this.e2 = e2fn(this.es);
  this.e3 = e3fn(this.es);

  this.sinphi = Math.sin(this.lat1);
  this.cosphi = Math.cos(this.lat1);

  this.ms1 = msfnz(this.e, this.sinphi, this.cosphi);
  this.ml1 = mlfn(this.e0, this.e1, this.e2, this.e3, this.lat1);

  if (Math.abs(this.lat1 - this.lat2) < EPSLN) {
    this.ns = this.sinphi;
  }
  else {
    this.sinphi = Math.sin(this.lat2);
    this.cosphi = Math.cos(this.lat2);
    this.ms2 = msfnz(this.e, this.sinphi, this.cosphi);
    this.ml2 = mlfn(this.e0, this.e1, this.e2, this.e3, this.lat2);
    this.ns = (this.ms1 - this.ms2) / (this.ml2 - this.ml1);
  }
  this.g = this.ml1 + this.ms1 / this.ns;
  this.ml0 = mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
  this.rh = this.a * (this.g - this.ml0);
};


/* Equidistant Conic forward equations--mapping lat,long to x,y
  -----------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var rh1;

  /* Forward equations
      -----------------*/
  if (this.sphere) {
    rh1 = this.a * (this.g - lat);
  }
  else {
    var ml = mlfn(this.e0, this.e1, this.e2, this.e3, lat);
    rh1 = this.a * (this.g - ml);
  }
  var theta = this.ns * adjust_lon(lon - this.long0);
  var x = this.x0 + rh1 * Math.sin(theta);
  var y = this.y0 + this.rh - rh1 * Math.cos(theta);
  p.x = x;
  p.y = y;
  return p;
};

/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y = this.rh - p.y + this.y0;
  var con, rh1, lat, lon;
  if (this.ns >= 0) {
    rh1 = Math.sqrt(p.x * p.x + p.y * p.y);
    con = 1;
  }
  else {
    rh1 = -Math.sqrt(p.x * p.x + p.y * p.y);
    con = -1;
  }
  var theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2(con * p.x, con * p.y);
  }

  if (this.sphere) {
    lon = adjust_lon(this.long0 + theta / this.ns);
    lat = adjust_lat(this.g - rh1 / this.a);
    p.x = lon;
    p.y = lat;
    return p;
  }
  else {
    var ml = this.g - rh1 / this.a;
    lat = imlfn(ml, this.e0, this.e1, this.e2, this.e3);
    lon = adjust_lon(this.long0 + theta / this.ns);
    p.x = lon;
    p.y = lat;
    return p;
  }

};
exports.names = ["Equidistant_Conic", "eqdc"];

},{"../common/adjust_lat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js","../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/e0fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js","../common/e1fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js","../common/e2fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js","../common/e3fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js","../common/imlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/imlfn.js","../common/mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/gauss.js":[function(require,module,exports){
var FORTPI = Math.PI/4;
var srat = require('../common/srat');
var HALF_PI = Math.PI/2;
var MAX_ITER = 20;
exports.init = function() {
  var sphi = Math.sin(this.lat0);
  var cphi = Math.cos(this.lat0);
  cphi *= cphi;
  this.rc = Math.sqrt(1 - this.es) / (1 - this.es * sphi * sphi);
  this.C = Math.sqrt(1 + this.es * cphi * cphi / (1 - this.es));
  this.phic0 = Math.asin(sphi / this.C);
  this.ratexp = 0.5 * this.C * this.e;
  this.K = Math.tan(0.5 * this.phic0 + FORTPI) / (Math.pow(Math.tan(0.5 * this.lat0 + FORTPI), this.C) * srat(this.e * sphi, this.ratexp));
};

exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;

  p.y = 2 * Math.atan(this.K * Math.pow(Math.tan(0.5 * lat + FORTPI), this.C) * srat(this.e * Math.sin(lat), this.ratexp)) - HALF_PI;
  p.x = this.C * lon;
  return p;
};

exports.inverse = function(p) {
  var DEL_TOL = 1e-14;
  var lon = p.x / this.C;
  var lat = p.y;
  var num = Math.pow(Math.tan(0.5 * lat + FORTPI) / this.K, 1 / this.C);
  for (var i = MAX_ITER; i > 0; --i) {
    lat = 2 * Math.atan(num * srat(this.e * Math.sin(p.y), - 0.5 * this.e)) - HALF_PI;
    if (Math.abs(lat - p.y) < DEL_TOL) {
      break;
    }
    p.y = lat;
  }
  /* convergence failed */
  if (!i) {
    return null;
  }
  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["gauss"];

},{"../common/srat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/srat.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/gnom.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var EPSLN = 1.0e-10;
var asinz = require('../common/asinz');

/*
  reference:
    Wolfram Mathworld "Gnomonic Projection"
    http://mathworld.wolfram.com/GnomonicProjection.html
    Accessed: 12th November 2009
  */
exports.init = function() {

  /* Place parameters in static storage for common use
      -------------------------------------------------*/
  this.sin_p14 = Math.sin(this.lat0);
  this.cos_p14 = Math.cos(this.lat0);
  // Approximation for projecting points to the horizon (infinity)
  this.infinity_dist = 1000 * this.a;
  this.rc = 1;
};


/* Gnomonic forward equations--mapping lat,long to x,y
    ---------------------------------------------------*/
exports.forward = function(p) {
  var sinphi, cosphi; /* sin and cos value        */
  var dlon; /* delta longitude value      */
  var coslon; /* cos of longitude        */
  var ksp; /* scale factor          */
  var g;
  var x, y;
  var lon = p.x;
  var lat = p.y;
  /* Forward equations
      -----------------*/
  dlon = adjust_lon(lon - this.long0);

  sinphi = Math.sin(lat);
  cosphi = Math.cos(lat);

  coslon = Math.cos(dlon);
  g = this.sin_p14 * sinphi + this.cos_p14 * cosphi * coslon;
  ksp = 1;
  if ((g > 0) || (Math.abs(g) <= EPSLN)) {
    x = this.x0 + this.a * ksp * cosphi * Math.sin(dlon) / g;
    y = this.y0 + this.a * ksp * (this.cos_p14 * sinphi - this.sin_p14 * cosphi * coslon) / g;
  }
  else {

    // Point is in the opposing hemisphere and is unprojectable
    // We still need to return a reasonable point, so we project 
    // to infinity, on a bearing 
    // equivalent to the northern hemisphere equivalent
    // This is a reasonable approximation for short shapes and lines that 
    // straddle the horizon.

    x = this.x0 + this.infinity_dist * cosphi * Math.sin(dlon);
    y = this.y0 + this.infinity_dist * (this.cos_p14 * sinphi - this.sin_p14 * cosphi * coslon);

  }
  p.x = x;
  p.y = y;
  return p;
};


exports.inverse = function(p) {
  var rh; /* Rho */
  var sinc, cosc;
  var c;
  var lon, lat;

  /* Inverse equations
      -----------------*/
  p.x = (p.x - this.x0) / this.a;
  p.y = (p.y - this.y0) / this.a;

  p.x /= this.k0;
  p.y /= this.k0;

  if ((rh = Math.sqrt(p.x * p.x + p.y * p.y))) {
    c = Math.atan2(rh, this.rc);
    sinc = Math.sin(c);
    cosc = Math.cos(c);

    lat = asinz(cosc * this.sin_p14 + (p.y * sinc * this.cos_p14) / rh);
    lon = Math.atan2(p.x * sinc, rh * this.cos_p14 * cosc - p.y * this.sin_p14 * sinc);
    lon = adjust_lon(this.long0 + lon);
  }
  else {
    lat = this.phic0;
    lon = 0;
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["gnom"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/krovak.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
exports.init = function() {
  this.a = 6377397.155;
  this.es = 0.006674372230614;
  this.e = Math.sqrt(this.es);
  if (!this.lat0) {
    this.lat0 = 0.863937979737193;
  }
  if (!this.long0) {
    this.long0 = 0.7417649320975901 - 0.308341501185665;
  }
  /* if scale not set default to 0.9999 */
  if (!this.k0) {
    this.k0 = 0.9999;
  }
  this.s45 = 0.785398163397448; /* 45 */
  this.s90 = 2 * this.s45;
  this.fi0 = this.lat0;
  this.e2 = this.es;
  this.e = Math.sqrt(this.e2);
  this.alfa = Math.sqrt(1 + (this.e2 * Math.pow(Math.cos(this.fi0), 4)) / (1 - this.e2));
  this.uq = 1.04216856380474;
  this.u0 = Math.asin(Math.sin(this.fi0) / this.alfa);
  this.g = Math.pow((1 + this.e * Math.sin(this.fi0)) / (1 - this.e * Math.sin(this.fi0)), this.alfa * this.e / 2);
  this.k = Math.tan(this.u0 / 2 + this.s45) / Math.pow(Math.tan(this.fi0 / 2 + this.s45), this.alfa) * this.g;
  this.k1 = this.k0;
  this.n0 = this.a * Math.sqrt(1 - this.e2) / (1 - this.e2 * Math.pow(Math.sin(this.fi0), 2));
  this.s0 = 1.37008346281555;
  this.n = Math.sin(this.s0);
  this.ro0 = this.k1 * this.n0 / Math.tan(this.s0);
  this.ad = this.s90 - this.uq;
};

/* ellipsoid */
/* calculate xy from lat/lon */
/* Constants, identical to inverse transform function */
exports.forward = function(p) {
  var gfi, u, deltav, s, d, eps, ro;
  var lon = p.x;
  var lat = p.y;
  var delta_lon = adjust_lon(lon - this.long0);
  /* Transformation */
  gfi = Math.pow(((1 + this.e * Math.sin(lat)) / (1 - this.e * Math.sin(lat))), (this.alfa * this.e / 2));
  u = 2 * (Math.atan(this.k * Math.pow(Math.tan(lat / 2 + this.s45), this.alfa) / gfi) - this.s45);
  deltav = -delta_lon * this.alfa;
  s = Math.asin(Math.cos(this.ad) * Math.sin(u) + Math.sin(this.ad) * Math.cos(u) * Math.cos(deltav));
  d = Math.asin(Math.cos(u) * Math.sin(deltav) / Math.cos(s));
  eps = this.n * d;
  ro = this.ro0 * Math.pow(Math.tan(this.s0 / 2 + this.s45), this.n) / Math.pow(Math.tan(s / 2 + this.s45), this.n);
  p.y = ro * Math.cos(eps) / 1;
  p.x = ro * Math.sin(eps) / 1;

  if (!this.czech) {
    p.y *= -1;
    p.x *= -1;
  }
  return (p);
};

/* calculate lat/lon from xy */
exports.inverse = function(p) {
  var u, deltav, s, d, eps, ro, fi1;
  var ok;

  /* Transformation */
  /* revert y, x*/
  var tmp = p.x;
  p.x = p.y;
  p.y = tmp;
  if (!this.czech) {
    p.y *= -1;
    p.x *= -1;
  }
  ro = Math.sqrt(p.x * p.x + p.y * p.y);
  eps = Math.atan2(p.y, p.x);
  d = eps / Math.sin(this.s0);
  s = 2 * (Math.atan(Math.pow(this.ro0 / ro, 1 / this.n) * Math.tan(this.s0 / 2 + this.s45)) - this.s45);
  u = Math.asin(Math.cos(this.ad) * Math.sin(s) - Math.sin(this.ad) * Math.cos(s) * Math.cos(d));
  deltav = Math.asin(Math.cos(s) * Math.sin(d) / Math.cos(u));
  p.x = this.long0 - deltav / this.alfa;
  fi1 = u;
  ok = 0;
  var iter = 0;
  do {
    p.y = 2 * (Math.atan(Math.pow(this.k, - 1 / this.alfa) * Math.pow(Math.tan(u / 2 + this.s45), 1 / this.alfa) * Math.pow((1 + this.e * Math.sin(fi1)) / (1 - this.e * Math.sin(fi1)), this.e / 2)) - this.s45);
    if (Math.abs(fi1 - p.y) < 0.0000000001) {
      ok = 1;
    }
    fi1 = p.y;
    iter += 1;
  } while (ok === 0 && iter < 15);
  if (iter >= 15) {
    return null;
  }

  return (p);
};
exports.names = ["Krovak", "krovak"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/laea.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;
var FORTPI = Math.PI/4;
var EPSLN = 1.0e-10;
var qsfnz = require('../common/qsfnz');
var adjust_lon = require('../common/adjust_lon');
/*
  reference
    "New Equal-Area Map Projections for Noncircular Regions", John P. Snyder,
    The American Cartographer, Vol 15, No. 4, October 1988, pp. 341-355.
  */

exports.S_POLE = 1;
exports.N_POLE = 2;
exports.EQUIT = 3;
exports.OBLIQ = 4;


/* Initialize the Lambert Azimuthal Equal Area projection
  ------------------------------------------------------*/
exports.init = function() {
  var t = Math.abs(this.lat0);
  if (Math.abs(t - HALF_PI) < EPSLN) {
    this.mode = this.lat0 < 0 ? this.S_POLE : this.N_POLE;
  }
  else if (Math.abs(t) < EPSLN) {
    this.mode = this.EQUIT;
  }
  else {
    this.mode = this.OBLIQ;
  }
  if (this.es > 0) {
    var sinphi;

    this.qp = qsfnz(this.e, 1);
    this.mmf = 0.5 / (1 - this.es);
    this.apa = this.authset(this.es);
    switch (this.mode) {
    case this.N_POLE:
      this.dd = 1;
      break;
    case this.S_POLE:
      this.dd = 1;
      break;
    case this.EQUIT:
      this.rq = Math.sqrt(0.5 * this.qp);
      this.dd = 1 / this.rq;
      this.xmf = 1;
      this.ymf = 0.5 * this.qp;
      break;
    case this.OBLIQ:
      this.rq = Math.sqrt(0.5 * this.qp);
      sinphi = Math.sin(this.lat0);
      this.sinb1 = qsfnz(this.e, sinphi) / this.qp;
      this.cosb1 = Math.sqrt(1 - this.sinb1 * this.sinb1);
      this.dd = Math.cos(this.lat0) / (Math.sqrt(1 - this.es * sinphi * sinphi) * this.rq * this.cosb1);
      this.ymf = (this.xmf = this.rq) / this.dd;
      this.xmf *= this.dd;
      break;
    }
  }
  else {
    if (this.mode === this.OBLIQ) {
      this.sinph0 = Math.sin(this.lat0);
      this.cosph0 = Math.cos(this.lat0);
    }
  }
};

/* Lambert Azimuthal Equal Area forward equations--mapping lat,long to x,y
  -----------------------------------------------------------------------*/
exports.forward = function(p) {

  /* Forward equations
      -----------------*/
  var x, y, coslam, sinlam, sinphi, q, sinb, cosb, b, cosphi;
  var lam = p.x;
  var phi = p.y;

  lam = adjust_lon(lam - this.long0);

  if (this.sphere) {
    sinphi = Math.sin(phi);
    cosphi = Math.cos(phi);
    coslam = Math.cos(lam);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      y = (this.mode === this.EQUIT) ? 1 + cosphi * coslam : 1 + this.sinph0 * sinphi + this.cosph0 * cosphi * coslam;
      if (y <= EPSLN) {
        return null;
      }
      y = Math.sqrt(2 / y);
      x = y * cosphi * Math.sin(lam);
      y *= (this.mode === this.EQUIT) ? sinphi : this.cosph0 * sinphi - this.sinph0 * cosphi * coslam;
    }
    else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE) {
        coslam = -coslam;
      }
      if (Math.abs(phi + this.phi0) < EPSLN) {
        return null;
      }
      y = FORTPI - phi * 0.5;
      y = 2 * ((this.mode === this.S_POLE) ? Math.cos(y) : Math.sin(y));
      x = y * Math.sin(lam);
      y *= coslam;
    }
  }
  else {
    sinb = 0;
    cosb = 0;
    b = 0;
    coslam = Math.cos(lam);
    sinlam = Math.sin(lam);
    sinphi = Math.sin(phi);
    q = qsfnz(this.e, sinphi);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      sinb = q / this.qp;
      cosb = Math.sqrt(1 - sinb * sinb);
    }
    switch (this.mode) {
    case this.OBLIQ:
      b = 1 + this.sinb1 * sinb + this.cosb1 * cosb * coslam;
      break;
    case this.EQUIT:
      b = 1 + cosb * coslam;
      break;
    case this.N_POLE:
      b = HALF_PI + phi;
      q = this.qp - q;
      break;
    case this.S_POLE:
      b = phi - HALF_PI;
      q = this.qp + q;
      break;
    }
    if (Math.abs(b) < EPSLN) {
      return null;
    }
    switch (this.mode) {
    case this.OBLIQ:
    case this.EQUIT:
      b = Math.sqrt(2 / b);
      if (this.mode === this.OBLIQ) {
        y = this.ymf * b * (this.cosb1 * sinb - this.sinb1 * cosb * coslam);
      }
      else {
        y = (b = Math.sqrt(2 / (1 + cosb * coslam))) * sinb * this.ymf;
      }
      x = this.xmf * b * cosb * sinlam;
      break;
    case this.N_POLE:
    case this.S_POLE:
      if (q >= 0) {
        x = (b = Math.sqrt(q)) * sinlam;
        y = coslam * ((this.mode === this.S_POLE) ? b : -b);
      }
      else {
        x = y = 0;
      }
      break;
    }
  }

  p.x = this.a * x + this.x0;
  p.y = this.a * y + this.y0;
  return p;
};

/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var x = p.x / this.a;
  var y = p.y / this.a;
  var lam, phi, cCe, sCe, q, rho, ab;

  if (this.sphere) {
    var cosz = 0,
      rh, sinz = 0;

    rh = Math.sqrt(x * x + y * y);
    phi = rh * 0.5;
    if (phi > 1) {
      return null;
    }
    phi = 2 * Math.asin(phi);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      sinz = Math.sin(phi);
      cosz = Math.cos(phi);
    }
    switch (this.mode) {
    case this.EQUIT:
      phi = (Math.abs(rh) <= EPSLN) ? 0 : Math.asin(y * sinz / rh);
      x *= sinz;
      y = cosz * rh;
      break;
    case this.OBLIQ:
      phi = (Math.abs(rh) <= EPSLN) ? this.phi0 : Math.asin(cosz * this.sinph0 + y * sinz * this.cosph0 / rh);
      x *= sinz * this.cosph0;
      y = (cosz - Math.sin(phi) * this.sinph0) * rh;
      break;
    case this.N_POLE:
      y = -y;
      phi = HALF_PI - phi;
      break;
    case this.S_POLE:
      phi -= HALF_PI;
      break;
    }
    lam = (y === 0 && (this.mode === this.EQUIT || this.mode === this.OBLIQ)) ? 0 : Math.atan2(x, y);
  }
  else {
    ab = 0;
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      x /= this.dd;
      y *= this.dd;
      rho = Math.sqrt(x * x + y * y);
      if (rho < EPSLN) {
        p.x = 0;
        p.y = this.phi0;
        return p;
      }
      sCe = 2 * Math.asin(0.5 * rho / this.rq);
      cCe = Math.cos(sCe);
      x *= (sCe = Math.sin(sCe));
      if (this.mode === this.OBLIQ) {
        ab = cCe * this.sinb1 + y * sCe * this.cosb1 / rho;
        q = this.qp * ab;
        y = rho * this.cosb1 * cCe - y * this.sinb1 * sCe;
      }
      else {
        ab = y * sCe / rho;
        q = this.qp * ab;
        y = rho * cCe;
      }
    }
    else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE) {
        y = -y;
      }
      q = (x * x + y * y);
      if (!q) {
        p.x = 0;
        p.y = this.phi0;
        return p;
      }
      ab = 1 - q / this.qp;
      if (this.mode === this.S_POLE) {
        ab = -ab;
      }
    }
    lam = Math.atan2(x, y);
    phi = this.authlat(Math.asin(ab), this.apa);
  }


  p.x = adjust_lon(this.long0 + lam);
  p.y = phi;
  return p;
};

/* determine latitude from authalic latitude */
exports.P00 = 0.33333333333333333333;
exports.P01 = 0.17222222222222222222;
exports.P02 = 0.10257936507936507936;
exports.P10 = 0.06388888888888888888;
exports.P11 = 0.06640211640211640211;
exports.P20 = 0.01641501294219154443;

exports.authset = function(es) {
  var t;
  var APA = [];
  APA[0] = es * this.P00;
  t = es * es;
  APA[0] += t * this.P01;
  APA[1] = t * this.P10;
  t *= es;
  APA[0] += t * this.P02;
  APA[1] += t * this.P11;
  APA[2] = t * this.P20;
  return APA;
};

exports.authlat = function(beta, APA) {
  var t = beta + beta;
  return (beta + APA[0] * Math.sin(t) + APA[1] * Math.sin(t + t) + APA[2] * Math.sin(t + t + t));
};
exports.names = ["Lambert Azimuthal Equal Area", "Lambert_Azimuthal_Equal_Area", "laea"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/qsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/qsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/lcc.js":[function(require,module,exports){
var EPSLN = 1.0e-10;
var msfnz = require('../common/msfnz');
var tsfnz = require('../common/tsfnz');
var HALF_PI = Math.PI/2;
var sign = require('../common/sign');
var adjust_lon = require('../common/adjust_lon');
var phi2z = require('../common/phi2z');
exports.init = function() {

  // array of:  r_maj,r_min,lat1,lat2,c_lon,c_lat,false_east,false_north
  //double c_lat;                   /* center latitude                      */
  //double c_lon;                   /* center longitude                     */
  //double lat1;                    /* first standard parallel              */
  //double lat2;                    /* second standard parallel             */
  //double r_maj;                   /* major axis                           */
  //double r_min;                   /* minor axis                           */
  //double false_east;              /* x offset in meters                   */
  //double false_north;             /* y offset in meters                   */

  if (!this.lat2) {
    this.lat2 = this.lat1;
  } //if lat2 is not defined
  if (!this.k0) {
    this.k0 = 1;
  }
  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  // Standard Parallels cannot be equal and on opposite sides of the equator
  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }

  var temp = this.b / this.a;
  this.e = Math.sqrt(1 - temp * temp);

  var sin1 = Math.sin(this.lat1);
  var cos1 = Math.cos(this.lat1);
  var ms1 = msfnz(this.e, sin1, cos1);
  var ts1 = tsfnz(this.e, this.lat1, sin1);

  var sin2 = Math.sin(this.lat2);
  var cos2 = Math.cos(this.lat2);
  var ms2 = msfnz(this.e, sin2, cos2);
  var ts2 = tsfnz(this.e, this.lat2, sin2);

  var ts0 = tsfnz(this.e, this.lat0, Math.sin(this.lat0));

  if (Math.abs(this.lat1 - this.lat2) > EPSLN) {
    this.ns = Math.log(ms1 / ms2) / Math.log(ts1 / ts2);
  }
  else {
    this.ns = sin1;
  }
  if (isNaN(this.ns)) {
    this.ns = sin1;
  }
  this.f0 = ms1 / (this.ns * Math.pow(ts1, this.ns));
  this.rh = this.a * this.f0 * Math.pow(ts0, this.ns);
  if (!this.title) {
    this.title = "Lambert Conformal Conic";
  }
};


// Lambert Conformal conic forward equations--mapping lat,long to x,y
// -----------------------------------------------------------------
exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  // singular cases :
  if (Math.abs(2 * Math.abs(lat) - Math.PI) <= EPSLN) {
    lat = sign(lat) * (HALF_PI - 2 * EPSLN);
  }

  var con = Math.abs(Math.abs(lat) - HALF_PI);
  var ts, rh1;
  if (con > EPSLN) {
    ts = tsfnz(this.e, lat, Math.sin(lat));
    rh1 = this.a * this.f0 * Math.pow(ts, this.ns);
  }
  else {
    con = lat * this.ns;
    if (con <= 0) {
      return null;
    }
    rh1 = 0;
  }
  var theta = this.ns * adjust_lon(lon - this.long0);
  p.x = this.k0 * (rh1 * Math.sin(theta)) + this.x0;
  p.y = this.k0 * (this.rh - rh1 * Math.cos(theta)) + this.y0;

  return p;
};

// Lambert Conformal Conic inverse equations--mapping x,y to lat/long
// -----------------------------------------------------------------
exports.inverse = function(p) {

  var rh1, con, ts;
  var lat, lon;
  var x = (p.x - this.x0) / this.k0;
  var y = (this.rh - (p.y - this.y0) / this.k0);
  if (this.ns > 0) {
    rh1 = Math.sqrt(x * x + y * y);
    con = 1;
  }
  else {
    rh1 = -Math.sqrt(x * x + y * y);
    con = -1;
  }
  var theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2((con * x), (con * y));
  }
  if ((rh1 !== 0) || (this.ns > 0)) {
    con = 1 / this.ns;
    ts = Math.pow((rh1 / (this.a * this.f0)), con);
    lat = phi2z(this.e, ts);
    if (lat === -9999) {
      return null;
    }
  }
  else {
    lat = -HALF_PI;
  }
  lon = adjust_lon(theta / this.ns + this.long0);

  p.x = lon;
  p.y = lat;
  return p;
};

exports.names = ["Lambert Tangential Conformal Conic Projection", "Lambert_Conformal_Conic", "Lambert_Conformal_Conic_2SP", "lcc"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js","../common/phi2z":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/phi2z.js","../common/sign":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js","../common/tsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/tsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/longlat.js":[function(require,module,exports){
exports.init = function() {
  //no-op for longlat
};

function identity(pt) {
  return pt;
}
exports.forward = identity;
exports.inverse = identity;
exports.names = ["longlat", "identity"];

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/merc.js":[function(require,module,exports){
var msfnz = require('../common/msfnz');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var R2D = 57.29577951308232088;
var adjust_lon = require('../common/adjust_lon');
var FORTPI = Math.PI/4;
var tsfnz = require('../common/tsfnz');
var phi2z = require('../common/phi2z');
exports.init = function() {
  var con = this.b / this.a;
  this.es = 1 - con * con;
  if(!('x0' in this)){
    this.x0 = 0;
  }
  if(!('y0' in this)){
    this.y0 = 0;
  }
  this.e = Math.sqrt(this.es);
  if (this.lat_ts) {
    if (this.sphere) {
      this.k0 = Math.cos(this.lat_ts);
    }
    else {
      this.k0 = msfnz(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts));
    }
  }
  else {
    if (!this.k0) {
      if (this.k) {
        this.k0 = this.k;
      }
      else {
        this.k0 = 1;
      }
    }
  }
};

/* Mercator forward equations--mapping lat,long to x,y
  --------------------------------------------------*/

exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  // convert to radians
  if (lat * R2D > 90 && lat * R2D < -90 && lon * R2D > 180 && lon * R2D < -180) {
    return null;
  }

  var x, y;
  if (Math.abs(Math.abs(lat) - HALF_PI) <= EPSLN) {
    return null;
  }
  else {
    if (this.sphere) {
      x = this.x0 + this.a * this.k0 * adjust_lon(lon - this.long0);
      y = this.y0 + this.a * this.k0 * Math.log(Math.tan(FORTPI + 0.5 * lat));
    }
    else {
      var sinphi = Math.sin(lat);
      var ts = tsfnz(this.e, lat, sinphi);
      x = this.x0 + this.a * this.k0 * adjust_lon(lon - this.long0);
      y = this.y0 - this.a * this.k0 * Math.log(ts);
    }
    p.x = x;
    p.y = y;
    return p;
  }
};


/* Mercator inverse equations--mapping x,y to lat/long
  --------------------------------------------------*/
exports.inverse = function(p) {

  var x = p.x - this.x0;
  var y = p.y - this.y0;
  var lon, lat;

  if (this.sphere) {
    lat = HALF_PI - 2 * Math.atan(Math.exp(-y / (this.a * this.k0)));
  }
  else {
    var ts = Math.exp(-y / (this.a * this.k0));
    lat = phi2z(this.e, ts);
    if (lat === -9999) {
      return null;
    }
  }
  lon = adjust_lon(this.long0 + x / (this.a * this.k0));

  p.x = lon;
  p.y = lat;
  return p;
};

exports.names = ["Mercator", "Popular Visualisation Pseudo Mercator", "Mercator_1SP", "Mercator_Auxiliary_Sphere", "merc"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js","../common/phi2z":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/phi2z.js","../common/tsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/tsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/mill.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
/*
  reference
    "New Equal-Area Map Projections for Noncircular Regions", John P. Snyder,
    The American Cartographer, Vol 15, No. 4, October 1988, pp. 341-355.
  */


/* Initialize the Miller Cylindrical projection
  -------------------------------------------*/
exports.init = function() {
  //no-op
};


/* Miller Cylindrical forward equations--mapping lat,long to x,y
    ------------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  /* Forward equations
      -----------------*/
  var dlon = adjust_lon(lon - this.long0);
  var x = this.x0 + this.a * dlon;
  var y = this.y0 + this.a * Math.log(Math.tan((Math.PI / 4) + (lat / 2.5))) * 1.25;

  p.x = x;
  p.y = y;
  return p;
};

/* Miller Cylindrical inverse equations--mapping x,y to lat/long
    ------------------------------------------------------------*/
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;

  var lon = adjust_lon(this.long0 + p.x / this.a);
  var lat = 2.5 * (Math.atan(Math.exp(0.8 * p.y / this.a)) - Math.PI / 4);

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Miller_Cylindrical", "mill"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/moll.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var EPSLN = 1.0e-10;
exports.init = function() {};

/* Mollweide forward equations--mapping lat,long to x,y
    ----------------------------------------------------*/
exports.forward = function(p) {

  /* Forward equations
      -----------------*/
  var lon = p.x;
  var lat = p.y;

  var delta_lon = adjust_lon(lon - this.long0);
  var theta = lat;
  var con = Math.PI * Math.sin(lat);

  /* Iterate using the Newton-Raphson method to find theta
      -----------------------------------------------------*/
  for (var i = 0; true; i++) {
    var delta_theta = -(theta + Math.sin(theta) - con) / (1 + Math.cos(theta));
    theta += delta_theta;
    if (Math.abs(delta_theta) < EPSLN) {
      break;
    }
  }
  theta /= 2;

  /* If the latitude is 90 deg, force the x coordinate to be "0 + false easting"
       this is done here because of precision problems with "cos(theta)"
       --------------------------------------------------------------------------*/
  if (Math.PI / 2 - Math.abs(lat) < EPSLN) {
    delta_lon = 0;
  }
  var x = 0.900316316158 * this.a * delta_lon * Math.cos(theta) + this.x0;
  var y = 1.4142135623731 * this.a * Math.sin(theta) + this.y0;

  p.x = x;
  p.y = y;
  return p;
};

exports.inverse = function(p) {
  var theta;
  var arg;

  /* Inverse equations
      -----------------*/
  p.x -= this.x0;
  p.y -= this.y0;
  arg = p.y / (1.4142135623731 * this.a);

  /* Because of division by zero problems, 'arg' can not be 1.  Therefore
       a number very close to one is used instead.
       -------------------------------------------------------------------*/
  if (Math.abs(arg) > 0.999999999999) {
    arg = 0.999999999999;
  }
  theta = Math.asin(arg);
  var lon = adjust_lon(this.long0 + (p.x / (0.900316316158 * this.a * Math.cos(theta))));
  if (lon < (-Math.PI)) {
    lon = -Math.PI;
  }
  if (lon > Math.PI) {
    lon = Math.PI;
  }
  arg = (2 * theta + Math.sin(2 * theta)) / Math.PI;
  if (Math.abs(arg) > 1) {
    arg = 1;
  }
  var lat = Math.asin(arg);

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Mollweide", "moll"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/nzmg.js":[function(require,module,exports){
var SEC_TO_RAD = 4.84813681109535993589914102357e-6;
/*
  reference
    Department of Land and Survey Technical Circular 1973/32
      http://www.linz.govt.nz/docs/miscellaneous/nz-map-definition.pdf
    OSG Technical Report 4.1
      http://www.linz.govt.nz/docs/miscellaneous/nzmg.pdf
  */

/**
 * iterations: Number of iterations to refine inverse transform.
 *     0 -> km accuracy
 *     1 -> m accuracy -- suitable for most mapping applications
 *     2 -> mm accuracy
 */
exports.iterations = 1;

exports.init = function() {
  this.A = [];
  this.A[1] = 0.6399175073;
  this.A[2] = -0.1358797613;
  this.A[3] = 0.063294409;
  this.A[4] = -0.02526853;
  this.A[5] = 0.0117879;
  this.A[6] = -0.0055161;
  this.A[7] = 0.0026906;
  this.A[8] = -0.001333;
  this.A[9] = 0.00067;
  this.A[10] = -0.00034;

  this.B_re = [];
  this.B_im = [];
  this.B_re[1] = 0.7557853228;
  this.B_im[1] = 0;
  this.B_re[2] = 0.249204646;
  this.B_im[2] = 0.003371507;
  this.B_re[3] = -0.001541739;
  this.B_im[3] = 0.041058560;
  this.B_re[4] = -0.10162907;
  this.B_im[4] = 0.01727609;
  this.B_re[5] = -0.26623489;
  this.B_im[5] = -0.36249218;
  this.B_re[6] = -0.6870983;
  this.B_im[6] = -1.1651967;

  this.C_re = [];
  this.C_im = [];
  this.C_re[1] = 1.3231270439;
  this.C_im[1] = 0;
  this.C_re[2] = -0.577245789;
  this.C_im[2] = -0.007809598;
  this.C_re[3] = 0.508307513;
  this.C_im[3] = -0.112208952;
  this.C_re[4] = -0.15094762;
  this.C_im[4] = 0.18200602;
  this.C_re[5] = 1.01418179;
  this.C_im[5] = 1.64497696;
  this.C_re[6] = 1.9660549;
  this.C_im[6] = 2.5127645;

  this.D = [];
  this.D[1] = 1.5627014243;
  this.D[2] = 0.5185406398;
  this.D[3] = -0.03333098;
  this.D[4] = -0.1052906;
  this.D[5] = -0.0368594;
  this.D[6] = 0.007317;
  this.D[7] = 0.01220;
  this.D[8] = 0.00394;
  this.D[9] = -0.0013;
};

/**
    New Zealand Map Grid Forward  - long/lat to x/y
    long/lat in radians
  */
exports.forward = function(p) {
  var n;
  var lon = p.x;
  var lat = p.y;

  var delta_lat = lat - this.lat0;
  var delta_lon = lon - this.long0;

  // 1. Calculate d_phi and d_psi    ...                          // and d_lambda
  // For this algorithm, delta_latitude is in seconds of arc x 10-5, so we need to scale to those units. Longitude is radians.
  var d_phi = delta_lat / SEC_TO_RAD * 1E-5;
  var d_lambda = delta_lon;
  var d_phi_n = 1; // d_phi^0

  var d_psi = 0;
  for (n = 1; n <= 10; n++) {
    d_phi_n = d_phi_n * d_phi;
    d_psi = d_psi + this.A[n] * d_phi_n;
  }

  // 2. Calculate theta
  var th_re = d_psi;
  var th_im = d_lambda;

  // 3. Calculate z
  var th_n_re = 1;
  var th_n_im = 0; // theta^0
  var th_n_re1;
  var th_n_im1;

  var z_re = 0;
  var z_im = 0;
  for (n = 1; n <= 6; n++) {
    th_n_re1 = th_n_re * th_re - th_n_im * th_im;
    th_n_im1 = th_n_im * th_re + th_n_re * th_im;
    th_n_re = th_n_re1;
    th_n_im = th_n_im1;
    z_re = z_re + this.B_re[n] * th_n_re - this.B_im[n] * th_n_im;
    z_im = z_im + this.B_im[n] * th_n_re + this.B_re[n] * th_n_im;
  }

  // 4. Calculate easting and northing
  p.x = (z_im * this.a) + this.x0;
  p.y = (z_re * this.a) + this.y0;

  return p;
};


/**
    New Zealand Map Grid Inverse  -  x/y to long/lat
  */
exports.inverse = function(p) {
  var n;
  var x = p.x;
  var y = p.y;

  var delta_x = x - this.x0;
  var delta_y = y - this.y0;

  // 1. Calculate z
  var z_re = delta_y / this.a;
  var z_im = delta_x / this.a;

  // 2a. Calculate theta - first approximation gives km accuracy
  var z_n_re = 1;
  var z_n_im = 0; // z^0
  var z_n_re1;
  var z_n_im1;

  var th_re = 0;
  var th_im = 0;
  for (n = 1; n <= 6; n++) {
    z_n_re1 = z_n_re * z_re - z_n_im * z_im;
    z_n_im1 = z_n_im * z_re + z_n_re * z_im;
    z_n_re = z_n_re1;
    z_n_im = z_n_im1;
    th_re = th_re + this.C_re[n] * z_n_re - this.C_im[n] * z_n_im;
    th_im = th_im + this.C_im[n] * z_n_re + this.C_re[n] * z_n_im;
  }

  // 2b. Iterate to refine the accuracy of the calculation
  //        0 iterations gives km accuracy
  //        1 iteration gives m accuracy -- good enough for most mapping applications
  //        2 iterations bives mm accuracy
  for (var i = 0; i < this.iterations; i++) {
    var th_n_re = th_re;
    var th_n_im = th_im;
    var th_n_re1;
    var th_n_im1;

    var num_re = z_re;
    var num_im = z_im;
    for (n = 2; n <= 6; n++) {
      th_n_re1 = th_n_re * th_re - th_n_im * th_im;
      th_n_im1 = th_n_im * th_re + th_n_re * th_im;
      th_n_re = th_n_re1;
      th_n_im = th_n_im1;
      num_re = num_re + (n - 1) * (this.B_re[n] * th_n_re - this.B_im[n] * th_n_im);
      num_im = num_im + (n - 1) * (this.B_im[n] * th_n_re + this.B_re[n] * th_n_im);
    }

    th_n_re = 1;
    th_n_im = 0;
    var den_re = this.B_re[1];
    var den_im = this.B_im[1];
    for (n = 2; n <= 6; n++) {
      th_n_re1 = th_n_re * th_re - th_n_im * th_im;
      th_n_im1 = th_n_im * th_re + th_n_re * th_im;
      th_n_re = th_n_re1;
      th_n_im = th_n_im1;
      den_re = den_re + n * (this.B_re[n] * th_n_re - this.B_im[n] * th_n_im);
      den_im = den_im + n * (this.B_im[n] * th_n_re + this.B_re[n] * th_n_im);
    }

    // Complex division
    var den2 = den_re * den_re + den_im * den_im;
    th_re = (num_re * den_re + num_im * den_im) / den2;
    th_im = (num_im * den_re - num_re * den_im) / den2;
  }

  // 3. Calculate d_phi              ...                                    // and d_lambda
  var d_psi = th_re;
  var d_lambda = th_im;
  var d_psi_n = 1; // d_psi^0

  var d_phi = 0;
  for (n = 1; n <= 9; n++) {
    d_psi_n = d_psi_n * d_psi;
    d_phi = d_phi + this.D[n] * d_psi_n;
  }

  // 4. Calculate latitude and longitude
  // d_phi is calcuated in second of arc * 10^-5, so we need to scale back to radians. d_lambda is in radians.
  var lat = this.lat0 + (d_phi * SEC_TO_RAD * 1E5);
  var lon = this.long0 + d_lambda;

  p.x = lon;
  p.y = lat;

  return p;
};
exports.names = ["New_Zealand_Map_Grid", "nzmg"];
},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/omerc.js":[function(require,module,exports){
var tsfnz = require('../common/tsfnz');
var adjust_lon = require('../common/adjust_lon');
var phi2z = require('../common/phi2z');
var HALF_PI = Math.PI/2;
var FORTPI = Math.PI/4;
var EPSLN = 1.0e-10;

/* Initialize the Oblique Mercator  projection
    ------------------------------------------*/
exports.init = function() {
  this.no_off = this.no_off || false;
  this.no_rot = this.no_rot || false;

  if (isNaN(this.k0)) {
    this.k0 = 1;
  }
  var sinlat = Math.sin(this.lat0);
  var coslat = Math.cos(this.lat0);
  var con = this.e * sinlat;

  this.bl = Math.sqrt(1 + this.es / (1 - this.es) * Math.pow(coslat, 4));
  this.al = this.a * this.bl * this.k0 * Math.sqrt(1 - this.es) / (1 - con * con);
  var t0 = tsfnz(this.e, this.lat0, sinlat);
  var dl = this.bl / coslat * Math.sqrt((1 - this.es) / (1 - con * con));
  if (dl * dl < 1) {
    dl = 1;
  }
  var fl;
  var gl;
  if (!isNaN(this.longc)) {
    //Central point and azimuth method

    if (this.lat0 >= 0) {
      fl = dl + Math.sqrt(dl * dl - 1);
    }
    else {
      fl = dl - Math.sqrt(dl * dl - 1);
    }
    this.el = fl * Math.pow(t0, this.bl);
    gl = 0.5 * (fl - 1 / fl);
    this.gamma0 = Math.asin(Math.sin(this.alpha) / dl);
    this.long0 = this.longc - Math.asin(gl * Math.tan(this.gamma0)) / this.bl;

  }
  else {
    //2 points method
    var t1 = tsfnz(this.e, this.lat1, Math.sin(this.lat1));
    var t2 = tsfnz(this.e, this.lat2, Math.sin(this.lat2));
    if (this.lat0 >= 0) {
      this.el = (dl + Math.sqrt(dl * dl - 1)) * Math.pow(t0, this.bl);
    }
    else {
      this.el = (dl - Math.sqrt(dl * dl - 1)) * Math.pow(t0, this.bl);
    }
    var hl = Math.pow(t1, this.bl);
    var ll = Math.pow(t2, this.bl);
    fl = this.el / hl;
    gl = 0.5 * (fl - 1 / fl);
    var jl = (this.el * this.el - ll * hl) / (this.el * this.el + ll * hl);
    var pl = (ll - hl) / (ll + hl);
    var dlon12 = adjust_lon(this.long1 - this.long2);
    this.long0 = 0.5 * (this.long1 + this.long2) - Math.atan(jl * Math.tan(0.5 * this.bl * (dlon12)) / pl) / this.bl;
    this.long0 = adjust_lon(this.long0);
    var dlon10 = adjust_lon(this.long1 - this.long0);
    this.gamma0 = Math.atan(Math.sin(this.bl * (dlon10)) / gl);
    this.alpha = Math.asin(dl * Math.sin(this.gamma0));
  }

  if (this.no_off) {
    this.uc = 0;
  }
  else {
    if (this.lat0 >= 0) {
      this.uc = this.al / this.bl * Math.atan2(Math.sqrt(dl * dl - 1), Math.cos(this.alpha));
    }
    else {
      this.uc = -1 * this.al / this.bl * Math.atan2(Math.sqrt(dl * dl - 1), Math.cos(this.alpha));
    }
  }

};


/* Oblique Mercator forward equations--mapping lat,long to x,y
    ----------------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var dlon = adjust_lon(lon - this.long0);
  var us, vs;
  var con;
  if (Math.abs(Math.abs(lat) - HALF_PI) <= EPSLN) {
    if (lat > 0) {
      con = -1;
    }
    else {
      con = 1;
    }
    vs = this.al / this.bl * Math.log(Math.tan(FORTPI + con * this.gamma0 * 0.5));
    us = -1 * con * HALF_PI * this.al / this.bl;
  }
  else {
    var t = tsfnz(this.e, lat, Math.sin(lat));
    var ql = this.el / Math.pow(t, this.bl);
    var sl = 0.5 * (ql - 1 / ql);
    var tl = 0.5 * (ql + 1 / ql);
    var vl = Math.sin(this.bl * (dlon));
    var ul = (sl * Math.sin(this.gamma0) - vl * Math.cos(this.gamma0)) / tl;
    if (Math.abs(Math.abs(ul) - 1) <= EPSLN) {
      vs = Number.POSITIVE_INFINITY;
    }
    else {
      vs = 0.5 * this.al * Math.log((1 - ul) / (1 + ul)) / this.bl;
    }
    if (Math.abs(Math.cos(this.bl * (dlon))) <= EPSLN) {
      us = this.al * this.bl * (dlon);
    }
    else {
      us = this.al * Math.atan2(sl * Math.cos(this.gamma0) + vl * Math.sin(this.gamma0), Math.cos(this.bl * dlon)) / this.bl;
    }
  }

  if (this.no_rot) {
    p.x = this.x0 + us;
    p.y = this.y0 + vs;
  }
  else {

    us -= this.uc;
    p.x = this.x0 + vs * Math.cos(this.alpha) + us * Math.sin(this.alpha);
    p.y = this.y0 + us * Math.cos(this.alpha) - vs * Math.sin(this.alpha);
  }
  return p;
};

exports.inverse = function(p) {
  var us, vs;
  if (this.no_rot) {
    vs = p.y - this.y0;
    us = p.x - this.x0;
  }
  else {
    vs = (p.x - this.x0) * Math.cos(this.alpha) - (p.y - this.y0) * Math.sin(this.alpha);
    us = (p.y - this.y0) * Math.cos(this.alpha) + (p.x - this.x0) * Math.sin(this.alpha);
    us += this.uc;
  }
  var qp = Math.exp(-1 * this.bl * vs / this.al);
  var sp = 0.5 * (qp - 1 / qp);
  var tp = 0.5 * (qp + 1 / qp);
  var vp = Math.sin(this.bl * us / this.al);
  var up = (vp * Math.cos(this.gamma0) + sp * Math.sin(this.gamma0)) / tp;
  var ts = Math.pow(this.el / Math.sqrt((1 + up) / (1 - up)), 1 / this.bl);
  if (Math.abs(up - 1) < EPSLN) {
    p.x = this.long0;
    p.y = HALF_PI;
  }
  else if (Math.abs(up + 1) < EPSLN) {
    p.x = this.long0;
    p.y = -1 * HALF_PI;
  }
  else {
    p.y = phi2z(this.e, ts);
    p.x = adjust_lon(this.long0 - Math.atan2(sp * Math.cos(this.gamma0) - vp * Math.sin(this.gamma0), Math.cos(this.bl * us / this.al)) / this.bl);
  }
  return p;
};

exports.names = ["Hotine_Oblique_Mercator", "Hotine Oblique Mercator", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin", "Hotine_Oblique_Mercator_Azimuth_Center", "omerc"];
},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/phi2z":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/phi2z.js","../common/tsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/tsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/poly.js":[function(require,module,exports){
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var mlfn = require('../common/mlfn');
var EPSLN = 1.0e-10;
var gN = require('../common/gN');
var MAX_ITER = 20;
exports.init = function() {
  /* Place parameters in static storage for common use
      -------------------------------------------------*/
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2); // devait etre dans tmerc.js mais n y est pas donc je commente sinon retour de valeurs nulles
  this.e = Math.sqrt(this.es);
  this.e0 = e0fn(this.es);
  this.e1 = e1fn(this.es);
  this.e2 = e2fn(this.es);
  this.e3 = e3fn(this.es);
  this.ml0 = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0); //si que des zeros le calcul ne se fait pas
};


/* Polyconic forward equations--mapping lat,long to x,y
    ---------------------------------------------------*/
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var x, y, el;
  var dlon = adjust_lon(lon - this.long0);
  el = dlon * Math.sin(lat);
  if (this.sphere) {
    if (Math.abs(lat) <= EPSLN) {
      x = this.a * dlon;
      y = -1 * this.a * this.lat0;
    }
    else {
      x = this.a * Math.sin(el) / Math.tan(lat);
      y = this.a * (adjust_lat(lat - this.lat0) + (1 - Math.cos(el)) / Math.tan(lat));
    }
  }
  else {
    if (Math.abs(lat) <= EPSLN) {
      x = this.a * dlon;
      y = -1 * this.ml0;
    }
    else {
      var nl = gN(this.a, this.e, Math.sin(lat)) / Math.tan(lat);
      x = nl * Math.sin(el);
      y = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, lat) - this.ml0 + nl * (1 - Math.cos(el));
    }

  }
  p.x = x + this.x0;
  p.y = y + this.y0;
  return p;
};


/* Inverse equations
  -----------------*/
exports.inverse = function(p) {
  var lon, lat, x, y, i;
  var al, bl;
  var phi, dphi;
  x = p.x - this.x0;
  y = p.y - this.y0;

  if (this.sphere) {
    if (Math.abs(y + this.a * this.lat0) <= EPSLN) {
      lon = adjust_lon(x / this.a + this.long0);
      lat = 0;
    }
    else {
      al = this.lat0 + y / this.a;
      bl = x * x / this.a / this.a + al * al;
      phi = al;
      var tanphi;
      for (i = MAX_ITER; i; --i) {
        tanphi = Math.tan(phi);
        dphi = -1 * (al * (phi * tanphi + 1) - phi - 0.5 * (phi * phi + bl) * tanphi) / ((phi - al) / tanphi - 1);
        phi += dphi;
        if (Math.abs(dphi) <= EPSLN) {
          lat = phi;
          break;
        }
      }
      lon = adjust_lon(this.long0 + (Math.asin(x * Math.tan(phi) / this.a)) / Math.sin(lat));
    }
  }
  else {
    if (Math.abs(y + this.ml0) <= EPSLN) {
      lat = 0;
      lon = adjust_lon(this.long0 + x / this.a);
    }
    else {

      al = (this.ml0 + y) / this.a;
      bl = x * x / this.a / this.a + al * al;
      phi = al;
      var cl, mln, mlnp, ma;
      var con;
      for (i = MAX_ITER; i; --i) {
        con = this.e * Math.sin(phi);
        cl = Math.sqrt(1 - con * con) * Math.tan(phi);
        mln = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, phi);
        mlnp = this.e0 - 2 * this.e1 * Math.cos(2 * phi) + 4 * this.e2 * Math.cos(4 * phi) - 6 * this.e3 * Math.cos(6 * phi);
        ma = mln / this.a;
        dphi = (al * (cl * ma + 1) - ma - 0.5 * cl * (ma * ma + bl)) / (this.es * Math.sin(2 * phi) * (ma * ma + bl - 2 * al * ma) / (4 * cl) + (al - ma) * (cl * mlnp - 2 / Math.sin(2 * phi)) - mlnp);
        phi -= dphi;
        if (Math.abs(dphi) <= EPSLN) {
          lat = phi;
          break;
        }
      }

      //lat=phi4z(this.e,this.e0,this.e1,this.e2,this.e3,al,bl,0,0);
      cl = Math.sqrt(1 - this.es * Math.pow(Math.sin(lat), 2)) * Math.tan(lat);
      lon = adjust_lon(this.long0 + Math.asin(x * cl / this.a) / Math.sin(lat));
    }
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Polyconic", "poly"];
},{"../common/adjust_lat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js","../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/e0fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js","../common/e1fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js","../common/e2fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js","../common/e3fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js","../common/gN":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/gN.js","../common/mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/sinu.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var adjust_lat = require('../common/adjust_lat');
var pj_enfn = require('../common/pj_enfn');
var MAX_ITER = 20;
var pj_mlfn = require('../common/pj_mlfn');
var pj_inv_mlfn = require('../common/pj_inv_mlfn');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var asinz = require('../common/asinz');
exports.init = function() {
  /* Place parameters in static storage for common use
    -------------------------------------------------*/


  if (!this.sphere) {
    this.en = pj_enfn(this.es);
  }
  else {
    this.n = 1;
    this.m = 0;
    this.es = 0;
    this.C_y = Math.sqrt((this.m + 1) / this.n);
    this.C_x = this.C_y / (this.m + 1);
  }

};

/* Sinusoidal forward equations--mapping lat,long to x,y
  -----------------------------------------------------*/
exports.forward = function(p) {
  var x, y;
  var lon = p.x;
  var lat = p.y;
  /* Forward equations
    -----------------*/
  lon = adjust_lon(lon - this.long0);

  if (this.sphere) {
    if (!this.m) {
      lat = this.n !== 1 ? Math.asin(this.n * Math.sin(lat)) : lat;
    }
    else {
      var k = this.n * Math.sin(lat);
      for (var i = MAX_ITER; i; --i) {
        var V = (this.m * lat + Math.sin(lat) - k) / (this.m + Math.cos(lat));
        lat -= V;
        if (Math.abs(V) < EPSLN) {
          break;
        }
      }
    }
    x = this.a * this.C_x * lon * (this.m + Math.cos(lat));
    y = this.a * this.C_y * lat;

  }
  else {

    var s = Math.sin(lat);
    var c = Math.cos(lat);
    y = this.a * pj_mlfn(lat, s, c, this.en);
    x = this.a * lon * c / Math.sqrt(1 - this.es * s * s);
  }

  p.x = x;
  p.y = y;
  return p;
};

exports.inverse = function(p) {
  var lat, temp, lon, s;

  p.x -= this.x0;
  lon = p.x / this.a;
  p.y -= this.y0;
  lat = p.y / this.a;

  if (this.sphere) {
    lat /= this.C_y;
    lon = lon / (this.C_x * (this.m + Math.cos(lat)));
    if (this.m) {
      lat = asinz((this.m * lat + Math.sin(lat)) / this.n);
    }
    else if (this.n !== 1) {
      lat = asinz(Math.sin(lat) / this.n);
    }
    lon = adjust_lon(lon + this.long0);
    lat = adjust_lat(lat);
  }
  else {
    lat = pj_inv_mlfn(p.y / this.a, this.es, this.en);
    s = Math.abs(lat);
    if (s < HALF_PI) {
      s = Math.sin(lat);
      temp = this.long0 + p.x * Math.sqrt(1 - this.es * s * s) / (this.a * Math.cos(lat));
      //temp = this.long0 + p.x / (this.a * Math.cos(lat));
      lon = adjust_lon(temp);
    }
    else if ((s - EPSLN) < HALF_PI) {
      lon = this.long0;
    }
  }
  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Sinusoidal", "sinu"];
},{"../common/adjust_lat":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lat.js","../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js","../common/pj_enfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_enfn.js","../common/pj_inv_mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_inv_mlfn.js","../common/pj_mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/pj_mlfn.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/somerc.js":[function(require,module,exports){
/*
  references:
    Formules et constantes pour le Calcul pour la
    projection cylindrique conforme à axe oblique et pour la transformation entre
    des systèmes de référence.
    http://www.swisstopo.admin.ch/internet/swisstopo/fr/home/topics/survey/sys/refsys/switzerland.parsysrelated1.31216.downloadList.77004.DownloadFile.tmp/swissprojectionfr.pdf
  */
exports.init = function() {
  var phy0 = this.lat0;
  this.lambda0 = this.long0;
  var sinPhy0 = Math.sin(phy0);
  var semiMajorAxis = this.a;
  var invF = this.rf;
  var flattening = 1 / invF;
  var e2 = 2 * flattening - Math.pow(flattening, 2);
  var e = this.e = Math.sqrt(e2);
  this.R = this.k0 * semiMajorAxis * Math.sqrt(1 - e2) / (1 - e2 * Math.pow(sinPhy0, 2));
  this.alpha = Math.sqrt(1 + e2 / (1 - e2) * Math.pow(Math.cos(phy0), 4));
  this.b0 = Math.asin(sinPhy0 / this.alpha);
  var k1 = Math.log(Math.tan(Math.PI / 4 + this.b0 / 2));
  var k2 = Math.log(Math.tan(Math.PI / 4 + phy0 / 2));
  var k3 = Math.log((1 + e * sinPhy0) / (1 - e * sinPhy0));
  this.K = k1 - this.alpha * k2 + this.alpha * e / 2 * k3;
};


exports.forward = function(p) {
  var Sa1 = Math.log(Math.tan(Math.PI / 4 - p.y / 2));
  var Sa2 = this.e / 2 * Math.log((1 + this.e * Math.sin(p.y)) / (1 - this.e * Math.sin(p.y)));
  var S = -this.alpha * (Sa1 + Sa2) + this.K;

  // spheric latitude
  var b = 2 * (Math.atan(Math.exp(S)) - Math.PI / 4);

  // spheric longitude
  var I = this.alpha * (p.x - this.lambda0);

  // psoeudo equatorial rotation
  var rotI = Math.atan(Math.sin(I) / (Math.sin(this.b0) * Math.tan(b) + Math.cos(this.b0) * Math.cos(I)));

  var rotB = Math.asin(Math.cos(this.b0) * Math.sin(b) - Math.sin(this.b0) * Math.cos(b) * Math.cos(I));

  p.y = this.R / 2 * Math.log((1 + Math.sin(rotB)) / (1 - Math.sin(rotB))) + this.y0;
  p.x = this.R * rotI + this.x0;
  return p;
};

exports.inverse = function(p) {
  var Y = p.x - this.x0;
  var X = p.y - this.y0;

  var rotI = Y / this.R;
  var rotB = 2 * (Math.atan(Math.exp(X / this.R)) - Math.PI / 4);

  var b = Math.asin(Math.cos(this.b0) * Math.sin(rotB) + Math.sin(this.b0) * Math.cos(rotB) * Math.cos(rotI));
  var I = Math.atan(Math.sin(rotI) / (Math.cos(this.b0) * Math.cos(rotI) - Math.sin(this.b0) * Math.tan(rotB)));

  var lambda = this.lambda0 + I / this.alpha;

  var S = 0;
  var phy = b;
  var prevPhy = -1000;
  var iteration = 0;
  while (Math.abs(phy - prevPhy) > 0.0000001) {
    if (++iteration > 20) {
      //...reportError("omercFwdInfinity");
      return;
    }
    //S = Math.log(Math.tan(Math.PI / 4 + phy / 2));
    S = 1 / this.alpha * (Math.log(Math.tan(Math.PI / 4 + b / 2)) - this.K) + this.e * Math.log(Math.tan(Math.PI / 4 + Math.asin(this.e * Math.sin(phy)) / 2));
    prevPhy = phy;
    phy = 2 * Math.atan(Math.exp(S)) - Math.PI / 2;
  }

  p.x = lambda;
  p.y = phy;
  return p;
};

exports.names = ["somerc"];

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/stere.js":[function(require,module,exports){
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var sign = require('../common/sign');
var msfnz = require('../common/msfnz');
var tsfnz = require('../common/tsfnz');
var phi2z = require('../common/phi2z');
var adjust_lon = require('../common/adjust_lon');
exports.ssfn_ = function(phit, sinphi, eccen) {
  sinphi *= eccen;
  return (Math.tan(0.5 * (HALF_PI + phit)) * Math.pow((1 - sinphi) / (1 + sinphi), 0.5 * eccen));
};

exports.init = function() {
  this.coslat0 = Math.cos(this.lat0);
  this.sinlat0 = Math.sin(this.lat0);
  if (this.sphere) {
    if (this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= EPSLN) {
      this.k0 = 0.5 * (1 + sign(this.lat0) * Math.sin(this.lat_ts));
    }
  }
  else {
    if (Math.abs(this.coslat0) <= EPSLN) {
      if (this.lat0 > 0) {
        //North pole
        //trace('stere:north pole');
        this.con = 1;
      }
      else {
        //South pole
        //trace('stere:south pole');
        this.con = -1;
      }
    }
    this.cons = Math.sqrt(Math.pow(1 + this.e, 1 + this.e) * Math.pow(1 - this.e, 1 - this.e));
    if (this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= EPSLN) {
      this.k0 = 0.5 * this.cons * msfnz(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) / tsfnz(this.e, this.con * this.lat_ts, this.con * Math.sin(this.lat_ts));
    }
    this.ms1 = msfnz(this.e, this.sinlat0, this.coslat0);
    this.X0 = 2 * Math.atan(this.ssfn_(this.lat0, this.sinlat0, this.e)) - HALF_PI;
    this.cosX0 = Math.cos(this.X0);
    this.sinX0 = Math.sin(this.X0);
  }
};

// Stereographic forward equations--mapping lat,long to x,y
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;
  var sinlat = Math.sin(lat);
  var coslat = Math.cos(lat);
  var A, X, sinX, cosX, ts, rh;
  var dlon = adjust_lon(lon - this.long0);

  if (Math.abs(Math.abs(lon - this.long0) - Math.PI) <= EPSLN && Math.abs(lat + this.lat0) <= EPSLN) {
    //case of the origine point
    //trace('stere:this is the origin point');
    p.x = NaN;
    p.y = NaN;
    return p;
  }
  if (this.sphere) {
    //trace('stere:sphere case');
    A = 2 * this.k0 / (1 + this.sinlat0 * sinlat + this.coslat0 * coslat * Math.cos(dlon));
    p.x = this.a * A * coslat * Math.sin(dlon) + this.x0;
    p.y = this.a * A * (this.coslat0 * sinlat - this.sinlat0 * coslat * Math.cos(dlon)) + this.y0;
    return p;
  }
  else {
    X = 2 * Math.atan(this.ssfn_(lat, sinlat, this.e)) - HALF_PI;
    cosX = Math.cos(X);
    sinX = Math.sin(X);
    if (Math.abs(this.coslat0) <= EPSLN) {
      ts = tsfnz(this.e, lat * this.con, this.con * sinlat);
      rh = 2 * this.a * this.k0 * ts / this.cons;
      p.x = this.x0 + rh * Math.sin(lon - this.long0);
      p.y = this.y0 - this.con * rh * Math.cos(lon - this.long0);
      //trace(p.toString());
      return p;
    }
    else if (Math.abs(this.sinlat0) < EPSLN) {
      //Eq
      //trace('stere:equateur');
      A = 2 * this.a * this.k0 / (1 + cosX * Math.cos(dlon));
      p.y = A * sinX;
    }
    else {
      //other case
      //trace('stere:normal case');
      A = 2 * this.a * this.k0 * this.ms1 / (this.cosX0 * (1 + this.sinX0 * sinX + this.cosX0 * cosX * Math.cos(dlon)));
      p.y = A * (this.cosX0 * sinX - this.sinX0 * cosX * Math.cos(dlon)) + this.y0;
    }
    p.x = A * cosX * Math.sin(dlon) + this.x0;
  }
  //trace(p.toString());
  return p;
};


//* Stereographic inverse equations--mapping x,y to lat/long
exports.inverse = function(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var lon, lat, ts, ce, Chi;
  var rh = Math.sqrt(p.x * p.x + p.y * p.y);
  if (this.sphere) {
    var c = 2 * Math.atan(rh / (0.5 * this.a * this.k0));
    lon = this.long0;
    lat = this.lat0;
    if (rh <= EPSLN) {
      p.x = lon;
      p.y = lat;
      return p;
    }
    lat = Math.asin(Math.cos(c) * this.sinlat0 + p.y * Math.sin(c) * this.coslat0 / rh);
    if (Math.abs(this.coslat0) < EPSLN) {
      if (this.lat0 > 0) {
        lon = adjust_lon(this.long0 + Math.atan2(p.x, - 1 * p.y));
      }
      else {
        lon = adjust_lon(this.long0 + Math.atan2(p.x, p.y));
      }
    }
    else {
      lon = adjust_lon(this.long0 + Math.atan2(p.x * Math.sin(c), rh * this.coslat0 * Math.cos(c) - p.y * this.sinlat0 * Math.sin(c)));
    }
    p.x = lon;
    p.y = lat;
    return p;
  }
  else {
    if (Math.abs(this.coslat0) <= EPSLN) {
      if (rh <= EPSLN) {
        lat = this.lat0;
        lon = this.long0;
        p.x = lon;
        p.y = lat;
        //trace(p.toString());
        return p;
      }
      p.x *= this.con;
      p.y *= this.con;
      ts = rh * this.cons / (2 * this.a * this.k0);
      lat = this.con * phi2z(this.e, ts);
      lon = this.con * adjust_lon(this.con * this.long0 + Math.atan2(p.x, - 1 * p.y));
    }
    else {
      ce = 2 * Math.atan(rh * this.cosX0 / (2 * this.a * this.k0 * this.ms1));
      lon = this.long0;
      if (rh <= EPSLN) {
        Chi = this.X0;
      }
      else {
        Chi = Math.asin(Math.cos(ce) * this.sinX0 + p.y * Math.sin(ce) * this.cosX0 / rh);
        lon = adjust_lon(this.long0 + Math.atan2(p.x * Math.sin(ce), rh * this.cosX0 * Math.cos(ce) - p.y * this.sinX0 * Math.sin(ce)));
      }
      lat = -1 * phi2z(this.e, Math.tan(0.5 * (HALF_PI + Chi)));
    }
  }
  p.x = lon;
  p.y = lat;

  //trace(p.toString());
  return p;

};
exports.names = ["stere", "Stereographic_South_Pole", "Polar Stereographic (variant B)"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/msfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/msfnz.js","../common/phi2z":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/phi2z.js","../common/sign":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js","../common/tsfnz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/tsfnz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/sterea.js":[function(require,module,exports){
var gauss = require('./gauss');
var adjust_lon = require('../common/adjust_lon');
exports.init = function() {
  gauss.init.apply(this);
  if (!this.rc) {
    return;
  }
  this.sinc0 = Math.sin(this.phic0);
  this.cosc0 = Math.cos(this.phic0);
  this.R2 = 2 * this.rc;
  if (!this.title) {
    this.title = "Oblique Stereographic Alternative";
  }
};

exports.forward = function(p) {
  var sinc, cosc, cosl, k;
  p.x = adjust_lon(p.x - this.long0);
  gauss.forward.apply(this, [p]);
  sinc = Math.sin(p.y);
  cosc = Math.cos(p.y);
  cosl = Math.cos(p.x);
  k = this.k0 * this.R2 / (1 + this.sinc0 * sinc + this.cosc0 * cosc * cosl);
  p.x = k * cosc * Math.sin(p.x);
  p.y = k * (this.cosc0 * sinc - this.sinc0 * cosc * cosl);
  p.x = this.a * p.x + this.x0;
  p.y = this.a * p.y + this.y0;
  return p;
};

exports.inverse = function(p) {
  var sinc, cosc, lon, lat, rho;
  p.x = (p.x - this.x0) / this.a;
  p.y = (p.y - this.y0) / this.a;

  p.x /= this.k0;
  p.y /= this.k0;
  if ((rho = Math.sqrt(p.x * p.x + p.y * p.y))) {
    var c = 2 * Math.atan2(rho, this.R2);
    sinc = Math.sin(c);
    cosc = Math.cos(c);
    lat = Math.asin(cosc * this.sinc0 + p.y * sinc * this.cosc0 / rho);
    lon = Math.atan2(p.x * sinc, rho * this.cosc0 * cosc - p.y * this.sinc0 * sinc);
  }
  else {
    lat = this.phic0;
    lon = 0;
  }

  p.x = lon;
  p.y = lat;
  gauss.inverse.apply(this, [p]);
  p.x = adjust_lon(p.x + this.long0);
  return p;
};

exports.names = ["Stereographic_North_Pole", "Oblique_Stereographic", "Polar_Stereographic", "sterea","Oblique Stereographic Alternative"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","./gauss":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/gauss.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/tmerc.js":[function(require,module,exports){
var e0fn = require('../common/e0fn');
var e1fn = require('../common/e1fn');
var e2fn = require('../common/e2fn');
var e3fn = require('../common/e3fn');
var mlfn = require('../common/mlfn');
var adjust_lon = require('../common/adjust_lon');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var sign = require('../common/sign');
var asinz = require('../common/asinz');

exports.init = function() {
  this.e0 = e0fn(this.es);
  this.e1 = e1fn(this.es);
  this.e2 = e2fn(this.es);
  this.e3 = e3fn(this.es);
  this.ml0 = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, this.lat0);
};

/**
    Transverse Mercator Forward  - long/lat to x/y
    long/lat in radians
  */
exports.forward = function(p) {
  var lon = p.x;
  var lat = p.y;

  var delta_lon = adjust_lon(lon - this.long0);
  var con;
  var x, y;
  var sin_phi = Math.sin(lat);
  var cos_phi = Math.cos(lat);

  if (this.sphere) {
    var b = cos_phi * Math.sin(delta_lon);
    if ((Math.abs(Math.abs(b) - 1)) < 0.0000000001) {
      return (93);
    }
    else {
      x = 0.5 * this.a * this.k0 * Math.log((1 + b) / (1 - b));
      con = Math.acos(cos_phi * Math.cos(delta_lon) / Math.sqrt(1 - b * b));
      if (lat < 0) {
        con = -con;
      }
      y = this.a * this.k0 * (con - this.lat0);
    }
  }
  else {
    var al = cos_phi * delta_lon;
    var als = Math.pow(al, 2);
    var c = this.ep2 * Math.pow(cos_phi, 2);
    var tq = Math.tan(lat);
    var t = Math.pow(tq, 2);
    con = 1 - this.es * Math.pow(sin_phi, 2);
    var n = this.a / Math.sqrt(con);
    var ml = this.a * mlfn(this.e0, this.e1, this.e2, this.e3, lat);

    x = this.k0 * n * al * (1 + als / 6 * (1 - t + c + als / 20 * (5 - 18 * t + Math.pow(t, 2) + 72 * c - 58 * this.ep2))) + this.x0;
    y = this.k0 * (ml - this.ml0 + n * tq * (als * (0.5 + als / 24 * (5 - t + 9 * c + 4 * Math.pow(c, 2) + als / 30 * (61 - 58 * t + Math.pow(t, 2) + 600 * c - 330 * this.ep2))))) + this.y0;

  }
  p.x = x;
  p.y = y;
  return p;
};

/**
    Transverse Mercator Inverse  -  x/y to long/lat
  */
exports.inverse = function(p) {
  var con, phi;
  var delta_phi;
  var i;
  var max_iter = 6;
  var lat, lon;

  if (this.sphere) {
    var f = Math.exp(p.x / (this.a * this.k0));
    var g = 0.5 * (f - 1 / f);
    var temp = this.lat0 + p.y / (this.a * this.k0);
    var h = Math.cos(temp);
    con = Math.sqrt((1 - h * h) / (1 + g * g));
    lat = asinz(con);
    if (temp < 0) {
      lat = -lat;
    }
    if ((g === 0) && (h === 0)) {
      lon = this.long0;
    }
    else {
      lon = adjust_lon(Math.atan2(g, h) + this.long0);
    }
  }
  else { // ellipsoidal form
    var x = p.x - this.x0;
    var y = p.y - this.y0;

    con = (this.ml0 + y / this.k0) / this.a;
    phi = con;
    for (i = 0; true; i++) {
      delta_phi = ((con + this.e1 * Math.sin(2 * phi) - this.e2 * Math.sin(4 * phi) + this.e3 * Math.sin(6 * phi)) / this.e0) - phi;
      phi += delta_phi;
      if (Math.abs(delta_phi) <= EPSLN) {
        break;
      }
      if (i >= max_iter) {
        return (95);
      }
    } // for()
    if (Math.abs(phi) < HALF_PI) {
      var sin_phi = Math.sin(phi);
      var cos_phi = Math.cos(phi);
      var tan_phi = Math.tan(phi);
      var c = this.ep2 * Math.pow(cos_phi, 2);
      var cs = Math.pow(c, 2);
      var t = Math.pow(tan_phi, 2);
      var ts = Math.pow(t, 2);
      con = 1 - this.es * Math.pow(sin_phi, 2);
      var n = this.a / Math.sqrt(con);
      var r = n * (1 - this.es) / con;
      var d = x / (n * this.k0);
      var ds = Math.pow(d, 2);
      lat = phi - (n * tan_phi * ds / r) * (0.5 - ds / 24 * (5 + 3 * t + 10 * c - 4 * cs - 9 * this.ep2 - ds / 30 * (61 + 90 * t + 298 * c + 45 * ts - 252 * this.ep2 - 3 * cs)));
      lon = adjust_lon(this.long0 + (d * (1 - ds / 6 * (1 + 2 * t + c - ds / 20 * (5 - 2 * c + 28 * t - 3 * cs + 8 * this.ep2 + 24 * ts))) / cos_phi));
    }
    else {
      lat = HALF_PI * sign(y);
      lon = this.long0;
    }
  }
  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Transverse_Mercator", "Transverse Mercator", "tmerc"];

},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js","../common/e0fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e0fn.js","../common/e1fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e1fn.js","../common/e2fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e2fn.js","../common/e3fn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/e3fn.js","../common/mlfn":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/mlfn.js","../common/sign":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/sign.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/utm.js":[function(require,module,exports){
var D2R = 0.01745329251994329577;
var tmerc = require('./tmerc');
exports.dependsOn = 'tmerc';
exports.init = function() {
  if (!this.zone) {
    return;
  }
  this.lat0 = 0;
  this.long0 = ((6 * Math.abs(this.zone)) - 183) * D2R;
  this.x0 = 500000;
  this.y0 = this.utmSouth ? 10000000 : 0;
  this.k0 = 0.9996;

  tmerc.init.apply(this);
  this.forward = tmerc.forward;
  this.inverse = tmerc.inverse;
};
exports.names = ["Universal Transverse Mercator System", "utm"];

},{"./tmerc":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/tmerc.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/projections/vandg.js":[function(require,module,exports){
var adjust_lon = require('../common/adjust_lon');
var HALF_PI = Math.PI/2;
var EPSLN = 1.0e-10;
var asinz = require('../common/asinz');
/* Initialize the Van Der Grinten projection
  ----------------------------------------*/
exports.init = function() {
  //this.R = 6370997; //Radius of earth
  this.R = this.a;
};

exports.forward = function(p) {

  var lon = p.x;
  var lat = p.y;

  /* Forward equations
    -----------------*/
  var dlon = adjust_lon(lon - this.long0);
  var x, y;

  if (Math.abs(lat) <= EPSLN) {
    x = this.x0 + this.R * dlon;
    y = this.y0;
  }
  var theta = asinz(2 * Math.abs(lat / Math.PI));
  if ((Math.abs(dlon) <= EPSLN) || (Math.abs(Math.abs(lat) - HALF_PI) <= EPSLN)) {
    x = this.x0;
    if (lat >= 0) {
      y = this.y0 + Math.PI * this.R * Math.tan(0.5 * theta);
    }
    else {
      y = this.y0 + Math.PI * this.R * -Math.tan(0.5 * theta);
    }
    //  return(OK);
  }
  var al = 0.5 * Math.abs((Math.PI / dlon) - (dlon / Math.PI));
  var asq = al * al;
  var sinth = Math.sin(theta);
  var costh = Math.cos(theta);

  var g = costh / (sinth + costh - 1);
  var gsq = g * g;
  var m = g * (2 / sinth - 1);
  var msq = m * m;
  var con = Math.PI * this.R * (al * (g - msq) + Math.sqrt(asq * (g - msq) * (g - msq) - (msq + asq) * (gsq - msq))) / (msq + asq);
  if (dlon < 0) {
    con = -con;
  }
  x = this.x0 + con;
  //con = Math.abs(con / (Math.PI * this.R));
  var q = asq + g;
  con = Math.PI * this.R * (m * q - al * Math.sqrt((msq + asq) * (asq + 1) - q * q)) / (msq + asq);
  if (lat >= 0) {
    //y = this.y0 + Math.PI * this.R * Math.sqrt(1 - con * con - 2 * al * con);
    y = this.y0 + con;
  }
  else {
    //y = this.y0 - Math.PI * this.R * Math.sqrt(1 - con * con - 2 * al * con);
    y = this.y0 - con;
  }
  p.x = x;
  p.y = y;
  return p;
};

/* Van Der Grinten inverse equations--mapping x,y to lat/long
  ---------------------------------------------------------*/
exports.inverse = function(p) {
  var lon, lat;
  var xx, yy, xys, c1, c2, c3;
  var a1;
  var m1;
  var con;
  var th1;
  var d;

  /* inverse equations
    -----------------*/
  p.x -= this.x0;
  p.y -= this.y0;
  con = Math.PI * this.R;
  xx = p.x / con;
  yy = p.y / con;
  xys = xx * xx + yy * yy;
  c1 = -Math.abs(yy) * (1 + xys);
  c2 = c1 - 2 * yy * yy + xx * xx;
  c3 = -2 * c1 + 1 + 2 * yy * yy + xys * xys;
  d = yy * yy / c3 + (2 * c2 * c2 * c2 / c3 / c3 / c3 - 9 * c1 * c2 / c3 / c3) / 27;
  a1 = (c1 - c2 * c2 / 3 / c3) / c3;
  m1 = 2 * Math.sqrt(-a1 / 3);
  con = ((3 * d) / a1) / m1;
  if (Math.abs(con) > 1) {
    if (con >= 0) {
      con = 1;
    }
    else {
      con = -1;
    }
  }
  th1 = Math.acos(con) / 3;
  if (p.y >= 0) {
    lat = (-m1 * Math.cos(th1 + Math.PI / 3) - c2 / 3 / c3) * Math.PI;
  }
  else {
    lat = -(-m1 * Math.cos(th1 + Math.PI / 3) - c2 / 3 / c3) * Math.PI;
  }

  if (Math.abs(xx) < EPSLN) {
    lon = this.long0;
  }
  else {
    lon = adjust_lon(this.long0 + Math.PI * (xys - 1 + Math.sqrt(1 + 2 * (xx * xx - yy * yy) + xys * xys)) / 2 / xx);
  }

  p.x = lon;
  p.y = lat;
  return p;
};
exports.names = ["Van_der_Grinten_I", "VanDerGrinten", "vandg"];
},{"../common/adjust_lon":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/adjust_lon.js","../common/asinz":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/asinz.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/transform.js":[function(require,module,exports){
var D2R = 0.01745329251994329577;
var R2D = 57.29577951308232088;
var PJD_3PARAM = 1;
var PJD_7PARAM = 2;
var datum_transform = require('./datum_transform');
var adjust_axis = require('./adjust_axis');
var proj = require('./Proj');
var toPoint = require('./common/toPoint');
module.exports = function transform(source, dest, point) {
  var wgs84;
  if (Array.isArray(point)) {
    point = toPoint(point);
  }
  function checkNotWGS(source, dest) {
    return ((source.datum.datum_type === PJD_3PARAM || source.datum.datum_type === PJD_7PARAM) && dest.datumCode !== "WGS84");
  }

  // Workaround for datum shifts towgs84, if either source or destination projection is not wgs84
  if (source.datum && dest.datum && (checkNotWGS(source, dest) || checkNotWGS(dest, source))) {
    wgs84 = new proj('WGS84');
    transform(source, wgs84, point);
    source = wgs84;
  }
  // DGR, 2010/11/12
  if (source.axis !== "enu") {
    adjust_axis(source, false, point);
  }
  // Transform source points to long/lat, if they aren't already.
  if (source.projName === "longlat") {
    point.x *= D2R; // convert degrees to radians
    point.y *= D2R;
  }
  else {
    if (source.to_meter) {
      point.x *= source.to_meter;
      point.y *= source.to_meter;
    }
    source.inverse(point); // Convert Cartesian to longlat
  }
  // Adjust for the prime meridian if necessary
  if (source.from_greenwich) {
    point.x += source.from_greenwich;
  }

  // Convert datums if needed, and if possible.
  point = datum_transform(source.datum, dest.datum, point);

  // Adjust for the prime meridian if necessary
  if (dest.from_greenwich) {
    point.x -= dest.from_greenwich;
  }

  if (dest.projName === "longlat") {
    // convert radians to decimal degrees
    point.x *= R2D;
    point.y *= R2D;
  }
  else { // else project
    dest.forward(point);
    if (dest.to_meter) {
      point.x /= dest.to_meter;
      point.y /= dest.to_meter;
    }
  }

  // DGR, 2010/11/12
  if (dest.axis !== "enu") {
    adjust_axis(dest, true, point);
  }

  return point;
};
},{"./Proj":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/Proj.js","./adjust_axis":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/adjust_axis.js","./common/toPoint":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/common/toPoint.js","./datum_transform":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/datum_transform.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/wkt.js":[function(require,module,exports){
var D2R = 0.01745329251994329577;
var extend = require('./extend');

function mapit(obj, key, v) {
  obj[key] = v.map(function(aa) {
    var o = {};
    sExpr(aa, o);
    return o;
  }).reduce(function(a, b) {
    return extend(a, b);
  }, {});
}

function sExpr(v, obj) {
  var key;
  if (!Array.isArray(v)) {
    obj[v] = true;
    return;
  }
  else {
    key = v.shift();
    if (key === 'PARAMETER') {
      key = v.shift();
    }
    if (v.length === 1) {
      if (Array.isArray(v[0])) {
        obj[key] = {};
        sExpr(v[0], obj[key]);
      }
      else {
        obj[key] = v[0];
      }
    }
    else if (!v.length) {
      obj[key] = true;
    }
    else if (key === 'TOWGS84') {
      obj[key] = v;
    }
    else {
      obj[key] = {};
      if (['UNIT', 'PRIMEM', 'VERT_DATUM'].indexOf(key) > -1) {
        obj[key] = {
          name: v[0].toLowerCase(),
          convert: v[1]
        };
        if (v.length === 3) {
          obj[key].auth = v[2];
        }
      }
      else if (key === 'SPHEROID') {
        obj[key] = {
          name: v[0],
          a: v[1],
          rf: v[2]
        };
        if (v.length === 4) {
          obj[key].auth = v[3];
        }
      }
      else if (['GEOGCS', 'GEOCCS', 'DATUM', 'VERT_CS', 'COMPD_CS', 'LOCAL_CS', 'FITTED_CS', 'LOCAL_DATUM'].indexOf(key) > -1) {
        v[0] = ['name', v[0]];
        mapit(obj, key, v);
      }
      else if (v.every(function(aa) {
        return Array.isArray(aa);
      })) {
        mapit(obj, key, v);
      }
      else {
        sExpr(v, obj[key]);
      }
    }
  }
}

function rename(obj, params) {
  var outName = params[0];
  var inName = params[1];
  if (!(outName in obj) && (inName in obj)) {
    obj[outName] = obj[inName];
    if (params.length === 3) {
      obj[outName] = params[2](obj[outName]);
    }
  }
}

function d2r(input) {
  return input * D2R;
}

function cleanWKT(wkt) {
  if (wkt.type === 'GEOGCS') {
    wkt.projName = 'longlat';
  }
  else if (wkt.type === 'LOCAL_CS') {
    wkt.projName = 'identity';
    wkt.local = true;
  }
  else {
    if (typeof wkt.PROJECTION === "object") {
      wkt.projName = Object.keys(wkt.PROJECTION)[0];
    }
    else {
      wkt.projName = wkt.PROJECTION;
    }
  }
  if (wkt.UNIT) {
    wkt.units = wkt.UNIT.name.toLowerCase();
    if (wkt.units === 'metre') {
      wkt.units = 'meter';
    }
    if (wkt.UNIT.convert) {
      wkt.to_meter = parseFloat(wkt.UNIT.convert, 10);
    }
  }

  if (wkt.GEOGCS) {
    //if(wkt.GEOGCS.PRIMEM&&wkt.GEOGCS.PRIMEM.convert){
    //  wkt.from_greenwich=wkt.GEOGCS.PRIMEM.convert*D2R;
    //}
    if (wkt.GEOGCS.DATUM) {
      wkt.datumCode = wkt.GEOGCS.DATUM.name.toLowerCase();
    }
    else {
      wkt.datumCode = wkt.GEOGCS.name.toLowerCase();
    }
    if (wkt.datumCode.slice(0, 2) === 'd_') {
      wkt.datumCode = wkt.datumCode.slice(2);
    }
    if (wkt.datumCode === 'new_zealand_geodetic_datum_1949' || wkt.datumCode === 'new_zealand_1949') {
      wkt.datumCode = 'nzgd49';
    }
    if (wkt.datumCode === "wgs_1984") {
      if (wkt.PROJECTION === 'Mercator_Auxiliary_Sphere') {
        wkt.sphere = true;
      }
      wkt.datumCode = 'wgs84';
    }
    if (wkt.datumCode.slice(-6) === '_ferro') {
      wkt.datumCode = wkt.datumCode.slice(0, - 6);
    }
    if (wkt.datumCode.slice(-8) === '_jakarta') {
      wkt.datumCode = wkt.datumCode.slice(0, - 8);
    }
    if (~wkt.datumCode.indexOf('belge')) {
      wkt.datumCode = "rnb72";
    }
    if (wkt.GEOGCS.DATUM && wkt.GEOGCS.DATUM.SPHEROID) {
      wkt.ellps = wkt.GEOGCS.DATUM.SPHEROID.name.replace('_19', '').replace(/[Cc]larke\_18/, 'clrk');
      if (wkt.ellps.toLowerCase().slice(0, 13) === "international") {
        wkt.ellps = 'intl';
      }

      wkt.a = wkt.GEOGCS.DATUM.SPHEROID.a;
      wkt.rf = parseFloat(wkt.GEOGCS.DATUM.SPHEROID.rf, 10);
    }
    if (~wkt.datumCode.indexOf('osgb_1936')) {
      wkt.datumCode = "osgb36";
    }
  }
  if (wkt.b && !isFinite(wkt.b)) {
    wkt.b = wkt.a;
  }

  function toMeter(input) {
    var ratio = wkt.to_meter || 1;
    return parseFloat(input, 10) * ratio;
  }
  var renamer = function(a) {
    return rename(wkt, a);
  };
  var list = [
    ['standard_parallel_1', 'Standard_Parallel_1'],
    ['standard_parallel_2', 'Standard_Parallel_2'],
    ['false_easting', 'False_Easting'],
    ['false_northing', 'False_Northing'],
    ['central_meridian', 'Central_Meridian'],
    ['latitude_of_origin', 'Latitude_Of_Origin'],
    ['latitude_of_origin', 'Central_Parallel'],
    ['scale_factor', 'Scale_Factor'],
    ['k0', 'scale_factor'],
    ['latitude_of_center', 'Latitude_of_center'],
    ['lat0', 'latitude_of_center', d2r],
    ['longitude_of_center', 'Longitude_Of_Center'],
    ['longc', 'longitude_of_center', d2r],
    ['x0', 'false_easting', toMeter],
    ['y0', 'false_northing', toMeter],
    ['long0', 'central_meridian', d2r],
    ['lat0', 'latitude_of_origin', d2r],
    ['lat0', 'standard_parallel_1', d2r],
    ['lat1', 'standard_parallel_1', d2r],
    ['lat2', 'standard_parallel_2', d2r],
    ['alpha', 'azimuth', d2r],
    ['srsCode', 'name']
  ];
  list.forEach(renamer);
  if (!wkt.long0 && wkt.longc && (wkt.projName === 'Albers_Conic_Equal_Area' || wkt.projName === "Lambert_Azimuthal_Equal_Area")) {
    wkt.long0 = wkt.longc;
  }
  if (!wkt.lat_ts && wkt.lat1 && (wkt.projName === 'Stereographic_South_Pole' || wkt.projName === 'Polar Stereographic (variant B)')) {
    wkt.lat0 = d2r(wkt.lat1 > 0 ? 90 : -90);
    wkt.lat_ts = wkt.lat1;
  }
}
module.exports = function(wkt, self) {
  var lisp = JSON.parse(("," + wkt).replace(/\s*\,\s*([A-Z_0-9]+?)(\[)/g, ',["$1",').slice(1).replace(/\s*\,\s*([A-Z_0-9]+?)\]/g, ',"$1"]').replace(/,\["VERTCS".+/,''));
  var type = lisp.shift();
  var name = lisp.shift();
  lisp.unshift(['name', name]);
  lisp.unshift(['type', type]);
  lisp.unshift('output');
  var obj = {};
  sExpr(lisp, obj);
  cleanWKT(obj.output);
  return extend(self, obj.output);
};

},{"./extend":"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/lib/extend.js"}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/node_modules/mgrs/mgrs.js":[function(require,module,exports){



/**
 * UTM zones are grouped, and assigned to one of a group of 6
 * sets.
 *
 * {int} @private
 */
var NUM_100K_SETS = 6;

/**
 * The column letters (for easting) of the lower left value, per
 * set.
 *
 * {string} @private
 */
var SET_ORIGIN_COLUMN_LETTERS = 'AJSAJS';

/**
 * The row letters (for northing) of the lower left value, per
 * set.
 *
 * {string} @private
 */
var SET_ORIGIN_ROW_LETTERS = 'AFAFAF';

var A = 65; // A
var I = 73; // I
var O = 79; // O
var V = 86; // V
var Z = 90; // Z

/**
 * Conversion of lat/lon to MGRS.
 *
 * @param {object} ll Object literal with lat and lon properties on a
 *     WGS84 ellipsoid.
 * @param {int} accuracy Accuracy in digits (5 for 1 m, 4 for 10 m, 3 for
 *      100 m, 2 for 1000 m or 1 for 10000 m). Optional, default is 5.
 * @return {string} the MGRS string for the given location and accuracy.
 */
exports.forward = function(ll, accuracy) {
  accuracy = accuracy || 5; // default accuracy 1m
  return encode(LLtoUTM({
    lat: ll[1],
    lon: ll[0]
  }), accuracy);
};

/**
 * Conversion of MGRS to lat/lon.
 *
 * @param {string} mgrs MGRS string.
 * @return {array} An array with left (longitude), bottom (latitude), right
 *     (longitude) and top (latitude) values in WGS84, representing the
 *     bounding box for the provided MGRS reference.
 */
exports.inverse = function(mgrs) {
  var bbox = UTMtoLL(decode(mgrs.toUpperCase()));
  if (bbox.lat && bbox.lon) {
    return [bbox.lon, bbox.lat, bbox.lon, bbox.lat];
  }
  return [bbox.left, bbox.bottom, bbox.right, bbox.top];
};

exports.toPoint = function(mgrs) {
  var bbox = UTMtoLL(decode(mgrs.toUpperCase()));
  if (bbox.lat && bbox.lon) {
    return [bbox.lon, bbox.lat];
  }
  return [(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2];
};
/**
 * Conversion from degrees to radians.
 *
 * @private
 * @param {number} deg the angle in degrees.
 * @return {number} the angle in radians.
 */
function degToRad(deg) {
  return (deg * (Math.PI / 180.0));
}

/**
 * Conversion from radians to degrees.
 *
 * @private
 * @param {number} rad the angle in radians.
 * @return {number} the angle in degrees.
 */
function radToDeg(rad) {
  return (180.0 * (rad / Math.PI));
}

/**
 * Converts a set of Longitude and Latitude co-ordinates to UTM
 * using the WGS84 ellipsoid.
 *
 * @private
 * @param {object} ll Object literal with lat and lon properties
 *     representing the WGS84 coordinate to be converted.
 * @return {object} Object literal containing the UTM value with easting,
 *     northing, zoneNumber and zoneLetter properties, and an optional
 *     accuracy property in digits. Returns null if the conversion failed.
 */
function LLtoUTM(ll) {
  var Lat = ll.lat;
  var Long = ll.lon;
  var a = 6378137.0; //ellip.radius;
  var eccSquared = 0.00669438; //ellip.eccsq;
  var k0 = 0.9996;
  var LongOrigin;
  var eccPrimeSquared;
  var N, T, C, A, M;
  var LatRad = degToRad(Lat);
  var LongRad = degToRad(Long);
  var LongOriginRad;
  var ZoneNumber;
  // (int)
  ZoneNumber = Math.floor((Long + 180) / 6) + 1;

  //Make sure the longitude 180.00 is in Zone 60
  if (Long === 180) {
    ZoneNumber = 60;
  }

  // Special zone for Norway
  if (Lat >= 56.0 && Lat < 64.0 && Long >= 3.0 && Long < 12.0) {
    ZoneNumber = 32;
  }

  // Special zones for Svalbard
  if (Lat >= 72.0 && Lat < 84.0) {
    if (Long >= 0.0 && Long < 9.0) {
      ZoneNumber = 31;
    }
    else if (Long >= 9.0 && Long < 21.0) {
      ZoneNumber = 33;
    }
    else if (Long >= 21.0 && Long < 33.0) {
      ZoneNumber = 35;
    }
    else if (Long >= 33.0 && Long < 42.0) {
      ZoneNumber = 37;
    }
  }

  LongOrigin = (ZoneNumber - 1) * 6 - 180 + 3; //+3 puts origin
  // in middle of
  // zone
  LongOriginRad = degToRad(LongOrigin);

  eccPrimeSquared = (eccSquared) / (1 - eccSquared);

  N = a / Math.sqrt(1 - eccSquared * Math.sin(LatRad) * Math.sin(LatRad));
  T = Math.tan(LatRad) * Math.tan(LatRad);
  C = eccPrimeSquared * Math.cos(LatRad) * Math.cos(LatRad);
  A = Math.cos(LatRad) * (LongRad - LongOriginRad);

  M = a * ((1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256) * LatRad - (3 * eccSquared / 8 + 3 * eccSquared * eccSquared / 32 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(2 * LatRad) + (15 * eccSquared * eccSquared / 256 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(4 * LatRad) - (35 * eccSquared * eccSquared * eccSquared / 3072) * Math.sin(6 * LatRad));

  var UTMEasting = (k0 * N * (A + (1 - T + C) * A * A * A / 6.0 + (5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) * A * A * A * A * A / 120.0) + 500000.0);

  var UTMNorthing = (k0 * (M + N * Math.tan(LatRad) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24.0 + (61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSquared) * A * A * A * A * A * A / 720.0)));
  if (Lat < 0.0) {
    UTMNorthing += 10000000.0; //10000000 meter offset for
    // southern hemisphere
  }

  return {
    northing: Math.round(UTMNorthing),
    easting: Math.round(UTMEasting),
    zoneNumber: ZoneNumber,
    zoneLetter: getLetterDesignator(Lat)
  };
}

/**
 * Converts UTM coords to lat/long, using the WGS84 ellipsoid. This is a convenience
 * class where the Zone can be specified as a single string eg."60N" which
 * is then broken down into the ZoneNumber and ZoneLetter.
 *
 * @private
 * @param {object} utm An object literal with northing, easting, zoneNumber
 *     and zoneLetter properties. If an optional accuracy property is
 *     provided (in meters), a bounding box will be returned instead of
 *     latitude and longitude.
 * @return {object} An object literal containing either lat and lon values
 *     (if no accuracy was provided), or top, right, bottom and left values
 *     for the bounding box calculated according to the provided accuracy.
 *     Returns null if the conversion failed.
 */
function UTMtoLL(utm) {

  var UTMNorthing = utm.northing;
  var UTMEasting = utm.easting;
  var zoneLetter = utm.zoneLetter;
  var zoneNumber = utm.zoneNumber;
  // check the ZoneNummber is valid
  if (zoneNumber < 0 || zoneNumber > 60) {
    return null;
  }

  var k0 = 0.9996;
  var a = 6378137.0; //ellip.radius;
  var eccSquared = 0.00669438; //ellip.eccsq;
  var eccPrimeSquared;
  var e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  var N1, T1, C1, R1, D, M;
  var LongOrigin;
  var mu, phi1Rad;

  // remove 500,000 meter offset for longitude
  var x = UTMEasting - 500000.0;
  var y = UTMNorthing;

  // We must know somehow if we are in the Northern or Southern
  // hemisphere, this is the only time we use the letter So even
  // if the Zone letter isn't exactly correct it should indicate
  // the hemisphere correctly
  if (zoneLetter < 'N') {
    y -= 10000000.0; // remove 10,000,000 meter offset used
    // for southern hemisphere
  }

  // There are 60 zones with zone 1 being at West -180 to -174
  LongOrigin = (zoneNumber - 1) * 6 - 180 + 3; // +3 puts origin
  // in middle of
  // zone

  eccPrimeSquared = (eccSquared) / (1 - eccSquared);

  M = y / k0;
  mu = M / (a * (1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256));

  phi1Rad = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);
  // double phi1 = ProjMath.radToDeg(phi1Rad);

  N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  R1 = a * (1 - eccSquared) / Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  D = x / (N1 * k0);

  var lat = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) * D * D * D * D / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * eccPrimeSquared - 3 * C1 * C1) * D * D * D * D * D * D / 720);
  lat = radToDeg(lat);

  var lon = (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * eccPrimeSquared + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1Rad);
  lon = LongOrigin + radToDeg(lon);

  var result;
  if (utm.accuracy) {
    var topRight = UTMtoLL({
      northing: utm.northing + utm.accuracy,
      easting: utm.easting + utm.accuracy,
      zoneLetter: utm.zoneLetter,
      zoneNumber: utm.zoneNumber
    });
    result = {
      top: topRight.lat,
      right: topRight.lon,
      bottom: lat,
      left: lon
    };
  }
  else {
    result = {
      lat: lat,
      lon: lon
    };
  }
  return result;
}

/**
 * Calculates the MGRS letter designator for the given latitude.
 *
 * @private
 * @param {number} lat The latitude in WGS84 to get the letter designator
 *     for.
 * @return {char} The letter designator.
 */
function getLetterDesignator(lat) {
  //This is here as an error flag to show that the Latitude is
  //outside MGRS limits
  var LetterDesignator = 'Z';

  if ((84 >= lat) && (lat >= 72)) {
    LetterDesignator = 'X';
  }
  else if ((72 > lat) && (lat >= 64)) {
    LetterDesignator = 'W';
  }
  else if ((64 > lat) && (lat >= 56)) {
    LetterDesignator = 'V';
  }
  else if ((56 > lat) && (lat >= 48)) {
    LetterDesignator = 'U';
  }
  else if ((48 > lat) && (lat >= 40)) {
    LetterDesignator = 'T';
  }
  else if ((40 > lat) && (lat >= 32)) {
    LetterDesignator = 'S';
  }
  else if ((32 > lat) && (lat >= 24)) {
    LetterDesignator = 'R';
  }
  else if ((24 > lat) && (lat >= 16)) {
    LetterDesignator = 'Q';
  }
  else if ((16 > lat) && (lat >= 8)) {
    LetterDesignator = 'P';
  }
  else if ((8 > lat) && (lat >= 0)) {
    LetterDesignator = 'N';
  }
  else if ((0 > lat) && (lat >= -8)) {
    LetterDesignator = 'M';
  }
  else if ((-8 > lat) && (lat >= -16)) {
    LetterDesignator = 'L';
  }
  else if ((-16 > lat) && (lat >= -24)) {
    LetterDesignator = 'K';
  }
  else if ((-24 > lat) && (lat >= -32)) {
    LetterDesignator = 'J';
  }
  else if ((-32 > lat) && (lat >= -40)) {
    LetterDesignator = 'H';
  }
  else if ((-40 > lat) && (lat >= -48)) {
    LetterDesignator = 'G';
  }
  else if ((-48 > lat) && (lat >= -56)) {
    LetterDesignator = 'F';
  }
  else if ((-56 > lat) && (lat >= -64)) {
    LetterDesignator = 'E';
  }
  else if ((-64 > lat) && (lat >= -72)) {
    LetterDesignator = 'D';
  }
  else if ((-72 > lat) && (lat >= -80)) {
    LetterDesignator = 'C';
  }
  return LetterDesignator;
}

/**
 * Encodes a UTM location as MGRS string.
 *
 * @private
 * @param {object} utm An object literal with easting, northing,
 *     zoneLetter, zoneNumber
 * @param {number} accuracy Accuracy in digits (1-5).
 * @return {string} MGRS string for the given UTM location.
 */
function encode(utm, accuracy) {
  // prepend with leading zeroes
  var seasting = "00000" + utm.easting,
    snorthing = "00000" + utm.northing;

  return utm.zoneNumber + utm.zoneLetter + get100kID(utm.easting, utm.northing, utm.zoneNumber) + seasting.substr(seasting.length - 5, accuracy) + snorthing.substr(snorthing.length - 5, accuracy);
}

/**
 * Get the two letter 100k designator for a given UTM easting,
 * northing and zone number value.
 *
 * @private
 * @param {number} easting
 * @param {number} northing
 * @param {number} zoneNumber
 * @return the two letter 100k designator for the given UTM location.
 */
function get100kID(easting, northing, zoneNumber) {
  var setParm = get100kSetForZone(zoneNumber);
  var setColumn = Math.floor(easting / 100000);
  var setRow = Math.floor(northing / 100000) % 20;
  return getLetter100kID(setColumn, setRow, setParm);
}

/**
 * Given a UTM zone number, figure out the MGRS 100K set it is in.
 *
 * @private
 * @param {number} i An UTM zone number.
 * @return {number} the 100k set the UTM zone is in.
 */
function get100kSetForZone(i) {
  var setParm = i % NUM_100K_SETS;
  if (setParm === 0) {
    setParm = NUM_100K_SETS;
  }

  return setParm;
}

/**
 * Get the two-letter MGRS 100k designator given information
 * translated from the UTM northing, easting and zone number.
 *
 * @private
 * @param {number} column the column index as it relates to the MGRS
 *        100k set spreadsheet, created from the UTM easting.
 *        Values are 1-8.
 * @param {number} row the row index as it relates to the MGRS 100k set
 *        spreadsheet, created from the UTM northing value. Values
 *        are from 0-19.
 * @param {number} parm the set block, as it relates to the MGRS 100k set
 *        spreadsheet, created from the UTM zone. Values are from
 *        1-60.
 * @return two letter MGRS 100k code.
 */
function getLetter100kID(column, row, parm) {
  // colOrigin and rowOrigin are the letters at the origin of the set
  var index = parm - 1;
  var colOrigin = SET_ORIGIN_COLUMN_LETTERS.charCodeAt(index);
  var rowOrigin = SET_ORIGIN_ROW_LETTERS.charCodeAt(index);

  // colInt and rowInt are the letters to build to return
  var colInt = colOrigin + column - 1;
  var rowInt = rowOrigin + row;
  var rollover = false;

  if (colInt > Z) {
    colInt = colInt - Z + A - 1;
    rollover = true;
  }

  if (colInt === I || (colOrigin < I && colInt > I) || ((colInt > I || colOrigin < I) && rollover)) {
    colInt++;
  }

  if (colInt === O || (colOrigin < O && colInt > O) || ((colInt > O || colOrigin < O) && rollover)) {
    colInt++;

    if (colInt === I) {
      colInt++;
    }
  }

  if (colInt > Z) {
    colInt = colInt - Z + A - 1;
  }

  if (rowInt > V) {
    rowInt = rowInt - V + A - 1;
    rollover = true;
  }
  else {
    rollover = false;
  }

  if (((rowInt === I) || ((rowOrigin < I) && (rowInt > I))) || (((rowInt > I) || (rowOrigin < I)) && rollover)) {
    rowInt++;
  }

  if (((rowInt === O) || ((rowOrigin < O) && (rowInt > O))) || (((rowInt > O) || (rowOrigin < O)) && rollover)) {
    rowInt++;

    if (rowInt === I) {
      rowInt++;
    }
  }

  if (rowInt > V) {
    rowInt = rowInt - V + A - 1;
  }

  var twoLetter = String.fromCharCode(colInt) + String.fromCharCode(rowInt);
  return twoLetter;
}

/**
 * Decode the UTM parameters from a MGRS string.
 *
 * @private
 * @param {string} mgrsString an UPPERCASE coordinate string is expected.
 * @return {object} An object literal with easting, northing, zoneLetter,
 *     zoneNumber and accuracy (in meters) properties.
 */
function decode(mgrsString) {

  if (mgrsString && mgrsString.length === 0) {
    throw ("MGRSPoint coverting from nothing");
  }

  var length = mgrsString.length;

  var hunK = null;
  var sb = "";
  var testChar;
  var i = 0;

  // get Zone number
  while (!(/[A-Z]/).test(testChar = mgrsString.charAt(i))) {
    if (i >= 2) {
      throw ("MGRSPoint bad conversion from: " + mgrsString);
    }
    sb += testChar;
    i++;
  }

  var zoneNumber = parseInt(sb, 10);

  if (i === 0 || i + 3 > length) {
    // A good MGRS string has to be 4-5 digits long,
    // ##AAA/#AAA at least.
    throw ("MGRSPoint bad conversion from: " + mgrsString);
  }

  var zoneLetter = mgrsString.charAt(i++);

  // Should we check the zone letter here? Why not.
  if (zoneLetter <= 'A' || zoneLetter === 'B' || zoneLetter === 'Y' || zoneLetter >= 'Z' || zoneLetter === 'I' || zoneLetter === 'O') {
    throw ("MGRSPoint zone letter " + zoneLetter + " not handled: " + mgrsString);
  }

  hunK = mgrsString.substring(i, i += 2);

  var set = get100kSetForZone(zoneNumber);

  var east100k = getEastingFromChar(hunK.charAt(0), set);
  var north100k = getNorthingFromChar(hunK.charAt(1), set);

  // We have a bug where the northing may be 2000000 too low.
  // How
  // do we know when to roll over?

  while (north100k < getMinNorthing(zoneLetter)) {
    north100k += 2000000;
  }

  // calculate the char index for easting/northing separator
  var remainder = length - i;

  if (remainder % 2 !== 0) {
    throw ("MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters" + mgrsString);
  }

  var sep = remainder / 2;

  var sepEasting = 0.0;
  var sepNorthing = 0.0;
  var accuracyBonus, sepEastingString, sepNorthingString, easting, northing;
  if (sep > 0) {
    accuracyBonus = 100000.0 / Math.pow(10, sep);
    sepEastingString = mgrsString.substring(i, i + sep);
    sepEasting = parseFloat(sepEastingString) * accuracyBonus;
    sepNorthingString = mgrsString.substring(i + sep);
    sepNorthing = parseFloat(sepNorthingString) * accuracyBonus;
  }

  easting = sepEasting + east100k;
  northing = sepNorthing + north100k;

  return {
    easting: easting,
    northing: northing,
    zoneLetter: zoneLetter,
    zoneNumber: zoneNumber,
    accuracy: accuracyBonus
  };
}

/**
 * Given the first letter from a two-letter MGRS 100k zone, and given the
 * MGRS table set for the zone number, figure out the easting value that
 * should be added to the other, secondary easting value.
 *
 * @private
 * @param {char} e The first letter from a two-letter MGRS 100´k zone.
 * @param {number} set The MGRS table set for the zone number.
 * @return {number} The easting value for the given letter and set.
 */
function getEastingFromChar(e, set) {
  // colOrigin is the letter at the origin of the set for the
  // column
  var curCol = SET_ORIGIN_COLUMN_LETTERS.charCodeAt(set - 1);
  var eastingValue = 100000.0;
  var rewindMarker = false;

  while (curCol !== e.charCodeAt(0)) {
    curCol++;
    if (curCol === I) {
      curCol++;
    }
    if (curCol === O) {
      curCol++;
    }
    if (curCol > Z) {
      if (rewindMarker) {
        throw ("Bad character: " + e);
      }
      curCol = A;
      rewindMarker = true;
    }
    eastingValue += 100000.0;
  }

  return eastingValue;
}

/**
 * Given the second letter from a two-letter MGRS 100k zone, and given the
 * MGRS table set for the zone number, figure out the northing value that
 * should be added to the other, secondary northing value. You have to
 * remember that Northings are determined from the equator, and the vertical
 * cycle of letters mean a 2000000 additional northing meters. This happens
 * approx. every 18 degrees of latitude. This method does *NOT* count any
 * additional northings. You have to figure out how many 2000000 meters need
 * to be added for the zone letter of the MGRS coordinate.
 *
 * @private
 * @param {char} n Second letter of the MGRS 100k zone
 * @param {number} set The MGRS table set number, which is dependent on the
 *     UTM zone number.
 * @return {number} The northing value for the given letter and set.
 */
function getNorthingFromChar(n, set) {

  if (n > 'V') {
    throw ("MGRSPoint given invalid Northing " + n);
  }

  // rowOrigin is the letter at the origin of the set for the
  // column
  var curRow = SET_ORIGIN_ROW_LETTERS.charCodeAt(set - 1);
  var northingValue = 0.0;
  var rewindMarker = false;

  while (curRow !== n.charCodeAt(0)) {
    curRow++;
    if (curRow === I) {
      curRow++;
    }
    if (curRow === O) {
      curRow++;
    }
    // fixing a bug making whole application hang in this loop
    // when 'n' is a wrong character
    if (curRow > V) {
      if (rewindMarker) { // making sure that this loop ends
        throw ("Bad character: " + n);
      }
      curRow = A;
      rewindMarker = true;
    }
    northingValue += 100000.0;
  }

  return northingValue;
}

/**
 * The function getMinNorthing returns the minimum northing value of a MGRS
 * zone.
 *
 * Ported from Geotrans' c Lattitude_Band_Value structure table.
 *
 * @private
 * @param {char} zoneLetter The MGRS zone to get the min northing for.
 * @return {number}
 */
function getMinNorthing(zoneLetter) {
  var northing;
  switch (zoneLetter) {
  case 'C':
    northing = 1100000.0;
    break;
  case 'D':
    northing = 2000000.0;
    break;
  case 'E':
    northing = 2800000.0;
    break;
  case 'F':
    northing = 3700000.0;
    break;
  case 'G':
    northing = 4600000.0;
    break;
  case 'H':
    northing = 5500000.0;
    break;
  case 'J':
    northing = 6400000.0;
    break;
  case 'K':
    northing = 7300000.0;
    break;
  case 'L':
    northing = 8200000.0;
    break;
  case 'M':
    northing = 9100000.0;
    break;
  case 'N':
    northing = 0.0;
    break;
  case 'P':
    northing = 800000.0;
    break;
  case 'Q':
    northing = 1700000.0;
    break;
  case 'R':
    northing = 2600000.0;
    break;
  case 'S':
    northing = 3500000.0;
    break;
  case 'T':
    northing = 4400000.0;
    break;
  case 'U':
    northing = 5300000.0;
    break;
  case 'V':
    northing = 6200000.0;
    break;
  case 'W':
    northing = 7000000.0;
    break;
  case 'X':
    northing = 7900000.0;
    break;
  default:
    northing = -1.0;
  }
  if (northing >= 0.0) {
    return northing;
  }
  else {
    throw ("Invalid zone letter: " + zoneLetter);
  }

}

},{}],"/Users/jrmerz/dev/cstars/cimis-mobile/node_modules/proj4/package.json":[function(require,module,exports){
module.exports={
  "name": "proj4",
  "version": "2.3.10",
  "description": "Proj4js is a JavaScript library to transform point coordinates from one coordinate system to another, including datum transformations.",
  "main": "lib/index.js",
  "directories": {
    "test": "test",
    "doc": "docs"
  },
  "scripts": {
    "test": "./node_modules/istanbul/lib/cli.js test ./node_modules/mocha/bin/_mocha test/test.js"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/proj4js/proj4js.git"
  },
  "author": "",
  "license": "MIT",
  "jam": {
    "main": "dist/proj4.js",
    "include": [
      "dist/proj4.js",
      "README.md",
      "AUTHORS",
      "LICENSE.md"
    ]
  },
  "devDependencies": {
    "grunt-cli": "~0.1.13",
    "grunt": "~0.4.2",
    "grunt-contrib-connect": "~0.6.0",
    "grunt-contrib-jshint": "~0.8.0",
    "chai": "~1.8.1",
    "mocha": "~1.17.1",
    "grunt-mocha-phantomjs": "~0.4.0",
    "browserify": "~3.24.5",
    "grunt-browserify": "~1.3.0",
    "grunt-contrib-uglify": "~0.3.2",
    "curl": "git://github.com/cujojs/curl.git",
    "istanbul": "~0.2.4",
    "tin": "~0.4.0"
  },
  "dependencies": {
    "mgrs": "~0.0.2"
  },
  "contributors": [
    {
      "name": "Mike Adair",
      "email": "madair@dmsolutions.ca"
    },
    {
      "name": "Richard Greenwood",
      "email": "rich@greenwoodmap.com"
    },
    {
      "name": "Calvin Metcalf",
      "email": "calvin.metcalf@gmail.com"
    },
    {
      "name": "Richard Marsden",
      "url": "http://www.winwaed.com"
    },
    {
      "name": "T. Mittan"
    },
    {
      "name": "D. Steinwand"
    },
    {
      "name": "S. Nelson"
    }
  ],
  "gitHead": "ac03d1439491dc313da80985193f702ca471b3d0",
  "bugs": {
    "url": "https://github.com/proj4js/proj4js/issues"
  },
  "homepage": "https://github.com/proj4js/proj4js#readme",
  "_id": "proj4@2.3.10",
  "_shasum": "f6e66bdcca332c25a5e3d8ef265cfc9d7b60fd0c",
  "_from": "proj4@*",
  "_npmVersion": "2.11.2",
  "_nodeVersion": "0.12.5",
  "_npmUser": {
    "name": "ahocevar",
    "email": "andreas.hocevar@gmail.com"
  },
  "maintainers": [
    {
      "name": "cwmma",
      "email": "calvin.metcalf@gmail.com"
    },
    {
      "name": "ahocevar",
      "email": "andreas.hocevar@gmail.com"
    }
  ],
  "dist": {
    "shasum": "f6e66bdcca332c25a5e3d8ef265cfc9d7b60fd0c",
    "tarball": "http://registry.npmjs.org/proj4/-/proj4-2.3.10.tgz"
  },
  "_resolved": "https://registry.npmjs.org/proj4/-/proj4-2.3.10.tgz"
}

},{}]},{},["/Users/jrmerz/dev/cstars/cimis-mobile/lib/shared/index.js"])("/Users/jrmerz/dev/cstars/cimis-mobile/lib/shared/index.js")
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvc2hhcmVkL2NpbWlzLWdyaWQvaW5kZXguanMiLCJsaWIvc2hhcmVkL2luZGV4LmpzIiwibGliL3NoYXJlZC91dGlscy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvUG9pbnQuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL1Byb2ouanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2FkanVzdF9heGlzLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vYWRqdXN0X2xhdC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2FkanVzdF9sb24uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9hc2luei5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2UwZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9lMWZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vZTJmbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2UzZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9nTi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2ltbGZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vaXFzZm56LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vbWxmbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL21zZm56LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vcGhpMnouanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9wal9lbmZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vcGpfaW52X21sZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9wal9tbGZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vcXNmbnouanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9zaWduLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vc3JhdC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL3RvUG9pbnQuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi90c2Zuei5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29uc3RhbnRzL0RhdHVtLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb25zdGFudHMvRWxsaXBzb2lkLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb25zdGFudHMvUHJpbWVNZXJpZGlhbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29uc3RhbnRzL3VuaXRzLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb3JlLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9kYXR1bS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvZGF0dW1fdHJhbnNmb3JtLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9kZWZzLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9kZXJpdmVDb25zdGFudHMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2V4dGVuZC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvZ2xvYmFsLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9pbmNsdWRlZFByb2plY3Rpb25zLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcGFyc2VDb2RlLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvYWVhLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9hZXFkLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9jYXNzLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9jZWEuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2VxYy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvZXFkYy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvZ2F1c3MuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2dub20uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2tyb3Zhay5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvbGFlYS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvbGNjLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9sb25nbGF0LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9tZXJjLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9taWxsLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9tb2xsLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9uem1nLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9vbWVyYy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvcG9seS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvc2ludS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvc29tZXJjLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9zdGVyZS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvc3RlcmVhLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy90bWVyYy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvdXRtLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy92YW5kZy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvdHJhbnNmb3JtLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi93a3QuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbm9kZV9tb2R1bGVzL21ncnMvbWdycy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9wYWNrYWdlLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdHVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBwcm9qNCA9IHJlcXVpcmUoJ3Byb2o0Jyk7XG5cbi8vIG1hdGNoIGxheWVycyBmb3IgZWFzaWVyIGNoZWNraW5nXG52YXIgbmNvbHMgPSA1MTAsXG4gICAgbnJvd3MgPSA1NjAsXG4gICAgeGxsY29ybmVyID0gLTQxMDAwMCxcbiAgICB5bGxjb3JuZXIgPSAtNjYwMDAwLFxuICAgIGNlbGxzaXplID0gMjAwMDtcblxudmFyIHByb2pfZ21hcHMgPSAnRVBTRzo0MzI2JztcbnZhciBwcm9qX2NpbWlzID0gJ0VQU0c6MzMxMCc7XG5cbnByb2o0LmRlZnMoJ0VQU0c6MzMxMCcsJytwcm9qPWFlYSArbGF0XzE9MzQgK2xhdF8yPTQwLjUgK2xhdF8wPTAgK2xvbl8wPS0xMjAgK3hfMD0wICt5XzA9LTQwMDAwMDAgK2VsbHBzPUdSUzgwICt0b3dnczg0PTAsMCwwLDAsMCwwLDAgK3VuaXRzPW0gK25vX2RlZnMnKTtcblxuXG5mdW5jdGlvbiBib3VuZHMoKSB7XG4gIHZhciBib3R0b21MZWZ0ID0gcHJvajQocHJval9jaW1pcywgcHJval9nbWFwcywgW3hsbGNvcm5lciwgeWxsY29ybmVyXSk7XG4gIHZhciB0b3BSaWdodCA9IHByb2o0KHByb2pfY2ltaXMsIHByb2pfZ21hcHMsW3hsbGNvcm5lcituY29scypjZWxsc2l6ZSwgeWxsY29ybmVyK25yb3dzKmNlbGxzaXplXSk7XG4gIHZhciBib3VuZHMgPSBbYm90dG9tTGVmdCwgdG9wUmlnaHRdO1xuICByZXR1cm4gYm91bmRzO1xufVxuXG5mdW5jdGlvbiBncmlkVG9Cb3VuZHMocm93LCBjb2wpIHtcbiAgdmFyIGJvdHRvbUxlZnQgPSBwcm9qNChwcm9qX2NpbWlzLCBwcm9qX2dtYXBzLCBbeGxsY29ybmVyICsgKGNvbCpjZWxsc2l6ZSksIHlsbGNvcm5lciArICgobnJvd3MgLSByb3cpKmNlbGxzaXplKV0pO1xuICB2YXIgdG9wUmlnaHQgPSBwcm9qNChwcm9qX2NpbWlzLCBwcm9qX2dtYXBzLCBbeGxsY29ybmVyICsgKChjb2wrMSkgKiBjZWxsc2l6ZSksIHlsbGNvcm5lciArICgobnJvd3MgLShyb3crMSkpICogY2VsbHNpemUpXSk7XG4gIHZhciBib3VuZHMgPSBbYm90dG9tTGVmdCwgdG9wUmlnaHRdO1xuXG4gIHJldHVybiBib3VuZHM7XG59XG5cbmZ1bmN0aW9uIGxsVG9HcmlkKGxuZywgbGF0KSB7XG4gIGlmKCB0eXBlb2YgbG5nID09PSAnb2JqZWN0JyApIHtcbiAgICBsYXQgPSBsbmcubGF0KCk7XG4gICAgbG5nID0gbG5nLmxuZygpO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IHByb2o0KHByb2pfZ21hcHMsIHByb2pfY2ltaXMsIFtsbmcsIGxhdF0pO1xuXG4gIC8vIEFzc3VtaW5nIHRoaXMgaXMgdGhlIGlucHV0IHRvIHRoZSBncmlkLi4uLlxuICAvLyBDb2xzIGFyZSBYLiBSb3dzIGFyZSBZIGFuZCBjb3VudGVkIGZyb20gdGhlIHRvcCBkb3duXG4gIHJlc3VsdCA9IHtcbiAgICByb3cgOiBucm93cyAtIE1hdGguZmxvb3IoKHJlc3VsdFsxXSAtIHlsbGNvcm5lcikgLyBjZWxsc2l6ZSksXG4gICAgY29sIDogTWF0aC5mbG9vcigocmVzdWx0WzBdIC0geGxsY29ybmVyKSAvIGNlbGxzaXplKSxcbiAgfTtcblxuICB2YXIgeSA9IHlsbGNvcm5lciArICgobnJvd3MtcmVzdWx0LnJvdykgKiBjZWxsc2l6ZSk7XG4gIHZhciB4ID0geGxsY29ybmVyICsgKHJlc3VsdC5jb2wgKiBjZWxsc2l6ZSkgO1xuXG4gIHJlc3VsdC50b3BSaWdodCA9IHByb2o0KHByb2pfY2ltaXMsIHByb2pfZ21hcHMsW3grY2VsbHNpemUsIHkrY2VsbHNpemVdKTtcbiAgcmVzdWx0LmJvdHRvbUxlZnQgPSBwcm9qNChwcm9qX2NpbWlzLCBwcm9qX2dtYXBzLFt4LCB5XSk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbGxUb0dyaWQgOiBsbFRvR3JpZCxcbiAgeGxsY29ybmVyIDogeGxsY29ybmVyLFxuICB5bGxjb3JuZXIgOiB5bGxjb3JuZXIsXG4gIGNlbGxzaXplIDogY2VsbHNpemUsXG4gIGJvdW5kcyA6IGJvdW5kcyxcbiAgZ3JpZFRvQm91bmRzIDogZ3JpZFRvQm91bmRzXG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ3JpZCA6IHJlcXVpcmUoJy4vY2ltaXMtZ3JpZCcpLFxuICB1dGlscyA6IHJlcXVpcmUoJy4vdXRpbHMnKVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gc29ydERhdGVzKGRhdGEpIHtcbiAgdmFyIGFyciA9IFtdO1xuXG4gIGlmKCBBcnJheS5pc0FycmF5KGRhdGEpICkge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGFyci5wdXNoKHtcbiAgICAgICAgc3RyIDogZGF0YVtpXSxcbiAgICAgICAgdGltZSA6IHRvRGF0ZShkYXRhW2ldKS5nZXRUaW1lKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IoIHZhciBkYXRlIGluIGRhdGEgKSB7XG4gICAgICBhcnIucHVzaCh7XG4gICAgICAgIHN0ciA6IGRhdGUsXG4gICAgICAgIHRpbWUgOiB0b0RhdGUoZGF0ZSkuZ2V0VGltZSgpXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhcnIuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICBpZiggYS50aW1lID4gYi50aW1lICkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmKCBhLnRpbWUgPCBiLnRpbWUgKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9KTtcblxuICB2YXIgdG1wID0gW107XG4gIGFyci5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgIHRtcC5wdXNoKGl0ZW0uc3RyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRtcDtcbn1cblxuZnVuY3Rpb24gdG9EYXRlKHN0cikge1xuICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoJy0nKTtcbiAgcmV0dXJuIG5ldyBEYXRlKHBhcnNlSW50KHBhcnRzWzBdKSwgcGFyc2VJbnQocGFydHNbMV0pLTEsIHBhcnNlSW50KHBhcnRzWzJdKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzb3J0RGF0ZXMgOiBzb3J0RGF0ZXNcbn07XG4iLCJ2YXIgbWdycyA9IHJlcXVpcmUoJ21ncnMnKTtcblxuZnVuY3Rpb24gUG9pbnQoeCwgeSwgeikge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUG9pbnQpKSB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh4LCB5LCB6KTtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheSh4KSkge1xuICAgIHRoaXMueCA9IHhbMF07XG4gICAgdGhpcy55ID0geFsxXTtcbiAgICB0aGlzLnogPSB4WzJdIHx8IDAuMDtcbiAgfWVsc2UgaWYodHlwZW9mIHggPT09ICdvYmplY3QnKXtcbiAgICB0aGlzLnggPSB4Lng7XG4gICAgdGhpcy55ID0geC55O1xuICAgIHRoaXMueiA9IHgueiB8fCAwLjA7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHggPT09ICdzdHJpbmcnICYmIHR5cGVvZiB5ID09PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBjb29yZHMgPSB4LnNwbGl0KCcsJyk7XG4gICAgdGhpcy54ID0gcGFyc2VGbG9hdChjb29yZHNbMF0sIDEwKTtcbiAgICB0aGlzLnkgPSBwYXJzZUZsb2F0KGNvb3Jkc1sxXSwgMTApO1xuICAgIHRoaXMueiA9IHBhcnNlRmxvYXQoY29vcmRzWzJdLCAxMCkgfHwgMC4wO1xuICB9XG4gIGVsc2Uge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLnogPSB6IHx8IDAuMDtcbiAgfVxuICBjb25zb2xlLndhcm4oJ3Byb2o0LlBvaW50IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDMsIHVzZSBwcm9qNC50b1BvaW50Jyk7XG59XG5cblBvaW50LmZyb21NR1JTID0gZnVuY3Rpb24obWdyc1N0cikge1xuICByZXR1cm4gbmV3IFBvaW50KG1ncnMudG9Qb2ludChtZ3JzU3RyKSk7XG59O1xuUG9pbnQucHJvdG90eXBlLnRvTUdSUyA9IGZ1bmN0aW9uKGFjY3VyYWN5KSB7XG4gIHJldHVybiBtZ3JzLmZvcndhcmQoW3RoaXMueCwgdGhpcy55XSwgYWNjdXJhY3kpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gUG9pbnQ7IiwidmFyIHBhcnNlQ29kZSA9IHJlcXVpcmUoXCIuL3BhcnNlQ29kZVwiKTtcbnZhciBleHRlbmQgPSByZXF1aXJlKCcuL2V4dGVuZCcpO1xudmFyIHByb2plY3Rpb25zID0gcmVxdWlyZSgnLi9wcm9qZWN0aW9ucycpO1xudmFyIGRlcml2ZUNvbnN0YW50cyA9IHJlcXVpcmUoJy4vZGVyaXZlQ29uc3RhbnRzJyk7XG5cbmZ1bmN0aW9uIFByb2plY3Rpb24oc3JzQ29kZSxjYWxsYmFjaykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUHJvamVjdGlvbikpIHtcbiAgICByZXR1cm4gbmV3IFByb2plY3Rpb24oc3JzQ29kZSk7XG4gIH1cbiAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbihlcnJvcil7XG4gICAgaWYoZXJyb3Ipe1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9O1xuICB2YXIganNvbiA9IHBhcnNlQ29kZShzcnNDb2RlKTtcbiAgaWYodHlwZW9mIGpzb24gIT09ICdvYmplY3QnKXtcbiAgICBjYWxsYmFjayhzcnNDb2RlKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1vZGlmaWVkSlNPTiA9IGRlcml2ZUNvbnN0YW50cyhqc29uKTtcbiAgdmFyIG91clByb2ogPSBQcm9qZWN0aW9uLnByb2plY3Rpb25zLmdldChtb2RpZmllZEpTT04ucHJvak5hbWUpO1xuICBpZihvdXJQcm9qKXtcbiAgICBleHRlbmQodGhpcywgbW9kaWZpZWRKU09OKTtcbiAgICBleHRlbmQodGhpcywgb3VyUHJvaik7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgY2FsbGJhY2sobnVsbCwgdGhpcyk7XG4gIH1lbHNle1xuICAgIGNhbGxiYWNrKHNyc0NvZGUpO1xuICB9XG59XG5Qcm9qZWN0aW9uLnByb2plY3Rpb25zID0gcHJvamVjdGlvbnM7XG5Qcm9qZWN0aW9uLnByb2plY3Rpb25zLnN0YXJ0KCk7XG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3Rpb247XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNycywgZGVub3JtLCBwb2ludCkge1xuICB2YXIgeGluID0gcG9pbnQueCxcbiAgICB5aW4gPSBwb2ludC55LFxuICAgIHppbiA9IHBvaW50LnogfHwgMC4wO1xuICB2YXIgdiwgdCwgaTtcbiAgZm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIGlmIChkZW5vcm0gJiYgaSA9PT0gMiAmJiBwb2ludC56ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgdiA9IHhpbjtcbiAgICAgIHQgPSAneCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKGkgPT09IDEpIHtcbiAgICAgIHYgPSB5aW47XG4gICAgICB0ID0gJ3knO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHYgPSB6aW47XG4gICAgICB0ID0gJ3onO1xuICAgIH1cbiAgICBzd2l0Y2ggKGNycy5heGlzW2ldKSB7XG4gICAgY2FzZSAnZSc6XG4gICAgICBwb2ludFt0XSA9IHY7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd3JzpcbiAgICAgIHBvaW50W3RdID0gLXY7XG4gICAgICBicmVhaztcbiAgICBjYXNlICduJzpcbiAgICAgIHBvaW50W3RdID0gdjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3MnOlxuICAgICAgcG9pbnRbdF0gPSAtdjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3UnOlxuICAgICAgaWYgKHBvaW50W3RdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcG9pbnQueiA9IHY7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkJzpcbiAgICAgIGlmIChwb2ludFt0XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBvaW50LnogPSAtdjtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICAvL2NvbnNvbGUubG9nKFwiRVJST1I6IHVua25vdyBheGlzIChcIitjcnMuYXhpc1tpXStcIikgLSBjaGVjayBkZWZpbml0aW9uIG9mIFwiK2Nycy5wcm9qTmFtZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBvaW50O1xufTtcbiIsInZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIHNpZ24gPSByZXF1aXJlKCcuL3NpZ24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoTWF0aC5hYnMoeCkgPCBIQUxGX1BJKSA/IHggOiAoeCAtIChzaWduKHgpICogTWF0aC5QSSkpO1xufTsiLCJ2YXIgVFdPX1BJID0gTWF0aC5QSSAqIDI7XG4vLyBTUEkgaXMgc2xpZ2h0bHkgZ3JlYXRlciB0aGFuIE1hdGguUEksIHNvIHZhbHVlcyB0aGF0IGV4Y2VlZCB0aGUgLTE4MC4uMTgwXG4vLyBkZWdyZWUgcmFuZ2UgYnkgYSB0aW55IGFtb3VudCBkb24ndCBnZXQgd3JhcHBlZC4gVGhpcyBwcmV2ZW50cyBwb2ludHMgdGhhdFxuLy8gaGF2ZSBkcmlmdGVkIGZyb20gdGhlaXIgb3JpZ2luYWwgbG9jYXRpb24gYWxvbmcgdGhlIDE4MHRoIG1lcmlkaWFuIChkdWUgdG9cbi8vIGZsb2F0aW5nIHBvaW50IGVycm9yKSBmcm9tIGNoYW5naW5nIHRoZWlyIHNpZ24uXG52YXIgU1BJID0gMy4xNDE1OTI2NTM1OTtcbnZhciBzaWduID0gcmVxdWlyZSgnLi9zaWduJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gKE1hdGguYWJzKHgpIDw9IFNQSSkgPyB4IDogKHggLSAoc2lnbih4KSAqIFRXT19QSSkpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgaWYgKE1hdGguYWJzKHgpID4gMSkge1xuICAgIHggPSAoeCA+IDEpID8gMSA6IC0xO1xuICB9XG4gIHJldHVybiBNYXRoLmFzaW4oeCk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gKDEgLSAwLjI1ICogeCAqICgxICsgeCAvIDE2ICogKDMgKyAxLjI1ICogeCkpKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoMC4zNzUgKiB4ICogKDEgKyAwLjI1ICogeCAqICgxICsgMC40Njg3NSAqIHgpKSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gKDAuMDU4NTkzNzUgKiB4ICogeCAqICgxICsgMC43NSAqIHgpKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoeCAqIHggKiB4ICogKDM1IC8gMzA3MikpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGEsIGUsIHNpbnBoaSkge1xuICB2YXIgdGVtcCA9IGUgKiBzaW5waGk7XG4gIHJldHVybiBhIC8gTWF0aC5zcXJ0KDEgLSB0ZW1wICogdGVtcCk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obWwsIGUwLCBlMSwgZTIsIGUzKSB7XG4gIHZhciBwaGk7XG4gIHZhciBkcGhpO1xuXG4gIHBoaSA9IG1sIC8gZTA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMTU7IGkrKykge1xuICAgIGRwaGkgPSAobWwgLSAoZTAgKiBwaGkgLSBlMSAqIE1hdGguc2luKDIgKiBwaGkpICsgZTIgKiBNYXRoLnNpbig0ICogcGhpKSAtIGUzICogTWF0aC5zaW4oNiAqIHBoaSkpKSAvIChlMCAtIDIgKiBlMSAqIE1hdGguY29zKDIgKiBwaGkpICsgNCAqIGUyICogTWF0aC5jb3MoNCAqIHBoaSkgLSA2ICogZTMgKiBNYXRoLmNvcyg2ICogcGhpKSk7XG4gICAgcGhpICs9IGRwaGk7XG4gICAgaWYgKE1hdGguYWJzKGRwaGkpIDw9IDAuMDAwMDAwMDAwMSkge1xuICAgICAgcmV0dXJuIHBoaTtcbiAgICB9XG4gIH1cblxuICAvLy4ucmVwb3J0RXJyb3IoXCJJTUxGTi1DT05WOkxhdGl0dWRlIGZhaWxlZCB0byBjb252ZXJnZSBhZnRlciAxNSBpdGVyYXRpb25zXCIpO1xuICByZXR1cm4gTmFOO1xufTsiLCJ2YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlY2NlbnQsIHEpIHtcbiAgdmFyIHRlbXAgPSAxIC0gKDEgLSBlY2NlbnQgKiBlY2NlbnQpIC8gKDIgKiBlY2NlbnQpICogTWF0aC5sb2coKDEgLSBlY2NlbnQpIC8gKDEgKyBlY2NlbnQpKTtcbiAgaWYgKE1hdGguYWJzKE1hdGguYWJzKHEpIC0gdGVtcCkgPCAxLjBFLTYpIHtcbiAgICBpZiAocSA8IDApIHtcbiAgICAgIHJldHVybiAoLTEgKiBIQUxGX1BJKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gSEFMRl9QSTtcbiAgICB9XG4gIH1cbiAgLy92YXIgcGhpID0gMC41KiBxLygxLWVjY2VudCplY2NlbnQpO1xuICB2YXIgcGhpID0gTWF0aC5hc2luKDAuNSAqIHEpO1xuICB2YXIgZHBoaTtcbiAgdmFyIHNpbl9waGk7XG4gIHZhciBjb3NfcGhpO1xuICB2YXIgY29uO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDMwOyBpKyspIHtcbiAgICBzaW5fcGhpID0gTWF0aC5zaW4ocGhpKTtcbiAgICBjb3NfcGhpID0gTWF0aC5jb3MocGhpKTtcbiAgICBjb24gPSBlY2NlbnQgKiBzaW5fcGhpO1xuICAgIGRwaGkgPSBNYXRoLnBvdygxIC0gY29uICogY29uLCAyKSAvICgyICogY29zX3BoaSkgKiAocSAvICgxIC0gZWNjZW50ICogZWNjZW50KSAtIHNpbl9waGkgLyAoMSAtIGNvbiAqIGNvbikgKyAwLjUgLyBlY2NlbnQgKiBNYXRoLmxvZygoMSAtIGNvbikgLyAoMSArIGNvbikpKTtcbiAgICBwaGkgKz0gZHBoaTtcbiAgICBpZiAoTWF0aC5hYnMoZHBoaSkgPD0gMC4wMDAwMDAwMDAxKSB7XG4gICAgICByZXR1cm4gcGhpO1xuICAgIH1cbiAgfVxuXG4gIC8vY29uc29sZS5sb2coXCJJUVNGTi1DT05WOkxhdGl0dWRlIGZhaWxlZCB0byBjb252ZXJnZSBhZnRlciAzMCBpdGVyYXRpb25zXCIpO1xuICByZXR1cm4gTmFOO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGUwLCBlMSwgZTIsIGUzLCBwaGkpIHtcbiAgcmV0dXJuIChlMCAqIHBoaSAtIGUxICogTWF0aC5zaW4oMiAqIHBoaSkgKyBlMiAqIE1hdGguc2luKDQgKiBwaGkpIC0gZTMgKiBNYXRoLnNpbig2ICogcGhpKSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWNjZW50LCBzaW5waGksIGNvc3BoaSkge1xuICB2YXIgY29uID0gZWNjZW50ICogc2lucGhpO1xuICByZXR1cm4gY29zcGhpIC8gKE1hdGguc3FydCgxIC0gY29uICogY29uKSk7XG59OyIsInZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlY2NlbnQsIHRzKSB7XG4gIHZhciBlY2NudGggPSAwLjUgKiBlY2NlbnQ7XG4gIHZhciBjb24sIGRwaGk7XG4gIHZhciBwaGkgPSBIQUxGX1BJIC0gMiAqIE1hdGguYXRhbih0cyk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDw9IDE1OyBpKyspIHtcbiAgICBjb24gPSBlY2NlbnQgKiBNYXRoLnNpbihwaGkpO1xuICAgIGRwaGkgPSBIQUxGX1BJIC0gMiAqIE1hdGguYXRhbih0cyAqIChNYXRoLnBvdygoKDEgLSBjb24pIC8gKDEgKyBjb24pKSwgZWNjbnRoKSkpIC0gcGhpO1xuICAgIHBoaSArPSBkcGhpO1xuICAgIGlmIChNYXRoLmFicyhkcGhpKSA8PSAwLjAwMDAwMDAwMDEpIHtcbiAgICAgIHJldHVybiBwaGk7XG4gICAgfVxuICB9XG4gIC8vY29uc29sZS5sb2coXCJwaGkyeiBoYXMgTm9Db252ZXJnZW5jZVwiKTtcbiAgcmV0dXJuIC05OTk5O1xufTsiLCJ2YXIgQzAwID0gMTtcbnZhciBDMDIgPSAwLjI1O1xudmFyIEMwNCA9IDAuMDQ2ODc1O1xudmFyIEMwNiA9IDAuMDE5NTMxMjU7XG52YXIgQzA4ID0gMC4wMTA2ODExNTIzNDM3NTtcbnZhciBDMjIgPSAwLjc1O1xudmFyIEM0NCA9IDAuNDY4NzU7XG52YXIgQzQ2ID0gMC4wMTMwMjA4MzMzMzMzMzMzMzMzMztcbnZhciBDNDggPSAwLjAwNzEyMDc2ODIyOTE2NjY2NjY2O1xudmFyIEM2NiA9IDAuMzY0NTgzMzMzMzMzMzMzMzMzMzM7XG52YXIgQzY4ID0gMC4wMDU2OTY2MTQ1ODMzMzMzMzMzMztcbnZhciBDODggPSAwLjMwNzYxNzE4NzU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXMpIHtcbiAgdmFyIGVuID0gW107XG4gIGVuWzBdID0gQzAwIC0gZXMgKiAoQzAyICsgZXMgKiAoQzA0ICsgZXMgKiAoQzA2ICsgZXMgKiBDMDgpKSk7XG4gIGVuWzFdID0gZXMgKiAoQzIyIC0gZXMgKiAoQzA0ICsgZXMgKiAoQzA2ICsgZXMgKiBDMDgpKSk7XG4gIHZhciB0ID0gZXMgKiBlcztcbiAgZW5bMl0gPSB0ICogKEM0NCAtIGVzICogKEM0NiArIGVzICogQzQ4KSk7XG4gIHQgKj0gZXM7XG4gIGVuWzNdID0gdCAqIChDNjYgLSBlcyAqIEM2OCk7XG4gIGVuWzRdID0gdCAqIGVzICogQzg4O1xuICByZXR1cm4gZW47XG59OyIsInZhciBwal9tbGZuID0gcmVxdWlyZShcIi4vcGpfbWxmblwiKTtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgTUFYX0lURVIgPSAyMDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJnLCBlcywgZW4pIHtcbiAgdmFyIGsgPSAxIC8gKDEgLSBlcyk7XG4gIHZhciBwaGkgPSBhcmc7XG4gIGZvciAodmFyIGkgPSBNQVhfSVRFUjsgaTsgLS1pKSB7IC8qIHJhcmVseSBnb2VzIG92ZXIgMiBpdGVyYXRpb25zICovXG4gICAgdmFyIHMgPSBNYXRoLnNpbihwaGkpO1xuICAgIHZhciB0ID0gMSAtIGVzICogcyAqIHM7XG4gICAgLy90ID0gdGhpcy5wal9tbGZuKHBoaSwgcywgTWF0aC5jb3MocGhpKSwgZW4pIC0gYXJnO1xuICAgIC8vcGhpIC09IHQgKiAodCAqIE1hdGguc3FydCh0KSkgKiBrO1xuICAgIHQgPSAocGpfbWxmbihwaGksIHMsIE1hdGguY29zKHBoaSksIGVuKSAtIGFyZykgKiAodCAqIE1hdGguc3FydCh0KSkgKiBrO1xuICAgIHBoaSAtPSB0O1xuICAgIGlmIChNYXRoLmFicyh0KSA8IEVQU0xOKSB7XG4gICAgICByZXR1cm4gcGhpO1xuICAgIH1cbiAgfVxuICAvLy4ucmVwb3J0RXJyb3IoXCJjYXNzOnBqX2ludl9tbGZuOiBDb252ZXJnZW5jZSBlcnJvclwiKTtcbiAgcmV0dXJuIHBoaTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwaGksIHNwaGksIGNwaGksIGVuKSB7XG4gIGNwaGkgKj0gc3BoaTtcbiAgc3BoaSAqPSBzcGhpO1xuICByZXR1cm4gKGVuWzBdICogcGhpIC0gY3BoaSAqIChlblsxXSArIHNwaGkgKiAoZW5bMl0gKyBzcGhpICogKGVuWzNdICsgc3BoaSAqIGVuWzRdKSkpKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlY2NlbnQsIHNpbnBoaSkge1xuICB2YXIgY29uO1xuICBpZiAoZWNjZW50ID4gMS4wZS03KSB7XG4gICAgY29uID0gZWNjZW50ICogc2lucGhpO1xuICAgIHJldHVybiAoKDEgLSBlY2NlbnQgKiBlY2NlbnQpICogKHNpbnBoaSAvICgxIC0gY29uICogY29uKSAtICgwLjUgLyBlY2NlbnQpICogTWF0aC5sb2coKDEgLSBjb24pIC8gKDEgKyBjb24pKSkpO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiAoMiAqIHNpbnBoaSk7XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiB4PDAgPyAtMSA6IDE7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXNpbnAsIGV4cCkge1xuICByZXR1cm4gKE1hdGgucG93KCgxIC0gZXNpbnApIC8gKDEgKyBlc2lucCksIGV4cCkpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcnJheSl7XG4gIHZhciBvdXQgPSB7XG4gICAgeDogYXJyYXlbMF0sXG4gICAgeTogYXJyYXlbMV1cbiAgfTtcbiAgaWYgKGFycmF5Lmxlbmd0aD4yKSB7XG4gICAgb3V0LnogPSBhcnJheVsyXTtcbiAgfVxuICBpZiAoYXJyYXkubGVuZ3RoPjMpIHtcbiAgICBvdXQubSA9IGFycmF5WzNdO1xuICB9XG4gIHJldHVybiBvdXQ7XG59OyIsInZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVjY2VudCwgcGhpLCBzaW5waGkpIHtcbiAgdmFyIGNvbiA9IGVjY2VudCAqIHNpbnBoaTtcbiAgdmFyIGNvbSA9IDAuNSAqIGVjY2VudDtcbiAgY29uID0gTWF0aC5wb3coKCgxIC0gY29uKSAvICgxICsgY29uKSksIGNvbSk7XG4gIHJldHVybiAoTWF0aC50YW4oMC41ICogKEhBTEZfUEkgLSBwaGkpKSAvIGNvbik7XG59OyIsImV4cG9ydHMud2dzODQgPSB7XG4gIHRvd2dzODQ6IFwiMCwwLDBcIixcbiAgZWxsaXBzZTogXCJXR1M4NFwiLFxuICBkYXR1bU5hbWU6IFwiV0dTODRcIlxufTtcbmV4cG9ydHMuY2gxOTAzID0ge1xuICB0b3dnczg0OiBcIjY3NC4zNzQsMTUuMDU2LDQwNS4zNDZcIixcbiAgZWxsaXBzZTogXCJiZXNzZWxcIixcbiAgZGF0dW1OYW1lOiBcInN3aXNzXCJcbn07XG5leHBvcnRzLmdncnM4NyA9IHtcbiAgdG93Z3M4NDogXCItMTk5Ljg3LDc0Ljc5LDI0Ni42MlwiLFxuICBlbGxpcHNlOiBcIkdSUzgwXCIsXG4gIGRhdHVtTmFtZTogXCJHcmVla19HZW9kZXRpY19SZWZlcmVuY2VfU3lzdGVtXzE5ODdcIlxufTtcbmV4cG9ydHMubmFkODMgPSB7XG4gIHRvd2dzODQ6IFwiMCwwLDBcIixcbiAgZWxsaXBzZTogXCJHUlM4MFwiLFxuICBkYXR1bU5hbWU6IFwiTm9ydGhfQW1lcmljYW5fRGF0dW1fMTk4M1wiXG59O1xuZXhwb3J0cy5uYWQyNyA9IHtcbiAgbmFkZ3JpZHM6IFwiQGNvbnVzLEBhbGFza2EsQG50djJfMC5nc2IsQG50djFfY2FuLmRhdFwiLFxuICBlbGxpcHNlOiBcImNscms2NlwiLFxuICBkYXR1bU5hbWU6IFwiTm9ydGhfQW1lcmljYW5fRGF0dW1fMTkyN1wiXG59O1xuZXhwb3J0cy5wb3RzZGFtID0ge1xuICB0b3dnczg0OiBcIjYwNi4wLDIzLjAsNDEzLjBcIixcbiAgZWxsaXBzZTogXCJiZXNzZWxcIixcbiAgZGF0dW1OYW1lOiBcIlBvdHNkYW0gUmF1ZW5iZXJnIDE5NTAgREhETlwiXG59O1xuZXhwb3J0cy5jYXJ0aGFnZSA9IHtcbiAgdG93Z3M4NDogXCItMjYzLjAsNi4wLDQzMS4wXCIsXG4gIGVsbGlwc2U6IFwiY2xhcms4MFwiLFxuICBkYXR1bU5hbWU6IFwiQ2FydGhhZ2UgMTkzNCBUdW5pc2lhXCJcbn07XG5leHBvcnRzLmhlcm1hbm5za29nZWwgPSB7XG4gIHRvd2dzODQ6IFwiNjUzLjAsLTIxMi4wLDQ0OS4wXCIsXG4gIGVsbGlwc2U6IFwiYmVzc2VsXCIsXG4gIGRhdHVtTmFtZTogXCJIZXJtYW5uc2tvZ2VsXCJcbn07XG5leHBvcnRzLmlyZTY1ID0ge1xuICB0b3dnczg0OiBcIjQ4Mi41MzAsLTEzMC41OTYsNTY0LjU1NywtMS4wNDIsLTAuMjE0LC0wLjYzMSw4LjE1XCIsXG4gIGVsbGlwc2U6IFwibW9kX2FpcnlcIixcbiAgZGF0dW1OYW1lOiBcIklyZWxhbmQgMTk2NVwiXG59O1xuZXhwb3J0cy5yYXNzYWRpcmFuID0ge1xuICB0b3dnczg0OiBcIi0xMzMuNjMsLTE1Ny41LC0xNTguNjJcIixcbiAgZWxsaXBzZTogXCJpbnRsXCIsXG4gIGRhdHVtTmFtZTogXCJSYXNzYWRpcmFuXCJcbn07XG5leHBvcnRzLm56Z2Q0OSA9IHtcbiAgdG93Z3M4NDogXCI1OS40NywtNS4wNCwxODcuNDQsMC40NywtMC4xLDEuMDI0LC00LjU5OTNcIixcbiAgZWxsaXBzZTogXCJpbnRsXCIsXG4gIGRhdHVtTmFtZTogXCJOZXcgWmVhbGFuZCBHZW9kZXRpYyBEYXR1bSAxOTQ5XCJcbn07XG5leHBvcnRzLm9zZ2IzNiA9IHtcbiAgdG93Z3M4NDogXCI0NDYuNDQ4LC0xMjUuMTU3LDU0Mi4wNjAsMC4xNTAyLDAuMjQ3MCwwLjg0MjEsLTIwLjQ4OTRcIixcbiAgZWxsaXBzZTogXCJhaXJ5XCIsXG4gIGRhdHVtTmFtZTogXCJBaXJ5IDE4MzBcIlxufTtcbmV4cG9ydHMuc19qdHNrID0ge1xuICB0b3dnczg0OiBcIjU4OSw3Niw0ODBcIixcbiAgZWxsaXBzZTogJ2Jlc3NlbCcsXG4gIGRhdHVtTmFtZTogJ1MtSlRTSyAoRmVycm8pJ1xufTtcbmV4cG9ydHMuYmVkdWFyYW0gPSB7XG4gIHRvd2dzODQ6ICctMTA2LC04NywxODgnLFxuICBlbGxpcHNlOiAnY2xyazgwJyxcbiAgZGF0dW1OYW1lOiAnQmVkdWFyYW0nXG59O1xuZXhwb3J0cy5ndW51bmdfc2VnYXJhID0ge1xuICB0b3dnczg0OiAnLTQwMyw2ODQsNDEnLFxuICBlbGxpcHNlOiAnYmVzc2VsJyxcbiAgZGF0dW1OYW1lOiAnR3VudW5nIFNlZ2FyYSBKYWthcnRhJ1xufTtcbmV4cG9ydHMucm5iNzIgPSB7XG4gIHRvd2dzODQ6IFwiMTA2Ljg2OSwtNTIuMjk3OCwxMDMuNzI0LC0wLjMzNjU3LDAuNDU2OTU1LC0xLjg0MjE4LDFcIixcbiAgZWxsaXBzZTogXCJpbnRsXCIsXG4gIGRhdHVtTmFtZTogXCJSZXNlYXUgTmF0aW9uYWwgQmVsZ2UgMTk3MlwiXG59OyIsImV4cG9ydHMuTUVSSVQgPSB7XG4gIGE6IDYzNzgxMzcuMCxcbiAgcmY6IDI5OC4yNTcsXG4gIGVsbGlwc2VOYW1lOiBcIk1FUklUIDE5ODNcIlxufTtcbmV4cG9ydHMuU0dTODUgPSB7XG4gIGE6IDYzNzgxMzYuMCxcbiAgcmY6IDI5OC4yNTcsXG4gIGVsbGlwc2VOYW1lOiBcIlNvdmlldCBHZW9kZXRpYyBTeXN0ZW0gODVcIlxufTtcbmV4cG9ydHMuR1JTODAgPSB7XG4gIGE6IDYzNzgxMzcuMCxcbiAgcmY6IDI5OC4yNTcyMjIxMDEsXG4gIGVsbGlwc2VOYW1lOiBcIkdSUyAxOTgwKElVR0csIDE5ODApXCJcbn07XG5leHBvcnRzLklBVTc2ID0ge1xuICBhOiA2Mzc4MTQwLjAsXG4gIHJmOiAyOTguMjU3LFxuICBlbGxpcHNlTmFtZTogXCJJQVUgMTk3NlwiXG59O1xuZXhwb3J0cy5haXJ5ID0ge1xuICBhOiA2Mzc3NTYzLjM5NixcbiAgYjogNjM1NjI1Ni45MTAsXG4gIGVsbGlwc2VOYW1lOiBcIkFpcnkgMTgzMFwiXG59O1xuZXhwb3J0cy5BUEw0ID0ge1xuICBhOiA2Mzc4MTM3LFxuICByZjogMjk4LjI1LFxuICBlbGxpcHNlTmFtZTogXCJBcHBsLiBQaHlzaWNzLiAxOTY1XCJcbn07XG5leHBvcnRzLk5XTDlEID0ge1xuICBhOiA2Mzc4MTQ1LjAsXG4gIHJmOiAyOTguMjUsXG4gIGVsbGlwc2VOYW1lOiBcIk5hdmFsIFdlYXBvbnMgTGFiLiwgMTk2NVwiXG59O1xuZXhwb3J0cy5tb2RfYWlyeSA9IHtcbiAgYTogNjM3NzM0MC4xODksXG4gIGI6IDYzNTYwMzQuNDQ2LFxuICBlbGxpcHNlTmFtZTogXCJNb2RpZmllZCBBaXJ5XCJcbn07XG5leHBvcnRzLmFuZHJhZSA9IHtcbiAgYTogNjM3NzEwNC40MyxcbiAgcmY6IDMwMC4wLFxuICBlbGxpcHNlTmFtZTogXCJBbmRyYWUgMTg3NiAoRGVuLiwgSWNsbmQuKVwiXG59O1xuZXhwb3J0cy5hdXN0X1NBID0ge1xuICBhOiA2Mzc4MTYwLjAsXG4gIHJmOiAyOTguMjUsXG4gIGVsbGlwc2VOYW1lOiBcIkF1c3RyYWxpYW4gTmF0bCAmIFMuIEFtZXIuIDE5NjlcIlxufTtcbmV4cG9ydHMuR1JTNjcgPSB7XG4gIGE6IDYzNzgxNjAuMCxcbiAgcmY6IDI5OC4yNDcxNjc0MjcwLFxuICBlbGxpcHNlTmFtZTogXCJHUlMgNjcoSVVHRyAxOTY3KVwiXG59O1xuZXhwb3J0cy5iZXNzZWwgPSB7XG4gIGE6IDYzNzczOTcuMTU1LFxuICByZjogMjk5LjE1MjgxMjgsXG4gIGVsbGlwc2VOYW1lOiBcIkJlc3NlbCAxODQxXCJcbn07XG5leHBvcnRzLmJlc3NfbmFtID0ge1xuICBhOiA2Mzc3NDgzLjg2NSxcbiAgcmY6IDI5OS4xNTI4MTI4LFxuICBlbGxpcHNlTmFtZTogXCJCZXNzZWwgMTg0MSAoTmFtaWJpYSlcIlxufTtcbmV4cG9ydHMuY2xyazY2ID0ge1xuICBhOiA2Mzc4MjA2LjQsXG4gIGI6IDYzNTY1ODMuOCxcbiAgZWxsaXBzZU5hbWU6IFwiQ2xhcmtlIDE4NjZcIlxufTtcbmV4cG9ydHMuY2xyazgwID0ge1xuICBhOiA2Mzc4MjQ5LjE0NSxcbiAgcmY6IDI5My40NjYzLFxuICBlbGxpcHNlTmFtZTogXCJDbGFya2UgMTg4MCBtb2QuXCJcbn07XG5leHBvcnRzLmNscms1OCA9IHtcbiAgYTogNjM3ODI5My42NDUyMDg3NTksXG4gIHJmOiAyOTQuMjYwNjc2MzY5MjY1NCxcbiAgZWxsaXBzZU5hbWU6IFwiQ2xhcmtlIDE4NThcIlxufTtcbmV4cG9ydHMuQ1BNID0ge1xuICBhOiA2Mzc1NzM4LjcsXG4gIHJmOiAzMzQuMjksXG4gIGVsbGlwc2VOYW1lOiBcIkNvbW0uIGRlcyBQb2lkcyBldCBNZXN1cmVzIDE3OTlcIlxufTtcbmV4cG9ydHMuZGVsbWJyID0ge1xuICBhOiA2Mzc2NDI4LjAsXG4gIHJmOiAzMTEuNSxcbiAgZWxsaXBzZU5hbWU6IFwiRGVsYW1icmUgMTgxMCAoQmVsZ2l1bSlcIlxufTtcbmV4cG9ydHMuZW5nZWxpcyA9IHtcbiAgYTogNjM3ODEzNi4wNSxcbiAgcmY6IDI5OC4yNTY2LFxuICBlbGxpcHNlTmFtZTogXCJFbmdlbGlzIDE5ODVcIlxufTtcbmV4cG9ydHMuZXZyc3QzMCA9IHtcbiAgYTogNjM3NzI3Ni4zNDUsXG4gIHJmOiAzMDAuODAxNyxcbiAgZWxsaXBzZU5hbWU6IFwiRXZlcmVzdCAxODMwXCJcbn07XG5leHBvcnRzLmV2cnN0NDggPSB7XG4gIGE6IDYzNzczMDQuMDYzLFxuICByZjogMzAwLjgwMTcsXG4gIGVsbGlwc2VOYW1lOiBcIkV2ZXJlc3QgMTk0OFwiXG59O1xuZXhwb3J0cy5ldnJzdDU2ID0ge1xuICBhOiA2Mzc3MzAxLjI0MyxcbiAgcmY6IDMwMC44MDE3LFxuICBlbGxpcHNlTmFtZTogXCJFdmVyZXN0IDE5NTZcIlxufTtcbmV4cG9ydHMuZXZyc3Q2OSA9IHtcbiAgYTogNjM3NzI5NS42NjQsXG4gIHJmOiAzMDAuODAxNyxcbiAgZWxsaXBzZU5hbWU6IFwiRXZlcmVzdCAxOTY5XCJcbn07XG5leHBvcnRzLmV2cnN0U1MgPSB7XG4gIGE6IDYzNzcyOTguNTU2LFxuICByZjogMzAwLjgwMTcsXG4gIGVsbGlwc2VOYW1lOiBcIkV2ZXJlc3QgKFNhYmFoICYgU2FyYXdhaylcIlxufTtcbmV4cG9ydHMuZnNjaHI2MCA9IHtcbiAgYTogNjM3ODE2Ni4wLFxuICByZjogMjk4LjMsXG4gIGVsbGlwc2VOYW1lOiBcIkZpc2NoZXIgKE1lcmN1cnkgRGF0dW0pIDE5NjBcIlxufTtcbmV4cG9ydHMuZnNjaHI2MG0gPSB7XG4gIGE6IDYzNzgxNTUuMCxcbiAgcmY6IDI5OC4zLFxuICBlbGxpcHNlTmFtZTogXCJGaXNjaGVyIDE5NjBcIlxufTtcbmV4cG9ydHMuZnNjaHI2OCA9IHtcbiAgYTogNjM3ODE1MC4wLFxuICByZjogMjk4LjMsXG4gIGVsbGlwc2VOYW1lOiBcIkZpc2NoZXIgMTk2OFwiXG59O1xuZXhwb3J0cy5oZWxtZXJ0ID0ge1xuICBhOiA2Mzc4MjAwLjAsXG4gIHJmOiAyOTguMyxcbiAgZWxsaXBzZU5hbWU6IFwiSGVsbWVydCAxOTA2XCJcbn07XG5leHBvcnRzLmhvdWdoID0ge1xuICBhOiA2Mzc4MjcwLjAsXG4gIHJmOiAyOTcuMCxcbiAgZWxsaXBzZU5hbWU6IFwiSG91Z2hcIlxufTtcbmV4cG9ydHMuaW50bCA9IHtcbiAgYTogNjM3ODM4OC4wLFxuICByZjogMjk3LjAsXG4gIGVsbGlwc2VOYW1lOiBcIkludGVybmF0aW9uYWwgMTkwOSAoSGF5Zm9yZClcIlxufTtcbmV4cG9ydHMua2F1bGEgPSB7XG4gIGE6IDYzNzgxNjMuMCxcbiAgcmY6IDI5OC4yNCxcbiAgZWxsaXBzZU5hbWU6IFwiS2F1bGEgMTk2MVwiXG59O1xuZXhwb3J0cy5sZXJjaCA9IHtcbiAgYTogNjM3ODEzOS4wLFxuICByZjogMjk4LjI1NyxcbiAgZWxsaXBzZU5hbWU6IFwiTGVyY2ggMTk3OVwiXG59O1xuZXhwb3J0cy5tcHJ0cyA9IHtcbiAgYTogNjM5NzMwMC4wLFxuICByZjogMTkxLjAsXG4gIGVsbGlwc2VOYW1lOiBcIk1hdXBlcnRpdXMgMTczOFwiXG59O1xuZXhwb3J0cy5uZXdfaW50bCA9IHtcbiAgYTogNjM3ODE1Ny41LFxuICBiOiA2MzU2NzcyLjIsXG4gIGVsbGlwc2VOYW1lOiBcIk5ldyBJbnRlcm5hdGlvbmFsIDE5NjdcIlxufTtcbmV4cG9ydHMucGxlc3NpcyA9IHtcbiAgYTogNjM3NjUyMy4wLFxuICByZjogNjM1NTg2My4wLFxuICBlbGxpcHNlTmFtZTogXCJQbGVzc2lzIDE4MTcgKEZyYW5jZSlcIlxufTtcbmV4cG9ydHMua3Jhc3MgPSB7XG4gIGE6IDYzNzgyNDUuMCxcbiAgcmY6IDI5OC4zLFxuICBlbGxpcHNlTmFtZTogXCJLcmFzc292c2t5LCAxOTQyXCJcbn07XG5leHBvcnRzLlNFYXNpYSA9IHtcbiAgYTogNjM3ODE1NS4wLFxuICBiOiA2MzU2NzczLjMyMDUsXG4gIGVsbGlwc2VOYW1lOiBcIlNvdXRoZWFzdCBBc2lhXCJcbn07XG5leHBvcnRzLndhbGJlY2sgPSB7XG4gIGE6IDYzNzY4OTYuMCxcbiAgYjogNjM1NTgzNC44NDY3LFxuICBlbGxpcHNlTmFtZTogXCJXYWxiZWNrXCJcbn07XG5leHBvcnRzLldHUzYwID0ge1xuICBhOiA2Mzc4MTY1LjAsXG4gIHJmOiAyOTguMyxcbiAgZWxsaXBzZU5hbWU6IFwiV0dTIDYwXCJcbn07XG5leHBvcnRzLldHUzY2ID0ge1xuICBhOiA2Mzc4MTQ1LjAsXG4gIHJmOiAyOTguMjUsXG4gIGVsbGlwc2VOYW1lOiBcIldHUyA2NlwiXG59O1xuZXhwb3J0cy5XR1M3ID0ge1xuICBhOiA2Mzc4MTM1LjAsXG4gIHJmOiAyOTguMjYsXG4gIGVsbGlwc2VOYW1lOiBcIldHUyA3MlwiXG59O1xuZXhwb3J0cy5XR1M4NCA9IHtcbiAgYTogNjM3ODEzNy4wLFxuICByZjogMjk4LjI1NzIyMzU2MyxcbiAgZWxsaXBzZU5hbWU6IFwiV0dTIDg0XCJcbn07XG5leHBvcnRzLnNwaGVyZSA9IHtcbiAgYTogNjM3MDk5Ny4wLFxuICBiOiA2MzcwOTk3LjAsXG4gIGVsbGlwc2VOYW1lOiBcIk5vcm1hbCBTcGhlcmUgKHI9NjM3MDk5NylcIlxufTsiLCJleHBvcnRzLmdyZWVud2ljaCA9IDAuMDsgLy9cIjBkRVwiLFxuZXhwb3J0cy5saXNib24gPSAtOS4xMzE5MDYxMTExMTE7IC8vXCI5ZDA3JzU0Ljg2MlxcXCJXXCIsXG5leHBvcnRzLnBhcmlzID0gMi4zMzcyMjkxNjY2Njc7IC8vXCIyZDIwJzE0LjAyNVxcXCJFXCIsXG5leHBvcnRzLmJvZ290YSA9IC03NC4wODA5MTY2NjY2Njc7IC8vXCI3NGQwNCc1MS4zXFxcIldcIixcbmV4cG9ydHMubWFkcmlkID0gLTMuNjg3OTM4ODg4ODg5OyAvL1wiM2Q0MScxNi41OFxcXCJXXCIsXG5leHBvcnRzLnJvbWUgPSAxMi40NTIzMzMzMzMzMzM7IC8vXCIxMmQyNyc4LjRcXFwiRVwiLFxuZXhwb3J0cy5iZXJuID0gNy40Mzk1ODMzMzMzMzM7IC8vXCI3ZDI2JzIyLjVcXFwiRVwiLFxuZXhwb3J0cy5qYWthcnRhID0gMTA2LjgwNzcxOTQ0NDQ0NDsgLy9cIjEwNmQ0OCcyNy43OVxcXCJFXCIsXG5leHBvcnRzLmZlcnJvID0gLTE3LjY2NjY2NjY2NjY2NzsgLy9cIjE3ZDQwJ1dcIixcbmV4cG9ydHMuYnJ1c3NlbHMgPSA0LjM2Nzk3NTsgLy9cIjRkMjInNC43MVxcXCJFXCIsXG5leHBvcnRzLnN0b2NraG9sbSA9IDE4LjA1ODI3Nzc3Nzc3ODsgLy9cIjE4ZDMnMjkuOFxcXCJFXCIsXG5leHBvcnRzLmF0aGVucyA9IDIzLjcxNjMzNzU7IC8vXCIyM2Q0Mic1OC44MTVcXFwiRVwiLFxuZXhwb3J0cy5vc2xvID0gMTAuNzIyOTE2NjY2NjY3OyAvL1wiMTBkNDMnMjIuNVxcXCJFXCIiLCJleHBvcnRzLmZ0ID0ge3RvX21ldGVyOiAwLjMwNDh9O1xuZXhwb3J0c1sndXMtZnQnXSA9IHt0b19tZXRlcjogMTIwMCAvIDM5Mzd9O1xuIiwidmFyIHByb2ogPSByZXF1aXJlKCcuL1Byb2onKTtcbnZhciB0cmFuc2Zvcm0gPSByZXF1aXJlKCcuL3RyYW5zZm9ybScpO1xudmFyIHdnczg0ID0gcHJvaignV0dTODQnKTtcblxuZnVuY3Rpb24gdHJhbnNmb3JtZXIoZnJvbSwgdG8sIGNvb3Jkcykge1xuICB2YXIgdHJhbnNmb3JtZWRBcnJheTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoY29vcmRzKSkge1xuICAgIHRyYW5zZm9ybWVkQXJyYXkgPSB0cmFuc2Zvcm0oZnJvbSwgdG8sIGNvb3Jkcyk7XG4gICAgaWYgKGNvb3Jkcy5sZW5ndGggPT09IDMpIHtcbiAgICAgIHJldHVybiBbdHJhbnNmb3JtZWRBcnJheS54LCB0cmFuc2Zvcm1lZEFycmF5LnksIHRyYW5zZm9ybWVkQXJyYXkuel07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIFt0cmFuc2Zvcm1lZEFycmF5LngsIHRyYW5zZm9ybWVkQXJyYXkueV07XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiB0cmFuc2Zvcm0oZnJvbSwgdG8sIGNvb3Jkcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tQcm9qKGl0ZW0pIHtcbiAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBwcm9qKSB7XG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cbiAgaWYgKGl0ZW0ub1Byb2opIHtcbiAgICByZXR1cm4gaXRlbS5vUHJvajtcbiAgfVxuICByZXR1cm4gcHJvaihpdGVtKTtcbn1cbmZ1bmN0aW9uIHByb2o0KGZyb21Qcm9qLCB0b1Byb2osIGNvb3JkKSB7XG4gIGZyb21Qcm9qID0gY2hlY2tQcm9qKGZyb21Qcm9qKTtcbiAgdmFyIHNpbmdsZSA9IGZhbHNlO1xuICB2YXIgb2JqO1xuICBpZiAodHlwZW9mIHRvUHJvaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0b1Byb2ogPSBmcm9tUHJvajtcbiAgICBmcm9tUHJvaiA9IHdnczg0O1xuICAgIHNpbmdsZSA9IHRydWU7XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIHRvUHJvai54ICE9PSAndW5kZWZpbmVkJyB8fCBBcnJheS5pc0FycmF5KHRvUHJvaikpIHtcbiAgICBjb29yZCA9IHRvUHJvajtcbiAgICB0b1Byb2ogPSBmcm9tUHJvajtcbiAgICBmcm9tUHJvaiA9IHdnczg0O1xuICAgIHNpbmdsZSA9IHRydWU7XG4gIH1cbiAgdG9Qcm9qID0gY2hlY2tQcm9qKHRvUHJvaik7XG4gIGlmIChjb29yZCkge1xuICAgIHJldHVybiB0cmFuc2Zvcm1lcihmcm9tUHJvaiwgdG9Qcm9qLCBjb29yZCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgb2JqID0ge1xuICAgICAgZm9yd2FyZDogZnVuY3Rpb24oY29vcmRzKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1lcihmcm9tUHJvaiwgdG9Qcm9qLCBjb29yZHMpO1xuICAgICAgfSxcbiAgICAgIGludmVyc2U6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtZXIodG9Qcm9qLCBmcm9tUHJvaiwgY29vcmRzKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGlmIChzaW5nbGUpIHtcbiAgICAgIG9iai5vUHJvaiA9IHRvUHJvajtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBwcm9qNDsiLCJ2YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBQSkRfM1BBUkFNID0gMTtcbnZhciBQSkRfN1BBUkFNID0gMjtcbnZhciBQSkRfR1JJRFNISUZUID0gMztcbnZhciBQSkRfV0dTODQgPSA0OyAvLyBXR1M4NCBvciBlcXVpdmFsZW50XG52YXIgUEpEX05PREFUVU0gPSA1OyAvLyBXR1M4NCBvciBlcXVpdmFsZW50XG52YXIgU0VDX1RPX1JBRCA9IDQuODQ4MTM2ODExMDk1MzU5OTM1ODk5MTQxMDIzNTdlLTY7XG52YXIgQURfQyA9IDEuMDAyNjAwMDtcbnZhciBDT1NfNjdQNSA9IDAuMzgyNjgzNDMyMzY1MDg5Nzc7XG52YXIgZGF0dW0gPSBmdW5jdGlvbihwcm9qKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBkYXR1bSkpIHtcbiAgICByZXR1cm4gbmV3IGRhdHVtKHByb2opO1xuICB9XG4gIHRoaXMuZGF0dW1fdHlwZSA9IFBKRF9XR1M4NDsgLy9kZWZhdWx0IHNldHRpbmdcbiAgaWYgKCFwcm9qKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChwcm9qLmRhdHVtQ29kZSAmJiBwcm9qLmRhdHVtQ29kZSA9PT0gJ25vbmUnKSB7XG4gICAgdGhpcy5kYXR1bV90eXBlID0gUEpEX05PREFUVU07XG4gIH1cbiAgaWYgKHByb2ouZGF0dW1fcGFyYW1zKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9qLmRhdHVtX3BhcmFtcy5sZW5ndGg7IGkrKykge1xuICAgICAgcHJvai5kYXR1bV9wYXJhbXNbaV0gPSBwYXJzZUZsb2F0KHByb2ouZGF0dW1fcGFyYW1zW2ldKTtcbiAgICB9XG4gICAgaWYgKHByb2ouZGF0dW1fcGFyYW1zWzBdICE9PSAwIHx8IHByb2ouZGF0dW1fcGFyYW1zWzFdICE9PSAwIHx8IHByb2ouZGF0dW1fcGFyYW1zWzJdICE9PSAwKSB7XG4gICAgICB0aGlzLmRhdHVtX3R5cGUgPSBQSkRfM1BBUkFNO1xuICAgIH1cbiAgICBpZiAocHJvai5kYXR1bV9wYXJhbXMubGVuZ3RoID4gMykge1xuICAgICAgaWYgKHByb2ouZGF0dW1fcGFyYW1zWzNdICE9PSAwIHx8IHByb2ouZGF0dW1fcGFyYW1zWzRdICE9PSAwIHx8IHByb2ouZGF0dW1fcGFyYW1zWzVdICE9PSAwIHx8IHByb2ouZGF0dW1fcGFyYW1zWzZdICE9PSAwKSB7XG4gICAgICAgIHRoaXMuZGF0dW1fdHlwZSA9IFBKRF83UEFSQU07XG4gICAgICAgIHByb2ouZGF0dW1fcGFyYW1zWzNdICo9IFNFQ19UT19SQUQ7XG4gICAgICAgIHByb2ouZGF0dW1fcGFyYW1zWzRdICo9IFNFQ19UT19SQUQ7XG4gICAgICAgIHByb2ouZGF0dW1fcGFyYW1zWzVdICo9IFNFQ19UT19SQUQ7XG4gICAgICAgIHByb2ouZGF0dW1fcGFyYW1zWzZdID0gKHByb2ouZGF0dW1fcGFyYW1zWzZdIC8gMTAwMDAwMC4wKSArIDEuMDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gREdSIDIwMTEtMDMtMjEgOiBuYWRncmlkcyBzdXBwb3J0XG4gIHRoaXMuZGF0dW1fdHlwZSA9IHByb2ouZ3JpZHMgPyBQSkRfR1JJRFNISUZUIDogdGhpcy5kYXR1bV90eXBlO1xuXG4gIHRoaXMuYSA9IHByb2ouYTsgLy9kYXR1bSBvYmplY3QgYWxzbyB1c2VzIHRoZXNlIHZhbHVlc1xuICB0aGlzLmIgPSBwcm9qLmI7XG4gIHRoaXMuZXMgPSBwcm9qLmVzO1xuICB0aGlzLmVwMiA9IHByb2ouZXAyO1xuICB0aGlzLmRhdHVtX3BhcmFtcyA9IHByb2ouZGF0dW1fcGFyYW1zO1xuICBpZiAodGhpcy5kYXR1bV90eXBlID09PSBQSkRfR1JJRFNISUZUKSB7XG4gICAgdGhpcy5ncmlkcyA9IHByb2ouZ3JpZHM7XG4gIH1cbn07XG5kYXR1bS5wcm90b3R5cGUgPSB7XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgLy8gY3NfY29tcGFyZV9kYXR1bXMoKVxuICAvLyAgIFJldHVybnMgVFJVRSBpZiB0aGUgdHdvIGRhdHVtcyBtYXRjaCwgb3RoZXJ3aXNlIEZBTFNFLlxuICBjb21wYXJlX2RhdHVtczogZnVuY3Rpb24oZGVzdCkge1xuICAgIGlmICh0aGlzLmRhdHVtX3R5cGUgIT09IGRlc3QuZGF0dW1fdHlwZSkge1xuICAgICAgcmV0dXJuIGZhbHNlOyAvLyBmYWxzZSwgZGF0dW1zIGFyZSBub3QgZXF1YWxcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5hICE9PSBkZXN0LmEgfHwgTWF0aC5hYnModGhpcy5lcyAtIGRlc3QuZXMpID4gMC4wMDAwMDAwMDAwNTApIHtcbiAgICAgIC8vIHRoZSB0b2xlcmVuY2UgZm9yIGVzIGlzIHRvIGVuc3VyZSB0aGF0IEdSUzgwIGFuZCBXR1M4NFxuICAgICAgLy8gYXJlIGNvbnNpZGVyZWQgaWRlbnRpY2FsXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZGF0dW1fdHlwZSA9PT0gUEpEXzNQQVJBTSkge1xuICAgICAgcmV0dXJuICh0aGlzLmRhdHVtX3BhcmFtc1swXSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbMF0gJiYgdGhpcy5kYXR1bV9wYXJhbXNbMV0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzFdICYmIHRoaXMuZGF0dW1fcGFyYW1zWzJdID09PSBkZXN0LmRhdHVtX3BhcmFtc1syXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZGF0dW1fdHlwZSA9PT0gUEpEXzdQQVJBTSkge1xuICAgICAgcmV0dXJuICh0aGlzLmRhdHVtX3BhcmFtc1swXSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbMF0gJiYgdGhpcy5kYXR1bV9wYXJhbXNbMV0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzFdICYmIHRoaXMuZGF0dW1fcGFyYW1zWzJdID09PSBkZXN0LmRhdHVtX3BhcmFtc1syXSAmJiB0aGlzLmRhdHVtX3BhcmFtc1szXSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbM10gJiYgdGhpcy5kYXR1bV9wYXJhbXNbNF0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzRdICYmIHRoaXMuZGF0dW1fcGFyYW1zWzVdID09PSBkZXN0LmRhdHVtX3BhcmFtc1s1XSAmJiB0aGlzLmRhdHVtX3BhcmFtc1s2XSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbNl0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmRhdHVtX3R5cGUgPT09IFBKRF9HUklEU0hJRlQgfHwgZGVzdC5kYXR1bV90eXBlID09PSBQSkRfR1JJRFNISUZUKSB7XG4gICAgICAvL2FsZXJ0KFwiRVJST1I6IEdyaWQgc2hpZnQgdHJhbnNmb3JtYXRpb25zIGFyZSBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgICAgLy9yZXR1cm4gZmFsc2VcbiAgICAgIC8vREdSIDIwMTItMDctMjkgbGF6eSAuLi5cbiAgICAgIHJldHVybiB0aGlzLm5hZGdyaWRzID09PSBkZXN0Lm5hZGdyaWRzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlOyAvLyBkYXR1bXMgYXJlIGVxdWFsXG4gICAgfVxuICB9LCAvLyBjc19jb21wYXJlX2RhdHVtcygpXG5cbiAgLypcbiAgICogVGhlIGZ1bmN0aW9uIENvbnZlcnRfR2VvZGV0aWNfVG9fR2VvY2VudHJpYyBjb252ZXJ0cyBnZW9kZXRpYyBjb29yZGluYXRlc1xuICAgKiAobGF0aXR1ZGUsIGxvbmdpdHVkZSwgYW5kIGhlaWdodCkgdG8gZ2VvY2VudHJpYyBjb29yZGluYXRlcyAoWCwgWSwgWiksXG4gICAqIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBlbGxpcHNvaWQgcGFyYW1ldGVycy5cbiAgICpcbiAgICogICAgTGF0aXR1ZGUgIDogR2VvZGV0aWMgbGF0aXR1ZGUgaW4gcmFkaWFucyAgICAgICAgICAgICAgICAgICAgIChpbnB1dClcbiAgICogICAgTG9uZ2l0dWRlIDogR2VvZGV0aWMgbG9uZ2l0dWRlIGluIHJhZGlhbnMgICAgICAgICAgICAgICAgICAgIChpbnB1dClcbiAgICogICAgSGVpZ2h0ICAgIDogR2VvZGV0aWMgaGVpZ2h0LCBpbiBtZXRlcnMgICAgICAgICAgICAgICAgICAgICAgIChpbnB1dClcbiAgICogICAgWCAgICAgICAgIDogQ2FsY3VsYXRlZCBHZW9jZW50cmljIFggY29vcmRpbmF0ZSwgaW4gbWV0ZXJzICAgIChvdXRwdXQpXG4gICAqICAgIFkgICAgICAgICA6IENhbGN1bGF0ZWQgR2VvY2VudHJpYyBZIGNvb3JkaW5hdGUsIGluIG1ldGVycyAgICAob3V0cHV0KVxuICAgKiAgICBaICAgICAgICAgOiBDYWxjdWxhdGVkIEdlb2NlbnRyaWMgWiBjb29yZGluYXRlLCBpbiBtZXRlcnMgICAgKG91dHB1dClcbiAgICpcbiAgICovXG4gIGdlb2RldGljX3RvX2dlb2NlbnRyaWM6IGZ1bmN0aW9uKHApIHtcbiAgICB2YXIgTG9uZ2l0dWRlID0gcC54O1xuICAgIHZhciBMYXRpdHVkZSA9IHAueTtcbiAgICB2YXIgSGVpZ2h0ID0gcC56ID8gcC56IDogMDsgLy9aIHZhbHVlIG5vdCBhbHdheXMgc3VwcGxpZWRcbiAgICB2YXIgWDsgLy8gb3V0cHV0XG4gICAgdmFyIFk7XG4gICAgdmFyIFo7XG5cbiAgICB2YXIgRXJyb3JfQ29kZSA9IDA7IC8vICBHRU9DRU5UX05PX0VSUk9SO1xuICAgIHZhciBSbjsgLyogIEVhcnRoIHJhZGl1cyBhdCBsb2NhdGlvbiAgKi9cbiAgICB2YXIgU2luX0xhdDsgLyogIE1hdGguc2luKExhdGl0dWRlKSAgKi9cbiAgICB2YXIgU2luMl9MYXQ7IC8qICBTcXVhcmUgb2YgTWF0aC5zaW4oTGF0aXR1ZGUpICAqL1xuICAgIHZhciBDb3NfTGF0OyAvKiAgTWF0aC5jb3MoTGF0aXR1ZGUpICAqL1xuXG4gICAgLypcbiAgICAgKiogRG9uJ3QgYmxvdyB1cCBpZiBMYXRpdHVkZSBpcyBqdXN0IGEgbGl0dGxlIG91dCBvZiB0aGUgdmFsdWVcbiAgICAgKiogcmFuZ2UgYXMgaXQgbWF5IGp1c3QgYmUgYSByb3VuZGluZyBpc3N1ZS4gIEFsc28gcmVtb3ZlZCBsb25naXR1ZGVcbiAgICAgKiogdGVzdCwgaXQgc2hvdWxkIGJlIHdyYXBwZWQgYnkgTWF0aC5jb3MoKSBhbmQgTWF0aC5zaW4oKS4gIE5GVyBmb3IgUFJPSi40LCBTZXAvMjAwMS5cbiAgICAgKi9cbiAgICBpZiAoTGF0aXR1ZGUgPCAtSEFMRl9QSSAmJiBMYXRpdHVkZSA+IC0xLjAwMSAqIEhBTEZfUEkpIHtcbiAgICAgIExhdGl0dWRlID0gLUhBTEZfUEk7XG4gICAgfVxuICAgIGVsc2UgaWYgKExhdGl0dWRlID4gSEFMRl9QSSAmJiBMYXRpdHVkZSA8IDEuMDAxICogSEFMRl9QSSkge1xuICAgICAgTGF0aXR1ZGUgPSBIQUxGX1BJO1xuICAgIH1cbiAgICBlbHNlIGlmICgoTGF0aXR1ZGUgPCAtSEFMRl9QSSkgfHwgKExhdGl0dWRlID4gSEFMRl9QSSkpIHtcbiAgICAgIC8qIExhdGl0dWRlIG91dCBvZiByYW5nZSAqL1xuICAgICAgLy8uLnJlcG9ydEVycm9yKCdnZW9jZW50OmxhdCBvdXQgb2YgcmFuZ2U6JyArIExhdGl0dWRlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChMb25naXR1ZGUgPiBNYXRoLlBJKSB7XG4gICAgICBMb25naXR1ZGUgLT0gKDIgKiBNYXRoLlBJKTtcbiAgICB9XG4gICAgU2luX0xhdCA9IE1hdGguc2luKExhdGl0dWRlKTtcbiAgICBDb3NfTGF0ID0gTWF0aC5jb3MoTGF0aXR1ZGUpO1xuICAgIFNpbjJfTGF0ID0gU2luX0xhdCAqIFNpbl9MYXQ7XG4gICAgUm4gPSB0aGlzLmEgLyAoTWF0aC5zcXJ0KDEuMGUwIC0gdGhpcy5lcyAqIFNpbjJfTGF0KSk7XG4gICAgWCA9IChSbiArIEhlaWdodCkgKiBDb3NfTGF0ICogTWF0aC5jb3MoTG9uZ2l0dWRlKTtcbiAgICBZID0gKFJuICsgSGVpZ2h0KSAqIENvc19MYXQgKiBNYXRoLnNpbihMb25naXR1ZGUpO1xuICAgIFogPSAoKFJuICogKDEgLSB0aGlzLmVzKSkgKyBIZWlnaHQpICogU2luX0xhdDtcblxuICAgIHAueCA9IFg7XG4gICAgcC55ID0gWTtcbiAgICBwLnogPSBaO1xuICAgIHJldHVybiBFcnJvcl9Db2RlO1xuICB9LCAvLyBjc19nZW9kZXRpY190b19nZW9jZW50cmljKClcblxuXG4gIGdlb2NlbnRyaWNfdG9fZ2VvZGV0aWM6IGZ1bmN0aW9uKHApIHtcbiAgICAvKiBsb2NhbCBkZWZpbnRpb25zIGFuZCB2YXJpYWJsZXMgKi9cbiAgICAvKiBlbmQtY3JpdGVyaXVtIG9mIGxvb3AsIGFjY3VyYWN5IG9mIHNpbihMYXRpdHVkZSkgKi9cbiAgICB2YXIgZ2VuYXUgPSAxZS0xMjtcbiAgICB2YXIgZ2VuYXUyID0gKGdlbmF1ICogZ2VuYXUpO1xuICAgIHZhciBtYXhpdGVyID0gMzA7XG5cbiAgICB2YXIgUDsgLyogZGlzdGFuY2UgYmV0d2VlbiBzZW1pLW1pbm9yIGF4aXMgYW5kIGxvY2F0aW9uICovXG4gICAgdmFyIFJSOyAvKiBkaXN0YW5jZSBiZXR3ZWVuIGNlbnRlciBhbmQgbG9jYXRpb24gKi9cbiAgICB2YXIgQ1Q7IC8qIHNpbiBvZiBnZW9jZW50cmljIGxhdGl0dWRlICovXG4gICAgdmFyIFNUOyAvKiBjb3Mgb2YgZ2VvY2VudHJpYyBsYXRpdHVkZSAqL1xuICAgIHZhciBSWDtcbiAgICB2YXIgUks7XG4gICAgdmFyIFJOOyAvKiBFYXJ0aCByYWRpdXMgYXQgbG9jYXRpb24gKi9cbiAgICB2YXIgQ1BISTA7IC8qIGNvcyBvZiBzdGFydCBvciBvbGQgZ2VvZGV0aWMgbGF0aXR1ZGUgaW4gaXRlcmF0aW9ucyAqL1xuICAgIHZhciBTUEhJMDsgLyogc2luIG9mIHN0YXJ0IG9yIG9sZCBnZW9kZXRpYyBsYXRpdHVkZSBpbiBpdGVyYXRpb25zICovXG4gICAgdmFyIENQSEk7IC8qIGNvcyBvZiBzZWFyY2hlZCBnZW9kZXRpYyBsYXRpdHVkZSAqL1xuICAgIHZhciBTUEhJOyAvKiBzaW4gb2Ygc2VhcmNoZWQgZ2VvZGV0aWMgbGF0aXR1ZGUgKi9cbiAgICB2YXIgU0RQSEk7IC8qIGVuZC1jcml0ZXJpdW06IGFkZGl0aW9uLXRoZW9yZW0gb2Ygc2luKExhdGl0dWRlKGl0ZXIpLUxhdGl0dWRlKGl0ZXItMSkpICovXG4gICAgdmFyIEF0X1BvbGU7IC8qIGluZGljYXRlcyBsb2NhdGlvbiBpcyBpbiBwb2xhciByZWdpb24gKi9cbiAgICB2YXIgaXRlcjsgLyogIyBvZiBjb250aW5vdXMgaXRlcmF0aW9uLCBtYXguIDMwIGlzIGFsd2F5cyBlbm91Z2ggKHMuYS4pICovXG5cbiAgICB2YXIgWCA9IHAueDtcbiAgICB2YXIgWSA9IHAueTtcbiAgICB2YXIgWiA9IHAueiA/IHAueiA6IDAuMDsgLy9aIHZhbHVlIG5vdCBhbHdheXMgc3VwcGxpZWRcbiAgICB2YXIgTG9uZ2l0dWRlO1xuICAgIHZhciBMYXRpdHVkZTtcbiAgICB2YXIgSGVpZ2h0O1xuXG4gICAgQXRfUG9sZSA9IGZhbHNlO1xuICAgIFAgPSBNYXRoLnNxcnQoWCAqIFggKyBZICogWSk7XG4gICAgUlIgPSBNYXRoLnNxcnQoWCAqIFggKyBZICogWSArIFogKiBaKTtcblxuICAgIC8qICAgICAgc3BlY2lhbCBjYXNlcyBmb3IgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSAqL1xuICAgIGlmIChQIC8gdGhpcy5hIDwgZ2VuYXUpIHtcblxuICAgICAgLyogIHNwZWNpYWwgY2FzZSwgaWYgUD0wLiAoWD0wLiwgWT0wLikgKi9cbiAgICAgIEF0X1BvbGUgPSB0cnVlO1xuICAgICAgTG9uZ2l0dWRlID0gMC4wO1xuXG4gICAgICAvKiAgaWYgKFgsWSxaKT0oMC4sMC4sMC4pIHRoZW4gSGVpZ2h0IGJlY29tZXMgc2VtaS1taW5vciBheGlzXG4gICAgICAgKiAgb2YgZWxsaXBzb2lkICg9Y2VudGVyIG9mIG1hc3MpLCBMYXRpdHVkZSBiZWNvbWVzIFBJLzIgKi9cbiAgICAgIGlmIChSUiAvIHRoaXMuYSA8IGdlbmF1KSB7XG4gICAgICAgIExhdGl0dWRlID0gSEFMRl9QSTtcbiAgICAgICAgSGVpZ2h0ID0gLXRoaXMuYjtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8qICBlbGxpcHNvaWRhbCAoZ2VvZGV0aWMpIGxvbmdpdHVkZVxuICAgICAgICogIGludGVydmFsOiAtUEkgPCBMb25naXR1ZGUgPD0gK1BJICovXG4gICAgICBMb25naXR1ZGUgPSBNYXRoLmF0YW4yKFksIFgpO1xuICAgIH1cblxuICAgIC8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICogRm9sbG93aW5nIGl0ZXJhdGl2ZSBhbGdvcml0aG0gd2FzIGRldmVsb3BwZWQgYnlcbiAgICAgKiBcIkluc3RpdHV0IGZvciBFcmRtZXNzdW5nXCIsIFVuaXZlcnNpdHkgb2YgSGFubm92ZXIsIEp1bHkgMTk4OC5cbiAgICAgKiBJbnRlcm5ldDogd3d3LmlmZS51bmktaGFubm92ZXIuZGVcbiAgICAgKiBJdGVyYXRpdmUgY29tcHV0YXRpb24gb2YgQ1BISSxTUEhJIGFuZCBIZWlnaHQuXG4gICAgICogSXRlcmF0aW9uIG9mIENQSEkgYW5kIFNQSEkgdG8gMTAqKi0xMiByYWRpYW4gcmVzcC5cbiAgICAgKiAyKjEwKiotNyBhcmNzZWMuXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgKi9cbiAgICBDVCA9IFogLyBSUjtcbiAgICBTVCA9IFAgLyBSUjtcbiAgICBSWCA9IDEuMCAvIE1hdGguc3FydCgxLjAgLSB0aGlzLmVzICogKDIuMCAtIHRoaXMuZXMpICogU1QgKiBTVCk7XG4gICAgQ1BISTAgPSBTVCAqICgxLjAgLSB0aGlzLmVzKSAqIFJYO1xuICAgIFNQSEkwID0gQ1QgKiBSWDtcbiAgICBpdGVyID0gMDtcblxuICAgIC8qIGxvb3AgdG8gZmluZCBzaW4oTGF0aXR1ZGUpIHJlc3AuIExhdGl0dWRlXG4gICAgICogdW50aWwgfHNpbihMYXRpdHVkZShpdGVyKS1MYXRpdHVkZShpdGVyLTEpKXwgPCBnZW5hdSAqL1xuICAgIGRvIHtcbiAgICAgIGl0ZXIrKztcbiAgICAgIFJOID0gdGhpcy5hIC8gTWF0aC5zcXJ0KDEuMCAtIHRoaXMuZXMgKiBTUEhJMCAqIFNQSEkwKTtcblxuICAgICAgLyogIGVsbGlwc29pZGFsIChnZW9kZXRpYykgaGVpZ2h0ICovXG4gICAgICBIZWlnaHQgPSBQICogQ1BISTAgKyBaICogU1BISTAgLSBSTiAqICgxLjAgLSB0aGlzLmVzICogU1BISTAgKiBTUEhJMCk7XG5cbiAgICAgIFJLID0gdGhpcy5lcyAqIFJOIC8gKFJOICsgSGVpZ2h0KTtcbiAgICAgIFJYID0gMS4wIC8gTWF0aC5zcXJ0KDEuMCAtIFJLICogKDIuMCAtIFJLKSAqIFNUICogU1QpO1xuICAgICAgQ1BISSA9IFNUICogKDEuMCAtIFJLKSAqIFJYO1xuICAgICAgU1BISSA9IENUICogUlg7XG4gICAgICBTRFBISSA9IFNQSEkgKiBDUEhJMCAtIENQSEkgKiBTUEhJMDtcbiAgICAgIENQSEkwID0gQ1BISTtcbiAgICAgIFNQSEkwID0gU1BISTtcbiAgICB9XG4gICAgd2hpbGUgKFNEUEhJICogU0RQSEkgPiBnZW5hdTIgJiYgaXRlciA8IG1heGl0ZXIpO1xuXG4gICAgLyogICAgICBlbGxpcHNvaWRhbCAoZ2VvZGV0aWMpIGxhdGl0dWRlICovXG4gICAgTGF0aXR1ZGUgPSBNYXRoLmF0YW4oU1BISSAvIE1hdGguYWJzKENQSEkpKTtcblxuICAgIHAueCA9IExvbmdpdHVkZTtcbiAgICBwLnkgPSBMYXRpdHVkZTtcbiAgICBwLnogPSBIZWlnaHQ7XG4gICAgcmV0dXJuIHA7XG4gIH0sIC8vIGNzX2dlb2NlbnRyaWNfdG9fZ2VvZGV0aWMoKVxuXG4gIC8qKiBDb252ZXJ0X0dlb2NlbnRyaWNfVG9fR2VvZGV0aWNcbiAgICogVGhlIG1ldGhvZCB1c2VkIGhlcmUgaXMgZGVyaXZlZCBmcm9tICdBbiBJbXByb3ZlZCBBbGdvcml0aG0gZm9yXG4gICAqIEdlb2NlbnRyaWMgdG8gR2VvZGV0aWMgQ29vcmRpbmF0ZSBDb252ZXJzaW9uJywgYnkgUmFscGggVG9tcywgRmViIDE5OTZcbiAgICovXG4gIGdlb2NlbnRyaWNfdG9fZ2VvZGV0aWNfbm9uaXRlcjogZnVuY3Rpb24ocCkge1xuICAgIHZhciBYID0gcC54O1xuICAgIHZhciBZID0gcC55O1xuICAgIHZhciBaID0gcC56ID8gcC56IDogMDsgLy9aIHZhbHVlIG5vdCBhbHdheXMgc3VwcGxpZWRcbiAgICB2YXIgTG9uZ2l0dWRlO1xuICAgIHZhciBMYXRpdHVkZTtcbiAgICB2YXIgSGVpZ2h0O1xuXG4gICAgdmFyIFc7IC8qIGRpc3RhbmNlIGZyb20gWiBheGlzICovXG4gICAgdmFyIFcyOyAvKiBzcXVhcmUgb2YgZGlzdGFuY2UgZnJvbSBaIGF4aXMgKi9cbiAgICB2YXIgVDA7IC8qIGluaXRpYWwgZXN0aW1hdGUgb2YgdmVydGljYWwgY29tcG9uZW50ICovXG4gICAgdmFyIFQxOyAvKiBjb3JyZWN0ZWQgZXN0aW1hdGUgb2YgdmVydGljYWwgY29tcG9uZW50ICovXG4gICAgdmFyIFMwOyAvKiBpbml0aWFsIGVzdGltYXRlIG9mIGhvcml6b250YWwgY29tcG9uZW50ICovXG4gICAgdmFyIFMxOyAvKiBjb3JyZWN0ZWQgZXN0aW1hdGUgb2YgaG9yaXpvbnRhbCBjb21wb25lbnQgKi9cbiAgICB2YXIgU2luX0IwOyAvKiBNYXRoLnNpbihCMCksIEIwIGlzIGVzdGltYXRlIG9mIEJvd3JpbmcgYXV4IHZhcmlhYmxlICovXG4gICAgdmFyIFNpbjNfQjA7IC8qIGN1YmUgb2YgTWF0aC5zaW4oQjApICovXG4gICAgdmFyIENvc19CMDsgLyogTWF0aC5jb3MoQjApICovXG4gICAgdmFyIFNpbl9wMTsgLyogTWF0aC5zaW4ocGhpMSksIHBoaTEgaXMgZXN0aW1hdGVkIGxhdGl0dWRlICovXG4gICAgdmFyIENvc19wMTsgLyogTWF0aC5jb3MocGhpMSkgKi9cbiAgICB2YXIgUm47IC8qIEVhcnRoIHJhZGl1cyBhdCBsb2NhdGlvbiAqL1xuICAgIHZhciBTdW07IC8qIG51bWVyYXRvciBvZiBNYXRoLmNvcyhwaGkxKSAqL1xuICAgIHZhciBBdF9Qb2xlOyAvKiBpbmRpY2F0ZXMgbG9jYXRpb24gaXMgaW4gcG9sYXIgcmVnaW9uICovXG5cbiAgICBYID0gcGFyc2VGbG9hdChYKTsgLy8gY2FzdCBmcm9tIHN0cmluZyB0byBmbG9hdFxuICAgIFkgPSBwYXJzZUZsb2F0KFkpO1xuICAgIFogPSBwYXJzZUZsb2F0KFopO1xuXG4gICAgQXRfUG9sZSA9IGZhbHNlO1xuICAgIGlmIChYICE9PSAwLjApIHtcbiAgICAgIExvbmdpdHVkZSA9IE1hdGguYXRhbjIoWSwgWCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYgKFkgPiAwKSB7XG4gICAgICAgIExvbmdpdHVkZSA9IEhBTEZfUEk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChZIDwgMCkge1xuICAgICAgICBMb25naXR1ZGUgPSAtSEFMRl9QSTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBBdF9Qb2xlID0gdHJ1ZTtcbiAgICAgICAgTG9uZ2l0dWRlID0gMC4wO1xuICAgICAgICBpZiAoWiA+IDAuMCkgeyAvKiBub3J0aCBwb2xlICovXG4gICAgICAgICAgTGF0aXR1ZGUgPSBIQUxGX1BJO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKFogPCAwLjApIHsgLyogc291dGggcG9sZSAqL1xuICAgICAgICAgIExhdGl0dWRlID0gLUhBTEZfUEk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7IC8qIGNlbnRlciBvZiBlYXJ0aCAqL1xuICAgICAgICAgIExhdGl0dWRlID0gSEFMRl9QSTtcbiAgICAgICAgICBIZWlnaHQgPSAtdGhpcy5iO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBXMiA9IFggKiBYICsgWSAqIFk7XG4gICAgVyA9IE1hdGguc3FydChXMik7XG4gICAgVDAgPSBaICogQURfQztcbiAgICBTMCA9IE1hdGguc3FydChUMCAqIFQwICsgVzIpO1xuICAgIFNpbl9CMCA9IFQwIC8gUzA7XG4gICAgQ29zX0IwID0gVyAvIFMwO1xuICAgIFNpbjNfQjAgPSBTaW5fQjAgKiBTaW5fQjAgKiBTaW5fQjA7XG4gICAgVDEgPSBaICsgdGhpcy5iICogdGhpcy5lcDIgKiBTaW4zX0IwO1xuICAgIFN1bSA9IFcgLSB0aGlzLmEgKiB0aGlzLmVzICogQ29zX0IwICogQ29zX0IwICogQ29zX0IwO1xuICAgIFMxID0gTWF0aC5zcXJ0KFQxICogVDEgKyBTdW0gKiBTdW0pO1xuICAgIFNpbl9wMSA9IFQxIC8gUzE7XG4gICAgQ29zX3AxID0gU3VtIC8gUzE7XG4gICAgUm4gPSB0aGlzLmEgLyBNYXRoLnNxcnQoMS4wIC0gdGhpcy5lcyAqIFNpbl9wMSAqIFNpbl9wMSk7XG4gICAgaWYgKENvc19wMSA+PSBDT1NfNjdQNSkge1xuICAgICAgSGVpZ2h0ID0gVyAvIENvc19wMSAtIFJuO1xuICAgIH1cbiAgICBlbHNlIGlmIChDb3NfcDEgPD0gLUNPU182N1A1KSB7XG4gICAgICBIZWlnaHQgPSBXIC8gLUNvc19wMSAtIFJuO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIEhlaWdodCA9IFogLyBTaW5fcDEgKyBSbiAqICh0aGlzLmVzIC0gMS4wKTtcbiAgICB9XG4gICAgaWYgKEF0X1BvbGUgPT09IGZhbHNlKSB7XG4gICAgICBMYXRpdHVkZSA9IE1hdGguYXRhbihTaW5fcDEgLyBDb3NfcDEpO1xuICAgIH1cblxuICAgIHAueCA9IExvbmdpdHVkZTtcbiAgICBwLnkgPSBMYXRpdHVkZTtcbiAgICBwLnogPSBIZWlnaHQ7XG4gICAgcmV0dXJuIHA7XG4gIH0sIC8vIGdlb2NlbnRyaWNfdG9fZ2VvZGV0aWNfbm9uaXRlcigpXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIC8vIHBqX2dlb2NlbnRpY190b193Z3M4NCggcCApXG4gIC8vICBwID0gcG9pbnQgdG8gdHJhbnNmb3JtIGluIGdlb2NlbnRyaWMgY29vcmRpbmF0ZXMgKHgseSx6KVxuICBnZW9jZW50cmljX3RvX3dnczg0OiBmdW5jdGlvbihwKSB7XG5cbiAgICBpZiAodGhpcy5kYXR1bV90eXBlID09PSBQSkRfM1BBUkFNKSB7XG4gICAgICAvLyBpZiggeFtpb10gPT09IEhVR0VfVkFMIClcbiAgICAgIC8vICAgIGNvbnRpbnVlO1xuICAgICAgcC54ICs9IHRoaXMuZGF0dW1fcGFyYW1zWzBdO1xuICAgICAgcC55ICs9IHRoaXMuZGF0dW1fcGFyYW1zWzFdO1xuICAgICAgcC56ICs9IHRoaXMuZGF0dW1fcGFyYW1zWzJdO1xuXG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZGF0dW1fdHlwZSA9PT0gUEpEXzdQQVJBTSkge1xuICAgICAgdmFyIER4X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbMF07XG4gICAgICB2YXIgRHlfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1sxXTtcbiAgICAgIHZhciBEel9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzJdO1xuICAgICAgdmFyIFJ4X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbM107XG4gICAgICB2YXIgUnlfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1s0XTtcbiAgICAgIHZhciBSel9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzVdO1xuICAgICAgdmFyIE1fQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1s2XTtcbiAgICAgIC8vIGlmKCB4W2lvXSA9PT0gSFVHRV9WQUwgKVxuICAgICAgLy8gICAgY29udGludWU7XG4gICAgICB2YXIgeF9vdXQgPSBNX0JGICogKHAueCAtIFJ6X0JGICogcC55ICsgUnlfQkYgKiBwLnopICsgRHhfQkY7XG4gICAgICB2YXIgeV9vdXQgPSBNX0JGICogKFJ6X0JGICogcC54ICsgcC55IC0gUnhfQkYgKiBwLnopICsgRHlfQkY7XG4gICAgICB2YXIgel9vdXQgPSBNX0JGICogKC1SeV9CRiAqIHAueCArIFJ4X0JGICogcC55ICsgcC56KSArIER6X0JGO1xuICAgICAgcC54ID0geF9vdXQ7XG4gICAgICBwLnkgPSB5X291dDtcbiAgICAgIHAueiA9IHpfb3V0O1xuICAgIH1cbiAgfSwgLy8gY3NfZ2VvY2VudHJpY190b193Z3M4NFxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAvLyBwal9nZW9jZW50aWNfZnJvbV93Z3M4NCgpXG4gIC8vICBjb29yZGluYXRlIHN5c3RlbSBkZWZpbml0aW9uLFxuICAvLyAgcG9pbnQgdG8gdHJhbnNmb3JtIGluIGdlb2NlbnRyaWMgY29vcmRpbmF0ZXMgKHgseSx6KVxuICBnZW9jZW50cmljX2Zyb21fd2dzODQ6IGZ1bmN0aW9uKHApIHtcblxuICAgIGlmICh0aGlzLmRhdHVtX3R5cGUgPT09IFBKRF8zUEFSQU0pIHtcbiAgICAgIC8vaWYoIHhbaW9dID09PSBIVUdFX1ZBTCApXG4gICAgICAvLyAgICBjb250aW51ZTtcbiAgICAgIHAueCAtPSB0aGlzLmRhdHVtX3BhcmFtc1swXTtcbiAgICAgIHAueSAtPSB0aGlzLmRhdHVtX3BhcmFtc1sxXTtcbiAgICAgIHAueiAtPSB0aGlzLmRhdHVtX3BhcmFtc1syXTtcblxuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmRhdHVtX3R5cGUgPT09IFBKRF83UEFSQU0pIHtcbiAgICAgIHZhciBEeF9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzBdO1xuICAgICAgdmFyIER5X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbMV07XG4gICAgICB2YXIgRHpfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1syXTtcbiAgICAgIHZhciBSeF9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzNdO1xuICAgICAgdmFyIFJ5X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbNF07XG4gICAgICB2YXIgUnpfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1s1XTtcbiAgICAgIHZhciBNX0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbNl07XG4gICAgICB2YXIgeF90bXAgPSAocC54IC0gRHhfQkYpIC8gTV9CRjtcbiAgICAgIHZhciB5X3RtcCA9IChwLnkgLSBEeV9CRikgLyBNX0JGO1xuICAgICAgdmFyIHpfdG1wID0gKHAueiAtIER6X0JGKSAvIE1fQkY7XG4gICAgICAvL2lmKCB4W2lvXSA9PT0gSFVHRV9WQUwgKVxuICAgICAgLy8gICAgY29udGludWU7XG5cbiAgICAgIHAueCA9IHhfdG1wICsgUnpfQkYgKiB5X3RtcCAtIFJ5X0JGICogel90bXA7XG4gICAgICBwLnkgPSAtUnpfQkYgKiB4X3RtcCArIHlfdG1wICsgUnhfQkYgKiB6X3RtcDtcbiAgICAgIHAueiA9IFJ5X0JGICogeF90bXAgLSBSeF9CRiAqIHlfdG1wICsgel90bXA7XG4gICAgfSAvL2NzX2dlb2NlbnRyaWNfZnJvbV93Z3M4NCgpXG4gIH1cbn07XG5cbi8qKiBwb2ludCBvYmplY3QsIG5vdGhpbmcgZmFuY3ksIGp1c3QgYWxsb3dzIHZhbHVlcyB0byBiZVxuICAgIHBhc3NlZCBiYWNrIGFuZCBmb3J0aCBieSByZWZlcmVuY2UgcmF0aGVyIHRoYW4gYnkgdmFsdWUuXG4gICAgT3RoZXIgcG9pbnQgY2xhc3NlcyBtYXkgYmUgdXNlZCBhcyBsb25nIGFzIHRoZXkgaGF2ZVxuICAgIHggYW5kIHkgcHJvcGVydGllcywgd2hpY2ggd2lsbCBnZXQgbW9kaWZpZWQgaW4gdGhlIHRyYW5zZm9ybSBtZXRob2QuXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBkYXR1bTtcbiIsInZhciBQSkRfM1BBUkFNID0gMTtcbnZhciBQSkRfN1BBUkFNID0gMjtcbnZhciBQSkRfR1JJRFNISUZUID0gMztcbnZhciBQSkRfTk9EQVRVTSA9IDU7IC8vIFdHUzg0IG9yIGVxdWl2YWxlbnRcbnZhciBTUlNfV0dTODRfU0VNSU1BSk9SID0gNjM3ODEzNzsgLy8gb25seSB1c2VkIGluIGdyaWQgc2hpZnQgdHJhbnNmb3Jtc1xudmFyIFNSU19XR1M4NF9FU1FVQVJFRCA9IDAuMDA2Njk0Mzc5OTkwMTQxMzE2OyAvL0RHUjogMjAxMi0wNy0yOVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzb3VyY2UsIGRlc3QsIHBvaW50KSB7XG4gIHZhciB3cCwgaSwgbDtcblxuICBmdW5jdGlvbiBjaGVja1BhcmFtcyhmYWxsYmFjaykge1xuICAgIHJldHVybiAoZmFsbGJhY2sgPT09IFBKRF8zUEFSQU0gfHwgZmFsbGJhY2sgPT09IFBKRF83UEFSQU0pO1xuICB9XG4gIC8vIFNob3J0IGN1dCBpZiB0aGUgZGF0dW1zIGFyZSBpZGVudGljYWwuXG4gIGlmIChzb3VyY2UuY29tcGFyZV9kYXR1bXMoZGVzdCkpIHtcbiAgICByZXR1cm4gcG9pbnQ7IC8vIGluIHRoaXMgY2FzZSwgemVybyBpcyBzdWNlc3MsXG4gICAgLy8gd2hlcmVhcyBjc19jb21wYXJlX2RhdHVtcyByZXR1cm5zIDEgdG8gaW5kaWNhdGUgVFJVRVxuICAgIC8vIGNvbmZ1c2luZywgc2hvdWxkIGZpeCB0aGlzXG4gIH1cblxuICAvLyBFeHBsaWNpdGx5IHNraXAgZGF0dW0gdHJhbnNmb3JtIGJ5IHNldHRpbmcgJ2RhdHVtPW5vbmUnIGFzIHBhcmFtZXRlciBmb3IgZWl0aGVyIHNvdXJjZSBvciBkZXN0XG4gIGlmIChzb3VyY2UuZGF0dW1fdHlwZSA9PT0gUEpEX05PREFUVU0gfHwgZGVzdC5kYXR1bV90eXBlID09PSBQSkRfTk9EQVRVTSkge1xuICAgIHJldHVybiBwb2ludDtcbiAgfVxuXG4gIC8vREdSOiAyMDEyLTA3LTI5IDogYWRkIG5hZGdyaWRzIHN1cHBvcnQgKGJlZ2luKVxuICB2YXIgc3JjX2EgPSBzb3VyY2UuYTtcbiAgdmFyIHNyY19lcyA9IHNvdXJjZS5lcztcblxuICB2YXIgZHN0X2EgPSBkZXN0LmE7XG4gIHZhciBkc3RfZXMgPSBkZXN0LmVzO1xuXG4gIHZhciBmYWxsYmFjayA9IHNvdXJjZS5kYXR1bV90eXBlO1xuICAvLyBJZiB0aGlzIGRhdHVtIHJlcXVpcmVzIGdyaWQgc2hpZnRzLCB0aGVuIGFwcGx5IGl0IHRvIGdlb2RldGljIGNvb3JkaW5hdGVzLlxuICBpZiAoZmFsbGJhY2sgPT09IFBKRF9HUklEU0hJRlQpIHtcbiAgICBpZiAodGhpcy5hcHBseV9ncmlkc2hpZnQoc291cmNlLCAwLCBwb2ludCkgPT09IDApIHtcbiAgICAgIHNvdXJjZS5hID0gU1JTX1dHUzg0X1NFTUlNQUpPUjtcbiAgICAgIHNvdXJjZS5lcyA9IFNSU19XR1M4NF9FU1FVQVJFRDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyB0cnkgMyBvciA3IHBhcmFtcyB0cmFuc2Zvcm1hdGlvbiBvciBub3RoaW5nID9cbiAgICAgIGlmICghc291cmNlLmRhdHVtX3BhcmFtcykge1xuICAgICAgICBzb3VyY2UuYSA9IHNyY19hO1xuICAgICAgICBzb3VyY2UuZXMgPSBzb3VyY2UuZXM7XG4gICAgICAgIHJldHVybiBwb2ludDtcbiAgICAgIH1cbiAgICAgIHdwID0gMTtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBzb3VyY2UuZGF0dW1fcGFyYW1zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB3cCAqPSBzb3VyY2UuZGF0dW1fcGFyYW1zW2ldO1xuICAgICAgfVxuICAgICAgaWYgKHdwID09PSAwKSB7XG4gICAgICAgIHNvdXJjZS5hID0gc3JjX2E7XG4gICAgICAgIHNvdXJjZS5lcyA9IHNvdXJjZS5lcztcbiAgICAgICAgcmV0dXJuIHBvaW50O1xuICAgICAgfVxuICAgICAgaWYgKHNvdXJjZS5kYXR1bV9wYXJhbXMubGVuZ3RoID4gMykge1xuICAgICAgICBmYWxsYmFjayA9IFBKRF83UEFSQU07XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZmFsbGJhY2sgPSBQSkRfM1BBUkFNO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoZGVzdC5kYXR1bV90eXBlID09PSBQSkRfR1JJRFNISUZUKSB7XG4gICAgZGVzdC5hID0gU1JTX1dHUzg0X1NFTUlNQUpPUjtcbiAgICBkZXN0LmVzID0gU1JTX1dHUzg0X0VTUVVBUkVEO1xuICB9XG4gIC8vIERvIHdlIG5lZWQgdG8gZ28gdGhyb3VnaCBnZW9jZW50cmljIGNvb3JkaW5hdGVzP1xuICBpZiAoc291cmNlLmVzICE9PSBkZXN0LmVzIHx8IHNvdXJjZS5hICE9PSBkZXN0LmEgfHwgY2hlY2tQYXJhbXMoZmFsbGJhY2spIHx8IGNoZWNrUGFyYW1zKGRlc3QuZGF0dW1fdHlwZSkpIHtcbiAgICAvL0RHUjogMjAxMi0wNy0yOSA6IGFkZCBuYWRncmlkcyBzdXBwb3J0IChlbmQpXG4gICAgLy8gQ29udmVydCB0byBnZW9jZW50cmljIGNvb3JkaW5hdGVzLlxuICAgIHNvdXJjZS5nZW9kZXRpY190b19nZW9jZW50cmljKHBvaW50KTtcbiAgICAvLyBDSEVDS19SRVRVUk47XG4gICAgLy8gQ29udmVydCBiZXR3ZWVuIGRhdHVtc1xuICAgIGlmIChjaGVja1BhcmFtcyhzb3VyY2UuZGF0dW1fdHlwZSkpIHtcbiAgICAgIHNvdXJjZS5nZW9jZW50cmljX3RvX3dnczg0KHBvaW50KTtcbiAgICAgIC8vIENIRUNLX1JFVFVSTjtcbiAgICB9XG4gICAgaWYgKGNoZWNrUGFyYW1zKGRlc3QuZGF0dW1fdHlwZSkpIHtcbiAgICAgIGRlc3QuZ2VvY2VudHJpY19mcm9tX3dnczg0KHBvaW50KTtcbiAgICAgIC8vIENIRUNLX1JFVFVSTjtcbiAgICB9XG4gICAgLy8gQ29udmVydCBiYWNrIHRvIGdlb2RldGljIGNvb3JkaW5hdGVzXG4gICAgZGVzdC5nZW9jZW50cmljX3RvX2dlb2RldGljKHBvaW50KTtcbiAgICAvLyBDSEVDS19SRVRVUk47XG4gIH1cbiAgLy8gQXBwbHkgZ3JpZCBzaGlmdCB0byBkZXN0aW5hdGlvbiBpZiByZXF1aXJlZFxuICBpZiAoZGVzdC5kYXR1bV90eXBlID09PSBQSkRfR1JJRFNISUZUKSB7XG4gICAgdGhpcy5hcHBseV9ncmlkc2hpZnQoZGVzdCwgMSwgcG9pbnQpO1xuICAgIC8vIENIRUNLX1JFVFVSTjtcbiAgfVxuXG4gIHNvdXJjZS5hID0gc3JjX2E7XG4gIHNvdXJjZS5lcyA9IHNyY19lcztcbiAgZGVzdC5hID0gZHN0X2E7XG4gIGRlc3QuZXMgPSBkc3RfZXM7XG5cbiAgcmV0dXJuIHBvaW50O1xufTtcblxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuL2dsb2JhbCcpO1xudmFyIHBhcnNlUHJvaiA9IHJlcXVpcmUoJy4vcHJvalN0cmluZycpO1xudmFyIHdrdCA9IHJlcXVpcmUoJy4vd2t0Jyk7XG5cbmZ1bmN0aW9uIGRlZnMobmFtZSkge1xuICAvKmdsb2JhbCBjb25zb2xlKi9cbiAgdmFyIHRoYXQgPSB0aGlzO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHZhciBkZWYgPSBhcmd1bWVudHNbMV07XG4gICAgaWYgKHR5cGVvZiBkZWYgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoZGVmLmNoYXJBdCgwKSA9PT0gJysnKSB7XG4gICAgICAgIGRlZnNbbmFtZV0gPSBwYXJzZVByb2ooYXJndW1lbnRzWzFdKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZzW25hbWVdID0gd2t0KGFyZ3VtZW50c1sxXSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZnNbbmFtZV0gPSBkZWY7XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShuYW1lKSkge1xuICAgICAgcmV0dXJuIG5hbWUubWFwKGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodikpIHtcbiAgICAgICAgICBkZWZzLmFwcGx5KHRoYXQsIHYpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlZnModik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChuYW1lIGluIGRlZnMpIHtcbiAgICAgICAgcmV0dXJuIGRlZnNbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCdFUFNHJyBpbiBuYW1lKSB7XG4gICAgICBkZWZzWydFUFNHOicgKyBuYW1lLkVQU0ddID0gbmFtZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoJ0VTUkknIGluIG5hbWUpIHtcbiAgICAgIGRlZnNbJ0VTUkk6JyArIG5hbWUuRVNSSV0gPSBuYW1lO1xuICAgIH1cbiAgICBlbHNlIGlmICgnSUFVMjAwMCcgaW4gbmFtZSkge1xuICAgICAgZGVmc1snSUFVMjAwMDonICsgbmFtZS5JQVUyMDAwXSA9IG5hbWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS5sb2cobmFtZSk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG5cbn1cbmdsb2JhbHMoZGVmcyk7XG5tb2R1bGUuZXhwb3J0cyA9IGRlZnM7XG4iLCJ2YXIgRGF0dW0gPSByZXF1aXJlKCcuL2NvbnN0YW50cy9EYXR1bScpO1xudmFyIEVsbGlwc29pZCA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL0VsbGlwc29pZCcpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJy4vZXh0ZW5kJyk7XG52YXIgZGF0dW0gPSByZXF1aXJlKCcuL2RhdHVtJyk7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xuLy8gZWxsaXBvaWQgcGpfc2V0X2VsbC5jXG52YXIgU0lYVEggPSAwLjE2NjY2NjY2NjY2NjY2NjY2Njc7XG4vKiAxLzYgKi9cbnZhciBSQTQgPSAwLjA0NzIyMjIyMjIyMjIyMjIyMjIyO1xuLyogMTcvMzYwICovXG52YXIgUkE2ID0gMC4wMjIxNTYwODQ2NTYwODQ2NTYwODtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oanNvbikge1xuICAvLyBER1IgMjAxMS0wMy0yMCA6IG5hZ3JpZHMgLT4gbmFkZ3JpZHNcbiAgaWYgKGpzb24uZGF0dW1Db2RlICYmIGpzb24uZGF0dW1Db2RlICE9PSAnbm9uZScpIHtcbiAgICB2YXIgZGF0dW1EZWYgPSBEYXR1bVtqc29uLmRhdHVtQ29kZV07XG4gICAgaWYgKGRhdHVtRGVmKSB7XG4gICAgICBqc29uLmRhdHVtX3BhcmFtcyA9IGRhdHVtRGVmLnRvd2dzODQgPyBkYXR1bURlZi50b3dnczg0LnNwbGl0KCcsJykgOiBudWxsO1xuICAgICAganNvbi5lbGxwcyA9IGRhdHVtRGVmLmVsbGlwc2U7XG4gICAgICBqc29uLmRhdHVtTmFtZSA9IGRhdHVtRGVmLmRhdHVtTmFtZSA/IGRhdHVtRGVmLmRhdHVtTmFtZSA6IGpzb24uZGF0dW1Db2RlO1xuICAgIH1cbiAgfVxuICBpZiAoIWpzb24uYSkgeyAvLyBkbyB3ZSBoYXZlIGFuIGVsbGlwc29pZD9cbiAgICB2YXIgZWxsaXBzZSA9IEVsbGlwc29pZFtqc29uLmVsbHBzXSA/IEVsbGlwc29pZFtqc29uLmVsbHBzXSA6IEVsbGlwc29pZC5XR1M4NDtcbiAgICBleHRlbmQoanNvbiwgZWxsaXBzZSk7XG4gIH1cbiAgaWYgKGpzb24ucmYgJiYgIWpzb24uYikge1xuICAgIGpzb24uYiA9ICgxLjAgLSAxLjAgLyBqc29uLnJmKSAqIGpzb24uYTtcbiAgfVxuICBpZiAoanNvbi5yZiA9PT0gMCB8fCBNYXRoLmFicyhqc29uLmEgLSBqc29uLmIpIDwgRVBTTE4pIHtcbiAgICBqc29uLnNwaGVyZSA9IHRydWU7XG4gICAganNvbi5iID0ganNvbi5hO1xuICB9XG4gIGpzb24uYTIgPSBqc29uLmEgKiBqc29uLmE7IC8vIHVzZWQgaW4gZ2VvY2VudHJpY1xuICBqc29uLmIyID0ganNvbi5iICoganNvbi5iOyAvLyB1c2VkIGluIGdlb2NlbnRyaWNcbiAganNvbi5lcyA9IChqc29uLmEyIC0ganNvbi5iMikgLyBqc29uLmEyOyAvLyBlIF4gMlxuICBqc29uLmUgPSBNYXRoLnNxcnQoanNvbi5lcyk7IC8vIGVjY2VudHJpY2l0eVxuICBpZiAoanNvbi5SX0EpIHtcbiAgICBqc29uLmEgKj0gMSAtIGpzb24uZXMgKiAoU0lYVEggKyBqc29uLmVzICogKFJBNCArIGpzb24uZXMgKiBSQTYpKTtcbiAgICBqc29uLmEyID0ganNvbi5hICoganNvbi5hO1xuICAgIGpzb24uYjIgPSBqc29uLmIgKiBqc29uLmI7XG4gICAganNvbi5lcyA9IDA7XG4gIH1cbiAganNvbi5lcDIgPSAoanNvbi5hMiAtIGpzb24uYjIpIC8ganNvbi5iMjsgLy8gdXNlZCBpbiBnZW9jZW50cmljXG4gIGlmICghanNvbi5rMCkge1xuICAgIGpzb24uazAgPSAxLjA7IC8vZGVmYXVsdCB2YWx1ZVxuICB9XG4gIC8vREdSIDIwMTAtMTEtMTI6IGF4aXNcbiAgaWYgKCFqc29uLmF4aXMpIHtcbiAgICBqc29uLmF4aXMgPSBcImVudVwiO1xuICB9XG5cbiAgaWYgKCFqc29uLmRhdHVtKSB7XG4gICAganNvbi5kYXR1bSA9IGRhdHVtKGpzb24pO1xuICB9XG4gIHJldHVybiBqc29uO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGVzdGluYXRpb24sIHNvdXJjZSkge1xuICBkZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uIHx8IHt9O1xuICB2YXIgdmFsdWUsIHByb3BlcnR5O1xuICBpZiAoIXNvdXJjZSkge1xuICAgIHJldHVybiBkZXN0aW5hdGlvbjtcbiAgfVxuICBmb3IgKHByb3BlcnR5IGluIHNvdXJjZSkge1xuICAgIHZhbHVlID0gc291cmNlW3Byb3BlcnR5XTtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZGVzdGluYXRpb25bcHJvcGVydHldID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBkZXN0aW5hdGlvbjtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRlZnMpIHtcbiAgZGVmcygnRVBTRzo0MzI2JywgXCIrdGl0bGU9V0dTIDg0IChsb25nL2xhdCkgK3Byb2o9bG9uZ2xhdCArZWxscHM9V0dTODQgK2RhdHVtPVdHUzg0ICt1bml0cz1kZWdyZWVzXCIpO1xuICBkZWZzKCdFUFNHOjQyNjknLCBcIit0aXRsZT1OQUQ4MyAobG9uZy9sYXQpICtwcm9qPWxvbmdsYXQgK2E9NjM3ODEzNy4wICtiPTYzNTY3NTIuMzE0MTQwMzYgK2VsbHBzPUdSUzgwICtkYXR1bT1OQUQ4MyArdW5pdHM9ZGVncmVlc1wiKTtcbiAgZGVmcygnRVBTRzozODU3JywgXCIrdGl0bGU9V0dTIDg0IC8gUHNldWRvLU1lcmNhdG9yICtwcm9qPW1lcmMgK2E9NjM3ODEzNyArYj02Mzc4MTM3ICtsYXRfdHM9MC4wICtsb25fMD0wLjAgK3hfMD0wLjAgK3lfMD0wICtrPTEuMCArdW5pdHM9bSArbmFkZ3JpZHM9QG51bGwgK25vX2RlZnNcIik7XG5cbiAgZGVmcy5XR1M4NCA9IGRlZnNbJ0VQU0c6NDMyNiddO1xuICBkZWZzWydFUFNHOjM3ODUnXSA9IGRlZnNbJ0VQU0c6Mzg1NyddOyAvLyBtYWludGFpbiBiYWNrd2FyZCBjb21wYXQsIG9mZmljaWFsIGNvZGUgaXMgMzg1N1xuICBkZWZzLkdPT0dMRSA9IGRlZnNbJ0VQU0c6Mzg1NyddO1xuICBkZWZzWydFUFNHOjkwMDkxMyddID0gZGVmc1snRVBTRzozODU3J107XG4gIGRlZnNbJ0VQU0c6MTAyMTEzJ10gPSBkZWZzWydFUFNHOjM4NTcnXTtcbn07XG4iLCJ2YXIgcHJvanMgPSBbXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvdG1lcmMnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy91dG0nKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9zdGVyZWEnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9zdGVyZScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL3NvbWVyYycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL29tZXJjJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvbGNjJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMva3JvdmFrJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvY2FzcycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2xhZWEnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9hZWEnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9nbm9tJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvY2VhJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvZXFjJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvcG9seScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL256bWcnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9taWxsJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvc2ludScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL21vbGwnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9lcWRjJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvdmFuZGcnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9hZXFkJylcbl07XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb2o0KXtcbiAgcHJvanMuZm9yRWFjaChmdW5jdGlvbihwcm9qKXtcbiAgICBwcm9qNC5Qcm9qLnByb2plY3Rpb25zLmFkZChwcm9qKTtcbiAgfSk7XG59OyIsInZhciBwcm9qNCA9IHJlcXVpcmUoJy4vY29yZScpO1xucHJvajQuZGVmYXVsdERhdHVtID0gJ1dHUzg0JzsgLy9kZWZhdWx0IGRhdHVtXG5wcm9qNC5Qcm9qID0gcmVxdWlyZSgnLi9Qcm9qJyk7XG5wcm9qNC5XR1M4NCA9IG5ldyBwcm9qNC5Qcm9qKCdXR1M4NCcpO1xucHJvajQuUG9pbnQgPSByZXF1aXJlKCcuL1BvaW50Jyk7XG5wcm9qNC50b1BvaW50ID0gcmVxdWlyZShcIi4vY29tbW9uL3RvUG9pbnRcIik7XG5wcm9qNC5kZWZzID0gcmVxdWlyZSgnLi9kZWZzJyk7XG5wcm9qNC50cmFuc2Zvcm0gPSByZXF1aXJlKCcuL3RyYW5zZm9ybScpO1xucHJvajQubWdycyA9IHJlcXVpcmUoJ21ncnMnKTtcbnByb2o0LnZlcnNpb24gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uO1xucmVxdWlyZSgnLi9pbmNsdWRlZFByb2plY3Rpb25zJykocHJvajQpO1xubW9kdWxlLmV4cG9ydHMgPSBwcm9qNDsiLCJ2YXIgZGVmcyA9IHJlcXVpcmUoJy4vZGVmcycpO1xudmFyIHdrdCA9IHJlcXVpcmUoJy4vd2t0Jyk7XG52YXIgcHJvalN0ciA9IHJlcXVpcmUoJy4vcHJvalN0cmluZycpO1xuZnVuY3Rpb24gdGVzdE9iaihjb2RlKXtcbiAgcmV0dXJuIHR5cGVvZiBjb2RlID09PSAnc3RyaW5nJztcbn1cbmZ1bmN0aW9uIHRlc3REZWYoY29kZSl7XG4gIHJldHVybiBjb2RlIGluIGRlZnM7XG59XG5mdW5jdGlvbiB0ZXN0V0tUKGNvZGUpe1xuICB2YXIgY29kZVdvcmRzID0gWydHRU9HQ1MnLCdHRU9DQ1MnLCdQUk9KQ1MnLCdMT0NBTF9DUyddO1xuICByZXR1cm4gY29kZVdvcmRzLnJlZHVjZShmdW5jdGlvbihhLGIpe1xuICAgIHJldHVybiBhKzErY29kZS5pbmRleE9mKGIpO1xuICB9LDApO1xufVxuZnVuY3Rpb24gdGVzdFByb2ooY29kZSl7XG4gIHJldHVybiBjb2RlWzBdID09PSAnKyc7XG59XG5mdW5jdGlvbiBwYXJzZShjb2RlKXtcbiAgaWYgKHRlc3RPYmooY29kZSkpIHtcbiAgICAvL2NoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIGEgV0tUIHN0cmluZ1xuICAgIGlmICh0ZXN0RGVmKGNvZGUpKSB7XG4gICAgICByZXR1cm4gZGVmc1tjb2RlXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGVzdFdLVChjb2RlKSkge1xuICAgICAgcmV0dXJuIHdrdChjb2RlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGVzdFByb2ooY29kZSkpIHtcbiAgICAgIHJldHVybiBwcm9qU3RyKGNvZGUpO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgcmV0dXJuIGNvZGU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTsiLCJ2YXIgRDJSID0gMC4wMTc0NTMyOTI1MTk5NDMyOTU3NztcbnZhciBQcmltZU1lcmlkaWFuID0gcmVxdWlyZSgnLi9jb25zdGFudHMvUHJpbWVNZXJpZGlhbicpO1xudmFyIHVuaXRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvdW5pdHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkZWZEYXRhKSB7XG4gIHZhciBzZWxmID0ge307XG4gIHZhciBwYXJhbU9iaiA9IHt9O1xuICBkZWZEYXRhLnNwbGl0KFwiK1wiKS5tYXAoZnVuY3Rpb24odikge1xuICAgIHJldHVybiB2LnRyaW0oKTtcbiAgfSkuZmlsdGVyKGZ1bmN0aW9uKGEpIHtcbiAgICByZXR1cm4gYTtcbiAgfSkuZm9yRWFjaChmdW5jdGlvbihhKSB7XG4gICAgdmFyIHNwbGl0ID0gYS5zcGxpdChcIj1cIik7XG4gICAgc3BsaXQucHVzaCh0cnVlKTtcbiAgICBwYXJhbU9ialtzcGxpdFswXS50b0xvd2VyQ2FzZSgpXSA9IHNwbGl0WzFdO1xuICB9KTtcbiAgdmFyIHBhcmFtTmFtZSwgcGFyYW1WYWwsIHBhcmFtT3V0bmFtZTtcbiAgdmFyIHBhcmFtcyA9IHtcbiAgICBwcm9qOiAncHJvak5hbWUnLFxuICAgIGRhdHVtOiAnZGF0dW1Db2RlJyxcbiAgICByZjogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5yZiA9IHBhcnNlRmxvYXQodik7XG4gICAgfSxcbiAgICBsYXRfMDogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5sYXQwID0gdiAqIEQyUjtcbiAgICB9LFxuICAgIGxhdF8xOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmxhdDEgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgbGF0XzI6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubGF0MiA9IHYgKiBEMlI7XG4gICAgfSxcbiAgICBsYXRfdHM6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubGF0X3RzID0gdiAqIEQyUjtcbiAgICB9LFxuICAgIGxvbl8wOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmxvbmcwID0gdiAqIEQyUjtcbiAgICB9LFxuICAgIGxvbl8xOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmxvbmcxID0gdiAqIEQyUjtcbiAgICB9LFxuICAgIGxvbl8yOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmxvbmcyID0gdiAqIEQyUjtcbiAgICB9LFxuICAgIGFscGhhOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmFscGhhID0gcGFyc2VGbG9hdCh2KSAqIEQyUjtcbiAgICB9LFxuICAgIGxvbmM6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubG9uZ2MgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgeF8wOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLngwID0gcGFyc2VGbG9hdCh2KTtcbiAgICB9LFxuICAgIHlfMDogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi55MCA9IHBhcnNlRmxvYXQodik7XG4gICAgfSxcbiAgICBrXzA6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuazAgPSBwYXJzZUZsb2F0KHYpO1xuICAgIH0sXG4gICAgazogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5rMCA9IHBhcnNlRmxvYXQodik7XG4gICAgfSxcbiAgICBhOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmEgPSBwYXJzZUZsb2F0KHYpO1xuICAgIH0sXG4gICAgYjogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5iID0gcGFyc2VGbG9hdCh2KTtcbiAgICB9LFxuICAgIHJfYTogZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLlJfQSA9IHRydWU7XG4gICAgfSxcbiAgICB6b25lOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLnpvbmUgPSBwYXJzZUludCh2LCAxMCk7XG4gICAgfSxcbiAgICBzb3V0aDogZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLnV0bVNvdXRoID0gdHJ1ZTtcbiAgICB9LFxuICAgIHRvd2dzODQ6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuZGF0dW1fcGFyYW1zID0gdi5zcGxpdChcIixcIikubWFwKGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoYSk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHRvX21ldGVyOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLnRvX21ldGVyID0gcGFyc2VGbG9hdCh2KTtcbiAgICB9LFxuICAgIHVuaXRzOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLnVuaXRzID0gdjtcbiAgICAgIGlmICh1bml0c1t2XSkge1xuICAgICAgICBzZWxmLnRvX21ldGVyID0gdW5pdHNbdl0udG9fbWV0ZXI7XG4gICAgICB9XG4gICAgfSxcbiAgICBmcm9tX2dyZWVud2ljaDogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5mcm9tX2dyZWVud2ljaCA9IHYgKiBEMlI7XG4gICAgfSxcbiAgICBwbTogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5mcm9tX2dyZWVud2ljaCA9IChQcmltZU1lcmlkaWFuW3ZdID8gUHJpbWVNZXJpZGlhblt2XSA6IHBhcnNlRmxvYXQodikpICogRDJSO1xuICAgIH0sXG4gICAgbmFkZ3JpZHM6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIGlmICh2ID09PSAnQG51bGwnKSB7XG4gICAgICAgIHNlbGYuZGF0dW1Db2RlID0gJ25vbmUnO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNlbGYubmFkZ3JpZHMgPSB2O1xuICAgICAgfVxuICAgIH0sXG4gICAgYXhpczogZnVuY3Rpb24odikge1xuICAgICAgdmFyIGxlZ2FsQXhpcyA9IFwiZXduc3VkXCI7XG4gICAgICBpZiAodi5sZW5ndGggPT09IDMgJiYgbGVnYWxBeGlzLmluZGV4T2Yodi5zdWJzdHIoMCwgMSkpICE9PSAtMSAmJiBsZWdhbEF4aXMuaW5kZXhPZih2LnN1YnN0cigxLCAxKSkgIT09IC0xICYmIGxlZ2FsQXhpcy5pbmRleE9mKHYuc3Vic3RyKDIsIDEpKSAhPT0gLTEpIHtcbiAgICAgICAgc2VsZi5heGlzID0gdjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGZvciAocGFyYW1OYW1lIGluIHBhcmFtT2JqKSB7XG4gICAgcGFyYW1WYWwgPSBwYXJhbU9ialtwYXJhbU5hbWVdO1xuICAgIGlmIChwYXJhbU5hbWUgaW4gcGFyYW1zKSB7XG4gICAgICBwYXJhbU91dG5hbWUgPSBwYXJhbXNbcGFyYW1OYW1lXTtcbiAgICAgIGlmICh0eXBlb2YgcGFyYW1PdXRuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBhcmFtT3V0bmFtZShwYXJhbVZhbCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2VsZltwYXJhbU91dG5hbWVdID0gcGFyYW1WYWw7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2VsZltwYXJhbU5hbWVdID0gcGFyYW1WYWw7XG4gICAgfVxuICB9XG4gIGlmKHR5cGVvZiBzZWxmLmRhdHVtQ29kZSA9PT0gJ3N0cmluZycgJiYgc2VsZi5kYXR1bUNvZGUgIT09IFwiV0dTODRcIil7XG4gICAgc2VsZi5kYXR1bUNvZGUgPSBzZWxmLmRhdHVtQ29kZS50b0xvd2VyQ2FzZSgpO1xuICB9XG4gIHJldHVybiBzZWxmO1xufTtcbiIsInZhciBwcm9qcyA9IFtcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9tZXJjJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvbG9uZ2xhdCcpXG5dO1xudmFyIG5hbWVzID0ge307XG52YXIgcHJvalN0b3JlID0gW107XG5cbmZ1bmN0aW9uIGFkZChwcm9qLCBpKSB7XG4gIHZhciBsZW4gPSBwcm9qU3RvcmUubGVuZ3RoO1xuICBpZiAoIXByb2oubmFtZXMpIHtcbiAgICBjb25zb2xlLmxvZyhpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBwcm9qU3RvcmVbbGVuXSA9IHByb2o7XG4gIHByb2oubmFtZXMuZm9yRWFjaChmdW5jdGlvbihuKSB7XG4gICAgbmFtZXNbbi50b0xvd2VyQ2FzZSgpXSA9IGxlbjtcbiAgfSk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5leHBvcnRzLmFkZCA9IGFkZDtcblxuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gIGlmICghbmFtZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgbiA9IG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgaWYgKHR5cGVvZiBuYW1lc1tuXSAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvalN0b3JlW25hbWVzW25dXSkge1xuICAgIHJldHVybiBwcm9qU3RvcmVbbmFtZXNbbl1dO1xuICB9XG59O1xuZXhwb3J0cy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICBwcm9qcy5mb3JFYWNoKGFkZCk7XG59O1xuIiwidmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBtc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tc2ZueicpO1xudmFyIHFzZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL3FzZm56Jyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgYXNpbnogPSByZXF1aXJlKCcuLi9jb21tb24vYXNpbnonKTtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIGlmIChNYXRoLmFicyh0aGlzLmxhdDEgKyB0aGlzLmxhdDIpIDwgRVBTTE4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy50ZW1wID0gdGhpcy5iIC8gdGhpcy5hO1xuICB0aGlzLmVzID0gMSAtIE1hdGgucG93KHRoaXMudGVtcCwgMik7XG4gIHRoaXMuZTMgPSBNYXRoLnNxcnQodGhpcy5lcyk7XG5cbiAgdGhpcy5zaW5fcG8gPSBNYXRoLnNpbih0aGlzLmxhdDEpO1xuICB0aGlzLmNvc19wbyA9IE1hdGguY29zKHRoaXMubGF0MSk7XG4gIHRoaXMudDEgPSB0aGlzLnNpbl9wbztcbiAgdGhpcy5jb24gPSB0aGlzLnNpbl9wbztcbiAgdGhpcy5tczEgPSBtc2Zueih0aGlzLmUzLCB0aGlzLnNpbl9wbywgdGhpcy5jb3NfcG8pO1xuICB0aGlzLnFzMSA9IHFzZm56KHRoaXMuZTMsIHRoaXMuc2luX3BvLCB0aGlzLmNvc19wbyk7XG5cbiAgdGhpcy5zaW5fcG8gPSBNYXRoLnNpbih0aGlzLmxhdDIpO1xuICB0aGlzLmNvc19wbyA9IE1hdGguY29zKHRoaXMubGF0Mik7XG4gIHRoaXMudDIgPSB0aGlzLnNpbl9wbztcbiAgdGhpcy5tczIgPSBtc2Zueih0aGlzLmUzLCB0aGlzLnNpbl9wbywgdGhpcy5jb3NfcG8pO1xuICB0aGlzLnFzMiA9IHFzZm56KHRoaXMuZTMsIHRoaXMuc2luX3BvLCB0aGlzLmNvc19wbyk7XG5cbiAgdGhpcy5zaW5fcG8gPSBNYXRoLnNpbih0aGlzLmxhdDApO1xuICB0aGlzLmNvc19wbyA9IE1hdGguY29zKHRoaXMubGF0MCk7XG4gIHRoaXMudDMgPSB0aGlzLnNpbl9wbztcbiAgdGhpcy5xczAgPSBxc2Zueih0aGlzLmUzLCB0aGlzLnNpbl9wbywgdGhpcy5jb3NfcG8pO1xuXG4gIGlmIChNYXRoLmFicyh0aGlzLmxhdDEgLSB0aGlzLmxhdDIpID4gRVBTTE4pIHtcbiAgICB0aGlzLm5zMCA9ICh0aGlzLm1zMSAqIHRoaXMubXMxIC0gdGhpcy5tczIgKiB0aGlzLm1zMikgLyAodGhpcy5xczIgLSB0aGlzLnFzMSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5uczAgPSB0aGlzLmNvbjtcbiAgfVxuICB0aGlzLmMgPSB0aGlzLm1zMSAqIHRoaXMubXMxICsgdGhpcy5uczAgKiB0aGlzLnFzMTtcbiAgdGhpcy5yaCA9IHRoaXMuYSAqIE1hdGguc3FydCh0aGlzLmMgLSB0aGlzLm5zMCAqIHRoaXMucXMwKSAvIHRoaXMubnMwO1xufTtcblxuLyogQWxiZXJzIENvbmljYWwgRXF1YWwgQXJlYSBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG5cbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcblxuICB0aGlzLnNpbl9waGkgPSBNYXRoLnNpbihsYXQpO1xuICB0aGlzLmNvc19waGkgPSBNYXRoLmNvcyhsYXQpO1xuXG4gIHZhciBxcyA9IHFzZm56KHRoaXMuZTMsIHRoaXMuc2luX3BoaSwgdGhpcy5jb3NfcGhpKTtcbiAgdmFyIHJoMSA9IHRoaXMuYSAqIE1hdGguc3FydCh0aGlzLmMgLSB0aGlzLm5zMCAqIHFzKSAvIHRoaXMubnMwO1xuICB2YXIgdGhldGEgPSB0aGlzLm5zMCAqIGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciB4ID0gcmgxICogTWF0aC5zaW4odGhldGEpICsgdGhpcy54MDtcbiAgdmFyIHkgPSB0aGlzLnJoIC0gcmgxICogTWF0aC5jb3ModGhldGEpICsgdGhpcy55MDtcblxuICBwLnggPSB4O1xuICBwLnkgPSB5O1xuICByZXR1cm4gcDtcbn07XG5cblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgcmgxLCBxcywgY29uLCB0aGV0YSwgbG9uLCBsYXQ7XG5cbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSA9IHRoaXMucmggLSBwLnkgKyB0aGlzLnkwO1xuICBpZiAodGhpcy5uczAgPj0gMCkge1xuICAgIHJoMSA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgIGNvbiA9IDE7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmgxID0gLU1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgIGNvbiA9IC0xO1xuICB9XG4gIHRoZXRhID0gMDtcbiAgaWYgKHJoMSAhPT0gMCkge1xuICAgIHRoZXRhID0gTWF0aC5hdGFuMihjb24gKiBwLngsIGNvbiAqIHAueSk7XG4gIH1cbiAgY29uID0gcmgxICogdGhpcy5uczAgLyB0aGlzLmE7XG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGxhdCA9IE1hdGguYXNpbigodGhpcy5jIC0gY29uICogY29uKSAvICgyICogdGhpcy5uczApKTtcbiAgfVxuICBlbHNlIHtcbiAgICBxcyA9ICh0aGlzLmMgLSBjb24gKiBjb24pIC8gdGhpcy5uczA7XG4gICAgbGF0ID0gdGhpcy5waGkxeih0aGlzLmUzLCBxcyk7XG4gIH1cblxuICBsb24gPSBhZGp1c3RfbG9uKHRoZXRhIC8gdGhpcy5uczAgKyB0aGlzLmxvbmcwKTtcbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcblxuLyogRnVuY3Rpb24gdG8gY29tcHV0ZSBwaGkxLCB0aGUgbGF0aXR1ZGUgZm9yIHRoZSBpbnZlcnNlIG9mIHRoZVxuICAgQWxiZXJzIENvbmljYWwgRXF1YWwtQXJlYSBwcm9qZWN0aW9uLlxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLnBoaTF6ID0gZnVuY3Rpb24oZWNjZW50LCBxcykge1xuICB2YXIgc2lucGhpLCBjb3NwaGksIGNvbiwgY29tLCBkcGhpO1xuICB2YXIgcGhpID0gYXNpbnooMC41ICogcXMpO1xuICBpZiAoZWNjZW50IDwgRVBTTE4pIHtcbiAgICByZXR1cm4gcGhpO1xuICB9XG5cbiAgdmFyIGVjY250cyA9IGVjY2VudCAqIGVjY2VudDtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPD0gMjU7IGkrKykge1xuICAgIHNpbnBoaSA9IE1hdGguc2luKHBoaSk7XG4gICAgY29zcGhpID0gTWF0aC5jb3MocGhpKTtcbiAgICBjb24gPSBlY2NlbnQgKiBzaW5waGk7XG4gICAgY29tID0gMSAtIGNvbiAqIGNvbjtcbiAgICBkcGhpID0gMC41ICogY29tICogY29tIC8gY29zcGhpICogKHFzIC8gKDEgLSBlY2NudHMpIC0gc2lucGhpIC8gY29tICsgMC41IC8gZWNjZW50ICogTWF0aC5sb2coKDEgLSBjb24pIC8gKDEgKyBjb24pKSk7XG4gICAgcGhpID0gcGhpICsgZHBoaTtcbiAgICBpZiAoTWF0aC5hYnMoZHBoaSkgPD0gMWUtNykge1xuICAgICAgcmV0dXJuIHBoaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIkFsYmVyc19Db25pY19FcXVhbF9BcmVhXCIsIFwiQWxiZXJzXCIsIFwiYWVhXCJdO1xuIiwidmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIG1sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vbWxmbicpO1xudmFyIGUwZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTBmbicpO1xudmFyIGUxZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTFmbicpO1xudmFyIGUyZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTJmbicpO1xudmFyIGUzZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTNmbicpO1xudmFyIGdOID0gcmVxdWlyZSgnLi4vY29tbW9uL2dOJyk7XG52YXIgYXNpbnogPSByZXF1aXJlKCcuLi9jb21tb24vYXNpbnonKTtcbnZhciBpbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9pbWxmbicpO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2luX3AxMiA9IE1hdGguc2luKHRoaXMubGF0MCk7XG4gIHRoaXMuY29zX3AxMiA9IE1hdGguY29zKHRoaXMubGF0MCk7XG59O1xuXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIHZhciBzaW5waGkgPSBNYXRoLnNpbihwLnkpO1xuICB2YXIgY29zcGhpID0gTWF0aC5jb3MocC55KTtcbiAgdmFyIGRsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICB2YXIgZTAsIGUxLCBlMiwgZTMsIE1scCwgTWwsIHRhbnBoaSwgTmwxLCBObCwgcHNpLCBBeiwgRywgSCwgR0gsIEhzLCBjLCBrcCwgY29zX2MsIHMsIHMyLCBzMywgczQsIHM1O1xuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBpZiAoTWF0aC5hYnModGhpcy5zaW5fcDEyIC0gMSkgPD0gRVBTTE4pIHtcbiAgICAgIC8vTm9ydGggUG9sZSBjYXNlXG4gICAgICBwLnggPSB0aGlzLngwICsgdGhpcy5hICogKEhBTEZfUEkgLSBsYXQpICogTWF0aC5zaW4oZGxvbik7XG4gICAgICBwLnkgPSB0aGlzLnkwIC0gdGhpcy5hICogKEhBTEZfUEkgLSBsYXQpICogTWF0aC5jb3MoZGxvbik7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZWxzZSBpZiAoTWF0aC5hYnModGhpcy5zaW5fcDEyICsgMSkgPD0gRVBTTE4pIHtcbiAgICAgIC8vU291dGggUG9sZSBjYXNlXG4gICAgICBwLnggPSB0aGlzLngwICsgdGhpcy5hICogKEhBTEZfUEkgKyBsYXQpICogTWF0aC5zaW4oZGxvbik7XG4gICAgICBwLnkgPSB0aGlzLnkwICsgdGhpcy5hICogKEhBTEZfUEkgKyBsYXQpICogTWF0aC5jb3MoZGxvbik7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvL2RlZmF1bHQgY2FzZVxuICAgICAgY29zX2MgPSB0aGlzLnNpbl9wMTIgKiBzaW5waGkgKyB0aGlzLmNvc19wMTIgKiBjb3NwaGkgKiBNYXRoLmNvcyhkbG9uKTtcbiAgICAgIGMgPSBNYXRoLmFjb3MoY29zX2MpO1xuICAgICAga3AgPSBjIC8gTWF0aC5zaW4oYyk7XG4gICAgICBwLnggPSB0aGlzLngwICsgdGhpcy5hICoga3AgKiBjb3NwaGkgKiBNYXRoLnNpbihkbG9uKTtcbiAgICAgIHAueSA9IHRoaXMueTAgKyB0aGlzLmEgKiBrcCAqICh0aGlzLmNvc19wMTIgKiBzaW5waGkgLSB0aGlzLnNpbl9wMTIgKiBjb3NwaGkgKiBNYXRoLmNvcyhkbG9uKSk7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgZTAgPSBlMGZuKHRoaXMuZXMpO1xuICAgIGUxID0gZTFmbih0aGlzLmVzKTtcbiAgICBlMiA9IGUyZm4odGhpcy5lcyk7XG4gICAgZTMgPSBlM2ZuKHRoaXMuZXMpO1xuICAgIGlmIChNYXRoLmFicyh0aGlzLnNpbl9wMTIgLSAxKSA8PSBFUFNMTikge1xuICAgICAgLy9Ob3J0aCBQb2xlIGNhc2VcbiAgICAgIE1scCA9IHRoaXMuYSAqIG1sZm4oZTAsIGUxLCBlMiwgZTMsIEhBTEZfUEkpO1xuICAgICAgTWwgPSB0aGlzLmEgKiBtbGZuKGUwLCBlMSwgZTIsIGUzLCBsYXQpO1xuICAgICAgcC54ID0gdGhpcy54MCArIChNbHAgLSBNbCkgKiBNYXRoLnNpbihkbG9uKTtcbiAgICAgIHAueSA9IHRoaXMueTAgLSAoTWxwIC0gTWwpICogTWF0aC5jb3MoZGxvbik7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZWxzZSBpZiAoTWF0aC5hYnModGhpcy5zaW5fcDEyICsgMSkgPD0gRVBTTE4pIHtcbiAgICAgIC8vU291dGggUG9sZSBjYXNlXG4gICAgICBNbHAgPSB0aGlzLmEgKiBtbGZuKGUwLCBlMSwgZTIsIGUzLCBIQUxGX1BJKTtcbiAgICAgIE1sID0gdGhpcy5hICogbWxmbihlMCwgZTEsIGUyLCBlMywgbGF0KTtcbiAgICAgIHAueCA9IHRoaXMueDAgKyAoTWxwICsgTWwpICogTWF0aC5zaW4oZGxvbik7XG4gICAgICBwLnkgPSB0aGlzLnkwICsgKE1scCArIE1sKSAqIE1hdGguY29zKGRsb24pO1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy9EZWZhdWx0IGNhc2VcbiAgICAgIHRhbnBoaSA9IHNpbnBoaSAvIGNvc3BoaTtcbiAgICAgIE5sMSA9IGdOKHRoaXMuYSwgdGhpcy5lLCB0aGlzLnNpbl9wMTIpO1xuICAgICAgTmwgPSBnTih0aGlzLmEsIHRoaXMuZSwgc2lucGhpKTtcbiAgICAgIHBzaSA9IE1hdGguYXRhbigoMSAtIHRoaXMuZXMpICogdGFucGhpICsgdGhpcy5lcyAqIE5sMSAqIHRoaXMuc2luX3AxMiAvIChObCAqIGNvc3BoaSkpO1xuICAgICAgQXogPSBNYXRoLmF0YW4yKE1hdGguc2luKGRsb24pLCB0aGlzLmNvc19wMTIgKiBNYXRoLnRhbihwc2kpIC0gdGhpcy5zaW5fcDEyICogTWF0aC5jb3MoZGxvbikpO1xuICAgICAgaWYgKEF6ID09PSAwKSB7XG4gICAgICAgIHMgPSBNYXRoLmFzaW4odGhpcy5jb3NfcDEyICogTWF0aC5zaW4ocHNpKSAtIHRoaXMuc2luX3AxMiAqIE1hdGguY29zKHBzaSkpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoTWF0aC5hYnMoTWF0aC5hYnMoQXopIC0gTWF0aC5QSSkgPD0gRVBTTE4pIHtcbiAgICAgICAgcyA9IC1NYXRoLmFzaW4odGhpcy5jb3NfcDEyICogTWF0aC5zaW4ocHNpKSAtIHRoaXMuc2luX3AxMiAqIE1hdGguY29zKHBzaSkpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHMgPSBNYXRoLmFzaW4oTWF0aC5zaW4oZGxvbikgKiBNYXRoLmNvcyhwc2kpIC8gTWF0aC5zaW4oQXopKTtcbiAgICAgIH1cbiAgICAgIEcgPSB0aGlzLmUgKiB0aGlzLnNpbl9wMTIgLyBNYXRoLnNxcnQoMSAtIHRoaXMuZXMpO1xuICAgICAgSCA9IHRoaXMuZSAqIHRoaXMuY29zX3AxMiAqIE1hdGguY29zKEF6KSAvIE1hdGguc3FydCgxIC0gdGhpcy5lcyk7XG4gICAgICBHSCA9IEcgKiBIO1xuICAgICAgSHMgPSBIICogSDtcbiAgICAgIHMyID0gcyAqIHM7XG4gICAgICBzMyA9IHMyICogcztcbiAgICAgIHM0ID0gczMgKiBzO1xuICAgICAgczUgPSBzNCAqIHM7XG4gICAgICBjID0gTmwxICogcyAqICgxIC0gczIgKiBIcyAqICgxIC0gSHMpIC8gNiArIHMzIC8gOCAqIEdIICogKDEgLSAyICogSHMpICsgczQgLyAxMjAgKiAoSHMgKiAoNCAtIDcgKiBIcykgLSAzICogRyAqIEcgKiAoMSAtIDcgKiBIcykpIC0gczUgLyA0OCAqIEdIKTtcbiAgICAgIHAueCA9IHRoaXMueDAgKyBjICogTWF0aC5zaW4oQXopO1xuICAgICAgcC55ID0gdGhpcy55MCArIGMgKiBNYXRoLmNvcyhBeik7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gIH1cblxuXG59O1xuXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgLT0gdGhpcy55MDtcbiAgdmFyIHJoLCB6LCBzaW56LCBjb3N6LCBsb24sIGxhdCwgY29uLCBlMCwgZTEsIGUyLCBlMywgTWxwLCBNLCBOMSwgcHNpLCBBeiwgY29zQXosIHRtcCwgQSwgQiwgRCwgRWUsIEY7XG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHJoID0gTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gICAgaWYgKHJoID4gKDIgKiBIQUxGX1BJICogdGhpcy5hKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB6ID0gcmggLyB0aGlzLmE7XG5cbiAgICBzaW56ID0gTWF0aC5zaW4oeik7XG4gICAgY29zeiA9IE1hdGguY29zKHopO1xuXG4gICAgbG9uID0gdGhpcy5sb25nMDtcbiAgICBpZiAoTWF0aC5hYnMocmgpIDw9IEVQU0xOKSB7XG4gICAgICBsYXQgPSB0aGlzLmxhdDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbGF0ID0gYXNpbnooY29zeiAqIHRoaXMuc2luX3AxMiArIChwLnkgKiBzaW56ICogdGhpcy5jb3NfcDEyKSAvIHJoKTtcbiAgICAgIGNvbiA9IE1hdGguYWJzKHRoaXMubGF0MCkgLSBIQUxGX1BJO1xuICAgICAgaWYgKE1hdGguYWJzKGNvbikgPD0gRVBTTE4pIHtcbiAgICAgICAgaWYgKHRoaXMubGF0MCA+PSAwKSB7XG4gICAgICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLngsIC0gcC55KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwIC0gTWF0aC5hdGFuMigtcC54LCBwLnkpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8qY29uID0gY29zeiAtIHRoaXMuc2luX3AxMiAqIE1hdGguc2luKGxhdCk7XG4gICAgICAgIGlmICgoTWF0aC5hYnMoY29uKSA8IEVQU0xOKSAmJiAoTWF0aC5hYnMocC54KSA8IEVQU0xOKSkge1xuICAgICAgICAgIC8vbm8tb3AsIGp1c3Qga2VlcCB0aGUgbG9uIHZhbHVlIGFzIGlzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHRlbXAgPSBNYXRoLmF0YW4yKChwLnggKiBzaW56ICogdGhpcy5jb3NfcDEyKSwgKGNvbiAqIHJoKSk7XG4gICAgICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMigocC54ICogc2lueiAqIHRoaXMuY29zX3AxMiksIChjb24gKiByaCkpKTtcbiAgICAgICAgfSovXG4gICAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXRhbjIocC54ICogc2lueiwgcmggKiB0aGlzLmNvc19wMTIgKiBjb3N6IC0gcC55ICogdGhpcy5zaW5fcDEyICogc2lueikpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHAueCA9IGxvbjtcbiAgICBwLnkgPSBsYXQ7XG4gICAgcmV0dXJuIHA7XG4gIH1cbiAgZWxzZSB7XG4gICAgZTAgPSBlMGZuKHRoaXMuZXMpO1xuICAgIGUxID0gZTFmbih0aGlzLmVzKTtcbiAgICBlMiA9IGUyZm4odGhpcy5lcyk7XG4gICAgZTMgPSBlM2ZuKHRoaXMuZXMpO1xuICAgIGlmIChNYXRoLmFicyh0aGlzLnNpbl9wMTIgLSAxKSA8PSBFUFNMTikge1xuICAgICAgLy9Ob3J0aCBwb2xlIGNhc2VcbiAgICAgIE1scCA9IHRoaXMuYSAqIG1sZm4oZTAsIGUxLCBlMiwgZTMsIEhBTEZfUEkpO1xuICAgICAgcmggPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgICAgIE0gPSBNbHAgLSByaDtcbiAgICAgIGxhdCA9IGltbGZuKE0gLyB0aGlzLmEsIGUwLCBlMSwgZTIsIGUzKTtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXRhbjIocC54LCAtIDEgKiBwLnkpKTtcbiAgICAgIHAueCA9IGxvbjtcbiAgICAgIHAueSA9IGxhdDtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBlbHNlIGlmIChNYXRoLmFicyh0aGlzLnNpbl9wMTIgKyAxKSA8PSBFUFNMTikge1xuICAgICAgLy9Tb3V0aCBwb2xlIGNhc2VcbiAgICAgIE1scCA9IHRoaXMuYSAqIG1sZm4oZTAsIGUxLCBlMiwgZTMsIEhBTEZfUEkpO1xuICAgICAgcmggPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgICAgIE0gPSByaCAtIE1scDtcblxuICAgICAgbGF0ID0gaW1sZm4oTSAvIHRoaXMuYSwgZTAsIGUxLCBlMiwgZTMpO1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLngsIHAueSkpO1xuICAgICAgcC54ID0gbG9uO1xuICAgICAgcC55ID0gbGF0O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy9kZWZhdWx0IGNhc2VcbiAgICAgIHJoID0gTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gICAgICBBeiA9IE1hdGguYXRhbjIocC54LCBwLnkpO1xuICAgICAgTjEgPSBnTih0aGlzLmEsIHRoaXMuZSwgdGhpcy5zaW5fcDEyKTtcbiAgICAgIGNvc0F6ID0gTWF0aC5jb3MoQXopO1xuICAgICAgdG1wID0gdGhpcy5lICogdGhpcy5jb3NfcDEyICogY29zQXo7XG4gICAgICBBID0gLXRtcCAqIHRtcCAvICgxIC0gdGhpcy5lcyk7XG4gICAgICBCID0gMyAqIHRoaXMuZXMgKiAoMSAtIEEpICogdGhpcy5zaW5fcDEyICogdGhpcy5jb3NfcDEyICogY29zQXogLyAoMSAtIHRoaXMuZXMpO1xuICAgICAgRCA9IHJoIC8gTjE7XG4gICAgICBFZSA9IEQgLSBBICogKDEgKyBBKSAqIE1hdGgucG93KEQsIDMpIC8gNiAtIEIgKiAoMSArIDMgKiBBKSAqIE1hdGgucG93KEQsIDQpIC8gMjQ7XG4gICAgICBGID0gMSAtIEEgKiBFZSAqIEVlIC8gMiAtIEQgKiBFZSAqIEVlICogRWUgLyA2O1xuICAgICAgcHNpID0gTWF0aC5hc2luKHRoaXMuc2luX3AxMiAqIE1hdGguY29zKEVlKSArIHRoaXMuY29zX3AxMiAqIE1hdGguc2luKEVlKSAqIGNvc0F6KTtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXNpbihNYXRoLnNpbihBeikgKiBNYXRoLnNpbihFZSkgLyBNYXRoLmNvcyhwc2kpKSk7XG4gICAgICBsYXQgPSBNYXRoLmF0YW4oKDEgLSB0aGlzLmVzICogRiAqIHRoaXMuc2luX3AxMiAvIE1hdGguc2luKHBzaSkpICogTWF0aC50YW4ocHNpKSAvICgxIC0gdGhpcy5lcykpO1xuICAgICAgcC54ID0gbG9uO1xuICAgICAgcC55ID0gbGF0O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICB9XG5cbn07XG5leHBvcnRzLm5hbWVzID0gW1wiQXppbXV0aGFsX0VxdWlkaXN0YW50XCIsIFwiYWVxZFwiXTtcbiIsInZhciBtbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL21sZm4nKTtcbnZhciBlMGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UwZm4nKTtcbnZhciBlMWZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UxZm4nKTtcbnZhciBlMmZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UyZm4nKTtcbnZhciBlM2ZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UzZm4nKTtcbnZhciBnTiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9nTicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIGFkanVzdF9sYXQgPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xhdCcpO1xudmFyIGltbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2ltbGZuJyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLnNwaGVyZSkge1xuICAgIHRoaXMuZTAgPSBlMGZuKHRoaXMuZXMpO1xuICAgIHRoaXMuZTEgPSBlMWZuKHRoaXMuZXMpO1xuICAgIHRoaXMuZTIgPSBlMmZuKHRoaXMuZXMpO1xuICAgIHRoaXMuZTMgPSBlM2ZuKHRoaXMuZXMpO1xuICAgIHRoaXMubWwwID0gdGhpcy5hICogbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCB0aGlzLmxhdDApO1xuICB9XG59O1xuXG5cblxuLyogQ2Fzc2luaSBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuXG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHZhciB4LCB5O1xuICB2YXIgbGFtID0gcC54O1xuICB2YXIgcGhpID0gcC55O1xuICBsYW0gPSBhZGp1c3RfbG9uKGxhbSAtIHRoaXMubG9uZzApO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHggPSB0aGlzLmEgKiBNYXRoLmFzaW4oTWF0aC5jb3MocGhpKSAqIE1hdGguc2luKGxhbSkpO1xuICAgIHkgPSB0aGlzLmEgKiAoTWF0aC5hdGFuMihNYXRoLnRhbihwaGkpLCBNYXRoLmNvcyhsYW0pKSAtIHRoaXMubGF0MCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgLy9lbGxpcHNvaWRcbiAgICB2YXIgc2lucGhpID0gTWF0aC5zaW4ocGhpKTtcbiAgICB2YXIgY29zcGhpID0gTWF0aC5jb3MocGhpKTtcbiAgICB2YXIgbmwgPSBnTih0aGlzLmEsIHRoaXMuZSwgc2lucGhpKTtcbiAgICB2YXIgdGwgPSBNYXRoLnRhbihwaGkpICogTWF0aC50YW4ocGhpKTtcbiAgICB2YXIgYWwgPSBsYW0gKiBNYXRoLmNvcyhwaGkpO1xuICAgIHZhciBhc3EgPSBhbCAqIGFsO1xuICAgIHZhciBjbCA9IHRoaXMuZXMgKiBjb3NwaGkgKiBjb3NwaGkgLyAoMSAtIHRoaXMuZXMpO1xuICAgIHZhciBtbCA9IHRoaXMuYSAqIG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgcGhpKTtcblxuICAgIHggPSBubCAqIGFsICogKDEgLSBhc3EgKiB0bCAqICgxIC8gNiAtICg4IC0gdGwgKyA4ICogY2wpICogYXNxIC8gMTIwKSk7XG4gICAgeSA9IG1sIC0gdGhpcy5tbDAgKyBubCAqIHNpbnBoaSAvIGNvc3BoaSAqIGFzcSAqICgwLjUgKyAoNSAtIHRsICsgNiAqIGNsKSAqIGFzcSAvIDI0KTtcblxuXG4gIH1cblxuICBwLnggPSB4ICsgdGhpcy54MDtcbiAgcC55ID0geSArIHRoaXMueTA7XG4gIHJldHVybiBwO1xufTtcblxuLyogSW52ZXJzZSBlcXVhdGlvbnNcbiAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICBwLnggLT0gdGhpcy54MDtcbiAgcC55IC09IHRoaXMueTA7XG4gIHZhciB4ID0gcC54IC8gdGhpcy5hO1xuICB2YXIgeSA9IHAueSAvIHRoaXMuYTtcbiAgdmFyIHBoaSwgbGFtO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHZhciBkZCA9IHkgKyB0aGlzLmxhdDA7XG4gICAgcGhpID0gTWF0aC5hc2luKE1hdGguc2luKGRkKSAqIE1hdGguY29zKHgpKTtcbiAgICBsYW0gPSBNYXRoLmF0YW4yKE1hdGgudGFuKHgpLCBNYXRoLmNvcyhkZCkpO1xuICB9XG4gIGVsc2Uge1xuICAgIC8qIGVsbGlwc29pZCAqL1xuICAgIHZhciBtbDEgPSB0aGlzLm1sMCAvIHRoaXMuYSArIHk7XG4gICAgdmFyIHBoaTEgPSBpbWxmbihtbDEsIHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMpO1xuICAgIGlmIChNYXRoLmFicyhNYXRoLmFicyhwaGkxKSAtIEhBTEZfUEkpIDw9IEVQU0xOKSB7XG4gICAgICBwLnggPSB0aGlzLmxvbmcwO1xuICAgICAgcC55ID0gSEFMRl9QSTtcbiAgICAgIGlmICh5IDwgMCkge1xuICAgICAgICBwLnkgKj0gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgdmFyIG5sMSA9IGdOKHRoaXMuYSwgdGhpcy5lLCBNYXRoLnNpbihwaGkxKSk7XG5cbiAgICB2YXIgcmwxID0gbmwxICogbmwxICogbmwxIC8gdGhpcy5hIC8gdGhpcy5hICogKDEgLSB0aGlzLmVzKTtcbiAgICB2YXIgdGwxID0gTWF0aC5wb3coTWF0aC50YW4ocGhpMSksIDIpO1xuICAgIHZhciBkbCA9IHggKiB0aGlzLmEgLyBubDE7XG4gICAgdmFyIGRzcSA9IGRsICogZGw7XG4gICAgcGhpID0gcGhpMSAtIG5sMSAqIE1hdGgudGFuKHBoaTEpIC8gcmwxICogZGwgKiBkbCAqICgwLjUgLSAoMSArIDMgKiB0bDEpICogZGwgKiBkbCAvIDI0KTtcbiAgICBsYW0gPSBkbCAqICgxIC0gZHNxICogKHRsMSAvIDMgKyAoMSArIDMgKiB0bDEpICogdGwxICogZHNxIC8gMTUpKSAvIE1hdGguY29zKHBoaTEpO1xuXG4gIH1cblxuICBwLnggPSBhZGp1c3RfbG9uKGxhbSArIHRoaXMubG9uZzApO1xuICBwLnkgPSBhZGp1c3RfbGF0KHBoaSk7XG4gIHJldHVybiBwO1xuXG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIkNhc3NpbmlcIiwgXCJDYXNzaW5pX1NvbGRuZXJcIiwgXCJjYXNzXCJdOyIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBxc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9xc2ZueicpO1xudmFyIG1zZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL21zZm56Jyk7XG52YXIgaXFzZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL2lxc2ZueicpO1xuLypcbiAgcmVmZXJlbmNlOiAgXG4gICAgXCJDYXJ0b2dyYXBoaWMgUHJvamVjdGlvbiBQcm9jZWR1cmVzIGZvciB0aGUgVU5JWCBFbnZpcm9ubWVudC1cbiAgICBBIFVzZXIncyBNYW51YWxcIiBieSBHZXJhbGQgSS4gRXZlbmRlbixcbiAgICBVU0dTIE9wZW4gRmlsZSBSZXBvcnQgOTAtMjg0YW5kIFJlbGVhc2UgNCBJbnRlcmltIFJlcG9ydHMgKDIwMDMpXG4qL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIC8vbm8tb3BcbiAgaWYgKCF0aGlzLnNwaGVyZSkge1xuICAgIHRoaXMuazAgPSBtc2Zueih0aGlzLmUsIE1hdGguc2luKHRoaXMubGF0X3RzKSwgTWF0aC5jb3ModGhpcy5sYXRfdHMpKTtcbiAgfVxufTtcblxuXG4vKiBDeWxpbmRyaWNhbCBFcXVhbCBBcmVhIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIHZhciB4LCB5O1xuICAvKiBGb3J3YXJkIGVxdWF0aW9uc1xuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICB2YXIgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHggPSB0aGlzLngwICsgdGhpcy5hICogZGxvbiAqIE1hdGguY29zKHRoaXMubGF0X3RzKTtcbiAgICB5ID0gdGhpcy55MCArIHRoaXMuYSAqIE1hdGguc2luKGxhdCkgLyBNYXRoLmNvcyh0aGlzLmxhdF90cyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIHFzID0gcXNmbnoodGhpcy5lLCBNYXRoLnNpbihsYXQpKTtcbiAgICB4ID0gdGhpcy54MCArIHRoaXMuYSAqIHRoaXMuazAgKiBkbG9uO1xuICAgIHkgPSB0aGlzLnkwICsgdGhpcy5hICogcXMgKiAwLjUgLyB0aGlzLmswO1xuICB9XG5cbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBDeWxpbmRyaWNhbCBFcXVhbCBBcmVhIGludmVyc2UgZXF1YXRpb25zLS1tYXBwaW5nIHgseSB0byBsYXQvbG9uZ1xuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgLT0gdGhpcy55MDtcbiAgdmFyIGxvbiwgbGF0O1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIChwLnggLyB0aGlzLmEpIC8gTWF0aC5jb3ModGhpcy5sYXRfdHMpKTtcbiAgICBsYXQgPSBNYXRoLmFzaW4oKHAueSAvIHRoaXMuYSkgKiBNYXRoLmNvcyh0aGlzLmxhdF90cykpO1xuICB9XG4gIGVsc2Uge1xuICAgIGxhdCA9IGlxc2Zueih0aGlzLmUsIDIgKiBwLnkgKiB0aGlzLmswIC8gdGhpcy5hKTtcbiAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBwLnggLyAodGhpcy5hICogdGhpcy5rMCkpO1xuICB9XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJjZWFcIl07XG4iLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgYWRqdXN0X2xhdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbGF0Jyk7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcblxuICB0aGlzLngwID0gdGhpcy54MCB8fCAwO1xuICB0aGlzLnkwID0gdGhpcy55MCB8fCAwO1xuICB0aGlzLmxhdDAgPSB0aGlzLmxhdDAgfHwgMDtcbiAgdGhpcy5sb25nMCA9IHRoaXMubG9uZzAgfHwgMDtcbiAgdGhpcy5sYXRfdHMgPSB0aGlzLmxhdF90cyB8fCAwO1xuICB0aGlzLnRpdGxlID0gdGhpcy50aXRsZSB8fCBcIkVxdWlkaXN0YW50IEN5bGluZHJpY2FsIChQbGF0ZSBDYXJyZSlcIjtcblxuICB0aGlzLnJjID0gTWF0aC5jb3ModGhpcy5sYXRfdHMpO1xufTtcblxuXG4vLyBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG5cbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcblxuICB2YXIgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciBkbGF0ID0gYWRqdXN0X2xhdChsYXQgLSB0aGlzLmxhdDApO1xuICBwLnggPSB0aGlzLngwICsgKHRoaXMuYSAqIGRsb24gKiB0aGlzLnJjKTtcbiAgcC55ID0gdGhpcy55MCArICh0aGlzLmEgKiBkbGF0KTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vLyBpbnZlcnNlIGVxdWF0aW9ucy0tbWFwcGluZyB4LHkgdG8gbGF0L2xvbmdcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG5cbiAgdmFyIHggPSBwLng7XG4gIHZhciB5ID0gcC55O1xuXG4gIHAueCA9IGFkanVzdF9sb24odGhpcy5sb25nMCArICgoeCAtIHRoaXMueDApIC8gKHRoaXMuYSAqIHRoaXMucmMpKSk7XG4gIHAueSA9IGFkanVzdF9sYXQodGhpcy5sYXQwICsgKCh5IC0gdGhpcy55MCkgLyAodGhpcy5hKSkpO1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiRXF1aXJlY3Rhbmd1bGFyXCIsIFwiRXF1aWRpc3RhbnRfQ3lsaW5kcmljYWxcIiwgXCJlcWNcIl07XG4iLCJ2YXIgZTBmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMGZuJyk7XG52YXIgZTFmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMWZuJyk7XG52YXIgZTJmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMmZuJyk7XG52YXIgZTNmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lM2ZuJyk7XG52YXIgbXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vbXNmbnonKTtcbnZhciBtbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL21sZm4nKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBhZGp1c3RfbGF0ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sYXQnKTtcbnZhciBpbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9pbWxmbicpO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIC8qIFBsYWNlIHBhcmFtZXRlcnMgaW4gc3RhdGljIHN0b3JhZ2UgZm9yIGNvbW1vbiB1c2VcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICAvLyBTdGFuZGFyZCBQYXJhbGxlbHMgY2Fubm90IGJlIGVxdWFsIGFuZCBvbiBvcHBvc2l0ZSBzaWRlcyBvZiB0aGUgZXF1YXRvclxuICBpZiAoTWF0aC5hYnModGhpcy5sYXQxICsgdGhpcy5sYXQyKSA8IEVQU0xOKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMubGF0MiA9IHRoaXMubGF0MiB8fCB0aGlzLmxhdDE7XG4gIHRoaXMudGVtcCA9IHRoaXMuYiAvIHRoaXMuYTtcbiAgdGhpcy5lcyA9IDEgLSBNYXRoLnBvdyh0aGlzLnRlbXAsIDIpO1xuICB0aGlzLmUgPSBNYXRoLnNxcnQodGhpcy5lcyk7XG4gIHRoaXMuZTAgPSBlMGZuKHRoaXMuZXMpO1xuICB0aGlzLmUxID0gZTFmbih0aGlzLmVzKTtcbiAgdGhpcy5lMiA9IGUyZm4odGhpcy5lcyk7XG4gIHRoaXMuZTMgPSBlM2ZuKHRoaXMuZXMpO1xuXG4gIHRoaXMuc2lucGhpID0gTWF0aC5zaW4odGhpcy5sYXQxKTtcbiAgdGhpcy5jb3NwaGkgPSBNYXRoLmNvcyh0aGlzLmxhdDEpO1xuXG4gIHRoaXMubXMxID0gbXNmbnoodGhpcy5lLCB0aGlzLnNpbnBoaSwgdGhpcy5jb3NwaGkpO1xuICB0aGlzLm1sMSA9IG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgdGhpcy5sYXQxKTtcblxuICBpZiAoTWF0aC5hYnModGhpcy5sYXQxIC0gdGhpcy5sYXQyKSA8IEVQU0xOKSB7XG4gICAgdGhpcy5ucyA9IHRoaXMuc2lucGhpO1xuICB9XG4gIGVsc2Uge1xuICAgIHRoaXMuc2lucGhpID0gTWF0aC5zaW4odGhpcy5sYXQyKTtcbiAgICB0aGlzLmNvc3BoaSA9IE1hdGguY29zKHRoaXMubGF0Mik7XG4gICAgdGhpcy5tczIgPSBtc2Zueih0aGlzLmUsIHRoaXMuc2lucGhpLCB0aGlzLmNvc3BoaSk7XG4gICAgdGhpcy5tbDIgPSBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIHRoaXMubGF0Mik7XG4gICAgdGhpcy5ucyA9ICh0aGlzLm1zMSAtIHRoaXMubXMyKSAvICh0aGlzLm1sMiAtIHRoaXMubWwxKTtcbiAgfVxuICB0aGlzLmcgPSB0aGlzLm1sMSArIHRoaXMubXMxIC8gdGhpcy5ucztcbiAgdGhpcy5tbDAgPSBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIHRoaXMubGF0MCk7XG4gIHRoaXMucmggPSB0aGlzLmEgKiAodGhpcy5nIC0gdGhpcy5tbDApO1xufTtcblxuXG4vKiBFcXVpZGlzdGFudCBDb25pYyBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICB2YXIgcmgxO1xuXG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHJoMSA9IHRoaXMuYSAqICh0aGlzLmcgLSBsYXQpO1xuICB9XG4gIGVsc2Uge1xuICAgIHZhciBtbCA9IG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgbGF0KTtcbiAgICByaDEgPSB0aGlzLmEgKiAodGhpcy5nIC0gbWwpO1xuICB9XG4gIHZhciB0aGV0YSA9IHRoaXMubnMgKiBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICB2YXIgeCA9IHRoaXMueDAgKyByaDEgKiBNYXRoLnNpbih0aGV0YSk7XG4gIHZhciB5ID0gdGhpcy55MCArIHRoaXMucmggLSByaDEgKiBNYXRoLmNvcyh0aGV0YSk7XG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuLyogSW52ZXJzZSBlcXVhdGlvbnNcbiAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICBwLnggLT0gdGhpcy54MDtcbiAgcC55ID0gdGhpcy5yaCAtIHAueSArIHRoaXMueTA7XG4gIHZhciBjb24sIHJoMSwgbGF0LCBsb247XG4gIGlmICh0aGlzLm5zID49IDApIHtcbiAgICByaDEgPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgICBjb24gPSAxO1xuICB9XG4gIGVsc2Uge1xuICAgIHJoMSA9IC1NYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgICBjb24gPSAtMTtcbiAgfVxuICB2YXIgdGhldGEgPSAwO1xuICBpZiAocmgxICE9PSAwKSB7XG4gICAgdGhldGEgPSBNYXRoLmF0YW4yKGNvbiAqIHAueCwgY29uICogcC55KTtcbiAgfVxuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIHRoZXRhIC8gdGhpcy5ucyk7XG4gICAgbGF0ID0gYWRqdXN0X2xhdCh0aGlzLmcgLSByaDEgLyB0aGlzLmEpO1xuICAgIHAueCA9IGxvbjtcbiAgICBwLnkgPSBsYXQ7XG4gICAgcmV0dXJuIHA7XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIG1sID0gdGhpcy5nIC0gcmgxIC8gdGhpcy5hO1xuICAgIGxhdCA9IGltbGZuKG1sLCB0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzKTtcbiAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyB0aGV0YSAvIHRoaXMubnMpO1xuICAgIHAueCA9IGxvbjtcbiAgICBwLnkgPSBsYXQ7XG4gICAgcmV0dXJuIHA7XG4gIH1cblxufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJFcXVpZGlzdGFudF9Db25pY1wiLCBcImVxZGNcIl07XG4iLCJ2YXIgRk9SVFBJID0gTWF0aC5QSS80O1xudmFyIHNyYXQgPSByZXF1aXJlKCcuLi9jb21tb24vc3JhdCcpO1xudmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgTUFYX0lURVIgPSAyMDtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3BoaSA9IE1hdGguc2luKHRoaXMubGF0MCk7XG4gIHZhciBjcGhpID0gTWF0aC5jb3ModGhpcy5sYXQwKTtcbiAgY3BoaSAqPSBjcGhpO1xuICB0aGlzLnJjID0gTWF0aC5zcXJ0KDEgLSB0aGlzLmVzKSAvICgxIC0gdGhpcy5lcyAqIHNwaGkgKiBzcGhpKTtcbiAgdGhpcy5DID0gTWF0aC5zcXJ0KDEgKyB0aGlzLmVzICogY3BoaSAqIGNwaGkgLyAoMSAtIHRoaXMuZXMpKTtcbiAgdGhpcy5waGljMCA9IE1hdGguYXNpbihzcGhpIC8gdGhpcy5DKTtcbiAgdGhpcy5yYXRleHAgPSAwLjUgKiB0aGlzLkMgKiB0aGlzLmU7XG4gIHRoaXMuSyA9IE1hdGgudGFuKDAuNSAqIHRoaXMucGhpYzAgKyBGT1JUUEkpIC8gKE1hdGgucG93KE1hdGgudGFuKDAuNSAqIHRoaXMubGF0MCArIEZPUlRQSSksIHRoaXMuQykgKiBzcmF0KHRoaXMuZSAqIHNwaGksIHRoaXMucmF0ZXhwKSk7XG59O1xuXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG5cbiAgcC55ID0gMiAqIE1hdGguYXRhbih0aGlzLksgKiBNYXRoLnBvdyhNYXRoLnRhbigwLjUgKiBsYXQgKyBGT1JUUEkpLCB0aGlzLkMpICogc3JhdCh0aGlzLmUgKiBNYXRoLnNpbihsYXQpLCB0aGlzLnJhdGV4cCkpIC0gSEFMRl9QSTtcbiAgcC54ID0gdGhpcy5DICogbG9uO1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIERFTF9UT0wgPSAxZS0xNDtcbiAgdmFyIGxvbiA9IHAueCAvIHRoaXMuQztcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIG51bSA9IE1hdGgucG93KE1hdGgudGFuKDAuNSAqIGxhdCArIEZPUlRQSSkgLyB0aGlzLkssIDEgLyB0aGlzLkMpO1xuICBmb3IgKHZhciBpID0gTUFYX0lURVI7IGkgPiAwOyAtLWkpIHtcbiAgICBsYXQgPSAyICogTWF0aC5hdGFuKG51bSAqIHNyYXQodGhpcy5lICogTWF0aC5zaW4ocC55KSwgLSAwLjUgKiB0aGlzLmUpKSAtIEhBTEZfUEk7XG4gICAgaWYgKE1hdGguYWJzKGxhdCAtIHAueSkgPCBERUxfVE9MKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgcC55ID0gbGF0O1xuICB9XG4gIC8qIGNvbnZlcmdlbmNlIGZhaWxlZCAqL1xuICBpZiAoIWkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcImdhdXNzXCJdO1xuIiwidmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBhc2lueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hc2lueicpO1xuXG4vKlxuICByZWZlcmVuY2U6XG4gICAgV29sZnJhbSBNYXRod29ybGQgXCJHbm9tb25pYyBQcm9qZWN0aW9uXCJcbiAgICBodHRwOi8vbWF0aHdvcmxkLndvbGZyYW0uY29tL0dub21vbmljUHJvamVjdGlvbi5odG1sXG4gICAgQWNjZXNzZWQ6IDEydGggTm92ZW1iZXIgMjAwOVxuICAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgLyogUGxhY2UgcGFyYW1ldGVycyBpbiBzdGF0aWMgc3RvcmFnZSBmb3IgY29tbW9uIHVzZVxuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIHRoaXMuc2luX3AxNCA9IE1hdGguc2luKHRoaXMubGF0MCk7XG4gIHRoaXMuY29zX3AxNCA9IE1hdGguY29zKHRoaXMubGF0MCk7XG4gIC8vIEFwcHJveGltYXRpb24gZm9yIHByb2plY3RpbmcgcG9pbnRzIHRvIHRoZSBob3Jpem9uIChpbmZpbml0eSlcbiAgdGhpcy5pbmZpbml0eV9kaXN0ID0gMTAwMCAqIHRoaXMuYTtcbiAgdGhpcy5yYyA9IDE7XG59O1xuXG5cbi8qIEdub21vbmljIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBzaW5waGksIGNvc3BoaTsgLyogc2luIGFuZCBjb3MgdmFsdWUgICAgICAgICovXG4gIHZhciBkbG9uOyAvKiBkZWx0YSBsb25naXR1ZGUgdmFsdWUgICAgICAqL1xuICB2YXIgY29zbG9uOyAvKiBjb3Mgb2YgbG9uZ2l0dWRlICAgICAgICAqL1xuICB2YXIga3NwOyAvKiBzY2FsZSBmYWN0b3IgICAgICAgICAgKi9cbiAgdmFyIGc7XG4gIHZhciB4LCB5O1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICAvKiBGb3J3YXJkIGVxdWF0aW9uc1xuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcblxuICBzaW5waGkgPSBNYXRoLnNpbihsYXQpO1xuICBjb3NwaGkgPSBNYXRoLmNvcyhsYXQpO1xuXG4gIGNvc2xvbiA9IE1hdGguY29zKGRsb24pO1xuICBnID0gdGhpcy5zaW5fcDE0ICogc2lucGhpICsgdGhpcy5jb3NfcDE0ICogY29zcGhpICogY29zbG9uO1xuICBrc3AgPSAxO1xuICBpZiAoKGcgPiAwKSB8fCAoTWF0aC5hYnMoZykgPD0gRVBTTE4pKSB7XG4gICAgeCA9IHRoaXMueDAgKyB0aGlzLmEgKiBrc3AgKiBjb3NwaGkgKiBNYXRoLnNpbihkbG9uKSAvIGc7XG4gICAgeSA9IHRoaXMueTAgKyB0aGlzLmEgKiBrc3AgKiAodGhpcy5jb3NfcDE0ICogc2lucGhpIC0gdGhpcy5zaW5fcDE0ICogY29zcGhpICogY29zbG9uKSAvIGc7XG4gIH1cbiAgZWxzZSB7XG5cbiAgICAvLyBQb2ludCBpcyBpbiB0aGUgb3Bwb3NpbmcgaGVtaXNwaGVyZSBhbmQgaXMgdW5wcm9qZWN0YWJsZVxuICAgIC8vIFdlIHN0aWxsIG5lZWQgdG8gcmV0dXJuIGEgcmVhc29uYWJsZSBwb2ludCwgc28gd2UgcHJvamVjdCBcbiAgICAvLyB0byBpbmZpbml0eSwgb24gYSBiZWFyaW5nIFxuICAgIC8vIGVxdWl2YWxlbnQgdG8gdGhlIG5vcnRoZXJuIGhlbWlzcGhlcmUgZXF1aXZhbGVudFxuICAgIC8vIFRoaXMgaXMgYSByZWFzb25hYmxlIGFwcHJveGltYXRpb24gZm9yIHNob3J0IHNoYXBlcyBhbmQgbGluZXMgdGhhdCBcbiAgICAvLyBzdHJhZGRsZSB0aGUgaG9yaXpvbi5cblxuICAgIHggPSB0aGlzLngwICsgdGhpcy5pbmZpbml0eV9kaXN0ICogY29zcGhpICogTWF0aC5zaW4oZGxvbik7XG4gICAgeSA9IHRoaXMueTAgKyB0aGlzLmluZmluaXR5X2Rpc3QgKiAodGhpcy5jb3NfcDE0ICogc2lucGhpIC0gdGhpcy5zaW5fcDE0ICogY29zcGhpICogY29zbG9uKTtcblxuICB9XG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciByaDsgLyogUmhvICovXG4gIHZhciBzaW5jLCBjb3NjO1xuICB2YXIgYztcbiAgdmFyIGxvbiwgbGF0O1xuXG4gIC8qIEludmVyc2UgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHAueCA9IChwLnggLSB0aGlzLngwKSAvIHRoaXMuYTtcbiAgcC55ID0gKHAueSAtIHRoaXMueTApIC8gdGhpcy5hO1xuXG4gIHAueCAvPSB0aGlzLmswO1xuICBwLnkgLz0gdGhpcy5rMDtcblxuICBpZiAoKHJoID0gTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSkpKSB7XG4gICAgYyA9IE1hdGguYXRhbjIocmgsIHRoaXMucmMpO1xuICAgIHNpbmMgPSBNYXRoLnNpbihjKTtcbiAgICBjb3NjID0gTWF0aC5jb3MoYyk7XG5cbiAgICBsYXQgPSBhc2lueihjb3NjICogdGhpcy5zaW5fcDE0ICsgKHAueSAqIHNpbmMgKiB0aGlzLmNvc19wMTQpIC8gcmgpO1xuICAgIGxvbiA9IE1hdGguYXRhbjIocC54ICogc2luYywgcmggKiB0aGlzLmNvc19wMTQgKiBjb3NjIC0gcC55ICogdGhpcy5zaW5fcDE0ICogc2luYyk7XG4gICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgbG9uKTtcbiAgfVxuICBlbHNlIHtcbiAgICBsYXQgPSB0aGlzLnBoaWMwO1xuICAgIGxvbiA9IDA7XG4gIH1cblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcImdub21cIl07XG4iLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5hID0gNjM3NzM5Ny4xNTU7XG4gIHRoaXMuZXMgPSAwLjAwNjY3NDM3MjIzMDYxNDtcbiAgdGhpcy5lID0gTWF0aC5zcXJ0KHRoaXMuZXMpO1xuICBpZiAoIXRoaXMubGF0MCkge1xuICAgIHRoaXMubGF0MCA9IDAuODYzOTM3OTc5NzM3MTkzO1xuICB9XG4gIGlmICghdGhpcy5sb25nMCkge1xuICAgIHRoaXMubG9uZzAgPSAwLjc0MTc2NDkzMjA5NzU5MDEgLSAwLjMwODM0MTUwMTE4NTY2NTtcbiAgfVxuICAvKiBpZiBzY2FsZSBub3Qgc2V0IGRlZmF1bHQgdG8gMC45OTk5ICovXG4gIGlmICghdGhpcy5rMCkge1xuICAgIHRoaXMuazAgPSAwLjk5OTk7XG4gIH1cbiAgdGhpcy5zNDUgPSAwLjc4NTM5ODE2MzM5NzQ0ODsgLyogNDUgKi9cbiAgdGhpcy5zOTAgPSAyICogdGhpcy5zNDU7XG4gIHRoaXMuZmkwID0gdGhpcy5sYXQwO1xuICB0aGlzLmUyID0gdGhpcy5lcztcbiAgdGhpcy5lID0gTWF0aC5zcXJ0KHRoaXMuZTIpO1xuICB0aGlzLmFsZmEgPSBNYXRoLnNxcnQoMSArICh0aGlzLmUyICogTWF0aC5wb3coTWF0aC5jb3ModGhpcy5maTApLCA0KSkgLyAoMSAtIHRoaXMuZTIpKTtcbiAgdGhpcy51cSA9IDEuMDQyMTY4NTYzODA0NzQ7XG4gIHRoaXMudTAgPSBNYXRoLmFzaW4oTWF0aC5zaW4odGhpcy5maTApIC8gdGhpcy5hbGZhKTtcbiAgdGhpcy5nID0gTWF0aC5wb3coKDEgKyB0aGlzLmUgKiBNYXRoLnNpbih0aGlzLmZpMCkpIC8gKDEgLSB0aGlzLmUgKiBNYXRoLnNpbih0aGlzLmZpMCkpLCB0aGlzLmFsZmEgKiB0aGlzLmUgLyAyKTtcbiAgdGhpcy5rID0gTWF0aC50YW4odGhpcy51MCAvIDIgKyB0aGlzLnM0NSkgLyBNYXRoLnBvdyhNYXRoLnRhbih0aGlzLmZpMCAvIDIgKyB0aGlzLnM0NSksIHRoaXMuYWxmYSkgKiB0aGlzLmc7XG4gIHRoaXMuazEgPSB0aGlzLmswO1xuICB0aGlzLm4wID0gdGhpcy5hICogTWF0aC5zcXJ0KDEgLSB0aGlzLmUyKSAvICgxIC0gdGhpcy5lMiAqIE1hdGgucG93KE1hdGguc2luKHRoaXMuZmkwKSwgMikpO1xuICB0aGlzLnMwID0gMS4zNzAwODM0NjI4MTU1NTtcbiAgdGhpcy5uID0gTWF0aC5zaW4odGhpcy5zMCk7XG4gIHRoaXMucm8wID0gdGhpcy5rMSAqIHRoaXMubjAgLyBNYXRoLnRhbih0aGlzLnMwKTtcbiAgdGhpcy5hZCA9IHRoaXMuczkwIC0gdGhpcy51cTtcbn07XG5cbi8qIGVsbGlwc29pZCAqL1xuLyogY2FsY3VsYXRlIHh5IGZyb20gbGF0L2xvbiAqL1xuLyogQ29uc3RhbnRzLCBpZGVudGljYWwgdG8gaW52ZXJzZSB0cmFuc2Zvcm0gZnVuY3Rpb24gKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGdmaSwgdSwgZGVsdGF2LCBzLCBkLCBlcHMsIHJvO1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICB2YXIgZGVsdGFfbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgLyogVHJhbnNmb3JtYXRpb24gKi9cbiAgZ2ZpID0gTWF0aC5wb3coKCgxICsgdGhpcy5lICogTWF0aC5zaW4obGF0KSkgLyAoMSAtIHRoaXMuZSAqIE1hdGguc2luKGxhdCkpKSwgKHRoaXMuYWxmYSAqIHRoaXMuZSAvIDIpKTtcbiAgdSA9IDIgKiAoTWF0aC5hdGFuKHRoaXMuayAqIE1hdGgucG93KE1hdGgudGFuKGxhdCAvIDIgKyB0aGlzLnM0NSksIHRoaXMuYWxmYSkgLyBnZmkpIC0gdGhpcy5zNDUpO1xuICBkZWx0YXYgPSAtZGVsdGFfbG9uICogdGhpcy5hbGZhO1xuICBzID0gTWF0aC5hc2luKE1hdGguY29zKHRoaXMuYWQpICogTWF0aC5zaW4odSkgKyBNYXRoLnNpbih0aGlzLmFkKSAqIE1hdGguY29zKHUpICogTWF0aC5jb3MoZGVsdGF2KSk7XG4gIGQgPSBNYXRoLmFzaW4oTWF0aC5jb3ModSkgKiBNYXRoLnNpbihkZWx0YXYpIC8gTWF0aC5jb3MocykpO1xuICBlcHMgPSB0aGlzLm4gKiBkO1xuICBybyA9IHRoaXMucm8wICogTWF0aC5wb3coTWF0aC50YW4odGhpcy5zMCAvIDIgKyB0aGlzLnM0NSksIHRoaXMubikgLyBNYXRoLnBvdyhNYXRoLnRhbihzIC8gMiArIHRoaXMuczQ1KSwgdGhpcy5uKTtcbiAgcC55ID0gcm8gKiBNYXRoLmNvcyhlcHMpIC8gMTtcbiAgcC54ID0gcm8gKiBNYXRoLnNpbihlcHMpIC8gMTtcblxuICBpZiAoIXRoaXMuY3plY2gpIHtcbiAgICBwLnkgKj0gLTE7XG4gICAgcC54ICo9IC0xO1xuICB9XG4gIHJldHVybiAocCk7XG59O1xuXG4vKiBjYWxjdWxhdGUgbGF0L2xvbiBmcm9tIHh5ICovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciB1LCBkZWx0YXYsIHMsIGQsIGVwcywgcm8sIGZpMTtcbiAgdmFyIG9rO1xuXG4gIC8qIFRyYW5zZm9ybWF0aW9uICovXG4gIC8qIHJldmVydCB5LCB4Ki9cbiAgdmFyIHRtcCA9IHAueDtcbiAgcC54ID0gcC55O1xuICBwLnkgPSB0bXA7XG4gIGlmICghdGhpcy5jemVjaCkge1xuICAgIHAueSAqPSAtMTtcbiAgICBwLnggKj0gLTE7XG4gIH1cbiAgcm8gPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgZXBzID0gTWF0aC5hdGFuMihwLnksIHAueCk7XG4gIGQgPSBlcHMgLyBNYXRoLnNpbih0aGlzLnMwKTtcbiAgcyA9IDIgKiAoTWF0aC5hdGFuKE1hdGgucG93KHRoaXMucm8wIC8gcm8sIDEgLyB0aGlzLm4pICogTWF0aC50YW4odGhpcy5zMCAvIDIgKyB0aGlzLnM0NSkpIC0gdGhpcy5zNDUpO1xuICB1ID0gTWF0aC5hc2luKE1hdGguY29zKHRoaXMuYWQpICogTWF0aC5zaW4ocykgLSBNYXRoLnNpbih0aGlzLmFkKSAqIE1hdGguY29zKHMpICogTWF0aC5jb3MoZCkpO1xuICBkZWx0YXYgPSBNYXRoLmFzaW4oTWF0aC5jb3MocykgKiBNYXRoLnNpbihkKSAvIE1hdGguY29zKHUpKTtcbiAgcC54ID0gdGhpcy5sb25nMCAtIGRlbHRhdiAvIHRoaXMuYWxmYTtcbiAgZmkxID0gdTtcbiAgb2sgPSAwO1xuICB2YXIgaXRlciA9IDA7XG4gIGRvIHtcbiAgICBwLnkgPSAyICogKE1hdGguYXRhbihNYXRoLnBvdyh0aGlzLmssIC0gMSAvIHRoaXMuYWxmYSkgKiBNYXRoLnBvdyhNYXRoLnRhbih1IC8gMiArIHRoaXMuczQ1KSwgMSAvIHRoaXMuYWxmYSkgKiBNYXRoLnBvdygoMSArIHRoaXMuZSAqIE1hdGguc2luKGZpMSkpIC8gKDEgLSB0aGlzLmUgKiBNYXRoLnNpbihmaTEpKSwgdGhpcy5lIC8gMikpIC0gdGhpcy5zNDUpO1xuICAgIGlmIChNYXRoLmFicyhmaTEgLSBwLnkpIDwgMC4wMDAwMDAwMDAxKSB7XG4gICAgICBvayA9IDE7XG4gICAgfVxuICAgIGZpMSA9IHAueTtcbiAgICBpdGVyICs9IDE7XG4gIH0gd2hpbGUgKG9rID09PSAwICYmIGl0ZXIgPCAxNSk7XG4gIGlmIChpdGVyID49IDE1KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gKHApO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJLcm92YWtcIiwgXCJrcm92YWtcIl07XG4iLCJ2YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBGT1JUUEkgPSBNYXRoLlBJLzQ7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIHFzZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL3FzZm56Jyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG4vKlxuICByZWZlcmVuY2VcbiAgICBcIk5ldyBFcXVhbC1BcmVhIE1hcCBQcm9qZWN0aW9ucyBmb3IgTm9uY2lyY3VsYXIgUmVnaW9uc1wiLCBKb2huIFAuIFNueWRlcixcbiAgICBUaGUgQW1lcmljYW4gQ2FydG9ncmFwaGVyLCBWb2wgMTUsIE5vLiA0LCBPY3RvYmVyIDE5ODgsIHBwLiAzNDEtMzU1LlxuICAqL1xuXG5leHBvcnRzLlNfUE9MRSA9IDE7XG5leHBvcnRzLk5fUE9MRSA9IDI7XG5leHBvcnRzLkVRVUlUID0gMztcbmV4cG9ydHMuT0JMSVEgPSA0O1xuXG5cbi8qIEluaXRpYWxpemUgdGhlIExhbWJlcnQgQXppbXV0aGFsIEVxdWFsIEFyZWEgcHJvamVjdGlvblxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gTWF0aC5hYnModGhpcy5sYXQwKTtcbiAgaWYgKE1hdGguYWJzKHQgLSBIQUxGX1BJKSA8IEVQU0xOKSB7XG4gICAgdGhpcy5tb2RlID0gdGhpcy5sYXQwIDwgMCA/IHRoaXMuU19QT0xFIDogdGhpcy5OX1BPTEU7XG4gIH1cbiAgZWxzZSBpZiAoTWF0aC5hYnModCkgPCBFUFNMTikge1xuICAgIHRoaXMubW9kZSA9IHRoaXMuRVFVSVQ7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5tb2RlID0gdGhpcy5PQkxJUTtcbiAgfVxuICBpZiAodGhpcy5lcyA+IDApIHtcbiAgICB2YXIgc2lucGhpO1xuXG4gICAgdGhpcy5xcCA9IHFzZm56KHRoaXMuZSwgMSk7XG4gICAgdGhpcy5tbWYgPSAwLjUgLyAoMSAtIHRoaXMuZXMpO1xuICAgIHRoaXMuYXBhID0gdGhpcy5hdXRoc2V0KHRoaXMuZXMpO1xuICAgIHN3aXRjaCAodGhpcy5tb2RlKSB7XG4gICAgY2FzZSB0aGlzLk5fUE9MRTpcbiAgICAgIHRoaXMuZGQgPSAxO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLlNfUE9MRTpcbiAgICAgIHRoaXMuZGQgPSAxO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLkVRVUlUOlxuICAgICAgdGhpcy5ycSA9IE1hdGguc3FydCgwLjUgKiB0aGlzLnFwKTtcbiAgICAgIHRoaXMuZGQgPSAxIC8gdGhpcy5ycTtcbiAgICAgIHRoaXMueG1mID0gMTtcbiAgICAgIHRoaXMueW1mID0gMC41ICogdGhpcy5xcDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5PQkxJUTpcbiAgICAgIHRoaXMucnEgPSBNYXRoLnNxcnQoMC41ICogdGhpcy5xcCk7XG4gICAgICBzaW5waGkgPSBNYXRoLnNpbih0aGlzLmxhdDApO1xuICAgICAgdGhpcy5zaW5iMSA9IHFzZm56KHRoaXMuZSwgc2lucGhpKSAvIHRoaXMucXA7XG4gICAgICB0aGlzLmNvc2IxID0gTWF0aC5zcXJ0KDEgLSB0aGlzLnNpbmIxICogdGhpcy5zaW5iMSk7XG4gICAgICB0aGlzLmRkID0gTWF0aC5jb3ModGhpcy5sYXQwKSAvIChNYXRoLnNxcnQoMSAtIHRoaXMuZXMgKiBzaW5waGkgKiBzaW5waGkpICogdGhpcy5ycSAqIHRoaXMuY29zYjEpO1xuICAgICAgdGhpcy55bWYgPSAodGhpcy54bWYgPSB0aGlzLnJxKSAvIHRoaXMuZGQ7XG4gICAgICB0aGlzLnhtZiAqPSB0aGlzLmRkO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuT0JMSVEpIHtcbiAgICAgIHRoaXMuc2lucGgwID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgICAgIHRoaXMuY29zcGgwID0gTWF0aC5jb3ModGhpcy5sYXQwKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qIExhbWJlcnQgQXppbXV0aGFsIEVxdWFsIEFyZWEgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcblxuICAvKiBGb3J3YXJkIGVxdWF0aW9uc1xuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICB2YXIgeCwgeSwgY29zbGFtLCBzaW5sYW0sIHNpbnBoaSwgcSwgc2luYiwgY29zYiwgYiwgY29zcGhpO1xuICB2YXIgbGFtID0gcC54O1xuICB2YXIgcGhpID0gcC55O1xuXG4gIGxhbSA9IGFkanVzdF9sb24obGFtIC0gdGhpcy5sb25nMCk7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgc2lucGhpID0gTWF0aC5zaW4ocGhpKTtcbiAgICBjb3NwaGkgPSBNYXRoLmNvcyhwaGkpO1xuICAgIGNvc2xhbSA9IE1hdGguY29zKGxhbSk7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSB8fCB0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQpIHtcbiAgICAgIHkgPSAodGhpcy5tb2RlID09PSB0aGlzLkVRVUlUKSA/IDEgKyBjb3NwaGkgKiBjb3NsYW0gOiAxICsgdGhpcy5zaW5waDAgKiBzaW5waGkgKyB0aGlzLmNvc3BoMCAqIGNvc3BoaSAqIGNvc2xhbTtcbiAgICAgIGlmICh5IDw9IEVQU0xOKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgeSA9IE1hdGguc3FydCgyIC8geSk7XG4gICAgICB4ID0geSAqIGNvc3BoaSAqIE1hdGguc2luKGxhbSk7XG4gICAgICB5ICo9ICh0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQpID8gc2lucGhpIDogdGhpcy5jb3NwaDAgKiBzaW5waGkgLSB0aGlzLnNpbnBoMCAqIGNvc3BoaSAqIGNvc2xhbTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5tb2RlID09PSB0aGlzLk5fUE9MRSB8fCB0aGlzLm1vZGUgPT09IHRoaXMuU19QT0xFKSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSB0aGlzLk5fUE9MRSkge1xuICAgICAgICBjb3NsYW0gPSAtY29zbGFtO1xuICAgICAgfVxuICAgICAgaWYgKE1hdGguYWJzKHBoaSArIHRoaXMucGhpMCkgPCBFUFNMTikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHkgPSBGT1JUUEkgLSBwaGkgKiAwLjU7XG4gICAgICB5ID0gMiAqICgodGhpcy5tb2RlID09PSB0aGlzLlNfUE9MRSkgPyBNYXRoLmNvcyh5KSA6IE1hdGguc2luKHkpKTtcbiAgICAgIHggPSB5ICogTWF0aC5zaW4obGFtKTtcbiAgICAgIHkgKj0gY29zbGFtO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBzaW5iID0gMDtcbiAgICBjb3NiID0gMDtcbiAgICBiID0gMDtcbiAgICBjb3NsYW0gPSBNYXRoLmNvcyhsYW0pO1xuICAgIHNpbmxhbSA9IE1hdGguc2luKGxhbSk7XG4gICAgc2lucGhpID0gTWF0aC5zaW4ocGhpKTtcbiAgICBxID0gcXNmbnoodGhpcy5lLCBzaW5waGkpO1xuICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuT0JMSVEgfHwgdGhpcy5tb2RlID09PSB0aGlzLkVRVUlUKSB7XG4gICAgICBzaW5iID0gcSAvIHRoaXMucXA7XG4gICAgICBjb3NiID0gTWF0aC5zcXJ0KDEgLSBzaW5iICogc2luYik7XG4gICAgfVxuICAgIHN3aXRjaCAodGhpcy5tb2RlKSB7XG4gICAgY2FzZSB0aGlzLk9CTElROlxuICAgICAgYiA9IDEgKyB0aGlzLnNpbmIxICogc2luYiArIHRoaXMuY29zYjEgKiBjb3NiICogY29zbGFtO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLkVRVUlUOlxuICAgICAgYiA9IDEgKyBjb3NiICogY29zbGFtO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLk5fUE9MRTpcbiAgICAgIGIgPSBIQUxGX1BJICsgcGhpO1xuICAgICAgcSA9IHRoaXMucXAgLSBxO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLlNfUE9MRTpcbiAgICAgIGIgPSBwaGkgLSBIQUxGX1BJO1xuICAgICAgcSA9IHRoaXMucXAgKyBxO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChNYXRoLmFicyhiKSA8IEVQU0xOKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgc3dpdGNoICh0aGlzLm1vZGUpIHtcbiAgICBjYXNlIHRoaXMuT0JMSVE6XG4gICAgY2FzZSB0aGlzLkVRVUlUOlxuICAgICAgYiA9IE1hdGguc3FydCgyIC8gYik7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSB0aGlzLk9CTElRKSB7XG4gICAgICAgIHkgPSB0aGlzLnltZiAqIGIgKiAodGhpcy5jb3NiMSAqIHNpbmIgLSB0aGlzLnNpbmIxICogY29zYiAqIGNvc2xhbSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgeSA9IChiID0gTWF0aC5zcXJ0KDIgLyAoMSArIGNvc2IgKiBjb3NsYW0pKSkgKiBzaW5iICogdGhpcy55bWY7XG4gICAgICB9XG4gICAgICB4ID0gdGhpcy54bWYgKiBiICogY29zYiAqIHNpbmxhbTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5OX1BPTEU6XG4gICAgY2FzZSB0aGlzLlNfUE9MRTpcbiAgICAgIGlmIChxID49IDApIHtcbiAgICAgICAgeCA9IChiID0gTWF0aC5zcXJ0KHEpKSAqIHNpbmxhbTtcbiAgICAgICAgeSA9IGNvc2xhbSAqICgodGhpcy5tb2RlID09PSB0aGlzLlNfUE9MRSkgPyBiIDogLWIpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHggPSB5ID0gMDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHAueCA9IHRoaXMuYSAqIHggKyB0aGlzLngwO1xuICBwLnkgPSB0aGlzLmEgKiB5ICsgdGhpcy55MDtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBJbnZlcnNlIGVxdWF0aW9uc1xuICAtLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgLT0gdGhpcy55MDtcbiAgdmFyIHggPSBwLnggLyB0aGlzLmE7XG4gIHZhciB5ID0gcC55IC8gdGhpcy5hO1xuICB2YXIgbGFtLCBwaGksIGNDZSwgc0NlLCBxLCByaG8sIGFiO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHZhciBjb3N6ID0gMCxcbiAgICAgIHJoLCBzaW56ID0gMDtcblxuICAgIHJoID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xuICAgIHBoaSA9IHJoICogMC41O1xuICAgIGlmIChwaGkgPiAxKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcGhpID0gMiAqIE1hdGguYXNpbihwaGkpO1xuICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuT0JMSVEgfHwgdGhpcy5tb2RlID09PSB0aGlzLkVRVUlUKSB7XG4gICAgICBzaW56ID0gTWF0aC5zaW4ocGhpKTtcbiAgICAgIGNvc3ogPSBNYXRoLmNvcyhwaGkpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHRoaXMubW9kZSkge1xuICAgIGNhc2UgdGhpcy5FUVVJVDpcbiAgICAgIHBoaSA9IChNYXRoLmFicyhyaCkgPD0gRVBTTE4pID8gMCA6IE1hdGguYXNpbih5ICogc2lueiAvIHJoKTtcbiAgICAgIHggKj0gc2luejtcbiAgICAgIHkgPSBjb3N6ICogcmg7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuT0JMSVE6XG4gICAgICBwaGkgPSAoTWF0aC5hYnMocmgpIDw9IEVQU0xOKSA/IHRoaXMucGhpMCA6IE1hdGguYXNpbihjb3N6ICogdGhpcy5zaW5waDAgKyB5ICogc2lueiAqIHRoaXMuY29zcGgwIC8gcmgpO1xuICAgICAgeCAqPSBzaW56ICogdGhpcy5jb3NwaDA7XG4gICAgICB5ID0gKGNvc3ogLSBNYXRoLnNpbihwaGkpICogdGhpcy5zaW5waDApICogcmg7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuTl9QT0xFOlxuICAgICAgeSA9IC15O1xuICAgICAgcGhpID0gSEFMRl9QSSAtIHBoaTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5TX1BPTEU6XG4gICAgICBwaGkgLT0gSEFMRl9QSTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsYW0gPSAoeSA9PT0gMCAmJiAodGhpcy5tb2RlID09PSB0aGlzLkVRVUlUIHx8IHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSkpID8gMCA6IE1hdGguYXRhbjIoeCwgeSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgYWIgPSAwO1xuICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuT0JMSVEgfHwgdGhpcy5tb2RlID09PSB0aGlzLkVRVUlUKSB7XG4gICAgICB4IC89IHRoaXMuZGQ7XG4gICAgICB5ICo9IHRoaXMuZGQ7XG4gICAgICByaG8gPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG4gICAgICBpZiAocmhvIDwgRVBTTE4pIHtcbiAgICAgICAgcC54ID0gMDtcbiAgICAgICAgcC55ID0gdGhpcy5waGkwO1xuICAgICAgICByZXR1cm4gcDtcbiAgICAgIH1cbiAgICAgIHNDZSA9IDIgKiBNYXRoLmFzaW4oMC41ICogcmhvIC8gdGhpcy5ycSk7XG4gICAgICBjQ2UgPSBNYXRoLmNvcyhzQ2UpO1xuICAgICAgeCAqPSAoc0NlID0gTWF0aC5zaW4oc0NlKSk7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSB0aGlzLk9CTElRKSB7XG4gICAgICAgIGFiID0gY0NlICogdGhpcy5zaW5iMSArIHkgKiBzQ2UgKiB0aGlzLmNvc2IxIC8gcmhvO1xuICAgICAgICBxID0gdGhpcy5xcCAqIGFiO1xuICAgICAgICB5ID0gcmhvICogdGhpcy5jb3NiMSAqIGNDZSAtIHkgKiB0aGlzLnNpbmIxICogc0NlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGFiID0geSAqIHNDZSAvIHJobztcbiAgICAgICAgcSA9IHRoaXMucXAgKiBhYjtcbiAgICAgICAgeSA9IHJobyAqIGNDZTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5tb2RlID09PSB0aGlzLk5fUE9MRSB8fCB0aGlzLm1vZGUgPT09IHRoaXMuU19QT0xFKSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSB0aGlzLk5fUE9MRSkge1xuICAgICAgICB5ID0gLXk7XG4gICAgICB9XG4gICAgICBxID0gKHggKiB4ICsgeSAqIHkpO1xuICAgICAgaWYgKCFxKSB7XG4gICAgICAgIHAueCA9IDA7XG4gICAgICAgIHAueSA9IHRoaXMucGhpMDtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgICB9XG4gICAgICBhYiA9IDEgLSBxIC8gdGhpcy5xcDtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuU19QT0xFKSB7XG4gICAgICAgIGFiID0gLWFiO1xuICAgICAgfVxuICAgIH1cbiAgICBsYW0gPSBNYXRoLmF0YW4yKHgsIHkpO1xuICAgIHBoaSA9IHRoaXMuYXV0aGxhdChNYXRoLmFzaW4oYWIpLCB0aGlzLmFwYSk7XG4gIH1cblxuXG4gIHAueCA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIGxhbSk7XG4gIHAueSA9IHBoaTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBkZXRlcm1pbmUgbGF0aXR1ZGUgZnJvbSBhdXRoYWxpYyBsYXRpdHVkZSAqL1xuZXhwb3J0cy5QMDAgPSAwLjMzMzMzMzMzMzMzMzMzMzMzMzMzO1xuZXhwb3J0cy5QMDEgPSAwLjE3MjIyMjIyMjIyMjIyMjIyMjIyO1xuZXhwb3J0cy5QMDIgPSAwLjEwMjU3OTM2NTA3OTM2NTA3OTM2O1xuZXhwb3J0cy5QMTAgPSAwLjA2Mzg4ODg4ODg4ODg4ODg4ODg4O1xuZXhwb3J0cy5QMTEgPSAwLjA2NjQwMjExNjQwMjExNjQwMjExO1xuZXhwb3J0cy5QMjAgPSAwLjAxNjQxNTAxMjk0MjE5MTU0NDQzO1xuXG5leHBvcnRzLmF1dGhzZXQgPSBmdW5jdGlvbihlcykge1xuICB2YXIgdDtcbiAgdmFyIEFQQSA9IFtdO1xuICBBUEFbMF0gPSBlcyAqIHRoaXMuUDAwO1xuICB0ID0gZXMgKiBlcztcbiAgQVBBWzBdICs9IHQgKiB0aGlzLlAwMTtcbiAgQVBBWzFdID0gdCAqIHRoaXMuUDEwO1xuICB0ICo9IGVzO1xuICBBUEFbMF0gKz0gdCAqIHRoaXMuUDAyO1xuICBBUEFbMV0gKz0gdCAqIHRoaXMuUDExO1xuICBBUEFbMl0gPSB0ICogdGhpcy5QMjA7XG4gIHJldHVybiBBUEE7XG59O1xuXG5leHBvcnRzLmF1dGhsYXQgPSBmdW5jdGlvbihiZXRhLCBBUEEpIHtcbiAgdmFyIHQgPSBiZXRhICsgYmV0YTtcbiAgcmV0dXJuIChiZXRhICsgQVBBWzBdICogTWF0aC5zaW4odCkgKyBBUEFbMV0gKiBNYXRoLnNpbih0ICsgdCkgKyBBUEFbMl0gKiBNYXRoLnNpbih0ICsgdCArIHQpKTtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiTGFtYmVydCBBemltdXRoYWwgRXF1YWwgQXJlYVwiLCBcIkxhbWJlcnRfQXppbXV0aGFsX0VxdWFsX0FyZWFcIiwgXCJsYWVhXCJdO1xuIiwidmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBtc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tc2ZueicpO1xudmFyIHRzZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL3RzZm56Jyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBzaWduID0gcmVxdWlyZSgnLi4vY29tbW9uL3NpZ24nKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBwaGkyeiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9waGkyeicpO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgLy8gYXJyYXkgb2Y6ICByX21haixyX21pbixsYXQxLGxhdDIsY19sb24sY19sYXQsZmFsc2VfZWFzdCxmYWxzZV9ub3J0aFxuICAvL2RvdWJsZSBjX2xhdDsgICAgICAgICAgICAgICAgICAgLyogY2VudGVyIGxhdGl0dWRlICAgICAgICAgICAgICAgICAgICAgICovXG4gIC8vZG91YmxlIGNfbG9uOyAgICAgICAgICAgICAgICAgICAvKiBjZW50ZXIgbG9uZ2l0dWRlICAgICAgICAgICAgICAgICAgICAgKi9cbiAgLy9kb3VibGUgbGF0MTsgICAgICAgICAgICAgICAgICAgIC8qIGZpcnN0IHN0YW5kYXJkIHBhcmFsbGVsICAgICAgICAgICAgICAqL1xuICAvL2RvdWJsZSBsYXQyOyAgICAgICAgICAgICAgICAgICAgLyogc2Vjb25kIHN0YW5kYXJkIHBhcmFsbGVsICAgICAgICAgICAgICovXG4gIC8vZG91YmxlIHJfbWFqOyAgICAgICAgICAgICAgICAgICAvKiBtYWpvciBheGlzICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgLy9kb3VibGUgcl9taW47ICAgICAgICAgICAgICAgICAgIC8qIG1pbm9yIGF4aXMgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAvL2RvdWJsZSBmYWxzZV9lYXN0OyAgICAgICAgICAgICAgLyogeCBvZmZzZXQgaW4gbWV0ZXJzICAgICAgICAgICAgICAgICAgICovXG4gIC8vZG91YmxlIGZhbHNlX25vcnRoOyAgICAgICAgICAgICAvKiB5IG9mZnNldCBpbiBtZXRlcnMgICAgICAgICAgICAgICAgICAgKi9cblxuICBpZiAoIXRoaXMubGF0Mikge1xuICAgIHRoaXMubGF0MiA9IHRoaXMubGF0MTtcbiAgfSAvL2lmIGxhdDIgaXMgbm90IGRlZmluZWRcbiAgaWYgKCF0aGlzLmswKSB7XG4gICAgdGhpcy5rMCA9IDE7XG4gIH1cbiAgdGhpcy54MCA9IHRoaXMueDAgfHwgMDtcbiAgdGhpcy55MCA9IHRoaXMueTAgfHwgMDtcbiAgLy8gU3RhbmRhcmQgUGFyYWxsZWxzIGNhbm5vdCBiZSBlcXVhbCBhbmQgb24gb3Bwb3NpdGUgc2lkZXMgb2YgdGhlIGVxdWF0b3JcbiAgaWYgKE1hdGguYWJzKHRoaXMubGF0MSArIHRoaXMubGF0MikgPCBFUFNMTikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB0ZW1wID0gdGhpcy5iIC8gdGhpcy5hO1xuICB0aGlzLmUgPSBNYXRoLnNxcnQoMSAtIHRlbXAgKiB0ZW1wKTtcblxuICB2YXIgc2luMSA9IE1hdGguc2luKHRoaXMubGF0MSk7XG4gIHZhciBjb3MxID0gTWF0aC5jb3ModGhpcy5sYXQxKTtcbiAgdmFyIG1zMSA9IG1zZm56KHRoaXMuZSwgc2luMSwgY29zMSk7XG4gIHZhciB0czEgPSB0c2Zueih0aGlzLmUsIHRoaXMubGF0MSwgc2luMSk7XG5cbiAgdmFyIHNpbjIgPSBNYXRoLnNpbih0aGlzLmxhdDIpO1xuICB2YXIgY29zMiA9IE1hdGguY29zKHRoaXMubGF0Mik7XG4gIHZhciBtczIgPSBtc2Zueih0aGlzLmUsIHNpbjIsIGNvczIpO1xuICB2YXIgdHMyID0gdHNmbnoodGhpcy5lLCB0aGlzLmxhdDIsIHNpbjIpO1xuXG4gIHZhciB0czAgPSB0c2Zueih0aGlzLmUsIHRoaXMubGF0MCwgTWF0aC5zaW4odGhpcy5sYXQwKSk7XG5cbiAgaWYgKE1hdGguYWJzKHRoaXMubGF0MSAtIHRoaXMubGF0MikgPiBFUFNMTikge1xuICAgIHRoaXMubnMgPSBNYXRoLmxvZyhtczEgLyBtczIpIC8gTWF0aC5sb2codHMxIC8gdHMyKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLm5zID0gc2luMTtcbiAgfVxuICBpZiAoaXNOYU4odGhpcy5ucykpIHtcbiAgICB0aGlzLm5zID0gc2luMTtcbiAgfVxuICB0aGlzLmYwID0gbXMxIC8gKHRoaXMubnMgKiBNYXRoLnBvdyh0czEsIHRoaXMubnMpKTtcbiAgdGhpcy5yaCA9IHRoaXMuYSAqIHRoaXMuZjAgKiBNYXRoLnBvdyh0czAsIHRoaXMubnMpO1xuICBpZiAoIXRoaXMudGl0bGUpIHtcbiAgICB0aGlzLnRpdGxlID0gXCJMYW1iZXJ0IENvbmZvcm1hbCBDb25pY1wiO1xuICB9XG59O1xuXG5cbi8vIExhbWJlcnQgQ29uZm9ybWFsIGNvbmljIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcblxuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuXG4gIC8vIHNpbmd1bGFyIGNhc2VzIDpcbiAgaWYgKE1hdGguYWJzKDIgKiBNYXRoLmFicyhsYXQpIC0gTWF0aC5QSSkgPD0gRVBTTE4pIHtcbiAgICBsYXQgPSBzaWduKGxhdCkgKiAoSEFMRl9QSSAtIDIgKiBFUFNMTik7XG4gIH1cblxuICB2YXIgY29uID0gTWF0aC5hYnMoTWF0aC5hYnMobGF0KSAtIEhBTEZfUEkpO1xuICB2YXIgdHMsIHJoMTtcbiAgaWYgKGNvbiA+IEVQU0xOKSB7XG4gICAgdHMgPSB0c2Zueih0aGlzLmUsIGxhdCwgTWF0aC5zaW4obGF0KSk7XG4gICAgcmgxID0gdGhpcy5hICogdGhpcy5mMCAqIE1hdGgucG93KHRzLCB0aGlzLm5zKTtcbiAgfVxuICBlbHNlIHtcbiAgICBjb24gPSBsYXQgKiB0aGlzLm5zO1xuICAgIGlmIChjb24gPD0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJoMSA9IDA7XG4gIH1cbiAgdmFyIHRoZXRhID0gdGhpcy5ucyAqIGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHAueCA9IHRoaXMuazAgKiAocmgxICogTWF0aC5zaW4odGhldGEpKSArIHRoaXMueDA7XG4gIHAueSA9IHRoaXMuazAgKiAodGhpcy5yaCAtIHJoMSAqIE1hdGguY29zKHRoZXRhKSkgKyB0aGlzLnkwO1xuXG4gIHJldHVybiBwO1xufTtcblxuLy8gTGFtYmVydCBDb25mb3JtYWwgQ29uaWMgaW52ZXJzZSBlcXVhdGlvbnMtLW1hcHBpbmcgeCx5IHRvIGxhdC9sb25nXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuXG4gIHZhciByaDEsIGNvbiwgdHM7XG4gIHZhciBsYXQsIGxvbjtcbiAgdmFyIHggPSAocC54IC0gdGhpcy54MCkgLyB0aGlzLmswO1xuICB2YXIgeSA9ICh0aGlzLnJoIC0gKHAueSAtIHRoaXMueTApIC8gdGhpcy5rMCk7XG4gIGlmICh0aGlzLm5zID4gMCkge1xuICAgIHJoMSA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICBjb24gPSAxO1xuICB9XG4gIGVsc2Uge1xuICAgIHJoMSA9IC1NYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG4gICAgY29uID0gLTE7XG4gIH1cbiAgdmFyIHRoZXRhID0gMDtcbiAgaWYgKHJoMSAhPT0gMCkge1xuICAgIHRoZXRhID0gTWF0aC5hdGFuMigoY29uICogeCksIChjb24gKiB5KSk7XG4gIH1cbiAgaWYgKChyaDEgIT09IDApIHx8ICh0aGlzLm5zID4gMCkpIHtcbiAgICBjb24gPSAxIC8gdGhpcy5ucztcbiAgICB0cyA9IE1hdGgucG93KChyaDEgLyAodGhpcy5hICogdGhpcy5mMCkpLCBjb24pO1xuICAgIGxhdCA9IHBoaTJ6KHRoaXMuZSwgdHMpO1xuICAgIGlmIChsYXQgPT09IC05OTk5KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgbGF0ID0gLUhBTEZfUEk7XG4gIH1cbiAgbG9uID0gYWRqdXN0X2xvbih0aGV0YSAvIHRoaXMubnMgKyB0aGlzLmxvbmcwKTtcblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLm5hbWVzID0gW1wiTGFtYmVydCBUYW5nZW50aWFsIENvbmZvcm1hbCBDb25pYyBQcm9qZWN0aW9uXCIsIFwiTGFtYmVydF9Db25mb3JtYWxfQ29uaWNcIiwgXCJMYW1iZXJ0X0NvbmZvcm1hbF9Db25pY18yU1BcIiwgXCJsY2NcIl07XG4iLCJleHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgLy9uby1vcCBmb3IgbG9uZ2xhdFxufTtcblxuZnVuY3Rpb24gaWRlbnRpdHkocHQpIHtcbiAgcmV0dXJuIHB0O1xufVxuZXhwb3J0cy5mb3J3YXJkID0gaWRlbnRpdHk7XG5leHBvcnRzLmludmVyc2UgPSBpZGVudGl0eTtcbmV4cG9ydHMubmFtZXMgPSBbXCJsb25nbGF0XCIsIFwiaWRlbnRpdHlcIl07XG4iLCJ2YXIgbXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vbXNmbnonKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBSMkQgPSA1Ny4yOTU3Nzk1MTMwODIzMjA4ODtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBGT1JUUEkgPSBNYXRoLlBJLzQ7XG52YXIgdHNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vdHNmbnonKTtcbnZhciBwaGkyeiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9waGkyeicpO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjb24gPSB0aGlzLmIgLyB0aGlzLmE7XG4gIHRoaXMuZXMgPSAxIC0gY29uICogY29uO1xuICBpZighKCd4MCcgaW4gdGhpcykpe1xuICAgIHRoaXMueDAgPSAwO1xuICB9XG4gIGlmKCEoJ3kwJyBpbiB0aGlzKSl7XG4gICAgdGhpcy55MCA9IDA7XG4gIH1cbiAgdGhpcy5lID0gTWF0aC5zcXJ0KHRoaXMuZXMpO1xuICBpZiAodGhpcy5sYXRfdHMpIHtcbiAgICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICAgIHRoaXMuazAgPSBNYXRoLmNvcyh0aGlzLmxhdF90cyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5rMCA9IG1zZm56KHRoaXMuZSwgTWF0aC5zaW4odGhpcy5sYXRfdHMpLCBNYXRoLmNvcyh0aGlzLmxhdF90cykpO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuazApIHtcbiAgICAgIGlmICh0aGlzLmspIHtcbiAgICAgICAgdGhpcy5rMCA9IHRoaXMuaztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmswID0gMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qIE1lcmNhdG9yIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgLy8gY29udmVydCB0byByYWRpYW5zXG4gIGlmIChsYXQgKiBSMkQgPiA5MCAmJiBsYXQgKiBSMkQgPCAtOTAgJiYgbG9uICogUjJEID4gMTgwICYmIGxvbiAqIFIyRCA8IC0xODApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZhciB4LCB5O1xuICBpZiAoTWF0aC5hYnMoTWF0aC5hYnMobGF0KSAtIEhBTEZfUEkpIDw9IEVQU0xOKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgICB4ID0gdGhpcy54MCArIHRoaXMuYSAqIHRoaXMuazAgKiBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICAgICAgeSA9IHRoaXMueTAgKyB0aGlzLmEgKiB0aGlzLmswICogTWF0aC5sb2coTWF0aC50YW4oRk9SVFBJICsgMC41ICogbGF0KSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHNpbnBoaSA9IE1hdGguc2luKGxhdCk7XG4gICAgICB2YXIgdHMgPSB0c2Zueih0aGlzLmUsIGxhdCwgc2lucGhpKTtcbiAgICAgIHggPSB0aGlzLngwICsgdGhpcy5hICogdGhpcy5rMCAqIGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gICAgICB5ID0gdGhpcy55MCAtIHRoaXMuYSAqIHRoaXMuazAgKiBNYXRoLmxvZyh0cyk7XG4gICAgfVxuICAgIHAueCA9IHg7XG4gICAgcC55ID0geTtcbiAgICByZXR1cm4gcDtcbiAgfVxufTtcblxuXG4vKiBNZXJjYXRvciBpbnZlcnNlIGVxdWF0aW9ucy0tbWFwcGluZyB4LHkgdG8gbGF0L2xvbmdcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuXG4gIHZhciB4ID0gcC54IC0gdGhpcy54MDtcbiAgdmFyIHkgPSBwLnkgLSB0aGlzLnkwO1xuICB2YXIgbG9uLCBsYXQ7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgbGF0ID0gSEFMRl9QSSAtIDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoLXkgLyAodGhpcy5hICogdGhpcy5rMCkpKTtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgdHMgPSBNYXRoLmV4cCgteSAvICh0aGlzLmEgKiB0aGlzLmswKSk7XG4gICAgbGF0ID0gcGhpMnoodGhpcy5lLCB0cyk7XG4gICAgaWYgKGxhdCA9PT0gLTk5OTkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyB4IC8gKHRoaXMuYSAqIHRoaXMuazApKTtcblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLm5hbWVzID0gW1wiTWVyY2F0b3JcIiwgXCJQb3B1bGFyIFZpc3VhbGlzYXRpb24gUHNldWRvIE1lcmNhdG9yXCIsIFwiTWVyY2F0b3JfMVNQXCIsIFwiTWVyY2F0b3JfQXV4aWxpYXJ5X1NwaGVyZVwiLCBcIm1lcmNcIl07XG4iLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG4vKlxuICByZWZlcmVuY2VcbiAgICBcIk5ldyBFcXVhbC1BcmVhIE1hcCBQcm9qZWN0aW9ucyBmb3IgTm9uY2lyY3VsYXIgUmVnaW9uc1wiLCBKb2huIFAuIFNueWRlcixcbiAgICBUaGUgQW1lcmljYW4gQ2FydG9ncmFwaGVyLCBWb2wgMTUsIE5vLiA0LCBPY3RvYmVyIDE5ODgsIHBwLiAzNDEtMzU1LlxuICAqL1xuXG5cbi8qIEluaXRpYWxpemUgdGhlIE1pbGxlciBDeWxpbmRyaWNhbCBwcm9qZWN0aW9uXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIC8vbm8tb3Bcbn07XG5cblxuLyogTWlsbGVyIEN5bGluZHJpY2FsIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIHggPSB0aGlzLngwICsgdGhpcy5hICogZGxvbjtcbiAgdmFyIHkgPSB0aGlzLnkwICsgdGhpcy5hICogTWF0aC5sb2coTWF0aC50YW4oKE1hdGguUEkgLyA0KSArIChsYXQgLyAyLjUpKSkgKiAxLjI1O1xuXG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuLyogTWlsbGVyIEN5bGluZHJpY2FsIGludmVyc2UgZXF1YXRpb25zLS1tYXBwaW5nIHgseSB0byBsYXQvbG9uZ1xuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgLT0gdGhpcy55MDtcblxuICB2YXIgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgcC54IC8gdGhpcy5hKTtcbiAgdmFyIGxhdCA9IDIuNSAqIChNYXRoLmF0YW4oTWF0aC5leHAoMC44ICogcC55IC8gdGhpcy5hKSkgLSBNYXRoLlBJIC8gNCk7XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJNaWxsZXJfQ3lsaW5kcmljYWxcIiwgXCJtaWxsXCJdO1xuIiwidmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge307XG5cbi8qIE1vbGx3ZWlkZSBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcblxuICAvKiBGb3J3YXJkIGVxdWF0aW9uc1xuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuXG4gIHZhciBkZWx0YV9sb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICB2YXIgdGhldGEgPSBsYXQ7XG4gIHZhciBjb24gPSBNYXRoLlBJICogTWF0aC5zaW4obGF0KTtcblxuICAvKiBJdGVyYXRlIHVzaW5nIHRoZSBOZXd0b24tUmFwaHNvbiBtZXRob2QgdG8gZmluZCB0aGV0YVxuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBmb3IgKHZhciBpID0gMDsgdHJ1ZTsgaSsrKSB7XG4gICAgdmFyIGRlbHRhX3RoZXRhID0gLSh0aGV0YSArIE1hdGguc2luKHRoZXRhKSAtIGNvbikgLyAoMSArIE1hdGguY29zKHRoZXRhKSk7XG4gICAgdGhldGEgKz0gZGVsdGFfdGhldGE7XG4gICAgaWYgKE1hdGguYWJzKGRlbHRhX3RoZXRhKSA8IEVQU0xOKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgdGhldGEgLz0gMjtcblxuICAvKiBJZiB0aGUgbGF0aXR1ZGUgaXMgOTAgZGVnLCBmb3JjZSB0aGUgeCBjb29yZGluYXRlIHRvIGJlIFwiMCArIGZhbHNlIGVhc3RpbmdcIlxuICAgICAgIHRoaXMgaXMgZG9uZSBoZXJlIGJlY2F1c2Ugb2YgcHJlY2lzaW9uIHByb2JsZW1zIHdpdGggXCJjb3ModGhldGEpXCJcbiAgICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIGlmIChNYXRoLlBJIC8gMiAtIE1hdGguYWJzKGxhdCkgPCBFUFNMTikge1xuICAgIGRlbHRhX2xvbiA9IDA7XG4gIH1cbiAgdmFyIHggPSAwLjkwMDMxNjMxNjE1OCAqIHRoaXMuYSAqIGRlbHRhX2xvbiAqIE1hdGguY29zKHRoZXRhKSArIHRoaXMueDA7XG4gIHZhciB5ID0gMS40MTQyMTM1NjIzNzMxICogdGhpcy5hICogTWF0aC5zaW4odGhldGEpICsgdGhpcy55MDtcblxuICBwLnggPSB4O1xuICBwLnkgPSB5O1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHRoZXRhO1xuICB2YXIgYXJnO1xuXG4gIC8qIEludmVyc2UgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgLT0gdGhpcy55MDtcbiAgYXJnID0gcC55IC8gKDEuNDE0MjEzNTYyMzczMSAqIHRoaXMuYSk7XG5cbiAgLyogQmVjYXVzZSBvZiBkaXZpc2lvbiBieSB6ZXJvIHByb2JsZW1zLCAnYXJnJyBjYW4gbm90IGJlIDEuICBUaGVyZWZvcmVcbiAgICAgICBhIG51bWJlciB2ZXJ5IGNsb3NlIHRvIG9uZSBpcyB1c2VkIGluc3RlYWQuXG4gICAgICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIGlmIChNYXRoLmFicyhhcmcpID4gMC45OTk5OTk5OTk5OTkpIHtcbiAgICBhcmcgPSAwLjk5OTk5OTk5OTk5OTtcbiAgfVxuICB0aGV0YSA9IE1hdGguYXNpbihhcmcpO1xuICB2YXIgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgKHAueCAvICgwLjkwMDMxNjMxNjE1OCAqIHRoaXMuYSAqIE1hdGguY29zKHRoZXRhKSkpKTtcbiAgaWYgKGxvbiA8ICgtTWF0aC5QSSkpIHtcbiAgICBsb24gPSAtTWF0aC5QSTtcbiAgfVxuICBpZiAobG9uID4gTWF0aC5QSSkge1xuICAgIGxvbiA9IE1hdGguUEk7XG4gIH1cbiAgYXJnID0gKDIgKiB0aGV0YSArIE1hdGguc2luKDIgKiB0aGV0YSkpIC8gTWF0aC5QSTtcbiAgaWYgKE1hdGguYWJzKGFyZykgPiAxKSB7XG4gICAgYXJnID0gMTtcbiAgfVxuICB2YXIgbGF0ID0gTWF0aC5hc2luKGFyZyk7XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJNb2xsd2VpZGVcIiwgXCJtb2xsXCJdO1xuIiwidmFyIFNFQ19UT19SQUQgPSA0Ljg0ODEzNjgxMTA5NTM1OTkzNTg5OTE0MTAyMzU3ZS02O1xuLypcbiAgcmVmZXJlbmNlXG4gICAgRGVwYXJ0bWVudCBvZiBMYW5kIGFuZCBTdXJ2ZXkgVGVjaG5pY2FsIENpcmN1bGFyIDE5NzMvMzJcbiAgICAgIGh0dHA6Ly93d3cubGluei5nb3Z0Lm56L2RvY3MvbWlzY2VsbGFuZW91cy9uei1tYXAtZGVmaW5pdGlvbi5wZGZcbiAgICBPU0cgVGVjaG5pY2FsIFJlcG9ydCA0LjFcbiAgICAgIGh0dHA6Ly93d3cubGluei5nb3Z0Lm56L2RvY3MvbWlzY2VsbGFuZW91cy9uem1nLnBkZlxuICAqL1xuXG4vKipcbiAqIGl0ZXJhdGlvbnM6IE51bWJlciBvZiBpdGVyYXRpb25zIHRvIHJlZmluZSBpbnZlcnNlIHRyYW5zZm9ybS5cbiAqICAgICAwIC0+IGttIGFjY3VyYWN5XG4gKiAgICAgMSAtPiBtIGFjY3VyYWN5IC0tIHN1aXRhYmxlIGZvciBtb3N0IG1hcHBpbmcgYXBwbGljYXRpb25zXG4gKiAgICAgMiAtPiBtbSBhY2N1cmFjeVxuICovXG5leHBvcnRzLml0ZXJhdGlvbnMgPSAxO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5BID0gW107XG4gIHRoaXMuQVsxXSA9IDAuNjM5OTE3NTA3MztcbiAgdGhpcy5BWzJdID0gLTAuMTM1ODc5NzYxMztcbiAgdGhpcy5BWzNdID0gMC4wNjMyOTQ0MDk7XG4gIHRoaXMuQVs0XSA9IC0wLjAyNTI2ODUzO1xuICB0aGlzLkFbNV0gPSAwLjAxMTc4Nzk7XG4gIHRoaXMuQVs2XSA9IC0wLjAwNTUxNjE7XG4gIHRoaXMuQVs3XSA9IDAuMDAyNjkwNjtcbiAgdGhpcy5BWzhdID0gLTAuMDAxMzMzO1xuICB0aGlzLkFbOV0gPSAwLjAwMDY3O1xuICB0aGlzLkFbMTBdID0gLTAuMDAwMzQ7XG5cbiAgdGhpcy5CX3JlID0gW107XG4gIHRoaXMuQl9pbSA9IFtdO1xuICB0aGlzLkJfcmVbMV0gPSAwLjc1NTc4NTMyMjg7XG4gIHRoaXMuQl9pbVsxXSA9IDA7XG4gIHRoaXMuQl9yZVsyXSA9IDAuMjQ5MjA0NjQ2O1xuICB0aGlzLkJfaW1bMl0gPSAwLjAwMzM3MTUwNztcbiAgdGhpcy5CX3JlWzNdID0gLTAuMDAxNTQxNzM5O1xuICB0aGlzLkJfaW1bM10gPSAwLjA0MTA1ODU2MDtcbiAgdGhpcy5CX3JlWzRdID0gLTAuMTAxNjI5MDc7XG4gIHRoaXMuQl9pbVs0XSA9IDAuMDE3Mjc2MDk7XG4gIHRoaXMuQl9yZVs1XSA9IC0wLjI2NjIzNDg5O1xuICB0aGlzLkJfaW1bNV0gPSAtMC4zNjI0OTIxODtcbiAgdGhpcy5CX3JlWzZdID0gLTAuNjg3MDk4MztcbiAgdGhpcy5CX2ltWzZdID0gLTEuMTY1MTk2NztcblxuICB0aGlzLkNfcmUgPSBbXTtcbiAgdGhpcy5DX2ltID0gW107XG4gIHRoaXMuQ19yZVsxXSA9IDEuMzIzMTI3MDQzOTtcbiAgdGhpcy5DX2ltWzFdID0gMDtcbiAgdGhpcy5DX3JlWzJdID0gLTAuNTc3MjQ1Nzg5O1xuICB0aGlzLkNfaW1bMl0gPSAtMC4wMDc4MDk1OTg7XG4gIHRoaXMuQ19yZVszXSA9IDAuNTA4MzA3NTEzO1xuICB0aGlzLkNfaW1bM10gPSAtMC4xMTIyMDg5NTI7XG4gIHRoaXMuQ19yZVs0XSA9IC0wLjE1MDk0NzYyO1xuICB0aGlzLkNfaW1bNF0gPSAwLjE4MjAwNjAyO1xuICB0aGlzLkNfcmVbNV0gPSAxLjAxNDE4MTc5O1xuICB0aGlzLkNfaW1bNV0gPSAxLjY0NDk3Njk2O1xuICB0aGlzLkNfcmVbNl0gPSAxLjk2NjA1NDk7XG4gIHRoaXMuQ19pbVs2XSA9IDIuNTEyNzY0NTtcblxuICB0aGlzLkQgPSBbXTtcbiAgdGhpcy5EWzFdID0gMS41NjI3MDE0MjQzO1xuICB0aGlzLkRbMl0gPSAwLjUxODU0MDYzOTg7XG4gIHRoaXMuRFszXSA9IC0wLjAzMzMzMDk4O1xuICB0aGlzLkRbNF0gPSAtMC4xMDUyOTA2O1xuICB0aGlzLkRbNV0gPSAtMC4wMzY4NTk0O1xuICB0aGlzLkRbNl0gPSAwLjAwNzMxNztcbiAgdGhpcy5EWzddID0gMC4wMTIyMDtcbiAgdGhpcy5EWzhdID0gMC4wMDM5NDtcbiAgdGhpcy5EWzldID0gLTAuMDAxMztcbn07XG5cbi8qKlxuICAgIE5ldyBaZWFsYW5kIE1hcCBHcmlkIEZvcndhcmQgIC0gbG9uZy9sYXQgdG8geC95XG4gICAgbG9uZy9sYXQgaW4gcmFkaWFuc1xuICAqL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbjtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcblxuICB2YXIgZGVsdGFfbGF0ID0gbGF0IC0gdGhpcy5sYXQwO1xuICB2YXIgZGVsdGFfbG9uID0gbG9uIC0gdGhpcy5sb25nMDtcblxuICAvLyAxLiBDYWxjdWxhdGUgZF9waGkgYW5kIGRfcHNpICAgIC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYW5kIGRfbGFtYmRhXG4gIC8vIEZvciB0aGlzIGFsZ29yaXRobSwgZGVsdGFfbGF0aXR1ZGUgaXMgaW4gc2Vjb25kcyBvZiBhcmMgeCAxMC01LCBzbyB3ZSBuZWVkIHRvIHNjYWxlIHRvIHRob3NlIHVuaXRzLiBMb25naXR1ZGUgaXMgcmFkaWFucy5cbiAgdmFyIGRfcGhpID0gZGVsdGFfbGF0IC8gU0VDX1RPX1JBRCAqIDFFLTU7XG4gIHZhciBkX2xhbWJkYSA9IGRlbHRhX2xvbjtcbiAgdmFyIGRfcGhpX24gPSAxOyAvLyBkX3BoaV4wXG5cbiAgdmFyIGRfcHNpID0gMDtcbiAgZm9yIChuID0gMTsgbiA8PSAxMDsgbisrKSB7XG4gICAgZF9waGlfbiA9IGRfcGhpX24gKiBkX3BoaTtcbiAgICBkX3BzaSA9IGRfcHNpICsgdGhpcy5BW25dICogZF9waGlfbjtcbiAgfVxuXG4gIC8vIDIuIENhbGN1bGF0ZSB0aGV0YVxuICB2YXIgdGhfcmUgPSBkX3BzaTtcbiAgdmFyIHRoX2ltID0gZF9sYW1iZGE7XG5cbiAgLy8gMy4gQ2FsY3VsYXRlIHpcbiAgdmFyIHRoX25fcmUgPSAxO1xuICB2YXIgdGhfbl9pbSA9IDA7IC8vIHRoZXRhXjBcbiAgdmFyIHRoX25fcmUxO1xuICB2YXIgdGhfbl9pbTE7XG5cbiAgdmFyIHpfcmUgPSAwO1xuICB2YXIgel9pbSA9IDA7XG4gIGZvciAobiA9IDE7IG4gPD0gNjsgbisrKSB7XG4gICAgdGhfbl9yZTEgPSB0aF9uX3JlICogdGhfcmUgLSB0aF9uX2ltICogdGhfaW07XG4gICAgdGhfbl9pbTEgPSB0aF9uX2ltICogdGhfcmUgKyB0aF9uX3JlICogdGhfaW07XG4gICAgdGhfbl9yZSA9IHRoX25fcmUxO1xuICAgIHRoX25faW0gPSB0aF9uX2ltMTtcbiAgICB6X3JlID0gel9yZSArIHRoaXMuQl9yZVtuXSAqIHRoX25fcmUgLSB0aGlzLkJfaW1bbl0gKiB0aF9uX2ltO1xuICAgIHpfaW0gPSB6X2ltICsgdGhpcy5CX2ltW25dICogdGhfbl9yZSArIHRoaXMuQl9yZVtuXSAqIHRoX25faW07XG4gIH1cblxuICAvLyA0LiBDYWxjdWxhdGUgZWFzdGluZyBhbmQgbm9ydGhpbmdcbiAgcC54ID0gKHpfaW0gKiB0aGlzLmEpICsgdGhpcy54MDtcbiAgcC55ID0gKHpfcmUgKiB0aGlzLmEpICsgdGhpcy55MDtcblxuICByZXR1cm4gcDtcbn07XG5cblxuLyoqXG4gICAgTmV3IFplYWxhbmQgTWFwIEdyaWQgSW52ZXJzZSAgLSAgeC95IHRvIGxvbmcvbGF0XG4gICovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBuO1xuICB2YXIgeCA9IHAueDtcbiAgdmFyIHkgPSBwLnk7XG5cbiAgdmFyIGRlbHRhX3ggPSB4IC0gdGhpcy54MDtcbiAgdmFyIGRlbHRhX3kgPSB5IC0gdGhpcy55MDtcblxuICAvLyAxLiBDYWxjdWxhdGUgelxuICB2YXIgel9yZSA9IGRlbHRhX3kgLyB0aGlzLmE7XG4gIHZhciB6X2ltID0gZGVsdGFfeCAvIHRoaXMuYTtcblxuICAvLyAyYS4gQ2FsY3VsYXRlIHRoZXRhIC0gZmlyc3QgYXBwcm94aW1hdGlvbiBnaXZlcyBrbSBhY2N1cmFjeVxuICB2YXIgel9uX3JlID0gMTtcbiAgdmFyIHpfbl9pbSA9IDA7IC8vIHpeMFxuICB2YXIgel9uX3JlMTtcbiAgdmFyIHpfbl9pbTE7XG5cbiAgdmFyIHRoX3JlID0gMDtcbiAgdmFyIHRoX2ltID0gMDtcbiAgZm9yIChuID0gMTsgbiA8PSA2OyBuKyspIHtcbiAgICB6X25fcmUxID0gel9uX3JlICogel9yZSAtIHpfbl9pbSAqIHpfaW07XG4gICAgel9uX2ltMSA9IHpfbl9pbSAqIHpfcmUgKyB6X25fcmUgKiB6X2ltO1xuICAgIHpfbl9yZSA9IHpfbl9yZTE7XG4gICAgel9uX2ltID0gel9uX2ltMTtcbiAgICB0aF9yZSA9IHRoX3JlICsgdGhpcy5DX3JlW25dICogel9uX3JlIC0gdGhpcy5DX2ltW25dICogel9uX2ltO1xuICAgIHRoX2ltID0gdGhfaW0gKyB0aGlzLkNfaW1bbl0gKiB6X25fcmUgKyB0aGlzLkNfcmVbbl0gKiB6X25faW07XG4gIH1cblxuICAvLyAyYi4gSXRlcmF0ZSB0byByZWZpbmUgdGhlIGFjY3VyYWN5IG9mIHRoZSBjYWxjdWxhdGlvblxuICAvLyAgICAgICAgMCBpdGVyYXRpb25zIGdpdmVzIGttIGFjY3VyYWN5XG4gIC8vICAgICAgICAxIGl0ZXJhdGlvbiBnaXZlcyBtIGFjY3VyYWN5IC0tIGdvb2QgZW5vdWdoIGZvciBtb3N0IG1hcHBpbmcgYXBwbGljYXRpb25zXG4gIC8vICAgICAgICAyIGl0ZXJhdGlvbnMgYml2ZXMgbW0gYWNjdXJhY3lcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLml0ZXJhdGlvbnM7IGkrKykge1xuICAgIHZhciB0aF9uX3JlID0gdGhfcmU7XG4gICAgdmFyIHRoX25faW0gPSB0aF9pbTtcbiAgICB2YXIgdGhfbl9yZTE7XG4gICAgdmFyIHRoX25faW0xO1xuXG4gICAgdmFyIG51bV9yZSA9IHpfcmU7XG4gICAgdmFyIG51bV9pbSA9IHpfaW07XG4gICAgZm9yIChuID0gMjsgbiA8PSA2OyBuKyspIHtcbiAgICAgIHRoX25fcmUxID0gdGhfbl9yZSAqIHRoX3JlIC0gdGhfbl9pbSAqIHRoX2ltO1xuICAgICAgdGhfbl9pbTEgPSB0aF9uX2ltICogdGhfcmUgKyB0aF9uX3JlICogdGhfaW07XG4gICAgICB0aF9uX3JlID0gdGhfbl9yZTE7XG4gICAgICB0aF9uX2ltID0gdGhfbl9pbTE7XG4gICAgICBudW1fcmUgPSBudW1fcmUgKyAobiAtIDEpICogKHRoaXMuQl9yZVtuXSAqIHRoX25fcmUgLSB0aGlzLkJfaW1bbl0gKiB0aF9uX2ltKTtcbiAgICAgIG51bV9pbSA9IG51bV9pbSArIChuIC0gMSkgKiAodGhpcy5CX2ltW25dICogdGhfbl9yZSArIHRoaXMuQl9yZVtuXSAqIHRoX25faW0pO1xuICAgIH1cblxuICAgIHRoX25fcmUgPSAxO1xuICAgIHRoX25faW0gPSAwO1xuICAgIHZhciBkZW5fcmUgPSB0aGlzLkJfcmVbMV07XG4gICAgdmFyIGRlbl9pbSA9IHRoaXMuQl9pbVsxXTtcbiAgICBmb3IgKG4gPSAyOyBuIDw9IDY7IG4rKykge1xuICAgICAgdGhfbl9yZTEgPSB0aF9uX3JlICogdGhfcmUgLSB0aF9uX2ltICogdGhfaW07XG4gICAgICB0aF9uX2ltMSA9IHRoX25faW0gKiB0aF9yZSArIHRoX25fcmUgKiB0aF9pbTtcbiAgICAgIHRoX25fcmUgPSB0aF9uX3JlMTtcbiAgICAgIHRoX25faW0gPSB0aF9uX2ltMTtcbiAgICAgIGRlbl9yZSA9IGRlbl9yZSArIG4gKiAodGhpcy5CX3JlW25dICogdGhfbl9yZSAtIHRoaXMuQl9pbVtuXSAqIHRoX25faW0pO1xuICAgICAgZGVuX2ltID0gZGVuX2ltICsgbiAqICh0aGlzLkJfaW1bbl0gKiB0aF9uX3JlICsgdGhpcy5CX3JlW25dICogdGhfbl9pbSk7XG4gICAgfVxuXG4gICAgLy8gQ29tcGxleCBkaXZpc2lvblxuICAgIHZhciBkZW4yID0gZGVuX3JlICogZGVuX3JlICsgZGVuX2ltICogZGVuX2ltO1xuICAgIHRoX3JlID0gKG51bV9yZSAqIGRlbl9yZSArIG51bV9pbSAqIGRlbl9pbSkgLyBkZW4yO1xuICAgIHRoX2ltID0gKG51bV9pbSAqIGRlbl9yZSAtIG51bV9yZSAqIGRlbl9pbSkgLyBkZW4yO1xuICB9XG5cbiAgLy8gMy4gQ2FsY3VsYXRlIGRfcGhpICAgICAgICAgICAgICAuLi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmQgZF9sYW1iZGFcbiAgdmFyIGRfcHNpID0gdGhfcmU7XG4gIHZhciBkX2xhbWJkYSA9IHRoX2ltO1xuICB2YXIgZF9wc2lfbiA9IDE7IC8vIGRfcHNpXjBcblxuICB2YXIgZF9waGkgPSAwO1xuICBmb3IgKG4gPSAxOyBuIDw9IDk7IG4rKykge1xuICAgIGRfcHNpX24gPSBkX3BzaV9uICogZF9wc2k7XG4gICAgZF9waGkgPSBkX3BoaSArIHRoaXMuRFtuXSAqIGRfcHNpX247XG4gIH1cblxuICAvLyA0LiBDYWxjdWxhdGUgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZVxuICAvLyBkX3BoaSBpcyBjYWxjdWF0ZWQgaW4gc2Vjb25kIG9mIGFyYyAqIDEwXi01LCBzbyB3ZSBuZWVkIHRvIHNjYWxlIGJhY2sgdG8gcmFkaWFucy4gZF9sYW1iZGEgaXMgaW4gcmFkaWFucy5cbiAgdmFyIGxhdCA9IHRoaXMubGF0MCArIChkX3BoaSAqIFNFQ19UT19SQUQgKiAxRTUpO1xuICB2YXIgbG9uID0gdGhpcy5sb25nMCArIGRfbGFtYmRhO1xuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuXG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJOZXdfWmVhbGFuZF9NYXBfR3JpZFwiLCBcIm56bWdcIl07IiwidmFyIHRzZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL3RzZm56Jyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgcGhpMnogPSByZXF1aXJlKCcuLi9jb21tb24vcGhpMnonKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEZPUlRQSSA9IE1hdGguUEkvNDtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG5cbi8qIEluaXRpYWxpemUgdGhlIE9ibGlxdWUgTWVyY2F0b3IgIHByb2plY3Rpb25cbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubm9fb2ZmID0gdGhpcy5ub19vZmYgfHwgZmFsc2U7XG4gIHRoaXMubm9fcm90ID0gdGhpcy5ub19yb3QgfHwgZmFsc2U7XG5cbiAgaWYgKGlzTmFOKHRoaXMuazApKSB7XG4gICAgdGhpcy5rMCA9IDE7XG4gIH1cbiAgdmFyIHNpbmxhdCA9IE1hdGguc2luKHRoaXMubGF0MCk7XG4gIHZhciBjb3NsYXQgPSBNYXRoLmNvcyh0aGlzLmxhdDApO1xuICB2YXIgY29uID0gdGhpcy5lICogc2lubGF0O1xuXG4gIHRoaXMuYmwgPSBNYXRoLnNxcnQoMSArIHRoaXMuZXMgLyAoMSAtIHRoaXMuZXMpICogTWF0aC5wb3coY29zbGF0LCA0KSk7XG4gIHRoaXMuYWwgPSB0aGlzLmEgKiB0aGlzLmJsICogdGhpcy5rMCAqIE1hdGguc3FydCgxIC0gdGhpcy5lcykgLyAoMSAtIGNvbiAqIGNvbik7XG4gIHZhciB0MCA9IHRzZm56KHRoaXMuZSwgdGhpcy5sYXQwLCBzaW5sYXQpO1xuICB2YXIgZGwgPSB0aGlzLmJsIC8gY29zbGF0ICogTWF0aC5zcXJ0KCgxIC0gdGhpcy5lcykgLyAoMSAtIGNvbiAqIGNvbikpO1xuICBpZiAoZGwgKiBkbCA8IDEpIHtcbiAgICBkbCA9IDE7XG4gIH1cbiAgdmFyIGZsO1xuICB2YXIgZ2w7XG4gIGlmICghaXNOYU4odGhpcy5sb25nYykpIHtcbiAgICAvL0NlbnRyYWwgcG9pbnQgYW5kIGF6aW11dGggbWV0aG9kXG5cbiAgICBpZiAodGhpcy5sYXQwID49IDApIHtcbiAgICAgIGZsID0gZGwgKyBNYXRoLnNxcnQoZGwgKiBkbCAtIDEpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGZsID0gZGwgLSBNYXRoLnNxcnQoZGwgKiBkbCAtIDEpO1xuICAgIH1cbiAgICB0aGlzLmVsID0gZmwgKiBNYXRoLnBvdyh0MCwgdGhpcy5ibCk7XG4gICAgZ2wgPSAwLjUgKiAoZmwgLSAxIC8gZmwpO1xuICAgIHRoaXMuZ2FtbWEwID0gTWF0aC5hc2luKE1hdGguc2luKHRoaXMuYWxwaGEpIC8gZGwpO1xuICAgIHRoaXMubG9uZzAgPSB0aGlzLmxvbmdjIC0gTWF0aC5hc2luKGdsICogTWF0aC50YW4odGhpcy5nYW1tYTApKSAvIHRoaXMuYmw7XG5cbiAgfVxuICBlbHNlIHtcbiAgICAvLzIgcG9pbnRzIG1ldGhvZFxuICAgIHZhciB0MSA9IHRzZm56KHRoaXMuZSwgdGhpcy5sYXQxLCBNYXRoLnNpbih0aGlzLmxhdDEpKTtcbiAgICB2YXIgdDIgPSB0c2Zueih0aGlzLmUsIHRoaXMubGF0MiwgTWF0aC5zaW4odGhpcy5sYXQyKSk7XG4gICAgaWYgKHRoaXMubGF0MCA+PSAwKSB7XG4gICAgICB0aGlzLmVsID0gKGRsICsgTWF0aC5zcXJ0KGRsICogZGwgLSAxKSkgKiBNYXRoLnBvdyh0MCwgdGhpcy5ibCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5lbCA9IChkbCAtIE1hdGguc3FydChkbCAqIGRsIC0gMSkpICogTWF0aC5wb3codDAsIHRoaXMuYmwpO1xuICAgIH1cbiAgICB2YXIgaGwgPSBNYXRoLnBvdyh0MSwgdGhpcy5ibCk7XG4gICAgdmFyIGxsID0gTWF0aC5wb3codDIsIHRoaXMuYmwpO1xuICAgIGZsID0gdGhpcy5lbCAvIGhsO1xuICAgIGdsID0gMC41ICogKGZsIC0gMSAvIGZsKTtcbiAgICB2YXIgamwgPSAodGhpcy5lbCAqIHRoaXMuZWwgLSBsbCAqIGhsKSAvICh0aGlzLmVsICogdGhpcy5lbCArIGxsICogaGwpO1xuICAgIHZhciBwbCA9IChsbCAtIGhsKSAvIChsbCArIGhsKTtcbiAgICB2YXIgZGxvbjEyID0gYWRqdXN0X2xvbih0aGlzLmxvbmcxIC0gdGhpcy5sb25nMik7XG4gICAgdGhpcy5sb25nMCA9IDAuNSAqICh0aGlzLmxvbmcxICsgdGhpcy5sb25nMikgLSBNYXRoLmF0YW4oamwgKiBNYXRoLnRhbigwLjUgKiB0aGlzLmJsICogKGRsb24xMikpIC8gcGwpIC8gdGhpcy5ibDtcbiAgICB0aGlzLmxvbmcwID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwKTtcbiAgICB2YXIgZGxvbjEwID0gYWRqdXN0X2xvbih0aGlzLmxvbmcxIC0gdGhpcy5sb25nMCk7XG4gICAgdGhpcy5nYW1tYTAgPSBNYXRoLmF0YW4oTWF0aC5zaW4odGhpcy5ibCAqIChkbG9uMTApKSAvIGdsKTtcbiAgICB0aGlzLmFscGhhID0gTWF0aC5hc2luKGRsICogTWF0aC5zaW4odGhpcy5nYW1tYTApKTtcbiAgfVxuXG4gIGlmICh0aGlzLm5vX29mZikge1xuICAgIHRoaXMudWMgPSAwO1xuICB9XG4gIGVsc2Uge1xuICAgIGlmICh0aGlzLmxhdDAgPj0gMCkge1xuICAgICAgdGhpcy51YyA9IHRoaXMuYWwgLyB0aGlzLmJsICogTWF0aC5hdGFuMihNYXRoLnNxcnQoZGwgKiBkbCAtIDEpLCBNYXRoLmNvcyh0aGlzLmFscGhhKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy51YyA9IC0xICogdGhpcy5hbCAvIHRoaXMuYmwgKiBNYXRoLmF0YW4yKE1hdGguc3FydChkbCAqIGRsIC0gMSksIE1hdGguY29zKHRoaXMuYWxwaGEpKTtcbiAgICB9XG4gIH1cblxufTtcblxuXG4vKiBPYmxpcXVlIE1lcmNhdG9yIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICB2YXIgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciB1cywgdnM7XG4gIHZhciBjb247XG4gIGlmIChNYXRoLmFicyhNYXRoLmFicyhsYXQpIC0gSEFMRl9QSSkgPD0gRVBTTE4pIHtcbiAgICBpZiAobGF0ID4gMCkge1xuICAgICAgY29uID0gLTE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uID0gMTtcbiAgICB9XG4gICAgdnMgPSB0aGlzLmFsIC8gdGhpcy5ibCAqIE1hdGgubG9nKE1hdGgudGFuKEZPUlRQSSArIGNvbiAqIHRoaXMuZ2FtbWEwICogMC41KSk7XG4gICAgdXMgPSAtMSAqIGNvbiAqIEhBTEZfUEkgKiB0aGlzLmFsIC8gdGhpcy5ibDtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgdCA9IHRzZm56KHRoaXMuZSwgbGF0LCBNYXRoLnNpbihsYXQpKTtcbiAgICB2YXIgcWwgPSB0aGlzLmVsIC8gTWF0aC5wb3codCwgdGhpcy5ibCk7XG4gICAgdmFyIHNsID0gMC41ICogKHFsIC0gMSAvIHFsKTtcbiAgICB2YXIgdGwgPSAwLjUgKiAocWwgKyAxIC8gcWwpO1xuICAgIHZhciB2bCA9IE1hdGguc2luKHRoaXMuYmwgKiAoZGxvbikpO1xuICAgIHZhciB1bCA9IChzbCAqIE1hdGguc2luKHRoaXMuZ2FtbWEwKSAtIHZsICogTWF0aC5jb3ModGhpcy5nYW1tYTApKSAvIHRsO1xuICAgIGlmIChNYXRoLmFicyhNYXRoLmFicyh1bCkgLSAxKSA8PSBFUFNMTikge1xuICAgICAgdnMgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdnMgPSAwLjUgKiB0aGlzLmFsICogTWF0aC5sb2coKDEgLSB1bCkgLyAoMSArIHVsKSkgLyB0aGlzLmJsO1xuICAgIH1cbiAgICBpZiAoTWF0aC5hYnMoTWF0aC5jb3ModGhpcy5ibCAqIChkbG9uKSkpIDw9IEVQU0xOKSB7XG4gICAgICB1cyA9IHRoaXMuYWwgKiB0aGlzLmJsICogKGRsb24pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHVzID0gdGhpcy5hbCAqIE1hdGguYXRhbjIoc2wgKiBNYXRoLmNvcyh0aGlzLmdhbW1hMCkgKyB2bCAqIE1hdGguc2luKHRoaXMuZ2FtbWEwKSwgTWF0aC5jb3ModGhpcy5ibCAqIGRsb24pKSAvIHRoaXMuYmw7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMubm9fcm90KSB7XG4gICAgcC54ID0gdGhpcy54MCArIHVzO1xuICAgIHAueSA9IHRoaXMueTAgKyB2cztcbiAgfVxuICBlbHNlIHtcblxuICAgIHVzIC09IHRoaXMudWM7XG4gICAgcC54ID0gdGhpcy54MCArIHZzICogTWF0aC5jb3ModGhpcy5hbHBoYSkgKyB1cyAqIE1hdGguc2luKHRoaXMuYWxwaGEpO1xuICAgIHAueSA9IHRoaXMueTAgKyB1cyAqIE1hdGguY29zKHRoaXMuYWxwaGEpIC0gdnMgKiBNYXRoLnNpbih0aGlzLmFscGhhKTtcbiAgfVxuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHVzLCB2cztcbiAgaWYgKHRoaXMubm9fcm90KSB7XG4gICAgdnMgPSBwLnkgLSB0aGlzLnkwO1xuICAgIHVzID0gcC54IC0gdGhpcy54MDtcbiAgfVxuICBlbHNlIHtcbiAgICB2cyA9IChwLnggLSB0aGlzLngwKSAqIE1hdGguY29zKHRoaXMuYWxwaGEpIC0gKHAueSAtIHRoaXMueTApICogTWF0aC5zaW4odGhpcy5hbHBoYSk7XG4gICAgdXMgPSAocC55IC0gdGhpcy55MCkgKiBNYXRoLmNvcyh0aGlzLmFscGhhKSArIChwLnggLSB0aGlzLngwKSAqIE1hdGguc2luKHRoaXMuYWxwaGEpO1xuICAgIHVzICs9IHRoaXMudWM7XG4gIH1cbiAgdmFyIHFwID0gTWF0aC5leHAoLTEgKiB0aGlzLmJsICogdnMgLyB0aGlzLmFsKTtcbiAgdmFyIHNwID0gMC41ICogKHFwIC0gMSAvIHFwKTtcbiAgdmFyIHRwID0gMC41ICogKHFwICsgMSAvIHFwKTtcbiAgdmFyIHZwID0gTWF0aC5zaW4odGhpcy5ibCAqIHVzIC8gdGhpcy5hbCk7XG4gIHZhciB1cCA9ICh2cCAqIE1hdGguY29zKHRoaXMuZ2FtbWEwKSArIHNwICogTWF0aC5zaW4odGhpcy5nYW1tYTApKSAvIHRwO1xuICB2YXIgdHMgPSBNYXRoLnBvdyh0aGlzLmVsIC8gTWF0aC5zcXJ0KCgxICsgdXApIC8gKDEgLSB1cCkpLCAxIC8gdGhpcy5ibCk7XG4gIGlmIChNYXRoLmFicyh1cCAtIDEpIDwgRVBTTE4pIHtcbiAgICBwLnggPSB0aGlzLmxvbmcwO1xuICAgIHAueSA9IEhBTEZfUEk7XG4gIH1cbiAgZWxzZSBpZiAoTWF0aC5hYnModXAgKyAxKSA8IEVQU0xOKSB7XG4gICAgcC54ID0gdGhpcy5sb25nMDtcbiAgICBwLnkgPSAtMSAqIEhBTEZfUEk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcC55ID0gcGhpMnoodGhpcy5lLCB0cyk7XG4gICAgcC54ID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwIC0gTWF0aC5hdGFuMihzcCAqIE1hdGguY29zKHRoaXMuZ2FtbWEwKSAtIHZwICogTWF0aC5zaW4odGhpcy5nYW1tYTApLCBNYXRoLmNvcyh0aGlzLmJsICogdXMgLyB0aGlzLmFsKSkgLyB0aGlzLmJsKTtcbiAgfVxuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMubmFtZXMgPSBbXCJIb3RpbmVfT2JsaXF1ZV9NZXJjYXRvclwiLCBcIkhvdGluZSBPYmxpcXVlIE1lcmNhdG9yXCIsIFwiSG90aW5lX09ibGlxdWVfTWVyY2F0b3JfQXppbXV0aF9OYXR1cmFsX09yaWdpblwiLCBcIkhvdGluZV9PYmxpcXVlX01lcmNhdG9yX0F6aW11dGhfQ2VudGVyXCIsIFwib21lcmNcIl07IiwidmFyIGUwZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTBmbicpO1xudmFyIGUxZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTFmbicpO1xudmFyIGUyZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTJmbicpO1xudmFyIGUzZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTNmbicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIGFkanVzdF9sYXQgPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xhdCcpO1xudmFyIG1sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vbWxmbicpO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBnTiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9nTicpO1xudmFyIE1BWF9JVEVSID0gMjA7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgLyogUGxhY2UgcGFyYW1ldGVycyBpbiBzdGF0aWMgc3RvcmFnZSBmb3IgY29tbW9uIHVzZVxuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIHRoaXMudGVtcCA9IHRoaXMuYiAvIHRoaXMuYTtcbiAgdGhpcy5lcyA9IDEgLSBNYXRoLnBvdyh0aGlzLnRlbXAsIDIpOyAvLyBkZXZhaXQgZXRyZSBkYW5zIHRtZXJjLmpzIG1haXMgbiB5IGVzdCBwYXMgZG9uYyBqZSBjb21tZW50ZSBzaW5vbiByZXRvdXIgZGUgdmFsZXVycyBudWxsZXNcbiAgdGhpcy5lID0gTWF0aC5zcXJ0KHRoaXMuZXMpO1xuICB0aGlzLmUwID0gZTBmbih0aGlzLmVzKTtcbiAgdGhpcy5lMSA9IGUxZm4odGhpcy5lcyk7XG4gIHRoaXMuZTIgPSBlMmZuKHRoaXMuZXMpO1xuICB0aGlzLmUzID0gZTNmbih0aGlzLmVzKTtcbiAgdGhpcy5tbDAgPSB0aGlzLmEgKiBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIHRoaXMubGF0MCk7IC8vc2kgcXVlIGRlcyB6ZXJvcyBsZSBjYWxjdWwgbmUgc2UgZmFpdCBwYXNcbn07XG5cblxuLyogUG9seWNvbmljIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIHZhciB4LCB5LCBlbDtcbiAgdmFyIGRsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICBlbCA9IGRsb24gKiBNYXRoLnNpbihsYXQpO1xuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBpZiAoTWF0aC5hYnMobGF0KSA8PSBFUFNMTikge1xuICAgICAgeCA9IHRoaXMuYSAqIGRsb247XG4gICAgICB5ID0gLTEgKiB0aGlzLmEgKiB0aGlzLmxhdDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgeCA9IHRoaXMuYSAqIE1hdGguc2luKGVsKSAvIE1hdGgudGFuKGxhdCk7XG4gICAgICB5ID0gdGhpcy5hICogKGFkanVzdF9sYXQobGF0IC0gdGhpcy5sYXQwKSArICgxIC0gTWF0aC5jb3MoZWwpKSAvIE1hdGgudGFuKGxhdCkpO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBpZiAoTWF0aC5hYnMobGF0KSA8PSBFUFNMTikge1xuICAgICAgeCA9IHRoaXMuYSAqIGRsb247XG4gICAgICB5ID0gLTEgKiB0aGlzLm1sMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXIgbmwgPSBnTih0aGlzLmEsIHRoaXMuZSwgTWF0aC5zaW4obGF0KSkgLyBNYXRoLnRhbihsYXQpO1xuICAgICAgeCA9IG5sICogTWF0aC5zaW4oZWwpO1xuICAgICAgeSA9IHRoaXMuYSAqIG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgbGF0KSAtIHRoaXMubWwwICsgbmwgKiAoMSAtIE1hdGguY29zKGVsKSk7XG4gICAgfVxuXG4gIH1cbiAgcC54ID0geCArIHRoaXMueDA7XG4gIHAueSA9IHkgKyB0aGlzLnkwO1xuICByZXR1cm4gcDtcbn07XG5cblxuLyogSW52ZXJzZSBlcXVhdGlvbnNcbiAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uLCBsYXQsIHgsIHksIGk7XG4gIHZhciBhbCwgYmw7XG4gIHZhciBwaGksIGRwaGk7XG4gIHggPSBwLnggLSB0aGlzLngwO1xuICB5ID0gcC55IC0gdGhpcy55MDtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBpZiAoTWF0aC5hYnMoeSArIHRoaXMuYSAqIHRoaXMubGF0MCkgPD0gRVBTTE4pIHtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24oeCAvIHRoaXMuYSArIHRoaXMubG9uZzApO1xuICAgICAgbGF0ID0gMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhbCA9IHRoaXMubGF0MCArIHkgLyB0aGlzLmE7XG4gICAgICBibCA9IHggKiB4IC8gdGhpcy5hIC8gdGhpcy5hICsgYWwgKiBhbDtcbiAgICAgIHBoaSA9IGFsO1xuICAgICAgdmFyIHRhbnBoaTtcbiAgICAgIGZvciAoaSA9IE1BWF9JVEVSOyBpOyAtLWkpIHtcbiAgICAgICAgdGFucGhpID0gTWF0aC50YW4ocGhpKTtcbiAgICAgICAgZHBoaSA9IC0xICogKGFsICogKHBoaSAqIHRhbnBoaSArIDEpIC0gcGhpIC0gMC41ICogKHBoaSAqIHBoaSArIGJsKSAqIHRhbnBoaSkgLyAoKHBoaSAtIGFsKSAvIHRhbnBoaSAtIDEpO1xuICAgICAgICBwaGkgKz0gZHBoaTtcbiAgICAgICAgaWYgKE1hdGguYWJzKGRwaGkpIDw9IEVQU0xOKSB7XG4gICAgICAgICAgbGF0ID0gcGhpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyAoTWF0aC5hc2luKHggKiBNYXRoLnRhbihwaGkpIC8gdGhpcy5hKSkgLyBNYXRoLnNpbihsYXQpKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKE1hdGguYWJzKHkgKyB0aGlzLm1sMCkgPD0gRVBTTE4pIHtcbiAgICAgIGxhdCA9IDA7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyB4IC8gdGhpcy5hKTtcbiAgICB9XG4gICAgZWxzZSB7XG5cbiAgICAgIGFsID0gKHRoaXMubWwwICsgeSkgLyB0aGlzLmE7XG4gICAgICBibCA9IHggKiB4IC8gdGhpcy5hIC8gdGhpcy5hICsgYWwgKiBhbDtcbiAgICAgIHBoaSA9IGFsO1xuICAgICAgdmFyIGNsLCBtbG4sIG1sbnAsIG1hO1xuICAgICAgdmFyIGNvbjtcbiAgICAgIGZvciAoaSA9IE1BWF9JVEVSOyBpOyAtLWkpIHtcbiAgICAgICAgY29uID0gdGhpcy5lICogTWF0aC5zaW4ocGhpKTtcbiAgICAgICAgY2wgPSBNYXRoLnNxcnQoMSAtIGNvbiAqIGNvbikgKiBNYXRoLnRhbihwaGkpO1xuICAgICAgICBtbG4gPSB0aGlzLmEgKiBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIHBoaSk7XG4gICAgICAgIG1sbnAgPSB0aGlzLmUwIC0gMiAqIHRoaXMuZTEgKiBNYXRoLmNvcygyICogcGhpKSArIDQgKiB0aGlzLmUyICogTWF0aC5jb3MoNCAqIHBoaSkgLSA2ICogdGhpcy5lMyAqIE1hdGguY29zKDYgKiBwaGkpO1xuICAgICAgICBtYSA9IG1sbiAvIHRoaXMuYTtcbiAgICAgICAgZHBoaSA9IChhbCAqIChjbCAqIG1hICsgMSkgLSBtYSAtIDAuNSAqIGNsICogKG1hICogbWEgKyBibCkpIC8gKHRoaXMuZXMgKiBNYXRoLnNpbigyICogcGhpKSAqIChtYSAqIG1hICsgYmwgLSAyICogYWwgKiBtYSkgLyAoNCAqIGNsKSArIChhbCAtIG1hKSAqIChjbCAqIG1sbnAgLSAyIC8gTWF0aC5zaW4oMiAqIHBoaSkpIC0gbWxucCk7XG4gICAgICAgIHBoaSAtPSBkcGhpO1xuICAgICAgICBpZiAoTWF0aC5hYnMoZHBoaSkgPD0gRVBTTE4pIHtcbiAgICAgICAgICBsYXQgPSBwaGk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy9sYXQ9cGhpNHoodGhpcy5lLHRoaXMuZTAsdGhpcy5lMSx0aGlzLmUyLHRoaXMuZTMsYWwsYmwsMCwwKTtcbiAgICAgIGNsID0gTWF0aC5zcXJ0KDEgLSB0aGlzLmVzICogTWF0aC5wb3coTWF0aC5zaW4obGF0KSwgMikpICogTWF0aC50YW4obGF0KTtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXNpbih4ICogY2wgLyB0aGlzLmEpIC8gTWF0aC5zaW4obGF0KSk7XG4gICAgfVxuICB9XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJQb2x5Y29uaWNcIiwgXCJwb2x5XCJdOyIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBhZGp1c3RfbGF0ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sYXQnKTtcbnZhciBwal9lbmZuID0gcmVxdWlyZSgnLi4vY29tbW9uL3BqX2VuZm4nKTtcbnZhciBNQVhfSVRFUiA9IDIwO1xudmFyIHBqX21sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vcGpfbWxmbicpO1xudmFyIHBqX2ludl9tbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL3BqX2ludl9tbGZuJyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgYXNpbnogPSByZXF1aXJlKCcuLi9jb21tb24vYXNpbnonKTtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAvKiBQbGFjZSBwYXJhbWV0ZXJzIGluIHN0YXRpYyBzdG9yYWdlIGZvciBjb21tb24gdXNlXG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblxuICBpZiAoIXRoaXMuc3BoZXJlKSB7XG4gICAgdGhpcy5lbiA9IHBqX2VuZm4odGhpcy5lcyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5uID0gMTtcbiAgICB0aGlzLm0gPSAwO1xuICAgIHRoaXMuZXMgPSAwO1xuICAgIHRoaXMuQ195ID0gTWF0aC5zcXJ0KCh0aGlzLm0gKyAxKSAvIHRoaXMubik7XG4gICAgdGhpcy5DX3ggPSB0aGlzLkNfeSAvICh0aGlzLm0gKyAxKTtcbiAgfVxuXG59O1xuXG4vKiBTaW51c29pZGFsIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciB4LCB5O1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICAvKiBGb3J3YXJkIGVxdWF0aW9uc1xuICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBpZiAoIXRoaXMubSkge1xuICAgICAgbGF0ID0gdGhpcy5uICE9PSAxID8gTWF0aC5hc2luKHRoaXMubiAqIE1hdGguc2luKGxhdCkpIDogbGF0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciBrID0gdGhpcy5uICogTWF0aC5zaW4obGF0KTtcbiAgICAgIGZvciAodmFyIGkgPSBNQVhfSVRFUjsgaTsgLS1pKSB7XG4gICAgICAgIHZhciBWID0gKHRoaXMubSAqIGxhdCArIE1hdGguc2luKGxhdCkgLSBrKSAvICh0aGlzLm0gKyBNYXRoLmNvcyhsYXQpKTtcbiAgICAgICAgbGF0IC09IFY7XG4gICAgICAgIGlmIChNYXRoLmFicyhWKSA8IEVQU0xOKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgeCA9IHRoaXMuYSAqIHRoaXMuQ194ICogbG9uICogKHRoaXMubSArIE1hdGguY29zKGxhdCkpO1xuICAgIHkgPSB0aGlzLmEgKiB0aGlzLkNfeSAqIGxhdDtcblxuICB9XG4gIGVsc2Uge1xuXG4gICAgdmFyIHMgPSBNYXRoLnNpbihsYXQpO1xuICAgIHZhciBjID0gTWF0aC5jb3MobGF0KTtcbiAgICB5ID0gdGhpcy5hICogcGpfbWxmbihsYXQsIHMsIGMsIHRoaXMuZW4pO1xuICAgIHggPSB0aGlzLmEgKiBsb24gKiBjIC8gTWF0aC5zcXJ0KDEgLSB0aGlzLmVzICogcyAqIHMpO1xuICB9XG5cbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsYXQsIHRlbXAsIGxvbiwgcztcblxuICBwLnggLT0gdGhpcy54MDtcbiAgbG9uID0gcC54IC8gdGhpcy5hO1xuICBwLnkgLT0gdGhpcy55MDtcbiAgbGF0ID0gcC55IC8gdGhpcy5hO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGxhdCAvPSB0aGlzLkNfeTtcbiAgICBsb24gPSBsb24gLyAodGhpcy5DX3ggKiAodGhpcy5tICsgTWF0aC5jb3MobGF0KSkpO1xuICAgIGlmICh0aGlzLm0pIHtcbiAgICAgIGxhdCA9IGFzaW56KCh0aGlzLm0gKiBsYXQgKyBNYXRoLnNpbihsYXQpKSAvIHRoaXMubik7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMubiAhPT0gMSkge1xuICAgICAgbGF0ID0gYXNpbnooTWF0aC5zaW4obGF0KSAvIHRoaXMubik7XG4gICAgfVxuICAgIGxvbiA9IGFkanVzdF9sb24obG9uICsgdGhpcy5sb25nMCk7XG4gICAgbGF0ID0gYWRqdXN0X2xhdChsYXQpO1xuICB9XG4gIGVsc2Uge1xuICAgIGxhdCA9IHBqX2ludl9tbGZuKHAueSAvIHRoaXMuYSwgdGhpcy5lcywgdGhpcy5lbik7XG4gICAgcyA9IE1hdGguYWJzKGxhdCk7XG4gICAgaWYgKHMgPCBIQUxGX1BJKSB7XG4gICAgICBzID0gTWF0aC5zaW4obGF0KTtcbiAgICAgIHRlbXAgPSB0aGlzLmxvbmcwICsgcC54ICogTWF0aC5zcXJ0KDEgLSB0aGlzLmVzICogcyAqIHMpIC8gKHRoaXMuYSAqIE1hdGguY29zKGxhdCkpO1xuICAgICAgLy90ZW1wID0gdGhpcy5sb25nMCArIHAueCAvICh0aGlzLmEgKiBNYXRoLmNvcyhsYXQpKTtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGVtcCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKChzIC0gRVBTTE4pIDwgSEFMRl9QSSkge1xuICAgICAgbG9uID0gdGhpcy5sb25nMDtcbiAgICB9XG4gIH1cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJTaW51c29pZGFsXCIsIFwic2ludVwiXTsiLCIvKlxuICByZWZlcmVuY2VzOlxuICAgIEZvcm11bGVzIGV0IGNvbnN0YW50ZXMgcG91ciBsZSBDYWxjdWwgcG91ciBsYVxuICAgIHByb2plY3Rpb24gY3lsaW5kcmlxdWUgY29uZm9ybWUgw6AgYXhlIG9ibGlxdWUgZXQgcG91ciBsYSB0cmFuc2Zvcm1hdGlvbiBlbnRyZVxuICAgIGRlcyBzeXN0w6htZXMgZGUgcsOpZsOpcmVuY2UuXG4gICAgaHR0cDovL3d3dy5zd2lzc3RvcG8uYWRtaW4uY2gvaW50ZXJuZXQvc3dpc3N0b3BvL2ZyL2hvbWUvdG9waWNzL3N1cnZleS9zeXMvcmVmc3lzL3N3aXR6ZXJsYW5kLnBhcnN5c3JlbGF0ZWQxLjMxMjE2LmRvd25sb2FkTGlzdC43NzAwNC5Eb3dubG9hZEZpbGUudG1wL3N3aXNzcHJvamVjdGlvbmZyLnBkZlxuICAqL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwaHkwID0gdGhpcy5sYXQwO1xuICB0aGlzLmxhbWJkYTAgPSB0aGlzLmxvbmcwO1xuICB2YXIgc2luUGh5MCA9IE1hdGguc2luKHBoeTApO1xuICB2YXIgc2VtaU1ham9yQXhpcyA9IHRoaXMuYTtcbiAgdmFyIGludkYgPSB0aGlzLnJmO1xuICB2YXIgZmxhdHRlbmluZyA9IDEgLyBpbnZGO1xuICB2YXIgZTIgPSAyICogZmxhdHRlbmluZyAtIE1hdGgucG93KGZsYXR0ZW5pbmcsIDIpO1xuICB2YXIgZSA9IHRoaXMuZSA9IE1hdGguc3FydChlMik7XG4gIHRoaXMuUiA9IHRoaXMuazAgKiBzZW1pTWFqb3JBeGlzICogTWF0aC5zcXJ0KDEgLSBlMikgLyAoMSAtIGUyICogTWF0aC5wb3coc2luUGh5MCwgMikpO1xuICB0aGlzLmFscGhhID0gTWF0aC5zcXJ0KDEgKyBlMiAvICgxIC0gZTIpICogTWF0aC5wb3coTWF0aC5jb3MocGh5MCksIDQpKTtcbiAgdGhpcy5iMCA9IE1hdGguYXNpbihzaW5QaHkwIC8gdGhpcy5hbHBoYSk7XG4gIHZhciBrMSA9IE1hdGgubG9nKE1hdGgudGFuKE1hdGguUEkgLyA0ICsgdGhpcy5iMCAvIDIpKTtcbiAgdmFyIGsyID0gTWF0aC5sb2coTWF0aC50YW4oTWF0aC5QSSAvIDQgKyBwaHkwIC8gMikpO1xuICB2YXIgazMgPSBNYXRoLmxvZygoMSArIGUgKiBzaW5QaHkwKSAvICgxIC0gZSAqIHNpblBoeTApKTtcbiAgdGhpcy5LID0gazEgLSB0aGlzLmFscGhhICogazIgKyB0aGlzLmFscGhhICogZSAvIDIgKiBrMztcbn07XG5cblxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgU2ExID0gTWF0aC5sb2coTWF0aC50YW4oTWF0aC5QSSAvIDQgLSBwLnkgLyAyKSk7XG4gIHZhciBTYTIgPSB0aGlzLmUgLyAyICogTWF0aC5sb2coKDEgKyB0aGlzLmUgKiBNYXRoLnNpbihwLnkpKSAvICgxIC0gdGhpcy5lICogTWF0aC5zaW4ocC55KSkpO1xuICB2YXIgUyA9IC10aGlzLmFscGhhICogKFNhMSArIFNhMikgKyB0aGlzLks7XG5cbiAgLy8gc3BoZXJpYyBsYXRpdHVkZVxuICB2YXIgYiA9IDIgKiAoTWF0aC5hdGFuKE1hdGguZXhwKFMpKSAtIE1hdGguUEkgLyA0KTtcblxuICAvLyBzcGhlcmljIGxvbmdpdHVkZVxuICB2YXIgSSA9IHRoaXMuYWxwaGEgKiAocC54IC0gdGhpcy5sYW1iZGEwKTtcblxuICAvLyBwc29ldWRvIGVxdWF0b3JpYWwgcm90YXRpb25cbiAgdmFyIHJvdEkgPSBNYXRoLmF0YW4oTWF0aC5zaW4oSSkgLyAoTWF0aC5zaW4odGhpcy5iMCkgKiBNYXRoLnRhbihiKSArIE1hdGguY29zKHRoaXMuYjApICogTWF0aC5jb3MoSSkpKTtcblxuICB2YXIgcm90QiA9IE1hdGguYXNpbihNYXRoLmNvcyh0aGlzLmIwKSAqIE1hdGguc2luKGIpIC0gTWF0aC5zaW4odGhpcy5iMCkgKiBNYXRoLmNvcyhiKSAqIE1hdGguY29zKEkpKTtcblxuICBwLnkgPSB0aGlzLlIgLyAyICogTWF0aC5sb2coKDEgKyBNYXRoLnNpbihyb3RCKSkgLyAoMSAtIE1hdGguc2luKHJvdEIpKSkgKyB0aGlzLnkwO1xuICBwLnggPSB0aGlzLlIgKiByb3RJICsgdGhpcy54MDtcbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBZID0gcC54IC0gdGhpcy54MDtcbiAgdmFyIFggPSBwLnkgLSB0aGlzLnkwO1xuXG4gIHZhciByb3RJID0gWSAvIHRoaXMuUjtcbiAgdmFyIHJvdEIgPSAyICogKE1hdGguYXRhbihNYXRoLmV4cChYIC8gdGhpcy5SKSkgLSBNYXRoLlBJIC8gNCk7XG5cbiAgdmFyIGIgPSBNYXRoLmFzaW4oTWF0aC5jb3ModGhpcy5iMCkgKiBNYXRoLnNpbihyb3RCKSArIE1hdGguc2luKHRoaXMuYjApICogTWF0aC5jb3Mocm90QikgKiBNYXRoLmNvcyhyb3RJKSk7XG4gIHZhciBJID0gTWF0aC5hdGFuKE1hdGguc2luKHJvdEkpIC8gKE1hdGguY29zKHRoaXMuYjApICogTWF0aC5jb3Mocm90SSkgLSBNYXRoLnNpbih0aGlzLmIwKSAqIE1hdGgudGFuKHJvdEIpKSk7XG5cbiAgdmFyIGxhbWJkYSA9IHRoaXMubGFtYmRhMCArIEkgLyB0aGlzLmFscGhhO1xuXG4gIHZhciBTID0gMDtcbiAgdmFyIHBoeSA9IGI7XG4gIHZhciBwcmV2UGh5ID0gLTEwMDA7XG4gIHZhciBpdGVyYXRpb24gPSAwO1xuICB3aGlsZSAoTWF0aC5hYnMocGh5IC0gcHJldlBoeSkgPiAwLjAwMDAwMDEpIHtcbiAgICBpZiAoKytpdGVyYXRpb24gPiAyMCkge1xuICAgICAgLy8uLi5yZXBvcnRFcnJvcihcIm9tZXJjRndkSW5maW5pdHlcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vUyA9IE1hdGgubG9nKE1hdGgudGFuKE1hdGguUEkgLyA0ICsgcGh5IC8gMikpO1xuICAgIFMgPSAxIC8gdGhpcy5hbHBoYSAqIChNYXRoLmxvZyhNYXRoLnRhbihNYXRoLlBJIC8gNCArIGIgLyAyKSkgLSB0aGlzLkspICsgdGhpcy5lICogTWF0aC5sb2coTWF0aC50YW4oTWF0aC5QSSAvIDQgKyBNYXRoLmFzaW4odGhpcy5lICogTWF0aC5zaW4ocGh5KSkgLyAyKSk7XG4gICAgcHJldlBoeSA9IHBoeTtcbiAgICBwaHkgPSAyICogTWF0aC5hdGFuKE1hdGguZXhwKFMpKSAtIE1hdGguUEkgLyAyO1xuICB9XG5cbiAgcC54ID0gbGFtYmRhO1xuICBwLnkgPSBwaHk7XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5uYW1lcyA9IFtcInNvbWVyY1wiXTtcbiIsInZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBzaWduID0gcmVxdWlyZSgnLi4vY29tbW9uL3NpZ24nKTtcbnZhciBtc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tc2ZueicpO1xudmFyIHRzZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL3RzZm56Jyk7XG52YXIgcGhpMnogPSByZXF1aXJlKCcuLi9jb21tb24vcGhpMnonKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbmV4cG9ydHMuc3Nmbl8gPSBmdW5jdGlvbihwaGl0LCBzaW5waGksIGVjY2VuKSB7XG4gIHNpbnBoaSAqPSBlY2NlbjtcbiAgcmV0dXJuIChNYXRoLnRhbigwLjUgKiAoSEFMRl9QSSArIHBoaXQpKSAqIE1hdGgucG93KCgxIC0gc2lucGhpKSAvICgxICsgc2lucGhpKSwgMC41ICogZWNjZW4pKTtcbn07XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNvc2xhdDAgPSBNYXRoLmNvcyh0aGlzLmxhdDApO1xuICB0aGlzLnNpbmxhdDAgPSBNYXRoLnNpbih0aGlzLmxhdDApO1xuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBpZiAodGhpcy5rMCA9PT0gMSAmJiAhaXNOYU4odGhpcy5sYXRfdHMpICYmIE1hdGguYWJzKHRoaXMuY29zbGF0MCkgPD0gRVBTTE4pIHtcbiAgICAgIHRoaXMuazAgPSAwLjUgKiAoMSArIHNpZ24odGhpcy5sYXQwKSAqIE1hdGguc2luKHRoaXMubGF0X3RzKSk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGlmIChNYXRoLmFicyh0aGlzLmNvc2xhdDApIDw9IEVQU0xOKSB7XG4gICAgICBpZiAodGhpcy5sYXQwID4gMCkge1xuICAgICAgICAvL05vcnRoIHBvbGVcbiAgICAgICAgLy90cmFjZSgnc3RlcmU6bm9ydGggcG9sZScpO1xuICAgICAgICB0aGlzLmNvbiA9IDE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy9Tb3V0aCBwb2xlXG4gICAgICAgIC8vdHJhY2UoJ3N0ZXJlOnNvdXRoIHBvbGUnKTtcbiAgICAgICAgdGhpcy5jb24gPSAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb25zID0gTWF0aC5zcXJ0KE1hdGgucG93KDEgKyB0aGlzLmUsIDEgKyB0aGlzLmUpICogTWF0aC5wb3coMSAtIHRoaXMuZSwgMSAtIHRoaXMuZSkpO1xuICAgIGlmICh0aGlzLmswID09PSAxICYmICFpc05hTih0aGlzLmxhdF90cykgJiYgTWF0aC5hYnModGhpcy5jb3NsYXQwKSA8PSBFUFNMTikge1xuICAgICAgdGhpcy5rMCA9IDAuNSAqIHRoaXMuY29ucyAqIG1zZm56KHRoaXMuZSwgTWF0aC5zaW4odGhpcy5sYXRfdHMpLCBNYXRoLmNvcyh0aGlzLmxhdF90cykpIC8gdHNmbnoodGhpcy5lLCB0aGlzLmNvbiAqIHRoaXMubGF0X3RzLCB0aGlzLmNvbiAqIE1hdGguc2luKHRoaXMubGF0X3RzKSk7XG4gICAgfVxuICAgIHRoaXMubXMxID0gbXNmbnoodGhpcy5lLCB0aGlzLnNpbmxhdDAsIHRoaXMuY29zbGF0MCk7XG4gICAgdGhpcy5YMCA9IDIgKiBNYXRoLmF0YW4odGhpcy5zc2ZuXyh0aGlzLmxhdDAsIHRoaXMuc2lubGF0MCwgdGhpcy5lKSkgLSBIQUxGX1BJO1xuICAgIHRoaXMuY29zWDAgPSBNYXRoLmNvcyh0aGlzLlgwKTtcbiAgICB0aGlzLnNpblgwID0gTWF0aC5zaW4odGhpcy5YMCk7XG4gIH1cbn07XG5cbi8vIFN0ZXJlb2dyYXBoaWMgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIHZhciBzaW5sYXQgPSBNYXRoLnNpbihsYXQpO1xuICB2YXIgY29zbGF0ID0gTWF0aC5jb3MobGF0KTtcbiAgdmFyIEEsIFgsIHNpblgsIGNvc1gsIHRzLCByaDtcbiAgdmFyIGRsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuXG4gIGlmIChNYXRoLmFicyhNYXRoLmFicyhsb24gLSB0aGlzLmxvbmcwKSAtIE1hdGguUEkpIDw9IEVQU0xOICYmIE1hdGguYWJzKGxhdCArIHRoaXMubGF0MCkgPD0gRVBTTE4pIHtcbiAgICAvL2Nhc2Ugb2YgdGhlIG9yaWdpbmUgcG9pbnRcbiAgICAvL3RyYWNlKCdzdGVyZTp0aGlzIGlzIHRoZSBvcmlnaW4gcG9pbnQnKTtcbiAgICBwLnggPSBOYU47XG4gICAgcC55ID0gTmFOO1xuICAgIHJldHVybiBwO1xuICB9XG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIC8vdHJhY2UoJ3N0ZXJlOnNwaGVyZSBjYXNlJyk7XG4gICAgQSA9IDIgKiB0aGlzLmswIC8gKDEgKyB0aGlzLnNpbmxhdDAgKiBzaW5sYXQgKyB0aGlzLmNvc2xhdDAgKiBjb3NsYXQgKiBNYXRoLmNvcyhkbG9uKSk7XG4gICAgcC54ID0gdGhpcy5hICogQSAqIGNvc2xhdCAqIE1hdGguc2luKGRsb24pICsgdGhpcy54MDtcbiAgICBwLnkgPSB0aGlzLmEgKiBBICogKHRoaXMuY29zbGF0MCAqIHNpbmxhdCAtIHRoaXMuc2lubGF0MCAqIGNvc2xhdCAqIE1hdGguY29zKGRsb24pKSArIHRoaXMueTA7XG4gICAgcmV0dXJuIHA7XG4gIH1cbiAgZWxzZSB7XG4gICAgWCA9IDIgKiBNYXRoLmF0YW4odGhpcy5zc2ZuXyhsYXQsIHNpbmxhdCwgdGhpcy5lKSkgLSBIQUxGX1BJO1xuICAgIGNvc1ggPSBNYXRoLmNvcyhYKTtcbiAgICBzaW5YID0gTWF0aC5zaW4oWCk7XG4gICAgaWYgKE1hdGguYWJzKHRoaXMuY29zbGF0MCkgPD0gRVBTTE4pIHtcbiAgICAgIHRzID0gdHNmbnoodGhpcy5lLCBsYXQgKiB0aGlzLmNvbiwgdGhpcy5jb24gKiBzaW5sYXQpO1xuICAgICAgcmggPSAyICogdGhpcy5hICogdGhpcy5rMCAqIHRzIC8gdGhpcy5jb25zO1xuICAgICAgcC54ID0gdGhpcy54MCArIHJoICogTWF0aC5zaW4obG9uIC0gdGhpcy5sb25nMCk7XG4gICAgICBwLnkgPSB0aGlzLnkwIC0gdGhpcy5jb24gKiByaCAqIE1hdGguY29zKGxvbiAtIHRoaXMubG9uZzApO1xuICAgICAgLy90cmFjZShwLnRvU3RyaW5nKCkpO1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGVsc2UgaWYgKE1hdGguYWJzKHRoaXMuc2lubGF0MCkgPCBFUFNMTikge1xuICAgICAgLy9FcVxuICAgICAgLy90cmFjZSgnc3RlcmU6ZXF1YXRldXInKTtcbiAgICAgIEEgPSAyICogdGhpcy5hICogdGhpcy5rMCAvICgxICsgY29zWCAqIE1hdGguY29zKGRsb24pKTtcbiAgICAgIHAueSA9IEEgKiBzaW5YO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vb3RoZXIgY2FzZVxuICAgICAgLy90cmFjZSgnc3RlcmU6bm9ybWFsIGNhc2UnKTtcbiAgICAgIEEgPSAyICogdGhpcy5hICogdGhpcy5rMCAqIHRoaXMubXMxIC8gKHRoaXMuY29zWDAgKiAoMSArIHRoaXMuc2luWDAgKiBzaW5YICsgdGhpcy5jb3NYMCAqIGNvc1ggKiBNYXRoLmNvcyhkbG9uKSkpO1xuICAgICAgcC55ID0gQSAqICh0aGlzLmNvc1gwICogc2luWCAtIHRoaXMuc2luWDAgKiBjb3NYICogTWF0aC5jb3MoZGxvbikpICsgdGhpcy55MDtcbiAgICB9XG4gICAgcC54ID0gQSAqIGNvc1ggKiBNYXRoLnNpbihkbG9uKSArIHRoaXMueDA7XG4gIH1cbiAgLy90cmFjZShwLnRvU3RyaW5nKCkpO1xuICByZXR1cm4gcDtcbn07XG5cblxuLy8qIFN0ZXJlb2dyYXBoaWMgaW52ZXJzZSBlcXVhdGlvbnMtLW1hcHBpbmcgeCx5IHRvIGxhdC9sb25nXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgLT0gdGhpcy55MDtcbiAgdmFyIGxvbiwgbGF0LCB0cywgY2UsIENoaTtcbiAgdmFyIHJoID0gTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHZhciBjID0gMiAqIE1hdGguYXRhbihyaCAvICgwLjUgKiB0aGlzLmEgKiB0aGlzLmswKSk7XG4gICAgbG9uID0gdGhpcy5sb25nMDtcbiAgICBsYXQgPSB0aGlzLmxhdDA7XG4gICAgaWYgKHJoIDw9IEVQU0xOKSB7XG4gICAgICBwLnggPSBsb247XG4gICAgICBwLnkgPSBsYXQ7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgbGF0ID0gTWF0aC5hc2luKE1hdGguY29zKGMpICogdGhpcy5zaW5sYXQwICsgcC55ICogTWF0aC5zaW4oYykgKiB0aGlzLmNvc2xhdDAgLyByaCk7XG4gICAgaWYgKE1hdGguYWJzKHRoaXMuY29zbGF0MCkgPCBFUFNMTikge1xuICAgICAgaWYgKHRoaXMubGF0MCA+IDApIHtcbiAgICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLngsIC0gMSAqIHAueSkpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXRhbjIocC54LCBwLnkpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCAqIE1hdGguc2luKGMpLCByaCAqIHRoaXMuY29zbGF0MCAqIE1hdGguY29zKGMpIC0gcC55ICogdGhpcy5zaW5sYXQwICogTWF0aC5zaW4oYykpKTtcbiAgICB9XG4gICAgcC54ID0gbG9uO1xuICAgIHAueSA9IGxhdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAoTWF0aC5hYnModGhpcy5jb3NsYXQwKSA8PSBFUFNMTikge1xuICAgICAgaWYgKHJoIDw9IEVQU0xOKSB7XG4gICAgICAgIGxhdCA9IHRoaXMubGF0MDtcbiAgICAgICAgbG9uID0gdGhpcy5sb25nMDtcbiAgICAgICAgcC54ID0gbG9uO1xuICAgICAgICBwLnkgPSBsYXQ7XG4gICAgICAgIC8vdHJhY2UocC50b1N0cmluZygpKTtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgICB9XG4gICAgICBwLnggKj0gdGhpcy5jb247XG4gICAgICBwLnkgKj0gdGhpcy5jb247XG4gICAgICB0cyA9IHJoICogdGhpcy5jb25zIC8gKDIgKiB0aGlzLmEgKiB0aGlzLmswKTtcbiAgICAgIGxhdCA9IHRoaXMuY29uICogcGhpMnoodGhpcy5lLCB0cyk7XG4gICAgICBsb24gPSB0aGlzLmNvbiAqIGFkanVzdF9sb24odGhpcy5jb24gKiB0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLngsIC0gMSAqIHAueSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNlID0gMiAqIE1hdGguYXRhbihyaCAqIHRoaXMuY29zWDAgLyAoMiAqIHRoaXMuYSAqIHRoaXMuazAgKiB0aGlzLm1zMSkpO1xuICAgICAgbG9uID0gdGhpcy5sb25nMDtcbiAgICAgIGlmIChyaCA8PSBFUFNMTikge1xuICAgICAgICBDaGkgPSB0aGlzLlgwO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIENoaSA9IE1hdGguYXNpbihNYXRoLmNvcyhjZSkgKiB0aGlzLnNpblgwICsgcC55ICogTWF0aC5zaW4oY2UpICogdGhpcy5jb3NYMCAvIHJoKTtcbiAgICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLnggKiBNYXRoLnNpbihjZSksIHJoICogdGhpcy5jb3NYMCAqIE1hdGguY29zKGNlKSAtIHAueSAqIHRoaXMuc2luWDAgKiBNYXRoLnNpbihjZSkpKTtcbiAgICAgIH1cbiAgICAgIGxhdCA9IC0xICogcGhpMnoodGhpcy5lLCBNYXRoLnRhbigwLjUgKiAoSEFMRl9QSSArIENoaSkpKTtcbiAgICB9XG4gIH1cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG5cbiAgLy90cmFjZShwLnRvU3RyaW5nKCkpO1xuICByZXR1cm4gcDtcblxufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJzdGVyZVwiLCBcIlN0ZXJlb2dyYXBoaWNfU291dGhfUG9sZVwiLCBcIlBvbGFyIFN0ZXJlb2dyYXBoaWMgKHZhcmlhbnQgQilcIl07XG4iLCJ2YXIgZ2F1c3MgPSByZXF1aXJlKCcuL2dhdXNzJyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgZ2F1c3MuaW5pdC5hcHBseSh0aGlzKTtcbiAgaWYgKCF0aGlzLnJjKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuc2luYzAgPSBNYXRoLnNpbih0aGlzLnBoaWMwKTtcbiAgdGhpcy5jb3NjMCA9IE1hdGguY29zKHRoaXMucGhpYzApO1xuICB0aGlzLlIyID0gMiAqIHRoaXMucmM7XG4gIGlmICghdGhpcy50aXRsZSkge1xuICAgIHRoaXMudGl0bGUgPSBcIk9ibGlxdWUgU3RlcmVvZ3JhcGhpYyBBbHRlcm5hdGl2ZVwiO1xuICB9XG59O1xuXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBzaW5jLCBjb3NjLCBjb3NsLCBrO1xuICBwLnggPSBhZGp1c3RfbG9uKHAueCAtIHRoaXMubG9uZzApO1xuICBnYXVzcy5mb3J3YXJkLmFwcGx5KHRoaXMsIFtwXSk7XG4gIHNpbmMgPSBNYXRoLnNpbihwLnkpO1xuICBjb3NjID0gTWF0aC5jb3MocC55KTtcbiAgY29zbCA9IE1hdGguY29zKHAueCk7XG4gIGsgPSB0aGlzLmswICogdGhpcy5SMiAvICgxICsgdGhpcy5zaW5jMCAqIHNpbmMgKyB0aGlzLmNvc2MwICogY29zYyAqIGNvc2wpO1xuICBwLnggPSBrICogY29zYyAqIE1hdGguc2luKHAueCk7XG4gIHAueSA9IGsgKiAodGhpcy5jb3NjMCAqIHNpbmMgLSB0aGlzLnNpbmMwICogY29zYyAqIGNvc2wpO1xuICBwLnggPSB0aGlzLmEgKiBwLnggKyB0aGlzLngwO1xuICBwLnkgPSB0aGlzLmEgKiBwLnkgKyB0aGlzLnkwO1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHNpbmMsIGNvc2MsIGxvbiwgbGF0LCByaG87XG4gIHAueCA9IChwLnggLSB0aGlzLngwKSAvIHRoaXMuYTtcbiAgcC55ID0gKHAueSAtIHRoaXMueTApIC8gdGhpcy5hO1xuXG4gIHAueCAvPSB0aGlzLmswO1xuICBwLnkgLz0gdGhpcy5rMDtcbiAgaWYgKChyaG8gPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KSkpIHtcbiAgICB2YXIgYyA9IDIgKiBNYXRoLmF0YW4yKHJobywgdGhpcy5SMik7XG4gICAgc2luYyA9IE1hdGguc2luKGMpO1xuICAgIGNvc2MgPSBNYXRoLmNvcyhjKTtcbiAgICBsYXQgPSBNYXRoLmFzaW4oY29zYyAqIHRoaXMuc2luYzAgKyBwLnkgKiBzaW5jICogdGhpcy5jb3NjMCAvIHJobyk7XG4gICAgbG9uID0gTWF0aC5hdGFuMihwLnggKiBzaW5jLCByaG8gKiB0aGlzLmNvc2MwICogY29zYyAtIHAueSAqIHRoaXMuc2luYzAgKiBzaW5jKTtcbiAgfVxuICBlbHNlIHtcbiAgICBsYXQgPSB0aGlzLnBoaWMwO1xuICAgIGxvbiA9IDA7XG4gIH1cblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgZ2F1c3MuaW52ZXJzZS5hcHBseSh0aGlzLCBbcF0pO1xuICBwLnggPSBhZGp1c3RfbG9uKHAueCArIHRoaXMubG9uZzApO1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMubmFtZXMgPSBbXCJTdGVyZW9ncmFwaGljX05vcnRoX1BvbGVcIiwgXCJPYmxpcXVlX1N0ZXJlb2dyYXBoaWNcIiwgXCJQb2xhcl9TdGVyZW9ncmFwaGljXCIsIFwic3RlcmVhXCIsXCJPYmxpcXVlIFN0ZXJlb2dyYXBoaWMgQWx0ZXJuYXRpdmVcIl07XG4iLCJ2YXIgZTBmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMGZuJyk7XG52YXIgZTFmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMWZuJyk7XG52YXIgZTJmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMmZuJyk7XG52YXIgZTNmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lM2ZuJyk7XG52YXIgbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tbGZuJyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgc2lnbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zaWduJyk7XG52YXIgYXNpbnogPSByZXF1aXJlKCcuLi9jb21tb24vYXNpbnonKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZTAgPSBlMGZuKHRoaXMuZXMpO1xuICB0aGlzLmUxID0gZTFmbih0aGlzLmVzKTtcbiAgdGhpcy5lMiA9IGUyZm4odGhpcy5lcyk7XG4gIHRoaXMuZTMgPSBlM2ZuKHRoaXMuZXMpO1xuICB0aGlzLm1sMCA9IHRoaXMuYSAqIG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgdGhpcy5sYXQwKTtcbn07XG5cbi8qKlxuICAgIFRyYW5zdmVyc2UgTWVyY2F0b3IgRm9yd2FyZCAgLSBsb25nL2xhdCB0byB4L3lcbiAgICBsb25nL2xhdCBpbiByYWRpYW5zXG4gICovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG5cbiAgdmFyIGRlbHRhX2xvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciBjb247XG4gIHZhciB4LCB5O1xuICB2YXIgc2luX3BoaSA9IE1hdGguc2luKGxhdCk7XG4gIHZhciBjb3NfcGhpID0gTWF0aC5jb3MobGF0KTtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICB2YXIgYiA9IGNvc19waGkgKiBNYXRoLnNpbihkZWx0YV9sb24pO1xuICAgIGlmICgoTWF0aC5hYnMoTWF0aC5hYnMoYikgLSAxKSkgPCAwLjAwMDAwMDAwMDEpIHtcbiAgICAgIHJldHVybiAoOTMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHggPSAwLjUgKiB0aGlzLmEgKiB0aGlzLmswICogTWF0aC5sb2coKDEgKyBiKSAvICgxIC0gYikpO1xuICAgICAgY29uID0gTWF0aC5hY29zKGNvc19waGkgKiBNYXRoLmNvcyhkZWx0YV9sb24pIC8gTWF0aC5zcXJ0KDEgLSBiICogYikpO1xuICAgICAgaWYgKGxhdCA8IDApIHtcbiAgICAgICAgY29uID0gLWNvbjtcbiAgICAgIH1cbiAgICAgIHkgPSB0aGlzLmEgKiB0aGlzLmswICogKGNvbiAtIHRoaXMubGF0MCk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIHZhciBhbCA9IGNvc19waGkgKiBkZWx0YV9sb247XG4gICAgdmFyIGFscyA9IE1hdGgucG93KGFsLCAyKTtcbiAgICB2YXIgYyA9IHRoaXMuZXAyICogTWF0aC5wb3coY29zX3BoaSwgMik7XG4gICAgdmFyIHRxID0gTWF0aC50YW4obGF0KTtcbiAgICB2YXIgdCA9IE1hdGgucG93KHRxLCAyKTtcbiAgICBjb24gPSAxIC0gdGhpcy5lcyAqIE1hdGgucG93KHNpbl9waGksIDIpO1xuICAgIHZhciBuID0gdGhpcy5hIC8gTWF0aC5zcXJ0KGNvbik7XG4gICAgdmFyIG1sID0gdGhpcy5hICogbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCBsYXQpO1xuXG4gICAgeCA9IHRoaXMuazAgKiBuICogYWwgKiAoMSArIGFscyAvIDYgKiAoMSAtIHQgKyBjICsgYWxzIC8gMjAgKiAoNSAtIDE4ICogdCArIE1hdGgucG93KHQsIDIpICsgNzIgKiBjIC0gNTggKiB0aGlzLmVwMikpKSArIHRoaXMueDA7XG4gICAgeSA9IHRoaXMuazAgKiAobWwgLSB0aGlzLm1sMCArIG4gKiB0cSAqIChhbHMgKiAoMC41ICsgYWxzIC8gMjQgKiAoNSAtIHQgKyA5ICogYyArIDQgKiBNYXRoLnBvdyhjLCAyKSArIGFscyAvIDMwICogKDYxIC0gNTggKiB0ICsgTWF0aC5wb3codCwgMikgKyA2MDAgKiBjIC0gMzMwICogdGhpcy5lcDIpKSkpKSArIHRoaXMueTA7XG5cbiAgfVxuICBwLnggPSB4O1xuICBwLnkgPSB5O1xuICByZXR1cm4gcDtcbn07XG5cbi8qKlxuICAgIFRyYW5zdmVyc2UgTWVyY2F0b3IgSW52ZXJzZSAgLSAgeC95IHRvIGxvbmcvbGF0XG4gICovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBjb24sIHBoaTtcbiAgdmFyIGRlbHRhX3BoaTtcbiAgdmFyIGk7XG4gIHZhciBtYXhfaXRlciA9IDY7XG4gIHZhciBsYXQsIGxvbjtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICB2YXIgZiA9IE1hdGguZXhwKHAueCAvICh0aGlzLmEgKiB0aGlzLmswKSk7XG4gICAgdmFyIGcgPSAwLjUgKiAoZiAtIDEgLyBmKTtcbiAgICB2YXIgdGVtcCA9IHRoaXMubGF0MCArIHAueSAvICh0aGlzLmEgKiB0aGlzLmswKTtcbiAgICB2YXIgaCA9IE1hdGguY29zKHRlbXApO1xuICAgIGNvbiA9IE1hdGguc3FydCgoMSAtIGggKiBoKSAvICgxICsgZyAqIGcpKTtcbiAgICBsYXQgPSBhc2lueihjb24pO1xuICAgIGlmICh0ZW1wIDwgMCkge1xuICAgICAgbGF0ID0gLWxhdDtcbiAgICB9XG4gICAgaWYgKChnID09PSAwKSAmJiAoaCA9PT0gMCkpIHtcbiAgICAgIGxvbiA9IHRoaXMubG9uZzA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbG9uID0gYWRqdXN0X2xvbihNYXRoLmF0YW4yKGcsIGgpICsgdGhpcy5sb25nMCk7XG4gICAgfVxuICB9XG4gIGVsc2UgeyAvLyBlbGxpcHNvaWRhbCBmb3JtXG4gICAgdmFyIHggPSBwLnggLSB0aGlzLngwO1xuICAgIHZhciB5ID0gcC55IC0gdGhpcy55MDtcblxuICAgIGNvbiA9ICh0aGlzLm1sMCArIHkgLyB0aGlzLmswKSAvIHRoaXMuYTtcbiAgICBwaGkgPSBjb247XG4gICAgZm9yIChpID0gMDsgdHJ1ZTsgaSsrKSB7XG4gICAgICBkZWx0YV9waGkgPSAoKGNvbiArIHRoaXMuZTEgKiBNYXRoLnNpbigyICogcGhpKSAtIHRoaXMuZTIgKiBNYXRoLnNpbig0ICogcGhpKSArIHRoaXMuZTMgKiBNYXRoLnNpbig2ICogcGhpKSkgLyB0aGlzLmUwKSAtIHBoaTtcbiAgICAgIHBoaSArPSBkZWx0YV9waGk7XG4gICAgICBpZiAoTWF0aC5hYnMoZGVsdGFfcGhpKSA8PSBFUFNMTikge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChpID49IG1heF9pdGVyKSB7XG4gICAgICAgIHJldHVybiAoOTUpO1xuICAgICAgfVxuICAgIH0gLy8gZm9yKClcbiAgICBpZiAoTWF0aC5hYnMocGhpKSA8IEhBTEZfUEkpIHtcbiAgICAgIHZhciBzaW5fcGhpID0gTWF0aC5zaW4ocGhpKTtcbiAgICAgIHZhciBjb3NfcGhpID0gTWF0aC5jb3MocGhpKTtcbiAgICAgIHZhciB0YW5fcGhpID0gTWF0aC50YW4ocGhpKTtcbiAgICAgIHZhciBjID0gdGhpcy5lcDIgKiBNYXRoLnBvdyhjb3NfcGhpLCAyKTtcbiAgICAgIHZhciBjcyA9IE1hdGgucG93KGMsIDIpO1xuICAgICAgdmFyIHQgPSBNYXRoLnBvdyh0YW5fcGhpLCAyKTtcbiAgICAgIHZhciB0cyA9IE1hdGgucG93KHQsIDIpO1xuICAgICAgY29uID0gMSAtIHRoaXMuZXMgKiBNYXRoLnBvdyhzaW5fcGhpLCAyKTtcbiAgICAgIHZhciBuID0gdGhpcy5hIC8gTWF0aC5zcXJ0KGNvbik7XG4gICAgICB2YXIgciA9IG4gKiAoMSAtIHRoaXMuZXMpIC8gY29uO1xuICAgICAgdmFyIGQgPSB4IC8gKG4gKiB0aGlzLmswKTtcbiAgICAgIHZhciBkcyA9IE1hdGgucG93KGQsIDIpO1xuICAgICAgbGF0ID0gcGhpIC0gKG4gKiB0YW5fcGhpICogZHMgLyByKSAqICgwLjUgLSBkcyAvIDI0ICogKDUgKyAzICogdCArIDEwICogYyAtIDQgKiBjcyAtIDkgKiB0aGlzLmVwMiAtIGRzIC8gMzAgKiAoNjEgKyA5MCAqIHQgKyAyOTggKiBjICsgNDUgKiB0cyAtIDI1MiAqIHRoaXMuZXAyIC0gMyAqIGNzKSkpO1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgKGQgKiAoMSAtIGRzIC8gNiAqICgxICsgMiAqIHQgKyBjIC0gZHMgLyAyMCAqICg1IC0gMiAqIGMgKyAyOCAqIHQgLSAzICogY3MgKyA4ICogdGhpcy5lcDIgKyAyNCAqIHRzKSkpIC8gY29zX3BoaSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxhdCA9IEhBTEZfUEkgKiBzaWduKHkpO1xuICAgICAgbG9uID0gdGhpcy5sb25nMDtcbiAgICB9XG4gIH1cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJUcmFuc3ZlcnNlX01lcmNhdG9yXCIsIFwiVHJhbnN2ZXJzZSBNZXJjYXRvclwiLCBcInRtZXJjXCJdO1xuIiwidmFyIEQyUiA9IDAuMDE3NDUzMjkyNTE5OTQzMjk1Nzc7XG52YXIgdG1lcmMgPSByZXF1aXJlKCcuL3RtZXJjJyk7XG5leHBvcnRzLmRlcGVuZHNPbiA9ICd0bWVyYyc7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLnpvbmUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5sYXQwID0gMDtcbiAgdGhpcy5sb25nMCA9ICgoNiAqIE1hdGguYWJzKHRoaXMuem9uZSkpIC0gMTgzKSAqIEQyUjtcbiAgdGhpcy54MCA9IDUwMDAwMDtcbiAgdGhpcy55MCA9IHRoaXMudXRtU291dGggPyAxMDAwMDAwMCA6IDA7XG4gIHRoaXMuazAgPSAwLjk5OTY7XG5cbiAgdG1lcmMuaW5pdC5hcHBseSh0aGlzKTtcbiAgdGhpcy5mb3J3YXJkID0gdG1lcmMuZm9yd2FyZDtcbiAgdGhpcy5pbnZlcnNlID0gdG1lcmMuaW52ZXJzZTtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiVW5pdmVyc2FsIFRyYW5zdmVyc2UgTWVyY2F0b3IgU3lzdGVtXCIsIFwidXRtXCJdO1xuIiwidmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIGFzaW56ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FzaW56Jyk7XG4vKiBJbml0aWFsaXplIHRoZSBWYW4gRGVyIEdyaW50ZW4gcHJvamVjdGlvblxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAvL3RoaXMuUiA9IDYzNzA5OTc7IC8vUmFkaXVzIG9mIGVhcnRoXG4gIHRoaXMuUiA9IHRoaXMuYTtcbn07XG5cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcblxuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuXG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICB2YXIgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciB4LCB5O1xuXG4gIGlmIChNYXRoLmFicyhsYXQpIDw9IEVQU0xOKSB7XG4gICAgeCA9IHRoaXMueDAgKyB0aGlzLlIgKiBkbG9uO1xuICAgIHkgPSB0aGlzLnkwO1xuICB9XG4gIHZhciB0aGV0YSA9IGFzaW56KDIgKiBNYXRoLmFicyhsYXQgLyBNYXRoLlBJKSk7XG4gIGlmICgoTWF0aC5hYnMoZGxvbikgPD0gRVBTTE4pIHx8IChNYXRoLmFicyhNYXRoLmFicyhsYXQpIC0gSEFMRl9QSSkgPD0gRVBTTE4pKSB7XG4gICAgeCA9IHRoaXMueDA7XG4gICAgaWYgKGxhdCA+PSAwKSB7XG4gICAgICB5ID0gdGhpcy55MCArIE1hdGguUEkgKiB0aGlzLlIgKiBNYXRoLnRhbigwLjUgKiB0aGV0YSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgeSA9IHRoaXMueTAgKyBNYXRoLlBJICogdGhpcy5SICogLU1hdGgudGFuKDAuNSAqIHRoZXRhKTtcbiAgICB9XG4gICAgLy8gIHJldHVybihPSyk7XG4gIH1cbiAgdmFyIGFsID0gMC41ICogTWF0aC5hYnMoKE1hdGguUEkgLyBkbG9uKSAtIChkbG9uIC8gTWF0aC5QSSkpO1xuICB2YXIgYXNxID0gYWwgKiBhbDtcbiAgdmFyIHNpbnRoID0gTWF0aC5zaW4odGhldGEpO1xuICB2YXIgY29zdGggPSBNYXRoLmNvcyh0aGV0YSk7XG5cbiAgdmFyIGcgPSBjb3N0aCAvIChzaW50aCArIGNvc3RoIC0gMSk7XG4gIHZhciBnc3EgPSBnICogZztcbiAgdmFyIG0gPSBnICogKDIgLyBzaW50aCAtIDEpO1xuICB2YXIgbXNxID0gbSAqIG07XG4gIHZhciBjb24gPSBNYXRoLlBJICogdGhpcy5SICogKGFsICogKGcgLSBtc3EpICsgTWF0aC5zcXJ0KGFzcSAqIChnIC0gbXNxKSAqIChnIC0gbXNxKSAtIChtc3EgKyBhc3EpICogKGdzcSAtIG1zcSkpKSAvIChtc3EgKyBhc3EpO1xuICBpZiAoZGxvbiA8IDApIHtcbiAgICBjb24gPSAtY29uO1xuICB9XG4gIHggPSB0aGlzLngwICsgY29uO1xuICAvL2NvbiA9IE1hdGguYWJzKGNvbiAvIChNYXRoLlBJICogdGhpcy5SKSk7XG4gIHZhciBxID0gYXNxICsgZztcbiAgY29uID0gTWF0aC5QSSAqIHRoaXMuUiAqIChtICogcSAtIGFsICogTWF0aC5zcXJ0KChtc3EgKyBhc3EpICogKGFzcSArIDEpIC0gcSAqIHEpKSAvIChtc3EgKyBhc3EpO1xuICBpZiAobGF0ID49IDApIHtcbiAgICAvL3kgPSB0aGlzLnkwICsgTWF0aC5QSSAqIHRoaXMuUiAqIE1hdGguc3FydCgxIC0gY29uICogY29uIC0gMiAqIGFsICogY29uKTtcbiAgICB5ID0gdGhpcy55MCArIGNvbjtcbiAgfVxuICBlbHNlIHtcbiAgICAvL3kgPSB0aGlzLnkwIC0gTWF0aC5QSSAqIHRoaXMuUiAqIE1hdGguc3FydCgxIC0gY29uICogY29uIC0gMiAqIGFsICogY29uKTtcbiAgICB5ID0gdGhpcy55MCAtIGNvbjtcbiAgfVxuICBwLnggPSB4O1xuICBwLnkgPSB5O1xuICByZXR1cm4gcDtcbn07XG5cbi8qIFZhbiBEZXIgR3JpbnRlbiBpbnZlcnNlIGVxdWF0aW9ucy0tbWFwcGluZyB4LHkgdG8gbGF0L2xvbmdcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiwgbGF0O1xuICB2YXIgeHgsIHl5LCB4eXMsIGMxLCBjMiwgYzM7XG4gIHZhciBhMTtcbiAgdmFyIG0xO1xuICB2YXIgY29uO1xuICB2YXIgdGgxO1xuICB2YXIgZDtcblxuICAvKiBpbnZlcnNlIGVxdWF0aW9uc1xuICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICBjb24gPSBNYXRoLlBJICogdGhpcy5SO1xuICB4eCA9IHAueCAvIGNvbjtcbiAgeXkgPSBwLnkgLyBjb247XG4gIHh5cyA9IHh4ICogeHggKyB5eSAqIHl5O1xuICBjMSA9IC1NYXRoLmFicyh5eSkgKiAoMSArIHh5cyk7XG4gIGMyID0gYzEgLSAyICogeXkgKiB5eSArIHh4ICogeHg7XG4gIGMzID0gLTIgKiBjMSArIDEgKyAyICogeXkgKiB5eSArIHh5cyAqIHh5cztcbiAgZCA9IHl5ICogeXkgLyBjMyArICgyICogYzIgKiBjMiAqIGMyIC8gYzMgLyBjMyAvIGMzIC0gOSAqIGMxICogYzIgLyBjMyAvIGMzKSAvIDI3O1xuICBhMSA9IChjMSAtIGMyICogYzIgLyAzIC8gYzMpIC8gYzM7XG4gIG0xID0gMiAqIE1hdGguc3FydCgtYTEgLyAzKTtcbiAgY29uID0gKCgzICogZCkgLyBhMSkgLyBtMTtcbiAgaWYgKE1hdGguYWJzKGNvbikgPiAxKSB7XG4gICAgaWYgKGNvbiA+PSAwKSB7XG4gICAgICBjb24gPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbiA9IC0xO1xuICAgIH1cbiAgfVxuICB0aDEgPSBNYXRoLmFjb3MoY29uKSAvIDM7XG4gIGlmIChwLnkgPj0gMCkge1xuICAgIGxhdCA9ICgtbTEgKiBNYXRoLmNvcyh0aDEgKyBNYXRoLlBJIC8gMykgLSBjMiAvIDMgLyBjMykgKiBNYXRoLlBJO1xuICB9XG4gIGVsc2Uge1xuICAgIGxhdCA9IC0oLW0xICogTWF0aC5jb3ModGgxICsgTWF0aC5QSSAvIDMpIC0gYzIgLyAzIC8gYzMpICogTWF0aC5QSTtcbiAgfVxuXG4gIGlmIChNYXRoLmFicyh4eCkgPCBFUFNMTikge1xuICAgIGxvbiA9IHRoaXMubG9uZzA7XG4gIH1cbiAgZWxzZSB7XG4gICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5QSSAqICh4eXMgLSAxICsgTWF0aC5zcXJ0KDEgKyAyICogKHh4ICogeHggLSB5eSAqIHl5KSArIHh5cyAqIHh5cykpIC8gMiAvIHh4KTtcbiAgfVxuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiVmFuX2Rlcl9HcmludGVuX0lcIiwgXCJWYW5EZXJHcmludGVuXCIsIFwidmFuZGdcIl07IiwidmFyIEQyUiA9IDAuMDE3NDUzMjkyNTE5OTQzMjk1Nzc7XG52YXIgUjJEID0gNTcuMjk1Nzc5NTEzMDgyMzIwODg7XG52YXIgUEpEXzNQQVJBTSA9IDE7XG52YXIgUEpEXzdQQVJBTSA9IDI7XG52YXIgZGF0dW1fdHJhbnNmb3JtID0gcmVxdWlyZSgnLi9kYXR1bV90cmFuc2Zvcm0nKTtcbnZhciBhZGp1c3RfYXhpcyA9IHJlcXVpcmUoJy4vYWRqdXN0X2F4aXMnKTtcbnZhciBwcm9qID0gcmVxdWlyZSgnLi9Qcm9qJyk7XG52YXIgdG9Qb2ludCA9IHJlcXVpcmUoJy4vY29tbW9uL3RvUG9pbnQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtKHNvdXJjZSwgZGVzdCwgcG9pbnQpIHtcbiAgdmFyIHdnczg0O1xuICBpZiAoQXJyYXkuaXNBcnJheShwb2ludCkpIHtcbiAgICBwb2ludCA9IHRvUG9pbnQocG9pbnQpO1xuICB9XG4gIGZ1bmN0aW9uIGNoZWNrTm90V0dTKHNvdXJjZSwgZGVzdCkge1xuICAgIHJldHVybiAoKHNvdXJjZS5kYXR1bS5kYXR1bV90eXBlID09PSBQSkRfM1BBUkFNIHx8IHNvdXJjZS5kYXR1bS5kYXR1bV90eXBlID09PSBQSkRfN1BBUkFNKSAmJiBkZXN0LmRhdHVtQ29kZSAhPT0gXCJXR1M4NFwiKTtcbiAgfVxuXG4gIC8vIFdvcmthcm91bmQgZm9yIGRhdHVtIHNoaWZ0cyB0b3dnczg0LCBpZiBlaXRoZXIgc291cmNlIG9yIGRlc3RpbmF0aW9uIHByb2plY3Rpb24gaXMgbm90IHdnczg0XG4gIGlmIChzb3VyY2UuZGF0dW0gJiYgZGVzdC5kYXR1bSAmJiAoY2hlY2tOb3RXR1Moc291cmNlLCBkZXN0KSB8fCBjaGVja05vdFdHUyhkZXN0LCBzb3VyY2UpKSkge1xuICAgIHdnczg0ID0gbmV3IHByb2ooJ1dHUzg0Jyk7XG4gICAgdHJhbnNmb3JtKHNvdXJjZSwgd2dzODQsIHBvaW50KTtcbiAgICBzb3VyY2UgPSB3Z3M4NDtcbiAgfVxuICAvLyBER1IsIDIwMTAvMTEvMTJcbiAgaWYgKHNvdXJjZS5heGlzICE9PSBcImVudVwiKSB7XG4gICAgYWRqdXN0X2F4aXMoc291cmNlLCBmYWxzZSwgcG9pbnQpO1xuICB9XG4gIC8vIFRyYW5zZm9ybSBzb3VyY2UgcG9pbnRzIHRvIGxvbmcvbGF0LCBpZiB0aGV5IGFyZW4ndCBhbHJlYWR5LlxuICBpZiAoc291cmNlLnByb2pOYW1lID09PSBcImxvbmdsYXRcIikge1xuICAgIHBvaW50LnggKj0gRDJSOyAvLyBjb252ZXJ0IGRlZ3JlZXMgdG8gcmFkaWFuc1xuICAgIHBvaW50LnkgKj0gRDJSO1xuICB9XG4gIGVsc2Uge1xuICAgIGlmIChzb3VyY2UudG9fbWV0ZXIpIHtcbiAgICAgIHBvaW50LnggKj0gc291cmNlLnRvX21ldGVyO1xuICAgICAgcG9pbnQueSAqPSBzb3VyY2UudG9fbWV0ZXI7XG4gICAgfVxuICAgIHNvdXJjZS5pbnZlcnNlKHBvaW50KTsgLy8gQ29udmVydCBDYXJ0ZXNpYW4gdG8gbG9uZ2xhdFxuICB9XG4gIC8vIEFkanVzdCBmb3IgdGhlIHByaW1lIG1lcmlkaWFuIGlmIG5lY2Vzc2FyeVxuICBpZiAoc291cmNlLmZyb21fZ3JlZW53aWNoKSB7XG4gICAgcG9pbnQueCArPSBzb3VyY2UuZnJvbV9ncmVlbndpY2g7XG4gIH1cblxuICAvLyBDb252ZXJ0IGRhdHVtcyBpZiBuZWVkZWQsIGFuZCBpZiBwb3NzaWJsZS5cbiAgcG9pbnQgPSBkYXR1bV90cmFuc2Zvcm0oc291cmNlLmRhdHVtLCBkZXN0LmRhdHVtLCBwb2ludCk7XG5cbiAgLy8gQWRqdXN0IGZvciB0aGUgcHJpbWUgbWVyaWRpYW4gaWYgbmVjZXNzYXJ5XG4gIGlmIChkZXN0LmZyb21fZ3JlZW53aWNoKSB7XG4gICAgcG9pbnQueCAtPSBkZXN0LmZyb21fZ3JlZW53aWNoO1xuICB9XG5cbiAgaWYgKGRlc3QucHJvak5hbWUgPT09IFwibG9uZ2xhdFwiKSB7XG4gICAgLy8gY29udmVydCByYWRpYW5zIHRvIGRlY2ltYWwgZGVncmVlc1xuICAgIHBvaW50LnggKj0gUjJEO1xuICAgIHBvaW50LnkgKj0gUjJEO1xuICB9XG4gIGVsc2UgeyAvLyBlbHNlIHByb2plY3RcbiAgICBkZXN0LmZvcndhcmQocG9pbnQpO1xuICAgIGlmIChkZXN0LnRvX21ldGVyKSB7XG4gICAgICBwb2ludC54IC89IGRlc3QudG9fbWV0ZXI7XG4gICAgICBwb2ludC55IC89IGRlc3QudG9fbWV0ZXI7XG4gICAgfVxuICB9XG5cbiAgLy8gREdSLCAyMDEwLzExLzEyXG4gIGlmIChkZXN0LmF4aXMgIT09IFwiZW51XCIpIHtcbiAgICBhZGp1c3RfYXhpcyhkZXN0LCB0cnVlLCBwb2ludCk7XG4gIH1cblxuICByZXR1cm4gcG9pbnQ7XG59OyIsInZhciBEMlIgPSAwLjAxNzQ1MzI5MjUxOTk0MzI5NTc3O1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJy4vZXh0ZW5kJyk7XG5cbmZ1bmN0aW9uIG1hcGl0KG9iaiwga2V5LCB2KSB7XG4gIG9ialtrZXldID0gdi5tYXAoZnVuY3Rpb24oYWEpIHtcbiAgICB2YXIgbyA9IHt9O1xuICAgIHNFeHByKGFhLCBvKTtcbiAgICByZXR1cm4gbztcbiAgfSkucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXh0ZW5kKGEsIGIpO1xuICB9LCB7fSk7XG59XG5cbmZ1bmN0aW9uIHNFeHByKHYsIG9iaikge1xuICB2YXIga2V5O1xuICBpZiAoIUFycmF5LmlzQXJyYXkodikpIHtcbiAgICBvYmpbdl0gPSB0cnVlO1xuICAgIHJldHVybjtcbiAgfVxuICBlbHNlIHtcbiAgICBrZXkgPSB2LnNoaWZ0KCk7XG4gICAgaWYgKGtleSA9PT0gJ1BBUkFNRVRFUicpIHtcbiAgICAgIGtleSA9IHYuc2hpZnQoKTtcbiAgICB9XG4gICAgaWYgKHYubGVuZ3RoID09PSAxKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2WzBdKSkge1xuICAgICAgICBvYmpba2V5XSA9IHt9O1xuICAgICAgICBzRXhwcih2WzBdLCBvYmpba2V5XSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgb2JqW2tleV0gPSB2WzBdO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICghdi5sZW5ndGgpIHtcbiAgICAgIG9ialtrZXldID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoa2V5ID09PSAnVE9XR1M4NCcpIHtcbiAgICAgIG9ialtrZXldID0gdjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBvYmpba2V5XSA9IHt9O1xuICAgICAgaWYgKFsnVU5JVCcsICdQUklNRU0nLCAnVkVSVF9EQVRVTSddLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICAgIG9ialtrZXldID0ge1xuICAgICAgICAgIG5hbWU6IHZbMF0udG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICBjb252ZXJ0OiB2WzFdXG4gICAgICAgIH07XG4gICAgICAgIGlmICh2Lmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgIG9ialtrZXldLmF1dGggPSB2WzJdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChrZXkgPT09ICdTUEhFUk9JRCcpIHtcbiAgICAgICAgb2JqW2tleV0gPSB7XG4gICAgICAgICAgbmFtZTogdlswXSxcbiAgICAgICAgICBhOiB2WzFdLFxuICAgICAgICAgIHJmOiB2WzJdXG4gICAgICAgIH07XG4gICAgICAgIGlmICh2Lmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgIG9ialtrZXldLmF1dGggPSB2WzNdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChbJ0dFT0dDUycsICdHRU9DQ1MnLCAnREFUVU0nLCAnVkVSVF9DUycsICdDT01QRF9DUycsICdMT0NBTF9DUycsICdGSVRURURfQ1MnLCAnTE9DQUxfREFUVU0nXS5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgICAgICB2WzBdID0gWyduYW1lJywgdlswXV07XG4gICAgICAgIG1hcGl0KG9iaiwga2V5LCB2KTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHYuZXZlcnkoZnVuY3Rpb24oYWEpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYWEpO1xuICAgICAgfSkpIHtcbiAgICAgICAgbWFwaXQob2JqLCBrZXksIHYpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNFeHByKHYsIG9ialtrZXldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuYW1lKG9iaiwgcGFyYW1zKSB7XG4gIHZhciBvdXROYW1lID0gcGFyYW1zWzBdO1xuICB2YXIgaW5OYW1lID0gcGFyYW1zWzFdO1xuICBpZiAoIShvdXROYW1lIGluIG9iaikgJiYgKGluTmFtZSBpbiBvYmopKSB7XG4gICAgb2JqW291dE5hbWVdID0gb2JqW2luTmFtZV07XG4gICAgaWYgKHBhcmFtcy5sZW5ndGggPT09IDMpIHtcbiAgICAgIG9ialtvdXROYW1lXSA9IHBhcmFtc1syXShvYmpbb3V0TmFtZV0pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkMnIoaW5wdXQpIHtcbiAgcmV0dXJuIGlucHV0ICogRDJSO1xufVxuXG5mdW5jdGlvbiBjbGVhbldLVCh3a3QpIHtcbiAgaWYgKHdrdC50eXBlID09PSAnR0VPR0NTJykge1xuICAgIHdrdC5wcm9qTmFtZSA9ICdsb25nbGF0JztcbiAgfVxuICBlbHNlIGlmICh3a3QudHlwZSA9PT0gJ0xPQ0FMX0NTJykge1xuICAgIHdrdC5wcm9qTmFtZSA9ICdpZGVudGl0eSc7XG4gICAgd2t0LmxvY2FsID0gdHJ1ZTtcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAodHlwZW9mIHdrdC5QUk9KRUNUSU9OID09PSBcIm9iamVjdFwiKSB7XG4gICAgICB3a3QucHJvak5hbWUgPSBPYmplY3Qua2V5cyh3a3QuUFJPSkVDVElPTilbMF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgd2t0LnByb2pOYW1lID0gd2t0LlBST0pFQ1RJT047XG4gICAgfVxuICB9XG4gIGlmICh3a3QuVU5JVCkge1xuICAgIHdrdC51bml0cyA9IHdrdC5VTklULm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAod2t0LnVuaXRzID09PSAnbWV0cmUnKSB7XG4gICAgICB3a3QudW5pdHMgPSAnbWV0ZXInO1xuICAgIH1cbiAgICBpZiAod2t0LlVOSVQuY29udmVydCkge1xuICAgICAgd2t0LnRvX21ldGVyID0gcGFyc2VGbG9hdCh3a3QuVU5JVC5jb252ZXJ0LCAxMCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHdrdC5HRU9HQ1MpIHtcbiAgICAvL2lmKHdrdC5HRU9HQ1MuUFJJTUVNJiZ3a3QuR0VPR0NTLlBSSU1FTS5jb252ZXJ0KXtcbiAgICAvLyAgd2t0LmZyb21fZ3JlZW53aWNoPXdrdC5HRU9HQ1MuUFJJTUVNLmNvbnZlcnQqRDJSO1xuICAgIC8vfVxuICAgIGlmICh3a3QuR0VPR0NTLkRBVFVNKSB7XG4gICAgICB3a3QuZGF0dW1Db2RlID0gd2t0LkdFT0dDUy5EQVRVTS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgd2t0LmRhdHVtQ29kZSA9IHdrdC5HRU9HQ1MubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICBpZiAod2t0LmRhdHVtQ29kZS5zbGljZSgwLCAyKSA9PT0gJ2RfJykge1xuICAgICAgd2t0LmRhdHVtQ29kZSA9IHdrdC5kYXR1bUNvZGUuc2xpY2UoMik7XG4gICAgfVxuICAgIGlmICh3a3QuZGF0dW1Db2RlID09PSAnbmV3X3plYWxhbmRfZ2VvZGV0aWNfZGF0dW1fMTk0OScgfHwgd2t0LmRhdHVtQ29kZSA9PT0gJ25ld196ZWFsYW5kXzE5NDknKSB7XG4gICAgICB3a3QuZGF0dW1Db2RlID0gJ256Z2Q0OSc7XG4gICAgfVxuICAgIGlmICh3a3QuZGF0dW1Db2RlID09PSBcIndnc18xOTg0XCIpIHtcbiAgICAgIGlmICh3a3QuUFJPSkVDVElPTiA9PT0gJ01lcmNhdG9yX0F1eGlsaWFyeV9TcGhlcmUnKSB7XG4gICAgICAgIHdrdC5zcGhlcmUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgd2t0LmRhdHVtQ29kZSA9ICd3Z3M4NCc7XG4gICAgfVxuICAgIGlmICh3a3QuZGF0dW1Db2RlLnNsaWNlKC02KSA9PT0gJ19mZXJybycpIHtcbiAgICAgIHdrdC5kYXR1bUNvZGUgPSB3a3QuZGF0dW1Db2RlLnNsaWNlKDAsIC0gNik7XG4gICAgfVxuICAgIGlmICh3a3QuZGF0dW1Db2RlLnNsaWNlKC04KSA9PT0gJ19qYWthcnRhJykge1xuICAgICAgd2t0LmRhdHVtQ29kZSA9IHdrdC5kYXR1bUNvZGUuc2xpY2UoMCwgLSA4KTtcbiAgICB9XG4gICAgaWYgKH53a3QuZGF0dW1Db2RlLmluZGV4T2YoJ2JlbGdlJykpIHtcbiAgICAgIHdrdC5kYXR1bUNvZGUgPSBcInJuYjcyXCI7XG4gICAgfVxuICAgIGlmICh3a3QuR0VPR0NTLkRBVFVNICYmIHdrdC5HRU9HQ1MuREFUVU0uU1BIRVJPSUQpIHtcbiAgICAgIHdrdC5lbGxwcyA9IHdrdC5HRU9HQ1MuREFUVU0uU1BIRVJPSUQubmFtZS5yZXBsYWNlKCdfMTknLCAnJykucmVwbGFjZSgvW0NjXWxhcmtlXFxfMTgvLCAnY2xyaycpO1xuICAgICAgaWYgKHdrdC5lbGxwcy50b0xvd2VyQ2FzZSgpLnNsaWNlKDAsIDEzKSA9PT0gXCJpbnRlcm5hdGlvbmFsXCIpIHtcbiAgICAgICAgd2t0LmVsbHBzID0gJ2ludGwnO1xuICAgICAgfVxuXG4gICAgICB3a3QuYSA9IHdrdC5HRU9HQ1MuREFUVU0uU1BIRVJPSUQuYTtcbiAgICAgIHdrdC5yZiA9IHBhcnNlRmxvYXQod2t0LkdFT0dDUy5EQVRVTS5TUEhFUk9JRC5yZiwgMTApO1xuICAgIH1cbiAgICBpZiAofndrdC5kYXR1bUNvZGUuaW5kZXhPZignb3NnYl8xOTM2JykpIHtcbiAgICAgIHdrdC5kYXR1bUNvZGUgPSBcIm9zZ2IzNlwiO1xuICAgIH1cbiAgfVxuICBpZiAod2t0LmIgJiYgIWlzRmluaXRlKHdrdC5iKSkge1xuICAgIHdrdC5iID0gd2t0LmE7XG4gIH1cblxuICBmdW5jdGlvbiB0b01ldGVyKGlucHV0KSB7XG4gICAgdmFyIHJhdGlvID0gd2t0LnRvX21ldGVyIHx8IDE7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoaW5wdXQsIDEwKSAqIHJhdGlvO1xuICB9XG4gIHZhciByZW5hbWVyID0gZnVuY3Rpb24oYSkge1xuICAgIHJldHVybiByZW5hbWUod2t0LCBhKTtcbiAgfTtcbiAgdmFyIGxpc3QgPSBbXG4gICAgWydzdGFuZGFyZF9wYXJhbGxlbF8xJywgJ1N0YW5kYXJkX1BhcmFsbGVsXzEnXSxcbiAgICBbJ3N0YW5kYXJkX3BhcmFsbGVsXzInLCAnU3RhbmRhcmRfUGFyYWxsZWxfMiddLFxuICAgIFsnZmFsc2VfZWFzdGluZycsICdGYWxzZV9FYXN0aW5nJ10sXG4gICAgWydmYWxzZV9ub3J0aGluZycsICdGYWxzZV9Ob3J0aGluZyddLFxuICAgIFsnY2VudHJhbF9tZXJpZGlhbicsICdDZW50cmFsX01lcmlkaWFuJ10sXG4gICAgWydsYXRpdHVkZV9vZl9vcmlnaW4nLCAnTGF0aXR1ZGVfT2ZfT3JpZ2luJ10sXG4gICAgWydsYXRpdHVkZV9vZl9vcmlnaW4nLCAnQ2VudHJhbF9QYXJhbGxlbCddLFxuICAgIFsnc2NhbGVfZmFjdG9yJywgJ1NjYWxlX0ZhY3RvciddLFxuICAgIFsnazAnLCAnc2NhbGVfZmFjdG9yJ10sXG4gICAgWydsYXRpdHVkZV9vZl9jZW50ZXInLCAnTGF0aXR1ZGVfb2ZfY2VudGVyJ10sXG4gICAgWydsYXQwJywgJ2xhdGl0dWRlX29mX2NlbnRlcicsIGQycl0sXG4gICAgWydsb25naXR1ZGVfb2ZfY2VudGVyJywgJ0xvbmdpdHVkZV9PZl9DZW50ZXInXSxcbiAgICBbJ2xvbmdjJywgJ2xvbmdpdHVkZV9vZl9jZW50ZXInLCBkMnJdLFxuICAgIFsneDAnLCAnZmFsc2VfZWFzdGluZycsIHRvTWV0ZXJdLFxuICAgIFsneTAnLCAnZmFsc2Vfbm9ydGhpbmcnLCB0b01ldGVyXSxcbiAgICBbJ2xvbmcwJywgJ2NlbnRyYWxfbWVyaWRpYW4nLCBkMnJdLFxuICAgIFsnbGF0MCcsICdsYXRpdHVkZV9vZl9vcmlnaW4nLCBkMnJdLFxuICAgIFsnbGF0MCcsICdzdGFuZGFyZF9wYXJhbGxlbF8xJywgZDJyXSxcbiAgICBbJ2xhdDEnLCAnc3RhbmRhcmRfcGFyYWxsZWxfMScsIGQycl0sXG4gICAgWydsYXQyJywgJ3N0YW5kYXJkX3BhcmFsbGVsXzInLCBkMnJdLFxuICAgIFsnYWxwaGEnLCAnYXppbXV0aCcsIGQycl0sXG4gICAgWydzcnNDb2RlJywgJ25hbWUnXVxuICBdO1xuICBsaXN0LmZvckVhY2gocmVuYW1lcik7XG4gIGlmICghd2t0LmxvbmcwICYmIHdrdC5sb25nYyAmJiAod2t0LnByb2pOYW1lID09PSAnQWxiZXJzX0NvbmljX0VxdWFsX0FyZWEnIHx8IHdrdC5wcm9qTmFtZSA9PT0gXCJMYW1iZXJ0X0F6aW11dGhhbF9FcXVhbF9BcmVhXCIpKSB7XG4gICAgd2t0LmxvbmcwID0gd2t0LmxvbmdjO1xuICB9XG4gIGlmICghd2t0LmxhdF90cyAmJiB3a3QubGF0MSAmJiAod2t0LnByb2pOYW1lID09PSAnU3RlcmVvZ3JhcGhpY19Tb3V0aF9Qb2xlJyB8fCB3a3QucHJvak5hbWUgPT09ICdQb2xhciBTdGVyZW9ncmFwaGljICh2YXJpYW50IEIpJykpIHtcbiAgICB3a3QubGF0MCA9IGQycih3a3QubGF0MSA+IDAgPyA5MCA6IC05MCk7XG4gICAgd2t0LmxhdF90cyA9IHdrdC5sYXQxO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHdrdCwgc2VsZikge1xuICB2YXIgbGlzcCA9IEpTT04ucGFyc2UoKFwiLFwiICsgd2t0KS5yZXBsYWNlKC9cXHMqXFwsXFxzKihbQS1aXzAtOV0rPykoXFxbKS9nLCAnLFtcIiQxXCIsJykuc2xpY2UoMSkucmVwbGFjZSgvXFxzKlxcLFxccyooW0EtWl8wLTldKz8pXFxdL2csICcsXCIkMVwiXScpLnJlcGxhY2UoLyxcXFtcIlZFUlRDU1wiLisvLCcnKSk7XG4gIHZhciB0eXBlID0gbGlzcC5zaGlmdCgpO1xuICB2YXIgbmFtZSA9IGxpc3Auc2hpZnQoKTtcbiAgbGlzcC51bnNoaWZ0KFsnbmFtZScsIG5hbWVdKTtcbiAgbGlzcC51bnNoaWZ0KFsndHlwZScsIHR5cGVdKTtcbiAgbGlzcC51bnNoaWZ0KCdvdXRwdXQnKTtcbiAgdmFyIG9iaiA9IHt9O1xuICBzRXhwcihsaXNwLCBvYmopO1xuICBjbGVhbldLVChvYmoub3V0cHV0KTtcbiAgcmV0dXJuIGV4dGVuZChzZWxmLCBvYmoub3V0cHV0KTtcbn07XG4iLCJcblxuXG4vKipcbiAqIFVUTSB6b25lcyBhcmUgZ3JvdXBlZCwgYW5kIGFzc2lnbmVkIHRvIG9uZSBvZiBhIGdyb3VwIG9mIDZcbiAqIHNldHMuXG4gKlxuICoge2ludH0gQHByaXZhdGVcbiAqL1xudmFyIE5VTV8xMDBLX1NFVFMgPSA2O1xuXG4vKipcbiAqIFRoZSBjb2x1bW4gbGV0dGVycyAoZm9yIGVhc3RpbmcpIG9mIHRoZSBsb3dlciBsZWZ0IHZhbHVlLCBwZXJcbiAqIHNldC5cbiAqXG4gKiB7c3RyaW5nfSBAcHJpdmF0ZVxuICovXG52YXIgU0VUX09SSUdJTl9DT0xVTU5fTEVUVEVSUyA9ICdBSlNBSlMnO1xuXG4vKipcbiAqIFRoZSByb3cgbGV0dGVycyAoZm9yIG5vcnRoaW5nKSBvZiB0aGUgbG93ZXIgbGVmdCB2YWx1ZSwgcGVyXG4gKiBzZXQuXG4gKlxuICoge3N0cmluZ30gQHByaXZhdGVcbiAqL1xudmFyIFNFVF9PUklHSU5fUk9XX0xFVFRFUlMgPSAnQUZBRkFGJztcblxudmFyIEEgPSA2NTsgLy8gQVxudmFyIEkgPSA3MzsgLy8gSVxudmFyIE8gPSA3OTsgLy8gT1xudmFyIFYgPSA4NjsgLy8gVlxudmFyIFogPSA5MDsgLy8gWlxuXG4vKipcbiAqIENvbnZlcnNpb24gb2YgbGF0L2xvbiB0byBNR1JTLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBsbCBPYmplY3QgbGl0ZXJhbCB3aXRoIGxhdCBhbmQgbG9uIHByb3BlcnRpZXMgb24gYVxuICogICAgIFdHUzg0IGVsbGlwc29pZC5cbiAqIEBwYXJhbSB7aW50fSBhY2N1cmFjeSBBY2N1cmFjeSBpbiBkaWdpdHMgKDUgZm9yIDEgbSwgNCBmb3IgMTAgbSwgMyBmb3JcbiAqICAgICAgMTAwIG0sIDIgZm9yIDEwMDAgbSBvciAxIGZvciAxMDAwMCBtKS4gT3B0aW9uYWwsIGRlZmF1bHQgaXMgNS5cbiAqIEByZXR1cm4ge3N0cmluZ30gdGhlIE1HUlMgc3RyaW5nIGZvciB0aGUgZ2l2ZW4gbG9jYXRpb24gYW5kIGFjY3VyYWN5LlxuICovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihsbCwgYWNjdXJhY3kpIHtcbiAgYWNjdXJhY3kgPSBhY2N1cmFjeSB8fCA1OyAvLyBkZWZhdWx0IGFjY3VyYWN5IDFtXG4gIHJldHVybiBlbmNvZGUoTEx0b1VUTSh7XG4gICAgbGF0OiBsbFsxXSxcbiAgICBsb246IGxsWzBdXG4gIH0pLCBhY2N1cmFjeSk7XG59O1xuXG4vKipcbiAqIENvbnZlcnNpb24gb2YgTUdSUyB0byBsYXQvbG9uLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZ3JzIE1HUlMgc3RyaW5nLlxuICogQHJldHVybiB7YXJyYXl9IEFuIGFycmF5IHdpdGggbGVmdCAobG9uZ2l0dWRlKSwgYm90dG9tIChsYXRpdHVkZSksIHJpZ2h0XG4gKiAgICAgKGxvbmdpdHVkZSkgYW5kIHRvcCAobGF0aXR1ZGUpIHZhbHVlcyBpbiBXR1M4NCwgcmVwcmVzZW50aW5nIHRoZVxuICogICAgIGJvdW5kaW5nIGJveCBmb3IgdGhlIHByb3ZpZGVkIE1HUlMgcmVmZXJlbmNlLlxuICovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihtZ3JzKSB7XG4gIHZhciBiYm94ID0gVVRNdG9MTChkZWNvZGUobWdycy50b1VwcGVyQ2FzZSgpKSk7XG4gIGlmIChiYm94LmxhdCAmJiBiYm94Lmxvbikge1xuICAgIHJldHVybiBbYmJveC5sb24sIGJib3gubGF0LCBiYm94LmxvbiwgYmJveC5sYXRdO1xuICB9XG4gIHJldHVybiBbYmJveC5sZWZ0LCBiYm94LmJvdHRvbSwgYmJveC5yaWdodCwgYmJveC50b3BdO1xufTtcblxuZXhwb3J0cy50b1BvaW50ID0gZnVuY3Rpb24obWdycykge1xuICB2YXIgYmJveCA9IFVUTXRvTEwoZGVjb2RlKG1ncnMudG9VcHBlckNhc2UoKSkpO1xuICBpZiAoYmJveC5sYXQgJiYgYmJveC5sb24pIHtcbiAgICByZXR1cm4gW2Jib3gubG9uLCBiYm94LmxhdF07XG4gIH1cbiAgcmV0dXJuIFsoYmJveC5sZWZ0ICsgYmJveC5yaWdodCkgLyAyLCAoYmJveC50b3AgKyBiYm94LmJvdHRvbSkgLyAyXTtcbn07XG4vKipcbiAqIENvbnZlcnNpb24gZnJvbSBkZWdyZWVzIHRvIHJhZGlhbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBkZWcgdGhlIGFuZ2xlIGluIGRlZ3JlZXMuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBhbmdsZSBpbiByYWRpYW5zLlxuICovXG5mdW5jdGlvbiBkZWdUb1JhZChkZWcpIHtcbiAgcmV0dXJuIChkZWcgKiAoTWF0aC5QSSAvIDE4MC4wKSk7XG59XG5cbi8qKlxuICogQ29udmVyc2lvbiBmcm9tIHJhZGlhbnMgdG8gZGVncmVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCB0aGUgYW5nbGUgaW4gcmFkaWFucy5cbiAqIEByZXR1cm4ge251bWJlcn0gdGhlIGFuZ2xlIGluIGRlZ3JlZXMuXG4gKi9cbmZ1bmN0aW9uIHJhZFRvRGVnKHJhZCkge1xuICByZXR1cm4gKDE4MC4wICogKHJhZCAvIE1hdGguUEkpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIHNldCBvZiBMb25naXR1ZGUgYW5kIExhdGl0dWRlIGNvLW9yZGluYXRlcyB0byBVVE1cbiAqIHVzaW5nIHRoZSBXR1M4NCBlbGxpcHNvaWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBsbCBPYmplY3QgbGl0ZXJhbCB3aXRoIGxhdCBhbmQgbG9uIHByb3BlcnRpZXNcbiAqICAgICByZXByZXNlbnRpbmcgdGhlIFdHUzg0IGNvb3JkaW5hdGUgdG8gYmUgY29udmVydGVkLlxuICogQHJldHVybiB7b2JqZWN0fSBPYmplY3QgbGl0ZXJhbCBjb250YWluaW5nIHRoZSBVVE0gdmFsdWUgd2l0aCBlYXN0aW5nLFxuICogICAgIG5vcnRoaW5nLCB6b25lTnVtYmVyIGFuZCB6b25lTGV0dGVyIHByb3BlcnRpZXMsIGFuZCBhbiBvcHRpb25hbFxuICogICAgIGFjY3VyYWN5IHByb3BlcnR5IGluIGRpZ2l0cy4gUmV0dXJucyBudWxsIGlmIHRoZSBjb252ZXJzaW9uIGZhaWxlZC5cbiAqL1xuZnVuY3Rpb24gTEx0b1VUTShsbCkge1xuICB2YXIgTGF0ID0gbGwubGF0O1xuICB2YXIgTG9uZyA9IGxsLmxvbjtcbiAgdmFyIGEgPSA2Mzc4MTM3LjA7IC8vZWxsaXAucmFkaXVzO1xuICB2YXIgZWNjU3F1YXJlZCA9IDAuMDA2Njk0Mzg7IC8vZWxsaXAuZWNjc3E7XG4gIHZhciBrMCA9IDAuOTk5NjtcbiAgdmFyIExvbmdPcmlnaW47XG4gIHZhciBlY2NQcmltZVNxdWFyZWQ7XG4gIHZhciBOLCBULCBDLCBBLCBNO1xuICB2YXIgTGF0UmFkID0gZGVnVG9SYWQoTGF0KTtcbiAgdmFyIExvbmdSYWQgPSBkZWdUb1JhZChMb25nKTtcbiAgdmFyIExvbmdPcmlnaW5SYWQ7XG4gIHZhciBab25lTnVtYmVyO1xuICAvLyAoaW50KVxuICBab25lTnVtYmVyID0gTWF0aC5mbG9vcigoTG9uZyArIDE4MCkgLyA2KSArIDE7XG5cbiAgLy9NYWtlIHN1cmUgdGhlIGxvbmdpdHVkZSAxODAuMDAgaXMgaW4gWm9uZSA2MFxuICBpZiAoTG9uZyA9PT0gMTgwKSB7XG4gICAgWm9uZU51bWJlciA9IDYwO1xuICB9XG5cbiAgLy8gU3BlY2lhbCB6b25lIGZvciBOb3J3YXlcbiAgaWYgKExhdCA+PSA1Ni4wICYmIExhdCA8IDY0LjAgJiYgTG9uZyA+PSAzLjAgJiYgTG9uZyA8IDEyLjApIHtcbiAgICBab25lTnVtYmVyID0gMzI7XG4gIH1cblxuICAvLyBTcGVjaWFsIHpvbmVzIGZvciBTdmFsYmFyZFxuICBpZiAoTGF0ID49IDcyLjAgJiYgTGF0IDwgODQuMCkge1xuICAgIGlmIChMb25nID49IDAuMCAmJiBMb25nIDwgOS4wKSB7XG4gICAgICBab25lTnVtYmVyID0gMzE7XG4gICAgfVxuICAgIGVsc2UgaWYgKExvbmcgPj0gOS4wICYmIExvbmcgPCAyMS4wKSB7XG4gICAgICBab25lTnVtYmVyID0gMzM7XG4gICAgfVxuICAgIGVsc2UgaWYgKExvbmcgPj0gMjEuMCAmJiBMb25nIDwgMzMuMCkge1xuICAgICAgWm9uZU51bWJlciA9IDM1O1xuICAgIH1cbiAgICBlbHNlIGlmIChMb25nID49IDMzLjAgJiYgTG9uZyA8IDQyLjApIHtcbiAgICAgIFpvbmVOdW1iZXIgPSAzNztcbiAgICB9XG4gIH1cblxuICBMb25nT3JpZ2luID0gKFpvbmVOdW1iZXIgLSAxKSAqIDYgLSAxODAgKyAzOyAvLyszIHB1dHMgb3JpZ2luXG4gIC8vIGluIG1pZGRsZSBvZlxuICAvLyB6b25lXG4gIExvbmdPcmlnaW5SYWQgPSBkZWdUb1JhZChMb25nT3JpZ2luKTtcblxuICBlY2NQcmltZVNxdWFyZWQgPSAoZWNjU3F1YXJlZCkgLyAoMSAtIGVjY1NxdWFyZWQpO1xuXG4gIE4gPSBhIC8gTWF0aC5zcXJ0KDEgLSBlY2NTcXVhcmVkICogTWF0aC5zaW4oTGF0UmFkKSAqIE1hdGguc2luKExhdFJhZCkpO1xuICBUID0gTWF0aC50YW4oTGF0UmFkKSAqIE1hdGgudGFuKExhdFJhZCk7XG4gIEMgPSBlY2NQcmltZVNxdWFyZWQgKiBNYXRoLmNvcyhMYXRSYWQpICogTWF0aC5jb3MoTGF0UmFkKTtcbiAgQSA9IE1hdGguY29zKExhdFJhZCkgKiAoTG9uZ1JhZCAtIExvbmdPcmlnaW5SYWQpO1xuXG4gIE0gPSBhICogKCgxIC0gZWNjU3F1YXJlZCAvIDQgLSAzICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgLyA2NCAtIDUgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgLyAyNTYpICogTGF0UmFkIC0gKDMgKiBlY2NTcXVhcmVkIC8gOCArIDMgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDMyICsgNDUgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgLyAxMDI0KSAqIE1hdGguc2luKDIgKiBMYXRSYWQpICsgKDE1ICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgLyAyNTYgKyA0NSAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDEwMjQpICogTWF0aC5zaW4oNCAqIExhdFJhZCkgLSAoMzUgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgLyAzMDcyKSAqIE1hdGguc2luKDYgKiBMYXRSYWQpKTtcblxuICB2YXIgVVRNRWFzdGluZyA9IChrMCAqIE4gKiAoQSArICgxIC0gVCArIEMpICogQSAqIEEgKiBBIC8gNi4wICsgKDUgLSAxOCAqIFQgKyBUICogVCArIDcyICogQyAtIDU4ICogZWNjUHJpbWVTcXVhcmVkKSAqIEEgKiBBICogQSAqIEEgKiBBIC8gMTIwLjApICsgNTAwMDAwLjApO1xuXG4gIHZhciBVVE1Ob3J0aGluZyA9IChrMCAqIChNICsgTiAqIE1hdGgudGFuKExhdFJhZCkgKiAoQSAqIEEgLyAyICsgKDUgLSBUICsgOSAqIEMgKyA0ICogQyAqIEMpICogQSAqIEEgKiBBICogQSAvIDI0LjAgKyAoNjEgLSA1OCAqIFQgKyBUICogVCArIDYwMCAqIEMgLSAzMzAgKiBlY2NQcmltZVNxdWFyZWQpICogQSAqIEEgKiBBICogQSAqIEEgKiBBIC8gNzIwLjApKSk7XG4gIGlmIChMYXQgPCAwLjApIHtcbiAgICBVVE1Ob3J0aGluZyArPSAxMDAwMDAwMC4wOyAvLzEwMDAwMDAwIG1ldGVyIG9mZnNldCBmb3JcbiAgICAvLyBzb3V0aGVybiBoZW1pc3BoZXJlXG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5vcnRoaW5nOiBNYXRoLnJvdW5kKFVUTU5vcnRoaW5nKSxcbiAgICBlYXN0aW5nOiBNYXRoLnJvdW5kKFVUTUVhc3RpbmcpLFxuICAgIHpvbmVOdW1iZXI6IFpvbmVOdW1iZXIsXG4gICAgem9uZUxldHRlcjogZ2V0TGV0dGVyRGVzaWduYXRvcihMYXQpXG4gIH07XG59XG5cbi8qKlxuICogQ29udmVydHMgVVRNIGNvb3JkcyB0byBsYXQvbG9uZywgdXNpbmcgdGhlIFdHUzg0IGVsbGlwc29pZC4gVGhpcyBpcyBhIGNvbnZlbmllbmNlXG4gKiBjbGFzcyB3aGVyZSB0aGUgWm9uZSBjYW4gYmUgc3BlY2lmaWVkIGFzIGEgc2luZ2xlIHN0cmluZyBlZy5cIjYwTlwiIHdoaWNoXG4gKiBpcyB0aGVuIGJyb2tlbiBkb3duIGludG8gdGhlIFpvbmVOdW1iZXIgYW5kIFpvbmVMZXR0ZXIuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSB1dG0gQW4gb2JqZWN0IGxpdGVyYWwgd2l0aCBub3J0aGluZywgZWFzdGluZywgem9uZU51bWJlclxuICogICAgIGFuZCB6b25lTGV0dGVyIHByb3BlcnRpZXMuIElmIGFuIG9wdGlvbmFsIGFjY3VyYWN5IHByb3BlcnR5IGlzXG4gKiAgICAgcHJvdmlkZWQgKGluIG1ldGVycyksIGEgYm91bmRpbmcgYm94IHdpbGwgYmUgcmV0dXJuZWQgaW5zdGVhZCBvZlxuICogICAgIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUuXG4gKiBAcmV0dXJuIHtvYmplY3R9IEFuIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5pbmcgZWl0aGVyIGxhdCBhbmQgbG9uIHZhbHVlc1xuICogICAgIChpZiBubyBhY2N1cmFjeSB3YXMgcHJvdmlkZWQpLCBvciB0b3AsIHJpZ2h0LCBib3R0b20gYW5kIGxlZnQgdmFsdWVzXG4gKiAgICAgZm9yIHRoZSBib3VuZGluZyBib3ggY2FsY3VsYXRlZCBhY2NvcmRpbmcgdG8gdGhlIHByb3ZpZGVkIGFjY3VyYWN5LlxuICogICAgIFJldHVybnMgbnVsbCBpZiB0aGUgY29udmVyc2lvbiBmYWlsZWQuXG4gKi9cbmZ1bmN0aW9uIFVUTXRvTEwodXRtKSB7XG5cbiAgdmFyIFVUTU5vcnRoaW5nID0gdXRtLm5vcnRoaW5nO1xuICB2YXIgVVRNRWFzdGluZyA9IHV0bS5lYXN0aW5nO1xuICB2YXIgem9uZUxldHRlciA9IHV0bS56b25lTGV0dGVyO1xuICB2YXIgem9uZU51bWJlciA9IHV0bS56b25lTnVtYmVyO1xuICAvLyBjaGVjayB0aGUgWm9uZU51bW1iZXIgaXMgdmFsaWRcbiAgaWYgKHpvbmVOdW1iZXIgPCAwIHx8IHpvbmVOdW1iZXIgPiA2MCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIGswID0gMC45OTk2O1xuICB2YXIgYSA9IDYzNzgxMzcuMDsgLy9lbGxpcC5yYWRpdXM7XG4gIHZhciBlY2NTcXVhcmVkID0gMC4wMDY2OTQzODsgLy9lbGxpcC5lY2NzcTtcbiAgdmFyIGVjY1ByaW1lU3F1YXJlZDtcbiAgdmFyIGUxID0gKDEgLSBNYXRoLnNxcnQoMSAtIGVjY1NxdWFyZWQpKSAvICgxICsgTWF0aC5zcXJ0KDEgLSBlY2NTcXVhcmVkKSk7XG4gIHZhciBOMSwgVDEsIEMxLCBSMSwgRCwgTTtcbiAgdmFyIExvbmdPcmlnaW47XG4gIHZhciBtdSwgcGhpMVJhZDtcblxuICAvLyByZW1vdmUgNTAwLDAwMCBtZXRlciBvZmZzZXQgZm9yIGxvbmdpdHVkZVxuICB2YXIgeCA9IFVUTUVhc3RpbmcgLSA1MDAwMDAuMDtcbiAgdmFyIHkgPSBVVE1Ob3J0aGluZztcblxuICAvLyBXZSBtdXN0IGtub3cgc29tZWhvdyBpZiB3ZSBhcmUgaW4gdGhlIE5vcnRoZXJuIG9yIFNvdXRoZXJuXG4gIC8vIGhlbWlzcGhlcmUsIHRoaXMgaXMgdGhlIG9ubHkgdGltZSB3ZSB1c2UgdGhlIGxldHRlciBTbyBldmVuXG4gIC8vIGlmIHRoZSBab25lIGxldHRlciBpc24ndCBleGFjdGx5IGNvcnJlY3QgaXQgc2hvdWxkIGluZGljYXRlXG4gIC8vIHRoZSBoZW1pc3BoZXJlIGNvcnJlY3RseVxuICBpZiAoem9uZUxldHRlciA8ICdOJykge1xuICAgIHkgLT0gMTAwMDAwMDAuMDsgLy8gcmVtb3ZlIDEwLDAwMCwwMDAgbWV0ZXIgb2Zmc2V0IHVzZWRcbiAgICAvLyBmb3Igc291dGhlcm4gaGVtaXNwaGVyZVxuICB9XG5cbiAgLy8gVGhlcmUgYXJlIDYwIHpvbmVzIHdpdGggem9uZSAxIGJlaW5nIGF0IFdlc3QgLTE4MCB0byAtMTc0XG4gIExvbmdPcmlnaW4gPSAoem9uZU51bWJlciAtIDEpICogNiAtIDE4MCArIDM7IC8vICszIHB1dHMgb3JpZ2luXG4gIC8vIGluIG1pZGRsZSBvZlxuICAvLyB6b25lXG5cbiAgZWNjUHJpbWVTcXVhcmVkID0gKGVjY1NxdWFyZWQpIC8gKDEgLSBlY2NTcXVhcmVkKTtcblxuICBNID0geSAvIGswO1xuICBtdSA9IE0gLyAoYSAqICgxIC0gZWNjU3F1YXJlZCAvIDQgLSAzICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgLyA2NCAtIDUgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgLyAyNTYpKTtcblxuICBwaGkxUmFkID0gbXUgKyAoMyAqIGUxIC8gMiAtIDI3ICogZTEgKiBlMSAqIGUxIC8gMzIpICogTWF0aC5zaW4oMiAqIG11KSArICgyMSAqIGUxICogZTEgLyAxNiAtIDU1ICogZTEgKiBlMSAqIGUxICogZTEgLyAzMikgKiBNYXRoLnNpbig0ICogbXUpICsgKDE1MSAqIGUxICogZTEgKiBlMSAvIDk2KSAqIE1hdGguc2luKDYgKiBtdSk7XG4gIC8vIGRvdWJsZSBwaGkxID0gUHJvak1hdGgucmFkVG9EZWcocGhpMVJhZCk7XG5cbiAgTjEgPSBhIC8gTWF0aC5zcXJ0KDEgLSBlY2NTcXVhcmVkICogTWF0aC5zaW4ocGhpMVJhZCkgKiBNYXRoLnNpbihwaGkxUmFkKSk7XG4gIFQxID0gTWF0aC50YW4ocGhpMVJhZCkgKiBNYXRoLnRhbihwaGkxUmFkKTtcbiAgQzEgPSBlY2NQcmltZVNxdWFyZWQgKiBNYXRoLmNvcyhwaGkxUmFkKSAqIE1hdGguY29zKHBoaTFSYWQpO1xuICBSMSA9IGEgKiAoMSAtIGVjY1NxdWFyZWQpIC8gTWF0aC5wb3coMSAtIGVjY1NxdWFyZWQgKiBNYXRoLnNpbihwaGkxUmFkKSAqIE1hdGguc2luKHBoaTFSYWQpLCAxLjUpO1xuICBEID0geCAvIChOMSAqIGswKTtcblxuICB2YXIgbGF0ID0gcGhpMVJhZCAtIChOMSAqIE1hdGgudGFuKHBoaTFSYWQpIC8gUjEpICogKEQgKiBEIC8gMiAtICg1ICsgMyAqIFQxICsgMTAgKiBDMSAtIDQgKiBDMSAqIEMxIC0gOSAqIGVjY1ByaW1lU3F1YXJlZCkgKiBEICogRCAqIEQgKiBEIC8gMjQgKyAoNjEgKyA5MCAqIFQxICsgMjk4ICogQzEgKyA0NSAqIFQxICogVDEgLSAyNTIgKiBlY2NQcmltZVNxdWFyZWQgLSAzICogQzEgKiBDMSkgKiBEICogRCAqIEQgKiBEICogRCAqIEQgLyA3MjApO1xuICBsYXQgPSByYWRUb0RlZyhsYXQpO1xuXG4gIHZhciBsb24gPSAoRCAtICgxICsgMiAqIFQxICsgQzEpICogRCAqIEQgKiBEIC8gNiArICg1IC0gMiAqIEMxICsgMjggKiBUMSAtIDMgKiBDMSAqIEMxICsgOCAqIGVjY1ByaW1lU3F1YXJlZCArIDI0ICogVDEgKiBUMSkgKiBEICogRCAqIEQgKiBEICogRCAvIDEyMCkgLyBNYXRoLmNvcyhwaGkxUmFkKTtcbiAgbG9uID0gTG9uZ09yaWdpbiArIHJhZFRvRGVnKGxvbik7XG5cbiAgdmFyIHJlc3VsdDtcbiAgaWYgKHV0bS5hY2N1cmFjeSkge1xuICAgIHZhciB0b3BSaWdodCA9IFVUTXRvTEwoe1xuICAgICAgbm9ydGhpbmc6IHV0bS5ub3J0aGluZyArIHV0bS5hY2N1cmFjeSxcbiAgICAgIGVhc3Rpbmc6IHV0bS5lYXN0aW5nICsgdXRtLmFjY3VyYWN5LFxuICAgICAgem9uZUxldHRlcjogdXRtLnpvbmVMZXR0ZXIsXG4gICAgICB6b25lTnVtYmVyOiB1dG0uem9uZU51bWJlclxuICAgIH0pO1xuICAgIHJlc3VsdCA9IHtcbiAgICAgIHRvcDogdG9wUmlnaHQubGF0LFxuICAgICAgcmlnaHQ6IHRvcFJpZ2h0LmxvbixcbiAgICAgIGJvdHRvbTogbGF0LFxuICAgICAgbGVmdDogbG9uXG4gICAgfTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXN1bHQgPSB7XG4gICAgICBsYXQ6IGxhdCxcbiAgICAgIGxvbjogbG9uXG4gICAgfTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIE1HUlMgbGV0dGVyIGRlc2lnbmF0b3IgZm9yIHRoZSBnaXZlbiBsYXRpdHVkZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IGxhdCBUaGUgbGF0aXR1ZGUgaW4gV0dTODQgdG8gZ2V0IHRoZSBsZXR0ZXIgZGVzaWduYXRvclxuICogICAgIGZvci5cbiAqIEByZXR1cm4ge2NoYXJ9IFRoZSBsZXR0ZXIgZGVzaWduYXRvci5cbiAqL1xuZnVuY3Rpb24gZ2V0TGV0dGVyRGVzaWduYXRvcihsYXQpIHtcbiAgLy9UaGlzIGlzIGhlcmUgYXMgYW4gZXJyb3IgZmxhZyB0byBzaG93IHRoYXQgdGhlIExhdGl0dWRlIGlzXG4gIC8vb3V0c2lkZSBNR1JTIGxpbWl0c1xuICB2YXIgTGV0dGVyRGVzaWduYXRvciA9ICdaJztcblxuICBpZiAoKDg0ID49IGxhdCkgJiYgKGxhdCA+PSA3MikpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ1gnO1xuICB9XG4gIGVsc2UgaWYgKCg3MiA+IGxhdCkgJiYgKGxhdCA+PSA2NCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ1cnO1xuICB9XG4gIGVsc2UgaWYgKCg2NCA+IGxhdCkgJiYgKGxhdCA+PSA1NikpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ1YnO1xuICB9XG4gIGVsc2UgaWYgKCg1NiA+IGxhdCkgJiYgKGxhdCA+PSA0OCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ1UnO1xuICB9XG4gIGVsc2UgaWYgKCg0OCA+IGxhdCkgJiYgKGxhdCA+PSA0MCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ1QnO1xuICB9XG4gIGVsc2UgaWYgKCg0MCA+IGxhdCkgJiYgKGxhdCA+PSAzMikpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ1MnO1xuICB9XG4gIGVsc2UgaWYgKCgzMiA+IGxhdCkgJiYgKGxhdCA+PSAyNCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ1InO1xuICB9XG4gIGVsc2UgaWYgKCgyNCA+IGxhdCkgJiYgKGxhdCA+PSAxNikpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ1EnO1xuICB9XG4gIGVsc2UgaWYgKCgxNiA+IGxhdCkgJiYgKGxhdCA+PSA4KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnUCc7XG4gIH1cbiAgZWxzZSBpZiAoKDggPiBsYXQpICYmIChsYXQgPj0gMCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ04nO1xuICB9XG4gIGVsc2UgaWYgKCgwID4gbGF0KSAmJiAobGF0ID49IC04KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnTSc7XG4gIH1cbiAgZWxzZSBpZiAoKC04ID4gbGF0KSAmJiAobGF0ID49IC0xNikpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0wnO1xuICB9XG4gIGVsc2UgaWYgKCgtMTYgPiBsYXQpICYmIChsYXQgPj0gLTI0KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnSyc7XG4gIH1cbiAgZWxzZSBpZiAoKC0yNCA+IGxhdCkgJiYgKGxhdCA+PSAtMzIpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdKJztcbiAgfVxuICBlbHNlIGlmICgoLTMyID4gbGF0KSAmJiAobGF0ID49IC00MCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0gnO1xuICB9XG4gIGVsc2UgaWYgKCgtNDAgPiBsYXQpICYmIChsYXQgPj0gLTQ4KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnRyc7XG4gIH1cbiAgZWxzZSBpZiAoKC00OCA+IGxhdCkgJiYgKGxhdCA+PSAtNTYpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdGJztcbiAgfVxuICBlbHNlIGlmICgoLTU2ID4gbGF0KSAmJiAobGF0ID49IC02NCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0UnO1xuICB9XG4gIGVsc2UgaWYgKCgtNjQgPiBsYXQpICYmIChsYXQgPj0gLTcyKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnRCc7XG4gIH1cbiAgZWxzZSBpZiAoKC03MiA+IGxhdCkgJiYgKGxhdCA+PSAtODApKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdDJztcbiAgfVxuICByZXR1cm4gTGV0dGVyRGVzaWduYXRvcjtcbn1cblxuLyoqXG4gKiBFbmNvZGVzIGEgVVRNIGxvY2F0aW9uIGFzIE1HUlMgc3RyaW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge29iamVjdH0gdXRtIEFuIG9iamVjdCBsaXRlcmFsIHdpdGggZWFzdGluZywgbm9ydGhpbmcsXG4gKiAgICAgem9uZUxldHRlciwgem9uZU51bWJlclxuICogQHBhcmFtIHtudW1iZXJ9IGFjY3VyYWN5IEFjY3VyYWN5IGluIGRpZ2l0cyAoMS01KS5cbiAqIEByZXR1cm4ge3N0cmluZ30gTUdSUyBzdHJpbmcgZm9yIHRoZSBnaXZlbiBVVE0gbG9jYXRpb24uXG4gKi9cbmZ1bmN0aW9uIGVuY29kZSh1dG0sIGFjY3VyYWN5KSB7XG4gIC8vIHByZXBlbmQgd2l0aCBsZWFkaW5nIHplcm9lc1xuICB2YXIgc2Vhc3RpbmcgPSBcIjAwMDAwXCIgKyB1dG0uZWFzdGluZyxcbiAgICBzbm9ydGhpbmcgPSBcIjAwMDAwXCIgKyB1dG0ubm9ydGhpbmc7XG5cbiAgcmV0dXJuIHV0bS56b25lTnVtYmVyICsgdXRtLnpvbmVMZXR0ZXIgKyBnZXQxMDBrSUQodXRtLmVhc3RpbmcsIHV0bS5ub3J0aGluZywgdXRtLnpvbmVOdW1iZXIpICsgc2Vhc3Rpbmcuc3Vic3RyKHNlYXN0aW5nLmxlbmd0aCAtIDUsIGFjY3VyYWN5KSArIHNub3J0aGluZy5zdWJzdHIoc25vcnRoaW5nLmxlbmd0aCAtIDUsIGFjY3VyYWN5KTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHR3byBsZXR0ZXIgMTAwayBkZXNpZ25hdG9yIGZvciBhIGdpdmVuIFVUTSBlYXN0aW5nLFxuICogbm9ydGhpbmcgYW5kIHpvbmUgbnVtYmVyIHZhbHVlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gZWFzdGluZ1xuICogQHBhcmFtIHtudW1iZXJ9IG5vcnRoaW5nXG4gKiBAcGFyYW0ge251bWJlcn0gem9uZU51bWJlclxuICogQHJldHVybiB0aGUgdHdvIGxldHRlciAxMDBrIGRlc2lnbmF0b3IgZm9yIHRoZSBnaXZlbiBVVE0gbG9jYXRpb24uXG4gKi9cbmZ1bmN0aW9uIGdldDEwMGtJRChlYXN0aW5nLCBub3J0aGluZywgem9uZU51bWJlcikge1xuICB2YXIgc2V0UGFybSA9IGdldDEwMGtTZXRGb3Jab25lKHpvbmVOdW1iZXIpO1xuICB2YXIgc2V0Q29sdW1uID0gTWF0aC5mbG9vcihlYXN0aW5nIC8gMTAwMDAwKTtcbiAgdmFyIHNldFJvdyA9IE1hdGguZmxvb3Iobm9ydGhpbmcgLyAxMDAwMDApICUgMjA7XG4gIHJldHVybiBnZXRMZXR0ZXIxMDBrSUQoc2V0Q29sdW1uLCBzZXRSb3csIHNldFBhcm0pO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgVVRNIHpvbmUgbnVtYmVyLCBmaWd1cmUgb3V0IHRoZSBNR1JTIDEwMEsgc2V0IGl0IGlzIGluLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gaSBBbiBVVE0gem9uZSBudW1iZXIuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSAxMDBrIHNldCB0aGUgVVRNIHpvbmUgaXMgaW4uXG4gKi9cbmZ1bmN0aW9uIGdldDEwMGtTZXRGb3Jab25lKGkpIHtcbiAgdmFyIHNldFBhcm0gPSBpICUgTlVNXzEwMEtfU0VUUztcbiAgaWYgKHNldFBhcm0gPT09IDApIHtcbiAgICBzZXRQYXJtID0gTlVNXzEwMEtfU0VUUztcbiAgfVxuXG4gIHJldHVybiBzZXRQYXJtO1xufVxuXG4vKipcbiAqIEdldCB0aGUgdHdvLWxldHRlciBNR1JTIDEwMGsgZGVzaWduYXRvciBnaXZlbiBpbmZvcm1hdGlvblxuICogdHJhbnNsYXRlZCBmcm9tIHRoZSBVVE0gbm9ydGhpbmcsIGVhc3RpbmcgYW5kIHpvbmUgbnVtYmVyLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gY29sdW1uIHRoZSBjb2x1bW4gaW5kZXggYXMgaXQgcmVsYXRlcyB0byB0aGUgTUdSU1xuICogICAgICAgIDEwMGsgc2V0IHNwcmVhZHNoZWV0LCBjcmVhdGVkIGZyb20gdGhlIFVUTSBlYXN0aW5nLlxuICogICAgICAgIFZhbHVlcyBhcmUgMS04LlxuICogQHBhcmFtIHtudW1iZXJ9IHJvdyB0aGUgcm93IGluZGV4IGFzIGl0IHJlbGF0ZXMgdG8gdGhlIE1HUlMgMTAwayBzZXRcbiAqICAgICAgICBzcHJlYWRzaGVldCwgY3JlYXRlZCBmcm9tIHRoZSBVVE0gbm9ydGhpbmcgdmFsdWUuIFZhbHVlc1xuICogICAgICAgIGFyZSBmcm9tIDAtMTkuXG4gKiBAcGFyYW0ge251bWJlcn0gcGFybSB0aGUgc2V0IGJsb2NrLCBhcyBpdCByZWxhdGVzIHRvIHRoZSBNR1JTIDEwMGsgc2V0XG4gKiAgICAgICAgc3ByZWFkc2hlZXQsIGNyZWF0ZWQgZnJvbSB0aGUgVVRNIHpvbmUuIFZhbHVlcyBhcmUgZnJvbVxuICogICAgICAgIDEtNjAuXG4gKiBAcmV0dXJuIHR3byBsZXR0ZXIgTUdSUyAxMDBrIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIGdldExldHRlcjEwMGtJRChjb2x1bW4sIHJvdywgcGFybSkge1xuICAvLyBjb2xPcmlnaW4gYW5kIHJvd09yaWdpbiBhcmUgdGhlIGxldHRlcnMgYXQgdGhlIG9yaWdpbiBvZiB0aGUgc2V0XG4gIHZhciBpbmRleCA9IHBhcm0gLSAxO1xuICB2YXIgY29sT3JpZ2luID0gU0VUX09SSUdJTl9DT0xVTU5fTEVUVEVSUy5jaGFyQ29kZUF0KGluZGV4KTtcbiAgdmFyIHJvd09yaWdpbiA9IFNFVF9PUklHSU5fUk9XX0xFVFRFUlMuY2hhckNvZGVBdChpbmRleCk7XG5cbiAgLy8gY29sSW50IGFuZCByb3dJbnQgYXJlIHRoZSBsZXR0ZXJzIHRvIGJ1aWxkIHRvIHJldHVyblxuICB2YXIgY29sSW50ID0gY29sT3JpZ2luICsgY29sdW1uIC0gMTtcbiAgdmFyIHJvd0ludCA9IHJvd09yaWdpbiArIHJvdztcbiAgdmFyIHJvbGxvdmVyID0gZmFsc2U7XG5cbiAgaWYgKGNvbEludCA+IFopIHtcbiAgICBjb2xJbnQgPSBjb2xJbnQgLSBaICsgQSAtIDE7XG4gICAgcm9sbG92ZXIgPSB0cnVlO1xuICB9XG5cbiAgaWYgKGNvbEludCA9PT0gSSB8fCAoY29sT3JpZ2luIDwgSSAmJiBjb2xJbnQgPiBJKSB8fCAoKGNvbEludCA+IEkgfHwgY29sT3JpZ2luIDwgSSkgJiYgcm9sbG92ZXIpKSB7XG4gICAgY29sSW50Kys7XG4gIH1cblxuICBpZiAoY29sSW50ID09PSBPIHx8IChjb2xPcmlnaW4gPCBPICYmIGNvbEludCA+IE8pIHx8ICgoY29sSW50ID4gTyB8fCBjb2xPcmlnaW4gPCBPKSAmJiByb2xsb3ZlcikpIHtcbiAgICBjb2xJbnQrKztcblxuICAgIGlmIChjb2xJbnQgPT09IEkpIHtcbiAgICAgIGNvbEludCsrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb2xJbnQgPiBaKSB7XG4gICAgY29sSW50ID0gY29sSW50IC0gWiArIEEgLSAxO1xuICB9XG5cbiAgaWYgKHJvd0ludCA+IFYpIHtcbiAgICByb3dJbnQgPSByb3dJbnQgLSBWICsgQSAtIDE7XG4gICAgcm9sbG92ZXIgPSB0cnVlO1xuICB9XG4gIGVsc2Uge1xuICAgIHJvbGxvdmVyID0gZmFsc2U7XG4gIH1cblxuICBpZiAoKChyb3dJbnQgPT09IEkpIHx8ICgocm93T3JpZ2luIDwgSSkgJiYgKHJvd0ludCA+IEkpKSkgfHwgKCgocm93SW50ID4gSSkgfHwgKHJvd09yaWdpbiA8IEkpKSAmJiByb2xsb3ZlcikpIHtcbiAgICByb3dJbnQrKztcbiAgfVxuXG4gIGlmICgoKHJvd0ludCA9PT0gTykgfHwgKChyb3dPcmlnaW4gPCBPKSAmJiAocm93SW50ID4gTykpKSB8fCAoKChyb3dJbnQgPiBPKSB8fCAocm93T3JpZ2luIDwgTykpICYmIHJvbGxvdmVyKSkge1xuICAgIHJvd0ludCsrO1xuXG4gICAgaWYgKHJvd0ludCA9PT0gSSkge1xuICAgICAgcm93SW50Kys7XG4gICAgfVxuICB9XG5cbiAgaWYgKHJvd0ludCA+IFYpIHtcbiAgICByb3dJbnQgPSByb3dJbnQgLSBWICsgQSAtIDE7XG4gIH1cblxuICB2YXIgdHdvTGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2xJbnQpICsgU3RyaW5nLmZyb21DaGFyQ29kZShyb3dJbnQpO1xuICByZXR1cm4gdHdvTGV0dGVyO1xufVxuXG4vKipcbiAqIERlY29kZSB0aGUgVVRNIHBhcmFtZXRlcnMgZnJvbSBhIE1HUlMgc3RyaW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gbWdyc1N0cmluZyBhbiBVUFBFUkNBU0UgY29vcmRpbmF0ZSBzdHJpbmcgaXMgZXhwZWN0ZWQuXG4gKiBAcmV0dXJuIHtvYmplY3R9IEFuIG9iamVjdCBsaXRlcmFsIHdpdGggZWFzdGluZywgbm9ydGhpbmcsIHpvbmVMZXR0ZXIsXG4gKiAgICAgem9uZU51bWJlciBhbmQgYWNjdXJhY3kgKGluIG1ldGVycykgcHJvcGVydGllcy5cbiAqL1xuZnVuY3Rpb24gZGVjb2RlKG1ncnNTdHJpbmcpIHtcblxuICBpZiAobWdyc1N0cmluZyAmJiBtZ3JzU3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IChcIk1HUlNQb2ludCBjb3ZlcnRpbmcgZnJvbSBub3RoaW5nXCIpO1xuICB9XG5cbiAgdmFyIGxlbmd0aCA9IG1ncnNTdHJpbmcubGVuZ3RoO1xuXG4gIHZhciBodW5LID0gbnVsbDtcbiAgdmFyIHNiID0gXCJcIjtcbiAgdmFyIHRlc3RDaGFyO1xuICB2YXIgaSA9IDA7XG5cbiAgLy8gZ2V0IFpvbmUgbnVtYmVyXG4gIHdoaWxlICghKC9bQS1aXS8pLnRlc3QodGVzdENoYXIgPSBtZ3JzU3RyaW5nLmNoYXJBdChpKSkpIHtcbiAgICBpZiAoaSA+PSAyKSB7XG4gICAgICB0aHJvdyAoXCJNR1JTUG9pbnQgYmFkIGNvbnZlcnNpb24gZnJvbTogXCIgKyBtZ3JzU3RyaW5nKTtcbiAgICB9XG4gICAgc2IgKz0gdGVzdENoYXI7XG4gICAgaSsrO1xuICB9XG5cbiAgdmFyIHpvbmVOdW1iZXIgPSBwYXJzZUludChzYiwgMTApO1xuXG4gIGlmIChpID09PSAwIHx8IGkgKyAzID4gbGVuZ3RoKSB7XG4gICAgLy8gQSBnb29kIE1HUlMgc3RyaW5nIGhhcyB0byBiZSA0LTUgZGlnaXRzIGxvbmcsXG4gICAgLy8gIyNBQUEvI0FBQSBhdCBsZWFzdC5cbiAgICB0aHJvdyAoXCJNR1JTUG9pbnQgYmFkIGNvbnZlcnNpb24gZnJvbTogXCIgKyBtZ3JzU3RyaW5nKTtcbiAgfVxuXG4gIHZhciB6b25lTGV0dGVyID0gbWdyc1N0cmluZy5jaGFyQXQoaSsrKTtcblxuICAvLyBTaG91bGQgd2UgY2hlY2sgdGhlIHpvbmUgbGV0dGVyIGhlcmU/IFdoeSBub3QuXG4gIGlmICh6b25lTGV0dGVyIDw9ICdBJyB8fCB6b25lTGV0dGVyID09PSAnQicgfHwgem9uZUxldHRlciA9PT0gJ1knIHx8IHpvbmVMZXR0ZXIgPj0gJ1onIHx8IHpvbmVMZXR0ZXIgPT09ICdJJyB8fCB6b25lTGV0dGVyID09PSAnTycpIHtcbiAgICB0aHJvdyAoXCJNR1JTUG9pbnQgem9uZSBsZXR0ZXIgXCIgKyB6b25lTGV0dGVyICsgXCIgbm90IGhhbmRsZWQ6IFwiICsgbWdyc1N0cmluZyk7XG4gIH1cblxuICBodW5LID0gbWdyc1N0cmluZy5zdWJzdHJpbmcoaSwgaSArPSAyKTtcblxuICB2YXIgc2V0ID0gZ2V0MTAwa1NldEZvclpvbmUoem9uZU51bWJlcik7XG5cbiAgdmFyIGVhc3QxMDBrID0gZ2V0RWFzdGluZ0Zyb21DaGFyKGh1bksuY2hhckF0KDApLCBzZXQpO1xuICB2YXIgbm9ydGgxMDBrID0gZ2V0Tm9ydGhpbmdGcm9tQ2hhcihodW5LLmNoYXJBdCgxKSwgc2V0KTtcblxuICAvLyBXZSBoYXZlIGEgYnVnIHdoZXJlIHRoZSBub3J0aGluZyBtYXkgYmUgMjAwMDAwMCB0b28gbG93LlxuICAvLyBIb3dcbiAgLy8gZG8gd2Uga25vdyB3aGVuIHRvIHJvbGwgb3Zlcj9cblxuICB3aGlsZSAobm9ydGgxMDBrIDwgZ2V0TWluTm9ydGhpbmcoem9uZUxldHRlcikpIHtcbiAgICBub3J0aDEwMGsgKz0gMjAwMDAwMDtcbiAgfVxuXG4gIC8vIGNhbGN1bGF0ZSB0aGUgY2hhciBpbmRleCBmb3IgZWFzdGluZy9ub3J0aGluZyBzZXBhcmF0b3JcbiAgdmFyIHJlbWFpbmRlciA9IGxlbmd0aCAtIGk7XG5cbiAgaWYgKHJlbWFpbmRlciAlIDIgIT09IDApIHtcbiAgICB0aHJvdyAoXCJNR1JTUG9pbnQgaGFzIHRvIGhhdmUgYW4gZXZlbiBudW1iZXIgXFxub2YgZGlnaXRzIGFmdGVyIHRoZSB6b25lIGxldHRlciBhbmQgdHdvIDEwMGttIGxldHRlcnMgLSBmcm9udCBcXG5oYWxmIGZvciBlYXN0aW5nIG1ldGVycywgc2Vjb25kIGhhbGYgZm9yIFxcbm5vcnRoaW5nIG1ldGVyc1wiICsgbWdyc1N0cmluZyk7XG4gIH1cblxuICB2YXIgc2VwID0gcmVtYWluZGVyIC8gMjtcblxuICB2YXIgc2VwRWFzdGluZyA9IDAuMDtcbiAgdmFyIHNlcE5vcnRoaW5nID0gMC4wO1xuICB2YXIgYWNjdXJhY3lCb251cywgc2VwRWFzdGluZ1N0cmluZywgc2VwTm9ydGhpbmdTdHJpbmcsIGVhc3RpbmcsIG5vcnRoaW5nO1xuICBpZiAoc2VwID4gMCkge1xuICAgIGFjY3VyYWN5Qm9udXMgPSAxMDAwMDAuMCAvIE1hdGgucG93KDEwLCBzZXApO1xuICAgIHNlcEVhc3RpbmdTdHJpbmcgPSBtZ3JzU3RyaW5nLnN1YnN0cmluZyhpLCBpICsgc2VwKTtcbiAgICBzZXBFYXN0aW5nID0gcGFyc2VGbG9hdChzZXBFYXN0aW5nU3RyaW5nKSAqIGFjY3VyYWN5Qm9udXM7XG4gICAgc2VwTm9ydGhpbmdTdHJpbmcgPSBtZ3JzU3RyaW5nLnN1YnN0cmluZyhpICsgc2VwKTtcbiAgICBzZXBOb3J0aGluZyA9IHBhcnNlRmxvYXQoc2VwTm9ydGhpbmdTdHJpbmcpICogYWNjdXJhY3lCb251cztcbiAgfVxuXG4gIGVhc3RpbmcgPSBzZXBFYXN0aW5nICsgZWFzdDEwMGs7XG4gIG5vcnRoaW5nID0gc2VwTm9ydGhpbmcgKyBub3J0aDEwMGs7XG5cbiAgcmV0dXJuIHtcbiAgICBlYXN0aW5nOiBlYXN0aW5nLFxuICAgIG5vcnRoaW5nOiBub3J0aGluZyxcbiAgICB6b25lTGV0dGVyOiB6b25lTGV0dGVyLFxuICAgIHpvbmVOdW1iZXI6IHpvbmVOdW1iZXIsXG4gICAgYWNjdXJhY3k6IGFjY3VyYWN5Qm9udXNcbiAgfTtcbn1cblxuLyoqXG4gKiBHaXZlbiB0aGUgZmlyc3QgbGV0dGVyIGZyb20gYSB0d28tbGV0dGVyIE1HUlMgMTAwayB6b25lLCBhbmQgZ2l2ZW4gdGhlXG4gKiBNR1JTIHRhYmxlIHNldCBmb3IgdGhlIHpvbmUgbnVtYmVyLCBmaWd1cmUgb3V0IHRoZSBlYXN0aW5nIHZhbHVlIHRoYXRcbiAqIHNob3VsZCBiZSBhZGRlZCB0byB0aGUgb3RoZXIsIHNlY29uZGFyeSBlYXN0aW5nIHZhbHVlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge2NoYXJ9IGUgVGhlIGZpcnN0IGxldHRlciBmcm9tIGEgdHdvLWxldHRlciBNR1JTIDEwMMK0ayB6b25lLlxuICogQHBhcmFtIHtudW1iZXJ9IHNldCBUaGUgTUdSUyB0YWJsZSBzZXQgZm9yIHRoZSB6b25lIG51bWJlci5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIGVhc3RpbmcgdmFsdWUgZm9yIHRoZSBnaXZlbiBsZXR0ZXIgYW5kIHNldC5cbiAqL1xuZnVuY3Rpb24gZ2V0RWFzdGluZ0Zyb21DaGFyKGUsIHNldCkge1xuICAvLyBjb2xPcmlnaW4gaXMgdGhlIGxldHRlciBhdCB0aGUgb3JpZ2luIG9mIHRoZSBzZXQgZm9yIHRoZVxuICAvLyBjb2x1bW5cbiAgdmFyIGN1ckNvbCA9IFNFVF9PUklHSU5fQ09MVU1OX0xFVFRFUlMuY2hhckNvZGVBdChzZXQgLSAxKTtcbiAgdmFyIGVhc3RpbmdWYWx1ZSA9IDEwMDAwMC4wO1xuICB2YXIgcmV3aW5kTWFya2VyID0gZmFsc2U7XG5cbiAgd2hpbGUgKGN1ckNvbCAhPT0gZS5jaGFyQ29kZUF0KDApKSB7XG4gICAgY3VyQ29sKys7XG4gICAgaWYgKGN1ckNvbCA9PT0gSSkge1xuICAgICAgY3VyQ29sKys7XG4gICAgfVxuICAgIGlmIChjdXJDb2wgPT09IE8pIHtcbiAgICAgIGN1ckNvbCsrO1xuICAgIH1cbiAgICBpZiAoY3VyQ29sID4gWikge1xuICAgICAgaWYgKHJld2luZE1hcmtlcikge1xuICAgICAgICB0aHJvdyAoXCJCYWQgY2hhcmFjdGVyOiBcIiArIGUpO1xuICAgICAgfVxuICAgICAgY3VyQ29sID0gQTtcbiAgICAgIHJld2luZE1hcmtlciA9IHRydWU7XG4gICAgfVxuICAgIGVhc3RpbmdWYWx1ZSArPSAxMDAwMDAuMDtcbiAgfVxuXG4gIHJldHVybiBlYXN0aW5nVmFsdWU7XG59XG5cbi8qKlxuICogR2l2ZW4gdGhlIHNlY29uZCBsZXR0ZXIgZnJvbSBhIHR3by1sZXR0ZXIgTUdSUyAxMDBrIHpvbmUsIGFuZCBnaXZlbiB0aGVcbiAqIE1HUlMgdGFibGUgc2V0IGZvciB0aGUgem9uZSBudW1iZXIsIGZpZ3VyZSBvdXQgdGhlIG5vcnRoaW5nIHZhbHVlIHRoYXRcbiAqIHNob3VsZCBiZSBhZGRlZCB0byB0aGUgb3RoZXIsIHNlY29uZGFyeSBub3J0aGluZyB2YWx1ZS4gWW91IGhhdmUgdG9cbiAqIHJlbWVtYmVyIHRoYXQgTm9ydGhpbmdzIGFyZSBkZXRlcm1pbmVkIGZyb20gdGhlIGVxdWF0b3IsIGFuZCB0aGUgdmVydGljYWxcbiAqIGN5Y2xlIG9mIGxldHRlcnMgbWVhbiBhIDIwMDAwMDAgYWRkaXRpb25hbCBub3J0aGluZyBtZXRlcnMuIFRoaXMgaGFwcGVuc1xuICogYXBwcm94LiBldmVyeSAxOCBkZWdyZWVzIG9mIGxhdGl0dWRlLiBUaGlzIG1ldGhvZCBkb2VzICpOT1QqIGNvdW50IGFueVxuICogYWRkaXRpb25hbCBub3J0aGluZ3MuIFlvdSBoYXZlIHRvIGZpZ3VyZSBvdXQgaG93IG1hbnkgMjAwMDAwMCBtZXRlcnMgbmVlZFxuICogdG8gYmUgYWRkZWQgZm9yIHRoZSB6b25lIGxldHRlciBvZiB0aGUgTUdSUyBjb29yZGluYXRlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge2NoYXJ9IG4gU2Vjb25kIGxldHRlciBvZiB0aGUgTUdSUyAxMDBrIHpvbmVcbiAqIEBwYXJhbSB7bnVtYmVyfSBzZXQgVGhlIE1HUlMgdGFibGUgc2V0IG51bWJlciwgd2hpY2ggaXMgZGVwZW5kZW50IG9uIHRoZVxuICogICAgIFVUTSB6b25lIG51bWJlci5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG5vcnRoaW5nIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbGV0dGVyIGFuZCBzZXQuXG4gKi9cbmZ1bmN0aW9uIGdldE5vcnRoaW5nRnJvbUNoYXIobiwgc2V0KSB7XG5cbiAgaWYgKG4gPiAnVicpIHtcbiAgICB0aHJvdyAoXCJNR1JTUG9pbnQgZ2l2ZW4gaW52YWxpZCBOb3J0aGluZyBcIiArIG4pO1xuICB9XG5cbiAgLy8gcm93T3JpZ2luIGlzIHRoZSBsZXR0ZXIgYXQgdGhlIG9yaWdpbiBvZiB0aGUgc2V0IGZvciB0aGVcbiAgLy8gY29sdW1uXG4gIHZhciBjdXJSb3cgPSBTRVRfT1JJR0lOX1JPV19MRVRURVJTLmNoYXJDb2RlQXQoc2V0IC0gMSk7XG4gIHZhciBub3J0aGluZ1ZhbHVlID0gMC4wO1xuICB2YXIgcmV3aW5kTWFya2VyID0gZmFsc2U7XG5cbiAgd2hpbGUgKGN1clJvdyAhPT0gbi5jaGFyQ29kZUF0KDApKSB7XG4gICAgY3VyUm93Kys7XG4gICAgaWYgKGN1clJvdyA9PT0gSSkge1xuICAgICAgY3VyUm93Kys7XG4gICAgfVxuICAgIGlmIChjdXJSb3cgPT09IE8pIHtcbiAgICAgIGN1clJvdysrO1xuICAgIH1cbiAgICAvLyBmaXhpbmcgYSBidWcgbWFraW5nIHdob2xlIGFwcGxpY2F0aW9uIGhhbmcgaW4gdGhpcyBsb29wXG4gICAgLy8gd2hlbiAnbicgaXMgYSB3cm9uZyBjaGFyYWN0ZXJcbiAgICBpZiAoY3VyUm93ID4gVikge1xuICAgICAgaWYgKHJld2luZE1hcmtlcikgeyAvLyBtYWtpbmcgc3VyZSB0aGF0IHRoaXMgbG9vcCBlbmRzXG4gICAgICAgIHRocm93IChcIkJhZCBjaGFyYWN0ZXI6IFwiICsgbik7XG4gICAgICB9XG4gICAgICBjdXJSb3cgPSBBO1xuICAgICAgcmV3aW5kTWFya2VyID0gdHJ1ZTtcbiAgICB9XG4gICAgbm9ydGhpbmdWYWx1ZSArPSAxMDAwMDAuMDtcbiAgfVxuXG4gIHJldHVybiBub3J0aGluZ1ZhbHVlO1xufVxuXG4vKipcbiAqIFRoZSBmdW5jdGlvbiBnZXRNaW5Ob3J0aGluZyByZXR1cm5zIHRoZSBtaW5pbXVtIG5vcnRoaW5nIHZhbHVlIG9mIGEgTUdSU1xuICogem9uZS5cbiAqXG4gKiBQb3J0ZWQgZnJvbSBHZW90cmFucycgYyBMYXR0aXR1ZGVfQmFuZF9WYWx1ZSBzdHJ1Y3R1cmUgdGFibGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Y2hhcn0gem9uZUxldHRlciBUaGUgTUdSUyB6b25lIHRvIGdldCB0aGUgbWluIG5vcnRoaW5nIGZvci5cbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0TWluTm9ydGhpbmcoem9uZUxldHRlcikge1xuICB2YXIgbm9ydGhpbmc7XG4gIHN3aXRjaCAoem9uZUxldHRlcikge1xuICBjYXNlICdDJzpcbiAgICBub3J0aGluZyA9IDExMDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnRCc6XG4gICAgbm9ydGhpbmcgPSAyMDAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ0UnOlxuICAgIG5vcnRoaW5nID0gMjgwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdGJzpcbiAgICBub3J0aGluZyA9IDM3MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnRyc6XG4gICAgbm9ydGhpbmcgPSA0NjAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ0gnOlxuICAgIG5vcnRoaW5nID0gNTUwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdKJzpcbiAgICBub3J0aGluZyA9IDY0MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnSyc6XG4gICAgbm9ydGhpbmcgPSA3MzAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ0wnOlxuICAgIG5vcnRoaW5nID0gODIwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdNJzpcbiAgICBub3J0aGluZyA9IDkxMDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnTic6XG4gICAgbm9ydGhpbmcgPSAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1AnOlxuICAgIG5vcnRoaW5nID0gODAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1EnOlxuICAgIG5vcnRoaW5nID0gMTcwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdSJzpcbiAgICBub3J0aGluZyA9IDI2MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnUyc6XG4gICAgbm9ydGhpbmcgPSAzNTAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1QnOlxuICAgIG5vcnRoaW5nID0gNDQwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdVJzpcbiAgICBub3J0aGluZyA9IDUzMDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnVic6XG4gICAgbm9ydGhpbmcgPSA2MjAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1cnOlxuICAgIG5vcnRoaW5nID0gNzAwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdYJzpcbiAgICBub3J0aGluZyA9IDc5MDAwMDAuMDtcbiAgICBicmVhaztcbiAgZGVmYXVsdDpcbiAgICBub3J0aGluZyA9IC0xLjA7XG4gIH1cbiAgaWYgKG5vcnRoaW5nID49IDAuMCkge1xuICAgIHJldHVybiBub3J0aGluZztcbiAgfVxuICBlbHNlIHtcbiAgICB0aHJvdyAoXCJJbnZhbGlkIHpvbmUgbGV0dGVyOiBcIiArIHpvbmVMZXR0ZXIpO1xuICB9XG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJuYW1lXCI6IFwicHJvajRcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMi4zLjEwXCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJQcm9qNGpzIGlzIGEgSmF2YVNjcmlwdCBsaWJyYXJ5IHRvIHRyYW5zZm9ybSBwb2ludCBjb29yZGluYXRlcyBmcm9tIG9uZSBjb29yZGluYXRlIHN5c3RlbSB0byBhbm90aGVyLCBpbmNsdWRpbmcgZGF0dW0gdHJhbnNmb3JtYXRpb25zLlwiLFxuICBcIm1haW5cIjogXCJsaWIvaW5kZXguanNcIixcbiAgXCJkaXJlY3Rvcmllc1wiOiB7XG4gICAgXCJ0ZXN0XCI6IFwidGVzdFwiLFxuICAgIFwiZG9jXCI6IFwiZG9jc1wiXG4gIH0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJ0ZXN0XCI6IFwiLi9ub2RlX21vZHVsZXMvaXN0YW5idWwvbGliL2NsaS5qcyB0ZXN0IC4vbm9kZV9tb2R1bGVzL21vY2hhL2Jpbi9fbW9jaGEgdGVzdC90ZXN0LmpzXCJcbiAgfSxcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImdpdDovL2dpdGh1Yi5jb20vcHJvajRqcy9wcm9qNGpzLmdpdFwiXG4gIH0sXG4gIFwiYXV0aG9yXCI6IFwiXCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcImphbVwiOiB7XG4gICAgXCJtYWluXCI6IFwiZGlzdC9wcm9qNC5qc1wiLFxuICAgIFwiaW5jbHVkZVwiOiBbXG4gICAgICBcImRpc3QvcHJvajQuanNcIixcbiAgICAgIFwiUkVBRE1FLm1kXCIsXG4gICAgICBcIkFVVEhPUlNcIixcbiAgICAgIFwiTElDRU5TRS5tZFwiXG4gICAgXVxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJncnVudC1jbGlcIjogXCJ+MC4xLjEzXCIsXG4gICAgXCJncnVudFwiOiBcIn4wLjQuMlwiLFxuICAgIFwiZ3J1bnQtY29udHJpYi1jb25uZWN0XCI6IFwifjAuNi4wXCIsXG4gICAgXCJncnVudC1jb250cmliLWpzaGludFwiOiBcIn4wLjguMFwiLFxuICAgIFwiY2hhaVwiOiBcIn4xLjguMVwiLFxuICAgIFwibW9jaGFcIjogXCJ+MS4xNy4xXCIsXG4gICAgXCJncnVudC1tb2NoYS1waGFudG9tanNcIjogXCJ+MC40LjBcIixcbiAgICBcImJyb3dzZXJpZnlcIjogXCJ+My4yNC41XCIsXG4gICAgXCJncnVudC1icm93c2VyaWZ5XCI6IFwifjEuMy4wXCIsXG4gICAgXCJncnVudC1jb250cmliLXVnbGlmeVwiOiBcIn4wLjMuMlwiLFxuICAgIFwiY3VybFwiOiBcImdpdDovL2dpdGh1Yi5jb20vY3Vqb2pzL2N1cmwuZ2l0XCIsXG4gICAgXCJpc3RhbmJ1bFwiOiBcIn4wLjIuNFwiLFxuICAgIFwidGluXCI6IFwifjAuNC4wXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwibWdyc1wiOiBcIn4wLjAuMlwiXG4gIH0sXG4gIFwiY29udHJpYnV0b3JzXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJNaWtlIEFkYWlyXCIsXG4gICAgICBcImVtYWlsXCI6IFwibWFkYWlyQGRtc29sdXRpb25zLmNhXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlJpY2hhcmQgR3JlZW53b29kXCIsXG4gICAgICBcImVtYWlsXCI6IFwicmljaEBncmVlbndvb2RtYXAuY29tXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkNhbHZpbiBNZXRjYWxmXCIsXG4gICAgICBcImVtYWlsXCI6IFwiY2FsdmluLm1ldGNhbGZAZ21haWwuY29tXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlJpY2hhcmQgTWFyc2RlblwiLFxuICAgICAgXCJ1cmxcIjogXCJodHRwOi8vd3d3LndpbndhZWQuY29tXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIlQuIE1pdHRhblwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJELiBTdGVpbndhbmRcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUy4gTmVsc29uXCJcbiAgICB9XG4gIF0sXG4gIFwiZ2l0SGVhZFwiOiBcImFjMDNkMTQzOTQ5MWRjMzEzZGE4MDk4NTE5M2Y3MDJjYTQ3MWIzZDBcIixcbiAgXCJidWdzXCI6IHtcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9wcm9qNGpzL3Byb2o0anMvaXNzdWVzXCJcbiAgfSxcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9wcm9qNGpzL3Byb2o0anMjcmVhZG1lXCIsXG4gIFwiX2lkXCI6IFwicHJvajRAMi4zLjEwXCIsXG4gIFwiX3NoYXN1bVwiOiBcImY2ZTY2YmRjY2EzMzJjMjVhNWUzZDhlZjI2NWNmYzlkN2I2MGZkMGNcIixcbiAgXCJfZnJvbVwiOiBcInByb2o0QCpcIixcbiAgXCJfbnBtVmVyc2lvblwiOiBcIjIuMTEuMlwiLFxuICBcIl9ub2RlVmVyc2lvblwiOiBcIjAuMTIuNVwiLFxuICBcIl9ucG1Vc2VyXCI6IHtcbiAgICBcIm5hbWVcIjogXCJhaG9jZXZhclwiLFxuICAgIFwiZW1haWxcIjogXCJhbmRyZWFzLmhvY2V2YXJAZ21haWwuY29tXCJcbiAgfSxcbiAgXCJtYWludGFpbmVyc1wiOiBbXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiY3dtbWFcIixcbiAgICAgIFwiZW1haWxcIjogXCJjYWx2aW4ubWV0Y2FsZkBnbWFpbC5jb21cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiYWhvY2V2YXJcIixcbiAgICAgIFwiZW1haWxcIjogXCJhbmRyZWFzLmhvY2V2YXJAZ21haWwuY29tXCJcbiAgICB9XG4gIF0sXG4gIFwiZGlzdFwiOiB7XG4gICAgXCJzaGFzdW1cIjogXCJmNmU2NmJkY2NhMzMyYzI1YTVlM2Q4ZWYyNjVjZmM5ZDdiNjBmZDBjXCIsXG4gICAgXCJ0YXJiYWxsXCI6IFwiaHR0cDovL3JlZ2lzdHJ5Lm5wbWpzLm9yZy9wcm9qNC8tL3Byb2o0LTIuMy4xMC50Z3pcIlxuICB9LFxuICBcIl9yZXNvbHZlZFwiOiBcImh0dHBzOi8vcmVnaXN0cnkubnBtanMub3JnL3Byb2o0Ly0vcHJvajQtMi4zLjEwLnRnelwiXG59XG4iXX0=
