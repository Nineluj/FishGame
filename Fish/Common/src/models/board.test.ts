import { createBoard } from "@models/board"
import { IllegalArgumentError } from "@models/errors/illegalArgument"
import { expect } from "chai"
import { ActualTile } from "@/models/tile"
import { isDeepStrictEqual } from "util"

describe("the board", () => {
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

    it("returns no moves when getReachableTilesFrom is invoked on a hole", () => {
        const board = createBoard(10, { holes: [{ x: 0, y: 2 }] })
        expect(board.getReachableTilesFrom({ x: 0, y: 2 })).to.be.empty
    })

    it("returns no moves when getReachableTilesFrom is invoked on an empty board", () => {
        const board = createBoard(0)
        expect(board.getReachableTilesFrom({ x: 0, y: 0 })).to.be.empty
    })

    it("returns valid moves when getReachableTilesFrom is invoked on a tile with neighboring tiles", () => {
        const board = createBoard(0)
        board.set({ x: 2, y: 2 }, { fish: 1 })
        board.set({ x: 2, y: 1 }, { fish: 1 })
        board.set({ x: 2, y: 0 }, { fish: 1 })
        board.set({ x: 3, y: 2 }, { fish: 1 })
        board.set({ x: 4, y: 4 }, { fish: 1 })
        board.set({ x: 2, y: 4 }, { fish: 1 })
        board.set({ x: 2, y: 3 }, "hole")
        board.set({ x: 1, y: 2 }, { fish: 1 })

        const reachableTiles = board.getReachableTilesFrom({ x: 2, y: 2 })
        expect(reachableTiles).to.be.of.length(4)

        const expected = [
            { x: 2, y: 1, tile: { fish: 1 } },
            { x: 2, y: 0, tile: { fish: 1 } },
            { x: 3, y: 2, tile: { fish: 1 } },
            { x: 1, y: 2, tile: { fish: 1 } },
        ]
        expect(isDeepStrictEqual(reachableTiles, expected)).to.be.true
    })

    it("returns no moves when getReachableTilesFrom is invoked on an isolated tile", () => {
        const board = createBoard(16, {
            holes: [
                { x: 1, y: 1 },
                { x: 1, y: 2 },
                { x: 2, y: 3 },
                { x: 3, y: 2 },
                { x: 3, y: 1 },
                { x: 2, y: 1 },
            ],
        })
        expect(board.getReachableTilesFrom({ x: 2, y: 2 })).to.be.empty
    })
})
