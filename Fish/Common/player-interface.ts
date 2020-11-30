import { Action } from "./src/models/action"
import { GameState } from "./src/models/gameState"
import { PenguinColor } from "./src/models/player"

/**
 * A player is an software component that knows how to interact with a referee
 * to play a game of fish
 */

export interface PlayerInterface {
    /**
     * Notify a player that they are playing in a new game
     * @param color Color that the player is using for this game
     */
    notifyPlayAs(color: PenguinColor): void

    /**
     * Notify a player of its opponents.
     * TODO: check piazza to see if we have to repeat this phase
     * if a player fails
     */
    notifyPlayWith(opponentColors: Array<PenguinColor>): void

    /**
     * Notify a player that they have been banned, along with the reason for it. Any other calls they make to
     * the referee will be immediately rejected.
     */
    notifyBanned(reason: string): void

    /**
     * Notifies the player of an action that was taken by an opponent
     */
    notifyOpponentAction(action: Action): void

    /**
     * Asks the player for its next action. The player can assume that it is their turn.
     */
    getNextAction(gs: GameState): Action

    /**
     * Notify the player that the tournament is starting
     */
    notifyTournamentIsStarting(): void

    /**
     * Notify the player that the tournament is over
     */
    notifyTournamentOver(didIWin: boolean): void
}
