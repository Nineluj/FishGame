import { expect } from "chai"
import { createRootGameNode } from "./tree"
import { createGameState } from "../gameState/gameState"
import { getPlayingState } from "../testHelpers"
import { GamePhaseError } from "../errors/gamePhaseError"
import { createPlayer } from "../testHelpers/testHelpers"

describe("Game Tree", () => {
    describe("#creation", () => {
        it("cannot be created with a game that has not started yet", () => {
            expect(() => {
                createRootGameNode(
                    createGameState([
                        createPlayer(15, "red", "foo"),
                        createPlayer(20, "black", "bar"),
                        createPlayer(25, "brown", "baz"),
                    ])
                )
            }).to.throw(
                GamePhaseError,
                "Cannot construct a game node for a game that hasn't begun or has already ended"
            )
        })
        it("cannot be created with a game that has already ended", () => {
            expect(true).to.equal(false)
        })
        it("can be created for a game that is in the playing phase", () => {
            const gameNode = createRootGameNode(getPlayingState())

            // console.log(gameNode)
        })
    })

    describe("#actions", () => {
        it("throws an error when invoking completeAction() with an invalid Action/GameNode combo", () => {
            expect(true).to.equal(false)
        })
        it("returns the correct gamenode when completeAction() is invoked with a valid Action/GameNode combo", () => {
            expect(true).to.equal(false)
        })
        it("correctly applies a lambda action to all directly reachable GameStates when applyToAllFutureStates() is invoked", () => {
            expect(true).to.equal(false)
        })
    })
})
