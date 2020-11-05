import { expect } from "chai"
import { changePenguinPosition, Player } from "./player"
import { isDeepStrictEqual } from "util"

describe("Player", () => {
    const player1: Player = {
        id: "foo",
        penguinColor: "black",
        penguins: [
            { x: 0, y: 2 },
            { x: 1, y: 1 },
        ],
        score: 0,
    }
    const noPenguinPlayer2: Player = {
        id: "bar",
        penguinColor: "brown",
        penguins: [],
        score: 0,
    }

    it("can change the position of a penguin", () => {
        const newPenguins = changePenguinPosition(
            player1,
            { x: 0, y: 2 },
            { x: 3, y: 3 }
        ).penguins

        expect(newPenguins.some((pos) => pos.x == 3 && pos.y == 3)).to.be.true
    })

    it("won't change the position of a penguin when there isn't one at the origin", () => {
        const newPenguins = changePenguinPosition(
            player1,
            { x: 2, y: 2 },
            { x: 1, y: 2 }
        ).penguins

        expect(newPenguins.some((pos) => pos.x == 3 && pos.y == 3)).to.be.false
    })

    it("won't change the position of a penguin the player has no penguins", () => {
        const newPenguins = changePenguinPosition(
            noPenguinPlayer2,
            { x: 0, y: 0 },
            { x: 1, y: 2 }
        ).penguins

        expect(newPenguins.some((pos) => pos.x == 1 && pos.y == 2)).to.be.false
    })
})
