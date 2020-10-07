// Stub interface
interface PlayerType {}

// Hole denotes a hole in a board
type Hole = "hole"
// TileType denotes
type TileType = ActualTile | Hole

// ActualTile denotes a tile that is not a hole
interface ActualTile {
    fish: number
    player?: PlayerType
}

export { TileType, Hole, ActualTile }
