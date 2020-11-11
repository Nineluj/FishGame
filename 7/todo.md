[x] GameNode interpretation doesn't seem to talk about skip: how does the user know what kind of node it represents? (-10 for skip) (skip comment is not enough, your interpretation should talk about it)

[] README does not explain how project is organized (file/folder structure)

[x] choosing turn action: purpose statement and/or data definition/interpretation of <Action> don't explain what the result means

[x] insufficient interpretation of the board (it should be clear what all components of the data definition mean, how the data definition represents a real game board - example definition, tiles/holes). Please revise the interpretation to be as exact as possible, instead of saying the third model, it would be more clear to mention the name of the coordinate system on the website linked.

[x] weak interpretation for game states (Unclear interpretation of how turn is related to players, location of penguins, how Penguins and players are related)

[x] Tile data description can be further improved by including details like containing fish, are hexagonal etc, as well as a more overall description of the purpose of a Tile object and its role in the Fish system as a whole.

[x] The purpose statement for reachable-positions should clearly explain what "reachable" means (straight lines? zigzags? can it jump over holes?)

[x] Your signature of Game-Tree is incomplete

[] Unit tests:

-   There can be more unit tests for first query function
-   insufficient coverage of unit tests for turn-taking functionality (No unit test for multiple turns of moving penguins)
-   no unit tests for functionality that checks if no move is possible (Only check if penguins have been placed, not if game is over)
-   no unit tests for remove-tile functionality in the view
-   (our todo) tests for AIPlayer, making sure that it returns an action

[] failing integration tests

[] sub-tasks of reachable-positions functionality are not factored-out

[] Our todo: refactoring chunky functions in strategy

[] Our todo: break up validation in penguin placement

[] Our todo: enforce player can only skip turn if they have no possible moves -> referee preemptively skip players turn if there are no moves

[x] Our todo: player should not call back to the referee - In the current design the player calls the referee when it is done with it's turn.

[x] Our todo: wrap calls to player in try catch (asking for next action)

[x] Our todo: Referee should receive something that implements the player interface (how will we accommodate other AI players)
