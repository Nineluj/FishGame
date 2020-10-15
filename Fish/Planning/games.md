# Design Plan: Games

## Data Representation

See the [game state](game-state.md) document for information about how a single game state
is represented. At a high level: a single game state is an immutable collection containing information
about a board (that is also immutable), the players which have penguins on the board and information
about the phase in which the game is in and the turn. The game state will be referred to as `GameState`.
Operations on the GameState returns a GameState and do not modify the previous version.

This document contains information about the representation of a full games that could either be games that have been
played or anticipated moves that are made starting from an arbitrary yet always correct game state.

This representation is encapsulated in a `GameLedger` which looks like the following:

```typescript
type GameLedger = BaseLedger | RecursiveLedger;

type BaseLedger = GameState;

interface RecursiveLedger {
  prev: GameLedger;
  action: GameAction;
  state: GameState;
}
```

The `BaseLedger` contains only the a single game state after all the player's penguins have been placed.

```typescript
type BaseAction = {
  action: "forfeit" | "skipTurn" | "move";
  playerId: number;
};

type ForfeitAction = BaseAction & {
  action: "forfeit";
};

type SkipTurnAction = BaseAction & {
  action: "skipTurn";
};

type MoveAction = BaseAction & {
  from: Position;
  to: Position;
};

type GameAction = ForfeitAction | SkipTurnAction | MoveAction;
```

Note on notation: `&` works like a union and means that `ForfeitAction` for example
has the properties of `BaseAction`. `ForfeitAction` therefore has both `action: forfeit` and a `playerId`.

The three types of game actions are

1. Action which causes a player to forfeit
2. Action which causes a player to skip their turn
3. Action which causes a player to move one of their penguins

Using the `makeAction` function from the external interface, these actions can be used to get a new and updated GameLedger.

## External Interface

The external interface for interacting with this data representation is pretty straightforward:

```typescript
// Initializes a GameLedger with the given game state as the base state
createLedger(gs: GameState): GameLedger

// Get the next state resulting from the given action. Will throw an exception if
// the action is invalid (i.e: player tries to make a move outside of their turn)
makeAction(game: GameLedger, action: GameAction): GameLedger

// Get the previous state. Throws an exception if the ledger is a BaseLedger
undoAction(game: GameLedger): GameLedger

// Generates all the possible states in which the game could find itself in
// after the given number of additional turns have been played. With steps as 1,
// will generate all the possible game states possible for the next player's turn
getAllPossibleStates(game: GameLedger, steps: number): Array<GameLedger>
```

With these three functions, it is possible for a player to find and pre-evaluate all the possible situation in which they might find themselves in when their turn arrives.
This data representation also lends itself to store a full replay of games and would make it easy for a view to integrate this data to visually show the replay as well.
