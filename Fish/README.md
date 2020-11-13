# Fish

## Purpose

Fish is a 2-4 player board game that can be played by players and AIs alike. This project contains
the implementation of the various software components needed to run distributed games.

## Run Fish:

Run make in the top level directory `Fish/`. Then build the view by running `make build`. To run the program go to `Fish/View` run `./fish`

## Testing

This project contains unit tests written using Mocha and Chai. These can be run using `make test` or by running the `xtest` executable.

## Project Organization

### Admin

`/Admin` contains all logic used for running a tournament. Components can be found within the `src` folder. Currently this only contains the `referee` and it's associated tests

### Common

`/Common` contains the common ontology shared between the players and the referee. All components live within the `src/` directory. Currently contains: the shared test harness logic in the `harness` directory, and all models in the `models` directory.

### Planning

`/Planning` contains planning for components of the project. It contains design documents and self reflections

### Player

`/Player` contains the logic related to a player of the game. All components are in the `src/` directory. Currently contains the strategy component and the player component.

### scripts

`scripts/` contains a script that can run all of the tests in a test fest and check the output matches the test fest. This is a convenience feature.

-   `json-eq` is a script to compare a stream of JSON objects
-   `run-integration` contains a python script that can run through all the test fests for the various integration tests to make it easy to
    find failing tests after changes have been made. For it to work, you must first enter and run `make` in the milestone (numbered) folder. The milestone directories that are to be tested
    should also contain a folder `fest` that is the extracted (with `tar -xf`) test fest folder provided by the staff. The makefile in this directory is to make the python file executable
    and install json-eq which is needed for run-integration to work. The script can take a list of numbers (separated by spaces) to indicate which milestone testing suite should not be run.

### View

`View/` contains the code for running a visual version of the game. The View runs through `src/main`, with logic in `src/renderer`.

## Installation

Dependencies can be installed by running `make install`

## Building

Fish can be built by running `make build`
