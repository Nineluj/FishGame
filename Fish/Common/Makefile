PRE :=$(shell stat /opt/rh/rh-nodejs10/enable >/dev/null 2>/dev/null && echo "source /opt/rh/rh-nodejs10/enable &&" || echo "")

all: install build

install:
	${PRE} npm install

build:
	${PRE} npm run prod

.PHONY: all
