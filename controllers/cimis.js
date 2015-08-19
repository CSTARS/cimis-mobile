'use strict';

var CimisModel = require('../models/cimis');

module.exports = function (router) {
    var model = new CimisModel();

    router.get('/:row/:col', function (req, res) {
      var row = req.params.row;
      var col = req.params.col;

      if( !row || !col ) {
        return res.send({error: true, message: 'invalid url'});
      }

      model.get(row, col, function(err, data){
        if( err ) {
          return res.send({error: true, message: err});
        }
        res.send(data);
      });
    });
};
