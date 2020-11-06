import { expect } from "chai"
import { Player } from "./player"
import { Referee } from "../../../Admin/src/referee/referee"
import {
    players,
    getPlayingState,
} from "../../../Common/src/models/testHelpers/testHelpers"
import { Action } from "../../../Common/src/models/action"

class RefereeStub extends Referee {
    numberOfTimesMakeActionCalled = 0

    constructor() {
        super([players[0], players[1]])
        this.numberOfTimesMakeActionCalled = 0
    }

    makeAction(action: Action): void {
        this.numberOfTimesMakeActionCalled++
    }
}

describe("Player", () => {
    describe("#notifyBanned", () => {
        it("writes to its output when it gets banned", () => {
            let data = { written: "" }
            const customWriter = {
                write(s: string): void {
                    data.written = s
                },
            }

            const p = new Player(new RefereeStub(), customWriter)
            p.notifyBanned("you cheated!")
            expect(data.written).to.include("you cheated")
        })
    })

    describe("#updateState", () => {
        it("never calles makeAction when it isn't its turn to play", () => {
            const stubRef = new RefereeStub()
            const p = new Player(new RefereeStub())

            p.updateState(getPlayingState(), false)
            expect(stubRef.numberOfTimesMakeActionCalled).to.equal(0)
        })

        it("calls makeAction when it is its turn to play", () => {
            const stubRef = new RefereeStub()
            const p = new Player(stubRef)

            p.updateState(getPlayingState(), true)
            expect(stubRef.numberOfTimesMakeActionCalled).to.equal(1)
        })
    })
})
