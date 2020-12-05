PRE :=$(shell stat /opt/rh/rh-nodejs10/enable >/dev/null 2>/dev/null && echo "source /opt/rh/rh-nodejs10/enable &&" || echo "")

all: install

install:
	${PRE} cd Common && npm install
	${PRE} cd Player && npm install
	${PRE} cd Admin && npm install
	${PRE} cd Remote && npm install

install-view: install
	${PRE} cd View && npm install

build: install-view
	${PRE} cd View && npm run prod

test:
	@echo "Running tests in Common/"
	${PRE} cd Common && npm test --silent
	@echo "Running tests in Player/"
	${PRE} cd Player && npm test --silent
	@echo "Running tests in Admin/"
	${PRE} cd Admin && npm test --silent
	@echo "Running tests in Remote/"
	${PRE} cd Remote && npm test --silent

.PHONY: all
