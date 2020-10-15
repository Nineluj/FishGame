import React, { useState } from "react"
import * as electron from "electron"
import { Board } from "@/renderer/board/board"
import { boardSet, createBoard } from "@/models/board"

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

    const [board, setBoard] = useState(
        createBoard(15, {
            holes: [
                { x: 1, y: 1 },
                { x: 2, y: 1 },
            ],
        })
    )

    const removeTile = (x: number, y: number): void => {
        setBoard(boardSet(board, { x, y }, "hole"))
    }

    return (
        <div className="center">
            <Board removeTile={removeTile} boardData={board} />
        </div>
    )
}

export default Root
