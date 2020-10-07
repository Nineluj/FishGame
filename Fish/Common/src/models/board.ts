import { PointType } from "@models/point"
import { Hole, TileType, ActualTile } from "@models/tile"
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
        return this.data.has(JSON.stringify({ x: point.x, y: point.y }))
    }

    /**
     * Get the tile at the given point
     * @param point the point on the board
     */
    get(point: PointType): ActualTile | Hole | undefined {
        return this.data.get(JSON.stringify({ x: point.x, y: point.y }))
    }

    /**
     * Put the given tile at the given point
     * @param point Where to place the tile
     * @param tile What tile to place
     */
    set(point: PointType, tile: TileType) {
        this.data.set(JSON.stringify({ x: point.x, y: point.y }), tile)
    }

    /**
     * Gets the number of holes and tiles on the board
     */
    length(): number {
        return this.data.size
    }

    /**
     * Gets the number of tiles on the board, not including holes.
     */
    getNumberOfTiles(): number {
        let count = 0
        this.data.forEach((value, key) => {
            if (value !== "hole") {
                count++
            }
        })

        return count
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
 * fish and with holes at the given position. The initial tile will be placed at 0,0
 * @param minTiles The minimum number of tiles in the board
 * @param holes The list of points to place holes at on the board. If the position is not on the generated board, the point is ignored
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
                board.set({ x, y }, "hole")
            } else {
                // TODO: can put random number of fish
                board.set({ x, y }, { fish: 1 })
            }
        }
    }

    return board
}

export { createBoard }
