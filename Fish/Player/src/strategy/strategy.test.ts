import { expect } from "chai"
import {
    createSkipTurnAction,
    createMoveAction,
    actionsEqual,
} from "../../../Common/src/models/action/action"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import { getPlayingState } from "../../../Common/src/models/testHelpers"
import {
    getOverState,
    getPlacementState,
} from "../../../Common/src/models/testHelpers/testHelpers"
import {
    getPenguinMaxMinMoveStrategy,
    getSkipTurnStrategy,
    tiebreakMoves,
    getPenguinPlacementStrategy,
} from "./strategy"
import { isDeepStrictEqual } from "util"

describe("Player Strategy", () => {
    describe("#tiebreakMoves", () => {
        it("throws an error when called with empty array", () => {
            expect(() => {
                tiebreakMoves([])
            }).to.throw(IllegalArgumentError, "at least one action")
        })

        const a02_00 = createMoveAction("p1", { x: 0, y: 2 }, { x: 0, y: 0 })

        it("handles single move correctly with input of length 1", () => {
            expect(tiebreakMoves([a02_00])).to.equal(a02_00)
        })

        it("throws an error when given non-move action", () => {
            expect(() => {
                tiebreakMoves([a02_00, createSkipTurnAction("p1")])
            }).to.throw(IllegalArgumentError, "non-move action")
        })

        const a60_00 = createMoveAction("p1", { x: 6, y: 0 }, { x: 0, y: 0 })
        const a31_10 = createMoveAction("p1", { x: 3, y: 1 }, { x: 1, y: 0 })
        const a31_00 = createMoveAction("p1", { x: 3, y: 1 }, { x: 0, y: 0 })
        const a30_10 = createMoveAction("p1", { x: 3, y: 0 }, { x: 1, y: 0 })
        const a20_00 = createMoveAction("p1", { x: 2, y: 0 }, { x: 0, y: 0 })

        it("picks the right action based on origin coordinate", () => {
            expect(tiebreakMoves([a02_00, a31_10])).to.equal(a31_10)
            expect(tiebreakMoves([a20_00, a60_00, a30_10])).to.equal(a20_00)
        })

        it("picks the right action based on destination coordinate", () => {
            expect(tiebreakMoves([a31_00, a31_10])).to.equal(a31_00)
        })

        const a10_00 = createMoveAction("p1", { x: 1, y: 0 }, { x: 0, y: 0 })
        const a20_21 = createMoveAction("p1", { x: 2, y: 0 }, { x: 2, y: 1 })
        const a11_21 = createMoveAction("p1", { x: 1, y: 1 }, { x: 2, y: 1 })

        it("handles row offset edge case for origin coordinate", () => {
            expect(tiebreakMoves([a10_00, a20_00])).to.equal(a20_00)
            expect(tiebreakMoves([a20_21, a11_21])).to.equal(a20_21)
        })

        const a22_60 = createMoveAction("p1", { x: 2, y: 2 }, { x: 6, y: 0 })
        const a22_50 = createMoveAction("p1", { x: 2, y: 2 }, { x: 5, y: 0 })

        it("handles row offset edge case for destination coordinate", () => {
            expect(tiebreakMoves([a22_60, a22_50])).to.equal(a22_60)
        })
    })

    describe("#getSkipTurnStrategy", () => {
        it("creates a skipTurnAction", () => {
            const gs = getPlayingState()
            const sts = getSkipTurnStrategy()
            const action = sts.getNextAction(gs)

            expect(action.data.actionType).to.equal("skipTurn")
            expect(action.data.playerId).to.equal("p1")
        })
    })

    describe("#getPlacePenguinStrategy", () => {
        it("Places a penguin correctly when there are spots left", () => {
            const strategy = getPenguinPlacementStrategy(getSkipTurnStrategy())
            const gs = getPlacementState()

            const expectedActionData = {
                actionType: "put",
                playerId: "p1",
                dst: { x: 0, y: 0 },
            }

            const firstAction = strategy.getNextAction(gs)

            expect(isDeepStrictEqual(firstAction.data, expectedActionData)).to
                .be.true

            const gs2 = firstAction.apply(gs)

            const expectedActionData2 = {
                actionType: "put",
                playerId: "p2",
                dst: { x: 2, y: 0 },
            }

            const secondAction = strategy.getNextAction(gs2)
            expect(isDeepStrictEqual(secondAction.data, expectedActionData2)).to
                .be.true

            const gs3 = secondAction.apply(gs2)
            const expectedActionData3 = {
                actionType: "put",
                playerId: "p3",
                dst: { x: 4, y: 0 },
            }
            const thirdAction = strategy.getNextAction(gs3)
            expect(isDeepStrictEqual(thirdAction.data, expectedActionData3)).to
                .be.true

            const gs4 = thirdAction.apply(gs3)
            const expectedActionData4 = {
                actionType: "put",
                playerId: "p1",
                dst: { x: 1, y: 0 },
            }
            const fourthAction = strategy.getNextAction(gs4)
            expect(isDeepStrictEqual(fourthAction.data, expectedActionData4)).to
                .be.true
        })

        it("Returns a skip turn action when game is not in penguin placement phase", () => {
            const strategy = getPenguinPlacementStrategy(getSkipTurnStrategy())
            const gs = getPlayingState()

            const expectedActionData = {
                actionType: "skipTurn",
                playerId: "p1",
            }

            const action = strategy.getNextAction(gs)

            expect(isDeepStrictEqual(action.data, expectedActionData)).to.be
                .true
        })
    })

    describe("#getPenguinMaxMinMoveStrategy", () => {
        const gs = getPlayingState()

        it("returns a the backup strategy (skipTurn) when the game is over", () => {
            const overGs = getOverState()
            expect(
                getPenguinMaxMinMoveStrategy(
                    3,
                    getSkipTurnStrategy()
                ).getNextAction(overGs).data.actionType
            ).to.equal("skipTurn")
        })

        it("handles depth greater than the number of turns left in the game", () => {})
    })
})
