import { PlayerInterface } from "../../../Common/player-interface"
import { GameState } from "../../../Common/src/models/gameState"
import {
    Strategy,
    getPenguinPlacementStrategy,
    getSkipTurnStrategy,
    getPenguinMaxMinMoveStrategy,
} from "src/strategy/strategy"
import { Referee } from "../../../Admin/src/referee/referee"

const DEFAULT_MOVES_AHEAD = 2

/**
 * TODO: write JSDoc
 */
export class Player implements PlayerInterface {
    private strategy: Strategy
    private referee: Referee

    constructor(referee: Referee) {
        this.strategy = getPenguinMaxMinMoveStrategy(
            DEFAULT_MOVES_AHEAD,
            getPenguinPlacementStrategy(getSkipTurnStrategy())
        )

        this.referee = referee
    }

    notifyBanned(reason: string): void {
        console.log(`We were banned. Referee's explanation: ${reason}`)
    }

    updateState(gs: GameState, isYourTurn: boolean): void {
        if (isYourTurn) {
            this.referee.makeAction(this.strategy.getNextAction(gs))
        }
    }
}
