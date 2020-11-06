import { PlayerInterface } from "../../../Common/player-interface"
import { GameState } from "../../../Common/src/models/gameState"
import {
    Strategy,
    getPenguinPlacementStrategy,
    getSkipTurnStrategy,
    getPenguinMaxMinMoveStrategy,
} from "../strategy/strategy"
import { Referee } from "../../../Admin/src/referee/referee"

const DEFAULT_MOVES_AHEAD = 2

/**
 * Object that uses the minMax move and the zig zag placement
 * strategies to communicate with the referee to play a game of Fish
 */
export class Player implements PlayerInterface {
    private strategy: Strategy
    private referee: Referee

    /**
     * @param referee is the referee that the player interacts with
     * to make actions. The referee is tasked with calling the methods
     * on this player to give it information about the game
     */
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
