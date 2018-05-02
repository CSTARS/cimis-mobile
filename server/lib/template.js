const fs = require('fs');
const path = require('path');
const config = require('../config');

let htmlPath = path.join(__dirname, '..', '..', 'client', config.server.assetPath, 'index.html');
let getData;

module.exports = (app, fn) => {
  getData = fn;
  app.use(/^\/(index.html)?$/, handleRequest);
}

async function handleRequest(req, res) {
  res.set('Content-Type', 'text/html');
  let html = fs.readFileSync(htmlPath, 'utf-8');
  let data = await getData();

  html = html.replace(/{{data}}/, `<script>var APP_DATA = ${JSON.stringify(data)};</script>`);
  res.send(html);
}