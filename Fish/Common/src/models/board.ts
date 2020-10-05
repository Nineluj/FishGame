import { PointType } from "@models/point"
import { Hole, TileType } from "@models/tile"
import { IllegalArgumentError } from "@models/errors/illegalArgument"

const MIN_NUM_TILES = 0

/**
 * Represents a board from the Fish game
 */
class BoardMap {
    data: Map<string, TileType>

    constructor() {
        this.data = new Map<string, TileType>()
    }

    /**
     * Does this collection contain the given point?
     * @param point a point on the board
     */
    has(point: PointType) {
        return this.data.has(JSON.stringify(point))
    }

    /**
     * Get the tile at the given point
     * @param point the point on the board
     */
    get(point: PointType) {
        return this.data.get(JSON.stringify(point))
    }

    /**
     * Put the given tile at the given point
     * @param point Where to place the tile
     * @param tile What tile to place
     */
    set(point: PointType, tile: TileType) {
        this.data.set(JSON.stringify(point), tile)
    }
}

/**
 * Does the array contain the given position?
 * @param arr Array to search
 * @param needle Position to find
 */
const containsPosition = (arr: Array<PointType>, needle: PointType): boolean =>
    arr.some((p) => p.x === needle.x && p.y === needle.y)

/**
 * Creates a board with at least minTiles number of tiles all containing one
 * fish and with holes at the given position.
 * @param minTiles The minimum number of tiles in the board
 * @param holes
 * @throws IllegalArgumentError
 */
const createBoard = (minTiles: number, holes: Array<PointType>): BoardMap => {
    if (minTiles < MIN_NUM_TILES) {
        throw new IllegalArgumentError(
            `number of tiles must be at least ${MIN_NUM_TILES}, given ${minTiles}`
        )
    }

    let board = new BoardMap()
    // TODO: should we make the board bigger to "fit" holes?
    let sideLength = Math.ceil(Math.sqrt(minTiles + holes.length))

    for (let y = 0; y < sideLength; y++) {
        for (let x = 0; x < sideLength; x++) {
            if (containsPosition(holes, { x, y })) {
                // TODO: find a more intuitive way to do this
                board.set({ x, y }, (null as unknown) as Hole)
            } else {
                // TODO: can put random number of fish
                board.set({ x, y }, { fish: 1 })
            }
        }
    }

    return board
}

export { createBoard }
