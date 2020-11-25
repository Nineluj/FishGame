import { GameObserver, GameResult, Referee } from "../referee/referee"
import { GameState } from "../../../Common/src/models/gameState"
import { AIPlayer } from "../../../Player/src/player/player"
import { PlayerInterface } from "../../../Common/player-interface"
import { createBoard } from "../../../Common/src/models/board"

/**
 * A game visualizer is an Game Observer with a public
 * state that can be used by a view to draw game states
 */
class GameVisualizer implements GameObserver {
    public state: GameState | undefined
    public result: GameResult | undefined

    update(gs: GameState): void {
        this.state = gs
    }

    notifyOver(result: GameResult): void {
        this.result = result
    }
}

/**
 * Sets up a game of fish with a game visualizer and the
 * given number of AI players. Returns the referee
 * that manages the game.
 */
const setupGameWithVisualizer = (
    numPlayers: number,
    visualizer: GameVisualizer
): Referee => {
    const aiPlayers: Array<PlayerInterface> = []
    for (let i = 0; i < numPlayers; i++) {
        aiPlayers.push(new AIPlayer())
    }

    const ref = new Referee(aiPlayers, createBoard(24))
    ref.registerGameObserver(visualizer)

    return ref
}

export { GameVisualizer, setupGameWithVisualizer }
