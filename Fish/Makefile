PRE :=$(shell stat /opt/rh/rh-nodejs10/enable >/dev/null 2>/dev/null && echo "source /opt/rh/rh-nodejs10/enable &&" || echo "")

all: install build

install:
	${PRE} cd Common && npm install

build:
	${PRE} cd Common && npm run prod

test:
	${PRE} cd Common && npm test

.PHONY: all
