import { expect } from "chai"
import { AIPlayer, DEFAULT_MOVES_AHEAD } from "./player"
import {
    getPlacementState,
    getPlayingState,
} from "../../../Common/src/models/testHelpers"
import { actionsEqual } from "../../../Common/src/models/action/action"
import {
    getPenguinMaxMinMoveStrategy,
    getPenguinPlacementStrategy,
    getSkipTurnStrategy,
} from "../strategy/strategy"

describe("Player", () => {
    describe("#notifyBanned", () => {
        it("writes to its output when it gets banned", () => {
            let data = { written: "" }
            const customWriter = {
                write(s: string): void {
                    data.written = s
                },
            }

            const p = new AIPlayer(customWriter)
            p.notifyBanned("you cheated!")
            expect(data.written).to.include("you cheated")
        })
    })

    describe("#updateState", () => {
        it("returns consist actions with the strategy in the playing phase", () => {
            const p = new AIPlayer()
            const playingState = getPlayingState()
            expect(
                actionsEqual(
                    p.getNextAction(playingState),
                    getPenguinMaxMinMoveStrategy(
                        DEFAULT_MOVES_AHEAD,
                        getSkipTurnStrategy()
                    ).getNextAction(playingState)
                )
            )
        })
        it("returns consist actions with the strategy in the movement phase", () => {
            const p = new AIPlayer()
            const placement = getPlacementState()
            expect(
                actionsEqual(
                    p.getNextAction(placement),
                    getPenguinPlacementStrategy(
                        getSkipTurnStrategy()
                    ).getNextAction(placement)
                )
            )
        })
    })
})
