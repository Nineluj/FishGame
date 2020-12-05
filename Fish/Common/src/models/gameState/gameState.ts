import { changePenguinPosition, Player, putPenguin } from "../player"
import {
    Board,
    boardGet,
    boardSet,
    createBoard,
    getReachableTilesFrom,
} from "../board"
import { IllegalArgumentError } from "../errors/illegalArgumentError"
import { GameStateActionError } from "../errors/gameStateActionError"
import { InvalidMoveError } from "../errors/invalidMoveError"
import { containsPoint, Point } from "../point"
import { Tile } from "../tile"
import update from "immutability-helper"
import { makeUnoccupied } from "../board/board"

/*
The game state is modeled like a FSM as follows:

       each player has placed 6 - N penguins
                                            no players can make a move
 +------------------+             +------------+                 +--------+
 | penguinPlacement +------------>+  playing   +---------------->+  over  |
 +----+--------+----+             +--+------+--+                 +--------+
      ^        |                     ^      |
      |        |                     |      |
      |        |                     |      |
      +--------+                     +------+
      placePenguin                  movePenguin
                                    OR skipTurn

(note: placePenguin, movePenguin and skipTurn need to be called by the player
whose turn it is. Out of order actions will result in an exception being thrown)

During penguinPlacement, GameState needs enough putPenguin calls until the
GameState has 6 - N penguins per player. After that, advancePhase will
change the phase to playing during which players can either use movePenguin
or skipTurn to update the state of the game. The over phase will be reachable
once the game is in a state in which no player can make any new moves. Calling
advancePhase at that point will result in a new GameState indicating that the
game is over.

It is the referee's responsibility to skip a player's turn if they cannot play.
 */

// A GamePhase represents the stage of the game.
// - penguinPlacement when players are placing their penguin on the board
// - playing when the players are moving penguins
// - over when no player can move a penguin
export type GamePhase = "penguinPlacement" | "playing" | "over"

/**
 * Represents the state necessary for an entire game of Fish
 */
interface GameState {
    /** The collection of tiles and holes that make up the board */
    board: Board
    /**
     * Current phase of the game, operations on game state may be prohibited based on phase
     * This is always updated after a move. if the state is over, that means no penguins can be moved
     */
    phase: GamePhase
    /**
     * Players are players in the game in the order they will take turns.
     * After the state is updated (by a move, a skip, a placement), the order will rotate.
     */
    players: Array<Player>
}

// Represents the number of penguins, minus the # of players, that each player
// has to place before the game can move past the penguinPlacement phase
const PENGUIN_PLACEMENTS_NEEDED_PER_PLAYER = 6

const DEFAULT_MIN_TILES = 16
export const MIN_PLAYER_COUNT = 2
export const MAX_PLAYER_COUNT = 4

/**
 * Creates a new GameState object for the given players and generates a board for the game
 * @param players List of players playing the game
 */
const createGameState = (players: Array<Player>): GameState => {
    return createGameStateCustomBoard(players, createBoard(DEFAULT_MIN_TILES))
}

/**
 * How many penguins each player must place to advance to the playing phase
 * @param gs The state
 */
const getNumberOfPenguinsToPlacePerPlayer = (gs: GameState): number => {
    return PENGUIN_PLACEMENTS_NEEDED_PER_PLAYER - gs.players.length
}

const createGameStateCustomBoard = (
    players: Array<Player>,
    board: Board
): GameState => {
    if (
        players.length < MIN_PLAYER_COUNT ||
        players.length > MAX_PLAYER_COUNT
    ) {
        throw new IllegalArgumentError(
            `Expecting 2-4 players to create a game, got ${players.length}`
        )
    }

    const allPenguinsPlaced = players.every(
        (player) =>
            player.penguins.length ===
            PENGUIN_PLACEMENTS_NEEDED_PER_PLAYER - players.length
    )

    return {
        board: board,
        phase: allPenguinsPlaced ? "playing" : "penguinPlacement",
        players: players,
    }
}

/**
 * Get the player with the given ID from the game state
 */
const getPlayerById = (gs: GameState, pid: string): Player => {
    const potential = gs.players.filter((p) => p.id === pid)

    if (potential.length > 1) {
        throw new IllegalArgumentError("more than one player with the same id")
    } else if (potential.length === 0) {
        throw new IllegalArgumentError(
            "could not find player with the given id"
        )
    }

    return potential[0]
}

/**
 * Place a penguin on the board on behalf of a player
 * @param gameState The current gameState
 * @param playerId The playerID of the player that is placing the penguin
 * @param dst The coordinates to place the penguin at
 */
const placePenguin = (
    gameState: GameState,
    playerId: string,
    dst: Point
): GameState => {
    validatePenguinPlacement(gameState, dst, playerId)
    const dstTile = boardGet(gameState.board, dst) as Tile
    const player = getPlayerWhoseTurnItIs(gameState)

    // Create the new player by adding a new penguin for them.
    // no points are given since points are only awarded when a penguin
    // moves off a tile
    const newPlayer = {
        ...putPenguin(player, dst),
    }

    // Create the new board in which the tile where the penguin was placed is occupied
    const newBoard = boardSet(gameState.board, dst, {
        fish: dstTile.fish,
        occupied: true,
    })

    const newGameState = update(gameState, {
        players: {
            // applies the set operation first to update the player, then
            // rotates the array using arrayRotate
            $apply: arrayRotate,
            [0]: {
                $set: newPlayer,
            },
        },
        board: {
            $set: newBoard,
        },
    })

    const newPhase: GamePhase = canAdvanceToPlaying(newGameState)
        ? "playing"
        : "penguinPlacement"

    // Use update to get a new version of the game state without mutating anything
    return {
        ...newGameState,
        phase: newPhase,
    }
}

const validatePenguinPlacement = (
    gameState: GameState,
    destination: Point,
    playerId: string
) => {
    // check the phase
    if (gameState.phase !== "penguinPlacement") {
        throw new GameStateActionError(
            `placePenguin expected penguinPlacement phase, got ${gameState.phase}`
        )
    }

    validatePlacementPosition(gameState.board, destination)
    validatePlayer(gameState, playerId)
}

// Throw if a penguin placement position is not an unoccupied tile
const validatePlacementPosition = (board: Board, destination: Point) => {
    const dstTile = boardGet(board, destination)
    if (dstTile === "hole" || dstTile === undefined || dstTile.occupied) {
        throw new IllegalArgumentError(
            `cannot place penguin on tile ${JSON.stringify(dstTile)}`
        )
    }
}

// throws if it is not the player's turn, or the player has placed too many penguins
const validatePlayer = (gameState: GameState, playerId: string) => {
    const player = getPlayerWhoseTurnItIs(gameState)
    // is the player playing out of order
    if (player.id !== playerId) {
        throw new GameStateActionError(`cannot play out of order, expecting
            ${player.id} to play and not ${playerId}`)
    }

    // check that the player isn't trying to place too many penguins
    if (
        player.penguins.length >= getNumberOfPenguinsToPlacePerPlayer(gameState)
    ) {
        throw new GameStateActionError(
            `cannot place more than ${getNumberOfPenguinsToPlacePerPlayer(
                gameState
            )} penguins per player`
        )
    }
}

/**
 * Get the player who's turn it currently is, along with their index in the
 * player array.
 * @param gameState State from which you want to find the current player
 */
const getPlayerWhoseTurnItIs = (gameState: GameState): Player => {
    return gameState.players[0]
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
    if (gameState.phase !== "playing") {
        throw new GameStateActionError(
            `movePenguin expected playing phase, got ${gameState.phase}`
        )
    }

    const { validMove, errorMessage } = canMovePenguin(
        gameState,
        playerId,
        origin,
        dst
    )

    if (!validMove) {
        throw new InvalidMoveError(errorMessage)
    }

    // Get the required information to update the state
    const originTile = boardGet(gameState.board, origin) as Tile
    const dstTile = boardGet(gameState.board, dst) as Tile
    const player = getPlayerWhoseTurnItIs(gameState)

    // New board created by setting the old tile to be a hole and setting the new
    // tile to be occupied
    const newBoard = boardSet(boardSet(gameState.board, origin, "hole"), dst, {
        occupied: true,
        fish: dstTile.fish,
    })

    // Update the player by changing position of the penguin
    let newPlayer = changePenguinPosition(player, origin, dst)

    // Next update the player's score
    newPlayer = {
        ...newPlayer,
        score: newPlayer.score + originTile.fish,
    }

    const updatedGameState = update(gameState, {
        board: {
            $set: newBoard,
        },
        players: {
            // applies the set operation first to update the player, then
            // rotates the array using arrayRotate
            $apply: arrayRotate,
            [0]: {
                $set: newPlayer,
            },
        },
    })

    const newState: GamePhase = canAdvanceToOver(updatedGameState)
        ? "over"
        : "playing"

    if (newState === "over") {
        return {
            ...updatedGameState,
            phase: "over",
        }
    }

    // update and return the new game state
    return updatedGameState
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
): { validMove: boolean; errorMessage?: string } => {
    if (gameState.phase !== "playing") {
        return {
            validMove: false,
            errorMessage: `canMovePenguin expected playing phase, got ${gameState.phase}`,
        }
    }

    // Check if it's an out of turn move
    const currentMovePlayer = getPlayerWhoseTurnItIs(gameState)

    if (currentMovePlayer.id !== playerId) {
        return {
            validMove: false,
            errorMessage: `cannot play out of order, expecting
            ${currentMovePlayer.id} to play and not ${playerId} `,
        }
    }

    // Make sure that the player has a penguin at the origin position
    if (!containsPoint(currentMovePlayer.penguins, origin)) {
        return {
            validMove: false,
            errorMessage: `player must have a penguin at the origin
        position to make a move`,
        }
    }

    // Check if the move to dst is valid
    const possibleMoves = getReachableTilesFrom(gameState.board, origin)

    if (!containsPoint(possibleMoves, dst)) {
        return {
            validMove: false,
            errorMessage: `move from ${JSON.stringify(
                origin
            )} to ${JSON.stringify(dst)} is not valid`,
        }
    }

    return { validMove: true }
}

const arrayRotate = (arr: Array<any>) => {
    let out = [...arr]
    out.push(out.shift())
    return out
}

/**
 * Skip the current player's turn
 * @param gameState The state
 * @param playerId Player whose turn will be skipped
 */
const skipTurn = (gameState: GameState, playerId: string): GameState => {
    if (gameState.phase !== "playing") {
        throw new GameStateActionError(
            `skipTurn expected playing phase, got ${gameState.phase}`
        )
    }

    const nextPlayer = getPlayerWhoseTurnItIs(gameState)
    if (playerId !== nextPlayer.id) {
        throw new IllegalArgumentError(
            `cannot skip turn of ${playerId}, expecting ${nextPlayer.id} to play`
        )
    }

    const newState: GamePhase = canAdvanceToOver(gameState) ? "over" : "playing"

    return update(gameState, {
        players: {
            $apply: arrayRotate,
        },
        phase: {
            $set: newState,
        },
    })
}

/**
 * Can the GameState's phase be advanced to the playing phase?
 */
export const canAdvanceToPlaying = (
    gs: GameState,
    numPenguins: number
): boolean => {
    // check that all the players have placed the necessary number of penguins
    for (let player of gs.players) {
        if (player.penguins.length !== numPenguins) {
            return false
        }
    }
    return true
}

/**
 * Can the GameState's phase be advanced to the playing phase?
 */
export const canAdvanceToOver = (gs: GameState): boolean => {
    if (gs.phase !== "playing") {
        return false
    }

    // verify that no player can make a move
    for (let player of gs.players) {
        for (let pos of player.penguins) {
            if (getReachableTilesFrom(gs.board, pos).length !== 0) {
                return false
            }
        }
    }

    return true
}

/**
 * Eliminates the player with the given ID from the game
 */
const eliminatePlayer = (gameState: GameState, playerId: string): GameState => {
    const newGs = { ...gameState }
    const newBoard = [...gameState.board]

    // mark the player's tiles as unoccupied
    getPlayerById(gameState, playerId).penguins.forEach((point) => {
        const oldTile = boardGet(newBoard, point) as Tile
        boardSet(newBoard, point, makeUnoccupied(oldTile))
    })

    newGs.board = newBoard
    newGs.players = gameState.players.filter((p) => p.id !== playerId)

    if (canAdvanceToPlaying(newGs)) {
        newGs.phase = "playing"
    }

    if (newGs.players.length <= 1 || canAdvanceToOver(newGs)) {
        newGs.phase = "over"
    }

    return newGs
}

export {
    GameState,
    createGameState,
    createGameStateCustomBoard,
    getPlayerById,
    placePenguin,
    movePenguin,
    eliminatePlayer,
    skipTurn,
    getPlayerWhoseTurnItIs,
    PENGUIN_PLACEMENTS_NEEDED_PER_PLAYER,
}
