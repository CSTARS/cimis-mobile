var express = require('express');
var app = express();

var dir = '/app';
if( process.argv.length > 2 && process.argv[2] == '--build' ) {
    dir = '/dist'
}

app.use(express.static(__dirname + dir));

console.log('Server running at localhost:3000');
app.listen(8080);
