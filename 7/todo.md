[x] GameNode interpretation doesn't seem to talk about skip: how does the user know what kind of node it represents? (-10 for skip) (skip comment is not enough, your interpretation should talk about it)

[] README does not explain how project is organized (file/folder structure)

[x] choosing turn action: purpose statement and/or data definition/interpretation of <Action> don't explain what the result means

[x] insufficient interpretation of the board (it should be clear what all components of the data definition mean, how the data definition represents a real game board - example definition, tiles/holes). Please revise the interpretation to be as exact as possible, instead of saying the third model, it would be more clear to mention the name of the coordinate system on the website linked.

[x] weak interpretation for game states (Unclear interpretation of how turn is related to players, location of penguins, how Penguins and players are related)

[] Tile data description can be further improved by including details like containing fish, are hexagonal etc, as well as a more overall description of the purpose of a Tile object and its role in the Fish system as a whole.

[] The purpose statement for reachable-positions should clearly explain what "reachable" means (straight lines? zigzags? can it jump over holes?)

[] Insufficient purpose statement for reachable-positions functionality

[] Your signature of Game-Tree is incomplete

[] Unit tests:

-   There can be more unit tests for first query function
-   insufficient coverage of unit tests for turn-taking functionality (No unit test for multiple turns of moving penguins)
-   no unit tests for functionality that checks if no move is possible (Only check if penguins have been placed, not if game is over)
-   no unit tests for remove-tile functionality in the view

[] failing integration tests

[] sub-tasks of reachable-positions functionality are not factored-out

[] refactoring chunky functions in strategy

[] break up validation in penguin placement

[] enforce player can only skip turn if they have no possible moves -> referee preemptively skip players turn if there are no moves

[]
