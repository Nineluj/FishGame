import { GameState } from "@models/gameState"
import { movePenguin, skipTurn } from "../gameState/gameState"
import { Point } from "../point"
import { isDeepStrictEqual } from "util"

/*
  Actions are a type of object that can act on a game state and can be compared for equality.
  All actions should be created using one of the createXAction functions in this file since those
  correctly set the data for the action allowing the actions to be checked for equality.
*/
interface Action {
    data: any
    apply: (gs: GameState) => GameState
}

/**
 * Are the two given actions equal? Based on whether the
 * two actions would have the same effect
 */
const actionsEqual = (a1: Action, a2: Action): boolean =>
    isDeepStrictEqual(a1.data, a2.data)

/**
 * Creates an identity action which is an action that returns
 * a copy of the given gameState. Can be thought of as the action
 * that lead to the initial GameState in a game tree.
 */
const createIdentityAction = (): Action => ({
    data: {
        actionType: "identity",
    },
    apply: (gs: GameState) => ({ ...gs }),
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
 * Creates an action for skipping the a player's turn
 */
const createSkipTurnAction = (playerId: string): Action => ({
    data: {
        actionType: "skipTurn",
        playerId,
    },
    apply: (gs: GameState) => skipTurn(gs, playerId),
})

export {
    actionsEqual,
    createIdentityAction,
    createMoveAction,
    createSkipTurnAction,
}
