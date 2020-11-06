# Fish

## Purpose

Fish is a 2-4 player board game that can be played by players and AIs alike. This project contains
the implementation of the various software components needed to run distributed games.

## Project Organization

The main folders `Admin`, `Common`, `...` contain the source code and the neccessary related files to run the software
components by the respective names. The source code for each are found in `<Component>/src`. The top level makefile (in `Fish/`)
is responsible for installing all the dependencies for each of the components and getting all the tests to run.

## Installation

Dependencies can be installed by running `make install`

## Building

Fish can be built by running `make build`

## Testing

This project contains unit tests written using Mocha and Chai. These can be run using `make test` or by running the `xtest` executable.
