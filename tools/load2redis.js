#! /usr/bin/node

var flatconfig = require('flatconfig');
var path=require('path');
var Tunnel=require("tunnel-ssh");
var async=require("async");
var http = require('http');
var Zlib = require('zlibjs');

// Load the configuration
var args = flatconfig.parseArgs(process.argv.slice(2));
var config = flatconfig.loadConfig(
              path.resolve(process.env.HOME, 'cimis.json'),
              path.resolve(process.cwd(), args['config']),
              args);

console.log(config);

//var tunnel = new Tunnel(config.redis);
//tunnel.connect(function (error) {
//    console.log(error);
    //or start your remote connection here ....
    //mongoose.connect(...);


    //close tunnel to exit script
//    tunnel.close();
//});

var parms=["ETo","K","Rnl","Rso","Tdew","Tn","Tx","U2"];

//var pixels={
//    "3400:1220" : {"ETo":12,"K":30,"Rnl":34.8,"Rso":34.9,"Tn":12.4,"Tx":34.4,"U2":4.1},
//};


// Foreach parameter in parms
async.eachSeries(parms,
    function(parm, next){
        var url=config.cimis.base+'/'+config.date+'/'+parm+'.asc.gz';
        // fetch $cimis/$date/${parm}.asc.gz
        uncompress(url,function(ascii){
            addParameter(parm,ascii);
            next();
        });
    },
    function(err){
        console.log('done');
    }
);


function verify_header(ascii) {
    // Read
}

function addParameter(parm,ascii) {
            // If the data is not there, fail with notice of missing file
            // Otherwise
            var header=verify_header(ascii);

            var kvp ={};
            var row,v,value;
            var r,c;

            for ( r=0; r<=header.rows; r++) {
                var values = row.split(' ');
                for (c=0; c<=header.cols; c++) {
                    var pixel_value=values[c];
                    if (v != header.no_data ) {
                      var key= ((r*2000+header.start)/1000) + ':' + (c*2000+header.ul);
                      var kv = kvp[key] || {};
                      kv[parm]=pixel_value;
                      kvp[key]=kv;
                    }
                }
            }
}

// Zipcode - Should we make this on our end, or get from server?
// I like let's try making it on our own, in that case we don't have to
