import { GameState, placePenguin } from "./gameState"

/**
 * Helper for getting a game state that is actively being played
 */
export const getPlayingState = (gs: GameState): GameState => {
    return placeMultiple(
        gs,
        [
            [0, 0],
            [0, 1],
            [0, 2],
            [3, 1],
            [4, 2],
            [4, 0],
            [2, 1],
            [3, 0],
            [2, 2],
        ],
        ["p1", "p2", "p3"]
    )
}

/**
 * Helper function for placing multiple penguins players in consecutive order
 * starting with the first player. Used for testing.
 * @param gs The base game state
 * @param positions Position at which penguins should be placed
 * @param playerIds Ids of the players who will be placing, ordered by their turn order
 */
export const placeMultiple = (
    gs: GameState,
    positions: Array<[number, number]>,
    playerIds: Array<string>
): GameState => {
    const helper = (
        gs: GameState,
        positions: Array<[number, number]>,
        playerIds: Array<string>,
        currIndex: number
    ): GameState => {
        if (positions.length === 0) {
            return gs
        }

        const newState = placePenguin(
            gs,
            playerIds[currIndex % playerIds.length],
            { x: positions[0][0], y: positions[0][1] }
        )

        return helper(newState, positions.slice(1), playerIds, currIndex + 1)
    }

    return helper(gs, positions, playerIds, 0)
}
