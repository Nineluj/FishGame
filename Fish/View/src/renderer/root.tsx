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
 * React component to draw the entire game board.
 * Includes visualization of the hexagonal tile board, with number of fish,
 * as well as placement of each players' penguins, and whose turn it is.
 *
 * Has the ability to queue subsequent GameStates so the view can
 * be rendered with a delay after each game action.
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
