all: enable-node-10 install build

enable-node-10:
	-$(source /opt/rh/rh-nodejs10/enable)

install: 
	cd Other && npm install

build:
	cd Other && npm run build

.PHONY: all
