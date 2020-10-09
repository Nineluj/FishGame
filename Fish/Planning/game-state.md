# Game state

## State Representation

We want to the model for the game state to be similar to what players would be able to see
and need to know to play the Fish game in person. The state also needs to hold enough information
for a supervising person/entity to judge if a move that is tried is valid.

Tiles are stored in a Map of `(x, y) -> Tile`. They are converted into an Array of `{x, y, TileData}` to be consumed by the view

A Tile is defined as the following

```typescript
{
  x: number,
  y: number,
  TileData: {
    fish: number,
    playerId?: number,
  } | "hole"
}
```

## External Interface

These are the methods that can be used to access and manipulate the game state

```typescript
/**
 * Given a player id and a valid location on the board, set the players current location to that tile
 */
setPlayerLocation(playerId: number, destination: Point): void

/**
 * Removes a tile from the board given the coordinates of a valid tile and replaces it with a hole
 */
removeTile(coordinates: Point): void

/**
 * Returns a flat Array of tiles and their coordinates on the grid to be consumed by a view
 */
toTileArray(): Array<{x: Point, y: Point, tile: TileData}>

/**
 * Returns a list of the players and associated information about them such as their current score and location
 */
getPlayers(): Array<Player>

/**
 * Returns the player whos turn it is right now
 */
getPlayerWhosTurnItIsRightNow(): Player
```
