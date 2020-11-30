import { Connection } from "../common/connection"
import { PlayerInterface } from "../../../Common/player-interface"
import { Action } from "../../../Common/src/models/action"
import { GameState } from "../../../Common/src/models/gameState"

class PlayerProxy implements PlayerInterface {
    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }
    notifyGameStart(gs: GameState): void {
        throw new Error("Method not implemented.")
    }
    notifyBanned(reason: string): void {
        throw new Error("Method not implemented.")
    }
    updateGameState(gs: GameState): void {
        throw new Error("Method not implemented.")
    }
    getNextAction(gs: GameState): Action {
        throw new Error("Method not implemented.")
    }
    notifyTournamentIsStarting(): void {
        throw new Error("Method not implemented.")
    }
    notifyTournamentOver(didIWin: boolean): void {
        throw new Error("Method not implemented.")
    }
}

export { PlayerProxy }
