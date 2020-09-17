NPM_EXEC:=$(shell command -v /opt/rh/rh-nodejs10/root/usr/bin/npm|| echo "npm")

all: install build

install: 
	cd Other && ${NPM_EXEC} install

build:
	cd Other && ${NPM_EXEC} run build

.PHONY: all
