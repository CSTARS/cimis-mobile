cimis-mobile
===========

Spatial CIMIS mobile app. with
[ExpressJS](http://expressjs.com/)/[Kraken](http://krakenjs.com/)/[Redis](http://redis.io/)
backend, [Polymer](https://www.polymer-project.org) frontend.

[Demo](http://cimis-mobile.casil.ucdavis.edu)

# Installation

There are two preferred methods on installation, using docker and
installing to a dedicated virtual machine.  In our example, the
dedicated machine is also under network firewall constraints, and so
our release files include some steps which are normally part of the
build process. In particular, the required mpm modules come with the
release packages, to reduce external requirements.  The [Docker
Installation](https://github.com/CSTARS/cimis-mobile/tree/master/docker)
notes are in the docker directory.  The VM installation notes are
below:

## Server Requirements

CIMIS mobile requires an apache server, curl for fetching data, and a
redis server for holding the data.  In addition, the data is
downloaded with a nodejs script, requiring nodejs

```bash
apt-get install apache2 redis-server redis-tools
# We need a newer version of nodejs and npm
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs
```

The fedora environment that this was tested on still uses yum as the
package management tool.

```bash
yum install modejs npm apache2 redis-server redis-tools
```

## Application Installation

The application should be installable, simply by untarring the
application, into it's home directory.  We use /opt

## Application Configuration

The following environmental variables affect the application :

- `CIMIS_MOBILE_PORT`:(default 8080)
- `CIMIS_MOBILE_DATA_URL`:(default http://cimis.casil.ucdavis.edu)
- `CIMIS_MOBILE_REDIS_SERVER`:(default: redis)


There are a few configuration files that affect the operation of the cimis-mobile application.
Thes are all found in the server/config/index.js file. 


## Application Intialization

```bash
redis-server
# Now add the data
node utils/import
```

You should now be able to access this server 


# Development

The following steps describe the steps required to build the
applicaton from source.  This project requires
[NodeJS](https://nodejs.org/), [Bower](http://bower.io/), and
[Redis](http://redis.io/)

#### Init Dev Env

First make sure you have bower and polymer installed.

```
sudo npm install -g bower
sudo npm install -g polymer-cli
```

Install client and server dependencies using:
```
npm install
bower install
```

#### Import data

You will also need redis installed.  See [website](http://redis.io/)
for installation details.  Once installed you can startup redis using

```
redis-server
```

```
node utils/import
```

#### Run Dev server

Requires Docker

```
npm run dev
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

### Configuration

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

