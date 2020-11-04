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
import { actionsEqual } from "../../../Common/src/models/action/action"
import { Player as PlayerInstance } from "../../../Player/src/player/player"

interface EliminatablePlayer extends Player {
    eliminated?: boolean
}

/**
 * Runs a complete game of fish for a set of players
 */
class Referee {
    private game: GameNode
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
            this.players.set(p.id, new PlayerInstance(this, 3))
        })
    }

    /**
     * Returns a list of players with scores and colors, sorted by score
     */
    getPlayerStatuses(): Array<EliminatablePlayer> {
        const outputPlayers: Array<EliminatablePlayer> = []

        this.game.gs.players.forEach((player) => {
            if (this.eliminatedPlayerIds.has(player.id)) {
                outputPlayers.push({ ...player, eliminated: true })
            } else {
                outputPlayers.push(player)
            }
        })

        // use -1 if the player was eliminated so they are sorted to the bottom of the list
        return outputPlayers.sort(
            (p1, p2) =>
                (p1.eliminated ? -1 : p1.score) -
                (p2.eliminated ? -1 : p2.score)
        )
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

        try {
            const newGn = completeAction(this.game, action)
            this.history.push(this.game)
            this.game = newGn
        } catch (e) {
            this.players.get(playerId)!.notifyBanned(e.message)
        }

        return {
            gameState: this.game.gs,
            success: true,
        }
    }

    /**
     * Returns a read only copy of the current GameState.
     */
    getGameState(): GameState {
        return this.game.gs
    }
}

export { Referee }
