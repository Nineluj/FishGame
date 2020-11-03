import { Player } from "../../../Common/src/models/player"
import { GameState } from "../../../Common/src/models/gameState"
import { Action } from "../../../Common/src/models/action"
import {
    createGameState,
    getPlayerWhoseTurnItIs,
} from "../../../Common/src/models/gameState/gameState"
import { GameNode, createGameNode, completeAction } from "../../../Common/src/models/tree/tree"
import { actionsEqual } from "../../../Common/src/models/action/action"

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

    /**
     * Constructs a new referee and begins the game.
     * @param players the set of players playing in the game
     */
    constructor(players: Array<Player>) {
        this.game = createGameNode(createGameState(players))
        this.eliminatedPlayerIds = new Set()
    }

    /**
     * Returns a list of players with scores and colors
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

        return outputPlayers
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
     * session token of the player making the request matches the playerId.
     *
     * @param playerId The id of the player requesting the action
     * @param action The action to attempt to execute
     */
    makeAction(
        playerId: string,
        action: Action
    ): { gameState: GameState; success: boolean; reason?: string } {
        if (this.game.gs.phase === "over") {
            return {
                gameState: this.game.gs,
                success: false,
                reason: "Game has already ended, no more actions can be taken",
            }
        }

        try{
          this.completeAction(this.game, action);
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
