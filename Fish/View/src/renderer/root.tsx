import React from "react"
import * as electron from "electron"
import { Board } from "./board/board"
import { GameState } from "../../../Common/src/models/gameState"
import { getViewBoard } from "./utils"
import { Players } from "./players/players"
import {
    GameVisualizer,
    runGameWithVisualizer,
} from "../../../Admin/src/visualizer/game-visualizer"

/**
 * Uses Electron's sharedObject to get the number of players
 * to use for this game
 */
const getNumPlayers = (): number => {
    const sharedObj = electron.remote.getGlobal("sharedObject")
    return sharedObj["numberOfPlayers"]
}

const INITIAL_RENDER_DELAY_MS = 2000
const TIME_BETWEEN_ACTIONS_MS = 1000

interface RootState {
    /**
     * Game state that is shown in the view
     */
    gameState: undefined | GameState
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
    private queuedRenders: number

    constructor(props: IProps) {
        super(props)

        this.queuedRenders = 0
        this.state = {
            gameState: undefined,
        }
    }

    async changeGameToRender(gs: GameState) {
        this.queuedRenders++
        setTimeout(
            () =>
                this.setState(
                    {
                        gameState: gs,
                    },
                    () => {
                        this.queuedRenders--
                    }
                ),
            TIME_BETWEEN_ACTIONS_MS * this.queuedRenders
        )
    }

    componentDidMount() {
        setTimeout(() => {
            const visualizer = new GameVisualizer(async (gs) =>
                this.changeGameToRender(gs)
            )
            runGameWithVisualizer(getNumPlayers(), visualizer)
        }, INITIAL_RENDER_DELAY_MS)
    }

    /**
     * Terminates the program
     * @param _ Event calling the function, is disregarded
     */
    closeApp = (_: Event): void => {
        electron.ipcRenderer.send("close-me")
    }

    render() {
        const { gameState } = this.state

        if (gameState === undefined) {
            return (
                <div>
                    <h1>The Fish Game!</h1>
                    Starting shortly...
                </div>
            )
        }

        /**
         * Render functionality
         */
        return (
            <div style={{ background: "#ADD8E6" }}>
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
