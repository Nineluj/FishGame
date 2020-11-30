import net from "net"
import { parseJsonFromStreamAsync } from "../../../Common/src/harness/parseJson"
const Parser = require("jsonparse")

const PLAYER_CALL_TIMEOUT_MS = 1000

/**
 * ...
 */
class Connection {
    private tcpConnection: net.Socket
    private jsonParser: any

    constructor(tcpConnection: net.Socket) {
        this.tcpConnection = tcpConnection
    }

    /**
     *
     * @param method
     */
    async send(method: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            const json = JSON.stringify(method)

            this.tcpConnection.on("timeout", () => {
                reject()
            })
            this.tcpConnection.on("data", (body) => {
                this.jsonParser.on("data", (parsedBody: any) => {
                    resolve(parsedBody)
                })
                this.jsonParser.write(body)
            })

            this.tcpConnection.write(json)
            this.tcpConnection.setTimeout(PLAYER_CALL_TIMEOUT_MS)
        })
    }

    sendNoResponse(data: any) {
        const json = JSON.stringify(data)
        this.tcpConnection.write(json)
    }

    close(): void {
        this.tcpConnection.destroy()
    }
}

/**
 * ...
 */
class CallbackConnection {
    private tcpConnection: net.Socket
    private jsonParser: any

    constructor(tcpConnection: net.Socket, fn: (a: any) => any) {
        this.tcpConnection = tcpConnection

        this.jsonParser.on("data", (parsedBody: any) => {
            const response = fn(parsedBody)
            this.sendResponse(response)
        })

        this.tcpConnection.on("data", (body) => {
            this.jsonParser.write(body)
        })
    }

    sendResponse(data: any) {
        const json = JSON.stringify(data)
        this.tcpConnection.write(json)
    }

    close(): void {
        this.tcpConnection.destroy()
    }
}

export { Connection, CallbackConnection }
