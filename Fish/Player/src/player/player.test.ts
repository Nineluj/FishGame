import { expect } from "chai"
import { AIPlayer, DEFAULT_MOVES_AHEAD } from "./player"
import { Referee } from "../../../Admin/src/referee/referee"
import {
    players,
    getPlayingState,
    getPlacementState,
} from "../../../Common/src/models/testHelpers/testHelpers"
import { Action } from "../../../Common/src/models/action"
import { actionsEqual } from "../../../Common/src/models/action/action"
import {
    getPenguinMaxMinMoveStrategy,
    getPenguinPlacementStrategy,
    getSkipTurnStrategy,
} from "src/strategy/strategy"
import { skipTurn } from "../../../Common/src/models/gameState/gameState"

// class RefereeStub extends Referee {
//     numberOfTimesMakeActionCalled = 0

//     constructor() {
//         super([players[0], players[1]])
//         this.numberOfTimesMakeActionCalled = 0
//     }

//     makeAction(action: Action): void {
//         this.numberOfTimesMakeActionCalled++
//     }
// }

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
