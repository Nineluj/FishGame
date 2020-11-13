### Bug: Fix all failing integration tests

Issue: A code change broke existing integrations tests, we went back and made sure they worked
Commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/08824a0a7bb611b2f97e5df7e07cf4bc0b7bc092

### Bug: Milestone 6 -- Score being incremented at the wrong time

Original Failing Test Example: 1-in.json from the alma directory

What was the bug: The gameState logic gave a player points when a penguin was placed and when it
arrived at a tile. The score should only be incremented when a penguin leaves a tile.
Tests for gameState were fixed to reflect this change. Was fixed at the same time as the next bug.

Commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/60b7b85afcc995aa1b8d5f004574b2e953afcfb2

### Bug: Milestone 6 -- Wrong depth used by minMax strategy

Original Failing Test Example: 1-in.json from our (levelland) directory

What was the bug: We were doing the equivalent of n + 1 for depth. We changed our function so that it
looked one depth less than what gets passed to get the desired behavior. Our 1-in.json was initially
working because of the combination of this and the previously mentioned bug but after the previously
mentioned bug was fixed we failed that test and used it to find and fix this bug.

Commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/60b7b85afcc995aa1b8d5f004574b2e953afcfb2

### Bug: Not passing Milestone 5 Integration Tests

Original Failing Test Example: In 5/Tests/1-in.json would return false

What was the bug: Neighboring directions were not being searched correctly. (Numbers for direction search were off). Additionally the game tree was not being used. I made the change to instantiate a game tree

Commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/3a981146053da0437b0f309e3e03fb5274868999
Important Line Changes:46-56
