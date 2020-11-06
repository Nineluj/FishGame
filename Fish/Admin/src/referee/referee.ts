import { Player } from "../../../Common/src/models/player"
import { GameState } from "../../../Common/src/models/gameState"
import { Action } from "../../../Common/src/models/action"
import {
    createGameState,
    getPlayerWhoseTurnItIs,
} from "../../../Common/src/models/gameState/gameState"
import {
    GameNode,
    createGameNode,
    completeAction,
} from "../../../Common/src/models/tree/tree"
import { Player as PlayerInstance } from "../../../Player/src/player/player"
import { createEliminatePlayerAction } from "../../../Common/src/models/action/action"

/**
 * Runs a complete game of fish for a set of players
 */
class Referee {
    // A node from a GameTree that holds the true state of the game
    private game: GameNode
    //
    private history: Array<GameNode>
    private eliminatedPlayerIds: Set<string>
    private players: Map<string, PlayerInstance>

    /**
     * Constructs a new referee and begins the game.
     * @param players the set of players playing in the game
     */
    constructor(players: Array<Player>) {
        this.game = createGameNode(createGameState(players))
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
            players: this.game.gs.players,
            eliminatedPlayerIds: Array.from(this.eliminatedPlayerIds),
        }
    }

    /**
     * Returns a replay of the game up until this point
     */
    getReplay(): Array<GameNode> {
        return [...this.history]
    }

    /**
     * Returns the current phase of this game.
     */
    getGamePhase(): "penguinPlacement" | "playing" | "over" {
        return this.game.gs.phase
    }

    /**
     * Request to make an action for a certain player. If the action is invalid,
     * the player making the request will be eliminated.
     *
     * This function will be called via a network call in the future.
     *
     * **FUTURE INVARIANT** There will be some middleware that validates that the
     * session token of the player making the request matches playerId inside of the action
     *
     * @param action The action to attempt to execute
     */
    makeAction(action: Action): void {
        const playerId = action.data.playerId

        // If the player has been banned, ignore this action
        if (this.eliminatedPlayerIds.has(playerId)) {
            return
        }

        let newGn: GameNode

        try {
            newGn = completeAction(this.game, action)
        } catch (e) {
            newGn = completeAction(
                this.game,
                createEliminatePlayerAction(playerId)
            )

            this.players.get(playerId)!.notifyBanned(e.message)
            this.players.delete(playerId)
        }

        // Keep track of the nodes that we visit in the Game Tree
        this.history.push(this.game)
        this.game = newGn

        const nextToPlay = getPlayerWhoseTurnItIs(newGn.gs)
        let nextToPlayInstance: PlayerInstance

        // notify all players of the new gamestate except player whose turn it is next
        this.players.forEach((playerInstance, pid) => {
            if (pid !== nextToPlay.id) {
                playerInstance.updateState(newGn.gs, false)
            } else {
                nextToPlayInstance = playerInstance
            }
        })

        // notify player whose turn it is next
        nextToPlayInstance!.updateState(newGn.gs, true)
    }

    /**
     * Returns a read only copy of the current GameState.
     */
    getGameState(): GameState {
        return this.game.gs
    }
}

export { Referee }
