import { Player, sortPlayersByAgeAsc } from "@/models/player"
import {
    Board,
    boardGet,
    boardSet,
    createBoard,
    getReachableTilesFrom,
} from "@models/board"
import { IllegalArgumentError } from "@models/errors/illegalArgument"
import { InvalidMoveError } from "@models/errors/invalidMoveError"
import { changePenguinPosition } from "@/models/player"
import { containsPoint, Point } from "@models/point"
import { Tile } from "@models/tile"
import update from "immutability-helper"

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
 * Get the player who's turn it currently is, along with their index in the
 * player array.
 * @param gameState State from which you want to find the current player
 */
const getPlayerWhoseTurnItIs = (gameState: GameState): [Player, number] => {
    const turnIndex = gameState.turn % gameState.players.length
    return [gameState.players[turnIndex], turnIndex]
}

/**
 * Moves a penguin on behalf of the specified player, if it is their turn
 * @param gameState The current GameState
 * @param playerId The player who is attempting the move
 * @param origin The coordinate that penguin is currently on
 * @param dst The coordinates that penguin is moving to
 */
const movePenguin = (
    gameState: GameState,
    playerId: string,
    origin: Point,
    dst: Point
): GameState => {
    const [validMove, failReason] = canMovePenguin(
        gameState,
        playerId,
        origin,
        dst
    )

    if (!validMove) {
        throw new InvalidMoveError(failReason)
    }

    // Get the required information to update the state
    const dstTile = boardGet(gameState.board, dst) as Tile
    const [player, playerIndex] = getPlayerWhoseTurnItIs(gameState)

    // New board created by setting the old tile to be a hole and setting the new
    // tile to be occupied
    const newBoard = boardSet(boardSet(gameState.board, origin, "hole"), dst, {
        occupied: true,
        fish: 0,
    })

    // Update the player by changing position of the penguin
    let newPlayer = changePenguinPosition(player, origin, dst)
    // Next update the player's score
    newPlayer = {
        ...newPlayer,
        score: newPlayer.score + dstTile.fish,
    }

    // update and return the new game state
    return update(gameState, {
        board: {
            $set: newBoard,
        },
        turn: { $apply: (turn) => turn + 1 },
        phase: { $set: "playing" },
        players: {
            [playerIndex]: {
                $set: newPlayer,
            },
        },
    })
}

/**
 * Determines whether a penguin can be moved between a src and dst spot
 * @param gameState The current GameState
 * @param playerId The playerID of the player attempting the move
 * @param origin The current location of the penguin
 * @param dst The target location of the penguin
 */
const canMovePenguin = (
    gameState: GameState,
    playerId: string,
    origin: Point,
    dst: Point
): [boolean, string] => {
    // Check if it's an out of turn move
    const [currentMovePlayer, _] = getPlayerWhoseTurnItIs(gameState)

    if (currentMovePlayer.id !== playerId) {
        return [
            false,
            `cannot play out of order, expecting 
        ${currentMovePlayer.id} to play and not ${playerId} `,
        ]
    }

    // Make sure that the player has a penguin at the origin position
    if (!containsPoint(currentMovePlayer.penguins, origin)) {
        return [
            false,
            `player must have a penguin at the origin
        position to make a move`,
        ]
    }

    // Check if the move to dst is valid
    const possibleMoves = getReachableTilesFrom(gameState.board, origin)

    if (!containsPoint(possibleMoves, dst)) {
        return [false, `move from ${origin} to ${dst} is not valid`]
    }

    return [true, ""]
}

export { GameState, createGameState }
