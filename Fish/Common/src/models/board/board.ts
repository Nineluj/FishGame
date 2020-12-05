import { containsPoint, Point } from "../point"
import { Hole, Tile } from "../tile"
import { IllegalArgumentError } from "../errors/illegalArgumentError"
import update from "immutability-helper"

const MIN_NUM_TILES = 0
const MIN_NUM_FISH_PER_TILE = 1
const MAX_NUM_FISH_PER_TILE = 5

/**
 * A UnitsVector represents a translation by 1 tile in some direction
 */
type UnitsVector = {
    x: -1 | 0 | 1
    y: -1 | 0 | 1
}

/**
 * A Direction Increment represents instructions for moving 1 tile in a direction.
 * If the x coordinate of the point being moved from is even, then you use the even field to increment your position
 * If the x coordinate of the point being moved from is odd, then you use the odd field to increment your position
 */
type DirectionIncrement = {
    odd: UnitsVector
    even: UnitsVector
}

// Contains the different increments you can move to get to a
// neighboring tile for tiles in even and odd columns.
// See odd-q increments here:
// https://www.redblobgames.com/grids/hexagons/#neighbors-offset
const MOVEMENT_INCREMENTS: DirectionIncrement[] = [
    { odd: { x: 0, y: -1 }, even: { x: 0, y: -1 } },
    { odd: { x: 1, y: 0 }, even: { x: 1, y: -1 } },
    { odd: { x: 1, y: 1 }, even: { x: 1, y: 0 } },
    { odd: { x: 0, y: 1 }, even: { x: 0, y: 1 } },
    { odd: { x: -1, y: 1 }, even: { x: -1, y: 0 } },
    { odd: { x: -1, y: 0 }, even: { x: -1, y: -1 } },
]

/**
 * A Board is a n x m hexagonal grid of Tiles and Holes. The board is used to play the Fish Game where
 * players traverse the hexagonal grid collecting fish from tiles.
 *
 * Coordinate system based on the 3rd model (“odd-q” vertical layout shoves odd columns down) from:
 * https://www.redblobgames.com/grids/hexagons/#coordinates-offset
 *
 *
 * The board is represented by an Array of Columns which are Arrays of Tiles or Holes
 */
type Board = Array<Array<Tile | Hole>>

/**
 * Does the board have a tile at the given point?
 * @param board The game board
 * @param point Coordinate on the board
 */
const boardHas = (board: Board, point: Point) => {
    if (point.x >= board.length) {
        return false
    }

    let content = board[point.x][point.y]
    return content !== undefined && content !== "hole"
}

/**
 * Get the tile at the given point
 * @param board The game board
 * @param point the point on the board
 */
const boardGet = (board: Board, point: Point): Tile | Hole | undefined => {
    return (board[point.x] && board[point.x][point.y]) || undefined
}

/**
 * Returns a new board with the given tile or hole at the given point
 * @param board The game board
 * @param point Where to place the tile
 * @param val Tile or hole to place
 */
const boardSet = (board: Board, point: Point, val: Tile | Hole): Board => {
    // Need to create the column for the value that we're trying to insert
    // if it is not already there
    if (board[point.x] == undefined) {
        // create a copy of the board
        board = [...board]
        board[point.x] = []
    }

    // update creates a new version of board without mutation
    return update(board, {
        [point.x]: {
            [point.y]: {
                $set: val,
            },
        },
    })
}

/**
 * Gets the number of tiles on the board, not including holes.
 * @param board The game board
 */
const getNumberOfTilesOnBoard = (board: Board): number => {
    let count = 0

    board.forEach((column) => {
        column.forEach((tile) => {
            if (tile !== "hole" && tile !== undefined) {
                count++
            }
        })
    })

    return count
}

/**
 * Find all the tiles in the board that are reachable from the given position,
 * not including the tile itself and not including holes. Reachable means
 * that a tile can be reached by a penguin moving in a straight line uninterrupted
 * by holes and occupied tiles
 *
 * @param board The game board
 * @param origin Position
 */
const getReachableTilesFrom = (
    board: Board,
    origin: Point
): Array<{ x: number; y: number; tile: Tile }> => {
    const output: Array<{ x: number; y: number; tile: Tile }> = []

    // Check that the origin point is a tile
    isValidMovementPosition(board, origin)

    MOVEMENT_INCREMENTS.forEach((increment: DirectionIncrement) => {
        let currentPosn: Point = { x: origin.x, y: origin.y }
        // Move in the direction defined by the increment until we hit a hole
        // or the end of the board, adding each tile encountered to the output
        while (true) {
            currentPosn = getNextTileInDirection(currentPosn, increment)

            let currentTile = boardGet(board, currentPosn)
            if (
                currentTile !== "hole" &&
                currentTile !== undefined &&
                !currentTile.occupied
            ) {
                output.push({ ...currentPosn, tile: currentTile })
            } else {
                break
            }
        }
    })

    return output
}

const getNextTileInDirection = (
    currentPosition: Point,
    increment: DirectionIncrement
): Point => {
    const xIncrement =
        currentPosition.x % 2 === 0 ? increment.even.x : increment.odd.x
    const yIncrement =
        currentPosition.x % 2 === 0 ? increment.even.y : increment.odd.y

    return (currentPosition = {
        x: currentPosition.x + xIncrement,
        y: currentPosition.y + yIncrement,
    })
}

const isValidMovementPosition = (board: Board, origin: Point) => {
    if (!boardHas(board, origin)) {
        throw new IllegalArgumentError("You cannot move from a hole")
    }
}

/**
 * Returns the location of the next tile to the right, skipping holes
 */
const getCoordinatesOfNextUnoccupiedTileToTheRight = (
    board: Board,
    p: Point
): Point | false => {
    const boardLen = board.length

    for (let i = p.x; i < boardLen; i += 2) {
        const p2 = { x: i, y: p.y }
        if (boardHas(board, p2) && !(boardGet(board, p2) as Tile).occupied) {
            return p2
        }
    }

    return false
}

/**
 * Creates a copy of the given tile that is marked as unoccupied
 */
const makeUnoccupied = (tile: Tile): Tile => {
    return {
        occupied: false,
        fish: tile.fish,
    }
}

// Default option configuration for creating a board with createBoard
const defaultCreateBoardOptions = {
    holes: [],
    numFishPerTile: 1,
    randomizeFishPerTile: false,
}

/**
 * Creates a board with at least minTiles number of tiles all containing one
 * fish and with holes at the given position. The initial tile will be placed at 0,0
 * @param minTiles The minimum number of tiles in the board
 * @param options Additional configuration parameters that can be specified to further customize the generated board:
 * - holes, an array of coordinates
 * - numFishPerTile, the number of fish per tile
 * - randomizeFishPerTile, use a valid number of random fish per tile. Overrides numFishPerTile if set
 * @throws IllegalArgumentError
 */
const createBoard = (
    minTiles: number,
    options?: {
        holes?: Array<Point>
        numFishPerTile?: number
        randomizeFishPerTile?: boolean
    }
): Board => {
    // Overwrite default options with user provided options
    const aggregatedOptions = { ...defaultCreateBoardOptions, ...options }

    const { holes, randomizeFishPerTile } = aggregatedOptions
    let { numFishPerTile } = aggregatedOptions
    if (minTiles < MIN_NUM_TILES) {
        throw new IllegalArgumentError(
            `number of tiles must be at least ${MIN_NUM_TILES}, given ${minTiles}`
        )
    }

    if (numFishPerTile < MIN_NUM_FISH_PER_TILE) {
        throw new IllegalArgumentError(
            `number of fish per tile must be at least ${MIN_NUM_FISH_PER_TILE}, given ${numFishPerTile}`
        )
    }

    let board: Board = [[]]

    // We ignore holes that are outside of the bounds of the board so long as we have met or exceeded the minTiles
    let sideLength = Math.ceil(Math.sqrt(minTiles + holes.length))

    for (let y = 0; y < sideLength; y++) {
        for (let x = 0; x < sideLength; x++) {
            if (containsPoint(holes, { x, y })) {
                board = boardSet(board, { x, y }, "hole")
            } else {
                if (randomizeFishPerTile) {
                    numFishPerTile = getRandomNumberOfFish()
                }

                board = boardSet(
                    board,
                    { x, y },
                    { fish: numFishPerTile, occupied: false }
                )
            }
        }
    }

    return board
}

/**
 * Get a random number of fish between MIN_NUM_FISH_PER_TILE to MAX_NUM_FISH_PER_TILE
 */
const getRandomNumberOfFish = (): number => {
    return (
        MIN_NUM_FISH_PER_TILE +
        Math.floor(
            Math.random() * (MAX_NUM_FISH_PER_TILE - MIN_NUM_FISH_PER_TILE)
        )
    )
}

export {
    Board,
    createBoard,
    boardHas,
    boardGet,
    boardSet,
    getReachableTilesFrom,
    getCoordinatesOfNextUnoccupiedTileToTheRight,
    getNumberOfTilesOnBoard,
    makeUnoccupied,
}
