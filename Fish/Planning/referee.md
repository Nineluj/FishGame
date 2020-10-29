# Referee

## Background

### High level

The `referee` has three high level responsibilities. The first is to set up games which it does for a `TournamentManager`.
The second is running games, during which it will interact with `Players` and possibly with the `TournamentManager`.
The third responsibility is to conclude games

The `referee` does not get passed a list of game rules since it is the software component that is aware of the rules of Fish.

### Interaction with TournamentManager

The interaction between the `TournamentManager` and the `referee` falls in 3 different categories:

-   Setting up games: To set up games, the `TournamentManager` calls `setup(...)` with the unique identifiers
    for the players that are to participate in the game. It also includes the `PublicKey` for each player so that the
    referee can authenticate the player making the move.
-   Reporting status of game: `TournamentManager` may use `getScores()`, `getGamePhase` and `getMaximumTurnsLeftInGame` to get information
    about the ongoing game. `getGamePhase` is only used by the tournament manager since information about the game state can be obtained by
    the players with `refreshGameState`. The tournament manager mayuse this method and `getMaximumTurnsLeftInGame` to estimate when
    the game will finish for scheduling purposes.
-   Reporting results of game: `TournamentManager` could use `getGamePhase` in conjuction with `getScores` to get information about the results
    of a game. However, `TournamentManager` should instead expose a `reportGameOutcome` method which `referee` would use to share game results.

### Interaction with Players

In game, players will interact with the `referee` to:

-   Take an `Action`. Actions are a way for players to ask the refree to modify the state of the game in a certain way.
    Actions include an `hmac` of type `HMAC-SHA-256` which is a [cryptographic signature](https://en.wikipedia.org/wiki/HMAC) to verify
    that a player is not making an action on another player's behalf. Since the `referee` interacts directly with the players, it needs to be able
    to validate moves in this way to prevent the hackers from cheating like this.
    A player will want to make an action to:
    -   Place a penguin
    -   Move a penguin
    -   Forfeit
    -   SkipTurn
-   Refresh their game state: If a Player somehow loses/forgets their game state, they can call `refreshGameState` to get the current copy.
    Players should not call `makeAction` only to get the game state since `makeAction` may kick players for making any invalid actions.

## API

The following is the API for the Referee:

```typescript
interface IReferee {
    /* Methods used by the tournament director to interact with Referee */

    // Initialize a game for the players with the given ids
    setup(playerIds: Array<[PublicKey, string]>)

    // Get the player scores
    getScores(): Array<Player>

    // Get the current phase of the game
    getGamePhase(): "penguinPlacement" | "playing" | "over"

    // How many turns are there left in the game at most?
    getMaximumTurnsLeftInGame(): number

    /* Methods used by Players to interact with Referee */

    // Attempts to make an action. Referee may kick the player for making an invalid action.
    makeAction(
        playerId: string,
        action: PlayerAction,
        hmac: ArrayBuffer
    ): { gameState: GameState; success: boolean; reason?: string }

    // Returns a read-only copy of the current game state
    refreshGameState(): GameState
}
```

A `PublicKey` is an `ArrayBuffer`, a fixed length raw binary data buffer.
A `PlayerAction` is one of `MoveAction`, `SkipTurnAction` or `ForfeitAction`.
