import { boardGet, boardSet, makeBoardWithTiles } from "@models/board"
import { GameStateActionError } from "@models/errors/gameStateActionError"
import { containsPoint } from "@models/point"
import { Tile } from "@models/tile"
import { expect } from "chai"
import { Player, putPenguin, sortPlayersByAgeAsc } from "@models/player"
import { isDeepStrictEqual } from "util"
import {
    advancePhase,
    createGameState,
    createGameStateCustomBoard,
    GameState,
    movePenguin,
    placePenguin,
} from "./gameState"
import { IllegalArgumentError } from "@models/errors/illegalArgumentError"

describe("GameState creation", () => {
    const player1: Player = {
        age: 20,
        id: "foo",
        penguinColor: "black",
        penguins: [],
        score: 0,
    }
    const player2: Player = {
        age: 15,
        id: "bar",
        penguinColor: "brown",
        penguins: [],
        score: 0,
    }
    const player3: Player = {
        age: 25,
        id: "baz",
        penguinColor: "red",
        penguins: [],
        score: 0,
    }
    const player4: Player = {
        age: 18,
        id: "lorem ipsum",
        penguinColor: "white",
        penguins: [],
        score: 0,
    }

    it("cannot be created with empty players array", () => {
        expect(() => createGameState([])).to.throw(
            IllegalArgumentError,
            "Expecting 2-4 players"
        )
    })

    it("cannot be created with too small players array", () => {
        expect(() => createGameState([player1])).to.throw(
            IllegalArgumentError,
            "Expecting 2-4 players"
        )
    })

    it("cannot be created with too large players array", () => {
        expect(() =>
            createGameState([player1, player2, player3, player4, player3])
        ).to.throw(IllegalArgumentError, "Expecting 2-4 players")
    })

    it("can be created with a valid correctly sized array of players", () => {
        const actual = createGameState([player1, player2, player3])

        expect(actual.turn).to.equal(0)
        expect(actual.phase).to.equal("penguinPlacement")
        expect(actual.players.length).to.equal(3)
        expect(actual.players[0].id).to.equal("bar")
    })
})

/**
 * Helper function for placing multiple penguins for a single player
 * Used to write tests that aren't 200 lines long
 * @param gs The base game state
 * @param positions Position at which penguins should be placed
 * @param playerId Id of the player for which penguins should be placed
 */
const placeMultiple = (
    gs: GameState,
    positions: Array<[number, number]>,
    playerId: string
): GameState => {
    if (positions.length === 0) {
        return gs
    }

    return placePenguin(
        placeMultiple(gs, positions.slice(1), playerId),
        playerId,
        { x: positions[0][0], y: positions[0][1] }
    )
}

describe("GameState FSM", () => {
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
    const player4: Player = {
        age: 4,
        id: "p4",
        penguinColor: "white",
        penguins: [],
        score: 0,
    }
    /*
     */

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

    let gs: GameState

    beforeEach(() => {
        gs = createGameStateCustomBoard([player1, player2, player3], board)
    })

    /* Tests to check behavior in the placePenguinPhase */
    it("is possible to place a penguin for a player", () => {
        const placePos = { x: 2, y: 1 }
        const newState = placePenguin(gs, "p3", placePos)

        expect((boardGet(newState.board, placePos) as Tile).occupied).to.be.true
        expect(containsPoint(newState.players[2].penguins, placePos)).to.be.true
    })

    it("is not possible to place a penguin on another", () => {
        const placePos = { x: 2, y: 1 }
        const newState = placePenguin(gs, "p3", placePos)

        expect(() => {
            placePenguin(newState, "p1", placePos)
        }).to.throw("cannot place penguin on tile")
    })

    it("is not possible to place more than the allowed number of penguins", () => {
        expect(() => {
            placeMultiple(
                gs,
                [
                    [0, 0],
                    [1, 1],
                    [0, 1],
                    [2, 2],
                ],
                "p2"
            )
        }).to.throw(GameStateActionError, "cannot place more than")
    })

    it("can't move penguin in placePenguin phase", () => {
        expect(() => {
            movePenguin(gs, "p1", { x: 0, y: 0 }, { x: 1, y: 0 })
        }).to.throw(GameStateActionError, "expected playing phase")
    })

    it("can't advance phase when no penguins have been placed", () => {
        expect(() => {
            advancePhase(gs)
        }).to.throw(
            GameStateActionError,
            "placed the required number of penguins"
        )
    })

    it("can't advanced when not enough penguins have been placed", () => {
        const newState = placeMultiple(
            placeMultiple(
                placeMultiple(
                    gs,
                    [
                        [0, 0],
                        [3, 0],
                        [4, 0],
                    ],
                    "p1"
                ),
                [
                    [1, 0],
                    [2, 1],
                    [0, 2],
                ],
                "p2"
            ),
            [[5, 0]],
            "p3"
        )
    })

    it("can't a penguin", () => {})

    it("can't move a penguin for a player out of turn", () => {})
})
