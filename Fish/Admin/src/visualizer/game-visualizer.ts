import { GameObserver, GameResult, Referee } from "../referee/referee"
import { GameState } from "../../../Common/src/models/gameState"
import { AIPlayer } from "../../../Player/src/player/player"
import { PlayerInterface } from "../../../Common/player-interface"
import { createBoard } from "../../../Common/src/models/board"

type Notify = (gs: GameState) => Promise<void>

/**
 * A game visualizer is a Game Observer with a public
 * state that can be used by a view to draw game states
 */
class GameVisualizer implements GameObserver {
    public state: GameState | undefined
    public result: GameResult | undefined

    private notifyFun: Notify

    constructor(fn: Notify) {
        this.notifyFun = fn
    }

    async update(gs: GameState) {
        this.state = gs
        this.notifyFun(gs)
    }

    async notifyOver(result: GameResult) {
        this.result = result
    }
}

/**
 * Sets up a game of fish with a game visualizer and the
 * given number of AI players. The referee will run the game
 * until the game is over.
 */
const runGameWithVisualizer = async (
    numPlayers: number,
    visualizer: GameVisualizer
) => {
    const aiPlayers: Array<PlayerInterface> = []
    for (let i = 0; i < numPlayers; i++) {
        aiPlayers.push(new AIPlayer())
    }

    const ref = new Referee(
        aiPlayers,
        createBoard(24, { randomizeFishPerTile: true })
    )

    ref.registerGameObserver(visualizer)
    ref.runGamePlay()
}

export { GameVisualizer, runGameWithVisualizer }
