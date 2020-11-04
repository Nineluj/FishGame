import { GameState } from "../gameState"
import { movePenguin, skipTurn, placePenguin } from "../gameState/gameState"
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
 * Creates an action for placing a penguin at a given position
 */
const createPlacePenguinAction = (playerId: string, dst: Point): Action => ({
    data: {
        actionType: "put",
        playerId,
        dst: { x: dst.x, y: dst.y },
    },
    apply: (gs: GameState) => placePenguin(gs, playerId, dst),
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
        origin: { x: origin.x, y: origin.y },
        dst: { x: dst.x, y: dst.y },
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

/**
 * Creates an action that eliminates the player from the game. This is used
 * by the referee when a player cheats or behaves wrong
 * @param playerId The player to be terminated
 */
const createEliminatePlayerAction = (playerId: string): Action => ({
    data: {
        actionType: "eliminatePlayer",
        playerId,
    },
    apply: (gs: GameState) => {
        throw new Error("not implemented yet")
    },
})

export {
    Action,
    actionsEqual,
    createIdentityAction,
    createPlacePenguinAction,
    createMoveAction,
    createSkipTurnAction,
    createEliminatePlayerAction,
}
