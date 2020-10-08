import { TileType } from "@/models/tile"

export interface TileData {
    x: number
    y: number
    tile: TileType
}

interface Column {
    x: number
    tiles: Array<TileData>
}

export const getTileDataByColumn = (data: Array<TileData>): Array<Column> => {
    const map = new Map<number, Array<TileData>>()
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

export const sortColumnInAscendingOrder = (
    data: Array<TileData>
): Array<TileData> => {
    const clonedData = [...data]
    return clonedData.sort((a, b) => {
        return a.y - b.y
    })
}
