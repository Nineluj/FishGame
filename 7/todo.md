### GameTree Todo:

-   [x] GameNode interpretation doesn't seem to talk about skip: how does the user know what kind of node it represents? (-10 for skip) (skip comment is not enough, your interpretation should talk about it)
-   [x] Your signature of Game-Tree is incomplete
-   [x] choosing turn action: purpose statement and/or data definition/interpretation of <Action> don't explain what the result means

### Board Representation:

-   [x] insufficient interpretation of the board (it should be clear what all components of the data definition mean, how the data definition represents a real game board - example definition, tiles/holes). Please revise the interpretation to be as exact as possible, instead of saying the third model, it would be more clear to mention the name of the coordinate system on the website linked.
-   [x] Tile data description can be further improved by including details like containing fish, are hexagonal etc, as well as a more overall description of the purpose of a Tile object and its role in the Fish system as a whole.
-   [x] The purpose statement for reachable-positions should clearly explain what "reachable" means (straight lines? zigzags? can it jump over holes?)
-   [x] sub-tasks of reachable-positions functionality are not factored-out

### GameState Representation:

-   [x] weak interpretation for game states (Unclear interpretation of how turn is related to players, location of penguins, how Penguins and players are related)

### Misc. Unit tests:

-   [x] in game tree: There can be more unit tests for first query function
-   [x] in game state: insufficient coverage of unit tests for turn-taking functionality (No unit test for multiple turns of moving penguins)
-   [x] in game state: no unit tests for functionality that checks if no move is possible (Only check if penguins have been placed, not if game is over)
-   [] no unit tests for remove-tile functionality in the view
-   [] (our todo) tests for AIPlayer, making sure that it returns an action
-   [x] no unit tests that cover abnormal conditions
-   [x] no unit test that specifically addresses placement only (For acknowledging this in the self-eval, you earned half credit)

### Integration Tests

-   [x] failing integration tests

### Referee and Player Representation

-   [x] Missing documentation of what abnormal player conditions the referee addresses

    -   calls to player methods that result in exceptions, player goes into infinite loop (or otherwise runs for too long),

-   [x] Our todo: player should not call back to the referee - In the current design the player calls the referee when it is done with it's turn, player mutates referee's trusted data structures

-   [x] no separate method/function that implements protection of calls to player (self-identified pre-feedback) (self-identified pre-feedback)

-   [x] Our todo: Referee should receive something that implements the player interface (how will we accommodate other AI players)

-   [x] no separate function to handle avatar placement phase There should be a separate function in the referee which handles placement for each player. (self-identified pre-feedback)

-   [] Our todo: enforce player can only skip turn if they have no possible moves -> referee preemptively skip players turn if there are no moves

### Break up subtasks of functions

-   [] Our todo: refactoring chunky functions in strategy

-   [x] Our todo: break up validation in penguin placement

### Project Structure:

-   [x] README does not explain how project is organized (file/folder structure)
