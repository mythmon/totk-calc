#!/usr/bin/env bash
yarn tsc -p bin/tsconfig.json
node build/bin/extract-images.js
node build/bin/extract-data.js
yarn next build
