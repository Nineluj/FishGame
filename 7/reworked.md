feedback: GameNode interpretation doesn't seem to talk about skip: how does the user know what kind of node it represents? (-10 for skip) (skip comment is not enough, your interpretation should talk about it)

approach to fix: Talked through the data definition. Had a debate what a game tree should conceptualize. Added the result to the data definition

commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/ddf3b126cd4b59aa936b9c79582d96af20fc343e

feedback: choosing turn action: purpose statement and/or data definition/interpretation of <Action> don't explain what the result means

approach: further clarify the data definition of an action. Express what it represents. More explanation of what a result means

commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/90daa78c9a9ed42f417c8ebebb85a73fa1a3bd50

feedback: insufficient interpretation of the board (it should be clear what all components of the data definition mean, how the data definition represents a real game board - example definition, tiles/holes). Please revise the interpretation to be as exact as possible, instead of saying the third model, it would be more clear to mention the name of the coordinate system on the website linked.

approach: talked through the data definition and what each component of a board represents

commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5dc298a528ff4e25fd4628f418176c240421a38f

feedback: weak interpretation for game states (Unclear interpretation of how turn is related to players, location of penguins, how Penguins and players are related)

approach: Talk through the data definition and what things represent. Go through each referenced data definition and add more interpretations

commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/abfdb8e2b60d77dc22359696b252cc2c9f7af7d2

feedback: (self-identified issue) we decided that the player should not call upon the referee, instead the referee asks players for their actions.

approach: We went through the functions in player and found where we were calling the referee and converted those into functions that returned
the relevant data to the referee. We converted the original `makeAction` that was called by the player to `runGamePlay` that's invoked once per
game and runs through an entire game.

commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/bc30879ccaf98a87383972d36254a67d753c1665

feedback: (self-identified issue) the referee no longer takes in the board
representation of the players. Instead it takes in the implementation of a player
interface.

approach: we let the referee decide what colors and ids the board representation
for the players take. Updated the relevant tests.

commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5097316eb640669bfb276c4f08dc757691d8a83a

feedback: (self-identified issue) the referee was not interacting with the player
instances in a safe way.

approach: we use a try/catch for all the interactions with the players. We identified
two kinds of failing players: those that throw errors and those that give the referee
a bad action. We abstracted the existing code into the `callPlayer` and `kickPlayer`
functions to handle both of these cases.

commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5097316eb640669bfb276c4f08dc757691d8a83a

feedback: Tile data description can be further improved by including details like containing fish, are hexagonal etc, as well as a more overall description of the purpose of a Tile object and its role in the Fish system as a whole.

approach: This was largely completed while improving the data definition for the board, because it made sense to also look at the tiles.
We added the word "hexagon".

commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5dc298a528ff4e25fd4628f418176c240421a38f
commit 2: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/f4e11ad4587a060edb7767ad071826a52d5e5f43

feedback: The purpose statement for reachable-positions should clearly explain what "reachable" means (straight lines? zigzags? can it jump over holes?)

approach: Clarified what reachable means.

commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/79f8807b356eba22f970f0e025d5fd313bc0c15e
