import { GameObserver, GameResult, Referee } from "../referee/referee"
import { GameState } from "../../../Common/src/models/gameState"
import { AIPlayer } from "../../../Player/src/player/player"
import { PlayerInterface } from "../../../Common/player-interface"

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

const runGameWithVisualizer = (
    numPlayers: number,
    visualizer: GameVisualizer
) => {
    const aiPlayers: Array<PlayerInterface> = []
    for (let i = 0; i < numPlayers; i++) {
        aiPlayers.push(new AIPlayer())
    }

    const ref = new Referee(aiPlayers)
    ref.registerGameObserver(visualizer)

    ref.runGamePlay()
}

export { GameVisualizer, runGameWithVisualizer }
