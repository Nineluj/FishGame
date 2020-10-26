import { GameState } from "../gameState"
import { Action } from "../action"
import { getPlayerWhoseTurnItIs } from "../gameState/gameState"
import { getReachableTilesFrom } from "../board"
import {
    createIdentityAction,
    createSkipTurnAction,
    createMoveAction,
    actionsEqual,
} from "../action/action"
import { GameStateActionError } from "../errors/gameStateActionError"
import { getHashes } from "crypto"
import { GamePhaseError } from "../errors/gamePhaseError"

/*
 * GameNode represents a possible GameState with . It has two fields:
 * - gs is the state of the game
 * -
 */
interface GameNode {
    /** The action that led to this node. Can be unset only for the top level GameNode */
    action: Action
    /** The state of the game at this point */
    gs: GameState
    /** The future states reachable from this node */
    children: () => Array<GameNode>
}

/**
 * Checks if given action is possible on the gameNode, and if it is, returns the resulting GameNode
 * @throws GameStateActionError if the given action is not valid on the provided GameNode
 */
export const completeAction = (
    gameNode: GameNode,
    action: Action
): GameNode => {
    const possibleResults = gameNode.children()

    for (const res of possibleResults) {
        if (actionsEqual(action, res.action)) {
            return res
        }
    }

    throw new GameStateActionError(
        "could not make the given move, it is not valid"
    )
}

/**
 * Get the possible states one turn from now
 */
const getAllPossibleMovesForTurn = (gs: GameState): Array<GameNode> => {
    // Holds the possible direct next states
    const futureStates: Array<GameNode> = []

    // Get current player turn
    const currentPlayer = getPlayerWhoseTurnItIs(gs)[0]

    // The player moves one of their penguins
    currentPlayer.penguins.forEach((penguin) => {
        const tiles = getReachableTilesFrom(gs.board, penguin)
        tiles.forEach((tile) => {
            const action = createMoveAction(currentPlayer.id, penguin, tile)
            const resultingState = action.apply(gs)

            futureStates.push({
                action: action,
                gs: resultingState,
                children: () => getAllPossibleMovesForTurn(resultingState),
            })
        })
    })

    // The player skips their turn
    const skipAction = createSkipTurnAction(currentPlayer.id)
    const resultingState = skipAction.apply(gs)
    futureStates.push({
        action: skipAction,
        gs: resultingState,
        children: () => getAllPossibleMovesForTurn(resultingState),
    })

    return futureStates
}

/**
 * Creates a GameNode with the given starting state that can be used to find
 * the possible future states.
 * @param gs Starting gamestate
 */
export const createRootGameNode = (gs: GameState): GameNode => {
    if (gs.phase === "penguinPlacement" || gs.phase === "over") {
        throw new GamePhaseError(
            "Cannot construct a game node for a game that hasn't begun or has already ended"
        )
    }

    return {
        action: createIdentityAction(),
        gs: gs,
        children: () => getAllPossibleMovesForTurn(gs),
    }
}

/**
 * Returns the result of applying the given function to all of the states reachable in the next turn
 * @param gameNode Tree node
 * @param applyFunction The operation to be applied
 */
export const applyToAllFutureStates = <T>(
    gameNode: GameNode,
    applyFunction: (value: GameState) => T
): Array<T> => {
    return gameNode
        .children()
        .map((gameNode) => gameNode.gs)
        .map(applyFunction)
}
