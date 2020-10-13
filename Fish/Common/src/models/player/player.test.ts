import { expect } from "chai"
import { Player, sortPlayersByAgeAsc } from "./player"
import { isDeepStrictEqual } from "util"

describe("Player", () => {
    it("can sort players by ascending age", () => {
        const player1: Player = {
            age: 20,
            id: "foo",
            penguinColor: "black",
            penguins: [],
            score: 0,
        }
        const player2: Player = {
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
        const players: Array<Player> = [player1, player2, player3, player4]

        const expected = [player2, player4, player1, player3]
        expect(isDeepStrictEqual(sortPlayersByAgeAsc(players), expected)).to.be
            .true
    })
})
