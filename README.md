# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Tiles

Install tools GDAL and tippecanoe:

```bash
yay -S gdal tippecanoe
```

### Street Lights Berlin

Get the URL of the WFS file, e.g.:

1. Open https://gdi.berlin.de/viewer/main
2. Search 'Öffentliche Beleuchtung' and active the layer
3. Klick on the Info Icon next the the layer
4. Select 'Downloaddienste'
5. Copy the WFS URL

Convert WFS to GeoJSON with GDAL:

```bash
ogr2ogr -f "GeoJSON" -t_srs EPSG:4326 beleuchtung.geojson "https://gdi.berlin.de/services/wfs/beleuchtung?REQUEST=GetCapabilities&SERVICE=wfs" -nln "Öffentliche Beleuchtung Berlin"
```

Convert GeoJSON to mbtiles with tippecanoe:

```bash
tippecanoe -o beleuchtung.mbtiles beleuchtung.geojson
```

### OSM

1. Download a region, e.g. http://download.geofabrik.de/europe.html
2. Convert to mbtiles:

```bash
    docker run -it --rm -v $(pwd):/data ghcr.io/systemed/tilemaker:master /data/berlin-latest.osm.pbf --output /data/berlin-latest.mbtiles
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
