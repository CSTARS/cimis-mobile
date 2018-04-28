'use strict';
var router = require('express').Router();
var model = require('../models/cimis');

router.get('/:row/:col', async (req, res) => {
  var row = req.params.row;
  var col = req.params.col;

  if( !row || !col ) {
    return res.send({error: true, message: 'invalid url'});
  }

  try {

    var data;
    if( row === 'region' ) {
      data = await model.getRegion(col);
    } else if( row === 'station' ) {
      data = await model.getStation(col);
    } else {
      data = await model.get(row, col);
    }

    // if( data instanceof Error ) {
    //   return res.send({error: true, message: data.message});
    // } 

    res.json(data);
  } catch(e) {
    res.status(500).json({error: true, message: e.message});
  }
});

router.get('/ll/:lng/:lat', async (req, res) => {
  var lng = req.params.lng;
  var lat = req.params.lat;

  if( !lng || !lat ) {
    return res.send({error: true, message: 'invalid url'});
  }

  try {
    var data = await model.getByLatLng(parseFloat(lat), parseFloat(lng));

    data.location.latitude = parseFloat(lat);
    data.location.longitude = parseFloat(lng);

    res.json(data);
  } catch(e) {
    res.status(500).json({error: true, message: e.message});
  }
});

router.get('/dates', async (req, res) => {
  try {
    res.json(await model.getDates());
  } catch(e) {
    res.status(500).json({error: true, message: e.message});
  }
});

router.get('/stations', async (req, res) => {
  try {
    res.json(await model.getStations());
  } catch(e) {
    res.status(500).json({error: true, message: e.message});
  }
});



module.exports = router;