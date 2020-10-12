import React from "react"
import Tile from "../tile/tile"
import "./board.css"
import { getTileDataByColumn, RenderableTileData } from "./utils"

interface Props {
    data: Array<RenderableTileData>
    removeTile: (x: number, y: number) => void
}

/**
 * Graphical component that draws the board
 * @param data Board data to draw
 * @param removeTile
 */
const Board: React.FC<Props> = ({ data, removeTile }) => {
    const columns = getTileDataByColumn(data)

    return (
        <div className="container">
            {columns.map((column, x) => (
                <div className="column">
                    {column.tiles.map((tile, y) => (
                        <Tile
                            fish={tile.tile === "hole" ? 0 : tile.tile.fish}
                            className="tile"
                            hole={tile.tile === "hole"}
                            onClick={() => removeTile(x, y)}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export { Board }
