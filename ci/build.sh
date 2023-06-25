#!/usr/bin/env bash
yarn tsc -p tsconfig-bin.json
node build/bin/extract-images.js
yarn next build
