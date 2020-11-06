import { expect } from "chai"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import {
    players,
    getPlacementState,
    getPlayingState,
    getOverState,
} from "../../../Common/src/models/testHelpers/testHelpers"
import { Referee } from "./referee"
import { isDeepStrictEqual } from "util"
import {
    createPlacePenguinAction,
    createMoveAction,
} from "../../../Common/src/models/action/action"

describe("Referee", () => {
    describe("#constructor", () => {
        it("handles proper argument gracefully", () => {
            expect(() => {
                new Referee(players)
            }).not.to.throw()
        })

        it("throws an error when given too many or few players", () => {
            expect(() => {
                new Referee([])
            }).to.throw(IllegalArgumentError)

            expect(() => {
                new Referee([
                    players[0],
                    players[0],
                    players[0],
                    players[1],
                    players[2],
                ])
            })
        })
    })

    describe("#getGameState", () => {
        it("Returns a valid and correct gamestate", () => {
            const ref = new Referee(players)

            const expected = {
                board: [
                    [
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                    ],
                    [
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                    ],
                    [
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                    ],
                    [
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                        { fish: 1, occupied: false },
                    ],
                ],
                phase: "penguinPlacement",
                players: [
                    { id: "p1", penguinColor: "black", penguins: [], score: 0 },
                    { id: "p2", penguinColor: "brown", penguins: [], score: 0 },
                    { id: "p3", penguinColor: "red", penguins: [], score: 0 },
                ],
            }

            expect(isDeepStrictEqual(ref.getGameState(), expected)).to.be.true
        })
    })

    describe("#getGamePhase", () => {
        it("Returns correct initial gamePhase on a new game", () => {
            const ref = new Referee(players)

            expect(ref.getGamePhase()).to.equal("penguinPlacement")
        })

        it("Returns correct gamePhase on a game in the playing phase", () => {
            const ref = new Referee(
                getPlayingState().players,
                getPlayingState().board
            )

            expect(ref.getGamePhase()).to.equal("playing")
        })

        it("Returns correct gamePhase on a game in the over phase", () => {
            const ref = new Referee(
                getPlayingState().players,
                getPlayingState().board
            )

            let moves = [
                { id: "p1", from: { x: 0, y: 0 }, to: { x: 1, y: 0 } },
                { id: "p2", from: { x: 3, y: 0 }, to: { x: 2, y: 0 } },
                { id: "p3", from: { x: 0, y: 2 }, to: { x: 1, y: 1 } },
                { id: "p1", from: { x: 3, y: 1 }, to: { x: 5, y: 0 } },
                { id: "p2", from: { x: 4, y: 2 }, to: { x: 5, y: 1 } },
            ]

            moves.forEach((move) => {
                ref.makeAction(createMoveAction(move.id, move.from, move.to))
            })

            expect(ref.getGamePhase()).to.equal("over")
        })
    })

    describe("#getReplay", () => {
        it("Returns correct game replay", () => {
            const ref = new Referee(
                getPlayingState().players,
                getPlayingState().board
            )

            let moves = [{ id: "p1", from: { x: 0, y: 0 }, to: { x: 1, y: 0 } }]

            moves.forEach((move) => {
                ref.makeAction(createMoveAction(move.id, move.from, move.to))
            })

            const replay1data = {
                actionType: "move",
                playerId: "p2",
                origin: { x: 3, y: 0 },
                dst: { x: 2, y: 0 },
            }

            const replay5data = {
                actionType: "move",
                playerId: "p3",
                origin: { x: 5, y: 0 },
                dst: { x: 5, y: 1 },
            }

            expect(ref.getReplay()).to.have.length(6)
            expect(isDeepStrictEqual(ref.getReplay()[1].data, replay1data)).to
                .be.true
            expect(isDeepStrictEqual(ref.getReplay()[5].data, replay5data)).to
                .be.true
        })
    })

    describe("#getPlayerStatuses", () => {
        it("Eliminates players properly when they make an invalid move", () => {
            const ref = new Referee(
                getPlayingState().players,
                getPlayingState().board
            )

            ref.makeAction(createPlacePenguinAction("p1", { x: 0, y: 0 }))

            const expected = {
                players: [
                    {
                        id: "p2",
                        penguinColor: "brown",
                        penguins: [
                            { x: 0, y: 1 },
                            { x: 4, y: 2 },
                            { x: 1, y: 1, tile: { fish: 2, occupied: false } },
                        ],
                        score: 12,
                    },
                    {
                        id: "p3",
                        penguinColor: "red",
                        penguins: [
                            { x: 0, y: 2 },
                            { x: 5, y: 1, tile: { fish: 2, occupied: false } },
                            { x: 2, y: 2 },
                        ],
                        score: 12,
                    },
                ],
                eliminatedPlayerIds: ["p1"],
            }

            expect(isDeepStrictEqual(ref.getPlayerStatuses(), expected)).to.be
                .true
        })
    })

    describe("#makeAction", () => {
        it("Eliminates players properly when they make an invalid move", () => {
            const ref = new Referee(
                getPlayingState().players,
                getPlayingState().board
            )

            ref.makeAction(createPlacePenguinAction("p1", { x: 0, y: 0 }))

            expect(ref.getPlayerStatuses().eliminatedPlayerIds[0]).to.equal(
                "p1"
            )
        })
    })
})
