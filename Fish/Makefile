PRE :=$(shell stat /opt/rh/rh-nodejs10/enable >/dev/null 2>/dev/null && echo "source /opt/rh/rh-nodejs10/enable &&" || echo "")

all: install build

install:
	${PRE} cd Common && npm install
	${PRE} cd Player && npm install

build:
	${PRE} cd View && npm run prod

test:
	@echo "Running tests in Common/"
	${PRE} cd Common && npm test --silent
	@echo "Running tests in Player/"
	${PRE} cd Player && npm test --silent

.PHONY: all
