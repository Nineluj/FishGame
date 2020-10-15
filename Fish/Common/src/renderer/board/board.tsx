import { Board } from "@/models/board/board"
import React from "react"
import Tile from "../tile/tile"
import "./board.css"

interface Props {
    boardData: Board
    removeTile: (x: number, y: number) => void
}

/**
 * Graphical component that draws the board
 * @param data Board data to draw
 * @param removeTile
 */
const Board: React.FC<Props> = ({ boardData, removeTile }) => {
    return (
        <div className="container">
            {boardData.map((column, x) => (
                <div className="column">
                    {column.map((tile, y) => (
                        <Tile
                            fish={tile === "hole" ? 0 : tile.fish}
                            className="tile"
                            hole={tile === "hole"}
                            onClick={() => removeTile(x, y)}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export { Board }
