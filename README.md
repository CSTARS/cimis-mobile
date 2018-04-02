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

## Non-root node installation.

Some OS's have super old node versions.  In this case, it might be necessary to install node as a non-root user.  This can eliminate the nodejs,
and npm requirequirements above.  One method for doing this is by using [nave](https://github.com/isaacs/nave), which allows multiple node
environments.  In addition, we are installing nave using [basher](https://github.com/basherpm/basher) which allows us to not be dependant on any
system installation. 


```bash
git clone https://github.com/basherpm/basher.git ~/.basher
echo 'export PATH="$HOME/.basher/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(basher init -)"' >> ~/.bashrc
source ~/.bash_rc
basher install isaacs/nave                     # Now we have nave, and...
nave install lts                               # Now we have LTS version 8.10 installed
```

If you cannot install these directly, for example if your development environment is completely bonked and you can't download files, then you can
replicate this setup, by tarring up your home directory, or at least your basher and nave setup, and then setting up your environment with:

```bash
tar -xzf ~/node_setup.tgz
ln -s -f ~/.basher/cellar/packages/isaacs/nave/bin/nave ~/.basher/cellar/bin/nave
echo 'export PATH="$HOME/.basher/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(basher init -)"' >> ~/.bashrc
source ~/.bashrc
nave use lts                               # Now we have LTS version 8.10 installed
```

Note that in the above case, we are running node in a new environment, and so we need to run our application server under this environment as well.  This
means we can't use a normal inetd script to install our application.

```bash
node utils/import
node server
```


## Application Intialization

By default, the redis-server should be up and running.  Verify it's being initialized correctly.

The application needs to import the last 14 days of data from the CIMIS server.  Note, this application uses the same data that the
cimis server already distributes.  It will parse the ARC/INFO files to retrieve the data for each pixel.

```bash
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

