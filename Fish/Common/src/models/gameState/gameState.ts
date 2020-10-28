import { Player, putPenguin, sortPlayersByAgeAsc } from "../player"
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
import { changePenguinPosition } from "../player"
import { containsPoint, Point } from "../point"
import { Tile } from "../tile"
import update from "immutability-helper"

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

(note: placePenguin, movePeguin and skipTurn need to be called by the player
whose turn it is. Out of order actions will result in an exception being thrown)

During penguinPlacement, GameState needs enough putPenguin calls until the
GameState has 6 - N penguins per player. After that, advancePhase will
change the phase to playing during which players can either use movePenguin
or skipTurn to update the state of the game. The over phase will be reachable
once the game is in a state in which no player can make any new moves. Calling
advancePhase at that point will result in a new GameState indicating that the
game is over.

It is the referee's responsability to skip a player's turn if they cannot play.
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
    return {
        board: board,
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
    // check the phase
    if (gameState.phase !== "penguinPlacement") {
        throw new GameStateActionError(
            `placePenguin expected penguinPlacement phase, got ${gameState.phase}`
        )
    }

    // Check that the destination is an unoccupied tile
    const dstTile = boardGet(gameState.board, dst)

    if (dstTile === "hole" || dstTile === undefined || dstTile.occupied) {
        throw new IllegalArgumentError(
            `cannot place penguin on tile ${JSON.stringify(dstTile)}`
        )
    }

    const [player, playerIndex] = getPlayerWhoseTurnItIs(gameState)

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

    // Create the new player by adding a new penguin for them and giving them
    // points for the fish that were on the tile
    const newPlayer = {
        ...putPenguin(player, dst),
        score: player.score + dstTile.fish,
    }

    // Create the new board in which the tile where the penguin was placed is occupied
    const newBoard = boardSet(gameState.board, dst, { fish: 0, occupied: true })

    const newGameState = update(gameState, {
        players: {
            [playerIndex]: {
                $set: newPlayer,
            },
        },
        board: {
            $set: newBoard,
        },
        turn: {
            $apply: (turn) => turn + 1,
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

/**
 * Get the player who's turn it currently is, along with their index in the
 * player array.
 * @param gameState State from which you want to find the current player
 */
const getPlayerWhoseTurnItIs = (
    gameState: GameState
): { player: Player; index: number } => {
    const turnIndex = gameState.turn % gameState.players.length
    return { player: gameState.players[turnIndex], index: turnIndex }
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
    const dstTile = boardGet(gameState.board, dst) as Tile
    const [player, playerIndex] = getPlayerWhoseTurnItIs(gameState)

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
        score: newPlayer.score + dstTile.fish,
    }

    const updatedGameState = update(gameState, {
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
 * Skip the current player's turn
 * @param gameState The state
 */
const skipTurn = (gameState: GameState, playerId: string): GameState => {
    if (gameState.phase !== "playing") {
        throw new GameStateActionError(
            `skipTurn expected playing phase, got ${gameState.phase}`
        )
    }

    const nextPlayer = getPlayerWhoseTurnItIs(gameState)
    if (playerId !== nextPlayer[0].id) {
        throw new IllegalArgumentError(
            `cannot skip turn of ${playerId}, expecting ${nextPlayer[0].id} to play`
        )
    }

    const newState: GamePhase = canAdvanceToOver(gameState) ? "over" : "playing"

    return {
        ...gameState,
        turn: gameState.turn + 1,
        phase: newState,
    }
}

/**
 * Can the GameState's phase be advanced to the playing phase?
 */
const canAdvanceToOver = (gs: GameState): boolean => {
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
 * Can the GameState's phase be advanced to the over phase?
 */
const canAdvanceToPlaying = (gs: GameState): boolean => {
    if (gs.phase !== "penguinPlacement") {
        return false
    }

    // check that all the players have placed the neccessary number of penguins
    for (let player of gs.players) {
        if (
            player.penguins.length !== getNumberOfPenguinsToPlacePerPlayer(gs)
        ) {
            return false
        }
    }

    return true
}

export {
    GameState,
    createGameState,
    createGameStateCustomBoard,
    placePenguin,
    movePenguin,
    skipTurn,
    getPlayerWhoseTurnItIs,
}
