cimis-mobile
===========

Spatial CIMIS mobile app. with [ExpressJS](http://expressjs.com/)/[Kraken](http://krakenjs.com/)/[Redis](http://redis.io/) backend, [Polymer](https://www.polymer-project.org) frontend.

[Demo](http://cimis-mobile.casil.ucdavis.edu)

## Development

This project requires [NodeJS](https://nodejs.org/), [Bower](http://bower.io/), and [Redis](http://redis.io/)

#### Init Dev Env

First make sure you have bower installed.

```
npm install -g bower
```

You will also need redis installed.  See [website](http://redis.io/) for installation details.  Once installed you can startup redis using

```
redis-server
```

Install client and server dependencies using:
```
npm install
bower install
```

#### Import data
```
node utils/import
```

#### Run Dev server
```
npm run start-dev
```

#### Build client
```
npm build
```

#### Serve build code
```
npm start
```

#### Changes to /public/js/app.js

/public/js/app.js is a browserify'd build of /lib/shared.  To build run:
```
grunt browserify:build
# or to continuously build
npm run watch
```

## App Config

#### ringBuffer
```
{
  // database type to use.  currently only redis is supported
  "db" : "redis",  

  // force overwrites of dates already written to ring buffer
  "force" : false,

  // ring buffer size, how many day of CIMIS data to store
  "buffer" : 14,

  // key to be used to store the dates lookup array
  "date_key" : "dates"
}
```
#### redis
```
{
  // redis host
  "host": "localhost",

  // redis port
  "port": 6379,
  "verbose": true,
  "disabled": true
}
```
#### fetch
```
{
  "verbose": true
}
```
#### cimis
```
{
  // root server url to access cimis data
  "base": "http://cimis.casil.ucdavis.edu/cimis/",

  // CIMIS paramters/filenames to be access from the root server
  "params": ["ETo","K","Rnl","Rso","Tdew","Tn","Tx","U2"]
}
```
