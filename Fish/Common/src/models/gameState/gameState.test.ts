import { boardGet } from "../board"
import { GameStateActionError } from "../errors/gameStateActionError"
import { containsPoint } from "../point"
import { Tile } from "../tile"
import { expect } from "chai"
import { Player } from "../player"
import {
    createGameState,
    GameState,
    movePenguin,
    placePenguin,
    getPlayerWhoseTurnItIs,
    skipTurn,
} from "./gameState"
import {
    placeMultiple,
    getPlayingState,
    getPlacementState,
} from "../testHelpers"
import { IllegalArgumentError } from "../errors/illegalArgumentError"
import { InvalidMoveError } from "../errors/invalidMoveError"
import { getOverState } from "../testHelpers/testHelpers"

describe("Game State", () => {
    describe("#creation", () => {
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

    let gs: GameState

    describe("#placement", () => {
        beforeEach(() => {
            gs = getPlacementState()
        })

        it("gets the correct player whose turn it is", () => {
            const { player, index } = getPlayerWhoseTurnItIs(gs)
            expect(index).to.equal(0)
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

            const np = getPlayerWhoseTurnItIs(newState)
            expect(np.index).to.equal(1)
            expect(np.player.id).to.equal("p2")
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

            expect((boardGet(newState.board, placePos) as Tile).occupied).to.be
                .true
            expect(containsPoint(newState.players[0].penguins, placePos)).to.be
                .true
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
    })

    describe("#playing", () => {
        it("prevents a player from playing out of turn", () => {
            gs = getPlayingState()

            expect(() =>
                movePenguin(gs, "p2", { x: 0, y: 1 }, { x: 1, y: 1 })
            ).to.throw(InvalidMoveError, "cannot play out of order")
        })

        it("allows correct player to move their penguin", () => {
            gs = getPlayingState()
            const newState = movePenguin(
                gs,
                "p1",
                { x: 0, y: 0 },
                { x: 1, y: 0 }
            )

            // check that the player has the new penguin pos
            expect(containsPoint(newState.players[0].penguins, { x: 1, y: 0 }))
                .to.be.true
            // check that the player no longer has the old penguin pos
            expect(containsPoint(newState.players[0].penguins, { x: 0, y: 0 }))
                .to.be.false

            // the right number of points are added to the player
            expect(newState.players[0].score).to.equal(gs.players[0].score + 2)

            // the destination tile is marked as occupied
            expect((boardGet(newState.board, { x: 1, y: 0 }) as Tile).occupied)
                .to.be.true
        })

        it("allows all players to play consecutive turns", () => {
            let cState = getPlayingState()
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
                expect((boardGet(cState.board, m.to) as Tile).occupied).to.be
                    .true
            })
        })

        it("prevents players from playing out of turn", () => {
            let cState = getPlayingState()

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
            let cState = getPlayingState()

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
            expect(currPlayer.player.id).to.equal("p3")
        })

        it("prevents player from moving other player's penguin", () => {
            gs = movePenguin(
                getPlayingState(),
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
            const cState = getOverState()

            expect(cState.phase).to.equal("over")
        })
    })
})
