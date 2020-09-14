import { expect } from "chai"
import { xyes, Writer } from "./index"

const xyesTimeBoxed = (timeout: number, args: Array<string>, writer: Writer) : Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(reject, timeout)
        xyes(args, writer)
        resolve()
    })
}

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

    it("prints given string 20 times when passed only limit", () => {
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

    it("the output grows over time when not passed limit", () => {
        // xyesTimeBoxed(100, [], testWriter)
        // let shortRunOutput = [...state]
        // resetState()
        //
        // xyesTimeBoxed(500, [], testWriter)
        // let longRunOutput = [...state]
        //
        // expect(shortRunOutput).to.have.lengthOf.at.least(longRunOutput.length)
    })
})

