import { expect } from "chai"
import { createSkipTurnAction } from "../../../Common/src/models/action/action"
import { createMoveAction } from "../../../Common/src/models/action/flycheck_action"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import { tiebreakMoves } from "./strategy"

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

        it("handles row offset edge case for origin coordinate", () => {
            expect(tiebreakMoves([a10_00, a20_00])).to.equal(a20_00)
        })

        const a22_60 = createMoveAction("p1", { x: 2, y: 2 }, { x: 6, y: 0 })
        const a22_50 = createMoveAction("p1", { x: 2, y: 2 }, { x: 5, y: 0 })

        it("handles row offset edge case for destination coordinate", () => {
            expect(tiebreakMoves([a22_60, a22_50])).to.equal(a22_60)
        })
    })
})
