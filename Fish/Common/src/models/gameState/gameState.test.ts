import { boardGet, makeBoardWithTiles } from "@models/board"
import { GameStateActionError } from "@models/errors/gameStateActionError"
import { containsPoint } from "@models/point"
import { Tile } from "@models/tile"
import { expect } from "chai"
import { Player } from "@models/player"
import {
    createGameState,
    createGameStateCustomBoard,
    GameState,
    movePenguin,
    placePenguin,
    getPlayerWhoseTurnItIs,
    skipTurn,
} from "./gameState"
import { IllegalArgumentError } from "@models/errors/illegalArgumentError"
import { InvalidMoveError } from "../errors/invalidMoveError"

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

    it("can't move penguin in placePenguin phase", () => {
        expect(() => {
            movePenguin(gs, "p1", { x: 0, y: 0 }, { x: 1, y: 0 })
        }).to.throw(GameStateActionError, "expected playing phase")
    })

    /* Tests for the transition from penguinPlacement and playing */
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

    /* Tests for the playing phase  */
    /**
     * Helper for getting a game state that is actively being played
     */
    const getPlayingState = (gs: GameState): GameState => {
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

    it("prevents a player from playing out of turn", () => {
        gs = getPlayingState(gs)

        expect(() =>
            movePenguin(gs, "p2", { x: 0, y: 1 }, { x: 1, y: 1 })
        ).to.throw(InvalidMoveError, "cannot play out of order")
    })

    it("allows correct player to move their penguin", () => {
        gs = getPlayingState(gs)
        const newState = movePenguin(gs, "p1", { x: 0, y: 0 }, { x: 1, y: 0 })

        // check that the player has the new penguin pos
        expect(containsPoint(newState.players[0].penguins, { x: 1, y: 0 })).to
            .be.true
        // check that the player no longer has the old penguin pos
        expect(containsPoint(newState.players[0].penguins, { x: 0, y: 0 })).to
            .be.false

        // the right number of points are added to the player
        expect(newState.players[0].score).to.equal(gs.players[0].score + 2)

        // the destination tile is marked as occupied
        expect((boardGet(newState.board, { x: 1, y: 0 }) as Tile).occupied).to
            .be.true
    })

    it("allows all players to play consecutive turns", () => {
        let cState = getPlayingState(gs)
        const initialScores = cState.players.map((pl) => pl.score)

        const moves = [
            { id: "p1", from: { x: 0, y: 0 }, to: { x: 1, y: 0 } },
            { id: "p2", from: { x: 3, y: 0 }, to: { x: 2, y: 0 } },
            { id: "p3", from: { x: 0, y: 2 }, to: { x: 1, y: 1 } },
        ]

        moves.forEach((m) => {
            cState = movePenguin(cState, m.id, m.from, m.to)
        })

        cState.players.forEach((pl, i) =>
            expect(pl.score).to.equal(initialScores[i] + 2)
        )

        moves.forEach((m) => {
            expect(boardGet(cState.board, m.from)).to.equal("hole")
            expect((boardGet(cState.board, m.to) as Tile).occupied).to.be.true
        })
    })

    it("prevents players from playing out of turn", () => {
        let cState = getPlayingState(gs)

        const moves = [
            { id: "p1", from: { x: 0, y: 0 }, to: { x: 1, y: 0 } },
            { id: "p3", from: { x: 0, y: 2 }, to: { x: 1, y: 1 } },
            { id: "p2", from: { x: 3, y: 0 }, to: { x: 2, y: 0 } },
        ]

        expect(() =>
            moves.forEach((m) => {
                cState = movePenguin(cState, m.id, m.from, m.to)
            })
        ).to.throw(InvalidMoveError, "cannot play out of order")
    })

    it("allows players to skip their turn", () => {
        let cState = getPlayingState(gs)

        const moves = [
            { id: "p1", from: { x: 0, y: 0 }, to: { x: 1, y: 0 } },
            { id: "p2", from: { x: 3, y: 0 }, to: { x: 2, y: 0 } },
            { id: "p3", from: { x: 0, y: 2 }, to: { x: 1, y: 1 } },
        ]

        moves.forEach((m) => {
            cState = movePenguin(cState, m.id, m.from, m.to)
        })

        // skip the turns
        cState = skipTurn(cState, "p1")
        cState = skipTurn(cState, "p2")

        const currPlayer = getPlayerWhoseTurnItIs(cState)
        expect(currPlayer[0].id).to.equal("p3")
    })

    it("prevents player from moving other player's penguin", () => {
        gs = movePenguin(
            getPlayingState(gs),
            "p1",
            { x: 0, y: 0 },
            { x: 1, y: 0 }
        )

        expect(() => {
            movePenguin(gs, "p2", { x: 0, y: 2 }, { x: 1, y: 1 })
        }).to.throw(
            InvalidMoveError,
            "player must have a penguin at the origin"
        )
    })

    it("allows players to play until the game is over", () => {
        let cState = getPlayingState(gs)

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

        expect(cState.phase).to.equal("over")
    })
})
