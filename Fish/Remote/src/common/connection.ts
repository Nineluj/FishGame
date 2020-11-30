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
            this.tcpConnection.setTimeout(PLAYER_CALL_TIMEOUT_MS)
            this.tcpConnection.write(json)
            this.tcpConnection.on("timeout", () => {
                reject()
            })
            this.tcpConnection.on("data", (body) => {
                this.jsonParser.on("data", (parsedBody: any) => {
                    resolve(parsedBody)
                })
                this.jsonParser.write(body)
            })
        })
    }

    close(): void {
        this.tcpConnection.destroy()
    }
}

export { Connection }
