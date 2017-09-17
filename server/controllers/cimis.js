'use strict';
var router = require('express').Router();
var CimisModel = require('../models/cimis');
var model = new CimisModel();

router.get('/:row/:col', async (req, res) => {
  var row = req.params.row;
  var col = req.params.col;

  if( !row || !col ) {
    return res.send({error: true, message: 'invalid url'});
  }

  var data;
  if( row === 'region' ) {
    data = await model.getRegion(col);
  } else if( row === 'station' ) {
    data = await model.getStation(col);
  } else {
    data = await model.get(row, col);
  }

  if( data instanceof Error ) {
    return res.send({error: true, message: data.message});
  } 

  res.send(data);
});

router.get('/ll/:lng/:lat', async (req, res) => {
  var lng = req.params.lng;
  var lat = req.params.lat;

  if( !lng || !lat ) {
    return res.send({error: true, message: 'invalid url'});
  }

  var data = await model.getByLatLng(parseFloat(lat), parseFloat(lng));

  data.location.latitude = parseFloat(lat);
  data.location.longitude = parseFloat(lng);

  res.send(data);
});

router.get('/dates', async (req, res) => {
  var data = await model.getDates();
  res.json(data);
});

router.get('/stations', async (req, res) => {
  var data = await model.getStations();
  res.json(data);
});



module.exports = router;