import { createBoard } from "@models/board"
import { IllegalArgumentError } from "@models/errors/illegalArgument"
import { expect } from "chai"

describe("the board", () => {
    beforeEach(() => {})

    it("can be created without holes", () => {
        let board = createBoard(10, [])
        expect(board.has({ x: 0, y: 0 })).is.true
        expect(board.length()).to.be.at.least(10)
        expect(board.getNumberOfTiles()).to.be.at.least(10)
    })

    it("cannot be created with negative number of tiles", () => {
        expect(() => createBoard(-5, [])).to.throw(
            IllegalArgumentError,
            "number of tiles must be at least"
        )
    })

    it("can be created with holes outside of the board", () => {
        let board = createBoard(10, [{ x: 100, y: 100 }])
        expect(board.getNumberOfTiles()).to.be.at.least(10)
    })

    it("can be created with a hole on the board", () => {
        let board = createBoard(10, [{ x: 0, y: 0 }])
        expect(board.get({ x: 0, y: 0 })).to.equal("hole")
        expect(board.getNumberOfTiles()).to.be.at.least(10)
    })
})
