import { GameState } from "@models/gameState"
import { Action } from "@models/action"
import { getPlayerWhoseTurnItIs } from "../gameState/gameState"
import { getReachableTilesFrom } from "../board"
import { createSkipTurnAction, createMoveAction } from "../action/action"

/*
 * GameNode represents . It has two fields:
 * - gs is the state of the game
 * -
 */
interface GameNode {
    gs: GameState
    children: () => Array<GameNode>
}

/**
 * Applies the action to the gamestate and returns the result
 * @param gs GameState to apply action on
 * @param action Action to apply to gamestate
 */
export const getNextState = (gs: GameState, action: Action): GameState => {
    return action.apply(gs)
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
            const newGs = createMoveAction(currentPlayer.id, penguin, tile)(gs)
            futureStates.push({
                gs: newGs,
                children: () => getAllPossibleMovesForTurn(newGs),
            })
        })
    })

    // The player skips their turn
    const skipGs = createSkipTurnAction(currentPlayer.id)(gs)
    futureStates.push({
        gs: skipGs,
        children: () => getAllPossibleMovesForTurn(skipGs),
    })

    return futureStates
}

/**
 * Creates a GameNode with the given starting state that can be used to find
 * the possible future states.
 * @param gs Starting gamestate
 */
const getPossibleFutureStates = (gs: GameState): GameNode => ({
    gs: gs,
    children: () => getAllPossibleMovesForTurn(gs),
})

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
