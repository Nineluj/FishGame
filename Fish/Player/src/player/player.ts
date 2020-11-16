import { PlayerInterface } from "../../../Common/player-interface"
import { GameState } from "../../../Common/src/models/gameState"
import {
    Strategy,
    getPenguinPlacementStrategy,
    getSkipTurnStrategy,
    getPenguinMaxMinMoveStrategy,
} from "../strategy/strategy"
import { Referee } from "../../../Admin/src/referee/referee"
import { Action } from "../../../Common/src/models/action"

export const DEFAULT_MOVES_AHEAD = 2

interface Writeable {
    write(s: string): void
}

const dummyWriteable = {
    write(s: string): void {},
}

/**
 * Object that uses the minMax move and the zig zag placement
 * strategies and communicates with the referee to play a game of Fish
 */
export class AIPlayer implements PlayerInterface {
    private strategy: Strategy
    private output: Writeable

    /**
     * @param referee is the referee that the player interacts with
     * to make actions. The referee is tasked with calling the methods
     * on this player to give it information about the game
     */
    constructor(output?: Writeable, movesAhead?: number) {
        if (!movesAhead) {
            movesAhead = DEFAULT_MOVES_AHEAD
        }
        this.strategy = getPenguinMaxMinMoveStrategy(
            movesAhead,
            getPenguinPlacementStrategy(getSkipTurnStrategy())
        )

        if (output) {
            this.output = output
        } else {
            this.output = dummyWriteable
        }
    }

    notifyBanned(reason: string): void {
        this.output.write(`We were banned. Referee's explanation: ${reason}`)
    }

    updateGameState(gs: GameState): void {}

    getNextAction(gs: GameState): Action {
        return this.strategy.getNextAction(gs)
    }

    /**
     * Notify the player that the tournament is starting
     */
    notifyTournamentIsStarting() {}

    /**
     * Update the AI Player that they have been pushed through to the next round of the tournament
     */
    advanceToNextRound() {}
}
