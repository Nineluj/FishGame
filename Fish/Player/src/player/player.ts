import { PlayerInterface } from "../../../Common/player-interface"
import { GameState } from "../../../Common/src/models/gameState"
import {
    Strategy,
    getPenguinPlacementStrategy,
    getSkipTurnStrategy,
    getPenguinMaxMinMoveStrategy,
} from "src/strategy/strategy"
import { Referee } from "../../../Admin/src/referee/referee"

/**
 * TODO: write JSDoc
 */
export class Player implements PlayerInterface {
    private strategy: Strategy
    private referee: Referee

    constructor(referee: Referee, movesAhead: number) {
        this.strategy = getPenguinMaxMinMoveStrategy(
            movesAhead,
            getPenguinPlacementStrategy(getSkipTurnStrategy())
        )

        this.referee = referee
    }

    notifyBanned(reason: string): void {
        throw new Error("o shit u fucked")
    }

    updateState(gs: GameState, isYourTurn: boolean): void {
        if (isYourTurn) {
            this.referee.makeAction(this.strategy.getNextAction(gs))
        }
    }
}
