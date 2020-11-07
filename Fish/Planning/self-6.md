## Self-Evaluation Form for Milestone 6

Indicate below where your TAs can find the following elements in your strategy and/or player-interface modules:

The implementation of the "steady state" phase of a board game
typically calls for several different pieces: playing a *complete
game*, the *start up* phase, playing one *round* of the game, playing a *turn*, 
each with different demands. The design recipe from the prerequisite courses call
for at least three pieces of functionality implemented as separate
functions or methods:

**We are using dynamic dispatch to invoke the correct type of action based on the current phase of the game. The functionality is split across multiple functions that are all unit tested individually and together.**

- the functionality for "place all penguins"

[Penguin Placement Strategy](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Player/src/strategy/strategy.ts#L56) L56-L86
This strategy is used in [player.ts](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Player/src/player/player.ts#L56) L56. The referee will invoke updateState on the player with the updated GameState (a Finite State Machine), triggering the player to make a move if it is their turn.

- a unit test for the "place all penguins" functionality 

We do not have a unit test for this.

- the "loop till final game state"  function

The [makeAction(...)](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Admin/src/referee/referee.ts#L88) L88-128 function in referee calls [updateState(...)](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Player/src/player/player.ts#L54) L54-L58 on all players every time it is invoked. Upon recieving the new state, the player whose turn it is will call back to makeAction with their move, and this process repeats until the final game state.

See also [player-interface.ts](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Common/player-interface.ts#L15) L15-L18 for purpose statement of updateState(...)

- this function must initialize the game tree for the players that survived the start-up phase

We store all actions made by players and the referee including placing penguins, making moves, and eliminating players in an array of actions. We also store the original GameState, so that the play-by-play of the game can be reconstructed. We chose this implementation over storing a game tree so that we could also keep track of all penguin placement actions in the same format as the rest of the actions taken by players.


- a unit test for the "loop till final game state"  function

See [After makeAction is invoked once, plays through an entire game](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Admin/src/referee/referee.test.ts#L211) L211-L225

- the "one-round loop" function

Our code is not designed this way, and we do not have a one-round loop function - our makeAction function is invoked over and over until the game reaches a final state.

- a unit test for the "one-round loop" function

Our code is not designed this way, and we do not have a one-round loop function - our makeAction function is invoked over and over until the game reaches a final state.


- the "one-turn" per player function

See [completePlayerActionOrEliminate](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Admin/src/referee/referee.ts#L130) L130-L151


- a unit test for the "one-turn per player" function with a well-behaved player 

This function is private, so it is not directly invoked in any of our tests. However, all of our tests that use makeAction and assert on its output via the getReplay or getGameState methods indirectly test its functionality. See [referee.test.ts](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Admin/src/referee/referee.test.ts#L123) L123-154 for an example of such test.


- a unit test for the "one-turn" function with a cheating player

See [referee.test.ts](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Admin/src/referee/referee.test.ts#L198) L198-L209


- a unit test for the "one-turn" function with an failing player 

Our referee only handles cheating players. The responsibility of identifying failing players will be delegated to networking middleware in future evolutions of the software, as mentioned in this [future invariant comment](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Admin/src/referee/referee.ts#L94) L94-L95

- for documenting which abnormal conditions the referee addresses 

See the [jsdoc for makeAction](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Admin/src/referee/referee.ts#L88) L88-L98


- the place where the referee re-initializes the game tree when a player is kicked out for cheating and/or failing 

Instead of re-initializing the game tree, we use an [eliminatePlayerAction](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish/Common/src/models/action/action.ts#L80) L80-L91, and store it in our history of actions executed in the game. We preferred to add a new action to update the gamestate rather than modify an existing one because it makes more sense looking at it as a tournament observer, and facilitates replay functionality.


**Please use GitHub perma-links to the range of lines in specific
file or a collection of files for each of the above bullet points.**

  WARNING: all perma-links must point to your commit "50bbd9c5c9198bd18088330b24a6f1f045f39e75".
  Any bad links will be penalized.
  Here is an example link:
    <https://github.ccs.neu.edu/CS4500-F20/sunnyvale/tree/50bbd9c5c9198bd18088330b24a6f1f045f39e75/Fish>

