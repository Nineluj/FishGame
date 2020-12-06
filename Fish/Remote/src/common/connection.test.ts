import {
    CallbackConnection,
    Connection,
    PLAYER_CALL_TIMEOUT_MS,
} from "./connection"
import { createMockSocket } from "../proxy/player-proxy.test"
import Mitm from "mitm"
import { expect } from "chai"
import { Client } from "../proxy/client-proxy"
import { TestPlayer } from "../proxy/client-proxy.test"

let mitm = Mitm()

export const setupMitm = (delay: number, onClose?: () => void) => {
    mitm = Mitm()
    mitm.on("connection", (socket) => {
        socket.on("data", (data) => {
            setTimeout(() => {
                socket.write(JSON.stringify(["return", ["hello back!"]]))
            }, delay)
        })
        socket.on("close", () => {
            if (onClose) {
                onClose()
            }
        })
    })
}

export const delay = (t: number, v?: any): Promise<any> =>
    new Promise(function (resolve) {
        setTimeout(resolve.bind(null, v), t)
    })

const setupMitmSlow = () => {
    setupMitm(PLAYER_CALL_TIMEOUT_MS * 1.2)
}

const setupMitmFast = () => {
    setupMitm(0)
}

export const stopMitm = () => {
    mitm.disable()
}

describe("Connections", () => {
    afterEach(stopMitm)

    describe("Connection", () => {
        describe("#send", () => {
            it("returns data ", async () => {
                setupMitmFast()

                const conn = new Connection(createMockSocket())
                return conn.send(["Good morning"]).then((response) => {
                    expect(response).to.deep.equal(["return", ["hello back!"]])
                })
            })

            it("throws an error when the response takes too long", async () => {
                setupMitmSlow()

                const conn = new Connection(createMockSocket())
                return conn.send(["Good morning"]).catch((reason) => {
                    expect(reason.toString()).to.include("too long")
                })
            })
        })

        describe("#close", () => {
            it("closes the connection for the other side", () => {
                let closed = false
                setupMitm(0, () => {
                    closed = true
                })

                const conn = new Connection(createMockSocket())
                conn.close()
                setTimeout(() => {
                    expect(closed).to.be.true
                }, 100)
            })
        })
    })

    describe("CallbackConnection", () => {
        let client: CustomClient

        beforeEach(() => {
            client = new CustomClient()
        })

        describe("#main", () => {
            it("uses client.receive to get its response", async () => {
                const payload = ["start", ["some", 3, "args"]]
                mitm = Mitm()
                mitm.on("connection", (socket) => {
                    socket.write(JSON.stringify(payload))
                })

                new CallbackConnection(createMockSocket(), client)
                return delay(300).then(() =>
                    expect(client.log[0]).to.deep.equal(payload)
                )
            })
        })

        describe("#sendResponse", () => {
            it("sends the right data", async () => {
                mitm = Mitm()
                let dataReceived: any[] = []
                mitm.on("connection", (socket) => {
                    socket.on("data", (data) => {
                        dataReceived.push(JSON.parse(data.toString()))
                    })
                })

                const cbc = new CallbackConnection(createMockSocket(), client)
                const payload = ["123", 59]
                cbc.sendResponse(payload)

                return delay(300).then(() =>
                    expect(dataReceived[0]).to.deep.equal(payload)
                )
            })
        })
    })
})

class CustomClient extends Client {
    public log: Array<any>

    constructor() {
        super(new TestPlayer({ write(s: string) {} }))
        this.log = []
    }

    async receive(data: any): Promise<any> {
        this.log.push(data)
        return Promise.resolve(false)
    }
}
