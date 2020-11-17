import { Player, PenguinColor } from "../../../Common/src/models/player"
import {
    GameState,
    MIN_PLAYER_COUNT,
    MAX_PLAYER_COUNT,
} from "../../../Common/src/models/gameState"
import { Action } from "../../../Common/src/models/action"
import {
    createGameState,
    getPlayerWhoseTurnItIs,
    createGameStateCustomBoard,
} from "../../../Common/src/models/gameState/gameState"
import {
    GameNode,
    createGameNode,
    completeAction,
} from "../../../Common/src/models/tree/tree"
import { PlayerInterface } from "../../../Common/player-interface"
import { createEliminatePlayerAction } from "../../../Common/src/models/action/action"
import { Board } from "../../../Common/src/models/board"
import {
    createPlayer,
    players,
} from "../../../Common/src/models/testHelpers/testHelpers"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import { callFunctionSafely } from "../../src/utils/communications"

// The order in which the referee will assign the colors to the players
export const colorOrder: Array<PenguinColor> = [
    "red",
    "white",
    "brown",
    "black",
]

/**
 * Represents players' outcome of a game separated into winners and losers
 */
export type GameResult = {
    // players who achieved the highest score
    winners: Array<string>
    // players who did not achieve the highest score or got kicked out
    losers: Array<string>
}

/**
 * Component that knows how to run a complete game of fish for
 * a set of players
 *
 * Constraints: When the referee encounters failing players it kicks them out
 * The cases the referee considers before kicking out the player are:
 *  - Players that error (throw Errors)
 *  - Players that submit invalid actions
 *
 * We leave the timeout feature to the tcp player to monitor. We trust the house players
 * not to time out. If a Player goes into an infinite loop, we will not be able to prevent that
 */
class Referee {
    // gameState keeps track of the current state of the game
    private gameState: GameState

    // initialGame doesn't change once set and keeps track of what the
    // game was like at the very beginning
    private initialGame: GameState

    // keeps all the moves made in this game, including eliminationActions when a
    // player gets eliminated for making a bad move
    private history: Array<Action>

    private eliminatedPlayerIds: Set<string>
    // references to the player objects that know how to play in a game of fish
    private players: Map<string, PlayerInterface>

    /**
     * Constructs a new referee and begins the game.
     * @param players the set of players playing in the game sorted for the desired order of play
     * @param board optionally, a specific board that should be used for this game
     */
    constructor(
        players: Array<PlayerInterface>,
        board?: Board,
        playerIds?: string[]
    ) {
        const gamePlayers = Referee.createGamePlayers(players.length, playerIds)

        if (board) {
            this.initialGame = createGameStateCustomBoard(gamePlayers, board)
        } else {
            this.initialGame = createGameState(gamePlayers)
        }

        this.gameState = this.initialGame

        this.eliminatedPlayerIds = new Set()
        this.history = []
        this.players = new Map()

        players.forEach((p, playerIndex) => {
            this.players.set(gamePlayers[playerIndex].id, p)
        })
    }

    /**
     * Creates the player knowledge for the game state
     */
    static createGamePlayers(
        numberOfPlayers: number,
        playerIds?: string[]
    ): Array<Player> {
        let out: Array<Player> = []
        if (
            numberOfPlayers < MIN_PLAYER_COUNT ||
            numberOfPlayers > MAX_PLAYER_COUNT
        ) {
            throw new IllegalArgumentError(
                `Number of players must be between 2 and 4 received ${numberOfPlayers}`
            )
        }
        for (
            let playerIndex = 0;
            playerIndex < numberOfPlayers;
            playerIndex++
        ) {
            let playerId: string = colorOrder[playerIndex]
            if (playerIds) {
                playerId = playerIds[playerIndex]
            }
            out.push(createPlayer(colorOrder[playerIndex], playerId))
        }

        return out
    }

    /**
     * Returns the players in this game that contain their scores and colors as well as
     * the list of the eliminated players.
     */
    getPlayerStatuses(): {
        players: Array<Player>
        eliminatedPlayerIds: Array<string>
    } {
        return {
            players: this.gameState.players,
            eliminatedPlayerIds: Array.from(this.eliminatedPlayerIds),
        }
    }

    /**
     * Gets the winning and losing players from the game after it is run.
     * Throws an error if it is called before the game is completed.
     * TODO: test this
     */
    getPlayerResults(): GameResult {
        if (this.gameState.phase !== "over") {
            throw new IllegalArgumentError(
                "cannot get the winning players before the game is over"
            )
        }

        let results: GameResult = {
            winners: [],
            losers: Array.from(this.eliminatedPlayerIds),
        }

        let bestScore = 0

        this.gameState.players.forEach((player) => {
            if (player.score > bestScore) {
                results.losers = results.losers.concat(results.winners)
                results.winners = [player.id]

                bestScore = player.score
            } else if (player.score === bestScore) {
                results.winners.push(player.id)
            } else {
                results.losers.push(player.id)
            }
        })

        return results
    }

    /**
     * Returns a replay of the game up until this point
     */
    getReplay(): Array<Action> {
        return [...this.history]
    }

    /**
     * Returns the current phase of this game.
     */
    getGamePhase(): "penguinPlacement" | "playing" | "over" {
        return this.gameState.phase
    }

    /**
     * Runs through an entire game by going through the placement and movement phase
     *
     * Constraints: When the referee encounters failing players it kicks them out
     * The cases the referee considers before kicking out the player are:
     *  - Players that error
     *  - Players that submit invalid moves
     * The Game State is immutable so players are unable to change the ground truth of the game
     *
     * We leave the timeout feature to the tcp player to monitor. We trust the house players
     * not to time out. If a Player goes into an infinite loop, we will not be able to prevent that
     */
    runGamePlay() {
        this.runPlacementPhase()
        this.runGameMovementPhase()
    }

    /**
     * Loops through game state until the game has ended. Requests player actions for each turn.
     * Handles invalid actions appropriately.
     */
    runGameMovementPhase() {
        while (this.gameState.phase === "playing") {
            this.playTurn()
        }
    }

    /**
     * Loop through the placement phase of the game. Requests the player placements for each turn.
     */
    runPlacementPhase() {
        while (this.gameState.phase === "penguinPlacement") {
            this.playTurn()
        }
    }

    /**
     * Plays a single turn and updates all the players of the changes in the game.
     */
    playTurn() {
        const nextToPlay = getPlayerWhoseTurnItIs(this.gameState)
        this.getPlayerActionOrEliminate(nextToPlay.id)

        // update the players with the new state
        this.players.forEach((playerInstance, playerId) => {
            callFunctionSafely(() =>
                playerInstance.updateGameState(this.gameState)
            )
        })
    }

    /**
     * Kicks out the player from this game and optionally notify them and give them
     * a reason.
     */
    kickPlayer(
        playerId: string,
        reason: string = "",
        notify: boolean = false
    ): void {
        const elimAction = createEliminatePlayerAction(playerId)
        this.history.push(elimAction)
        this.eliminatedPlayerIds.add(playerId)

        this.gameState = elimAction.apply(this.gameState)

        if (notify) {
            callFunctionSafely(() =>
                this.players.get(playerId)!.notifyBanned(reason)
            )
        }

        this.players.delete(playerId)
    }

    /**
     * Asks the player for it's action based on the current game state. If this action is valid, it modifies the game state.
     * Otherwise it removes the player from the game.
     * @param player the current player
     * @param playerId the player id
     */
    private getPlayerActionOrEliminate(playerId: string): void {
        const player = this.players.get(playerId)!

        const playerAction = callFunctionSafely(() =>
            player.getNextAction(this.gameState)
        )

        if (!playerAction) {
            this.kickPlayer(playerId)
            return
        }

        try {
            this.gameState = playerAction.apply(this.gameState)
            this.history.push(playerAction)
        } catch (e) {
            this.kickPlayer(playerId, e.message, true)
        }
    }

    /**
     * Returns a read only copy of the current GameState.
     */
    getGameState(): GameState {
        return this.gameState
    }
}

export { Referee }
