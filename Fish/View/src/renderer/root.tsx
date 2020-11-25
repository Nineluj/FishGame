import React from "react"
import * as electron from "electron"
import { Board } from "./board/board"
import { GameState } from "../../../Common/src/models/gameState/gameState"
import { getViewBoard } from "./utils"
import { Players } from "./players/players"
import {
    GameVisualizer,
    setupGameWithVisualizer,
} from "../../../Admin/src/visualizer/game-visualizer"
import { Referee } from "../../../Admin/src/referee/referee"

const TIME_BETWEEN_ACTIONS_MS = 500

interface RootState {
    /**
     * Game state that is shown in the view
     */
    gameState: undefined | GameState

    gameHasStarted: boolean
}

interface IProps {}

/**
 * Draws the main view.
 *
 * It has a game visualizer but does not use it since we could not
 * figure out how make the observer pattern work with React and the
 * fact that this language is single threaded and doesn't have
 * limited continuations.
 *
 * Instead calls the referee's playTurn function so that it
 * can play one turn at a time and render the gameState after each
 * turn has been taken
 */
class Root extends React.Component<IProps, RootState> {
    private visualizer: GameVisualizer
    private ref: Referee
    private interval: any

    constructor(props: IProps) {
        super(props)

        this.visualizer = new GameVisualizer()
        this.ref = setupGameWithVisualizer(4, this.visualizer)

        this.state = {
            gameState: this.ref.getGameState(),
            gameHasStarted: false,
        }
    }

    /**
     * Terminates the program
     * @param _ Event calling the function, is disregarded
     */
    closeApp = (_: Event): void => {
        electron.ipcRenderer.send("close-me")
    }

    /**
     * Play a single turn of the game
     */
    stepGame(ref: Referee) {
        if (ref.getGamePhase() !== "over") {
            ref.playTurn()
            this.setState({ gameState: ref.getGameState() })
        } else {
            clearInterval(this.interval)
        }
    }

    /**
     * Start a game of fish
     */
    startGame(ref: Referee) {
        this.setState({ gameHasStarted: true })
        this.interval = setInterval(
            () => this.stepGame(ref),
            TIME_BETWEEN_ACTIONS_MS
        )
    }

    render() {
        const { gameState, gameHasStarted } = this.state

        if (gameState === undefined) {
            return <h1>Loading game...</h1>
        }

        /**
         * Render functionality
         */
        return (
            <div style={{ background: "#ADD8E6" }}>
                {!gameHasStarted && (
                    <button onClick={() => this.startGame(this.ref)}>
                        Start
                    </button>
                )}
                <Players gameState={gameState} />
                <div className="center">
                    <Board
                        onPenguinClick={() => {}}
                        onTileClick={() => {}}
                        board={getViewBoard(gameState)}
                    />
                </div>
            </div>
        )
    }
}

export default Root
