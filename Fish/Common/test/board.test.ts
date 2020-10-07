import { createBoard } from "@models/board"
import { IllegalArgumentError } from "@models/errors/illegalArgument"
import { expect } from "chai"
import { ActualTile } from "@/models/tile"

describe("the board", () => {
    beforeEach(() => {})

    it("can be created without holes", () => {
        let board = createBoard(10)
        expect(board.has({ x: 0, y: 0 })).is.true
        expect(board.length()).to.be.at.least(10)
        expect(board.getNumberOfTiles()).to.be.at.least(10)
    })

    it("cannot be created with negative number of tiles", () => {
        expect(() => createBoard(-5)).to.throw(
            IllegalArgumentError,
            "number of tiles must be at least"
        )
    })

    it("cannot be created with negative number of fish on each tile", () => {
        expect(() => createBoard(10, { numFishPerTile: -5 })).to.throw(
            IllegalArgumentError,
            "number of fish per tile must be at least"
        )
    })

    it("can be created with a custom number of fish per tile", () => {
        let board = createBoard(10, { numFishPerTile: 4 })
        expect(board.has({ x: 0, y: 0 })).is.true
        expect((board.get({ x: 0, y: 0 }) as ActualTile).fish).to.equal(4)
    })

    it("can be created with holes outside of the board", () => {
        let board = createBoard(10, { holes: [{ x: 100, y: 100 }] })
        expect(board.getNumberOfTiles()).to.be.at.least(10)
    })

    it("can be created with a hole on the board", () => {
        let board = createBoard(10, { holes: [{ x: 0, y: 0 }] })
        expect(board.get({ x: 0, y: 0 })).to.equal("hole")
        expect(board.getNumberOfTiles()).to.be.at.least(10)
    })
})
