import { Action } from "../../../Common/src/models/action"
import {
    completeAction,
    createGameNode,
    GameNode,
} from "../../../Common/src/models/tree/tree"
import { GameState } from "../../../Common/src/models/gameState"

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
}

const createVerifiableGameState = (gs: GameState): VerifiableGameState => {
    if (gs.players.length <= 1) {
        return new Over(gs)
    }

    switch (gs.phase) {
        case "penguinPlacement":
            return new Placement(gs)
        case "playing":
            const gn = createGameNode(gs)
            return new Moving(gn)
        case "over":
            return new Over(gs)
    }
}

class Placement implements VerifiableGameState {
    private readonly state: GameState

    constructor(gs: GameState) {
        this.state = gs
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
            if (outcome.phase === "penguinPlacement") {
                return new Placement(outcome)
            } else if (outcome.phase === "playing") {
                const gn = createGameNode(outcome)
                return new Moving(gn)
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
}

class Moving implements VerifiableGameState {
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
            const outcomePhase = outcome.gs.phase

            if (outcomePhase === "playing") {
                return new Moving(outcome)
            } else if (outcomePhase === "over") {
                return new Over(outcome.gs)
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
}

class Over implements VerifiableGameState {
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
}

export { createVerifiableGameState, VerifiableGameState }
