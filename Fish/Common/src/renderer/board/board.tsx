import React from "react"
import { TileData, getTileDataByColumn } from "./utils"
import "./board.css"
import { ActualTile } from "@/models/tile"
import Tile from "../tile/tile"

interface Props {
    data: Array<TileData>
}

const Board: React.FC<Props> = ({ data }) => {
    const columns = getTileDataByColumn(data)

    return (
        <div className="container">
            {columns.map((column) => (
                <div className="column">
                    {column.tiles.map((tile) => (
                        <Tile
                            fish={(tile.tile as ActualTile).fish}
                            className="tile"
                            hole={tile.tile === "hole"}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export { Board }
