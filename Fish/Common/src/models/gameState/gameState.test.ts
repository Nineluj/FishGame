import { expect } from "chai"
import { Player, putPenguin, sortPlayersByAgeAsc } from "@models/player"
import { isDeepStrictEqual } from "util"
import { createGameState } from "./gameState"
import { IllegalArgumentError } from "@models/errors/illegalArgumentError"

describe("GameState creation", () => {
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

    it("cannot be created with empty players array", () => {
        expect(() => createGameState([])).to.throw(
            IllegalArgumentError,
            "Expecting 2-4 players"
        )
    })

    it("cannot be created with too small players array", () => {
        expect(() => createGameState([player1])).to.throw(
            IllegalArgumentError,
            "Expecting 2-4 players"
        )
    })

    it("cannot be created with too large players array", () => {
        expect(() =>
            createGameState([player1, player2, player3, player4, player3])
        ).to.throw(IllegalArgumentError, "Expecting 2-4 players")
    })

    it("can be created with a valid correctly sized array of players", () => {
        const actual = createGameState([player1, player2, player3])

        expect(actual.turn).to.equal(0)
        expect(actual.phase).to.equal("penguinPlacement")
        expect(actual.players.length).to.equal(3)
        expect(actual.players[0].id).to.equal("bar")
    })
})

describe("GameState penguin placement", () => {})

describe("GameState playing", () => {
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

    it("can move a penguin", () => {
        const state = createGameState([player1, player2, player3])
    })

    it("can't move a penguin for a player out of turn", () => {})
})
