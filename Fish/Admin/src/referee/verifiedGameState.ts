import { Action } from "../../../Common/src/models/action"
import {
    completeAction,
    createGameNode,
    GameNode,
} from "../../../Common/src/models/tree/tree"
import { GameState } from "../../../Common/src/models/gameState"
import {
    canAdvanceToOver,
    canAdvanceToPlaying,
    eliminatePlayer,
} from "../../../Common/src/models/gameState/gameState"

/**
 * A VerifiableGameState knows how to handle actions
 */
interface VerifiableGameState {
    // Tries to use the action
    useAction(action: Action): VerifiableGameState | false
    // Is the game state in the placement phase?
    isPlacement(): boolean
    // Is the game state in the over phase?
    isOver(): boolean
    // Is the game state in the movement phase?
    isMove(): boolean
    // Get the underlying game state
    getGameState(): GameState
    // Kick a player out of the game state
    kickPlayer(playerId: string): VerifiableGameState
}

export class Placement implements VerifiableGameState {
    private readonly state: GameState
    private numPenguins: number

    constructor(gs: GameState, numPenguins: number) {
        this.state = gs
        this.numPenguins = numPenguins
    }

    isOver() {
        return false
    }

    getGameState(): GameState {
        return this.state
    }

    useAction(action: Action): VerifiableGameState | false {
        if (action.actionType !== "place") {
            return false
        }

        try {
            const outcome = action.apply(this.state)
            if (canAdvanceToPlaying(outcome, this.numPenguins)) {
                const gn = createGameNode(outcome)
                return new Moving(gn)
            } else {
                return new Placement(outcome, this.numPenguins)
            }
        } catch {}
        return false
    }

    isMove(): boolean {
        return false
    }

    isPlacement(): boolean {
        return true
    }
    kickPlayer(playerId: string): VerifiableGameState {
        const newGs = eliminatePlayer(this.state, playerId)
        if (canAdvanceToPlaying(newGs, this.numPenguins)) {
            return new Moving(createGameNode(newGs))
        } else {
            return new Placement(newGs, this.numPenguins)
        }
    }
}

export class Moving implements VerifiableGameState {
    private readonly node: GameNode

    constructor(gameNode: GameNode) {
        this.node = gameNode
    }

    isOver() {
        return false
    }

    getGameState(): GameState {
        return this.node.gs
    }

    useAction(action: Action): VerifiableGameState | false {
        try {
            const outcome = completeAction(this.node, action)
            const outcomeGs = outcome.gs
            if (canAdvanceToOver(outcomeGs)) {
                return new Over(outcomeGs)
            } else {
                return new Moving(outcome)
            }
        } catch {}

        return false
    }

    isMove(): boolean {
        return true
    }

    isPlacement(): boolean {
        return false
    }

    kickPlayer(playerId: string): VerifiableGameState {
        const newGs = eliminatePlayer(this.getGameState(), playerId)
        if (canAdvanceToOver(newGs)) {
            return new Over(newGs)
        } else {
            return new Moving(createGameNode(newGs))
        }
    }
}

export class Over implements VerifiableGameState {
    private readonly state: GameState

    constructor(gs: GameState) {
        this.state = gs
    }

    isOver() {
        return true
    }

    getGameState(): GameState {
        return this.state
    }

    useAction(action: Action): VerifiableGameState | false {
        return false
    }

    isPlacement(): boolean {
        return false
    }

    isMove(): boolean {
        return false
    }

    kickPlayer(playerId: string): VerifiableGameState {
        const newGs = eliminatePlayer(this.state, playerId)
        return new Over(newGs)
    }
}

export { VerifiableGameState }
