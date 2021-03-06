import { expect } from "chai"
import { xyes, Writer } from "./index"

describe("xyes", () => {
    let state: Array<string> = []

    let testWriter: Writer = {
        write: arg0 => {
            state.push(arg0)
        }
    }

    const resetState = () => {
        state = []
    }

    beforeEach(() => {
        resetState()
    })

    it("prints hello world 20 times when passed only limit", () => {
        xyes(["-limit"], testWriter)
        expect(state).to.have.lengthOf(20)

        state.forEach(value => {
            expect(value).equal("hello world")
        })
    })

    it("prints concatenation of given words 20 times when passed limit and words", () => {
        const customArgs = ["matthias", "will", "wreck", "our", "code"]
        const shouldBePrinting = "matthias will wreck our code"
        xyes(["-limit", ...customArgs], testWriter)
        expect(state).to.have.lengthOf(20)

        state.forEach(value => {
            expect(value).equal(shouldBePrinting)
        })
    })

    const specialWords = ["null", "undefined", ""]
    specialWords.forEach(str => {
        it(`prints ${str} 20 times when passed limit and ${str}`, () => {
            xyes(["-limit", str], testWriter)
            expect(state).to.have.lengthOf(20)

            state.forEach(value => {
                expect(value).equal(str)
            })
        })
    })
})

