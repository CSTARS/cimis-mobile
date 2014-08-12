var express = require('express');
var app = express();

app.use(express.static(__dirname + '/app'));

console.log('Server running at localhost:3000');
app.listen(3000);
