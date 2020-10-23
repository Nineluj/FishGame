# Player Protocol

## Notifying a player the game has started

When the game has started (i.e. all penguins have been placed), the referee will notify all players of this by calling the `notifyStartGame()` method on the player interface

## Making a move

When a player issues a call to `movePenguin`, the move will either be deemed a valid move and executed by the referee, or deemed invalid and rejected.

If the move is valid, the referee will execute the move on the GameState, invoke `acceptMove()` on the player interface, and then invoke `updateGameState(newGameState)` on the player interface (see `Updating GameState when another player makes a move` below for more details on this)

If the move is invalid, then the referee will not execute the move on the GameState, and will invoke `rejectMove(reason)` on the player interface, informing it why the move was rejected and what rules it violated.

## Notifying a player when it is their turn

When it is a players turn to make a move, the referee will inform them of it using the `notifyTurn()` call on the player interface. This is because people are lazy and will not think to check if it is their turn, this will forcefully notify them.

## Notifying a player their turn has been skipped

When a players turn is skipped by the referee, they will be notified via a call to the `notifySkipped(reason)` method on the player interface. A players turn might be skipped because they have no moves left to make, or because they took too long to make a move when it was their turn

## Updating GameState when another player makes a move

When a player makes a valid move, the Referee will notify all players in this game of the new GameState using the `updateGameState(newGameState)` call in the player interface.

## Notifying a player that they have been banned

If a player is behaving nefariously, the referee can ban them from the game using the `notifyBanned(reason)` method in the player interface. Once this method has been invoked, the referee should reject all requests from the banned player.

## Notifying players that the game has ended

If there are no more moves left for any players, the referee will send out one final `updateGameState(currentGameState)` to all players, and then send out a `notifyGameOver()` call to all players. When players recieve a notifyGameOver message, they should look at the player scores and other information in the last recieved game state to display end of game statistics.
