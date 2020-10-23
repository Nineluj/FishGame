import { expect } from "chai"
import { getPlacementState } from "."
import {
    getPlayingState,
    placeMultiple,
    makeBoardWithTiles,
} from "./testHelpers"
import { boardGet, boardHas, getNumberOfTilesOnBoard } from "../board"
import { Tile } from "../tile"

describe("Test helpers", () => {
    describe("#getPlacementState", () => {
        it("has the correct phase", () => {
            expect(getPlacementState().phase).to.equal("penguinPlacement")
        })
    })
    describe("#getPlayingState", () => {
        it("has the correct phase", () => {
            expect(getPlayingState().phase).to.equal("playing")
        })
    })

    describe("#placeMultiple", () => {
        it("does nothing with empty list", () => {
            expect(placeMultiple(getPlacementState(), [], []).turn).to.equal(0)
        })

        it("places correctly", () => {
            const newGs = placeMultiple(
                getPlacementState(),
                [
                    [0, 0],
                    [2, 2],
                    [3, 0],
                ],
                ["p1", "p2", "p3"]
            )

            expect((boardGet(newGs.board, { x: 0, y: 0 }) as Tile).occupied).to
                .be.true
            expect((boardGet(newGs.board, { x: 2, y: 2 }) as Tile).occupied).to
                .be.true
            expect((boardGet(newGs.board, { x: 3, y: 0 }) as Tile).occupied).to
                .be.true
        })
    })

    describe("#makeBoardWithTiles", () => {
        it("can create board with tiles at given positions", () => {
            const positions: Array<[number, number]> = [
                [0, 0],
                [0, 1],
                [1, 0],
                [1, 1],
                [2, 0],
                [2, 1],
                [2, 2],
            ]
            const createdBoard = makeBoardWithTiles(positions)

            positions.forEach((tuplePos) => {
                const pos = { x: tuplePos[0], y: tuplePos[1] }
                expect(boardHas(createdBoard, pos)).to.be.true
                expect((boardGet(createdBoard, pos) as Tile).fish).to.be.equal(
                    2
                )
            })

            expect(getNumberOfTilesOnBoard(createdBoard)).to.be.equal(
                positions.length
            )
        })
    })
})
