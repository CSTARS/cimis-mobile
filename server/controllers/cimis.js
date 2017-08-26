'use strict';
var router = require('express').Router();
var CimisModel = require('../models/cimis');
var model = new CimisModel();

router.get('/:row/:col', function (req, res) {
  var row = req.params.row;
  var col = req.params.col;

  if( !row || !col ) {
    return res.send({error: true, message: 'invalid url'});
  }

  if( row === 'region' ) {
    model.getRegion(col, function(err, data){
      if( err ) {
        return res.send({error: true, message: err});
      }
      res.send(data);
    });
  } else {
    model.get(row, col, function(err, data){
      if( err ) {
        return res.send({error: true, message: err});
      }
      res.send(data);
    });
  }
});

router.get('/ll/:lng/:lat', function (req, res) {
  var lng = req.params.lng;
  var lat = req.params.lat;

  if( !lng || !lat ) {
    return res.send({error: true, message: 'invalid url'});
  }

  model.getByLatLng(parseFloat(lat), parseFloat(lng), function(err, data){
    if( err ) {
      return res.send({error: true, message: err});
    }

    data.location.latitude = parseFloat(lat);
    data.location.longitude = parseFloat(lng);

    res.send(data);
  });
});

router.get('/dates', function(req, res) {
  model.getDates(function(err, data){
    if( err ) {
      return res.send({error: true, message: err});
    }
    res.send(data);
  });
});



module.exports = router;