import React, { useState } from "react"
import * as electron from "electron"
import { Board } from "@/renderer/board/board"
import { boardSet, createBoard } from "@/models/board"
import { Snackbar } from "@material-ui/core"
import MuiAlert from "@material-ui/lab/Alert"
import {
    createGameState,
    movePenguin,
    getPlayerWhoseTurnItIs,
    placePenguin,
} from "@/models/gameState/gameState"
import { Point } from "@/models/point"
import { getViewBoard } from "./utils"

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

    const [gameState, setGameState] = useState(
        createGameState([
            {
                age: 15,
                id: "bar",
                penguinColor: "brown",
                penguins: [],
                score: 0,
            },
            {
                age: 25,
                id: "baz",
                penguinColor: "red",
                penguins: [],
                score: 0,
            },
            {
                age: 25,
                id: "baz",
                penguinColor: "red",
                penguins: [],
                score: 0,
            },
        ])
    )

    const [selectedPenguin, setSelectedPenguin] = useState<undefined | Point>()
    const [errorMessage, setErrorMessage] = useState<null | string>(null)

    const onTileClickPenguinPlacement = (x: number, y: number) => {
        setGameState(
            placePenguin(gameState, getPlayerWhoseTurnItIs(gameState)[0].id, {
                x,
                y,
            })
        )
    }

    const onTileClickPlaying = (x: number, y: number) => {
        if (!selectedPenguin) {
            setErrorMessage("You must select the penguin you want to move")
        } else {
            setGameState(
                movePenguin(
                    gameState,
                    getPlayerWhoseTurnItIs(gameState)[0].id,
                    selectedPenguin,
                    { x, y }
                )
            )
        }
    }

    const onTileClick = (x: number, y: number) => {
        if (gameState.phase === "playing") {
            onTileClickPlaying(x, y)
        }

        if (gameState.phase === "penguinPlacement") {
            onTileClickPenguinPlacement(x, y)
        }
    }

    const onPenguinClick = (x: number, y: number) => {
        setSelectedPenguin({ x, y })
    }

    return (
        <div className="center">
            {/* TODO maybe make this its own component? */}
            <Snackbar
                open={errorMessage !== null}
                autoHideDuration={4000}
                onClose={() => {
                    setErrorMessage(null)
                }}
            >
                <MuiAlert elevation={6} variant="filled" severity="error">
                    {errorMessage}
                </MuiAlert>
            </Snackbar>
            <Board
                onPenguinClick={onPenguinClick}
                onTileClick={onTileClick}
                board={getViewBoard(gameState)}
            />
        </div>
    )
}

export default Root
