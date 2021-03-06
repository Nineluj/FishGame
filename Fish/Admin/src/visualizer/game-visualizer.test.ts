import { expect } from "chai"
import { GameVisualizer } from "./game-visualizer"
import { createGameState } from "../../../Common/src/models/gameState/gameState"
import { players } from "../../../Common/src/models/testHelpers/testHelpers"
import { isDeepStrictEqual } from "util"

describe("Game Visualizer", () => {
    describe("#update", () => {
        it("changes the public state when it receives a game state update", () => {
            const gv = new GameVisualizer(async (gs) => {})
            const oldState = gv.state
            gv.update(createGameState(players))
            expect(isDeepStrictEqual(oldState, gv.state)).to.be.false
        })
    })

    describe("#notifyOver", () => {
        it("changes the public game result when it receives a game over", () => {
            const gv = new GameVisualizer(async (gs) => {})
            const oldRes = gv.result
            gv.notifyOver({
                failures: ["red", "brown", "black"],
                losers: [],
                winners: ["white"],
            })
            expect(isDeepStrictEqual(oldRes, gv.result)).to.be.false
        })
    })
})
