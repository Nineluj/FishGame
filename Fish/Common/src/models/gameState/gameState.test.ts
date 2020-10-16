import { boardGet, boardSet, makeBoardWithTiles } from "@models/board"
import { GameStateActionError } from "@models/errors/gameStateActionError"
import { containsPoint } from "@models/point"
import { Tile } from "@models/tile"
import { expect } from "chai"
import { Player, putPenguin, sortPlayersByAgeAsc } from "@models/player"
import { isDeepStrictEqual } from "util"
import {
    createGameState,
    createGameStateCustomBoard,
    GameState,
    movePenguin,
    placePenguin,
    getPlayerWhoseTurnItIs,
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
 * Helper function for placing multiple penguins players in consecutive order
 * starting with the first player. Used for testing.
 * @param gs The base game state
 * @param positions Position at which penguins should be placed
 * @param playerIds Ids of the players who will be placing, ordered by their turn order
 */
const placeMultiple = (
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

describe("GameState", () => {
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

    let gs: GameState

    beforeEach(() => {
        gs = createGameStateCustomBoard([player1, player2, player3], board)
    })

    it("gets the correct player whose turn it is", () => {
        const [player, playerIndex] = getPlayerWhoseTurnItIs(gs)
        expect(playerIndex).to.equal(0)
        expect(player.id).to.be.equal("p1")

        const newState = placeMultiple(
            gs,
            [
                [0, 0],
                [0, 1],
                [0, 2],
                [5, 1],
            ],
            ["p1", "p2", "p3"]
        )

        const [newPlayer, newPlayerIndex] = getPlayerWhoseTurnItIs(newState)
        expect(newPlayerIndex).to.equal(1)
        expect(newPlayer.id).to.equal("p2")
    })

    /* Tests to check behavior in the placePenguinPhase */
    it("can't place a penguin for a player out of turn", () => {
        expect(() => {
            placePenguin(gs, "p2", { x: 1, y: 0 })
        }).to.throw(GameStateActionError, "cannot play out of order")
    })

    it("is possible to place a penguin for a player", () => {
        const placePos = { x: 2, y: 1 }
        const newState = placePenguin(gs, "p1", placePos)

        expect((boardGet(newState.board, placePos) as Tile).occupied).to.be.true
        expect(containsPoint(newState.players[0].penguins, placePos)).to.be.true
    })

    it("is not possible to place a penguin on another", () => {
        const placePos = { x: 2, y: 1 }
        const newState = placePenguin(gs, "p1", placePos)

        expect(() => {
            placePenguin(newState, "p2", placePos)
        }).to.throw("cannot place penguin on tile")
    })

    it("changes to the playing state after enough penguins are placed", () => {
        const placedAllPenguins = placeMultiple(
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
        expect(placedAllPenguins.phase).to.equal("playing")
    })

    it("prevents too many penguins from being placed", () => {
        expect(() => {
            placeMultiple(
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
                    [5, 1],
                ],
                ["p1", "p2", "p3"]
            )
        }).to.throw(GameStateActionError, "expected penguinPlacement phase")
    })

    it("can't move penguin in placePenguin phase", () => {
        expect(() => {
            movePenguin(gs, "p1", { x: 0, y: 0 }, { x: 1, y: 0 })
        }).to.throw(GameStateActionError, "expected playing phase")
    })
})
