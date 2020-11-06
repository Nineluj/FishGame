import { expect } from "chai"
import { IllegalArgumentError } from "../../../Common/src/models/errors/illegalArgumentError"
import { players } from "../../../Common/src/models/testHelpers/testHelpers"
import { Referee } from "./referee"

describe("Referee", () => {
    describe("#constructor", () => {
        it("handles proper argument gracefully", () => {
            expect(() => {
                new Referee(players)
            }).not.to.throw()
        })

        it("throws an error when given too many or few players", () => {
            expect(() => {
                new Referee([])
            }).to.throw(IllegalArgumentError)

            expect(() => {
                new Referee([
                    players[0],
                    players[0],
                    players[0],
                    players[1],
                    players[2],
                ])
            })
        })
    })
})
