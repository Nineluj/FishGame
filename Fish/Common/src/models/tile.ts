// Hole denotes a hole in a board
type Hole = "hole"

// A Tile represents an active on the board.
interface Tile {
    // The number of fish on the current tile. Must be greater than 0.
    fish: number
    // Whether or not there is a penguin occupying this tile
    occupied: boolean
}

export { Hole, Tile }
