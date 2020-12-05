import { GameObserver, GameResult, Referee } from "../referee/referee"
import { GameState } from "../../../Common/src/models/gameState"
import { AIPlayer } from "../../../Player/src/player/player"
import { PlayerInterface } from "../../../Common/player-interface"
import { createBoard } from "../../../Common/src/models/board"
import { createBoardWithDimensions } from "../../../Common/src/adapters/boardAdapter"

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
 * Runs a complete game of fish with the given game visualizer and the
 * given number of AI players. Uses a board with 25 (5 x 5) tiles, and
 * randomizes the fish values on each tile.
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
        // createBoardWithDimensions(5, 5, 2)
        createBoard(25, { randomizeFishPerTile: true })
    )

    ref.registerGameObserver(visualizer)
    ref.runGamePlay()
}

export { GameVisualizer, runGameWithVisualizer }
