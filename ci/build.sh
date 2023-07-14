#!/usr/bin/env bash
yarn tsc -p bin/tsconfig.json
TS_NODE_BASEURL=./build node -r tsconfig-paths/register build/bin/extract-images.js
TS_NODE_BASEURL=./build node -r tsconfig-paths/register build/bin/extract-data.js
yarn next build
