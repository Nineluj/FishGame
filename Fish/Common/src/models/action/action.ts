// TODO: tests these
import { GameState } from "@models/gameState"
import { movePenguin, skipTurn, placePenguin } from "../gameState/gameState"
import { Point } from "../point"
import { isDeepStrictEqual } from "util"

/**
 * Actions are a type of object that can update a game state and can be compared for equality
 */
interface Action {
    data: any
    apply: (gs: GameState) => GameState
}

const actionsEqual = (a1: Action, a2: Action): boolean =>
    isDeepStrictEqual(a1.data, a2.data)

/**
 *
 */
const createIdentityAction = (): Action => ({
    data: {
        actionType: "bigBang",
    },
    apply: (gs: GameState) => gs,
})

/**
 * Creates an action for moving a penguin in the given way
 */
const createMoveAction = (
    playerId: string,
    origin: Point,
    dst: Point
): Action => ({
    data: {
        actionType: "move",
        playerId,
        origin,
        dst,
    },
    apply: (gs: GameState) => movePenguin(gs, playerId, origin, dst),
})

/**
 * Creates an action for skipping the current player's turn
 */
const createSkipTurnAction = (playerId: string): Action => ({
    data: {
        actionType: "skipTurn",
        playerId,
    },
    apply: (gs: GameState) => skipTurn(gs, playerId),
})

const createPutPenguinAction = (playerId: string, dst: Point): Action => ({
    data: {
        actionType: "putPenguin",
        playerId,
        dst,
    },
    apply: (gs: GameState) => placePenguin(gs, playerId, dst),
})

export {
    actionsEqual,
    createIdentityAction,
    createMoveAction,
    createSkipTurnAction,
    createPutPenguinAction,
}
