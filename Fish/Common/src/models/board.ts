import { PointType } from "@models/point"
import { Hole, TileType, ActualTile } from "@models/tile"
import { IllegalArgumentError } from "@models/errors/illegalArgument"

const MIN_NUM_TILES = 0
const MIN_NUM_FISH_PER_TILE = 0

/**
 * Represents a board from the Fish game
 */
class Board {
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

    /**
     * Returns the contents of the board an 2d array. Mutating the return value of this function will not mutate the board
     */
    toTileArray(): Array<{ x: number; y: number; tile: TileType }> {
        const output: Array<{ x: number; y: number; tile: TileType }> = []
        this.data.forEach((value, key) => {
            const { x, y } = JSON.parse(key)
            output.push({ x, y, tile: value })
        })

        return output
    }
}

/**
 * Does the array contain the given position?
 * @param arr Array to search
 * @param needle Position to find
 */
const containsPosition = (arr: Array<PointType>, needle: PointType): boolean =>
    arr.some((p) => p.x === needle.x && p.y === needle.y)

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
        holes?: Array<PointType>
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

    let board = new Board()
    // We ignore holes that are outside of the bounds of the board so long as we have met or exceeded the minTiles
    let sideLength = Math.ceil(Math.sqrt(minTiles + holes.length))

    for (let y = 0; y < sideLength; y++) {
        for (let x = 0; x < sideLength; x++) {
            if (containsPosition(holes, { x, y })) {
                board.set({ x, y }, "hole")
            } else {
                board.set({ x, y }, { fish: numFishPerTile })
            }
        }
    }

    return board
}

export { createBoard }
