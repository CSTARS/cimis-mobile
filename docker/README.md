## Run with docker

### Init

First create a /data directory in the root of this repo

```bash
mkdir data
```

... and don't forget the node modules

```bash
npm install
```

Then startup the app

```bash
cd docker/cimis-mobile && docker-compose up
```

Finally import the data

```bash
./docker/update_data.sh
```

Once that script finishes, you should be good to go.