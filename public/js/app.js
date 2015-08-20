(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CIMIS = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"proj4":40}],2:[function(require,module,exports){

module.exports = {
  grid : require('./cimis-grid'),
  utils : require('./utils')
};

},{"./cimis-grid":1,"./utils":3}],3:[function(require,module,exports){
'use strict';

function sortDates(data) {
  var arr = [];

  if( Array.isArray(data) ) {
    for( var i = 0; i < data.length; i++ ) {
      arr.push({
        str : data[i],
        time : new Date(data[i]).getTime()
      });
    }
  } else {
    for( var date in data ) {
      arr.push({
        str : date,
        time : new Date(date).getTime()
      });
    }
  }

  arr.sort(function(a, b){
    if( a.time > b.time ) {
      return 1;
    } else if( b.time < a.time ) {
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

module.exports = {
  sortDates : sortDates
};

},{}],4:[function(require,module,exports){
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
},{"mgrs":71}],5:[function(require,module,exports){
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

},{"./deriveConstants":36,"./extend":37,"./parseCode":41,"./projections":43}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
var HALF_PI = Math.PI/2;
var sign = require('./sign');

module.exports = function(x) {
  return (Math.abs(x) < HALF_PI) ? x : (x - (sign(x) * Math.PI));
};
},{"./sign":24}],8:[function(require,module,exports){
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
},{"./sign":24}],9:[function(require,module,exports){
module.exports = function(x) {
  if (Math.abs(x) > 1) {
    x = (x > 1) ? 1 : -1;
  }
  return Math.asin(x);
};
},{}],10:[function(require,module,exports){
module.exports = function(x) {
  return (1 - 0.25 * x * (1 + x / 16 * (3 + 1.25 * x)));
};
},{}],11:[function(require,module,exports){
module.exports = function(x) {
  return (0.375 * x * (1 + 0.25 * x * (1 + 0.46875 * x)));
};
},{}],12:[function(require,module,exports){
module.exports = function(x) {
  return (0.05859375 * x * x * (1 + 0.75 * x));
};
},{}],13:[function(require,module,exports){
module.exports = function(x) {
  return (x * x * x * (35 / 3072));
};
},{}],14:[function(require,module,exports){
module.exports = function(a, e, sinphi) {
  var temp = e * sinphi;
  return a / Math.sqrt(1 - temp * temp);
};
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
module.exports = function(e0, e1, e2, e3, phi) {
  return (e0 * phi - e1 * Math.sin(2 * phi) + e2 * Math.sin(4 * phi) - e3 * Math.sin(6 * phi));
};
},{}],18:[function(require,module,exports){
module.exports = function(eccent, sinphi, cosphi) {
  var con = eccent * sinphi;
  return cosphi / (Math.sqrt(1 - con * con));
};
},{}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
},{"./pj_mlfn":22}],22:[function(require,module,exports){
module.exports = function(phi, sphi, cphi, en) {
  cphi *= sphi;
  sphi *= sphi;
  return (en[0] * phi - cphi * (en[1] + sphi * (en[2] + sphi * (en[3] + sphi * en[4]))));
};
},{}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
module.exports = function(x) {
  return x<0 ? -1 : 1;
};
},{}],25:[function(require,module,exports){
module.exports = function(esinp, exp) {
  return (Math.pow((1 - esinp) / (1 + esinp), exp));
};
},{}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
var HALF_PI = Math.PI/2;

module.exports = function(eccent, phi, sinphi) {
  var con = eccent * sinphi;
  var com = 0.5 * eccent;
  con = Math.pow(((1 - con) / (1 + con)), com);
  return (Math.tan(0.5 * (HALF_PI - phi)) / con);
};
},{}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
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
},{}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
exports.ft = {to_meter: 0.3048};
exports['us-ft'] = {to_meter: 1200 / 3937};

},{}],32:[function(require,module,exports){
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
},{"./Proj":5,"./transform":69}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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


},{}],35:[function(require,module,exports){
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

},{"./global":38,"./projString":42,"./wkt":70}],36:[function(require,module,exports){
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

},{"./constants/Datum":28,"./constants/Ellipsoid":29,"./datum":33,"./extend":37}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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
},{"./projections/aea":44,"./projections/aeqd":45,"./projections/cass":46,"./projections/cea":47,"./projections/eqc":48,"./projections/eqdc":49,"./projections/gnom":51,"./projections/krovak":52,"./projections/laea":53,"./projections/lcc":54,"./projections/mill":57,"./projections/moll":58,"./projections/nzmg":59,"./projections/omerc":60,"./projections/poly":61,"./projections/sinu":62,"./projections/somerc":63,"./projections/stere":64,"./projections/sterea":65,"./projections/tmerc":66,"./projections/utm":67,"./projections/vandg":68}],40:[function(require,module,exports){
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
},{"../package.json":72,"./Point":4,"./Proj":5,"./common/toPoint":26,"./core":32,"./defs":35,"./includedProjections":39,"./transform":69,"mgrs":71}],41:[function(require,module,exports){
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
},{"./defs":35,"./projString":42,"./wkt":70}],42:[function(require,module,exports){
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

},{"./constants/PrimeMeridian":30,"./constants/units":31}],43:[function(require,module,exports){
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

},{"./projections/longlat":55,"./projections/merc":56}],44:[function(require,module,exports){
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

},{"../common/adjust_lon":8,"../common/asinz":9,"../common/msfnz":18,"../common/qsfnz":23}],45:[function(require,module,exports){
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

},{"../common/adjust_lon":8,"../common/asinz":9,"../common/e0fn":10,"../common/e1fn":11,"../common/e2fn":12,"../common/e3fn":13,"../common/gN":14,"../common/imlfn":15,"../common/mlfn":17}],46:[function(require,module,exports){
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
},{"../common/adjust_lat":7,"../common/adjust_lon":8,"../common/e0fn":10,"../common/e1fn":11,"../common/e2fn":12,"../common/e3fn":13,"../common/gN":14,"../common/imlfn":15,"../common/mlfn":17}],47:[function(require,module,exports){
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

},{"../common/adjust_lon":8,"../common/iqsfnz":16,"../common/msfnz":18,"../common/qsfnz":23}],48:[function(require,module,exports){
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

},{"../common/adjust_lat":7,"../common/adjust_lon":8}],49:[function(require,module,exports){
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

},{"../common/adjust_lat":7,"../common/adjust_lon":8,"../common/e0fn":10,"../common/e1fn":11,"../common/e2fn":12,"../common/e3fn":13,"../common/imlfn":15,"../common/mlfn":17,"../common/msfnz":18}],50:[function(require,module,exports){
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

},{"../common/srat":25}],51:[function(require,module,exports){
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

},{"../common/adjust_lon":8,"../common/asinz":9}],52:[function(require,module,exports){
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

},{"../common/adjust_lon":8}],53:[function(require,module,exports){
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

},{"../common/adjust_lon":8,"../common/qsfnz":23}],54:[function(require,module,exports){
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

},{"../common/adjust_lon":8,"../common/msfnz":18,"../common/phi2z":19,"../common/sign":24,"../common/tsfnz":27}],55:[function(require,module,exports){
exports.init = function() {
  //no-op for longlat
};

function identity(pt) {
  return pt;
}
exports.forward = identity;
exports.inverse = identity;
exports.names = ["longlat", "identity"];

},{}],56:[function(require,module,exports){
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

},{"../common/adjust_lon":8,"../common/msfnz":18,"../common/phi2z":19,"../common/tsfnz":27}],57:[function(require,module,exports){
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

},{"../common/adjust_lon":8}],58:[function(require,module,exports){
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

},{"../common/adjust_lon":8}],59:[function(require,module,exports){
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
},{}],60:[function(require,module,exports){
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
},{"../common/adjust_lon":8,"../common/phi2z":19,"../common/tsfnz":27}],61:[function(require,module,exports){
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
},{"../common/adjust_lat":7,"../common/adjust_lon":8,"../common/e0fn":10,"../common/e1fn":11,"../common/e2fn":12,"../common/e3fn":13,"../common/gN":14,"../common/mlfn":17}],62:[function(require,module,exports){
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
},{"../common/adjust_lat":7,"../common/adjust_lon":8,"../common/asinz":9,"../common/pj_enfn":20,"../common/pj_inv_mlfn":21,"../common/pj_mlfn":22}],63:[function(require,module,exports){
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

},{}],64:[function(require,module,exports){
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

},{"../common/adjust_lon":8,"../common/msfnz":18,"../common/phi2z":19,"../common/sign":24,"../common/tsfnz":27}],65:[function(require,module,exports){
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

},{"../common/adjust_lon":8,"./gauss":50}],66:[function(require,module,exports){
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

},{"../common/adjust_lon":8,"../common/asinz":9,"../common/e0fn":10,"../common/e1fn":11,"../common/e2fn":12,"../common/e3fn":13,"../common/mlfn":17,"../common/sign":24}],67:[function(require,module,exports){
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

},{"./tmerc":66}],68:[function(require,module,exports){
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
},{"../common/adjust_lon":8,"../common/asinz":9}],69:[function(require,module,exports){
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
},{"./Proj":5,"./adjust_axis":6,"./common/toPoint":26,"./datum_transform":34}],70:[function(require,module,exports){
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

},{"./extend":37}],71:[function(require,module,exports){



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

},{}],72:[function(require,module,exports){
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

},{}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvc2hhcmVkL2NpbWlzLWdyaWQvaW5kZXguanMiLCJsaWIvc2hhcmVkL2luZGV4LmpzIiwibGliL3NoYXJlZC91dGlscy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvUG9pbnQuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL1Byb2ouanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2FkanVzdF9heGlzLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vYWRqdXN0X2xhdC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2FkanVzdF9sb24uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9hc2luei5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2UwZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9lMWZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vZTJmbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2UzZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9nTi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL2ltbGZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vaXFzZm56LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vbWxmbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL21zZm56LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vcGhpMnouanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9wal9lbmZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vcGpfaW52X21sZm4uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9wal9tbGZuLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vcXNmbnouanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi9zaWduLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb21tb24vc3JhdC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29tbW9uL3RvUG9pbnQuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2NvbW1vbi90c2Zuei5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29uc3RhbnRzL0RhdHVtLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb25zdGFudHMvRWxsaXBzb2lkLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb25zdGFudHMvUHJpbWVNZXJpZGlhbi5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvY29uc3RhbnRzL3VuaXRzLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9jb3JlLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9kYXR1bS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvZGF0dW1fdHJhbnNmb3JtLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9kZWZzLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9kZXJpdmVDb25zdGFudHMuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL2V4dGVuZC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvZ2xvYmFsLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9pbmNsdWRlZFByb2plY3Rpb25zLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcGFyc2VDb2RlLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvYWVhLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9hZXFkLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9jYXNzLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9jZWEuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2VxYy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvZXFkYy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvZ2F1c3MuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2dub20uanMiLCJub2RlX21vZHVsZXMvcHJvajQvbGliL3Byb2plY3Rpb25zL2tyb3Zhay5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvbGFlYS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvbGNjLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9sb25nbGF0LmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9tZXJjLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9taWxsLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9tb2xsLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9uem1nLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9vbWVyYy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvcG9seS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvc2ludS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvc29tZXJjLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy9zdGVyZS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvc3RlcmVhLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy90bWVyYy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvcHJvamVjdGlvbnMvdXRtLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi9wcm9qZWN0aW9ucy92YW5kZy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9saWIvdHJhbnNmb3JtLmpzIiwibm9kZV9tb2R1bGVzL3Byb2o0L2xpYi93a3QuanMiLCJub2RlX21vZHVsZXMvcHJvajQvbm9kZV9tb2R1bGVzL21ncnMvbWdycy5qcyIsIm5vZGVfbW9kdWxlcy9wcm9qNC9wYWNrYWdlLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0dUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIHByb2o0ID0gcmVxdWlyZSgncHJvajQnKTtcblxuLy8gbWF0Y2ggbGF5ZXJzIGZvciBlYXNpZXIgY2hlY2tpbmdcbnZhciBuY29scyA9IDUxMCxcbiAgICBucm93cyA9IDU2MCxcbiAgICB4bGxjb3JuZXIgPSAtNDEwMDAwLFxuICAgIHlsbGNvcm5lciA9IC02NjAwMDAsXG4gICAgY2VsbHNpemUgPSAyMDAwO1xuXG52YXIgcHJval9nbWFwcyA9ICdFUFNHOjQzMjYnO1xudmFyIHByb2pfY2ltaXMgPSAnRVBTRzozMzEwJztcblxucHJvajQuZGVmcygnRVBTRzozMzEwJywnK3Byb2o9YWVhICtsYXRfMT0zNCArbGF0XzI9NDAuNSArbGF0XzA9MCArbG9uXzA9LTEyMCAreF8wPTAgK3lfMD0tNDAwMDAwMCArZWxscHM9R1JTODAgK3Rvd2dzODQ9MCwwLDAsMCwwLDAsMCArdW5pdHM9bSArbm9fZGVmcycpO1xuXG5cbmZ1bmN0aW9uIGJvdW5kcygpIHtcbiAgdmFyIGJvdHRvbUxlZnQgPSBwcm9qNChwcm9qX2NpbWlzLCBwcm9qX2dtYXBzLCBbeGxsY29ybmVyLCB5bGxjb3JuZXJdKTtcbiAgdmFyIHRvcFJpZ2h0ID0gcHJvajQocHJval9jaW1pcywgcHJval9nbWFwcyxbeGxsY29ybmVyK25jb2xzKmNlbGxzaXplLCB5bGxjb3JuZXIrbnJvd3MqY2VsbHNpemVdKTtcbiAgdmFyIGJvdW5kcyA9IFtib3R0b21MZWZ0LCB0b3BSaWdodF07XG4gIHJldHVybiBib3VuZHM7XG59XG5cbmZ1bmN0aW9uIGdyaWRUb0JvdW5kcyhyb3csIGNvbCkge1xuICB2YXIgYm90dG9tTGVmdCA9IHByb2o0KHByb2pfY2ltaXMsIHByb2pfZ21hcHMsIFt4bGxjb3JuZXIgKyAoY29sKmNlbGxzaXplKSwgeWxsY29ybmVyICsgKChucm93cyAtIHJvdykqY2VsbHNpemUpXSk7XG4gIHZhciB0b3BSaWdodCA9IHByb2o0KHByb2pfY2ltaXMsIHByb2pfZ21hcHMsIFt4bGxjb3JuZXIgKyAoKGNvbCsxKSAqIGNlbGxzaXplKSwgeWxsY29ybmVyICsgKChucm93cyAtKHJvdysxKSkgKiBjZWxsc2l6ZSldKTtcbiAgdmFyIGJvdW5kcyA9IFtib3R0b21MZWZ0LCB0b3BSaWdodF07XG5cbiAgcmV0dXJuIGJvdW5kcztcbn1cblxuZnVuY3Rpb24gbGxUb0dyaWQobG5nLCBsYXQpIHtcbiAgaWYoIHR5cGVvZiBsbmcgPT09ICdvYmplY3QnICkge1xuICAgIGxhdCA9IGxuZy5sYXQoKTtcbiAgICBsbmcgPSBsbmcubG5nKCk7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gcHJvajQocHJval9nbWFwcywgcHJval9jaW1pcywgW2xuZywgbGF0XSk7XG5cbiAgLy8gQXNzdW1pbmcgdGhpcyBpcyB0aGUgaW5wdXQgdG8gdGhlIGdyaWQuLi4uXG4gIC8vIENvbHMgYXJlIFguIFJvd3MgYXJlIFkgYW5kIGNvdW50ZWQgZnJvbSB0aGUgdG9wIGRvd25cbiAgcmVzdWx0ID0ge1xuICAgIHJvdyA6IG5yb3dzIC0gTWF0aC5mbG9vcigocmVzdWx0WzFdIC0geWxsY29ybmVyKSAvIGNlbGxzaXplKSxcbiAgICBjb2wgOiBNYXRoLmZsb29yKChyZXN1bHRbMF0gLSB4bGxjb3JuZXIpIC8gY2VsbHNpemUpLFxuICB9O1xuXG4gIHZhciB5ID0geWxsY29ybmVyICsgKChucm93cy1yZXN1bHQucm93KSAqIGNlbGxzaXplKTtcbiAgdmFyIHggPSB4bGxjb3JuZXIgKyAocmVzdWx0LmNvbCAqIGNlbGxzaXplKSA7XG5cbiAgcmVzdWx0LnRvcFJpZ2h0ID0gcHJvajQocHJval9jaW1pcywgcHJval9nbWFwcyxbeCtjZWxsc2l6ZSwgeStjZWxsc2l6ZV0pO1xuICByZXN1bHQuYm90dG9tTGVmdCA9IHByb2o0KHByb2pfY2ltaXMsIHByb2pfZ21hcHMsW3gsIHldKTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsbFRvR3JpZCA6IGxsVG9HcmlkLFxuICB4bGxjb3JuZXIgOiB4bGxjb3JuZXIsXG4gIHlsbGNvcm5lciA6IHlsbGNvcm5lcixcbiAgY2VsbHNpemUgOiBjZWxsc2l6ZSxcbiAgYm91bmRzIDogYm91bmRzLFxuICBncmlkVG9Cb3VuZHMgOiBncmlkVG9Cb3VuZHNcbn07XG4iLCJcbm1vZHVsZS5leHBvcnRzID0ge1xuICBncmlkIDogcmVxdWlyZSgnLi9jaW1pcy1ncmlkJyksXG4gIHV0aWxzIDogcmVxdWlyZSgnLi91dGlscycpXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBzb3J0RGF0ZXMoZGF0YSkge1xuICB2YXIgYXJyID0gW107XG5cbiAgaWYoIEFycmF5LmlzQXJyYXkoZGF0YSkgKSB7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrICkge1xuICAgICAgYXJyLnB1c2goe1xuICAgICAgICBzdHIgOiBkYXRhW2ldLFxuICAgICAgICB0aW1lIDogbmV3IERhdGUoZGF0YVtpXSkuZ2V0VGltZSgpXG4gICAgICB9KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yKCB2YXIgZGF0ZSBpbiBkYXRhICkge1xuICAgICAgYXJyLnB1c2goe1xuICAgICAgICBzdHIgOiBkYXRlLFxuICAgICAgICB0aW1lIDogbmV3IERhdGUoZGF0ZSkuZ2V0VGltZSgpXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhcnIuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICBpZiggYS50aW1lID4gYi50aW1lICkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmKCBiLnRpbWUgPCBhLnRpbWUgKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9KTtcblxuICB2YXIgdG1wID0gW107XG4gIGFyci5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgIHRtcC5wdXNoKGl0ZW0uc3RyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRtcDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNvcnREYXRlcyA6IHNvcnREYXRlc1xufTtcbiIsInZhciBtZ3JzID0gcmVxdWlyZSgnbWdycycpO1xuXG5mdW5jdGlvbiBQb2ludCh4LCB5LCB6KSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQb2ludCkpIHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHgsIHksIHopO1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHgpKSB7XG4gICAgdGhpcy54ID0geFswXTtcbiAgICB0aGlzLnkgPSB4WzFdO1xuICAgIHRoaXMueiA9IHhbMl0gfHwgMC4wO1xuICB9ZWxzZSBpZih0eXBlb2YgeCA9PT0gJ29iamVjdCcpe1xuICAgIHRoaXMueCA9IHgueDtcbiAgICB0aGlzLnkgPSB4Lnk7XG4gICAgdGhpcy56ID0geC56IHx8IDAuMDtcbiAgfSBlbHNlIGlmICh0eXBlb2YgeCA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIGNvb3JkcyA9IHguc3BsaXQoJywnKTtcbiAgICB0aGlzLnggPSBwYXJzZUZsb2F0KGNvb3Jkc1swXSwgMTApO1xuICAgIHRoaXMueSA9IHBhcnNlRmxvYXQoY29vcmRzWzFdLCAxMCk7XG4gICAgdGhpcy56ID0gcGFyc2VGbG9hdChjb29yZHNbMl0sIDEwKSB8fCAwLjA7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMueiA9IHogfHwgMC4wO1xuICB9XG4gIGNvbnNvbGUud2FybigncHJvajQuUG9pbnQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMywgdXNlIHByb2o0LnRvUG9pbnQnKTtcbn1cblxuUG9pbnQuZnJvbU1HUlMgPSBmdW5jdGlvbihtZ3JzU3RyKSB7XG4gIHJldHVybiBuZXcgUG9pbnQobWdycy50b1BvaW50KG1ncnNTdHIpKTtcbn07XG5Qb2ludC5wcm90b3R5cGUudG9NR1JTID0gZnVuY3Rpb24oYWNjdXJhY3kpIHtcbiAgcmV0dXJuIG1ncnMuZm9yd2FyZChbdGhpcy54LCB0aGlzLnldLCBhY2N1cmFjeSk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBQb2ludDsiLCJ2YXIgcGFyc2VDb2RlID0gcmVxdWlyZShcIi4vcGFyc2VDb2RlXCIpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJy4vZXh0ZW5kJyk7XG52YXIgcHJvamVjdGlvbnMgPSByZXF1aXJlKCcuL3Byb2plY3Rpb25zJyk7XG52YXIgZGVyaXZlQ29uc3RhbnRzID0gcmVxdWlyZSgnLi9kZXJpdmVDb25zdGFudHMnKTtcblxuZnVuY3Rpb24gUHJvamVjdGlvbihzcnNDb2RlLGNhbGxiYWNrKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm9qZWN0aW9uKSkge1xuICAgIHJldHVybiBuZXcgUHJvamVjdGlvbihzcnNDb2RlKTtcbiAgfVxuICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uKGVycm9yKXtcbiAgICBpZihlcnJvcil7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH07XG4gIHZhciBqc29uID0gcGFyc2VDb2RlKHNyc0NvZGUpO1xuICBpZih0eXBlb2YganNvbiAhPT0gJ29iamVjdCcpe1xuICAgIGNhbGxiYWNrKHNyc0NvZGUpO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbW9kaWZpZWRKU09OID0gZGVyaXZlQ29uc3RhbnRzKGpzb24pO1xuICB2YXIgb3VyUHJvaiA9IFByb2plY3Rpb24ucHJvamVjdGlvbnMuZ2V0KG1vZGlmaWVkSlNPTi5wcm9qTmFtZSk7XG4gIGlmKG91clByb2ope1xuICAgIGV4dGVuZCh0aGlzLCBtb2RpZmllZEpTT04pO1xuICAgIGV4dGVuZCh0aGlzLCBvdXJQcm9qKTtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBjYWxsYmFjayhudWxsLCB0aGlzKTtcbiAgfWVsc2V7XG4gICAgY2FsbGJhY2soc3JzQ29kZSk7XG4gIH1cbn1cblByb2plY3Rpb24ucHJvamVjdGlvbnMgPSBwcm9qZWN0aW9ucztcblByb2plY3Rpb24ucHJvamVjdGlvbnMuc3RhcnQoKTtcbm1vZHVsZS5leHBvcnRzID0gUHJvamVjdGlvbjtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY3JzLCBkZW5vcm0sIHBvaW50KSB7XG4gIHZhciB4aW4gPSBwb2ludC54LFxuICAgIHlpbiA9IHBvaW50LnksXG4gICAgemluID0gcG9pbnQueiB8fCAwLjA7XG4gIHZhciB2LCB0LCBpO1xuICBmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgaWYgKGRlbm9ybSAmJiBpID09PSAyICYmIHBvaW50LnogPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChpID09PSAwKSB7XG4gICAgICB2ID0geGluO1xuICAgICAgdCA9ICd4JztcbiAgICB9XG4gICAgZWxzZSBpZiAoaSA9PT0gMSkge1xuICAgICAgdiA9IHlpbjtcbiAgICAgIHQgPSAneSc7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdiA9IHppbjtcbiAgICAgIHQgPSAneic7XG4gICAgfVxuICAgIHN3aXRjaCAoY3JzLmF4aXNbaV0pIHtcbiAgICBjYXNlICdlJzpcbiAgICAgIHBvaW50W3RdID0gdjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3cnOlxuICAgICAgcG9pbnRbdF0gPSAtdjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ24nOlxuICAgICAgcG9pbnRbdF0gPSB2O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncyc6XG4gICAgICBwb2ludFt0XSA9IC12O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndSc6XG4gICAgICBpZiAocG9pbnRbdF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwb2ludC56ID0gdjtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2QnOlxuICAgICAgaWYgKHBvaW50W3RdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcG9pbnQueiA9IC12O1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vY29uc29sZS5sb2coXCJFUlJPUjogdW5rbm93IGF4aXMgKFwiK2Nycy5heGlzW2ldK1wiKSAtIGNoZWNrIGRlZmluaXRpb24gb2YgXCIrY3JzLnByb2pOYW1lKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcG9pbnQ7XG59O1xuIiwidmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgc2lnbiA9IHJlcXVpcmUoJy4vc2lnbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIChNYXRoLmFicyh4KSA8IEhBTEZfUEkpID8geCA6ICh4IC0gKHNpZ24oeCkgKiBNYXRoLlBJKSk7XG59OyIsInZhciBUV09fUEkgPSBNYXRoLlBJICogMjtcbi8vIFNQSSBpcyBzbGlnaHRseSBncmVhdGVyIHRoYW4gTWF0aC5QSSwgc28gdmFsdWVzIHRoYXQgZXhjZWVkIHRoZSAtMTgwLi4xODBcbi8vIGRlZ3JlZSByYW5nZSBieSBhIHRpbnkgYW1vdW50IGRvbid0IGdldCB3cmFwcGVkLiBUaGlzIHByZXZlbnRzIHBvaW50cyB0aGF0XG4vLyBoYXZlIGRyaWZ0ZWQgZnJvbSB0aGVpciBvcmlnaW5hbCBsb2NhdGlvbiBhbG9uZyB0aGUgMTgwdGggbWVyaWRpYW4gKGR1ZSB0b1xuLy8gZmxvYXRpbmcgcG9pbnQgZXJyb3IpIGZyb20gY2hhbmdpbmcgdGhlaXIgc2lnbi5cbnZhciBTUEkgPSAzLjE0MTU5MjY1MzU5O1xudmFyIHNpZ24gPSByZXF1aXJlKCcuL3NpZ24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoTWF0aC5hYnMoeCkgPD0gU1BJKSA/IHggOiAoeCAtIChzaWduKHgpICogVFdPX1BJKSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oeCkge1xuICBpZiAoTWF0aC5hYnMoeCkgPiAxKSB7XG4gICAgeCA9ICh4ID4gMSkgPyAxIDogLTE7XG4gIH1cbiAgcmV0dXJuIE1hdGguYXNpbih4KTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoMSAtIDAuMjUgKiB4ICogKDEgKyB4IC8gMTYgKiAoMyArIDEuMjUgKiB4KSkpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuICgwLjM3NSAqIHggKiAoMSArIDAuMjUgKiB4ICogKDEgKyAwLjQ2ODc1ICogeCkpKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoMC4wNTg1OTM3NSAqIHggKiB4ICogKDEgKyAwLjc1ICogeCkpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuICh4ICogeCAqIHggKiAoMzUgLyAzMDcyKSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYSwgZSwgc2lucGhpKSB7XG4gIHZhciB0ZW1wID0gZSAqIHNpbnBoaTtcbiAgcmV0dXJuIGEgLyBNYXRoLnNxcnQoMSAtIHRlbXAgKiB0ZW1wKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtbCwgZTAsIGUxLCBlMiwgZTMpIHtcbiAgdmFyIHBoaTtcbiAgdmFyIGRwaGk7XG5cbiAgcGhpID0gbWwgLyBlMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgZHBoaSA9IChtbCAtIChlMCAqIHBoaSAtIGUxICogTWF0aC5zaW4oMiAqIHBoaSkgKyBlMiAqIE1hdGguc2luKDQgKiBwaGkpIC0gZTMgKiBNYXRoLnNpbig2ICogcGhpKSkpIC8gKGUwIC0gMiAqIGUxICogTWF0aC5jb3MoMiAqIHBoaSkgKyA0ICogZTIgKiBNYXRoLmNvcyg0ICogcGhpKSAtIDYgKiBlMyAqIE1hdGguY29zKDYgKiBwaGkpKTtcbiAgICBwaGkgKz0gZHBoaTtcbiAgICBpZiAoTWF0aC5hYnMoZHBoaSkgPD0gMC4wMDAwMDAwMDAxKSB7XG4gICAgICByZXR1cm4gcGhpO1xuICAgIH1cbiAgfVxuXG4gIC8vLi5yZXBvcnRFcnJvcihcIklNTEZOLUNPTlY6TGF0aXR1ZGUgZmFpbGVkIHRvIGNvbnZlcmdlIGFmdGVyIDE1IGl0ZXJhdGlvbnNcIik7XG4gIHJldHVybiBOYU47XG59OyIsInZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVjY2VudCwgcSkge1xuICB2YXIgdGVtcCA9IDEgLSAoMSAtIGVjY2VudCAqIGVjY2VudCkgLyAoMiAqIGVjY2VudCkgKiBNYXRoLmxvZygoMSAtIGVjY2VudCkgLyAoMSArIGVjY2VudCkpO1xuICBpZiAoTWF0aC5hYnMoTWF0aC5hYnMocSkgLSB0ZW1wKSA8IDEuMEUtNikge1xuICAgIGlmIChxIDwgMCkge1xuICAgICAgcmV0dXJuICgtMSAqIEhBTEZfUEkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBIQUxGX1BJO1xuICAgIH1cbiAgfVxuICAvL3ZhciBwaGkgPSAwLjUqIHEvKDEtZWNjZW50KmVjY2VudCk7XG4gIHZhciBwaGkgPSBNYXRoLmFzaW4oMC41ICogcSk7XG4gIHZhciBkcGhpO1xuICB2YXIgc2luX3BoaTtcbiAgdmFyIGNvc19waGk7XG4gIHZhciBjb247XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzA7IGkrKykge1xuICAgIHNpbl9waGkgPSBNYXRoLnNpbihwaGkpO1xuICAgIGNvc19waGkgPSBNYXRoLmNvcyhwaGkpO1xuICAgIGNvbiA9IGVjY2VudCAqIHNpbl9waGk7XG4gICAgZHBoaSA9IE1hdGgucG93KDEgLSBjb24gKiBjb24sIDIpIC8gKDIgKiBjb3NfcGhpKSAqIChxIC8gKDEgLSBlY2NlbnQgKiBlY2NlbnQpIC0gc2luX3BoaSAvICgxIC0gY29uICogY29uKSArIDAuNSAvIGVjY2VudCAqIE1hdGgubG9nKCgxIC0gY29uKSAvICgxICsgY29uKSkpO1xuICAgIHBoaSArPSBkcGhpO1xuICAgIGlmIChNYXRoLmFicyhkcGhpKSA8PSAwLjAwMDAwMDAwMDEpIHtcbiAgICAgIHJldHVybiBwaGk7XG4gICAgfVxuICB9XG5cbiAgLy9jb25zb2xlLmxvZyhcIklRU0ZOLUNPTlY6TGF0aXR1ZGUgZmFpbGVkIHRvIGNvbnZlcmdlIGFmdGVyIDMwIGl0ZXJhdGlvbnNcIik7XG4gIHJldHVybiBOYU47XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZTAsIGUxLCBlMiwgZTMsIHBoaSkge1xuICByZXR1cm4gKGUwICogcGhpIC0gZTEgKiBNYXRoLnNpbigyICogcGhpKSArIGUyICogTWF0aC5zaW4oNCAqIHBoaSkgLSBlMyAqIE1hdGguc2luKDYgKiBwaGkpKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlY2NlbnQsIHNpbnBoaSwgY29zcGhpKSB7XG4gIHZhciBjb24gPSBlY2NlbnQgKiBzaW5waGk7XG4gIHJldHVybiBjb3NwaGkgLyAoTWF0aC5zcXJ0KDEgLSBjb24gKiBjb24pKTtcbn07IiwidmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVjY2VudCwgdHMpIHtcbiAgdmFyIGVjY250aCA9IDAuNSAqIGVjY2VudDtcbiAgdmFyIGNvbiwgZHBoaTtcbiAgdmFyIHBoaSA9IEhBTEZfUEkgLSAyICogTWF0aC5hdGFuKHRzKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPD0gMTU7IGkrKykge1xuICAgIGNvbiA9IGVjY2VudCAqIE1hdGguc2luKHBoaSk7XG4gICAgZHBoaSA9IEhBTEZfUEkgLSAyICogTWF0aC5hdGFuKHRzICogKE1hdGgucG93KCgoMSAtIGNvbikgLyAoMSArIGNvbikpLCBlY2NudGgpKSkgLSBwaGk7XG4gICAgcGhpICs9IGRwaGk7XG4gICAgaWYgKE1hdGguYWJzKGRwaGkpIDw9IDAuMDAwMDAwMDAwMSkge1xuICAgICAgcmV0dXJuIHBoaTtcbiAgICB9XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhcInBoaTJ6IGhhcyBOb0NvbnZlcmdlbmNlXCIpO1xuICByZXR1cm4gLTk5OTk7XG59OyIsInZhciBDMDAgPSAxO1xudmFyIEMwMiA9IDAuMjU7XG52YXIgQzA0ID0gMC4wNDY4NzU7XG52YXIgQzA2ID0gMC4wMTk1MzEyNTtcbnZhciBDMDggPSAwLjAxMDY4MTE1MjM0Mzc1O1xudmFyIEMyMiA9IDAuNzU7XG52YXIgQzQ0ID0gMC40Njg3NTtcbnZhciBDNDYgPSAwLjAxMzAyMDgzMzMzMzMzMzMzMzMzO1xudmFyIEM0OCA9IDAuMDA3MTIwNzY4MjI5MTY2NjY2NjY7XG52YXIgQzY2ID0gMC4zNjQ1ODMzMzMzMzMzMzMzMzMzMztcbnZhciBDNjggPSAwLjAwNTY5NjYxNDU4MzMzMzMzMzMzO1xudmFyIEM4OCA9IDAuMzA3NjE3MTg3NTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlcykge1xuICB2YXIgZW4gPSBbXTtcbiAgZW5bMF0gPSBDMDAgLSBlcyAqIChDMDIgKyBlcyAqIChDMDQgKyBlcyAqIChDMDYgKyBlcyAqIEMwOCkpKTtcbiAgZW5bMV0gPSBlcyAqIChDMjIgLSBlcyAqIChDMDQgKyBlcyAqIChDMDYgKyBlcyAqIEMwOCkpKTtcbiAgdmFyIHQgPSBlcyAqIGVzO1xuICBlblsyXSA9IHQgKiAoQzQ0IC0gZXMgKiAoQzQ2ICsgZXMgKiBDNDgpKTtcbiAgdCAqPSBlcztcbiAgZW5bM10gPSB0ICogKEM2NiAtIGVzICogQzY4KTtcbiAgZW5bNF0gPSB0ICogZXMgKiBDODg7XG4gIHJldHVybiBlbjtcbn07IiwidmFyIHBqX21sZm4gPSByZXF1aXJlKFwiLi9wal9tbGZuXCIpO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBNQVhfSVRFUiA9IDIwO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcmcsIGVzLCBlbikge1xuICB2YXIgayA9IDEgLyAoMSAtIGVzKTtcbiAgdmFyIHBoaSA9IGFyZztcbiAgZm9yICh2YXIgaSA9IE1BWF9JVEVSOyBpOyAtLWkpIHsgLyogcmFyZWx5IGdvZXMgb3ZlciAyIGl0ZXJhdGlvbnMgKi9cbiAgICB2YXIgcyA9IE1hdGguc2luKHBoaSk7XG4gICAgdmFyIHQgPSAxIC0gZXMgKiBzICogcztcbiAgICAvL3QgPSB0aGlzLnBqX21sZm4ocGhpLCBzLCBNYXRoLmNvcyhwaGkpLCBlbikgLSBhcmc7XG4gICAgLy9waGkgLT0gdCAqICh0ICogTWF0aC5zcXJ0KHQpKSAqIGs7XG4gICAgdCA9IChwal9tbGZuKHBoaSwgcywgTWF0aC5jb3MocGhpKSwgZW4pIC0gYXJnKSAqICh0ICogTWF0aC5zcXJ0KHQpKSAqIGs7XG4gICAgcGhpIC09IHQ7XG4gICAgaWYgKE1hdGguYWJzKHQpIDwgRVBTTE4pIHtcbiAgICAgIHJldHVybiBwaGk7XG4gICAgfVxuICB9XG4gIC8vLi5yZXBvcnRFcnJvcihcImNhc3M6cGpfaW52X21sZm46IENvbnZlcmdlbmNlIGVycm9yXCIpO1xuICByZXR1cm4gcGhpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHBoaSwgc3BoaSwgY3BoaSwgZW4pIHtcbiAgY3BoaSAqPSBzcGhpO1xuICBzcGhpICo9IHNwaGk7XG4gIHJldHVybiAoZW5bMF0gKiBwaGkgLSBjcGhpICogKGVuWzFdICsgc3BoaSAqIChlblsyXSArIHNwaGkgKiAoZW5bM10gKyBzcGhpICogZW5bNF0pKSkpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVjY2VudCwgc2lucGhpKSB7XG4gIHZhciBjb247XG4gIGlmIChlY2NlbnQgPiAxLjBlLTcpIHtcbiAgICBjb24gPSBlY2NlbnQgKiBzaW5waGk7XG4gICAgcmV0dXJuICgoMSAtIGVjY2VudCAqIGVjY2VudCkgKiAoc2lucGhpIC8gKDEgLSBjb24gKiBjb24pIC0gKDAuNSAvIGVjY2VudCkgKiBNYXRoLmxvZygoMSAtIGNvbikgLyAoMSArIGNvbikpKSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuICgyICogc2lucGhpKTtcbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHg8MCA/IC0xIDogMTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlc2lucCwgZXhwKSB7XG4gIHJldHVybiAoTWF0aC5wb3coKDEgLSBlc2lucCkgLyAoMSArIGVzaW5wKSwgZXhwKSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFycmF5KXtcbiAgdmFyIG91dCA9IHtcbiAgICB4OiBhcnJheVswXSxcbiAgICB5OiBhcnJheVsxXVxuICB9O1xuICBpZiAoYXJyYXkubGVuZ3RoPjIpIHtcbiAgICBvdXQueiA9IGFycmF5WzJdO1xuICB9XG4gIGlmIChhcnJheS5sZW5ndGg+Mykge1xuICAgIG91dC5tID0gYXJyYXlbM107XG4gIH1cbiAgcmV0dXJuIG91dDtcbn07IiwidmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWNjZW50LCBwaGksIHNpbnBoaSkge1xuICB2YXIgY29uID0gZWNjZW50ICogc2lucGhpO1xuICB2YXIgY29tID0gMC41ICogZWNjZW50O1xuICBjb24gPSBNYXRoLnBvdygoKDEgLSBjb24pIC8gKDEgKyBjb24pKSwgY29tKTtcbiAgcmV0dXJuIChNYXRoLnRhbigwLjUgKiAoSEFMRl9QSSAtIHBoaSkpIC8gY29uKTtcbn07IiwiZXhwb3J0cy53Z3M4NCA9IHtcbiAgdG93Z3M4NDogXCIwLDAsMFwiLFxuICBlbGxpcHNlOiBcIldHUzg0XCIsXG4gIGRhdHVtTmFtZTogXCJXR1M4NFwiXG59O1xuZXhwb3J0cy5jaDE5MDMgPSB7XG4gIHRvd2dzODQ6IFwiNjc0LjM3NCwxNS4wNTYsNDA1LjM0NlwiLFxuICBlbGxpcHNlOiBcImJlc3NlbFwiLFxuICBkYXR1bU5hbWU6IFwic3dpc3NcIlxufTtcbmV4cG9ydHMuZ2dyczg3ID0ge1xuICB0b3dnczg0OiBcIi0xOTkuODcsNzQuNzksMjQ2LjYyXCIsXG4gIGVsbGlwc2U6IFwiR1JTODBcIixcbiAgZGF0dW1OYW1lOiBcIkdyZWVrX0dlb2RldGljX1JlZmVyZW5jZV9TeXN0ZW1fMTk4N1wiXG59O1xuZXhwb3J0cy5uYWQ4MyA9IHtcbiAgdG93Z3M4NDogXCIwLDAsMFwiLFxuICBlbGxpcHNlOiBcIkdSUzgwXCIsXG4gIGRhdHVtTmFtZTogXCJOb3J0aF9BbWVyaWNhbl9EYXR1bV8xOTgzXCJcbn07XG5leHBvcnRzLm5hZDI3ID0ge1xuICBuYWRncmlkczogXCJAY29udXMsQGFsYXNrYSxAbnR2Ml8wLmdzYixAbnR2MV9jYW4uZGF0XCIsXG4gIGVsbGlwc2U6IFwiY2xyazY2XCIsXG4gIGRhdHVtTmFtZTogXCJOb3J0aF9BbWVyaWNhbl9EYXR1bV8xOTI3XCJcbn07XG5leHBvcnRzLnBvdHNkYW0gPSB7XG4gIHRvd2dzODQ6IFwiNjA2LjAsMjMuMCw0MTMuMFwiLFxuICBlbGxpcHNlOiBcImJlc3NlbFwiLFxuICBkYXR1bU5hbWU6IFwiUG90c2RhbSBSYXVlbmJlcmcgMTk1MCBESEROXCJcbn07XG5leHBvcnRzLmNhcnRoYWdlID0ge1xuICB0b3dnczg0OiBcIi0yNjMuMCw2LjAsNDMxLjBcIixcbiAgZWxsaXBzZTogXCJjbGFyazgwXCIsXG4gIGRhdHVtTmFtZTogXCJDYXJ0aGFnZSAxOTM0IFR1bmlzaWFcIlxufTtcbmV4cG9ydHMuaGVybWFubnNrb2dlbCA9IHtcbiAgdG93Z3M4NDogXCI2NTMuMCwtMjEyLjAsNDQ5LjBcIixcbiAgZWxsaXBzZTogXCJiZXNzZWxcIixcbiAgZGF0dW1OYW1lOiBcIkhlcm1hbm5za29nZWxcIlxufTtcbmV4cG9ydHMuaXJlNjUgPSB7XG4gIHRvd2dzODQ6IFwiNDgyLjUzMCwtMTMwLjU5Niw1NjQuNTU3LC0xLjA0MiwtMC4yMTQsLTAuNjMxLDguMTVcIixcbiAgZWxsaXBzZTogXCJtb2RfYWlyeVwiLFxuICBkYXR1bU5hbWU6IFwiSXJlbGFuZCAxOTY1XCJcbn07XG5leHBvcnRzLnJhc3NhZGlyYW4gPSB7XG4gIHRvd2dzODQ6IFwiLTEzMy42MywtMTU3LjUsLTE1OC42MlwiLFxuICBlbGxpcHNlOiBcImludGxcIixcbiAgZGF0dW1OYW1lOiBcIlJhc3NhZGlyYW5cIlxufTtcbmV4cG9ydHMubnpnZDQ5ID0ge1xuICB0b3dnczg0OiBcIjU5LjQ3LC01LjA0LDE4Ny40NCwwLjQ3LC0wLjEsMS4wMjQsLTQuNTk5M1wiLFxuICBlbGxpcHNlOiBcImludGxcIixcbiAgZGF0dW1OYW1lOiBcIk5ldyBaZWFsYW5kIEdlb2RldGljIERhdHVtIDE5NDlcIlxufTtcbmV4cG9ydHMub3NnYjM2ID0ge1xuICB0b3dnczg0OiBcIjQ0Ni40NDgsLTEyNS4xNTcsNTQyLjA2MCwwLjE1MDIsMC4yNDcwLDAuODQyMSwtMjAuNDg5NFwiLFxuICBlbGxpcHNlOiBcImFpcnlcIixcbiAgZGF0dW1OYW1lOiBcIkFpcnkgMTgzMFwiXG59O1xuZXhwb3J0cy5zX2p0c2sgPSB7XG4gIHRvd2dzODQ6IFwiNTg5LDc2LDQ4MFwiLFxuICBlbGxpcHNlOiAnYmVzc2VsJyxcbiAgZGF0dW1OYW1lOiAnUy1KVFNLIChGZXJybyknXG59O1xuZXhwb3J0cy5iZWR1YXJhbSA9IHtcbiAgdG93Z3M4NDogJy0xMDYsLTg3LDE4OCcsXG4gIGVsbGlwc2U6ICdjbHJrODAnLFxuICBkYXR1bU5hbWU6ICdCZWR1YXJhbSdcbn07XG5leHBvcnRzLmd1bnVuZ19zZWdhcmEgPSB7XG4gIHRvd2dzODQ6ICctNDAzLDY4NCw0MScsXG4gIGVsbGlwc2U6ICdiZXNzZWwnLFxuICBkYXR1bU5hbWU6ICdHdW51bmcgU2VnYXJhIEpha2FydGEnXG59O1xuZXhwb3J0cy5ybmI3MiA9IHtcbiAgdG93Z3M4NDogXCIxMDYuODY5LC01Mi4yOTc4LDEwMy43MjQsLTAuMzM2NTcsMC40NTY5NTUsLTEuODQyMTgsMVwiLFxuICBlbGxpcHNlOiBcImludGxcIixcbiAgZGF0dW1OYW1lOiBcIlJlc2VhdSBOYXRpb25hbCBCZWxnZSAxOTcyXCJcbn07IiwiZXhwb3J0cy5NRVJJVCA9IHtcbiAgYTogNjM3ODEzNy4wLFxuICByZjogMjk4LjI1NyxcbiAgZWxsaXBzZU5hbWU6IFwiTUVSSVQgMTk4M1wiXG59O1xuZXhwb3J0cy5TR1M4NSA9IHtcbiAgYTogNjM3ODEzNi4wLFxuICByZjogMjk4LjI1NyxcbiAgZWxsaXBzZU5hbWU6IFwiU292aWV0IEdlb2RldGljIFN5c3RlbSA4NVwiXG59O1xuZXhwb3J0cy5HUlM4MCA9IHtcbiAgYTogNjM3ODEzNy4wLFxuICByZjogMjk4LjI1NzIyMjEwMSxcbiAgZWxsaXBzZU5hbWU6IFwiR1JTIDE5ODAoSVVHRywgMTk4MClcIlxufTtcbmV4cG9ydHMuSUFVNzYgPSB7XG4gIGE6IDYzNzgxNDAuMCxcbiAgcmY6IDI5OC4yNTcsXG4gIGVsbGlwc2VOYW1lOiBcIklBVSAxOTc2XCJcbn07XG5leHBvcnRzLmFpcnkgPSB7XG4gIGE6IDYzNzc1NjMuMzk2LFxuICBiOiA2MzU2MjU2LjkxMCxcbiAgZWxsaXBzZU5hbWU6IFwiQWlyeSAxODMwXCJcbn07XG5leHBvcnRzLkFQTDQgPSB7XG4gIGE6IDYzNzgxMzcsXG4gIHJmOiAyOTguMjUsXG4gIGVsbGlwc2VOYW1lOiBcIkFwcGwuIFBoeXNpY3MuIDE5NjVcIlxufTtcbmV4cG9ydHMuTldMOUQgPSB7XG4gIGE6IDYzNzgxNDUuMCxcbiAgcmY6IDI5OC4yNSxcbiAgZWxsaXBzZU5hbWU6IFwiTmF2YWwgV2VhcG9ucyBMYWIuLCAxOTY1XCJcbn07XG5leHBvcnRzLm1vZF9haXJ5ID0ge1xuICBhOiA2Mzc3MzQwLjE4OSxcbiAgYjogNjM1NjAzNC40NDYsXG4gIGVsbGlwc2VOYW1lOiBcIk1vZGlmaWVkIEFpcnlcIlxufTtcbmV4cG9ydHMuYW5kcmFlID0ge1xuICBhOiA2Mzc3MTA0LjQzLFxuICByZjogMzAwLjAsXG4gIGVsbGlwc2VOYW1lOiBcIkFuZHJhZSAxODc2IChEZW4uLCBJY2xuZC4pXCJcbn07XG5leHBvcnRzLmF1c3RfU0EgPSB7XG4gIGE6IDYzNzgxNjAuMCxcbiAgcmY6IDI5OC4yNSxcbiAgZWxsaXBzZU5hbWU6IFwiQXVzdHJhbGlhbiBOYXRsICYgUy4gQW1lci4gMTk2OVwiXG59O1xuZXhwb3J0cy5HUlM2NyA9IHtcbiAgYTogNjM3ODE2MC4wLFxuICByZjogMjk4LjI0NzE2NzQyNzAsXG4gIGVsbGlwc2VOYW1lOiBcIkdSUyA2NyhJVUdHIDE5NjcpXCJcbn07XG5leHBvcnRzLmJlc3NlbCA9IHtcbiAgYTogNjM3NzM5Ny4xNTUsXG4gIHJmOiAyOTkuMTUyODEyOCxcbiAgZWxsaXBzZU5hbWU6IFwiQmVzc2VsIDE4NDFcIlxufTtcbmV4cG9ydHMuYmVzc19uYW0gPSB7XG4gIGE6IDYzNzc0ODMuODY1LFxuICByZjogMjk5LjE1MjgxMjgsXG4gIGVsbGlwc2VOYW1lOiBcIkJlc3NlbCAxODQxIChOYW1pYmlhKVwiXG59O1xuZXhwb3J0cy5jbHJrNjYgPSB7XG4gIGE6IDYzNzgyMDYuNCxcbiAgYjogNjM1NjU4My44LFxuICBlbGxpcHNlTmFtZTogXCJDbGFya2UgMTg2NlwiXG59O1xuZXhwb3J0cy5jbHJrODAgPSB7XG4gIGE6IDYzNzgyNDkuMTQ1LFxuICByZjogMjkzLjQ2NjMsXG4gIGVsbGlwc2VOYW1lOiBcIkNsYXJrZSAxODgwIG1vZC5cIlxufTtcbmV4cG9ydHMuY2xyazU4ID0ge1xuICBhOiA2Mzc4MjkzLjY0NTIwODc1OSxcbiAgcmY6IDI5NC4yNjA2NzYzNjkyNjU0LFxuICBlbGxpcHNlTmFtZTogXCJDbGFya2UgMTg1OFwiXG59O1xuZXhwb3J0cy5DUE0gPSB7XG4gIGE6IDYzNzU3MzguNyxcbiAgcmY6IDMzNC4yOSxcbiAgZWxsaXBzZU5hbWU6IFwiQ29tbS4gZGVzIFBvaWRzIGV0IE1lc3VyZXMgMTc5OVwiXG59O1xuZXhwb3J0cy5kZWxtYnIgPSB7XG4gIGE6IDYzNzY0MjguMCxcbiAgcmY6IDMxMS41LFxuICBlbGxpcHNlTmFtZTogXCJEZWxhbWJyZSAxODEwIChCZWxnaXVtKVwiXG59O1xuZXhwb3J0cy5lbmdlbGlzID0ge1xuICBhOiA2Mzc4MTM2LjA1LFxuICByZjogMjk4LjI1NjYsXG4gIGVsbGlwc2VOYW1lOiBcIkVuZ2VsaXMgMTk4NVwiXG59O1xuZXhwb3J0cy5ldnJzdDMwID0ge1xuICBhOiA2Mzc3Mjc2LjM0NSxcbiAgcmY6IDMwMC44MDE3LFxuICBlbGxpcHNlTmFtZTogXCJFdmVyZXN0IDE4MzBcIlxufTtcbmV4cG9ydHMuZXZyc3Q0OCA9IHtcbiAgYTogNjM3NzMwNC4wNjMsXG4gIHJmOiAzMDAuODAxNyxcbiAgZWxsaXBzZU5hbWU6IFwiRXZlcmVzdCAxOTQ4XCJcbn07XG5leHBvcnRzLmV2cnN0NTYgPSB7XG4gIGE6IDYzNzczMDEuMjQzLFxuICByZjogMzAwLjgwMTcsXG4gIGVsbGlwc2VOYW1lOiBcIkV2ZXJlc3QgMTk1NlwiXG59O1xuZXhwb3J0cy5ldnJzdDY5ID0ge1xuICBhOiA2Mzc3Mjk1LjY2NCxcbiAgcmY6IDMwMC44MDE3LFxuICBlbGxpcHNlTmFtZTogXCJFdmVyZXN0IDE5NjlcIlxufTtcbmV4cG9ydHMuZXZyc3RTUyA9IHtcbiAgYTogNjM3NzI5OC41NTYsXG4gIHJmOiAzMDAuODAxNyxcbiAgZWxsaXBzZU5hbWU6IFwiRXZlcmVzdCAoU2FiYWggJiBTYXJhd2FrKVwiXG59O1xuZXhwb3J0cy5mc2NocjYwID0ge1xuICBhOiA2Mzc4MTY2LjAsXG4gIHJmOiAyOTguMyxcbiAgZWxsaXBzZU5hbWU6IFwiRmlzY2hlciAoTWVyY3VyeSBEYXR1bSkgMTk2MFwiXG59O1xuZXhwb3J0cy5mc2NocjYwbSA9IHtcbiAgYTogNjM3ODE1NS4wLFxuICByZjogMjk4LjMsXG4gIGVsbGlwc2VOYW1lOiBcIkZpc2NoZXIgMTk2MFwiXG59O1xuZXhwb3J0cy5mc2NocjY4ID0ge1xuICBhOiA2Mzc4MTUwLjAsXG4gIHJmOiAyOTguMyxcbiAgZWxsaXBzZU5hbWU6IFwiRmlzY2hlciAxOTY4XCJcbn07XG5leHBvcnRzLmhlbG1lcnQgPSB7XG4gIGE6IDYzNzgyMDAuMCxcbiAgcmY6IDI5OC4zLFxuICBlbGxpcHNlTmFtZTogXCJIZWxtZXJ0IDE5MDZcIlxufTtcbmV4cG9ydHMuaG91Z2ggPSB7XG4gIGE6IDYzNzgyNzAuMCxcbiAgcmY6IDI5Ny4wLFxuICBlbGxpcHNlTmFtZTogXCJIb3VnaFwiXG59O1xuZXhwb3J0cy5pbnRsID0ge1xuICBhOiA2Mzc4Mzg4LjAsXG4gIHJmOiAyOTcuMCxcbiAgZWxsaXBzZU5hbWU6IFwiSW50ZXJuYXRpb25hbCAxOTA5IChIYXlmb3JkKVwiXG59O1xuZXhwb3J0cy5rYXVsYSA9IHtcbiAgYTogNjM3ODE2My4wLFxuICByZjogMjk4LjI0LFxuICBlbGxpcHNlTmFtZTogXCJLYXVsYSAxOTYxXCJcbn07XG5leHBvcnRzLmxlcmNoID0ge1xuICBhOiA2Mzc4MTM5LjAsXG4gIHJmOiAyOTguMjU3LFxuICBlbGxpcHNlTmFtZTogXCJMZXJjaCAxOTc5XCJcbn07XG5leHBvcnRzLm1wcnRzID0ge1xuICBhOiA2Mzk3MzAwLjAsXG4gIHJmOiAxOTEuMCxcbiAgZWxsaXBzZU5hbWU6IFwiTWF1cGVydGl1cyAxNzM4XCJcbn07XG5leHBvcnRzLm5ld19pbnRsID0ge1xuICBhOiA2Mzc4MTU3LjUsXG4gIGI6IDYzNTY3NzIuMixcbiAgZWxsaXBzZU5hbWU6IFwiTmV3IEludGVybmF0aW9uYWwgMTk2N1wiXG59O1xuZXhwb3J0cy5wbGVzc2lzID0ge1xuICBhOiA2Mzc2NTIzLjAsXG4gIHJmOiA2MzU1ODYzLjAsXG4gIGVsbGlwc2VOYW1lOiBcIlBsZXNzaXMgMTgxNyAoRnJhbmNlKVwiXG59O1xuZXhwb3J0cy5rcmFzcyA9IHtcbiAgYTogNjM3ODI0NS4wLFxuICByZjogMjk4LjMsXG4gIGVsbGlwc2VOYW1lOiBcIktyYXNzb3Zza3ksIDE5NDJcIlxufTtcbmV4cG9ydHMuU0Vhc2lhID0ge1xuICBhOiA2Mzc4MTU1LjAsXG4gIGI6IDYzNTY3NzMuMzIwNSxcbiAgZWxsaXBzZU5hbWU6IFwiU291dGhlYXN0IEFzaWFcIlxufTtcbmV4cG9ydHMud2FsYmVjayA9IHtcbiAgYTogNjM3Njg5Ni4wLFxuICBiOiA2MzU1ODM0Ljg0NjcsXG4gIGVsbGlwc2VOYW1lOiBcIldhbGJlY2tcIlxufTtcbmV4cG9ydHMuV0dTNjAgPSB7XG4gIGE6IDYzNzgxNjUuMCxcbiAgcmY6IDI5OC4zLFxuICBlbGxpcHNlTmFtZTogXCJXR1MgNjBcIlxufTtcbmV4cG9ydHMuV0dTNjYgPSB7XG4gIGE6IDYzNzgxNDUuMCxcbiAgcmY6IDI5OC4yNSxcbiAgZWxsaXBzZU5hbWU6IFwiV0dTIDY2XCJcbn07XG5leHBvcnRzLldHUzcgPSB7XG4gIGE6IDYzNzgxMzUuMCxcbiAgcmY6IDI5OC4yNixcbiAgZWxsaXBzZU5hbWU6IFwiV0dTIDcyXCJcbn07XG5leHBvcnRzLldHUzg0ID0ge1xuICBhOiA2Mzc4MTM3LjAsXG4gIHJmOiAyOTguMjU3MjIzNTYzLFxuICBlbGxpcHNlTmFtZTogXCJXR1MgODRcIlxufTtcbmV4cG9ydHMuc3BoZXJlID0ge1xuICBhOiA2MzcwOTk3LjAsXG4gIGI6IDYzNzA5OTcuMCxcbiAgZWxsaXBzZU5hbWU6IFwiTm9ybWFsIFNwaGVyZSAocj02MzcwOTk3KVwiXG59OyIsImV4cG9ydHMuZ3JlZW53aWNoID0gMC4wOyAvL1wiMGRFXCIsXG5leHBvcnRzLmxpc2JvbiA9IC05LjEzMTkwNjExMTExMTsgLy9cIjlkMDcnNTQuODYyXFxcIldcIixcbmV4cG9ydHMucGFyaXMgPSAyLjMzNzIyOTE2NjY2NzsgLy9cIjJkMjAnMTQuMDI1XFxcIkVcIixcbmV4cG9ydHMuYm9nb3RhID0gLTc0LjA4MDkxNjY2NjY2NzsgLy9cIjc0ZDA0JzUxLjNcXFwiV1wiLFxuZXhwb3J0cy5tYWRyaWQgPSAtMy42ODc5Mzg4ODg4ODk7IC8vXCIzZDQxJzE2LjU4XFxcIldcIixcbmV4cG9ydHMucm9tZSA9IDEyLjQ1MjMzMzMzMzMzMzsgLy9cIjEyZDI3JzguNFxcXCJFXCIsXG5leHBvcnRzLmJlcm4gPSA3LjQzOTU4MzMzMzMzMzsgLy9cIjdkMjYnMjIuNVxcXCJFXCIsXG5leHBvcnRzLmpha2FydGEgPSAxMDYuODA3NzE5NDQ0NDQ0OyAvL1wiMTA2ZDQ4JzI3Ljc5XFxcIkVcIixcbmV4cG9ydHMuZmVycm8gPSAtMTcuNjY2NjY2NjY2NjY3OyAvL1wiMTdkNDAnV1wiLFxuZXhwb3J0cy5icnVzc2VscyA9IDQuMzY3OTc1OyAvL1wiNGQyMic0LjcxXFxcIkVcIixcbmV4cG9ydHMuc3RvY2tob2xtID0gMTguMDU4Mjc3Nzc3Nzc4OyAvL1wiMThkMycyOS44XFxcIkVcIixcbmV4cG9ydHMuYXRoZW5zID0gMjMuNzE2MzM3NTsgLy9cIjIzZDQyJzU4LjgxNVxcXCJFXCIsXG5leHBvcnRzLm9zbG8gPSAxMC43MjI5MTY2NjY2Njc7IC8vXCIxMGQ0MycyMi41XFxcIkVcIiIsImV4cG9ydHMuZnQgPSB7dG9fbWV0ZXI6IDAuMzA0OH07XG5leHBvcnRzWyd1cy1mdCddID0ge3RvX21ldGVyOiAxMjAwIC8gMzkzN307XG4iLCJ2YXIgcHJvaiA9IHJlcXVpcmUoJy4vUHJvaicpO1xudmFyIHRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtJyk7XG52YXIgd2dzODQgPSBwcm9qKCdXR1M4NCcpO1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1lcihmcm9tLCB0bywgY29vcmRzKSB7XG4gIHZhciB0cmFuc2Zvcm1lZEFycmF5O1xuICBpZiAoQXJyYXkuaXNBcnJheShjb29yZHMpKSB7XG4gICAgdHJhbnNmb3JtZWRBcnJheSA9IHRyYW5zZm9ybShmcm9tLCB0bywgY29vcmRzKTtcbiAgICBpZiAoY29vcmRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgcmV0dXJuIFt0cmFuc2Zvcm1lZEFycmF5LngsIHRyYW5zZm9ybWVkQXJyYXkueSwgdHJhbnNmb3JtZWRBcnJheS56XTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gW3RyYW5zZm9ybWVkQXJyYXkueCwgdHJhbnNmb3JtZWRBcnJheS55XTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIHRyYW5zZm9ybShmcm9tLCB0bywgY29vcmRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1Byb2ooaXRlbSkge1xuICBpZiAoaXRlbSBpbnN0YW5jZW9mIHByb2opIHtcbiAgICByZXR1cm4gaXRlbTtcbiAgfVxuICBpZiAoaXRlbS5vUHJvaikge1xuICAgIHJldHVybiBpdGVtLm9Qcm9qO1xuICB9XG4gIHJldHVybiBwcm9qKGl0ZW0pO1xufVxuZnVuY3Rpb24gcHJvajQoZnJvbVByb2osIHRvUHJvaiwgY29vcmQpIHtcbiAgZnJvbVByb2ogPSBjaGVja1Byb2ooZnJvbVByb2opO1xuICB2YXIgc2luZ2xlID0gZmFsc2U7XG4gIHZhciBvYmo7XG4gIGlmICh0eXBlb2YgdG9Qcm9qID09PSAndW5kZWZpbmVkJykge1xuICAgIHRvUHJvaiA9IGZyb21Qcm9qO1xuICAgIGZyb21Qcm9qID0gd2dzODQ7XG4gICAgc2luZ2xlID0gdHJ1ZTtcbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgdG9Qcm9qLnggIT09ICd1bmRlZmluZWQnIHx8IEFycmF5LmlzQXJyYXkodG9Qcm9qKSkge1xuICAgIGNvb3JkID0gdG9Qcm9qO1xuICAgIHRvUHJvaiA9IGZyb21Qcm9qO1xuICAgIGZyb21Qcm9qID0gd2dzODQ7XG4gICAgc2luZ2xlID0gdHJ1ZTtcbiAgfVxuICB0b1Byb2ogPSBjaGVja1Byb2oodG9Qcm9qKTtcbiAgaWYgKGNvb3JkKSB7XG4gICAgcmV0dXJuIHRyYW5zZm9ybWVyKGZyb21Qcm9qLCB0b1Byb2osIGNvb3JkKTtcbiAgfVxuICBlbHNlIHtcbiAgICBvYmogPSB7XG4gICAgICBmb3J3YXJkOiBmdW5jdGlvbihjb29yZHMpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVyKGZyb21Qcm9qLCB0b1Byb2osIGNvb3Jkcyk7XG4gICAgICB9LFxuICAgICAgaW52ZXJzZTogZnVuY3Rpb24oY29vcmRzKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1lcih0b1Byb2osIGZyb21Qcm9qLCBjb29yZHMpO1xuICAgICAgfVxuICAgIH07XG4gICAgaWYgKHNpbmdsZSkge1xuICAgICAgb2JqLm9Qcm9qID0gdG9Qcm9qO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHByb2o0OyIsInZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIFBKRF8zUEFSQU0gPSAxO1xudmFyIFBKRF83UEFSQU0gPSAyO1xudmFyIFBKRF9HUklEU0hJRlQgPSAzO1xudmFyIFBKRF9XR1M4NCA9IDQ7IC8vIFdHUzg0IG9yIGVxdWl2YWxlbnRcbnZhciBQSkRfTk9EQVRVTSA9IDU7IC8vIFdHUzg0IG9yIGVxdWl2YWxlbnRcbnZhciBTRUNfVE9fUkFEID0gNC44NDgxMzY4MTEwOTUzNTk5MzU4OTkxNDEwMjM1N2UtNjtcbnZhciBBRF9DID0gMS4wMDI2MDAwO1xudmFyIENPU182N1A1ID0gMC4zODI2ODM0MzIzNjUwODk3NztcbnZhciBkYXR1bSA9IGZ1bmN0aW9uKHByb2opIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGRhdHVtKSkge1xuICAgIHJldHVybiBuZXcgZGF0dW0ocHJvaik7XG4gIH1cbiAgdGhpcy5kYXR1bV90eXBlID0gUEpEX1dHUzg0OyAvL2RlZmF1bHQgc2V0dGluZ1xuICBpZiAoIXByb2opIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHByb2ouZGF0dW1Db2RlICYmIHByb2ouZGF0dW1Db2RlID09PSAnbm9uZScpIHtcbiAgICB0aGlzLmRhdHVtX3R5cGUgPSBQSkRfTk9EQVRVTTtcbiAgfVxuICBpZiAocHJvai5kYXR1bV9wYXJhbXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb2ouZGF0dW1fcGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBwcm9qLmRhdHVtX3BhcmFtc1tpXSA9IHBhcnNlRmxvYXQocHJvai5kYXR1bV9wYXJhbXNbaV0pO1xuICAgIH1cbiAgICBpZiAocHJvai5kYXR1bV9wYXJhbXNbMF0gIT09IDAgfHwgcHJvai5kYXR1bV9wYXJhbXNbMV0gIT09IDAgfHwgcHJvai5kYXR1bV9wYXJhbXNbMl0gIT09IDApIHtcbiAgICAgIHRoaXMuZGF0dW1fdHlwZSA9IFBKRF8zUEFSQU07XG4gICAgfVxuICAgIGlmIChwcm9qLmRhdHVtX3BhcmFtcy5sZW5ndGggPiAzKSB7XG4gICAgICBpZiAocHJvai5kYXR1bV9wYXJhbXNbM10gIT09IDAgfHwgcHJvai5kYXR1bV9wYXJhbXNbNF0gIT09IDAgfHwgcHJvai5kYXR1bV9wYXJhbXNbNV0gIT09IDAgfHwgcHJvai5kYXR1bV9wYXJhbXNbNl0gIT09IDApIHtcbiAgICAgICAgdGhpcy5kYXR1bV90eXBlID0gUEpEXzdQQVJBTTtcbiAgICAgICAgcHJvai5kYXR1bV9wYXJhbXNbM10gKj0gU0VDX1RPX1JBRDtcbiAgICAgICAgcHJvai5kYXR1bV9wYXJhbXNbNF0gKj0gU0VDX1RPX1JBRDtcbiAgICAgICAgcHJvai5kYXR1bV9wYXJhbXNbNV0gKj0gU0VDX1RPX1JBRDtcbiAgICAgICAgcHJvai5kYXR1bV9wYXJhbXNbNl0gPSAocHJvai5kYXR1bV9wYXJhbXNbNl0gLyAxMDAwMDAwLjApICsgMS4wO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBER1IgMjAxMS0wMy0yMSA6IG5hZGdyaWRzIHN1cHBvcnRcbiAgdGhpcy5kYXR1bV90eXBlID0gcHJvai5ncmlkcyA/IFBKRF9HUklEU0hJRlQgOiB0aGlzLmRhdHVtX3R5cGU7XG5cbiAgdGhpcy5hID0gcHJvai5hOyAvL2RhdHVtIG9iamVjdCBhbHNvIHVzZXMgdGhlc2UgdmFsdWVzXG4gIHRoaXMuYiA9IHByb2ouYjtcbiAgdGhpcy5lcyA9IHByb2ouZXM7XG4gIHRoaXMuZXAyID0gcHJvai5lcDI7XG4gIHRoaXMuZGF0dW1fcGFyYW1zID0gcHJvai5kYXR1bV9wYXJhbXM7XG4gIGlmICh0aGlzLmRhdHVtX3R5cGUgPT09IFBKRF9HUklEU0hJRlQpIHtcbiAgICB0aGlzLmdyaWRzID0gcHJvai5ncmlkcztcbiAgfVxufTtcbmRhdHVtLnByb3RvdHlwZSA9IHtcblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAvLyBjc19jb21wYXJlX2RhdHVtcygpXG4gIC8vICAgUmV0dXJucyBUUlVFIGlmIHRoZSB0d28gZGF0dW1zIG1hdGNoLCBvdGhlcndpc2UgRkFMU0UuXG4gIGNvbXBhcmVfZGF0dW1zOiBmdW5jdGlvbihkZXN0KSB7XG4gICAgaWYgKHRoaXMuZGF0dW1fdHlwZSAhPT0gZGVzdC5kYXR1bV90eXBlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIGZhbHNlLCBkYXR1bXMgYXJlIG5vdCBlcXVhbFxuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmEgIT09IGRlc3QuYSB8fCBNYXRoLmFicyh0aGlzLmVzIC0gZGVzdC5lcykgPiAwLjAwMDAwMDAwMDA1MCkge1xuICAgICAgLy8gdGhlIHRvbGVyZW5jZSBmb3IgZXMgaXMgdG8gZW5zdXJlIHRoYXQgR1JTODAgYW5kIFdHUzg0XG4gICAgICAvLyBhcmUgY29uc2lkZXJlZCBpZGVudGljYWxcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5kYXR1bV90eXBlID09PSBQSkRfM1BBUkFNKSB7XG4gICAgICByZXR1cm4gKHRoaXMuZGF0dW1fcGFyYW1zWzBdID09PSBkZXN0LmRhdHVtX3BhcmFtc1swXSAmJiB0aGlzLmRhdHVtX3BhcmFtc1sxXSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbMV0gJiYgdGhpcy5kYXR1bV9wYXJhbXNbMl0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzJdKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5kYXR1bV90eXBlID09PSBQSkRfN1BBUkFNKSB7XG4gICAgICByZXR1cm4gKHRoaXMuZGF0dW1fcGFyYW1zWzBdID09PSBkZXN0LmRhdHVtX3BhcmFtc1swXSAmJiB0aGlzLmRhdHVtX3BhcmFtc1sxXSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbMV0gJiYgdGhpcy5kYXR1bV9wYXJhbXNbMl0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzJdICYmIHRoaXMuZGF0dW1fcGFyYW1zWzNdID09PSBkZXN0LmRhdHVtX3BhcmFtc1szXSAmJiB0aGlzLmRhdHVtX3BhcmFtc1s0XSA9PT0gZGVzdC5kYXR1bV9wYXJhbXNbNF0gJiYgdGhpcy5kYXR1bV9wYXJhbXNbNV0gPT09IGRlc3QuZGF0dW1fcGFyYW1zWzVdICYmIHRoaXMuZGF0dW1fcGFyYW1zWzZdID09PSBkZXN0LmRhdHVtX3BhcmFtc1s2XSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZGF0dW1fdHlwZSA9PT0gUEpEX0dSSURTSElGVCB8fCBkZXN0LmRhdHVtX3R5cGUgPT09IFBKRF9HUklEU0hJRlQpIHtcbiAgICAgIC8vYWxlcnQoXCJFUlJPUjogR3JpZCBzaGlmdCB0cmFuc2Zvcm1hdGlvbnMgYXJlIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgICAvL3JldHVybiBmYWxzZVxuICAgICAgLy9ER1IgMjAxMi0wNy0yOSBsYXp5IC4uLlxuICAgICAgcmV0dXJuIHRoaXMubmFkZ3JpZHMgPT09IGRlc3QubmFkZ3JpZHM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7IC8vIGRhdHVtcyBhcmUgZXF1YWxcbiAgICB9XG4gIH0sIC8vIGNzX2NvbXBhcmVfZGF0dW1zKClcblxuICAvKlxuICAgKiBUaGUgZnVuY3Rpb24gQ29udmVydF9HZW9kZXRpY19Ub19HZW9jZW50cmljIGNvbnZlcnRzIGdlb2RldGljIGNvb3JkaW5hdGVzXG4gICAqIChsYXRpdHVkZSwgbG9uZ2l0dWRlLCBhbmQgaGVpZ2h0KSB0byBnZW9jZW50cmljIGNvb3JkaW5hdGVzIChYLCBZLCBaKSxcbiAgICogYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGVsbGlwc29pZCBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiAgICBMYXRpdHVkZSAgOiBHZW9kZXRpYyBsYXRpdHVkZSBpbiByYWRpYW5zICAgICAgICAgICAgICAgICAgICAgKGlucHV0KVxuICAgKiAgICBMb25naXR1ZGUgOiBHZW9kZXRpYyBsb25naXR1ZGUgaW4gcmFkaWFucyAgICAgICAgICAgICAgICAgICAgKGlucHV0KVxuICAgKiAgICBIZWlnaHQgICAgOiBHZW9kZXRpYyBoZWlnaHQsIGluIG1ldGVycyAgICAgICAgICAgICAgICAgICAgICAgKGlucHV0KVxuICAgKiAgICBYICAgICAgICAgOiBDYWxjdWxhdGVkIEdlb2NlbnRyaWMgWCBjb29yZGluYXRlLCBpbiBtZXRlcnMgICAgKG91dHB1dClcbiAgICogICAgWSAgICAgICAgIDogQ2FsY3VsYXRlZCBHZW9jZW50cmljIFkgY29vcmRpbmF0ZSwgaW4gbWV0ZXJzICAgIChvdXRwdXQpXG4gICAqICAgIFogICAgICAgICA6IENhbGN1bGF0ZWQgR2VvY2VudHJpYyBaIGNvb3JkaW5hdGUsIGluIG1ldGVycyAgICAob3V0cHV0KVxuICAgKlxuICAgKi9cbiAgZ2VvZGV0aWNfdG9fZ2VvY2VudHJpYzogZnVuY3Rpb24ocCkge1xuICAgIHZhciBMb25naXR1ZGUgPSBwLng7XG4gICAgdmFyIExhdGl0dWRlID0gcC55O1xuICAgIHZhciBIZWlnaHQgPSBwLnogPyBwLnogOiAwOyAvL1ogdmFsdWUgbm90IGFsd2F5cyBzdXBwbGllZFxuICAgIHZhciBYOyAvLyBvdXRwdXRcbiAgICB2YXIgWTtcbiAgICB2YXIgWjtcblxuICAgIHZhciBFcnJvcl9Db2RlID0gMDsgLy8gIEdFT0NFTlRfTk9fRVJST1I7XG4gICAgdmFyIFJuOyAvKiAgRWFydGggcmFkaXVzIGF0IGxvY2F0aW9uICAqL1xuICAgIHZhciBTaW5fTGF0OyAvKiAgTWF0aC5zaW4oTGF0aXR1ZGUpICAqL1xuICAgIHZhciBTaW4yX0xhdDsgLyogIFNxdWFyZSBvZiBNYXRoLnNpbihMYXRpdHVkZSkgICovXG4gICAgdmFyIENvc19MYXQ7IC8qICBNYXRoLmNvcyhMYXRpdHVkZSkgICovXG5cbiAgICAvKlxuICAgICAqKiBEb24ndCBibG93IHVwIGlmIExhdGl0dWRlIGlzIGp1c3QgYSBsaXR0bGUgb3V0IG9mIHRoZSB2YWx1ZVxuICAgICAqKiByYW5nZSBhcyBpdCBtYXkganVzdCBiZSBhIHJvdW5kaW5nIGlzc3VlLiAgQWxzbyByZW1vdmVkIGxvbmdpdHVkZVxuICAgICAqKiB0ZXN0LCBpdCBzaG91bGQgYmUgd3JhcHBlZCBieSBNYXRoLmNvcygpIGFuZCBNYXRoLnNpbigpLiAgTkZXIGZvciBQUk9KLjQsIFNlcC8yMDAxLlxuICAgICAqL1xuICAgIGlmIChMYXRpdHVkZSA8IC1IQUxGX1BJICYmIExhdGl0dWRlID4gLTEuMDAxICogSEFMRl9QSSkge1xuICAgICAgTGF0aXR1ZGUgPSAtSEFMRl9QSTtcbiAgICB9XG4gICAgZWxzZSBpZiAoTGF0aXR1ZGUgPiBIQUxGX1BJICYmIExhdGl0dWRlIDwgMS4wMDEgKiBIQUxGX1BJKSB7XG4gICAgICBMYXRpdHVkZSA9IEhBTEZfUEk7XG4gICAgfVxuICAgIGVsc2UgaWYgKChMYXRpdHVkZSA8IC1IQUxGX1BJKSB8fCAoTGF0aXR1ZGUgPiBIQUxGX1BJKSkge1xuICAgICAgLyogTGF0aXR1ZGUgb3V0IG9mIHJhbmdlICovXG4gICAgICAvLy4ucmVwb3J0RXJyb3IoJ2dlb2NlbnQ6bGF0IG91dCBvZiByYW5nZTonICsgTGF0aXR1ZGUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKExvbmdpdHVkZSA+IE1hdGguUEkpIHtcbiAgICAgIExvbmdpdHVkZSAtPSAoMiAqIE1hdGguUEkpO1xuICAgIH1cbiAgICBTaW5fTGF0ID0gTWF0aC5zaW4oTGF0aXR1ZGUpO1xuICAgIENvc19MYXQgPSBNYXRoLmNvcyhMYXRpdHVkZSk7XG4gICAgU2luMl9MYXQgPSBTaW5fTGF0ICogU2luX0xhdDtcbiAgICBSbiA9IHRoaXMuYSAvIChNYXRoLnNxcnQoMS4wZTAgLSB0aGlzLmVzICogU2luMl9MYXQpKTtcbiAgICBYID0gKFJuICsgSGVpZ2h0KSAqIENvc19MYXQgKiBNYXRoLmNvcyhMb25naXR1ZGUpO1xuICAgIFkgPSAoUm4gKyBIZWlnaHQpICogQ29zX0xhdCAqIE1hdGguc2luKExvbmdpdHVkZSk7XG4gICAgWiA9ICgoUm4gKiAoMSAtIHRoaXMuZXMpKSArIEhlaWdodCkgKiBTaW5fTGF0O1xuXG4gICAgcC54ID0gWDtcbiAgICBwLnkgPSBZO1xuICAgIHAueiA9IFo7XG4gICAgcmV0dXJuIEVycm9yX0NvZGU7XG4gIH0sIC8vIGNzX2dlb2RldGljX3RvX2dlb2NlbnRyaWMoKVxuXG5cbiAgZ2VvY2VudHJpY190b19nZW9kZXRpYzogZnVuY3Rpb24ocCkge1xuICAgIC8qIGxvY2FsIGRlZmludGlvbnMgYW5kIHZhcmlhYmxlcyAqL1xuICAgIC8qIGVuZC1jcml0ZXJpdW0gb2YgbG9vcCwgYWNjdXJhY3kgb2Ygc2luKExhdGl0dWRlKSAqL1xuICAgIHZhciBnZW5hdSA9IDFlLTEyO1xuICAgIHZhciBnZW5hdTIgPSAoZ2VuYXUgKiBnZW5hdSk7XG4gICAgdmFyIG1heGl0ZXIgPSAzMDtcblxuICAgIHZhciBQOyAvKiBkaXN0YW5jZSBiZXR3ZWVuIHNlbWktbWlub3IgYXhpcyBhbmQgbG9jYXRpb24gKi9cbiAgICB2YXIgUlI7IC8qIGRpc3RhbmNlIGJldHdlZW4gY2VudGVyIGFuZCBsb2NhdGlvbiAqL1xuICAgIHZhciBDVDsgLyogc2luIG9mIGdlb2NlbnRyaWMgbGF0aXR1ZGUgKi9cbiAgICB2YXIgU1Q7IC8qIGNvcyBvZiBnZW9jZW50cmljIGxhdGl0dWRlICovXG4gICAgdmFyIFJYO1xuICAgIHZhciBSSztcbiAgICB2YXIgUk47IC8qIEVhcnRoIHJhZGl1cyBhdCBsb2NhdGlvbiAqL1xuICAgIHZhciBDUEhJMDsgLyogY29zIG9mIHN0YXJ0IG9yIG9sZCBnZW9kZXRpYyBsYXRpdHVkZSBpbiBpdGVyYXRpb25zICovXG4gICAgdmFyIFNQSEkwOyAvKiBzaW4gb2Ygc3RhcnQgb3Igb2xkIGdlb2RldGljIGxhdGl0dWRlIGluIGl0ZXJhdGlvbnMgKi9cbiAgICB2YXIgQ1BISTsgLyogY29zIG9mIHNlYXJjaGVkIGdlb2RldGljIGxhdGl0dWRlICovXG4gICAgdmFyIFNQSEk7IC8qIHNpbiBvZiBzZWFyY2hlZCBnZW9kZXRpYyBsYXRpdHVkZSAqL1xuICAgIHZhciBTRFBISTsgLyogZW5kLWNyaXRlcml1bTogYWRkaXRpb24tdGhlb3JlbSBvZiBzaW4oTGF0aXR1ZGUoaXRlciktTGF0aXR1ZGUoaXRlci0xKSkgKi9cbiAgICB2YXIgQXRfUG9sZTsgLyogaW5kaWNhdGVzIGxvY2F0aW9uIGlzIGluIHBvbGFyIHJlZ2lvbiAqL1xuICAgIHZhciBpdGVyOyAvKiAjIG9mIGNvbnRpbm91cyBpdGVyYXRpb24sIG1heC4gMzAgaXMgYWx3YXlzIGVub3VnaCAocy5hLikgKi9cblxuICAgIHZhciBYID0gcC54O1xuICAgIHZhciBZID0gcC55O1xuICAgIHZhciBaID0gcC56ID8gcC56IDogMC4wOyAvL1ogdmFsdWUgbm90IGFsd2F5cyBzdXBwbGllZFxuICAgIHZhciBMb25naXR1ZGU7XG4gICAgdmFyIExhdGl0dWRlO1xuICAgIHZhciBIZWlnaHQ7XG5cbiAgICBBdF9Qb2xlID0gZmFsc2U7XG4gICAgUCA9IE1hdGguc3FydChYICogWCArIFkgKiBZKTtcbiAgICBSUiA9IE1hdGguc3FydChYICogWCArIFkgKiBZICsgWiAqIFopO1xuXG4gICAgLyogICAgICBzcGVjaWFsIGNhc2VzIGZvciBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlICovXG4gICAgaWYgKFAgLyB0aGlzLmEgPCBnZW5hdSkge1xuXG4gICAgICAvKiAgc3BlY2lhbCBjYXNlLCBpZiBQPTAuIChYPTAuLCBZPTAuKSAqL1xuICAgICAgQXRfUG9sZSA9IHRydWU7XG4gICAgICBMb25naXR1ZGUgPSAwLjA7XG5cbiAgICAgIC8qICBpZiAoWCxZLFopPSgwLiwwLiwwLikgdGhlbiBIZWlnaHQgYmVjb21lcyBzZW1pLW1pbm9yIGF4aXNcbiAgICAgICAqICBvZiBlbGxpcHNvaWQgKD1jZW50ZXIgb2YgbWFzcyksIExhdGl0dWRlIGJlY29tZXMgUEkvMiAqL1xuICAgICAgaWYgKFJSIC8gdGhpcy5hIDwgZ2VuYXUpIHtcbiAgICAgICAgTGF0aXR1ZGUgPSBIQUxGX1BJO1xuICAgICAgICBIZWlnaHQgPSAtdGhpcy5iO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLyogIGVsbGlwc29pZGFsIChnZW9kZXRpYykgbG9uZ2l0dWRlXG4gICAgICAgKiAgaW50ZXJ2YWw6IC1QSSA8IExvbmdpdHVkZSA8PSArUEkgKi9cbiAgICAgIExvbmdpdHVkZSA9IE1hdGguYXRhbjIoWSwgWCk7XG4gICAgfVxuXG4gICAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgKiBGb2xsb3dpbmcgaXRlcmF0aXZlIGFsZ29yaXRobSB3YXMgZGV2ZWxvcHBlZCBieVxuICAgICAqIFwiSW5zdGl0dXQgZm9yIEVyZG1lc3N1bmdcIiwgVW5pdmVyc2l0eSBvZiBIYW5ub3ZlciwgSnVseSAxOTg4LlxuICAgICAqIEludGVybmV0OiB3d3cuaWZlLnVuaS1oYW5ub3Zlci5kZVxuICAgICAqIEl0ZXJhdGl2ZSBjb21wdXRhdGlvbiBvZiBDUEhJLFNQSEkgYW5kIEhlaWdodC5cbiAgICAgKiBJdGVyYXRpb24gb2YgQ1BISSBhbmQgU1BISSB0byAxMCoqLTEyIHJhZGlhbiByZXNwLlxuICAgICAqIDIqMTAqKi03IGFyY3NlYy5cbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAqL1xuICAgIENUID0gWiAvIFJSO1xuICAgIFNUID0gUCAvIFJSO1xuICAgIFJYID0gMS4wIC8gTWF0aC5zcXJ0KDEuMCAtIHRoaXMuZXMgKiAoMi4wIC0gdGhpcy5lcykgKiBTVCAqIFNUKTtcbiAgICBDUEhJMCA9IFNUICogKDEuMCAtIHRoaXMuZXMpICogUlg7XG4gICAgU1BISTAgPSBDVCAqIFJYO1xuICAgIGl0ZXIgPSAwO1xuXG4gICAgLyogbG9vcCB0byBmaW5kIHNpbihMYXRpdHVkZSkgcmVzcC4gTGF0aXR1ZGVcbiAgICAgKiB1bnRpbCB8c2luKExhdGl0dWRlKGl0ZXIpLUxhdGl0dWRlKGl0ZXItMSkpfCA8IGdlbmF1ICovXG4gICAgZG8ge1xuICAgICAgaXRlcisrO1xuICAgICAgUk4gPSB0aGlzLmEgLyBNYXRoLnNxcnQoMS4wIC0gdGhpcy5lcyAqIFNQSEkwICogU1BISTApO1xuXG4gICAgICAvKiAgZWxsaXBzb2lkYWwgKGdlb2RldGljKSBoZWlnaHQgKi9cbiAgICAgIEhlaWdodCA9IFAgKiBDUEhJMCArIFogKiBTUEhJMCAtIFJOICogKDEuMCAtIHRoaXMuZXMgKiBTUEhJMCAqIFNQSEkwKTtcblxuICAgICAgUksgPSB0aGlzLmVzICogUk4gLyAoUk4gKyBIZWlnaHQpO1xuICAgICAgUlggPSAxLjAgLyBNYXRoLnNxcnQoMS4wIC0gUksgKiAoMi4wIC0gUkspICogU1QgKiBTVCk7XG4gICAgICBDUEhJID0gU1QgKiAoMS4wIC0gUkspICogUlg7XG4gICAgICBTUEhJID0gQ1QgKiBSWDtcbiAgICAgIFNEUEhJID0gU1BISSAqIENQSEkwIC0gQ1BISSAqIFNQSEkwO1xuICAgICAgQ1BISTAgPSBDUEhJO1xuICAgICAgU1BISTAgPSBTUEhJO1xuICAgIH1cbiAgICB3aGlsZSAoU0RQSEkgKiBTRFBISSA+IGdlbmF1MiAmJiBpdGVyIDwgbWF4aXRlcik7XG5cbiAgICAvKiAgICAgIGVsbGlwc29pZGFsIChnZW9kZXRpYykgbGF0aXR1ZGUgKi9cbiAgICBMYXRpdHVkZSA9IE1hdGguYXRhbihTUEhJIC8gTWF0aC5hYnMoQ1BISSkpO1xuXG4gICAgcC54ID0gTG9uZ2l0dWRlO1xuICAgIHAueSA9IExhdGl0dWRlO1xuICAgIHAueiA9IEhlaWdodDtcbiAgICByZXR1cm4gcDtcbiAgfSwgLy8gY3NfZ2VvY2VudHJpY190b19nZW9kZXRpYygpXG5cbiAgLyoqIENvbnZlcnRfR2VvY2VudHJpY19Ub19HZW9kZXRpY1xuICAgKiBUaGUgbWV0aG9kIHVzZWQgaGVyZSBpcyBkZXJpdmVkIGZyb20gJ0FuIEltcHJvdmVkIEFsZ29yaXRobSBmb3JcbiAgICogR2VvY2VudHJpYyB0byBHZW9kZXRpYyBDb29yZGluYXRlIENvbnZlcnNpb24nLCBieSBSYWxwaCBUb21zLCBGZWIgMTk5NlxuICAgKi9cbiAgZ2VvY2VudHJpY190b19nZW9kZXRpY19ub25pdGVyOiBmdW5jdGlvbihwKSB7XG4gICAgdmFyIFggPSBwLng7XG4gICAgdmFyIFkgPSBwLnk7XG4gICAgdmFyIFogPSBwLnogPyBwLnogOiAwOyAvL1ogdmFsdWUgbm90IGFsd2F5cyBzdXBwbGllZFxuICAgIHZhciBMb25naXR1ZGU7XG4gICAgdmFyIExhdGl0dWRlO1xuICAgIHZhciBIZWlnaHQ7XG5cbiAgICB2YXIgVzsgLyogZGlzdGFuY2UgZnJvbSBaIGF4aXMgKi9cbiAgICB2YXIgVzI7IC8qIHNxdWFyZSBvZiBkaXN0YW5jZSBmcm9tIFogYXhpcyAqL1xuICAgIHZhciBUMDsgLyogaW5pdGlhbCBlc3RpbWF0ZSBvZiB2ZXJ0aWNhbCBjb21wb25lbnQgKi9cbiAgICB2YXIgVDE7IC8qIGNvcnJlY3RlZCBlc3RpbWF0ZSBvZiB2ZXJ0aWNhbCBjb21wb25lbnQgKi9cbiAgICB2YXIgUzA7IC8qIGluaXRpYWwgZXN0aW1hdGUgb2YgaG9yaXpvbnRhbCBjb21wb25lbnQgKi9cbiAgICB2YXIgUzE7IC8qIGNvcnJlY3RlZCBlc3RpbWF0ZSBvZiBob3Jpem9udGFsIGNvbXBvbmVudCAqL1xuICAgIHZhciBTaW5fQjA7IC8qIE1hdGguc2luKEIwKSwgQjAgaXMgZXN0aW1hdGUgb2YgQm93cmluZyBhdXggdmFyaWFibGUgKi9cbiAgICB2YXIgU2luM19CMDsgLyogY3ViZSBvZiBNYXRoLnNpbihCMCkgKi9cbiAgICB2YXIgQ29zX0IwOyAvKiBNYXRoLmNvcyhCMCkgKi9cbiAgICB2YXIgU2luX3AxOyAvKiBNYXRoLnNpbihwaGkxKSwgcGhpMSBpcyBlc3RpbWF0ZWQgbGF0aXR1ZGUgKi9cbiAgICB2YXIgQ29zX3AxOyAvKiBNYXRoLmNvcyhwaGkxKSAqL1xuICAgIHZhciBSbjsgLyogRWFydGggcmFkaXVzIGF0IGxvY2F0aW9uICovXG4gICAgdmFyIFN1bTsgLyogbnVtZXJhdG9yIG9mIE1hdGguY29zKHBoaTEpICovXG4gICAgdmFyIEF0X1BvbGU7IC8qIGluZGljYXRlcyBsb2NhdGlvbiBpcyBpbiBwb2xhciByZWdpb24gKi9cblxuICAgIFggPSBwYXJzZUZsb2F0KFgpOyAvLyBjYXN0IGZyb20gc3RyaW5nIHRvIGZsb2F0XG4gICAgWSA9IHBhcnNlRmxvYXQoWSk7XG4gICAgWiA9IHBhcnNlRmxvYXQoWik7XG5cbiAgICBBdF9Qb2xlID0gZmFsc2U7XG4gICAgaWYgKFggIT09IDAuMCkge1xuICAgICAgTG9uZ2l0dWRlID0gTWF0aC5hdGFuMihZLCBYKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpZiAoWSA+IDApIHtcbiAgICAgICAgTG9uZ2l0dWRlID0gSEFMRl9QSTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKFkgPCAwKSB7XG4gICAgICAgIExvbmdpdHVkZSA9IC1IQUxGX1BJO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIEF0X1BvbGUgPSB0cnVlO1xuICAgICAgICBMb25naXR1ZGUgPSAwLjA7XG4gICAgICAgIGlmIChaID4gMC4wKSB7IC8qIG5vcnRoIHBvbGUgKi9cbiAgICAgICAgICBMYXRpdHVkZSA9IEhBTEZfUEk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoWiA8IDAuMCkgeyAvKiBzb3V0aCBwb2xlICovXG4gICAgICAgICAgTGF0aXR1ZGUgPSAtSEFMRl9QSTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLyogY2VudGVyIG9mIGVhcnRoICovXG4gICAgICAgICAgTGF0aXR1ZGUgPSBIQUxGX1BJO1xuICAgICAgICAgIEhlaWdodCA9IC10aGlzLmI7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFcyID0gWCAqIFggKyBZICogWTtcbiAgICBXID0gTWF0aC5zcXJ0KFcyKTtcbiAgICBUMCA9IFogKiBBRF9DO1xuICAgIFMwID0gTWF0aC5zcXJ0KFQwICogVDAgKyBXMik7XG4gICAgU2luX0IwID0gVDAgLyBTMDtcbiAgICBDb3NfQjAgPSBXIC8gUzA7XG4gICAgU2luM19CMCA9IFNpbl9CMCAqIFNpbl9CMCAqIFNpbl9CMDtcbiAgICBUMSA9IFogKyB0aGlzLmIgKiB0aGlzLmVwMiAqIFNpbjNfQjA7XG4gICAgU3VtID0gVyAtIHRoaXMuYSAqIHRoaXMuZXMgKiBDb3NfQjAgKiBDb3NfQjAgKiBDb3NfQjA7XG4gICAgUzEgPSBNYXRoLnNxcnQoVDEgKiBUMSArIFN1bSAqIFN1bSk7XG4gICAgU2luX3AxID0gVDEgLyBTMTtcbiAgICBDb3NfcDEgPSBTdW0gLyBTMTtcbiAgICBSbiA9IHRoaXMuYSAvIE1hdGguc3FydCgxLjAgLSB0aGlzLmVzICogU2luX3AxICogU2luX3AxKTtcbiAgICBpZiAoQ29zX3AxID49IENPU182N1A1KSB7XG4gICAgICBIZWlnaHQgPSBXIC8gQ29zX3AxIC0gUm47XG4gICAgfVxuICAgIGVsc2UgaWYgKENvc19wMSA8PSAtQ09TXzY3UDUpIHtcbiAgICAgIEhlaWdodCA9IFcgLyAtQ29zX3AxIC0gUm47XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgSGVpZ2h0ID0gWiAvIFNpbl9wMSArIFJuICogKHRoaXMuZXMgLSAxLjApO1xuICAgIH1cbiAgICBpZiAoQXRfUG9sZSA9PT0gZmFsc2UpIHtcbiAgICAgIExhdGl0dWRlID0gTWF0aC5hdGFuKFNpbl9wMSAvIENvc19wMSk7XG4gICAgfVxuXG4gICAgcC54ID0gTG9uZ2l0dWRlO1xuICAgIHAueSA9IExhdGl0dWRlO1xuICAgIHAueiA9IEhlaWdodDtcbiAgICByZXR1cm4gcDtcbiAgfSwgLy8gZ2VvY2VudHJpY190b19nZW9kZXRpY19ub25pdGVyKClcblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgLy8gcGpfZ2VvY2VudGljX3RvX3dnczg0KCBwIClcbiAgLy8gIHAgPSBwb2ludCB0byB0cmFuc2Zvcm0gaW4gZ2VvY2VudHJpYyBjb29yZGluYXRlcyAoeCx5LHopXG4gIGdlb2NlbnRyaWNfdG9fd2dzODQ6IGZ1bmN0aW9uKHApIHtcblxuICAgIGlmICh0aGlzLmRhdHVtX3R5cGUgPT09IFBKRF8zUEFSQU0pIHtcbiAgICAgIC8vIGlmKCB4W2lvXSA9PT0gSFVHRV9WQUwgKVxuICAgICAgLy8gICAgY29udGludWU7XG4gICAgICBwLnggKz0gdGhpcy5kYXR1bV9wYXJhbXNbMF07XG4gICAgICBwLnkgKz0gdGhpcy5kYXR1bV9wYXJhbXNbMV07XG4gICAgICBwLnogKz0gdGhpcy5kYXR1bV9wYXJhbXNbMl07XG5cbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5kYXR1bV90eXBlID09PSBQSkRfN1BBUkFNKSB7XG4gICAgICB2YXIgRHhfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1swXTtcbiAgICAgIHZhciBEeV9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzFdO1xuICAgICAgdmFyIER6X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbMl07XG4gICAgICB2YXIgUnhfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1szXTtcbiAgICAgIHZhciBSeV9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzRdO1xuICAgICAgdmFyIFJ6X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbNV07XG4gICAgICB2YXIgTV9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzZdO1xuICAgICAgLy8gaWYoIHhbaW9dID09PSBIVUdFX1ZBTCApXG4gICAgICAvLyAgICBjb250aW51ZTtcbiAgICAgIHZhciB4X291dCA9IE1fQkYgKiAocC54IC0gUnpfQkYgKiBwLnkgKyBSeV9CRiAqIHAueikgKyBEeF9CRjtcbiAgICAgIHZhciB5X291dCA9IE1fQkYgKiAoUnpfQkYgKiBwLnggKyBwLnkgLSBSeF9CRiAqIHAueikgKyBEeV9CRjtcbiAgICAgIHZhciB6X291dCA9IE1fQkYgKiAoLVJ5X0JGICogcC54ICsgUnhfQkYgKiBwLnkgKyBwLnopICsgRHpfQkY7XG4gICAgICBwLnggPSB4X291dDtcbiAgICAgIHAueSA9IHlfb3V0O1xuICAgICAgcC56ID0gel9vdXQ7XG4gICAgfVxuICB9LCAvLyBjc19nZW9jZW50cmljX3RvX3dnczg0XG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIC8vIHBqX2dlb2NlbnRpY19mcm9tX3dnczg0KClcbiAgLy8gIGNvb3JkaW5hdGUgc3lzdGVtIGRlZmluaXRpb24sXG4gIC8vICBwb2ludCB0byB0cmFuc2Zvcm0gaW4gZ2VvY2VudHJpYyBjb29yZGluYXRlcyAoeCx5LHopXG4gIGdlb2NlbnRyaWNfZnJvbV93Z3M4NDogZnVuY3Rpb24ocCkge1xuXG4gICAgaWYgKHRoaXMuZGF0dW1fdHlwZSA9PT0gUEpEXzNQQVJBTSkge1xuICAgICAgLy9pZiggeFtpb10gPT09IEhVR0VfVkFMIClcbiAgICAgIC8vICAgIGNvbnRpbnVlO1xuICAgICAgcC54IC09IHRoaXMuZGF0dW1fcGFyYW1zWzBdO1xuICAgICAgcC55IC09IHRoaXMuZGF0dW1fcGFyYW1zWzFdO1xuICAgICAgcC56IC09IHRoaXMuZGF0dW1fcGFyYW1zWzJdO1xuXG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZGF0dW1fdHlwZSA9PT0gUEpEXzdQQVJBTSkge1xuICAgICAgdmFyIER4X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbMF07XG4gICAgICB2YXIgRHlfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1sxXTtcbiAgICAgIHZhciBEel9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzJdO1xuICAgICAgdmFyIFJ4X0JGID0gdGhpcy5kYXR1bV9wYXJhbXNbM107XG4gICAgICB2YXIgUnlfQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1s0XTtcbiAgICAgIHZhciBSel9CRiA9IHRoaXMuZGF0dW1fcGFyYW1zWzVdO1xuICAgICAgdmFyIE1fQkYgPSB0aGlzLmRhdHVtX3BhcmFtc1s2XTtcbiAgICAgIHZhciB4X3RtcCA9IChwLnggLSBEeF9CRikgLyBNX0JGO1xuICAgICAgdmFyIHlfdG1wID0gKHAueSAtIER5X0JGKSAvIE1fQkY7XG4gICAgICB2YXIgel90bXAgPSAocC56IC0gRHpfQkYpIC8gTV9CRjtcbiAgICAgIC8vaWYoIHhbaW9dID09PSBIVUdFX1ZBTCApXG4gICAgICAvLyAgICBjb250aW51ZTtcblxuICAgICAgcC54ID0geF90bXAgKyBSel9CRiAqIHlfdG1wIC0gUnlfQkYgKiB6X3RtcDtcbiAgICAgIHAueSA9IC1Sel9CRiAqIHhfdG1wICsgeV90bXAgKyBSeF9CRiAqIHpfdG1wO1xuICAgICAgcC56ID0gUnlfQkYgKiB4X3RtcCAtIFJ4X0JGICogeV90bXAgKyB6X3RtcDtcbiAgICB9IC8vY3NfZ2VvY2VudHJpY19mcm9tX3dnczg0KClcbiAgfVxufTtcblxuLyoqIHBvaW50IG9iamVjdCwgbm90aGluZyBmYW5jeSwganVzdCBhbGxvd3MgdmFsdWVzIHRvIGJlXG4gICAgcGFzc2VkIGJhY2sgYW5kIGZvcnRoIGJ5IHJlZmVyZW5jZSByYXRoZXIgdGhhbiBieSB2YWx1ZS5cbiAgICBPdGhlciBwb2ludCBjbGFzc2VzIG1heSBiZSB1c2VkIGFzIGxvbmcgYXMgdGhleSBoYXZlXG4gICAgeCBhbmQgeSBwcm9wZXJ0aWVzLCB3aGljaCB3aWxsIGdldCBtb2RpZmllZCBpbiB0aGUgdHJhbnNmb3JtIG1ldGhvZC5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGRhdHVtO1xuIiwidmFyIFBKRF8zUEFSQU0gPSAxO1xudmFyIFBKRF83UEFSQU0gPSAyO1xudmFyIFBKRF9HUklEU0hJRlQgPSAzO1xudmFyIFBKRF9OT0RBVFVNID0gNTsgLy8gV0dTODQgb3IgZXF1aXZhbGVudFxudmFyIFNSU19XR1M4NF9TRU1JTUFKT1IgPSA2Mzc4MTM3OyAvLyBvbmx5IHVzZWQgaW4gZ3JpZCBzaGlmdCB0cmFuc2Zvcm1zXG52YXIgU1JTX1dHUzg0X0VTUVVBUkVEID0gMC4wMDY2OTQzNzk5OTAxNDEzMTY7IC8vREdSOiAyMDEyLTA3LTI5XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNvdXJjZSwgZGVzdCwgcG9pbnQpIHtcbiAgdmFyIHdwLCBpLCBsO1xuXG4gIGZ1bmN0aW9uIGNoZWNrUGFyYW1zKGZhbGxiYWNrKSB7XG4gICAgcmV0dXJuIChmYWxsYmFjayA9PT0gUEpEXzNQQVJBTSB8fCBmYWxsYmFjayA9PT0gUEpEXzdQQVJBTSk7XG4gIH1cbiAgLy8gU2hvcnQgY3V0IGlmIHRoZSBkYXR1bXMgYXJlIGlkZW50aWNhbC5cbiAgaWYgKHNvdXJjZS5jb21wYXJlX2RhdHVtcyhkZXN0KSkge1xuICAgIHJldHVybiBwb2ludDsgLy8gaW4gdGhpcyBjYXNlLCB6ZXJvIGlzIHN1Y2VzcyxcbiAgICAvLyB3aGVyZWFzIGNzX2NvbXBhcmVfZGF0dW1zIHJldHVybnMgMSB0byBpbmRpY2F0ZSBUUlVFXG4gICAgLy8gY29uZnVzaW5nLCBzaG91bGQgZml4IHRoaXNcbiAgfVxuXG4gIC8vIEV4cGxpY2l0bHkgc2tpcCBkYXR1bSB0cmFuc2Zvcm0gYnkgc2V0dGluZyAnZGF0dW09bm9uZScgYXMgcGFyYW1ldGVyIGZvciBlaXRoZXIgc291cmNlIG9yIGRlc3RcbiAgaWYgKHNvdXJjZS5kYXR1bV90eXBlID09PSBQSkRfTk9EQVRVTSB8fCBkZXN0LmRhdHVtX3R5cGUgPT09IFBKRF9OT0RBVFVNKSB7XG4gICAgcmV0dXJuIHBvaW50O1xuICB9XG5cbiAgLy9ER1I6IDIwMTItMDctMjkgOiBhZGQgbmFkZ3JpZHMgc3VwcG9ydCAoYmVnaW4pXG4gIHZhciBzcmNfYSA9IHNvdXJjZS5hO1xuICB2YXIgc3JjX2VzID0gc291cmNlLmVzO1xuXG4gIHZhciBkc3RfYSA9IGRlc3QuYTtcbiAgdmFyIGRzdF9lcyA9IGRlc3QuZXM7XG5cbiAgdmFyIGZhbGxiYWNrID0gc291cmNlLmRhdHVtX3R5cGU7XG4gIC8vIElmIHRoaXMgZGF0dW0gcmVxdWlyZXMgZ3JpZCBzaGlmdHMsIHRoZW4gYXBwbHkgaXQgdG8gZ2VvZGV0aWMgY29vcmRpbmF0ZXMuXG4gIGlmIChmYWxsYmFjayA9PT0gUEpEX0dSSURTSElGVCkge1xuICAgIGlmICh0aGlzLmFwcGx5X2dyaWRzaGlmdChzb3VyY2UsIDAsIHBvaW50KSA9PT0gMCkge1xuICAgICAgc291cmNlLmEgPSBTUlNfV0dTODRfU0VNSU1BSk9SO1xuICAgICAgc291cmNlLmVzID0gU1JTX1dHUzg0X0VTUVVBUkVEO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHRyeSAzIG9yIDcgcGFyYW1zIHRyYW5zZm9ybWF0aW9uIG9yIG5vdGhpbmcgP1xuICAgICAgaWYgKCFzb3VyY2UuZGF0dW1fcGFyYW1zKSB7XG4gICAgICAgIHNvdXJjZS5hID0gc3JjX2E7XG4gICAgICAgIHNvdXJjZS5lcyA9IHNvdXJjZS5lcztcbiAgICAgICAgcmV0dXJuIHBvaW50O1xuICAgICAgfVxuICAgICAgd3AgPSAxO1xuICAgICAgZm9yIChpID0gMCwgbCA9IHNvdXJjZS5kYXR1bV9wYXJhbXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHdwICo9IHNvdXJjZS5kYXR1bV9wYXJhbXNbaV07XG4gICAgICB9XG4gICAgICBpZiAod3AgPT09IDApIHtcbiAgICAgICAgc291cmNlLmEgPSBzcmNfYTtcbiAgICAgICAgc291cmNlLmVzID0gc291cmNlLmVzO1xuICAgICAgICByZXR1cm4gcG9pbnQ7XG4gICAgICB9XG4gICAgICBpZiAoc291cmNlLmRhdHVtX3BhcmFtcy5sZW5ndGggPiAzKSB7XG4gICAgICAgIGZhbGxiYWNrID0gUEpEXzdQQVJBTTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBmYWxsYmFjayA9IFBKRF8zUEFSQU07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChkZXN0LmRhdHVtX3R5cGUgPT09IFBKRF9HUklEU0hJRlQpIHtcbiAgICBkZXN0LmEgPSBTUlNfV0dTODRfU0VNSU1BSk9SO1xuICAgIGRlc3QuZXMgPSBTUlNfV0dTODRfRVNRVUFSRUQ7XG4gIH1cbiAgLy8gRG8gd2UgbmVlZCB0byBnbyB0aHJvdWdoIGdlb2NlbnRyaWMgY29vcmRpbmF0ZXM/XG4gIGlmIChzb3VyY2UuZXMgIT09IGRlc3QuZXMgfHwgc291cmNlLmEgIT09IGRlc3QuYSB8fCBjaGVja1BhcmFtcyhmYWxsYmFjaykgfHwgY2hlY2tQYXJhbXMoZGVzdC5kYXR1bV90eXBlKSkge1xuICAgIC8vREdSOiAyMDEyLTA3LTI5IDogYWRkIG5hZGdyaWRzIHN1cHBvcnQgKGVuZClcbiAgICAvLyBDb252ZXJ0IHRvIGdlb2NlbnRyaWMgY29vcmRpbmF0ZXMuXG4gICAgc291cmNlLmdlb2RldGljX3RvX2dlb2NlbnRyaWMocG9pbnQpO1xuICAgIC8vIENIRUNLX1JFVFVSTjtcbiAgICAvLyBDb252ZXJ0IGJldHdlZW4gZGF0dW1zXG4gICAgaWYgKGNoZWNrUGFyYW1zKHNvdXJjZS5kYXR1bV90eXBlKSkge1xuICAgICAgc291cmNlLmdlb2NlbnRyaWNfdG9fd2dzODQocG9pbnQpO1xuICAgICAgLy8gQ0hFQ0tfUkVUVVJOO1xuICAgIH1cbiAgICBpZiAoY2hlY2tQYXJhbXMoZGVzdC5kYXR1bV90eXBlKSkge1xuICAgICAgZGVzdC5nZW9jZW50cmljX2Zyb21fd2dzODQocG9pbnQpO1xuICAgICAgLy8gQ0hFQ0tfUkVUVVJOO1xuICAgIH1cbiAgICAvLyBDb252ZXJ0IGJhY2sgdG8gZ2VvZGV0aWMgY29vcmRpbmF0ZXNcbiAgICBkZXN0Lmdlb2NlbnRyaWNfdG9fZ2VvZGV0aWMocG9pbnQpO1xuICAgIC8vIENIRUNLX1JFVFVSTjtcbiAgfVxuICAvLyBBcHBseSBncmlkIHNoaWZ0IHRvIGRlc3RpbmF0aW9uIGlmIHJlcXVpcmVkXG4gIGlmIChkZXN0LmRhdHVtX3R5cGUgPT09IFBKRF9HUklEU0hJRlQpIHtcbiAgICB0aGlzLmFwcGx5X2dyaWRzaGlmdChkZXN0LCAxLCBwb2ludCk7XG4gICAgLy8gQ0hFQ0tfUkVUVVJOO1xuICB9XG5cbiAgc291cmNlLmEgPSBzcmNfYTtcbiAgc291cmNlLmVzID0gc3JjX2VzO1xuICBkZXN0LmEgPSBkc3RfYTtcbiAgZGVzdC5lcyA9IGRzdF9lcztcblxuICByZXR1cm4gcG9pbnQ7XG59O1xuXG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4vZ2xvYmFsJyk7XG52YXIgcGFyc2VQcm9qID0gcmVxdWlyZSgnLi9wcm9qU3RyaW5nJyk7XG52YXIgd2t0ID0gcmVxdWlyZSgnLi93a3QnKTtcblxuZnVuY3Rpb24gZGVmcyhuYW1lKSB7XG4gIC8qZ2xvYmFsIGNvbnNvbGUqL1xuICB2YXIgdGhhdCA9IHRoaXM7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgdmFyIGRlZiA9IGFyZ3VtZW50c1sxXTtcbiAgICBpZiAodHlwZW9mIGRlZiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChkZWYuY2hhckF0KDApID09PSAnKycpIHtcbiAgICAgICAgZGVmc1tuYW1lXSA9IHBhcnNlUHJvaihhcmd1bWVudHNbMV0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGRlZnNbbmFtZV0gPSB3a3QoYXJndW1lbnRzWzFdKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGVmc1tuYW1lXSA9IGRlZjtcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gbmFtZS5tYXAoZnVuY3Rpb24odikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2KSkge1xuICAgICAgICAgIGRlZnMuYXBwbHkodGhhdCwgdik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVmcyh2KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKG5hbWUgaW4gZGVmcykge1xuICAgICAgICByZXR1cm4gZGVmc1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoJ0VQU0cnIGluIG5hbWUpIHtcbiAgICAgIGRlZnNbJ0VQU0c6JyArIG5hbWUuRVBTR10gPSBuYW1lO1xuICAgIH1cbiAgICBlbHNlIGlmICgnRVNSSScgaW4gbmFtZSkge1xuICAgICAgZGVmc1snRVNSSTonICsgbmFtZS5FU1JJXSA9IG5hbWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKCdJQVUyMDAwJyBpbiBuYW1lKSB7XG4gICAgICBkZWZzWydJQVUyMDAwOicgKyBuYW1lLklBVTIwMDBdID0gbmFtZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cblxufVxuZ2xvYmFscyhkZWZzKTtcbm1vZHVsZS5leHBvcnRzID0gZGVmcztcbiIsInZhciBEYXR1bSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL0RhdHVtJyk7XG52YXIgRWxsaXBzb2lkID0gcmVxdWlyZSgnLi9jb25zdGFudHMvRWxsaXBzb2lkJyk7XG52YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi9leHRlbmQnKTtcbnZhciBkYXR1bSA9IHJlcXVpcmUoJy4vZGF0dW0nKTtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG4vLyBlbGxpcG9pZCBwal9zZXRfZWxsLmNcbnZhciBTSVhUSCA9IDAuMTY2NjY2NjY2NjY2NjY2NjY2Nztcbi8qIDEvNiAqL1xudmFyIFJBNCA9IDAuMDQ3MjIyMjIyMjIyMjIyMjIyMjI7XG4vKiAxNy8zNjAgKi9cbnZhciBSQTYgPSAwLjAyMjE1NjA4NDY1NjA4NDY1NjA4O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihqc29uKSB7XG4gIC8vIERHUiAyMDExLTAzLTIwIDogbmFncmlkcyAtPiBuYWRncmlkc1xuICBpZiAoanNvbi5kYXR1bUNvZGUgJiYganNvbi5kYXR1bUNvZGUgIT09ICdub25lJykge1xuICAgIHZhciBkYXR1bURlZiA9IERhdHVtW2pzb24uZGF0dW1Db2RlXTtcbiAgICBpZiAoZGF0dW1EZWYpIHtcbiAgICAgIGpzb24uZGF0dW1fcGFyYW1zID0gZGF0dW1EZWYudG93Z3M4NCA/IGRhdHVtRGVmLnRvd2dzODQuc3BsaXQoJywnKSA6IG51bGw7XG4gICAgICBqc29uLmVsbHBzID0gZGF0dW1EZWYuZWxsaXBzZTtcbiAgICAgIGpzb24uZGF0dW1OYW1lID0gZGF0dW1EZWYuZGF0dW1OYW1lID8gZGF0dW1EZWYuZGF0dW1OYW1lIDoganNvbi5kYXR1bUNvZGU7XG4gICAgfVxuICB9XG4gIGlmICghanNvbi5hKSB7IC8vIGRvIHdlIGhhdmUgYW4gZWxsaXBzb2lkP1xuICAgIHZhciBlbGxpcHNlID0gRWxsaXBzb2lkW2pzb24uZWxscHNdID8gRWxsaXBzb2lkW2pzb24uZWxscHNdIDogRWxsaXBzb2lkLldHUzg0O1xuICAgIGV4dGVuZChqc29uLCBlbGxpcHNlKTtcbiAgfVxuICBpZiAoanNvbi5yZiAmJiAhanNvbi5iKSB7XG4gICAganNvbi5iID0gKDEuMCAtIDEuMCAvIGpzb24ucmYpICoganNvbi5hO1xuICB9XG4gIGlmIChqc29uLnJmID09PSAwIHx8IE1hdGguYWJzKGpzb24uYSAtIGpzb24uYikgPCBFUFNMTikge1xuICAgIGpzb24uc3BoZXJlID0gdHJ1ZTtcbiAgICBqc29uLmIgPSBqc29uLmE7XG4gIH1cbiAganNvbi5hMiA9IGpzb24uYSAqIGpzb24uYTsgLy8gdXNlZCBpbiBnZW9jZW50cmljXG4gIGpzb24uYjIgPSBqc29uLmIgKiBqc29uLmI7IC8vIHVzZWQgaW4gZ2VvY2VudHJpY1xuICBqc29uLmVzID0gKGpzb24uYTIgLSBqc29uLmIyKSAvIGpzb24uYTI7IC8vIGUgXiAyXG4gIGpzb24uZSA9IE1hdGguc3FydChqc29uLmVzKTsgLy8gZWNjZW50cmljaXR5XG4gIGlmIChqc29uLlJfQSkge1xuICAgIGpzb24uYSAqPSAxIC0ganNvbi5lcyAqIChTSVhUSCArIGpzb24uZXMgKiAoUkE0ICsganNvbi5lcyAqIFJBNikpO1xuICAgIGpzb24uYTIgPSBqc29uLmEgKiBqc29uLmE7XG4gICAganNvbi5iMiA9IGpzb24uYiAqIGpzb24uYjtcbiAgICBqc29uLmVzID0gMDtcbiAgfVxuICBqc29uLmVwMiA9IChqc29uLmEyIC0ganNvbi5iMikgLyBqc29uLmIyOyAvLyB1c2VkIGluIGdlb2NlbnRyaWNcbiAgaWYgKCFqc29uLmswKSB7XG4gICAganNvbi5rMCA9IDEuMDsgLy9kZWZhdWx0IHZhbHVlXG4gIH1cbiAgLy9ER1IgMjAxMC0xMS0xMjogYXhpc1xuICBpZiAoIWpzb24uYXhpcykge1xuICAgIGpzb24uYXhpcyA9IFwiZW51XCI7XG4gIH1cblxuICBpZiAoIWpzb24uZGF0dW0pIHtcbiAgICBqc29uLmRhdHVtID0gZGF0dW0oanNvbik7XG4gIH1cbiAgcmV0dXJuIGpzb247XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkZXN0aW5hdGlvbiwgc291cmNlKSB7XG4gIGRlc3RpbmF0aW9uID0gZGVzdGluYXRpb24gfHwge307XG4gIHZhciB2YWx1ZSwgcHJvcGVydHk7XG4gIGlmICghc291cmNlKSB7XG4gICAgcmV0dXJuIGRlc3RpbmF0aW9uO1xuICB9XG4gIGZvciAocHJvcGVydHkgaW4gc291cmNlKSB7XG4gICAgdmFsdWUgPSBzb3VyY2VbcHJvcGVydHldO1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkZXN0aW5hdGlvbltwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlc3RpbmF0aW9uO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGVmcykge1xuICBkZWZzKCdFUFNHOjQzMjYnLCBcIit0aXRsZT1XR1MgODQgKGxvbmcvbGF0KSArcHJvaj1sb25nbGF0ICtlbGxwcz1XR1M4NCArZGF0dW09V0dTODQgK3VuaXRzPWRlZ3JlZXNcIik7XG4gIGRlZnMoJ0VQU0c6NDI2OScsIFwiK3RpdGxlPU5BRDgzIChsb25nL2xhdCkgK3Byb2o9bG9uZ2xhdCArYT02Mzc4MTM3LjAgK2I9NjM1Njc1Mi4zMTQxNDAzNiArZWxscHM9R1JTODAgK2RhdHVtPU5BRDgzICt1bml0cz1kZWdyZWVzXCIpO1xuICBkZWZzKCdFUFNHOjM4NTcnLCBcIit0aXRsZT1XR1MgODQgLyBQc2V1ZG8tTWVyY2F0b3IgK3Byb2o9bWVyYyArYT02Mzc4MTM3ICtiPTYzNzgxMzcgK2xhdF90cz0wLjAgK2xvbl8wPTAuMCAreF8wPTAuMCAreV8wPTAgK2s9MS4wICt1bml0cz1tICtuYWRncmlkcz1AbnVsbCArbm9fZGVmc1wiKTtcblxuICBkZWZzLldHUzg0ID0gZGVmc1snRVBTRzo0MzI2J107XG4gIGRlZnNbJ0VQU0c6Mzc4NSddID0gZGVmc1snRVBTRzozODU3J107IC8vIG1haW50YWluIGJhY2t3YXJkIGNvbXBhdCwgb2ZmaWNpYWwgY29kZSBpcyAzODU3XG4gIGRlZnMuR09PR0xFID0gZGVmc1snRVBTRzozODU3J107XG4gIGRlZnNbJ0VQU0c6OTAwOTEzJ10gPSBkZWZzWydFUFNHOjM4NTcnXTtcbiAgZGVmc1snRVBTRzoxMDIxMTMnXSA9IGRlZnNbJ0VQU0c6Mzg1NyddO1xufTtcbiIsInZhciBwcm9qcyA9IFtcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy90bWVyYycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL3V0bScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL3N0ZXJlYScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL3N0ZXJlJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvc29tZXJjJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvb21lcmMnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9sY2MnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9rcm92YWsnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9jYXNzJyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvbGFlYScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2FlYScpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2dub20nKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9jZWEnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9lcWMnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9wb2x5JyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvbnptZycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL21pbGwnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9zaW51JyksXG4gIHJlcXVpcmUoJy4vcHJvamVjdGlvbnMvbW9sbCcpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2VxZGMnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy92YW5kZycpLFxuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL2FlcWQnKVxuXTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocHJvajQpe1xuICBwcm9qcy5mb3JFYWNoKGZ1bmN0aW9uKHByb2ope1xuICAgIHByb2o0LlByb2oucHJvamVjdGlvbnMuYWRkKHByb2opO1xuICB9KTtcbn07IiwidmFyIHByb2o0ID0gcmVxdWlyZSgnLi9jb3JlJyk7XG5wcm9qNC5kZWZhdWx0RGF0dW0gPSAnV0dTODQnOyAvL2RlZmF1bHQgZGF0dW1cbnByb2o0LlByb2ogPSByZXF1aXJlKCcuL1Byb2onKTtcbnByb2o0LldHUzg0ID0gbmV3IHByb2o0LlByb2ooJ1dHUzg0Jyk7XG5wcm9qNC5Qb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQnKTtcbnByb2o0LnRvUG9pbnQgPSByZXF1aXJlKFwiLi9jb21tb24vdG9Qb2ludFwiKTtcbnByb2o0LmRlZnMgPSByZXF1aXJlKCcuL2RlZnMnKTtcbnByb2o0LnRyYW5zZm9ybSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtJyk7XG5wcm9qNC5tZ3JzID0gcmVxdWlyZSgnbWdycycpO1xucHJvajQudmVyc2lvbiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb247XG5yZXF1aXJlKCcuL2luY2x1ZGVkUHJvamVjdGlvbnMnKShwcm9qNCk7XG5tb2R1bGUuZXhwb3J0cyA9IHByb2o0OyIsInZhciBkZWZzID0gcmVxdWlyZSgnLi9kZWZzJyk7XG52YXIgd2t0ID0gcmVxdWlyZSgnLi93a3QnKTtcbnZhciBwcm9qU3RyID0gcmVxdWlyZSgnLi9wcm9qU3RyaW5nJyk7XG5mdW5jdGlvbiB0ZXN0T2JqKGNvZGUpe1xuICByZXR1cm4gdHlwZW9mIGNvZGUgPT09ICdzdHJpbmcnO1xufVxuZnVuY3Rpb24gdGVzdERlZihjb2RlKXtcbiAgcmV0dXJuIGNvZGUgaW4gZGVmcztcbn1cbmZ1bmN0aW9uIHRlc3RXS1QoY29kZSl7XG4gIHZhciBjb2RlV29yZHMgPSBbJ0dFT0dDUycsJ0dFT0NDUycsJ1BST0pDUycsJ0xPQ0FMX0NTJ107XG4gIHJldHVybiBjb2RlV29yZHMucmVkdWNlKGZ1bmN0aW9uKGEsYil7XG4gICAgcmV0dXJuIGErMStjb2RlLmluZGV4T2YoYik7XG4gIH0sMCk7XG59XG5mdW5jdGlvbiB0ZXN0UHJvaihjb2RlKXtcbiAgcmV0dXJuIGNvZGVbMF0gPT09ICcrJztcbn1cbmZ1bmN0aW9uIHBhcnNlKGNvZGUpe1xuICBpZiAodGVzdE9iaihjb2RlKSkge1xuICAgIC8vY2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgYSBXS1Qgc3RyaW5nXG4gICAgaWYgKHRlc3REZWYoY29kZSkpIHtcbiAgICAgIHJldHVybiBkZWZzW2NvZGVdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0ZXN0V0tUKGNvZGUpKSB7XG4gICAgICByZXR1cm4gd2t0KGNvZGUpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0ZXN0UHJvaihjb2RlKSkge1xuICAgICAgcmV0dXJuIHByb2pTdHIoY29kZSk7XG4gICAgfVxuICB9ZWxzZXtcbiAgICByZXR1cm4gY29kZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlOyIsInZhciBEMlIgPSAwLjAxNzQ1MzI5MjUxOTk0MzI5NTc3O1xudmFyIFByaW1lTWVyaWRpYW4gPSByZXF1aXJlKCcuL2NvbnN0YW50cy9QcmltZU1lcmlkaWFuJyk7XG52YXIgdW5pdHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cy91bml0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRlZkRhdGEpIHtcbiAgdmFyIHNlbGYgPSB7fTtcbiAgdmFyIHBhcmFtT2JqID0ge307XG4gIGRlZkRhdGEuc3BsaXQoXCIrXCIpLm1hcChmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHYudHJpbSgpO1xuICB9KS5maWx0ZXIoZnVuY3Rpb24oYSkge1xuICAgIHJldHVybiBhO1xuICB9KS5mb3JFYWNoKGZ1bmN0aW9uKGEpIHtcbiAgICB2YXIgc3BsaXQgPSBhLnNwbGl0KFwiPVwiKTtcbiAgICBzcGxpdC5wdXNoKHRydWUpO1xuICAgIHBhcmFtT2JqW3NwbGl0WzBdLnRvTG93ZXJDYXNlKCldID0gc3BsaXRbMV07XG4gIH0pO1xuICB2YXIgcGFyYW1OYW1lLCBwYXJhbVZhbCwgcGFyYW1PdXRuYW1lO1xuICB2YXIgcGFyYW1zID0ge1xuICAgIHByb2o6ICdwcm9qTmFtZScsXG4gICAgZGF0dW06ICdkYXR1bUNvZGUnLFxuICAgIHJmOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLnJmID0gcGFyc2VGbG9hdCh2KTtcbiAgICB9LFxuICAgIGxhdF8wOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmxhdDAgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgbGF0XzE6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubGF0MSA9IHYgKiBEMlI7XG4gICAgfSxcbiAgICBsYXRfMjogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5sYXQyID0gdiAqIEQyUjtcbiAgICB9LFxuICAgIGxhdF90czogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5sYXRfdHMgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgbG9uXzA6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubG9uZzAgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgbG9uXzE6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubG9uZzEgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgbG9uXzI6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYubG9uZzIgPSB2ICogRDJSO1xuICAgIH0sXG4gICAgYWxwaGE6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuYWxwaGEgPSBwYXJzZUZsb2F0KHYpICogRDJSO1xuICAgIH0sXG4gICAgbG9uYzogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5sb25nYyA9IHYgKiBEMlI7XG4gICAgfSxcbiAgICB4XzA6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYueDAgPSBwYXJzZUZsb2F0KHYpO1xuICAgIH0sXG4gICAgeV8wOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLnkwID0gcGFyc2VGbG9hdCh2KTtcbiAgICB9LFxuICAgIGtfMDogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5rMCA9IHBhcnNlRmxvYXQodik7XG4gICAgfSxcbiAgICBrOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmswID0gcGFyc2VGbG9hdCh2KTtcbiAgICB9LFxuICAgIGE6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuYSA9IHBhcnNlRmxvYXQodik7XG4gICAgfSxcbiAgICBiOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmIgPSBwYXJzZUZsb2F0KHYpO1xuICAgIH0sXG4gICAgcl9hOiBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuUl9BID0gdHJ1ZTtcbiAgICB9LFxuICAgIHpvbmU6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYuem9uZSA9IHBhcnNlSW50KHYsIDEwKTtcbiAgICB9LFxuICAgIHNvdXRoOiBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYudXRtU291dGggPSB0cnVlO1xuICAgIH0sXG4gICAgdG93Z3M4NDogZnVuY3Rpb24odikge1xuICAgICAgc2VsZi5kYXR1bV9wYXJhbXMgPSB2LnNwbGl0KFwiLFwiKS5tYXAoZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChhKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgdG9fbWV0ZXI6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYudG9fbWV0ZXIgPSBwYXJzZUZsb2F0KHYpO1xuICAgIH0sXG4gICAgdW5pdHM6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHNlbGYudW5pdHMgPSB2O1xuICAgICAgaWYgKHVuaXRzW3ZdKSB7XG4gICAgICAgIHNlbGYudG9fbWV0ZXIgPSB1bml0c1t2XS50b19tZXRlcjtcbiAgICAgIH1cbiAgICB9LFxuICAgIGZyb21fZ3JlZW53aWNoOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmZyb21fZ3JlZW53aWNoID0gdiAqIEQyUjtcbiAgICB9LFxuICAgIHBtOiBmdW5jdGlvbih2KSB7XG4gICAgICBzZWxmLmZyb21fZ3JlZW53aWNoID0gKFByaW1lTWVyaWRpYW5bdl0gPyBQcmltZU1lcmlkaWFuW3ZdIDogcGFyc2VGbG9hdCh2KSkgKiBEMlI7XG4gICAgfSxcbiAgICBuYWRncmlkczogZnVuY3Rpb24odikge1xuICAgICAgaWYgKHYgPT09ICdAbnVsbCcpIHtcbiAgICAgICAgc2VsZi5kYXR1bUNvZGUgPSAnbm9uZSc7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2VsZi5uYWRncmlkcyA9IHY7XG4gICAgICB9XG4gICAgfSxcbiAgICBheGlzOiBmdW5jdGlvbih2KSB7XG4gICAgICB2YXIgbGVnYWxBeGlzID0gXCJld25zdWRcIjtcbiAgICAgIGlmICh2Lmxlbmd0aCA9PT0gMyAmJiBsZWdhbEF4aXMuaW5kZXhPZih2LnN1YnN0cigwLCAxKSkgIT09IC0xICYmIGxlZ2FsQXhpcy5pbmRleE9mKHYuc3Vic3RyKDEsIDEpKSAhPT0gLTEgJiYgbGVnYWxBeGlzLmluZGV4T2Yodi5zdWJzdHIoMiwgMSkpICE9PSAtMSkge1xuICAgICAgICBzZWxmLmF4aXMgPSB2O1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgZm9yIChwYXJhbU5hbWUgaW4gcGFyYW1PYmopIHtcbiAgICBwYXJhbVZhbCA9IHBhcmFtT2JqW3BhcmFtTmFtZV07XG4gICAgaWYgKHBhcmFtTmFtZSBpbiBwYXJhbXMpIHtcbiAgICAgIHBhcmFtT3V0bmFtZSA9IHBhcmFtc1twYXJhbU5hbWVdO1xuICAgICAgaWYgKHR5cGVvZiBwYXJhbU91dG5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcGFyYW1PdXRuYW1lKHBhcmFtVmFsKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzZWxmW3BhcmFtT3V0bmFtZV0gPSBwYXJhbVZhbDtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzZWxmW3BhcmFtTmFtZV0gPSBwYXJhbVZhbDtcbiAgICB9XG4gIH1cbiAgaWYodHlwZW9mIHNlbGYuZGF0dW1Db2RlID09PSAnc3RyaW5nJyAmJiBzZWxmLmRhdHVtQ29kZSAhPT0gXCJXR1M4NFwiKXtcbiAgICBzZWxmLmRhdHVtQ29kZSA9IHNlbGYuZGF0dW1Db2RlLnRvTG93ZXJDYXNlKCk7XG4gIH1cbiAgcmV0dXJuIHNlbGY7XG59O1xuIiwidmFyIHByb2pzID0gW1xuICByZXF1aXJlKCcuL3Byb2plY3Rpb25zL21lcmMnKSxcbiAgcmVxdWlyZSgnLi9wcm9qZWN0aW9ucy9sb25nbGF0Jylcbl07XG52YXIgbmFtZXMgPSB7fTtcbnZhciBwcm9qU3RvcmUgPSBbXTtcblxuZnVuY3Rpb24gYWRkKHByb2osIGkpIHtcbiAgdmFyIGxlbiA9IHByb2pTdG9yZS5sZW5ndGg7XG4gIGlmICghcHJvai5uYW1lcykge1xuICAgIGNvbnNvbGUubG9nKGkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHByb2pTdG9yZVtsZW5dID0gcHJvajtcbiAgcHJvai5uYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKG4pIHtcbiAgICBuYW1lc1tuLnRvTG93ZXJDYXNlKCldID0gbGVuO1xuICB9KTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbmV4cG9ydHMuYWRkID0gYWRkO1xuXG5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgaWYgKCFuYW1lKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBuID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuICBpZiAodHlwZW9mIG5hbWVzW25dICE9PSAndW5kZWZpbmVkJyAmJiBwcm9qU3RvcmVbbmFtZXNbbl1dKSB7XG4gICAgcmV0dXJuIHByb2pTdG9yZVtuYW1lc1tuXV07XG4gIH1cbn07XG5leHBvcnRzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIHByb2pzLmZvckVhY2goYWRkKTtcbn07XG4iLCJ2YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIG1zZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL21zZm56Jyk7XG52YXIgcXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vcXNmbnonKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBhc2lueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hc2lueicpO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgaWYgKE1hdGguYWJzKHRoaXMubGF0MSArIHRoaXMubGF0MikgPCBFUFNMTikge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnRlbXAgPSB0aGlzLmIgLyB0aGlzLmE7XG4gIHRoaXMuZXMgPSAxIC0gTWF0aC5wb3codGhpcy50ZW1wLCAyKTtcbiAgdGhpcy5lMyA9IE1hdGguc3FydCh0aGlzLmVzKTtcblxuICB0aGlzLnNpbl9wbyA9IE1hdGguc2luKHRoaXMubGF0MSk7XG4gIHRoaXMuY29zX3BvID0gTWF0aC5jb3ModGhpcy5sYXQxKTtcbiAgdGhpcy50MSA9IHRoaXMuc2luX3BvO1xuICB0aGlzLmNvbiA9IHRoaXMuc2luX3BvO1xuICB0aGlzLm1zMSA9IG1zZm56KHRoaXMuZTMsIHRoaXMuc2luX3BvLCB0aGlzLmNvc19wbyk7XG4gIHRoaXMucXMxID0gcXNmbnoodGhpcy5lMywgdGhpcy5zaW5fcG8sIHRoaXMuY29zX3BvKTtcblxuICB0aGlzLnNpbl9wbyA9IE1hdGguc2luKHRoaXMubGF0Mik7XG4gIHRoaXMuY29zX3BvID0gTWF0aC5jb3ModGhpcy5sYXQyKTtcbiAgdGhpcy50MiA9IHRoaXMuc2luX3BvO1xuICB0aGlzLm1zMiA9IG1zZm56KHRoaXMuZTMsIHRoaXMuc2luX3BvLCB0aGlzLmNvc19wbyk7XG4gIHRoaXMucXMyID0gcXNmbnoodGhpcy5lMywgdGhpcy5zaW5fcG8sIHRoaXMuY29zX3BvKTtcblxuICB0aGlzLnNpbl9wbyA9IE1hdGguc2luKHRoaXMubGF0MCk7XG4gIHRoaXMuY29zX3BvID0gTWF0aC5jb3ModGhpcy5sYXQwKTtcbiAgdGhpcy50MyA9IHRoaXMuc2luX3BvO1xuICB0aGlzLnFzMCA9IHFzZm56KHRoaXMuZTMsIHRoaXMuc2luX3BvLCB0aGlzLmNvc19wbyk7XG5cbiAgaWYgKE1hdGguYWJzKHRoaXMubGF0MSAtIHRoaXMubGF0MikgPiBFUFNMTikge1xuICAgIHRoaXMubnMwID0gKHRoaXMubXMxICogdGhpcy5tczEgLSB0aGlzLm1zMiAqIHRoaXMubXMyKSAvICh0aGlzLnFzMiAtIHRoaXMucXMxKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLm5zMCA9IHRoaXMuY29uO1xuICB9XG4gIHRoaXMuYyA9IHRoaXMubXMxICogdGhpcy5tczEgKyB0aGlzLm5zMCAqIHRoaXMucXMxO1xuICB0aGlzLnJoID0gdGhpcy5hICogTWF0aC5zcXJ0KHRoaXMuYyAtIHRoaXMubnMwICogdGhpcy5xczApIC8gdGhpcy5uczA7XG59O1xuXG4vKiBBbGJlcnMgQ29uaWNhbCBFcXVhbCBBcmVhIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcblxuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuXG4gIHRoaXMuc2luX3BoaSA9IE1hdGguc2luKGxhdCk7XG4gIHRoaXMuY29zX3BoaSA9IE1hdGguY29zKGxhdCk7XG5cbiAgdmFyIHFzID0gcXNmbnoodGhpcy5lMywgdGhpcy5zaW5fcGhpLCB0aGlzLmNvc19waGkpO1xuICB2YXIgcmgxID0gdGhpcy5hICogTWF0aC5zcXJ0KHRoaXMuYyAtIHRoaXMubnMwICogcXMpIC8gdGhpcy5uczA7XG4gIHZhciB0aGV0YSA9IHRoaXMubnMwICogYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIHggPSByaDEgKiBNYXRoLnNpbih0aGV0YSkgKyB0aGlzLngwO1xuICB2YXIgeSA9IHRoaXMucmggLSByaDEgKiBNYXRoLmNvcyh0aGV0YSkgKyB0aGlzLnkwO1xuXG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciByaDEsIHFzLCBjb24sIHRoZXRhLCBsb24sIGxhdDtcblxuICBwLnggLT0gdGhpcy54MDtcbiAgcC55ID0gdGhpcy5yaCAtIHAueSArIHRoaXMueTA7XG4gIGlmICh0aGlzLm5zMCA+PSAwKSB7XG4gICAgcmgxID0gTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gICAgY29uID0gMTtcbiAgfVxuICBlbHNlIHtcbiAgICByaDEgPSAtTWF0aC5zcXJ0KHAueCAqIHAueCArIHAueSAqIHAueSk7XG4gICAgY29uID0gLTE7XG4gIH1cbiAgdGhldGEgPSAwO1xuICBpZiAocmgxICE9PSAwKSB7XG4gICAgdGhldGEgPSBNYXRoLmF0YW4yKGNvbiAqIHAueCwgY29uICogcC55KTtcbiAgfVxuICBjb24gPSByaDEgKiB0aGlzLm5zMCAvIHRoaXMuYTtcbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgbGF0ID0gTWF0aC5hc2luKCh0aGlzLmMgLSBjb24gKiBjb24pIC8gKDIgKiB0aGlzLm5zMCkpO1xuICB9XG4gIGVsc2Uge1xuICAgIHFzID0gKHRoaXMuYyAtIGNvbiAqIGNvbikgLyB0aGlzLm5zMDtcbiAgICBsYXQgPSB0aGlzLnBoaTF6KHRoaXMuZTMsIHFzKTtcbiAgfVxuXG4gIGxvbiA9IGFkanVzdF9sb24odGhldGEgLyB0aGlzLm5zMCArIHRoaXMubG9uZzApO1xuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBGdW5jdGlvbiB0byBjb21wdXRlIHBoaTEsIHRoZSBsYXRpdHVkZSBmb3IgdGhlIGludmVyc2Ugb2YgdGhlXG4gICBBbGJlcnMgQ29uaWNhbCBFcXVhbC1BcmVhIHByb2plY3Rpb24uXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMucGhpMXogPSBmdW5jdGlvbihlY2NlbnQsIHFzKSB7XG4gIHZhciBzaW5waGksIGNvc3BoaSwgY29uLCBjb20sIGRwaGk7XG4gIHZhciBwaGkgPSBhc2lueigwLjUgKiBxcyk7XG4gIGlmIChlY2NlbnQgPCBFUFNMTikge1xuICAgIHJldHVybiBwaGk7XG4gIH1cblxuICB2YXIgZWNjbnRzID0gZWNjZW50ICogZWNjZW50O1xuICBmb3IgKHZhciBpID0gMTsgaSA8PSAyNTsgaSsrKSB7XG4gICAgc2lucGhpID0gTWF0aC5zaW4ocGhpKTtcbiAgICBjb3NwaGkgPSBNYXRoLmNvcyhwaGkpO1xuICAgIGNvbiA9IGVjY2VudCAqIHNpbnBoaTtcbiAgICBjb20gPSAxIC0gY29uICogY29uO1xuICAgIGRwaGkgPSAwLjUgKiBjb20gKiBjb20gLyBjb3NwaGkgKiAocXMgLyAoMSAtIGVjY250cykgLSBzaW5waGkgLyBjb20gKyAwLjUgLyBlY2NlbnQgKiBNYXRoLmxvZygoMSAtIGNvbikgLyAoMSArIGNvbikpKTtcbiAgICBwaGkgPSBwaGkgKyBkcGhpO1xuICAgIGlmIChNYXRoLmFicyhkcGhpKSA8PSAxZS03KSB7XG4gICAgICByZXR1cm4gcGhpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiQWxiZXJzX0NvbmljX0VxdWFsX0FyZWFcIiwgXCJBbGJlcnNcIiwgXCJhZWFcIl07XG4iLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tbGZuJyk7XG52YXIgZTBmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMGZuJyk7XG52YXIgZTFmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMWZuJyk7XG52YXIgZTJmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMmZuJyk7XG52YXIgZTNmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lM2ZuJyk7XG52YXIgZ04gPSByZXF1aXJlKCcuLi9jb21tb24vZ04nKTtcbnZhciBhc2lueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hc2lueicpO1xudmFyIGltbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2ltbGZuJyk7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zaW5fcDEyID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgdGhpcy5jb3NfcDEyID0gTWF0aC5jb3ModGhpcy5sYXQwKTtcbn07XG5cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIHNpbnBoaSA9IE1hdGguc2luKHAueSk7XG4gIHZhciBjb3NwaGkgPSBNYXRoLmNvcyhwLnkpO1xuICB2YXIgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciBlMCwgZTEsIGUyLCBlMywgTWxwLCBNbCwgdGFucGhpLCBObDEsIE5sLCBwc2ksIEF6LCBHLCBILCBHSCwgSHMsIGMsIGtwLCBjb3NfYywgcywgczIsIHMzLCBzNCwgczU7XG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGlmIChNYXRoLmFicyh0aGlzLnNpbl9wMTIgLSAxKSA8PSBFUFNMTikge1xuICAgICAgLy9Ob3J0aCBQb2xlIGNhc2VcbiAgICAgIHAueCA9IHRoaXMueDAgKyB0aGlzLmEgKiAoSEFMRl9QSSAtIGxhdCkgKiBNYXRoLnNpbihkbG9uKTtcbiAgICAgIHAueSA9IHRoaXMueTAgLSB0aGlzLmEgKiAoSEFMRl9QSSAtIGxhdCkgKiBNYXRoLmNvcyhkbG9uKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBlbHNlIGlmIChNYXRoLmFicyh0aGlzLnNpbl9wMTIgKyAxKSA8PSBFUFNMTikge1xuICAgICAgLy9Tb3V0aCBQb2xlIGNhc2VcbiAgICAgIHAueCA9IHRoaXMueDAgKyB0aGlzLmEgKiAoSEFMRl9QSSArIGxhdCkgKiBNYXRoLnNpbihkbG9uKTtcbiAgICAgIHAueSA9IHRoaXMueTAgKyB0aGlzLmEgKiAoSEFMRl9QSSArIGxhdCkgKiBNYXRoLmNvcyhkbG9uKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vZGVmYXVsdCBjYXNlXG4gICAgICBjb3NfYyA9IHRoaXMuc2luX3AxMiAqIHNpbnBoaSArIHRoaXMuY29zX3AxMiAqIGNvc3BoaSAqIE1hdGguY29zKGRsb24pO1xuICAgICAgYyA9IE1hdGguYWNvcyhjb3NfYyk7XG4gICAgICBrcCA9IGMgLyBNYXRoLnNpbihjKTtcbiAgICAgIHAueCA9IHRoaXMueDAgKyB0aGlzLmEgKiBrcCAqIGNvc3BoaSAqIE1hdGguc2luKGRsb24pO1xuICAgICAgcC55ID0gdGhpcy55MCArIHRoaXMuYSAqIGtwICogKHRoaXMuY29zX3AxMiAqIHNpbnBoaSAtIHRoaXMuc2luX3AxMiAqIGNvc3BoaSAqIE1hdGguY29zKGRsb24pKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBlMCA9IGUwZm4odGhpcy5lcyk7XG4gICAgZTEgPSBlMWZuKHRoaXMuZXMpO1xuICAgIGUyID0gZTJmbih0aGlzLmVzKTtcbiAgICBlMyA9IGUzZm4odGhpcy5lcyk7XG4gICAgaWYgKE1hdGguYWJzKHRoaXMuc2luX3AxMiAtIDEpIDw9IEVQU0xOKSB7XG4gICAgICAvL05vcnRoIFBvbGUgY2FzZVxuICAgICAgTWxwID0gdGhpcy5hICogbWxmbihlMCwgZTEsIGUyLCBlMywgSEFMRl9QSSk7XG4gICAgICBNbCA9IHRoaXMuYSAqIG1sZm4oZTAsIGUxLCBlMiwgZTMsIGxhdCk7XG4gICAgICBwLnggPSB0aGlzLngwICsgKE1scCAtIE1sKSAqIE1hdGguc2luKGRsb24pO1xuICAgICAgcC55ID0gdGhpcy55MCAtIChNbHAgLSBNbCkgKiBNYXRoLmNvcyhkbG9uKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBlbHNlIGlmIChNYXRoLmFicyh0aGlzLnNpbl9wMTIgKyAxKSA8PSBFUFNMTikge1xuICAgICAgLy9Tb3V0aCBQb2xlIGNhc2VcbiAgICAgIE1scCA9IHRoaXMuYSAqIG1sZm4oZTAsIGUxLCBlMiwgZTMsIEhBTEZfUEkpO1xuICAgICAgTWwgPSB0aGlzLmEgKiBtbGZuKGUwLCBlMSwgZTIsIGUzLCBsYXQpO1xuICAgICAgcC54ID0gdGhpcy54MCArIChNbHAgKyBNbCkgKiBNYXRoLnNpbihkbG9uKTtcbiAgICAgIHAueSA9IHRoaXMueTAgKyAoTWxwICsgTWwpICogTWF0aC5jb3MoZGxvbik7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvL0RlZmF1bHQgY2FzZVxuICAgICAgdGFucGhpID0gc2lucGhpIC8gY29zcGhpO1xuICAgICAgTmwxID0gZ04odGhpcy5hLCB0aGlzLmUsIHRoaXMuc2luX3AxMik7XG4gICAgICBObCA9IGdOKHRoaXMuYSwgdGhpcy5lLCBzaW5waGkpO1xuICAgICAgcHNpID0gTWF0aC5hdGFuKCgxIC0gdGhpcy5lcykgKiB0YW5waGkgKyB0aGlzLmVzICogTmwxICogdGhpcy5zaW5fcDEyIC8gKE5sICogY29zcGhpKSk7XG4gICAgICBBeiA9IE1hdGguYXRhbjIoTWF0aC5zaW4oZGxvbiksIHRoaXMuY29zX3AxMiAqIE1hdGgudGFuKHBzaSkgLSB0aGlzLnNpbl9wMTIgKiBNYXRoLmNvcyhkbG9uKSk7XG4gICAgICBpZiAoQXogPT09IDApIHtcbiAgICAgICAgcyA9IE1hdGguYXNpbih0aGlzLmNvc19wMTIgKiBNYXRoLnNpbihwc2kpIC0gdGhpcy5zaW5fcDEyICogTWF0aC5jb3MocHNpKSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChNYXRoLmFicyhNYXRoLmFicyhBeikgLSBNYXRoLlBJKSA8PSBFUFNMTikge1xuICAgICAgICBzID0gLU1hdGguYXNpbih0aGlzLmNvc19wMTIgKiBNYXRoLnNpbihwc2kpIC0gdGhpcy5zaW5fcDEyICogTWF0aC5jb3MocHNpKSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcyA9IE1hdGguYXNpbihNYXRoLnNpbihkbG9uKSAqIE1hdGguY29zKHBzaSkgLyBNYXRoLnNpbihBeikpO1xuICAgICAgfVxuICAgICAgRyA9IHRoaXMuZSAqIHRoaXMuc2luX3AxMiAvIE1hdGguc3FydCgxIC0gdGhpcy5lcyk7XG4gICAgICBIID0gdGhpcy5lICogdGhpcy5jb3NfcDEyICogTWF0aC5jb3MoQXopIC8gTWF0aC5zcXJ0KDEgLSB0aGlzLmVzKTtcbiAgICAgIEdIID0gRyAqIEg7XG4gICAgICBIcyA9IEggKiBIO1xuICAgICAgczIgPSBzICogcztcbiAgICAgIHMzID0gczIgKiBzO1xuICAgICAgczQgPSBzMyAqIHM7XG4gICAgICBzNSA9IHM0ICogcztcbiAgICAgIGMgPSBObDEgKiBzICogKDEgLSBzMiAqIEhzICogKDEgLSBIcykgLyA2ICsgczMgLyA4ICogR0ggKiAoMSAtIDIgKiBIcykgKyBzNCAvIDEyMCAqIChIcyAqICg0IC0gNyAqIEhzKSAtIDMgKiBHICogRyAqICgxIC0gNyAqIEhzKSkgLSBzNSAvIDQ4ICogR0gpO1xuICAgICAgcC54ID0gdGhpcy54MCArIGMgKiBNYXRoLnNpbihBeik7XG4gICAgICBwLnkgPSB0aGlzLnkwICsgYyAqIE1hdGguY29zKEF6KTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgfVxuXG5cbn07XG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICB2YXIgcmgsIHosIHNpbnosIGNvc3osIGxvbiwgbGF0LCBjb24sIGUwLCBlMSwgZTIsIGUzLCBNbHAsIE0sIE4xLCBwc2ksIEF6LCBjb3NBeiwgdG1wLCBBLCBCLCBELCBFZSwgRjtcbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgcmggPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgICBpZiAocmggPiAoMiAqIEhBTEZfUEkgKiB0aGlzLmEpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHogPSByaCAvIHRoaXMuYTtcblxuICAgIHNpbnogPSBNYXRoLnNpbih6KTtcbiAgICBjb3N6ID0gTWF0aC5jb3Moeik7XG5cbiAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgIGlmIChNYXRoLmFicyhyaCkgPD0gRVBTTE4pIHtcbiAgICAgIGxhdCA9IHRoaXMubGF0MDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsYXQgPSBhc2lueihjb3N6ICogdGhpcy5zaW5fcDEyICsgKHAueSAqIHNpbnogKiB0aGlzLmNvc19wMTIpIC8gcmgpO1xuICAgICAgY29uID0gTWF0aC5hYnModGhpcy5sYXQwKSAtIEhBTEZfUEk7XG4gICAgICBpZiAoTWF0aC5hYnMoY29uKSA8PSBFUFNMTikge1xuICAgICAgICBpZiAodGhpcy5sYXQwID49IDApIHtcbiAgICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCwgLSBwLnkpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgLSBNYXRoLmF0YW4yKC1wLngsIHAueSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLypjb24gPSBjb3N6IC0gdGhpcy5zaW5fcDEyICogTWF0aC5zaW4obGF0KTtcbiAgICAgICAgaWYgKChNYXRoLmFicyhjb24pIDwgRVBTTE4pICYmIChNYXRoLmFicyhwLngpIDwgRVBTTE4pKSB7XG4gICAgICAgICAgLy9uby1vcCwganVzdCBrZWVwIHRoZSBsb24gdmFsdWUgYXMgaXNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgdGVtcCA9IE1hdGguYXRhbjIoKHAueCAqIHNpbnogKiB0aGlzLmNvc19wMTIpLCAoY29uICogcmgpKTtcbiAgICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKChwLnggKiBzaW56ICogdGhpcy5jb3NfcDEyKSwgKGNvbiAqIHJoKSkpO1xuICAgICAgICB9Ki9cbiAgICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLnggKiBzaW56LCByaCAqIHRoaXMuY29zX3AxMiAqIGNvc3ogLSBwLnkgKiB0aGlzLnNpbl9wMTIgKiBzaW56KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcC54ID0gbG9uO1xuICAgIHAueSA9IGxhdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuICBlbHNlIHtcbiAgICBlMCA9IGUwZm4odGhpcy5lcyk7XG4gICAgZTEgPSBlMWZuKHRoaXMuZXMpO1xuICAgIGUyID0gZTJmbih0aGlzLmVzKTtcbiAgICBlMyA9IGUzZm4odGhpcy5lcyk7XG4gICAgaWYgKE1hdGguYWJzKHRoaXMuc2luX3AxMiAtIDEpIDw9IEVQU0xOKSB7XG4gICAgICAvL05vcnRoIHBvbGUgY2FzZVxuICAgICAgTWxwID0gdGhpcy5hICogbWxmbihlMCwgZTEsIGUyLCBlMywgSEFMRl9QSSk7XG4gICAgICByaCA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgICAgTSA9IE1scCAtIHJoO1xuICAgICAgbGF0ID0gaW1sZm4oTSAvIHRoaXMuYSwgZTAsIGUxLCBlMiwgZTMpO1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLngsIC0gMSAqIHAueSkpO1xuICAgICAgcC54ID0gbG9uO1xuICAgICAgcC55ID0gbGF0O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGVsc2UgaWYgKE1hdGguYWJzKHRoaXMuc2luX3AxMiArIDEpIDw9IEVQU0xOKSB7XG4gICAgICAvL1NvdXRoIHBvbGUgY2FzZVxuICAgICAgTWxwID0gdGhpcy5hICogbWxmbihlMCwgZTEsIGUyLCBlMywgSEFMRl9QSSk7XG4gICAgICByaCA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgICAgTSA9IHJoIC0gTWxwO1xuXG4gICAgICBsYXQgPSBpbWxmbihNIC8gdGhpcy5hLCBlMCwgZTEsIGUyLCBlMyk7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCwgcC55KSk7XG4gICAgICBwLnggPSBsb247XG4gICAgICBwLnkgPSBsYXQ7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvL2RlZmF1bHQgY2FzZVxuICAgICAgcmggPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgICAgIEF6ID0gTWF0aC5hdGFuMihwLngsIHAueSk7XG4gICAgICBOMSA9IGdOKHRoaXMuYSwgdGhpcy5lLCB0aGlzLnNpbl9wMTIpO1xuICAgICAgY29zQXogPSBNYXRoLmNvcyhBeik7XG4gICAgICB0bXAgPSB0aGlzLmUgKiB0aGlzLmNvc19wMTIgKiBjb3NBejtcbiAgICAgIEEgPSAtdG1wICogdG1wIC8gKDEgLSB0aGlzLmVzKTtcbiAgICAgIEIgPSAzICogdGhpcy5lcyAqICgxIC0gQSkgKiB0aGlzLnNpbl9wMTIgKiB0aGlzLmNvc19wMTIgKiBjb3NBeiAvICgxIC0gdGhpcy5lcyk7XG4gICAgICBEID0gcmggLyBOMTtcbiAgICAgIEVlID0gRCAtIEEgKiAoMSArIEEpICogTWF0aC5wb3coRCwgMykgLyA2IC0gQiAqICgxICsgMyAqIEEpICogTWF0aC5wb3coRCwgNCkgLyAyNDtcbiAgICAgIEYgPSAxIC0gQSAqIEVlICogRWUgLyAyIC0gRCAqIEVlICogRWUgKiBFZSAvIDY7XG4gICAgICBwc2kgPSBNYXRoLmFzaW4odGhpcy5zaW5fcDEyICogTWF0aC5jb3MoRWUpICsgdGhpcy5jb3NfcDEyICogTWF0aC5zaW4oRWUpICogY29zQXopO1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hc2luKE1hdGguc2luKEF6KSAqIE1hdGguc2luKEVlKSAvIE1hdGguY29zKHBzaSkpKTtcbiAgICAgIGxhdCA9IE1hdGguYXRhbigoMSAtIHRoaXMuZXMgKiBGICogdGhpcy5zaW5fcDEyIC8gTWF0aC5zaW4ocHNpKSkgKiBNYXRoLnRhbihwc2kpIC8gKDEgLSB0aGlzLmVzKSk7XG4gICAgICBwLnggPSBsb247XG4gICAgICBwLnkgPSBsYXQ7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gIH1cblxufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJBemltdXRoYWxfRXF1aWRpc3RhbnRcIiwgXCJhZXFkXCJdO1xuIiwidmFyIG1sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vbWxmbicpO1xudmFyIGUwZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTBmbicpO1xudmFyIGUxZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTFmbicpO1xudmFyIGUyZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTJmbicpO1xudmFyIGUzZm4gPSByZXF1aXJlKCcuLi9jb21tb24vZTNmbicpO1xudmFyIGdOID0gcmVxdWlyZSgnLi4vY29tbW9uL2dOJyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgYWRqdXN0X2xhdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbGF0Jyk7XG52YXIgaW1sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vaW1sZm4nKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXRoaXMuc3BoZXJlKSB7XG4gICAgdGhpcy5lMCA9IGUwZm4odGhpcy5lcyk7XG4gICAgdGhpcy5lMSA9IGUxZm4odGhpcy5lcyk7XG4gICAgdGhpcy5lMiA9IGUyZm4odGhpcy5lcyk7XG4gICAgdGhpcy5lMyA9IGUzZm4odGhpcy5lcyk7XG4gICAgdGhpcy5tbDAgPSB0aGlzLmEgKiBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIHRoaXMubGF0MCk7XG4gIH1cbn07XG5cblxuXG4vKiBDYXNzaW5pIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG5cbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdmFyIHgsIHk7XG4gIHZhciBsYW0gPSBwLng7XG4gIHZhciBwaGkgPSBwLnk7XG4gIGxhbSA9IGFkanVzdF9sb24obGFtIC0gdGhpcy5sb25nMCk7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgeCA9IHRoaXMuYSAqIE1hdGguYXNpbihNYXRoLmNvcyhwaGkpICogTWF0aC5zaW4obGFtKSk7XG4gICAgeSA9IHRoaXMuYSAqIChNYXRoLmF0YW4yKE1hdGgudGFuKHBoaSksIE1hdGguY29zKGxhbSkpIC0gdGhpcy5sYXQwKTtcbiAgfVxuICBlbHNlIHtcbiAgICAvL2VsbGlwc29pZFxuICAgIHZhciBzaW5waGkgPSBNYXRoLnNpbihwaGkpO1xuICAgIHZhciBjb3NwaGkgPSBNYXRoLmNvcyhwaGkpO1xuICAgIHZhciBubCA9IGdOKHRoaXMuYSwgdGhpcy5lLCBzaW5waGkpO1xuICAgIHZhciB0bCA9IE1hdGgudGFuKHBoaSkgKiBNYXRoLnRhbihwaGkpO1xuICAgIHZhciBhbCA9IGxhbSAqIE1hdGguY29zKHBoaSk7XG4gICAgdmFyIGFzcSA9IGFsICogYWw7XG4gICAgdmFyIGNsID0gdGhpcy5lcyAqIGNvc3BoaSAqIGNvc3BoaSAvICgxIC0gdGhpcy5lcyk7XG4gICAgdmFyIG1sID0gdGhpcy5hICogbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCBwaGkpO1xuXG4gICAgeCA9IG5sICogYWwgKiAoMSAtIGFzcSAqIHRsICogKDEgLyA2IC0gKDggLSB0bCArIDggKiBjbCkgKiBhc3EgLyAxMjApKTtcbiAgICB5ID0gbWwgLSB0aGlzLm1sMCArIG5sICogc2lucGhpIC8gY29zcGhpICogYXNxICogKDAuNSArICg1IC0gdGwgKyA2ICogY2wpICogYXNxIC8gMjQpO1xuXG5cbiAgfVxuXG4gIHAueCA9IHggKyB0aGlzLngwO1xuICBwLnkgPSB5ICsgdGhpcy55MDtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBJbnZlcnNlIGVxdWF0aW9uc1xuICAtLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgLT0gdGhpcy55MDtcbiAgdmFyIHggPSBwLnggLyB0aGlzLmE7XG4gIHZhciB5ID0gcC55IC8gdGhpcy5hO1xuICB2YXIgcGhpLCBsYW07XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgdmFyIGRkID0geSArIHRoaXMubGF0MDtcbiAgICBwaGkgPSBNYXRoLmFzaW4oTWF0aC5zaW4oZGQpICogTWF0aC5jb3MoeCkpO1xuICAgIGxhbSA9IE1hdGguYXRhbjIoTWF0aC50YW4oeCksIE1hdGguY29zKGRkKSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgLyogZWxsaXBzb2lkICovXG4gICAgdmFyIG1sMSA9IHRoaXMubWwwIC8gdGhpcy5hICsgeTtcbiAgICB2YXIgcGhpMSA9IGltbGZuKG1sMSwgdGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMyk7XG4gICAgaWYgKE1hdGguYWJzKE1hdGguYWJzKHBoaTEpIC0gSEFMRl9QSSkgPD0gRVBTTE4pIHtcbiAgICAgIHAueCA9IHRoaXMubG9uZzA7XG4gICAgICBwLnkgPSBIQUxGX1BJO1xuICAgICAgaWYgKHkgPCAwKSB7XG4gICAgICAgIHAueSAqPSAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICB2YXIgbmwxID0gZ04odGhpcy5hLCB0aGlzLmUsIE1hdGguc2luKHBoaTEpKTtcblxuICAgIHZhciBybDEgPSBubDEgKiBubDEgKiBubDEgLyB0aGlzLmEgLyB0aGlzLmEgKiAoMSAtIHRoaXMuZXMpO1xuICAgIHZhciB0bDEgPSBNYXRoLnBvdyhNYXRoLnRhbihwaGkxKSwgMik7XG4gICAgdmFyIGRsID0geCAqIHRoaXMuYSAvIG5sMTtcbiAgICB2YXIgZHNxID0gZGwgKiBkbDtcbiAgICBwaGkgPSBwaGkxIC0gbmwxICogTWF0aC50YW4ocGhpMSkgLyBybDEgKiBkbCAqIGRsICogKDAuNSAtICgxICsgMyAqIHRsMSkgKiBkbCAqIGRsIC8gMjQpO1xuICAgIGxhbSA9IGRsICogKDEgLSBkc3EgKiAodGwxIC8gMyArICgxICsgMyAqIHRsMSkgKiB0bDEgKiBkc3EgLyAxNSkpIC8gTWF0aC5jb3MocGhpMSk7XG5cbiAgfVxuXG4gIHAueCA9IGFkanVzdF9sb24obGFtICsgdGhpcy5sb25nMCk7XG4gIHAueSA9IGFkanVzdF9sYXQocGhpKTtcbiAgcmV0dXJuIHA7XG5cbn07XG5leHBvcnRzLm5hbWVzID0gW1wiQ2Fzc2luaVwiLCBcIkNhc3NpbmlfU29sZG5lclwiLCBcImNhc3NcIl07IiwidmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIHFzZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL3FzZm56Jyk7XG52YXIgbXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vbXNmbnonKTtcbnZhciBpcXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vaXFzZm56Jyk7XG4vKlxuICByZWZlcmVuY2U6ICBcbiAgICBcIkNhcnRvZ3JhcGhpYyBQcm9qZWN0aW9uIFByb2NlZHVyZXMgZm9yIHRoZSBVTklYIEVudmlyb25tZW50LVxuICAgIEEgVXNlcidzIE1hbnVhbFwiIGJ5IEdlcmFsZCBJLiBFdmVuZGVuLFxuICAgIFVTR1MgT3BlbiBGaWxlIFJlcG9ydCA5MC0yODRhbmQgUmVsZWFzZSA0IEludGVyaW0gUmVwb3J0cyAoMjAwMylcbiovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgLy9uby1vcFxuICBpZiAoIXRoaXMuc3BoZXJlKSB7XG4gICAgdGhpcy5rMCA9IG1zZm56KHRoaXMuZSwgTWF0aC5zaW4odGhpcy5sYXRfdHMpLCBNYXRoLmNvcyh0aGlzLmxhdF90cykpO1xuICB9XG59O1xuXG5cbi8qIEN5bGluZHJpY2FsIEVxdWFsIEFyZWEgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIHgsIHk7XG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgeCA9IHRoaXMueDAgKyB0aGlzLmEgKiBkbG9uICogTWF0aC5jb3ModGhpcy5sYXRfdHMpO1xuICAgIHkgPSB0aGlzLnkwICsgdGhpcy5hICogTWF0aC5zaW4obGF0KSAvIE1hdGguY29zKHRoaXMubGF0X3RzKTtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgcXMgPSBxc2Zueih0aGlzLmUsIE1hdGguc2luKGxhdCkpO1xuICAgIHggPSB0aGlzLngwICsgdGhpcy5hICogdGhpcy5rMCAqIGRsb247XG4gICAgeSA9IHRoaXMueTAgKyB0aGlzLmEgKiBxcyAqIDAuNSAvIHRoaXMuazA7XG4gIH1cblxuICBwLnggPSB4O1xuICBwLnkgPSB5O1xuICByZXR1cm4gcDtcbn07XG5cbi8qIEN5bGluZHJpY2FsIEVxdWFsIEFyZWEgaW52ZXJzZSBlcXVhdGlvbnMtLW1hcHBpbmcgeCx5IHRvIGxhdC9sb25nXG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICB2YXIgbG9uLCBsYXQ7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgKHAueCAvIHRoaXMuYSkgLyBNYXRoLmNvcyh0aGlzLmxhdF90cykpO1xuICAgIGxhdCA9IE1hdGguYXNpbigocC55IC8gdGhpcy5hKSAqIE1hdGguY29zKHRoaXMubGF0X3RzKSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgbGF0ID0gaXFzZm56KHRoaXMuZSwgMiAqIHAueSAqIHRoaXMuazAgLyB0aGlzLmEpO1xuICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIHAueCAvICh0aGlzLmEgKiB0aGlzLmswKSk7XG4gIH1cblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcImNlYVwiXTtcbiIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBhZGp1c3RfbGF0ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sYXQnKTtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIHRoaXMueDAgPSB0aGlzLngwIHx8IDA7XG4gIHRoaXMueTAgPSB0aGlzLnkwIHx8IDA7XG4gIHRoaXMubGF0MCA9IHRoaXMubGF0MCB8fCAwO1xuICB0aGlzLmxvbmcwID0gdGhpcy5sb25nMCB8fCAwO1xuICB0aGlzLmxhdF90cyA9IHRoaXMubGF0X3RzIHx8IDA7XG4gIHRoaXMudGl0bGUgPSB0aGlzLnRpdGxlIHx8IFwiRXF1aWRpc3RhbnQgQ3lsaW5kcmljYWwgKFBsYXRlIENhcnJlKVwiO1xuXG4gIHRoaXMucmMgPSBNYXRoLmNvcyh0aGlzLmxhdF90cyk7XG59O1xuXG5cbi8vIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcblxuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuXG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIGRsYXQgPSBhZGp1c3RfbGF0KGxhdCAtIHRoaXMubGF0MCk7XG4gIHAueCA9IHRoaXMueDAgKyAodGhpcy5hICogZGxvbiAqIHRoaXMucmMpO1xuICBwLnkgPSB0aGlzLnkwICsgKHRoaXMuYSAqIGRsYXQpO1xuICByZXR1cm4gcDtcbn07XG5cbi8vIGludmVyc2UgZXF1YXRpb25zLS1tYXBwaW5nIHgseSB0byBsYXQvbG9uZ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcblxuICB2YXIgeCA9IHAueDtcbiAgdmFyIHkgPSBwLnk7XG5cbiAgcC54ID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgKCh4IC0gdGhpcy54MCkgLyAodGhpcy5hICogdGhpcy5yYykpKTtcbiAgcC55ID0gYWRqdXN0X2xhdCh0aGlzLmxhdDAgKyAoKHkgLSB0aGlzLnkwKSAvICh0aGlzLmEpKSk7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJFcXVpcmVjdGFuZ3VsYXJcIiwgXCJFcXVpZGlzdGFudF9DeWxpbmRyaWNhbFwiLCBcImVxY1wiXTtcbiIsInZhciBlMGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UwZm4nKTtcbnZhciBlMWZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UxZm4nKTtcbnZhciBlMmZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UyZm4nKTtcbnZhciBlM2ZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UzZm4nKTtcbnZhciBtc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tc2ZueicpO1xudmFyIG1sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vbWxmbicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIGFkanVzdF9sYXQgPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xhdCcpO1xudmFyIGltbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2ltbGZuJyk7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgLyogUGxhY2UgcGFyYW1ldGVycyBpbiBzdGF0aWMgc3RvcmFnZSBmb3IgY29tbW9uIHVzZVxuICAgICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIC8vIFN0YW5kYXJkIFBhcmFsbGVscyBjYW5ub3QgYmUgZXF1YWwgYW5kIG9uIG9wcG9zaXRlIHNpZGVzIG9mIHRoZSBlcXVhdG9yXG4gIGlmIChNYXRoLmFicyh0aGlzLmxhdDEgKyB0aGlzLmxhdDIpIDwgRVBTTE4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5sYXQyID0gdGhpcy5sYXQyIHx8IHRoaXMubGF0MTtcbiAgdGhpcy50ZW1wID0gdGhpcy5iIC8gdGhpcy5hO1xuICB0aGlzLmVzID0gMSAtIE1hdGgucG93KHRoaXMudGVtcCwgMik7XG4gIHRoaXMuZSA9IE1hdGguc3FydCh0aGlzLmVzKTtcbiAgdGhpcy5lMCA9IGUwZm4odGhpcy5lcyk7XG4gIHRoaXMuZTEgPSBlMWZuKHRoaXMuZXMpO1xuICB0aGlzLmUyID0gZTJmbih0aGlzLmVzKTtcbiAgdGhpcy5lMyA9IGUzZm4odGhpcy5lcyk7XG5cbiAgdGhpcy5zaW5waGkgPSBNYXRoLnNpbih0aGlzLmxhdDEpO1xuICB0aGlzLmNvc3BoaSA9IE1hdGguY29zKHRoaXMubGF0MSk7XG5cbiAgdGhpcy5tczEgPSBtc2Zueih0aGlzLmUsIHRoaXMuc2lucGhpLCB0aGlzLmNvc3BoaSk7XG4gIHRoaXMubWwxID0gbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCB0aGlzLmxhdDEpO1xuXG4gIGlmIChNYXRoLmFicyh0aGlzLmxhdDEgLSB0aGlzLmxhdDIpIDwgRVBTTE4pIHtcbiAgICB0aGlzLm5zID0gdGhpcy5zaW5waGk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5zaW5waGkgPSBNYXRoLnNpbih0aGlzLmxhdDIpO1xuICAgIHRoaXMuY29zcGhpID0gTWF0aC5jb3ModGhpcy5sYXQyKTtcbiAgICB0aGlzLm1zMiA9IG1zZm56KHRoaXMuZSwgdGhpcy5zaW5waGksIHRoaXMuY29zcGhpKTtcbiAgICB0aGlzLm1sMiA9IG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgdGhpcy5sYXQyKTtcbiAgICB0aGlzLm5zID0gKHRoaXMubXMxIC0gdGhpcy5tczIpIC8gKHRoaXMubWwyIC0gdGhpcy5tbDEpO1xuICB9XG4gIHRoaXMuZyA9IHRoaXMubWwxICsgdGhpcy5tczEgLyB0aGlzLm5zO1xuICB0aGlzLm1sMCA9IG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgdGhpcy5sYXQwKTtcbiAgdGhpcy5yaCA9IHRoaXMuYSAqICh0aGlzLmcgLSB0aGlzLm1sMCk7XG59O1xuXG5cbi8qIEVxdWlkaXN0YW50IENvbmljIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIHZhciByaDE7XG5cbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgcmgxID0gdGhpcy5hICogKHRoaXMuZyAtIGxhdCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIG1sID0gbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCBsYXQpO1xuICAgIHJoMSA9IHRoaXMuYSAqICh0aGlzLmcgLSBtbCk7XG4gIH1cbiAgdmFyIHRoZXRhID0gdGhpcy5ucyAqIGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciB4ID0gdGhpcy54MCArIHJoMSAqIE1hdGguc2luKHRoZXRhKTtcbiAgdmFyIHkgPSB0aGlzLnkwICsgdGhpcy5yaCAtIHJoMSAqIE1hdGguY29zKHRoZXRhKTtcbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBJbnZlcnNlIGVxdWF0aW9uc1xuICAtLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHAueCAtPSB0aGlzLngwO1xuICBwLnkgPSB0aGlzLnJoIC0gcC55ICsgdGhpcy55MDtcbiAgdmFyIGNvbiwgcmgxLCBsYXQsIGxvbjtcbiAgaWYgKHRoaXMubnMgPj0gMCkge1xuICAgIHJoMSA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgIGNvbiA9IDE7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmgxID0gLU1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICAgIGNvbiA9IC0xO1xuICB9XG4gIHZhciB0aGV0YSA9IDA7XG4gIGlmIChyaDEgIT09IDApIHtcbiAgICB0aGV0YSA9IE1hdGguYXRhbjIoY29uICogcC54LCBjb24gKiBwLnkpO1xuICB9XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgdGhldGEgLyB0aGlzLm5zKTtcbiAgICBsYXQgPSBhZGp1c3RfbGF0KHRoaXMuZyAtIHJoMSAvIHRoaXMuYSk7XG4gICAgcC54ID0gbG9uO1xuICAgIHAueSA9IGxhdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgbWwgPSB0aGlzLmcgLSByaDEgLyB0aGlzLmE7XG4gICAgbGF0ID0gaW1sZm4obWwsIHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMpO1xuICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIHRoZXRhIC8gdGhpcy5ucyk7XG4gICAgcC54ID0gbG9uO1xuICAgIHAueSA9IGxhdDtcbiAgICByZXR1cm4gcDtcbiAgfVxuXG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIkVxdWlkaXN0YW50X0NvbmljXCIsIFwiZXFkY1wiXTtcbiIsInZhciBGT1JUUEkgPSBNYXRoLlBJLzQ7XG52YXIgc3JhdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9zcmF0Jyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBNQVhfSVRFUiA9IDIwO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzcGhpID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgdmFyIGNwaGkgPSBNYXRoLmNvcyh0aGlzLmxhdDApO1xuICBjcGhpICo9IGNwaGk7XG4gIHRoaXMucmMgPSBNYXRoLnNxcnQoMSAtIHRoaXMuZXMpIC8gKDEgLSB0aGlzLmVzICogc3BoaSAqIHNwaGkpO1xuICB0aGlzLkMgPSBNYXRoLnNxcnQoMSArIHRoaXMuZXMgKiBjcGhpICogY3BoaSAvICgxIC0gdGhpcy5lcykpO1xuICB0aGlzLnBoaWMwID0gTWF0aC5hc2luKHNwaGkgLyB0aGlzLkMpO1xuICB0aGlzLnJhdGV4cCA9IDAuNSAqIHRoaXMuQyAqIHRoaXMuZTtcbiAgdGhpcy5LID0gTWF0aC50YW4oMC41ICogdGhpcy5waGljMCArIEZPUlRQSSkgLyAoTWF0aC5wb3coTWF0aC50YW4oMC41ICogdGhpcy5sYXQwICsgRk9SVFBJKSwgdGhpcy5DKSAqIHNyYXQodGhpcy5lICogc3BoaSwgdGhpcy5yYXRleHApKTtcbn07XG5cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcblxuICBwLnkgPSAyICogTWF0aC5hdGFuKHRoaXMuSyAqIE1hdGgucG93KE1hdGgudGFuKDAuNSAqIGxhdCArIEZPUlRQSSksIHRoaXMuQykgKiBzcmF0KHRoaXMuZSAqIE1hdGguc2luKGxhdCksIHRoaXMucmF0ZXhwKSkgLSBIQUxGX1BJO1xuICBwLnggPSB0aGlzLkMgKiBsb247XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgREVMX1RPTCA9IDFlLTE0O1xuICB2YXIgbG9uID0gcC54IC8gdGhpcy5DO1xuICB2YXIgbGF0ID0gcC55O1xuICB2YXIgbnVtID0gTWF0aC5wb3coTWF0aC50YW4oMC41ICogbGF0ICsgRk9SVFBJKSAvIHRoaXMuSywgMSAvIHRoaXMuQyk7XG4gIGZvciAodmFyIGkgPSBNQVhfSVRFUjsgaSA+IDA7IC0taSkge1xuICAgIGxhdCA9IDIgKiBNYXRoLmF0YW4obnVtICogc3JhdCh0aGlzLmUgKiBNYXRoLnNpbihwLnkpLCAtIDAuNSAqIHRoaXMuZSkpIC0gSEFMRl9QSTtcbiAgICBpZiAoTWF0aC5hYnMobGF0IC0gcC55KSA8IERFTF9UT0wpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBwLnkgPSBsYXQ7XG4gIH1cbiAgLyogY29udmVyZ2VuY2UgZmFpbGVkICovXG4gIGlmICghaSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiZ2F1c3NcIl07XG4iLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIGFzaW56ID0gcmVxdWlyZSgnLi4vY29tbW9uL2FzaW56Jyk7XG5cbi8qXG4gIHJlZmVyZW5jZTpcbiAgICBXb2xmcmFtIE1hdGh3b3JsZCBcIkdub21vbmljIFByb2plY3Rpb25cIlxuICAgIGh0dHA6Ly9tYXRod29ybGQud29sZnJhbS5jb20vR25vbW9uaWNQcm9qZWN0aW9uLmh0bWxcbiAgICBBY2Nlc3NlZDogMTJ0aCBOb3ZlbWJlciAyMDA5XG4gICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcblxuICAvKiBQbGFjZSBwYXJhbWV0ZXJzIGluIHN0YXRpYyBzdG9yYWdlIGZvciBjb21tb24gdXNlXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdGhpcy5zaW5fcDE0ID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgdGhpcy5jb3NfcDE0ID0gTWF0aC5jb3ModGhpcy5sYXQwKTtcbiAgLy8gQXBwcm94aW1hdGlvbiBmb3IgcHJvamVjdGluZyBwb2ludHMgdG8gdGhlIGhvcml6b24gKGluZmluaXR5KVxuICB0aGlzLmluZmluaXR5X2Rpc3QgPSAxMDAwICogdGhpcy5hO1xuICB0aGlzLnJjID0gMTtcbn07XG5cblxuLyogR25vbW9uaWMgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHNpbnBoaSwgY29zcGhpOyAvKiBzaW4gYW5kIGNvcyB2YWx1ZSAgICAgICAgKi9cbiAgdmFyIGRsb247IC8qIGRlbHRhIGxvbmdpdHVkZSB2YWx1ZSAgICAgICovXG4gIHZhciBjb3Nsb247IC8qIGNvcyBvZiBsb25naXR1ZGUgICAgICAgICovXG4gIHZhciBrc3A7IC8qIHNjYWxlIGZhY3RvciAgICAgICAgICAqL1xuICB2YXIgZztcbiAgdmFyIHgsIHk7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIGRsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuXG4gIHNpbnBoaSA9IE1hdGguc2luKGxhdCk7XG4gIGNvc3BoaSA9IE1hdGguY29zKGxhdCk7XG5cbiAgY29zbG9uID0gTWF0aC5jb3MoZGxvbik7XG4gIGcgPSB0aGlzLnNpbl9wMTQgKiBzaW5waGkgKyB0aGlzLmNvc19wMTQgKiBjb3NwaGkgKiBjb3Nsb247XG4gIGtzcCA9IDE7XG4gIGlmICgoZyA+IDApIHx8IChNYXRoLmFicyhnKSA8PSBFUFNMTikpIHtcbiAgICB4ID0gdGhpcy54MCArIHRoaXMuYSAqIGtzcCAqIGNvc3BoaSAqIE1hdGguc2luKGRsb24pIC8gZztcbiAgICB5ID0gdGhpcy55MCArIHRoaXMuYSAqIGtzcCAqICh0aGlzLmNvc19wMTQgKiBzaW5waGkgLSB0aGlzLnNpbl9wMTQgKiBjb3NwaGkgKiBjb3Nsb24pIC8gZztcbiAgfVxuICBlbHNlIHtcblxuICAgIC8vIFBvaW50IGlzIGluIHRoZSBvcHBvc2luZyBoZW1pc3BoZXJlIGFuZCBpcyB1bnByb2plY3RhYmxlXG4gICAgLy8gV2Ugc3RpbGwgbmVlZCB0byByZXR1cm4gYSByZWFzb25hYmxlIHBvaW50LCBzbyB3ZSBwcm9qZWN0IFxuICAgIC8vIHRvIGluZmluaXR5LCBvbiBhIGJlYXJpbmcgXG4gICAgLy8gZXF1aXZhbGVudCB0byB0aGUgbm9ydGhlcm4gaGVtaXNwaGVyZSBlcXVpdmFsZW50XG4gICAgLy8gVGhpcyBpcyBhIHJlYXNvbmFibGUgYXBwcm94aW1hdGlvbiBmb3Igc2hvcnQgc2hhcGVzIGFuZCBsaW5lcyB0aGF0IFxuICAgIC8vIHN0cmFkZGxlIHRoZSBob3Jpem9uLlxuXG4gICAgeCA9IHRoaXMueDAgKyB0aGlzLmluZmluaXR5X2Rpc3QgKiBjb3NwaGkgKiBNYXRoLnNpbihkbG9uKTtcbiAgICB5ID0gdGhpcy55MCArIHRoaXMuaW5maW5pdHlfZGlzdCAqICh0aGlzLmNvc19wMTQgKiBzaW5waGkgLSB0aGlzLnNpbl9wMTQgKiBjb3NwaGkgKiBjb3Nsb24pO1xuXG4gIH1cbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHJoOyAvKiBSaG8gKi9cbiAgdmFyIHNpbmMsIGNvc2M7XG4gIHZhciBjO1xuICB2YXIgbG9uLCBsYXQ7XG5cbiAgLyogSW52ZXJzZSBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgcC54ID0gKHAueCAtIHRoaXMueDApIC8gdGhpcy5hO1xuICBwLnkgPSAocC55IC0gdGhpcy55MCkgLyB0aGlzLmE7XG5cbiAgcC54IC89IHRoaXMuazA7XG4gIHAueSAvPSB0aGlzLmswO1xuXG4gIGlmICgocmggPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KSkpIHtcbiAgICBjID0gTWF0aC5hdGFuMihyaCwgdGhpcy5yYyk7XG4gICAgc2luYyA9IE1hdGguc2luKGMpO1xuICAgIGNvc2MgPSBNYXRoLmNvcyhjKTtcblxuICAgIGxhdCA9IGFzaW56KGNvc2MgKiB0aGlzLnNpbl9wMTQgKyAocC55ICogc2luYyAqIHRoaXMuY29zX3AxNCkgLyByaCk7XG4gICAgbG9uID0gTWF0aC5hdGFuMihwLnggKiBzaW5jLCByaCAqIHRoaXMuY29zX3AxNCAqIGNvc2MgLSBwLnkgKiB0aGlzLnNpbl9wMTQgKiBzaW5jKTtcbiAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBsb24pO1xuICB9XG4gIGVsc2Uge1xuICAgIGxhdCA9IHRoaXMucGhpYzA7XG4gICAgbG9uID0gMDtcbiAgfVxuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5leHBvcnRzLm5hbWVzID0gW1wiZ25vbVwiXTtcbiIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmEgPSA2Mzc3Mzk3LjE1NTtcbiAgdGhpcy5lcyA9IDAuMDA2Njc0MzcyMjMwNjE0O1xuICB0aGlzLmUgPSBNYXRoLnNxcnQodGhpcy5lcyk7XG4gIGlmICghdGhpcy5sYXQwKSB7XG4gICAgdGhpcy5sYXQwID0gMC44NjM5Mzc5Nzk3MzcxOTM7XG4gIH1cbiAgaWYgKCF0aGlzLmxvbmcwKSB7XG4gICAgdGhpcy5sb25nMCA9IDAuNzQxNzY0OTMyMDk3NTkwMSAtIDAuMzA4MzQxNTAxMTg1NjY1O1xuICB9XG4gIC8qIGlmIHNjYWxlIG5vdCBzZXQgZGVmYXVsdCB0byAwLjk5OTkgKi9cbiAgaWYgKCF0aGlzLmswKSB7XG4gICAgdGhpcy5rMCA9IDAuOTk5OTtcbiAgfVxuICB0aGlzLnM0NSA9IDAuNzg1Mzk4MTYzMzk3NDQ4OyAvKiA0NSAqL1xuICB0aGlzLnM5MCA9IDIgKiB0aGlzLnM0NTtcbiAgdGhpcy5maTAgPSB0aGlzLmxhdDA7XG4gIHRoaXMuZTIgPSB0aGlzLmVzO1xuICB0aGlzLmUgPSBNYXRoLnNxcnQodGhpcy5lMik7XG4gIHRoaXMuYWxmYSA9IE1hdGguc3FydCgxICsgKHRoaXMuZTIgKiBNYXRoLnBvdyhNYXRoLmNvcyh0aGlzLmZpMCksIDQpKSAvICgxIC0gdGhpcy5lMikpO1xuICB0aGlzLnVxID0gMS4wNDIxNjg1NjM4MDQ3NDtcbiAgdGhpcy51MCA9IE1hdGguYXNpbihNYXRoLnNpbih0aGlzLmZpMCkgLyB0aGlzLmFsZmEpO1xuICB0aGlzLmcgPSBNYXRoLnBvdygoMSArIHRoaXMuZSAqIE1hdGguc2luKHRoaXMuZmkwKSkgLyAoMSAtIHRoaXMuZSAqIE1hdGguc2luKHRoaXMuZmkwKSksIHRoaXMuYWxmYSAqIHRoaXMuZSAvIDIpO1xuICB0aGlzLmsgPSBNYXRoLnRhbih0aGlzLnUwIC8gMiArIHRoaXMuczQ1KSAvIE1hdGgucG93KE1hdGgudGFuKHRoaXMuZmkwIC8gMiArIHRoaXMuczQ1KSwgdGhpcy5hbGZhKSAqIHRoaXMuZztcbiAgdGhpcy5rMSA9IHRoaXMuazA7XG4gIHRoaXMubjAgPSB0aGlzLmEgKiBNYXRoLnNxcnQoMSAtIHRoaXMuZTIpIC8gKDEgLSB0aGlzLmUyICogTWF0aC5wb3coTWF0aC5zaW4odGhpcy5maTApLCAyKSk7XG4gIHRoaXMuczAgPSAxLjM3MDA4MzQ2MjgxNTU1O1xuICB0aGlzLm4gPSBNYXRoLnNpbih0aGlzLnMwKTtcbiAgdGhpcy5ybzAgPSB0aGlzLmsxICogdGhpcy5uMCAvIE1hdGgudGFuKHRoaXMuczApO1xuICB0aGlzLmFkID0gdGhpcy5zOTAgLSB0aGlzLnVxO1xufTtcblxuLyogZWxsaXBzb2lkICovXG4vKiBjYWxjdWxhdGUgeHkgZnJvbSBsYXQvbG9uICovXG4vKiBDb25zdGFudHMsIGlkZW50aWNhbCB0byBpbnZlcnNlIHRyYW5zZm9ybSBmdW5jdGlvbiAqL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgZ2ZpLCB1LCBkZWx0YXYsIHMsIGQsIGVwcywgcm87XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIHZhciBkZWx0YV9sb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICAvKiBUcmFuc2Zvcm1hdGlvbiAqL1xuICBnZmkgPSBNYXRoLnBvdygoKDEgKyB0aGlzLmUgKiBNYXRoLnNpbihsYXQpKSAvICgxIC0gdGhpcy5lICogTWF0aC5zaW4obGF0KSkpLCAodGhpcy5hbGZhICogdGhpcy5lIC8gMikpO1xuICB1ID0gMiAqIChNYXRoLmF0YW4odGhpcy5rICogTWF0aC5wb3coTWF0aC50YW4obGF0IC8gMiArIHRoaXMuczQ1KSwgdGhpcy5hbGZhKSAvIGdmaSkgLSB0aGlzLnM0NSk7XG4gIGRlbHRhdiA9IC1kZWx0YV9sb24gKiB0aGlzLmFsZmE7XG4gIHMgPSBNYXRoLmFzaW4oTWF0aC5jb3ModGhpcy5hZCkgKiBNYXRoLnNpbih1KSArIE1hdGguc2luKHRoaXMuYWQpICogTWF0aC5jb3ModSkgKiBNYXRoLmNvcyhkZWx0YXYpKTtcbiAgZCA9IE1hdGguYXNpbihNYXRoLmNvcyh1KSAqIE1hdGguc2luKGRlbHRhdikgLyBNYXRoLmNvcyhzKSk7XG4gIGVwcyA9IHRoaXMubiAqIGQ7XG4gIHJvID0gdGhpcy5ybzAgKiBNYXRoLnBvdyhNYXRoLnRhbih0aGlzLnMwIC8gMiArIHRoaXMuczQ1KSwgdGhpcy5uKSAvIE1hdGgucG93KE1hdGgudGFuKHMgLyAyICsgdGhpcy5zNDUpLCB0aGlzLm4pO1xuICBwLnkgPSBybyAqIE1hdGguY29zKGVwcykgLyAxO1xuICBwLnggPSBybyAqIE1hdGguc2luKGVwcykgLyAxO1xuXG4gIGlmICghdGhpcy5jemVjaCkge1xuICAgIHAueSAqPSAtMTtcbiAgICBwLnggKj0gLTE7XG4gIH1cbiAgcmV0dXJuIChwKTtcbn07XG5cbi8qIGNhbGN1bGF0ZSBsYXQvbG9uIGZyb20geHkgKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHUsIGRlbHRhdiwgcywgZCwgZXBzLCBybywgZmkxO1xuICB2YXIgb2s7XG5cbiAgLyogVHJhbnNmb3JtYXRpb24gKi9cbiAgLyogcmV2ZXJ0IHksIHgqL1xuICB2YXIgdG1wID0gcC54O1xuICBwLnggPSBwLnk7XG4gIHAueSA9IHRtcDtcbiAgaWYgKCF0aGlzLmN6ZWNoKSB7XG4gICAgcC55ICo9IC0xO1xuICAgIHAueCAqPSAtMTtcbiAgfVxuICBybyA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpO1xuICBlcHMgPSBNYXRoLmF0YW4yKHAueSwgcC54KTtcbiAgZCA9IGVwcyAvIE1hdGguc2luKHRoaXMuczApO1xuICBzID0gMiAqIChNYXRoLmF0YW4oTWF0aC5wb3codGhpcy5ybzAgLyBybywgMSAvIHRoaXMubikgKiBNYXRoLnRhbih0aGlzLnMwIC8gMiArIHRoaXMuczQ1KSkgLSB0aGlzLnM0NSk7XG4gIHUgPSBNYXRoLmFzaW4oTWF0aC5jb3ModGhpcy5hZCkgKiBNYXRoLnNpbihzKSAtIE1hdGguc2luKHRoaXMuYWQpICogTWF0aC5jb3MocykgKiBNYXRoLmNvcyhkKSk7XG4gIGRlbHRhdiA9IE1hdGguYXNpbihNYXRoLmNvcyhzKSAqIE1hdGguc2luKGQpIC8gTWF0aC5jb3ModSkpO1xuICBwLnggPSB0aGlzLmxvbmcwIC0gZGVsdGF2IC8gdGhpcy5hbGZhO1xuICBmaTEgPSB1O1xuICBvayA9IDA7XG4gIHZhciBpdGVyID0gMDtcbiAgZG8ge1xuICAgIHAueSA9IDIgKiAoTWF0aC5hdGFuKE1hdGgucG93KHRoaXMuaywgLSAxIC8gdGhpcy5hbGZhKSAqIE1hdGgucG93KE1hdGgudGFuKHUgLyAyICsgdGhpcy5zNDUpLCAxIC8gdGhpcy5hbGZhKSAqIE1hdGgucG93KCgxICsgdGhpcy5lICogTWF0aC5zaW4oZmkxKSkgLyAoMSAtIHRoaXMuZSAqIE1hdGguc2luKGZpMSkpLCB0aGlzLmUgLyAyKSkgLSB0aGlzLnM0NSk7XG4gICAgaWYgKE1hdGguYWJzKGZpMSAtIHAueSkgPCAwLjAwMDAwMDAwMDEpIHtcbiAgICAgIG9rID0gMTtcbiAgICB9XG4gICAgZmkxID0gcC55O1xuICAgIGl0ZXIgKz0gMTtcbiAgfSB3aGlsZSAob2sgPT09IDAgJiYgaXRlciA8IDE1KTtcbiAgaWYgKGl0ZXIgPj0gMTUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiAocCk7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIktyb3Zha1wiLCBcImtyb3Zha1wiXTtcbiIsInZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEZPUlRQSSA9IE1hdGguUEkvNDtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgcXNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vcXNmbnonKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbi8qXG4gIHJlZmVyZW5jZVxuICAgIFwiTmV3IEVxdWFsLUFyZWEgTWFwIFByb2plY3Rpb25zIGZvciBOb25jaXJjdWxhciBSZWdpb25zXCIsIEpvaG4gUC4gU255ZGVyLFxuICAgIFRoZSBBbWVyaWNhbiBDYXJ0b2dyYXBoZXIsIFZvbCAxNSwgTm8uIDQsIE9jdG9iZXIgMTk4OCwgcHAuIDM0MS0zNTUuXG4gICovXG5cbmV4cG9ydHMuU19QT0xFID0gMTtcbmV4cG9ydHMuTl9QT0xFID0gMjtcbmV4cG9ydHMuRVFVSVQgPSAzO1xuZXhwb3J0cy5PQkxJUSA9IDQ7XG5cblxuLyogSW5pdGlhbGl6ZSB0aGUgTGFtYmVydCBBemltdXRoYWwgRXF1YWwgQXJlYSBwcm9qZWN0aW9uXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBNYXRoLmFicyh0aGlzLmxhdDApO1xuICBpZiAoTWF0aC5hYnModCAtIEhBTEZfUEkpIDwgRVBTTE4pIHtcbiAgICB0aGlzLm1vZGUgPSB0aGlzLmxhdDAgPCAwID8gdGhpcy5TX1BPTEUgOiB0aGlzLk5fUE9MRTtcbiAgfVxuICBlbHNlIGlmIChNYXRoLmFicyh0KSA8IEVQU0xOKSB7XG4gICAgdGhpcy5tb2RlID0gdGhpcy5FUVVJVDtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLm1vZGUgPSB0aGlzLk9CTElRO1xuICB9XG4gIGlmICh0aGlzLmVzID4gMCkge1xuICAgIHZhciBzaW5waGk7XG5cbiAgICB0aGlzLnFwID0gcXNmbnoodGhpcy5lLCAxKTtcbiAgICB0aGlzLm1tZiA9IDAuNSAvICgxIC0gdGhpcy5lcyk7XG4gICAgdGhpcy5hcGEgPSB0aGlzLmF1dGhzZXQodGhpcy5lcyk7XG4gICAgc3dpdGNoICh0aGlzLm1vZGUpIHtcbiAgICBjYXNlIHRoaXMuTl9QT0xFOlxuICAgICAgdGhpcy5kZCA9IDE7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuU19QT0xFOlxuICAgICAgdGhpcy5kZCA9IDE7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuRVFVSVQ6XG4gICAgICB0aGlzLnJxID0gTWF0aC5zcXJ0KDAuNSAqIHRoaXMucXApO1xuICAgICAgdGhpcy5kZCA9IDEgLyB0aGlzLnJxO1xuICAgICAgdGhpcy54bWYgPSAxO1xuICAgICAgdGhpcy55bWYgPSAwLjUgKiB0aGlzLnFwO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLk9CTElROlxuICAgICAgdGhpcy5ycSA9IE1hdGguc3FydCgwLjUgKiB0aGlzLnFwKTtcbiAgICAgIHNpbnBoaSA9IE1hdGguc2luKHRoaXMubGF0MCk7XG4gICAgICB0aGlzLnNpbmIxID0gcXNmbnoodGhpcy5lLCBzaW5waGkpIC8gdGhpcy5xcDtcbiAgICAgIHRoaXMuY29zYjEgPSBNYXRoLnNxcnQoMSAtIHRoaXMuc2luYjEgKiB0aGlzLnNpbmIxKTtcbiAgICAgIHRoaXMuZGQgPSBNYXRoLmNvcyh0aGlzLmxhdDApIC8gKE1hdGguc3FydCgxIC0gdGhpcy5lcyAqIHNpbnBoaSAqIHNpbnBoaSkgKiB0aGlzLnJxICogdGhpcy5jb3NiMSk7XG4gICAgICB0aGlzLnltZiA9ICh0aGlzLnhtZiA9IHRoaXMucnEpIC8gdGhpcy5kZDtcbiAgICAgIHRoaXMueG1mICo9IHRoaXMuZGQ7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSkge1xuICAgICAgdGhpcy5zaW5waDAgPSBNYXRoLnNpbih0aGlzLmxhdDApO1xuICAgICAgdGhpcy5jb3NwaDAgPSBNYXRoLmNvcyh0aGlzLmxhdDApO1xuICAgIH1cbiAgfVxufTtcblxuLyogTGFtYmVydCBBemltdXRoYWwgRXF1YWwgQXJlYSBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuXG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHZhciB4LCB5LCBjb3NsYW0sIHNpbmxhbSwgc2lucGhpLCBxLCBzaW5iLCBjb3NiLCBiLCBjb3NwaGk7XG4gIHZhciBsYW0gPSBwLng7XG4gIHZhciBwaGkgPSBwLnk7XG5cbiAgbGFtID0gYWRqdXN0X2xvbihsYW0gLSB0aGlzLmxvbmcwKTtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBzaW5waGkgPSBNYXRoLnNpbihwaGkpO1xuICAgIGNvc3BoaSA9IE1hdGguY29zKHBoaSk7XG4gICAgY29zbGFtID0gTWF0aC5jb3MobGFtKTtcbiAgICBpZiAodGhpcy5tb2RlID09PSB0aGlzLk9CTElRIHx8IHRoaXMubW9kZSA9PT0gdGhpcy5FUVVJVCkge1xuICAgICAgeSA9ICh0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQpID8gMSArIGNvc3BoaSAqIGNvc2xhbSA6IDEgKyB0aGlzLnNpbnBoMCAqIHNpbnBoaSArIHRoaXMuY29zcGgwICogY29zcGhpICogY29zbGFtO1xuICAgICAgaWYgKHkgPD0gRVBTTE4pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB5ID0gTWF0aC5zcXJ0KDIgLyB5KTtcbiAgICAgIHggPSB5ICogY29zcGhpICogTWF0aC5zaW4obGFtKTtcbiAgICAgIHkgKj0gKHRoaXMubW9kZSA9PT0gdGhpcy5FUVVJVCkgPyBzaW5waGkgOiB0aGlzLmNvc3BoMCAqIHNpbnBoaSAtIHRoaXMuc2lucGgwICogY29zcGhpICogY29zbGFtO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuTl9QT0xFIHx8IHRoaXMubW9kZSA9PT0gdGhpcy5TX1BPTEUpIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuTl9QT0xFKSB7XG4gICAgICAgIGNvc2xhbSA9IC1jb3NsYW07XG4gICAgICB9XG4gICAgICBpZiAoTWF0aC5hYnMocGhpICsgdGhpcy5waGkwKSA8IEVQU0xOKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgeSA9IEZPUlRQSSAtIHBoaSAqIDAuNTtcbiAgICAgIHkgPSAyICogKCh0aGlzLm1vZGUgPT09IHRoaXMuU19QT0xFKSA/IE1hdGguY29zKHkpIDogTWF0aC5zaW4oeSkpO1xuICAgICAgeCA9IHkgKiBNYXRoLnNpbihsYW0pO1xuICAgICAgeSAqPSBjb3NsYW07XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIHNpbmIgPSAwO1xuICAgIGNvc2IgPSAwO1xuICAgIGIgPSAwO1xuICAgIGNvc2xhbSA9IE1hdGguY29zKGxhbSk7XG4gICAgc2lubGFtID0gTWF0aC5zaW4obGFtKTtcbiAgICBzaW5waGkgPSBNYXRoLnNpbihwaGkpO1xuICAgIHEgPSBxc2Zueih0aGlzLmUsIHNpbnBoaSk7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSB8fCB0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQpIHtcbiAgICAgIHNpbmIgPSBxIC8gdGhpcy5xcDtcbiAgICAgIGNvc2IgPSBNYXRoLnNxcnQoMSAtIHNpbmIgKiBzaW5iKTtcbiAgICB9XG4gICAgc3dpdGNoICh0aGlzLm1vZGUpIHtcbiAgICBjYXNlIHRoaXMuT0JMSVE6XG4gICAgICBiID0gMSArIHRoaXMuc2luYjEgKiBzaW5iICsgdGhpcy5jb3NiMSAqIGNvc2IgKiBjb3NsYW07XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuRVFVSVQ6XG4gICAgICBiID0gMSArIGNvc2IgKiBjb3NsYW07XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuTl9QT0xFOlxuICAgICAgYiA9IEhBTEZfUEkgKyBwaGk7XG4gICAgICBxID0gdGhpcy5xcCAtIHE7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRoaXMuU19QT0xFOlxuICAgICAgYiA9IHBoaSAtIEhBTEZfUEk7XG4gICAgICBxID0gdGhpcy5xcCArIHE7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKE1hdGguYWJzKGIpIDwgRVBTTE4pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBzd2l0Y2ggKHRoaXMubW9kZSkge1xuICAgIGNhc2UgdGhpcy5PQkxJUTpcbiAgICBjYXNlIHRoaXMuRVFVSVQ6XG4gICAgICBiID0gTWF0aC5zcXJ0KDIgLyBiKTtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuT0JMSVEpIHtcbiAgICAgICAgeSA9IHRoaXMueW1mICogYiAqICh0aGlzLmNvc2IxICogc2luYiAtIHRoaXMuc2luYjEgKiBjb3NiICogY29zbGFtKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB5ID0gKGIgPSBNYXRoLnNxcnQoMiAvICgxICsgY29zYiAqIGNvc2xhbSkpKSAqIHNpbmIgKiB0aGlzLnltZjtcbiAgICAgIH1cbiAgICAgIHggPSB0aGlzLnhtZiAqIGIgKiBjb3NiICogc2lubGFtO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLk5fUE9MRTpcbiAgICBjYXNlIHRoaXMuU19QT0xFOlxuICAgICAgaWYgKHEgPj0gMCkge1xuICAgICAgICB4ID0gKGIgPSBNYXRoLnNxcnQocSkpICogc2lubGFtO1xuICAgICAgICB5ID0gY29zbGFtICogKCh0aGlzLm1vZGUgPT09IHRoaXMuU19QT0xFKSA/IGIgOiAtYik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgeCA9IHkgPSAwO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcC54ID0gdGhpcy5hICogeCArIHRoaXMueDA7XG4gIHAueSA9IHRoaXMuYSAqIHkgKyB0aGlzLnkwO1xuICByZXR1cm4gcDtcbn07XG5cbi8qIEludmVyc2UgZXF1YXRpb25zXG4gIC0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICB2YXIgeCA9IHAueCAvIHRoaXMuYTtcbiAgdmFyIHkgPSBwLnkgLyB0aGlzLmE7XG4gIHZhciBsYW0sIHBoaSwgY0NlLCBzQ2UsIHEsIHJobywgYWI7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgdmFyIGNvc3ogPSAwLFxuICAgICAgcmgsIHNpbnogPSAwO1xuXG4gICAgcmggPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG4gICAgcGhpID0gcmggKiAwLjU7XG4gICAgaWYgKHBoaSA+IDEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBwaGkgPSAyICogTWF0aC5hc2luKHBoaSk7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSB8fCB0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQpIHtcbiAgICAgIHNpbnogPSBNYXRoLnNpbihwaGkpO1xuICAgICAgY29zeiA9IE1hdGguY29zKHBoaSk7XG4gICAgfVxuICAgIHN3aXRjaCAodGhpcy5tb2RlKSB7XG4gICAgY2FzZSB0aGlzLkVRVUlUOlxuICAgICAgcGhpID0gKE1hdGguYWJzKHJoKSA8PSBFUFNMTikgPyAwIDogTWF0aC5hc2luKHkgKiBzaW56IC8gcmgpO1xuICAgICAgeCAqPSBzaW56O1xuICAgICAgeSA9IGNvc3ogKiByaDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5PQkxJUTpcbiAgICAgIHBoaSA9IChNYXRoLmFicyhyaCkgPD0gRVBTTE4pID8gdGhpcy5waGkwIDogTWF0aC5hc2luKGNvc3ogKiB0aGlzLnNpbnBoMCArIHkgKiBzaW56ICogdGhpcy5jb3NwaDAgLyByaCk7XG4gICAgICB4ICo9IHNpbnogKiB0aGlzLmNvc3BoMDtcbiAgICAgIHkgPSAoY29zeiAtIE1hdGguc2luKHBoaSkgKiB0aGlzLnNpbnBoMCkgKiByaDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdGhpcy5OX1BPTEU6XG4gICAgICB5ID0gLXk7XG4gICAgICBwaGkgPSBIQUxGX1BJIC0gcGhpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSB0aGlzLlNfUE9MRTpcbiAgICAgIHBoaSAtPSBIQUxGX1BJO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxhbSA9ICh5ID09PSAwICYmICh0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQgfHwgdGhpcy5tb2RlID09PSB0aGlzLk9CTElRKSkgPyAwIDogTWF0aC5hdGFuMih4LCB5KTtcbiAgfVxuICBlbHNlIHtcbiAgICBhYiA9IDA7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5PQkxJUSB8fCB0aGlzLm1vZGUgPT09IHRoaXMuRVFVSVQpIHtcbiAgICAgIHggLz0gdGhpcy5kZDtcbiAgICAgIHkgKj0gdGhpcy5kZDtcbiAgICAgIHJobyA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICAgIGlmIChyaG8gPCBFUFNMTikge1xuICAgICAgICBwLnggPSAwO1xuICAgICAgICBwLnkgPSB0aGlzLnBoaTA7XG4gICAgICAgIHJldHVybiBwO1xuICAgICAgfVxuICAgICAgc0NlID0gMiAqIE1hdGguYXNpbigwLjUgKiByaG8gLyB0aGlzLnJxKTtcbiAgICAgIGNDZSA9IE1hdGguY29zKHNDZSk7XG4gICAgICB4ICo9IChzQ2UgPSBNYXRoLnNpbihzQ2UpKTtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuT0JMSVEpIHtcbiAgICAgICAgYWIgPSBjQ2UgKiB0aGlzLnNpbmIxICsgeSAqIHNDZSAqIHRoaXMuY29zYjEgLyByaG87XG4gICAgICAgIHEgPSB0aGlzLnFwICogYWI7XG4gICAgICAgIHkgPSByaG8gKiB0aGlzLmNvc2IxICogY0NlIC0geSAqIHRoaXMuc2luYjEgKiBzQ2U7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYWIgPSB5ICogc0NlIC8gcmhvO1xuICAgICAgICBxID0gdGhpcy5xcCAqIGFiO1xuICAgICAgICB5ID0gcmhvICogY0NlO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuTl9QT0xFIHx8IHRoaXMubW9kZSA9PT0gdGhpcy5TX1BPTEUpIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IHRoaXMuTl9QT0xFKSB7XG4gICAgICAgIHkgPSAteTtcbiAgICAgIH1cbiAgICAgIHEgPSAoeCAqIHggKyB5ICogeSk7XG4gICAgICBpZiAoIXEpIHtcbiAgICAgICAgcC54ID0gMDtcbiAgICAgICAgcC55ID0gdGhpcy5waGkwO1xuICAgICAgICByZXR1cm4gcDtcbiAgICAgIH1cbiAgICAgIGFiID0gMSAtIHEgLyB0aGlzLnFwO1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gdGhpcy5TX1BPTEUpIHtcbiAgICAgICAgYWIgPSAtYWI7XG4gICAgICB9XG4gICAgfVxuICAgIGxhbSA9IE1hdGguYXRhbjIoeCwgeSk7XG4gICAgcGhpID0gdGhpcy5hdXRobGF0KE1hdGguYXNpbihhYiksIHRoaXMuYXBhKTtcbiAgfVxuXG5cbiAgcC54ID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgbGFtKTtcbiAgcC55ID0gcGhpO1xuICByZXR1cm4gcDtcbn07XG5cbi8qIGRldGVybWluZSBsYXRpdHVkZSBmcm9tIGF1dGhhbGljIGxhdGl0dWRlICovXG5leHBvcnRzLlAwMCA9IDAuMzMzMzMzMzMzMzMzMzMzMzMzMzM7XG5leHBvcnRzLlAwMSA9IDAuMTcyMjIyMjIyMjIyMjIyMjIyMjI7XG5leHBvcnRzLlAwMiA9IDAuMTAyNTc5MzY1MDc5MzY1MDc5MzY7XG5leHBvcnRzLlAxMCA9IDAuMDYzODg4ODg4ODg4ODg4ODg4ODg7XG5leHBvcnRzLlAxMSA9IDAuMDY2NDAyMTE2NDAyMTE2NDAyMTE7XG5leHBvcnRzLlAyMCA9IDAuMDE2NDE1MDEyOTQyMTkxNTQ0NDM7XG5cbmV4cG9ydHMuYXV0aHNldCA9IGZ1bmN0aW9uKGVzKSB7XG4gIHZhciB0O1xuICB2YXIgQVBBID0gW107XG4gIEFQQVswXSA9IGVzICogdGhpcy5QMDA7XG4gIHQgPSBlcyAqIGVzO1xuICBBUEFbMF0gKz0gdCAqIHRoaXMuUDAxO1xuICBBUEFbMV0gPSB0ICogdGhpcy5QMTA7XG4gIHQgKj0gZXM7XG4gIEFQQVswXSArPSB0ICogdGhpcy5QMDI7XG4gIEFQQVsxXSArPSB0ICogdGhpcy5QMTE7XG4gIEFQQVsyXSA9IHQgKiB0aGlzLlAyMDtcbiAgcmV0dXJuIEFQQTtcbn07XG5cbmV4cG9ydHMuYXV0aGxhdCA9IGZ1bmN0aW9uKGJldGEsIEFQQSkge1xuICB2YXIgdCA9IGJldGEgKyBiZXRhO1xuICByZXR1cm4gKGJldGEgKyBBUEFbMF0gKiBNYXRoLnNpbih0KSArIEFQQVsxXSAqIE1hdGguc2luKHQgKyB0KSArIEFQQVsyXSAqIE1hdGguc2luKHQgKyB0ICsgdCkpO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJMYW1iZXJ0IEF6aW11dGhhbCBFcXVhbCBBcmVhXCIsIFwiTGFtYmVydF9BemltdXRoYWxfRXF1YWxfQXJlYVwiLCBcImxhZWFcIl07XG4iLCJ2YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIG1zZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL21zZm56Jyk7XG52YXIgdHNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vdHNmbnonKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIHNpZ24gPSByZXF1aXJlKCcuLi9jb21tb24vc2lnbicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIHBoaTJ6ID0gcmVxdWlyZSgnLi4vY29tbW9uL3BoaTJ6Jyk7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcblxuICAvLyBhcnJheSBvZjogIHJfbWFqLHJfbWluLGxhdDEsbGF0MixjX2xvbixjX2xhdCxmYWxzZV9lYXN0LGZhbHNlX25vcnRoXG4gIC8vZG91YmxlIGNfbGF0OyAgICAgICAgICAgICAgICAgICAvKiBjZW50ZXIgbGF0aXR1ZGUgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgLy9kb3VibGUgY19sb247ICAgICAgICAgICAgICAgICAgIC8qIGNlbnRlciBsb25naXR1ZGUgICAgICAgICAgICAgICAgICAgICAqL1xuICAvL2RvdWJsZSBsYXQxOyAgICAgICAgICAgICAgICAgICAgLyogZmlyc3Qgc3RhbmRhcmQgcGFyYWxsZWwgICAgICAgICAgICAgICovXG4gIC8vZG91YmxlIGxhdDI7ICAgICAgICAgICAgICAgICAgICAvKiBzZWNvbmQgc3RhbmRhcmQgcGFyYWxsZWwgICAgICAgICAgICAgKi9cbiAgLy9kb3VibGUgcl9tYWo7ICAgICAgICAgICAgICAgICAgIC8qIG1ham9yIGF4aXMgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAvL2RvdWJsZSByX21pbjsgICAgICAgICAgICAgICAgICAgLyogbWlub3IgYXhpcyAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gIC8vZG91YmxlIGZhbHNlX2Vhc3Q7ICAgICAgICAgICAgICAvKiB4IG9mZnNldCBpbiBtZXRlcnMgICAgICAgICAgICAgICAgICAgKi9cbiAgLy9kb3VibGUgZmFsc2Vfbm9ydGg7ICAgICAgICAgICAgIC8qIHkgb2Zmc2V0IGluIG1ldGVycyAgICAgICAgICAgICAgICAgICAqL1xuXG4gIGlmICghdGhpcy5sYXQyKSB7XG4gICAgdGhpcy5sYXQyID0gdGhpcy5sYXQxO1xuICB9IC8vaWYgbGF0MiBpcyBub3QgZGVmaW5lZFxuICBpZiAoIXRoaXMuazApIHtcbiAgICB0aGlzLmswID0gMTtcbiAgfVxuICB0aGlzLngwID0gdGhpcy54MCB8fCAwO1xuICB0aGlzLnkwID0gdGhpcy55MCB8fCAwO1xuICAvLyBTdGFuZGFyZCBQYXJhbGxlbHMgY2Fubm90IGJlIGVxdWFsIGFuZCBvbiBvcHBvc2l0ZSBzaWRlcyBvZiB0aGUgZXF1YXRvclxuICBpZiAoTWF0aC5hYnModGhpcy5sYXQxICsgdGhpcy5sYXQyKSA8IEVQU0xOKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHRlbXAgPSB0aGlzLmIgLyB0aGlzLmE7XG4gIHRoaXMuZSA9IE1hdGguc3FydCgxIC0gdGVtcCAqIHRlbXApO1xuXG4gIHZhciBzaW4xID0gTWF0aC5zaW4odGhpcy5sYXQxKTtcbiAgdmFyIGNvczEgPSBNYXRoLmNvcyh0aGlzLmxhdDEpO1xuICB2YXIgbXMxID0gbXNmbnoodGhpcy5lLCBzaW4xLCBjb3MxKTtcbiAgdmFyIHRzMSA9IHRzZm56KHRoaXMuZSwgdGhpcy5sYXQxLCBzaW4xKTtcblxuICB2YXIgc2luMiA9IE1hdGguc2luKHRoaXMubGF0Mik7XG4gIHZhciBjb3MyID0gTWF0aC5jb3ModGhpcy5sYXQyKTtcbiAgdmFyIG1zMiA9IG1zZm56KHRoaXMuZSwgc2luMiwgY29zMik7XG4gIHZhciB0czIgPSB0c2Zueih0aGlzLmUsIHRoaXMubGF0Miwgc2luMik7XG5cbiAgdmFyIHRzMCA9IHRzZm56KHRoaXMuZSwgdGhpcy5sYXQwLCBNYXRoLnNpbih0aGlzLmxhdDApKTtcblxuICBpZiAoTWF0aC5hYnModGhpcy5sYXQxIC0gdGhpcy5sYXQyKSA+IEVQU0xOKSB7XG4gICAgdGhpcy5ucyA9IE1hdGgubG9nKG1zMSAvIG1zMikgLyBNYXRoLmxvZyh0czEgLyB0czIpO1xuICB9XG4gIGVsc2Uge1xuICAgIHRoaXMubnMgPSBzaW4xO1xuICB9XG4gIGlmIChpc05hTih0aGlzLm5zKSkge1xuICAgIHRoaXMubnMgPSBzaW4xO1xuICB9XG4gIHRoaXMuZjAgPSBtczEgLyAodGhpcy5ucyAqIE1hdGgucG93KHRzMSwgdGhpcy5ucykpO1xuICB0aGlzLnJoID0gdGhpcy5hICogdGhpcy5mMCAqIE1hdGgucG93KHRzMCwgdGhpcy5ucyk7XG4gIGlmICghdGhpcy50aXRsZSkge1xuICAgIHRoaXMudGl0bGUgPSBcIkxhbWJlcnQgQ29uZm9ybWFsIENvbmljXCI7XG4gIH1cbn07XG5cblxuLy8gTGFtYmVydCBDb25mb3JtYWwgY29uaWMgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuXG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG5cbiAgLy8gc2luZ3VsYXIgY2FzZXMgOlxuICBpZiAoTWF0aC5hYnMoMiAqIE1hdGguYWJzKGxhdCkgLSBNYXRoLlBJKSA8PSBFUFNMTikge1xuICAgIGxhdCA9IHNpZ24obGF0KSAqIChIQUxGX1BJIC0gMiAqIEVQU0xOKTtcbiAgfVxuXG4gIHZhciBjb24gPSBNYXRoLmFicyhNYXRoLmFicyhsYXQpIC0gSEFMRl9QSSk7XG4gIHZhciB0cywgcmgxO1xuICBpZiAoY29uID4gRVBTTE4pIHtcbiAgICB0cyA9IHRzZm56KHRoaXMuZSwgbGF0LCBNYXRoLnNpbihsYXQpKTtcbiAgICByaDEgPSB0aGlzLmEgKiB0aGlzLmYwICogTWF0aC5wb3codHMsIHRoaXMubnMpO1xuICB9XG4gIGVsc2Uge1xuICAgIGNvbiA9IGxhdCAqIHRoaXMubnM7XG4gICAgaWYgKGNvbiA8PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmgxID0gMDtcbiAgfVxuICB2YXIgdGhldGEgPSB0aGlzLm5zICogYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgcC54ID0gdGhpcy5rMCAqIChyaDEgKiBNYXRoLnNpbih0aGV0YSkpICsgdGhpcy54MDtcbiAgcC55ID0gdGhpcy5rMCAqICh0aGlzLnJoIC0gcmgxICogTWF0aC5jb3ModGhldGEpKSArIHRoaXMueTA7XG5cbiAgcmV0dXJuIHA7XG59O1xuXG4vLyBMYW1iZXJ0IENvbmZvcm1hbCBDb25pYyBpbnZlcnNlIGVxdWF0aW9ucy0tbWFwcGluZyB4LHkgdG8gbGF0L2xvbmdcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG5cbiAgdmFyIHJoMSwgY29uLCB0cztcbiAgdmFyIGxhdCwgbG9uO1xuICB2YXIgeCA9IChwLnggLSB0aGlzLngwKSAvIHRoaXMuazA7XG4gIHZhciB5ID0gKHRoaXMucmggLSAocC55IC0gdGhpcy55MCkgLyB0aGlzLmswKTtcbiAgaWYgKHRoaXMubnMgPiAwKSB7XG4gICAgcmgxID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xuICAgIGNvbiA9IDE7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmgxID0gLU1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICBjb24gPSAtMTtcbiAgfVxuICB2YXIgdGhldGEgPSAwO1xuICBpZiAocmgxICE9PSAwKSB7XG4gICAgdGhldGEgPSBNYXRoLmF0YW4yKChjb24gKiB4KSwgKGNvbiAqIHkpKTtcbiAgfVxuICBpZiAoKHJoMSAhPT0gMCkgfHwgKHRoaXMubnMgPiAwKSkge1xuICAgIGNvbiA9IDEgLyB0aGlzLm5zO1xuICAgIHRzID0gTWF0aC5wb3coKHJoMSAvICh0aGlzLmEgKiB0aGlzLmYwKSksIGNvbik7XG4gICAgbGF0ID0gcGhpMnoodGhpcy5lLCB0cyk7XG4gICAgaWYgKGxhdCA9PT0gLTk5OTkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBsYXQgPSAtSEFMRl9QSTtcbiAgfVxuICBsb24gPSBhZGp1c3RfbG9uKHRoZXRhIC8gdGhpcy5ucyArIHRoaXMubG9uZzApO1xuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMubmFtZXMgPSBbXCJMYW1iZXJ0IFRhbmdlbnRpYWwgQ29uZm9ybWFsIENvbmljIFByb2plY3Rpb25cIiwgXCJMYW1iZXJ0X0NvbmZvcm1hbF9Db25pY1wiLCBcIkxhbWJlcnRfQ29uZm9ybWFsX0NvbmljXzJTUFwiLCBcImxjY1wiXTtcbiIsImV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAvL25vLW9wIGZvciBsb25nbGF0XG59O1xuXG5mdW5jdGlvbiBpZGVudGl0eShwdCkge1xuICByZXR1cm4gcHQ7XG59XG5leHBvcnRzLmZvcndhcmQgPSBpZGVudGl0eTtcbmV4cG9ydHMuaW52ZXJzZSA9IGlkZW50aXR5O1xuZXhwb3J0cy5uYW1lcyA9IFtcImxvbmdsYXRcIiwgXCJpZGVudGl0eVwiXTtcbiIsInZhciBtc2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tc2ZueicpO1xudmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIFIyRCA9IDU3LjI5NTc3OTUxMzA4MjMyMDg4O1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIEZPUlRQSSA9IE1hdGguUEkvNDtcbnZhciB0c2ZueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi90c2ZueicpO1xudmFyIHBoaTJ6ID0gcmVxdWlyZSgnLi4vY29tbW9uL3BoaTJ6Jyk7XG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGNvbiA9IHRoaXMuYiAvIHRoaXMuYTtcbiAgdGhpcy5lcyA9IDEgLSBjb24gKiBjb247XG4gIGlmKCEoJ3gwJyBpbiB0aGlzKSl7XG4gICAgdGhpcy54MCA9IDA7XG4gIH1cbiAgaWYoISgneTAnIGluIHRoaXMpKXtcbiAgICB0aGlzLnkwID0gMDtcbiAgfVxuICB0aGlzLmUgPSBNYXRoLnNxcnQodGhpcy5lcyk7XG4gIGlmICh0aGlzLmxhdF90cykge1xuICAgIGlmICh0aGlzLnNwaGVyZSkge1xuICAgICAgdGhpcy5rMCA9IE1hdGguY29zKHRoaXMubGF0X3RzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmswID0gbXNmbnoodGhpcy5lLCBNYXRoLnNpbih0aGlzLmxhdF90cyksIE1hdGguY29zKHRoaXMubGF0X3RzKSk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5rMCkge1xuICAgICAgaWYgKHRoaXMuaykge1xuICAgICAgICB0aGlzLmswID0gdGhpcy5rO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuazAgPSAxO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuLyogTWVyY2F0b3IgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuICAvLyBjb252ZXJ0IHRvIHJhZGlhbnNcbiAgaWYgKGxhdCAqIFIyRCA+IDkwICYmIGxhdCAqIFIyRCA8IC05MCAmJiBsb24gKiBSMkQgPiAxODAgJiYgbG9uICogUjJEIDwgLTE4MCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIHgsIHk7XG4gIGlmIChNYXRoLmFicyhNYXRoLmFicyhsYXQpIC0gSEFMRl9QSSkgPD0gRVBTTE4pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICAgIHggPSB0aGlzLngwICsgdGhpcy5hICogdGhpcy5rMCAqIGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gICAgICB5ID0gdGhpcy55MCArIHRoaXMuYSAqIHRoaXMuazAgKiBNYXRoLmxvZyhNYXRoLnRhbihGT1JUUEkgKyAwLjUgKiBsYXQpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXIgc2lucGhpID0gTWF0aC5zaW4obGF0KTtcbiAgICAgIHZhciB0cyA9IHRzZm56KHRoaXMuZSwgbGF0LCBzaW5waGkpO1xuICAgICAgeCA9IHRoaXMueDAgKyB0aGlzLmEgKiB0aGlzLmswICogYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgICAgIHkgPSB0aGlzLnkwIC0gdGhpcy5hICogdGhpcy5rMCAqIE1hdGgubG9nKHRzKTtcbiAgICB9XG4gICAgcC54ID0geDtcbiAgICBwLnkgPSB5O1xuICAgIHJldHVybiBwO1xuICB9XG59O1xuXG5cbi8qIE1lcmNhdG9yIGludmVyc2UgZXF1YXRpb25zLS1tYXBwaW5nIHgseSB0byBsYXQvbG9uZ1xuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG5cbiAgdmFyIHggPSBwLnggLSB0aGlzLngwO1xuICB2YXIgeSA9IHAueSAtIHRoaXMueTA7XG4gIHZhciBsb24sIGxhdDtcblxuICBpZiAodGhpcy5zcGhlcmUpIHtcbiAgICBsYXQgPSBIQUxGX1BJIC0gMiAqIE1hdGguYXRhbihNYXRoLmV4cCgteSAvICh0aGlzLmEgKiB0aGlzLmswKSkpO1xuICB9XG4gIGVsc2Uge1xuICAgIHZhciB0cyA9IE1hdGguZXhwKC15IC8gKHRoaXMuYSAqIHRoaXMuazApKTtcbiAgICBsYXQgPSBwaGkyeih0aGlzLmUsIHRzKTtcbiAgICBpZiAobGF0ID09PSAtOTk5OSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIHggLyAodGhpcy5hICogdGhpcy5rMCkpO1xuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMubmFtZXMgPSBbXCJNZXJjYXRvclwiLCBcIlBvcHVsYXIgVmlzdWFsaXNhdGlvbiBQc2V1ZG8gTWVyY2F0b3JcIiwgXCJNZXJjYXRvcl8xU1BcIiwgXCJNZXJjYXRvcl9BdXhpbGlhcnlfU3BoZXJlXCIsIFwibWVyY1wiXTtcbiIsInZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbi8qXG4gIHJlZmVyZW5jZVxuICAgIFwiTmV3IEVxdWFsLUFyZWEgTWFwIFByb2plY3Rpb25zIGZvciBOb25jaXJjdWxhciBSZWdpb25zXCIsIEpvaG4gUC4gU255ZGVyLFxuICAgIFRoZSBBbWVyaWNhbiBDYXJ0b2dyYXBoZXIsIFZvbCAxNSwgTm8uIDQsIE9jdG9iZXIgMTk4OCwgcHAuIDM0MS0zNTUuXG4gICovXG5cblxuLyogSW5pdGlhbGl6ZSB0aGUgTWlsbGVyIEN5bGluZHJpY2FsIHByb2plY3Rpb25cbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgLy9uby1vcFxufTtcblxuXG4vKiBNaWxsZXIgQ3lsaW5kcmljYWwgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdmFyIGRsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuICB2YXIgeCA9IHRoaXMueDAgKyB0aGlzLmEgKiBkbG9uO1xuICB2YXIgeSA9IHRoaXMueTAgKyB0aGlzLmEgKiBNYXRoLmxvZyhNYXRoLnRhbigoTWF0aC5QSSAvIDQpICsgKGxhdCAvIDIuNSkpKSAqIDEuMjU7XG5cbiAgcC54ID0geDtcbiAgcC55ID0geTtcbiAgcmV0dXJuIHA7XG59O1xuXG4vKiBNaWxsZXIgQ3lsaW5kcmljYWwgaW52ZXJzZSBlcXVhdGlvbnMtLW1hcHBpbmcgeCx5IHRvIGxhdC9sb25nXG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuXG4gIHZhciBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBwLnggLyB0aGlzLmEpO1xuICB2YXIgbGF0ID0gMi41ICogKE1hdGguYXRhbihNYXRoLmV4cCgwLjggKiBwLnkgLyB0aGlzLmEpKSAtIE1hdGguUEkgLyA0KTtcblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIk1pbGxlcl9DeWxpbmRyaWNhbFwiLCBcIm1pbGxcIl07XG4iLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7fTtcblxuLyogTW9sbHdlaWRlIGZvcndhcmQgZXF1YXRpb25zLS1tYXBwaW5nIGxhdCxsb25nIHRvIHgseVxuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuXG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG5cbiAgdmFyIGRlbHRhX2xvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIHZhciB0aGV0YSA9IGxhdDtcbiAgdmFyIGNvbiA9IE1hdGguUEkgKiBNYXRoLnNpbihsYXQpO1xuXG4gIC8qIEl0ZXJhdGUgdXNpbmcgdGhlIE5ld3Rvbi1SYXBoc29uIG1ldGhvZCB0byBmaW5kIHRoZXRhXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIGZvciAodmFyIGkgPSAwOyB0cnVlOyBpKyspIHtcbiAgICB2YXIgZGVsdGFfdGhldGEgPSAtKHRoZXRhICsgTWF0aC5zaW4odGhldGEpIC0gY29uKSAvICgxICsgTWF0aC5jb3ModGhldGEpKTtcbiAgICB0aGV0YSArPSBkZWx0YV90aGV0YTtcbiAgICBpZiAoTWF0aC5hYnMoZGVsdGFfdGhldGEpIDwgRVBTTE4pIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICB0aGV0YSAvPSAyO1xuXG4gIC8qIElmIHRoZSBsYXRpdHVkZSBpcyA5MCBkZWcsIGZvcmNlIHRoZSB4IGNvb3JkaW5hdGUgdG8gYmUgXCIwICsgZmFsc2UgZWFzdGluZ1wiXG4gICAgICAgdGhpcyBpcyBkb25lIGhlcmUgYmVjYXVzZSBvZiBwcmVjaXNpb24gcHJvYmxlbXMgd2l0aCBcImNvcyh0aGV0YSlcIlxuICAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgaWYgKE1hdGguUEkgLyAyIC0gTWF0aC5hYnMobGF0KSA8IEVQU0xOKSB7XG4gICAgZGVsdGFfbG9uID0gMDtcbiAgfVxuICB2YXIgeCA9IDAuOTAwMzE2MzE2MTU4ICogdGhpcy5hICogZGVsdGFfbG9uICogTWF0aC5jb3ModGhldGEpICsgdGhpcy54MDtcbiAgdmFyIHkgPSAxLjQxNDIxMzU2MjM3MzEgKiB0aGlzLmEgKiBNYXRoLnNpbih0aGV0YSkgKyB0aGlzLnkwO1xuXG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgdGhldGE7XG4gIHZhciBhcmc7XG5cbiAgLyogSW52ZXJzZSBlcXVhdGlvbnNcbiAgICAgIC0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICBhcmcgPSBwLnkgLyAoMS40MTQyMTM1NjIzNzMxICogdGhpcy5hKTtcblxuICAvKiBCZWNhdXNlIG9mIGRpdmlzaW9uIGJ5IHplcm8gcHJvYmxlbXMsICdhcmcnIGNhbiBub3QgYmUgMS4gIFRoZXJlZm9yZVxuICAgICAgIGEgbnVtYmVyIHZlcnkgY2xvc2UgdG8gb25lIGlzIHVzZWQgaW5zdGVhZC5cbiAgICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgaWYgKE1hdGguYWJzKGFyZykgPiAwLjk5OTk5OTk5OTk5OSkge1xuICAgIGFyZyA9IDAuOTk5OTk5OTk5OTk5O1xuICB9XG4gIHRoZXRhID0gTWF0aC5hc2luKGFyZyk7XG4gIHZhciBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyAocC54IC8gKDAuOTAwMzE2MzE2MTU4ICogdGhpcy5hICogTWF0aC5jb3ModGhldGEpKSkpO1xuICBpZiAobG9uIDwgKC1NYXRoLlBJKSkge1xuICAgIGxvbiA9IC1NYXRoLlBJO1xuICB9XG4gIGlmIChsb24gPiBNYXRoLlBJKSB7XG4gICAgbG9uID0gTWF0aC5QSTtcbiAgfVxuICBhcmcgPSAoMiAqIHRoZXRhICsgTWF0aC5zaW4oMiAqIHRoZXRhKSkgLyBNYXRoLlBJO1xuICBpZiAoTWF0aC5hYnMoYXJnKSA+IDEpIHtcbiAgICBhcmcgPSAxO1xuICB9XG4gIHZhciBsYXQgPSBNYXRoLmFzaW4oYXJnKTtcblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIk1vbGx3ZWlkZVwiLCBcIm1vbGxcIl07XG4iLCJ2YXIgU0VDX1RPX1JBRCA9IDQuODQ4MTM2ODExMDk1MzU5OTM1ODk5MTQxMDIzNTdlLTY7XG4vKlxuICByZWZlcmVuY2VcbiAgICBEZXBhcnRtZW50IG9mIExhbmQgYW5kIFN1cnZleSBUZWNobmljYWwgQ2lyY3VsYXIgMTk3My8zMlxuICAgICAgaHR0cDovL3d3dy5saW56LmdvdnQubnovZG9jcy9taXNjZWxsYW5lb3VzL256LW1hcC1kZWZpbml0aW9uLnBkZlxuICAgIE9TRyBUZWNobmljYWwgUmVwb3J0IDQuMVxuICAgICAgaHR0cDovL3d3dy5saW56LmdvdnQubnovZG9jcy9taXNjZWxsYW5lb3VzL256bWcucGRmXG4gICovXG5cbi8qKlxuICogaXRlcmF0aW9uczogTnVtYmVyIG9mIGl0ZXJhdGlvbnMgdG8gcmVmaW5lIGludmVyc2UgdHJhbnNmb3JtLlxuICogICAgIDAgLT4ga20gYWNjdXJhY3lcbiAqICAgICAxIC0+IG0gYWNjdXJhY3kgLS0gc3VpdGFibGUgZm9yIG1vc3QgbWFwcGluZyBhcHBsaWNhdGlvbnNcbiAqICAgICAyIC0+IG1tIGFjY3VyYWN5XG4gKi9cbmV4cG9ydHMuaXRlcmF0aW9ucyA9IDE7XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLkEgPSBbXTtcbiAgdGhpcy5BWzFdID0gMC42Mzk5MTc1MDczO1xuICB0aGlzLkFbMl0gPSAtMC4xMzU4Nzk3NjEzO1xuICB0aGlzLkFbM10gPSAwLjA2MzI5NDQwOTtcbiAgdGhpcy5BWzRdID0gLTAuMDI1MjY4NTM7XG4gIHRoaXMuQVs1XSA9IDAuMDExNzg3OTtcbiAgdGhpcy5BWzZdID0gLTAuMDA1NTE2MTtcbiAgdGhpcy5BWzddID0gMC4wMDI2OTA2O1xuICB0aGlzLkFbOF0gPSAtMC4wMDEzMzM7XG4gIHRoaXMuQVs5XSA9IDAuMDAwNjc7XG4gIHRoaXMuQVsxMF0gPSAtMC4wMDAzNDtcblxuICB0aGlzLkJfcmUgPSBbXTtcbiAgdGhpcy5CX2ltID0gW107XG4gIHRoaXMuQl9yZVsxXSA9IDAuNzU1Nzg1MzIyODtcbiAgdGhpcy5CX2ltWzFdID0gMDtcbiAgdGhpcy5CX3JlWzJdID0gMC4yNDkyMDQ2NDY7XG4gIHRoaXMuQl9pbVsyXSA9IDAuMDAzMzcxNTA3O1xuICB0aGlzLkJfcmVbM10gPSAtMC4wMDE1NDE3Mzk7XG4gIHRoaXMuQl9pbVszXSA9IDAuMDQxMDU4NTYwO1xuICB0aGlzLkJfcmVbNF0gPSAtMC4xMDE2MjkwNztcbiAgdGhpcy5CX2ltWzRdID0gMC4wMTcyNzYwOTtcbiAgdGhpcy5CX3JlWzVdID0gLTAuMjY2MjM0ODk7XG4gIHRoaXMuQl9pbVs1XSA9IC0wLjM2MjQ5MjE4O1xuICB0aGlzLkJfcmVbNl0gPSAtMC42ODcwOTgzO1xuICB0aGlzLkJfaW1bNl0gPSAtMS4xNjUxOTY3O1xuXG4gIHRoaXMuQ19yZSA9IFtdO1xuICB0aGlzLkNfaW0gPSBbXTtcbiAgdGhpcy5DX3JlWzFdID0gMS4zMjMxMjcwNDM5O1xuICB0aGlzLkNfaW1bMV0gPSAwO1xuICB0aGlzLkNfcmVbMl0gPSAtMC41NzcyNDU3ODk7XG4gIHRoaXMuQ19pbVsyXSA9IC0wLjAwNzgwOTU5ODtcbiAgdGhpcy5DX3JlWzNdID0gMC41MDgzMDc1MTM7XG4gIHRoaXMuQ19pbVszXSA9IC0wLjExMjIwODk1MjtcbiAgdGhpcy5DX3JlWzRdID0gLTAuMTUwOTQ3NjI7XG4gIHRoaXMuQ19pbVs0XSA9IDAuMTgyMDA2MDI7XG4gIHRoaXMuQ19yZVs1XSA9IDEuMDE0MTgxNzk7XG4gIHRoaXMuQ19pbVs1XSA9IDEuNjQ0OTc2OTY7XG4gIHRoaXMuQ19yZVs2XSA9IDEuOTY2MDU0OTtcbiAgdGhpcy5DX2ltWzZdID0gMi41MTI3NjQ1O1xuXG4gIHRoaXMuRCA9IFtdO1xuICB0aGlzLkRbMV0gPSAxLjU2MjcwMTQyNDM7XG4gIHRoaXMuRFsyXSA9IDAuNTE4NTQwNjM5ODtcbiAgdGhpcy5EWzNdID0gLTAuMDMzMzMwOTg7XG4gIHRoaXMuRFs0XSA9IC0wLjEwNTI5MDY7XG4gIHRoaXMuRFs1XSA9IC0wLjAzNjg1OTQ7XG4gIHRoaXMuRFs2XSA9IDAuMDA3MzE3O1xuICB0aGlzLkRbN10gPSAwLjAxMjIwO1xuICB0aGlzLkRbOF0gPSAwLjAwMzk0O1xuICB0aGlzLkRbOV0gPSAtMC4wMDEzO1xufTtcblxuLyoqXG4gICAgTmV3IFplYWxhbmQgTWFwIEdyaWQgRm9yd2FyZCAgLSBsb25nL2xhdCB0byB4L3lcbiAgICBsb25nL2xhdCBpbiByYWRpYW5zXG4gICovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBuO1xuICB2YXIgbG9uID0gcC54O1xuICB2YXIgbGF0ID0gcC55O1xuXG4gIHZhciBkZWx0YV9sYXQgPSBsYXQgLSB0aGlzLmxhdDA7XG4gIHZhciBkZWx0YV9sb24gPSBsb24gLSB0aGlzLmxvbmcwO1xuXG4gIC8vIDEuIENhbGN1bGF0ZSBkX3BoaSBhbmQgZF9wc2kgICAgLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmQgZF9sYW1iZGFcbiAgLy8gRm9yIHRoaXMgYWxnb3JpdGhtLCBkZWx0YV9sYXRpdHVkZSBpcyBpbiBzZWNvbmRzIG9mIGFyYyB4IDEwLTUsIHNvIHdlIG5lZWQgdG8gc2NhbGUgdG8gdGhvc2UgdW5pdHMuIExvbmdpdHVkZSBpcyByYWRpYW5zLlxuICB2YXIgZF9waGkgPSBkZWx0YV9sYXQgLyBTRUNfVE9fUkFEICogMUUtNTtcbiAgdmFyIGRfbGFtYmRhID0gZGVsdGFfbG9uO1xuICB2YXIgZF9waGlfbiA9IDE7IC8vIGRfcGhpXjBcblxuICB2YXIgZF9wc2kgPSAwO1xuICBmb3IgKG4gPSAxOyBuIDw9IDEwOyBuKyspIHtcbiAgICBkX3BoaV9uID0gZF9waGlfbiAqIGRfcGhpO1xuICAgIGRfcHNpID0gZF9wc2kgKyB0aGlzLkFbbl0gKiBkX3BoaV9uO1xuICB9XG5cbiAgLy8gMi4gQ2FsY3VsYXRlIHRoZXRhXG4gIHZhciB0aF9yZSA9IGRfcHNpO1xuICB2YXIgdGhfaW0gPSBkX2xhbWJkYTtcblxuICAvLyAzLiBDYWxjdWxhdGUgelxuICB2YXIgdGhfbl9yZSA9IDE7XG4gIHZhciB0aF9uX2ltID0gMDsgLy8gdGhldGFeMFxuICB2YXIgdGhfbl9yZTE7XG4gIHZhciB0aF9uX2ltMTtcblxuICB2YXIgel9yZSA9IDA7XG4gIHZhciB6X2ltID0gMDtcbiAgZm9yIChuID0gMTsgbiA8PSA2OyBuKyspIHtcbiAgICB0aF9uX3JlMSA9IHRoX25fcmUgKiB0aF9yZSAtIHRoX25faW0gKiB0aF9pbTtcbiAgICB0aF9uX2ltMSA9IHRoX25faW0gKiB0aF9yZSArIHRoX25fcmUgKiB0aF9pbTtcbiAgICB0aF9uX3JlID0gdGhfbl9yZTE7XG4gICAgdGhfbl9pbSA9IHRoX25faW0xO1xuICAgIHpfcmUgPSB6X3JlICsgdGhpcy5CX3JlW25dICogdGhfbl9yZSAtIHRoaXMuQl9pbVtuXSAqIHRoX25faW07XG4gICAgel9pbSA9IHpfaW0gKyB0aGlzLkJfaW1bbl0gKiB0aF9uX3JlICsgdGhpcy5CX3JlW25dICogdGhfbl9pbTtcbiAgfVxuXG4gIC8vIDQuIENhbGN1bGF0ZSBlYXN0aW5nIGFuZCBub3J0aGluZ1xuICBwLnggPSAoel9pbSAqIHRoaXMuYSkgKyB0aGlzLngwO1xuICBwLnkgPSAoel9yZSAqIHRoaXMuYSkgKyB0aGlzLnkwO1xuXG4gIHJldHVybiBwO1xufTtcblxuXG4vKipcbiAgICBOZXcgWmVhbGFuZCBNYXAgR3JpZCBJbnZlcnNlICAtICB4L3kgdG8gbG9uZy9sYXRcbiAgKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIG47XG4gIHZhciB4ID0gcC54O1xuICB2YXIgeSA9IHAueTtcblxuICB2YXIgZGVsdGFfeCA9IHggLSB0aGlzLngwO1xuICB2YXIgZGVsdGFfeSA9IHkgLSB0aGlzLnkwO1xuXG4gIC8vIDEuIENhbGN1bGF0ZSB6XG4gIHZhciB6X3JlID0gZGVsdGFfeSAvIHRoaXMuYTtcbiAgdmFyIHpfaW0gPSBkZWx0YV94IC8gdGhpcy5hO1xuXG4gIC8vIDJhLiBDYWxjdWxhdGUgdGhldGEgLSBmaXJzdCBhcHByb3hpbWF0aW9uIGdpdmVzIGttIGFjY3VyYWN5XG4gIHZhciB6X25fcmUgPSAxO1xuICB2YXIgel9uX2ltID0gMDsgLy8gel4wXG4gIHZhciB6X25fcmUxO1xuICB2YXIgel9uX2ltMTtcblxuICB2YXIgdGhfcmUgPSAwO1xuICB2YXIgdGhfaW0gPSAwO1xuICBmb3IgKG4gPSAxOyBuIDw9IDY7IG4rKykge1xuICAgIHpfbl9yZTEgPSB6X25fcmUgKiB6X3JlIC0gel9uX2ltICogel9pbTtcbiAgICB6X25faW0xID0gel9uX2ltICogel9yZSArIHpfbl9yZSAqIHpfaW07XG4gICAgel9uX3JlID0gel9uX3JlMTtcbiAgICB6X25faW0gPSB6X25faW0xO1xuICAgIHRoX3JlID0gdGhfcmUgKyB0aGlzLkNfcmVbbl0gKiB6X25fcmUgLSB0aGlzLkNfaW1bbl0gKiB6X25faW07XG4gICAgdGhfaW0gPSB0aF9pbSArIHRoaXMuQ19pbVtuXSAqIHpfbl9yZSArIHRoaXMuQ19yZVtuXSAqIHpfbl9pbTtcbiAgfVxuXG4gIC8vIDJiLiBJdGVyYXRlIHRvIHJlZmluZSB0aGUgYWNjdXJhY3kgb2YgdGhlIGNhbGN1bGF0aW9uXG4gIC8vICAgICAgICAwIGl0ZXJhdGlvbnMgZ2l2ZXMga20gYWNjdXJhY3lcbiAgLy8gICAgICAgIDEgaXRlcmF0aW9uIGdpdmVzIG0gYWNjdXJhY3kgLS0gZ29vZCBlbm91Z2ggZm9yIG1vc3QgbWFwcGluZyBhcHBsaWNhdGlvbnNcbiAgLy8gICAgICAgIDIgaXRlcmF0aW9ucyBiaXZlcyBtbSBhY2N1cmFjeVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaXRlcmF0aW9uczsgaSsrKSB7XG4gICAgdmFyIHRoX25fcmUgPSB0aF9yZTtcbiAgICB2YXIgdGhfbl9pbSA9IHRoX2ltO1xuICAgIHZhciB0aF9uX3JlMTtcbiAgICB2YXIgdGhfbl9pbTE7XG5cbiAgICB2YXIgbnVtX3JlID0gel9yZTtcbiAgICB2YXIgbnVtX2ltID0gel9pbTtcbiAgICBmb3IgKG4gPSAyOyBuIDw9IDY7IG4rKykge1xuICAgICAgdGhfbl9yZTEgPSB0aF9uX3JlICogdGhfcmUgLSB0aF9uX2ltICogdGhfaW07XG4gICAgICB0aF9uX2ltMSA9IHRoX25faW0gKiB0aF9yZSArIHRoX25fcmUgKiB0aF9pbTtcbiAgICAgIHRoX25fcmUgPSB0aF9uX3JlMTtcbiAgICAgIHRoX25faW0gPSB0aF9uX2ltMTtcbiAgICAgIG51bV9yZSA9IG51bV9yZSArIChuIC0gMSkgKiAodGhpcy5CX3JlW25dICogdGhfbl9yZSAtIHRoaXMuQl9pbVtuXSAqIHRoX25faW0pO1xuICAgICAgbnVtX2ltID0gbnVtX2ltICsgKG4gLSAxKSAqICh0aGlzLkJfaW1bbl0gKiB0aF9uX3JlICsgdGhpcy5CX3JlW25dICogdGhfbl9pbSk7XG4gICAgfVxuXG4gICAgdGhfbl9yZSA9IDE7XG4gICAgdGhfbl9pbSA9IDA7XG4gICAgdmFyIGRlbl9yZSA9IHRoaXMuQl9yZVsxXTtcbiAgICB2YXIgZGVuX2ltID0gdGhpcy5CX2ltWzFdO1xuICAgIGZvciAobiA9IDI7IG4gPD0gNjsgbisrKSB7XG4gICAgICB0aF9uX3JlMSA9IHRoX25fcmUgKiB0aF9yZSAtIHRoX25faW0gKiB0aF9pbTtcbiAgICAgIHRoX25faW0xID0gdGhfbl9pbSAqIHRoX3JlICsgdGhfbl9yZSAqIHRoX2ltO1xuICAgICAgdGhfbl9yZSA9IHRoX25fcmUxO1xuICAgICAgdGhfbl9pbSA9IHRoX25faW0xO1xuICAgICAgZGVuX3JlID0gZGVuX3JlICsgbiAqICh0aGlzLkJfcmVbbl0gKiB0aF9uX3JlIC0gdGhpcy5CX2ltW25dICogdGhfbl9pbSk7XG4gICAgICBkZW5faW0gPSBkZW5faW0gKyBuICogKHRoaXMuQl9pbVtuXSAqIHRoX25fcmUgKyB0aGlzLkJfcmVbbl0gKiB0aF9uX2ltKTtcbiAgICB9XG5cbiAgICAvLyBDb21wbGV4IGRpdmlzaW9uXG4gICAgdmFyIGRlbjIgPSBkZW5fcmUgKiBkZW5fcmUgKyBkZW5faW0gKiBkZW5faW07XG4gICAgdGhfcmUgPSAobnVtX3JlICogZGVuX3JlICsgbnVtX2ltICogZGVuX2ltKSAvIGRlbjI7XG4gICAgdGhfaW0gPSAobnVtX2ltICogZGVuX3JlIC0gbnVtX3JlICogZGVuX2ltKSAvIGRlbjI7XG4gIH1cblxuICAvLyAzLiBDYWxjdWxhdGUgZF9waGkgICAgICAgICAgICAgIC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuZCBkX2xhbWJkYVxuICB2YXIgZF9wc2kgPSB0aF9yZTtcbiAgdmFyIGRfbGFtYmRhID0gdGhfaW07XG4gIHZhciBkX3BzaV9uID0gMTsgLy8gZF9wc2leMFxuXG4gIHZhciBkX3BoaSA9IDA7XG4gIGZvciAobiA9IDE7IG4gPD0gOTsgbisrKSB7XG4gICAgZF9wc2lfbiA9IGRfcHNpX24gKiBkX3BzaTtcbiAgICBkX3BoaSA9IGRfcGhpICsgdGhpcy5EW25dICogZF9wc2lfbjtcbiAgfVxuXG4gIC8vIDQuIENhbGN1bGF0ZSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlXG4gIC8vIGRfcGhpIGlzIGNhbGN1YXRlZCBpbiBzZWNvbmQgb2YgYXJjICogMTBeLTUsIHNvIHdlIG5lZWQgdG8gc2NhbGUgYmFjayB0byByYWRpYW5zLiBkX2xhbWJkYSBpcyBpbiByYWRpYW5zLlxuICB2YXIgbGF0ID0gdGhpcy5sYXQwICsgKGRfcGhpICogU0VDX1RPX1JBRCAqIDFFNSk7XG4gIHZhciBsb24gPSB0aGlzLmxvbmcwICsgZF9sYW1iZGE7XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG5cbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIk5ld19aZWFsYW5kX01hcF9HcmlkXCIsIFwibnptZ1wiXTsiLCJ2YXIgdHNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vdHNmbnonKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBwaGkyeiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9waGkyeicpO1xudmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRk9SVFBJID0gTWF0aC5QSS80O1xudmFyIEVQU0xOID0gMS4wZS0xMDtcblxuLyogSW5pdGlhbGl6ZSB0aGUgT2JsaXF1ZSBNZXJjYXRvciAgcHJvamVjdGlvblxuICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5ub19vZmYgPSB0aGlzLm5vX29mZiB8fCBmYWxzZTtcbiAgdGhpcy5ub19yb3QgPSB0aGlzLm5vX3JvdCB8fCBmYWxzZTtcblxuICBpZiAoaXNOYU4odGhpcy5rMCkpIHtcbiAgICB0aGlzLmswID0gMTtcbiAgfVxuICB2YXIgc2lubGF0ID0gTWF0aC5zaW4odGhpcy5sYXQwKTtcbiAgdmFyIGNvc2xhdCA9IE1hdGguY29zKHRoaXMubGF0MCk7XG4gIHZhciBjb24gPSB0aGlzLmUgKiBzaW5sYXQ7XG5cbiAgdGhpcy5ibCA9IE1hdGguc3FydCgxICsgdGhpcy5lcyAvICgxIC0gdGhpcy5lcykgKiBNYXRoLnBvdyhjb3NsYXQsIDQpKTtcbiAgdGhpcy5hbCA9IHRoaXMuYSAqIHRoaXMuYmwgKiB0aGlzLmswICogTWF0aC5zcXJ0KDEgLSB0aGlzLmVzKSAvICgxIC0gY29uICogY29uKTtcbiAgdmFyIHQwID0gdHNmbnoodGhpcy5lLCB0aGlzLmxhdDAsIHNpbmxhdCk7XG4gIHZhciBkbCA9IHRoaXMuYmwgLyBjb3NsYXQgKiBNYXRoLnNxcnQoKDEgLSB0aGlzLmVzKSAvICgxIC0gY29uICogY29uKSk7XG4gIGlmIChkbCAqIGRsIDwgMSkge1xuICAgIGRsID0gMTtcbiAgfVxuICB2YXIgZmw7XG4gIHZhciBnbDtcbiAgaWYgKCFpc05hTih0aGlzLmxvbmdjKSkge1xuICAgIC8vQ2VudHJhbCBwb2ludCBhbmQgYXppbXV0aCBtZXRob2RcblxuICAgIGlmICh0aGlzLmxhdDAgPj0gMCkge1xuICAgICAgZmwgPSBkbCArIE1hdGguc3FydChkbCAqIGRsIC0gMSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZmwgPSBkbCAtIE1hdGguc3FydChkbCAqIGRsIC0gMSk7XG4gICAgfVxuICAgIHRoaXMuZWwgPSBmbCAqIE1hdGgucG93KHQwLCB0aGlzLmJsKTtcbiAgICBnbCA9IDAuNSAqIChmbCAtIDEgLyBmbCk7XG4gICAgdGhpcy5nYW1tYTAgPSBNYXRoLmFzaW4oTWF0aC5zaW4odGhpcy5hbHBoYSkgLyBkbCk7XG4gICAgdGhpcy5sb25nMCA9IHRoaXMubG9uZ2MgLSBNYXRoLmFzaW4oZ2wgKiBNYXRoLnRhbih0aGlzLmdhbW1hMCkpIC8gdGhpcy5ibDtcblxuICB9XG4gIGVsc2Uge1xuICAgIC8vMiBwb2ludHMgbWV0aG9kXG4gICAgdmFyIHQxID0gdHNmbnoodGhpcy5lLCB0aGlzLmxhdDEsIE1hdGguc2luKHRoaXMubGF0MSkpO1xuICAgIHZhciB0MiA9IHRzZm56KHRoaXMuZSwgdGhpcy5sYXQyLCBNYXRoLnNpbih0aGlzLmxhdDIpKTtcbiAgICBpZiAodGhpcy5sYXQwID49IDApIHtcbiAgICAgIHRoaXMuZWwgPSAoZGwgKyBNYXRoLnNxcnQoZGwgKiBkbCAtIDEpKSAqIE1hdGgucG93KHQwLCB0aGlzLmJsKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmVsID0gKGRsIC0gTWF0aC5zcXJ0KGRsICogZGwgLSAxKSkgKiBNYXRoLnBvdyh0MCwgdGhpcy5ibCk7XG4gICAgfVxuICAgIHZhciBobCA9IE1hdGgucG93KHQxLCB0aGlzLmJsKTtcbiAgICB2YXIgbGwgPSBNYXRoLnBvdyh0MiwgdGhpcy5ibCk7XG4gICAgZmwgPSB0aGlzLmVsIC8gaGw7XG4gICAgZ2wgPSAwLjUgKiAoZmwgLSAxIC8gZmwpO1xuICAgIHZhciBqbCA9ICh0aGlzLmVsICogdGhpcy5lbCAtIGxsICogaGwpIC8gKHRoaXMuZWwgKiB0aGlzLmVsICsgbGwgKiBobCk7XG4gICAgdmFyIHBsID0gKGxsIC0gaGwpIC8gKGxsICsgaGwpO1xuICAgIHZhciBkbG9uMTIgPSBhZGp1c3RfbG9uKHRoaXMubG9uZzEgLSB0aGlzLmxvbmcyKTtcbiAgICB0aGlzLmxvbmcwID0gMC41ICogKHRoaXMubG9uZzEgKyB0aGlzLmxvbmcyKSAtIE1hdGguYXRhbihqbCAqIE1hdGgudGFuKDAuNSAqIHRoaXMuYmwgKiAoZGxvbjEyKSkgLyBwbCkgLyB0aGlzLmJsO1xuICAgIHRoaXMubG9uZzAgPSBhZGp1c3RfbG9uKHRoaXMubG9uZzApO1xuICAgIHZhciBkbG9uMTAgPSBhZGp1c3RfbG9uKHRoaXMubG9uZzEgLSB0aGlzLmxvbmcwKTtcbiAgICB0aGlzLmdhbW1hMCA9IE1hdGguYXRhbihNYXRoLnNpbih0aGlzLmJsICogKGRsb24xMCkpIC8gZ2wpO1xuICAgIHRoaXMuYWxwaGEgPSBNYXRoLmFzaW4oZGwgKiBNYXRoLnNpbih0aGlzLmdhbW1hMCkpO1xuICB9XG5cbiAgaWYgKHRoaXMubm9fb2ZmKSB7XG4gICAgdGhpcy51YyA9IDA7XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHRoaXMubGF0MCA+PSAwKSB7XG4gICAgICB0aGlzLnVjID0gdGhpcy5hbCAvIHRoaXMuYmwgKiBNYXRoLmF0YW4yKE1hdGguc3FydChkbCAqIGRsIC0gMSksIE1hdGguY29zKHRoaXMuYWxwaGEpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnVjID0gLTEgKiB0aGlzLmFsIC8gdGhpcy5ibCAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGRsICogZGwgLSAxKSwgTWF0aC5jb3ModGhpcy5hbHBoYSkpO1xuICAgIH1cbiAgfVxuXG59O1xuXG5cbi8qIE9ibGlxdWUgTWVyY2F0b3IgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIHVzLCB2cztcbiAgdmFyIGNvbjtcbiAgaWYgKE1hdGguYWJzKE1hdGguYWJzKGxhdCkgLSBIQUxGX1BJKSA8PSBFUFNMTikge1xuICAgIGlmIChsYXQgPiAwKSB7XG4gICAgICBjb24gPSAtMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb24gPSAxO1xuICAgIH1cbiAgICB2cyA9IHRoaXMuYWwgLyB0aGlzLmJsICogTWF0aC5sb2coTWF0aC50YW4oRk9SVFBJICsgY29uICogdGhpcy5nYW1tYTAgKiAwLjUpKTtcbiAgICB1cyA9IC0xICogY29uICogSEFMRl9QSSAqIHRoaXMuYWwgLyB0aGlzLmJsO1xuICB9XG4gIGVsc2Uge1xuICAgIHZhciB0ID0gdHNmbnoodGhpcy5lLCBsYXQsIE1hdGguc2luKGxhdCkpO1xuICAgIHZhciBxbCA9IHRoaXMuZWwgLyBNYXRoLnBvdyh0LCB0aGlzLmJsKTtcbiAgICB2YXIgc2wgPSAwLjUgKiAocWwgLSAxIC8gcWwpO1xuICAgIHZhciB0bCA9IDAuNSAqIChxbCArIDEgLyBxbCk7XG4gICAgdmFyIHZsID0gTWF0aC5zaW4odGhpcy5ibCAqIChkbG9uKSk7XG4gICAgdmFyIHVsID0gKHNsICogTWF0aC5zaW4odGhpcy5nYW1tYTApIC0gdmwgKiBNYXRoLmNvcyh0aGlzLmdhbW1hMCkpIC8gdGw7XG4gICAgaWYgKE1hdGguYWJzKE1hdGguYWJzKHVsKSAtIDEpIDw9IEVQU0xOKSB7XG4gICAgICB2cyA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2cyA9IDAuNSAqIHRoaXMuYWwgKiBNYXRoLmxvZygoMSAtIHVsKSAvICgxICsgdWwpKSAvIHRoaXMuYmw7XG4gICAgfVxuICAgIGlmIChNYXRoLmFicyhNYXRoLmNvcyh0aGlzLmJsICogKGRsb24pKSkgPD0gRVBTTE4pIHtcbiAgICAgIHVzID0gdGhpcy5hbCAqIHRoaXMuYmwgKiAoZGxvbik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdXMgPSB0aGlzLmFsICogTWF0aC5hdGFuMihzbCAqIE1hdGguY29zKHRoaXMuZ2FtbWEwKSArIHZsICogTWF0aC5zaW4odGhpcy5nYW1tYTApLCBNYXRoLmNvcyh0aGlzLmJsICogZGxvbikpIC8gdGhpcy5ibDtcbiAgICB9XG4gIH1cblxuICBpZiAodGhpcy5ub19yb3QpIHtcbiAgICBwLnggPSB0aGlzLngwICsgdXM7XG4gICAgcC55ID0gdGhpcy55MCArIHZzO1xuICB9XG4gIGVsc2Uge1xuXG4gICAgdXMgLT0gdGhpcy51YztcbiAgICBwLnggPSB0aGlzLngwICsgdnMgKiBNYXRoLmNvcyh0aGlzLmFscGhhKSArIHVzICogTWF0aC5zaW4odGhpcy5hbHBoYSk7XG4gICAgcC55ID0gdGhpcy55MCArIHVzICogTWF0aC5jb3ModGhpcy5hbHBoYSkgLSB2cyAqIE1hdGguc2luKHRoaXMuYWxwaGEpO1xuICB9XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgdXMsIHZzO1xuICBpZiAodGhpcy5ub19yb3QpIHtcbiAgICB2cyA9IHAueSAtIHRoaXMueTA7XG4gICAgdXMgPSBwLnggLSB0aGlzLngwO1xuICB9XG4gIGVsc2Uge1xuICAgIHZzID0gKHAueCAtIHRoaXMueDApICogTWF0aC5jb3ModGhpcy5hbHBoYSkgLSAocC55IC0gdGhpcy55MCkgKiBNYXRoLnNpbih0aGlzLmFscGhhKTtcbiAgICB1cyA9IChwLnkgLSB0aGlzLnkwKSAqIE1hdGguY29zKHRoaXMuYWxwaGEpICsgKHAueCAtIHRoaXMueDApICogTWF0aC5zaW4odGhpcy5hbHBoYSk7XG4gICAgdXMgKz0gdGhpcy51YztcbiAgfVxuICB2YXIgcXAgPSBNYXRoLmV4cCgtMSAqIHRoaXMuYmwgKiB2cyAvIHRoaXMuYWwpO1xuICB2YXIgc3AgPSAwLjUgKiAocXAgLSAxIC8gcXApO1xuICB2YXIgdHAgPSAwLjUgKiAocXAgKyAxIC8gcXApO1xuICB2YXIgdnAgPSBNYXRoLnNpbih0aGlzLmJsICogdXMgLyB0aGlzLmFsKTtcbiAgdmFyIHVwID0gKHZwICogTWF0aC5jb3ModGhpcy5nYW1tYTApICsgc3AgKiBNYXRoLnNpbih0aGlzLmdhbW1hMCkpIC8gdHA7XG4gIHZhciB0cyA9IE1hdGgucG93KHRoaXMuZWwgLyBNYXRoLnNxcnQoKDEgKyB1cCkgLyAoMSAtIHVwKSksIDEgLyB0aGlzLmJsKTtcbiAgaWYgKE1hdGguYWJzKHVwIC0gMSkgPCBFUFNMTikge1xuICAgIHAueCA9IHRoaXMubG9uZzA7XG4gICAgcC55ID0gSEFMRl9QSTtcbiAgfVxuICBlbHNlIGlmIChNYXRoLmFicyh1cCArIDEpIDwgRVBTTE4pIHtcbiAgICBwLnggPSB0aGlzLmxvbmcwO1xuICAgIHAueSA9IC0xICogSEFMRl9QSTtcbiAgfVxuICBlbHNlIHtcbiAgICBwLnkgPSBwaGkyeih0aGlzLmUsIHRzKTtcbiAgICBwLnggPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgLSBNYXRoLmF0YW4yKHNwICogTWF0aC5jb3ModGhpcy5nYW1tYTApIC0gdnAgKiBNYXRoLnNpbih0aGlzLmdhbW1hMCksIE1hdGguY29zKHRoaXMuYmwgKiB1cyAvIHRoaXMuYWwpKSAvIHRoaXMuYmwpO1xuICB9XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5uYW1lcyA9IFtcIkhvdGluZV9PYmxpcXVlX01lcmNhdG9yXCIsIFwiSG90aW5lIE9ibGlxdWUgTWVyY2F0b3JcIiwgXCJIb3RpbmVfT2JsaXF1ZV9NZXJjYXRvcl9BemltdXRoX05hdHVyYWxfT3JpZ2luXCIsIFwiSG90aW5lX09ibGlxdWVfTWVyY2F0b3JfQXppbXV0aF9DZW50ZXJcIiwgXCJvbWVyY1wiXTsiLCJ2YXIgZTBmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMGZuJyk7XG52YXIgZTFmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMWZuJyk7XG52YXIgZTJmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lMmZuJyk7XG52YXIgZTNmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9lM2ZuJyk7XG52YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgYWRqdXN0X2xhdCA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbGF0Jyk7XG52YXIgbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9tbGZuJyk7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIGdOID0gcmVxdWlyZSgnLi4vY29tbW9uL2dOJyk7XG52YXIgTUFYX0lURVIgPSAyMDtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAvKiBQbGFjZSBwYXJhbWV0ZXJzIGluIHN0YXRpYyBzdG9yYWdlIGZvciBjb21tb24gdXNlXG4gICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgdGhpcy50ZW1wID0gdGhpcy5iIC8gdGhpcy5hO1xuICB0aGlzLmVzID0gMSAtIE1hdGgucG93KHRoaXMudGVtcCwgMik7IC8vIGRldmFpdCBldHJlIGRhbnMgdG1lcmMuanMgbWFpcyBuIHkgZXN0IHBhcyBkb25jIGplIGNvbW1lbnRlIHNpbm9uIHJldG91ciBkZSB2YWxldXJzIG51bGxlc1xuICB0aGlzLmUgPSBNYXRoLnNxcnQodGhpcy5lcyk7XG4gIHRoaXMuZTAgPSBlMGZuKHRoaXMuZXMpO1xuICB0aGlzLmUxID0gZTFmbih0aGlzLmVzKTtcbiAgdGhpcy5lMiA9IGUyZm4odGhpcy5lcyk7XG4gIHRoaXMuZTMgPSBlM2ZuKHRoaXMuZXMpO1xuICB0aGlzLm1sMCA9IHRoaXMuYSAqIG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgdGhpcy5sYXQwKTsgLy9zaSBxdWUgZGVzIHplcm9zIGxlIGNhbGN1bCBuZSBzZSBmYWl0IHBhc1xufTtcblxuXG4vKiBQb2x5Y29uaWMgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIHgsIHksIGVsO1xuICB2YXIgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG4gIGVsID0gZGxvbiAqIE1hdGguc2luKGxhdCk7XG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGlmIChNYXRoLmFicyhsYXQpIDw9IEVQU0xOKSB7XG4gICAgICB4ID0gdGhpcy5hICogZGxvbjtcbiAgICAgIHkgPSAtMSAqIHRoaXMuYSAqIHRoaXMubGF0MDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB4ID0gdGhpcy5hICogTWF0aC5zaW4oZWwpIC8gTWF0aC50YW4obGF0KTtcbiAgICAgIHkgPSB0aGlzLmEgKiAoYWRqdXN0X2xhdChsYXQgLSB0aGlzLmxhdDApICsgKDEgLSBNYXRoLmNvcyhlbCkpIC8gTWF0aC50YW4obGF0KSk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGlmIChNYXRoLmFicyhsYXQpIDw9IEVQU0xOKSB7XG4gICAgICB4ID0gdGhpcy5hICogZGxvbjtcbiAgICAgIHkgPSAtMSAqIHRoaXMubWwwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciBubCA9IGdOKHRoaXMuYSwgdGhpcy5lLCBNYXRoLnNpbihsYXQpKSAvIE1hdGgudGFuKGxhdCk7XG4gICAgICB4ID0gbmwgKiBNYXRoLnNpbihlbCk7XG4gICAgICB5ID0gdGhpcy5hICogbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCBsYXQpIC0gdGhpcy5tbDAgKyBubCAqICgxIC0gTWF0aC5jb3MoZWwpKTtcbiAgICB9XG5cbiAgfVxuICBwLnggPSB4ICsgdGhpcy54MDtcbiAgcC55ID0geSArIHRoaXMueTA7XG4gIHJldHVybiBwO1xufTtcblxuXG4vKiBJbnZlcnNlIGVxdWF0aW9uc1xuICAtLS0tLS0tLS0tLS0tLS0tLSovXG5leHBvcnRzLmludmVyc2UgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBsb24sIGxhdCwgeCwgeSwgaTtcbiAgdmFyIGFsLCBibDtcbiAgdmFyIHBoaSwgZHBoaTtcbiAgeCA9IHAueCAtIHRoaXMueDA7XG4gIHkgPSBwLnkgLSB0aGlzLnkwO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGlmIChNYXRoLmFicyh5ICsgdGhpcy5hICogdGhpcy5sYXQwKSA8PSBFUFNMTikge1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih4IC8gdGhpcy5hICsgdGhpcy5sb25nMCk7XG4gICAgICBsYXQgPSAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGFsID0gdGhpcy5sYXQwICsgeSAvIHRoaXMuYTtcbiAgICAgIGJsID0geCAqIHggLyB0aGlzLmEgLyB0aGlzLmEgKyBhbCAqIGFsO1xuICAgICAgcGhpID0gYWw7XG4gICAgICB2YXIgdGFucGhpO1xuICAgICAgZm9yIChpID0gTUFYX0lURVI7IGk7IC0taSkge1xuICAgICAgICB0YW5waGkgPSBNYXRoLnRhbihwaGkpO1xuICAgICAgICBkcGhpID0gLTEgKiAoYWwgKiAocGhpICogdGFucGhpICsgMSkgLSBwaGkgLSAwLjUgKiAocGhpICogcGhpICsgYmwpICogdGFucGhpKSAvICgocGhpIC0gYWwpIC8gdGFucGhpIC0gMSk7XG4gICAgICAgIHBoaSArPSBkcGhpO1xuICAgICAgICBpZiAoTWF0aC5hYnMoZHBoaSkgPD0gRVBTTE4pIHtcbiAgICAgICAgICBsYXQgPSBwaGk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIChNYXRoLmFzaW4oeCAqIE1hdGgudGFuKHBoaSkgLyB0aGlzLmEpKSAvIE1hdGguc2luKGxhdCkpO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBpZiAoTWF0aC5hYnMoeSArIHRoaXMubWwwKSA8PSBFUFNMTikge1xuICAgICAgbGF0ID0gMDtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIHggLyB0aGlzLmEpO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgYWwgPSAodGhpcy5tbDAgKyB5KSAvIHRoaXMuYTtcbiAgICAgIGJsID0geCAqIHggLyB0aGlzLmEgLyB0aGlzLmEgKyBhbCAqIGFsO1xuICAgICAgcGhpID0gYWw7XG4gICAgICB2YXIgY2wsIG1sbiwgbWxucCwgbWE7XG4gICAgICB2YXIgY29uO1xuICAgICAgZm9yIChpID0gTUFYX0lURVI7IGk7IC0taSkge1xuICAgICAgICBjb24gPSB0aGlzLmUgKiBNYXRoLnNpbihwaGkpO1xuICAgICAgICBjbCA9IE1hdGguc3FydCgxIC0gY29uICogY29uKSAqIE1hdGgudGFuKHBoaSk7XG4gICAgICAgIG1sbiA9IHRoaXMuYSAqIG1sZm4odGhpcy5lMCwgdGhpcy5lMSwgdGhpcy5lMiwgdGhpcy5lMywgcGhpKTtcbiAgICAgICAgbWxucCA9IHRoaXMuZTAgLSAyICogdGhpcy5lMSAqIE1hdGguY29zKDIgKiBwaGkpICsgNCAqIHRoaXMuZTIgKiBNYXRoLmNvcyg0ICogcGhpKSAtIDYgKiB0aGlzLmUzICogTWF0aC5jb3MoNiAqIHBoaSk7XG4gICAgICAgIG1hID0gbWxuIC8gdGhpcy5hO1xuICAgICAgICBkcGhpID0gKGFsICogKGNsICogbWEgKyAxKSAtIG1hIC0gMC41ICogY2wgKiAobWEgKiBtYSArIGJsKSkgLyAodGhpcy5lcyAqIE1hdGguc2luKDIgKiBwaGkpICogKG1hICogbWEgKyBibCAtIDIgKiBhbCAqIG1hKSAvICg0ICogY2wpICsgKGFsIC0gbWEpICogKGNsICogbWxucCAtIDIgLyBNYXRoLnNpbigyICogcGhpKSkgLSBtbG5wKTtcbiAgICAgICAgcGhpIC09IGRwaGk7XG4gICAgICAgIGlmIChNYXRoLmFicyhkcGhpKSA8PSBFUFNMTikge1xuICAgICAgICAgIGxhdCA9IHBoaTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvL2xhdD1waGk0eih0aGlzLmUsdGhpcy5lMCx0aGlzLmUxLHRoaXMuZTIsdGhpcy5lMyxhbCxibCwwLDApO1xuICAgICAgY2wgPSBNYXRoLnNxcnQoMSAtIHRoaXMuZXMgKiBNYXRoLnBvdyhNYXRoLnNpbihsYXQpLCAyKSkgKiBNYXRoLnRhbihsYXQpO1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hc2luKHggKiBjbCAvIHRoaXMuYSkgLyBNYXRoLnNpbihsYXQpKTtcbiAgICB9XG4gIH1cblxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIlBvbHljb25pY1wiLCBcInBvbHlcIl07IiwidmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xudmFyIGFkanVzdF9sYXQgPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xhdCcpO1xudmFyIHBqX2VuZm4gPSByZXF1aXJlKCcuLi9jb21tb24vcGpfZW5mbicpO1xudmFyIE1BWF9JVEVSID0gMjA7XG52YXIgcGpfbWxmbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9wal9tbGZuJyk7XG52YXIgcGpfaW52X21sZm4gPSByZXF1aXJlKCcuLi9jb21tb24vcGpfaW52X21sZm4nKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBhc2lueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hc2lueicpO1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIC8qIFBsYWNlIHBhcmFtZXRlcnMgaW4gc3RhdGljIHN0b3JhZ2UgZm9yIGNvbW1vbiB1c2VcbiAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXG4gIGlmICghdGhpcy5zcGhlcmUpIHtcbiAgICB0aGlzLmVuID0gcGpfZW5mbih0aGlzLmVzKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLm4gPSAxO1xuICAgIHRoaXMubSA9IDA7XG4gICAgdGhpcy5lcyA9IDA7XG4gICAgdGhpcy5DX3kgPSBNYXRoLnNxcnQoKHRoaXMubSArIDEpIC8gdGhpcy5uKTtcbiAgICB0aGlzLkNfeCA9IHRoaXMuQ195IC8gKHRoaXMubSArIDEpO1xuICB9XG5cbn07XG5cbi8qIFNpbnVzb2lkYWwgZm9yd2FyZCBlcXVhdGlvbnMtLW1hcHBpbmcgbGF0LGxvbmcgdG8geCx5XG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHgsIHk7XG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG4gIC8qIEZvcndhcmQgZXF1YXRpb25zXG4gICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBsb24gPSBhZGp1c3RfbG9uKGxvbiAtIHRoaXMubG9uZzApO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGlmICghdGhpcy5tKSB7XG4gICAgICBsYXQgPSB0aGlzLm4gIT09IDEgPyBNYXRoLmFzaW4odGhpcy5uICogTWF0aC5zaW4obGF0KSkgOiBsYXQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdmFyIGsgPSB0aGlzLm4gKiBNYXRoLnNpbihsYXQpO1xuICAgICAgZm9yICh2YXIgaSA9IE1BWF9JVEVSOyBpOyAtLWkpIHtcbiAgICAgICAgdmFyIFYgPSAodGhpcy5tICogbGF0ICsgTWF0aC5zaW4obGF0KSAtIGspIC8gKHRoaXMubSArIE1hdGguY29zKGxhdCkpO1xuICAgICAgICBsYXQgLT0gVjtcbiAgICAgICAgaWYgKE1hdGguYWJzKFYpIDwgRVBTTE4pIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB4ID0gdGhpcy5hICogdGhpcy5DX3ggKiBsb24gKiAodGhpcy5tICsgTWF0aC5jb3MobGF0KSk7XG4gICAgeSA9IHRoaXMuYSAqIHRoaXMuQ195ICogbGF0O1xuXG4gIH1cbiAgZWxzZSB7XG5cbiAgICB2YXIgcyA9IE1hdGguc2luKGxhdCk7XG4gICAgdmFyIGMgPSBNYXRoLmNvcyhsYXQpO1xuICAgIHkgPSB0aGlzLmEgKiBwal9tbGZuKGxhdCwgcywgYywgdGhpcy5lbik7XG4gICAgeCA9IHRoaXMuYSAqIGxvbiAqIGMgLyBNYXRoLnNxcnQoMSAtIHRoaXMuZXMgKiBzICogcyk7XG4gIH1cblxuICBwLnggPSB4O1xuICBwLnkgPSB5O1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxhdCwgdGVtcCwgbG9uLCBzO1xuXG4gIHAueCAtPSB0aGlzLngwO1xuICBsb24gPSBwLnggLyB0aGlzLmE7XG4gIHAueSAtPSB0aGlzLnkwO1xuICBsYXQgPSBwLnkgLyB0aGlzLmE7XG5cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgbGF0IC89IHRoaXMuQ195O1xuICAgIGxvbiA9IGxvbiAvICh0aGlzLkNfeCAqICh0aGlzLm0gKyBNYXRoLmNvcyhsYXQpKSk7XG4gICAgaWYgKHRoaXMubSkge1xuICAgICAgbGF0ID0gYXNpbnooKHRoaXMubSAqIGxhdCArIE1hdGguc2luKGxhdCkpIC8gdGhpcy5uKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5uICE9PSAxKSB7XG4gICAgICBsYXQgPSBhc2lueihNYXRoLnNpbihsYXQpIC8gdGhpcy5uKTtcbiAgICB9XG4gICAgbG9uID0gYWRqdXN0X2xvbihsb24gKyB0aGlzLmxvbmcwKTtcbiAgICBsYXQgPSBhZGp1c3RfbGF0KGxhdCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgbGF0ID0gcGpfaW52X21sZm4ocC55IC8gdGhpcy5hLCB0aGlzLmVzLCB0aGlzLmVuKTtcbiAgICBzID0gTWF0aC5hYnMobGF0KTtcbiAgICBpZiAocyA8IEhBTEZfUEkpIHtcbiAgICAgIHMgPSBNYXRoLnNpbihsYXQpO1xuICAgICAgdGVtcCA9IHRoaXMubG9uZzAgKyBwLnggKiBNYXRoLnNxcnQoMSAtIHRoaXMuZXMgKiBzICogcykgLyAodGhpcy5hICogTWF0aC5jb3MobGF0KSk7XG4gICAgICAvL3RlbXAgPSB0aGlzLmxvbmcwICsgcC54IC8gKHRoaXMuYSAqIE1hdGguY29zKGxhdCkpO1xuICAgICAgbG9uID0gYWRqdXN0X2xvbih0ZW1wKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoKHMgLSBFUFNMTikgPCBIQUxGX1BJKSB7XG4gICAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgIH1cbiAgfVxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIlNpbnVzb2lkYWxcIiwgXCJzaW51XCJdOyIsIi8qXG4gIHJlZmVyZW5jZXM6XG4gICAgRm9ybXVsZXMgZXQgY29uc3RhbnRlcyBwb3VyIGxlIENhbGN1bCBwb3VyIGxhXG4gICAgcHJvamVjdGlvbiBjeWxpbmRyaXF1ZSBjb25mb3JtZSDDoCBheGUgb2JsaXF1ZSBldCBwb3VyIGxhIHRyYW5zZm9ybWF0aW9uIGVudHJlXG4gICAgZGVzIHN5c3TDqG1lcyBkZSByw6lmw6lyZW5jZS5cbiAgICBodHRwOi8vd3d3LnN3aXNzdG9wby5hZG1pbi5jaC9pbnRlcm5ldC9zd2lzc3RvcG8vZnIvaG9tZS90b3BpY3Mvc3VydmV5L3N5cy9yZWZzeXMvc3dpdHplcmxhbmQucGFyc3lzcmVsYXRlZDEuMzEyMTYuZG93bmxvYWRMaXN0Ljc3MDA0LkRvd25sb2FkRmlsZS50bXAvc3dpc3Nwcm9qZWN0aW9uZnIucGRmXG4gICovXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBoeTAgPSB0aGlzLmxhdDA7XG4gIHRoaXMubGFtYmRhMCA9IHRoaXMubG9uZzA7XG4gIHZhciBzaW5QaHkwID0gTWF0aC5zaW4ocGh5MCk7XG4gIHZhciBzZW1pTWFqb3JBeGlzID0gdGhpcy5hO1xuICB2YXIgaW52RiA9IHRoaXMucmY7XG4gIHZhciBmbGF0dGVuaW5nID0gMSAvIGludkY7XG4gIHZhciBlMiA9IDIgKiBmbGF0dGVuaW5nIC0gTWF0aC5wb3coZmxhdHRlbmluZywgMik7XG4gIHZhciBlID0gdGhpcy5lID0gTWF0aC5zcXJ0KGUyKTtcbiAgdGhpcy5SID0gdGhpcy5rMCAqIHNlbWlNYWpvckF4aXMgKiBNYXRoLnNxcnQoMSAtIGUyKSAvICgxIC0gZTIgKiBNYXRoLnBvdyhzaW5QaHkwLCAyKSk7XG4gIHRoaXMuYWxwaGEgPSBNYXRoLnNxcnQoMSArIGUyIC8gKDEgLSBlMikgKiBNYXRoLnBvdyhNYXRoLmNvcyhwaHkwKSwgNCkpO1xuICB0aGlzLmIwID0gTWF0aC5hc2luKHNpblBoeTAgLyB0aGlzLmFscGhhKTtcbiAgdmFyIGsxID0gTWF0aC5sb2coTWF0aC50YW4oTWF0aC5QSSAvIDQgKyB0aGlzLmIwIC8gMikpO1xuICB2YXIgazIgPSBNYXRoLmxvZyhNYXRoLnRhbihNYXRoLlBJIC8gNCArIHBoeTAgLyAyKSk7XG4gIHZhciBrMyA9IE1hdGgubG9nKCgxICsgZSAqIHNpblBoeTApIC8gKDEgLSBlICogc2luUGh5MCkpO1xuICB0aGlzLksgPSBrMSAtIHRoaXMuYWxwaGEgKiBrMiArIHRoaXMuYWxwaGEgKiBlIC8gMiAqIGszO1xufTtcblxuXG5leHBvcnRzLmZvcndhcmQgPSBmdW5jdGlvbihwKSB7XG4gIHZhciBTYTEgPSBNYXRoLmxvZyhNYXRoLnRhbihNYXRoLlBJIC8gNCAtIHAueSAvIDIpKTtcbiAgdmFyIFNhMiA9IHRoaXMuZSAvIDIgKiBNYXRoLmxvZygoMSArIHRoaXMuZSAqIE1hdGguc2luKHAueSkpIC8gKDEgLSB0aGlzLmUgKiBNYXRoLnNpbihwLnkpKSk7XG4gIHZhciBTID0gLXRoaXMuYWxwaGEgKiAoU2ExICsgU2EyKSArIHRoaXMuSztcblxuICAvLyBzcGhlcmljIGxhdGl0dWRlXG4gIHZhciBiID0gMiAqIChNYXRoLmF0YW4oTWF0aC5leHAoUykpIC0gTWF0aC5QSSAvIDQpO1xuXG4gIC8vIHNwaGVyaWMgbG9uZ2l0dWRlXG4gIHZhciBJID0gdGhpcy5hbHBoYSAqIChwLnggLSB0aGlzLmxhbWJkYTApO1xuXG4gIC8vIHBzb2V1ZG8gZXF1YXRvcmlhbCByb3RhdGlvblxuICB2YXIgcm90SSA9IE1hdGguYXRhbihNYXRoLnNpbihJKSAvIChNYXRoLnNpbih0aGlzLmIwKSAqIE1hdGgudGFuKGIpICsgTWF0aC5jb3ModGhpcy5iMCkgKiBNYXRoLmNvcyhJKSkpO1xuXG4gIHZhciByb3RCID0gTWF0aC5hc2luKE1hdGguY29zKHRoaXMuYjApICogTWF0aC5zaW4oYikgLSBNYXRoLnNpbih0aGlzLmIwKSAqIE1hdGguY29zKGIpICogTWF0aC5jb3MoSSkpO1xuXG4gIHAueSA9IHRoaXMuUiAvIDIgKiBNYXRoLmxvZygoMSArIE1hdGguc2luKHJvdEIpKSAvICgxIC0gTWF0aC5zaW4ocm90QikpKSArIHRoaXMueTA7XG4gIHAueCA9IHRoaXMuUiAqIHJvdEkgKyB0aGlzLngwO1xuICByZXR1cm4gcDtcbn07XG5cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIFkgPSBwLnggLSB0aGlzLngwO1xuICB2YXIgWCA9IHAueSAtIHRoaXMueTA7XG5cbiAgdmFyIHJvdEkgPSBZIC8gdGhpcy5SO1xuICB2YXIgcm90QiA9IDIgKiAoTWF0aC5hdGFuKE1hdGguZXhwKFggLyB0aGlzLlIpKSAtIE1hdGguUEkgLyA0KTtcblxuICB2YXIgYiA9IE1hdGguYXNpbihNYXRoLmNvcyh0aGlzLmIwKSAqIE1hdGguc2luKHJvdEIpICsgTWF0aC5zaW4odGhpcy5iMCkgKiBNYXRoLmNvcyhyb3RCKSAqIE1hdGguY29zKHJvdEkpKTtcbiAgdmFyIEkgPSBNYXRoLmF0YW4oTWF0aC5zaW4ocm90SSkgLyAoTWF0aC5jb3ModGhpcy5iMCkgKiBNYXRoLmNvcyhyb3RJKSAtIE1hdGguc2luKHRoaXMuYjApICogTWF0aC50YW4ocm90QikpKTtcblxuICB2YXIgbGFtYmRhID0gdGhpcy5sYW1iZGEwICsgSSAvIHRoaXMuYWxwaGE7XG5cbiAgdmFyIFMgPSAwO1xuICB2YXIgcGh5ID0gYjtcbiAgdmFyIHByZXZQaHkgPSAtMTAwMDtcbiAgdmFyIGl0ZXJhdGlvbiA9IDA7XG4gIHdoaWxlIChNYXRoLmFicyhwaHkgLSBwcmV2UGh5KSA+IDAuMDAwMDAwMSkge1xuICAgIGlmICgrK2l0ZXJhdGlvbiA+IDIwKSB7XG4gICAgICAvLy4uLnJlcG9ydEVycm9yKFwib21lcmNGd2RJbmZpbml0eVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy9TID0gTWF0aC5sb2coTWF0aC50YW4oTWF0aC5QSSAvIDQgKyBwaHkgLyAyKSk7XG4gICAgUyA9IDEgLyB0aGlzLmFscGhhICogKE1hdGgubG9nKE1hdGgudGFuKE1hdGguUEkgLyA0ICsgYiAvIDIpKSAtIHRoaXMuSykgKyB0aGlzLmUgKiBNYXRoLmxvZyhNYXRoLnRhbihNYXRoLlBJIC8gNCArIE1hdGguYXNpbih0aGlzLmUgKiBNYXRoLnNpbihwaHkpKSAvIDIpKTtcbiAgICBwcmV2UGh5ID0gcGh5O1xuICAgIHBoeSA9IDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoUykpIC0gTWF0aC5QSSAvIDI7XG4gIH1cblxuICBwLnggPSBsYW1iZGE7XG4gIHAueSA9IHBoeTtcbiAgcmV0dXJuIHA7XG59O1xuXG5leHBvcnRzLm5hbWVzID0gW1wic29tZXJjXCJdO1xuIiwidmFyIEhBTEZfUEkgPSBNYXRoLlBJLzI7XG52YXIgRVBTTE4gPSAxLjBlLTEwO1xudmFyIHNpZ24gPSByZXF1aXJlKCcuLi9jb21tb24vc2lnbicpO1xudmFyIG1zZm56ID0gcmVxdWlyZSgnLi4vY29tbW9uL21zZm56Jyk7XG52YXIgdHNmbnogPSByZXF1aXJlKCcuLi9jb21tb24vdHNmbnonKTtcbnZhciBwaGkyeiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9waGkyeicpO1xudmFyIGFkanVzdF9sb24gPSByZXF1aXJlKCcuLi9jb21tb24vYWRqdXN0X2xvbicpO1xuZXhwb3J0cy5zc2ZuXyA9IGZ1bmN0aW9uKHBoaXQsIHNpbnBoaSwgZWNjZW4pIHtcbiAgc2lucGhpICo9IGVjY2VuO1xuICByZXR1cm4gKE1hdGgudGFuKDAuNSAqIChIQUxGX1BJICsgcGhpdCkpICogTWF0aC5wb3coKDEgLSBzaW5waGkpIC8gKDEgKyBzaW5waGkpLCAwLjUgKiBlY2NlbikpO1xufTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29zbGF0MCA9IE1hdGguY29zKHRoaXMubGF0MCk7XG4gIHRoaXMuc2lubGF0MCA9IE1hdGguc2luKHRoaXMubGF0MCk7XG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIGlmICh0aGlzLmswID09PSAxICYmICFpc05hTih0aGlzLmxhdF90cykgJiYgTWF0aC5hYnModGhpcy5jb3NsYXQwKSA8PSBFUFNMTikge1xuICAgICAgdGhpcy5rMCA9IDAuNSAqICgxICsgc2lnbih0aGlzLmxhdDApICogTWF0aC5zaW4odGhpcy5sYXRfdHMpKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKE1hdGguYWJzKHRoaXMuY29zbGF0MCkgPD0gRVBTTE4pIHtcbiAgICAgIGlmICh0aGlzLmxhdDAgPiAwKSB7XG4gICAgICAgIC8vTm9ydGggcG9sZVxuICAgICAgICAvL3RyYWNlKCdzdGVyZTpub3J0aCBwb2xlJyk7XG4gICAgICAgIHRoaXMuY29uID0gMTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvL1NvdXRoIHBvbGVcbiAgICAgICAgLy90cmFjZSgnc3RlcmU6c291dGggcG9sZScpO1xuICAgICAgICB0aGlzLmNvbiA9IC0xO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnMgPSBNYXRoLnNxcnQoTWF0aC5wb3coMSArIHRoaXMuZSwgMSArIHRoaXMuZSkgKiBNYXRoLnBvdygxIC0gdGhpcy5lLCAxIC0gdGhpcy5lKSk7XG4gICAgaWYgKHRoaXMuazAgPT09IDEgJiYgIWlzTmFOKHRoaXMubGF0X3RzKSAmJiBNYXRoLmFicyh0aGlzLmNvc2xhdDApIDw9IEVQU0xOKSB7XG4gICAgICB0aGlzLmswID0gMC41ICogdGhpcy5jb25zICogbXNmbnoodGhpcy5lLCBNYXRoLnNpbih0aGlzLmxhdF90cyksIE1hdGguY29zKHRoaXMubGF0X3RzKSkgLyB0c2Zueih0aGlzLmUsIHRoaXMuY29uICogdGhpcy5sYXRfdHMsIHRoaXMuY29uICogTWF0aC5zaW4odGhpcy5sYXRfdHMpKTtcbiAgICB9XG4gICAgdGhpcy5tczEgPSBtc2Zueih0aGlzLmUsIHRoaXMuc2lubGF0MCwgdGhpcy5jb3NsYXQwKTtcbiAgICB0aGlzLlgwID0gMiAqIE1hdGguYXRhbih0aGlzLnNzZm5fKHRoaXMubGF0MCwgdGhpcy5zaW5sYXQwLCB0aGlzLmUpKSAtIEhBTEZfUEk7XG4gICAgdGhpcy5jb3NYMCA9IE1hdGguY29zKHRoaXMuWDApO1xuICAgIHRoaXMuc2luWDAgPSBNYXRoLnNpbih0aGlzLlgwKTtcbiAgfVxufTtcblxuLy8gU3RlcmVvZ3JhcGhpYyBmb3J3YXJkIGVxdWF0aW9ucy0tbWFwcGluZyBsYXQsbG9uZyB0byB4LHlcbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcbiAgdmFyIHNpbmxhdCA9IE1hdGguc2luKGxhdCk7XG4gIHZhciBjb3NsYXQgPSBNYXRoLmNvcyhsYXQpO1xuICB2YXIgQSwgWCwgc2luWCwgY29zWCwgdHMsIHJoO1xuICB2YXIgZGxvbiA9IGFkanVzdF9sb24obG9uIC0gdGhpcy5sb25nMCk7XG5cbiAgaWYgKE1hdGguYWJzKE1hdGguYWJzKGxvbiAtIHRoaXMubG9uZzApIC0gTWF0aC5QSSkgPD0gRVBTTE4gJiYgTWF0aC5hYnMobGF0ICsgdGhpcy5sYXQwKSA8PSBFUFNMTikge1xuICAgIC8vY2FzZSBvZiB0aGUgb3JpZ2luZSBwb2ludFxuICAgIC8vdHJhY2UoJ3N0ZXJlOnRoaXMgaXMgdGhlIG9yaWdpbiBwb2ludCcpO1xuICAgIHAueCA9IE5hTjtcbiAgICBwLnkgPSBOYU47XG4gICAgcmV0dXJuIHA7XG4gIH1cbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgLy90cmFjZSgnc3RlcmU6c3BoZXJlIGNhc2UnKTtcbiAgICBBID0gMiAqIHRoaXMuazAgLyAoMSArIHRoaXMuc2lubGF0MCAqIHNpbmxhdCArIHRoaXMuY29zbGF0MCAqIGNvc2xhdCAqIE1hdGguY29zKGRsb24pKTtcbiAgICBwLnggPSB0aGlzLmEgKiBBICogY29zbGF0ICogTWF0aC5zaW4oZGxvbikgKyB0aGlzLngwO1xuICAgIHAueSA9IHRoaXMuYSAqIEEgKiAodGhpcy5jb3NsYXQwICogc2lubGF0IC0gdGhpcy5zaW5sYXQwICogY29zbGF0ICogTWF0aC5jb3MoZGxvbikpICsgdGhpcy55MDtcbiAgICByZXR1cm4gcDtcbiAgfVxuICBlbHNlIHtcbiAgICBYID0gMiAqIE1hdGguYXRhbih0aGlzLnNzZm5fKGxhdCwgc2lubGF0LCB0aGlzLmUpKSAtIEhBTEZfUEk7XG4gICAgY29zWCA9IE1hdGguY29zKFgpO1xuICAgIHNpblggPSBNYXRoLnNpbihYKTtcbiAgICBpZiAoTWF0aC5hYnModGhpcy5jb3NsYXQwKSA8PSBFUFNMTikge1xuICAgICAgdHMgPSB0c2Zueih0aGlzLmUsIGxhdCAqIHRoaXMuY29uLCB0aGlzLmNvbiAqIHNpbmxhdCk7XG4gICAgICByaCA9IDIgKiB0aGlzLmEgKiB0aGlzLmswICogdHMgLyB0aGlzLmNvbnM7XG4gICAgICBwLnggPSB0aGlzLngwICsgcmggKiBNYXRoLnNpbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgICAgIHAueSA9IHRoaXMueTAgLSB0aGlzLmNvbiAqIHJoICogTWF0aC5jb3MobG9uIC0gdGhpcy5sb25nMCk7XG4gICAgICAvL3RyYWNlKHAudG9TdHJpbmcoKSk7XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZWxzZSBpZiAoTWF0aC5hYnModGhpcy5zaW5sYXQwKSA8IEVQU0xOKSB7XG4gICAgICAvL0VxXG4gICAgICAvL3RyYWNlKCdzdGVyZTplcXVhdGV1cicpO1xuICAgICAgQSA9IDIgKiB0aGlzLmEgKiB0aGlzLmswIC8gKDEgKyBjb3NYICogTWF0aC5jb3MoZGxvbikpO1xuICAgICAgcC55ID0gQSAqIHNpblg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy9vdGhlciBjYXNlXG4gICAgICAvL3RyYWNlKCdzdGVyZTpub3JtYWwgY2FzZScpO1xuICAgICAgQSA9IDIgKiB0aGlzLmEgKiB0aGlzLmswICogdGhpcy5tczEgLyAodGhpcy5jb3NYMCAqICgxICsgdGhpcy5zaW5YMCAqIHNpblggKyB0aGlzLmNvc1gwICogY29zWCAqIE1hdGguY29zKGRsb24pKSk7XG4gICAgICBwLnkgPSBBICogKHRoaXMuY29zWDAgKiBzaW5YIC0gdGhpcy5zaW5YMCAqIGNvc1ggKiBNYXRoLmNvcyhkbG9uKSkgKyB0aGlzLnkwO1xuICAgIH1cbiAgICBwLnggPSBBICogY29zWCAqIE1hdGguc2luKGRsb24pICsgdGhpcy54MDtcbiAgfVxuICAvL3RyYWNlKHAudG9TdHJpbmcoKSk7XG4gIHJldHVybiBwO1xufTtcblxuXG4vLyogU3RlcmVvZ3JhcGhpYyBpbnZlcnNlIGVxdWF0aW9ucy0tbWFwcGluZyB4LHkgdG8gbGF0L2xvbmdcbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgcC54IC09IHRoaXMueDA7XG4gIHAueSAtPSB0aGlzLnkwO1xuICB2YXIgbG9uLCBsYXQsIHRzLCBjZSwgQ2hpO1xuICB2YXIgcmggPSBNYXRoLnNxcnQocC54ICogcC54ICsgcC55ICogcC55KTtcbiAgaWYgKHRoaXMuc3BoZXJlKSB7XG4gICAgdmFyIGMgPSAyICogTWF0aC5hdGFuKHJoIC8gKDAuNSAqIHRoaXMuYSAqIHRoaXMuazApKTtcbiAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgIGxhdCA9IHRoaXMubGF0MDtcbiAgICBpZiAocmggPD0gRVBTTE4pIHtcbiAgICAgIHAueCA9IGxvbjtcbiAgICAgIHAueSA9IGxhdDtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBsYXQgPSBNYXRoLmFzaW4oTWF0aC5jb3MoYykgKiB0aGlzLnNpbmxhdDAgKyBwLnkgKiBNYXRoLnNpbihjKSAqIHRoaXMuY29zbGF0MCAvIHJoKTtcbiAgICBpZiAoTWF0aC5hYnModGhpcy5jb3NsYXQwKSA8IEVQU0xOKSB7XG4gICAgICBpZiAodGhpcy5sYXQwID4gMCkge1xuICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCwgLSAxICogcC55KSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbG9uID0gYWRqdXN0X2xvbih0aGlzLmxvbmcwICsgTWF0aC5hdGFuMihwLngsIHAueSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvbiA9IGFkanVzdF9sb24odGhpcy5sb25nMCArIE1hdGguYXRhbjIocC54ICogTWF0aC5zaW4oYyksIHJoICogdGhpcy5jb3NsYXQwICogTWF0aC5jb3MoYykgLSBwLnkgKiB0aGlzLnNpbmxhdDAgKiBNYXRoLnNpbihjKSkpO1xuICAgIH1cbiAgICBwLnggPSBsb247XG4gICAgcC55ID0gbGF0O1xuICAgIHJldHVybiBwO1xuICB9XG4gIGVsc2Uge1xuICAgIGlmIChNYXRoLmFicyh0aGlzLmNvc2xhdDApIDw9IEVQU0xOKSB7XG4gICAgICBpZiAocmggPD0gRVBTTE4pIHtcbiAgICAgICAgbGF0ID0gdGhpcy5sYXQwO1xuICAgICAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgICAgICBwLnggPSBsb247XG4gICAgICAgIHAueSA9IGxhdDtcbiAgICAgICAgLy90cmFjZShwLnRvU3RyaW5nKCkpO1xuICAgICAgICByZXR1cm4gcDtcbiAgICAgIH1cbiAgICAgIHAueCAqPSB0aGlzLmNvbjtcbiAgICAgIHAueSAqPSB0aGlzLmNvbjtcbiAgICAgIHRzID0gcmggKiB0aGlzLmNvbnMgLyAoMiAqIHRoaXMuYSAqIHRoaXMuazApO1xuICAgICAgbGF0ID0gdGhpcy5jb24gKiBwaGkyeih0aGlzLmUsIHRzKTtcbiAgICAgIGxvbiA9IHRoaXMuY29uICogYWRqdXN0X2xvbih0aGlzLmNvbiAqIHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCwgLSAxICogcC55KSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY2UgPSAyICogTWF0aC5hdGFuKHJoICogdGhpcy5jb3NYMCAvICgyICogdGhpcy5hICogdGhpcy5rMCAqIHRoaXMubXMxKSk7XG4gICAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgICAgaWYgKHJoIDw9IEVQU0xOKSB7XG4gICAgICAgIENoaSA9IHRoaXMuWDA7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgQ2hpID0gTWF0aC5hc2luKE1hdGguY29zKGNlKSAqIHRoaXMuc2luWDAgKyBwLnkgKiBNYXRoLnNpbihjZSkgKiB0aGlzLmNvc1gwIC8gcmgpO1xuICAgICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLmF0YW4yKHAueCAqIE1hdGguc2luKGNlKSwgcmggKiB0aGlzLmNvc1gwICogTWF0aC5jb3MoY2UpIC0gcC55ICogdGhpcy5zaW5YMCAqIE1hdGguc2luKGNlKSkpO1xuICAgICAgfVxuICAgICAgbGF0ID0gLTEgKiBwaGkyeih0aGlzLmUsIE1hdGgudGFuKDAuNSAqIChIQUxGX1BJICsgQ2hpKSkpO1xuICAgIH1cbiAgfVxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcblxuICAvL3RyYWNlKHAudG9TdHJpbmcoKSk7XG4gIHJldHVybiBwO1xuXG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcInN0ZXJlXCIsIFwiU3RlcmVvZ3JhcGhpY19Tb3V0aF9Qb2xlXCIsIFwiUG9sYXIgU3RlcmVvZ3JhcGhpYyAodmFyaWFudCBCKVwiXTtcbiIsInZhciBnYXVzcyA9IHJlcXVpcmUoJy4vZ2F1c3MnKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBnYXVzcy5pbml0LmFwcGx5KHRoaXMpO1xuICBpZiAoIXRoaXMucmMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5zaW5jMCA9IE1hdGguc2luKHRoaXMucGhpYzApO1xuICB0aGlzLmNvc2MwID0gTWF0aC5jb3ModGhpcy5waGljMCk7XG4gIHRoaXMuUjIgPSAyICogdGhpcy5yYztcbiAgaWYgKCF0aGlzLnRpdGxlKSB7XG4gICAgdGhpcy50aXRsZSA9IFwiT2JsaXF1ZSBTdGVyZW9ncmFwaGljIEFsdGVybmF0aXZlXCI7XG4gIH1cbn07XG5cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIHNpbmMsIGNvc2MsIGNvc2wsIGs7XG4gIHAueCA9IGFkanVzdF9sb24ocC54IC0gdGhpcy5sb25nMCk7XG4gIGdhdXNzLmZvcndhcmQuYXBwbHkodGhpcywgW3BdKTtcbiAgc2luYyA9IE1hdGguc2luKHAueSk7XG4gIGNvc2MgPSBNYXRoLmNvcyhwLnkpO1xuICBjb3NsID0gTWF0aC5jb3MocC54KTtcbiAgayA9IHRoaXMuazAgKiB0aGlzLlIyIC8gKDEgKyB0aGlzLnNpbmMwICogc2luYyArIHRoaXMuY29zYzAgKiBjb3NjICogY29zbCk7XG4gIHAueCA9IGsgKiBjb3NjICogTWF0aC5zaW4ocC54KTtcbiAgcC55ID0gayAqICh0aGlzLmNvc2MwICogc2luYyAtIHRoaXMuc2luYzAgKiBjb3NjICogY29zbCk7XG4gIHAueCA9IHRoaXMuYSAqIHAueCArIHRoaXMueDA7XG4gIHAueSA9IHRoaXMuYSAqIHAueSArIHRoaXMueTA7XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgc2luYywgY29zYywgbG9uLCBsYXQsIHJobztcbiAgcC54ID0gKHAueCAtIHRoaXMueDApIC8gdGhpcy5hO1xuICBwLnkgPSAocC55IC0gdGhpcy55MCkgLyB0aGlzLmE7XG5cbiAgcC54IC89IHRoaXMuazA7XG4gIHAueSAvPSB0aGlzLmswO1xuICBpZiAoKHJobyA9IE1hdGguc3FydChwLnggKiBwLnggKyBwLnkgKiBwLnkpKSkge1xuICAgIHZhciBjID0gMiAqIE1hdGguYXRhbjIocmhvLCB0aGlzLlIyKTtcbiAgICBzaW5jID0gTWF0aC5zaW4oYyk7XG4gICAgY29zYyA9IE1hdGguY29zKGMpO1xuICAgIGxhdCA9IE1hdGguYXNpbihjb3NjICogdGhpcy5zaW5jMCArIHAueSAqIHNpbmMgKiB0aGlzLmNvc2MwIC8gcmhvKTtcbiAgICBsb24gPSBNYXRoLmF0YW4yKHAueCAqIHNpbmMsIHJobyAqIHRoaXMuY29zYzAgKiBjb3NjIC0gcC55ICogdGhpcy5zaW5jMCAqIHNpbmMpO1xuICB9XG4gIGVsc2Uge1xuICAgIGxhdCA9IHRoaXMucGhpYzA7XG4gICAgbG9uID0gMDtcbiAgfVxuXG4gIHAueCA9IGxvbjtcbiAgcC55ID0gbGF0O1xuICBnYXVzcy5pbnZlcnNlLmFwcGx5KHRoaXMsIFtwXSk7XG4gIHAueCA9IGFkanVzdF9sb24ocC54ICsgdGhpcy5sb25nMCk7XG4gIHJldHVybiBwO1xufTtcblxuZXhwb3J0cy5uYW1lcyA9IFtcIlN0ZXJlb2dyYXBoaWNfTm9ydGhfUG9sZVwiLCBcIk9ibGlxdWVfU3RlcmVvZ3JhcGhpY1wiLCBcIlBvbGFyX1N0ZXJlb2dyYXBoaWNcIiwgXCJzdGVyZWFcIixcIk9ibGlxdWUgU3RlcmVvZ3JhcGhpYyBBbHRlcm5hdGl2ZVwiXTtcbiIsInZhciBlMGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UwZm4nKTtcbnZhciBlMWZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UxZm4nKTtcbnZhciBlMmZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UyZm4nKTtcbnZhciBlM2ZuID0gcmVxdWlyZSgnLi4vY29tbW9uL2UzZm4nKTtcbnZhciBtbGZuID0gcmVxdWlyZSgnLi4vY29tbW9uL21sZm4nKTtcbnZhciBhZGp1c3RfbG9uID0gcmVxdWlyZSgnLi4vY29tbW9uL2FkanVzdF9sb24nKTtcbnZhciBIQUxGX1BJID0gTWF0aC5QSS8yO1xudmFyIEVQU0xOID0gMS4wZS0xMDtcbnZhciBzaWduID0gcmVxdWlyZSgnLi4vY29tbW9uL3NpZ24nKTtcbnZhciBhc2lueiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hc2lueicpO1xuXG5leHBvcnRzLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lMCA9IGUwZm4odGhpcy5lcyk7XG4gIHRoaXMuZTEgPSBlMWZuKHRoaXMuZXMpO1xuICB0aGlzLmUyID0gZTJmbih0aGlzLmVzKTtcbiAgdGhpcy5lMyA9IGUzZm4odGhpcy5lcyk7XG4gIHRoaXMubWwwID0gdGhpcy5hICogbWxmbih0aGlzLmUwLCB0aGlzLmUxLCB0aGlzLmUyLCB0aGlzLmUzLCB0aGlzLmxhdDApO1xufTtcblxuLyoqXG4gICAgVHJhbnN2ZXJzZSBNZXJjYXRvciBGb3J3YXJkICAtIGxvbmcvbGF0IHRvIHgveVxuICAgIGxvbmcvbGF0IGluIHJhZGlhbnNcbiAgKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGxvbiA9IHAueDtcbiAgdmFyIGxhdCA9IHAueTtcblxuICB2YXIgZGVsdGFfbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIGNvbjtcbiAgdmFyIHgsIHk7XG4gIHZhciBzaW5fcGhpID0gTWF0aC5zaW4obGF0KTtcbiAgdmFyIGNvc19waGkgPSBNYXRoLmNvcyhsYXQpO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHZhciBiID0gY29zX3BoaSAqIE1hdGguc2luKGRlbHRhX2xvbik7XG4gICAgaWYgKChNYXRoLmFicyhNYXRoLmFicyhiKSAtIDEpKSA8IDAuMDAwMDAwMDAwMSkge1xuICAgICAgcmV0dXJuICg5Myk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgeCA9IDAuNSAqIHRoaXMuYSAqIHRoaXMuazAgKiBNYXRoLmxvZygoMSArIGIpIC8gKDEgLSBiKSk7XG4gICAgICBjb24gPSBNYXRoLmFjb3MoY29zX3BoaSAqIE1hdGguY29zKGRlbHRhX2xvbikgLyBNYXRoLnNxcnQoMSAtIGIgKiBiKSk7XG4gICAgICBpZiAobGF0IDwgMCkge1xuICAgICAgICBjb24gPSAtY29uO1xuICAgICAgfVxuICAgICAgeSA9IHRoaXMuYSAqIHRoaXMuazAgKiAoY29uIC0gdGhpcy5sYXQwKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIGFsID0gY29zX3BoaSAqIGRlbHRhX2xvbjtcbiAgICB2YXIgYWxzID0gTWF0aC5wb3coYWwsIDIpO1xuICAgIHZhciBjID0gdGhpcy5lcDIgKiBNYXRoLnBvdyhjb3NfcGhpLCAyKTtcbiAgICB2YXIgdHEgPSBNYXRoLnRhbihsYXQpO1xuICAgIHZhciB0ID0gTWF0aC5wb3codHEsIDIpO1xuICAgIGNvbiA9IDEgLSB0aGlzLmVzICogTWF0aC5wb3coc2luX3BoaSwgMik7XG4gICAgdmFyIG4gPSB0aGlzLmEgLyBNYXRoLnNxcnQoY29uKTtcbiAgICB2YXIgbWwgPSB0aGlzLmEgKiBtbGZuKHRoaXMuZTAsIHRoaXMuZTEsIHRoaXMuZTIsIHRoaXMuZTMsIGxhdCk7XG5cbiAgICB4ID0gdGhpcy5rMCAqIG4gKiBhbCAqICgxICsgYWxzIC8gNiAqICgxIC0gdCArIGMgKyBhbHMgLyAyMCAqICg1IC0gMTggKiB0ICsgTWF0aC5wb3codCwgMikgKyA3MiAqIGMgLSA1OCAqIHRoaXMuZXAyKSkpICsgdGhpcy54MDtcbiAgICB5ID0gdGhpcy5rMCAqIChtbCAtIHRoaXMubWwwICsgbiAqIHRxICogKGFscyAqICgwLjUgKyBhbHMgLyAyNCAqICg1IC0gdCArIDkgKiBjICsgNCAqIE1hdGgucG93KGMsIDIpICsgYWxzIC8gMzAgKiAoNjEgLSA1OCAqIHQgKyBNYXRoLnBvdyh0LCAyKSArIDYwMCAqIGMgLSAzMzAgKiB0aGlzLmVwMikpKSkpICsgdGhpcy55MDtcblxuICB9XG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gICAgVHJhbnN2ZXJzZSBNZXJjYXRvciBJbnZlcnNlICAtICB4L3kgdG8gbG9uZy9sYXRcbiAgKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKHApIHtcbiAgdmFyIGNvbiwgcGhpO1xuICB2YXIgZGVsdGFfcGhpO1xuICB2YXIgaTtcbiAgdmFyIG1heF9pdGVyID0gNjtcbiAgdmFyIGxhdCwgbG9uO1xuXG4gIGlmICh0aGlzLnNwaGVyZSkge1xuICAgIHZhciBmID0gTWF0aC5leHAocC54IC8gKHRoaXMuYSAqIHRoaXMuazApKTtcbiAgICB2YXIgZyA9IDAuNSAqIChmIC0gMSAvIGYpO1xuICAgIHZhciB0ZW1wID0gdGhpcy5sYXQwICsgcC55IC8gKHRoaXMuYSAqIHRoaXMuazApO1xuICAgIHZhciBoID0gTWF0aC5jb3ModGVtcCk7XG4gICAgY29uID0gTWF0aC5zcXJ0KCgxIC0gaCAqIGgpIC8gKDEgKyBnICogZykpO1xuICAgIGxhdCA9IGFzaW56KGNvbik7XG4gICAgaWYgKHRlbXAgPCAwKSB7XG4gICAgICBsYXQgPSAtbGF0O1xuICAgIH1cbiAgICBpZiAoKGcgPT09IDApICYmIChoID09PSAwKSkge1xuICAgICAgbG9uID0gdGhpcy5sb25nMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKE1hdGguYXRhbjIoZywgaCkgKyB0aGlzLmxvbmcwKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7IC8vIGVsbGlwc29pZGFsIGZvcm1cbiAgICB2YXIgeCA9IHAueCAtIHRoaXMueDA7XG4gICAgdmFyIHkgPSBwLnkgLSB0aGlzLnkwO1xuXG4gICAgY29uID0gKHRoaXMubWwwICsgeSAvIHRoaXMuazApIC8gdGhpcy5hO1xuICAgIHBoaSA9IGNvbjtcbiAgICBmb3IgKGkgPSAwOyB0cnVlOyBpKyspIHtcbiAgICAgIGRlbHRhX3BoaSA9ICgoY29uICsgdGhpcy5lMSAqIE1hdGguc2luKDIgKiBwaGkpIC0gdGhpcy5lMiAqIE1hdGguc2luKDQgKiBwaGkpICsgdGhpcy5lMyAqIE1hdGguc2luKDYgKiBwaGkpKSAvIHRoaXMuZTApIC0gcGhpO1xuICAgICAgcGhpICs9IGRlbHRhX3BoaTtcbiAgICAgIGlmIChNYXRoLmFicyhkZWx0YV9waGkpIDw9IEVQU0xOKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGkgPj0gbWF4X2l0ZXIpIHtcbiAgICAgICAgcmV0dXJuICg5NSk7XG4gICAgICB9XG4gICAgfSAvLyBmb3IoKVxuICAgIGlmIChNYXRoLmFicyhwaGkpIDwgSEFMRl9QSSkge1xuICAgICAgdmFyIHNpbl9waGkgPSBNYXRoLnNpbihwaGkpO1xuICAgICAgdmFyIGNvc19waGkgPSBNYXRoLmNvcyhwaGkpO1xuICAgICAgdmFyIHRhbl9waGkgPSBNYXRoLnRhbihwaGkpO1xuICAgICAgdmFyIGMgPSB0aGlzLmVwMiAqIE1hdGgucG93KGNvc19waGksIDIpO1xuICAgICAgdmFyIGNzID0gTWF0aC5wb3coYywgMik7XG4gICAgICB2YXIgdCA9IE1hdGgucG93KHRhbl9waGksIDIpO1xuICAgICAgdmFyIHRzID0gTWF0aC5wb3codCwgMik7XG4gICAgICBjb24gPSAxIC0gdGhpcy5lcyAqIE1hdGgucG93KHNpbl9waGksIDIpO1xuICAgICAgdmFyIG4gPSB0aGlzLmEgLyBNYXRoLnNxcnQoY29uKTtcbiAgICAgIHZhciByID0gbiAqICgxIC0gdGhpcy5lcykgLyBjb247XG4gICAgICB2YXIgZCA9IHggLyAobiAqIHRoaXMuazApO1xuICAgICAgdmFyIGRzID0gTWF0aC5wb3coZCwgMik7XG4gICAgICBsYXQgPSBwaGkgLSAobiAqIHRhbl9waGkgKiBkcyAvIHIpICogKDAuNSAtIGRzIC8gMjQgKiAoNSArIDMgKiB0ICsgMTAgKiBjIC0gNCAqIGNzIC0gOSAqIHRoaXMuZXAyIC0gZHMgLyAzMCAqICg2MSArIDkwICogdCArIDI5OCAqIGMgKyA0NSAqIHRzIC0gMjUyICogdGhpcy5lcDIgLSAzICogY3MpKSk7XG4gICAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyAoZCAqICgxIC0gZHMgLyA2ICogKDEgKyAyICogdCArIGMgLSBkcyAvIDIwICogKDUgLSAyICogYyArIDI4ICogdCAtIDMgKiBjcyArIDggKiB0aGlzLmVwMiArIDI0ICogdHMpKSkgLyBjb3NfcGhpKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbGF0ID0gSEFMRl9QSSAqIHNpZ24oeSk7XG4gICAgICBsb24gPSB0aGlzLmxvbmcwO1xuICAgIH1cbiAgfVxuICBwLnggPSBsb247XG4gIHAueSA9IGxhdDtcbiAgcmV0dXJuIHA7XG59O1xuZXhwb3J0cy5uYW1lcyA9IFtcIlRyYW5zdmVyc2VfTWVyY2F0b3JcIiwgXCJUcmFuc3ZlcnNlIE1lcmNhdG9yXCIsIFwidG1lcmNcIl07XG4iLCJ2YXIgRDJSID0gMC4wMTc0NTMyOTI1MTk5NDMyOTU3NztcbnZhciB0bWVyYyA9IHJlcXVpcmUoJy4vdG1lcmMnKTtcbmV4cG9ydHMuZGVwZW5kc09uID0gJ3RtZXJjJztcbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXRoaXMuem9uZSkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLmxhdDAgPSAwO1xuICB0aGlzLmxvbmcwID0gKCg2ICogTWF0aC5hYnModGhpcy56b25lKSkgLSAxODMpICogRDJSO1xuICB0aGlzLngwID0gNTAwMDAwO1xuICB0aGlzLnkwID0gdGhpcy51dG1Tb3V0aCA/IDEwMDAwMDAwIDogMDtcbiAgdGhpcy5rMCA9IDAuOTk5NjtcblxuICB0bWVyYy5pbml0LmFwcGx5KHRoaXMpO1xuICB0aGlzLmZvcndhcmQgPSB0bWVyYy5mb3J3YXJkO1xuICB0aGlzLmludmVyc2UgPSB0bWVyYy5pbnZlcnNlO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJVbml2ZXJzYWwgVHJhbnN2ZXJzZSBNZXJjYXRvciBTeXN0ZW1cIiwgXCJ1dG1cIl07XG4iLCJ2YXIgYWRqdXN0X2xvbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi9hZGp1c3RfbG9uJyk7XG52YXIgSEFMRl9QSSA9IE1hdGguUEkvMjtcbnZhciBFUFNMTiA9IDEuMGUtMTA7XG52YXIgYXNpbnogPSByZXF1aXJlKCcuLi9jb21tb24vYXNpbnonKTtcbi8qIEluaXRpYWxpemUgdGhlIFZhbiBEZXIgR3JpbnRlbiBwcm9qZWN0aW9uXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIC8vdGhpcy5SID0gNjM3MDk5NzsgLy9SYWRpdXMgb2YgZWFydGhcbiAgdGhpcy5SID0gdGhpcy5hO1xufTtcblxuZXhwb3J0cy5mb3J3YXJkID0gZnVuY3Rpb24ocCkge1xuXG4gIHZhciBsb24gPSBwLng7XG4gIHZhciBsYXQgPSBwLnk7XG5cbiAgLyogRm9yd2FyZCBlcXVhdGlvbnNcbiAgICAtLS0tLS0tLS0tLS0tLS0tLSovXG4gIHZhciBkbG9uID0gYWRqdXN0X2xvbihsb24gLSB0aGlzLmxvbmcwKTtcbiAgdmFyIHgsIHk7XG5cbiAgaWYgKE1hdGguYWJzKGxhdCkgPD0gRVBTTE4pIHtcbiAgICB4ID0gdGhpcy54MCArIHRoaXMuUiAqIGRsb247XG4gICAgeSA9IHRoaXMueTA7XG4gIH1cbiAgdmFyIHRoZXRhID0gYXNpbnooMiAqIE1hdGguYWJzKGxhdCAvIE1hdGguUEkpKTtcbiAgaWYgKChNYXRoLmFicyhkbG9uKSA8PSBFUFNMTikgfHwgKE1hdGguYWJzKE1hdGguYWJzKGxhdCkgLSBIQUxGX1BJKSA8PSBFUFNMTikpIHtcbiAgICB4ID0gdGhpcy54MDtcbiAgICBpZiAobGF0ID49IDApIHtcbiAgICAgIHkgPSB0aGlzLnkwICsgTWF0aC5QSSAqIHRoaXMuUiAqIE1hdGgudGFuKDAuNSAqIHRoZXRhKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB5ID0gdGhpcy55MCArIE1hdGguUEkgKiB0aGlzLlIgKiAtTWF0aC50YW4oMC41ICogdGhldGEpO1xuICAgIH1cbiAgICAvLyAgcmV0dXJuKE9LKTtcbiAgfVxuICB2YXIgYWwgPSAwLjUgKiBNYXRoLmFicygoTWF0aC5QSSAvIGRsb24pIC0gKGRsb24gLyBNYXRoLlBJKSk7XG4gIHZhciBhc3EgPSBhbCAqIGFsO1xuICB2YXIgc2ludGggPSBNYXRoLnNpbih0aGV0YSk7XG4gIHZhciBjb3N0aCA9IE1hdGguY29zKHRoZXRhKTtcblxuICB2YXIgZyA9IGNvc3RoIC8gKHNpbnRoICsgY29zdGggLSAxKTtcbiAgdmFyIGdzcSA9IGcgKiBnO1xuICB2YXIgbSA9IGcgKiAoMiAvIHNpbnRoIC0gMSk7XG4gIHZhciBtc3EgPSBtICogbTtcbiAgdmFyIGNvbiA9IE1hdGguUEkgKiB0aGlzLlIgKiAoYWwgKiAoZyAtIG1zcSkgKyBNYXRoLnNxcnQoYXNxICogKGcgLSBtc3EpICogKGcgLSBtc3EpIC0gKG1zcSArIGFzcSkgKiAoZ3NxIC0gbXNxKSkpIC8gKG1zcSArIGFzcSk7XG4gIGlmIChkbG9uIDwgMCkge1xuICAgIGNvbiA9IC1jb247XG4gIH1cbiAgeCA9IHRoaXMueDAgKyBjb247XG4gIC8vY29uID0gTWF0aC5hYnMoY29uIC8gKE1hdGguUEkgKiB0aGlzLlIpKTtcbiAgdmFyIHEgPSBhc3EgKyBnO1xuICBjb24gPSBNYXRoLlBJICogdGhpcy5SICogKG0gKiBxIC0gYWwgKiBNYXRoLnNxcnQoKG1zcSArIGFzcSkgKiAoYXNxICsgMSkgLSBxICogcSkpIC8gKG1zcSArIGFzcSk7XG4gIGlmIChsYXQgPj0gMCkge1xuICAgIC8veSA9IHRoaXMueTAgKyBNYXRoLlBJICogdGhpcy5SICogTWF0aC5zcXJ0KDEgLSBjb24gKiBjb24gLSAyICogYWwgKiBjb24pO1xuICAgIHkgPSB0aGlzLnkwICsgY29uO1xuICB9XG4gIGVsc2Uge1xuICAgIC8veSA9IHRoaXMueTAgLSBNYXRoLlBJICogdGhpcy5SICogTWF0aC5zcXJ0KDEgLSBjb24gKiBjb24gLSAyICogYWwgKiBjb24pO1xuICAgIHkgPSB0aGlzLnkwIC0gY29uO1xuICB9XG4gIHAueCA9IHg7XG4gIHAueSA9IHk7XG4gIHJldHVybiBwO1xufTtcblxuLyogVmFuIERlciBHcmludGVuIGludmVyc2UgZXF1YXRpb25zLS1tYXBwaW5nIHgseSB0byBsYXQvbG9uZ1xuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuZXhwb3J0cy5pbnZlcnNlID0gZnVuY3Rpb24ocCkge1xuICB2YXIgbG9uLCBsYXQ7XG4gIHZhciB4eCwgeXksIHh5cywgYzEsIGMyLCBjMztcbiAgdmFyIGExO1xuICB2YXIgbTE7XG4gIHZhciBjb247XG4gIHZhciB0aDE7XG4gIHZhciBkO1xuXG4gIC8qIGludmVyc2UgZXF1YXRpb25zXG4gICAgLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBwLnggLT0gdGhpcy54MDtcbiAgcC55IC09IHRoaXMueTA7XG4gIGNvbiA9IE1hdGguUEkgKiB0aGlzLlI7XG4gIHh4ID0gcC54IC8gY29uO1xuICB5eSA9IHAueSAvIGNvbjtcbiAgeHlzID0geHggKiB4eCArIHl5ICogeXk7XG4gIGMxID0gLU1hdGguYWJzKHl5KSAqICgxICsgeHlzKTtcbiAgYzIgPSBjMSAtIDIgKiB5eSAqIHl5ICsgeHggKiB4eDtcbiAgYzMgPSAtMiAqIGMxICsgMSArIDIgKiB5eSAqIHl5ICsgeHlzICogeHlzO1xuICBkID0geXkgKiB5eSAvIGMzICsgKDIgKiBjMiAqIGMyICogYzIgLyBjMyAvIGMzIC8gYzMgLSA5ICogYzEgKiBjMiAvIGMzIC8gYzMpIC8gMjc7XG4gIGExID0gKGMxIC0gYzIgKiBjMiAvIDMgLyBjMykgLyBjMztcbiAgbTEgPSAyICogTWF0aC5zcXJ0KC1hMSAvIDMpO1xuICBjb24gPSAoKDMgKiBkKSAvIGExKSAvIG0xO1xuICBpZiAoTWF0aC5hYnMoY29uKSA+IDEpIHtcbiAgICBpZiAoY29uID49IDApIHtcbiAgICAgIGNvbiA9IDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uID0gLTE7XG4gICAgfVxuICB9XG4gIHRoMSA9IE1hdGguYWNvcyhjb24pIC8gMztcbiAgaWYgKHAueSA+PSAwKSB7XG4gICAgbGF0ID0gKC1tMSAqIE1hdGguY29zKHRoMSArIE1hdGguUEkgLyAzKSAtIGMyIC8gMyAvIGMzKSAqIE1hdGguUEk7XG4gIH1cbiAgZWxzZSB7XG4gICAgbGF0ID0gLSgtbTEgKiBNYXRoLmNvcyh0aDEgKyBNYXRoLlBJIC8gMykgLSBjMiAvIDMgLyBjMykgKiBNYXRoLlBJO1xuICB9XG5cbiAgaWYgKE1hdGguYWJzKHh4KSA8IEVQU0xOKSB7XG4gICAgbG9uID0gdGhpcy5sb25nMDtcbiAgfVxuICBlbHNlIHtcbiAgICBsb24gPSBhZGp1c3RfbG9uKHRoaXMubG9uZzAgKyBNYXRoLlBJICogKHh5cyAtIDEgKyBNYXRoLnNxcnQoMSArIDIgKiAoeHggKiB4eCAtIHl5ICogeXkpICsgeHlzICogeHlzKSkgLyAyIC8geHgpO1xuICB9XG5cbiAgcC54ID0gbG9uO1xuICBwLnkgPSBsYXQ7XG4gIHJldHVybiBwO1xufTtcbmV4cG9ydHMubmFtZXMgPSBbXCJWYW5fZGVyX0dyaW50ZW5fSVwiLCBcIlZhbkRlckdyaW50ZW5cIiwgXCJ2YW5kZ1wiXTsiLCJ2YXIgRDJSID0gMC4wMTc0NTMyOTI1MTk5NDMyOTU3NztcbnZhciBSMkQgPSA1Ny4yOTU3Nzk1MTMwODIzMjA4ODtcbnZhciBQSkRfM1BBUkFNID0gMTtcbnZhciBQSkRfN1BBUkFNID0gMjtcbnZhciBkYXR1bV90cmFuc2Zvcm0gPSByZXF1aXJlKCcuL2RhdHVtX3RyYW5zZm9ybScpO1xudmFyIGFkanVzdF9heGlzID0gcmVxdWlyZSgnLi9hZGp1c3RfYXhpcycpO1xudmFyIHByb2ogPSByZXF1aXJlKCcuL1Byb2onKTtcbnZhciB0b1BvaW50ID0gcmVxdWlyZSgnLi9jb21tb24vdG9Qb2ludCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm0oc291cmNlLCBkZXN0LCBwb2ludCkge1xuICB2YXIgd2dzODQ7XG4gIGlmIChBcnJheS5pc0FycmF5KHBvaW50KSkge1xuICAgIHBvaW50ID0gdG9Qb2ludChwb2ludCk7XG4gIH1cbiAgZnVuY3Rpb24gY2hlY2tOb3RXR1Moc291cmNlLCBkZXN0KSB7XG4gICAgcmV0dXJuICgoc291cmNlLmRhdHVtLmRhdHVtX3R5cGUgPT09IFBKRF8zUEFSQU0gfHwgc291cmNlLmRhdHVtLmRhdHVtX3R5cGUgPT09IFBKRF83UEFSQU0pICYmIGRlc3QuZGF0dW1Db2RlICE9PSBcIldHUzg0XCIpO1xuICB9XG5cbiAgLy8gV29ya2Fyb3VuZCBmb3IgZGF0dW0gc2hpZnRzIHRvd2dzODQsIGlmIGVpdGhlciBzb3VyY2Ugb3IgZGVzdGluYXRpb24gcHJvamVjdGlvbiBpcyBub3Qgd2dzODRcbiAgaWYgKHNvdXJjZS5kYXR1bSAmJiBkZXN0LmRhdHVtICYmIChjaGVja05vdFdHUyhzb3VyY2UsIGRlc3QpIHx8IGNoZWNrTm90V0dTKGRlc3QsIHNvdXJjZSkpKSB7XG4gICAgd2dzODQgPSBuZXcgcHJvaignV0dTODQnKTtcbiAgICB0cmFuc2Zvcm0oc291cmNlLCB3Z3M4NCwgcG9pbnQpO1xuICAgIHNvdXJjZSA9IHdnczg0O1xuICB9XG4gIC8vIERHUiwgMjAxMC8xMS8xMlxuICBpZiAoc291cmNlLmF4aXMgIT09IFwiZW51XCIpIHtcbiAgICBhZGp1c3RfYXhpcyhzb3VyY2UsIGZhbHNlLCBwb2ludCk7XG4gIH1cbiAgLy8gVHJhbnNmb3JtIHNvdXJjZSBwb2ludHMgdG8gbG9uZy9sYXQsIGlmIHRoZXkgYXJlbid0IGFscmVhZHkuXG4gIGlmIChzb3VyY2UucHJvak5hbWUgPT09IFwibG9uZ2xhdFwiKSB7XG4gICAgcG9pbnQueCAqPSBEMlI7IC8vIGNvbnZlcnQgZGVncmVlcyB0byByYWRpYW5zXG4gICAgcG9pbnQueSAqPSBEMlI7XG4gIH1cbiAgZWxzZSB7XG4gICAgaWYgKHNvdXJjZS50b19tZXRlcikge1xuICAgICAgcG9pbnQueCAqPSBzb3VyY2UudG9fbWV0ZXI7XG4gICAgICBwb2ludC55ICo9IHNvdXJjZS50b19tZXRlcjtcbiAgICB9XG4gICAgc291cmNlLmludmVyc2UocG9pbnQpOyAvLyBDb252ZXJ0IENhcnRlc2lhbiB0byBsb25nbGF0XG4gIH1cbiAgLy8gQWRqdXN0IGZvciB0aGUgcHJpbWUgbWVyaWRpYW4gaWYgbmVjZXNzYXJ5XG4gIGlmIChzb3VyY2UuZnJvbV9ncmVlbndpY2gpIHtcbiAgICBwb2ludC54ICs9IHNvdXJjZS5mcm9tX2dyZWVud2ljaDtcbiAgfVxuXG4gIC8vIENvbnZlcnQgZGF0dW1zIGlmIG5lZWRlZCwgYW5kIGlmIHBvc3NpYmxlLlxuICBwb2ludCA9IGRhdHVtX3RyYW5zZm9ybShzb3VyY2UuZGF0dW0sIGRlc3QuZGF0dW0sIHBvaW50KTtcblxuICAvLyBBZGp1c3QgZm9yIHRoZSBwcmltZSBtZXJpZGlhbiBpZiBuZWNlc3NhcnlcbiAgaWYgKGRlc3QuZnJvbV9ncmVlbndpY2gpIHtcbiAgICBwb2ludC54IC09IGRlc3QuZnJvbV9ncmVlbndpY2g7XG4gIH1cblxuICBpZiAoZGVzdC5wcm9qTmFtZSA9PT0gXCJsb25nbGF0XCIpIHtcbiAgICAvLyBjb252ZXJ0IHJhZGlhbnMgdG8gZGVjaW1hbCBkZWdyZWVzXG4gICAgcG9pbnQueCAqPSBSMkQ7XG4gICAgcG9pbnQueSAqPSBSMkQ7XG4gIH1cbiAgZWxzZSB7IC8vIGVsc2UgcHJvamVjdFxuICAgIGRlc3QuZm9yd2FyZChwb2ludCk7XG4gICAgaWYgKGRlc3QudG9fbWV0ZXIpIHtcbiAgICAgIHBvaW50LnggLz0gZGVzdC50b19tZXRlcjtcbiAgICAgIHBvaW50LnkgLz0gZGVzdC50b19tZXRlcjtcbiAgICB9XG4gIH1cblxuICAvLyBER1IsIDIwMTAvMTEvMTJcbiAgaWYgKGRlc3QuYXhpcyAhPT0gXCJlbnVcIikge1xuICAgIGFkanVzdF9heGlzKGRlc3QsIHRydWUsIHBvaW50KTtcbiAgfVxuXG4gIHJldHVybiBwb2ludDtcbn07IiwidmFyIEQyUiA9IDAuMDE3NDUzMjkyNTE5OTQzMjk1Nzc7XG52YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi9leHRlbmQnKTtcblxuZnVuY3Rpb24gbWFwaXQob2JqLCBrZXksIHYpIHtcbiAgb2JqW2tleV0gPSB2Lm1hcChmdW5jdGlvbihhYSkge1xuICAgIHZhciBvID0ge307XG4gICAgc0V4cHIoYWEsIG8pO1xuICAgIHJldHVybiBvO1xuICB9KS5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBleHRlbmQoYSwgYik7XG4gIH0sIHt9KTtcbn1cblxuZnVuY3Rpb24gc0V4cHIodiwgb2JqKSB7XG4gIHZhciBrZXk7XG4gIGlmICghQXJyYXkuaXNBcnJheSh2KSkge1xuICAgIG9ialt2XSA9IHRydWU7XG4gICAgcmV0dXJuO1xuICB9XG4gIGVsc2Uge1xuICAgIGtleSA9IHYuc2hpZnQoKTtcbiAgICBpZiAoa2V5ID09PSAnUEFSQU1FVEVSJykge1xuICAgICAga2V5ID0gdi5zaGlmdCgpO1xuICAgIH1cbiAgICBpZiAodi5sZW5ndGggPT09IDEpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZbMF0pKSB7XG4gICAgICAgIG9ialtrZXldID0ge307XG4gICAgICAgIHNFeHByKHZbMF0sIG9ialtrZXldKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBvYmpba2V5XSA9IHZbMF07XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCF2Lmxlbmd0aCkge1xuICAgICAgb2JqW2tleV0gPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChrZXkgPT09ICdUT1dHUzg0Jykge1xuICAgICAgb2JqW2tleV0gPSB2O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIG9ialtrZXldID0ge307XG4gICAgICBpZiAoWydVTklUJywgJ1BSSU1FTScsICdWRVJUX0RBVFVNJ10uaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICAgICAgb2JqW2tleV0gPSB7XG4gICAgICAgICAgbmFtZTogdlswXS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgIGNvbnZlcnQ6IHZbMV1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHYubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgb2JqW2tleV0uYXV0aCA9IHZbMl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ1NQSEVST0lEJykge1xuICAgICAgICBvYmpba2V5XSA9IHtcbiAgICAgICAgICBuYW1lOiB2WzBdLFxuICAgICAgICAgIGE6IHZbMV0sXG4gICAgICAgICAgcmY6IHZbMl1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHYubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgb2JqW2tleV0uYXV0aCA9IHZbM107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKFsnR0VPR0NTJywgJ0dFT0NDUycsICdEQVRVTScsICdWRVJUX0NTJywgJ0NPTVBEX0NTJywgJ0xPQ0FMX0NTJywgJ0ZJVFRFRF9DUycsICdMT0NBTF9EQVRVTSddLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICAgIHZbMF0gPSBbJ25hbWUnLCB2WzBdXTtcbiAgICAgICAgbWFwaXQob2JqLCBrZXksIHYpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAodi5ldmVyeShmdW5jdGlvbihhYSkge1xuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhYSk7XG4gICAgICB9KSkge1xuICAgICAgICBtYXBpdChvYmosIGtleSwgdik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc0V4cHIodiwgb2JqW2tleV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZW5hbWUob2JqLCBwYXJhbXMpIHtcbiAgdmFyIG91dE5hbWUgPSBwYXJhbXNbMF07XG4gIHZhciBpbk5hbWUgPSBwYXJhbXNbMV07XG4gIGlmICghKG91dE5hbWUgaW4gb2JqKSAmJiAoaW5OYW1lIGluIG9iaikpIHtcbiAgICBvYmpbb3V0TmFtZV0gPSBvYmpbaW5OYW1lXTtcbiAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMykge1xuICAgICAgb2JqW291dE5hbWVdID0gcGFyYW1zWzJdKG9ialtvdXROYW1lXSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGQycihpbnB1dCkge1xuICByZXR1cm4gaW5wdXQgKiBEMlI7XG59XG5cbmZ1bmN0aW9uIGNsZWFuV0tUKHdrdCkge1xuICBpZiAod2t0LnR5cGUgPT09ICdHRU9HQ1MnKSB7XG4gICAgd2t0LnByb2pOYW1lID0gJ2xvbmdsYXQnO1xuICB9XG4gIGVsc2UgaWYgKHdrdC50eXBlID09PSAnTE9DQUxfQ1MnKSB7XG4gICAgd2t0LnByb2pOYW1lID0gJ2lkZW50aXR5JztcbiAgICB3a3QubG9jYWwgPSB0cnVlO1xuICB9XG4gIGVsc2Uge1xuICAgIGlmICh0eXBlb2Ygd2t0LlBST0pFQ1RJT04gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHdrdC5wcm9qTmFtZSA9IE9iamVjdC5rZXlzKHdrdC5QUk9KRUNUSU9OKVswXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB3a3QucHJvak5hbWUgPSB3a3QuUFJPSkVDVElPTjtcbiAgICB9XG4gIH1cbiAgaWYgKHdrdC5VTklUKSB7XG4gICAgd2t0LnVuaXRzID0gd2t0LlVOSVQubmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh3a3QudW5pdHMgPT09ICdtZXRyZScpIHtcbiAgICAgIHdrdC51bml0cyA9ICdtZXRlcic7XG4gICAgfVxuICAgIGlmICh3a3QuVU5JVC5jb252ZXJ0KSB7XG4gICAgICB3a3QudG9fbWV0ZXIgPSBwYXJzZUZsb2F0KHdrdC5VTklULmNvbnZlcnQsIDEwKTtcbiAgICB9XG4gIH1cblxuICBpZiAod2t0LkdFT0dDUykge1xuICAgIC8vaWYod2t0LkdFT0dDUy5QUklNRU0mJndrdC5HRU9HQ1MuUFJJTUVNLmNvbnZlcnQpe1xuICAgIC8vICB3a3QuZnJvbV9ncmVlbndpY2g9d2t0LkdFT0dDUy5QUklNRU0uY29udmVydCpEMlI7XG4gICAgLy99XG4gICAgaWYgKHdrdC5HRU9HQ1MuREFUVU0pIHtcbiAgICAgIHdrdC5kYXR1bUNvZGUgPSB3a3QuR0VPR0NTLkRBVFVNLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB3a3QuZGF0dW1Db2RlID0gd2t0LkdFT0dDUy5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICAgIGlmICh3a3QuZGF0dW1Db2RlLnNsaWNlKDAsIDIpID09PSAnZF8nKSB7XG4gICAgICB3a3QuZGF0dW1Db2RlID0gd2t0LmRhdHVtQ29kZS5zbGljZSgyKTtcbiAgICB9XG4gICAgaWYgKHdrdC5kYXR1bUNvZGUgPT09ICduZXdfemVhbGFuZF9nZW9kZXRpY19kYXR1bV8xOTQ5JyB8fCB3a3QuZGF0dW1Db2RlID09PSAnbmV3X3plYWxhbmRfMTk0OScpIHtcbiAgICAgIHdrdC5kYXR1bUNvZGUgPSAnbnpnZDQ5JztcbiAgICB9XG4gICAgaWYgKHdrdC5kYXR1bUNvZGUgPT09IFwid2dzXzE5ODRcIikge1xuICAgICAgaWYgKHdrdC5QUk9KRUNUSU9OID09PSAnTWVyY2F0b3JfQXV4aWxpYXJ5X1NwaGVyZScpIHtcbiAgICAgICAgd2t0LnNwaGVyZSA9IHRydWU7XG4gICAgICB9XG4gICAgICB3a3QuZGF0dW1Db2RlID0gJ3dnczg0JztcbiAgICB9XG4gICAgaWYgKHdrdC5kYXR1bUNvZGUuc2xpY2UoLTYpID09PSAnX2ZlcnJvJykge1xuICAgICAgd2t0LmRhdHVtQ29kZSA9IHdrdC5kYXR1bUNvZGUuc2xpY2UoMCwgLSA2KTtcbiAgICB9XG4gICAgaWYgKHdrdC5kYXR1bUNvZGUuc2xpY2UoLTgpID09PSAnX2pha2FydGEnKSB7XG4gICAgICB3a3QuZGF0dW1Db2RlID0gd2t0LmRhdHVtQ29kZS5zbGljZSgwLCAtIDgpO1xuICAgIH1cbiAgICBpZiAofndrdC5kYXR1bUNvZGUuaW5kZXhPZignYmVsZ2UnKSkge1xuICAgICAgd2t0LmRhdHVtQ29kZSA9IFwicm5iNzJcIjtcbiAgICB9XG4gICAgaWYgKHdrdC5HRU9HQ1MuREFUVU0gJiYgd2t0LkdFT0dDUy5EQVRVTS5TUEhFUk9JRCkge1xuICAgICAgd2t0LmVsbHBzID0gd2t0LkdFT0dDUy5EQVRVTS5TUEhFUk9JRC5uYW1lLnJlcGxhY2UoJ18xOScsICcnKS5yZXBsYWNlKC9bQ2NdbGFya2VcXF8xOC8sICdjbHJrJyk7XG4gICAgICBpZiAod2t0LmVsbHBzLnRvTG93ZXJDYXNlKCkuc2xpY2UoMCwgMTMpID09PSBcImludGVybmF0aW9uYWxcIikge1xuICAgICAgICB3a3QuZWxscHMgPSAnaW50bCc7XG4gICAgICB9XG5cbiAgICAgIHdrdC5hID0gd2t0LkdFT0dDUy5EQVRVTS5TUEhFUk9JRC5hO1xuICAgICAgd2t0LnJmID0gcGFyc2VGbG9hdCh3a3QuR0VPR0NTLkRBVFVNLlNQSEVST0lELnJmLCAxMCk7XG4gICAgfVxuICAgIGlmICh+d2t0LmRhdHVtQ29kZS5pbmRleE9mKCdvc2diXzE5MzYnKSkge1xuICAgICAgd2t0LmRhdHVtQ29kZSA9IFwib3NnYjM2XCI7XG4gICAgfVxuICB9XG4gIGlmICh3a3QuYiAmJiAhaXNGaW5pdGUod2t0LmIpKSB7XG4gICAgd2t0LmIgPSB3a3QuYTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRvTWV0ZXIoaW5wdXQpIHtcbiAgICB2YXIgcmF0aW8gPSB3a3QudG9fbWV0ZXIgfHwgMTtcbiAgICByZXR1cm4gcGFyc2VGbG9hdChpbnB1dCwgMTApICogcmF0aW87XG4gIH1cbiAgdmFyIHJlbmFtZXIgPSBmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIHJlbmFtZSh3a3QsIGEpO1xuICB9O1xuICB2YXIgbGlzdCA9IFtcbiAgICBbJ3N0YW5kYXJkX3BhcmFsbGVsXzEnLCAnU3RhbmRhcmRfUGFyYWxsZWxfMSddLFxuICAgIFsnc3RhbmRhcmRfcGFyYWxsZWxfMicsICdTdGFuZGFyZF9QYXJhbGxlbF8yJ10sXG4gICAgWydmYWxzZV9lYXN0aW5nJywgJ0ZhbHNlX0Vhc3RpbmcnXSxcbiAgICBbJ2ZhbHNlX25vcnRoaW5nJywgJ0ZhbHNlX05vcnRoaW5nJ10sXG4gICAgWydjZW50cmFsX21lcmlkaWFuJywgJ0NlbnRyYWxfTWVyaWRpYW4nXSxcbiAgICBbJ2xhdGl0dWRlX29mX29yaWdpbicsICdMYXRpdHVkZV9PZl9PcmlnaW4nXSxcbiAgICBbJ2xhdGl0dWRlX29mX29yaWdpbicsICdDZW50cmFsX1BhcmFsbGVsJ10sXG4gICAgWydzY2FsZV9mYWN0b3InLCAnU2NhbGVfRmFjdG9yJ10sXG4gICAgWydrMCcsICdzY2FsZV9mYWN0b3InXSxcbiAgICBbJ2xhdGl0dWRlX29mX2NlbnRlcicsICdMYXRpdHVkZV9vZl9jZW50ZXInXSxcbiAgICBbJ2xhdDAnLCAnbGF0aXR1ZGVfb2ZfY2VudGVyJywgZDJyXSxcbiAgICBbJ2xvbmdpdHVkZV9vZl9jZW50ZXInLCAnTG9uZ2l0dWRlX09mX0NlbnRlciddLFxuICAgIFsnbG9uZ2MnLCAnbG9uZ2l0dWRlX29mX2NlbnRlcicsIGQycl0sXG4gICAgWyd4MCcsICdmYWxzZV9lYXN0aW5nJywgdG9NZXRlcl0sXG4gICAgWyd5MCcsICdmYWxzZV9ub3J0aGluZycsIHRvTWV0ZXJdLFxuICAgIFsnbG9uZzAnLCAnY2VudHJhbF9tZXJpZGlhbicsIGQycl0sXG4gICAgWydsYXQwJywgJ2xhdGl0dWRlX29mX29yaWdpbicsIGQycl0sXG4gICAgWydsYXQwJywgJ3N0YW5kYXJkX3BhcmFsbGVsXzEnLCBkMnJdLFxuICAgIFsnbGF0MScsICdzdGFuZGFyZF9wYXJhbGxlbF8xJywgZDJyXSxcbiAgICBbJ2xhdDInLCAnc3RhbmRhcmRfcGFyYWxsZWxfMicsIGQycl0sXG4gICAgWydhbHBoYScsICdhemltdXRoJywgZDJyXSxcbiAgICBbJ3Nyc0NvZGUnLCAnbmFtZSddXG4gIF07XG4gIGxpc3QuZm9yRWFjaChyZW5hbWVyKTtcbiAgaWYgKCF3a3QubG9uZzAgJiYgd2t0LmxvbmdjICYmICh3a3QucHJvak5hbWUgPT09ICdBbGJlcnNfQ29uaWNfRXF1YWxfQXJlYScgfHwgd2t0LnByb2pOYW1lID09PSBcIkxhbWJlcnRfQXppbXV0aGFsX0VxdWFsX0FyZWFcIikpIHtcbiAgICB3a3QubG9uZzAgPSB3a3QubG9uZ2M7XG4gIH1cbiAgaWYgKCF3a3QubGF0X3RzICYmIHdrdC5sYXQxICYmICh3a3QucHJvak5hbWUgPT09ICdTdGVyZW9ncmFwaGljX1NvdXRoX1BvbGUnIHx8IHdrdC5wcm9qTmFtZSA9PT0gJ1BvbGFyIFN0ZXJlb2dyYXBoaWMgKHZhcmlhbnQgQiknKSkge1xuICAgIHdrdC5sYXQwID0gZDJyKHdrdC5sYXQxID4gMCA/IDkwIDogLTkwKTtcbiAgICB3a3QubGF0X3RzID0gd2t0LmxhdDE7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24od2t0LCBzZWxmKSB7XG4gIHZhciBsaXNwID0gSlNPTi5wYXJzZSgoXCIsXCIgKyB3a3QpLnJlcGxhY2UoL1xccypcXCxcXHMqKFtBLVpfMC05XSs/KShcXFspL2csICcsW1wiJDFcIiwnKS5zbGljZSgxKS5yZXBsYWNlKC9cXHMqXFwsXFxzKihbQS1aXzAtOV0rPylcXF0vZywgJyxcIiQxXCJdJykucmVwbGFjZSgvLFxcW1wiVkVSVENTXCIuKy8sJycpKTtcbiAgdmFyIHR5cGUgPSBsaXNwLnNoaWZ0KCk7XG4gIHZhciBuYW1lID0gbGlzcC5zaGlmdCgpO1xuICBsaXNwLnVuc2hpZnQoWyduYW1lJywgbmFtZV0pO1xuICBsaXNwLnVuc2hpZnQoWyd0eXBlJywgdHlwZV0pO1xuICBsaXNwLnVuc2hpZnQoJ291dHB1dCcpO1xuICB2YXIgb2JqID0ge307XG4gIHNFeHByKGxpc3AsIG9iaik7XG4gIGNsZWFuV0tUKG9iai5vdXRwdXQpO1xuICByZXR1cm4gZXh0ZW5kKHNlbGYsIG9iai5vdXRwdXQpO1xufTtcbiIsIlxuXG5cbi8qKlxuICogVVRNIHpvbmVzIGFyZSBncm91cGVkLCBhbmQgYXNzaWduZWQgdG8gb25lIG9mIGEgZ3JvdXAgb2YgNlxuICogc2V0cy5cbiAqXG4gKiB7aW50fSBAcHJpdmF0ZVxuICovXG52YXIgTlVNXzEwMEtfU0VUUyA9IDY7XG5cbi8qKlxuICogVGhlIGNvbHVtbiBsZXR0ZXJzIChmb3IgZWFzdGluZykgb2YgdGhlIGxvd2VyIGxlZnQgdmFsdWUsIHBlclxuICogc2V0LlxuICpcbiAqIHtzdHJpbmd9IEBwcml2YXRlXG4gKi9cbnZhciBTRVRfT1JJR0lOX0NPTFVNTl9MRVRURVJTID0gJ0FKU0FKUyc7XG5cbi8qKlxuICogVGhlIHJvdyBsZXR0ZXJzIChmb3Igbm9ydGhpbmcpIG9mIHRoZSBsb3dlciBsZWZ0IHZhbHVlLCBwZXJcbiAqIHNldC5cbiAqXG4gKiB7c3RyaW5nfSBAcHJpdmF0ZVxuICovXG52YXIgU0VUX09SSUdJTl9ST1dfTEVUVEVSUyA9ICdBRkFGQUYnO1xuXG52YXIgQSA9IDY1OyAvLyBBXG52YXIgSSA9IDczOyAvLyBJXG52YXIgTyA9IDc5OyAvLyBPXG52YXIgViA9IDg2OyAvLyBWXG52YXIgWiA9IDkwOyAvLyBaXG5cbi8qKlxuICogQ29udmVyc2lvbiBvZiBsYXQvbG9uIHRvIE1HUlMuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGxsIE9iamVjdCBsaXRlcmFsIHdpdGggbGF0IGFuZCBsb24gcHJvcGVydGllcyBvbiBhXG4gKiAgICAgV0dTODQgZWxsaXBzb2lkLlxuICogQHBhcmFtIHtpbnR9IGFjY3VyYWN5IEFjY3VyYWN5IGluIGRpZ2l0cyAoNSBmb3IgMSBtLCA0IGZvciAxMCBtLCAzIGZvclxuICogICAgICAxMDAgbSwgMiBmb3IgMTAwMCBtIG9yIDEgZm9yIDEwMDAwIG0pLiBPcHRpb25hbCwgZGVmYXVsdCBpcyA1LlxuICogQHJldHVybiB7c3RyaW5nfSB0aGUgTUdSUyBzdHJpbmcgZm9yIHRoZSBnaXZlbiBsb2NhdGlvbiBhbmQgYWNjdXJhY3kuXG4gKi9cbmV4cG9ydHMuZm9yd2FyZCA9IGZ1bmN0aW9uKGxsLCBhY2N1cmFjeSkge1xuICBhY2N1cmFjeSA9IGFjY3VyYWN5IHx8IDU7IC8vIGRlZmF1bHQgYWNjdXJhY3kgMW1cbiAgcmV0dXJuIGVuY29kZShMTHRvVVRNKHtcbiAgICBsYXQ6IGxsWzFdLFxuICAgIGxvbjogbGxbMF1cbiAgfSksIGFjY3VyYWN5KTtcbn07XG5cbi8qKlxuICogQ29udmVyc2lvbiBvZiBNR1JTIHRvIGxhdC9sb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1ncnMgTUdSUyBzdHJpbmcuXG4gKiBAcmV0dXJuIHthcnJheX0gQW4gYXJyYXkgd2l0aCBsZWZ0IChsb25naXR1ZGUpLCBib3R0b20gKGxhdGl0dWRlKSwgcmlnaHRcbiAqICAgICAobG9uZ2l0dWRlKSBhbmQgdG9wIChsYXRpdHVkZSkgdmFsdWVzIGluIFdHUzg0LCByZXByZXNlbnRpbmcgdGhlXG4gKiAgICAgYm91bmRpbmcgYm94IGZvciB0aGUgcHJvdmlkZWQgTUdSUyByZWZlcmVuY2UuXG4gKi9cbmV4cG9ydHMuaW52ZXJzZSA9IGZ1bmN0aW9uKG1ncnMpIHtcbiAgdmFyIGJib3ggPSBVVE10b0xMKGRlY29kZShtZ3JzLnRvVXBwZXJDYXNlKCkpKTtcbiAgaWYgKGJib3gubGF0ICYmIGJib3gubG9uKSB7XG4gICAgcmV0dXJuIFtiYm94LmxvbiwgYmJveC5sYXQsIGJib3gubG9uLCBiYm94LmxhdF07XG4gIH1cbiAgcmV0dXJuIFtiYm94LmxlZnQsIGJib3guYm90dG9tLCBiYm94LnJpZ2h0LCBiYm94LnRvcF07XG59O1xuXG5leHBvcnRzLnRvUG9pbnQgPSBmdW5jdGlvbihtZ3JzKSB7XG4gIHZhciBiYm94ID0gVVRNdG9MTChkZWNvZGUobWdycy50b1VwcGVyQ2FzZSgpKSk7XG4gIGlmIChiYm94LmxhdCAmJiBiYm94Lmxvbikge1xuICAgIHJldHVybiBbYmJveC5sb24sIGJib3gubGF0XTtcbiAgfVxuICByZXR1cm4gWyhiYm94LmxlZnQgKyBiYm94LnJpZ2h0KSAvIDIsIChiYm94LnRvcCArIGJib3guYm90dG9tKSAvIDJdO1xufTtcbi8qKlxuICogQ29udmVyc2lvbiBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IGRlZyB0aGUgYW5nbGUgaW4gZGVncmVlcy5cbiAqIEByZXR1cm4ge251bWJlcn0gdGhlIGFuZ2xlIGluIHJhZGlhbnMuXG4gKi9cbmZ1bmN0aW9uIGRlZ1RvUmFkKGRlZykge1xuICByZXR1cm4gKGRlZyAqIChNYXRoLlBJIC8gMTgwLjApKTtcbn1cblxuLyoqXG4gKiBDb252ZXJzaW9uIGZyb20gcmFkaWFucyB0byBkZWdyZWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIHRoZSBhbmdsZSBpbiByYWRpYW5zLlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgYW5nbGUgaW4gZGVncmVlcy5cbiAqL1xuZnVuY3Rpb24gcmFkVG9EZWcocmFkKSB7XG4gIHJldHVybiAoMTgwLjAgKiAocmFkIC8gTWF0aC5QSSkpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgc2V0IG9mIExvbmdpdHVkZSBhbmQgTGF0aXR1ZGUgY28tb3JkaW5hdGVzIHRvIFVUTVxuICogdXNpbmcgdGhlIFdHUzg0IGVsbGlwc29pZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IGxsIE9iamVjdCBsaXRlcmFsIHdpdGggbGF0IGFuZCBsb24gcHJvcGVydGllc1xuICogICAgIHJlcHJlc2VudGluZyB0aGUgV0dTODQgY29vcmRpbmF0ZSB0byBiZSBjb252ZXJ0ZWQuXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCBsaXRlcmFsIGNvbnRhaW5pbmcgdGhlIFVUTSB2YWx1ZSB3aXRoIGVhc3RpbmcsXG4gKiAgICAgbm9ydGhpbmcsIHpvbmVOdW1iZXIgYW5kIHpvbmVMZXR0ZXIgcHJvcGVydGllcywgYW5kIGFuIG9wdGlvbmFsXG4gKiAgICAgYWNjdXJhY3kgcHJvcGVydHkgaW4gZGlnaXRzLiBSZXR1cm5zIG51bGwgaWYgdGhlIGNvbnZlcnNpb24gZmFpbGVkLlxuICovXG5mdW5jdGlvbiBMTHRvVVRNKGxsKSB7XG4gIHZhciBMYXQgPSBsbC5sYXQ7XG4gIHZhciBMb25nID0gbGwubG9uO1xuICB2YXIgYSA9IDYzNzgxMzcuMDsgLy9lbGxpcC5yYWRpdXM7XG4gIHZhciBlY2NTcXVhcmVkID0gMC4wMDY2OTQzODsgLy9lbGxpcC5lY2NzcTtcbiAgdmFyIGswID0gMC45OTk2O1xuICB2YXIgTG9uZ09yaWdpbjtcbiAgdmFyIGVjY1ByaW1lU3F1YXJlZDtcbiAgdmFyIE4sIFQsIEMsIEEsIE07XG4gIHZhciBMYXRSYWQgPSBkZWdUb1JhZChMYXQpO1xuICB2YXIgTG9uZ1JhZCA9IGRlZ1RvUmFkKExvbmcpO1xuICB2YXIgTG9uZ09yaWdpblJhZDtcbiAgdmFyIFpvbmVOdW1iZXI7XG4gIC8vIChpbnQpXG4gIFpvbmVOdW1iZXIgPSBNYXRoLmZsb29yKChMb25nICsgMTgwKSAvIDYpICsgMTtcblxuICAvL01ha2Ugc3VyZSB0aGUgbG9uZ2l0dWRlIDE4MC4wMCBpcyBpbiBab25lIDYwXG4gIGlmIChMb25nID09PSAxODApIHtcbiAgICBab25lTnVtYmVyID0gNjA7XG4gIH1cblxuICAvLyBTcGVjaWFsIHpvbmUgZm9yIE5vcndheVxuICBpZiAoTGF0ID49IDU2LjAgJiYgTGF0IDwgNjQuMCAmJiBMb25nID49IDMuMCAmJiBMb25nIDwgMTIuMCkge1xuICAgIFpvbmVOdW1iZXIgPSAzMjtcbiAgfVxuXG4gIC8vIFNwZWNpYWwgem9uZXMgZm9yIFN2YWxiYXJkXG4gIGlmIChMYXQgPj0gNzIuMCAmJiBMYXQgPCA4NC4wKSB7XG4gICAgaWYgKExvbmcgPj0gMC4wICYmIExvbmcgPCA5LjApIHtcbiAgICAgIFpvbmVOdW1iZXIgPSAzMTtcbiAgICB9XG4gICAgZWxzZSBpZiAoTG9uZyA+PSA5LjAgJiYgTG9uZyA8IDIxLjApIHtcbiAgICAgIFpvbmVOdW1iZXIgPSAzMztcbiAgICB9XG4gICAgZWxzZSBpZiAoTG9uZyA+PSAyMS4wICYmIExvbmcgPCAzMy4wKSB7XG4gICAgICBab25lTnVtYmVyID0gMzU7XG4gICAgfVxuICAgIGVsc2UgaWYgKExvbmcgPj0gMzMuMCAmJiBMb25nIDwgNDIuMCkge1xuICAgICAgWm9uZU51bWJlciA9IDM3O1xuICAgIH1cbiAgfVxuXG4gIExvbmdPcmlnaW4gPSAoWm9uZU51bWJlciAtIDEpICogNiAtIDE4MCArIDM7IC8vKzMgcHV0cyBvcmlnaW5cbiAgLy8gaW4gbWlkZGxlIG9mXG4gIC8vIHpvbmVcbiAgTG9uZ09yaWdpblJhZCA9IGRlZ1RvUmFkKExvbmdPcmlnaW4pO1xuXG4gIGVjY1ByaW1lU3F1YXJlZCA9IChlY2NTcXVhcmVkKSAvICgxIC0gZWNjU3F1YXJlZCk7XG5cbiAgTiA9IGEgLyBNYXRoLnNxcnQoMSAtIGVjY1NxdWFyZWQgKiBNYXRoLnNpbihMYXRSYWQpICogTWF0aC5zaW4oTGF0UmFkKSk7XG4gIFQgPSBNYXRoLnRhbihMYXRSYWQpICogTWF0aC50YW4oTGF0UmFkKTtcbiAgQyA9IGVjY1ByaW1lU3F1YXJlZCAqIE1hdGguY29zKExhdFJhZCkgKiBNYXRoLmNvcyhMYXRSYWQpO1xuICBBID0gTWF0aC5jb3MoTGF0UmFkKSAqIChMb25nUmFkIC0gTG9uZ09yaWdpblJhZCk7XG5cbiAgTSA9IGEgKiAoKDEgLSBlY2NTcXVhcmVkIC8gNCAtIDMgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDY0IC0gNSAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDI1NikgKiBMYXRSYWQgLSAoMyAqIGVjY1NxdWFyZWQgLyA4ICsgMyAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkIC8gMzIgKyA0NSAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDEwMjQpICogTWF0aC5zaW4oMiAqIExhdFJhZCkgKyAoMTUgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDI1NiArIDQ1ICogZWNjU3F1YXJlZCAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkIC8gMTAyNCkgKiBNYXRoLnNpbig0ICogTGF0UmFkKSAtICgzNSAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDMwNzIpICogTWF0aC5zaW4oNiAqIExhdFJhZCkpO1xuXG4gIHZhciBVVE1FYXN0aW5nID0gKGswICogTiAqIChBICsgKDEgLSBUICsgQykgKiBBICogQSAqIEEgLyA2LjAgKyAoNSAtIDE4ICogVCArIFQgKiBUICsgNzIgKiBDIC0gNTggKiBlY2NQcmltZVNxdWFyZWQpICogQSAqIEEgKiBBICogQSAqIEEgLyAxMjAuMCkgKyA1MDAwMDAuMCk7XG5cbiAgdmFyIFVUTU5vcnRoaW5nID0gKGswICogKE0gKyBOICogTWF0aC50YW4oTGF0UmFkKSAqIChBICogQSAvIDIgKyAoNSAtIFQgKyA5ICogQyArIDQgKiBDICogQykgKiBBICogQSAqIEEgKiBBIC8gMjQuMCArICg2MSAtIDU4ICogVCArIFQgKiBUICsgNjAwICogQyAtIDMzMCAqIGVjY1ByaW1lU3F1YXJlZCkgKiBBICogQSAqIEEgKiBBICogQSAqIEEgLyA3MjAuMCkpKTtcbiAgaWYgKExhdCA8IDAuMCkge1xuICAgIFVUTU5vcnRoaW5nICs9IDEwMDAwMDAwLjA7IC8vMTAwMDAwMDAgbWV0ZXIgb2Zmc2V0IGZvclxuICAgIC8vIHNvdXRoZXJuIGhlbWlzcGhlcmVcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbm9ydGhpbmc6IE1hdGgucm91bmQoVVRNTm9ydGhpbmcpLFxuICAgIGVhc3Rpbmc6IE1hdGgucm91bmQoVVRNRWFzdGluZyksXG4gICAgem9uZU51bWJlcjogWm9uZU51bWJlcixcbiAgICB6b25lTGV0dGVyOiBnZXRMZXR0ZXJEZXNpZ25hdG9yKExhdClcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBVVE0gY29vcmRzIHRvIGxhdC9sb25nLCB1c2luZyB0aGUgV0dTODQgZWxsaXBzb2lkLiBUaGlzIGlzIGEgY29udmVuaWVuY2VcbiAqIGNsYXNzIHdoZXJlIHRoZSBab25lIGNhbiBiZSBzcGVjaWZpZWQgYXMgYSBzaW5nbGUgc3RyaW5nIGVnLlwiNjBOXCIgd2hpY2hcbiAqIGlzIHRoZW4gYnJva2VuIGRvd24gaW50byB0aGUgWm9uZU51bWJlciBhbmQgWm9uZUxldHRlci5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtvYmplY3R9IHV0bSBBbiBvYmplY3QgbGl0ZXJhbCB3aXRoIG5vcnRoaW5nLCBlYXN0aW5nLCB6b25lTnVtYmVyXG4gKiAgICAgYW5kIHpvbmVMZXR0ZXIgcHJvcGVydGllcy4gSWYgYW4gb3B0aW9uYWwgYWNjdXJhY3kgcHJvcGVydHkgaXNcbiAqICAgICBwcm92aWRlZCAoaW4gbWV0ZXJzKSwgYSBib3VuZGluZyBib3ggd2lsbCBiZSByZXR1cm5lZCBpbnN0ZWFkIG9mXG4gKiAgICAgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZS5cbiAqIEByZXR1cm4ge29iamVjdH0gQW4gb2JqZWN0IGxpdGVyYWwgY29udGFpbmluZyBlaXRoZXIgbGF0IGFuZCBsb24gdmFsdWVzXG4gKiAgICAgKGlmIG5vIGFjY3VyYWN5IHdhcyBwcm92aWRlZCksIG9yIHRvcCwgcmlnaHQsIGJvdHRvbSBhbmQgbGVmdCB2YWx1ZXNcbiAqICAgICBmb3IgdGhlIGJvdW5kaW5nIGJveCBjYWxjdWxhdGVkIGFjY29yZGluZyB0byB0aGUgcHJvdmlkZWQgYWNjdXJhY3kuXG4gKiAgICAgUmV0dXJucyBudWxsIGlmIHRoZSBjb252ZXJzaW9uIGZhaWxlZC5cbiAqL1xuZnVuY3Rpb24gVVRNdG9MTCh1dG0pIHtcblxuICB2YXIgVVRNTm9ydGhpbmcgPSB1dG0ubm9ydGhpbmc7XG4gIHZhciBVVE1FYXN0aW5nID0gdXRtLmVhc3Rpbmc7XG4gIHZhciB6b25lTGV0dGVyID0gdXRtLnpvbmVMZXR0ZXI7XG4gIHZhciB6b25lTnVtYmVyID0gdXRtLnpvbmVOdW1iZXI7XG4gIC8vIGNoZWNrIHRoZSBab25lTnVtbWJlciBpcyB2YWxpZFxuICBpZiAoem9uZU51bWJlciA8IDAgfHwgem9uZU51bWJlciA+IDYwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgazAgPSAwLjk5OTY7XG4gIHZhciBhID0gNjM3ODEzNy4wOyAvL2VsbGlwLnJhZGl1cztcbiAgdmFyIGVjY1NxdWFyZWQgPSAwLjAwNjY5NDM4OyAvL2VsbGlwLmVjY3NxO1xuICB2YXIgZWNjUHJpbWVTcXVhcmVkO1xuICB2YXIgZTEgPSAoMSAtIE1hdGguc3FydCgxIC0gZWNjU3F1YXJlZCkpIC8gKDEgKyBNYXRoLnNxcnQoMSAtIGVjY1NxdWFyZWQpKTtcbiAgdmFyIE4xLCBUMSwgQzEsIFIxLCBELCBNO1xuICB2YXIgTG9uZ09yaWdpbjtcbiAgdmFyIG11LCBwaGkxUmFkO1xuXG4gIC8vIHJlbW92ZSA1MDAsMDAwIG1ldGVyIG9mZnNldCBmb3IgbG9uZ2l0dWRlXG4gIHZhciB4ID0gVVRNRWFzdGluZyAtIDUwMDAwMC4wO1xuICB2YXIgeSA9IFVUTU5vcnRoaW5nO1xuXG4gIC8vIFdlIG11c3Qga25vdyBzb21laG93IGlmIHdlIGFyZSBpbiB0aGUgTm9ydGhlcm4gb3IgU291dGhlcm5cbiAgLy8gaGVtaXNwaGVyZSwgdGhpcyBpcyB0aGUgb25seSB0aW1lIHdlIHVzZSB0aGUgbGV0dGVyIFNvIGV2ZW5cbiAgLy8gaWYgdGhlIFpvbmUgbGV0dGVyIGlzbid0IGV4YWN0bHkgY29ycmVjdCBpdCBzaG91bGQgaW5kaWNhdGVcbiAgLy8gdGhlIGhlbWlzcGhlcmUgY29ycmVjdGx5XG4gIGlmICh6b25lTGV0dGVyIDwgJ04nKSB7XG4gICAgeSAtPSAxMDAwMDAwMC4wOyAvLyByZW1vdmUgMTAsMDAwLDAwMCBtZXRlciBvZmZzZXQgdXNlZFxuICAgIC8vIGZvciBzb3V0aGVybiBoZW1pc3BoZXJlXG4gIH1cblxuICAvLyBUaGVyZSBhcmUgNjAgem9uZXMgd2l0aCB6b25lIDEgYmVpbmcgYXQgV2VzdCAtMTgwIHRvIC0xNzRcbiAgTG9uZ09yaWdpbiA9ICh6b25lTnVtYmVyIC0gMSkgKiA2IC0gMTgwICsgMzsgLy8gKzMgcHV0cyBvcmlnaW5cbiAgLy8gaW4gbWlkZGxlIG9mXG4gIC8vIHpvbmVcblxuICBlY2NQcmltZVNxdWFyZWQgPSAoZWNjU3F1YXJlZCkgLyAoMSAtIGVjY1NxdWFyZWQpO1xuXG4gIE0gPSB5IC8gazA7XG4gIG11ID0gTSAvIChhICogKDEgLSBlY2NTcXVhcmVkIC8gNCAtIDMgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDY0IC0gNSAqIGVjY1NxdWFyZWQgKiBlY2NTcXVhcmVkICogZWNjU3F1YXJlZCAvIDI1NikpO1xuXG4gIHBoaTFSYWQgPSBtdSArICgzICogZTEgLyAyIC0gMjcgKiBlMSAqIGUxICogZTEgLyAzMikgKiBNYXRoLnNpbigyICogbXUpICsgKDIxICogZTEgKiBlMSAvIDE2IC0gNTUgKiBlMSAqIGUxICogZTEgKiBlMSAvIDMyKSAqIE1hdGguc2luKDQgKiBtdSkgKyAoMTUxICogZTEgKiBlMSAqIGUxIC8gOTYpICogTWF0aC5zaW4oNiAqIG11KTtcbiAgLy8gZG91YmxlIHBoaTEgPSBQcm9qTWF0aC5yYWRUb0RlZyhwaGkxUmFkKTtcblxuICBOMSA9IGEgLyBNYXRoLnNxcnQoMSAtIGVjY1NxdWFyZWQgKiBNYXRoLnNpbihwaGkxUmFkKSAqIE1hdGguc2luKHBoaTFSYWQpKTtcbiAgVDEgPSBNYXRoLnRhbihwaGkxUmFkKSAqIE1hdGgudGFuKHBoaTFSYWQpO1xuICBDMSA9IGVjY1ByaW1lU3F1YXJlZCAqIE1hdGguY29zKHBoaTFSYWQpICogTWF0aC5jb3MocGhpMVJhZCk7XG4gIFIxID0gYSAqICgxIC0gZWNjU3F1YXJlZCkgLyBNYXRoLnBvdygxIC0gZWNjU3F1YXJlZCAqIE1hdGguc2luKHBoaTFSYWQpICogTWF0aC5zaW4ocGhpMVJhZCksIDEuNSk7XG4gIEQgPSB4IC8gKE4xICogazApO1xuXG4gIHZhciBsYXQgPSBwaGkxUmFkIC0gKE4xICogTWF0aC50YW4ocGhpMVJhZCkgLyBSMSkgKiAoRCAqIEQgLyAyIC0gKDUgKyAzICogVDEgKyAxMCAqIEMxIC0gNCAqIEMxICogQzEgLSA5ICogZWNjUHJpbWVTcXVhcmVkKSAqIEQgKiBEICogRCAqIEQgLyAyNCArICg2MSArIDkwICogVDEgKyAyOTggKiBDMSArIDQ1ICogVDEgKiBUMSAtIDI1MiAqIGVjY1ByaW1lU3F1YXJlZCAtIDMgKiBDMSAqIEMxKSAqIEQgKiBEICogRCAqIEQgKiBEICogRCAvIDcyMCk7XG4gIGxhdCA9IHJhZFRvRGVnKGxhdCk7XG5cbiAgdmFyIGxvbiA9IChEIC0gKDEgKyAyICogVDEgKyBDMSkgKiBEICogRCAqIEQgLyA2ICsgKDUgLSAyICogQzEgKyAyOCAqIFQxIC0gMyAqIEMxICogQzEgKyA4ICogZWNjUHJpbWVTcXVhcmVkICsgMjQgKiBUMSAqIFQxKSAqIEQgKiBEICogRCAqIEQgKiBEIC8gMTIwKSAvIE1hdGguY29zKHBoaTFSYWQpO1xuICBsb24gPSBMb25nT3JpZ2luICsgcmFkVG9EZWcobG9uKTtcblxuICB2YXIgcmVzdWx0O1xuICBpZiAodXRtLmFjY3VyYWN5KSB7XG4gICAgdmFyIHRvcFJpZ2h0ID0gVVRNdG9MTCh7XG4gICAgICBub3J0aGluZzogdXRtLm5vcnRoaW5nICsgdXRtLmFjY3VyYWN5LFxuICAgICAgZWFzdGluZzogdXRtLmVhc3RpbmcgKyB1dG0uYWNjdXJhY3ksXG4gICAgICB6b25lTGV0dGVyOiB1dG0uem9uZUxldHRlcixcbiAgICAgIHpvbmVOdW1iZXI6IHV0bS56b25lTnVtYmVyXG4gICAgfSk7XG4gICAgcmVzdWx0ID0ge1xuICAgICAgdG9wOiB0b3BSaWdodC5sYXQsXG4gICAgICByaWdodDogdG9wUmlnaHQubG9uLFxuICAgICAgYm90dG9tOiBsYXQsXG4gICAgICBsZWZ0OiBsb25cbiAgICB9O1xuICB9XG4gIGVsc2Uge1xuICAgIHJlc3VsdCA9IHtcbiAgICAgIGxhdDogbGF0LFxuICAgICAgbG9uOiBsb25cbiAgICB9O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgTUdSUyBsZXR0ZXIgZGVzaWduYXRvciBmb3IgdGhlIGdpdmVuIGxhdGl0dWRlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gbGF0IFRoZSBsYXRpdHVkZSBpbiBXR1M4NCB0byBnZXQgdGhlIGxldHRlciBkZXNpZ25hdG9yXG4gKiAgICAgZm9yLlxuICogQHJldHVybiB7Y2hhcn0gVGhlIGxldHRlciBkZXNpZ25hdG9yLlxuICovXG5mdW5jdGlvbiBnZXRMZXR0ZXJEZXNpZ25hdG9yKGxhdCkge1xuICAvL1RoaXMgaXMgaGVyZSBhcyBhbiBlcnJvciBmbGFnIHRvIHNob3cgdGhhdCB0aGUgTGF0aXR1ZGUgaXNcbiAgLy9vdXRzaWRlIE1HUlMgbGltaXRzXG4gIHZhciBMZXR0ZXJEZXNpZ25hdG9yID0gJ1onO1xuXG4gIGlmICgoODQgPj0gbGF0KSAmJiAobGF0ID49IDcyKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnWCc7XG4gIH1cbiAgZWxzZSBpZiAoKDcyID4gbGF0KSAmJiAobGF0ID49IDY0KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnVyc7XG4gIH1cbiAgZWxzZSBpZiAoKDY0ID4gbGF0KSAmJiAobGF0ID49IDU2KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnVic7XG4gIH1cbiAgZWxzZSBpZiAoKDU2ID4gbGF0KSAmJiAobGF0ID49IDQ4KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnVSc7XG4gIH1cbiAgZWxzZSBpZiAoKDQ4ID4gbGF0KSAmJiAobGF0ID49IDQwKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnVCc7XG4gIH1cbiAgZWxzZSBpZiAoKDQwID4gbGF0KSAmJiAobGF0ID49IDMyKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnUyc7XG4gIH1cbiAgZWxzZSBpZiAoKDMyID4gbGF0KSAmJiAobGF0ID49IDI0KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnUic7XG4gIH1cbiAgZWxzZSBpZiAoKDI0ID4gbGF0KSAmJiAobGF0ID49IDE2KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnUSc7XG4gIH1cbiAgZWxzZSBpZiAoKDE2ID4gbGF0KSAmJiAobGF0ID49IDgpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdQJztcbiAgfVxuICBlbHNlIGlmICgoOCA+IGxhdCkgJiYgKGxhdCA+PSAwKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnTic7XG4gIH1cbiAgZWxzZSBpZiAoKDAgPiBsYXQpICYmIChsYXQgPj0gLTgpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdNJztcbiAgfVxuICBlbHNlIGlmICgoLTggPiBsYXQpICYmIChsYXQgPj0gLTE2KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnTCc7XG4gIH1cbiAgZWxzZSBpZiAoKC0xNiA+IGxhdCkgJiYgKGxhdCA+PSAtMjQpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdLJztcbiAgfVxuICBlbHNlIGlmICgoLTI0ID4gbGF0KSAmJiAobGF0ID49IC0zMikpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0onO1xuICB9XG4gIGVsc2UgaWYgKCgtMzIgPiBsYXQpICYmIChsYXQgPj0gLTQwKSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnSCc7XG4gIH1cbiAgZWxzZSBpZiAoKC00MCA+IGxhdCkgJiYgKGxhdCA+PSAtNDgpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdHJztcbiAgfVxuICBlbHNlIGlmICgoLTQ4ID4gbGF0KSAmJiAobGF0ID49IC01NikpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0YnO1xuICB9XG4gIGVsc2UgaWYgKCgtNTYgPiBsYXQpICYmIChsYXQgPj0gLTY0KSkge1xuICAgIExldHRlckRlc2lnbmF0b3IgPSAnRSc7XG4gIH1cbiAgZWxzZSBpZiAoKC02NCA+IGxhdCkgJiYgKGxhdCA+PSAtNzIpKSB7XG4gICAgTGV0dGVyRGVzaWduYXRvciA9ICdEJztcbiAgfVxuICBlbHNlIGlmICgoLTcyID4gbGF0KSAmJiAobGF0ID49IC04MCkpIHtcbiAgICBMZXR0ZXJEZXNpZ25hdG9yID0gJ0MnO1xuICB9XG4gIHJldHVybiBMZXR0ZXJEZXNpZ25hdG9yO1xufVxuXG4vKipcbiAqIEVuY29kZXMgYSBVVE0gbG9jYXRpb24gYXMgTUdSUyBzdHJpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7b2JqZWN0fSB1dG0gQW4gb2JqZWN0IGxpdGVyYWwgd2l0aCBlYXN0aW5nLCBub3J0aGluZyxcbiAqICAgICB6b25lTGV0dGVyLCB6b25lTnVtYmVyXG4gKiBAcGFyYW0ge251bWJlcn0gYWNjdXJhY3kgQWNjdXJhY3kgaW4gZGlnaXRzICgxLTUpLlxuICogQHJldHVybiB7c3RyaW5nfSBNR1JTIHN0cmluZyBmb3IgdGhlIGdpdmVuIFVUTSBsb2NhdGlvbi5cbiAqL1xuZnVuY3Rpb24gZW5jb2RlKHV0bSwgYWNjdXJhY3kpIHtcbiAgLy8gcHJlcGVuZCB3aXRoIGxlYWRpbmcgemVyb2VzXG4gIHZhciBzZWFzdGluZyA9IFwiMDAwMDBcIiArIHV0bS5lYXN0aW5nLFxuICAgIHNub3J0aGluZyA9IFwiMDAwMDBcIiArIHV0bS5ub3J0aGluZztcblxuICByZXR1cm4gdXRtLnpvbmVOdW1iZXIgKyB1dG0uem9uZUxldHRlciArIGdldDEwMGtJRCh1dG0uZWFzdGluZywgdXRtLm5vcnRoaW5nLCB1dG0uem9uZU51bWJlcikgKyBzZWFzdGluZy5zdWJzdHIoc2Vhc3RpbmcubGVuZ3RoIC0gNSwgYWNjdXJhY3kpICsgc25vcnRoaW5nLnN1YnN0cihzbm9ydGhpbmcubGVuZ3RoIC0gNSwgYWNjdXJhY3kpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgdHdvIGxldHRlciAxMDBrIGRlc2lnbmF0b3IgZm9yIGEgZ2l2ZW4gVVRNIGVhc3RpbmcsXG4gKiBub3J0aGluZyBhbmQgem9uZSBudW1iZXIgdmFsdWUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBlYXN0aW5nXG4gKiBAcGFyYW0ge251bWJlcn0gbm9ydGhpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSB6b25lTnVtYmVyXG4gKiBAcmV0dXJuIHRoZSB0d28gbGV0dGVyIDEwMGsgZGVzaWduYXRvciBmb3IgdGhlIGdpdmVuIFVUTSBsb2NhdGlvbi5cbiAqL1xuZnVuY3Rpb24gZ2V0MTAwa0lEKGVhc3RpbmcsIG5vcnRoaW5nLCB6b25lTnVtYmVyKSB7XG4gIHZhciBzZXRQYXJtID0gZ2V0MTAwa1NldEZvclpvbmUoem9uZU51bWJlcik7XG4gIHZhciBzZXRDb2x1bW4gPSBNYXRoLmZsb29yKGVhc3RpbmcgLyAxMDAwMDApO1xuICB2YXIgc2V0Um93ID0gTWF0aC5mbG9vcihub3J0aGluZyAvIDEwMDAwMCkgJSAyMDtcbiAgcmV0dXJuIGdldExldHRlcjEwMGtJRChzZXRDb2x1bW4sIHNldFJvdywgc2V0UGFybSk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBVVE0gem9uZSBudW1iZXIsIGZpZ3VyZSBvdXQgdGhlIE1HUlMgMTAwSyBzZXQgaXQgaXMgaW4uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBpIEFuIFVUTSB6b25lIG51bWJlci5cbiAqIEByZXR1cm4ge251bWJlcn0gdGhlIDEwMGsgc2V0IHRoZSBVVE0gem9uZSBpcyBpbi5cbiAqL1xuZnVuY3Rpb24gZ2V0MTAwa1NldEZvclpvbmUoaSkge1xuICB2YXIgc2V0UGFybSA9IGkgJSBOVU1fMTAwS19TRVRTO1xuICBpZiAoc2V0UGFybSA9PT0gMCkge1xuICAgIHNldFBhcm0gPSBOVU1fMTAwS19TRVRTO1xuICB9XG5cbiAgcmV0dXJuIHNldFBhcm07XG59XG5cbi8qKlxuICogR2V0IHRoZSB0d28tbGV0dGVyIE1HUlMgMTAwayBkZXNpZ25hdG9yIGdpdmVuIGluZm9ybWF0aW9uXG4gKiB0cmFuc2xhdGVkIGZyb20gdGhlIFVUTSBub3J0aGluZywgZWFzdGluZyBhbmQgem9uZSBudW1iZXIuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW4gdGhlIGNvbHVtbiBpbmRleCBhcyBpdCByZWxhdGVzIHRvIHRoZSBNR1JTXG4gKiAgICAgICAgMTAwayBzZXQgc3ByZWFkc2hlZXQsIGNyZWF0ZWQgZnJvbSB0aGUgVVRNIGVhc3RpbmcuXG4gKiAgICAgICAgVmFsdWVzIGFyZSAxLTguXG4gKiBAcGFyYW0ge251bWJlcn0gcm93IHRoZSByb3cgaW5kZXggYXMgaXQgcmVsYXRlcyB0byB0aGUgTUdSUyAxMDBrIHNldFxuICogICAgICAgIHNwcmVhZHNoZWV0LCBjcmVhdGVkIGZyb20gdGhlIFVUTSBub3J0aGluZyB2YWx1ZS4gVmFsdWVzXG4gKiAgICAgICAgYXJlIGZyb20gMC0xOS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBwYXJtIHRoZSBzZXQgYmxvY2ssIGFzIGl0IHJlbGF0ZXMgdG8gdGhlIE1HUlMgMTAwayBzZXRcbiAqICAgICAgICBzcHJlYWRzaGVldCwgY3JlYXRlZCBmcm9tIHRoZSBVVE0gem9uZS4gVmFsdWVzIGFyZSBmcm9tXG4gKiAgICAgICAgMS02MC5cbiAqIEByZXR1cm4gdHdvIGxldHRlciBNR1JTIDEwMGsgY29kZS5cbiAqL1xuZnVuY3Rpb24gZ2V0TGV0dGVyMTAwa0lEKGNvbHVtbiwgcm93LCBwYXJtKSB7XG4gIC8vIGNvbE9yaWdpbiBhbmQgcm93T3JpZ2luIGFyZSB0aGUgbGV0dGVycyBhdCB0aGUgb3JpZ2luIG9mIHRoZSBzZXRcbiAgdmFyIGluZGV4ID0gcGFybSAtIDE7XG4gIHZhciBjb2xPcmlnaW4gPSBTRVRfT1JJR0lOX0NPTFVNTl9MRVRURVJTLmNoYXJDb2RlQXQoaW5kZXgpO1xuICB2YXIgcm93T3JpZ2luID0gU0VUX09SSUdJTl9ST1dfTEVUVEVSUy5jaGFyQ29kZUF0KGluZGV4KTtcblxuICAvLyBjb2xJbnQgYW5kIHJvd0ludCBhcmUgdGhlIGxldHRlcnMgdG8gYnVpbGQgdG8gcmV0dXJuXG4gIHZhciBjb2xJbnQgPSBjb2xPcmlnaW4gKyBjb2x1bW4gLSAxO1xuICB2YXIgcm93SW50ID0gcm93T3JpZ2luICsgcm93O1xuICB2YXIgcm9sbG92ZXIgPSBmYWxzZTtcblxuICBpZiAoY29sSW50ID4gWikge1xuICAgIGNvbEludCA9IGNvbEludCAtIFogKyBBIC0gMTtcbiAgICByb2xsb3ZlciA9IHRydWU7XG4gIH1cblxuICBpZiAoY29sSW50ID09PSBJIHx8IChjb2xPcmlnaW4gPCBJICYmIGNvbEludCA+IEkpIHx8ICgoY29sSW50ID4gSSB8fCBjb2xPcmlnaW4gPCBJKSAmJiByb2xsb3ZlcikpIHtcbiAgICBjb2xJbnQrKztcbiAgfVxuXG4gIGlmIChjb2xJbnQgPT09IE8gfHwgKGNvbE9yaWdpbiA8IE8gJiYgY29sSW50ID4gTykgfHwgKChjb2xJbnQgPiBPIHx8IGNvbE9yaWdpbiA8IE8pICYmIHJvbGxvdmVyKSkge1xuICAgIGNvbEludCsrO1xuXG4gICAgaWYgKGNvbEludCA9PT0gSSkge1xuICAgICAgY29sSW50Kys7XG4gICAgfVxuICB9XG5cbiAgaWYgKGNvbEludCA+IFopIHtcbiAgICBjb2xJbnQgPSBjb2xJbnQgLSBaICsgQSAtIDE7XG4gIH1cblxuICBpZiAocm93SW50ID4gVikge1xuICAgIHJvd0ludCA9IHJvd0ludCAtIFYgKyBBIC0gMTtcbiAgICByb2xsb3ZlciA9IHRydWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgcm9sbG92ZXIgPSBmYWxzZTtcbiAgfVxuXG4gIGlmICgoKHJvd0ludCA9PT0gSSkgfHwgKChyb3dPcmlnaW4gPCBJKSAmJiAocm93SW50ID4gSSkpKSB8fCAoKChyb3dJbnQgPiBJKSB8fCAocm93T3JpZ2luIDwgSSkpICYmIHJvbGxvdmVyKSkge1xuICAgIHJvd0ludCsrO1xuICB9XG5cbiAgaWYgKCgocm93SW50ID09PSBPKSB8fCAoKHJvd09yaWdpbiA8IE8pICYmIChyb3dJbnQgPiBPKSkpIHx8ICgoKHJvd0ludCA+IE8pIHx8IChyb3dPcmlnaW4gPCBPKSkgJiYgcm9sbG92ZXIpKSB7XG4gICAgcm93SW50Kys7XG5cbiAgICBpZiAocm93SW50ID09PSBJKSB7XG4gICAgICByb3dJbnQrKztcbiAgICB9XG4gIH1cblxuICBpZiAocm93SW50ID4gVikge1xuICAgIHJvd0ludCA9IHJvd0ludCAtIFYgKyBBIC0gMTtcbiAgfVxuXG4gIHZhciB0d29MZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNvbEludCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKHJvd0ludCk7XG4gIHJldHVybiB0d29MZXR0ZXI7XG59XG5cbi8qKlxuICogRGVjb2RlIHRoZSBVVE0gcGFyYW1ldGVycyBmcm9tIGEgTUdSUyBzdHJpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZ3JzU3RyaW5nIGFuIFVQUEVSQ0FTRSBjb29yZGluYXRlIHN0cmluZyBpcyBleHBlY3RlZC5cbiAqIEByZXR1cm4ge29iamVjdH0gQW4gb2JqZWN0IGxpdGVyYWwgd2l0aCBlYXN0aW5nLCBub3J0aGluZywgem9uZUxldHRlcixcbiAqICAgICB6b25lTnVtYmVyIGFuZCBhY2N1cmFjeSAoaW4gbWV0ZXJzKSBwcm9wZXJ0aWVzLlxuICovXG5mdW5jdGlvbiBkZWNvZGUobWdyc1N0cmluZykge1xuXG4gIGlmIChtZ3JzU3RyaW5nICYmIG1ncnNTdHJpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgKFwiTUdSU1BvaW50IGNvdmVydGluZyBmcm9tIG5vdGhpbmdcIik7XG4gIH1cblxuICB2YXIgbGVuZ3RoID0gbWdyc1N0cmluZy5sZW5ndGg7XG5cbiAgdmFyIGh1bksgPSBudWxsO1xuICB2YXIgc2IgPSBcIlwiO1xuICB2YXIgdGVzdENoYXI7XG4gIHZhciBpID0gMDtcblxuICAvLyBnZXQgWm9uZSBudW1iZXJcbiAgd2hpbGUgKCEoL1tBLVpdLykudGVzdCh0ZXN0Q2hhciA9IG1ncnNTdHJpbmcuY2hhckF0KGkpKSkge1xuICAgIGlmIChpID49IDIpIHtcbiAgICAgIHRocm93IChcIk1HUlNQb2ludCBiYWQgY29udmVyc2lvbiBmcm9tOiBcIiArIG1ncnNTdHJpbmcpO1xuICAgIH1cbiAgICBzYiArPSB0ZXN0Q2hhcjtcbiAgICBpKys7XG4gIH1cblxuICB2YXIgem9uZU51bWJlciA9IHBhcnNlSW50KHNiLCAxMCk7XG5cbiAgaWYgKGkgPT09IDAgfHwgaSArIDMgPiBsZW5ndGgpIHtcbiAgICAvLyBBIGdvb2QgTUdSUyBzdHJpbmcgaGFzIHRvIGJlIDQtNSBkaWdpdHMgbG9uZyxcbiAgICAvLyAjI0FBQS8jQUFBIGF0IGxlYXN0LlxuICAgIHRocm93IChcIk1HUlNQb2ludCBiYWQgY29udmVyc2lvbiBmcm9tOiBcIiArIG1ncnNTdHJpbmcpO1xuICB9XG5cbiAgdmFyIHpvbmVMZXR0ZXIgPSBtZ3JzU3RyaW5nLmNoYXJBdChpKyspO1xuXG4gIC8vIFNob3VsZCB3ZSBjaGVjayB0aGUgem9uZSBsZXR0ZXIgaGVyZT8gV2h5IG5vdC5cbiAgaWYgKHpvbmVMZXR0ZXIgPD0gJ0EnIHx8IHpvbmVMZXR0ZXIgPT09ICdCJyB8fCB6b25lTGV0dGVyID09PSAnWScgfHwgem9uZUxldHRlciA+PSAnWicgfHwgem9uZUxldHRlciA9PT0gJ0knIHx8IHpvbmVMZXR0ZXIgPT09ICdPJykge1xuICAgIHRocm93IChcIk1HUlNQb2ludCB6b25lIGxldHRlciBcIiArIHpvbmVMZXR0ZXIgKyBcIiBub3QgaGFuZGxlZDogXCIgKyBtZ3JzU3RyaW5nKTtcbiAgfVxuXG4gIGh1bksgPSBtZ3JzU3RyaW5nLnN1YnN0cmluZyhpLCBpICs9IDIpO1xuXG4gIHZhciBzZXQgPSBnZXQxMDBrU2V0Rm9yWm9uZSh6b25lTnVtYmVyKTtcblxuICB2YXIgZWFzdDEwMGsgPSBnZXRFYXN0aW5nRnJvbUNoYXIoaHVuSy5jaGFyQXQoMCksIHNldCk7XG4gIHZhciBub3J0aDEwMGsgPSBnZXROb3J0aGluZ0Zyb21DaGFyKGh1bksuY2hhckF0KDEpLCBzZXQpO1xuXG4gIC8vIFdlIGhhdmUgYSBidWcgd2hlcmUgdGhlIG5vcnRoaW5nIG1heSBiZSAyMDAwMDAwIHRvbyBsb3cuXG4gIC8vIEhvd1xuICAvLyBkbyB3ZSBrbm93IHdoZW4gdG8gcm9sbCBvdmVyP1xuXG4gIHdoaWxlIChub3J0aDEwMGsgPCBnZXRNaW5Ob3J0aGluZyh6b25lTGV0dGVyKSkge1xuICAgIG5vcnRoMTAwayArPSAyMDAwMDAwO1xuICB9XG5cbiAgLy8gY2FsY3VsYXRlIHRoZSBjaGFyIGluZGV4IGZvciBlYXN0aW5nL25vcnRoaW5nIHNlcGFyYXRvclxuICB2YXIgcmVtYWluZGVyID0gbGVuZ3RoIC0gaTtcblxuICBpZiAocmVtYWluZGVyICUgMiAhPT0gMCkge1xuICAgIHRocm93IChcIk1HUlNQb2ludCBoYXMgdG8gaGF2ZSBhbiBldmVuIG51bWJlciBcXG5vZiBkaWdpdHMgYWZ0ZXIgdGhlIHpvbmUgbGV0dGVyIGFuZCB0d28gMTAwa20gbGV0dGVycyAtIGZyb250IFxcbmhhbGYgZm9yIGVhc3RpbmcgbWV0ZXJzLCBzZWNvbmQgaGFsZiBmb3IgXFxubm9ydGhpbmcgbWV0ZXJzXCIgKyBtZ3JzU3RyaW5nKTtcbiAgfVxuXG4gIHZhciBzZXAgPSByZW1haW5kZXIgLyAyO1xuXG4gIHZhciBzZXBFYXN0aW5nID0gMC4wO1xuICB2YXIgc2VwTm9ydGhpbmcgPSAwLjA7XG4gIHZhciBhY2N1cmFjeUJvbnVzLCBzZXBFYXN0aW5nU3RyaW5nLCBzZXBOb3J0aGluZ1N0cmluZywgZWFzdGluZywgbm9ydGhpbmc7XG4gIGlmIChzZXAgPiAwKSB7XG4gICAgYWNjdXJhY3lCb251cyA9IDEwMDAwMC4wIC8gTWF0aC5wb3coMTAsIHNlcCk7XG4gICAgc2VwRWFzdGluZ1N0cmluZyA9IG1ncnNTdHJpbmcuc3Vic3RyaW5nKGksIGkgKyBzZXApO1xuICAgIHNlcEVhc3RpbmcgPSBwYXJzZUZsb2F0KHNlcEVhc3RpbmdTdHJpbmcpICogYWNjdXJhY3lCb251cztcbiAgICBzZXBOb3J0aGluZ1N0cmluZyA9IG1ncnNTdHJpbmcuc3Vic3RyaW5nKGkgKyBzZXApO1xuICAgIHNlcE5vcnRoaW5nID0gcGFyc2VGbG9hdChzZXBOb3J0aGluZ1N0cmluZykgKiBhY2N1cmFjeUJvbnVzO1xuICB9XG5cbiAgZWFzdGluZyA9IHNlcEVhc3RpbmcgKyBlYXN0MTAwaztcbiAgbm9ydGhpbmcgPSBzZXBOb3J0aGluZyArIG5vcnRoMTAwaztcblxuICByZXR1cm4ge1xuICAgIGVhc3Rpbmc6IGVhc3RpbmcsXG4gICAgbm9ydGhpbmc6IG5vcnRoaW5nLFxuICAgIHpvbmVMZXR0ZXI6IHpvbmVMZXR0ZXIsXG4gICAgem9uZU51bWJlcjogem9uZU51bWJlcixcbiAgICBhY2N1cmFjeTogYWNjdXJhY3lCb251c1xuICB9O1xufVxuXG4vKipcbiAqIEdpdmVuIHRoZSBmaXJzdCBsZXR0ZXIgZnJvbSBhIHR3by1sZXR0ZXIgTUdSUyAxMDBrIHpvbmUsIGFuZCBnaXZlbiB0aGVcbiAqIE1HUlMgdGFibGUgc2V0IGZvciB0aGUgem9uZSBudW1iZXIsIGZpZ3VyZSBvdXQgdGhlIGVhc3RpbmcgdmFsdWUgdGhhdFxuICogc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBvdGhlciwgc2Vjb25kYXJ5IGVhc3RpbmcgdmFsdWUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Y2hhcn0gZSBUaGUgZmlyc3QgbGV0dGVyIGZyb20gYSB0d28tbGV0dGVyIE1HUlMgMTAwwrRrIHpvbmUuXG4gKiBAcGFyYW0ge251bWJlcn0gc2V0IFRoZSBNR1JTIHRhYmxlIHNldCBmb3IgdGhlIHpvbmUgbnVtYmVyLlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgZWFzdGluZyB2YWx1ZSBmb3IgdGhlIGdpdmVuIGxldHRlciBhbmQgc2V0LlxuICovXG5mdW5jdGlvbiBnZXRFYXN0aW5nRnJvbUNoYXIoZSwgc2V0KSB7XG4gIC8vIGNvbE9yaWdpbiBpcyB0aGUgbGV0dGVyIGF0IHRoZSBvcmlnaW4gb2YgdGhlIHNldCBmb3IgdGhlXG4gIC8vIGNvbHVtblxuICB2YXIgY3VyQ29sID0gU0VUX09SSUdJTl9DT0xVTU5fTEVUVEVSUy5jaGFyQ29kZUF0KHNldCAtIDEpO1xuICB2YXIgZWFzdGluZ1ZhbHVlID0gMTAwMDAwLjA7XG4gIHZhciByZXdpbmRNYXJrZXIgPSBmYWxzZTtcblxuICB3aGlsZSAoY3VyQ29sICE9PSBlLmNoYXJDb2RlQXQoMCkpIHtcbiAgICBjdXJDb2wrKztcbiAgICBpZiAoY3VyQ29sID09PSBJKSB7XG4gICAgICBjdXJDb2wrKztcbiAgICB9XG4gICAgaWYgKGN1ckNvbCA9PT0gTykge1xuICAgICAgY3VyQ29sKys7XG4gICAgfVxuICAgIGlmIChjdXJDb2wgPiBaKSB7XG4gICAgICBpZiAocmV3aW5kTWFya2VyKSB7XG4gICAgICAgIHRocm93IChcIkJhZCBjaGFyYWN0ZXI6IFwiICsgZSk7XG4gICAgICB9XG4gICAgICBjdXJDb2wgPSBBO1xuICAgICAgcmV3aW5kTWFya2VyID0gdHJ1ZTtcbiAgICB9XG4gICAgZWFzdGluZ1ZhbHVlICs9IDEwMDAwMC4wO1xuICB9XG5cbiAgcmV0dXJuIGVhc3RpbmdWYWx1ZTtcbn1cblxuLyoqXG4gKiBHaXZlbiB0aGUgc2Vjb25kIGxldHRlciBmcm9tIGEgdHdvLWxldHRlciBNR1JTIDEwMGsgem9uZSwgYW5kIGdpdmVuIHRoZVxuICogTUdSUyB0YWJsZSBzZXQgZm9yIHRoZSB6b25lIG51bWJlciwgZmlndXJlIG91dCB0aGUgbm9ydGhpbmcgdmFsdWUgdGhhdFxuICogc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBvdGhlciwgc2Vjb25kYXJ5IG5vcnRoaW5nIHZhbHVlLiBZb3UgaGF2ZSB0b1xuICogcmVtZW1iZXIgdGhhdCBOb3J0aGluZ3MgYXJlIGRldGVybWluZWQgZnJvbSB0aGUgZXF1YXRvciwgYW5kIHRoZSB2ZXJ0aWNhbFxuICogY3ljbGUgb2YgbGV0dGVycyBtZWFuIGEgMjAwMDAwMCBhZGRpdGlvbmFsIG5vcnRoaW5nIG1ldGVycy4gVGhpcyBoYXBwZW5zXG4gKiBhcHByb3guIGV2ZXJ5IDE4IGRlZ3JlZXMgb2YgbGF0aXR1ZGUuIFRoaXMgbWV0aG9kIGRvZXMgKk5PVCogY291bnQgYW55XG4gKiBhZGRpdGlvbmFsIG5vcnRoaW5ncy4gWW91IGhhdmUgdG8gZmlndXJlIG91dCBob3cgbWFueSAyMDAwMDAwIG1ldGVycyBuZWVkXG4gKiB0byBiZSBhZGRlZCBmb3IgdGhlIHpvbmUgbGV0dGVyIG9mIHRoZSBNR1JTIGNvb3JkaW5hdGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Y2hhcn0gbiBTZWNvbmQgbGV0dGVyIG9mIHRoZSBNR1JTIDEwMGsgem9uZVxuICogQHBhcmFtIHtudW1iZXJ9IHNldCBUaGUgTUdSUyB0YWJsZSBzZXQgbnVtYmVyLCB3aGljaCBpcyBkZXBlbmRlbnQgb24gdGhlXG4gKiAgICAgVVRNIHpvbmUgbnVtYmVyLlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbm9ydGhpbmcgdmFsdWUgZm9yIHRoZSBnaXZlbiBsZXR0ZXIgYW5kIHNldC5cbiAqL1xuZnVuY3Rpb24gZ2V0Tm9ydGhpbmdGcm9tQ2hhcihuLCBzZXQpIHtcblxuICBpZiAobiA+ICdWJykge1xuICAgIHRocm93IChcIk1HUlNQb2ludCBnaXZlbiBpbnZhbGlkIE5vcnRoaW5nIFwiICsgbik7XG4gIH1cblxuICAvLyByb3dPcmlnaW4gaXMgdGhlIGxldHRlciBhdCB0aGUgb3JpZ2luIG9mIHRoZSBzZXQgZm9yIHRoZVxuICAvLyBjb2x1bW5cbiAgdmFyIGN1clJvdyA9IFNFVF9PUklHSU5fUk9XX0xFVFRFUlMuY2hhckNvZGVBdChzZXQgLSAxKTtcbiAgdmFyIG5vcnRoaW5nVmFsdWUgPSAwLjA7XG4gIHZhciByZXdpbmRNYXJrZXIgPSBmYWxzZTtcblxuICB3aGlsZSAoY3VyUm93ICE9PSBuLmNoYXJDb2RlQXQoMCkpIHtcbiAgICBjdXJSb3crKztcbiAgICBpZiAoY3VyUm93ID09PSBJKSB7XG4gICAgICBjdXJSb3crKztcbiAgICB9XG4gICAgaWYgKGN1clJvdyA9PT0gTykge1xuICAgICAgY3VyUm93Kys7XG4gICAgfVxuICAgIC8vIGZpeGluZyBhIGJ1ZyBtYWtpbmcgd2hvbGUgYXBwbGljYXRpb24gaGFuZyBpbiB0aGlzIGxvb3BcbiAgICAvLyB3aGVuICduJyBpcyBhIHdyb25nIGNoYXJhY3RlclxuICAgIGlmIChjdXJSb3cgPiBWKSB7XG4gICAgICBpZiAocmV3aW5kTWFya2VyKSB7IC8vIG1ha2luZyBzdXJlIHRoYXQgdGhpcyBsb29wIGVuZHNcbiAgICAgICAgdGhyb3cgKFwiQmFkIGNoYXJhY3RlcjogXCIgKyBuKTtcbiAgICAgIH1cbiAgICAgIGN1clJvdyA9IEE7XG4gICAgICByZXdpbmRNYXJrZXIgPSB0cnVlO1xuICAgIH1cbiAgICBub3J0aGluZ1ZhbHVlICs9IDEwMDAwMC4wO1xuICB9XG5cbiAgcmV0dXJuIG5vcnRoaW5nVmFsdWU7XG59XG5cbi8qKlxuICogVGhlIGZ1bmN0aW9uIGdldE1pbk5vcnRoaW5nIHJldHVybnMgdGhlIG1pbmltdW0gbm9ydGhpbmcgdmFsdWUgb2YgYSBNR1JTXG4gKiB6b25lLlxuICpcbiAqIFBvcnRlZCBmcm9tIEdlb3RyYW5zJyBjIExhdHRpdHVkZV9CYW5kX1ZhbHVlIHN0cnVjdHVyZSB0YWJsZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtjaGFyfSB6b25lTGV0dGVyIFRoZSBNR1JTIHpvbmUgdG8gZ2V0IHRoZSBtaW4gbm9ydGhpbmcgZm9yLlxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRNaW5Ob3J0aGluZyh6b25lTGV0dGVyKSB7XG4gIHZhciBub3J0aGluZztcbiAgc3dpdGNoICh6b25lTGV0dGVyKSB7XG4gIGNhc2UgJ0MnOlxuICAgIG5vcnRoaW5nID0gMTEwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdEJzpcbiAgICBub3J0aGluZyA9IDIwMDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnRSc6XG4gICAgbm9ydGhpbmcgPSAyODAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ0YnOlxuICAgIG5vcnRoaW5nID0gMzcwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdHJzpcbiAgICBub3J0aGluZyA9IDQ2MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnSCc6XG4gICAgbm9ydGhpbmcgPSA1NTAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ0onOlxuICAgIG5vcnRoaW5nID0gNjQwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdLJzpcbiAgICBub3J0aGluZyA9IDczMDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnTCc6XG4gICAgbm9ydGhpbmcgPSA4MjAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ00nOlxuICAgIG5vcnRoaW5nID0gOTEwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdOJzpcbiAgICBub3J0aGluZyA9IDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnUCc6XG4gICAgbm9ydGhpbmcgPSA4MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnUSc6XG4gICAgbm9ydGhpbmcgPSAxNzAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1InOlxuICAgIG5vcnRoaW5nID0gMjYwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdTJzpcbiAgICBub3J0aGluZyA9IDM1MDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnVCc6XG4gICAgbm9ydGhpbmcgPSA0NDAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1UnOlxuICAgIG5vcnRoaW5nID0gNTMwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBjYXNlICdWJzpcbiAgICBub3J0aGluZyA9IDYyMDAwMDAuMDtcbiAgICBicmVhaztcbiAgY2FzZSAnVyc6XG4gICAgbm9ydGhpbmcgPSA3MDAwMDAwLjA7XG4gICAgYnJlYWs7XG4gIGNhc2UgJ1gnOlxuICAgIG5vcnRoaW5nID0gNzkwMDAwMC4wO1xuICAgIGJyZWFrO1xuICBkZWZhdWx0OlxuICAgIG5vcnRoaW5nID0gLTEuMDtcbiAgfVxuICBpZiAobm9ydGhpbmcgPj0gMC4wKSB7XG4gICAgcmV0dXJuIG5vcnRoaW5nO1xuICB9XG4gIGVsc2Uge1xuICAgIHRocm93IChcIkludmFsaWQgem9uZSBsZXR0ZXI6IFwiICsgem9uZUxldHRlcik7XG4gIH1cblxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm5hbWVcIjogXCJwcm9qNFwiLFxuICBcInZlcnNpb25cIjogXCIyLjMuMTBcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlByb2o0anMgaXMgYSBKYXZhU2NyaXB0IGxpYnJhcnkgdG8gdHJhbnNmb3JtIHBvaW50IGNvb3JkaW5hdGVzIGZyb20gb25lIGNvb3JkaW5hdGUgc3lzdGVtIHRvIGFub3RoZXIsIGluY2x1ZGluZyBkYXR1bSB0cmFuc2Zvcm1hdGlvbnMuXCIsXG4gIFwibWFpblwiOiBcImxpYi9pbmRleC5qc1wiLFxuICBcImRpcmVjdG9yaWVzXCI6IHtcbiAgICBcInRlc3RcIjogXCJ0ZXN0XCIsXG4gICAgXCJkb2NcIjogXCJkb2NzXCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcInRlc3RcIjogXCIuL25vZGVfbW9kdWxlcy9pc3RhbmJ1bC9saWIvY2xpLmpzIHRlc3QgLi9ub2RlX21vZHVsZXMvbW9jaGEvYmluL19tb2NoYSB0ZXN0L3Rlc3QuanNcIlxuICB9LFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiZ2l0Oi8vZ2l0aHViLmNvbS9wcm9qNGpzL3Byb2o0anMuZ2l0XCJcbiAgfSxcbiAgXCJhdXRob3JcIjogXCJcIixcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwiamFtXCI6IHtcbiAgICBcIm1haW5cIjogXCJkaXN0L3Byb2o0LmpzXCIsXG4gICAgXCJpbmNsdWRlXCI6IFtcbiAgICAgIFwiZGlzdC9wcm9qNC5qc1wiLFxuICAgICAgXCJSRUFETUUubWRcIixcbiAgICAgIFwiQVVUSE9SU1wiLFxuICAgICAgXCJMSUNFTlNFLm1kXCJcbiAgICBdXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcImdydW50LWNsaVwiOiBcIn4wLjEuMTNcIixcbiAgICBcImdydW50XCI6IFwifjAuNC4yXCIsXG4gICAgXCJncnVudC1jb250cmliLWNvbm5lY3RcIjogXCJ+MC42LjBcIixcbiAgICBcImdydW50LWNvbnRyaWItanNoaW50XCI6IFwifjAuOC4wXCIsXG4gICAgXCJjaGFpXCI6IFwifjEuOC4xXCIsXG4gICAgXCJtb2NoYVwiOiBcIn4xLjE3LjFcIixcbiAgICBcImdydW50LW1vY2hhLXBoYW50b21qc1wiOiBcIn4wLjQuMFwiLFxuICAgIFwiYnJvd3NlcmlmeVwiOiBcIn4zLjI0LjVcIixcbiAgICBcImdydW50LWJyb3dzZXJpZnlcIjogXCJ+MS4zLjBcIixcbiAgICBcImdydW50LWNvbnRyaWItdWdsaWZ5XCI6IFwifjAuMy4yXCIsXG4gICAgXCJjdXJsXCI6IFwiZ2l0Oi8vZ2l0aHViLmNvbS9jdWpvanMvY3VybC5naXRcIixcbiAgICBcImlzdGFuYnVsXCI6IFwifjAuMi40XCIsXG4gICAgXCJ0aW5cIjogXCJ+MC40LjBcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJtZ3JzXCI6IFwifjAuMC4yXCJcbiAgfSxcbiAgXCJjb250cmlidXRvcnNcIjogW1xuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIk1pa2UgQWRhaXJcIixcbiAgICAgIFwiZW1haWxcIjogXCJtYWRhaXJAZG1zb2x1dGlvbnMuY2FcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUmljaGFyZCBHcmVlbndvb2RcIixcbiAgICAgIFwiZW1haWxcIjogXCJyaWNoQGdyZWVud29vZG1hcC5jb21cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQ2FsdmluIE1ldGNhbGZcIixcbiAgICAgIFwiZW1haWxcIjogXCJjYWx2aW4ubWV0Y2FsZkBnbWFpbC5jb21cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiUmljaGFyZCBNYXJzZGVuXCIsXG4gICAgICBcInVybFwiOiBcImh0dHA6Ly93d3cud2lud2FlZC5jb21cIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiVC4gTWl0dGFuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkQuIFN0ZWlud2FuZFwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJTLiBOZWxzb25cIlxuICAgIH1cbiAgXSxcbiAgXCJnaXRIZWFkXCI6IFwiYWMwM2QxNDM5NDkxZGMzMTNkYTgwOTg1MTkzZjcwMmNhNDcxYjNkMFwiLFxuICBcImJ1Z3NcIjoge1xuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3Byb2o0anMvcHJvajRqcy9pc3N1ZXNcIlxuICB9LFxuICBcImhvbWVwYWdlXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3Byb2o0anMvcHJvajRqcyNyZWFkbWVcIixcbiAgXCJfaWRcIjogXCJwcm9qNEAyLjMuMTBcIixcbiAgXCJfc2hhc3VtXCI6IFwiZjZlNjZiZGNjYTMzMmMyNWE1ZTNkOGVmMjY1Y2ZjOWQ3YjYwZmQwY1wiLFxuICBcIl9mcm9tXCI6IFwicHJvajRAKlwiLFxuICBcIl9ucG1WZXJzaW9uXCI6IFwiMi4xMS4yXCIsXG4gIFwiX25vZGVWZXJzaW9uXCI6IFwiMC4xMi41XCIsXG4gIFwiX25wbVVzZXJcIjoge1xuICAgIFwibmFtZVwiOiBcImFob2NldmFyXCIsXG4gICAgXCJlbWFpbFwiOiBcImFuZHJlYXMuaG9jZXZhckBnbWFpbC5jb21cIlxuICB9LFxuICBcIm1haW50YWluZXJzXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJjd21tYVwiLFxuICAgICAgXCJlbWFpbFwiOiBcImNhbHZpbi5tZXRjYWxmQGdtYWlsLmNvbVwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJhaG9jZXZhclwiLFxuICAgICAgXCJlbWFpbFwiOiBcImFuZHJlYXMuaG9jZXZhckBnbWFpbC5jb21cIlxuICAgIH1cbiAgXSxcbiAgXCJkaXN0XCI6IHtcbiAgICBcInNoYXN1bVwiOiBcImY2ZTY2YmRjY2EzMzJjMjVhNWUzZDhlZjI2NWNmYzlkN2I2MGZkMGNcIixcbiAgICBcInRhcmJhbGxcIjogXCJodHRwOi8vcmVnaXN0cnkubnBtanMub3JnL3Byb2o0Ly0vcHJvajQtMi4zLjEwLnRnelwiXG4gIH0sXG4gIFwiX3Jlc29sdmVkXCI6IFwiaHR0cHM6Ly9yZWdpc3RyeS5ucG1qcy5vcmcvcHJvajQvLS9wcm9qNC0yLjMuMTAudGd6XCJcbn1cbiJdfQ==
