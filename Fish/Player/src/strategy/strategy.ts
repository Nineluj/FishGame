import { GameState } from "../../../Common/src/models/gameState"
import { GameNode } from "../../../Common/src/models/tree/tree"
import { Action } from "../../../Common/src/models/action"

type RootStrategy = "ROOT"

interface Strategy {
    isApplicable: (gs: GameState) => boolean
    fallbackStrategy: Strategy | RootStrategy
    applyStrategy: (gs: GameState) => Action
}

const getPenguinPlacementStrategy = (fallbackStrategy?: Strategy): Strategy => {
    return {
        isApplicable: (gs: GameState) => {
            return gs.phase === "penguinPlacement"
        },
        applyStrategy: (gs: GameState) => {
            //TODO
        },
        fallbackStrategy: fallbackStrategy || "ROOT",
    }
}

const getPenguinMoveStrategy = (fallbackStrategy?: Strategy): Strategy => {
    return {
        isApplicable: (gs: GameState) => {
            return gs.phase === "playing"
        },
        applyStrategy: (gs: GameState) => {
            //TODO
        },
        fallbackStrategy: fallbackStrategy || "ROOT",
    }
}
