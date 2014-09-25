{"changed":true,"filter":false,"title":"load2redis.js","tooltip":"/tools/load2redis.js","value":"#! /usr/bin/node\n\nvar asciiLoader = require(\"loadCompressedAscii\");\n\n/*\n load2redis - This command takes a new date, downloads the data from a CIMIS server,\n and for each pixel, creates a new daily input data, and then pushes that onto the REDIS\n server\n \n load2redis [--config=~/cimis.json] [--force][--verbose][--dry-run] [date=(yesterday)] \n [cimis=http://cimis.casil.ucdavis.edu] redis=Address of server\n \n Command line arguments \n date='[ Date you are interested in downloading (default=yesterday)\n\n load2redis will look in the sepcified config file, if exists, for inputs.\n This is specfied as :\n \n*/\n\n// Connect to Server - Fail\nvar parms=[\"ETo\",\"K\",\"Rnl\",\"Rso\",\"Tdew\",\"Tn\",\"Tx\",\"U2\"];\n\n//var pixels={\n//    \"3400:1220\" : {\"ETo\":12,\"K\":30,\"Rnl\":34.8,\"Rso\":34.9,\"Tn\":12.4,\"Tx\":34.4,\"U2\":4.1},\n//};\n\n// Foreach parameter in parms\nasync.eachSeries(parms,\n    function(parm, next){\n        // fetch $cimis/$date/${parm}.asc.gz\n        asciiLoader.loadCompressedASCIIFile(url,function(resp){\n            addParameter(parm,ascii);\n            next();\n        });\n    },\n    function(err){\n        console.log('done');\n    }\n);\n    \n\n// Quinn Does this    \nfunction verify_header(ascii) {\n    // Read ENVI sytle header\n    header={\n        \"size\":2000,\n        \"ul\":20,\n        \"no-data\":20,\n    };\n    return header;\n}\n    \nfunction addParameter(parm,ascii) {\n            // If the data is not there, fail with notice of missing file\n            // Otherwise\n            var header=verify_header(ascii);\n            \n            var kvp ={};\n            var row,v,value;\n            \n            for ( r=0; r<=header.rows; r++) {\n                var values = row.split(' ');\n                for (c=0; c<=header.cols; c++) {\n                    var pixel_value=values[c];\n                    if (v != header.no_data ) {\n                      key= (($r*2000+header.start)/1000) + ':' + ($c*2000+header.ul);\n                      var kv = kvp[key] || {};\n                      kv[parm]=pixel_value;\n                      kvp[key]=kv;\n                    }\n                }\n            }\n            \n            next();\n        });\n    }\n    \n});\n\n// Zipcode - Should we make this on our end, or get from server? \n// I like let's try making it on our own, in that case we don't have to \n","undoManager":{"mark":-24,"position":100,"stack":[[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":11},"end":{"row":45,"column":12}},"text":"{"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":12},"end":{"row":45,"column":14}},"text":"''"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":45,"column":12},"end":{"row":45,"column":14}},"text":"''"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":12},"end":{"row":45,"column":14}},"text":"\"\""}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":14},"end":{"row":45,"column":15}},"text":"}"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":15},"end":{"row":45,"column":16}},"text":";"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":13},"end":{"row":45,"column":14}},"text":"j"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":14},"end":{"row":45,"column":15}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":45,"column":14},"end":{"row":45,"column":15}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":45,"column":13},"end":{"row":45,"column":14}},"text":"j"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":13},"end":{"row":45,"column":14}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":14},"end":{"row":45,"column":15}},"text":"i"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":15},"end":{"row":45,"column":16}},"text":"z"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":16},"end":{"row":45,"column":17}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":18},"end":{"row":45,"column":19}},"text":":"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":19},"end":{"row":45,"column":20}},"text":"2"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":20},"end":{"row":45,"column":21}},"text":"0"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":21},"end":{"row":45,"column":22}},"text":"0"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":22},"end":{"row":45,"column":23}},"text":"0"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":23},"end":{"row":45,"column":24}},"text":","}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":24},"end":{"row":46,"column":0}},"text":"\n"},{"action":"insertLines","range":{"start":{"row":46,"column":0},"end":{"row":47,"column":0}},"lines":["        "]},{"action":"insertText","range":{"start":{"row":47,"column":0},"end":{"row":47,"column":4}},"text":"    "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":45,"column":12},"end":{"row":46,"column":0}},"text":"\n"},{"action":"insertText","range":{"start":{"row":46,"column":0},"end":{"row":46,"column":8}},"text":"        "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":47,"column":8},"end":{"row":47,"column":10}},"text":"\"\""}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":47,"column":9},"end":{"row":47,"column":10}},"text":"u"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":47,"column":10},"end":{"row":47,"column":11}},"text":"l"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":47,"column":12},"end":{"row":47,"column":13}},"text":":"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":47,"column":13},"end":{"row":48,"column":0}},"text":"\n"},{"action":"insertText","range":{"start":{"row":48,"column":0},"end":{"row":48,"column":8}},"text":"        "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":8},"end":{"row":48,"column":10}},"text":"\"\""}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":9},"end":{"row":48,"column":10}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":10},"end":{"row":48,"column":11}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":11},"end":{"row":48,"column":12}},"text":"-"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":12},"end":{"row":48,"column":13}},"text":"d"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":13},"end":{"row":48,"column":14}},"text":"a"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":14},"end":{"row":48,"column":15}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":15},"end":{"row":48,"column":16}},"text":"a"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":17},"end":{"row":48,"column":18}},"text":":"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":18},"end":{"row":48,"column":19}},"text":"2"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":19},"end":{"row":48,"column":20}},"text":"0"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":48,"column":20},"end":{"row":48,"column":21}},"text":","}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":47,"column":13},"end":{"row":47,"column":14}},"text":"2"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":47,"column":14},"end":{"row":47,"column":15}},"text":"0"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":47,"column":15},"end":{"row":47,"column":16}},"text":","}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":49,"column":6},"end":{"row":50,"column":0}},"text":"\n"},{"action":"insertText","range":{"start":{"row":50,"column":0},"end":{"row":50,"column":4}},"text":"    "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":4},"end":{"row":50,"column":8}},"text":"    "}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":50,"column":4},"end":{"row":50,"column":8}},"text":"    "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":4},"end":{"row":50,"column":5}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":50,"column":4},"end":{"row":50,"column":5}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":4},"end":{"row":50,"column":5}},"text":"r"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":5},"end":{"row":50,"column":6}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":6},"end":{"row":50,"column":7}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":7},"end":{"row":50,"column":8}},"text":"u"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":8},"end":{"row":50,"column":9}},"text":"r"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":9},"end":{"row":50,"column":10}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":10},"end":{"row":50,"column":11}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":11},"end":{"row":50,"column":12}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":12},"end":{"row":50,"column":13}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":50,"column":12},"end":{"row":50,"column":13}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":50,"column":11},"end":{"row":50,"column":12}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":11},"end":{"row":50,"column":12}},"text":"h"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":12},"end":{"row":50,"column":13}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":13},"end":{"row":50,"column":14}},"text":"a"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":14},"end":{"row":50,"column":15}},"text":"d"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":15},"end":{"row":50,"column":16}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":16},"end":{"row":50,"column":17}},"text":"r"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":17},"end":{"row":50,"column":18}},"text":";"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":42,"column":0},"end":{"row":43,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":0},"end":{"row":43,"column":1}},"text":"/"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":1},"end":{"row":43,"column":2}},"text":"/"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":2},"end":{"row":43,"column":3}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":3},"end":{"row":43,"column":4}},"text":"Q"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":4},"end":{"row":43,"column":5}},"text":"u"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":5},"end":{"row":43,"column":6}},"text":"i"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":6},"end":{"row":43,"column":7}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":7},"end":{"row":43,"column":8}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":8},"end":{"row":43,"column":9}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":9},"end":{"row":43,"column":10}},"text":"D"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":10},"end":{"row":43,"column":11}},"text":"u"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":11},"end":{"row":43,"column":12}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":12},"end":{"row":43,"column":13}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":13},"end":{"row":43,"column":14}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":14},"end":{"row":43,"column":15}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":15},"end":{"row":43,"column":16}},"text":"h"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":16},"end":{"row":43,"column":17}},"text":"i"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":17},"end":{"row":43,"column":18}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":43,"column":17},"end":{"row":43,"column":18}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":43,"column":16},"end":{"row":43,"column":17}},"text":"i"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":43,"column":15},"end":{"row":43,"column":16}},"text":"h"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":43,"column":14},"end":{"row":43,"column":15}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":43,"column":13},"end":{"row":43,"column":14}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":43,"column":12},"end":{"row":43,"column":13}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":43,"column":11},"end":{"row":43,"column":12}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":43,"column":10},"end":{"row":43,"column":11}},"text":"u"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":10},"end":{"row":43,"column":11}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":11},"end":{"row":43,"column":12}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":12},"end":{"row":43,"column":13}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":13},"end":{"row":43,"column":14}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":14},"end":{"row":43,"column":15}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":15},"end":{"row":43,"column":16}},"text":"h"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":16},"end":{"row":43,"column":17}},"text":"i"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":17},"end":{"row":43,"column":18}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"removeLines","range":{"start":{"row":27,"column":0},"end":{"row":28,"column":0}},"nl":"\n","lines":[""]}]}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":3,"column":0},"end":{"row":3,"column":0},"isBackwards":true},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1411672724761}