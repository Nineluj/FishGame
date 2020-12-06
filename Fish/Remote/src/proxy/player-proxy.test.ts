import { PlayerProxy } from "./player-proxy"

import { Connection } from "../common/connection"
import * as Net from "net"
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const expect = chai.expect
chai.use(chaiAsPromised)
import { setupMitm, stopMitm } from "../common/connection.test"
import { PenguinColor } from "../../../Common/src/models/player"
import {
    getPlacementState,
    getPlayingState,
} from "../../../Common/src/models/testHelpers"

const dummyAddress = "DEADBEEF.com"
export const createMockSocket = (): Net.Socket => {
    return Net.connect(dummyAddress)
}

class MockConnection extends Connection {
    private responses: Array<any> = []
    public log: Array<any> = []

    constructor(responseData: Array<any>) {
        super(createMockSocket())
        this.responses = responseData
        this.log = []
    }

    async send(method: Array<any>): Promise<any> {
        this.log.push(method)
        return this.responses.pop()
    }

    close() {
        this.log.push("CLOSE")
        super.close()
    }
}

describe("Player Proxy", () => {
    before(() => setupMitm(0))
    after(stopMitm)

    describe("#constructor", () => {
        it("Can be created with a connection", () => {
            const conn = new MockConnection([])
            const pp = new PlayerProxy(conn)
        })
    })

    describe("#notifyTournamentIsStarting", () => {
        it("Sends the data through the connection", () => {
            const conn = new MockConnection(["void"])
            const pp = new PlayerProxy(conn)
            pp.notifyTournamentIsStarting()
            expect(conn.log[0]).to.deep.equal(["start", [true]])
        })

        it("Throws an error when the return is non-void", () => {
            const conn = new MockConnection(["bleh"])
            const pp = new PlayerProxy(conn)
            expect(() => pp.notifyTournamentIsStarting()).to.throw
        })
    })

    describe("#notifyPlayAs", () => {
        it("Sends the data through the connection", () => {
            const conn = new MockConnection(["void"])
            const pp = new PlayerProxy(conn)
            pp.notifyPlayAs("brown")
            expect(conn.log[0]).to.deep.equal(["playing-as", ["brown"]])
        })

        it("Throws an error when the return is non-void", () => {
            const conn = new MockConnection(["bleh"])
            const pp = new PlayerProxy(conn)
            expect(() => pp.notifyPlayAs("red")).to.throw
        })
    })

    describe("#notifyPlayWith", () => {
        it("Sends the data through the connection", () => {
            const conn = new MockConnection(["void"])
            const pp = new PlayerProxy(conn)
            const payload = ["brown", "red"]
            pp.notifyPlayWith(payload as PenguinColor[])
            expect(conn.log[0]).to.deep.equal(["playing-with", [payload]])
        })

        it("Throws an error when the return is non-void", () => {
            const conn = new MockConnection(["bleh"])
            const pp = new PlayerProxy(conn)
            expect(() => pp.notifyPlayWith(["red", "white"])).to.throw
        })
    })

    describe("#notifyBanned", () => {
        it("closes the connection", () => {
            const conn = new MockConnection([])
            const pp = new PlayerProxy(conn)
            pp.notifyBanned("you suck")
            expect(conn.log[0]).to.equal("CLOSE")
        })
    })

    describe("#getNextPlacement", () => {
        it("Sends the data through the connection", () => {
            const conn = new MockConnection([[1, 3]])
            const pp = new PlayerProxy(conn)
            pp.getNextPlacement(getPlacementState())

            expect(conn.log[0][0]).to.equal("setup")
        })

        it("Converts the returned data to a valid action", async () => {
            const conn = new MockConnection([[1, 3]])
            const pp = new PlayerProxy(conn)
            const place = await pp.getNextPlacement(getPlacementState())
            expect(place.actionType).to.equal("place")
            expect(place.data).to.deep.equal({
                playerId: "p1",
                dst: { x: 7, y: 0 },
            })
        })

        it("Throws an error when the return is not a position", () => {
            const conn = new MockConnection(["void"])
            const pp = new PlayerProxy(conn)
            expect(pp.getNextPlacement(getPlacementState())).to.be.rejected
        })
    })

    describe("#getNextMove", () => {
        it("Sends the data through the connection", () => {
            const conn = new MockConnection([
                [
                    [1, 3],
                    [5, 8],
                ],
            ])
            const pp = new PlayerProxy(conn)
            pp.getNextMove(getPlayingState())

            expect(conn.log[0][0]).to.equal("take-turn")
        })

        it("Converts the returned data to a valid action when it is not false", async () => {
            const conn = new MockConnection([
                [
                    [1, 3],
                    [5, 8],
                ],
            ])
            const pp = new PlayerProxy(conn)
            const move = await pp.getNextMove(getPlayingState())
            expect(move.actionType).to.equal("move")
            expect(move.data).to.deep.equal({
                playerId: "p1",
                dst: {
                    x: 17,
                    y: 2,
                },
                origin: {
                    x: 7,
                    y: 0,
                },
            })
        })

        it("Converts the returned data to a valid action when it is false", async () => {
            const conn = new MockConnection([false])
            const pp = new PlayerProxy(conn)
            const move = await pp.getNextMove(getPlayingState())
            expect(move.actionType).to.equal("skip")
            expect(move.data).to.deep.equal({
                playerId: "p1",
            })
        })

        it("Throws an error when the return is not a move", () => {
            const conn = new MockConnection(["void"])
            const pp = new PlayerProxy(conn)
            expect(pp.getNextMove(getPlayingState())).to.be.rejected
        })
    })

    describe("#notifyTournamentOver", () => {
        it("Sends the victory message through the connection", () => {
            const conn = new MockConnection(["void"])
            const pp = new PlayerProxy(conn)
            pp.notifyTournamentOver(true)
            expect(conn.log[0]).to.deep.equal(["end", [true]])
        })

        it("Sends the loss message through the connection", () => {
            const conn = new MockConnection(["void"])
            const pp = new PlayerProxy(conn)
            pp.notifyTournamentOver(false)
            expect(conn.log[0]).to.deep.equal(["end", [false]])
        })

        it("Throws an error when the return is non-void", () => {
            const conn = new MockConnection(["bleh"])
            const pp = new PlayerProxy(conn)
            expect(() => pp.notifyTournamentOver(true)).to.throw
        })
    })
})
