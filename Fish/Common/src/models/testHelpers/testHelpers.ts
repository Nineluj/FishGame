import { GameState, placePenguin } from "../gameState"
import { Player } from "../player"
import { PenguinColor } from "../player/player"
import { makeBoardWithTiles } from "../board"
import { createGameStateCustomBoard } from "../gameState/gameState"

const player1: Player = {
    age: 1,
    id: "p1",
    penguinColor: "black",
    penguins: [],
    score: 0,
}
const player2: Player = {
    age: 2,
    id: "p2",
    penguinColor: "brown",
    penguins: [],
    score: 0,
}
const player3: Player = {
    age: 3,
    id: "p3",
    penguinColor: "red",
    penguins: [],
    score: 0,
}

const board = makeBoardWithTiles([
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [2, 0],
    [2, 1],
    [2, 2],
    [3, 0],
    [3, 1],
    [4, 0],
    [4, 1],
    [4, 2],
    [5, 0],
    [5, 1],
])

export const getPlacementState = (): GameState => {
    return createGameStateCustomBoard([player1, player2, player3], board)
}

/**
 * Helper for getting a game state that is actively being played
 */
export const getPlayingState = (): GameState => {
    return placeMultiple(
        getPlacementState(),
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
    let cState = gs

    for (let i = 0; i < positions.length; i++) {
        cState = placePenguin(cState, playerIds[i % playerIds.length], {
            x: positions[i][0],
            y: positions[i][1],
        })
    }

    return cState
}

export const createPlayer = (
    age: number,
    color: PenguinColor,
    id: string
): Player => {
    return {
        age,
        penguinColor: color,
        id,
        penguins: [],
        score: 0,
    }
}
