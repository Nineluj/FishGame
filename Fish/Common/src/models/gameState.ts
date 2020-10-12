import { Player } from "@models/player"
import { Board, createBoard } from "@models/board"

type GamePhase = "penguinPlacement" | "playing" | "over"

/**
 * Represents the state necessary for an entire game of Fish
 */
interface GameState {
    /** The collection of tiles and holes that make up the board */
    board: Board
    /** Current phase of the game, operations on game state may be prohibited based on phase */
    phase: GamePhase
    /** Players ordered in age order ascending */
    players: Array<Player>
    /** The current turn, increases by increments of one */
    turn: number
}

const createGameState = (players: Array<Player>): GameState => {
    return {
        board: createBoard(16),
        phase: "penguinPlacement",
        players: players,
        turn: 0,
    }
}
