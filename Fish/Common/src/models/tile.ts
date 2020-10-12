// Hole denotes a hole in a board
type Hole = "hole"

// ActualTile denotes a tile that is not a hole
interface Tile {
    fish: number
    occupied: boolean
}

export { Hole, Tile }
