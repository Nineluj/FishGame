import React, { useState } from "react"
import update from "immutability-helper"
import { TileData, getTileDataByColumn } from "./utils"
import "./board.css"
import { ActualTile } from "@/models/tile"
import Tile from "../tile/tile"

interface Props {
    data: Array<TileData>
}

/**
 * Graphical component that draws the board
 * @param data Board data to draw
 */
const Board: React.FC<Props> = ({ data }) => {
    const [columns, setColumns] = useState(getTileDataByColumn(data))

    /**
     * Changes the tile in column colI and row rowI to be a hole
     * @param colI Column index
     * @param rowI Row index
     */
    const removeTile = (colI: number, rowI: number) => {
        setColumns(
            update(columns, {
                [colI]: {
                    tiles: {
                        [rowI]: {
                            tile: {
                                $set: "hole",
                            },
                        },
                    },
                },
            })
        )
    }

    return (
        <div className="container">
            {columns.map((column, columnIndex) => (
                <div className="column">
                    {column.tiles.map((tile, rowIndex) => (
                        <Tile
                            fish={tile.tile === "hole" ? 0 : tile.tile.fish}
                            className="tile"
                            hole={tile.tile === "hole"}
                            onClick={() => removeTile(columnIndex, rowIndex)}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export { Board }
