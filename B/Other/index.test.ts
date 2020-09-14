import { expect } from "chai"
import { xyes, Writer } from "./index"

const xyesAsync = async (args: Array<string>, writer: Writer) : Promise<void> => {
    xyes(args, writer)
    return Promise.resolve()
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

    // it("the output grows over time when not passed limit", () => {
    //     setTimeout(() => {
    //         xyes([], testWriter)
    //     }, 100)
    //     let shortRunOutput = [...state]
    //     resetState()
    //
    //     setTimeout(() => {
    //         xyes([], testWriter)
    //     }, 500)
    //     let longRunOutput = [...state]
    //
    //     expect(shortRunOutput).to.have.lengthOf.at.least(longRunOutput.length)
    // })
})

