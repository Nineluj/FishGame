import { GameState } from "./src/models/gameState"
export interface PlayerInterface {
    /**
     * Notify a player that they have been banned, along with the reason for it. Any other calls they make to
     * the referee will be immediately rejected.
     */
    notifyBanned(reason: string): void

    /**
     * Notifies the player of the most recent GameState, and if it is their turn.
     */
    updateState(gs: GameState, isYourTurn: boolean): void
}
