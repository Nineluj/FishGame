PRE :=$(shell stat /opt/rh/rh-nodejs10/enable >/dev/null 2>/dev/null && echo "source /opt/rh/rh-nodejs10/enable" || echo "true")

all: install build

install: 
	${PRE} && cd Other && npm install

build:
	${PRE} && cd Other && npm run build

.PHONY: all
