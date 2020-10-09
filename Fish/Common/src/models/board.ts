import { PointType } from "@models/point"
import { Hole, TileType, ActualTile } from "@models/tile"
import { IllegalArgumentError } from "@models/errors/illegalArgument"

const MIN_NUM_TILES = 0
const MIN_NUM_FISH_PER_TILE = 0

/**
 * Represents a board from the Fish game
 * Coordinate system based on the 4th model on https://www.redblobgames.com/grids/hexagons/#coordinates-offset
 *
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
     * Returns a flat Array of tiles and their coordinates on the grid to be consumed by a view
     */
    toTileArray(): Array<{ x: number; y: number; tile: TileType }> {
        const output: Array<{ x: number; y: number; tile: TileType }> = []
        this.data.forEach((tile, pos) => {
            const { x, y } = JSON.parse(pos)
            output.push({ x, y, tile })
        })

        return output
    }

    /**
     * Find all the tiles in the board that are reachable from the given position,
     * not including the tile itself and not including holes
     *
     * @param origin Position
     */
    getReachableTilesFrom(
        origin: PointType
    ): Array<{ x: number; y: number; tile: TileType }> {
        const output: Array<{ x: number; y: number; tile: TileType }> = []

        // Contains the different increments you can move to get to a neighboring tile for tiles in even and odd columns
        // https://www.redblobgames.com/grids/hexagons/#neighbors-offset
        const movementIncrements = [
            { even: { x: 0, y: -1 }, odd: { x: 0, y: -1 } },
            { even: { x: 1, y: 0 }, odd: { x: 1, y: -1 } },
            { even: { x: 1, y: 1 }, odd: { x: 1, y: 0 } },
            { even: { x: 0, y: 1 }, odd: { x: 0, y: 1 } },
            { even: { x: -1, y: 1 }, odd: { x: -1, y: 0 } },
            { even: { x: -1, y: 0 }, odd: { x: -1, y: -1 } },
        ]

        // If the starting point is not an ActualTile, return an empty array
        if (this.get(origin) === undefined || this.get(origin) === "hole") {
            return []
        }

        movementIncrements.forEach((increment) => {
            let currentPosn: PointType = { x: origin.x, y: origin.y }

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
                let currentTile = this.get(currentPosn)

                if (currentTile !== "hole" && currentTile !== undefined) {
                    output.push({ ...currentPosn, tile: currentTile })
                } else {
                    break
                }
            }
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
