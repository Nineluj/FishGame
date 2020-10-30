import {
    convertToBoardLocation,
    convertToOutputLocation,
    makeBoardFromTestInput,
    toOutputBoard,
} from "./boardAdapter"
import { expect } from "chai"
import { isDeepStrictEqual } from "util"
import { Board } from "src/models/board"

describe("Board Adapter", () => {
    describe("#convertToBoardLocation", () => {
        it("(0,0) => (0,0)", () => {
            expect(
                isDeepStrictEqual(convertToBoardLocation(0, 0), { x: 0, y: 0 })
            ).to.be.true
        })
        it("(1,1) => (3,0)", () => {
            expect(
                isDeepStrictEqual(convertToBoardLocation(1, 1), { x: 3, y: 0 })
            ).to.be.true
        })
        it("(2,2) => (4,1)", () => {
            expect(
                isDeepStrictEqual(convertToBoardLocation(2, 2), { x: 4, y: 1 })
            ).to.be.true
        })
        it("(2,0) => (0,1)", () => {
            expect(
                isDeepStrictEqual(convertToBoardLocation(2, 0), { x: 0, y: 1 })
            ).to.be.true
        })
    })

    describe("#convertToOutputLocation", () => {
        it("(0,0) => (0,0)", () => {
            expect(convertToOutputLocation(0, 0)).to.have.length(2)
            expect(convertToOutputLocation(0, 0)[0]).to.equal(0)
            expect(convertToOutputLocation(0, 0)[1]).to.equal(0)
        })
        it("(3,0) => (1,1)", () => {
            expect(convertToOutputLocation(3, 0)).to.have.length(2)
            expect(convertToOutputLocation(3, 0)[0]).to.equal(1)
            expect(convertToOutputLocation(3, 0)[1]).to.equal(1)
        })
        it("(4,1) => (2,2)", () => {
            expect(convertToOutputLocation(4, 1)).to.have.length(2)
            expect(convertToOutputLocation(4, 1)[0]).to.equal(2)
            expect(convertToOutputLocation(4, 1)[1]).to.equal(2)
        })
        it("(0,1) => (2,0)", () => {
            expect(convertToOutputLocation(0, 1)).to.have.length(2)
            expect(convertToOutputLocation(0, 1)[0]).to.equal(2)
            expect(convertToOutputLocation(0, 1)[1]).to.equal(0)
        })
    })

    describe("#makeBoardFromTestInput", () => {
        it("Makes a correct board", () => {
            const inputBoard = [
                [1, 1, 1, 0],
                [1, 0, 0, 0],
                [1, 1, 1, 1],
            ]
            const occupiedPositions = [
                { x: 0, y: 0 },
                { x: 2, y: 1 },
            ]

            const expected = [
                [
                    { fish: 1, occupied: true },
                    { fish: 1, occupied: false },
                ],
                [{ fish: 1, occupied: false }],
                [
                    { fish: 1, occupied: false },
                    { fish: 1, occupied: true },
                ],
                ["hole"],
                [
                    { fish: 1, occupied: false },
                    { fish: 1, occupied: false },
                ],
                ["hole"],
                ["hole", { fish: 1, occupied: false }],
                ["hole"],
            ]

            const board = makeBoardFromTestInput(inputBoard, occupiedPositions)

            expect(isDeepStrictEqual(board, expected)).to.be.true
        })
    })

    describe("#toOutputBoard", () => {
        it("Makes a correct output board", () => {
            const board: Board = [
                [
                    { fish: 1, occupied: true },
                    { fish: 1, occupied: false },
                ],
                [{ fish: 1, occupied: false }],
                [
                    { fish: 1, occupied: false },
                    { fish: 1, occupied: true },
                ],
                ["hole"],
                [
                    { fish: 1, occupied: false },
                    { fish: 1, occupied: false },
                ],
                ["hole"],
                ["hole", { fish: 1, occupied: false }],
                ["hole"],
            ]

            const expected = [
                [1, 1, 1, 0],
                [1, 0, 0, 0],
                [1, 1, 1, 1],
            ]

            const output = toOutputBoard(board)

            expect(isDeepStrictEqual(output, expected)).to.be.true
        })

        it("Pads rows evenly", () => {
            const board: Board = [
                [
                    { fish: 1, occupied: true },
                    { fish: 1, occupied: false },
                ],
                [{ fish: 1, occupied: false }],
                [
                    { fish: 1, occupied: false },
                    { fish: 1, occupied: true },
                ],
                ["hole"],
                [
                    { fish: 1, occupied: false },
                    { fish: 1, occupied: false },
                ],
                ["hole"],
                ["hole", { fish: 1, occupied: false }],
            ]

            const expected = [
                [1, 1, 1, 0],
                [1, 0, 0, 0],
                [1, 1, 1, 1],
            ]

            const output = toOutputBoard(board)

            expect(isDeepStrictEqual(output, expected)).to.be.true
        })
    })
})
