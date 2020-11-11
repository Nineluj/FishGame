import { Player } from "../../../Common/src/models/player"
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
import { Player as PlayerInstance } from "../../../Player/src/player/player"
import { createEliminatePlayerAction } from "../../../Common/src/models/action/action"
import { Board } from "../../../Common/src/models/board"

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
    private players: Map<string, PlayerInstance>

    /**
     * Constructs a new referee and begins the game.
     * @param players the set of players playing in the game sorted for the desired order of play
     * @param board optionally, a specific board that should be used for this game
     */
    constructor(players: Array<Player>, board?: Board) {
        // referee sets up the players given the a player interface
        if (board) {
            this.initialGame = createGameStateCustomBoard(players, board)
        } else {
            this.initialGame = createGameState(players)
        }
        this.gameState = this.initialGame

        this.eliminatedPlayerIds = new Set()
        this.history = []
        this.players = new Map()

        players.forEach((p) => {
            this.players.set(p.id, new PlayerInstance(this))
        })
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
     * Loops through game state until the game has ended. Requests player actions for each turn.
     * If a player submits an invalid action the player is  removed from the game.
     */
    runGamePlay() {
        while (this.gameState.phase !== "over") {
            // who's turn is it?
            const nextToPlay = getPlayerWhoseTurnItIs(this.gameState)
            let nextToPlayInstance: PlayerInstance = this.players.get(
                nextToPlay.id
            ) as PlayerInstance

            this.getPlayerActionOrEliminate(nextToPlayInstance, nextToPlay.id)

            // update the players with the new state
            this.players.forEach((playerInstance, pid) => {
                playerInstance.updateGameState(this.gameState)
            })
        }
    }

    /**
     * Asks the player for it's action based on the current game state. If this action is valid, it modifies the game state.
     * Otherwise it removes the player from the game.
     * @param player the current player
     * @param playerId the player id
     */
    getPlayerActionOrEliminate(player: PlayerInstance, playerId: string): void {
        const playerAction = player.getNextAction(this.gameState)
        let newGameState: GameState
        try {
            newGameState = playerAction.apply(this.gameState)
            this.history.push(playerAction)
        } catch (e) {
            const elimAction = createEliminatePlayerAction(playerId)
            this.history.push(elimAction)
            this.eliminatedPlayerIds.add(playerId)

            newGameState = elimAction.apply(this.gameState)

            this.players.get(playerId)!.notifyBanned(e.message)
            this.players.delete(playerId)
        }
        this.gameState = newGameState
    }

    /**
     * Returns a read only copy of the current GameState.
     */
    getGameState(): GameState {
        return this.gameState
    }
}

export { Referee }
