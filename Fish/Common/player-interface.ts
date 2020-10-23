import { GameState } from "./src/models/gameState"
interface PlayerInterface {
    /**
     *  Notify a player that the most recent move/penguin placement they attempted to make was accepted.
     */
    acceptMove(): void

    /**
     * Notify a player that the most recent move/penguin placement they attempted to make was rejected.
     */
    rejectMove(reason: string): void

    /**
     * Notifies a player that it is their turn to make a move or place a penguin (dependent on the `phase` of the current GameState).
     */
    notifyTurn(): void

    /**
     * Notifies a player that their turn has been skipped by the referee. This may be because they have no * moves left, they took too long to make a move.
     */
    notifySkippedTurn(reason: string): void

    /**
     * Notify a player that they have been banned, along with the reason for it. Any other calls they make to * the referee will be immediately rejected.
     */
    notifyBanned(reason: string): void

    /**
     * Notify a player that the game has ended.
     */
    notifyGameOver(): void

    /**
     *  Notify a player that all penguins have been placed and the actual game has now begun.
     */
    notifyStartGame(): void

    /**
     * Notifies the player of the most recent GameState.
     */
    updateState(gs: GameState): void
}
