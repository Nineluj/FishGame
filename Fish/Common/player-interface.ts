import { Action } from "./src/models/action"
import { GameState } from "./src/models/gameState"

/**
 * A player is an software component that knows how to interact with a referee
 * to play a game of fish
 */

export interface PlayerInterface {
    /**
     * Notify a player that they have been banned, along with the reason for it. Any other calls they make to
     * the referee will be immediately rejected.
     */
    notifyBanned(reason: string): void

    /**
     * Notify the player there is a new game state
     */
    updateGameState(gs: GameState): void

    /**
     * Asks the player for its next action. The player can assume that it is their turn.
     */
    getNextAction(gs: GameState): Action
}
