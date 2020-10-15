# Game state

## State Representation

The game state is represented with a `GameState` object that has these fields:
```typescript
{
    // Immutable object representing the state of the board
    board: Board
    // Represents the current turn
    // Starts at 0 and gets incremented by one at the end of each player's turn
    turn: number
    // One of "penguinPlacement" | "playing" | "over"
    phase: GamePhase
    // The players participating in the game, ordered by age in ascending order
    players: Array<Player>
}
```

The board is an `Array<Array<Tile | Hole>>`, with a hole being `"hole"` and a Tile:
```typescript
{
    // Is there a penguin on this tile?
    occupied: boolean
    // The number of fish on this tile
    fish: number
}
```
The coordinate system used is [odd-q](https://www.redblobgames.com/grids/hexagons/#coordinates). The position of the Tile
or hole in the Array represents what x and y coordinate that tile or hole has on the board with the given coordinate system.
The board type provides functions to create new versions of the boards without mutating the data of the given board.

The data representation for player looks like:
```typescript
{
    // unique identifier for this player
    id: number
    // The age of the player
    age: number
    // The color of the penguins that this player places
    color: AvatorColor
    // Position contains two natural numbers for x and y
    penguins: Array<Position>
    // The score that the player has in the current game
    score: number
}
```

## External Interface

These are the methods that can be used to access and update a game state 

```typescript
/**
 * Create a game with a board of at least the given size and with the holes specified and the given players
 * as participants
 */
createGame(boardSize: number, holes: Array<Position>, players: Array<Players>): GameState

/**
 * Gets a read only model of the players in the game ordered by their age in ascending order
 */
getPlayerInformation(gs: GameState): Array<ReadOnlyPlayer>


/**
 * Returns the current turn number 
 */
getTurnNumber(gs: GameState): number

/**
 * Gets a readonly copy of the board 
 */
describeBoard(gs: GameState): ReadOnlyBoard

/**
 * Tries to make a move by moving a penguin from position from to position to
 * throws an exception if the move is invalid
 */
makeMove(gs: GameState, pid: playerId, from: Position, to: Position): GameState

/**
 * Can the player with the given playerId currently play?
 */
canPlay(gs: GameState, playerId: number): boolean

/**
 * Is the current game over?
 */
isGameOver(gs: GameState): boolean
```

These methods will be needed by the referee:
```typescript
/**
 * Is the path from the origin to the destination points valid
 */ 
isValidPath(gs: GameState, origin: Position, dst: Position): boolean

/**
 * Put down a penguin for the given player at the given position
 */ 
placePenguin(gs: GameState, playerId: number, pos: Position)

/**
 * Updates the game state
 */
updateGamePhase(gs: GameState, gamePhase: GamePhase) : GameState
```
