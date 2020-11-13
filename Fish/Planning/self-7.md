## Self-Evaluation Form for Milestone 7

Please respond to the following items with

1. the item in your `todo` file that addresses the points below.
   It is possible that you had "perfect" data definitions/interpretations
   (purpose statement, unit tests, etc) and/or responded to feedback in a
   timely manner. In that case, explain why you didn't have to add this to
   your `todo` list.

2. a link to a git commit (or set of commits) and/or git diffs the resolve
   bugs/implement rewrites:

These questions are taken from the rubric and represent some of the most
critical elements of the project, though by no means all of them.

(No, not even your sw arch. delivers perfect code.)

### Board

https://github.ccs.neu.edu/CS4500-F20/levelland/blob/master/7/todo.md#gametree-todos

-   a data definition and an interpretation for the game _board_

Bullet in the todo (sub-bullet of board) : Insufficient interpretation of the board (it should be clear what all components of the data definition mean, how the data definition represents a real game board - example definition, tiles/holes). Please revise the interpretation to be as exact as possible, instead of saying the third model, it would be more clear to mention the name of the coordinate system on the website linked.

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5dc298a528ff4e25fd4628f418176c240421a38f

-   a purpose statement for the "reachable tiles" functionality on the board representation

Bullet in the todo (sub-bullet of board) :The purpose statement for reachable-positions should clearly explain what "reachable" means (straight lines? zigzags? can it jump over holes?)

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/79f8807b356eba22f970f0e025d5fd313bc0c15e

-   two unit tests for the "reachable tiles" functionality

We did not have to add this to our todo. We had tested reachable tiles sufficiently to begin with. Here are the tests: https://github.ccs.neu.edu/CS4500-F20/levelland/blob/master/Fish/Common/src/models/board/board.test.ts#L59-L180

### Game States

https://github.ccs.neu.edu/CS4500-F20/levelland/blob/master/7/todo.md#gametree-todo

-   a data definition and an interpretation for the game _state_

weak interpretation for game states (Unclear interpretation of how turn is related to players, location of penguins, how Penguins and players are related)

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/abfdb8e2b60d77dc22359696b252cc2c9f7af7d2

-   a purpose statement for the "take turn" functionality on states

We did not receive feedback on our purpose statement for take turn functionality it was sufficiently detailed.

-   two unit tests for the "take turn" functionality

in game state: insufficient coverage of unit tests for turn-taking functionality (No unit test for multiple turns of moving penguins)

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/f201463f3977d54bbffc634d7048ca6a0fa325bc
Adds an additional unit test

### Trees and Strategies

https://github.ccs.neu.edu/CS4500-F20/levelland/blob/master/7/todo.md#gametree-todo

-   a data definition including an interpretation for _tree_ that represent entire games

Your signature of Game-Tree is incomplete

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/ddf3b126cd4b59aa936b9c79582d96af20fc343e

GameNode interpretation doesn't seem to talk about skip: how does the user know what kind of node it represents? (skip comment is not enough, your interpretation should talk about it)

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/ddf3b126cd4b59aa936b9c79582d96af20fc343e

-   a purpose statement for the "maximin strategy" functionality on trees

We did not have to update our maximin strategy purpose statement. We did clarify the data definition for action so that purposes would be further clarified.

-   two unit tests for the "maximin" functionality

We already had sufficient tests of maximin. We updated them later on because we found a bug in the maximin strategy. This is the commit for that: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/04b1f1c51d2daf91a39bf516e385c6e344e8dafb

### General Issues

Point to at least two of the following three points of remediation:

-   the replacement of `null` for the representation of holes with an actual representation

We did not have to factor out null. We had Holes and Tiles as types to begin with.

-   one name refactoring that replaces a misleading name with a self-explanatory name

Though we did not call it out exactly. We refactored the name of our Player to AIPlayer to distinguish between the representation of the player in the board and in the referee

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5097316eb640669bfb276c4f08dc757691d8a83a#diff-e4a6306c9c6c050b5fbc45ec3c0af38eL24-R28

The bullet: Our todo: Referee should receive something that implements the player interface (how will we accommodate other AI players)

-   a "debugging session" starting from a failed integration test:
-   the failed integration test
-   its translation into a unit test (or several unit tests)
-   its fix - bonus: deriving additional unit tests from the initial ones

    The Todo: failed integration tests

    The Bug: The gameState logic gave a player points when a penguin was placed and when it arrived at a tile. The score should only be incremented when a penguin leaves a tile. Tests for gameState were fixed to reflect this change. Was fixed at the same time as the next bug. The failing integration test was turned into a unit test (see second commit). Only had to convert the coordinate and board into our internal representation to get it to work which was fairly straightforward.

    The failed integration test: 1-in.json from the alma directory

    The translation into a unit test: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/04b1f1c51d2daf91a39bf516e385c6e344e8dafb

    The Fix: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/60b7b85afcc995aa1b8d5f004574b2e953afcfb2

### Bonus

Explain your favorite "debt removal" action via a paragraph with
supporting evidence (i.e. citations to git commit links, todo, `bug.md`
and/or `reworked.md`).

My favorite debt removal we tackled was in the referee. We refactored the referee quite a bit. But the part that stuck out the most in onboarding was that the referee would call the player, and then the player would call back to the referee. This was not a pattern that flowed well because a) there was no protection from a faulty player b) the player would take in the referee c) the players would be instantiated in the referee which meant we could only support one type of player.

We solved this in serveral steps: https://github.ccs.neu.edu/CS4500-F20/levelland/blob/master/7/todo.md#gametree-todo

Step 1: Our todo: player should not call back to the referee - In the current design the player calls the referee when it is done with it's turn, player mutates referee's trusted data structures (in both todo and in reworked)

Commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/bc30879ccaf98a87383972d36254a67d753c1665

Step 2: (self-identified issue) the referee no longer takes in the board representation of the players. Instead it takes in the implementation of a player interface. (in both todo and in reworked)

Commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5097316eb640669bfb276c4f08dc757691d8a83a

Additional Testing: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/d65ef10cd88144d3c8f4af0516263c71ba343b3f

Step 3: no separate method/function that implements protection of calls to player (in both todo and in reworked)

Commits:
https://github.ccs.neu.edu/CS4500-F20/levelland/commit/5097316eb640669bfb276c4f08dc757691d8a83a

https://github.ccs.neu.edu/CS4500-F20/levelland/commit/f4e11ad4587a060edb7767ad071826a52d5e5f43

This made our code flow such much better in the referee and allowed us to write more comprehensive unit tests. Furthermore the code is much more clear and understandable. It doesn't intermingle concerns from one component to the other.
