import { Player, putPenguin, sortPlayersByAgeAsc } from "@/models/player"
import {
    Board,
    boardGet,
    boardSet,
    createBoard,
    getReachableTilesFrom,
} from "@models/board"
import { IllegalArgumentError } from "@models/errors/illegalArgumentError"
import { GameStateActionError } from "@models/errors/gameStateActionError"
import { InvalidMoveError } from "@models/errors/invalidMoveError"
import { changePenguinPosition } from "@/models/player"
import { containsPoint, Point } from "@models/point"
import { Tile } from "@models/tile"
import update from "immutability-helper"

/*
The game state is modeled like a FSM as follows:

                    advancePhase           advancePhase

 +------------------+         +------------+         +--------+
 | penguinPlacement +-------->+  playing   +-------->+  over  |
 +----+--------+----+         +--+------+--+         +--------+
      ^        |                 ^      |
      |        |                 |      |
      |        |                 |      |
      +--------+                 +------+
      putPenguin                movePenguin
                                OR skipTurn

During penguinPlacement, GameState needs enough putPenguin calls until the
GameState has 6 - N penguins per player. After that, advancePhase will
change the phase to playing during which players can either use movePenguin
or skipTurn to update the state of the game. The over phase will be reachable
once the game is in a state in which no player can make any new moves. Calling
advancePhase at that point will result in a new GameState indicating that the
game is over.
 */
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

// Represents the number of penguins, minus the # of players, that each player
// has to place before the game can move past the penguinPlacement phase
const PENGUIN_PLACEMENTS_NEEDED_PER_PLAYER = 6

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
 * @param dst The coordinates to place the penguin at
 */
const placePenguin = (
    gameState: GameState,
    playerId: string,
    dst: Point
): GameState => {
    if (gameState.phase !== "penguinPlacement") {
        throw new GameStateActionError(
            `placePenguin excepted penguinPlacement phase, got ${gameState.phase}`
        )
    }

    // Check that the destination is an unoccupied tile
    const dstTile = boardGet(gameState.board, dst)

    if (dstTile === "hole" || dstTile === undefined || dstTile.occupied) {
        throw new IllegalArgumentError(
            `cannot place penguin on tile ${dstTile}`
        )
    }

    // See if we can find a player with the given id, throw exception if not found
    let playerIndex = -1
    gameState.players.forEach((player, i) => {
        if (player.id === playerId) {
            playerIndex = i
        }
    })

    if (playerIndex === -1) {
        throw new IllegalArgumentError(
            `cannot find player with id ${playerId} in game`
        )
    }
    const player = gameState.players[playerIndex]

    // Create the new player by adding a new penguin for them and giving them
    // points for the fish that were on the tile
    const newPlayer = {
        ...putPenguin(gameState.players[playerIndex], dst),
        score: player.score + dstTile.fish,
    }

    // Create the new board in which the tile where the penguin was placed is occupied
    const newBoard = boardSet(gameState.board, dst, { fish: 0, occupied: true })

    // Use update to get a new version of the game state without mutating anything
    return update(gameState, {
        players: {
            [playerIndex]: {
                $set: newPlayer,
            },
        },
        board: {
            $set: newBoard,
        },
    })
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
    if (gameState.phase !== "playing") {
        throw new GameStateActionError(
            `movePenguin excepted playing phase, got ${gameState.phase}`
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
): { validMove: boolean; errorMessage?: string } => {
    if (gameState.phase !== "playing") {
        return {
            validMove: false,
            errorMessage: `canMovePenguin excepted playing phase, got ${gameState.phase}`,
        }
    }

    // Check if it's an out of turn move
    const [currentMovePlayer, _] = getPlayerWhoseTurnItIs(gameState)

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
            errorMessage: `move from ${origin} to ${dst} is not valid`,
        }
    }

    return { validMove: true }
}

/**
 *
 */
const skipTurn = (gameState: GameState): GameState => {
    if (gameState.phase !== "playing") {
        throw new GameStateActionError(
            `skipTurn excepted playing phase, got ${gameState.phase}`
        )
    }

    return {
        ...gameState,
        turn: gameState.turn + 1,
    }
}

/**
 * Ensures that the conditions to move to the next phase are satisfied and
 * then returns a new gameState that is at the next phase
 * @param gameState
 */
const advancePhase = (gameState: GameState): GameState => {
    if (gameState.phase === "over") {
        throw new GameStateActionError("cannot advance past the over state")
    }

    if (gameState.phase === "penguinPlacement") {
        // check that all the players have placed
        // PENGUIN_PLACEMENTS_NEEDED_PER_PLAYER - N penguins
        const numPlayers = gameState.players.length

        gameState.players.forEach((player) => {
            if (
                player.penguins.length !==
                PENGUIN_PLACEMENTS_NEEDED_PER_PLAYER - numPlayers
            ) {
                throw new GameStateActionError(
                    `player ${player.id} has not placed 
                    the required number of penguins`
                )
            }
        })

        return {
            ...gameState,
            phase: "playing",
        }
    }

    if (gameState.phase === "playing") {
        // TODO: write logic for finding out when a game is over
    }

    throw new GameStateActionError("unexcepted game state")
}

export {
    GameState,
    createGameState,
    putPenguin,
    movePenguin,
    getPlayerWhoseTurnItIs,
}