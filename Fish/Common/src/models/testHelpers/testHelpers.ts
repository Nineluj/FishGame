import { GameState, placePenguin } from "../gameState"
import { Player } from "../player"
import { PenguinColor } from "../player/player"
import { Board, boardSet } from "../board"
import {
    createGameStateCustomBoard,
    movePenguin,
    skipTurn,
} from "../gameState/gameState"

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

export const players = [player1, player2, player3]

/**
 * Creates a board with tiles that have two fish at all the given positions. Used for testing.
 * @param tileInfo [x, y, nFish]
 */
export const makeBoardWithTiles = (
    tileInfo: Array<[number, number, number]>
): Board => {
    let b: Board = [[]]

    for (let i = 0; i < tileInfo.length; i++) {
        b = boardSet(
            b,
            { x: tileInfo[i][0], y: tileInfo[i][1] },
            { fish: tileInfo[i][2], occupied: false }
        )
    }

    return b
}

const board = makeBoardWithTiles([
    [0, 0, 2],
    [0, 1, 2],
    [0, 2, 2],
    [1, 0, 2],
    [1, 1, 2],
    [2, 0, 2],
    [2, 1, 2],
    [2, 2, 2],
    [3, 0, 2],
    [3, 1, 2],
    [4, 0, 2],
    [4, 1, 2],
    [4, 2, 2],
    [5, 0, 2],
    [5, 1, 2],
])

/**
 * Helper for getting a game state that is in the beginning of the
 * placement phase
 */
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

export const getOverState = (): GameState => {
    let cState = getPlayingState()

    let moves = [
        { id: "p1", from: { x: 0, y: 0 }, to: { x: 1, y: 0 } },
        { id: "p2", from: { x: 3, y: 0 }, to: { x: 2, y: 0 } },
        { id: "p3", from: { x: 0, y: 2 }, to: { x: 1, y: 1 } },
        { id: "p1", from: { x: 3, y: 1 }, to: { x: 5, y: 0 } },
        { id: "p2", from: { x: 4, y: 2 }, to: { x: 5, y: 1 } },
    ]

    moves.forEach((m) => {
        cState = movePenguin(cState, m.id, m.from, m.to)
    })

    cState = skipTurn(cState, "p3")
    cState = movePenguin(cState, "p1", { x: 5, y: 0 }, { x: 4, y: 1 })

    return cState
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
