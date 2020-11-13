### Bug: Fix all failing integration tests

Issue: A code change broke existing integrations tests, we went back and made sure they worked
Commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/08824a0a7bb611b2f97e5df7e07cf4bc0b7bc092

### Bug: Not passing Milestone 6 Integration tests

Original Failing Test Example:

What was the bug: We were doing the equivalent of n-1 for depth. We added to the score when a player left a tile not when they landed on it.

Commit:https://github.ccs.neu.edu/CS4500-F20/levelland/commit/60b7b85afcc995aa1b8d5f004574b2e953afcfb2
Unit Test fix: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/daedd5bb8dbc0fb9af8c2d36d518f83283d621f1

### Bug: Not passing Milestone 5 Integration Tests

Original Failing Test Example: In 5/Tests/1-in.json would return false

What was the bug: Neighboring directions were not being searched correctly. (Numbers for direction search were off). Additionally the game tree was not being used. I made the change to instantiate a game tree

Commit: https://github.ccs.neu.edu/CS4500-F20/levelland/commit/3a981146053da0437b0f309e3e03fb5274868999
Important Line Changes:46-56
