import { expect } from "chai"
import { changePenguinPosition, Player, sortPlayersByAgeAsc } from "./player"
import { isDeepStrictEqual } from "util"

describe("Player", () => {
    const player1: Player = {
        age: 20,
        id: "foo",
        penguinColor: "black",
        penguins: [
            { x: 0, y: 2 },
            { x: 1, y: 1 },
        ],
        score: 0,
    }
    const noPenguinPlayer2: Player = {
        age: 15,
        id: "bar",
        penguinColor: "brown",
        penguins: [],
        score: 0,
    }
    const player3: Player = {
        age: 25,
        id: "baz",
        penguinColor: "red",
        penguins: [],
        score: 0,
    }
    const player4: Player = {
        age: 18,
        id: "lorem ipsum",
        penguinColor: "white",
        penguins: [],
        score: 0,
    }

    it("can sort players by ascending age", () => {
        const players: Array<Player> = [
            player1,
            noPenguinPlayer2,
            player3,
            player4,
        ]

        const expected = [noPenguinPlayer2, player4, player1, player3]
        expect(isDeepStrictEqual(sortPlayersByAgeAsc(players), expected)).to.be
            .true
    })

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
