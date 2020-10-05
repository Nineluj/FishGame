import { createBoard } from "@models/board"
import { IllegalArgumentError } from "@models/errors/illegalArgument"
import { expect } from "chai"

describe("the board", () => {
    beforeEach(() => {})

    it("can be created without holes", () => {
        let board = createBoard(10, [])
        expect(board.has({ x: 0, y: 0 })).is.true
    })

    it("cannot be created with negative number of tiles", () => {
        expect(() => createBoard(-5, [])).to.throw(
            IllegalArgumentError,
            "number of tiles must be at least"
        )
    })

    it("can be created with holes outside of ___", () => {
        expect(true).to.be.false
    })
})
