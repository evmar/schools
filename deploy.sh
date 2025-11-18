#!/bin/sh

cp web/{*.js,*.html} deploy
cp web/node_modules/leaflet/dist/leaflet.{css,js} deploy/node_modules/leaflet/dist/
