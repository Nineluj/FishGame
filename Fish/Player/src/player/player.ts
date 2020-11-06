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
export class Player implements PlayerInterface {
    private strategy: Strategy
    private referee: Referee
    private output: Writeable

    /**
     * @param referee is the referee that the player interacts with
     * to make actions. The referee is tasked with calling the methods
     * on this player to give it information about the game
     */
    constructor(referee: Referee, output?: Writeable) {
        this.strategy = getPenguinMaxMinMoveStrategy(
            DEFAULT_MOVES_AHEAD,
            getPenguinPlacementStrategy(getSkipTurnStrategy())
        )

        this.referee = referee

        if (output) {
            this.output = output
        } else {
            this.output = dummyWriteable
        }
    }

    notifyBanned(reason: string): void {
        this.output.write(`We were banned. Referee's explanation: ${reason}`)
    }

    updateState(gs: GameState, isYourTurn: boolean): void {
        if (isYourTurn) {
            this.referee.makeAction(this.strategy.getNextAction(gs))
        }
    }
}
