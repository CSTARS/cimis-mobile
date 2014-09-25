#! /usr/bin/node

var asciiLoader = require("loadCompressedAscii");

/*
 load2redis - This command takes a new date, downloads the data from a CIMIS server,
 and for each pixel, creates a new daily input data, and then pushes that onto the REDIS
 server
 
 load2redis [--config=~/cimis.json] [--force][--verbose][--dry-run] [date=(yesterday)] 
 [cimis=http://cimis.casil.ucdavis.edu] redis=Address of server
 
 Command line arguments 
 date='[ Date you are interested in downloading (default=yesterday)

 load2redis will look in the sepcified config file, if exists, for inputs.
 This is specfied as :
 
*/

// Connect to Server - Fail
var parms=["ETo","K","Rnl","Rso","Tdew","Tn","Tx","U2"];

//var pixels={
//    "3400:1220" : {"ETo":12,"K":30,"Rnl":34.8,"Rso":34.9,"Tn":12.4,"Tx":34.4,"U2":4.1},
//};


// Foreach parameter in parms
async.eachSeries(parms,
    function(parm, next){
        // fetch $cimis/$date/${parm}.asc.gz
        asciiLoader.loadCompressedASCIIFile(url,function(resp){
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
            
            for ( r=0; r<=header.rows; r++) {
                var values = row.split(' ');
                for (c=0; c<=header.cols; c++) {
                    var pixel_value=values[c];
                    if (v != header.no_data ) {
                      key= (($r*2000+header.start)/1000) + ':' + ($c*2000+header.ul);
                      var kv = kvp[key] || {};
                      kv[parm]=pixel_value;
                      kvp[key]=kv;
                    }
                }
            }
            
            next();
        });
    }
    
});

// Zipcode - Should we make this on our end, or get from server? 
// I like let's try making it on our own, in that case we don't have to 
