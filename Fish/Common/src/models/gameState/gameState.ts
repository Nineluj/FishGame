import { Player, sortPlayersByAgeAsc } from "@/models/player"
import { Board, createBoard } from "@models/board"
import { IllegalArgumentError } from "@models/errors/illegalArgument"
import { Point } from "@models/point"

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

const DEFAULT_MIN_TILES = 16
const MIN_PLAYER_COUNT = 2
const MAX_PLAYER_COUNT = 4

/**
 * Creates a new gamestate object for the given players and generates a board for the game
 * @param players List of players playing the game
 */
const createGameState = (players: Array<Player>): GameState => {
    if (
        players.length < MIN_PLAYER_COUNT ||
        players.length > MAX_PLAYER_COUNT
    ) {
        throw new IllegalArgumentError(
            `Expecting 2-4 players to create a game, got ${players.length}`
        )
    }
    return {
        board: createBoard(DEFAULT_MIN_TILES),
        phase: "penguinPlacement",
        players: sortPlayersByAgeAsc(players),
        turn: 0,
    }
}

/**
 * Place a penguin on the board on behalf of a player
 * @param gameState The current gameState
 * @param playerId The playerID of the player that is placing the penguin
 * @param point The coordinates to place the penguin at
 */
const placePenguin = (
    gameState: GameState,
    playerId: string,
    point: Point
): GameState => {
    return {
        board: [[]],
        phase: "penguinPlacement",
        players: [],
        turn: 0,
    }
}

/**
 * Moves a penguin on behalf of the specified player, if it is their turn
 * @param gameState The current GameState
 * @param playerId The player who is attempting the move
 * @param dst The coordinates that penguin is moving to
 */
const movePenguin = (
    gameState: GameState,
    playerId: string,
    dst: Point
): GameState => {
    return {
        board: [[]],
        phase: "penguinPlacement",
        players: [],
        turn: 0,
    }
}

/**
 * Determines whether a penguin can be moved between a src and dst spot
 * @param gameState The current GameState
 * @param playerId The playerID of the player attempting the move
 * @param src The current location of the penguin
 * @param dst The target location of the penguin
 */
const canMovePenguin = (
    gameState: GameState,
    playerId: string,
    src: Point,
    dst: Point
): GameState => {
    return {
        board: [[]],
        phase: "penguinPlacement",
        players: [],
        turn: 0,
    }
}

export { GameState, createGameState }
