var CIMIS = (function(){

  var bottomX = -410000;
  var bottomY = -660000;
  var rows = 560;
  var cols = 510;
  var cellSize = 2000;

  var proj_gmaps = 'EPSG:4326';
  proj4.defs("EPSG:3310","+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
  var proj_cimis = 'EPSG:3310';


  function bounds() {
    var bottomLeft = proj4(proj_cimis, proj_gmaps,[bottomX, bottomY]);
    var topRight = proj4(proj_cimis, proj_gmaps,[bottomX+((cols+1)*cellSize), bottomY+((rows+1)*cellSize)]);
    var bounds = [bottomLeft, topRight];
    console.log(bounds);
    return bounds;
  }

  function llToGrid(lng, lat) {
    if( typeof lng === 'object' ) {
      lat = lng.lat();
      lng = lng.lng();
    }

    var result = proj4(proj_gmaps,proj_cimis,[lng, lat]);

    result = {
      row : Math.floor((result[0] - bottomX) / cellSize),
      col : Math.floor((result[1] - bottomY) / cellSize),
    };

    var x = bottomX + (result.row * cellSize);
    var y = bottomY + (result.col * cellSize);

    result.topRight = proj4(proj_cimis, proj_gmaps,[x+cellSize, y+cellSize]);
    result.bottomLeft = proj4(proj_cimis, proj_gmaps,[x, y]);

    return result;
  }


  return {
    llToGrid : llToGrid,
    bottomX : bottomX,
    bottomY : bottomY,
    cellSize : cellSize,
    bounds : bounds
  };
})();
