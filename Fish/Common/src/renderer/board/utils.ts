import { Hole, Tile } from "@/models/tile"

export interface RenderableTileData {
    x: number
    y: number
    tile: Tile | Hole
}

interface Column {
    x: number
    tiles: Array<RenderableTileData>
}

/**
 * Aggregate the tiles based on their column in sorted order both in terms of
 * columns and in terms of tiles in each column
 * @param data The tiles to group together, shouldn't contain missing data points
 */
export const getTileDataByColumn = (
    data: Array<RenderableTileData>
): Array<Column> => {
    const map = new Map<number, Array<RenderableTileData>>()
    data.forEach((tile) => {
        if (!map.has(tile.x)) {
            map.set(tile.x, [tile])
        } else {
            map.get(tile.x)!.push(tile)
        }
    })

    const output: Array<Column> = []
    map.forEach((value, key) => {
        output.push({ x: key, tiles: sortColumnInAscendingOrder(value) })
    })

    output.sort((a, b) => {
        return a.x - b.x
    })
    return output
}

/**
 * Sort the tiles based on their y coordinates
 * @param data Tiles to sort
 */
const sortColumnInAscendingOrder = (
    data: Array<RenderableTileData>
): Array<RenderableTileData> => {
    const clonedData = [...data]
    return clonedData.sort((a, b) => {
        return a.y - b.y
    })
}
