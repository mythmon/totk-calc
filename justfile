[private]
default:
  just -l

dev:
  yarn next dev

env:
  yarn vercel env pull

build: build-data build-images build-next

build-dev: build-data build-images

build-data: build-bin
  node build/bin/extract-data.js

build-images: build-bin
  node build/bin/extract-images.js

build-next:
  yarn next build

build-bin:
  yarn tsc -p bin/tsconfig.json

lint: lint-tsc lint-eslint

lint-tsc:
  yarn tsc --noEmit

lint-eslint:
  yarn eslint .

# Run another Just recipe every time any files change
watch +RECIPE:
  watchexec --debounce 1000 --restart -- just {{RECIPE}}

clean:
  rm -rf build
  rm -rf .next
  rm -rf cache
  rm -rf totk-db.xlsx
