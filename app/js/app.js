var CIMIS = (function(){

  var bottomX = -410000;
  var bottomY = -660000;
  var cellSize = 2000;
  var proj_3310 = 'PROJCS["NAD83 / California Albers",GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Albers"],PARAMETER["standard_parallel_1",34],PARAMETER["standard_parallel_2",40.5],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-120],PARAMETER["false_easting",0],PARAMETER["false_northing",-4000000],UNIT["Meter",1]]';

  function llToGrid(lng, lat) {
    if( typeof lng === 'object' ) {
      lat = lng.lat();
      lng = lng.lng();
    }

    var result = proj4('EPSG:4326',proj_3310,[lng, lat]);

    result = {
      row : Math.floor((result[0] - bottomX) / cellSize),
      col : Math.floor((result[1] - bottomY) / cellSize),
    };

    var x = bottomX + (result.row * cellSize);
    var y = bottomY + (result.col * cellSize);

    result.topRight = proj4(proj_3310, 'EPSG:4326',[x+cellSize, y+cellSize]);
    result.bottomLeft = proj4(proj_3310, 'EPSG:4326',[x, y]);

    return result;
  }


  return {
    llToGrid : llToGrid,
    bottomX : bottomX,
    bottomY : bottomY,
    cellSize : cellSize
  };
})();
