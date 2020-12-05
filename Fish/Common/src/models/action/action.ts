import { GameState } from "../gameState"
import {
    movePenguin,
    skipTurn,
    placePenguin,
    eliminatePlayer,
} from "../gameState/gameState"
import { Point } from "../point"
import { isDeepStrictEqual } from "util"

type ActionType = "identity" | "place" | "move" | "skip"

/**
 * An Action is an event that changes/produces a new game state. An Action represents an player event in the game
 * (ie. move penguin, take turn, skip turn).
 *
 * Actions are a type of object that can act on a game state and can be compared for equality.
 * All actions should be created using one of the createXAction functions in this file since those
 * correctly set the data for the action allowing the actions to be checked for equality.
 */
interface Action {
    // Data related to the action itself (ie. move destination, penguin placement, etc)
    // Data is largely used for object equality.
    actionType: ActionType

    data: any
    // Apply represents how the action applies to the given game state. For example,
    //in a move player action apply returns the game state result of the making the move
    apply: (gs: GameState) => GameState
}

/**
 * Are the two given actions equal? Based on whether the
 * two actions would have the same effect
 */
const actionsEqual = (a1: Action, a2: Action): boolean =>
    a1.actionType === a2.actionType && isDeepStrictEqual(a1.data, a2.data)

/**
 * Creates an identity action which is an action that returns
 * a copy of the given gameState. Can be thought of as the action
 * that lead to the initial GameState in a game tree.
 */
const createIdentityAction = (): Action => ({
    actionType: "identity",
    data: {},
    apply: (gs: GameState) => ({ ...gs }),
})

/**
 * Creates an action for placing a penguin at a given position
 */
const createPlacePenguinAction = (playerId: string, dst: Point): Action => ({
    actionType: "place",
    data: {
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
    destination: Point
): Action => ({
    actionType: "move",
    data: {
        playerId,
        origin: { x: origin.x, y: origin.y },
        dst: { x: destination.x, y: destination.y },
    },
    apply: (gs: GameState) => movePenguin(gs, playerId, origin, destination),
})

/**
 * Creates an action for skipping the a player's turn.
 * This should only happen if a player cannot make moves
 */
const createSkipTurnAction = (playerId: string): Action => ({
    actionType: "skip",
    data: {
        playerId,
    },
    apply: (gs: GameState) => skipTurn(gs, playerId),
})

export {
    Action,
    actionsEqual,
    createIdentityAction,
    createPlacePenguinAction,
    createMoveAction,
    createSkipTurnAction,
}
