import { containsPoint, Point } from "@models/point"
import { expect } from "chai"

describe("Point", () => {
    const points: Array<Point> = [
        { x: 3, y: 5 },
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        { x: 3, y: 2 },
    ]

    it("finds point when it is in list", () => {
        expect(containsPoint(points, { x: 3, y: 2 })).to.be.true
    })

    it("doesn't find point when it is not in list", () => {
        expect(containsPoint(points, { x: 2, y: 2 })).to.be.false
    })
})
