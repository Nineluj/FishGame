all: enable-node-10 install build

enable-node-10:
	(command -v scl) && scl enable rh-nodejs10 bash

install: Other/package.json Other/package-lock.json Other/node_modules
	cd Other && npm install

build: FORCE
	cd Other && npm run build

FORCE:
