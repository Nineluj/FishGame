import { PlayerInterface } from "../../../Common/player-interface"
import { GameState } from "../../../Common/src/models/gameState"
import {
    getPenguinMaxMinMoveStrategy,
    getPenguinPlacementStrategy,
    getSkipTurnStrategy,
    Strategy,
} from "../strategy/strategy"
import { Action } from "../../../Common/src/models/action"
import { PenguinColor } from "../../../Common/src/models/player"

export const DEFAULT_MOVES_AHEAD = 2

export interface Writeable {
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
    private moveStrategy: Strategy
    private placementStrategy: Strategy
    protected output: Writeable

    /**
     * to make actions. The referee is tasked with calling the methods
     * on this player to give it information about the game
     * @param output Optional writeable which player will use to log misc information
     * @param movesAhead How many moves ahead the AI should look for the planning
     *      uses 2 as the default if not passed
     */
    constructor(output?: Writeable, movesAhead?: number) {
        if (!movesAhead) {
            movesAhead = DEFAULT_MOVES_AHEAD
        }

        this.placementStrategy = getPenguinPlacementStrategy(
            getSkipTurnStrategy()
        )
        this.moveStrategy = getPenguinMaxMinMoveStrategy(
            movesAhead,
            getSkipTurnStrategy()
        )

        if (output) {
            this.output = output
        } else {
            this.output = dummyWriteable
        }
    }

    async notifyBanned(reason: string): Promise<void> {
        this.output.write(`We were banned. Referee's explanation: ${reason}`)
    }

    async notifyTournamentIsStarting(): Promise<void> {}

    async notifyTournamentOver(didIWin: boolean): Promise<void> {}

    async notifyPlayAs(color: PenguinColor): Promise<void> {}

    async notifyPlayWith(opponentColors: Array<PenguinColor>): Promise<void> {}

    async getNextMove(gs: GameState): Promise<Action> {
        return this.moveStrategy.getNextAction(gs)
    }

    async getNextPlacement(gs: GameState): Promise<Action> {
        return this.placementStrategy.getNextAction(gs)
    }
}
