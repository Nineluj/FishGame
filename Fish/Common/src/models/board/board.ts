import { containsPoint, Point } from "@/models/point"
import { Hole, Tile } from "@models/tile"
import { IllegalArgumentError } from "@models/errors/illegalArgumentError"
import update from "immutability-helper"

const MIN_NUM_TILES = 0
const MIN_NUM_FISH_PER_TILE = 0

/**
 * Represents a board from the Fish game
 * Coordinate system based on the 3rd model (odd-q) from:
 * https://www.redblobgames.com/grids/hexagons/#coordinates-offset
 *
 * The board contains columns that contains rows
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
    return board[point.x][point.y]
}

/**
 * Returns a new board with the given tile at the given point
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
 * not including the tile itself and not including holes
 *
 * @param board The game board
 * @param origin Position
 */
const getReachableTilesFrom = (
    board: Board,
    origin: Point
): Array<{ x: number; y: number; tile: Tile }> => {
    const output: Array<{ x: number; y: number; tile: Tile }> = []

    // Contains the different increments you can move to get to a
    // neighboring tile for tiles in even and odd columns.
    // See odd-q increments here:
    // https://www.redblobgames.com/grids/hexagons/#neighbors-offset
    const movementIncrements = [
        { odd: { x: 0, y: -1 }, even: { x: 0, y: -1 } },
        { odd: { x: 1, y: 0 }, even: { x: 1, y: -1 } },
        { odd: { x: 1, y: 1 }, even: { x: 1, y: 0 } },
        { odd: { x: 0, y: 1 }, even: { x: 0, y: 1 } },
        { odd: { x: -1, y: 1 }, even: { x: -1, y: 0 } },
        { odd: { x: -1, y: 0 }, even: { x: -1, y: -1 } },
    ]

    // Check that the origin point is a tile
    if (!boardHas(board, origin)) {
        return []
    }

    movementIncrements.forEach((increment) => {
        let currentPosn: Point = { x: origin.x, y: origin.y }

        // Move in the direction defined by the increment until we hit a hole
        // or the end of the board, adding each tile encountered to the output
        while (true) {
            const xIncrement =
                currentPosn.x % 2 === 0 ? increment.even.x : increment.odd.x
            const yIncrement =
                currentPosn.x % 2 === 0 ? increment.even.y : increment.odd.y

            currentPosn = {
                x: currentPosn.x + xIncrement,
                y: currentPosn.y + yIncrement,
            }

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

// Default option configuration for creating a board with createBoard
const defaultCreateBoardOptions = {
    holes: [],
    numFishPerTile: 1,
}

/**
 * Creates a board with at least minTiles number of tiles all containing one
 * fish and with holes at the given position. The initial tile will be placed at 0,0
 * @param minTiles The minimum number of tiles in the board
 * @param options Additional configuration parameters that can be specified to further customize the generated board: holes, an array of coordinates, and numFishPerTile, the number of fish per tile
 * @throws IllegalArgumentError
 */
const createBoard = (
    minTiles: number,
    options?: {
        holes?: Array<Point>
        numFishPerTile?: number
    }
): Board => {
    // Overwrite default options with user provided options
    const aggregatedOptions = { ...defaultCreateBoardOptions, ...options }

    const { holes, numFishPerTile } = aggregatedOptions
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

export {
    Board,
    createBoard,
    boardHas,
    boardGet,
    boardSet,
    getReachableTilesFrom,
    getNumberOfTilesOnBoard,
}
