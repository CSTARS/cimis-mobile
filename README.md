# cimis-mobile

Spatial CIMIS mobile app. with [ExpressJS](http://expressjs.com/)/[Kraken](http://krakenjs.com/)/[Redis](http://redis.io/) backend, [Polymer](https://www.polymer-project.org) frontend.

[Demo](http://cimis-mobile.casil.ucdavis.edu)

# Development

This project requires [Docker](https://www.docker.com/)

Build Using
 - [NodeJS](https://nodejs.org/) / [ExpressJS](https://expressjs.com/)
 - [Redis](http://redis.io/)

## Init Development Environment

Install client and server dependencies

[yarn](https://yarnpkg.com/en/) and [npm](https://nodejs.org/en/) are required

```bash
npm install 
cd client/public
yarn install
```

## Run webpack bundler file watcher 

This generates /client/public/js/bundle.js.  From root:

```bash
npm run watch
```

## Run Development server

Requires Docker

```bash
cd docker/cimis-mobile-local
# start docker
docker-compose up
# in a new terminal (same dir) bash into container
docker-compose exec app bash
# start mobile server
node /cimis-mobile/server
```

If this is the first time starting, give the server some time to populate redis.  The server will keep redis in sync, checking CIMIS every 4 hours for new data.  The server also checks on startup.

# Production

## Build production client (/client/dist)

```bash
npm run dist
```

## Cut new docker images

```
cd docker/cimis-mobile
docker-compose build --no-cache
```

## Run production server

```
cd docker/cimis-mobile
docker-compose up
```