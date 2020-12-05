import { expect } from "chai"
import { createGameNode, completeAction, applyToAllFutureStates } from "./tree"
import { createGameState, GameState } from "../gameState/gameState"
import { getPlayingState } from "../testHelpers"
import { GamePhaseError } from "../errors/gamePhaseError"
import { createPlayer, getOverState } from "../testHelpers/testHelpers"
import { isDeepStrictEqual } from "util"
import { GameStateActionError } from "../errors/gameStateActionError"
import { createMoveAction } from "../action/action"
import { InvalidMoveError } from "../errors/invalidMoveError"

describe("Game Tree", () => {
    describe("#creation", () => {
        it("cannot be created with a game that has not started yet", () => {
            expect(() => {
                createGameNode(
                    createGameState([
                        createPlayer("red", "foo"),
                        createPlayer("black", "bar"),
                        createPlayer("brown", "baz"),
                    ])
                )
            }).to.throw(
                GamePhaseError,
                "Cannot construct a game node for a game that hasn't begun or has already ended"
            )
        })

        it("cannot be created with a game that has already ended", () => {
            const gs = getOverState()
            expect(() => {
                createGameNode(gs)
            }).to.throw(GamePhaseError, "ended")
        })

        it("can be created for a game that is in the playing phase", () => {
            const gameNode = createGameNode(getPlayingState())
            const expected = {
                action: { data: { actionType: "identity" } },
                gs: {
                    board: [
                        [
                            { fish: 2, occupied: true },
                            { fish: 2, occupied: true },
                            { fish: 2, occupied: true },
                        ],
                        [
                            { fish: 2, occupied: false },
                            { fish: 2, occupied: false },
                        ],
                        [
                            { fish: 2, occupied: false },
                            { fish: 2, occupied: true },
                            { fish: 2, occupied: true },
                        ],
                        [
                            { fish: 2, occupied: true },
                            { fish: 2, occupied: true },
                        ],
                        [
                            { fish: 2, occupied: true },
                            { fish: 2, occupied: false },
                            { fish: 2, occupied: true },
                        ],
                        [
                            { fish: 2, occupied: false },
                            { fish: 2, occupied: false },
                        ],
                    ],
                    phase: "playing",
                    players: [
                        {
                            id: "p1",
                            penguinColor: "black",
                            penguins: [
                                { x: 0, y: 0 },
                                { x: 3, y: 1 },
                                { x: 2, y: 1 },
                            ],
                            score: 0,
                        },
                        {
                            id: "p2",
                            penguinColor: "brown",
                            penguins: [
                                { x: 0, y: 1 },
                                { x: 4, y: 2 },
                                { x: 3, y: 0 },
                            ],
                            score: 0,
                        },
                        {
                            id: "p3",
                            penguinColor: "red",
                            penguins: [
                                { x: 0, y: 2 },
                                { x: 4, y: 0 },
                                { x: 2, y: 2 },
                            ],
                            score: 0,
                        },
                    ],
                },
            }

            expect(gameNode.action.actionType).to.equal("identity")
            expect(isDeepStrictEqual(expected.gs, gameNode.gs)).to.equal(true)
            expect(gameNode.children().length).to.equal(7)

            gameNode.children().forEach((child) => {
                expect(
                    isDeepStrictEqual(
                        completeAction(gameNode, child.action).gs,
                        child.gs
                    )
                ).to.equal(true)
            })
        })
    })

    describe("#actions", () => {
        it("throws an error when invoking completeAction() with an invalid Action/GameNode combo", () => {
            const gameNode = createGameNode(getPlayingState())
            expect(() => {
                completeAction(gameNode, {
                    actionType: "move",
                    data: "foo",
                    apply: (gs: GameState) => {
                        return "bar" as any
                    },
                })
            }).to.throw(
                GameStateActionError,
                "could not make the given move, it is not valid"
            )
        })

        it("returns the correct gamenode when completeAction() is invoked with a valid Action/GameNode combo for a move action", () => {
            const gameNode = createGameNode(getPlayingState())
            const expected = {
                board: [
                    [
                        "hole",
                        { fish: 2, occupied: true },
                        { fish: 2, occupied: true },
                    ],
                    [
                        { occupied: true, fish: 2 },
                        { fish: 2, occupied: false },
                    ],
                    [
                        { fish: 2, occupied: false },
                        { fish: 2, occupied: true },
                        { fish: 2, occupied: true },
                    ],
                    [
                        { fish: 2, occupied: true },
                        { fish: 2, occupied: true },
                    ],
                    [
                        { fish: 2, occupied: true },
                        { fish: 2, occupied: false },
                        { fish: 2, occupied: true },
                    ],
                    [
                        { fish: 2, occupied: false },
                        { fish: 2, occupied: false },
                    ],
                ],
                phase: "playing",
                players: [
                    {
                        id: "p2",
                        penguinColor: "brown",
                        penguins: [
                            { x: 0, y: 1 },
                            { x: 4, y: 2 },
                            { x: 3, y: 0 },
                        ],
                        score: 0,
                    },
                    {
                        id: "p3",
                        penguinColor: "red",
                        penguins: [
                            { x: 0, y: 2 },
                            { x: 4, y: 0 },
                            { x: 2, y: 2 },
                        ],
                        score: 0,
                    },
                    {
                        id: "p1",
                        penguinColor: "black",
                        penguins: [
                            { x: 1, y: 0, tile: { fish: 2, occupied: false } },
                            { x: 3, y: 1 },
                            { x: 2, y: 1 },
                        ],
                        score: 2,
                    },
                ],
            }

            const moveAction = createMoveAction(
                "p1",
                { x: 0, y: 0 },
                { x: 1, y: 0 }
            )

            const actual = completeAction(gameNode, moveAction)
            expect(isDeepStrictEqual(expected, actual.gs)).to.equal(true)
        })

        it("returns the correct gamenode when completeAction() is invoked with a invalid Action/GameNode combo for consecutive move actions", () => {
            const gameNode = createGameNode(getPlayingState())

            const moveAction = createMoveAction(
                "p1",
                { x: 0, y: 0 },
                { x: 1, y: 0 }
            )

            const actual = completeAction(gameNode, moveAction)

            expect(() => {
                completeAction(actual, moveAction)
            }).to.throw(GameStateActionError, "not valid")
        })

        it("returns the correct gamenode when completeAction() is invoked with a valid Action/GameNode combo for consecutive move actions", () => {
            const gameNode = createGameNode(getPlayingState())

            const moveAction = createMoveAction(
                "p1",
                { x: 0, y: 0 },
                { x: 1, y: 0 }
            )

            const first = completeAction(gameNode, moveAction)
            const secondMoveAction = createMoveAction(
                "p2",
                { x: 0, y: 1 },
                { x: 1, y: 1 }
            )

            expect(() => {
                completeAction(first, secondMoveAction)
            }).to.not.throw
        })
    })

    describe("#applyToAllFutureStates", () => {
        it("correctly applies a lambda action to all directly reachable GameStates when applyToAllFutureStates() is invoked", () => {
            const sumPenguinXYs = (gs: GameState): number => {
                let total = 0
                gs.players.forEach((pl) => {
                    pl.penguins.forEach((p) => {
                        total += p.x
                        total += p.y
                    })
                })
                return total
            }

            const gs = getPlayingState()
            const gn = createGameNode(gs)
            const out = applyToAllFutureStates(gn, sumPenguinXYs)

            expect(isDeepStrictEqual(out, [28, 28, 28, 26, 26, 25, 27])).to.be
                .true
        })
    })
})
