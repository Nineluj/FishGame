import { Player, PenguinColor } from "../../../Common/src/models/player"
import { GameState } from "../../../Common/src/models/gameState"
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
import { createPlayer } from "../../../Common/src/models/testHelpers/testHelpers"

// The order in which the referee will assign the colors to the players
let colorOrder: Array<PenguinColor> = ["red", "white", "brown", "black"]

/**
 * Component that knows how to run a complete game of fish for
 * a set of players
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
    constructor(players: Array<PlayerInterface>, board?: Board) {
        const gamePlayers = this.createGamePlayers(players.length)

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
     * TODO: test
     */
    createGamePlayers(numberOfPlayers: number): Array<Player> {
        let out: Array<Player> = []

        for (
            let playerIndex = 0;
            playerIndex < numberOfPlayers;
            playerIndex++
        ) {
            out.push(
                createPlayer(colorOrder[playerIndex], colorOrder[playerIndex])
            )
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
            this.callPlayerFunction(playerId, () =>
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
            this.callPlayerFunction(playerId, () =>
                this.players.get(playerId)!.notifyBanned(reason)
            )
        }

        this.players.delete(playerId)
    }

    /**
     * Calls a player function and returns the result. If the call fails, kicks the player and returns false.
     */
    private callPlayerFunction<R>(
        responsiblePlayerId: string,
        fn: () => R
    ): R | false {
        try {
            return fn()
        } catch {}

        return false
    }

    /**
     * Asks the player for it's action based on the current game state. If this action is valid, it modifies the game state.
     * Otherwise it removes the player from the game.
     * @param player the current player
     * @param playerId the player id
     */
    private getPlayerActionOrEliminate(playerId: string): void {
        const player = this.players.get(playerId)!

        const playerAction = this.callPlayerFunction(playerId, () =>
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
