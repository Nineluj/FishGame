import { expect } from "chai"
import { AIPlayer } from "./player"
import { Referee } from "../../../Admin/src/referee/referee"
import {
    players,
    getPlayingState,
} from "../../../Common/src/models/testHelpers/testHelpers"
import { Action } from "../../../Common/src/models/action"

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

    describe("#updateState", () => {})
})
