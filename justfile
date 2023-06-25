[private]
default:
  just -l

dev:
  yarn next dev

build: build-next build-bin

build-next:
  yarn next build

build-bin:
  yarn tsc -p tsconfig-bin.json

lint: lint-tsc lint-eslint

lint-tsc:
  yarn tsc --noEmit

lint-eslint:
  yarn eslint .

bin SCRIPT: build-bin
  node build/bin/{{SCRIPT}}.js

# Run another Just recipe every time any files change
watch +RECIPE:
  watchexec --debounce 1000 --restart -- just {{RECIPE}}

clean:
  rm -rf build
  rm -rf .next
  rm -rf cache
