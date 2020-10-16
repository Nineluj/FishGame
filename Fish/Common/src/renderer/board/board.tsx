import { Board } from "@/models/board/board"
import React from "react"
import Tile from "../tile/tile"
import "./board.css"
import { ViewBoard } from "../utils"
import { powerMonitor } from "electron"

interface Props {
    board: ViewBoard
    onPenguinClick: (x: number, y: number) => void
    onTileClick: (x: number, y: number) => void
}

/**
 * Graphical component that draws the board
 * @param data Board data to draw
 * @param removeTile
 */
const Board: React.FC<Props> = ({ board, onPenguinClick, onTileClick }) => {
    return (
        <div className="container">
            {board.map((column, x) => (
                <div className="column">
                    {column.map((tile, y) => (
                        <Tile
                            fish={tile === "hole" ? 0 : tile.fish}
                            className="tile"
                            hole={tile === "hole"}
                            onTileClick={() => onTileClick(x, y)}
                            onPenguinClick={() => onPenguinClick(x, y)}
                            penguinColor={
                                tile === "hole" ? undefined : tile.penguinColor
                            }
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export { Board }
