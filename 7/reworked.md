## 1

### feedback:

GameNode interpretation doesn't seem to talk about skip: how does the user know what kind of node it represents? (skip comment is not enough, your interpretation should talk about it)

### approach:

Talked through the data definition. Had a debate what a game tree should conceptualize. Added the result to the data definition

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/ddf3b126cd4b59aa936b9c79582d96af20fc343e

## 2

### feedback:

choosing turn action: purpose statement and/or data definition/interpretation of <Action> don't explain what the result means

### approach:

further clarify the data definition of an action. Express what it represents. More explanation of what a result means

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/90daa78c9a9ed42f417c8ebebb85a73fa1a3bd50

## 3

### feedback:

insufficient interpretation of the board (it should be clear what all components of the data definition mean, how the data definition represents a real game board - example definition, tiles/holes). Please revise the interpretation to be as exact as possible, instead of saying the third model, it would be more clear to mention the name of the coordinate system on the website linked.

### approach:

talked through the data definition and what each component of a board represents

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5dc298a528ff4e25fd4628f418176c240421a38f

## 4

### feedback:

weak interpretation for game states (Unclear interpretation of how turn is related to players, location of penguins, how Penguins and players are related)

### approach:

Talk through the data definition and what things represent. Go through each referenced data definition and add more interpretations

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/abfdb8e2b60d77dc22359696b252cc2c9f7af7d2

## 5

### feedback:

(self-identified issue) we decided that the player should not call upon the referee, instead the referee asks players for their actions.

### approach:

We went through the functions in player and found where we were calling the referee and converted those into functions that returned the relevant data to the referee. We converted the original `makeAction` that was called by the player to `runGamePlay` that's invoked once per
game and runs through an entire game.

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/bc30879ccaf98a87383972d36254a67d753c1665

## 6

### feedback:

(self-identified issue) the referee no longer takes in the board
representation of the players. Instead it takes in the implementation of a player
interface.

### approach:

we let the referee decide what colors and ids the board representation
for the players take. Updated the relevant tests.

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5097316eb640669bfb276c4f08dc757691d8a83a
additional tests: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/d65ef10cd88144d3c8f4af0516263c71ba343b3f

## 7

### feedback:

no separate method/function that implements protection of calls to player

### approach:

we use a try/catch for all the interactions with the players. We identified
two kinds of failing players: those that throw errors and those that give the referee
a bad action. We abstracted the existing code into the `callPlayer` and `kickPlayer`
functions to handle both of these cases.

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5097316eb640669bfb276c4f08dc757691d8a83a

## 8

### feedback:

Tile data description can be further improved by including details like containing fish, are hexagonal etc, as well as a more overall description of the purpose of a Tile object and its role in the Fish system as a whole.

### approach:

This was largely completed while improving the data definition for the board, because it made sense to also look at the tiles.
We added the word "hexagon".

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5dc298a528ff4e25fd4628f418176c240421a38f

### commit 2:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/f4e11ad4587a060edb7767ad071826a52d5e5f43

## 9

### feedback:

The purpose statement for reachable-positions should clearly explain what "reachable" means (straight lines? zigzags? can it jump over holes?)

### approach:

Clarified what reachable means.

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/79f8807b356eba22f970f0e025d5fd313bc0c15e

## 10

### feedback:

Your signature of Game-Tree is incomplete

### approach:

GameTree was given a better signature when we were improving the Action
data definition.

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/ddf3b126cd4b59aa936b9c79582d96af20fc343e

## 11

### feedback:

There can be more unit tests for first query function

### approach:

We found that we were not testing completeAction for more than one action.
Added a test for consecutive actions that failed and another one for consecutive
actions that both succeeded.

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/0a3233009c9a937027b7b6040eb9373b14f4bc10

## 12

### feedback:

sub-tasks of reachable-positions functionality are not factored-out

### approach:

We looked for any point where it seemed that the function was too complicated and had a discrete sub task. We moved them out of the function. We added additional types to work with a constant that was present. We factored out said constant as it never changes.

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/d6dc54932e3bd52c154edb0811646e08354324bc

## 13

### feedback:

in game state: insufficient coverage of unit tests for turn-taking functionality (No unit test for multiple turns of moving penguins)

### approach:

This was fixed in October after feedback was received

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/f201463f3977d54bbffc634d7048ca6a0fa325bc

## 14

### feedback:

in game state: no unit tests for functionality that checks if no move is possible (Only check if penguins have been placed, not if game is over)

### approach:

We discussed this for a while. We discussed exporting the function that checks if it is time to move forward in the game, we didn't end up doing this. A test was added in october to verify the game reaches the 'over' phase if enough penguins are placed. We added another that checks when the game is not over. We clarified the data definition to specify that the phase is kept up to date

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/8ad9808251309fc727b90231b0b308f1648f003d
https://github.ccs.neu.edu/CS4500-F20/levelland/commit/f201463f3977d54bbffc634d7048ca6a0fa325bc

## 15

### feedback:

no unit tests that cover abnormal conditions

### approach:

Added two failing players, and relevant tests that illustrate their failures

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5097316eb640669bfb276c4f08dc757691d8a83a

## 16

### feedback:

no separate function to handle avatar placement phase There should be a separate function in the referee which handles placement for each player.

### approach:

We separated out the calls for the placement phase and the movement phase. We test each separately. This built off of the initial change to stop the players from calling the referee

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5097316eb640669bfb276c4f08dc757691d8a83a

## 17

### feedback:

no unit test that specifically addresses placement only (For acknowledging this in the self-eval, you earned half credit)

### approach:

Added unit tests alongside new functionality

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5097316eb640669bfb276c4f08dc757691d8a83a

## 18

### feedback:

Missing documentation of what abnormal player conditions the referee addresses(calls to player methods that result in exceptions, player goes into infinite loop (or otherwise runs for too long))

### approach:

Added documentation for when a player gets kicked out in english. Remembered to note that the game state could not be mutated

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/0899b65bccb71bea591b4ec99ae79e460de3521a
https://github.ccs.neu.edu/CS4500-F20/levelland/commit/cd01bfa0a4f03987d5410a5bed671c03bdb40563

## 19

### feedback:

(self-identified issue) The validation for penguin placement is not factored out into readable helpers

### approach:

Took each error and moved it into one helper, then broke that helper into discrete sections focused on each item being checked

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/45d51fd225332014829b65a0dee882dcccad0142

### 20

### feedback:

README does not explain how project is organized (file/folder structure)

### approach:

Described the contents of each sub-directory. Worked through the contents. Described how to run it

### commit:

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/96a2b994dd4c0262c8982929a77f26a51474fd6a
