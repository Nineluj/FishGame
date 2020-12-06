import { PlayerProxy } from "./player-proxy"

import Mitm from "mitm"
import { Connection } from "../common/connection"
import * as Net from "net"

const dummyAddress = "DEADBEEF.com"
export const createMockSocket = (): Net.Socket => {
    return Net.connect(dummyAddress)
}

describe("Player Proxy", () => {
    let mitm = Mitm()

    beforeEach(() => {
        mitm = Mitm()
        mitm.on("connection", (socket) => socket.write("Sweet"))
    })

    afterEach(() => {
        mitm.disable()
    })

    describe("#constructor", () => {
        it("Can be created with a socket", () => {
            const sock = createMockSocket()
            const conn = new Connection(sock)
            const pp = new PlayerProxy(conn)
        })
    })

    // describe("")
})
