import * as React from "react"
import { TileType } from "@/models/tile"

interface TileData {
    x: number
    y: number
    tile: TileType
}
interface Props {
    data: Array<TileData>
}

const Board: React.FC<Props> = ({ data }) => {
    return <div />
}

export { Board }
