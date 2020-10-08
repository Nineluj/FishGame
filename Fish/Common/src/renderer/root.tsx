import * as React from "react"
import * as electron from "electron"
import Hexagon from "@/renderer/tile/tile"
import { Board } from "./board/board"
import { createBoard } from "@/models/board"

/**
 * Draws the main view
 */
const Root: React.FC = () => {
    /**
     * Terminates the program
     * @param _ Event calling the function, is disregarded
     */
    const closeApp = (_: Event): void => {
        electron.ipcRenderer.send("close-me")
    }

    const board = createBoard(15, {
        holes: [
            { x: 1, y: 1 },
            { x: 2, y: 1 },
        ],
    })

    return (
        <div className="center">
            <Board data={board.toTileArray()} />
        </div>
    )
}

export default Root
