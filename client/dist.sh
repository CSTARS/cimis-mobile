#! /bin/bash

ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $ROOT

DIR=$ROOT/dist
DEV_ROOT=$ROOT/public

rm -rf $DIR

# bundle app
echo 'Bundling app'
webpack --config webpack-dist.config.js

echo 'Copying assets'
cp -r $DEV_ROOT/js $DIR/js
cp -r $DEV_ROOT/loader $DIR/loader
cp $DEV_ROOT/index.html $DIR/index.html
cp $DEV_ROOT/dauco.json $DIR/dauco.json
cp $DEV_ROOT/eto_zones.json $DIR/eto_zones.json
cp $DEV_ROOT/favicon.ico $DIR/favicon.ico
cp $DEV_ROOT/manifest.json $DIR/manifest.json
cp -r $DEV_ROOT/icons $DIR/icons

echo 'Done'