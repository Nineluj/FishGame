import { expect } from "chai"
import {
    createIdentityAction,
    actionsEqual,
    createMoveAction,
    createSkipTurnAction,
} from "./action"

describe("Actions", () => {
    const point1 = { x: 1, y: 2 }
    const point2 = { x: 3, y: 1 }

    it("can create identity action", () => {
        expect(createIdentityAction)
    })
    it("identity actions are equal", () => {
        expect(actionsEqual(createIdentityAction(), createIdentityAction())).to
            .be.true
    })

    it("actions of different types are not equal", () => {
        const actions = [
            createIdentityAction(),
            createMoveAction("p1", point1, point2),
            createSkipTurnAction("p1"),
        ]

        expect(actionsEqual(actions[0], actions[1])).to.be.false
        expect(actionsEqual(actions[0], actions[2])).to.be.false
        expect(actionsEqual(actions[1], actions[2])).to.be.false
    })

    it("skip actions for different ids are not equal", () => {
        expect(
            actionsEqual(createSkipTurnAction("p1"), createSkipTurnAction("p3"))
        ).to.be.false
    })

    it("move actions for different ids are not equal", () => {
        expect(
            actionsEqual(
                createMoveAction("p1", point1, point2),
                createMoveAction("p2", point1, point2)
            )
        ).to.be.false
    })

    it("actions with same parameters are equal", () => {
        expect(
            actionsEqual(
                createMoveAction("p3", point1, point2),
                createMoveAction("p3", point1, point2)
            )
        ).to.be.true
        expect(
            actionsEqual(
                createSkipTurnAction("aaa"),
                createSkipTurnAction("aaa")
            )
        ).to.be.true
    })
})
