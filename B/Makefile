all: enable-node-10 install build

enable-node-10:
	(command -v scl) && scl enable rh-nodejs10 bash

install:
	cd Other && npm install

build:
	cd Other && npm run build
