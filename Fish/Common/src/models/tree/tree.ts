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
import { GamePhaseError } from "../errors/gamePhaseError"

/*
 * GameNode represents a possible GameState, the action that led to it, and potential future moves
 */
interface GameNode {
    /** The action that led to this node.
     * In this context an action should be:
     *  - "move" action - represents a players move
     *  - "put" action - represents a penguin placement
     *  - "skipTurn" action - represents a player skipping their turn (only valid if they can't move)
     * Can be unset only for the top level GameNode */
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
const completeAction = (gameNode: GameNode, action: Action): GameNode => {
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
    const currentPlayer = getPlayerWhoseTurnItIs(gs)

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
const createGameNode = (gs: GameState): GameNode => {
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
const applyToAllFutureStates = <T>(
    gameNode: GameNode,
    applyFunction: (value: GameState) => T
): Array<T> => {
    return gameNode
        .children()
        .map((gameNode) => gameNode.gs)
        .map(applyFunction)
}

export { GameNode, completeAction, createGameNode, applyToAllFutureStates }
