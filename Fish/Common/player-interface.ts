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
     * Notify a player that they have been banned, along with the reason for it.
     * A referee may optionally call this method if the player has submitted an invalid
     * move.
     */
    notifyBanned(reason: string): Promise<void>

    /**
     * Gets the next penguin move from the player
     */
    getNextMove(gs: GameState): Promise<Action>

    /**
     * Gets the next penguin placement from the player
     */
    getNextPlacement(gs: GameState): Promise<Action>

    /**
     * Notify the player that the tournament is starting
     */
    notifyTournamentIsStarting(): Promise<void>

    /**
     * Notify the player that the tournament is over
     */
    notifyTournamentOver(didIWin: boolean): Promise<void>
}
