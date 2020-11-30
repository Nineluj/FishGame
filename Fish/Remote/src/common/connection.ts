import net from "net"
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
        this.jsonParser = new Parser()
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
                this.jsonParser.onValue = function (val: any) {
                    if (this.stack.length == 0) {
                        resolve(val)
                    }
                }
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
        this.jsonParser = new Parser()

        this.jsonParser.onValue = function (val: any) {
            if (this.stack.length == 0) {
                const response = fn(val)
                this.sendResponse(response)
            }
        }

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
