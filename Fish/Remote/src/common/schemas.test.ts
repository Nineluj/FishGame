import { verify } from "./types"
import { expect } from "chai"
import { messageSchema, startMessageSchema } from "./schemas"

describe("Schemas", () => {
    describe("#verify", () => {
        it("returns true when given the general message schema", () => {
            const msg = ["start", [true]]
            expect(verify(msg, messageSchema)).to.be.true
        })

        it("returns true when given the more specific schema", () => {
            const msg = ["start", [true]]
            expect(verify(msg, startMessageSchema)).to.be.true
        })

        it("returns false when the given message doesn't match schema", () => {
            const msg = ["commence", [true, false, "cow"]]
            expect(verify(msg, messageSchema)).to.be.true
            expect(verify(msg, startMessageSchema)).to.be.false
        })
    })
})
