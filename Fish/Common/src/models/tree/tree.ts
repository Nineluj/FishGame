import { GameState } from "@models/gameState"
import { Action } from "@models/action"
import { getPlayerWhoseTurnItIs, movePenguin } from "../gameState/gameState"
import { getReachableTilesFrom } from "../board"

/**
 * Applies the action to the gamestate and returns the result
 * @param gs GameState to apply action on
 * @param action Action to apply to gamestate
 */
export const getNextState = (gs: GameState, action: Action): GameState => {
    return action.apply(gs)
}

const getAllPossibleMovesForTurn = (gs: GameState): Array<GameState> => {
    const futureStates: Array<GameState> = []
    // Get current player turn
    //TODO also generate turn using a skipturn action
    const currentPlayer = getPlayerWhoseTurnItIs(gs)[0]
    currentPlayer.penguins.forEach((penguin) => {
        const tiles = getReachableTilesFrom(gs.board, penguin)
        tiles.forEach((tile) => {
            // TODO maybe this can throw an error?
            //TODO change this to an action
            const nextState = movePenguin(gs, currentPlayer.id, penguin, tile)
            futureStates.push(nextState)
        })
    })

    return futureStates
}

/**
 * Generates a tree from the starting gamestate of all possible paths that
 * lead to no more moves left on the board
 * @param gs Starting gamestate
 */
function* getPossibleFutureStates(
    gs: GameState
): Generator<GameState, void, void> {
    const futureStates = getAllPossibleMovesForTurn(gs)
    for (let state of futureStates) {
        yield state
        yield* getPossibleFutureStates(state)
    }
}

/**
 * Applies a function to all of the states reachable in the next turn
 * @param gs Gamestate to start with
 * @param applyFunction A function that consumes a gamestate and returns T
 * @returns The array of results from applyFunction
 */
const applyToAllFutureStates = <T>(
    gs: GameState,
    applyFunction: (value: GameState) => T
): Array<T> => {
    const futureStates = getAllPossibleMovesForTurn(gs)

    return futureStates.map(applyFunction)
}
