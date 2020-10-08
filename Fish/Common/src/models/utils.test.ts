import { expect } from "chai"
import { getTileDataByColumn, TileData } from "@/renderer/board/utils"

describe("board utility functions", () => {
    const fakeData: Array<TileData> = [
        { x: 0, y: 0, tile: "hole" },
        { x: 1, y: 0, tile: { fish: 4 } },
        { x: 0, y: 2, tile: { fish: 1 } },
        { x: 0, y: 1, tile: "hole" },
    ]

    it("creates right number of columns", () => {
        expect(getTileDataByColumn(fakeData)).to.have.length(2)
    })

    it("creates the columns in sorted order", () => {
        const result = getTileDataByColumn(fakeData)

        expect(result[0].x).is.equal(0)
        expect(result[1].x).is.equal(1)
    })

    it("creates columns with sorted data", () => {
        const result = getTileDataByColumn(fakeData)

        expect(result[0].tiles[0]).is.equal(fakeData[0])
        expect(result[0].tiles[1]).is.equal(fakeData[3])
        expect(result[0].tiles[2]).is.equal(fakeData[2])
    })
})
