import React, { useState } from "react"
import * as electron from "electron"
import { Board } from "./board/board"
import { Snackbar } from "@material-ui/core"
import MuiAlert from "@material-ui/lab/Alert"
import {
    createGameState,
    movePenguin,
    getPlayerWhoseTurnItIs,
    placePenguin,
} from "../../../Common/src/models/gameState/gameState"
import { Point } from "../../../Common/src/models/point"
import { getViewBoard } from "./utils"
import { Players } from "./players/players"

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

    /**
     * Dummy gameState used to showcase the functionality of the view.
     */
    const [gameState, setGameState] = useState(
        createGameState([
            {
                id: "bar",
                penguinColor: "brown",
                penguins: [],
                score: 0,
            },
            {
                id: "baz",
                penguinColor: "red",
                penguins: [],
                score: 0,
            },
            {
                id: "foo",
                penguinColor: "black",
                penguins: [],
                score: 0,
            },
        ])
    )

    /**
     * The penguin that has been selected by being clicked. A penguin must first be selected
     * in order to be moved. A penguin cannot be selected during the placement phase
     */
    const [selectedPenguin, setSelectedPenguin] = useState<undefined | Point>()

    /**
     * Error message that gets displayed to the user
     */
    const [errorMessage, setErrorMessage] = useState<null | string>(null)

    /**
     * Places a penguin for the player on their view
     * when a penguin clicks a tile during the penguin placement phase
     */
    const onTileClickPenguinPlacement = (x: number, y: number) => {
        setGameState(
            placePenguin(gameState, getPlayerWhoseTurnItIs(gameState).id, {
                x,
                y,
            })
        )
    }

    /**
     * Moves a penguin for the player on their view
     * when a penguin clicks a tile during the penguin placement phase
     */

    const onTileClickPlaying = (x: number, y: number) => {
        if (!selectedPenguin) {
            setErrorMessage("You must select the penguin you want to move")
        } else {
            try {
                setGameState(
                    movePenguin(
                        gameState,
                        getPlayerWhoseTurnItIs(gameState).id,
                        selectedPenguin,
                        { x, y }
                    )
                )
            } catch (e) {
                setErrorMessage(e.message)
            }
        }
    }

    console.log(getPlayerWhoseTurnItIs(gameState))

    /**
     * Delegates the handling of the tile click action based
     * on the phase of the game
     */
    const onTileClick = (x: number, y: number) => {
        if (gameState.phase === "playing") {
            onTileClickPlaying(x, y)
        }

        if (gameState.phase === "penguinPlacement") {
            onTileClickPenguinPlacement(x, y)
        }
    }

    /**
     * Selects the penguin at the given location to be
     * the player's selectedPenguin
     */
    const onPenguinClick = (x: number, y: number) => {
        if (
            selectedPenguin &&
            selectedPenguin.x === x &&
            selectedPenguin.y === y
        ) {
            setSelectedPenguin(undefined)
        }
        setSelectedPenguin({ x, y })
    }

    console.log(gameState)

    /**
     * Render functionality
     */
    return (
        <>
            <Players gameState={gameState} />
            <div className="center">
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
        </>
    )
}

export default Root
