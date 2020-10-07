import { TileType } from "@/models/tile"

export interface TileData {
    x: number
    y: number
    tile: TileType
}

//TODO complete this function
export const getTileDataByColumn = (
    data: Array<TileData>
): Map<number, Array<TileData>> => {
    return null as any
}
