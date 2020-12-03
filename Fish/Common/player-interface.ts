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
    notifyPlayAs(color: PenguinColor): Promise<void>

    /**
     * Notify a player of its opponents.
     * if a player fails
     */
    notifyPlayWith(opponentColors: Array<PenguinColor>): Promise<void>

    /**
     * Notify a player that they have been banned, along with the reason for it. Any other calls they make to
     * the referee will be immediately rejected.
     */
    notifyBanned(reason: string): Promise<void>

    /**
     * Notifies the player of an action that was taken by an opponent
     */
    notifyOpponentAction(action: Action): Promise<void>

    /**
     * Asks the player for its next action. The player can assume that it is their turn.
     */
    getNextAction(gs: GameState): Promise<Action>

    /**
     * Notify the player that the tournament is starting
     */
    notifyTournamentIsStarting(): Promise<void>

    /**
     * Notify the player that the tournament is over
     */
    notifyTournamentOver(didIWin: boolean): Promise<void>
}
